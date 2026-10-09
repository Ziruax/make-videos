// lib/mapkit.tsx — the shared map-film kit (make-map skill).
// REAL geography, never hand-drawn: country shapes come from world-atlas
// (Natural Earth, public domain), unpacked with topojson-client and projected
// with d3-geo's geoMercator. The kit provides:
//   createKit()   — one fixed base projection + precomputed per-country SVG path
//                   strings and bounding boxes (projection params are constants, so
//                   this is pure data computed once at module level)
//   <WorldMap>    — ocean + land + optional glowing SELF-DRAWING country outline
//                   + film grain + vignette (grain lives ON THE MAP LAYER ONLY)
//   <MapLayer>    — camera group: translate/scale so the current anchor lat/lon sits
//                   at frame centre; scenes hand off anchors, the camera never jumps
//   <RouteArc>    — a dashed arc that draws itself between two real places, with
//                   optional traffic dots riding it
//   <ShipGlyph>   — generic top-down ship token (queue ships, tugs, dredgers)
//   <FigureRise>  — the signature move: a circle pops on the map, a glyph rises OUT
//                   of it like a hole in the ground (lower body clipped by the circle)
//   <VfxStreaks>  — screen-blend wind/wash streaks (the gust, screen-space)
// The tabletop tilt is applied by the SHOT (wrap the map svg in a perspective div);
// everything drawn by these components lives in map coordinates and tilts with it.
import React from 'react';
import { Easing } from 'remotion';
import { geoMercator, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import { Topology, GeometryCollection } from 'topojson-specification';
import topo from 'world-atlas/countries-50m.json';

// Multi-resolution base layers (Natural Earth). Detail level must MATCH the zoom:
// 110m for whole-world shots, 50m for continent/regional, 10m for country/strait
// close-ups. Blobby coastlines at tight zoom is the #1 amateur map-video tell.
// Each resolution is parsed lazily, ONCE, and cached; scenes PIN their detail
// level (switch only at scene boundaries, never mid-move, so coastlines never pop
// during a camera leg).
import topo110 from 'world-atlas/countries-110m.json';
import topo10 from 'world-atlas/countries-10m.json';

// =============================================================================
// THE KIT — projection + precomputed paths
// =============================================================================
export type MapKit = {
  w: number;
  h: number;
  res: MapRes;
  project: (lon: number, lat: number) => [number, number];
  countries: { name: string; d: string; box: [number, number, number, number] }[];
};

/** Detail levels: '110m' whole-world · '50m' continent/regional · '10m' country/
 *  strait close-ups. Pin per scene; switch only at scene boundaries. */
export type MapRes = '110m' | '50m' | '10m';

// resolution cache: parse each TopoJSON once per process, keyed by res
const RES_TOPO: Record<MapRes, unknown> = {
  '110m': topo110,
  '50m': topo,
  '10m': topo10,
};
const kitCache = new Map<string, MapKit>();

export const createKit = (
  w: number,
  h: number,
  center: [number, number],
  baseScale: number,
  res: MapRes = '50m',
): MapKit => {
  const cacheKey = `${w}x${h}|${center[0]},${center[1]}|${baseScale}|${res}`;
  const cached = kitCache.get(cacheKey);
  if (cached) return cached;
  const projection = geoMercator().center(center).scale(baseScale).translate([w / 2, h / 2]);
  const path = geoPath(projection);
  const topoJson = RES_TOPO[res] as unknown as Topology;
  const world = feature(topoJson, topoJson.objects.countries as GeometryCollection) as unknown as {
    features: { properties: { name: string }; geometry: { coordinates: unknown } }[];
  };
  const countries = world.features.map((f) => {
    const d = path(f as never) ?? '';
    let box: [number, number, number, number] = [Infinity, Infinity, -Infinity, -Infinity];
    // project the geometry's coordinates to get a cheap AABB for culling
    const walk = (coords: unknown) => {
      if (!Array.isArray(coords)) return;
      if (typeof coords[0] === 'number') {
        const p = projection([coords[0] as number, coords[1] as number]);
        if (p) {
          box = [Math.min(box[0], p[0]), Math.min(box[1], p[1]), Math.max(box[2], p[0]), Math.max(box[3], p[1])];
        }
        return;
      }
      (coords as unknown[]).forEach(walk);
    };
    walk(f.geometry.coordinates);
    return { name: f.properties.name, d, box };
  });
  const kit: MapKit = {
    w,
    h,
    res,
    project: (lon, lat) => (projection([lon, lat]) as [number, number]) ?? [0, 0],
    countries,
  };
  kitCache.set(cacheKey, kit);
  return kit;
};

// =============================================================================
// CAMERA — anchors + eased interpolation. Anchor lat/lon lands at frame centre.
// =============================================================================
export type Camera = { lon: number; lat: number; z: number };
export const lerpCam = (a: Camera, b: Camera, t: number): Camera => ({
  lon: a.lon + (b.lon - a.lon) * t,
  lat: a.lat + (b.lat - a.lat) * t,
  z: a.z + (b.z - a.z) * t,
});

// =============================================================================
// THE MAP — ocean, land, self-drawing highlight. (Grain is NOT here: the shot
// mounts a screen-space GrainRect between the map layer and the actor layer, so
// grain sits ON the map but NEVER over the foreground actors.)
// =============================================================================
export const WorldMap: React.FC<{
  kit: MapKit;
  land?: string;
  ocean?: string;
  highlight?: { names: string[]; draw: number; color?: string; fill?: number };
  /** border hierarchy: focus countries 2-3px screen, rest 0.5-1px (cartographic rank) */
  focus?: string[];
  focusColor?: string;
  cam: Camera;
}> = ({ kit, land = '#c9ccd4', ocean = '#0d1c2e', highlight, focus, focusColor = '#0d1c2e', cam }) => {
  // cull countries outside the visible rect (critical at z>30)
  const visW = kit.w / cam.z;
  const visH = kit.h / cam.z;
  const cx = kit.w / 2;
  const cy = kit.h / 2;
  const vx0 = cx - visW / 2 - 40;
  const vy0 = cy - visH / 2 - 40;
  const vx1 = cx + visW / 2 + 40;
  const vy1 = cy + visH / 2 + 40;
  const hiSet = new Set(highlight?.names ?? []);
  const focusSet = new Set(focus ?? []);
  return (
    <g>
      <rect x={-kit.w} y={-kit.h} width={kit.w * 3} height={kit.h * 3} fill={ocean} />
      {kit.countries.map((c) => {
        const [x0, y0, x1, y1] = c.box;
        if (x1 < vx0 || x0 > vx1 || y1 < vy0 || y0 > vy1) return null;
        const hi = hiSet.has(c.name);
        const focused = focusSet.has(c.name);
        return (
          <g key={c.name}>
            <path d={c.d} fill={hi ? highlight?.fill ? mix(land, highlight.color ?? '#f5d76e', highlight.fill) : land : land} stroke="rgba(13,28,46,0.55)" strokeWidth={(focused ? 2.4 : focused === undefined && focus ? 1.0 : 0.6) / cam.z} />
            {focused && (
              <path d={c.d} fill="none" stroke={focusColor} strokeWidth={1.2 / cam.z} opacity={0.85} />
            )}
            {hi && highlight && (
              <path
                d={c.d}
                fill="none"
                stroke={highlight.color ?? '#f5d76e'}
                strokeWidth={3.5 / cam.z}
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - highlight.draw}
                strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 ${6 / cam.z}px ${highlight.color ?? '#f5d76e'})` }}
              />
            )}
          </g>
        );
      })}
    </g>
  );
};

const hex = (s: string): [number, number, number] => [
  parseInt(s.slice(1, 3), 16),
  parseInt(s.slice(3, 5), 16),
  parseInt(s.slice(5, 7), 16),
];
const mix = (a: string, b: string, t: number) => {
  const A = hex(a);
  const B = hex(b);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`;
};

// =============================================================================
// MAP LAYER — applies the camera so children place themselves at projected coords
// =============================================================================
export const MapLayer: React.FC<{ kit: MapKit; cam: Camera; children: React.ReactNode }> = ({ kit, cam, children }) => {
  const [px, py] = kit.project(cam.lon, cam.lat);
  return (
    <g transform={`translate(${kit.w / 2} ${kit.h / 2}) scale(${cam.z}) translate(${-px} ${-py})`}>{children}</g>
  );
};

// =============================================================================
// ROUTE ARC — dashed arc between two REAL places, draws itself; optional dots
// riding it at a seeded spread. Curvature bulges perpendicular to the chord.
// =============================================================================
export const RouteArc: React.FC<{
  kit: MapKit;
  from: [number, number]; // [lon, lat]
  to: [number, number];
  draw: number; // 0..1
  color?: string;
  width?: number;
  cam: Camera;
  dots?: number; // how many traffic dots ride the arc
  dotT?: number; // 0..1 where the dot pack head is
  dotSize?: number;
}> = ({ kit, from, to, draw, color = '#f5d76e', width = 2, cam, dots = 0, dotT = 1, dotSize = 3.2 }) => {
  const [x0, y0] = kit.project(from[0], from[1]);
  const [x1, y1] = kit.project(to[0], to[1]);
  const mx = (x0 + x1) / 2;
  const my = (y0 + y1) / 2;
  const nx = -(y1 - y0);
  const ny = x1 - x0;
  const len = Math.hypot(nx, ny) || 1;
  const bulge = 0.22 * len;
  const cxb = mx + (nx / len) * bulge;
  const cyb = my + (ny / len) * bulge;
  const d = `M ${x0} ${y0} Q ${cxb} ${cyb} ${x1} ${y1}`;
  const dotEls: React.ReactNode[] = [];
  for (let i = 0; i < dots; i++) {
    const t = Math.max(0, Math.min(1, dotT - i * 0.07));
    if (t <= 0) continue;
    const u = 1 - t;
    const dx = u * u * x0 + 2 * u * t * cxb + t * t * x1;
    const dy = u * u * y0 + 2 * u * t * cyb + t * t * y1;
    dotEls.push(
      <circle key={i} cx={dx} cy={dy} r={dotSize / cam.z} fill={color} opacity={0.9} />
    );
  }
  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={width / cam.z}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - draw}
        opacity={0.85}
      />
      <path d={d} fill="none" stroke={color} strokeWidth={width / cam.z} opacity={0.16} />
      {dotEls}
    </g>
  );
};

// =============================================================================
// SHIP GLYPH — generic top-down token (queue ships, tugs, dredgers).
// length is in MAP px (constant in map space; scale-invariant on screen via 1/z).
// =============================================================================
export const ShipGlyph: React.FC<{
  kit: MapKit;
  cam: Camera;
  lon: number;
  lat: number;
  heading: number; // degrees, 0 = north, clockwise
  len?: number; // map px
  color?: string;
  label?: string;
}> = ({ kit, cam, lon, lat, heading, len = 6, color = '#e8e3d8', label }) => {
  const [x, y] = kit.project(lon, lat);
  void cam;
  const wpx = len; // MAP px — the glyph lives ON the map and scales with the camera
  const hpx = wpx * 0.28;
  return (
    <g transform={`translate(${x} ${y}) rotate(${heading})`}>
      <path
        d={`M ${wpx / 2} 0 L ${wpx * 0.18} ${-hpx / 2} L ${-wpx / 2} ${-hpx / 2} L ${-wpx / 2} ${hpx / 2} L ${wpx * 0.18} ${hpx / 2} Z`}
        fill={color}
        stroke="rgba(13,28,46,0.7)"
        strokeWidth={0.12}
      />
      <rect x={-wpx * 0.18} y={-hpx * 0.36} width={wpx * 0.16} height={hpx * 0.72} fill="rgba(13,28,46,0.45)" rx={hpx * 0.1} />
      {label && (
        <text
          x={0}
          y={-wpx * 0.9}
          textAnchor="middle"
          transform={`rotate(${-heading})`}
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 1.1,
            fill: '#fff',
            letterSpacing: 0.05,
          }}
        >
          {label}
        </text>
      )}
    </g>
  );
};

// =============================================================================
// FIGURE RISE — the signature move: a colored circle pops on the map, the glyph
// rises OUT of it (lower body clipped by the circle), easing into place.
// =============================================================================
export const FigureRise: React.FC<{
  kit: MapKit;
  cam: Camera;
  lon: number;
  lat: number;
  circle: number; // 0..1 pop of the hole
  rise: number; // 0..1 rise of the glyph
  color?: string;
  size?: number; // circle diameter, map px
  children: React.ReactNode; // the glyph, drawn pointing up, centered
}> = ({ kit, cam, lon, lat, circle, rise, color = '#f5d76e', size = 7, children }) => {
  const [x, y] = kit.project(lon, lat);
  void cam;
  const r = size / 2; // MAP px — the hole is ON the map and scales with the camera
  const up = (1 - rise) * r * 2.6;
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="rgba(13,28,46,0.35)" stroke={color} strokeWidth={0.15} opacity={circle} />
      <clipPath id={`hole-${lon}-${lat}`}>
        <circle cx={x} cy={y - r * 0.1} r={r * 0.96} />
      </clipPath>
      <g clipPath={`url(#hole-${lon}-${lat})`} opacity={rise * 1.5 > 1 ? 1 : rise * 1.5}>
        <g transform={`translate(${x} ${y + up})`}>{children}</g>
      </g>
    </g>
  );
};

// =============================================================================
// VFX STREAKS — screen-blend wind/wash (the gust). Deterministic seeded streaks
// sweeping across a region over `life` 0..1.
// =============================================================================
export const VfxStreaks: React.FC<{
  kit: MapKit;
  cam: Camera;
  center: [number, number];
  span: number; // map px across
  life: number; // 0..1 (1 = fully passed)
  count?: number;
  color?: string;
  seed?: number;
}> = ({ kit, cam, center, span, life, count = 14, color = '#dfe8f2', seed = 3 }) => {
  const [cx, cy] = kit.project(center[0], center[1]);
  const els: React.ReactNode[] = [];
  for (let i = 0; i < count; i++) {
    const r = rand(seed * 131 + i * 17);
    const ang = 40 + r * 14; // gust direction-ish
    const off = (r - 0.5) * span;
    const start = (life * 1.9 - r * 0.7) % 1.6;
    if (start < 0 || start > 1) continue;
    const dist = start * span * 1.6;
    const x = cx + Math.cos((ang * Math.PI) / 180) * dist;
    const y = cy + Math.sin((ang * Math.PI) / 180) * dist * 0.4 + off * 0.4;
    const len = (34 + r * 52) / cam.z;
    els.push(
      <path
        key={i}
        d={`M ${x} ${y} l ${len} ${len * 0.22}`}
        stroke={color}
        strokeWidth={(2.6 + r * 1.8) / cam.z}
        strokeLinecap="round"
        opacity={0.85 * (1 - start) * (0.4 + 0.6 * Math.sin(start * Math.PI))}
      />
    );
  }
  return <g style={{ mixBlendMode: 'screen' }}>{els}</g>;
};

const rand = (n: number) => {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

// grain filter defs — mount once inside the map svg; GrainRect is SCREEN-SPACE and
// sits BETWEEN the map layer and the actor layer (grain on the map, never on actors).
export const MapGrainDefs: React.FC = () => (
  <defs>
    <filter id="mapgrain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.8 0.8" numOctaves="2" seed="11" result="noise" />
      <feColorMatrix
        type="matrix"
        values="0 0 0 0 0.9  0 0 0 0 0.9  0 0 0 0 0.92  0 0 0 0.14 0"
      />
    </filter>
  </defs>
);

export const GrainRect: React.FC<{ w: number; h: number; frame: number }> = ({ w, h, frame }) => (
  <rect
    x={0}
    y={0}
    width={w}
    height={h}
    fill="url(#mapgrain)"
    opacity={0.5}
    transform={`translate(0 ${((frame / 4) % 9) - 4})`}
    style={{ mixBlendMode: 'overlay' }}
  />
);

// =============================================================================
// CAMERA GRAMMAR (v2) — legs, log-zoom, flyTo arcs, slow arrival.
// Rules encoded (from map-camera research):
//   - zoom interpolates in LOG space (zoom steps are multiplicative, a linear
//     z feels like an "invisible wall" mid-move)
//   - default easing is Smooth (in-out); LINEAR only under montage/VO
//   - slowArrival (long stretched deceleration, "aircraft on approach") is
//     RESERVED for the final leg — or nothing lands
//   - one zoom change per leg; a big jump between distant anchors is a FLY-TO:
//     zoom OUT so both endpoints stay visible, arc across, descend in
//   - camera speed ≤ ~1.5 screenfulls/s for tracked action (skill enforces)
// =============================================================================
export type CamEase = 'smooth' | 'slowArrival' | 'linear';
const EASES: Record<CamEase, (t: number) => number> = {
  smooth: Easing.bezier(0.65, 0, 0.35, 1),
  slowArrival: Easing.bezier(0.05, 0.7, 0.1, 1),
  linear: (t) => t,
};

export type CamLeg = { from: Camera; to: Camera; dur: number; ease?: CamEase };

/** zoom in log space so multiplicative zoom steps feel even */
export const zLerp = (a: number, b: number, t: number) => a * Math.pow(b / a, t);

/** camera at frame f along a leg track (frames are LOCAL to the track). */
export const camAt = (legs: CamLeg[], f: number): Camera => {
  let t0 = 0;
  for (const leg of legs) {
    if (f < t0 + leg.dur) {
      const u = EASES[leg.ease ?? 'smooth'](Math.max(0, (f - t0) / leg.dur));
      return {
        lon: leg.from.lon + (leg.to.lon - leg.from.lon) * u,
        lat: leg.from.lat + (leg.to.lat - leg.from.lat) * u,
        z: zLerp(leg.from.z, leg.to.z, u),
      };
    }
    t0 += leg.dur;
  }
  const last = legs[legs.length - 1];
  return last ? last.to : { lon: 0, lat: 0, z: 1 };
};

/** total track duration (frames) */
export const camDur = (legs: CamLeg[]) => legs.reduce((a, l) => a + l.dur, 0);

/** FLY-TO: a guided zoom between distant anchors (MapLibre flyTo, curve ≈ 1.4):
 *  zoom out until both endpoints are on screen, arc across, descend to target
 *  with the slow-arrival ease. Returns leg frames; feed to camAt. */
export const flyToLegs = (from: Camera, to: Camera, dur: number, minZ = 1): CamLeg[] => {
  // both visible => the angular distance fits in ~1 screen at zBoth
  const dLon = Math.abs(to.lon - from.lon);
  const dLat = Math.abs(to.lat - from.lat);
  const spanDeg = Math.max(dLon, dLat * 1.35, 6);
  const zBoth = Math.max(minZ, Math.min(from.z, to.z, 30 / spanDeg));
  const outZ = Math.min(from.z, zBoth);
  const thirds = Math.max(4, Math.round(dur / 3));
  return [
    { from, to: { lon: from.lon, lat: from.lat, z: outZ }, dur: thirds, ease: 'smooth' },
    {
      from: { lon: from.lon, lat: from.lat, z: outZ },
      to: { lon: to.lon, lat: to.lat, z: zBoth },
      dur: thirds,
      ease: 'smooth',
    },
    {
      from: { lon: to.lon, lat: to.lat, z: zBoth },
      to,
      dur: dur - 2 * thirds,
      ease: 'slowArrival',
    },
  ];
};

// =============================================================================
// ZOOM-BAND LABEL SYSTEM — labels arrive when the CAMERA crosses their zoom
// band (not on a timer), rank-sized, deterministic placement, screen-constant.
// Placement priority (cartographic convention): above-right → below-right →
// above-left → below-left, greedy collision-avoided against already-placed.
// Once shown, a label never jumps; sizes differ ≥ 2pt across ranks; country
// names letterspaced uppercase, cities regular; nothing under 26px @1080.
// =============================================================================
export type MapLabel = {
  name: string;
  lon: number;
  lat: number;
  rank: 0 | 1 | 2; // 0 country · 1 major city/feature · 2 detail
  minZ: number; // band floor: appears when cam.z ≥ minZ
  maxZ?: number; // band ceiling: hides above (street level can drop countries)
  align?: 'aboveRight' | 'belowRight' | 'aboveLeft' | 'belowLeft';
};

const LABEL_STYLE: Record<0 | 1 | 2, { size: number; weight: number; spacing: number; caps: boolean; op: number }> = {
  0: { size: 34, weight: 600, spacing: 3.2, caps: true, op: 0.9 },
  1: { size: 28, weight: 500, spacing: 0.6, caps: false, op: 0.85 },
  2: { size: 26, weight: 400, spacing: 0.3, caps: false, op: 0.75 },
};

/** <MapLabels> renders in a SCREEN-SPACE svg layer (counter-projected: constant
 *  size at any zoom). Place it AFTER the map+grain layers, BEFORE actors. */
export const MapLabels: React.FC<{
  kit: MapKit;
  cam: Camera;
  labels: MapLabel[];
  color?: string;
  halo?: string;
}> = ({ kit, cam, labels, color = '#eef2f7', halo = 'rgba(8,16,28,0.85)' }) => {
  const [px, py] = kit.project(cam.lon, cam.lat);
  // map point -> screen px (counter the camera transform)
  const toScreen = (lon: number, lat: number): [number, number] => {
    const [x, y] = kit.project(lon, lat);
    return [kit.w / 2 + (x - px) * cam.z, kit.h / 2 + (y - py) * cam.z];
  };
  // deterministic arrival state per label: track band crossing frame-free by
  // comparing cam.z to the band — we render whichever are in band; the 8-frame
  // slide-in uses each label's own key on a seen-set keyed by band entry ORDER,
  // approximated by ordering: labels whose band floor is far below cam.z (well
  // established) render settled; those near their floor render arriving.
  const placed: [number, number, number, number][] = [];
  const els: React.ReactNode[] = [];
  const sorted = [...labels].sort((a, b) => a.rank - b.rank || a.minZ - b.minZ);
  for (const L of sorted) {
    const inBand = cam.z >= L.minZ && (L.maxZ === undefined || cam.z <= L.maxZ);
    if (!inBand) continue;
    const [sx, sy] = toScreen(L.lon, L.lat);
    const st = LABEL_STYLE[L.rank];
    const text = st.caps ? L.name.toUpperCase() : L.name;
    // width estimate ~0.62em per char
    const w = text.length * st.size * 0.62 + st.spacing * text.length;
    const h = st.size * 1.15;
    const off = st.size * 0.55;
    const cands: [number, number, number, number, number, number][] = [
      [sx + off, sy - h * 0.75, sx + off + w, sy + h * 0.25, sx + off, sy - h * 0.28], // above-right
      [sx + off, sy + h * 0.15, sx + off + w, sy + h * 1.15, sx + off, sy + h * 0.62], // below-right
      [sx - off - w, sy - h * 0.75, sx - off, sy + h * 0.25, sx - off, sy - h * 0.28], // above-left
      [sx - off - w, sy + h * 0.15, sx - off, sy + h * 1.15, sx - off, sy + h * 0.62], // below-left
    ];
    const order = L.align ? cands.findIndex((_, i) => i === ['aboveRight', 'belowRight', 'aboveLeft', 'belowLeft'].indexOf(L.align as string)) : 0;
    let chosen = cands[Math.max(0, order)];
    for (const c of cands) {
      const hit = placed.some((p) => !(c[2] < p[0] || c[0] > p[2] || c[3] < p[1] || c[1] > p[3]));
      if (!hit) {
        chosen = c;
        break;
      }
    }
    placed.push([chosen[0], chosen[1], chosen[2], chosen[3]]);
    // settle amount: labels well inside their band (cam.z ≥ 1.25×minZ) are settled;
    // near the floor they slide in 8 frames (arrival approximation, deterministic
    // in cam.z — the same camera state always renders the same label state)
    const near = Math.max(0, Math.min(1, (cam.z - L.minZ) / (L.minZ * 0.25)));
    const dy = (1 - near) * 14;
    const op = st.op * near;
    if (op <= 0.02) continue;
    // cull off-screen
    if (chosen[2] < -50 || chosen[0] > kit.w + 50 || chosen[3] < -50 || chosen[1] > kit.h + 50) continue;
    els.push(
      <g key={`${L.name}-${L.rank}`} opacity={op} transform={`translate(0 ${dy})`}>
        <text
          x={chosen[4]}
          y={chosen[5]}
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: st.size,
            fontWeight: st.weight,
            letterSpacing: st.spacing,
            fill: color,
            stroke: halo,
            strokeWidth: 5,
            paintOrder: 'stroke',
          }}
        >
          {text}
        </text>
      </g>,
    );
  }
  return <g>{els}</g>;
};

// =============================================================================
// ANNOTATION GRAMMAR — the MapStory taxonomy: area / line / point highlights,
// path-followers, region changes WITH onset transients, measurement devices.
// =============================================================================

/** RegionGrow: a territory change (empire/front/blockade zone). Fill ramps in
 *  fast (6f), border self-draws, and a ONE-TIME onset flash transient fires at
 *  u crossing ~0.1 — viewers miss changes < 10-15% of visible area unless a
 *  transient flags them (perceptual research). Sequence multiple regions with
 *  staggered `at` for time-lapses; EVERY region change needs its transient. */
export const RegionGrow: React.FC<{
  kit: MapKit;
  cam: Camera;
  country: string; // kit country name
  u: number; // 0..1 appearance progress
  color?: string;
  fill?: number; // 0..1 fill strength
  at: number; // frame the region starts (for the transient timing)
  frame: number;
}> = ({ kit, cam, country, u, color = '#f5d76e', fill = 0.4, at, frame }) => {
  const c = kit.countries.find((x) => x.name === country);
  if (!c || u <= 0) return null;
  const fillU = Math.min(1, u / 0.25); // fill lands fast
  // onset transient: bright pulse in the 10 frames after arrival
  const since = frame - (at + 4);
  const flash = since >= 0 && since < 10 ? Math.sin((since / 10) * Math.PI) : 0;
  return (
    <g>
      <path d={c.d} fill={color} opacity={fill * fillU} />
      <path
        d={c.d}
        fill="none"
        stroke={color}
        strokeWidth={(3 + 3 * flash) / cam.z}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - u}
        strokeLinecap="round"
        style={flash > 0 ? { filter: `drop-shadow(0 0 ${(10 * flash) / cam.z}px ${color})` } : undefined}
      />
    </g>
  );
};

/** LeaderLabel: off-map callout with a leader line to a point (for dense
 *  regions where an in-place label would collide). Elbow: 45° then horizontal. */
export const LeaderLabel: React.FC<{
  kit: MapKit;
  cam: Camera;
  lon: number;
  lat: number;
  text: string;
  side?: 1 | -1; // 1 = elbow to the right
  color?: string;
  size?: number;
  y?: number; // screen-space y for the label end (default: auto)
  draw?: number; // 0..1 leader draw-in
  opacity?: number;
}> = ({ kit, cam, lon, lat, text, side = 1, color = '#eef2f7', size = 30, y, draw = 1, opacity = 1 }) => {
  const [px, py] = kit.project(cam.lon, cam.lat);
  const [x, y0] = kit.project(lon, lat);
  const sx = kit.w / 2 + (x - px) * cam.z;
  const sy = kit.h / 2 + (y0 - py) * cam.z;
  const lift = 90;
  const ey = y ?? Math.max(120, Math.min(kit.h - 120, sy - lift));
  const ex = sx + side * (Math.abs(ey - sy) * 0.7 + 40);
  const diag = `M ${sx} ${sy} L ${sx + side * 30} ${ey + (sy - ey) * 0.28} L ${ex} ${ey}`;
  const el = 6 + Math.round(draw * 10);
  return (
    <g opacity={opacity}>
      <path d={diag} fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
      <circle cx={sx} cy={sy} r={5} fill={color} />
      <text
        x={side === 1 ? ex + 10 : ex - 10}
        y={ey + el * 0.35}
        textAnchor={side === 1 ? 'start' : 'end'}
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: size,
          fontWeight: 500,
          fill: color,
          letterSpacing: 0.8,
          opacity: draw,
          stroke: 'rgba(8,16,28,0.85)',
          strokeWidth: 5,
          paintOrder: 'stroke',
        }}
      >
        {text}
      </text>
    </g>
  );
};

/** DistRing: measurement rings around a focal point (the scale-making device —
 *  "how far is far"). draw 0..1; label on the topmost drawn ring. */
export const DistRing: React.FC<{
  kit: MapKit;
  cam: Camera;
  lon: number;
  lat: number;
  radiusMapPx: number;
  label: string;
  draw: number;
  color?: string;
}> = ({ kit, cam, lon, lat, radiusMapPx, label, draw, color = '#9cc4d6' }) => {
  const [x, y] = kit.project(lon, lat);
  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r={radiusMapPx}
        fill="none"
        stroke={color}
        strokeWidth={2 / cam.z}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - draw}
        opacity={0.9}
      />
      {draw > 0.95 && (
        <text
          x={x}
          y={y - radiusMapPx - 10 / cam.z}
          textAnchor="middle"
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 24 / cam.z,
            fill: color,
            letterSpacing: 1.4,
          }}
        >
          {label}
        </text>
      )}
    </g>
  );
};

// =============================================================================
// SWARM — grouped movers. Viewers track only 3-4 independent movers; a fleet is
// ONE group with members at seeded offsets sharing one label/identity.
// =============================================================================
export const Swarm: React.FC<{
  count: number;
  spread: number; // map px scatter around the anchor
  seed?: number;
  member: React.FC<{ x: number; y: number; i: number }>; // draws ONE member at map coords
}> = ({ count, spread, seed = 5, member: Member }) => {
  const els: React.ReactNode[] = [];
  for (let i = 0; i < count; i++) {
    const rx = rand(seed * 131 + i * 17) - 0.5;
    const ry = rand(seed * 57 + i * 29) - 0.5;
    els.push(<Member key={i} x={rx * spread * 2} y={ry * spread * 2} i={i} />);
  }
  return <g>{els}</g>;
};

// =============================================================================
// FURNITURE — date stamp, legend box, timeline scrubber (time-series films).
// These three are DOM overlays (NOT svg): mount them in the shot's top-level
// AbsoluteFill, BESIDE the map svg — never inside it. Constant screen size.
// =============================================================================
export const DateStamp: React.FC<{
  date: string;
  changedAt: number; // frame this date became current (pops on change)
  frame: number;
  x?: number;
  y?: number;
  color?: string;
}> = ({ date, changedAt, frame, x = 70, y = 1840, color = '#eef2f7' }) => {
  const since = frame - changedAt;
  const pop = since >= 0 && since < 8 ? 1 + Math.sin((since / 8) * Math.PI) * 0.18 : 1;
  const op = Math.min(1, Math.max(0, since / 4));
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y - 40,
        transform: `scale(${pop})`,
        opacity: op,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 34,
        fontWeight: 700,
        letterSpacing: 2.5,
        color,
        textShadow: '0 2px 8px rgba(8,16,28,0.9)',
        transformOrigin: 'left center',
      }}
    >
      {date}
    </div>
  );
};

export type LegendEntry = { color: string; label: string };

/** LegendBox: the EmperorTigerstar convention — a persistent legend makes
 *  territory/fill semantics legible film-wide. Top-right, arrives at f8, stays. */
export const LegendBox: React.FC<{
  entries: LegendEntry[];
  frame: number;
  x?: number;
  y?: number;
}> = ({ entries, frame, x, y }) => {
  const op = Math.min(1, Math.max(0, (frame - 8) / 6));
  if (op <= 0) return null;
  const boxW = 60 + Math.max(...entries.map((e) => e.label.length)) * 15;
  const boxH = 34 + entries.length * 40;
  const bx = x ?? 1080 - boxW - 50;
  const by = y ?? 240;
  return (
    <div style={{ position: 'absolute', left: bx, top: by, opacity: op }}>
      <div
        style={{
          background: 'rgba(10,18,30,0.72)',
          border: '1px solid rgba(238,242,247,0.25)',
          borderRadius: 10,
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {entries.map((e) => (
          <div key={e.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 26, height: 14, borderRadius: 3, background: e.color }} />
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 24, color: '#eef2f7', letterSpacing: 0.8 }}>{e.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

/** TimelineBar: bottom scrubber for multi-period films — progress fill, a tick
 *  per period, period labels. The audience's clock for territory time-lapses. */
export const TimelineBar: React.FC<{
  periods: { label: string; at: number }[]; // at = frame the period starts
  frame: number;
  totalFrames: number;
  color?: string;
}> = ({ periods, frame, totalFrames, color = '#f5d76e' }) => {
  const u = Math.min(1, Math.max(0, frame / totalFrames));
  const active = periods.reduce((a, p, i) => (frame >= p.at ? i : a), 0);
  return (
    <div style={{ position: 'absolute', left: 90, right: 90, top: 1760 }}>
      <div style={{ height: 6, background: 'rgba(238,242,247,0.18)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${u * 100}%`, background: color, borderRadius: 3 }} />
      </div>
      <div style={{ position: 'relative', height: 44, marginTop: 8 }}>
        {periods.map((p, i) => (
          <div
            key={p.label}
            style={{
              position: 'absolute',
              left: `${(p.at / totalFrames) * 100}%`,
              transform: 'translateX(0)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 4,
            }}
          >
            <div style={{ width: 2, height: 10, background: i <= active ? color : 'rgba(238,242,247,0.35)' }} />
            <div
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 22,
                letterSpacing: 1,
                color: i <= active ? '#eef2f7' : 'rgba(238,242,247,0.45)',
                fontWeight: i === active ? 700 : 400,
              }}
            >
              {p.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
