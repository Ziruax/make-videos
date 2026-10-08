// Motion engine — shared helpers for documentary-style reels (12fps posterize feel).
// Frame-based ONLY (vidtsx hard rules): every helper is a pure function of the frame.
// Imported by make-motion-graphics / make-map / make-minimal-reel shots.
import React from 'react';
import { Easing, interpolate, spring } from 'remotion';

// Posterize the timeline: snap frame f to 12fps steps so movement stutters like
// stop-motion instead of gliding. step=2 -> 30fps/15 (use 2 for ~12-15fps feel).
export const posterizeFrame = (f: number, fps = 30, target = 12) => {
  const step = Math.max(1, Math.round(fps / target));
  return Math.floor(f / step) * step;
};

// Boil wobble: tiny jitter that re-rolls every `step` frames (stop-motion life).
export const boil = (f: number, seed = 1, amp = 1, step = 2) => {
  const k = Math.floor(f / step) + seed * 97;
  const r = Math.sin(k * 12.9898) * 43758.5453;
  return (r - Math.floor(r) - 0.5) * 2 * amp; // -amp..amp
};

// Slow drift: never let a layer sit perfectly still (idle "breathing").
export const drift = (f: number, period = 180, amp = 6) =>
  Math.sin((f / period) * Math.PI * 2) * amp;

// Ping-pong oscillator: 0 -> 1 -> 0, useful for sways and lamp swings.
export const pingpong = (f: number, period = 60) => {
  const t = (f % period) / period;
  return t < 0.5 ? t * 2 : 2 - t * 2;
};

// Decaying swing: a wag/settle like a foam finger saying "no".
export const decaySwing = (f: number, start: number, degrees = 28, freq = 0.52, decay = 0.042) => {
  const t = f - start;
  if (t < 0) return 0;
  return degrees * Math.cos(t * freq) * Math.exp(-decay * t);
};

// Spring entrance for things popping into place (deterministic: pure function of f).
export const springIn = (
  f: number,
  from: number,
  config: { damping?: number; mass?: number; stiffness?: number } = {}
) => {
  const { damping = 200, mass = 0.9, stiffness = 120 } = config;
  const s = spring({ frame: f, fps: 30, config: { damping, mass, stiffness } });
  return from + (1 - from) * s;
};

// Soft spring (newspaper drops): low stiffness + a bit of mass = glides in ~0.9s
// and settles with a small bounce rather than snapping.
export const softSpring = (f: number) => springIn(f, 0, { stiffness: 42, mass: 1.1, damping: 14 });

// Motion-blur burst: blur px ramping 0 -> peak -> 0 across [f0, fPeak, f1].
export const blurBurst = (f: number, f0: number, fPeak: number, f1: number, peak = 9) => {
  const up = interpolate(f, [f0, fPeak], [0, peak], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.33, 1, 0.68, 1),
  });
  const down = interpolate(f, [fPeak, f1], [peak, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.32, 0, 0.67, 0),
  });
  return Math.min(up, down);
};

// Vintage focus-hunt: a lens finding focus (blur clearing, maybe dipping out again).
export const focusHunt = (
  f: number,
  cues: { f: number; blur: number }[]
) => {
  if (cues.length === 0) return 0;
  const frames = cues.map((c) => c.f);
  const blurs = cues.map((c) => c.blur);
  return interpolate(f, frames, blurs, {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
};

// CSS filter string helper — grade exposure as props (tweak per scene).
export const grade = (s: number, c: number, sep: number, b: number) =>
  `saturate(${s}) contrast(${c}) sepia(${sep}) brightness(${b})`;

// Screen-blend layer: bright-on-black footage (smoke, explosions, grain plates)
// keyed by ONLY adding light. Wrap <Img>/<Video> children in this.
export const ScreenBlend: React.FC<{ children: React.ReactNode; opacity?: number; style?: React.CSSProperties }> = ({
  children, opacity = 1, style,
}) => (
  <div
    style={{
      mixBlendMode: 'screen', opacity, position: 'absolute', inset: 0, ...style,
    }}
  >
    {children}
  </div>
);
