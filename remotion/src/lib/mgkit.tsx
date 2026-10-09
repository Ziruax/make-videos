// mgkit.tsx — THE MOTION-DESIGN SYSTEM for /make-motion-graphics.
//
// A real motion-graphics engine: a designed graphic system (type, geometric shapes,
// grid, limited palette) whose elements are individually addressable and animated
// with physics-based timing. Drawn shapes, type and colour ONLY — no photo cutouts,
// no image generation. The polish comes from the motion vocabulary, not from assets.
//
// Encodes the measured craft of the genre:
//   - named easing curves + a contextual duration table (nothing linear, exits ~45%
//     of enters, one duration never everywhere)
//   - kinetic type as ATOMS (line/word/char splits, 1-4f stagger, cascade ≤ 1.5s,
//     compound property reveals: position → scale → opacity, mask wipes)
//   - a Material-style transition system (shared-axis x/y/z, fade-through, wipe,
//     iris) where outgoing + incoming move IN UNISON
//   - grid cascades, data motion (counters ease-out 1-2s, trim-style bars/arcs,
//     self-drawing strokes), order→chaos→order
//   - the 12 principles as pure functions: anticipation (opposite wind-up),
//     overshoot 5-8%, follow-through, secondary bob, parallax
//   - 2-3 colour palettes + neutrals (60-30-10), phone contrast ≥ 4.5:1
//
// ALL frame-based (vidtsx hard rules): every value is a pure function of
// useCurrentFrame() — no state, deterministic, scrub-safe. interpolate ranges are
// strictly increasing; every range clamps. Seeded randomness via Remotion random().

import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { FONT_BODY, FONT_DISPLAY, FONT_HEAVY, FONT_IMPACT, FONT_MONO } from '../fonts';

// ===========================================================================
// 1. TIMING TOKENS — the physics layer
// ===========================================================================
// Named cubic-bezier presets (measured from Apple/Material motion systems and
// the pro-MG canon). NEVER animate linearly except values driven by trackers.
export const MGE = {
  // workhorse (Apple standard / Material standard): symmetric, confident
  standard: Easing.bezier(0.4, 0, 0.2, 1),
  // Material emphasized: steeper entry, long settle
  emphasized: Easing.bezier(0.2, 0, 0, 1),
  // ENTRANCES (emphasized decelerate): fast first 80%, slow last 20%
  decel: Easing.bezier(0.05, 0.7, 0.1, 1),
  // EXITS (emphasized accelerate): leave soft, exit fast
  accel: Easing.bezier(0.3, 0, 0.8, 0.15),
  // punchy landings (easeOutExpo): impact decays instantly
  outExpo: Easing.bezier(0.16, 1, 0.3, 1),
  // landing with visible overshoot (easeOutBack) — 5-8% past target
  outBack: Easing.bezier(0.34, 1.56, 0.64, 1),
  // system/camera moves (easeInOut)
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
} as const;

// Contextual duration table, FRAMES @30fps (100ms = 3f, 150ms ≈ 5f, 250ms ≈ 8f,
// 350ms ≈ 11f). One duration everywhere is the #1 amateur tell.
export const MGD = {
  micro: 3, // ticks, blips, cursor
  press: 5, // chip/badge class
  modal: 8, // card class
  scene: 12, // scene content reveals
  transit: 14, // scene transitions (12-20f band)
  counter: 36, // data counters 1-2s ease-out (1.2s sweet spot)
  cascade: 45, // MAX total type cascade (1.5s) — never exceed
} as const;

// Exits are 40-50% shorter than enters (Material rule).
export const exitDur = (d: number) => Math.max(2, Math.round(d * 0.45));

// Stagger presets (frames between atoms). 30-50ms/char feels fluid (1-1.5f);
// dramatic 100ms+ (3f). Words ~6f. Total cascade must stay ≤ MGD.cascade.
export const MGS = { char: 2, charDramatic: 3, word: 6, cell: 3 } as const;

// clamp helper (vidtsx-safe progress with easing baked in)
export const mprog = (
  frame: number,
  from: number,
  dur: number,
  ease: (t: number) => number = MGE.decel,
) => interpolate(frame, [from, from + dur], [0, 1], {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
  easing: ease,
});

// ===========================================================================
// 2. THE PRINCIPLES — pure functions composing with any move
// ===========================================================================

/** Anticipation: the opposite wind-up before the main action. 9 times out of 10
 *  the counter-move is opposite the action; its scale matches the action's.
 *  Subtract from (or add to) a 0..1 progress to get a small pre-dip. */
export const anticipate = (frame: number, from: number, windF = 5, amt = 0.08) => {
  const u = mprog(frame, from, windF, MGE.inOut);
  return -amt * Math.sin(Math.PI * u); // dips negative then returns to 0
};

/** Overshoot: 5-8% PAST the target, then settle (never 20%). Apply to a finished
 *  progress: value * (1 + overshoot(frame, landF)). */
export const overshoot = (frame: number, landF: number, amt = 0.06, decay = 5) => {
  const t = Math.max(0, frame - landF);
  return amt * Math.exp(-t / (decay / 3)) * Math.cos((t / decay) * Math.PI * 2.2);
};

/** Follow-through: the trailing loose part keeps moving after the body stops.
 *  Returns a decaying offset (px-ish) — apply to tail elements. */
export const followThrough = (frame: number, landF: number, amt = 10, decay = 8) => {
  const t = Math.max(0, frame - landF);
  return amt * Math.exp(-t / (decay / 2.2)) * Math.sin((t / decay) * Math.PI);
};

/** Secondary motion: idle life for held frames (a bob, a breathing glow) so
 *  nothing is ever fully still. Cheap, seeded, frame-pure. */
export const idleBob = (frame: number, seed: string, amp = 4, periodF = 48) => {
  const phase = random(seed) * Math.PI * 2;
  return amp * Math.sin((frame / periodF) * Math.PI * 2 + phase);
};

/** Parallax: background moves slower than foreground (0.3-0.5x). depth = 0 bg,
 *  1 fg. Multiply a camera travel amount by this factor. */
export const parallax = (depth: number) => 0.3 + 0.7 * Math.min(1, Math.max(0, depth));

// ===========================================================================
// 3. PALETTES — 2-3 colours + neutrals, 60-30-10
// ===========================================================================
// Each: ground (60%), ink (30%), accent (10%), accent2 (rare, secondary meaning).
// One accent = one meaning per film. Contrast on phone ≥ 4.5:1 for body text.
export const MGP = {
  // dark editorial — gold statement colour, teal for "the system/data"
  ink: { ground: '#0E0E10', groundHi: '#17181C', ink: '#F4F2EC', inkDim: '#8A8A85', accent: '#E8C559', accent2: '#5CD0B3' },
  // light print — terracotta hero accent, deep teal secondary
  paper: { ground: '#F4F1EA', groundHi: '#EAE5DA', ink: '#161513', inkDim: '#6E6A62', accent: '#D97757', accent2: '#17343D' },
  // modern tech — coral for "the problem", mint for "the fix"
  studio: { ground: '#101312', groundHi: '#191E1C', ink: '#EDF2EE', inkDim: '#8C9490', accent: '#E8556D', accent2: '#39C0A8' },
} as const;
export type MgPalette = typeof MGP.ink;

// ===========================================================================
// 4. KINETIC TYPE — the atom engine
// ===========================================================================
// THE pro pattern: text splits into atoms (line: subtle/elegant, word: headlines,
// char: max impact, short text only), atoms stagger in with a compound property
// reveal (position first, then scale, then opacity — "gathering energy before
// materializing"), and the cascade never exceeds ~1.5s.
//
// ATOM RULES (the #1 Remotion kinetic-type bugs): atoms are display:inline-block
// (transforms are silently ignored on inline elements); spaces are \u00A0 inside
// char-splits; word atoms carry a trailing 0.3em.

export type TextSplit = 'line' | 'word' | 'char';
export type TextReveal = 'rise' | 'mask' | 'blur' | 'scale' | 'slideLeft' | 'slideUp';

export type KineticTextProps = {
  children: string | string[];
  split?: TextSplit;
  reveal?: TextReveal;
  at?: number; // first atom lands at this frame (default 0)
  staggerF?: number; // frames between atom starts
  atomDur?: number; // frames each atom animates over
  fontFamily?: string;
  fontSize?: number;
  weight?: number;
  color?: string;
  lineHeight?: number;
  letterSpacing?: number;
  align?: 'left' | 'center' | 'right';
  /** words that get the accent colour + a landing pulse (the payoff words) */
  emph?: string[];
  emphColor?: string;
  style?: React.CSSProperties;
  uppercase?: boolean;
};

const splitToAtoms = (text: string, split: TextSplit): string[][][] => {
  const lines = text.split('\n');
  if (split === 'line')
    // one atom per line: a single group whose chars spell the line (join → line)
    return lines.map((l) => [l.split('')]);
  if (split === 'word')
    return lines.map((l) => l.split(' ').filter(Boolean).map((w) => w.split('')));
  // char: words as groups so spaces are a margin, not atoms
  return lines.map((l) => l.split(' ').filter(Boolean).map((w) => w.split('')));
};

/** One animated atom. Inside its own <Sequence> so useCurrentFrame() is LOCAL. */
const Atom: React.FC<{
  d: number; // atom duration
  reveal: TextReveal;
  emph?: boolean;
  emphColor?: string;
  color: string;
  isWord: boolean;
  children: string;
}> = ({ d, reveal, emph, emphColor, color, isWord, children }) => {
  const f = useCurrentFrame();
  // compound progress: position 0→1 (decel) over d; opacity over first 40%;
  // scale over [2, d+2] — three offsets = "gathering energy" read
  const pos = mprog(f, 0, d, MGE.decel);
  const opa = mprog(f, 0, Math.max(2, Math.round(d * 0.4)));
  const scl = mprog(f, 2, d, MGE.decel);
  const wordPulse = emph ? 1 + overshoot(f, Math.round(d * 0.9), 0.05, 6) : 1;
  const slide = 0.35; // em-ish travel

  let transform = '';
  let filter: string | undefined;
  let clip: string | undefined;
  switch (reveal) {
    case 'rise':
      transform = `translateY(${(1 - pos) * slide}em) scale(${0.96 + 0.04 * scl * wordPulse})`;
      break;
    case 'mask':
      clip = `inset(0 ${(1 - pos) * 100}% 0 0)`;
      transform = `translateY(${(1 - pos) * 0.08}em)`;
      break;
    case 'blur':
      filter = f < d ? `blur(${(1 - pos) * 8}px)` : undefined;
      transform = `scale(${0.985 + 0.015 * scl})`;
      break;
    case 'scale':
      transform = `scale(${(0.8 + 0.2 * pos) * wordPulse})`;
      break;
    case 'slideLeft':
      transform = `translateX(${(1 - pos) * slide * 2}em) scale(${0.99 + 0.01 * scl})`;
      break;
    case 'slideUp':
      transform = `translateY(${(1 - pos) * slide * 2.2}em)`;
      break;
  }
  return (
    <span
      style={{
        display: 'inline-block',
        whiteSpace: 'pre',
        opacity: opa,
        transform,
        filter,
        clipPath: clip,
        marginRight: isWord ? '0.3em' : undefined,
        color: emph ? emphColor : color,
        willChange: 'transform, opacity',
      }}
    >
      {children}
    </span>
  );
};

export const KineticText: React.FC<KineticTextProps> = ({
  children,
  split = 'word',
  reveal = 'rise',
  at = 0,
  staggerF,
  atomDur,
  fontFamily = FONT_DISPLAY,
  fontSize = 72,
  weight = 600,
  color = '#F4F2EC',
  lineHeight = 1.08,
  letterSpacing = 0,
  align = 'left',
  emph,
  emphColor = '#E8C559',
  style,
  uppercase,
}) => {
  const text = typeof children === 'string' ? children : children.join('\n');
  const shown = uppercase ? text.toUpperCase() : text;
  const lines = splitToAtoms(shown, split);
  const stagger = staggerF ?? (split === 'char' ? MGS.char : split === 'word' ? MGS.word : MGS.charDramatic);
  const dur = atomDur ?? (split === 'line' ? MGD.modal : MGD.modal);
  const emphSet = new Set((emph ?? []).map((w) => w.toUpperCase()));

  let idx = 0;
  return (
    <div
      style={{
        fontFamily,
        fontSize,
        fontWeight: weight,
        color,
        lineHeight,
        letterSpacing,
        textAlign: align,
        ...style,
      }}
    >
      {lines.map((words, li) => (
        <div key={li} style={{ display: 'block' }}>
          {words.map((word, wi) => {
            const isEmph = split !== 'char' && emphSet.has(word.join('').toUpperCase());
            return (
              <React.Fragment key={wi}>
                {split === 'char'
                  ? // char split: chars as atoms inside ONE word group (spaces = margin)
                    word.map((ch, ci) => {
                      const myIdx = idx++;
                      return (
                        <Sequence
                          key={ci}
                          from={at + myIdx * stagger}
                          durationInFrames={dur + 8}
                          layout="none"
                        >
                          <Atom d={dur} reveal={reveal} color={color} isWord={false}>
                            {ch}
                          </Atom>
                        </Sequence>
                      );
                    })
                  : (() => {
                      const myIdx = idx++;
                      return (
                        <Sequence from={at + myIdx * stagger} durationInFrames={dur + 8} layout="none">
                          <Atom
                            d={dur}
                            reveal={reveal}
                            emph={isEmph}
                            emphColor={emphColor}
                            color={color}
                            isWord={split === 'word'}
                          >
                            {word.join('')}
                          </Atom>
                        </Sequence>
                      );
                    })()}
                {split === 'char' && wi < words.length - 1 ? <span style={{ display: 'inline-block', width: '0.3em' }} /> : null}
              </React.Fragment>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/** MaskReveal — a wipe on whole lines of type (the pro alternative to pops):
 *  a clip band sweeps across, content slides under it. at = start frame. */
export const MaskReveal: React.FC<{
  children: React.ReactNode;
  at: number;
  dur?: number;
  direction?: 'left' | 'right' | 'up';
  style?: React.CSSProperties;
}> = ({ children, at, dur = MGD.modal, direction = 'left', style }) => {
  const f = useCurrentFrame();
  const u = mprog(f, at, dur, MGE.decel);
  const clip =
    direction === 'up'
      ? `inset(${(1 - u) * 100}% 0 0 0)`
      : direction === 'right'
        ? `inset(0 0 0 ${(1 - u) * 100}%)`
        : `inset(0 ${(1 - u) * 100}% 0 0)`;
  const slide = direction === 'up' ? (1 - u) * 26 : 0;
  return (
    <div style={{ clipPath: clip, transform: `translateY(${slide}px)`, ...style }}>{children}</div>
  );
};

/** WeightPush — the modern signature: a word's weight steps up (400→600→700) as
 *  it lands. Stepped by design (font instances, not tweened), 2f per step. */
export const WeightPush: React.FC<{
  text: string;
  at: number;
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  steps?: number[];
  style?: React.CSSProperties;
}> = ({
  text,
  at,
  fontFamily = FONT_BODY,
  fontSize = 64,
  color = '#F4F2EC',
  steps = [400, 500, 600, 700],
  style,
}) => {
  const f = useCurrentFrame();
  const step = Math.min(steps.length - 1, Math.max(0, Math.floor((f - at) / 2)));
  const weightNow = steps[Math.max(0, step)];
  const opa = mprog(f, at, 4);
  return (
    <span
      style={{
        fontFamily,
        fontSize,
        color,
        fontWeight: weightNow,
        opacity: opa,
        fontVariationSettings: `'wght' ${weightNow}`,
        display: 'inline-block',
        ...style,
      }}
    >
      {text}
    </span>
  );
};

// ===========================================================================
// 5. TRANSITIONS — outgoing and incoming move IN UNISON
// ===========================================================================
// Material's system, encoded: shared-axis (x=peer, y=steps, z=hierarchy),
// fade-through (out fully out, in scales 92→100%), wipe (directional mask that
// matches content momentum), iris (circle focus). Scene A exits with spec S while
// scene B enters with the SAME S — pass one object to both sides.

export type TransSpec = {
  kind: 'axisX' | 'axisY' | 'axisZ' | 'fadeThrough' | 'wipe' | 'iris';
  dir?: 1 | -1; // travel direction (axisX/axisY/wipe)
  d?: number; // duration frames (default MGD.transit)
};

/** TransWindow: wrap a scene's content. enter = entering at scene START,
 *  exit = exiting at scene END (set exitAt = scene duration; the exit plays over
 *  the LAST d frames). The master passes the same TransSpec to A's exit and B's
 *  enter so they move in unison across the cut. */
export const TransWindow: React.FC<{
  enter?: TransSpec;
  exitAt?: number; // frame (local) where the exit ends = scene length
  exit?: TransSpec;
  children: React.ReactNode;
}> = ({ enter, exit, exitAt, children }) => {
  const f = useCurrentFrame();
  const d = exit?.d ?? MGD.transit;

  // ENTER side (first d frames of the scene)
  let enterStyle: React.CSSProperties = {};
  if (enter) {
    const u = mprog(f, 0, enter.d ?? MGD.transit, MGE.decel);
    const dir = enter.dir ?? 1;
    const travel = (1 - u) * 26; // % of frame
    const o = mprog(f, 0, Math.round((enter.d ?? MGD.transit) * 0.8));
    switch (enter.kind) {
      case 'axisX':
        enterStyle = { transform: `translateX(${dir * travel}%)`, opacity: o };
        break;
      case 'axisY':
        enterStyle = { transform: `translateY(${dir * travel}%)`, opacity: o };
        break;
      case 'axisZ':
        // z = hierarchy: incoming comes DOWN from above (bigger)
        enterStyle = { transform: `scale(${1 + 0.12 * (1 - u)})`, opacity: o };
        break;
      case 'fadeThrough':
        // incoming waits for the outgoing to clear: starts at 40% of window
        enterStyle = { transform: `scale(${0.92 + 0.08 * mprog(f, Math.round(d * 0.4), d, MGE.decel)})`, opacity: mprog(f, Math.round(d * 0.4), Math.round(d * 0.6)) };
        break;
      case 'wipe':
        enterStyle = { clipPath: `inset(0 ${(1 - u) * 100}% 0 0)`, transform: `translateX(${dir * (1 - u) * 5}%)` };
        break;
      case 'iris':
        enterStyle = { clipPath: `circle(${u * 130}% at 50% 50%)` };
        break;
    }
  }

  // EXIT side (last d frames)
  let exitStyle: React.CSSProperties = {};
  if (exit && exitAt != null) {
    const x0 = exitAt - d;
    const u = mprog(f, x0, d, MGE.accel);
    const dir = exit.dir ?? 1;
    const travel = u * 26;
    const o = 1 - mprog(f, x0, Math.round(d * 0.8));
    switch (exit.kind) {
      case 'axisX':
        exitStyle = { transform: `translateX(${dir * travel}%)`, opacity: o };
        break;
      case 'axisY':
        exitStyle = { transform: `translateY(${dir * travel}%)`, opacity: o };
        break;
      case 'axisZ':
        exitStyle = { transform: `scale(${1 - 0.08 * u})`, opacity: o };
        break;
      case 'fadeThrough':
        exitStyle = { opacity: 1 - mprog(f, x0, Math.round(d * 0.5)) };
        break;
      case 'wipe':
        exitStyle = { clipPath: `inset(0 0 0 ${u * 100}%)` };
        break;
      case 'iris':
        exitStyle = { clipPath: `circle(${(1 - u) * 130}% at 50% 50%)` };
        break;
    }
  }

  return (
    <AbsoluteFill style={{ ...enterStyle, ...exitStyle, willChange: 'transform, opacity' }}>
      {children}
    </AbsoluteFill>
  );
};

// ===========================================================================
// 6. GRID CHOREOGRAPHY — the layout system
// ===========================================================================

/** GridCascade: tiles enter in index order with 2-4f stagger, decelerate, then
 *  hold as a complete grid. THE layout-move of explainers and catalogues. */
export const GridCascade: React.FC<{
  cols: number;
  gap?: number;
  at?: number;
  staggerF?: number;
  cellDur?: number;
  cellStyle?: React.CSSProperties;
  children: React.ReactNode[];
  style?: React.CSSProperties;
}> = ({ cols, gap = 24, at = 0, staggerF = MGS.cell, cellDur = MGD.modal, cellStyle, children, style }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap,
      ...style,
    }}
  >
    {children.map((c, i) => (
      <Sequence key={i} from={at + i * staggerF} durationInFrames={cellDur + 20} layout="none">
        <GridCell d={cellDur} cellStyle={cellStyle}>
          {c}
        </GridCell>
      </Sequence>
    ))}
  </div>
);

const GridCell: React.FC<{ d: number; cellStyle?: React.CSSProperties; children: React.ReactNode }> = ({
  d,
  cellStyle,
  children,
}) => {
  const f = useCurrentFrame();
  const u = mprog(f, 0, d, MGE.decel);
  return (
    <div
      style={{
        opacity: u,
        transform: `translateY(${(1 - u) * 16}px) scale(${0.96 + 0.04 * u})`,
        ...cellStyle,
      }}
    >
      {children}
    </div>
  );
};

/** SplitScreen: two panes revealed along the split line, contents stagger per
 *  pane. The classic compare format (before/after, us/them, was/is). */
export const SplitScreen: React.FC<{
  left: React.ReactNode;
  right: React.ReactNode;
  at?: number;
  dur?: number;
  ratio?: number; // 0.5 = equal
  style?: React.CSSProperties;
}> = ({ left, right, at = 0, dur = MGD.scene, ratio = 0.5, style }) => {
  const f = useCurrentFrame();
  const u = mprog(f, at, dur, MGE.decel);
  const split = ratio * 100;
  return (
    <div style={{ display: 'flex', height: '100%', ...style }}>
      <div
        style={{
          width: `${split * u}%`,
          minWidth: 0,
          overflow: 'hidden',
          borderRight: `${Math.round(2 + 2 * u)}px solid rgba(255,255,255,0.16)`,
        }}
      >
        {left}
      </div>
      <div style={{ flex: 1, minWidth: 0, overflow: 'hidden', opacity: mprog(f, at + Math.round(dur * 0.5), Math.round(dur * 0.5)) }}>
        {right}
      </div>
    </div>
  );
};

// ===========================================================================
// 7. DATA MOTION — counters, bars, arcs, self-drawing strokes
// ===========================================================================

/** Counter: 1-2s ease-out (1.2s sweet spot — slower and people scroll past).
 *  Tabular numerals so digits don't jitter. Ticks sync to the count's landing. */
export const Counter: React.FC<{
  to: number;
  at?: number;
  dur?: number;
  from?: number;
  format?: (v: number) => string;
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({
  to,
  at = 0,
  dur = MGD.counter,
  from = 0,
  format,
  fontFamily = FONT_MONO,
  fontSize = 140,
  color = '#F4F2EC',
  style,
}) => {
  const f = useCurrentFrame();
  const u = mprog(f, at, dur, MGE.outExpo);
  const v = from + (to - from) * u;
  // landing pulse: the last digit settles with a tiny overshoot
  const pulse = 1 + (u >= 1 ? overshoot(f, at + dur, 0.03, 6) : 0);
  const shown = format ? format(v) : Math.round(v).toLocaleString('en-US');
  return (
    <span
      style={{
        fontFamily,
        fontSize,
        fontWeight: 600,
        color,
        fontVariantNumeric: 'tabular-nums',
        display: 'inline-block',
        transform: `scale(${pulse})`,
        ...style,
      }}
    >
      {shown}
    </span>
  );
};

/** DataBar: a measure bar that draws from its origin (trim-path feel) on the
 *  same curve as its counter. origin: 'left' (horizontal) — for vertical bars
 *  wrap it and set transformOrigin bottom. */
export const DataBar: React.FC<{
  frac: number; // 0..1 length target
  at?: number;
  dur?: number;
  w?: number; // full-width px
  h?: number;
  color?: string;
  track?: string;
  radius?: number;
  style?: React.CSSProperties;
}> = ({ frac, at = 0, dur = MGD.counter, w = 640, h = 56, color = '#E8C559', track = 'rgba(255,255,255,0.10)', radius = h / 2, style }) => {
  const f = useCurrentFrame();
  const u = mprog(f, at, dur, MGE.outExpo);
  const width = Math.max(0, w * frac * u);
  return (
    <div style={{ width: w, height: h, background: track, borderRadius: radius, overflow: 'hidden', ...style }}>
      <div
        style={{
          width,
          height: '100%',
          background: color,
          borderRadius: radius,
          transformOrigin: 'left center',
        }}
      />
    </div>
  );
};

/** DataArc: an SVG arc that sweeps (stroke draw) — gauges, progress rings. */
export const DataArc: React.FC<{
  frac: number;
  at?: number;
  dur?: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  sweep?: number; // degrees, default 270
  style?: React.CSSProperties;
}> = ({ frac, at = 0, dur = MGD.counter, size = 360, stroke = 30, color = '#5CD0B3', track = 'rgba(255,255,255,0.10)', sweep = 270, style }) => {
  const f = useCurrentFrame();
  const u = mprog(f, at, dur, MGE.outExpo);
  const r = (size - stroke) / 2;
  const c = size / 2;
  const startA = -90 - sweep / 2 + 360;
  const circumference = 2 * Math.PI * r;
  const fullLen = (sweep / 360) * circumference;
  return (
    <svg width={size} height={size} style={style}>
      <circle
        cx={c}
        cy={c}
        r={r}
        fill="none"
        stroke={track}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${fullLen} ${circumference}`}
        transform={`rotate(${startA} ${c} ${c})`}
      />
      <circle
        cx={c}
        cy={c}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${fullLen * frac * u} ${circumference}`}
        transform={`rotate(${startA} ${c} ${c})`}
      />
    </svg>
  );
};

/** DrawStroke: a path that draws itself (self-drawing outline — the clean
 *  infographic look). Pass an SVG path `d`, viewBox 0 0 1080 1920. */
export const DrawStroke: React.FC<{
  d: string;
  at?: number;
  dur?: number;
  w?: number;
  color?: string;
  viewBox?: string;
  style?: React.CSSProperties;
}> = ({ d, at = 0, dur = MGD.scene, w = 6, color = '#E8C559', viewBox = '0 0 1080 1920', style }) => {
  const f = useCurrentFrame();
  const u = mprog(f, at, dur, MGE.decel);
  // measure via pathLength trick: dasharray on the browser-normalized 0..1
  return (
    <svg viewBox={viewBox} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', ...style }}>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={w}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={`${u} 1`}
      />
    </svg>
  );
};

// ===========================================================================
// 8. ORDER → CHAOS → ORDER — the emotional arc as a component
// ===========================================================================
/** ChaosField: N items hold the grid (≥30f), burst (8-15f, seeded scatter +
 *  rotation), then reassemble (15-30f, staggered settles with overshoot).
 *  The single most reliable "expensive" moment in motion graphics. */
export const ChaosField: React.FC<{
  items: React.ReactNode[];
  at: number; // frame the ordered grid is complete
  holdF?: number; // ordered hold before the burst (≥30)
  burstF?: number;
  resolveF?: number;
  seed?: string;
  spread?: number; // px max scatter
  cellStyle?: React.CSSProperties;
  style?: React.CSSProperties;
}> = ({
  items,
  at,
  holdF = 32,
  burstF = 10,
  resolveF = 24,
  seed = 'chaos',
  spread = 260,
  cellStyle,
  style,
}) => {
  const burstAt = at + holdF;
  const resolveAt = burstAt + burstF;
  const doneAt = resolveAt + resolveF;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignContent: 'center', justifyContent: 'center', gap: 20, ...style }}>
      {items.map((item, i) => {
        const s = `${seed}-${i}`;
        const tx = (random(`${s}-x`) * 2 - 1) * spread;
        const ty = (random(`${s}-y`) * 2 - 1) * spread * 0.7;
        const rot = (random(`${s}-r`) * 2 - 1) * 38;
        const settleDelay = Math.round(random(`${s}-d`) * 12);
        return (
          <Sequence key={i} from={0} durationInFrames={doneAt + 40} layout="none">
            <ChaosCell
              burstAt={burstAt}
              burstF={burstF}
              resolveAt={resolveAt + settleDelay}
              resolveF={resolveF}
              tx={tx}
              ty={ty}
              rot={rot}
              cellStyle={cellStyle}
            >
              {item}
            </ChaosCell>
          </Sequence>
        );
      })}
    </div>
  );
};

const ChaosCell: React.FC<{
  burstAt: number;
  burstF: number;
  resolveAt: number;
  resolveF: number;
  tx: number;
  ty: number;
  rot: number;
  cellStyle?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ burstAt, burstF, resolveAt, resolveF, tx, ty, rot, cellStyle, children }) => {
  const f = useCurrentFrame();
  // order → chaos: explode out (accelerate)
  const burst = mprog(f, burstAt, burstF, MGE.accel);
  // chaos → order: return with a springy settle (outBack)
  const back = mprog(f, resolveAt, resolveF, MGE.outBack);
  const u = burst * (1 - back);
  const scale = 1 + 0.12 * u * (1 - back);
  return (
    <div
      style={{
        transform: `translate(${tx * u}px, ${ty * u}px) rotate(${rot * u}deg) scale(${scale})`,
        opacity: 1 - 0.25 * u,
        ...cellStyle,
      }}
    >
      {children}
    </div>
  );
};

// ===========================================================================
// 9. THE STAT MOMENT — BigStat (count + label + source)
// ===========================================================================
/** BigStat: the full "number lands" kit — counter with tabular digits, unit,
 *  label beneath on a mask reveal, source line fading last. Reads on mute. */
export const BigStat: React.FC<{
  value: number;
  unit?: string;
  label: string;
  source?: string;
  at?: number;
  counterDur?: number;
  palette?: MgPalette;
  fontFamily?: string;
  valueSize?: number;
  align?: 'left' | 'center';
  style?: React.CSSProperties;
}> = ({
  value,
  unit,
  label,
  source,
  at = 0,
  counterDur = MGD.counter,
  palette = MGP.ink,
  fontFamily = FONT_IMPACT,
  valueSize = 200,
  align = 'left',
  style,
}) => {
  const f = useCurrentFrame();
  const labelAt = at + Math.round(counterDur * 0.55);
  const srcAt = labelAt + 8;
  return (
    <div style={{ textAlign: align, ...style }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, justifyContent: align === 'center' ? 'center' : 'flex-start' }}>
        <Counter
          to={value}
          at={at}
          dur={counterDur}
          fontFamily={fontFamily}
          fontSize={valueSize}
          color={palette.accent}
        />
        {unit ? (
          <KineticText
            split="word"
            reveal="rise"
            at={at + Math.round(counterDur * 0.7)}
            staggerF={3}
            atomDur={8}
            fontFamily={FONT_DISPLAY}
            fontSize={Math.round(valueSize * 0.36)}
            weight={600}
            color={palette.inkDim}
          >
            {unit}
          </KineticText>
        ) : null}
      </div>
      <MaskReveal at={labelAt} dur={10} style={{ marginTop: 8 }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 46, fontWeight: 600, color: palette.ink, letterSpacing: 0.2 }}>
          {label}
        </div>
      </MaskReveal>
      {source ? (
        <div
          style={{
            fontFamily: FONT_BODY,
            fontSize: 28,
            color: palette.inkDim,
            marginTop: 14,
            opacity: mprog(f, srcAt, 10),
          }}
        >
          {source}
        </div>
      ) : null}
    </div>
  );
};

// ===========================================================================
// 10. FURNITURE — safe area, kicker chips, phone-tested contrast
// ===========================================================================
export const MG_SAFE = { x0: 60, x1: 940, y0: 250, y1: 1500 } as const; // 9:16 phone UI

export const PhoneSafe: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({
  children,
  style,
}) => (
  <AbsoluteFill style={{ padding: `${MG_SAFE.y0}px ${MG_SAFE.x0}px ${1920 - MG_SAFE.y1}px` }}>
    <AbsoluteFill style={style}>{children}</AbsoluteFill>
  </AbsoluteFill>
);

/** KickerChip: the small mono tag top-left (section furniture). Pops in with
 *  overshoot, never more than one on screen. */
export const KickerChip: React.FC<{
  text: string;
  at?: number;
  color?: string;
  bg?: string;
  style?: React.CSSProperties;
}> = ({ text, at = 0, color = '#0E0E10', bg = '#E8C559', style }) => {
  const f = useCurrentFrame();
  const u = mprog(f, at, MGD.press, MGE.outBack);
  return (
    <div
      style={{
        fontFamily: FONT_MONO,
        fontSize: 26,
        fontWeight: 500,
        letterSpacing: 1.6,
        textTransform: 'uppercase',
        color,
        background: bg,
        padding: '10px 18px',
        borderRadius: 8,
        display: 'inline-block',
        opacity: Math.min(1, u * 1.6),
        transform: `scale(${0.85 + 0.15 * u})`,
        ...style,
      }}
    >
      {text}
    </div>
  );
};

/** Shape: the primitive geometric actor (rounded rect / circle / bar) with a
 *  landing animation. Motion graphics' "character". Anchors matter: default
 *  bottom-center (up-swings); icons from corners; cards from trailing edge. */
export const Shape: React.FC<{
  kind?: 'rect' | 'circle' | 'bar';
  w?: number;
  h?: number;
  r?: number;
  color?: string;
  at?: number;
  dur?: number;
  from?: 'below' | 'above' | 'left' | 'right' | 'scale';
  anchor?: string;
  style?: React.CSSProperties;
}> = ({ kind = 'rect', w = 200, h = 200, r = 28, color = '#5CD0B3', at = 0, dur = MGD.modal, from = 'below', anchor, style }) => {
  const f = useCurrentFrame();
  const u = mprog(f, at, dur, MGE.outBack);
  const travel = (1 - u) * 42;
  const enter: Record<string, string> = {
    below: `translateY(${travel}px)`,
    above: `translateY(${-travel}px)`,
    left: `translateX(${-travel}px)`,
    right: `translateX(${travel}px)`,
    scale: `scale(${0.6 + 0.4 * u})`,
  };
  const borderRadius = kind === 'circle' ? '50%' : kind === 'bar' ? h / 2 : r;
  const width = kind === 'bar' ? w * 3 : w;
  const height = kind === 'bar' ? h / 3.2 : h;
  return (
    <div
      style={{
        width,
        height,
        background: color,
        borderRadius,
        opacity: Math.min(1, u * 2),
        transform: `${enter[from]} scale(${0.97 + 0.03 * u})`,
        transformOrigin: anchor ?? 'center bottom',
        ...style,
      }}
    />
  );
};

// ===========================================================================
// 11. SFX CUE HELPERS — whoosh DURING the move, hit AT the landing
// ===========================================================================
/** The frame-locked cue map for the foley sheet: every animation exposes its
 *  landing frames; the whoosh starts at (land - dur), the hit lands on land. */
export const cue = (landF: number, durF: number) => ({ whooshAt: landF - Math.round(durF * 0.8), hitAt: landF });

/** Standard cue map from a KineticText block (one tick per atom cluster). */
export const typeCues = (at: number, nAtoms: number, staggerF: number, dur: number) =>
  Array.from({ length: Math.ceil(nAtoms / 3) }, (_, i) => {
    const land = at + Math.min(i * 3 * staggerF + dur, (nAtoms - 1) * staggerF + dur);
    return cue(land, 6);
  });

// re-exports for scene convenience
export { FONT_BODY, FONT_DISPLAY, FONT_HEAVY, FONT_IMPACT, FONT_MONO };
