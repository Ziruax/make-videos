// Tactile kit — the minimal-reel primitives (paper-finish treatment + metaphor scenes).
// Encodes the Minimal-Reel practice-kit spec: halftone/paper/grain/noise/chromatic split/
// exposure flicker/vignette/peripheral blur, plus WaveSurface, PaperTag, ContourLines,
// IgnitionSteps and the 3-colour theme. ALL frame-based (vidtsx hard rules): every value
// is a pure function of useCurrentFrame() — scrubbing backwards lands on the same result.
//
// The one law of this kit: TWO KINDS OF TEXTURE.
//   - screen-level finish (this file's <Tactile>) is FIXED to the output frame;
//   - object-bound texture (paper on the submerged iceberg, grade on the dollars) is
//     applied INSIDE the object's transformed wrapper so it travels with the object.
// Mixing these up makes a pattern appear to slide over the artwork.
import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { boil, posterizeFrame } from './engine';

// ---------------------------------------------------------------------------
// Theme — one shared palette so a change carries across the reel.
// Three base colours + one supporting muted. Light scenes: ivory bg + teal text.
// Dark scenes: teal bg + ivory text. Muted teal for supporting details.
// ---------------------------------------------------------------------------
export const MR = {
  ivory: '#F1EDE4',
  ink: '#080F16',
  teal: '#17343D',
  mutedTeal: '#527C80',
  // warm gold for the single "claim" accent (the tag). ONE accent per reel.
  gold: '#E8C559',
} as const;

// Saved treatment defaults (the practice kit's shipped settings — good out of the box).
export const TACTILE_DEFAULTS = {
  halftone: { opacity: 0.5, spacing: 6.7, dotSize: 0.57, angle: 63, contrast: 0.61 },
  paperOpacity: 0.19,
  paperBrightness: 0.65,
  grainOpacity: 0.29,
  noiseOpacity: 0.14,
  chromaticSplit: 1.5, // px
  edgeSplit: 4,        // px (edges only, clear centre)
  shake: 1,            // px amplitude
  exposureFlicker: 0.04,
  vignette: 0.22,
  peripheralBlur: 8,   // design px, clear centre, TEXT SITS ABOVE this
} as const;

// ---------------------------------------------------------------------------
// Halftone — SVG dot grid, Multiply blend. The print-quality base of the finish.
// ---------------------------------------------------------------------------
export const Halftone: React.FC<{
  opacity?: number; spacing?: number; dotSize?: number; angle?: number; color?: string;
}> = ({
  opacity = TACTILE_DEFAULTS.halftone.opacity,
  spacing = TACTILE_DEFAULTS.halftone.spacing,
  dotSize = TACTILE_DEFAULTS.halftone.dotSize,
  angle = TACTILE_DEFAULTS.halftone.angle,
  color = MR.ink,
}) => {
  const r = spacing * dotSize * 0.5;
  const id = React.useId().replace(/:/g, '');
  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', mixBlendMode: 'multiply', opacity }}
      viewBox="0 0 1080 1920"
      preserveAspectRatio="none"
    >
      <defs>
        <pattern id={`ht-${id}`} width={spacing} height={spacing} patternUnits="userSpaceOnUse" patternTransform={`rotate(${angle})`}>
          <circle cx={spacing / 2} cy={spacing / 2} r={r} fill={color} />
        </pattern>
      </defs>
      <rect width="1080" height="1920" fill={`url(#ht-${id})`} />
    </svg>
  );
};

// ---------------------------------------------------------------------------
// Procedural monochrome noise (feTurbulence, seed = frame). No asset needed.
// ---------------------------------------------------------------------------
const NoiseLayer: React.FC<{ opacity: number; seed: number; fps: number }> = ({ opacity, seed, fps }) => {
  const f = posterizeFrame(useCurrentFrame(), fps, 15);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='270' height='480'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='${seed + f * 13}' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='270' height='480' filter='url(#n)'/></svg>`;
  const uri = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  return (
    <div
      style={{
        position: 'absolute', inset: 0, opacity,
        backgroundImage: `url("${uri}")`, backgroundSize: '540px 960px',
        mixBlendMode: 'overlay',
      }}
    />
  );
};

// ---------------------------------------------------------------------------
// Tactile — THE shared finish wrapper. Screen-level only: fixed to the frame.
//   <Tactile paperFile="mr-1/paper.png" grainFile="mr-1/grain01.png">
//     ...scene artwork (WITHOUT text)...
//     <Text/>  ← text can also live inside; it rides ABOVE peripheral blur.
//   </Tactile>
// Layer order (bottom→top): artwork → halftone → paper → grain → noise →
// chromatic-split copies → exposure flicker → vignette → peripheral blur.
// Every layer is a prop; set one to 0/false to isolate it while tuning.
// ---------------------------------------------------------------------------
export const Tactile: React.FC<{
  children: React.ReactNode;
  paperFile?: string;   // under public/ (seamless paper texture PNG); omit = skip
  grainFile?: string;   // under public/ (grain still); omit = procedural noise only
  halftone?: boolean; paper?: boolean; grain?: boolean; noise?: boolean;
  chromatic?: boolean; flicker?: boolean; vignette?: boolean; peripheral?: boolean;
  halftoneOpacity?: number; paperOpacity?: number; grainOpacity?: number;
  noiseOpacity?: number; chromaticSplit?: number; edgeSplit?: number;
  shakeStrength?: number; flickerAmount?: number; vignetteAmount?: number;
  peripheralBlurPx?: number;
  stepFps?: number;     // cadence snap (15 = the minimal-reel cadence)
}> = ({
  children,
  paperFile, grainFile,
  halftone = true, paper = true, grain = true, noise = true,
  chromatic = true, flicker = true, vignette = true, peripheral = true,
  halftoneOpacity = TACTILE_DEFAULTS.halftone.opacity,
  paperOpacity = TACTILE_DEFAULTS.paperOpacity,
  grainOpacity = TACTILE_DEFAULTS.grainOpacity,
  noiseOpacity = TACTILE_DEFAULTS.noiseOpacity,
  chromaticSplit = TACTILE_DEFAULTS.chromaticSplit,
  edgeSplit = TACTILE_DEFAULTS.edgeSplit,
  shakeStrength = TACTILE_DEFAULTS.shake,
  flickerAmount = TACTILE_DEFAULTS.exposureFlicker,
  vignetteAmount = TACTILE_DEFAULTS.vignette,
  peripheralBlurPx = TACTILE_DEFAULTS.peripheralBlur,
  stepFps = 15,
}) => {
  const raw = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = posterizeFrame(raw, fps, stepFps);

  // gate weave: ±1px stepped shake, scaled by shakeStrength
  const shx = boil(f, 3, 1, 2) * shakeStrength;
  const shy = boil(f, 7, 1, 2) * shakeStrength;
  // exposure flicker: slow 1+flicker oscillation
  const ex = 1 + flickerAmount * boil(f, 11, 1, 4);

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `translate(${shx}px, ${shy}px) scale(1.012)`, filter: `brightness(${ex})` }}>
        {/* base + channel-split copies */}
        <AbsoluteFill>{children}</AbsoluteFill>
        {chromatic && (
          <>
            <AbsoluteFill style={{ mixBlendMode: 'screen', opacity: 0.32, transform: `translateX(${-chromaticSplit}px)` }}>
              <div style={{ position: 'absolute', inset: 0, background: '#ff002d', mixBlendMode: 'multiply' }} />
              <AbsoluteFill>{children}</AbsoluteFill>
            </AbsoluteFill>
            <AbsoluteFill style={{ mixBlendMode: 'screen', opacity: 0.32, transform: `translateX(${chromaticSplit}px)` }}>
              <div style={{ position: 'absolute', inset: 0, background: '#00d9ff', mixBlendMode: 'multiply' }} />
              <AbsoluteFill>{children}</AbsoluteFill>
            </AbsoluteFill>
            {/* edge split: the aberration gets stronger near the frame edges only */}
            {edgeSplit > 0 && (
              <>
                <AbsoluteFill
                  style={{
                    mixBlendMode: 'screen', opacity: 0.22, transform: `translateX(${-edgeSplit}px)`,
                    maskImage: 'radial-gradient(ellipse 78% 84% at 50% 46%, transparent 62%, black 100%)',
                    WebkitMaskImage: 'radial-gradient(ellipse 78% 84% at 50% 46%, transparent 62%, black 100%)',
                  }}
                >
                  <div style={{ position: 'absolute', inset: 0, background: '#ff002d', mixBlendMode: 'multiply' }} />
                  <AbsoluteFill>{children}</AbsoluteFill>
                </AbsoluteFill>
                <AbsoluteFill
                  style={{
                    mixBlendMode: 'screen', opacity: 0.22, transform: `translateX(${edgeSplit}px)`,
                    maskImage: 'radial-gradient(ellipse 78% 84% at 50% 46%, transparent 62%, black 100%)',
                    WebkitMaskImage: 'radial-gradient(ellipse 78% 84% at 50% 46%, transparent 62%, black 100%)',
                  }}
                >
                  <div style={{ position: 'absolute', inset: 0, background: '#00d9ff', mixBlendMode: 'multiply' }} />
                  <AbsoluteFill>{children}</AbsoluteFill>
                </AbsoluteFill>
              </>
            )}
          </>
        )}
        {halftone && <Halftone opacity={halftoneOpacity} />}
        {paper && (paperFile ? (
          <Img
            src={staticFile(paperFile)}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', mixBlendMode: 'multiply', opacity: paperOpacity, filter: `brightness(${TACTILE_DEFAULTS.paperBrightness})` }}
          />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: MR.ivory, mixBlendMode: 'multiply', opacity: paperOpacity * 0.55, filter: `brightness(${TACTILE_DEFAULTS.paperBrightness})` }} />
        ))}
        {grain && grainFile && (
          <Img
            src={staticFile(grainFile)}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', mixBlendMode: 'overlay', opacity: grainOpacity }}
          />
        )}
        {noise && <NoiseLayer opacity={noiseOpacity} seed={5} fps={fps} />}
        {vignette && (
          <div
            style={{
              position: 'absolute', inset: 0,
              background: `radial-gradient(ellipse 92% 82% at 50% 48%, transparent 55%, rgba(8,15,22,${vignetteAmount}) 100%)`,
            }}
          />
        )}
      </AbsoluteFill>
      {peripheral && (
        <AbsoluteFill
          style={{
            filter: `blur(${peripheralBlurPx}px)`,
            maskImage: 'radial-gradient(ellipse 72% 78% at 50% 46%, transparent 52%, black 88%)',
            WebkitMaskImage: 'radial-gradient(ellipse 72% 78% at 50% 46%, transparent 52%, black 88%)',
            pointerEvents: 'none',
          }}
        />
      )}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// WaveSurface — the water. Top edge sampled every 8px along a travelling sine;
// the SAME boundary splits above-water from submerged artwork (draw the submerged
// copy darker + its own underwater paper at ~0.13 inside the object's transform).
// `waveYAt(x, frame, cfg)` lets the buoy follow the LOCAL wave height.
// ---------------------------------------------------------------------------
export type WaveCfg = {
  centerY: number;     // resting surface centre Y (design px)
  amp: number;         // wave amplitude (px)
  wavelength: number;  // px per cycle
  cps: number;         // cycles per second (surface travel speed)
};

export const waveYAt = (x: number, frame: number, cfg: WaveCfg, fps = 15) => {
  const t = frame / fps;
  const phase = (x / cfg.wavelength - t * cfg.cps) * Math.PI * 2;
  return cfg.centerY + Math.sin(phase) * cfg.amp;
};

export const WaveSurface: React.FC<{
  cfg: WaveCfg; fill: string; sampleEvery?: number; below?: boolean; opacity?: number;
}> = ({ cfg, fill, sampleEvery = 8, below = true, opacity = 1 }) => {
  const f = useCurrentFrame();
  const pts: string[] = [];
  for (let x = -40; x <= 1120; x += sampleEvery) {
    const y = waveYAt(x, f, cfg);
    if (x === -40) pts.push(`M ${x} ${y}`);
    else pts.push(`L ${x} ${y}`);
  }
  const path = below
    ? `${pts.join(' ')} L 1120 1960 L -40 1960 Z` // close below the frame = fill underneath
    : `${pts.join(' ')} L 1120 -40 L -40 -40 Z`;  // close above (mask for the sky part)
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity }} viewBox="0 0 1080 1920" preserveAspectRatio="none">
      <path d={path} fill={fill} />
    </svg>
  );
};

// Two-layer split: renders children twice through the wave boundary clip so the
// submerged copy can be darkened + given its own object-bound paper texture.
export const WaterSplit: React.FC<{
  cfg: WaveCfg; children: React.ReactNode;
  belowStyle?: React.CSSProperties; aboveStyle?: React.CSSProperties;
}> = ({ cfg, children, belowStyle, aboveStyle }) => {
  const f = useCurrentFrame();
  const id = React.useId().replace(/:/g, '');
  let d = '';
  for (let x = -40; x <= 1120; x += 8) {
    const y = waveYAt(x, f, cfg);
    d += (d ? ' L ' : 'M ') + `${x} ${y}`;
  }
  const belowPath = `${d} L 1120 1960 L -40 1960 Z`;
  const abovePath = `${d} L 1120 -40 L -40 -40 Z`;
  return (
    <>
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <clipPath id={`below-${id}`}><path d={belowPath} /></clipPath>
          <clipPath id={`above-${id}`}><path d={abovePath} /></clipPath>
        </defs>
      </svg>
      <div style={{ position: 'absolute', inset: 0, clipPath: `url(#below-${id})`, ...belowStyle }}>{children}</div>
      <div style={{ position: 'absolute', inset: 0, clipPath: `url(#above-${id})`, ...aboveStyle }}>{children}</div>
    </>
  );
};

// ---------------------------------------------------------------------------
// Regular sine helpers — the iceberg/buoy/lamp motions (NOT noise; they repeat
// in an even rhythm). Amplitude = how far; frequency = how quickly it repeats.
// ---------------------------------------------------------------------------
export const sine = (frame: number, amp: number, cps: number, phase = 0, fps = 15) =>
  amp * Math.sin((frame / fps) * cps * Math.PI * 2 + phase);

// Irregular but REPEATABLE flutter (the folded paper corner): smooth noise,
// seeded so every render + both scrub directions agree.
export const flutter = (frame: number, strength = 1, rate = 2.4, seed = 21, fps = 15) => {
  const t = frame / fps;
  return strength * (Math.sin(t * rate * 2.1 + seed) * 0.5 + Math.sin(t * rate * 3.7 + seed * 1.7) * 0.35 + Math.sin(t * rate * 5.3 + seed * 0.6) * 0.15);
};

// Ignition — a FIXED stepped flicker sequence, never random flashing.
// Steps [0.85, 0.08, 1, 0.22, 0.7] over 0.49s then hold at 1 (the saved values).
export const IGNITION_STEPS = [0.85, 0.08, 1, 0.22, 0.7] as const;
export const ignition = (frame: number, startF: number, steps: readonly number[] = IGNITION_STEPS, spanF = 7.35, fps = 15) => {
  const t = frame - startF;
  if (t < 0) return 0;
  if (t >= spanF) return 1;
  const i = Math.min(steps.length - 1, Math.floor((t / spanF) * steps.length));
  return steps[i];
};

// ---------------------------------------------------------------------------
// PaperTag — the yellow "claim" sticker: a retained folded corner (never fully
// uncurls), reverse side slightly warmer + darker, a fine crease, flutter with
// irregular-but-repeatable noise. Put ONLY the payoff words inside.
// ---------------------------------------------------------------------------
export const PaperTag: React.FC<{
  x: number; y: number; rotate?: number;
  foldProgress?: number; // 0..1 turn duration ~0.85s worth
  flutterStrength?: number; restingCurl?: number;
  width?: number; height?: number; children: React.ReactNode;
  front?: string; reverse?: string;
}> = ({
  x, y, rotate = -3,
  foldProgress, flutterStrength = 1, restingCurl = 0.15,
  width = 560, height = 170, children,
  front = MR.gold, reverse = '#C9A13E',
}) => {
  const f = useCurrentFrame();
  const fl = flutter(f, flutterStrength);
  const fold = restingCurl + (foldProgress !== undefined ? foldProgress * (1 - restingCurl) : 0);
  const foldW = width * 0.12 * (1 - fold * 0.55);
  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height, transform: `rotate(${rotate + fl * 0.6}deg)` }}>
      {/* reverse side (peeks from the folded corner): warmer + darker */}
      <div
        style={{
          position: 'absolute', right: 0, top: -4, width: foldW, height,
          background: reverse, borderRadius: '0 6px 6px 0',
          transform: `skewY(${fl * 1.4}deg)`,
          boxShadow: 'inset 6px 0 12px rgba(8,15,22,0.28)',
        }}
      />
      {/* front face */}
      <div
        style={{
          position: 'absolute', left: 0, top: 0, width: width - foldW, height,
          background: front, borderRadius: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 18px 34px rgba(8,15,22,0.34)',
          transform: `skewY(${-fl * 0.4}deg)`,
          padding: '0 34px',
        }}
      >
        {children}
      </div>
      {/* the fine crease */}
      <div
        style={{
          position: 'absolute', right: foldW, top: 2, width: 2, height: height - 4,
          background: 'rgba(8,15,22,0.22)', filter: 'blur(0.5px)',
          transform: `translateX(${fl * 0.5}px)`,
        }}
      />
    </div>
  );
};

// ---------------------------------------------------------------------------
// ContourLines — the ivory scene's backdrop: 29 curved lines, 39px apart,
// 1.7px strokes, low opacity, fading toward the outer area. They TRAVEL AND
// SCALE WITH THE SCENE (they live inside the scene transform, not above it).
// ---------------------------------------------------------------------------
export const ContourLines: React.FC<{
  count?: number; spacing?: number; strokeWidth?: number; opacity?: number; color?: string;
}> = ({
  count = 29, spacing = 39, strokeWidth = 1.7, opacity = 0.32, color = MR.mutedTeal,
}) => {
  const paths: React.ReactNode[] = [];
  for (let i = 0; i < count; i++) {
    const y = 340 + i * spacing;
    const sag = 60 + (i % 5) * 26; // gentle per-line variation, deterministic
    paths.push(
      <path
        key={i}
        d={`M -60 ${y} C 280 ${y - sag}, 800 ${y + sag * 0.7}, 1140 ${y}`}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        opacity={opacity * (1 - Math.pow(i / count, 1.6))} // fade toward the outer area
      />
    );
  }
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 1080 1920" preserveAspectRatio="none">
      {paths}
    </svg>
  );
};

// ---------------------------------------------------------------------------
// TwoToneText — the vision-cone trick: two identical copies of the text, one
// per background colour, and a mask that reveals the second only where the
// cone crosses. A letter changes colour exactly where the cone crosses it.
// ---------------------------------------------------------------------------
export const TwoToneText: React.FC<{
  style?: React.CSSProperties;
  maskPath?: string; // SVG path of the revealing cone (userSpaceOnUse 1080×1920)
  children: React.ReactNode;
}> = ({ style, maskPath, children }) => {
  const id = React.useId().replace(/:/g, '');
  return (
    <div style={{ position: 'relative', ...style }}>
      <div style={{ color: MR.teal }}>{children}</div>
      {maskPath && (
        <>
          <svg width="0" height="0" style={{ position: 'absolute' }}>
            <defs><clipPath id={`tt-${id}`}><path d={maskPath} /></clipPath></defs>
          </svg>
          <div style={{ position: 'absolute', inset: 0, clipPath: `url(#tt-${id})`, color: MR.ivory }}>{children}</div>
        </>
      )}
    </div>
  );
};
