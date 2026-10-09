// lib/agents.tsx — the emergence engine: N independent drivers on a ring road,
// integrated with the Optimal Velocity Model (Bando, Hasebe, Nakayama, Shibata
// 1995) — the car-following family Sugiyama's group used to analyse their famous
// 2008 "traffic jams without bottlenecks" experiment (22 cars, 230 m circle,
// "drive at approximately 30 km/h, maintain a safe distance"). This is short-13's
// niche lib (IDEAS #13: "The Traffic Jam With No Cause").
//
// WHY OVM, and not IDM: at the experiment's density the OVM is STABLE at long gaps
// (everyone holds ~30 km/h, like the real drivers did) and UNSTABLE at the short
// gaps behind a brake tap — which is exactly the mechanism the experiment
// demonstrated. An IDM ring at this density just gridlocks; the phenomenon never
// appears. The OVM's `a` sensitivity IS the drivers' finite reaction — no separate
// delay term needed.
//
// The ethos of this channel: never assert a number the code could compute. The
// backward wave speed printed on screen is MEASURED from this simulation by
// measureJam() below — the same sim the composition draws from — so the claim on
// the track can never disagree with the pixels on the screen.
//
// Geometry honesty: the ring is drawn at TRUE SCALE relative to the experiment
// (22 cars, 230 m circumference, ~4.5 m cars). No exaggeration is needed: on a
// ~340 px-radius ring a 4.5 m car is ~40 px — legible at phone scale.
import React from 'react';

// =============================================================================
// THE SIMULATION — pure, deterministic, frame-independent. Same inputs, same jam,
// every render (qa_determinism.sh passes or the video is wrong).
// =============================================================================

export type RingOpts = {
  n?: number; // cars (the experiment: 22)
  length?: number; // ring circumference, metres (the experiment: 230)
  vmax?: number; // optimal (desired) speed, m/s (the experiment asked for ~30 km/h)
  sC?: number; // confidence gap, m: drivers hold vmax until the gap closes past this,
  //             then brake hard — the metastable "30 km/h at 6 m" state of the
  //             experiment, and the instability that turns one tap into a wave
  sigma?: number; // sharpness of the confidence curve, m
  aSens?: number; // driver sensitivity, 1/s (finite reaction, the destabiliser)
  sStop?: number; // gap below which drivers hold still, m (queue bumpers)
  carLen?: number; // car length for gap maths, m
  dt?: number; // integration step, s
  tEnd?: number; // total simulated seconds
  tTap?: number; // when the hero taps the brakes
  tapDecel?: number; // extra deceleration during the tap, m/s^2
  tapDur?: number; // tap duration, s
  jitter?: number; // +- fraction on per-car vmax (driver heterogeneity, seeded)
  seed?: number;
};

export type RingSim = {
  opts: Required<RingOpts>;
  steps: number; // number of stored steps (t = k * dt)
  pos: Float64Array; // [k*n + i] arc position of car i at step k, metres
  vel: Float64Array; // [k*n + i] speed, m/s
  acc: Float64Array; // [k*n + i] acceleration, m/s^2 (negative = braking)
};

// Deterministic PRNG (mulberry32) — driver heterogeneity without render dice.
const rng = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export const simulateRing = (o: RingOpts = {}): RingSim => {
  const opts: Required<RingOpts> = {
    n: 22,
    length: 230,
    vmax: 8.33, // ~30 km/h, as the experiment asked
    sC: 4.2,
    sigma: 0.5,
    aSens: 0.4, // reaction speed: fast enough to hold 30 km/h, slow enough to
    //           overshoot when the gap collapses — that overshoot IS the jam
    sStop: 2.0,
    carLen: 4.5,
    dt: 0.02,
    tEnd: 130,
    tTap: 4.0,
    tapDecel: 2.5,
    tapDur: 0.7,
    jitter: 0.008,
    seed: 13,
    ...o,
  };
  const { n, length, vmax, sC, sigma, aSens, sStop, carLen, dt, tEnd, tTap, tapDecel, tapDur, jitter, seed } = opts;
  const steps = Math.floor(tEnd / dt) + 1;

  // The optimal velocity function: gap -> the speed a driver is comfortable at.
  // Sharp-confidence shape: vmax while the gap is comfortable, falling fast as it
  // closes, zero below sStop (queue bumper). This is the metastable state the real
  // drivers held — 30 km/h at ~6 m gaps — and the source of the instability.
  const V = (s: number) => {
    if (s <= sStop) return 0;
    return (vmax / 2) * (Math.tanh((s - sC) / sigma) + 1);
  };

  const rand = rng(seed);
  const vMaxes = Array.from({ length: n }, () => vmax * (1 + (rand() * 2 - 1) * jitter));

  // Start at the homogeneous solution: equal spacing, everyone at V(spacing) —
  // the experiment's "everyone moving ~30 km/h" initial condition. Tiny spacing
  // noise keeps the pre-tap flow human without seeding the jam early.
  const pos = new Float64Array(steps * n);
  const vel = new Float64Array(steps * n);
  const acc = new Float64Array(steps * n);

  const sBar = length / n - carLen; // equilibrium bumper gap
  const vBar = V(sBar);
  for (let i = 0; i < n; i++) {
    pos[i] = (i / n) * length + (rand() - 0.5) * 0.3;
    vel[i] = Math.min(vBar, vMaxes[i]);
  }

  for (let k = 1; k < steps; k++) {
    const t = (k - 1) * dt;
    for (let i = 0; i < n; i++) {
      // gap to the leader ahead — the ring wraps for ANY car whose leader has
      // crossed the 0/length boundary, not just the last one (the classic ring-bug:
      // a queue parked on the wrap point otherwise reads a -180 m gap and dies).
      let g = pos[(k - 1) * n + ((i + 1) % n)] - pos[(k - 1) * n + i];
      if (g < 0) g += length;
      g -= carLen;
      const v = vel[(k - 1) * n + i];
      const vLead = vel[(k - 1) * n + ((i + 1) % n)];
      const vOpt = Math.min(V(Math.max(0.1, g)), vMaxes[i]);
      let accI = aSens * (vOpt - v);
      // Collision avoidance — the licence the OVM alone doesn't give you: a real
      // driver who reacts late still brakes to the floor before touching bumpers.
      // (Without this, the wave's pile-up phase physically overlaps cars.)
      if (g < 8 && v > vLead) {
        const closing = v - vLead;
        const need = (closing * closing) / (2 * Math.max(0.5, g - sStop));
        accI = Math.min(accI, -Math.min(6, need));
      }
      if (g < sStop + 0.8) accI = Math.min(accI, -6);
      // THE TAP: one driver brakes for under a second. That is the entire cause.
      if (i === 0 && t >= tTap && t < tTap + tapDur) accI -= tapDecel;
      accI = Math.max(-8, Math.min(3, accI)); // physical clamp — no teleporting cars
      acc[(k - 1) * n + i] = accI;
      const vNew = Math.max(0, v + accI * dt);
      let pNew = pos[(k - 1) * n + i] + ((v + vNew) / 2) * dt;
      if (pNew >= length) pNew -= length;
      if (pNew < 0) pNew += length;
      pos[k * n + i] = pNew;
      vel[k * n + i] = vNew;
    }
  }
  // last step's accelerations (for completeness at the tail)
  for (let i = 0; i < n; i++) acc[(steps - 1) * n + i] = acc[(steps - 2) * n + i];

  return { opts, steps, pos, vel, acc };
};

// =============================================================================
// THE MEASUREMENT — the jam wave, located and timed by the same numbers the
// composition will draw. A car is "in the jam" when it is slower than 35% of vmax;
// the jam's angular (arc) centroid is tracked; the wave speed is the slope of the
// centroid's arc position over time (negative = travelling BACKWARD through traffic).
// =============================================================================

export type JamMeasurement = {
  waveSpeedKmh: number; // negative = backward (the point of the video)
  jamFraction: number; // share of cars in the jam, averaged over the measured window
  window: [number, number]; // sim seconds the slope was fit over
  jamArc: (k: number) => number | null; // centroid arc (m) at step k, or null if no jam
  maxJamFraction: number;
};

export const measureJam = (sim: RingSim, tFrom = 20, tTo = 126): JamMeasurement => {
  const { n, length, vmax, dt } = sim.opts;
  const kFrom = Math.floor(tFrom / dt);
  const kTo = Math.min(sim.steps - 1, Math.floor(tTo / dt));
  const slowThresh = 0.35 * vmax;

  const jamArcAt = (k: number): number | null => {
    let sum = 0;
    let count = 0;
    let leadX = 0;
    let leadY = 0;
    let first = true;
    for (let i = 0; i < n; i++) {
      if (sim.vel[k * n + i] < slowThresh) {
        const a = (sim.pos[k * n + i] / length) * Math.PI * 2;
        // circular mean: average on the unit circle so the wrap is honest
        if (first) {
          leadX = Math.cos(a);
          leadY = Math.sin(a);
          first = false;
        } else {
          leadX += Math.cos(a);
          leadY += Math.sin(a);
        }
        sum += sim.vel[k * n + i];
        count++;
      }
    }
    if (count < 4) return null; // no jam worth naming
    void sum;
    const mean = Math.atan2(leadY, leadX) / (Math.PI * 2);
    return ((mean % 1) + 1) % 1 * length;
  };

  // circular-unwrapped slope: the centroid travels backward around the ring; track
  // its position with wrap correction before fitting.
  const pts: { t: number; arc: number; frac: number }[] = [];
  let prev: number | null = null;
  let acc2 = 0;
  let maxFrac = 0;
  for (let k = kFrom; k <= kTo; k += 5) {
    const arc = jamArcAt(k);
    if (arc === null) {
      prev = null;
      continue;
    }
    if (prev !== null) {
      let d = arc - prev;
      if (d > length / 2) d -= length;
      if (d < -length / 2) d += length;
      acc2 += d;
    }
    const frac = (Array.from({ length: n }, (_, i) => (sim.vel[k * n + i] < slowThresh ? 1 : 0)) as number[])
      .reduce((x: number, y2: number) => x + y2, 0) / n;
    maxFrac = Math.max(maxFrac, frac);
    pts.push({ t: k * dt, arc: acc2, frac });
    prev = arc;
  }
  // least-squares slope of unwrapped arc vs time, m/s
  const Np = pts.length;
  const st = pts.reduce((s, p2) => s + p2.t, 0) / Np;
  const sa = pts.reduce((s, p2) => s + p2.arc, 0) / Np;
  let num = 0;
  let den = 0;
  pts.forEach((p2) => {
    num += (p2.t - st) * (p2.arc - sa);
    den += (p2.t - st) ** 2;
  });
  const slope = num / Math.max(1e-9, den); // m/s, negative = backward
  const avgFrac = pts.reduce((s, p2) => s + p2.frac, 0) / Np;

  return {
    waveSpeedKmh: slope * 3.6,
    jamFraction: avgFrac,
    window: [kFrom * dt, kTo * dt],
    jamArc: (k: number) => jamArcAt(Math.max(0, Math.min(sim.steps - 1, k))),
    maxJamFraction: maxFrac,
  };
};

// =============================================================================
// DRAWING — SVG world, true-scale ring. Cars are rounded rects oriented along the
// tangent; brake lights come straight from the simulated acceleration (cause ->
// effect: braking IS the wave, so the wave lights itself).
// =============================================================================

export type RingView = { cx: number; cy: number; r: number };

export const arcToXY = (view: RingView, arc: number, length: number): [number, number] => {
  const th = (arc / length) * Math.PI * 2;
  return [view.cx + view.r * Math.cos(th), view.cy + view.r * Math.sin(th)];
};
export const arcToDeg = (arc: number, length: number): number => ((arc / length) * 360 + 90) % 360;

// The road: one dark asphalt ring, faint edge lines, lane dashes.
export const RingRoad: React.FC<{ view: RingView; length: number; roadW?: number; color?: string; labels?: number }> = ({
  view, length, roadW = 54, color = '#0e1420', labels = 1,
}) => {
  const C = 2 * Math.PI * view.r;
  const dashCount = 36;
  return (
    <g>
      <circle cx={view.cx} cy={view.cy} r={view.r} fill="none" stroke={color} strokeWidth={roadW} />
      {/* outer + inner edge lines */}
      <circle cx={view.cx} cy={view.cy} r={view.r + roadW / 2 - 3} fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth={2} />
      <circle cx={view.cx} cy={view.cy} r={view.r - roadW / 2 + 3} fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth={2} />
      {/* lane dashes */}
      <circle
        cx={view.cx}
        cy={view.cy}
        r={view.r}
        fill="none"
        stroke="rgba(255,255,255,0.28)"
        strokeWidth={3}
        strokeDasharray={`${(C / dashCount) * 0.42} ${(C / dashCount) * 0.58}`}
      />
      {/* centre island: calm, slightly lighter than space */}
      <circle cx={view.cx} cy={view.cy} r={view.r - roadW / 2 - 8} fill="#0a0f18" stroke="rgba(255,255,255,0.05)" strokeWidth={2} />
      <text
        x={view.cx}
        y={view.cy - 6}
        textAnchor="middle"
        opacity={labels}
        style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 30, letterSpacing: 4, fill: 'rgba(255,255,255,0.34)' }}
      >
        {`${length} m`}
      </text>
      <text
        x={view.cx}
        y={view.cy + 34}
        textAnchor="middle"
        opacity={labels}
        style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 22, letterSpacing: 5, fill: 'rgba(255,255,255,0.22)' }}
      >
        NO EXITS
      </text>
    </g>
  );
};

// One car. w/h are PIXELS (caller decides zoom-compensation); brake is 0..1.
export const CarGlyph: React.FC<{
  x: number;
  y: number;
  deg: number;
  w?: number;
  h?: number;
  color?: string;
  brake?: number; // 0..1 — brake-light intensity (from simulated decel)
  hero?: boolean;
  scale?: number;
}> = ({ x, y, deg, w = 40, h = 20, color = '#3b4a63', brake = 0, hero = false, scale = 1 }) => {
  const rw = w * scale;
  const rh = h * scale;
  const body = hero ? '#6366F1' : color;
  return (
    <g transform={`translate(${x} ${y}) rotate(${deg})`}>
      {/* headlight throw — a soft wedge of light ahead of the car */}
      <path
        d={`M ${rw / 2} ${-rh * 0.36} L ${rw / 2 + rw * 1.5} ${-rh * 1.15} L ${rw / 2 + rw * 1.5} ${rh * 1.15} L ${rw / 2} ${rh * 0.36} Z`}
        fill="url(#headlight)"
        opacity={0.5}
      />
      <rect x={-rw / 2} y={-rh / 2} width={rw} height={rh} rx={rh * 0.34} fill={body} />
      {/* windshield + roof glass */}
      <rect x={rw * 0.02} y={-rh / 2 + rh * 0.16} width={rw * 0.3} height={rh * 0.68} rx={rh * 0.18} fill="rgba(10,16,26,0.55)" />
      {/* headlights */}
      <circle cx={rw / 2 - 2} cy={-rh * 0.3} r={Math.max(1.6, rh * 0.1)} fill="#ffe9b0" />
      <circle cx={rw / 2 - 2} cy={rh * 0.3} r={Math.max(1.6, rh * 0.1)} fill="#ffe9b0" />
      {/* brake lights — the wave, made visible */}
      {brake > 0.02 && (
        <g>
          <circle cx={-rw / 2 + 2} cy={-rh * 0.3} r={Math.max(2, rh * 0.13) + 3.5 * brake} fill="#ff5f5f" opacity={0.25 + 0.75 * brake} />
          <circle cx={-rw / 2 + 2} cy={rh * 0.3} r={Math.max(2, rh * 0.13) + 3.5 * brake} fill="#ff5f5f" opacity={0.25 + 0.75 * brake} />
          <rect x={-rw / 2} y={-rh / 2 + 1} width={Math.max(3, rw * 0.12)} height={rh - 2} rx={2} fill="#ff5f5f" opacity={0.85 * brake} />
        </g>
      )}
      {hero && <rect x={-rw / 2 - 2} y={-rh / 2 - 2} width={rw + 4} height={rh + 4} rx={rh * 0.36} fill="none" stroke="#8b9cff" strokeWidth={1.5} opacity={0.8} />}
    </g>
  );
};

// The wave marker: a gold chevron riding the jam crest, pointing BACKWARD along the
// ring, plus a dashed trail over the arc it recently swept (it came from higher arcs
// — it travels toward lower ones).
export const WaveMarker: React.FC<{
  view: RingView;
  length: number;
  arc: number; // metres
  trail?: number; // metres of trail to draw over where the wave came from
  scale?: number;
  opacity?: number;
}> = ({ view, length, arc, trail = 0, scale = 1, opacity = 1 }) => {
  const [x, y] = arcToXY(view, arc, length);
  const deg = arcToDeg(arc, length); // car heading at that arc
  const s = 1 / Math.max(0.4, scale);
  const backDeg = deg + 180;
  const trailEnd = arc + trail; // the wave came from higher arcs (it moves backward)
  const [tx, ty] = arcToXY(view, Math.min(length, trailEnd), length);
  const sweep = trail > length / 2 ? 1 : 0;
  return (
    <g opacity={opacity}>
      {trail > 0.5 && (
        <path
          d={`M ${x} ${y} A ${view.r} ${view.r} 0 ${sweep} 0 ${tx} ${ty}`}
          fill="none"
          stroke="#f5d76e"
          strokeWidth={4 * s}
          strokeDasharray={`${14 * s} ${12 * s}`}
          opacity={0.65}
        />
      )}
      <g transform={`translate(${x} ${y}) rotate(${backDeg}) scale(${s})`}>
        <path d="M -14 -22 L 16 0 L -14 22 L -6 0 Z" fill="#f5d76e" stroke="#0a0f18" strokeWidth={3} />
      </g>
    </g>
  );
};

// A soft highlight of the jam region itself (the stopped cluster): a wide, low
// red-amber arc centred on the crest, drawn UNDER the cars.
export const JamGlow: React.FC<{ view: RingView; length: number; arc: number; spanM: number; opacity?: number }> = ({
  view, length, arc, spanM, opacity = 1,
}) => {
  const a0 = arc - spanM / 2;
  const a1 = arc + spanM / 2;
  const [x0, y0] = arcToXY(view, a0, length);
  const [x1, y1] = arcToXY(view, a1, length);
  const sweep = spanM > length / 2 ? 1 : 0;
  return (
    <path
      d={`M ${x0} ${y0} A ${view.r} ${view.r} 0 ${sweep} 1 ${x1} ${y1}`}
      fill="none"
      stroke="#ff5f5f"
      strokeWidth={70}
      opacity={0.16 * opacity}
      strokeLinecap="round"
    />
  );
};

const polar = (view: RingView, deg: number): [number, number] => {
  const rad = (deg * Math.PI) / 180;
  return [view.cx + view.r * Math.cos(rad), view.cy + view.r * Math.sin(rad)];
};
void polar;
