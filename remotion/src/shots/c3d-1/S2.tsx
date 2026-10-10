// c3d-1 S2 — the dive (teal night, continuous). Enter from the opened wedge;
// the camera descends a 'lin' pass-through leg through the mantle (the label
// arrives on "three thousand"), the outer core (label + churn on "liquid iron"
// / "churning"), the field arcs bloom on "magnetic field", then the camera
// settles before the core and HOLDS. The depth readout runs live.
import React from 'react';
import { useCurrentFrame, useVideoConfig, Easing, interpolate } from 'remotion';
import { MR } from '../../lib/tactile';
import { Cut3d, CamKey, LabelSpec, explodeAt } from '../../lib/cut3d';
import { EarthModel, TopTag, gate, R } from './common';
import { VO } from './vo.gen';
import { SceneWords } from './words';

export const compositionConfig = {
  id: 'C3d1ShellS2',
  durationInSeconds: 13.6,
  durationInFrames: 408,
  fps: 30,
  width: 1080,
  height: 1920,
};

const T0 = 6.3; // this scene's global start

const TRACK: CamKey[] = [
  { t: 6.3, pos: [0, 0.3, 5.4], look: [0, 0.25, 0] }, // matched to S1's exit
  { t: 7.9, pos: [0.35, 0.12, 3.3], look: [0, 0.05, 0], ease: 'lin' }, // the wedge mouth
  { t: 10.8, pos: [0.1, 0.06, 1.9], look: [0, 0, 0], ease: 'lin' }, // inside the mantle
  { t: 13.5, pos: [0, 0.04, 1.15], look: [0, 0, 0], ease: 'io' }, // the outer core ocean
  { t: 16.4, pos: [0, 0.03, 1.75], look: [0, 0, 0], ease: 'io' }, // back a touch for the field
  { t: 18.9, pos: [0, 0.05, 1.9], look: [0, 0, 0], ease: 'out' }, // settle + HOLD
  { t: 19.9, pos: [0, 0.05, 1.9], look: [0, 0, 0] }, // hold — matched to S3
];

// word-cued events (real times from vo.gen.ts)
const MANTLE_AT = 6.9; // "three [thousand]"
const OUTER_AT = 11.82; // "liquid"
const CHURN_AT = 13.9; // "churning"
const FIELD_AT = 16.78; // "field"

const EXPL = { t0: 23.3, t1: 27.5, up: 1.9, down: 1.4 }; // the S3 explode (shared timing)
const exAt = (t: number) => explodeAt(t, EXPL.t0, EXPL.t1, EXPL.up, EXPL.down);

const LABELS: LabelSpec[] = [
  {
    text: 'MANTLE',
    sub: '2,900 km · slowly flowing rock',
    side: -1,
    t0: 7.05,
    t1: 28.5,
    color: MR.mutedTeal,
    anchorAt: (t) => [0.85, 0.75 + 1.65 * exAt(t), 1.5],
  },
  {
    text: 'OUTER CORE',
    sub: 'liquid Fe-Ni · 2,260 km',
    side: 1,
    t0: 11.95,
    t1: 28.5,
    color: MR.teal,
    anchorAt: (t) => [0.55, 0.45 + 0.78 * exAt(t), 0.9],
  },
];

const S2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps + T0;

  const gMantle = gate(t, MANTLE_AT, 3.0);
  const gOuter = gate(t, OUTER_AT, 4.4);
  const gInner = 0;
  const churn = interpolate(t, [CHURN_AT, CHURN_AT + 1.0], [0, 0.75], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.bezier(0.33, 1, 0.68, 1),
  });
  const field = interpolate(t, [FIELD_AT, FIELD_AT + 0.9], [0, 0.8], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.bezier(0.33, 1, 0.68, 1),
  }) * interpolate(t, [19.5, 20.3], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fieldScale = 0.97 + 0.08 * interpolate(t, [FIELD_AT, 19.5], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  // camera buzz follows the churn state (deterministic multi-sine in the rig)
  const buzz = 0.003 + 0.009 * churn;

  // live depth readout: radial distance from the surface, only while diving;
  // starts at the wedge mouth (8.0), freezes at the deepest point (14.5) so the
  // instrument never runs backward when the camera eases off for the field
  const depthVisible = t >= 8.0 && t < 18.8;
  const liveT = Math.min(t, 14.5); // freeze at the deepest radial point
  const depth = depthVisible ? Math.max(0, (R.crust - radialAt(liveT)) * 3185.5) : null;

  return (
    <>
      <Cut3d
        bg={MR.ink}
        camTrack={TRACK}
        fov={34}
        buzz={buzz}
        wedge={{ open: 1, halfMax: 0.95 }}
        labels={LABELS}
        timeOffset={T0}
      >
        {(planes) => (
          <EarthModel
            planes={planes}
            ex={0}
            gMantle={gMantle}
            gOuter={gOuter}
            gInner={gInner}
            churn={churn}
            field={field}
            fieldScale={fieldScale}
            spin={t * 0.06}
            coreGlow={0}
          />
        )}
      </Cut3d>
      {/* the words (VO only) — the house caption band */}
      <div style={{ position: 'absolute', left: 80, right: 80, top: 1480, display: 'flex', justifyContent: 'center' }}>
        <SceneWords
          lines={VO.filter((l) => l.start >= 6.3 && l.start < 19.9)}
          offsetSec={T0}
        />
      </div>
      <TopTag depthKm={depth} />
    </>
  );
};

// radial distance of the camera from origin at time t (pure; mirrors the track)
const radialAt = (t: number): number => {
  // same interpolation as cutCam — recompute the segment
  let i = 0;
  while (i < TRACK.length - 2 && t > TRACK[i + 1].t) i++;
  const a = TRACK[i];
  const b = TRACK[i + 1] ?? TRACK[i];
  const k = Math.min(1, Math.max(0, (t - a.t) / Math.max(1e-6, b.t - a.t)));
  const q = b.ease === 'in' ? k * k : b.ease === 'out' ? 1 - Math.pow(1 - k, 3) : b.ease === 'lin' ? k : k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
  const L = (u: number, v: number) => u + (v - u) * q;
  const x = L(a.pos[0], b.pos[0]), y = L(a.pos[1], b.pos[1]), z = L(a.pos[2], b.pos[2]);
  return Math.sqrt(x * x + y * y + z * z);
};

export default S2;
