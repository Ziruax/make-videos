import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { ContourLines, MR, Tactile, sine } from '../../lib/tactile';
import { TornBits } from '../../lib/fusion';
import { VO } from './vo.gen';
import { SceneWords } from './words';
import { FONT_SERIF } from '../../fonts';

// S1 — THE CLAIM (light, ivory): the overload and the lock. Nine torn scraps drift
// (cut-paper guest: the noise); one small "1%" scrap sits nearly lost among them. On
// "One percent better" the gold ring LOCKS it, everything else dims and stills.
// Exit: push INTO the locked scrap (the portal).
export const compositionConfig = {
  id: 'Os1S1',
  durationInSeconds: 7.2,
  durationInFrames: 108,
  fps: 15,
  width: 1080,
  height: 1920,
};

// the noise scraps (deterministic, scattered, keeping a clear radius around the scrap)
const BITS: { x: number; y: number; w: number; h: number }[] = [
  { x: 170, y: 420, w: 130, h: 95 },
  { x: 890, y: 380, w: 150, h: 105 },
  { x: 860, y: 780, w: 120, h: 88 },
  { x: 740, y: 1260, w: 140, h: 100 },
  { x: 250, y: 1300, w: 115, h: 85 },
  { x: 150, y: 960, w: 125, h: 92 },
  { x: 660, y: 500, w: 110, h: 80 },
  { x: 400, y: 380, w: 100, h: 75 },
  { x: 880, y: 1080, w: 115, h: 85 },
];

const SCRAP = { x: 540, y: 900, w: 168, h: 122 }; // THE one-percent scrap
const LOCK_AT = 55;   // "One percent better" — 3.70s global = f55 local
const PORTAL_AT = 96; // 6.4s global — after "day" (ends 6.20)

const S1: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  void fps;

  // camera: a slow settle toward the scrap over the first ~24f (scale + translate,
  // SAME interval — the host's travel move)
  const approach = Math.min(1, f / 24);
  const camScale = 0.94 + 0.06 * approach;
  const camY = -50 * (1 - approach);

  // the lock ring: springs in on the choice line
  const lock = interpolate(f, [LOCK_AT, LOCK_AT + 8], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.bezier(0.34, 1.56, 0.64, 1),
  });
  const dim = interpolate(f, [LOCK_AT, LOCK_AT + 10], [1, 0.28], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // EXIT: push into the locked scrap — the world scales around it until ink fills
  const portal = f >= PORTAL_AT ? Math.pow((f - PORTAL_AT) / 12, 1.6) : 0;
  const portalScale = 1 + portal * 26;

  return (
    <AbsoluteFill style={{ background: MR.ivory }}>
      <Tactile paperFile="projects/os-1-one-percent/paper-tile.png" grainFile="library/textures/grain.jpg">
        <div
          style={{
            position: 'absolute', inset: 0,
            transform: `translateY(${camY}px) scale(${camScale}) scale(${portalScale})`,
            transformOrigin: `${SCRAP.x}px ${SCRAP.y}px`,
            filter: portal > 0 ? `blur(${portal * 3}px)` : undefined,
          }}
        >
          <ContourLines opacity={0.26} />

          {/* the noise scraps — drifting until the lock, then dim and still */}
          <div style={{ position: 'absolute', inset: 0, opacity: dim }}>
            <TornBits bits={BITS} settleF={LOCK_AT} />
          </div>

          {/* THE one-percent scrap — nearly lost among the noise until the lock */}
          <div
            style={{
              position: 'absolute', left: SCRAP.x, top: SCRAP.y,
              width: SCRAP.w, height: SCRAP.h,
              transform: `translate(-50%, -50%) rotate(${sine(f, 8, 0.42, 3) - 4}deg) translateY(${sine(f, 4, 0.6, 9)}px)`,
              filter: 'drop-shadow(0 16px 26px rgba(8,15,22,0.30))',
            }}
          >
            <svg width={SCRAP.w} height={SCRAP.h} viewBox={`0 0 ${SCRAP.w} ${SCRAP.h}`}>
              <polygon
                points={tornScrapPts(SCRAP.w, SCRAP.h)}
                fill={MR.teal}
                stroke={MR.ivory}
                strokeWidth={2}
              />
            </svg>
            <div
              style={{
                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: FONT_SERIF, fontWeight: 600, fontSize: 66, color: MR.ivory, letterSpacing: -1,
              }}
            >
              1%
            </div>
          </div>

          {/* the gold lock ring — the single accent, the choice; it pulses softly */}
          {lock > 0 && (
            <div
              style={{
                position: 'absolute', left: SCRAP.x, top: SCRAP.y,
                width: 236, height: 200,
                transform: `translate(-50%, -50%) scale(${lock * (1 + 0.03 * Math.sin(f / 2.2))})`,
              }}
            >
              <svg width={236} height={200} viewBox="0 0 236 200">
                <rect
                  x="8" y="8" width="220" height="184" rx="100"
                  fill="none" stroke={MR.gold} strokeWidth={5}
                  strokeDasharray="640" strokeDashoffset={640 * (1 - lock)}
                />
              </svg>
            </div>
          )}

          {/* the words (VO only) — above the peripheral blur */}
          <div style={{ position: 'absolute', left: 80, right: 80, top: 1480, display: 'flex', justifyContent: 'center' }}>
            <SceneWords lines={VO.filter((l) => l.start < 7.2)} offsetSec={0} light />
          </div>
        </div>
      </Tactile>
    </AbsoluteFill>
  );
};

// jagged torn rectangle for the hero scrap (deterministic)
const tornScrapPts = (w: number, h: number) => {
  const j = (seed: number) => (Math.sin(seed * 12.9898) * 43758.5453 % 1) * 8 - 4;
  const pts: string[] = [];
  const nx = 6, ny = 4;
  for (let k = 0; k <= nx; k++) pts.push(`${(k / nx) * w + j(k + 1)},${j(k + 20) + 3}`);
  for (let k = 1; k <= ny; k++) pts.push(`${w + j(k + 40) - 3},${(k / ny) * h + j(k + 60)}`);
  for (let k = nx - 1; k >= 0; k--) pts.push(`${(k / nx) * w + j(k + 80)},${h + j(k + 100) - 3}`);
  for (let k = ny - 1; k >= 1; k--) pts.push(`${j(k + 120) + 3},${(k / ny) * h + j(k + 140)}`);
  return pts.join(' ');
};

export default S1;
