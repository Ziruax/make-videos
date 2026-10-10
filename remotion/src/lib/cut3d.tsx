// Cut3d kit — /make-cutaway-3d's machinery. Minimal 3D cutaway explainers in the
// house system: Three.js via @remotion/three, EVERY FRAME A PURE FUNCTION of the
// frame number (no delta-time, no wall clock, no unseeded randomness — the
// vidtsx hard rules hold in 3D too; qa_determinism.sh proves it on real renders).
//
// Source acknowledgments (research/external):
//   whaleyxbt/claude-motion sims/engine/main.js — the wedge clip (2 radial planes
//     + cap, clipIntersection), the explode OFF-table with eased explode/
//     reassemble, the camera keyframe table with per-segment easing, labels with
//     leader lines + 70px collision stacking, state-driven camera buzz.
//   Vincentwei1021/anything2explainer — dolly over zoom (fov constant per shot),
//     camera never enters the last beat, probe a single frame before building.
//   bang-motion — "camera welcomes, doesn't chase"; text appears AFTER arrival.
//   klik-cam (t3knobox) — Hold & Glide: glides land on downbeats.
//   Efaz — FOV semantics: 30-45° reads premium, 60-75° reads energetic.
//
// House laws that bind 3D here: MR palette only; matte clay (roughness ≥ 0.45,
// metalness ≤ 0.25, emissive < 1.0); ONE gold accent per film (the payoff);
// 30fps native cadence (the 3D exception to the 15fps house step — camera moves
// need smooth; keep the moves SLOW so it still reads calm); labels arrive with
// their part, never before; the wedge is the portal between acts.
import React, { useMemo } from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { MR, Tactile } from './tactile';

// ---------------------------------------------------------------------------
// Camera rig — the keyframe table (whaleyxbt K), house-graded.
// One row per move: {t, pos, look, ease}. The camera interpolates between rows;
// 'in' = accel exit, 'out' = decel enter, 'lin' = pass-through legs (dive).
// LAWS: fov constant per shot (dolly, never zoom — Vincentwei); the camera never
// ENTERS the last beat (it holds); the table is written AFTER the VO lands so
// arrivals sit on spoken words, glides on the beat grid.
// ---------------------------------------------------------------------------
export type CamEase = 'in' | 'out' | 'lin' | 'io';
export interface CamKey {
  t: number; // seconds
  pos: [number, number, number];
  look: [number, number, number];
  ease?: CamEase; // easing of the segment ENDING at this key (like whaleyxbt)
}
export interface CamRig {
  pos: [number, number, number];
  look: [number, number, number];
  fov: number;
  buzz: number; // state-driven vibration amplitude (0 = locked off)
}
const EASES: Record<CamEase, (k: number) => number> = {
  in: (k) => k * k,
  out: (k) => 1 - Math.pow(1 - k, 3),
  lin: (k) => k,
  io: (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2),
};
export const cutCam = (track: CamKey[], t: number, fov = 38, buzz = 0): CamRig => {
  let i = 0;
  while (i < track.length - 2 && t > track[i + 1].t) i++;
  const a = track[i];
  const b = track[i + 1] ?? track[i];
  const k = Math.min(1, Math.max(0, (t - a.t) / Math.max(1e-6, b.t - a.t)));
  const q = EASES[b.ease ?? 'io'](k);
  const L = (u: number, v: number) => u + (v - u) * q;
  const pos: [number, number, number] = [L(a.pos[0], b.pos[0]), L(a.pos[1], b.pos[1]), L(a.pos[2], b.pos[2])];
  const look: [number, number, number] = [L(a.look[0], b.look[0]), L(a.look[1], b.look[1]), L(a.look[2], b.look[2])];
  // buzz: deterministic multi-sine (whaleyxbt) — amplitude set by piece state
  if (buzz > 0) {
    pos[0] += buzz * Math.sin(t * 91);
    pos[1] += buzz * Math.sin(t * 127 + 1);
    pos[2] += buzz * Math.sin(t * 73 + 2);
  }
  return { pos, look, fov, buzz };
};

// ---------------------------------------------------------------------------
// Wedge clip — the cutaway. Two radial planes forming a wedge around the Y axis
// facing +z (mutated constants on STABLE instances — materials hold refs to
// these planes, so every clipped material follows; the whaleyxbt pattern).
// `open` 0..1 widens the wedge from a hairline to halfMax radians; `cap` (if
// set) planes off everything above y=capY (the "lid off" cut).
// The wedge animates OPEN on the act turn — it is the portal between acts.
// ---------------------------------------------------------------------------
export const useWedge = (open: number, halfMax = 0.95, capY?: number): THREE.Plane[] => {
  const planes = useMemo(
    () => (capY === undefined ? [new THREE.Plane(), new THREE.Plane()] : [new THREE.Plane(), new THREE.Plane(), new THREE.Plane()]),
    [capY === undefined]
  );
  const h = 0.04 + (halfMax - 0.04) * Math.min(1, Math.max(0, open));
  planes[0].set(new THREE.Vector3(-Math.cos(h), 0, -Math.sin(h)), 0);
  planes[1].set(new THREE.Vector3(Math.cos(h), 0, -Math.sin(h)), 0);
  if (capY !== undefined) planes[2].set(new THREE.Vector3(0, 1, 0), -capY);
  return planes;
};

// ---------------------------------------------------------------------------
// Explode — the OFF table + eased explode/reassemble (whaleyxbt explAt).
// Parts translate along their offset as `ex` ramps easeInOutCubic up at t0 and
// back down at t1. SMALL PARTS TRAVEL FARTHER (the gallery law): scale offsets
// so the explode reads proportionate, not uniform.
// ---------------------------------------------------------------------------
export const explodeAt = (t: number, t0: number, t1: number, durUp = 1.4, durDown = 1.4): number => {
  const up = EASES.io(Math.min(1, Math.max(0, (t - t0) / durUp)));
  const down = 1 - EASES.io(Math.min(1, Math.max(0, (t - t1) / durDown)));
  return up * down;
};

// ---------------------------------------------------------------------------
// Clay — the house material preset. Matte, printed, calm: roughness high,
// metalness low, DoubleSide so cut faces read solid, optional clip planes.
// Emissive stays < 1.0 (bloom discipline — even without a bloom pass, hot
// emissives clip to flat white and break the print look).
// ---------------------------------------------------------------------------
export const clay = (
  color: string,
  o: { rough?: number; metal?: number; planes?: THREE.Plane[]; opacity?: number; emissive?: string; emissiveIntensity?: number } = {}
) => ({
  color,
  roughness: o.rough ?? 0.62,
  metalness: o.metal ?? 0.08,
  side: THREE.DoubleSide,
  ...(o.planes ? { clippingPlanes: o.planes, clipIntersection: true } : {}),
  ...(o.opacity !== undefined && o.opacity < 1
    ? { transparent: true, opacity: o.opacity, depthWrite: false }
    : {}),
  ...(o.emissive ? { emissive: o.emissive, emissiveIntensity: o.emissiveIntensity ?? 0.5 } : {}),
});

// ---------------------------------------------------------------------------
// Label3d — DOM labels + SVG leader lines, projected through the SAME rig the
// WebGL camera uses (one source of truth: sync is guaranteed, not hoped for).
// Whaleyxbt stacking: 70px rows per side; labels arrive with their part's
// window (t0..t1) and never before the part lands; they hold until the window
// closes. Anchor positions are functions of t so they track exploded parts.
// ---------------------------------------------------------------------------
export interface LabelSpec {
  text: string;
  sub?: string;
  side: -1 | 1;
  t0: number; // seconds — when the label arrives
  t1: number; // seconds — when it leaves
  color?: string;
  anchorAt: (t: number) => [number, number, number];
}
export const Label3d: React.FC<{
  rig: CamRig;
  labels: LabelSpec[];
  t: number;
  width: number;
  height: number;
  fontBody?: string;
  dark?: boolean; // night scene → ivory label text; light scene → teal
}> = ({ rig, labels, t, width, height, fontBody = 'ui-monospace, monospace', dark = true }) => {
  // a stable scratch camera mirrors the WebGL camera — same params, same pose
  const scratch = useMemo(
    () => new THREE.PerspectiveCamera(rig.fov, width / height, 0.1, 100),
    [rig.fov, width, height]
  );
  scratch.position.set(rig.pos[0], rig.pos[1], rig.pos[2]);
  scratch.lookAt(rig.look[0], rig.look[1], rig.look[2]);
  scratch.updateMatrixWorld();
  const v = useMemo(() => new THREE.Vector3(), []);
  const used: Record<'-1' | '1', number[]> = { '-1': [], '1': [] };
  const out: { L: LabelSpec; x: number; y: number; a: number; ly: number }[] = [];
  for (const L of labels) {
    const a = EASES.out(Math.min(1, Math.max(0, (t - L.t0) / 0.3))) *
      (1 - EASES.out(Math.min(1, Math.max(0, (t - L.t1) / 0.3))));
    if (a <= 0.002) continue;
    const p = L.anchorAt(t);
    v.set(p[0], p[1], p[2]).project(scratch);
    if (v.z >= 1) continue; // behind the camera
    const x = (v.x * 0.5 + 0.5) * width;
    const y = (-v.y * 0.5 + 0.5) * height;
    // on-screen guard (whaleyxbt 20px margins)
    if (x < 20 || x > width - 20 || y < 20 || y > height - 20) continue;
    // collision stacking: 70px rows per side, pushed away from collisions
    // labels stay above the caption band; the ink chips make them readable
    // over any geometry (the whaleyxbt label-chip convention)
    let ly = Math.min(height - 780, Math.max(210, y));
    for (const u of used[L.side]) if (Math.abs(u - ly) < 70) ly = u + 70 * (Math.sign(ly - u) || 1);
    used[L.side].push(ly);
    out.push({ L, x, y, a, ly });
  }
  return (
    <svg width={width} height={height} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {out.map(({ L, x, y, a, ly }, i) => {
        const mainW = L.text.length * 19 + 20;
        const subW = L.sub ? L.sub.length * 12.5 + 20 : 0;
        const chipW = Math.max(mainW, subW);
        const chipH = L.sub ? 78 : 52;
        const chipX = L.side < 0 ? 40 : width - 40 - chipW;
        const chipY = ly - 52;
        const ex = L.side < 0 ? 40 + chipW : width - 40 - chipW; // leader-line start (chip's inner edge)
        const mid = ex + (x - ex) * 0.35;
        const dot = L.color ?? MR.gold;
        return (
          <g key={i} opacity={a}>
            {/* the ink chip — readable over any geometry (whaleyxbt convention) */}
            <rect
              x={chipX}
              y={chipY}
              width={chipW}
              height={chipH}
              rx={7}
              fill={dark ? 'rgba(8,15,22,0.84)' : 'rgba(241,237,228,0.9)'}
            />
            <rect
              x={chipX}
              y={chipY}
              width={chipW}
              height={chipH}
              rx={7}
              fill="none"
              stroke={dark ? 'rgba(241,237,228,0.35)' : 'rgba(23,52,61,0.35)'}
              strokeWidth={1}
            />
            <text
              x={L.side < 0 ? chipX + 14 : chipX + chipW - 14}
              y={ly - 20}
              textAnchor={L.side < 0 ? 'start' : 'end'}
              fill={dark ? MR.ivory : MR.teal}
              fontFamily={fontBody}
              fontSize={30}
              fontWeight={600}
              letterSpacing={0.5}
            >
              {L.text}
            </text>
            {L.sub ? (
              <text
                x={L.side < 0 ? chipX + 14 : chipX + chipW - 14}
                y={ly + 12}
                textAnchor={L.side < 0 ? 'start' : 'end'}
                fill={dark ? 'rgba(241,237,228,0.82)' : MR.mutedTeal}
                fontFamily={fontBody}
                fontSize={22}
              >
                {L.sub}
              </text>
            ) : null}
            <path
              d={`M ${ex} ${ly} L ${mid} ${ly} L ${x} ${y}`}
              stroke={dark ? MR.ivory : MR.teal}
              strokeWidth={1.8}
              fill="none"
              opacity={0.8}
            />
            <circle cx={x} cy={y} r={4.5} fill={dot} stroke={dark ? MR.ivory : MR.teal} strokeWidth={1.2} />
          </g>
        );
      })}
    </svg>
  );
};

// ---------------------------------------------------------------------------
// CutCamera — the r3f default camera driven imperatively from the rig (r3f
// 8.17 has no makeDefault; mutating the default camera during React render is
// frame-pure and runs before r3f's advance+render). Position + lookAt from the
// SAME rig the DOM labels project through — one source of truth.
// ---------------------------------------------------------------------------
export const CutCamera: React.FC<{ rig: CamRig }> = ({ rig }) => {
  const { camera } = useThree();
  camera.position.set(rig.pos[0], rig.pos[1], rig.pos[2]);
  camera.lookAt(rig.look[0], rig.look[1], rig.look[2]);
  const c = camera as THREE.PerspectiveCamera;
  if (c.isPerspectiveCamera && c.fov !== rig.fov) {
    c.fov = rig.fov;
    c.updateProjectionMatrix();
  }
  camera.updateMatrixWorld();
  return null;
};

// ---------------------------------------------------------------------------
// Studio lights — 3-point, house-graded: soft ambient + warm key + cool fill.
// No colored drama lighting: the palette lives in the materials.
// ---------------------------------------------------------------------------
export const StudioLights: React.FC<{ intensity?: number }> = ({ intensity = 1 }) => (
  <>
    <ambientLight intensity={0.58 * intensity} />
    <directionalLight position={[4, 8, 5]} intensity={1.15 * intensity} />
    <directionalLight position={[-6, 3, -4]} intensity={0.42 * intensity} color="#9db8bd" />
  </>
);

// ---------------------------------------------------------------------------
// Cut3d — the frame factory: AbsoluteFill + ThreeCanvas + labels + the tactile
// finish (halved strength — the WebGL canvas keeps its own AA; grain + vignette
// unify the frame with the house look). Children receive the clip planes via a
// function child so materials opt INTO the wedge.
// ---------------------------------------------------------------------------
export const Cut3d: React.FC<{
  bg: string;
  camTrack: CamKey[];
  fov?: number;
  buzz?: number;
  wedge?: { open: number; halfMax?: number; capY?: number };
  width?: number;
  height?: number;
  labels?: LabelSpec[];
  timeOffset?: number; // seconds added to frame-time (scenes are LOCAL; tracks/cues are GLOBAL)
  darkLabels?: boolean; // night scene → ivory label text
  children: (planes: THREE.Plane[]) => React.ReactNode;
}> = ({
  bg,
  camTrack,
  fov = 38,
  buzz = 0,
  wedge,
  width = 1080,
  height = 1920,
  labels,
  timeOffset = 0,
  darkLabels = true,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps + timeOffset;
  const rig = useMemo(() => cutCam(camTrack, t, fov, buzz), [camTrack, t, fov, buzz]);
  const planes = useWedge(wedge?.open ?? 0, wedge?.halfMax ?? 0.95, wedge?.capY);
  return (
    <AbsoluteFill style={{ background: bg }}>
      <ThreeCanvas
        width={width}
        height={height}
        style={{ position: 'absolute', inset: 0 }}
        gl={{ antialias: true, preserveDrawingBuffer: true, localClippingEnabled: true }}
        onCreated={({ gl }) => {
          gl.localClippingEnabled = true;
        }}
        camera={{ fov, near: 0.1, far: 120, position: camTrack[0]?.pos ?? [0, 0, 8] }}
      >
        <CutCamera rig={rig} />
        <StudioLights />
        {children(planes)}
      </ThreeCanvas>
      {labels ? <Label3d rig={rig} labels={labels} t={t} width={width} height={height} dark={darkLabels} /> : null}
      <Tactile
        halftone={false}
        paper={false}
        noise
        grain
        chromatic={false}
        flicker
        vignette
        peripheral={false}
        grainOpacity={0.5}
        noiseOpacity={0.5}
        vignetteAmount={0.5}
        flickerAmount={0.025}
        stepFps={30}
      >
        {null}
      </Tactile>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Ground — the house grid (warm greys, never pure black lines), optional.
// ---------------------------------------------------------------------------
export const CutGround: React.FC<{ y?: number; size?: number; dark?: boolean }> = ({
  y = -1.31,
  size = 26,
  dark = false,
}) => (
  <gridHelper
    args={[size, size, dark ? '#2c4048' : '#c9c3b6', dark ? '#233238' : '#ddd8cc']}
    position={[0, y, 0]}
  />
);

// ---------------------------------------------------------------------------
// openAt / landH — the shared ramps. openAt: the wedge/cowl ramp (easeInOutCubic
// up at t0, down at t1 — reassemble mirrors open, the end is the start changed).
// landH: label/part arrival, easeOutCubic (arrive, then hold — never sit
// pre-arrival; whaleyxbt label windows).
// ---------------------------------------------------------------------------
export const openAt = (t: number, t0: number, t1: number, durUp = 1.3, durDown = 1.4): number =>
  EASES.io(Math.min(1, Math.max(0, (t - t0) / durUp))) *
  (1 - EASES.io(Math.min(1, Math.max(0, (t - t1) / durDown))));

export const landH = (t: number, t0: number, dur = 0.3): number =>
  EASES.out(Math.min(1, Math.max(0, (t - t0) / dur)));

// easeOutCubic with a small settle overshoot for part landings (house spring
// law: overshoot 5-8%, never 20) — used on explode arrivals.
export const settle = (t: number, t0: number, dur = 1.0): number => {
  const k = Math.min(1, Math.max(0, (t - t0) / dur));
  const base = 1 - Math.pow(1 - k, 3);
  return k >= 1 ? 1 : base + Math.sin(k * Math.PI * 3) * 0.055 * (1 - k);
};

// the wedge's easeInOutCubic as a Remotion Easing (for interpolate() calls)
export const EASE_IO = Easing.bezier(0.65, 0, 0.35, 1);
export const EASE_OUT = Easing.bezier(0.33, 1, 0.68, 1);
