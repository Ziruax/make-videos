import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { boil, posterizeFrame, softSpring } from '../../lib/engine';
import { FilmLook } from '../../lib/filmlook';
import { focusHunt, grade } from '../../lib/engine';
import { prog } from '../../lib/shorts';
import { FONT_SERIF, FONT_DISPLAY } from '../../fonts';

// S3 — THE LIST (papers drop): focus-hunt opener, then three headline clippings
// drop one at a time — left / right / bottom entrances, ~-26deg settling to ~-7deg,
// softSpring, 1.1 -> 1.0, stop-motion boil.
export const compositionConfig = {
  id: 'Mg1S3',
  durationInSeconds: 5.2,
  fps: 30,
  width: 1080,
  height: 1920,
};

const PAPERS = [
  { head: 'FILM', sub: 'the consumable', x: 190, y: 560, rot: -26, side: 'left', at: 10 },
  { head: 'PAPER + CHEMICALS', sub: 'the process', x: 890, y: 860, rot: 22, side: 'right', at: 34 },
  { head: 'PATENTS', sub: 'the moat', x: 540, y: 1220, rot: -14, side: 'bottom', at: 58 },
];

const S3: React.FC = () => {
  const raw = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = posterizeFrame(raw, fps, 12);

  // focus-hunt opener: wide + defocused -> clearing over ~14f
  const fh = focusHunt(f, [
    { f: 0, blur: 14 },
    { f: 14, blur: 0 },
    { f: 34, blur: 2.5 },
    { f: 46, blur: 0 },
  ]);

  return (
    <AbsoluteFill style={{ background: '#14110b' }}>
      <FilmLook
        grainFile="library/textures/grain.jpg"
        grungeFile="library/textures/grunge.jpg"
        stepFps={12}
        saturate={0.74}
        sepia={0.3}
      >
        <AbsoluteFill style={{ filter: `blur(${fh}px) ${grade(0.74, 1.06, 0.3, 0.98)}` }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 95% 65% at 50% 30%, #2a2312 0%, #14110b 78%)' }} />

          {/* the dropped clippings */}
          {PAPERS.map((p, i) => {
            const drop = prog(f, p.at, p.at + 22);
            if (drop <= 0.01) return null;
            const sp = softSpring(Math.max(0, f - p.at));
            const fromX = p.side === 'left' ? -520 : p.side === 'right' ? 520 : 0;
            const fromY = p.side === 'bottom' ? 560 : -80;
            const rot = p.rot + (1 - sp) * -18;
            const jx = boil(f, 90 + i * 11, 2.5, 3);
            const jy = boil(f, 120 + i * 9, 2.5, 3);
            return (
              <div
                key={i}
                style={{
                  position: 'absolute', left: p.x, top: p.y,
                  transform: `translate(-50%, -50%) translate(${fromX * (1 - sp) + jx}px, ${fromY * (1 - sp) + jy}px) rotate(${rot}deg) scale(${1.1 - 0.1 * sp})`,
                  width: 560, padding: '34px 38px',
                  background: 'linear-gradient(160deg, #efe7d2 0%, #d9cfae 100%)',
                  boxShadow: '0 24px 60px rgba(0,0,0,0.55)',
                  opacity: Math.min(1, drop * 1.6),
                }}
              >
                <div style={{ fontFamily: FONT_SERIF, fontSize: 20, letterSpacing: 6, color: '#7a6d4e', borderBottom: '2px solid #c5b98e', paddingBottom: 8 }}>
                  EASTMAN KODAK — THE FILM YEARS
                </div>
                <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 58, color: '#26200f', marginTop: 14, lineHeight: 1.02 }}>
                  {p.head}
                </div>
                <div style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: 28, color: '#6a5c3a', marginTop: 10 }}>
                  {p.sub}
                </div>
              </div>
            );
          })}

          {/* the line's own words, stacked left-aligned with shared edges */}
          <div style={{ position: 'absolute', left: 84, bottom: 300, opacity: prog(f, 70, 90) }}>
            <div style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: 52, color: '#f3ead3', textShadow: '0 3px 16px rgba(0,0,0,0.8)', lineHeight: 1.25 }}>
              film printed money.
            </div>
            <div style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: 34, color: 'rgba(243,234,211,0.75)', marginTop: 14 }}>
              why kill the machine that prints it?
            </div>
          </div>
        </AbsoluteFill>
      </FilmLook>
    </AbsoluteFill>
  );
};

export default S3;
