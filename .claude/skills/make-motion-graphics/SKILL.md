---
name: make-motion-graphics
description: Build a premium DOCUMENTARY MOTION-GRAPHICS reel (1080×1920 or 1920×1080, ~30s) end-to-end — the "Netflix vs Blockbuster" style: a locked 4-8 line voiceover IS the source code, one scene per line, photo cutouts composited on textured backdrops with a 12fps stop-motion engine, an aged-film treatment (scan lines, grain sandwich, gate weave, vignette, per-scene grade), signature moves (zoom-through-frame with weld/detach, screen-blend smoke, slot-machine text, parallax punch anchored to the feet, drawn lamp light, focus-hunt, decaying wag), Edge TTS voice (user names the voice), whoosh/shutter/cha-ching SFX, and a words-always-win mix. Use for "story reel", "documentary reel", "narrated brand story", "company history video", "vs video" (Netflix vs Blockbuster style), or to continue the mg-N series — not data-driven maps (make-map), not paper collage (make-vox), not typography-minimal (make-minimal-reel). Defers TSX crash rules to vidtsx-2d-generator, critic rounds to review-cut.
---

# make-motion-graphics — documentary story reels, end to end

The genre: a narrated true story (business, history, drama) told in 4–8 scenes. Each scene
is a PHOTO COLLAGE brought alive — cutout characters on textured backdrops, stop-motion
boil on everything, a film treatment over it all. The polish comes from choreography and
continuity, not from per-image complexity.

## The one rule that matters: THE VOICEOVER IS THE SOURCE CODE

Write and lock the script FIRST — one VO line per scene, 6 lines for ~30s. Every scene's
timing is cut from the gaps between those lines. Never build a scene before its line
exists; never re-time the VO to fit visuals. (Voice = Edge TTS; the user names the voice.)

## Artifact contract

```
mg-reels/mg-N-<slug>/
  script.md        — the locked VO lines + storyboard table (scene → look → signature move → assets)
  beats.json       — machine contract: vo[] (one line per scene) + format + scene windows
  voice/ · sfx-plan.json · output/                                  [voice/output gitignored]
remotion/src/shots/mg-N/MgN<Name>.tsx  — THE composition: per-scene files + master timeline
media/projects/mg-N-<slug>/            — generated cutouts, backdrops, textures (committed)
```

Shared code (already in the repo):
- `remotion/src/lib/engine.tsx` — the 12fps motion engine: `posterizeFrame`, `boil`,
  `drift`, `pingpong`, `decaySwing`, `softSpring`, `blurBurst`, `focusHunt`, `grade`,
  `ScreenBlend`.
- `remotion/src/lib/filmlook.tsx` — `FilmLook`: scan lines + inverted grain (multiply) +
  grunge (colour-burn) + vignette + per-scene grade props + 12fps gate weave, layer toggles.

## Format

1080×1920 @30fps (vertical reel) or 1920×1080, ~30s, 6 scenes @ ~5s. One file per scene so
each previews on its own + a master timeline that drops them in order.

## Stage 1 — storyboard from the VO

From each VO line derive: what we're looking at · the words that go ON SCREEN (pulled
straight from the line) · the emotional beat (opener / offer / opposite / fall / payoff /
finale) · ONE signature animation · the exact assets needed. Type the storyboard as a
table in `script.md`, then `beats.json`.

## Stage 2 — assets (cutouts + textures)

- **Backdrops** (buildings, streets, offices, walls): full-frame AI images — the agent's
  **image-generation skill** or `tools/gen_image.py`; prompt as a production brief (lens,
  light, "bright, nothing crushed to black", negative space for type, no text/logos/people).
- **Character cutouts** (the boss, the founder, the exec): generated on plain white
  backgrounds, then `tools/cutout.py` (rembg) for die-cuts. Keep aspect ratios recorded —
  swapping characters between scenes (the finale-clone trick) needs the true w/h.
- **Textures**: `grain.jpg` + `grunge.jpg` (generation or library; these ride EVERY scene
  via FilmLook, so make them generic — they graduate to `media/library/`).
- **Plate footage** (smoke plumes, clouds, loops): shot-on-black clips composited with
  `ScreenBlend`. The **image-search** skill finds real plate footage; generation works too.
- Everything lands in `media/projects/mg-N-<slug>/` with `.json` sidecars (prompt, source,
  license). Reuse before generating — check the catalogs.

## Stage 3 — the engine + film look (once, then every scene)

Every scene wraps its content in `<FilmLook grainFile="…" grungeFile="…" stepFps={12}>`
with per-scene grade props (sombre beats: saturate ~0.62; payoff: ~0.82). Every moving
value derives from `posterizeFrame(frame)` so motion stutters like stop-motion. Gate weave
jitters the frame ~5px; FilmLook scales 1.012 to hide the edges.

## Stage 4 — the scenes (the signature moves, proven settings)

Build ONE scene per prompt-worth of work, in order, importing the previous scene's end
state when a move carries over:

1. **The opener (museum frame):** a framed B&W photo on a wall — slow push (scale 1.0→1.16
   over ~46f), then a zoom-through: accelerate the wall to ~6.8× while the photo content
   WELDS to the frame until ~f62 (content scale = 0.369 × wall scale — never let them ease
   apart), then DETACH: the frame flies past the edges, the photo settles 0.75→1.0 and
   cross-fades B&W → full colour. Full-frame `blurBurst` peaking ~9px at the fastest point.
   Drifting clouds behind (two speeds = parallax). Serif plaque for the date.
2. **The offer (boss + props):** character rises with a `softSpring`, punches in to ~1.09;
   smoke plume via `ScreenBlend` (crush contrast, feather the top edge, anchor to the cigar
   ember, glued to the boss). Props slide in from opposite edges inside hand-drawn
   wireframe diamonds that draw on and boil. Slot-machine text: values spin past then SLAM
   to a stop on the money word. The punctuation beat: 2–3 frame hold-keyframe negative
   flickers, then B&W + red eye glows.
3. **The list (papers drop):** three headline props drop one at a time (left/right/bottom
   entrances, ~−26° rotation settling to ~−7°), each on a `softSpring`, scaling 1.1→1.0,
   stop-motion boil. Focus-hunt opener (blur clearing over ~14f).
4. **The fall (parallax punch):** flat plates sold as depth by motion — the background
   pushes 1.0→1.12 while the character punches to ~1.7× ANCHORED AT HIS FEET (scale around
   the feet, not frame centre; the man growing faster than the wall IS the illusion). The
   shadow is the character duplicated, painted black, flipped down from the feet, skewed
   ~−53°, blurred 7px, 55% opacity — no separate shadow asset. Stack the lines one every
   ~6f. Then the shift: slide the character ~235px left with a motion-blur streak.
5. **The payoff (drawn light):** layered plates (bg → character → desk). The lamp light is
   DRAWN: four radial gradients stacked on screen blend (white-hot core, warm bloom halo,
   shade-mouth glow, ambient spill) + a blurred funnel beam behind the character; parent
   ALL of it to the lamp and swing ~±3° so light sways with the pendulum. When the lens
   defocuses, bloom the core ~2.4× into bokeh. Cash highlight: duplicate the cutout
   recolored chartreuse, flickered with HOLD keyframes (instant on/off, never fades).
   Vintage focus-hunt camera: wide + defocused → snap in → dip out → creep to 1.08.
   Hand-drawn yellow pencil oval scribbles on around the key word.
6. **The finale (clone + reskin):** clone the fall scene — keep the parallax punch, shadow,
   camera, treatment — swap the character and the words, and add THE gesture: a red foam
   finger rises from bottom-right (slide + 0.72→1 scale over ~12f) then wags "no" about the
   wrist: `decaySwing(frame, 24, 28°, 0.52, 0.042)`.

**Every scene:** on-screen words are pulled straight from the VO line (serif-italic
captions), entrances staggered, nothing fully still (boil + drift), readable landing →
fast exit.

## Stage 5 — QA + render

Per scene while building: scrub in Remotion Studio (sliders on everything: timings,
colors, sizes, positions — default props must be INLINE object literals so Save-to-code
works). After each scene: `node scripts/frames.mjs MgN<Scene> <cues> --scale=0.5`, READ the
PNGs. Master: `npm run gen` + render at scale 1. Measured QA: `tools/qa_frozen_time.sh`
(≤ ~1s per 30s), `tools/qa_loudness.sh`. Flagships: `/review-cut` fresh-critic round.

## Stage 6 — voice + sound

Edge TTS (the user names the voice; documentary voices read best at rate −4%):
```
python tools/gen_voice_edge.py --beats mg-reels/mg-N-<slug>/beats.json \
    --voice en-US-AndrewNeural --emit-ts remotion/src/shots/mg-N/vo.gen.ts \
    --mux remotion/out/MgN<Name>.mp4
```
SFX (short + punchy, trimmed to the attack so the hit is ON the beat): one long whoosh for
the zoom-through, quick whooshes for pans · vintage camera shutter on the photo opener ·
cha-ching on the money hit · neon buzz under the swinging lamp. Library-first, then
web-search (Mixkit/Pixabay). Music: a library track cut to picture, hard-ducked under the
VO — **the words always win**. Voice ≥ music; if a cue fights a word, the cue loses.

## Done =

VO locked before pixels · every scene's timing cut from its line's window · film treatment
consistent film-wide · signature moves landed (zoom-through weld/detach, screen-blend
smoke, slot-machine, parallax punch, drawn light, decaying wag) · 12fps stop-motion engine
everywhere · Edge TTS voice with word-exact captions muxed · SFX on the beat + music under
words · measured QA + (flagships) a critic round · no CTA outro — end on the payoff line.
