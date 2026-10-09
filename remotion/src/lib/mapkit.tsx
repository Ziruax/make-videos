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
import { geoMercator, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import { Topology, GeometryCollection } from 'topojson-specification';
import topo from 'world-atlas/countries-50m.json';

// =============================================================================
// THE KIT — projection + precomputed paths
// =============================================================================
export type MapKit = {
  w: number;
  h: number;
  project: (lon: number, lat: number) => [number, number];
  countries: { name: string; d: string; box: [number, number, number, number] }[];
};

export const createKit = (w: number, h: number, center: [number, number], baseScale: number): MapKit => {
  const projection = geoMercator().center(center).scale(baseScale).translate([w / 2, h / 2]);
  const path = geoPath(projection);
  const topoJson = topo as unknown as Topology;
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
  return { w, h, project: (lon, lat) => (projection([lon, lat]) as [number, number]) ?? [0, 0], countries };
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
  cam: Camera;
}> = ({ kit, land = '#c9ccd4', ocean = '#0d1c2e', highlight, cam }) => {
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
  return (
    <g>
      <rect x={-kit.w} y={-kit.h} width={kit.w * 3} height={kit.h * 3} fill={ocean} />
      {kit.countries.map((c) => {
        const [x0, y0, x1, y1] = c.box;
        if (x1 < vx0 || x0 > vx1 || y1 < vy0 || y0 > vy1) return null;
        const hi = hiSet.has(c.name);
        return (
          <g key={c.name}>
            <path d={c.d} fill={hi ? highlight?.fill ? mix(land, highlight.color ?? '#f5d76e', highlight.fill) : land : land} stroke="rgba(13,28,46,0.55)" strokeWidth={0.6 / cam.z} />
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
