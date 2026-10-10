import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { MR, Tactile } from '../../lib/tactile';
import { Counter, IsoStage } from '../../lib/fusion';
import { focusHunt } from '../../lib/engine';
import { VO } from './vo.gen';
import { SceneWords } from './words';
import { FONT_SERIF } from '../../fonts';

// S2 — THE MECHANISM + THE PAYOFF (dark, teal night). Enter from the portal black
// with a focus hunt. Two dimetric stages: LEFT "adds" (1 + 0.01×365 — a short stack,
// steady cadence, caps at 2 blocks / 4.65×); RIGHT "multiplies" (1.01^365 — the
// cascade accelerates, the tower climbs to 16 blocks). The serif counter lands ×37.8
// exactly on "thirty-seven". Exit: recede and blur together to 0.72.
export const compositionConfig = {
  id: 'Os1S2',
  durationInSeconds: 8.2,
  durationInFrames: 123,
  fps: 15,
  width: 1080,
  height: 1920,
};

// local frame cues (offset 108 = 7.2s global)
const ADD_AT = 13;      // the left tower's first block (riding into "add")
const ADD2_AT = 34;     // the left tower's second (and last) block
const MULT_AT = 38;     // "multiplies" — 9.76s global: the cascade begins
const YEAR_AT = 64;     // "One year later" — 11.45s global: the counter starts
const COUNTER_DUR = 30; // lands f94 = 13.47s = the end of "thirty-seven"
const RECEDE_AT = 111;  // 14.6s global — after "better" (ends 14.31)

const LEFT = { x: 310, y: 1350 };
const RIGHT = { x: 790, y: 1350 };
const UNIT = 46; // px per block — 2:16 blocks = the true 1:8 proportion (4.65 : 37.8)

// the compounding tower's landing schedule: first block on "multiplies", the last
// exactly on "thirty-seven"'s end — ACCELERATING (the compounding feel)
const rightDelay = (k: number) => Math.round(MULT_AT + 56 * Math.pow(k / 15, 0.6));

const S2: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  void fps;

  // focus-hunt arrival (the host's entry from the portal black) — clears through
  // the first second so the grids and formulas surface WITH the hunt
  const hunt = focusHunt(f, [{ f: 0, blur: 12 }, { f: 4, blur: 10 }, { f: 7, blur: 3 }, { f: 10, blur: 6 }, { f: 13, blur: 0 }]);

  // EXIT: recede and blur TOGETHER, accelerating, full-frame night continuous beneath
  const recede = f >= RECEDE_AT ? Math.pow((f - RECEDE_AT) / (123 - RECEDE_AT), 1.7) : 0;
  const recedeScale = 1 - recede * 0.28; // to 0.72
  const recedeBlur = recede * 7;

  // the portal landing: ink thinning into the teal night over ~0.4s (no hard cut)
  const fromInk = interpolate(f, [0, 6], [0.6, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // the stage breathes under a CONTINUOUS slow camera push (MOTION rule 4 — never
  // motionless): 1.0 -> 1.06 across the scene, front-loaded (decelerating hard)
  const push = 1 + 0.06 * (1 - Math.pow(1 - f / 123, 2.5));

  // the left number resolves once its tower is done
  const leftNum = interpolate(f, [ADD2_AT + 10, ADD2_AT + 20], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.33, 1, 0.68, 1),
  });

  return (
    <AbsoluteFill style={{ background: MR.teal }}>
      {fromInk > 0 && <AbsoluteFill style={{ background: MR.ink, opacity: fromInk }} />}
      <Tactile paperFile="projects/os-1-one-percent/paper-tile.png" grainFile="library/textures/grain.jpg">
        <div
          style={{
            position: 'absolute', inset: 0,
            transform: `scale(${recedeScale * push})`,
            transformOrigin: '540px 1050px',
            filter: `blur(${hunt + recedeBlur}px)`,
            opacity: 1 - recede * 0.25,
          }}
        >
          {/* LEFT stage — "adds": two blocks, steady cadence, then done */}
          <IsoStage
            cols={2} rows={2} originX={LEFT.x} originY={LEFT.y}
            staggerF={1} settleF={9} gridOpacity={0.55}
            blockCount={2}
            blockAt={(i) => ({
              gx: 1, gy: 1, h: UNIT, base: i * UNIT,
              color: MR.mutedTeal, delayF: i === 0 ? ADD_AT : ADD2_AT,
            })}
          />

          {/* RIGHT stage — "multiplies": 16 accelerating blocks (the tower) */}
          <IsoStage
            cols={2} rows={2} originX={RIGHT.x} originY={RIGHT.y}
            staggerF={1} settleF={9} gridOpacity={0.55}
            blockCount={16}
            blockAt={(i) => ({
              gx: 1, gy: 1, h: UNIT, base: i * UNIT,
              color: MR.ivory, delayF: rightDelay(i),
            })}
          />

          {/* the formulas — small, muted, surfacing with the hunt (the add/multiply claim) */}
          <Formula x={LEFT.x} y={380} at={8} text="1 + 0.01 × 365" />
          <Formula x={RIGHT.x} y={380} at={10} text="1.01^365" />

          {/* left payoff — static, resolves once the adding is done */}
          <div
            style={{
              position: 'absolute', left: LEFT.x, top: 1150, transform: 'translate(-50%, -50%)',
              fontFamily: FONT_SERIF, fontWeight: 600, fontSize: 112, color: MR.mutedTeal,
              opacity: leftNum, letterSpacing: -2, fontVariantNumeric: 'tabular-nums',
            }}
          >
            4.65×
          </div>

          {/* right payoff — THE counter (math guest): lands on "thirty-seven" */}
          <Counter
            from={1.01} to={37.8} decimals={1} suffix="×"
            startF={YEAR_AT} durF={COUNTER_DUR}
            x={RIGHT.x} y={560} size={170} color={MR.gold} unitColor={MR.ivory}
          />

          {/* the words (VO only) — above the peripheral blur */}
          <div style={{ position: 'absolute', left: 80, right: 80, top: 1480, display: 'flex', justifyContent: 'center' }}>
            <SceneWords lines={VO.filter((l) => l.start >= 7.2 && l.start < 15.4)} offsetSec={7.2} />
          </div>
        </div>
      </Tactile>
    </AbsoluteFill>
  );
};

// small muted formula label ("^" renders as superscript — the math guest's typesetting).
// RISES as it fades in — a reading hold with motion, never a pure fade.
const Formula: React.FC<{ x: number; y: number; at: number; text: string }> = ({ x, y, at, text }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + 10], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.33, 1, 0.68, 1),
  });
  const [base, sup] = text.split('^');
  return (
    <div
      style={{
        position: 'absolute', left: x, top: y + (1 - p) * 22,
        transform: 'translate(-50%, -50%)',
        fontFamily: FONT_SERIF, fontWeight: 500, fontSize: 44, color: MR.mutedTeal,
        opacity: p * 0.85, letterSpacing: 1, whiteSpace: 'nowrap',
      }}
    >
      {base}
      {sup && <sup style={{ fontSize: 30, marginLeft: 2 }}>{sup}</sup>}
    </div>
  );
};

export default S2;
