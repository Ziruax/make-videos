import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { ContourLines, MR, Tactile, sine } from '../../lib/tactile';
import { VO } from './vo.gen';
import { SceneWords } from './words';

// S1 — THE CLAIM (light, ivory): the scanning eye. A drawn eye whose gaze jumps
// between eight notification glyphs; the vision cone sweeps with the gaze and the
// glyphs it covers warm up. On "Choose one thing" the gaze LOCKS one glyph (gold
// ring) and everything else dims. Exit: PUSH INTO THE PUPIL (the portal).
export const compositionConfig = {
  id: 'Mr1S1',
  durationInSeconds: 6.9333,
  durationInFrames: 104,
  fps: 15,
  width: 1080,
  height: 1920,
};

// the glyphs (drawn, minimal): [kind, x, y]
const GLYPHS: { kind: string; x: number; y: number }[] = [
  { kind: 'bell', x: 190, y: 460 },
  { kind: 'heart', x: 870, y: 420 },
  { kind: 'chat', x: 880, y: 800 },
  { kind: 'camera', x: 760, y: 1230 },
  { kind: 'play', x: 250, y: 1300 },
  { kind: 'cart', x: 140, y: 940 },
  { kind: 'star', x: 540, y: 330 },   // THE chosen one (top centre)
  { kind: 'bolt', x: 620, y: 1420 },
];

const EYE = { x: 540, y: 930 };

// the gaze target list: glyphs in jump order, then the chosen glyph, held.
const GAZE_ORDER = [0, 2, 5, 1, 3, 4, 6, 7, 6];

const S1: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  void fps;

  // camera: travel toward the eye while scaling (translate + scale, SAME interval)
  const approach = Math.min(1, f / 26);
  const camScale = 0.9 + 0.1 * approach;
  const camY = -60 * (1 - approach);

  // gaze: dwell ~7 frames per target, turn time PROPORTIONAL to the angle travelled
  const DWELL = 7;
  const chooseAt = 68; // "Choose one thing" lands ~5.0s global = f75 — lock just before
  let gx = EYE.x;
  let gy = EYE.y - 60;
  let chosen = false;
  if (f < chooseAt) {
    const idx = Math.min(GAZE_ORDER.length - 1, Math.floor(f / DWELL));
    const cur = GLYPHS[GAZE_ORDER[idx]];
    const prev = GLYPHS[GAZE_ORDER[Math.max(0, idx - 1)]];
    const ang = Math.atan2(cur.y - prev.y, cur.x - prev.x) - Math.atan2(EYE.y - prev.y, EYE.x - prev.x);
    const turn = Math.min(1, (f % DWELL) / (2 + Math.abs(ang) * 0.6)); // proportional
    gx = prev.x + (cur.x - prev.x) * turn;
    gy = prev.y + (cur.y - prev.y) * turn;
  } else {
    const cur = GLYPHS[6]; // the star
    const from = GLYPHS[GAZE_ORDER[GAZE_ORDER.length - 1]];
    const turn = Math.min(1, (f - chooseAt) / 9);
    gx = from.x + (cur.x - from.x) * turn;
    gy = from.y + (cur.y - from.y) * turn;
    chosen = turn > 0.92;
  }
  // iris/pupil offset toward the gaze (bounded)
  const dirX = gx - EYE.x;
  const dirY = gy - EYE.y;
  const dirLen = Math.hypot(dirX, dirY) || 1;
  const irisOff = 62;
  const ix = (dirX / dirLen) * irisOff;
  const iy = (dirY / dirLen) * irisOff * 0.6;

  // the vision cone: from the eye toward the gaze, beyond the frame corners
  const coneAng = Math.atan2(dirY, dirX);
  const CONE_HALF = 0.42;
  const inCone = (x: number, y: number) => {
    const a = Math.atan2(y - EYE.y, x - EYE.x);
    let d = Math.abs(a - coneAng);
    if (d > Math.PI) d = Math.PI * 2 - d;
    return d < CONE_HALF;
  };

  // EXIT: push into the pupil — the world scales around the pupil until ink fills
  const portal = f >= 92 ? Math.pow((f - 92) / 12, 1.6) : 0;
  const portalScale = 1 + portal * 26;
  const px = EYE.x + ix;
  const py = EYE.y + iy;

  return (
    <AbsoluteFill style={{ background: MR.ivory }}>
      <Tactile paperFile="projects/mr-1-attention/paper-tile.png" grainFile="library/textures/grain.jpg">
        <div
          style={{
            position: 'absolute', inset: 0,
            transform: `translateY(${camY}px) scale(${camScale}) scale(${portalScale})`,
            transformOrigin: `${px}px ${py}px`,
            filter: portal > 0 ? `blur(${portal * 3}px)` : undefined,
          }}
        >
          <ContourLines opacity={0.26} />

          {/* the glyphs — drawn, minimal; the ones under the cone warm up */}
          {GLYPHS.map((g, i) => {
            const lit = f < 92 && inCone(g.x, g.y);
            const dim = chosen && i !== 6;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute', left: g.x, top: g.y,
                  transform: `translate(-50%, -50%) rotate(${sine(f, 2, 0.11, i * 1.3)}deg)`,
                  opacity: dim ? 0.28 : 1,
                  transition: 'opacity 0.4s linear',
                }}
              >
                <Glyph kind={g.kind} color={lit ? MR.teal : MR.mutedTeal} size={i === 6 ? 96 : 72} />
                {i === 6 && chosen && (
                  <div
                    style={{
                      position: 'absolute', inset: -18, borderRadius: '50%',
                      border: `3px solid ${MR.gold}`,
                      opacity: 0.9,
                      transform: `scale(${1 + 0.05 * Math.sin(f / 2.1)})`,
                    }}
                  />
                )}
              </div>
            );
          })}

          {/* THE EYE (drawn) */}
          <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }} viewBox="0 0 1080 1920">
            {/* the vision cone (soft, above the glyphs, under the eye) */}
            <path
              d={conePath(EYE.x, EYE.y + 30, coneAng, CONE_HALF, 1700)}
              fill={MR.teal}
              opacity={f < 92 ? 0.055 : 0}
            />
            {/* sclera */}
            <ellipse cx={EYE.x} cy={EYE.y} rx={210} ry={120} fill={MR.ivory} stroke={MR.teal} strokeWidth={7} />
            {/* iris + pupil, offset toward the gaze */}
            <g transform={`translate(${ix} ${iy})`}>
              <circle cx={EYE.x} cy={EYE.y} r={86} fill={MR.teal} />
              <circle cx={EYE.x} cy={EYE.y} r={44} fill={MR.ink} />
              <circle cx={EYE.x + 16} cy={EYE.y - 16} r={10} fill={MR.ivory} opacity={0.85} />
            </g>
            {/* lids: two calm arcs */}
            <path d={`M ${EYE.x - 220} ${EYE.y - 96} Q ${EYE.x} ${EYE.y - 168} ${EYE.x + 220} ${EYE.y - 96}`} stroke={MR.teal} strokeWidth={7} fill="none" />
            <path d={`M ${EYE.x - 220} ${EYE.y + 96} Q ${EYE.x} ${EYE.y + 168} ${EYE.x + 220} ${EYE.y + 96}`} stroke={MR.teal} strokeWidth={7} fill="none" />
            {chosen && (
              <circle cx={EYE.x} cy={EYE.y} r={104} fill="none" stroke={MR.gold} strokeWidth={4} opacity={0.8} />
            )}
          </svg>

          {/* the words (VO only) — above the peripheral blur */}
          <div style={{ position: 'absolute', left: 80, right: 80, top: 1480, display: 'flex', justifyContent: 'center' }}>
            <SceneWords lines={VO.filter((l) => l.start < 6.9)} offsetSec={0} light />
          </div>
        </div>
      </Tactile>
    </AbsoluteFill>
  );
};

// soft cone from (x,y) toward ang, half-width halfAng, length L
const conePath = (x: number, y: number, ang: number, half: number, L: number) => {
  const a0 = ang - half;
  const a1 = ang + half;
  return `M ${x} ${y} L ${x + Math.cos(a0) * L} ${y + Math.sin(a0) * L} A ${L} ${L} 0 0 1 ${x + Math.cos(a1) * L} ${y + Math.sin(a1) * L} Z`;
};

// minimal drawn glyphs
const Glyph: React.FC<{ kind: string; color: string; size: number }> = ({ kind, color, size }) => {
  const s = size;
  const stroke = { stroke: color, strokeWidth: 5, fill: 'none', strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
  const sh = (d: string) => <path d={d} {...stroke} />;
  return (
    <svg width={s} height={s} viewBox="0 0 72 72">
      {kind === 'bell' && sh('M 22 44 Q 22 20 36 20 Q 50 20 50 44 L 54 52 L 18 52 Z M 31 56 Q 36 64 41 56')}
      {kind === 'heart' && sh('M 36 56 Q 12 40 16 26 Q 20 14 32 20 Q 36 24 36 28 Q 36 24 40 20 Q 52 14 56 26 Q 60 40 36 56 Z')}
      {kind === 'chat' && sh('M 14 20 L 58 20 Q 62 20 62 26 L 62 42 Q 62 48 56 48 L 32 48 L 20 58 L 22 48 Q 14 48 14 42 Z M 26 30 L 26 34 M 38 30 L 38 34 M 50 30 L 50 34')}
      {kind === 'camera' && (
        <>
          <rect x="14" y="24" width="44" height="32" rx="6" {...stroke} />
          <circle cx="36" cy="40" r="9" {...stroke} />
          {sh('M 24 24 L 28 16 L 44 16 L 48 24')}
        </>
      )}
      {kind === 'play' && <path d="M 26 18 L 56 36 L 26 54 Z" fill={color} stroke={color} strokeWidth={4} strokeLinejoin="round" />}
      {kind === 'cart' && (
        <>
          {sh('M 14 20 L 22 20 L 28 44 L 52 44 L 58 26 L 24 26')}
          <circle cx="30" cy="54" r="5" {...stroke} />
          <circle cx="50" cy="54" r="5" {...stroke} />
        </>
      )}
      {kind === 'star' && <path d="M 36 10 L 44 30 L 66 32 L 49 46 L 55 68 L 36 55 L 17 68 L 23 46 L 6 32 L 28 30 Z" fill={color} stroke={color} strokeWidth={3} strokeLinejoin="round" />}
      {kind === 'bolt' && <path d="M 40 8 L 20 40 L 33 40 L 28 64 L 52 30 L 38 30 Z" fill={color} stroke={color} strokeWidth={3} strokeLinejoin="round" />}
    </svg>
  );
};

export default S1;
