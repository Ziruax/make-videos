// c3d-1 S1 — the claim (ivory light). The settled globe, frame 0 fully
// composed; the voice names the shell; the wedge opens on the act turn (the
// portal); the camera tips INTO the wedge as the exit.
import React from 'react';
import { useCurrentFrame, useVideoConfig, Easing, interpolate } from 'remotion';
import { MR } from '../../lib/tactile';
import { Cut3d, CamKey } from '../../lib/cut3d';
import { EarthModel, TopTag } from './common';
import { VO } from './vo.gen';
import { SceneWords } from './words';

export const compositionConfig = {
  id: 'C3d1ShellS1',
  durationInSeconds: 6.3,
  durationInFrames: 189,
  fps: 30,
  width: 1080,
  height: 1920,
};

const TRACK: CamKey[] = [
  { t: 0.0, pos: [0, 0.9, 7.6], look: [0, 0, 0] },
  { t: 4.5, pos: [0, 0.78, 7.25], look: [0, 0, 0], ease: 'io' }, // the settle push
  { t: 6.3, pos: [0, 0.3, 5.4], look: [0, 0.25, 0], ease: 'in' }, // tip INTO the wedge
];

const S1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  // the wedge opens on the act turn (easeInOutCubic, 1.3s) — the portal
  const open = interpolate(t, [4.5, 5.8], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.bezier(0.65, 0, 0.35, 1),
  });
  return (
    <>
      <Cut3d bg={MR.ivory} camTrack={TRACK} fov={34} wedge={{ open, halfMax: 0.95 }}>
        {(planes) => (
          <EarthModel
            planes={planes}
            ex={0}
            gMantle={0}
            gOuter={0}
            gInner={0}
            churn={0}
            field={0}
            fieldScale={0.97}
            spin={t * 0.06}
            coreGlow={0}
          />
        )}
      </Cut3d>
      {/* the words (VO only) — the house caption band */}
      <div style={{ position: 'absolute', left: 80, right: 80, top: 1480, display: 'flex', justifyContent: 'center' }}>
        <SceneWords lines={VO.filter((l) => l.start < 6.3)} offsetSec={0} light />
      </div>
      <TopTag light />
    </>
  );
};

export default S1;
