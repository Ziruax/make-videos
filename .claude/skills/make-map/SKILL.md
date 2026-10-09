---
name: make-map
description: Build a DOCUMENTARY ANIMATED MAP film (16:9 or 9:16, 30-90s) end-to-end from a topic OR a user-supplied SCRIPT — geopolitics, history, chokepoints, supply chains, conflicts, trade routes, territory timelines. The map is drawn per-frame from REAL geographic data (world-atlas + TopoJSON + d3-geo, never hand-drawn) at THREE detail levels matched to zoom (110m world / 50m regional / 10m strait close-ups), with a camera grammar (fly-to arcs, log-zoom, slow-arrival finals), zoom-band label choreography, an annotation grammar (region grows WITH onset transients, path-followers, leader lines, distance rings, swarms), and time-series furniture (date stamp, legend, timeline bar). One continuous shot, tilted like a table-top war map, film grain on the map layer only. Voice by Edge TTS. Use for "map video", "war map", "geopolitics explainer", "history map animation", "strait/blockade/invasion/trade route animation", or to continue the map-N series. Defers TSX crash rules to vidtsx-2d-generator, SFX taste to suggest-sfx, critic rounds to review-cut.
argument-hint: "[topic or script] [format] [voice?]"
---

# make-map — data-driven animated map documentaries

A map film is choreographed like a documentary, not a slide deck. The three
technique families (measured from 200+ map-animation videos): **camera moves**
(zoom/pan/fly-to), **visual highlights** (area/line/point), and **animated
elements** (path-followers, region changes, swarms) — orchestrated on the VO.
The camera breathes: wide establish → tight detail → wide recontextualize.

The map is **generated per frame from real data** — world-atlas Natural Earth
shapes, TopoJSON, d3-geo Mercator. Never hand-draw a map: real geometry is what
makes zoom-ins land on real coastlines, and it costs zero assets.

## The engine: `remotion/src/lib/mapkit.tsx` v2 (read it first)

- **Multi-resolution**: `createKit(w, h, center, scale, res)` — res `'110m' |
  '50m' | '10m'`. **Detail must match zoom** (blobby coastlines at tight zoom is
  the #1 amateur tell). Switch res ONLY at scene boundaries, or mid-move while
  cam.z < ~4 (the difference is sub-pixel there — verified).
- **Camera grammar**: `CamLeg[]` + `camAt(legs, f)` — zoom interpolates in LOG
  space; ease per leg: `'smooth'` (default), `'slowArrival'` (RESERVED for the
  final leg — or nothing lands), `'linear'` (only under montage). `flyToLegs(from,
  to, dur)` = the guided zoom: out (both endpoints visible) → arc across →
  descend. `zLerp`, `camDur`.
- **Zoom-band labels**: `MapLabels` + `MapLabel[]` — labels arrive when the
  CAMERA crosses their zoom band (minZ), rank-sized (0 country 34px letterspaced
  caps / 1 major 28px / 2 detail 26px), greedy collision-avoided placement in
  cartographic priority (above-right → below-right → above-left → below-left),
  screen-constant size, slide-in near the band floor. Once shown, never jumps.
  Country labels 1.2-2pt larger than cities, minimums per the style table.
- **Annotation grammar**: `RegionGrow` (territory change + ONE-TIME onset flash
  transient — perceptual research: viewers miss changes < 10-15% of visible area
  unless a transient flags them), `RouteArc` (self-drawing + traffic dots),
  `LeaderLabel` (elbow callout for dense areas), `DistRing` (measurement rings —
  the scale-making device), `Swarm` (a fleet as ONE grouped mover with members at
  seeded offsets), `FigureRise` (the signature glyph-out-of-the-map move),
  `ShipGlyph`, `VfxStreaks`.
- **Furniture** (DOM overlays, mounted BESIDE the svg, never inside):
  `DateStamp` (persistent, pops on change), `LegendBox` (top-right, arrives f8,
  stays — fills get their meaning here), `TimelineBar` (bottom scrubber with a
  tick per period — the audience's clock for time-lapses).
- **Borders**: `WorldMap focus={['Egypt']}` — focus countries 2.4px, neighbours
  1.0px, rest 0.6px (cartographic rank hierarchy). `highlight` = self-drawing
  glow outline. Ocean stays ONE flat colour (the #1 style decision — labels pop
  against flat water).

## Perceptual gates (hard rules from vision research — QA enforces)

1. **≤ 3-4 independently moving sprites**, ≤ 2 if the VO asks the viewer to
   remember which is which. A fleet is ONE `Swarm`, not 12 ships.
2. **Every territory change ≥ 15% of visible area, or flagged with an onset
   transient** (`RegionGrow` does this). A change nobody notices didn't happen.
3. **Annotations land AFTER the camera settles** (~15f margin), then HOLD ≥
   1.5-2s before the next change. One factual transition per beat.
4. **Camera speed ≤ ~1.5 screenfulls/s** for tracked action; slow sprites when
   pushing in (same px/s feels zoom× faster zoomed in).
5. **One arrow meaning at a time** — stagger arrow choreography so arrows never
   compete. Curved = return/loop, bold = urgency, thin = flow.
6. **Text ≥ 26-34px @1080, contrast ≥ 4.5:1 against its ACTUAL background**.
7. **Optic flow is free**: uniform zoom in/out is the safest big move; scattered
   independent motion is the most expensive. Zoom to recontextualize, don't
   scatter.

## Script-first entry (when the user brings a script)

1. **Route check.** Map films fit scripts that are GEOGRAPHIC (places,
   chokepoints, invasions, routes, migrations). Character story →
   /make-motion-graphics; system/idea explainer → /make-vox or /make-minimal-reel.
2. **Extract the camera route from the words.** Every place the script names
   becomes a named anchor; the ORDER of mentions IS the route. Sentences with no
   place merge into the previous scene's VO (the camera holds or drifts).
3. **Mark what changes on the map** per line: a region, a route, a marker, a
   counter — every event must leave a VISIBLE geographic consequence.
4. One confirmation round: the route table (sentence → anchor → zoom band →
   events → res level) + cuts. Then run the pipeline.

## Project setup (once, in `remotion/`)

```
npm install world-atlas topojson-client d3-geo d3-scale @types/topojson-client @types/d3-geo
npm install zod@4.3.6        # PIN this exact version — newer zod breaks the render
```
- `remotion.config.ts` sets the **ANGLE GL renderer**; ALWAYS render with
  `--gl=angle` (the film-grain shader needs it headlessly).

## Artifact contract

```
map-films/map-N-<slug>/
  script.md        — story + CAMERA ROUTE (ordered anchors w/ zoom + res) + label plan
                     + event map (what changes when) + furniture plan + VO lines
  beats.json       — machine contract: vo[] + format + scene timeline
  voice/ · sfx-plan.json · output/                                  [voice/output gitignored]
remotion/src/shots/map-N/MapN<Name>.tsx  — THE composition (npm run gen after adding)
media/projects/map-N-<slug>/            — cutouts, VFX plates (committed)
```

## Format

16:9 1920×1080 (YouTube documentary) or 9:16 1080×1920 (Shorts), 30fps, 30-90s.
Scene continuity mandatory: every scene STARTS on the exact camera frame the
previous scene ENDS on (import the previous scene's end anchor).

## Stage 1 — script + camera route + label plan

Write `script.md` as a numbered beat table: scene → story beat → camera anchor
(lat/lon + zoom band) → res level for the scene → what changes on the map →
labels that arrive in the scene's band → VO line. Facts verified by web search.
Then `beats.json` (vo[] contract, ~2.7 wps windows).

**The camera script is 4 phases** (fits 30-60s): **Intro** 0-2s establish wide
(the globe→region zoom is the single most reliable hook — frame 0 wide, descend);
**Build** 2-5s slow push/drift while elements light up; **Main** track events
(one revelation per 7-10s, the breathing pattern wide→tight→wide); **Outro** pull
back to the aftermath or hold as effects fade (the recap pull-back — "look how
far we came" in one frame).

**Vary the zoom like a composition type:** never two scenes at the same scale in
a row unless the story demands a hold. ONE zoom change per camera leg; hide the
zoom change inside the faster leg of a pair.

**Label plan:** list every place the VO names → its rank + band + arrival
scene. Country labels at world/regional bands, features at mid, cities at tight.
Labels the VO does NOT name stay out (labels compete with narration).

## Stage 2 — map + camera + furniture

- ONE base `<WorldMap>` per scene at its pinned res; `<MapLayer>` applies the
  camera. Camera = `CamLeg[]` per scene, built from the route; distant anchors
  join with `flyToLegs`, adjacent ones with one smooth leg; the FINAL leg of the
  film gets `slowArrival`.
- Scene handoffs: import the previous scene's end anchor; cuts dissolve into
  one continuous shot.
- Mount furniture ONCE, film-wide: `DateStamp` (the clock — changes on the beat
  the VO dates), `LegendBox` (entries for every fill/track colour), `TimelineBar`
  if the film spans periods. A time-lapse film without date + legend is
  unreadable on mute.
- Grain ON THE MAP LAYER ONLY (screen-blend `GrainRect` between map and actors).
- 2.5D tilt: the shot wraps the map svg in a perspective div (`rotateX(15-25°)`,
  scale 1.05-1.08 to hide edges). Flat top-down reads informational; tilt reads
  cinematic. Land/water contrast: flat single-colour water, land 2 steps lighter.

## Stage 3 — the events (annotations, actors, VFX)

- **Territory/region changes**: `RegionGrow` (the transient fires automatically).
  For war fronts: a front LINE (RouteArc) + fills behind it, advancing on the
  date stamp. Sequence ≥ 15% area steps or flag each with its transient.
- **Routes**: `RouteArc` draw-in 0.8-1.5s with the head glyph riding it; distance
  counter chips at the arc's fraction ("12,000 km to go"); `DistRing`s from the
  focal point for scale.
- **Fleets/forces**: `Swarm` (one group = one tracked mover + one label).
- **Cutout figures** (leaders): image-generation skill or image-search, plain
  background, `tools/cutout.py`; the signature `FigureRise` move.
- **Vehicles**: top-down PNGs; flight track = bezier, rotation = tangent;
  barrages = 20+ seeded staggered instances BUT grouped as 2-3 perceived
  formations.
- **VFX** (explosions, smoke): black-background footage with `ScreenBlend`; hit
  points leave glowing marks (cause → effect: every strike leaves a mark).
- Every event lands AFTER the camera settles + ON the VO word that names it
  (word-exact retiming after the voice exists).

## Stage 4 — grain + render

```
cd remotion && npm run gen
npx remotion render MapNName out/MapNName.mp4 --gl=angle
```

## Stage 5 — QA (measured + VLM)

`node scripts/frames.mjs MapNName <f0,handoffs,event-cues,res-switches,last>
--scale=0.5` — READ the PNGs with VLM: scene handoffs invisible (A-end ==
B-start) · framing at each anchor (subject region fills the usable frame) ·
coastline detail matches zoom (no blobs at close-up) · labels readable, not
colliding, arriving at bands not mid-move · outlines drew fully · tracks on
believable paths · grain not on actors · **perceptual gates all pass** · **on
mute, the story reads** (labels + legend + date + tracks carry the geography).
Measured: `tools/qa_frozen_time.sh` + `tools/qa_determinism.sh MapNName`.
Flagships: `/review-cut` critic round.

## Stage 6 — voice + sound

```
python tools/gen_voice_edge.py --beats map-films/map-N-<slug>/beats.json \
    --voice en-US-ChristopherNeural --emit-ts remotion/src/shots/map-N/vo.gen.ts \
    --mux remotion/out/MapNName.mp4
```
Re-time events to REAL word times (each event on the word that names it; the
camera settles ~15f BEFORE). Foley sheet: soft whoosh on every camera leg ·
riser on figure emergence · jet roars · booms on hits · sonar ping when a
blockade draws · foghorn when a ship stops · a LOW bed that drops for the
payoff line. Library-first (`suggest-sfx`); web-search (Mixkit/Pixabay) when the
library misses. Words always win.

## Done =

real data at matching detail levels · camera grammar obeyed (fly-tos, one zoom
change per leg, slow-arrival final, settle→annotate→hold) · labels arrive by
zoom band, never mid-move · every territory change transient-flagged ·
perceptual gates pass · date/legend furniture present · one continuous shot
verified at every handoff · events word-exact on the VO · grain on map only,
`--gl=angle` · foley + music auditioned · no CTA outro.

## Shared craft floor

[STUDIO-CRAFT.md](../STUDIO-CRAFT.md) — universal film-craft rules for every Remotion track (silence before payoff, one constant, colour means one thing, voice is the clock, perceptual limits, determinism discipline). Read it once per film; it is the floor each genre builds on.
