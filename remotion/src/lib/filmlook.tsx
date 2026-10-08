// FilmLook — the reusable "aged film" treatment wrapper (documentary reels).
// Layer order top-to-bottom (matches the practice-kit spec):
//   1. scan lines   — 1.6px black lines @16% opacity every 8px, 0.7px blur
//   2. grain        — grain.jpg, multiply, inverted (brightness 1.35 / contrast 1.02) @55%
//   3. grunge       — grunge.jpg, colour-burn @16%
//   4. vignette     — radial ellipse 92% x 82% @ 50%/48%, clear to 55%, black @50% by edge
//   5. grade        — saturate/contrast/sepia/brightness (per-scene props)
//   6. gate weave   — stepped 12fps jitter, ~5px travel, frame scaled 1.012 to hide edges
// Everything rides the engine's posterize step. Every layer has a toggle.
// Textures are OPTIONAL: if grain/grunge paths are not passed, those layers skip.
import React from 'react';
import { Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { boil, posterizeFrame } from './engine';

export type FilmLookProps = {
  children: React.ReactNode;
  // per-scene grade
  saturate?: number;
  contrast?: number;
  sepia?: number;
  brightness?: number;
  // layer toggles
  scanLines?: boolean;
  grain?: boolean;
  grunge?: boolean;
  vignette?: boolean;
  gateWeave?: boolean;
  // texture file names under public/ (e.g. 'grain.jpg'); omit to skip
  grainFile?: string;
  grungeFile?: string;
  // grain opacity overrides
  grainOpacity?: number;
  grungeOpacity?: number;
  // posterize target fps (12 = stop-motion feel)
  stepFps?: number;
};

export const FilmLook: React.FC<FilmLookProps> = ({
  children,
  saturate = 0.86,
  contrast = 1.08,
  sepia = 0.16,
  brightness = 0.95,
  scanLines = true,
  grain = true,
  grunge = true,
  vignette = true,
  gateWeave = true,
  grainFile,
  grungeFile,
  grainOpacity = 0.55,
  grungeOpacity = 0.16,
  stepFps = 12,
}) => {
  const rawFrame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = posterizeFrame(rawFrame, fps, stepFps);
  // gate weave: stepped wiggle, ~5px of travel, both axes
  const wx = gateWeave ? boil(f, 3, 2.5, Math.max(1, Math.round(fps / stepFps))) : 0;
  const wy = gateWeave ? boil(f, 7, 2.5, Math.max(1, Math.round(fps / stepFps))) : 0;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        transform: `scale(1.012) translate(${wx}px, ${wy}px)`,
        filter: `saturate(${saturate}) contrast(${contrast}) sepia(${sepia}) brightness(${brightness})`,
        overflow: 'hidden',
      }}
    >
      {children}

      {/* 2. grain — inverted multiply sandwich */}
      {grain && grainFile && (
        <Img
          src={staticFile(grainFile)}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            mixBlendMode: 'multiply', opacity: grainOpacity,
            filter: 'invert(1) brightness(1.35) contrast(1.02)',
          }}
        />
      )}

      {/* 3. grunge — colour-burn */}
      {grunge && grungeFile && (
        <Img
          src={staticFile(grungeFile)}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            mixBlendMode: 'color-burn', opacity: grungeOpacity,
          }}
        />
      )}

      {/* 1. scan lines — vertical, 1.6px black @16% every 8px, 0.7px blur */}
      {scanLines && (
        <div
          style={{
            position: 'absolute', inset: 0,
            backgroundImage:
              'repeating-linear-gradient(to right, rgba(0,0,0,0.16) 0px, rgba(0,0,0,0.16) 1.6px, transparent 1.6px, transparent 8px)',
            filter: 'blur(0.7px)',
          }}
        />
      )}

      {/* 4. vignette */}
      {vignette && (
        <div
          style={{
            position: 'absolute', inset: 0,
            background:
              'radial-gradient(ellipse 92% 82% at 50% 48%, transparent 55%, rgba(0,0,0,0.5) 100%)',
          }}
        />
      )}
    </div>
  );
};
