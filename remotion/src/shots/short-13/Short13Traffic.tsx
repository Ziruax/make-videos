import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, EASE_INOUT, Kicker, PauseCard, ProgressBar, StatChip, Stamp, prog } from '../../lib/shorts';
import { CarGlyph, JamGlow, RingRoad, WaveMarker, arcToXY, measureJam, simulateRing } from '../../lib/agents';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short13Traffic',
  durationInSeconds: 42,
  fps: 30,
  width: 1080,
  height: 1920,
};

// =============================================================================
// THE SIMULATION — module-level, deterministic. Every car position, brake light
// and the wave crest below comes from THIS object; nothing is keyframed. The
// wave speed chip prints the number measureJam() measures from it.
// =============================================================================
const SIM = simulateRing({});
const MEAS = measureJam(SIM);
const N = SIM.opts.n;
const L = SIM.opts.length;
const DT = SIM.opts.dt;
const K = (t: number) => Math.max(0, Math.min(SIM.steps - 1, Math.round(t / DT)));
const WAVE_KMH = MEAS.waveSpeedKmh; // ~-17.9: backward, measured

const GOLD = '#f5d76e';
const RED = '#ff5f5f';
const INDIGO = '#6366F1';
const VIOLET = '#9b7cc4';
const SPACE = '#070b12';
const HERO = 0; // the tapper
const FOLLOW = 7; // the car that passes through the jam (measured: in @44s, out @61s)
const F = (s: number) => Math.round(s * 30);

// THE TIME MAP — video seconds -> simulated seconds (knots mirror beats.json.sim).
// The hook shows the mature jam (t=85); the setup REWINDS it to zero; the reveal
// replays it; the twist follows one car through it at 2.6x; the loop lets it sweep.
const KNOTS: [number, number][] = [
  [0.0, 85], [4.9, 95.8], [5.2, 95.8], [8.1, 0], [11.9, 4.0], [16.4, 6.2],
  [19.7, 7.6], [22.3, 12.0], [24.3, 16.0], [28.0, 34.0], [28.4, 38.0],
  [38.2, 64.5], [40.6, 74.0], [42.0, 79.0],
];
const simTime = (t: number) => {
  if (t <= KNOTS[0][0]) return KNOTS[0][1];
  for (let i = 1; i < KNOTS.length; i++) {
    if (t <= KNOTS[i][0]) {
      const [t0, s0] = KNOTS[i - 1];
      const [t1, s1] = KNOTS[i];
      return s0 + ((t - t0) / Math.max(1e-6, t1 - t0)) * (s1 - s0);
    }
  }
  return KNOTS[KNOTS.length - 1][1];
};

// =============================================================================
// THE VIEW — true scale: 230 m ring -> 320 px radius (8.74 px/m); 4.5 m cars
// -> 39 px. Legible wide, detailed at the 2.4x tap phase. Nothing exaggerated.
// =============================================================================
const VIEW = { cx: 540, cy: 800, r: 320 };
const PXM = (2 * Math.PI * VIEW.r) / L; // 8.74
const CAR_W = 4.5 * PXM;
const CAR_H = 2.1 * PXM;
const ROAD_W = 5 * PXM;
const FOLLOW_COLOR = ['#3b4a63', '#46566e', '#39536b', '#42506b', '#374f5f'];

const HOOK_OUT = F(4.9);
const LOOP_IN = F(40.6);
const END = F(42.0);

const Short13Traffic: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;

  // punch: settle at the hook, mirror at the loop (short-12's pattern)
  const punch =
    f < LOOP_IN ? 1.05 - 0.05 * EASE_INOUT(prog(f, 0, 30)) : 1.0 + 0.05 * EASE_INOUT(prog(f, LOOP_IN, END));

  // THE SIM STATE at this frame
  const st = K(simTime(t));
  const pos = (i: number) => SIM.pos[st * N + i];
  const vel = (i: number) => SIM.vel[st * N + i];
  const acc = (i: number) => SIM.acc[st * N + i];

  // THE CAMERA: push in on the hero across the rewind (1.0 -> 2.4), hold through
  // the tap, then pull back out (2.4 -> 1.0) as the wave outruns the frame —
  // short-11/12's "camera is part of the payoff", third outing.
  const zin = EASE_INOUT(prog(f, F(5.2), F(8.1)));
  const zout = EASE_INOUT(prog(f, F(24.2), F(28.0)));
  const z = 1 + 1.4 * Math.max(0, zin - zout);

  // anchor: track the hero while zoomed (a following shot — the world flows past
  // the stationary-on-screen car), blend back to the ring centre as we pull out
  const [hx, hy] = arcToXY(VIEW, pos(HERO), L);
  const aMix = Math.max(0, (z - 1) / 1.4);
  const ax = VIEW.cx + (hx - VIEW.cx) * aMix;
  const ay = VIEW.cy + (hy - VIEW.cy) * aMix;

  // THE WAVE marker: on at frame 0 (hook rule — the payoff is already visible),
  // off through the rewind + build, back ON THE WORD "wave" (23.67 in the real take).
  const markerOp = Math.max(1 - prog(f, F(4.9), F(5.2)), prog(f, F(23.5), F(24.7)));
  const crest = MEAS.jamArc(st);

  // THE JAM GLOW: computed from the sim itself — the arc span of the stopped cars
  let glowArc: number | null = null;
  let glowSpan = 0;
  {
    const slow: number[] = [];
    for (let i = 0; i < N; i++) if (vel(i) < 2) slow.push(pos(i));
    if (slow.length >= 4 && crest !== null) {
      // unwrap the slow cars' arcs around the crest, then take their extent
      const rel = slow.map((a) => {
        let d = a - crest;
        if (d > L / 2) d -= L;
        if (d < -L / 2) d += L;
        return d;
      });
      const lo = Math.min(...rel);
      const hi = Math.max(...rel);
      glowArc = crest + (lo + hi) / 2;
      glowSpan = hi - lo + 8;
    }
  }

  // spotlight (twist): car #7 passes through the jam — measured in at sim 44,
  // out at 61, which the knot table maps to video ~30.6 and ~36.9
  const spotOp = prog(f, F(28.4), F(29.3)) * (1 - prog(f, F(38.0), F(38.6)));
  const [fx7, fy7] = arcToXY(VIEW, pos(FOLLOW), L);
  const followKmh = Math.round((vel(FOLLOW) * 3.6) / 5) * 5;

  const titleOp = Math.min(1, 1 - prog(f, HOOK_OUT, HOOK_OUT + 24) + prog(f, F(40.9), END));
  const expChipOp = prog(f, F(8.4), F(8.4) + 12) * (1 - prog(f, F(13.2), F(13.8)));
  const waveChipOp = prog(f, F(38.9), F(38.9) + 10) * (1 - prog(f, F(41.2), F(41.9)));

  // the crest arc can be null before the jam exists — guard the marker
  const markerArc = crest === null ? 0 : crest;

  return (
    <AbsoluteFill style={{ background: SPACE }}>
      <AbsoluteFill
        style={{ background: 'radial-gradient(ellipse 80% 45% at 50% 40%, #101a2b 0%, transparent 72%)' }}
      />

      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
          <defs>
            <radialGradient id="headlight" cx="1" cy="0.5" r="1">
              <stop offset="0%" stopColor="#ffe9b0" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#ffe9b0" stopOpacity="0" />
            </radialGradient>
          </defs>

          <g transform={`translate(${ax} ${ay}) scale(${z}) translate(${-ax} ${-ay})`}>
            {/* the road — one persistent actor, on screen the whole video. Centre labels
                fade out under zoom (they'd clip at the screen edge at 2.4x). */}
            <RingRoad view={VIEW} length={L} roadW={ROAD_W} labels={Math.max(0, Math.min(1, (1.06 - z) / 0.06))} />

            {/* the jam, glowing wherever the sim says it is — with a slow breathing
                pulse so the hold at the hook reads alive (MOTION rule 4) */}
            {glowArc !== null && glowSpan > 0 && (
              <JamGlow view={VIEW} length={L} arc={glowArc} spanM={glowSpan} opacity={0.85 + 0.15 * Math.sin((f / 90) * Math.PI * 2)} />
            )}

            {/* the 22 drivers — brake lights straight from their simulated decel */}
            {Array.from({ length: N }, (_, i) => {
              const [x, y] = arcToXY(VIEW, pos(i), L);
              const deg = (pos(i) / L) * 360 + 90;
              const brake = Math.max(0, Math.min(1, (-acc(i) - 0.4) / 2.2));
              return (
                <CarGlyph
                  key={i}
                  x={x}
                  y={y}
                  deg={deg}
                  w={CAR_W}
                  h={CAR_H}
                  color={i === FOLLOW ? VIOLET : FOLLOW_COLOR[i % FOLLOW_COLOR.length]}
                  brake={brake}
                  hero={i === HERO}
                />
              );
            })}

            {/* the wave — the only thing on screen moving against traffic */}
            {markerOp > 0.01 && (
              <WaveMarker view={VIEW} length={L} arc={markerArc} trail={90} scale={z} opacity={markerOp} />
            )}

            {/* the spotlight car + its live speed tag (cause -> effect, honest number) */}
            {spotOp > 0.01 && (
              <g opacity={spotOp}>
                <circle cx={fx7} cy={fy7} r={52} fill="none" stroke={GOLD} strokeWidth={3} strokeDasharray="6 7" />
                <g transform={`translate(${fx7} ${fy7 - 78})`}>
                  <rect x={-64} y={-26} width={128} height={44} rx={10} fill="rgba(12,14,20,0.9)" stroke={`${GOLD}55`} />
                  <text
                    x={0}
                    y={5}
                    textAnchor="middle"
                    style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 26, fill: GOLD }}
                  >
                    {`${followKmh} km/h`}
                  </text>
                </g>
              </g>
            )}
          </g>
        </svg>

        <div style={{ opacity: titleOp }}>
          <BigTitle
            lines={[
              { text: 'THIS JAM', color: '#ffffff' },
              { text: 'HAS NO CAUSE.', color: GOLD },
            ]}
            subtitle={`22 cars · no accident · no blockage`}
            y={140}
            size={92}
            warm
          />
        </div>

        <Kicker text="A REAL EXPERIMENT · 2008" color={GOLD} y={400} at={F(5.6)} until={F(8.2)} />
        <Kicker text="ONE BRAKE TAP" color={RED} y={400} at={F(11.9)} until={F(13.6)} />
        <Kicker text="THE WAVE" color={GOLD} y={400} at={F(22.5)} until={F(28.2)} />
        <Kicker text="IT'S NOT THE CARS" color={GOLD} y={400} at={F(32.0)} until={F(37.4)} />

        <div style={{ opacity: expChipOp }}>
          <StatChip label="the experiment" value="22 drivers · 230 m circle · no exits" color={GOLD} x={240} y={470} w={600} at={F(8.4)} />
        </div>

        {/* the number the sim measured, printed by the code that measured it */}
        <div style={{ opacity: waveChipOp }}>
          <StatChip
            label="wave speed · measured in this sim"
            value={`${Math.abs(WAVE_KMH).toFixed(1)} km/h · backwards`}
            color={GOLD}
            x={240}
            y={470}
            w={640}
            at={F(38.9)}
          />
        </div>

        {/* THE counterintuitive punch, stamped on the word "backwards" */}
        <Stamp text="BACKWARDS" at={F(25.4)} until={F(28.2)} color={GOLD} x={540} y={1250} size={72} rotate={-6} />

        {/* the tap, labelled — fires ON the real word "taps" (11.95), below the chip */}
        <Stamp text="ONE TAP" at={F(12.0)} until={F(13.6)} color={RED} x={540} y={670} size={54} rotate={-4} />
      </AbsoluteFill>

      {/* quiz — frozen slow-mo underneath: the tap mid-ripple, lights glowing */}
      <Sequence from={F(13.8)} durationInFrames={F(3.0)}>
        <PauseCard title="PAUSE" subtitle="which way does the jam travel?" durSec={3.0} accent={GOLD} y={1250} />
      </Sequence>

      <Captions lines={VO} y={1450} accent={GOLD} plate />
      <ProgressBar color={GOLD} />
    </AbsoluteFill>
  );
};

export default Short13Traffic;
