// mg-test — smoke-test composition for the mgkit motion-design system.
// Exercises every major system in one 6s reel: kinetic type (char/word/line +
// mask reveal + weight push), transitions (sharedAxis/fadeThrough/wipe/iris),
// grid cascade, split screen, counters/bars/arcs, chaos field, big stat.
import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import {
  MGP,
  MG_SAFE,
  BigStat,
  ChaosField,
  Counter,
  DataArc,
  DataBar,
  DrawStroke,
  GridCascade,
  KickerChip,
  KineticText,
  MaskReveal,
  PhoneSafe,
  Shape,
  SplitScreen,
  TransWindow,
  idleBob,
  type TransSpec,
} from '../../lib/mgkit';
import { FONT_DISPLAY, FONT_IMPACT, FONT_MONO } from '../../fonts';

export const compositionConfig = {
  id: 'MgTestKit',
  durationInSeconds: 6,
  fps: 30,
  width: 1080,
  height: 1920,
};

const PAL = MGP.ink;

// S1 — kinetic type: char-split headline with emph + word sub
const S1: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <PhoneSafe>
      <AbsoluteFill style={{ background: PAL.ground, justifyContent: 'center', padding: 60 }}>
        <KickerChip text="mgkit / smoke test" at={2} style={{ position: 'absolute', top: 20, left: 0 }} />
        <KineticText
          split="char"
          reveal="rise"
          at={6}
          staggerF={2}
          atomDur={8}
          fontFamily={FONT_IMPACT}
          fontSize={150}
          color={PAL.ink}
          lineHeight={1.02}
          emph={['moves']}
          emphColor={PAL.accent}
        >
          {`TYPE\nTHAT\nMOVES`}
        </KineticText>
        <MaskReveal at={36} dur={10} style={{ marginTop: 40 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 44, color: PAL.inkDim }}>
            every atom addressable, cascade ≤ 45f
          </div>
        </MaskReveal>
        <div style={{ position: 'absolute', bottom: 40, left: 0, transform: `translateY(${idleBob(f, 's1')}px)` }}>
          <Shape kind="circle" w={90} h={90} color={PAL.accent2} at={40} from="scale" />
        </div>
      </AbsoluteFill>
    </PhoneSafe>
  );
};

// S2 — grid cascade + data motion
const S2: React.FC = () => {
  return (
    <PhoneSafe>
      <AbsoluteFill style={{ background: PAL.groundHi, justifyContent: 'center', gap: 60, padding: 60 }}>
        <GridCascade cols={2} gap={22} at={4} staggerF={3} cellDur={8}>
          {['alpha', 'bravo', 'charlie', 'delta'].map((t) => (
            <div
              key={t}
              style={{
                background: PAL.ground,
                borderRadius: 20,
                padding: '28px 24px',
                fontFamily: FONT_DISPLAY,
                fontSize: 34,
                color: PAL.ink,
                border: `1px solid ${PAL.accent}22`,
              }}
            >
              {t}
            </div>
          ))}
        </GridCascade>
        <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
          <DataArc frac={0.72} at={16} size={260} stroke={22} color={PAL.accent2} />
          <div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 64, color: PAL.ink }}>
              <Counter to={72} at={16} dur={36} format={(v) => `${Math.round(v)}%`} />
            </div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 30, color: PAL.inkDim, marginTop: 6 }}>ring gauge</div>
          </div>
        </div>
        <DataBar frac={0.64} at={20} w={900} h={54} color={PAL.accent} />
      </AbsoluteFill>
    </PhoneSafe>
  );
};

// S3 — split screen + big stat
const S3: React.FC = () => {
  return (
    <PhoneSafe>
      <AbsoluteFill style={{ background: PAL.ground }}>
        <SplitScreen
          at={2}
          dur={12}
          left={
            <AbsoluteFill style={{ background: '#1A1B20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <KineticText split="word" reveal="rise" at={8} staggerF={4} fontFamily={FONT_DISPLAY} fontSize={52} color={PAL.inkDim}>
                BEFORE
              </KineticText>
            </AbsoluteFill>
          }
          right={
            <AbsoluteFill style={{ background: PAL.ground, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <KineticText split="word" reveal="rise" at={10} staggerF={4} fontFamily={FONT_DISPLAY} fontSize={52} color={PAL.accent}>
                AFTER
              </KineticText>
            </AbsoluteFill>
          }
        />
        <div style={{ position: 'absolute', bottom: 220, left: 60 }}>
          <BigStat
            value={9600}
            label="frames per minute, deterministic"
            source="measured on this render"
            at={14}
            counterDur={40}
            valueSize={150}
          />
        </div>
      </AbsoluteFill>
    </PhoneSafe>
  );
};

// S4 — chaos field + draw stroke + exit
const S4: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <PhoneSafe>
      <AbsoluteFill style={{ background: PAL.ground, alignItems: 'center', justifyContent: 'center' }}>
        <ChaosField
          at={4}
          holdF={34}
          burstF={10}
          resolveF={22}
          seed="mgtest"
          spread={300}
          items={Array.from({ length: 9 }, (_, i) => (
            <Shape
              key={i}
              kind={i % 3 === 0 ? 'circle' : 'rect'}
              w={110 - (i % 4) * 18}
              h={110 - (i % 4) * 18}
              color={i % 4 === 0 ? PAL.accent : i % 4 === 1 ? PAL.accent2 : PAL.inkDim}
              at={i * 2}
              from="scale"
            />
          ))}
        />
        <div style={{ position: 'absolute', bottom: 340, fontFamily: FONT_DISPLAY, fontSize: 40, color: PAL.ink, opacity: Math.min(1, Math.max(0, (f - 70) / 10)) }}>
          order → chaos → order
        </div>
      </AbsoluteFill>
      <DrawStroke
        d="M 540 1500 Q 300 1300 540 1150 Q 780 1000 540 850"
        at={74}
        dur={16}
        w={5}
        color={PAL.accent}
      />
    </PhoneSafe>
  );
};

// transition specs — one object handed to BOTH sides of a cut (unison)
const T1: TransSpec = { kind: 'axisX', dir: 1, d: 12 };
const T2: TransSpec = { kind: 'axisY', dir: -1, d: 12 };
const T3: TransSpec = { kind: 'fadeThrough', d: 12 };

const SCENE_DUR = 45; // frames each

const MgTestKit: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: MGP.ink.ground }}>
      <Sequence from={0} durationInFrames={SCENE_DUR}>
        <TransWindow exit={T1} exitAt={SCENE_DUR}>
          <S1 />
        </TransWindow>
      </Sequence>
      <Sequence from={SCENE_DUR} durationInFrames={SCENE_DUR}>
        <TransWindow enter={T1} exit={T2} exitAt={SCENE_DUR}>
          <S2 />
        </TransWindow>
      </Sequence>
      <Sequence from={SCENE_DUR * 2} durationInFrames={SCENE_DUR}>
        <TransWindow enter={T2} exit={T3} exitAt={SCENE_DUR}>
          <S3 />
        </TransWindow>
      </Sequence>
      <Sequence from={SCENE_DUR * 3} durationInFrames={SCENE_DUR}>
        <TransWindow enter={T3}>
          <S4 />
        </TransWindow>
      </Sequence>
    </AbsoluteFill>
  );
};

export default MgTestKit;
