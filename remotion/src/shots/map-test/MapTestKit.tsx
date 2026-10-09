// map-test — smoke test for the mapkit v2 systems: multi-resolution base,
// flyTo camera arc, zoom-band labels, region grow + onset transient, legend,
// date stamp, timeline bar. 6s, Suez-strait subject (known coordinates).
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  Camera,
  DateStamp,
  LegendBox,
  MapLabels,
  MapLayer,
  RegionGrow,
  TimelineBar,
  WorldMap,
  camAt,
  createKit,
  flyToLegs,
  type CamLeg,
  type MapLabel,
} from '../../lib/mapkit';

export const compositionConfig = {
  id: 'MapTestKit',
  durationInSeconds: 6,
  fps: 30,
  width: 1080,
  height: 1920,
};

// Suez strait region kit, 10m detail (tight zoom)
const KIT = createKit(1080, 1920, [32.35, 30.1], 2600, '10m');
// world kit for the fly-to's zoomed-out start, 110m
const KIT_W = createKit(1080, 1920, [32.35, 30.1], 260, '110m');

// camera: fly from world view down to the strait, then a slow regional push
const FLY: CamLeg[] = [
  ...flyToLegs({ lon: 32.35, lat: 30.1, z: 1.4 }, { lon: 32.55, lat: 30.0, z: 14 }, 70),
  { from: { lon: 32.55, lat: 30.0, z: 14 }, to: { lon: 32.35, lat: 29.95, z: 22 }, dur: 70, ease: 'slowArrival' },
];

const LABELS: MapLabel[] = [
  { name: 'EGYPT', lon: 31.2, lat: 27.5, rank: 0, minZ: 1.5 },
  { name: 'SAUDI ARABIA', lon: 39.8, lat: 24.0, rank: 0, minZ: 1.5 },
  { name: 'Suez Canal', lon: 32.35, lat: 30.5, rank: 1, minZ: 6 },
  { name: 'Port Said', lon: 32.3, lat: 31.25, rank: 2, minZ: 12 },
  { name: 'Suez', lon: 32.55, lat: 29.95, rank: 2, minZ: 12 },
  { name: 'Gulf of Suez', lon: 32.6, lat: 29.2, rank: 2, minZ: 10 },
];

const MapTestKit: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  void fps;
  const cam: Camera = camAt(FLY, frame);
  // world kit until the fly-to descends past z 4, then the 10m kit
  const useWorld = cam.z < 4;
  const kit = useWorld ? KIT_W : KIT;

  return (
    <AbsoluteFill style={{ background: '#0d1c2e' }}>
      <AbsoluteFill style={{ perspective: 1600 }}>
        <div
          style={{
            width: '100%',
            height: '100%',
            transform: 'rotateX(18deg) scale(1.06)',
            transformOrigin: '50% 40%',
          }}
        >
          <svg viewBox="0 0 1080 1920" style={{ width: '100%', height: '100%' }}>
            <WorldMap
              kit={kit}
              cam={cam}
              land={useWorld ? '#c9ccd4' : '#cdd2da'}
              ocean="#0d1c2e"
              focus={['Egypt']}
              focusColor="#1c3050"
              highlight={{ names: ['Egypt'], draw: Math.min(1, Math.max(0, (frame - 30) / 26)) }}
            />
            <MapLayer kit={kit} cam={cam}>
              <RegionGrow
                kit={kit}
                cam={cam}
                country="Egypt"
                u={Math.min(1, Math.max(0, (frame - 90) / 20))}
                at={90}
                frame={frame}
                color="#f5d76e"
                fill={0.22}
              />
            </MapLayer>
            <MapLabels kit={kit} cam={cam} labels={LABELS} />
          </svg>
        </div>
      </AbsoluteFill>
      <LegendBox
        frame={frame}
        entries={[
          { color: '#f5d76e', label: 'Egypt (focus)' },
          { color: '#e8556d', label: 'blockade zone' },
        ]}
      />
      <DateStamp date="MAR 23 2021" changedAt={0} frame={frame} />
      <TimelineBar
        periods={[
          { label: 'stuck', at: 90 },
          { label: 'dredging', at: 130 },
        ]}
        frame={frame}
        totalFrames={180}
      />
    </AbsoluteFill>
  );
};

export default MapTestKit;
