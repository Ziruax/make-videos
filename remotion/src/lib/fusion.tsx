// Fusion kit — make-on-script's guest mechanisms, re-graded into the minimal-reel host.
// The three laws (SKILL.md): the host owns the canvas; one guest per beat; every guest
// is re-graded at the door — MR palette, inside the scene's <Tactile>, 15fps snap,
// repo easings, MOTION.md's six rules. ALL frame-based pure functions (vidtsx hard
// rules): no state, no Math.random, seeded wobble only — scrubbing backwards lands on
// the same pixels.
//
// Guests (source → symbol):
//   math        → Counter (serif count-up, colour-coded quantity vs unit)
//   isometric   → IsoStage (dimetric hairline grid + accumulating blocks)
//   pixel       → PixelEra (resolution-tells-time blocks, own sub-cadence)
//   cut-paper   → TornBits (irregular torn scraps, soft shadows, drift)
//   crosshatch  → InkStroke (boiling hand-drawn hairline)
//   riso        → RisoWord (two-ink overprint misregistration)
//   sketchbook  → GraphiteNote (wobbly note + self-drawing underline)
//   mg          → KineticPayoff (the word scales through the camera)
import React from 'react';
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { MR, sine, flutter } from './tactile';
import { boil, posterizeFrame } from './engine';
import { FONT_SERIF } from '../fonts';

// deterministic per-index wobble seed (never Math.random)
const wob = (i: number, salt = 1) => {
  const x = Math.sin((i + 1) * 12.9898 * salt) * 43758.5453;
  return x - Math.floor(x);
};

// ---------------------------------------------------------------------------
// Counter (math) — a number that lands. Ease-out over 1-2s, the integer part
// climbing fast then slowing, the unit dimmer than the quantity. Frame-locked:
// pure function of (frame, from, to, startF, durF).
// ---------------------------------------------------------------------------
export const Counter: React.FC<{
  from: number; to: number; startF: number; durF?: number;
  decimals?: number; suffix?: string; prefix?: string;
  x?: number; y?: number; size?: number; color?: string; unitColor?: string;
  align?: 'center' | 'left';
  fps?: number; // snap cadence (default 15 — the host's)
  appearF?: number; // when the counter enters (default startF — it never sits pre-start)
}> = ({
  from, to, startF, durF = 18, decimals = 0, suffix = '', prefix = '',
  x = 540, y = 960, size = 210, color = MR.ivory, unitColor,
  align = 'center', fps = 15, appearF,
}) => {
  const raw = useCurrentFrame();
  const { fps: cfgFps } = useVideoConfig();
  const f = posterizeFrame(raw, cfgFps, fps); // snap to the cadence
  const eased = interpolate(f, [startF, startF + durF], [from, to], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.bezier(0.33, 1, 0.68, 1), // easeOutCubic — the count READS as a count
  });
  const landed = f >= startF + durF;
  const val = landed ? to : eased;
  const text = val.toFixed(decimals);
  // enter with the count (never sits on screen pre-start) — a 3f lead-in
  const ap = appearF ?? startF;
  const vis = interpolate(f, [ap - 3, ap + 2], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.33, 1, 0.68, 1),
  });
  const unit = suffix ? <span style={{ fontSize: size * 0.5, color: unitColor ?? color, opacity: 0.62, marginLeft: size * 0.05 }}>{suffix}</span> : null;
  return (
    <div
      style={{
        position: 'absolute', left: align === 'center' ? x : x,
        top: y, transform: `translate(${align === 'center' ? '-50%' : '0'}, -50%)`,
        fontFamily: FONT_SERIF, fontWeight: 600, fontSize: size, lineHeight: 1,
        color, fontVariantNumeric: 'tabular-nums', letterSpacing: -2,
        opacity: vis,
        textShadow: `0 4px 26px rgba(8,15,22,${landed ? 0.45 : 0.25})`,
        transformOrigin: 'center',
        scale: `${1 + (landed ? 0.035 * Math.sin((f - startF - durF) / 2.6) : 0)}`,
      }}
    >
      {prefix}{text}{unit}
    </div>
  );
};

// ---------------------------------------------------------------------------
// IsoStage (isometric) — a dimetric hairline floor + blocks that accumulate in
// index order (2-6f stagger, spring settle with 5-8% overshoot). The grid is the
// choreography backbone; blocks ARE the data (cause → effect: each landing is a
// filled cell).
// ---------------------------------------------------------------------------
const isoProj = (gx: number, gy: number) => ({
  // dimetric 2:1 — classic iso look, hairline friendly
  x: (gx - gy) * 92,
  y: (gx + gy) * 46,
});

export const IsoStage: React.FC<{
  cols: number; rows: number;
  originX?: number; originY?: number;
  gridColor?: string; gridOpacity?: number;
  blockAt?: (i: number, f: number) => { gx: number; gy: number; h: number; base?: number; color: string; delayF: number } | null;
  blockCount?: number;
  startF?: number;
  staggerF?: number;
  settleF?: number;
  hScale?: number;   // global height multiplier — the collapse control (1 = full, 0.03 = sliver)
  light?: boolean;
}> = ({
  cols, rows, originX = 540, originY = 1180,
  gridColor, gridOpacity = 0.5, blockAt, blockCount = 0,
  startF = 0, staggerF = 4, settleF = 10, hScale = 1, light = false,
}) => {
  const f = useCurrentFrame();
  const gc = gridColor ?? (light ? MR.mutedTeal : MR.ivory);
  const grid: React.ReactNode[] = [];
  for (let c = 0; c <= cols; c++) {
    const a = isoProj(c, 0), b = isoProj(c, rows);
    grid.push(<line key={`c${c}`} x1={originX + a.x} y1={originY + a.y} x2={originX + b.x} y2={originY + b.y} stroke={gc} strokeWidth={1.6} opacity={gridOpacity * 0.8} />);
  }
  for (let r = 0; r <= rows; r++) {
    const a = isoProj(0, r), b = isoProj(cols, r);
    grid.push(<line key={`r${r}`} x1={originX + a.x} y1={originY + a.y} x2={originX + b.x} y2={originY + b.y} stroke={gc} strokeWidth={1.6} opacity={gridOpacity * 0.8} />);
  }
  const blocks: React.ReactNode[] = [];
  for (let i = 0; i < blockCount; i++) {
    const spec = blockAt?.(i, f);
    if (!spec) continue;
    const { gx, gy, h, base = 0, color, delayF } = spec;
    const t = f - startF - delayF * staggerF;
    if (t < 0) continue;
    const settle = interpolate(t, [0, settleF], [0, 1], {
      extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
      easing: Easing.bezier(0.34, 1.56, 0.64, 1), // easeOutBack — 5-8% overshoot
    });
    // the segment spans [base, base+h] (h growing with the settle), then the whole
    // tower is scaled by hScale — the collapse control compresses it to the floor.
    const y0 = (base + h * settle) * hScale;
    const y1 = base * hScale;
    const hh = y0 - y1;
    if (hh <= 0.5) continue;
    const p = isoProj(gx, gy);
    // dimetric box: top face + left face + right face (paper-white top, tinted sides)
    const w = 88, d = 88;
    const cx = originX + p.x, cy = originY + p.y;
    const top = `${cx},${cy - y0} ${cx + w},${cy - w * 0.5 - y0} ${cx + w - d},${cy - (w + d) * 0.5 - y0} ${cx - d},${cy - d * 0.5 - y0}`;
    const left = `${cx - d},${cy - d * 0.5 - y0} ${cx + w - d},${cy - (w + d) * 0.5 - y0} ${cx + w - d},${cy - (w + d) * 0.5 - y1} ${cx - d},${cy - d * 0.5 - y1}`;
    const right = `${cx + w},${cy - w * 0.5 - y0} ${cx + w - d},${cy - (w + d) * 0.5 - y0} ${cx + w - d},${cy - (w + d) * 0.5 - y1} ${cx + w},${cy + d * 0.5 - y1}`;
    blocks.push(
      <g key={`b${i}`} opacity={0.96}>
        <polygon points={top} fill={color} stroke={light ? MR.teal : MR.ivory} strokeWidth={2} />
        <polygon points={left} fill={color} opacity={0.74} stroke={light ? MR.teal : MR.ivory} strokeWidth={1.4} strokeOpacity={0.9} />
        <polygon points={right} fill={color} opacity={0.52} stroke={light ? MR.teal : MR.ivory} strokeWidth={1.4} strokeOpacity={0.9} />
      </g>
    );
  }
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }} viewBox="0 0 1080 1920">
      {grid}
      {blocks}
    </svg>
  );
};

// ---------------------------------------------------------------------------
// PixelEra (pixel) — resolution tells time. Renders a chunky block mosaic of a
// given colour, stepping at its OWN deliberate sub-cadence (4-6fps) so the past
// reads low-res. `resolve` (0..1) sharpens: block count dissolves as present
// approaches. Deterministic: block pattern from seeded wobble.
// ---------------------------------------------------------------------------
export const PixelEra: React.FC<{
  x: number; y: number; w: number; h: number; cell?: number;
  color: string; opacity?: number; resolve?: number; stepFps?: number;
}> = ({ x, y, w, h, cell = 26, color, opacity = 0.9, resolve = 0, stepFps = 5 }) => {
  const raw = useCurrentFrame();
  const { fps: cfgFps } = useVideoConfig();
  const f = posterizeFrame(raw, cfgFps, stepFps); // deliberate low cadence
  const cols = Math.ceil(w / cell), rows = Math.ceil(h / cell);
  const blocks: React.ReactNode[] = [];
  for (let i = 0; i < cols * rows; i++) {
    const cx = i % cols, cy = Math.floor(i / cols);
    const seed = wob(i, 3);
    const alive = seed > resolve; // resolve dissolves the mosaic
    if (!alive) continue;
    const jitter = boil(f + i, 2, 1, 3);
    blocks.push(
      <rect
        key={i}
        x={cx * cell + jitter * 0.5}
        y={cy * cell + jitter * 0.5}
        width={cell - 1}
        height={cell - 1}
        fill={color}
        opacity={0.55 + 0.4 * wob(i, 7)}
      />
    );
  }
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, opacity, imageRendering: 'pixelated' }}>
      <svg width={w} height={h} style={{ imageRendering: 'pixelated' }}>{blocks}</svg>
    </div>
  );
};

// ---------------------------------------------------------------------------
// TornBits (cut-paper) — irregular torn scraps with soft shadows, drifting on
// regular sines (host law: the WORLD moves on sines). Each bit is a jagged
// polygon whose vertices wobble per-index deterministically.
// ---------------------------------------------------------------------------
export const TornBits: React.FC<{
  bits: { x: number; y: number; w: number; h: number; rot?: number; color?: string }[];
  scale?: number; opacity?: number; shadow?: boolean;
  settleF?: number;  // after this frame the drift stills to ~20% (the lock)
}> = ({ bits, scale = 1, opacity = 1, shadow = true, settleF }) => {
  const f = useCurrentFrame();
  const calm = settleF === undefined ? 1 : interpolate(f, [settleF, settleF + 10], [1, 0.2], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.33, 1, 0.68, 1),
  });
  return (
    <>
      {bits.map((b, i) => {
        const color = b.color ?? (i % 3 === 0 ? MR.mutedTeal : i % 3 === 1 ? MR.teal : '#D8CFBB');
        // primary slow drift + a fast secondary bob (turning points of a single sine
        // read as frozen; the second frequency keeps every frame measurably alive)
        const driftX = (sine(f, 16 + wob(i) * 8, 0.26 + wob(i, 2) * 0.08, i) + sine(f, 3, 0.55, i * 2.7)) * calm;
        const driftY = (sine(f, 12 + wob(i, 3) * 8, 0.21 + wob(i, 4) * 0.07, i * 1.7) + sine(f, 2.4, 0.47, i * 1.3)) * calm;
        const rot = (b.rot ?? wob(i, 5) * 60 - 30) + sine(f, 5, 0.24, i * 0.9) * calm;
        // jagged torn edge: deterministic per-index vertex jitter
        const pts: string[] = [];
        const nx = 7, ny = 5;
        for (let k = 0; k <= nx; k++) {
          const px = (k / nx - 0.5) * b.w;
          pts.push(`${px + (wob(i * 31 + k, 6) - 0.5) * 10},${-b.h / 2 + (wob(k * 7 + i, 8) - 0.5) * 8}`);
        }
        for (let k = 1; k <= ny; k++) {
          const py = (k / ny - 0.5) * b.h;
          pts.push(`${b.w / 2 + (wob(i * 13 + k, 9) - 0.5) * 10},${py}`);
        }
        for (let k = nx - 1; k >= 0; k--) {
          const px = (k / nx - 0.5) * b.w;
          pts.push(`${px},${b.h / 2 + (wob(k * 17 + i, 11) - 0.5) * 8}`);
        }
        for (let k = ny - 1; k >= 1; k--) {
          const py = (k / ny - 0.5) * b.h;
          pts.push(`${-b.w / 2 + (wob(k * 23 + i, 13) - 0.5) * 10},${py}`);
        }
        return (
          <div
            key={i}
            style={{
              position: 'absolute', left: b.x + driftX, top: b.y + driftY,
              width: b.w, height: b.h, opacity, transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${scale})`,
              filter: shadow ? 'drop-shadow(0 14px 22px rgba(8,15,22,0.30))' : undefined,
            }}
          >
            <svg width={b.w} height={b.h} viewBox={`${-b.w / 2} ${-b.h / 2} ${b.w} ${b.h}`}>
              <polygon points={pts.join(' ')} fill={color} />
            </svg>
          </div>
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------------------
// InkStroke (crosshatch) — a hand-drawn hairline that BOILS (re-rolls every few
// frames). Draws a path spec as a wobbling polyline; `draw` (0..1) reveals it
// head-first (trim-path discipline without the trim path).
// ---------------------------------------------------------------------------
export const InkStroke: React.FC<{
  d: { x: number; y: number }[]; // control points (userSpace 1080×1920)
  draw?: number; stroke?: string; width?: number; boilStep?: number; boilAmp?: number;
}> = ({ d, draw = 1, stroke = MR.teal, width = 5, boilStep = 3, boilAmp = 3 }) => {
  const f = useCurrentFrame();
  const segs = d.length - 1;
  const drawn = Math.max(0, Math.min(segs, Math.floor(draw * segs)));
  if (drawn < 1) return null;
  let path = '';
  for (let i = 0; i <= drawn; i++) {
    const p = d[i];
    const bx = boil(f + i * 5, 3, boilAmp, boilStep);
    const by = boil(f + i * 5 + 2, 5, boilAmp, boilStep);
    path += (i === 0 ? 'M ' : 'L ') + `${p.x + bx} ${p.y + by}`;
    if (i < drawn) path += ' ';
  }
  // partial last segment for smooth head-first reveal
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }} viewBox="0 0 1080 1920">
      <path d={path} fill="none" stroke={stroke} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// ---------------------------------------------------------------------------
// RisoWord (riso) — the payoff word printed in two palette inks, misregistered
// by 2-4px. The misregistration BREATHES slightly (a print being pulled). Screen
// blend keeps it bright on the night background.
// ---------------------------------------------------------------------------
export const RisoWord: React.FC<{
  text: string; x?: number; y?: number; size?: number; rotate?: number;
  inkA?: string; inkB?: string; offsetPx?: number; opacity?: number;
}> = ({
  text, x = 540, y = 960, size = 190, rotate = -2,
  inkA = MR.gold, inkB = MR.teal, offsetPx = 3.5, opacity = 1,
}) => {
  const f = useCurrentFrame();
  const off = offsetPx + Math.abs(sine(f, 1.2, 0.08, 4));
  const style: React.CSSProperties = {
    position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) rotate(${rotate}deg)`,
    fontFamily: FONT_SERIF, fontWeight: 600, fontSize: size, lineHeight: 1, whiteSpace: 'nowrap',
  };
  return (
    <div style={{ ...style, opacity }}>
      <span style={{ position: 'absolute', left: 0, top: 0, color: inkB, transform: `translate(${off}px, ${off * 0.6}px)`, mixBlendMode: 'screen' }}>{text}</span>
      <span style={{ position: 'relative', color: inkA }}>{text}</span>
    </div>
  );
};

// ---------------------------------------------------------------------------
// GraphiteNote (sketchbook) — a wobbly hand-note: the text sits slightly
// rotated with a soft double-stroke look, and the underline draws itself
// head-first while the note lands.
// ---------------------------------------------------------------------------
export const GraphiteNote: React.FC<{
  text: string; x: number; y: number; size?: number; rotate?: number;
  color?: string; underlineF?: number; durF?: number; opacity?: number;
  width?: number;
}> = ({
  text, x, y, size = 46, rotate = -2.5, color = MR.ivory,
  underlineF = 0, durF = 12, opacity = 1, width,
}) => {
  const f = useCurrentFrame();
  const flut = flutter(f, 0.8);
  const draw = interpolate(f, [underlineF, underlineF + durF], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.33, 1, 0.68, 1),
  });
  const w = width ?? text.length * size * 0.52;
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) rotate(${rotate + flut * 0.4}deg)`, opacity }}>
      <div style={{
        fontFamily: FONT_SERIF, fontStyle: 'italic', fontWeight: 500,
        fontSize: size, color, textAlign: 'center', lineHeight: 1.25, letterSpacing: 0.5,
        textShadow: `0 0 ${size * 0.06}px ${color}`,
      }}>
        {text}
      </div>
      {draw > 0 && (
        <svg width={w} height={16} viewBox={`0 0 ${w} 16`} style={{ marginTop: 6, display: 'block', marginLeft: 'auto', marginRight: 'auto' }}>
          <path
            d={`M 4 8 ${Array.from({ length: 8 }, (_, k) => `L ${(draw * (w - 8) * ((k + 1) / 8)).toFixed(1)} ${8 + boil(f + k * 3, 7, 2.2, 3).toFixed(1)}`).join(' ')}`}
            fill="none" stroke={color} strokeWidth={3.2} strokeLinecap="round" opacity={0.85}
          />
        </svg>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// KineticPayoff (motion-graphics / MOTION.md rule 1) — the payoff word scales
// THROUGH the camera with directional blur and a stretched leading edge, while
// the next beat is already in place underneath. `t` (0..1) is the fly progress;
// children ride along; the wrapper handles scale + blur + skew.
// ---------------------------------------------------------------------------
export const KineticPayoff: React.FC<{
  t: number; // 0 = at rest, 1 = fully past the camera
  x?: number; y?: number;
  children: React.ReactNode;
  maxScale?: number;
  fromOpacity?: number;
}> = ({ t, x = 540, y = 880, children, maxScale = 26, fromOpacity = 1 }) => {
  if (t <= 0) {
    return <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)', opacity: fromOpacity }}>{children}</div>;
  }
  // easeInExpo accelerating past the camera — the exit IS fast (MOTION rule 4)
  const e = Math.pow(t, 3.2);
  const scale = 1 + e * maxScale;
  const blur = t < 0.5 ? 0 : interpolate(t, [0.5, 1], [0, 14], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const opacity = interpolate(t, [0.72, 0.95], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div
      style={{
        position: 'absolute', left: x, top: y,
        transform: `translate(-50%, -50%) scale(${scale})`,
        filter: blur > 0 ? `blur(${blur}px)` : undefined,
        opacity, pointerEvents: 'none',
      }}
    >
      {children}
    </div>
  );
};
