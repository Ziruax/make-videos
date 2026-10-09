import React from 'react';
import { AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import {
  ArchivalPhoto,
  CollageBoard,
  Cutout,
  EASE_INOUT,
  LabelChip,
  PaperBG,
  RubberStamp,
  SerifStatement,
  SketchArrow,
  VOX,
} from '../../lib/collage';

// =============================================================================
// COMPOSITION CONFIG — "The Lines That Never Left" (vox-2, make-vox). One paper
// board, one camera journey across six scene boundaries. Facts verified (script.md).
// =============================================================================
export const compositionConfig = {
  id: 'Vox2Africa',
  durationInSeconds: 40.5,
  fps: 30,
  width: 1080,
  height: 1920,
};

const W = 1080;
const H = 1920;
const F = (s: number) => Math.round(s * 30);
const asset = (f: string) => staticFile(`projects/vox-2-africa/layers/${f}`);
const lib = (f: string) => staticFile(`library/collage/${f}`);

// Map geometry — annotation points are FRACTIONS of the map layer.
const MAP = { cx: 540, cy: 900, w: 980 };
const mapPt = (fx: number, fy: number) => ({
  x: MAP.cx - MAP.w / 2 + fx * MAP.w,
  y: MAP.cy - MAP.w / 2 + fy * MAP.w,
});

// THE CAMERA — one journey: the wide board -> down into the Berlin photo ->
// macro on the table -> back out to the map -> wide for the partition -> home.
const CAM = [
  { f: 0, x: 540, y: 960, z: 1 },
  { f: 150, x: 540, y: 960, z: 1.06 },
  { f: 280, x: 540, y: 1220, z: 1.5 }, // down to the archival photo
  { f: 340, x: 540, y: 1310, z: 2.15 }, // macro into the room
  { f: 540, x: 540, y: 1310, z: 2.15 },
  { f: 590, x: 540, y: 940, z: 1.32 }, // back out to the map
  { f: 660, x: 540, y: 940, z: 1.3 },
  { f: 780, x: 540, y: 930, z: 1.16 }, // wide for the partition
  { f: 980, x: 540, y: 950, z: 1.1 },
  { f: 1100, x: 540, y: 960, z: 1.02 },
  { f: 1214, x: 540, y: 960, z: 1 },
];

const TITLE_WORDS = [
  { t: 'The' }, { t: 'lines' }, { t: 'that' }, { t: 'never' }, { t: 'left', hl: true },
];

// fades a scene's short-lived annotations out before the next scene composes over them
const SceneFade: React.FC<{ out: number; dur?: number; children: React.ReactNode }> = ({ out, dur = 16, children }) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [out - dur, out], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return <div style={{ opacity: op }}>{children}</div>;
};

const Vox2Africa: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: VOX.paper }}>
      <CollageBoard cam={CAM}>
        <PaperBG src={lib('paper.png')} w={W} h={H} />

        {/* ===== persistent scenery: the 1880 map (S1-S4, fades INTO the partition) ===== */}
        <Sequence from={0} durationInFrames={780} layout="none">
          <Map1880 />
        </Sequence>

        {/* ===== S2: the Berlin archival photo lands ON the map ===== */}
        <Sequence from={156} durationInFrames={270} layout="none">
          <SceneFade out={424}>
            <ArchivalPhoto
              src={asset('berlin.png')}
              x={540}
              y={1420}
              w={860}
              at={0}
              enter="place"
              rotate={-2}
              depth={0.08}
              caption="Berlin, 1884"
            />
            <LabelChip text="14 EUROPEAN POWERS + THE USA" kicker="BERLIN CONFERENCE" accent={VOX.red} x={540} y={330} at={46} size={30} rotate={-1.5} z={12} />
          </SceneFade>
        </Sequence>

        {/* ===== S3: macro into the room — no African in the room ===== */}
        <Sequence from={306} durationInFrames={118} layout="none">
          <SceneFade out={306 + 114}>
            <SketchArrow
              id="vox2-chair"
              d={`M ${700} ${1030} Q ${660} ${1100} ${600} ${1170}`}
              vb={{ w: 1080, h: 1920 }}
              at={10}
              dur={18}
              color={VOX.red}
              width={7}
              z={20}
            />
            <SerifStatement
              words={[{ t: 'No' }, { t: 'African' }, { t: 'was' }, { t: 'in' }, { t: 'the' }, { t: 'room.', hl: true }]}
              x={540}
              y={1010}
              w={860}
              at={16}
              size={72}
              backing
              z={20}
            />
            <RubberStamp text="NOT INVITED" x={760} y={1470} rotate={-8} at={44} size={54} z={21} />
          </SceneFade>
        </Sequence>

        {/* ===== S4: the ruler, the pen, and the straight lines ===== */}
        <Sequence from={420} durationInFrames={190} layout="none">
          <SceneFade out={420 + 174}>
            <Cutout src={asset('ruler.png')} x={820} y={420} w={540} at={8} enter="slide-r" rotate={-14} depth={0.12} z={16} />
            <Cutout src={asset('pen.png')} x={250} y={1470} w={330} at={22} enter="slide-l" rotate={10} depth={0.14} z={16} />
            <StraightLines at={54} />
          </SceneFade>
        </Sequence>

        {/* the 44% chip lands ON its word (L5 at 20.2s) and leaves after L5 */}
        <Sequence from={F(19.9)} durationInFrames={110} layout="none">
          <SceneFade out={108}>
            <LabelChip text="44% OF AFRICA'S BORDERS" kicker="STRAIGHT LINES" accent={VOX.red} x={540} y={1560} at={8} size={32} rotate={-1} z={22} />
          </SceneFade>
        </Sequence>

        {/* ===== S5: the partition overwrites the map IN PLACE ===== */}
        <Sequence from={590} durationInFrames={420} layout="none">
          <PartitionMap />
        </Sequence>

        {/* ===== S6: still here — stamp + statement + title back ===== */}
        <Sequence from={918} durationInFrames={297} layout="none">
          <SerifStatement
            words={[{ t: 'A' }, { t: 'hundred' }, { t: 'and' }, { t: 'thirty' }, { t: 'years' }, { t: 'on,' }, { t: 'the' }, { t: 'lines' }, { t: 'are' }, { t: 'still' }, { t: 'here.', hl: true }]}
            x={540}
            y={1755}
            w={920}
            at={30}
            size={46}
            backing
            z={25}
          />
          <RubberStamp text="STILL HERE" x={540} y={1560} rotate={-6} at={90} size={62} z={24} />
          <TitleBack />
        </Sequence>
      </CollageBoard>
    </AbsoluteFill>
  );
};

// -----------------------------------------------------------------------------
// S1's map + title + 1880 chip; fades INTO the 1914 partition (global ~744-776)
// -----------------------------------------------------------------------------
const Map1880: React.FC = () => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [744, 776], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <>
      <div style={{ opacity: op }}>
        <Cutout src={asset('africa1880.png')} x={MAP.cx} y={MAP.cy} w={MAP.w} at={-30} enter="place" rotate={-1} depth={0.02} drift={0.8} />
      </div>
      <SerifStatement words={TITLE_WORDS} x={540} y={280} w={900} at={-26} size={76} z={10} />
      <LabelChip text="ALMOST ALL OF IT, AFRICAN-RULED" kicker="1880" accent={VOX.teal} x={540} y={420} at={-20} size={28} rotate={-1} z={11} />
    </>
  );
};

// -----------------------------------------------------------------------------
// S4's straight lines — drawn ON the map (fractions), red, like the borders
// -----------------------------------------------------------------------------
const StraightLines: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const lines: { a: ReturnType<typeof mapPt>; b: ReturnType<typeof mapPt> }[] = [
    { a: mapPt(0.13, 0.28), b: mapPt(0.82, 0.22) }, // the northern straight band
    { a: mapPt(0.62, 0.16), b: mapPt(0.6, 0.62) },  // a vertical slice
    { a: mapPt(0.3, 0.86), b: mapPt(0.88, 0.78) },  // the southern band
  ];
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, zIndex: 21 }} viewBox="0 0 1080 1920">
      {lines.map((l, i) => {
        const p = interpolate(frame, [at + i * 10, at + i * 10 + 26], [0, 1], {
          easing: EASE_INOUT,
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        if (p <= 0.001) return null;
        const x2 = l.a.x + (l.b.x - l.a.x) * p;
        const y2 = l.a.y + (l.b.y - l.a.y) * p;
        return (
          <g key={i}>
            <line x1={l.a.x} y1={l.a.y} x2={x2} y2={y2} stroke={VOX.red} strokeWidth={6} strokeLinecap="round" opacity={0.85} />
            {i === 0 && p > 0.96 && <circle cx={l.b.x} cy={l.b.y} r={9} fill={VOX.red} opacity={0.9} />}
          </g>
        );
      })}
    </svg>
  );
};

// -----------------------------------------------------------------------------
// S5: the 1914 partition map wipes in OVER the 1880 map (same position — one
// map BECOMES the other; the wipe lands with "By 1914" at 24.2s)
// -----------------------------------------------------------------------------
const PartitionMap: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [136, 186], [0, 1], {
    easing: EASE_INOUT,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: MAP.cx - MAP.w / 2,
          top: MAP.cy - MAP.w * 0.5,
          width: MAP.w,
          height: MAP.w,
          clipPath: `inset(0 ${100 - p * 100}% 0 0)`,
          zIndex: 15,
          filter: 'drop-shadow(0 18px 30px rgba(40,28,12,0.28))',
        }}
      >
        <Img src={asset('africa1914.png')} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
      </div>
      {/* stacked chips, shared left edge, equal spacing — each lands on ITS word */}
      <LabelChip text="90% UNDER EUROPEAN RULE" kicker="BY 1914" accent={VOX.red} x={330} y={1490} at={142} size={30} rotate={-1.5} z={22} />
      <LabelChip text="THE ONLY FREE AFRICAN STATES" kicker="ETHIOPIA · LIBERIA" accent={VOX.teal} x={330} y={1620} at={252} size={26} rotate={-1} z={22} />
    </>
  );
};

// -----------------------------------------------------------------------------
// S6: the title returns (loop-friendly tail)
// -----------------------------------------------------------------------------
const TitleBack: React.FC = () => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [196, 232], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, opacity: op, zIndex: 26 }}>
      <SerifStatement words={TITLE_WORDS} x={540} y={280} w={900} at={198} size={76} z={26} />
    </div>
  );
};

export default Vox2Africa;
