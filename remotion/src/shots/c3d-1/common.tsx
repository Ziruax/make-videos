// c3d-1 "The Shell" — shared model. TRUE-PROPORTION Earth (1u = 3,185.5 km):
// crust coat r 2.0 (ivory, schematic thickness), mantle r 1.095–1.985 (muted
// teal), outer core r 0.383–1.095 (teal, the liquid ocean), inner core solid
// r 0.383 (GOLD — the payoff). The wedge clips every shell; each layer's inner
// surface is its cut face (the whaleyxbt nested-interior read). Chapter gates
// brighten the layer the voice names. All positions pure functions of t.
import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import * as THREE from 'three';
import { MR } from '../../lib/tactile';
import { clay } from '../../lib/cut3d';

export const R = { crust: 2.0, mantleOut: 1.985, mantleIn: 1.095, outerIn: 0.383 };
export const KM_PER_U = 3185.5;

const useTime = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
};

// deterministic per-index hash (fusion.tsx's wob — never Math.random)
export const wob = (i: number, salt = 1) => {
  const x = Math.sin((i + 1) * 12.9898 * salt) * 43758.5453;
  return x - Math.floor(x);
};

// chapter gates: 0 → 1 when the voice names the layer, back toward 0.3 after
export const gate = (t: number, t0: number, hold = 3.2): number => {
  const up = Math.min(1, Math.max(0, (t - t0) / 0.5));
  const decay = 1 - 0.7 * Math.min(1, Math.max(0, (t - t0 - hold) / 2.5));
  return up * decay;
};

// ---------------------------------------------------------------------------
// The graticule — 6 meridians + 4 parallels, hairline tori. Rotates slowly
// (the globe's "small life"); the wedge stays world-fixed so the cut holds
// while the surface turns through it.
// ---------------------------------------------------------------------------
export const Graticule: React.FC<{ r?: number; opacity?: number; spin: number }> = ({
  r = 2.004,
  opacity = 0.55,
  spin,
}) => (
  <group rotation-y={spin}>
    {Array.from({ length: 6 }, (_, i) => (
      <mesh key={`m${i}`} rotation-y={(i * Math.PI) / 6}>
        <torusGeometry args={[r, 0.0045, 6, 128]} />
        <meshBasicMaterial color={MR.mutedTeal} transparent opacity={opacity} />
      </mesh>
    ))}
    {[0.5236, 1.0472].map((lat, k) => (
      <React.Fragment key={`p${k}`}>
        {[1, -1].map((s) => (
          <mesh key={`p${k}${s}`} position={[0, Math.sin(lat) * r * s, 0]} rotation-x={Math.PI / 2}>
            <torusGeometry args={[Math.cos(lat) * r, 0.0045, 6, 96]} />
            <meshBasicMaterial color={MR.mutedTeal} transparent opacity={opacity} />
          </mesh>
        ))}
      </React.Fragment>
    ))}
  </group>
);

// ---------------------------------------------------------------------------
// The churn — 72 ivory particles inside the outer core, deterministic convection
// orbits (radial bob + hemispheric swirl). The geodynamo made visible.
// ---------------------------------------------------------------------------
export const Churn: React.FC<{ t: number; opacity: number }> = ({ t, opacity }) => {
  const N = 72;
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
    return g;
  }, []);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < N; i++) {
    const rr = Math.min(1.02, Math.max(0.47, 0.72 + (wob(i) - 0.5) * 0.5 + 0.11 * Math.sin(t * 0.7 + i * 1.7)));
    const lat = (wob(i, 2) - 0.5) * 1.9;
    const speed = (wob(i, 3) * 0.5 + 0.3) * (lat > 0 ? 1 : -1);
    const a = wob(i, 4) * Math.PI * 2 + t * speed;
    const y = Math.sin((lat * Math.PI) / 2) * rr + 0.08 * Math.sin(t * 0.5 + i);
    const hr = Math.cos((lat * Math.PI) / 2) * rr;
    pos.setXYZ(i, Math.cos(a) * hr, y, Math.sin(a) * hr);
  }
  pos.needsUpdate = true;
  return (
    <points geometry={geo} frustumCulled={false}>
      <pointsMaterial
        color={MR.ivory}
        size={0.042}
        sizeAttenuation
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// ---------------------------------------------------------------------------
// The field — 5 dipole-tilted arcs blooming around the globe when the voice
// says "magnetic field". Unlit ivory (basic material) so they read as drawn
// annotation, not glow.
// ---------------------------------------------------------------------------
export const FieldArcs: React.FC<{ opacity: number; scale: number }> = ({ opacity, scale }) => (
  <group rotation-z={0.2} scale={scale}>
    {[2.55, 2.82, 3.1, 3.38, 3.62].map((rr, i) => (
      <mesh key={i} rotation-y={(i * Math.PI * 2) / 5}>
        <torusGeometry args={[rr, 0.012, 8, 128, Math.PI * 1.12]} />
        <meshBasicMaterial color={MR.ivory} transparent opacity={opacity} />
      </mesh>
    ))}
  </group>
);

// ---------------------------------------------------------------------------
// EarthModel — the whole subject. Clip planes come from the kit's wedge; the
// explode offsets the shells along +y (the vertical stack); gates/emissives
// follow the voice. The inner core NEVER clips (it IS the revealed interior).
// ---------------------------------------------------------------------------
export const EarthModel: React.FC<{
  planes: THREE.Plane[];
  ex: number; // explode 0..1
  gMantle: number; // chapter gates 0..1
  gOuter: number;
  gInner: number;
  churn: number; // particle opacity
  field: number; // field arcs opacity
  fieldScale: number;
  spin: number;
  coreGlow: number; // 0..0.75 — the payoff glow
}> = ({ planes, ex, gMantle, gOuter, gInner, churn, field, fieldScale, spin, coreGlow }) => {
  const t = useTime();
  const offCrust = 2.55 * ex;
  const offMantle = 1.65 * ex;
  const offOuter = 0.78 * ex;
  return (
    <group>
      {/* crust — the ivory coat; schematic thickness (label carries 5–70 km) */}
      <group position={[0, offCrust, 0]}>
        <mesh>
          <sphereGeometry args={[R.crust, 96, 64]} />
          <meshStandardMaterial {...clay(MR.ivory, { rough: 0.55, metal: 0.05, planes })} />
        </mesh>
        <Graticule spin={spin} opacity={0.5} />
      </group>
      {/* mantle — muted teal; the chapter gate warms it while named */}
      <group position={[0, offMantle, 0]}>
        <mesh>
          <sphereGeometry args={[R.mantleOut, 96, 64]} />
          <meshStandardMaterial
            {...clay(MR.mutedTeal, { rough: 0.68, metal: 0.06, planes })}
            emissive={MR.mutedTeal}
            emissiveIntensity={0.3 * gMantle}
          />
        </mesh>
      </group>
      {/* outer core — the teal liquid ocean + churn */}
      <group position={[0, offOuter, 0]}>
        <mesh>
          <sphereGeometry args={[R.mantleIn, 96, 64]} />
          <meshStandardMaterial
            {...clay(MR.teal, { rough: 0.42, metal: 0.16, planes })}
            emissive={MR.teal}
            emissiveIntensity={0.45 * gOuter}
          />
        </mesh>
        <Churn t={t} opacity={churn} />
      </group>
      {/* inner core — the GOLD payoff ball; glow fades up in the pause */}
      <mesh>
        <sphereGeometry args={[R.outerIn, 64, 48]} />
        <meshStandardMaterial
          color={MR.gold}
          roughness={0.36}
          metalness={0.5}
          emissive={MR.gold}
          emissiveIntensity={coreGlow + 0.08 * gInner}
        />
      </mesh>
      <FieldArcs opacity={field} scale={fieldScale} />
    </group>
  );
};

// ---------------------------------------------------------------------------
// The top tag + depth readout (mono, HUD-lite). depthKm null = hidden.
// ---------------------------------------------------------------------------
export const TopTag: React.FC<{ light?: boolean; depthKm?: number | null }> = ({
  light = false,
  depthKm = null,
}) => (
  <>
    <div
      style={{
        position: 'absolute',
        top: 64,
        left: 60,
        fontFamily: 'ui-monospace, monospace',
        fontSize: 26,
        letterSpacing: 3,
        color: light ? MR.teal : MR.ivory,
        opacity: 0.85,
      }}
    >
      EARTH · A CUTAWAY
    </div>
    {depthKm !== null ? (
      <div
        style={{
          position: 'absolute',
          top: 64,
          right: 60,
          fontFamily: 'ui-monospace, monospace',
          fontSize: 26,
          letterSpacing: 2,
          color: MR.ivory,
          opacity: 0.9,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        DEPTH {Math.round(depthKm).toLocaleString('en-US')} KM
      </div>
    ) : null}
  </>
);
