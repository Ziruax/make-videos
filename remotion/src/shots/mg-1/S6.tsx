import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { decaySwing, posterizeFrame } from '../../lib/engine';
import { ParallaxPunch } from './S4';
import { prog } from '../../lib/shorts';

// S6 — THE FINALE (clone + reskin): the fall scene cloned — parallax punch, shadow,
// camera, treatment all kept — words swapped to Instagram's numbers, and THE gesture:
// the red foam finger rises bottom-right (0.72 -> 1 over ~12f) then wags "no" about
// the wrist with decaySwing. Ends on the payoff — no CTA.
export const compositionConfig = {
  id: 'Mg1S6',
  durationInSeconds: 5.6,
  fps: 30,
  width: 1080,
  height: 1920,
};

const FoamFinger: React.FC = () => {
  const raw = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = posterizeFrame(raw, fps, 12);

  const riseIn = prog(f, 56, 68); // slide + scale over ~12f
  const scale = 0.72 + 0.28 * riseIn;
  const x = 640 + (1 - riseIn) * 380;
  const y = 880 + (1 - riseIn) * 360;
  // THE wag: about the wrist
  const wag = decaySwing(f, 72, 28, 0.52, 0.042);

  return (
    <div
      style={{
        position: 'absolute', left: x, top: y, width: 420,
        transform: `scale(${scale}) rotate(${wag}deg)`,
        transformOrigin: '50% 92%', // the wrist
        filter: 'drop-shadow(0 26px 46px rgba(0,0,0,0.55))',
        opacity: riseIn,
      }}
    >
      <svg viewBox="0 0 300 340" width="100%">
        {/* the foam finger: a big #1 hand, flat cartoon fill */}
        <path
          d="M 96 332 C 76 262, 68 208, 76 150 C 80 116, 96 92, 118 80 L 124 18 C 125 6, 138 0, 150 4 C 163 8, 168 20, 166 34 L 158 96 C 182 92, 205 100, 216 118 C 228 138, 224 160, 208 172 L 176 190 C 200 216, 214 252, 214 292 L 210 332 Z"
          fill="#d93636"
          stroke="#a32222"
          strokeWidth="7"
        />
        <path d="M 118 84 L 160 92 L 152 116 L 112 104 Z" fill="#c22c2c" />
        <text x="150" y="262" textAnchor="middle" style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 64, fill: '#fff' }}>
          #1
        </text>
      </svg>
    </div>
  );
};

const S6: React.FC = () => (
  <AbsoluteFill style={{ background: '#0c0d12' }}>
    {/* THE CLONE: the fall, reskinned — same punch, same shadow, same camera */}
    <ParallaxPunch words={['Instagram.', 'thirteen', 'people.']} accentLast={false} endFlash />
    {/* the payoff words + the finger, above the clone */}
    <PayoffWords />
    <FoamFinger />
  </AbsoluteFill>
);

const PayoffWords: React.FC = () => {
  const raw = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = posterizeFrame(raw, fps, 12);
  const on = prog(f, 88, 104);
  return (
    <div
      style={{
        position: 'absolute', left: 84, top: 1330,
        opacity: on,
        transform: `translateY(${(1 - on) * 24}px)`,
      }}
    >
      <div style={{ fontFamily: 'Spectral, serif', fontStyle: 'italic', fontSize: 84, color: '#f5d76e', textShadow: '0 4px 30px rgba(245,215,110,0.3)', lineHeight: 1.1 }}>
        one billion
        <br />
        dollars.
      </div>
    </div>
  );
};

export default S6;
