import React from 'react';
import { AbsoluteFill, Easing, Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { blurBurst, boil, posterizeFrame } from '../../lib/engine';
import { FilmLook } from '../../lib/filmlook';
import { EASE_OUT, prog } from '../../lib/shorts';
import { FONT_SERIF } from '../../fonts';

// S1 — THE OPENER (museum frame): slow push, then the zoom-through: the wall
// accelerates to ~6.8x while the photo WELDS to the frame, then DETACH — the frame
// flies past the edges and the photo settles full-frame, B&W -> colour.
export const compositionConfig = {
  id: 'Mg1S1',
  durationInSeconds: 5.6,
  fps: 30,
  width: 1080,
  height: 1920,
};

const S1: React.FC = () => {
  const raw = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = posterizeFrame(raw, fps, 12);

  // phases: push (0-1.6s) -> zoom-through (1.6-3.2) -> detach + settle (3.2-5.6)
  const push = EASE_OUT(prog(f, 0, 48));
  const zoom = prog(f, 48, 96); // linear acceleration reads as the punch
  const detach = prog(f, 96, 118);
  const settle = EASE_OUT(prog(f, 100, 145));

  // the WALL scales: 1.0 -> 1.16 (push) -> 6.8 (zoom-through), then it's gone
  const wallScale = 1 + 0.16 * push + 5.64 * zoom * zoom;
  // the PHOTO frame welds: content scale = 0.369 x wall scale (never eases apart)
  const weldK = 0.369;
  const frameScale = wallScale * (1 - 0.62 * detach);
  const photoContent = wallScale * weldK * (1 + 1.3 * detach);

  // after detach the photo IS the scene: settles 0.75 -> 1.0
  const fullPhotoScale = 0.75 + 0.25 * settle;
  const bw = 1 - settle; // B&W -> colour crossfade
  const frameOp = 1 - detach;
  const burst = blurBurst(f, 48, 72, 96, 9);

  return (
    <AbsoluteFill style={{ background: '#101014' }}>
      <FilmLook
        grainFile="library/textures/grain.jpg"
        grungeFile="library/textures/grunge.jpg"
        stepFps={12}
        saturate={0.78}
        sepia={0.22}
      >
        <AbsoluteFill>
          <Img
            src={staticFile('projects/mg-1-kodak/wall.png')}
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              transform: `scale(${wallScale})`,
              opacity: Math.min(1, 1.35 - detach * 1.4),
              filter: 'brightness(0.96)',
            }}
          />
          {/* the framed photo, welded through the zoom */}
          <div
            style={{
              position: 'absolute', left: '50%', top: '42%',
              transform: `translate(-50%, -50%) scale(${frameScale})`,
              opacity: frameOp,
              boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ padding: 26, background: '#efe7d2', border: '3px solid #8a744f' }}>
              <Img
                src={staticFile('projects/mg-1-kodak/photo1975.png')}
                style={{
                  display: 'block', width: 560, height: 320, objectFit: 'cover',
                  filter: `grayscale(${bw}) contrast(1.05)`,
                }}
              />
            </div>
            <div
              style={{
                marginTop: 14, textAlign: 'center',
                fontFamily: FONT_SERIF, fontSize: 30, letterSpacing: 3, color: '#efe7d2',
                textShadow: '0 2px 12px rgba(0,0,0,0.7)',
              }}
            >
              1975
            </div>
          </div>
        </AbsoluteFill>

        {/* THE PHOTO becomes the scene (detach) */}
        {detach > 0.01 && (
          <AbsoluteFill
            style={{
              opacity: detach,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Img
              src={staticFile('projects/mg-1-kodak/photo1975.png')}
              style={{
                width: '100%', height: '62%', objectFit: 'cover',
                transform: `scale(${fullPhotoScale}) translateY(${boil(f, 9, 2, 3)}px)`,
                filter: `grayscale(${bw}) contrast(1.1) blur(${burst * 0.6}px)`,
                boxShadow: '0 40px 120px rgba(0,0,0,0.75)',
              }}
            />
          </AbsoluteFill>
        )}

        {/* on-screen words (pulled from the line) */}
        <div
          style={{
            position: 'absolute', bottom: 340, left: 60, right: 60, textAlign: 'center',
            opacity: prog(f, 110, 130),
            fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: 44, color: '#f3ead3',
            textShadow: '0 3px 18px rgba(0,0,0,0.85)',
          }}
        >
          the first digital camera
        </div>
        <div
          style={{
            position: 'absolute', bottom: 270, left: 60, right: 60, textAlign: 'center',
            opacity: prog(f, 116, 136),
            fontFamily: FONT_SERIF, fontSize: 30, letterSpacing: 4, color: 'rgba(243,234,211,0.8)',
          }}
        >
          0.01 MEGAPIXELS
        </div>
      </FilmLook>
    </AbsoluteFill>
  );
};

export default S1;
