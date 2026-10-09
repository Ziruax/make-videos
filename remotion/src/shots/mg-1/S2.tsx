import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { boil, posterizeFrame, softSpring } from '../../lib/engine';
import { FilmLook } from '../../lib/filmlook';
import { EASE_OUT, prog } from '../../lib/shorts';
import { FONT_SERIF, FONT_DISPLAY } from '../../fonts';

// S2 — THE BURIAL: the boss rises (softSpring), the smoke is GLUED to him
// (screen blend), the spec props sit in hand-drawn wireframe diamonds, and the
// money word SHELVED slams in like a slot machine. Ends on the punctuation beat:
// a 2-frame negative flicker, B&W, red eye glows.
export const compositionConfig = {
  id: 'Mg1S2',
  durationInSeconds: 5.2,
  fps: 30,
  width: 1080,
  height: 1920,
};

const SPECS = [
  { label: '8 lb', x: 130, y: 640, at: 24 },
  { label: 'B & W', x: 950, y: 560, at: 30 },
  { label: '23 SEC / SHOT', x: 880, y: 1150, at: 36 },
];

const S2: React.FC = () => {
  const raw = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = posterizeFrame(raw, fps, 12);

  const rise = softSpring(f);
  const punch = 1 + 0.09 * EASE_OUT(prog(f, 20, 44));
  const slotT = prog(f, 84, 96); // the SLAM lands under "Kodak shelved it" (~8.6s global -> 96 local... trimmed to land early)
  const flick = f > 128 && f < 132 ? 1 : 0; // the punctuation beat
  const bw = f > 130 ? 1 : 0;
  const bossY = (1 - rise) * 420;

  // slot-machine: letters spin past then slam. We fake the reel with a y-cycle
  // collapsing on the money word.
  const reelY = (1 - EASE_OUT(slotT)) * 220;

  return (
    <AbsoluteFill style={{ background: '#171216' }}>
      <FilmLook
        grainFile="library/textures/grain.jpg"
        grungeFile="library/textures/grunge.jpg"
        stepFps={12}
        saturate={f > 130 ? 0.05 : 0.8}
        contrast={flick ? 1.6 : 1.08}
        sepia={0.24}
        brightness={flick ? 1.25 : 0.95}
      >
        <AbsoluteFill>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 90% 60% at 50% 38%, #2c2230 0%, #171216 75%)' }} />
        </AbsoluteFill>

        {/* THE SMOKE — screen blend, glued to the boss, boiling */}
        <Img
          src={staticFile('projects/mg-1-kodak/smoke.png')}
          style={{
            position: 'absolute', left: 430, top: 260, width: 560, height: 560,
            mixBlendMode: 'screen', opacity: 0.5,
            transform: `translate(${boil(f, 21, 6, 4)}px, ${-6 * f * 0.4 + boil(f, 33, 4, 5)}px) rotate(${boil(f, 44, 2, 6)}deg) scale(${1 + f * 0.002})`,
            filter: 'contrast(1.45) brightness(1.1)',
          }}
        />

        {/* THE BOSS */}
        <div
          style={{
            position: 'absolute', left: 250, top: 300 + bossY, width: 580,
            transform: `scale(${punch})`,
            transformOrigin: '50% 100%',
            filter: `grayscale(${bw}) drop-shadow(0 24px 40px rgba(0,0,0,0.6))`,
          }}
        >
          <Img src={staticFile('projects/mg-1-kodak/boss.png')} style={{ display: 'block', width: '100%' }} />

        </div>

        {/* the spec props in hand-drawn wireframe diamonds (draw on + boil) */}
        {SPECS.map((s, i) => {
          const draw = prog(f, s.at, s.at + 16);
          if (draw <= 0.01) return null;
          const jx = boil(f, 60 + i * 7, 3, 3);
          const jy = boil(f, 80 + i * 5, 3, 3);
          const r = 168;
          return (
            <div
              key={i}
              style={{
                position: 'absolute', left: s.x, top: s.y,
                transform: `translate(-50%, -50%) translate(${jx}px, ${jy}px) scale(${0.9 + 0.1 * draw})`,
                opacity: draw,
              }}
            >
              <svg width={300} height={200} viewBox="-150 -100 300 200">
                <path
                  d={`M 0 -78 L 138 0 L 0 78 L -138 0 Z`}
                  fill="rgba(23,18,22,0.4)"
                  stroke="#e8c559"
                  strokeWidth={3}
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={1 - draw}
                />
              </svg>
              <div
                style={{
                  position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: FONT_SERIF, fontSize: 40, letterSpacing: 2, color: '#f3ead3',
                  textShadow: '0 2px 12px rgba(0,0,0,0.8)',
                }}
              >
                {s.label}
              </div>
              <div style={{ position: 'absolute', left: 0, top: -34, width: 300, textAlign: 'center' }}>
                <span style={{ fontFamily: FONT_SERIF, fontSize: 26, color: 'rgba(243,234,211,0.7)' }}>{1975 + i * 0}</span>
              </div>
            </div>
          );
        })}

        {/* SLOT-MACHINE TEXT — values spin past then SLAM on the money word */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 1330, textAlign: 'center', overflow: 'hidden' }}>
          <div
            style={{
              display: 'inline-block',
              transform: `translateY(${reelY}px) scale(${0.96 + 0.06 * EASE_OUT(slotT)})`,
              opacity: prog(f, 60, 74),
            }}
          >
            <div style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: 42, color: 'rgba(243,234,211,0.75)' }}>
              Kodak looked at it and
            </div>
            <div
              style={{
                fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 92, letterSpacing: 4,
                color: '#e8c559', textShadow: '0 6px 30px rgba(232,197,89,0.35)',
                transform: `scale(${1.18 - 0.18 * EASE_OUT(slotT)})`,
              }}
            >
              SHELVED IT
            </div>
          </div>
        </div>
      </FilmLook>
    </AbsoluteFill>
  );
};

export default S2;
