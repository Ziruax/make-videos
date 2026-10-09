import React from 'react';
import { AbsoluteFill, Easing, Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { boil, posterizeFrame } from '../../lib/engine';
import { FilmLook } from '../../lib/filmlook';
import { EASE_INOUT, prog } from '../../lib/shorts';
import { FONT_SERIF } from '../../fonts';

// S4 — THE FALL (parallax punch): the street pushes 1.0 -> 1.12 while the phone
// punches to ~1.7 ANCHORED AT ITS BASE — the phone growing faster than the wall IS
// the illusion. The shadow is the phone flipped down from its base, skewed, blurred.
// The line's words stack one every ~6f.
export const compositionConfig = {
  id: 'Mg1S4',
  durationInSeconds: 5.2,
  fps: 30,
  width: 1080,
  height: 1920,
};

const WORDS = ['every', 'phone', 'became', 'a camera'];

// S6 clones this scene (reskinned) — keep the mechanics in one exportable place.
export const ParallaxPunch: React.FC<{
  words: string[];
  accentLast?: boolean;
  endFlash?: boolean;
}> = ({ words, accentLast = true, endFlash = false }) => {
  const raw = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = posterizeFrame(raw, fps, 12);

  const bgPush = 1 + 0.12 * EASE_INOUT(prog(f, 10, 140));
  const heroPunch = 1 + 0.7 * EASE_INOUT(prog(f, 16, 132));
  const enterY = (1 - EASE_INOUT(prog(f, 0, 30))) * 640;

  return (
    <AbsoluteFill style={{ background: '#0c0d12' }}>
      <FilmLook
        grainFile="library/textures/grain.jpg"
        grungeFile="library/textures/grunge.jpg"
        stepFps={12}
        saturate={endFlash ? 0.86 : 0.62}
        sepia={endFlash ? 0.18 : 0.22}
        brightness={endFlash ? 1.02 : 0.9}
      >
        {/* the backdrop pushes (depth) */}
        <Img
          src={staticFile('projects/mg-1-kodak/street.png')}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            transform: `scale(${bgPush}) translateY(${boil(f, 12, 2, 4)}px)`,
            filter: 'brightness(0.9)',
          }}
        />

        {/* THE PHONE — anchored at its base (transform-origin bottom centre) */}
        <div
          style={{
            position: 'absolute', left: 190, top: 610 + enterY, width: 700,
            transform: `scale(${heroPunch})`,
            transformOrigin: '50% 100%',
          }}
        >
          {/* the shadow: the phone itself, flipped down from the base, skewed, blurred */}
          <Img
            src={staticFile('projects/mg-1-kodak/phone.png')}
            style={{
              position: 'absolute', left: 40, top: '100%', width: 'calc(100% - 80px)',
              transform: 'scaleY(-1) skewX(-53deg)',
              filter: 'blur(7px) brightness(0)',
              opacity: 0.55,
            }}
          />
          <Img
            src={staticFile('projects/mg-1-kodak/phone.png')}
            style={{
              display: 'block', width: '100%',
              transform: `rotate(${boil(f, 5, 0.7, 3)}deg)`,
              filter: 'drop-shadow(0 30px 50px rgba(0,0,0,0.6))',
            }}
          />
        </div>

        {/* the stacked words — one every ~6f, shared left edge, equal spacing */}
        <div style={{ position: 'absolute', left: 84, top: 1150 }}>
          {words.map((w, i) => {
            const on = prog(f, 26 + i * 6, 38 + i * 6);
            if (on <= 0.01) return null;
            const isAccent = accentLast && i === words.length - 1;
            return (
              <div
                key={i}
                style={{
                  fontFamily: FONT_SERIF, fontStyle: isAccent ? 'italic' : 'normal',
                  fontSize: isAccent ? 96 : 78,
                  lineHeight: 1.16,
                  letterSpacing: 1,
                  color: isAccent ? '#f5d76e' : '#f3ead3',
                  textShadow: '0 4px 24px rgba(0,0,0,0.9)',
                  transform: `translateY(${(1 - EASE_INOUT(on)) * 26}px) translateX(${boil(f, 44 + i * 3, 1.5, 3)}px)`,
                  opacity: on,
                }}
              >
                {w}
              </div>
            );
          })}
        </div>
      </FilmLook>
    </AbsoluteFill>
  );
};

const S4: React.FC = () => <ParallaxPunch words={WORDS} />;

export default S4;
