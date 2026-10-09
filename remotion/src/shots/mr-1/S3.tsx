import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { MR, PaperTag, Tactile, WaterSplit, WaveSurface, waveYAt, sine } from '../../lib/tactile';
import { VO } from './vo.gen';
import { SceneWords } from './words';

// S3 — THE REVEAL (same night, continuous): the iceberg arrives at 1.18 + blurred
// and settles to 1.0 (scale and blur move together, one camera move); the water
// boundary splits above from submerged (the submerged copy darker + its own
// underwater paper); the buoy rides the local wave; the claim lands as a gold
// PaperTag with its folded corner retained. Ends settled on the revealed truth.
export const compositionConfig = {
  id: 'Mr1S3',
  durationInSeconds: 6.9333,
  durationInFrames: 104,
  fps: 15,
  width: 1080,
  height: 1920,
};

const WAVE = { centerY: 1130, amp: 23, wavelength: 640, cps: 0.5 };
const BERG = { x: 540, y: 780, w: 660 };
const BUOY = { x: 856 };

const S3: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  void fps;

  // arrive slightly enlarged + blurred; settle over ~9 frames (0.6s)
  const settle = Math.min(1, f / 9);
  const bergScale = 1.18 - 0.18 * settle;
  const bergBlur = 6 * (1 - settle);

  // the final hold breathes: slow 1.0 -> 1.03 push
  const endPush = f > 84 ? 1 + 0.03 * ((f - 84) / 20) : 1;

  // buoy: follows the LOCAL wave height + its own bob + rock
  const buoyY = waveYAt(BUOY.x, f, WAVE) + sine(f, 12, 0.43, 1.1) - 6;
  const buoyRock = sine(f, 4, 0.37, 0.4);

  return (
    <AbsoluteFill style={{ background: 'rgb(16,30,37)' }}>
      <Tactile paperFile="projects/mr-1-attention/paper-tile.png" grainFile="library/textures/grain.jpg">
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse 85% 50% at 50% 20%, rgba(82,124,128,0.16) 0%, transparent 70%)' }} />

        <div style={{ position: 'absolute', inset: 0, transform: `scale(${endPush})`, transformOrigin: '50% 55%' }}>
          {/* THE ICEBERG — arrives enlarged + blurred, settles (one move) */}
          <WaterSplit
            cfg={WAVE}
            belowStyle={{ filter: 'brightness(0.52) saturate(0.75)' }}
            aboveStyle={{}}
          >
            <div
              style={{
                position: 'absolute', left: BERG.x - BERG.w / 2, top: BERG.y,
                width: BERG.w,
                transform: `scale(${bergScale})`,
                transformOrigin: '50% 70%',
                filter: `blur(${bergBlur}px) drop-shadow(0 18px 30px rgba(8,15,22,0.4))`,
              }}
            >
              <Img
                src={staticFile('projects/mr-1-attention/iceberg.png')}
                style={{ width: '100%', display: 'block', filter: 'saturate(0.85) contrast(1.05)' }}
              />
            </div>
          </WaterSplit>

          {/* the underwater copy's own paper texture (object-bound, under the waterline) */}
          <WaterSplit cfg={WAVE} aboveStyle={{ opacity: 0 }}>
            <div style={{ position: 'absolute', inset: 0, opacity: 0.13, mixBlendMode: 'multiply' }}>
              <Img src={staticFile('projects/mr-1-attention/paper-tile.png')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </WaterSplit>

          {/* THE WATER — one boundary, living */}
          <WaveSurface cfg={WAVE} fill="rgba(11,25,32,0.92)" />
          <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }} viewBox="0 0 1080 1920">
            {Array.from({ length: 136 }, (_, i) => {
              const x = i * 8;
              const y = waveYAt(x, f, WAVE);
              return <line key={i} x1={x} y1={y} x2={x + 4} y2={y} stroke={MR.ivory} strokeWidth={2} opacity={0.5} />;
            })}
          </svg>

          {/* THE BUOY — riding the local wave, its own bob + rock */}
          <div
            style={{
              position: 'absolute', left: BUOY.x, top: buoyY,
              transform: `translate(-50%, -50%) rotate(${buoyRock}deg)`,
            }}
          >
            <svg width={110} height={130} viewBox="0 0 110 130">
              <path d="M 12 78 L 98 78 L 84 108 Q 55 118 26 108 Z" fill={MR.ivory} />
              <rect x={47} y={18} width={10} height={62} fill={MR.mutedTeal} />
              <circle cx={52} cy={16} r={10} fill={MR.gold} />
              <path d="M 4 84 Q 14 80 22 84" stroke={MR.ivory} strokeWidth={4} fill="none" />
            </svg>
          </div>

          {/* the drawn annotation under the waterline (lands on the final words) */}
          <div style={{ position: 'absolute', left: 0, right: 0, top: 1150, opacity: Math.min(1, Math.max(0, (f - 46) / 12)) }}>
            <svg width={1080} height={620} style={{ position: 'absolute', inset: 0 }} viewBox="0 0 1080 620">
              <path
                d="M 200 30 L 200 560"
                stroke={MR.ivory}
                strokeWidth={2.4}
                strokeDasharray="7 9"
                opacity={0.55}
              />
              <path d="M 160 30 L 240 30 M 160 560 L 240 560" stroke={MR.ivory} strokeWidth={2.4} opacity={0.55} />
            </svg>
            <div
              style={{
                position: 'absolute', left: 250, top: 470,
                fontFamily: 'JetBrains Mono, monospace', fontSize: 26, letterSpacing: 3,
                color: 'rgba(241,237,228,0.8)',
              }}
            >
              the unseen nine-tenths
            </div>
          </div>

          {/* THE CLAIM — a flapping gold PaperTag, folded corner retained */}
          {f > 20 && (
            <PaperTag
              x={150}
              y={390}
              rotate={-3}
              width={620}
              height={150}
              foldProgress={Math.min(1, (f - 20) / 13)}
              flutterStrength={1}
            >
              <span style={{ fontFamily: 'Spectral, serif', fontSize: 52, color: MR.ink, letterSpacing: 0.5 }}>
                more beneath the surface
              </span>
            </PaperTag>
          )}
          {/* the lead-in words OUTSIDE the tag (the claim line's first words) */}
          {f > 20 && (
            <div
              style={{
                position: 'absolute', left: 150, top: 330,
                fontFamily: 'Spectral, serif', fontSize: 40, color: MR.ivory, opacity: 0.85,
              }}
            >
              There is
            </div>
          )}

          {/* the words (VO only), above the edge blur, low enough to clear the berg */}
          <div style={{ position: 'absolute', left: 80, right: 80, top: 1650, display: 'flex', justifyContent: 'center' }}>
            <SceneWords lines={VO.filter((l) => l.start >= 15.2)} offsetSec={15.2} />
          </div>
        </div>
      </Tactile>
    </AbsoluteFill>
  );
};

export default S3;
