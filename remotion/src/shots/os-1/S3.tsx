import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { MR, PaperTag, Tactile } from '../../lib/tactile';
import { IsoStage, KineticPayoff } from '../../lib/fusion';
import { VO } from './vo.gen';
import { SceneWords } from './words';
import { FONT_SERIF } from '../../fonts';

// S3 — THE TWIST + THE CLOSE (same night, continuous). The bright tower stands
// (the persistent actor); its dim mirror — same 16 blocks, labelled 0.99^365 —
// collapses to a sliver on "Almost nothing" (×0.03). Silence. Then "INEVITABLE"
// scales through the camera (mg guest), revealing the pure-host close: the gold
// tag on a breathing hold.
export const compositionConfig = {
  id: 'Os1S3',
  durationInSeconds: 10.2,
  durationInFrames: 153,
  fps: 15,
  width: 1080,
  height: 1920,
};

// local cues (offset 231 = 15.4s global)
const WORSE_AT = 13;    // "one percent worse" ~16.2s global: the mirror's formula
const COLLAPSE_AT = 55; // "Almost" — 19.05s global: the mirror collapses
const COLLAPSE_DUR = 15;
const INVIS_AT = 96;    // "Invisible" — 21.7s global: the payoff word appears
const FLY_AT = 116;     // "inevitable" — 23.10s global: the fly-through
const FLY_DUR = 14;
const TAG_AT = 122;     // the tag is already in place as the word passes

const LEFT = { x: 310, y: 1350 };
const RIGHT = { x: 790, y: 1350 };
const UNIT = 46;

const S3: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  void fps;

  // arrival: 1.18x, blurred, settling to 1.0 — scale and blur TOGETHER
  const arrive = interpolate(f, [0, 9], [0.18, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.33, 1, 0.68, 1),
  });
  const arriveScale = 1 + arrive;
  const arriveBlur = arrive * 30;

  // the mirror collapse: accelerating melt to a 3% sliver
  const collapse = interpolate(f, [COLLAPSE_AT, COLLAPSE_AT + COLLAPSE_DUR], [1, 0.03], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.bezier(0.55, 0, 0.85, 0.36), // easeIn — the collapse gathers speed
  });

  // anticipation: the mirror trembles as "worse" lands, building into the collapse
  // (opposite the main action, amplitude growing toward the drop)
  const tremble = f >= WORSE_AT + 15
    ? Math.min(1, (f - (WORSE_AT + 15)) / (COLLAPSE_AT - WORSE_AT - 15))
    : 0;
  const wobble = Math.sin(f * 2.6) * (1.5 + tremble * 4.5) * (f < COLLAPSE_AT ? 1 : 0);

  // the whole world breathes through the silence and the close — a bobbing sine so
  // the holds stay measurably alive (qa_frozen_time), not just optically breathing
  const breathe = 1 + 0.022 * Math.sin((f / 153) * Math.PI);
  const worldBob = Math.sin(f * 0.7) * 4;

  // the close: the world steps aside as the payoff word flies through
  const worldFade = interpolate(f, [INVIS_AT, INVIS_AT + 20], [1, 0.35], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const worldExit = interpolate(f, [FLY_AT, FLY_AT + FLY_DUR + 6], [1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.55, 0, 0.85, 0.36),
  });
  const worldScale = 0.985 + worldExit * 0.015;

  // the payoff word: appears on "Invisible", flies on "inevitable"
  const wordIn = interpolate(f, [INVIS_AT, INVIS_AT + 12], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.33, 1, 0.68, 1),
  });
  const flyT = interpolate(f, [FLY_AT, FLY_AT + FLY_DUR], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // the final breathing push after the fly-through resolves
  const finalPush = interpolate(f, [FLY_AT + FLY_DUR, 153], [1, 1.045], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.33, 1, 0.68, 1),
  });

  const tagIn = interpolate(f, [TAG_AT, TAG_AT + 8], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.34, 1.56, 0.64, 1),
  });

  // mirror tower dimness (it is the dim counterpart, then collapses)
  const mirrorDim = interpolate(f, [WORSE_AT, WORSE_AT + 12], [0.55, 0.9], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ background: MR.teal }}>
      <Tactile paperFile="projects/os-1-one-percent/paper-tile.png" grainFile="library/textures/grain.jpg">
        {/* the world (towers + labels) — arrives continuous, breathes, steps aside */}
        <div
          style={{
            position: 'absolute', inset: 0,
            transform: `scale(${arriveScale * breathe * worldScale}) translateY(${wobble + worldBob}px)`,
            transformOrigin: '540px 1000px',
            filter: `blur(${arriveBlur}px)`,
            opacity: worldFade * worldExit,
          }}
        >
          {/* the standing tower — the persistent actor (right) */}
          <IsoStage
            cols={2} rows={2} originX={RIGHT.x} originY={RIGHT.y}
            staggerF={1} settleF={9}
            blockCount={16}
            blockAt={(i) => ({ gx: 1, gy: 1, h: UNIT, base: i * UNIT, color: MR.ivory, delayF: -20 })}
          />

          {/* the mirror tower — same 16 blocks, dim, collapsing (left) */}
          <div style={{ position: 'absolute', inset: 0, opacity: mirrorDim }}>
            <IsoStage
              cols={2} rows={2} originX={LEFT.x} originY={LEFT.y}
              staggerF={1} settleF={9} hScale={collapse}
              blockCount={16}
              blockAt={(i) => ({ gx: 1, gy: 1, h: UNIT, base: i * UNIT, color: MR.mutedTeal, delayF: -20 })}
            />
          </div>

          {/* formulas — right keeps its claim; the mirror shows the reversal */}
          <Formula x={RIGHT.x} y={380} text="1.01^365" />
          <Formula x={LEFT.x} y={380} at={WORSE_AT} text="0.99^365" />

          {/* right result persists; the mirror's result lands with the collapse */}
          <ResultNum x={RIGHT.x} y={560} at={8} text="37.8×" color={MR.gold} size={170} />
          <ResultNum x={LEFT.x} y={560} at={COLLAPSE_AT + 7} text="0.03×" color={MR.mutedTeal} size={140} />
        </div>

        {/* the payoff word — INEVITABLE (mg guest: it scales through the camera) */}
        <KineticPayoff t={flyT} x={540} y={880} fromOpacity={wordIn * 0.95}>
          <div
            style={{
              fontFamily: FONT_SERIF, fontWeight: 600, fontSize: 150, color: MR.ivory,
              letterSpacing: 6, whiteSpace: 'nowrap', textShadow: '0 6px 30px rgba(8,15,22,0.55)',
            }}
          >
            INEVITABLE
          </div>
        </KineticPayoff>

        {/* the close — pure host: the gold claim tag under a breathing hold */}
        {tagIn > 0 && (
          <div style={{ position: 'absolute', inset: 0, transform: `scale(${finalPush})`, transformOrigin: '540px 900px', opacity: tagIn }}>
            <PaperTag x={260} y={810} width={560} height={170} rotate={-3} foldProgress={tagIn}>
              <div style={{ fontFamily: FONT_SERIF, fontWeight: 600, fontSize: 64, color: MR.ink, letterSpacing: 0.5 }}>
                1% every day
              </div>
            </PaperTag>
          </div>
        )}

        {/* the words (VO only) — above the peripheral blur */}
        <div style={{ position: 'absolute', left: 80, right: 80, top: 1480, display: 'flex', justifyContent: 'center' }}>
          <SceneWords lines={VO.filter((l) => l.start >= 15.4)} offsetSec={15.4} />
        </div>
      </Tactile>
    </AbsoluteFill>
  );
};

// small muted formula label ("^" renders as superscript)
const Formula: React.FC<{ x: number; y: number; text: string; at?: number }> = ({ x, y, text, at = 0 }) => {
  const f = useCurrentFrame();
  const o = at > 0
    ? interpolate(f, [at, at + 10], [0, 0.85], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.33, 1, 0.68, 1) })
    : 0.85;
  const [base, sup] = text.split('^');
  return (
    <div
      style={{
        position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)',
        fontFamily: FONT_SERIF, fontWeight: 500, fontSize: 44, color: MR.mutedTeal,
        opacity: o, letterSpacing: 1, whiteSpace: 'nowrap',
      }}
    >
      {base}
      {sup && <sup style={{ fontSize: 30, marginLeft: 2 }}>{sup}</sup>}
    </div>
  );
};

// a landing result number (static — the Counter's job was S2's)
const ResultNum: React.FC<{ x: number; y: number; at: number; text: string; color: string; size: number }> = ({ x, y, at, text, color, size }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [at, at + 10], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.34, 1.56, 0.64, 1),
  });
  return (
    <div
      style={{
        position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${o})`,
        fontFamily: FONT_SERIF, fontWeight: 600, fontSize: size, color,
        letterSpacing: -2, fontVariantNumeric: 'tabular-nums',
        textShadow: '0 4px 26px rgba(8,15,22,0.4)', whiteSpace: 'nowrap',
      }}
    >
      {text}
    </div>
  );
};

export default S3;
