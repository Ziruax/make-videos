// c3d-1 S3 — the payoff (night, continuous). The gold core glows up in the
// pause before line 5; the camera welcomes in and HOLDS; on "sun's surface"
// the layers EXPLODE into the labelled vertical stack (deep impact in the
// scored silence); line 6 explains the solid; on "melt" the reassembly lands
// (mirrored); the wedge closes onto the S1 framing while line 7 speaks; the
// final 1.0→1.03 breathing push. The end is the start, changed.
import React from 'react';
import { useCurrentFrame, useVideoConfig, Easing, interpolate } from 'remotion';
import { MR } from '../../lib/tactile';
import { Cut3d, CamKey, LabelSpec, explodeAt } from '../../lib/cut3d';
import { EarthModel, TopTag, gate } from './common';
import { VO } from './vo.gen';
import { SceneWords } from './words';

export const compositionConfig = {
  id: 'C3d1ShellS3',
  durationInSeconds: 14.1,
  durationInFrames: 423,
  fps: 30,
  width: 1080,
  height: 1920,
};

const T0 = 19.9; // this scene's global start

const TRACK: CamKey[] = [
  { t: 19.9, pos: [0, 0.05, 1.9], look: [0, 0, 0] }, // matched to S2's hold
  { t: 20.6, pos: [0, 0.03, 1.72], look: [0, 0, 0], ease: 'out' }, // the welcome dolly
  { t: 23.4, pos: [0, 0.03, 1.72], look: [0, 0, 0] }, // HOLD — the payoff lands in view
  { t: 26.0, pos: [0, 2.35, 9.2], look: [0, 1.72, 0], ease: 'io' }, // pull back for the stack (raised: the caption band stays over background)
  { t: 28.4, pos: [0.55, 2.28, 8.95], look: [0, 1.68, 0], ease: 'io' }, // slow drift, line 6
  { t: 30.4, pos: [0, 1.1, 6.2], look: [0, 0.35, 0], ease: 'io' }, // reassembly glide
  { t: 32.4, pos: [0, 0.88, 7.55], look: [0, 0, 0], ease: 'io' }, // retreat to the globe framing
  { t: 34.0, pos: [0, 0.82, 7.12], look: [0, 0, 0], ease: 'io' }, // the breathing push
];

// the explode: up on "sun's surface" (23.3), hold, down on "melt" (27.5→28.9)
const EXPL = { t0: 23.3, t1: 27.5, up: 1.9, down: 1.4 };
const exAt = (t: number) => {
  const ex = explodeAt(t, EXPL.t0, EXPL.t1, EXPL.up, EXPL.down);
  // landing overshoot 5% (house spring law), damped, only during the hold
  const over = t > EXPL.t0 + EXPL.up && t < EXPL.t1
    ? 0.05 * Math.sin((t - EXPL.t0 - EXPL.up) * 9) * Math.exp(-(t - EXPL.t0 - EXPL.up) * 2.2)
    : 0;
  return ex * (1 + over);
};

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
  {
    text: 'INNER CORE',
    sub: 'solid · 5,700 K',
    side: -1,
    t0: 21.7,
    t1: 30.2,
    color: MR.gold,
    anchorAt: () => [0.24, 0.24, 0.16],
  },
  {
    text: 'CRUST',
    sub: '5–70 km thick',
    side: 1,
    t0: 24.9,
    t1: 28.4,
    color: MR.ivory,
    anchorAt: (t) => [0.85, 1.35 + 2.55 * exAt(t), 1.2],
  },
];

const S3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps + T0;

  const ex = exAt(t);
  // the glow's build-release: up in the pause, DIPPING through the hold (so the
  // explode brightens it back — the Gauntlet's note), 0.85 at the payoff hit
  const glowBase =
    interpolate(t, [19.9, 20.45], [0, 0.75], {
      extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
      easing: Easing.bezier(0.33, 1, 0.68, 1),
    }) *
    interpolate(t, [30.6, 31.8], [1, 0.33], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) *
    interpolate(t, [21.5, 23.0], [1, 0.62], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) *
    interpolate(t, [23.2, 23.8], [1, 1.42], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const coreGlow = glowBase + (t > 20.45 ? 0.045 * Math.sin(t * 2.2) * (t < 30.6 ? 1 : 0) : 0);
  const churn = interpolate(t, [29.7, 30.8], [0.75, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  // the wedge closes while "shell of a furnace" speaks
  const open = 1 - interpolate(t, [30.6, 32.4], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.bezier(0.65, 0, 0.35, 1),
  });

  return (
    <>
      <Cut3d
        bg={MR.ink}
        camTrack={TRACK}
        fov={34}
        wedge={{ open, halfMax: 0.95 }}
        labels={LABELS}
        timeOffset={T0}
      >
        {(planes) => (
          <EarthModel
            planes={planes}
            ex={ex}
            gMantle={gate(t, 6.9, 3.0)}
            gOuter={gate(t, 11.82, 4.4)}
            gInner={gate(t, 21.55, 4.0)}
            churn={churn}
            field={0}
            fieldScale={0.97}
            spin={t * 0.06}
            coreGlow={coreGlow}
          />
        )}
      </Cut3d>
      {/* the words (VO only) — the house caption band */}
      <div style={{ position: 'absolute', left: 80, right: 80, top: 1480, display: 'flex', justifyContent: 'center' }}>
        <SceneWords lines={VO.filter((l) => l.start >= 19.9)} offsetSec={T0} />
      </div>
      <TopTag />
    </>
  );
};

export default S3;
