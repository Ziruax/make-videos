import React from 'react';
import { AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import {
  ArchivalPhoto,
  CollageBoard,
  Cutout,
  type Enter,
  EASE_INOUT,
  Grain,
  LabelChip,
  Layer,
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

// Map geometry — BOTH map prints render in the SAME 980×980 square (source
// images are 4:7 portraits, cover-cropped from the top) so the 1914 partition
// overwrites the 1880 map IN PLACE. Annotation points are fractions of the square.
const MAP = { cx: 540, cy: 900, w: 980 };
const mapPt = (fx: number, fy: number) => ({
  x: MAP.cx - MAP.w / 2 + fx * MAP.w,
  y: MAP.cy - MAP.w / 2 + fy * MAP.w,
});

// THE CAMERA — one journey: the wide board -> down into the Berlin photo ->
// macro on the table -> pull back out to the map for the drawn lines -> wide
// for the partition -> settle home for the title loop.
const CAM = [
  { f: 0, x: 540, y: 960, z: 1 },
  { f: 150, x: 540, y: 960, z: 1.06 },
  { f: 280, x: 540, y: 1220, z: 1.5 }, // down to the archival photo
  { f: 340, x: 540, y: 1310, z: 2.15 }, // macro into the room
  { f: 390, x: 540, y: 1310, z: 2.15 }, // hold macro while the room speaks
  { f: 450, x: 540, y: 940, z: 1.35 }, // pull back out to the map ("rulers" 14.9s)
  { f: 585, x: 540, y: 940, z: 1.35 }, // hold while the lines draw
  { f: 700, x: 540, y: 935, z: 1.26 }, // settle wider through the 44% beat
  { f: 780, x: 540, y: 940, z: 1.22 }, // wide for the partition wipe
  { f: 980, x: 540, y: 950, z: 1.14 },
  { f: 1100, x: 540, y: 960, z: 1.04 },
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

        {/* ===== persistent scenery: the 1880 map (S1-S4), fades INTO the partition ===== */}
        <Sequence from={0} durationInFrames={780} layout="none">
          <Map1880 />
        </Sequence>

        {/* ===== S2: the Berlin archival photo lands ON the map (stays through S3) ===== */}
        <Sequence from={156} durationInFrames={320} layout="none">
          <SceneFade out={462}>
            <ArchivalPhoto
              src={asset('berlin.png')}
              x={540}
              y={1420}
              w={860}
              at={0}
              enter="place"
              rotate={-2}
              depth={0.08}
            />
          </SceneFade>
          {/* the conference chip lands ON "fourteen" (5.45s) */}
          <SceneFade out={174}>
            <LabelChip text="14 EUROPEAN POWERS + THE USA" kicker="BERLIN · NOV 1884" accent={VOX.red} x={540} y={760} at={8} size={30} rotate={-1.5} z={12} />
          </SceneFade>
        </Sequence>

        {/* ===== S3: macro into the room — no African was in the room ===== */}
        <Sequence from={306} durationInFrames={118} layout="none">
          <SceneFade out={306 + 114}>
            <SerifStatement
              words={[{ t: 'No' }, { t: 'African' }, { t: 'was' }, { t: 'in' }, { t: 'the' }, { t: 'room.', hl: true }]}
              x={540}
              y={990}
              w={470}
              at={16}
              size={54}
              backing
              z={20}
            />
            <SketchArrow
              id="vox2-chair"
              d={`M ${620} ${1160} Q ${610} ${1250} ${640} ${1340}`}
              vb={{ w: 1080, h: 1920 }}
              at={14}
              dur={18}
              color={VOX.red}
              width={7}
              z={20}
            />
            <RubberStamp text="NOT INVITED" x={540} y={1230} rotate={-8} at={49} size={34} z={21} />
          </SceneFade>
        </Sequence>

        {/* ===== S4: the ruler, the pen, and the straight lines (camera is back
             on the map at 450 — entrances land in the arrival view) ===== */}
        <Sequence from={420} durationInFrames={290} layout="none">
          <SceneFade out={690}>
            <Cutout src={asset('ruler.png')} x={710} y={480} w={410} at={30} enter="slide-r" rotate={-12} depth={0.12} z={16} />
            <Cutout src={asset('pen.png')} x={335} y={1450} w={320} at={45} enter="slide-l" rotate={9} depth={0.14} z={16} />
            <StraightLines at={75} />
          </SceneFade>
        </Sequence>

        {/* the 44% chip lands ON its word (L5 at 20.2s) and leaves with the lines */}
        <Sequence from={F(19.9)} durationInFrames={110} layout="none">
          <SceneFade out={108}>
            <LabelChip text="44% OF AFRICA'S BORDERS" kicker="STRAIGHT LINES" accent={VOX.red} x={630} y={1550} at={8} size={32} rotate={-1} z={22} />
          </SceneFade>
        </Sequence>

        {/* ===== S5 + S6: the partition overwrites the map IN PLACE and STAYS —
             the borders are today's; chips fade before S6 composes ===== */}
        <Sequence from={590} durationInFrames={625} layout="none">
          <PartitionMap />
        </Sequence>

        {/* ===== S6: still here — statement + stamp + title back ===== */}
        <Sequence from={918} durationInFrames={297} layout="none">
          <SerifStatement
            words={[{ t: 'A' }, { t: 'hundred' }, { t: 'and' }, { t: 'thirty' }, { t: 'years' }, { t: 'on,' }, { t: 'the' }, { t: 'lines' }, { t: 'are' }, { t: 'still' }, { t: 'here.', hl: true }]}
            x={540}
            y={1700}
            w={920}
            at={30}
            size={46}
            backing
            z={25}
          />
          <RubberStamp text="STILL HERE" x={540} y={1490} rotate={-6} at={114} size={62} z={24} />
          <TitleBack />
        </Sequence>
      </CollageBoard>
      <Grain opacity={0.055} />
    </AbsoluteFill>
  );
};

// -----------------------------------------------------------------------------
// S1's map + title + 1880 chip. The map print is the SAME square the 1914
// partition will overwrite; everything fades together INTO the partition.
// -----------------------------------------------------------------------------
const Map1880: React.FC = () => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [744, 776], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <>
      <div style={{ opacity: op }}>
        <MapSquare src={asset('africa1880.png')} at={-30} z={5} />
        <SerifStatement words={TITLE_WORDS} x={540} y={280} w={900} at={-26} size={76} z={10} />
      </div>
      {/* the 1880 chip is an ANNOTATION, not scenery — it leaves before S4's
          ruler takes the top-right space (fades while still off-screen at macro) */}
      <SceneFade out={440}>
        <LabelChip text="ALMOST ALL, AFRICAN-RULED" kicker="1880" accent={VOX.teal} x={540} y={420} at={-20} size={26} rotate={-1} z={11} />
      </SceneFade>
    </>
  );
};

// The shared map print: 980×980, cover-cropped from the top of the 4:7 source,
// same Layer seed/depth/rotation for BOTH maps so the overwrite is seamless.
const MapSquare: React.FC<{ src: string; at?: number; z?: number; enter?: Enter; clip?: string }> = ({ src, at = 0, z, enter = 'place', clip }) => (
  <Layer x={MAP.cx} y={MAP.cy} w={MAP.w} at={at} enter={enter} rotate={-1} depth={0.02} drift={0.8} z={z}>
    <div
      style={{
        width: MAP.w,
        height: MAP.w,
        clipPath: clip,
        filter: clip ? undefined : 'drop-shadow(0 18px 30px rgba(40,28,12,0.28))',
      }}
    >
      <Img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
    </div>
  </Layer>
);

// -----------------------------------------------------------------------------
// S4's straight lines — drawn ON the map (fractions), red, like the borders
// -----------------------------------------------------------------------------
const StraightLines: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const lines: { a: ReturnType<typeof mapPt>; b: ReturnType<typeof mapPt> }[] = [
    // measured: the continent spans map-fractions y 0.37–1.0 — every line stays ON it
    { a: mapPt(0.15, 0.48), b: mapPt(0.75, 0.44) }, // the Saharan straight band
    { a: mapPt(0.57, 0.42), b: mapPt(0.55, 0.78) },  // an Egypt-like vertical slice
    { a: mapPt(0.3, 0.76), b: mapPt(0.85, 0.72) },   // the southern band
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
// S5: the 1914 partition map wipes in OVER the 1880 map (same square, same
// seed — one map BECOMES the other) and STAYS through S6: the borders are
// today's. Stacked chips share their left edge; each lands on ITS word.
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
      <MapSquare src={asset('africa1914.png')} at={0} z={15} enter="none" clip={`inset(0 ${100 - p * 100}% 0 0)`} />
      <SceneFade out={340}>
        <LabelChip text="90% UNDER EUROPEAN RULE" kicker="BY 1914" accent={VOX.red} x={439} y={1500} at={142} size={30} rotate={-1.5} z={22} />
        <LabelChip text="THE ONLY FREE AFRICAN STATES" kicker="ETHIOPIA · LIBERIA" accent={VOX.teal} x={453} y={1630} at={259} size={26} rotate={-1} z={22} />
      </SceneFade>
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
