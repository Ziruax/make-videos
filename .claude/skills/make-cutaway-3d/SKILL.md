---
name: make-cutaway-3d
description: Make a MINIMAL 3D CUTAWAY explainer (1080×1920, 30fps, ~20-30s) end-to-end from a script — Three.js via @remotion/three, in the house tactile finish. One real object or system, sliced open by animated clipping planes (the wedge), explored layer by layer with a keyframed camera dive, exploded into labelled parts, reassembled changed. Matte clay materials in the MR palette, one gold accent on the payoff part, DOM labels with leader lines projected through the same camera rig, Edge TTS voiceover with whisper word times, SFX layered to the animation controls, the full measured-QA pipeline (frozen-time, loudness, determinism — byte-identical WebGL frames). Use when the user asks for "3D cutaway", "cutaway animation", "exploded view video", "cross-section", "how X works inside", "3D explainer", says /make-cutaway-3d, or continues the c3d-N series. NOT for 2D isometric line art (make-isometric), photo-collage (make-vox), or script-fusion reels (make-on-script — though CutStage can guest there). Defers TSX crash rules to vidtsx-2d-generator, motion grammar to MOTION.md, SFX taste to suggest-sfx, and the craft floor to STUDIO-CRAFT.md.
---

# make-cutaway-3d — minimal 3D cutaway explainers

The genre: **one real thing, opened.** A hard drive, an espresso machine, the
Earth, a jet engine — modelled as calm matte solids, sliced by an animated wedge,
explored layer by layer, taken apart into labelled pieces, put back together
changed. The look is an architect's model photographed in a studio: MR palette,
clay materials, hairline grid, paper-grain finish. The motion is deliberate and
SLOW — this track runs **30fps** (the 3D exception to the 15fps house step:
camera moves judder at 15; keep every move slow enough that 30 still reads
calm). A cutaway that rushes failed; one that feels like a *museum piece you
can fly through* nailed it.

**The whole thing in one line:** model the real geometry, let the VO be the
clock, open the wedge on the act turn, dive with a keyframed camera, label each
layer when the voice names it, explode on the payoff, reassemble changed —
every frame a pure function of the frame number, proven byte-identical.

## The form (the saved numbers)

- 1080×1920 @ **30fps**, duration class **~600-750 frames (20-25s)**. 3 scenes
  (light ivory claim → teal-night dive → night payoff + reassemble), each
  registered standalone AND in a master that assembles them.
- **Palette: MR only.** Shells and structure in `mutedTeal`/`teal`; night scenes
  on `ink`; the payoff part in `gold` (ONE gold accent per film — the inner
  core, the group head, the read head. Gold is the treasure; never spend it on
  decoration). Clay materials: roughness ≥ 0.45, metalness ≤ 0.25, emissive < 1.0.
- **The wedge is the portal.** Two radial clipping planes (+ optional top cap)
  on STABLE instances (`lib/cut3d.tsx` `useWedge`) — materials hold refs, the
  ramp widens them from a hairline (h=0.04) to ~0.95 rad with easeInOutCubic.
  The wedge opens ON the act turn and closes on the return — it is this track's
  camera-continuity signature (the minimal-reel portal, made literal).
- **Camera: a keyframe table, not a controller.** `cutCam(track, t)` — rows
  `{t, pos, look, ease}` with per-segment easing ('in' accel exits, 'out' decel
  enters, 'lin' pass-through dive legs, 'io' the default). FOV is CONSTANT per
  shot (dolly, never zoom — a dolly moves perspective, a zoom crops). 30-38°
  reads premium. The camera never enters the last beat — it holds while the
  payoff lands. Optional `buzz` (deterministic multi-sine, amplitude driven by
  piece state: the engine running, the pump priming) — 0 means locked off.
- **Labels: DOM + SVG leader lines, projected through the SAME rig** (`Label3d`)
  — the WebGL camera and the label projector consume one `CamRig`, so sync is
  guaranteed, not hoped for. 70px rows per side with collision stacking; a
  label arrives WITH its part's window (t0..t1) and never before the part
  lands; dot + two-segment leader line in teal; anchor positions are functions
  of t so they track exploded parts.
- **Explode: the OFF table.** Parts carry offset vectors; `explodeAt(t, t0, t1)`
  ramps easeInOutCubic up then back down (reassembly mirrors the open — the
  end is the start, changed). SMALL PARTS TRAVEL FARTHER. Landings settle with
  5-8% overshoot (`settle`), never 20. During the explode the world is the
  still one — the camera holds or recedes; one thing moves at a time.
- **Finish: `<Tactile>` at halved strength over the WebGL canvas** (grain +
  noise + vignette + flicker; halftone/paper off — the 3D lighting already
  carries the print feel). The frame reads as one house film, not a 3D render
  pasted into one.
- **The 3-beat arc:** the sealed thing (claim) → the dive (layer by layer,
  each named by the voice, cause → effect) → the payoff part in gold (the
  surprise inside) + reassemble. The dive IS the practice beat; depth IS the
  hidden truth.

## Artifact contract

```
cut3d/c3d-N-<slug>/
  script.md        — VO lines + storyboard (scene | geometry | wedge | camera | labels)
  beats.json       — machine contract: vo[] (one per sentence) + format {fps 30}
  sfx-plan.json    — cue sheet (SFX follow the controls: the wedge, the dive, the landings)
  voice/ · output/                                              [gitignored]
remotion/src/shots/c3d-N/C3dN<Name>.tsx       — the master composition
  (+ C3dN<Name>S1/2/3.tsx — each independently previewable)
remotion/src/lib/cut3d.tsx    — the kit (wedge, rig, labels, explode, clay, finish)
media/projects/c3d-N-<slug>/  — piece-specific textures (if any; committed)
```

## Stage 0 — intake (script-first, one confirmation round)

The script names a THING and a MECHANISM (how it works inside). Read it once:
1. **Find the dive.** The layers/parts the voice names ARE the shot list —
   every entity the script names MUST appear on screen (the bang law:
   "entities named must appear"). If the script doesn't name parts, the
   storyboard proposes them and the confirmation round approves them.
2. **Find the payoff part** — the one that gets gold. The surprise inside
   (solid metal at sun-surface heat; the spring that does all the work).
3. **Web-check every factual claim** (thicknesses, temperatures, speeds) and
   record sources in script.md. Never invent a number.
4. One confirmation round: the line table, the part list with palette
   assignment, the camera table sketch. Then execute.

## Stage 1 — voiceover (the backbone, Edge TTS)

```
python tools/gen_voice_edge.py --beats cut3d/c3d-N-<slug>/beats.json \
    --voice <USER-NAMED-VOICE (default en-US-ChristopherNeural)> \
    --emit-ts remotion/src/shots/c3d-N/vo.gen.ts
```

Real word times back into beats.json + vo.gen.ts. ≤ 3.5 words/s; trim Edge
TTS's ~0.9s trailing silence per clip before fitting (the os-1 lesson). The
dive beats start ~0.3s after the previous line ends; the payoff line starts
after a 0.5-1.2s PAUSE (the hit lives in the pause).

## Stage 2 — geometry + storyboard

Model the real thing from primitives (cylinders, boxes, lathes, tori — the
whaleyxbt engine is 100% primitives). **Design the geometry for the most
extreme camera move** (the dive-through: the wedge must open wide enough for
the camera's path to clear the walls). Probe BEFORE building the whole piece:
render 1 still at each camera key (`frames.mjs`) and read it — a probe costs
seconds, a rebuild costs the piece (the anything2explainer probe pattern).

Storyboard one board row per beat: geometry present · wedge state · camera row
· labels on/off · what the line reveals. The storyboard panel IS the scene
function's spec.

## Stage 3 — the scenes

**S1 — the claim (light, ivory).** The sealed thing arrives settled (frame 0
is a finished composition — no part pops in). The voice makes the claim; the
wedge opens ON the act turn (this track's portal). Labels: none yet, or the
thing's name only. Exit: the camera tips INTO the wedge.

**S2 — the dive (teal night, continuous).** The camera descends through the
opened wedge along a 'lin' pass-through leg; each layer/part arrives (label
t0 = when the voice names it, +0.1s); materials gate their emissive/glow by
chapter (the named part brightens 1.2×, others dim 0.3× — the whaleyxbt
chapter-gate). Cause → effect visible: the flow moves because the pump pushes.
The camera buzz follows the mechanism's state. Exit: the camera settles at
the payoff part and HOLDS (the camera never enters the last beat).

**S3 — the payoff (night, continuous).** The gold part lands in the pause
before the line that names it. The explode (OFF table) opens on the payoff
word, labels track their parts, 1.0-1.5s of scored silence around the
deepest separation; then reassembly mirrors the open exactly (same offsets,
same ease, reversed) and the wedge closes on the S1 framing — the end is the
start, changed. Final push ≤ 1.03 breathing.

**Master:** assemble in order, exact frame count, transitions are the scenes'
own wedge/camera moves (no hard cuts unless matched on subject+scale+direction).

## Stage 4 — measured QA + render (nothing ships unmeasured)

```
cd remotion && npm run gen
node scripts/frames.mjs C3dNName 0,<wedge-frames>,<label-arrivals>,<explode-frames>,<last> --scale=0.5
```

READ the PNGs at phone scale: the wedge reads as a cut (not a hole) · every
label's dot sits ON its part · labels never collide (70px rows) · text
readable over 3D (the label band stays clear of the caption band) · gold on
the payoff part ONLY · the metaphor reads ON MUTE (the dive carries the
meaning with sound off) · the subject fills 60-85% of the usable frame.

```
bash tools/qa_frozen_time.sh <master>       # near-frozen ≤ ~1s per 30s (breathing holds exempt)
bash tools/qa_loudness.sh  <voiced master>  # ~−16 LUFS, true peak ≤ −1 dBFS
bash tools/qa_determinism.sh C3dNName 0,<mid>,<last>   # WebGL frames byte-identical (proven viable)
```

Render `--scale=1`. On this 2-vCPU box, SwiftShader renders ~1-3s/frame at
full res — a 700-frame piece is 15-30 min: run it in the background and
watch the log; never foreground-render a long piece.

## Stage 5 — sound carries the meaning

Music: ONE calm bed under everything (ambient/minimal-electronic, vol ≤ 0.22,
hard-ducked under voice). SFX follow the CONTROLS: the wedge gets a
continuous airy slice while it moves, the dive a filtered riser whose cutoff
follows camera depth, each label landing a soft tick, the explode a deep
impact + reversed swell exactly on the payoff word (in the pause), the
reassembly the impact reversed. One musical key. Author sfx-plan.json,
audition with tools/mix_sfx.py. The user's ear is the gate.

## Done =

real geometry, facts sourced · VO the clock, word-exact captions · wedge opens
on the act turn, closes on the return · camera table with constant fov, never
entering the last beat · labels projected through the same rig, arriving with
their parts, 70px collision rows · gold on the payoff part only · explode with
mirrored reassembly · MR palette, clay materials, Tactile at half strength ·
phone-scale frames READ + measured QA passed (frozen-time, loudness,
determinism byte-identical) · exact frame count · SFX following the controls ·
released with the MP4 as a GitHub Release asset.

## Shared craft floor

[STUDIO-CRAFT.md](../STUDIO-CRAFT.md) — the universal film-craft rules. This
track's 3D additions: emissive < 1.0 always; `Math.random`/wall-clock never
(the buzz is a pure multi-sine of t); plane constants recomputed per frame on
stable instances; one camera keyframe table per scene, fov constant; probe
stills before full builds; background never for long renders.
