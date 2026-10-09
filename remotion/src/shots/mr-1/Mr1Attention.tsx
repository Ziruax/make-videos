import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import S1 from './S1';
import S2 from './S2';
import S3 from './S3';

// MASTER — 332 frames exactly (22.13s @15fps). Scene frames are LOCAL by design
// (each scene is also registered standalone). The transitions are the scenes'
// own camera-continuity moves: pupil portal -> focus-hunt arrival, recede-and-
// blur -> continuous arrival.
export const compositionConfig = {
  id: 'Mr1Attention',
  durationInSeconds: 22.1333,
  durationInFrames: 332,
  fps: 15,
  width: 1080,
  height: 1920,
};

const Mr1Attention: React.FC = () => (
  <AbsoluteFill style={{ background: MR_BG }}>
    <Sequence from={0} durationInFrames={104}>
      <S1 />
    </Sequence>
    <Sequence from={104} durationInFrames={124}>
      <S2 />
    </Sequence>
    <Sequence from={228} durationInFrames={104}>
      <S3 />
    </Sequence>
  </AbsoluteFill>
);

const MR_BG = '#080F16';

export default Mr1Attention;
