import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import type { VoLine } from '../../lib/shorts';
import { timeWords } from '../../lib/shorts';
import { MR } from '../../lib/tactile';
import { FONT_SERIF } from '../../fonts';

// Scene-level VO words: ONLY the voiceover words appear on screen. Each scene gets
// its lines (global times) + its own frame offset inside the master; the current
// spoken word warms to gold while the rest hold the scene's text colour.
export const SceneWords: React.FC<{
  lines: VoLine[];
  offsetSec: number;
  light?: boolean; // ivory scene = teal text; night scene = ivory text
  style?: React.CSSProperties;
  accent?: string;
}> = ({ lines, offsetSec, light = false, style, accent = MR.gold }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps + offsetSec;
  const active = lines.find((l) => t >= l.start - 0.1 && t < l.end + 0.55);
  if (!active) return null;
  const words = timeWords(active);
  return (
    <div
      style={{
        display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'baseline',
        columnGap: 16, rowGap: 4, maxWidth: 920,
        fontFamily: FONT_SERIF, fontSize: 54, lineHeight: 1.22, letterSpacing: 0.5,
        color: light ? MR.teal : MR.ivory,
        textShadow: light ? 'none' : '0 3px 18px rgba(8,15,22,0.5)',
        ...style,
      }}
    >
      {words.map((w, i) => {
        const on = t >= w.start && t < w.end + 0.07;
        const spoken = t >= w.start - 0.08;
        return (
          <span
            key={i}
            style={{
              color: on ? accent : undefined,
              opacity: spoken ? 1 : 0.38,
              transform: on ? 'translateY(-3px)' : 'none',
            }}
          >
            {w.w}
          </span>
        );
      })}
    </div>
  );
};
