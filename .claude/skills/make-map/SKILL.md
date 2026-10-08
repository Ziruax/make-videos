---
name: make-map
description: Build a news-documentary ANIMATED MAP film (16:9 or 9:16, 30-60s) end-to-end from a topic OR a user-supplied SCRIPT — script intake + camera route, geopolitics, history, supply chains, conflict timelines, trade routes. The map is drawn from REAL geographic data (world-atlas + TopoJSON + d3-geo, never hand-drawn), tilted like a table-top war map, with self-drawing glowing country outlines, smooth camera moves between places, cutout figures rising out of the map, missile/jet/ship tracks, screen-blend VFX, film grain, and a "one continuous shot" scene-continuity rule, under the MOTION.md grammar. Voice by Edge TTS (user names the voice). Use when the user asks for a "map video", "war map", "documentary map animation", "geopolitics explainer", "strait/blockade/invasion animation", brings a script for that style, or to continue the map-N series — not the paper-collage look (make-vox) and not tactile metaphor reels (make-minimal-reel). Defers TSX crash rules to vidtsx-2d-generator, motion grammar to MOTION.md, SFX taste to suggest-sfx, critic rounds to review-cut.
---

# make-map — data-driven animated map documentaries

The signature look (proven on the reference "US–Iran" film): a deep navy ocean darkening at
the edges, flat light-grey countries, the whole map tilted back like a table-top war map,
film grain baked into the map layer, and a camera that NEVER jumps — every scene starts on
the exact frame the previous scene ended, so the whole film plays as one continuous shot.

The map is **generated per frame from real data** — world-atlas country shapes unpacked
with TopoJSON, projected and drawn with d3-geo (`geoMercator`). Never hand-draw a map:
real geometry is what makes zoom-ins land on real coastlines, and it costs zero assets.

## Script-first entry (when the user brings a script)

The script IS the story — adapt its shape, never its meaning:

1. **Route check.** Map films fit scripts that are GEOGRAPHIC (places, chokepoints,
   invasions, trade routes, migrations). A paper-collage explainer → make-vox; a character
   story → make-motion-graphics. Route, don't force-fit.
2. **Extract the camera route from the words.** Every place the script names becomes a
   named anchor; the order of mentions IS the route. Sentences with no place in them get
   merged into the previous scene's VO (the camera holds or drifts while it lands).
3. **One confirmation round.** Show the route table (sentence → anchor → zoom level →
   on-screen events) + cuts, get the thumbs-up, then run the normal pipeline from
   Stage 1's beats.json step.

## Project setup (once per project, in `remotion/`)

```
npm install world-atlas topojson-client d3-geo d3-scale @types/topojson-client @types/d3-geo
npm install zod@4.3.6        # PIN this exact version — newer zod breaks the render
```
- Add `remotion.config.ts` that sets the **ANGLE GL renderer**, and ALWAYS render with
  `--gl=angle` (the film-grain shader needs it headlessly).
- The land data lives in `node_modules/world-atlas/countries-110m.json` (110m for
  whole-world, 50m when zooming tight on a region). Load once at module level, convert
  `topojson.feature(...)`, and precompute the projected SVG path string for every country
  — projection params are plain constants, so this is pure data, computed once.
- Map kit (add to `remotion/src/lib/mapkit.tsx`, generic across films): `<WorldMap>`
  (props: projection center/scale/tilt, ocean colors, country fill, highlight country codes
  with glowing self-drawing outline, lat/lon → x/y helper), camera keyframe module, and the
  grain plate layer.

## Artifact contract

```
map-films/map-N-<slug>/
  script.md        — the story: scenes, camera route (place → place), on-screen events, VO lines
  beats.json       — same machine contract as shorts: vo[] + format + scene timeline
  voice/ · sfx-plan.json · output/                                  [voice/output gitignored]
remotion/src/shots/map-N/MapN<Name>.tsx  — THE composition (npm run gen after adding)
media/projects/map-N-<slug>/            — cutouts, VFX plates, grain plate (committed)
```

## Format

16:9 1920×1080 (YouTube documentary) or 9:16 1080×1920 (Shorts), 30fps, 30–60s. Scene
continuity is mandatory in both.

## Stage 1 — script + camera route

Write `script.md` as: scene → story beat → what we're looking at → camera anchor (lat/lon +
zoom) → on-screen events (outlines, markers, tracks, cutouts, VFX) → VO line. Facts
verified. Then `beats.json` (same vo[] contract as shorts; ~2.7 wps windows). The camera
ROUTE is the film: write it as an ordered list of named anchors
(`{name: 'us', lat, lon, scale}`) in one shared module — scenes hand off anchors, never
invent new framing mid-film.

## Stage 2 — map + camera

- ONE `<WorldMap>` under everything; the camera is a set of keyframed
  {centerX, centerY, scale} values interpolated with EASE_INOUT between named anchors.
  Keep the named anchors in the shared module so Scene 2 can import Scene 1's END anchor.
- **Vary the zoom like a composition type (MOTION.md):** alternate wide establishing →
  regional → tight strait-level → back out for the aftermath; never two scenes at the
  same scale in a row unless the story demands a hold. **Cause → effect on the map:**
  every event visibly changes the map (a strike leaves a mark, a blockade leaves ships,
  an outline drawn leaves the country highlighted) — motion without geographic
  consequence is filler.
- Country highlight: glowing colored outline that DRAWS ITSELF on (stroke-dashoffset over
  ~20 frames, brand accent) + optional fill pulse. Flag colors are a deliberate choice
  (Israel blue, Iran red) — keep the semantic consistent film-wide.
- **Scene continuity rule (the one rule that matters):** every scene STARTS on the exact
  camera frame the previous scene ENDS on. Build scene-by-scene, import the previous
  scene's end anchor, and the cuts dissolve into one continuous shot.

## Stage 3 — the actors (figures, vehicles, weapons)

- **Cutout figures** (leaders, soldiers): full-body transparent PNGs. Source: the agent's
  **image-generation skill** ("full body, transparent/plain-white background, press-photo
  style") or **image-search** for public figures; `tools/cutout.py` for die-cuts. Clean up
  with ImageMagick (`convert a.png -fuzz 8% -transparent white`).
  - The signature move: a colored circle pops on the country, the figure rises OUT of the
    circle like a hole in the ground (lower body clipped by the circle), easeOut on the
    rise so he decelerates into place.
- **Vehicles/weapons** (jets, missiles, ships): top-down transparent PNGs. The flight track
  is a bezier over the map: position = `interpolate(frame, [f0, f1], [0,1])` through the
  curve, rotation = path tangent. Barrages = 20+ instances with seeded staggered starts.
- **VFX** (explosions, smoke, grain plates): footage on BLACK backgrounds — composite with
  `mixBlendMode: 'screen'` (the `ScreenBlend` helper in `lib/engine.tsx`) so only the light
  adds. Leave a glowing red mark on each hit point.
- **Blockades/lines:** a dashed line that draws itself across the strait
  (stroke-dashoffset), ships gliding in behind it, flashing warning triangle on top.

## Stage 4 — grain + render

Grain belongs ON THE MAP LAYER ONLY (never over foreground actors: jets, flags, explosions).
The full-frame film-grain plate is a separate, render-only overlay (screen blend of a bright
grain-on-black plate, `filmgrain.mp4`-style) — keep it OUT of the live preview so Studio
stays fast, bake it only into the final render. Render once, at the end:
```
cd remotion && npm run gen
npx remotion render MapNName out/MapNName.mp4 --gl=angle
```

## Stage 5 — QA

`node scripts/frames.mjs MapNName <f0,scene-handoffs,event-cues,last> --scale=0.5` — READ
every PNG: scene handoffs invisible (frame A-end == B-start) · camera framing at each
anchor (the subject region fills the usable frame) · outlines drew fully · tracks stay on
believable paths · grain not on actors · **on mute, the story still reads** (labels,
markers and tracks carry the geography).
Measured: `bash tools/qa_frozen_time.sh` on the render + `bash tools/qa_determinism.sh
MapNName` (same frame twice = same pixels). Flagships: `/review-cut` critic round.

## Stage 6 — voice + sound

Edge TTS (the user names the voice):
```
python tools/gen_voice_edge.py --beats map-films/map-N-<slug>/beats.json \
    --voice en-US-ChristopherNeural --emit-ts remotion/src/shots/map-N/vo.gen.ts \
    --mux remotion/out/MapNName.mp4
```
Then SFX per the foley sheet that made the reference film work: whooshes on every camera
move · riser when a figure emerges · jet roars · explosion booms · missile launch streaks ·
sonar ping when a blockade line draws · alarm on flashing warnings · foghorn when a ship
stops. Library-first (`suggest-sfx`); web-search free libraries (Mixkit/Pixabay) when the
library misses; music = slow-building dark tension bed (gen_music.py or library).

## Done =

map drawn from real data · one continuous camera shot (verified at every handoff) ·
outlines/tracks/VFX landed on real geography · grain on map only, `--gl=angle` render ·
Edge TTS voice with word-exact captions muxed · foley + music auditioned · no CTA outro.
