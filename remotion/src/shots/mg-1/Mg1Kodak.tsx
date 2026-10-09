import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import { EASE_OUT, VoLine, prog, timeWords } from '../../lib/shorts';
import { FONT_SERIF } from '../../fonts';
import { VO } from './vo.gen';
import S1 from './S1';
import S2 from './S2';
import S3 from './S3';
import S4 from './S4';
import S5 from './S5';
import S6 from './S6';

// MASTER — the 6 scenes dropped in order inside <Sequence>s (scene frames are LOCAL
// by design; each scene is also registered standalone). The serif-italic captions
// ride the master at GLOBAL time, word-exact against the VO.
export const compositionConfig = {
  id: 'Mg1Kodak',
  durationInSeconds: 32,
  fps: 30,
  width: 1080,
  height: 1920,
};

const F = (s: number) => Math.round(s * 30);
// scene windows (from beats.json — cut from the VO line gaps)
const SCENES: { from: number; dur: number; C: React.FC }[] = [
  { from: F(0.0), dur: F(5.6), C: S1 },
  { from: F(5.6), dur: F(5.2), C: S2 },
  { from: F(10.8), dur: F(5.2), C: S3 },
  { from: F(16.0), dur: F(5.2), C: S4 },
  { from: F(21.2), dur: F(5.2), C: S5 },
  { from: F(26.4), dur: F(5.6), C: S6 },
];

// serif-italic captions — the track's own style: word-timed (the words always win),
// current word in gold italic, plate-free with a deep text shadow.
const MgCaptions: React.FC<{ lines: VoLine[] }> = ({ lines }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const active = lines.find((l) => t >= l.start - 0.15 && t < l.end + 0.5);
  if (!active) return null;
  const words = timeWords(active);
  const enter = EASE_OUT(prog(t, active.start, active.start + 0.25));
  return (
    <div
      style={{
        position: 'absolute', left: 70, right: 70, bottom: 150,
        opacity: 0.25 + 0.75 * enter,
        transform: `translateY(${(1 - enter) * 18}px)`,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'baseline',
          columnGap: 18, rowGap: 6,
        }}
      >
        {words.map((w, i) => {
          const on = t >= w.start && t < w.end + 0.06;
          return (
            <span
              key={i}
              style={{
                fontFamily: FONT_SERIF,
                fontStyle: 'italic',
                fontSize: on ? 56 : 48,
                color: on ? '#f5d76e' : '#f3ead3',
                opacity: t >= w.start - 0.1 ? 1 : 0.42,
                textShadow: '0 4px 22px rgba(0,0,0,0.9)',
                transition: 'none',
              }}
            >
              {w.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const Mg1Kodak: React.FC = () => (
  <AbsoluteFill style={{ background: '#050608' }}>
    {SCENES.map(({ from, dur, C }, i) => (
      <Sequence key={i} from={from} durationInFrames={dur}>
        <C />
      </Sequence>
    ))}
    <MgCaptions lines={VO} />
  </AbsoluteFill>
);

export default Mg1Kodak;
