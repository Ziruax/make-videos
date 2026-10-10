import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import S1 from './S1';
import S2 from './S2';
import S3 from './S3';

// MASTER — 384 frames exactly (25.6s @15fps). Scene frames are LOCAL by design
// (each scene is also registered standalone). The transitions are the scenes' own
// camera-continuity moves: scrap portal -> focus-hunt arrival, recede-and-blur ->
// continuous arrival.
export const compositionConfig = {
  id: 'Os1OnePercent',
  durationInSeconds: 25.6,
  durationInFrames: 384,
  fps: 15,
  width: 1080,
  height: 1920,
};

const Os1OnePercent: React.FC = () => (
  <AbsoluteFill style={{ background: OS1_BG }}>
    <Sequence from={0} durationInFrames={108}>
      <S1 />
    </Sequence>
    <Sequence from={108} durationInFrames={123}>
      <S2 />
    </Sequence>
    <Sequence from={231} durationInFrames={153}>
      <S3 />
    </Sequence>
  </AbsoluteFill>
);

const OS1_BG = '#080F16';

export default Os1OnePercent;
