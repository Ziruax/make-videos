import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { MR } from '../../lib/tactile';
import S1 from './S1';
import S2 from './S2';
import S3 from './S3';

// MASTER — 1020 frames exactly (34.0s @30fps). Scene frames are LOCAL by design
// (each scene is also registered standalone). The transitions are the scenes'
// own camera-continuity moves: wedge-open portal -> matched-motion dive entry;
// hold -> matched hold. No hard cuts.
export const compositionConfig = {
  id: 'C3d1Shell',
  durationInSeconds: 34.0,
  durationInFrames: 1020,
  fps: 30,
  width: 1080,
  height: 1920,
};

const C3d1Shell: React.FC = () => (
  <AbsoluteFill style={{ background: MR.ink }}>
    <Sequence from={0} durationInFrames={189}>
      <S1 />
    </Sequence>
    <Sequence from={189} durationInFrames={408}>
      <S2 />
    </Sequence>
    <Sequence from={597} durationInFrames={423}>
      <S3 />
    </Sequence>
  </AbsoluteFill>
);

export default C3d1Shell;
