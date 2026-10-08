---
name: make-minimal-reel
description: Build a TACTILE MINIMAL metaphor reel (1080×1920, 15fps, ~20-26s) end-to-end — one idea told as three physical metaphors (e.g. scanning eye → charging battery → iceberg) using layered cut-outs, drawn shapes, optional 3D GLB, and a shared paper/halftone finish. Voiceover-first: 4-6 short lines (Edge TTS, user names the voice) become the storyboard backbone. Three base colours, two lighting conditions, scene-per-composition with camera-continuity transitions (pupil portal, recede-and-blur), 15fps stepped cadence, Studio controls exposed, SFX that follow the animation controls. Use for "minimal reel", "metaphor reel", "paper reel", "tactile short", or the mr-N series — when the WORDS carry the meaning but OBJECTS carry the picture (pure typography is a fallback variant; collage/footage is /make-vox; MG-style UI demos are /make-motion-graphics). Defers TSX crash rules to vidtsx-2d-generator and SFX taste to suggest-sfx.
---

# make-minimal-reel — tactile metaphor reels

The genre: **one idea, three metaphors, one shared finish.** "Your attention is pulled in
a hundred directions → choose one thing → there's more beneath the surface" becomes a
scanning eye, a battery filling under a swinging lamp, an iceberg revealing its mass. The
look is printed and tactile — ivory paper, halftone dots, film grain, imperfect edges —
and the motion is deliberate: a 15fps cadence, regular sines for the world, irregular
flutter for paper. A minimal reel that feels empty failed; one that feels *calm and
expensive* nailed it.

**The whole thing in one line:** start with the voiceover, storyboard one clear metaphor
per scene, expose the useful controls, share the finish, and tune the sound against the
final edit.

## The form (the saved numbers — good out of the box)

- 1080×1920 @ **15fps** (the stepped cadence IS the aesthetic — never 30fps here).
  Duration class **332 frames ≈ 22.1s** (18-26s fine). Three scenes, each its OWN
  Studio composition (previewed and tuned separately), then one master that assembles
  them in order. **Final picture length lands on an exact frame count.**
- **Three base colours + one muted support, in ONE shared place** (`lib/tactile.tsx`
  exports `MR`): Ivory `#F1EDE4`, Teal `#17343D`, Muted teal `#527C80`, Ink `#080F16`.
  Light scenes: ivory background + teal text. Dark scenes: teal background + ivory text.
  Muted teal for supporting details. ONE warm-gold accent per reel (the claim tag).
  A change to the palette must carry across every scene — that's why it's shared.
- **The 3-beat arc:** distraction/hook → focused attention (the choice) → hidden
  potential (the reveal). Each scene = one metaphor + the voiceover beat that reveals
  it. Subject, movement direction, and meaning all point the same way.
- **Shared finish (the tactile stack, `lib/tactile.tsx` `<Tactile>`):** halftone
  Multiply @0.50, 6.7px spacing, dot 0.57, 63°, contrast 0.61 · paper 0.19
  (brightness 0.65) · grain 0.29 · procedural noise 0.14 · chromatic split 1.5px ·
  edge split 4px · shake 1px · exposure flicker 0.04 · vignette 0.22 · peripheral
  blur 8px with a clear centre. **Text sits ABOVE the peripheral blur.**
- **TWO KINDS OF TEXTURE (the #1 law):** screen-level finish is fixed to the frame
  (`<Tactile>` wraps the scene); object-bound texture (the submerged iceberg's darker
  copy + underwater paper @0.13, the dollars' grade) lives INSIDE the object's transform
  so it travels with the object. Mix these up and the pattern visibly slides over the
  artwork.
- **Two kinds of movement:** the WORLD uses regular sines (iceberg bob 18px @0.65cps,
  water wave 23px amp / 640px wavelength / 0.5cps, buoy 12px bob @0.43cps + 4° rock +
  follows the LOCAL wave height so nothing moves in lockstep, lamp swing 3.5° @4.8s
  period). PAPER uses irregular-but-repeatable flutter (the tag's folded corner:
  resting curl 0.15, turn 0.85s). Ignition flicker is a FIXED stepped sequence
  [0.85, 0.08, 1, 0.22, 0.7] over 0.49s then hold — never random flashing.

## Artifact contract

```
minimal-reels/mr-N-<slug>/
  script.md        — VO lines + storyboard (scene | metaphor | movement | reveal)
  beats.json       — machine contract: vo[] (one line per sentence) + format {15fps}
  voice/ · sfx-plan.json · output/                          [voice/output gitignored]
remotion/src/shots/mr-N/MrN<Name>.tsx  — master composition
  (+ MrN<Name>Scene1/2/3.tsx — each scene independently previewable)
media/projects/mr-N-<slug>/            — cut-outs + paper/grain textures (committed)
```

Kit: `remotion/src/lib/tactile.tsx` — `MR` (palette), `Tactile` (finish stack),
`Halftone`, `WaveSurface` + `WaterSplit` + `waveYAt` (the water boundary),
`sine`/`flutter`/`ignition`, `PaperTag`, `ContourLines`, `TwoToneText` (cone trick).
Motion engine: `lib/engine.tsx` (boil, posterizeFrame, focusHunt, decaySwing).

## Stage 1 — voiceover first (the backbone)

Write 4-6 short lines WITH the user in a quick back-and-forth until the message feels
right. 5 lines is the classic shape (~13s at natural speed): the claim, the choice, the
practice, the doubt, the reveal. **Only the voiceover words appear on screen.** Then
`beats.json` (vo[] contract, format fps 15) and Edge TTS:

```
python tools/gen_voice_edge.py --beats minimal-reels/mr-N-<slug>/beats.json \
    --voice <USER-NAMED-VOICE> --emit-ts remotion/src/shots/mr-N/vo.gen.ts \
    --mux remotion/out/MrN<Name>.mp4
```

The tool synthesizes each sentence separately (that IS the "split at quiet boundaries"
step) and writes REAL word times back. Suits calm, close voices (`en-US-AvaNeural`,
`en-US-AndrewNeural`, `en-GB-SoniaNeural`) — the user names the voice; ask once, then
it lives in brand.md.

## Stage 2 — storyboard + asset kit

One rough board per beat: subject, direction of movement, what the VO line reveals.
Then assemble the visual kit (cut-outs + drawn shapes + textures — three sources):

- **Cut-out images** (transparent PNG, e.g. iceberg, buoy, clouds, lamp, bills): the
  image-generation skill ("minimal flat illustration cut-out, [colour] on transparent
  background, soft edges, no text, no shadow") → saved into
  `media/projects/mr-N-<slug>/` and referenced via staticFile. Grade them IN-object
  (saturation ~0.19, gain 0.94, lift −0.24 + soft shadow 0.25/32px/18px blur + boil
  0.6 @8cps) so the finish never flattens them.
- **Drawn shapes** (social icons, battery, moon, vision cone, contour lines): pure SVG
  in the TSX — `ContourLines` (29 lines, 39px apart, 1.7px strokes @0.32, fading
  outward, travelling WITH the scene), the battery (240×470 body, ivory outline+fill,
  five segments filling bottom→top over 3.8s), the moon (ivory, ~71px, glow 1).
- **Textures:** seamless paper PNG + grain still via image-generation ("seamless
  tileable paper texture, ivory, subtle fibres" / "film grain monochrome") into
  `public/` for `<Tactile paperFile grainFile>`. Underwater paper is a second, darker
  paper @0.13 applied to the submerged copy.
- **Optional 3D GLB** (the eye): `@remotion/three` `<ThreeCanvas>` + glTF loader;
  keep the geometry light (~11k triangles), saturation ~0.2, gaze strength 0.75. Give
  the gaze a TARGET LIST (icon positions, then the viewer), with turn time
  PROPORTIONAL to the angle travelled (same easing at each end — the timing fix that
  mattered), final eye-speed multiplier ~1.7. No GLB available? A drawn eye with the
  same gaze-driven cone reads fine.

## Stage 3 — the scenes (build ONE at a time, preview, then master)

**Scene 1 — the claim scene (light, ivory).** Start the frame fully composed on the
headline, then the camera travels toward the subject while scaling — **translate and
scale over the SAME interval** (scale-then-move reads as two moves). Sync the headline
entrance to the VO. The vision cone attaches to the gaze at full opacity and extends
beyond the frame corners; social icons live UNDER a matching mask so only the
cone-covered part appears (`TwoToneText` for the letter-exact colour switch). Extras
enter from opposing corners BEHIND all text, with saved placements + in-object grade.
**Exit = push into the pupil** (portal to scene 2).

**Scene 2 — the practice scene (dark, teal night).** Enter from the black pupil. Open
with a **focus hunt**: `focusHunt(f, [{0,12},{1.45s,12},{1.7s,3},{1.9s,7},{2.35s,0}])`.
The pendant is ALREADY swinging when we arrive (sine 3.5° @4.8s, pivot above frame);
ignition starts ~1.4s as a stepped on/off sequence; the beam follows the pendant
(opening ~352px, X/Y exposed). The battery sits beneath: charging from 2.7s, filling
bottom→top over 3.8s, five visible segments. Peripheral icons at CSS Z positions
(−550…+330, perspective 1400) with ASSIGNED blur (10px near, 5px far) + subtle drift —
depth without a 3D set, and the sharp battery stays the subject. Text above the
battery and above the edge blur. **Exit = recede and blur together:** over the final
0.5s shrink toward 0.72 WITH acceleration, elements receding WITHOUT clipping to a
shrinking rectangle, full-frame night background CONTINUOUS beneath, edge treatment
fixed to the output frame.

**Scene 3 — the reveal scene (same night, continuous).** The iceberg arrives slightly
enlarged (1.18) and blurred, settling to 1 over ~0.6s — scale and blur move together,
one continuous camera move. Water = `WaveSurface` (top edge sampled every 8px) and
`WaterSplit` uses the SAME boundary to separate above-water from submerged (submerged
copy darker + its own underwater paper @0.13). Buoy follows the local wave height via
`waveYAt` + its own bob + rock. The claim lands as a `PaperTag`: payoff words INSIDE
the flapping tag, lead-in words OUTSIDE; a small folded corner RETAINED (never fully
uncurled), reverse warmer+darker with a fine crease. Drawn annotation + label under
the waterline, land on the final line's words. **Exit/loop: settle back onto a frame
the master can cut on** — minimal reels may END on the revealed truth (no forced loop
when the arc is a reveal; if looping is wanted, match frame 0 == last frame exactly).

**Master:** assemble the scenes in order, align the VO clips at their natural speed
(never time-stretch a voice), preview the transitions together, and make the final
picture land on an exact frame count (332f @15fps is the classic).

**Controls (the reusable system):** every scene exposes its useful knobs as Remotion
Studio `defaultProps` — eye speed, bill placement, wave height/wavelength/speed, buoy
bob/rock, pendant cone position/width, paper/grain levels, audio levels. The point: a
visual decision in Studio without another code edit. Tune against rendered frames,
then freeze the approved values into the defaults.

## Stage 4 — measured QA + render

```
cd remotion && npm run gen
node scripts/frames.mjs MrNName 0,<scene-landings,transition-frames,tag-frames,last> --scale=0.5
```

READ the PNGs at the transitions: cone crossing letters cleanly · battery fill and
ticks aligned · water boundary splitting the iceberg at the waterline, buoy riding the
wave · tag fold retained and fluttering · text readable and above edge blur · the two
texture kinds not sliding. `bash tools/qa_frozen_time.sh` (one exemption: deliberate
holds still breathe — slow 1.0→1.03 push), `bash tools/qa_loudness.sh` (voice ≥ -16
LUFS, no clipping). Render `--scale=1`, re-check exported frames around the
transitions, save the approved master beside the source assets.

## Stage 5 — sound carries the meaning

Music: ONE calm bed under everything (dark ambient / minimal electronic / lofi from
the library, vol ≤0.22) with a shape that mirrors the arc (searching → focused →
open). SFX LAYERED TO THE CONTROLS, not to the timeline: gear clicks FOLLOW the
eye-speed control, battery ticks FOLLOW the filling cells, water ambience rides the
wave, lamp buzz while lit. One deep impact + its reversed swell exactly on the reveal
word (~0.30). Generate missing SFX with the gen/search skills (paper flutter, lamp
ignition, water lapping, soft ticks — library first). The user's ear is the gate.

## Variant T — pure typography (when no metaphor fits)

If the idea has no physical metaphor, keep everything above but let the STATEMENTS be
the visual: ≤8 words on screen, one accent word with a highlight wipe landing on its
spoken syllable, fade+rise entrances staggered 3-4f, ONE geometry motif (rules OR dots
OR grids), the same `<Tactile>` finish at halved strength. This is a fallback, not the
default — the metaphor version is what makes the genre.

## Done =

VO-first 5-line arc cut tight · 3 metaphors, one per scene, each previewable alone ·
3-colour palette shared from one file, light/dark conditions consistent · camera
continuity (portal, recede+blur, scale+blur-together) with no background cuts ·
`<Tactile>` finish identical across scenes, two texture kinds respected · text above
peripheral blur · world on sines, paper on flutter, ignition stepped · Studio controls
exposed · SFX following the animation controls · measured QA passed · exact frame
count · voice muxed at natural speed.
