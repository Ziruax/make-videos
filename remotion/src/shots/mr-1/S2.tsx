import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { MR, Tactile, ignition, sine } from '../../lib/tactile';
import { focusHunt } from '../../lib/engine';
import { VO } from './vo.gen';
import { SceneWords } from './words';

// S2 — THE PRACTICE (dark, teal night): enter from the pupil with a focus hunt;
// the pendant lamp is ALREADY swinging, ignites with the FIXED stepped sequence;
// the beam follows the pendant; the battery charges bottom->top, and during the
// doubt line the fourth cell flickers, hesitates, then completes. Exit: recede
// and blur together to 0.72.
export const compositionConfig = {
  id: 'Mr1S2',
  durationInSeconds: 8.2667,
  durationInFrames: 124,
  fps: 15,
  width: 1080,
  height: 1920,
};

const S2: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  void fps;

  // focus hunt on arrival (seconds -> frames at 15fps)
  const fh = focusHunt(f, [
    { f: 0, blur: 12 },
    { f: 22, blur: 12 },
    { f: 26, blur: 3 },
    { f: 29, blur: 7 },
    { f: 35, blur: 0 },
  ]);

  // the pendant: pivot above frame, sine 3.5deg @ 4.8s period — already swinging
  const swing = sine(f, 3.5, 1 / 4.8, 0.9);
  const lit = ignition(f, 21); // stepped, ~1.4s in
  const PIVOT = { x: 540, y: -80 };

  // the battery: five cells, bottom -> top. During the doubt (L4 ~f73-115 local)
  // the fourth cell flickers on a FIXED step pattern and the fill hesitates.
  const cellFill = (i: number): { fill: number; flicker: number } => {
    const t0 = 40 + i * 15; // nominal
    let filled = Math.max(0, Math.min(1, (f - t0) / 12));
    if (i === 3) {
      // the doubt: hold at ~0.35 through the doubt window, flickering, then finish
      if (f >= 73 && f < 102) {
        filled = 0.35;
        const step = [1, 0.25, 0.8, 0.1, 0.6][Math.floor((f - 73) / 4) % 5];
        return { fill: filled * step, flicker: step };
      }
      if (f >= 102) filled = Math.max(0.35, Math.min(1, (f - 102) / 10));
    }
    return { fill: filled, flicker: 1 };
  };

  // EXIT: recede and blur TOGETHER (accelerating shrink to 0.72, nothing clips —
  // the night background is continuous beneath)
  const exitT = f >= 114 ? Math.pow((f - 114) / 10, 1.7) : 0;
  const exitScale = 1 - 0.28 * exitT;
  const exitBlur = exitT * 7;

  return (
    <AbsoluteFill style={{ background: MR.teal }}>
      <Tactile paperFile="projects/mr-1-attention/paper-tile.png" grainFile="library/textures/grain.jpg">
        {/* continuous night beneath (never clips) */}
        <AbsoluteFill style={{ background: `rgb(16,30,37)`, filter: `brightness(${1 + lit * 0.05})` }} />
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse 80% 45% at 50% 18%, rgba(232,197,89,0.10) 0%, transparent 70%)' }} />

        <div
          style={{
            position: 'absolute', inset: 0,
            transform: `scale(${exitScale})`,
            transformOrigin: '50% 46%',
            filter: `blur(${fh + exitBlur}px)`,
          }}
        >
          {/* THE PENDANT LAMP — swinging, ignition-stepped */}
          <div
            style={{
              position: 'absolute', left: PIVOT.x - 160, top: PIVOT.y,
              width: 320, transformOrigin: '50% 0%',
              transform: `rotate(${swing}deg)`,
            }}
          >
            <div style={{ width: 6, height: 250, margin: '0 auto', background: MR.ink }} />
            <div style={{ position: 'relative', width: 320, height: 300, filter: `brightness(${0.55 + lit * 0.5})` }}>
              <Img src={staticFile('projects/mr-1-attention/lamp.png')} style={{ width: '100%', display: 'block' }} />
            </div>
            {/* the beam follows the pendant (~352px opening) */}
            <div
              style={{
                position: 'absolute', left: 50, top: 300, width: 220, height: 900,
                background: `linear-gradient(180deg, rgba(241,237,228,${0.34 * lit}) 0%, rgba(241,237,228,${0.10 * lit}) 55%, transparent 92%)`,
                clipPath: 'polygon(22% 0, 78% 0, 100% 100%, 0 100%)',
                filter: 'blur(2px)',
                mixBlendMode: 'screen',
              }}
            />
          </div>

          {/* THE BATTERY — 240x470, five cells, bottom->top */}
          <div style={{ position: 'absolute', left: 540 - 120, top: 900 }}>
            <Battery fill={cellFill} />
          </div>

          {/* peripheral glyphs at CSS Z positions (depth without a 3D set) */}
          <div style={{ position: 'absolute', inset: 0, perspective: 1400 }}>
            {[
              { x: 130, y: 620, z: -550, b: 5, k: 'bell' },
              { x: 920, y: 560, z: -420, b: 6, k: 'chat' },
              { x: 160, y: 1500, z: -360, b: 6, k: 'heart' },
              { x: 950, y: 1460, z: -500, b: 5, k: 'camera' },
            ].map((p, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute', left: p.x, top: p.y,
                  transform: `translate(-50%, -50%) translateZ(${p.z}px) translateY(${sine(f, 9, 0.13, i * 1.7)}px)`,
                  filter: `blur(${p.b}px)`, opacity: 0.5,
                }}
              >
                <PeripheralGlyph kind={p.k} />
              </div>
            ))}
          </div>

          {/* the words (VO only) — above the battery, above the edge blur */}
          <div style={{ position: 'absolute', left: 80, right: 80, top: 560, display: 'flex', justifyContent: 'center' }}>
            <SceneWords lines={VO.filter((l) => l.start >= 6.9 && l.start < 15.2)} offsetSec={6.9333} />
          </div>
        </div>
      </Tactile>
    </AbsoluteFill>
  );
};

// the battery (drawn): ivory outline, cells filling bottom -> top
const Battery: React.FC<{ fill: (i: number) => { fill: number; flicker: number } }> = ({ fill }) => {
  const W = 240;
  const H = 470;
  const cells = 5;
  const cellH = (H - 26) / cells;
  return (
    <svg width={W} height={H + 40} viewBox={`0 0 ${W} ${H + 40}`}>
      {/* cap */}
      <rect x={W / 2 - 34} y={0} width={68} height={18} rx={6} fill="none" stroke={MR.ivory} strokeWidth={6} />
      {/* body */}
      <rect x={0} y={26} width={W} height={H} rx={18} fill="rgba(8,15,22,0.35)" stroke={MR.ivory} strokeWidth={6} />
      {/* cells bottom -> top */}
      {Array.from({ length: cells }, (_, i) => {
        const st = fill(i);
        const y = 26 + H - 14 - (i + 1) * cellH + i * 0;
        const cy = 26 + H - 14 - (i + 1) * cellH + 6;
        const ch = cellH - 8;
        return (
          <g key={i}>
            <rect x={14} y={cy} width={W - 28} height={ch} rx={10} fill="rgba(241,237,228,0.07)" stroke="rgba(241,237,228,0.25)" strokeWidth={2} />
            {st.fill > 0.01 && (
              <rect
                x={14} y={cy + ch * (1 - st.fill)} width={W - 28} height={ch * st.fill} rx={10}
                fill={st.flicker < 0.5 ? 'rgba(241,237,228,0.35)' : MR.ivory}
                opacity={0.65 + 0.35 * st.flicker}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
};

// small peripheral glyphs (night = ivory lines)
const PeripheralGlyph: React.FC<{ kind: string }> = ({ kind }) => {
  const st = { stroke: MR.ivory, strokeWidth: 4, fill: 'none', strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
  const sh = (d: string) => <path d={d} {...st} />;
  return (
    <svg width={54} height={54} viewBox="0 0 72 72">
      {kind === 'bell' && sh('M 22 44 Q 22 20 36 20 Q 50 20 50 44 L 54 52 L 18 52 Z M 31 56 Q 36 64 41 56')}
      {kind === 'chat' && sh('M 14 20 L 58 20 Q 62 20 62 26 L 62 42 Q 62 48 56 48 L 32 48 L 20 58 L 22 48 Q 14 48 14 42 Z')}
      {kind === 'heart' && sh('M 36 56 Q 12 40 16 26 Q 20 14 32 20 Q 36 24 36 28 Q 36 24 40 20 Q 52 14 56 26 Q 60 40 36 56 Z')}
      {kind === 'camera' && (
        <>
          <rect x="14" y="24" width="44" height="32" rx="6" {...st} />
          <circle cx="36" cy="40" r="9" {...st} />
        </>
      )}
    </svg>
  );
};

export default S2;
