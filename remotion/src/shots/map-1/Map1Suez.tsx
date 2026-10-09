import React from 'react';
import { AbsoluteFill, Easing, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Captions, EASE_INOUT, prog } from '../../lib/shorts';
import {
  Camera,
  FigureRise,
  GrainRect,
  MapGrainDefs,
  MapLayer,
  RouteArc,
  ShipGlyph,
  VfxStreaks,
  WorldMap,
  createKit,
  lerpCam,
} from '../../lib/mapkit';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG — 16:9 documentary format (make-map)
// =============================================================================
export const compositionConfig = {
  id: 'Map1Suez',
  durationInSeconds: 42,
  fps: 30,
  width: 1920,
  height: 1080,
};

const GOLD = '#f5d76e';
const RED = '#ff5f5f';
const WATER = '#17435f';
const F = (s: number) => Math.round(s * 30);

// =============================================================================
// THE KIT — real geography: world-atlas 50 m countries over d3-geo Mercator.
// Base projection centred near Egypt at a scale where Europe..Asia spans the frame;
// the CAMERA is a transform over this one fixed map (the film = one continuous shot).
// =============================================================================
const KIT = createKit(1920, 1080, [32, 27], 700);

// THE CAMERA ROUTE (script.md's table, verbatim — anchors are handed off, never
// re-invented; every scene starts on the exact frame the previous ended).
const CANAL: Camera = { lon: 32.42, lat: 30.55, z: 34 };
const WIDE: Camera = { lon: 32, lat: 27, z: 1 };
const SHIP: Camera = { lon: 32.57, lat: 30.0, z: 90 };
const KEYS: { t: number; cam: Camera }[] = [
  { t: 0.0, cam: { lon: 32.55, lat: 30.18, z: 33 } }, // HOOK: centred on the wedge…
  { t: 3.4, cam: { lon: 32.52, lat: 30.02, z: 37.5 } }, // …with a slow LINEAR push onto it
  { t: 7.2, cam: WIDE }, // pull out — the reveal of scale
  { t: 12.0, cam: { lon: 36.5, lat: 25.8, z: 1.07 } }, // wide hold: real drift + creep-in
  { t: 15.2, cam: { lon: 32.45, lat: 30.35, z: 26 } }, // approach — she waits at Port Said
  { t: 18.2, cam: { lon: 32.52, lat: 30.08, z: 42 } }, // drift + zoom south with the sail
  { t: 19.2, cam: SHIP }, // quick punch onto the wreck
  { t: 19.6, cam: { lon: 32.42, lat: 30.85, z: 19 } }, // back out over the north anchorage
  { t: 25.2, cam: { lon: 32.42, lat: 29.95, z: 30 } }, // then SCAN DOWN the queue line (linear)
  { t: 26.4, cam: SHIP }, // in for the salvage
  { t: 31.4, cam: SHIP },
  { t: 34.6, cam: WIDE }, // out for the aftermath (as she floats free)
  { t: 39.4, cam: { lon: 33.5, lat: 27, z: 1.05 } }, // reroute hold w/ drift
  { t: 42.0, cam: { lon: 34.5, lat: 26.5, z: 1.08 } },
];
const LINEAR_SEGS = new Set([1, 8]); // (8 = the queue scan, 0-indexed keys) // hook dolly + queue scan: steady motion, no ease plateaus
const camAt = (t: number): Camera => {
  if (t <= KEYS[0].t) return KEYS[0].cam;
  for (let i = 1; i < KEYS.length; i++) {
    if (t <= KEYS[i].t) {
      const p = LINEAR_SEGS.has(i) ? prog(t, KEYS[i - 1].t, KEYS[i].t) : EASE_INOUT(prog(t, KEYS[i - 1].t, KEYS[i].t));
      return lerpCam(KEYS[i - 1].cam, KEYS[i].cam, p);
    }
  }
  return KEYS[KEYS.length - 1].cam;
};

// =============================================================================
// THE GEOGRAPHY — the canal along its real course, the places, the trade arcs.
// =============================================================================
const CANAL_LINE: [number, number][] = [
  [32.30, 31.26], // Port Said (Mediterranean)
  [32.36, 30.65],
  [32.34, 30.35],
  [32.38, 30.22], // Great Bitter Lake
  [32.55, 29.95], // Suez (Red Sea)
];
const GROUND: [number, number] = [32.57, 30.0]; // the grounding site (km 151, southern section)
const SHANGHAI: [number, number] = [121.5, 31.2];
const ROTTERDAM: [number, number] = [4.1, 51.9];
const SINGAPORE: [number, number] = [103.8, 1.3];
const MUMBAI: [number, number] = [72.8, 19.0];

// queue anchorages: north (Mediterranean) + south (Gulf of Suez / Red Sea)
const QUEUE_N: [number, number] = [32.2, 31.55];
const QUEUE_S: [number, number] = [32.65, 29.3];

const SHIP_LEN = 8; // map px — drawn oversized for legibility (script.md's scale note)
const rand = (n: number) => {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

// the Ever Given's journey, continuous over the whole film (one shot, no jumps):
//   [0, 4.5]    WEDGED at the grounding site — the hook shows the aftermath (frame-0 rule)
//   [4.5, 7.2]  un-sails back north to Port Said under the pull-out (the story resets
//               while the camera leaves)
//   [7.2, 16.2] waiting at the Port Said anchorage
//   [16.2, 18.3] sails south, gust, WEDGES
//   [18.3, 30.9] aground
//   [30.9, 32.4] floats free, eases off to the Great Bitter Lake
const shipState = (t: number): { lon: number; lat: number; heading: number } => {
  const seg = 0.82; // fraction of the canal line to the grounding point
  let u: number; // 0 = Port Said, 1 = grounding site
  let wedge = 0;
  if (t < 4.5) {
    u = 1;
    wedge = 1; // wedged (hook)
  } else if (t < 7.2) {
    u = 1 - EASE_INOUT(prog(t, 4.5, 7.2)); // un-sail under the zoom-out
  } else if (t < 14.0) {
    u = 0; // waiting at Port Said (the approach reveals her)
  } else {
    u = EASE_INOUT(prog(t, 14.0, 16.6)); // sails south through the sandstorm line
    wedge = prog(t, 16.6, 17.5); // wedged on the word "stuck" (~17.7)
  }
  const posAt = (uu: number): [number, number] => {
    const total = CANAL_LINE.length - 1;
    const x = uu * total;
    const i = Math.min(total - 1, Math.floor(x));
    const fr = x - i;
    const a = CANAL_LINE[i];
    const b = CANAL_LINE[i + 1];
    return [a[0] + (b[0] - a[0]) * fr, a[1] + (b[1] - a[1]) * fr];
  };
  let [lon, lat] = posAt(u);
  let heading = 168 - wedge * 43; // swings from SSW to the diagonal wedge (~125)
  if (wedge > 0) {
    lon += wedge * 0.05; // bow pushes into the eastern bank
    lat -= wedge * 0.035;
  }
  const freed = prog(t, 31.8, 33.6);
  if (freed > 0) {
    heading += EASE_INOUT(freed) * 36;
    lon -= EASE_INOUT(freed) * 0.2;
    lat += EASE_INOUT(freed) * 0.12;
  }
  return { lon, lat, heading };
};

const Map1Suez: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const cam = camAt(t);

  // scene opacities (title/kickers/chips live OUTSIDE the tilt — flat, readable)
  const titleOp = Math.min(1, 1 - prog(t, 3.4, 4.2));
  const endTitleOp = prog(t, 39.8, 40.8);
  const egyptDraw = prog(t, 7.2, 9.0); // outline self-draws during setup
  const arcDraw = prog(t, 7.6, 10.2); // trade arcs draw with the narration
  const dotT = prog(t, 8.0, 12.0);
  const gustLife = prog(t, 14.4, 16.2);
  const aground = prog(t, 17.4, 17.7); // the hit, on 'stuck'
  const queueN = Math.floor(prog(t, 17.8, 25.2) * 24);
  const queueS = Math.floor(prog(t, 18.6, 25.2) * 22);
  const counter = Math.round(prog(t, 18.2, 22.1) * 369); // hits 369 ON the word (~22.1)
  const chipOp = prog(t, 4.6, 5.2) * (1 - prog(t, 9.6, 10.2));
  const costOp = prog(t, 23.4, 24.0) * (1 - prog(t, 26.0, 26.6));
  const counterOp = prog(t, 21.0, 21.6) * (1 - prog(t, 25.8, 26.4));
  const dredgerRise = prog(t, 27.4, 29.2) * (1 - prog(t, 31.2, 32.0));
  const tugsIn = prog(t, 27.0, 27.6) * (1 - prog(t, 31.2, 32.0));
  const tide = t > 28.2 && t < 33.0 ? 0.5 + 0.5 * Math.sin((t - 28.2) * 2.4) : 0;
  const capeDraw = prog(t, 35.0, 37.6);
  const capeDots = prog(t, 36.0, 41.0);

  const ship = shipState(t);
  const [gx, gy] = KIT.project(GROUND[0], GROUND[1]);

  // hook frame-0 rule: the wedge + aground mark + title all ON at f0. The mark
  // fades during the un-sail, returns on the hit, clears when she floats free.
  const agroundGlow = Math.max(1 - prog(t, 4.4, 5.4), prog(t, 17.4, 17.7) * (1 - prog(t, 31.8, 32.8)));

  return (
    <AbsoluteFill style={{ background: '#060d16' }}>
      {/* THE TABLETOP TILT — the whole map + its actors live inside this perspective */}
      <div style={{ position: 'absolute', inset: 0, perspective: 2600 }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: 'rotateX(27deg) translateY(6%) scale(1.34)',
            transformOrigin: '50% 42%',
          }}
        >
          <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0 }}>
            <MapGrainDefs />
            <MapLayer kit={KIT} cam={cam}>
              <WorldMap
                kit={KIT}
                cam={cam}
                highlight={{ names: ['Egypt'], draw: egyptDraw, color: GOLD, fill: 0.18 }}
              />
              {/* the canal — its real course, drawn as a water strip */}
              <polyline
                points={CANAL_LINE.map(([lon, lat]) => KIT.project(lon, lat).join(',')).join(' ')}
                fill="none"
                stroke={WATER}
                strokeWidth={2}
                strokeLinecap="round"
              />
              <polyline
                points={CANAL_LINE.map(([lon, lat]) => KIT.project(lon, lat).join(',')).join(' ')}
                fill="none"
                stroke="rgba(120,190,255,0.35)"
                strokeWidth={0.5}
              />
              {/* trade arcs: the artery the story is about (drawn during setup) */}
              <RouteArc kit={KIT} cam={cam} from={SHANGHAI} to={[32.4, 30.6]} draw={arcDraw} color={GOLD} width={2} dots={3} dotT={dotT} />
              <RouteArc kit={KIT} cam={cam} from={[32.4, 30.6]} to={ROTTERDAM} draw={arcDraw} color={GOLD} width={2} dots={2} dotT={dotT * 1.2} />
              <RouteArc kit={KIT} cam={cam} from={SINGAPORE} to={[32.4, 30.6]} draw={Math.max(0, arcDraw - 0.25)} color="#9b7cc4" width={1.4} dots={2} dotT={dotT} />
              <RouteArc kit={KIT} cam={cam} from={MUMBAI} to={[32.4, 30.6]} draw={Math.max(0, arcDraw - 0.35)} color="#9b7cc4" width={1.2} dots={1} dotT={dotT * 0.9} />
              {/* the reroute: the long way around Africa (twist) */}
              <RouteArc kit={KIT} cam={cam} from={[33.0, 28.5]} to={ROTTERDAM} draw={capeDraw} color="#4db8a8" width={2.4} dots={4} dotT={capeDots} dotSize={4} />
              {/* geography labels (carry the story on mute) */}
              <MapLabels kit={KIT} cam={cam} />
              {/* city dots */}
              {[['PORT SAID', 32.30, 31.26], ['SUEZ', 32.55, 29.95]].map(([label, lon, lat]) => (
                <g key={label as string}>
                  <circle cx={KIT.project(lon as number, lat as number)[0]} cy={KIT.project(lon as number, lat as number)[1]} r={1.2 / Math.max(1, cam.z * 0.12)} fill="#fff" opacity={cam.z > 8 ? 0.9 : 0} />
                  <text
                    x={KIT.project(lon as number, lat as number)[0]}
                    y={KIT.project(lon as number, lat as number)[1] - 5 / Math.sqrt(cam.z)}
                    textAnchor="middle"
                    opacity={cam.z > 8 ? 0.8 : 0}
                    style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10 / Math.sqrt(cam.z), letterSpacing: 1, fill: '#fff' }}
                  >
                    {label as string}
                  </text>
                </g>
              ))}
            </MapLayer>

            {/* GRAIN — screen space, on the map only, UNDER the actors */}
            <GrainRect w={1920} h={1080} frame={f} />

            {/* THE ACTORS (above the grain) */}
            <MapLayer kit={KIT} cam={cam}>
              {/* the Ever Given herself */}
              <image
                href={staticFile('projects/map-1-suez/evergiven.png')}
                x={0}
                y={0}
                width={SHIP_LEN}
                height={SHIP_LEN * 0.237}
                transform={`translate(${KIT.project(ship.lon, ship.lat)[0]} ${KIT.project(ship.lon, ship.lat)[1]}) rotate(${ship.heading - 90}) translate(${-SHIP_LEN / 2} ${(-SHIP_LEN * 0.237) / 2})`}
                style={{ filter: 'drop-shadow(0 0 1.2px rgba(0,0,0,0.8))' }}
              />
              {/* the gust — screen-blend wind streaks at the grounding */}
              {gustLife > 0.01 && gustLife < 0.99 && (
                <VfxStreaks kit={KIT} cam={cam} center={GROUND} span={30} life={gustLife} count={20} />
              )}
              {/* the aground mark — a hit leaves a mark (cause -> effect) */}
              {agroundGlow > 0.02 && (
                <g opacity={agroundGlow}>
                  <circle cx={gx} cy={gy} r={2.2 / cam.z} fill={RED} opacity={0.25 + 0.15 * Math.sin(t * 3)} />
                  <circle cx={gx} cy={gy} r={1.1 / cam.z} fill={RED} opacity={0.7} />
                  <circle cx={gx} cy={gy} r={(3 + 1.2 * Math.sin(t * 3)) / cam.z} fill="none" stroke={RED} strokeWidth={0.5 / cam.z} opacity={0.6} />
                </g>
              )}
              {/* the queue: ships pile up at both anchorages, deterministic positions */}
              {Array.from({ length: 24 }, (_, i) =>
                i < queueN ? (
                  <ShipGlyph
                    key={`qn${i}`}
                    kit={KIT}
                    cam={cam}
                    lon={QUEUE_N[0] + (rand(i * 7 + 1) - 0.5) * 0.5 + 0.02 * Math.sin((t * 0.5 + i * 0.7) * (Math.PI * 2) / 9)}
                    lat={QUEUE_N[1] + (rand(i * 13 + 5) - 0.5) * 0.6 + 0.02 * Math.cos((t * 0.4 + i * 0.5) * (Math.PI * 2) / 11)}
                    heading={140 + rand(i * 3) * 80 + 9 * Math.sin((t * 0.6 + i * 1.3) * (Math.PI * 2) / 8)}
                    len={2.4}
                    color="#e8e3d8"
                  />
                ) : null
              )}
              {Array.from({ length: 22 }, (_, i) =>
                i < queueS ? (
                  <ShipGlyph
                    key={`qs${i}`}
                    kit={KIT}
                    cam={cam}
                    lon={QUEUE_S[0] + (rand(i * 11 + 2) - 0.5) * 0.5 + 0.02 * Math.sin((t * 0.45 + i * 0.9) * (Math.PI * 2) / 10)}
                    lat={QUEUE_S[1] + (rand(i * 17 + 9) - 0.5) * 0.7 + 0.02 * Math.cos((t * 0.55 + i * 0.3) * (Math.PI * 2) / 12)}
                    heading={120 + rand(i * 5) * 90 + 9 * Math.sin((t * 0.5 + i * 1.1) * (Math.PI * 2) / 9)}
                    len={2.4}
                    color="#e8e3d8"
                  />
                ) : null
              )}
              {/* the salvage: dredger FIGURE-RISES out of the bank; tugs nose in; tide wash */}
              <FigureRise kit={KIT} cam={cam} lon={32.62} lat={29.98} circle={prog(t, 27.4, 27.7)} rise={dredgerRise} color={GOLD} size={3.2}>
                <path d="M 2.2 0 L 0.8 -0.8 L -2 -0.8 L -2 0.8 L 0.8 0.8 Z" fill="#e8c559" stroke="rgba(13,28,46,0.8)" strokeWidth={0.2} />
                <rect x={0.6} y={-0.5} width={1.2} height={1} fill="rgba(13,28,46,0.5)" />
              </FigureRise>
              {tugsIn > 0.02 && (
                <g opacity={tugsIn}>
                  <ShipGlyph kit={KIT} cam={cam} lon={ship.lon + 0.045} lat={ship.lat + 0.02} heading={ship.heading + 90} len={2.2} color="#4db8a8" />
                  <ShipGlyph kit={KIT} cam={cam} lon={ship.lon - 0.02} lat={ship.lat - 0.035} heading={ship.heading - 60} len={2.2} color="#4db8a8" />
                </g>
              )}
              {tide > 0.01 && (
                <polyline
                  points={CANAL_LINE.map(([lon, lat]) => KIT.project(lon, lat).join(',')).join(' ')}
                  fill="none"
                  stroke="#bfe3ff"
                  strokeWidth={2.6}
                  opacity={0.25 * tide}
                  strokeLinecap="round"
                  style={{ mixBlendMode: 'screen' }}
                />
              )}
            </MapLayer>
          </svg>
        </div>
      </div>

      {/* vignette over everything (screen space) */}
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse 130% 100% at 50% 45%, transparent 55%, rgba(3,7,13,0.7) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* FLAT UI — title, chips, kickers, captions (never tilted, never grained) */}
      <div style={{ position: 'absolute', top: 70, left: 90, opacity: titleOp }}>
        <div
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 700,
            fontSize: 84,
            lineHeight: 1.02,
            letterSpacing: 1,
            textTransform: 'uppercase',
            color: '#fff',
            textShadow: '0 4px 30px rgba(0,0,0,0.6)',
          }}
        >
          ONE SHIP
          <br />
          <span style={{ color: GOLD }}>vs THE WORLD</span>
        </div>
        <div
          style={{
            marginTop: 14,
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 26,
            letterSpacing: 4,
            color: 'rgba(255,255,255,0.75)',
          }}
        >
          SUEZ CANAL · MARCH 2021
        </div>
      </div>

      <div style={{ position: 'absolute', top: 84, right: 90, textAlign: 'right', opacity: chipOp }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 20, letterSpacing: 4, color: GOLD }}>THE CANAL</div>
        <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 40, color: '#fff' }}>193 km · between two continents</div>
      </div>

      <div style={{ position: 'absolute', top: 84, right: 90, textAlign: 'right', opacity: counterOp }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 20, letterSpacing: 4, color: GOLD }}>SHIPS WAITING</div>
        <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 56, color: '#fff' }}>{counter}</div>
      </div>

      <div style={{ position: 'absolute', top: 200, right: 90, textAlign: 'right', opacity: costOp }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 20, letterSpacing: 4, color: RED }}>HELD UP EVERY DAY</div>
        <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 52, color: '#fff' }}>$9.6 BILLION</div>
      </div>

      <div style={{ position: 'absolute', bottom: 150, left: 90, opacity: endTitleOp }}>
        <div
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 700,
            fontSize: 62,
            letterSpacing: 2,
            textTransform: 'uppercase',
            color: '#fff',
            textShadow: '0 4px 30px rgba(0,0,0,0.6)',
          }}
        >
          ONE CANAL · <span style={{ color: GOLD }}>ONE SHIP · SIX DAYS</span>
        </div>
      </div>

      <Captions lines={VO} y={930} size={46} accent={GOLD} plate maxWords={5} />
    </AbsoluteFill>
  );
};

// Geography labels — small-caps, scale-invariant-ish, carry the story on mute.
const MapLabels: React.FC<{ kit: ReturnType<typeof createKit>; cam: Camera }> = ({ kit, cam }) => {
  const labels: [string, number, number, number][] = [
    ['MEDITERRANEAN', 18, 34.5, 1],
    ['RED SEA', 38.5, 20, 1],
    ['AFRICA', 17, 4, 1],
    ['EUROPE', 12, 50, 1],
    ['ASIA', 88, 44, 1],
    ['INDIAN OCEAN', 72, -18, 1],
    ['SUEZ', 29.5, 27.9, 6],
  ];
  return (
    <g>
      {labels.map(([text, lon, lat, minZ]) => (
        <text
          key={text}
          x={kit.project(lon, lat)[0]}
          y={kit.project(lon, lat)[1]}
          textAnchor="middle"
          opacity={cam.z >= minZ ? 0.42 : 0}
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 14 / Math.sqrt(cam.z),
            letterSpacing: 3 / Math.sqrt(cam.z),
            fill: '#cfe0ee',
          }}
        >
          {text}
        </text>
      ))}
    </g>
  );
};

export default Map1Suez;
