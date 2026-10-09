import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { boil, focusHunt, grade, posterizeFrame } from '../../lib/engine';
import { FilmLook } from '../../lib/filmlook';
import { prog } from '../../lib/shorts';
import { FONT_SERIF, FONT_DISPLAY } from '../../fonts';

// S5 — THE PAYOFF (drawn light): a dark room, the banker lamp, and the light is
// DRAWN — four radial gradients stacked on screen blend + a blurred funnel beam,
// ALL parented to the lamp and swaying +-3deg with it. When the camera defocuses,
// the core blooms. A yellow pencil oval scribbles on around the key word.
export const compositionConfig = {
  id: 'Mg1S5',
  durationInSeconds: 5.2,
  fps: 30,
  width: 1080,
  height: 1920,
};

const S5: React.FC = () => {
  const raw = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = posterizeFrame(raw, fps, 12);

  // vintage focus-hunt camera: wide + defocused -> snap in -> dip out -> creep
  const fh = focusHunt(f, [
    { f: 0, blur: 16 },
    { f: 20, blur: 0 },
    { f: 52, blur: 4 },
    { f: 66, blur: 0 },
  ]);
  const cam = 1.04 + 0.04 * prog(f, 66, 150);

  // the lamp sways +-3deg; the light is parented to it
  const sway = 3 * Math.sin((f / 46) * Math.PI * 2);
  // the defocus blooms the core ~2.4x into bokeh
  const bloom = 1 + 1.4 * Math.min(fh / 16, 1);

  // the pencil scribble draws on around BANKRUPTCY
  const scribble = prog(f, 84, 112);

  return (
    <AbsoluteFill style={{ background: '#050608' }}>
      <FilmLook
        grainFile="library/textures/grain.jpg"
        grungeFile="library/textures/grunge.jpg"
        stepFps={12}
        saturate={0.62}
        sepia={0.26}
        brightness={0.92}
      >
        <AbsoluteFill style={{ transform: `scale(${cam})`, filter: `blur(${fh}px) ${grade(0.62, 1.05, 0.26, 0.92)}` }}>
          {/* the dim room */}
          <Img
            src={staticFile('projects/mg-1-kodak/wall.png')}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', filter: 'brightness(0.22) saturate(0.3)' }}
          />
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 620, background: 'linear-gradient(180deg, transparent, #0b0a09 60%)' }} />

          {/* THE LAMP (right side) — everything below is parented to its swing */}
          <div style={{ position: 'absolute', right: 60, top: 330, width: 400, transformOrigin: '60% 80%', transform: `rotate(${sway}deg)` }}>
            <Img
              src={staticFile('projects/mg-1-kodak/lamp.png')}
              style={{ display: 'block', width: '100%', filter: 'brightness(0.85) drop-shadow(0 20px 40px rgba(0,0,0,0.8))' }}
            />
            {/* THE DRAWN LIGHT — 4 stacked radial gradients, screen blend */}
            <div style={{ position: 'absolute', left: -420, top: 60, width: 900, height: 1250, pointerEvents: 'none', mixBlendMode: 'screen' }}>
              {/* white-hot core */}
              <div style={{ position: 'absolute', left: 210, top: 30, width: 420 * bloom, height: 380 * bloom, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,250,235,0.95) 0%, rgba(255,244,214,0.55) 34%, transparent 70%)', transform: 'translate(-50%, 0)' }} />
              {/* warm bloom halo */}
              <div style={{ position: 'absolute', left: 210, top: 30, width: 760, height: 1050, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(255,226,160,0.34) 0%, transparent 62%)', transform: 'translate(-50%, 0)' }} />
              {/* shade-mouth glow */}
              <div style={{ position: 'absolute', left: 130, top: 130, width: 300, height: 160, background: 'radial-gradient(ellipse, rgba(255,255,255,0.8) 0%, transparent 70%)', filter: 'blur(18px)' }} />
              {/* ambient spill */}
              <div style={{ position: 'absolute', left: -260, top: 0, width: 1280, height: 1300, background: 'radial-gradient(ellipse at 55% 20%, rgba(232,197,89,0.16) 0%, transparent 60%)' }} />
              {/* the blurred funnel beam behind the pool */}
              <div style={{ position: 'absolute', left: 60, top: 120, width: 540, height: 980, background: 'linear-gradient(178deg, rgba(255,244,214,0.30) 0%, rgba(255,244,214,0.10) 40%, transparent 78%)', clipPath: 'polygon(34% 0, 66% 0, 100% 100%, 0 100%)', filter: 'blur(14px)' }} />
            </div>
          </div>

          {/* the desk surface */}
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 170, height: 14, background: 'linear-gradient(90deg, transparent, rgba(232,197,89,0.25), transparent)' }} />

          {/* THE WORD in the light pool + the pencil scribble around it */}
          <div style={{ position: 'absolute', left: 320, top: 740, opacity: prog(f, 30, 52) }}>
            <svg width={760} height={330} viewBox="0 0 760 330" style={{ position: 'absolute', left: -30, top: -30 }}>
              <path
                d="M 60 160 C 90 40, 640 30, 700 130 C 740 220, 560 300, 360 292 C 160 284, 40 250, 60 160 Z"
                fill="none"
                stroke="#e8c559"
                strokeWidth={7}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - scribble}
                transform="rotate(-4 380 165)"
                opacity={0.9}
              />
              {/* a second hand-drawn pass, slightly offset (a real scribble is two passes) */}
              <path
                d="M 75 170 C 110 60, 630 50, 688 140 C 720 225, 545 305, 355 297 C 170 290, 55 255, 75 170 Z"
                fill="none"
                stroke="#e8c559"
                strokeWidth={4}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - Math.max(0, scribble - 0.25) / 0.75}
                transform="rotate(-4 380 165)"
                opacity={0.55}
              />
            </svg>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 108, color: '#f8f2df', textShadow: '0 6px 40px rgba(232,197,89,0.35)', lineHeight: 1.0 }}>
              BANK-<br />RUPTCY
            </div>
            <div style={{ fontFamily: FONT_SERIF, fontSize: 34, letterSpacing: 8, color: 'rgba(243,234,211,0.85)', marginTop: 18 }}>
              JANUARY 2012
            </div>
          </div>
        </AbsoluteFill>
      </FilmLook>
    </AbsoluteFill>
  );
};

export default S5;
