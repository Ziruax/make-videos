---
name: make-math
description: Make a MANIM-STYLE MATH EXPLAINER animation (math style) end-to-end in the animate engine — one canvas drawn in code, joined by shape-morphs, with a synthesized score, rendered to MP4 via headless Chromium + ffmpeg. Coloured math on a near-black stage #0E0E10: serif type that is WRITTEN on (never typed, never popped), axes and graphs that ShowCreation-sweep into place, equations that Transform into each other by matching terms, a tracking dot with a live honest decimal readout, a small pi-shaped hero with eyes watching the math; motion on 1s with manim's sigmoid smooth easing, no texture or grain — colour coding does the work. Deterministic, storyboard-approved before animating, measured review at the end. Voice-over by Edge TTS with real word times (picture cues on the words). Use when the user asks for "math animation", "manim style", "equation explainer", "proof animation", "graph explainer", says "/make-math", or picks this style from the gallery — but only when the math on screen can be TRUE. For a photo-cutout documentary reel use /make-motion-graphics instead; for Remotion tracks use /make-short or /make-vox; this is the procedural canvas math-explainer engine.
argument-hint: "[what the video is about] [length] [voice?]"
---

# make-math — the animate flow, pinned to math

This command runs the **animate** skill's full pipeline with the style locked to
**math** (manim-style explainer). The style supplies the drawing kit; story
grammar, timing, sound, renderer and review tools are shared. One style per
piece.

## Read before anything (in order, from this repo's root)

1. `.claude/skills/animate/SKILL.md` — the flow: intake → story check → look check
   (2–4 style frames) → storyboard check (every beat) → build → review → deliver.
   Its **non-negotiables** apply fully: no animating before an approved storyboard,
   look at `styles/math/sample.png` + `demo/` before drawing, web-check every
   fact, seeded randomness only, "done" is `review.mjs` numbers + contact sheets.
2. `.claude/skills/animate/craft.md` — the craft rules.
3. `.claude/skills/animate/grammar/FORMATS.md`, `grammar/STORY.md`, `grammar/FRAME.md`.
4. `.claude/skills/animate/styles/math/STYLE.md` — the style's full rules, kit API
   (`writeTex`/`writeText`, `transformTex`, `showCreation`, `axes2`/`graphM`/
   `dropLines`, `trackDot`/`readout`, `piHero`, `mathCaption`/`mathTag`) and frame
   checklist.
5. Environment notes below.

## The style in one breath

Coloured math on a near-black stage `#0E0E10` — serif type that is WRITTEN on
(never typed, never popped), axes and graphs that ShowCreation-sweep into
place, equations that Transform into each other by matching terms, a tracking
dot with a live honest decimal readout, and a small pi-shaped hero with eyes
watching the math. Motion on 1s with manim's sigmoid `smooth` easing; nothing
boils, no texture or grain — clean vector strokes, so the colour coding does
the work. Use it only when the math on screen can be true.

## Environment specifics (this repo)

- The skill lives at `.claude/skills/animate/` — run its tools from the repo root:
  `node .claude/skills/animate/tools/build.mjs pieces/<name>` etc.
- Pieces live at `pieces/<name>/` (repo root). `pieces/*/frames/`,
  `pieces/*/renders/`, `pieces/*/voice/` are gitignored; commit piece.json, src/,
  brief.md, LOG.md, voice/script.json.
- Verified working E2E here (including the Edge-TTS voice bridge): build, still, tile, export, review (Playwright 1.63 + Chromium cached; ffmpeg on PATH). SANDBOX NOTE: export completes but the process hangs at exit — run it in the background (or under a timeout) and verify outputs landed in pieces/<name>/renders/ (final.mp4, audio.wav, stems).
  cached; ffmpeg on PATH). Export: `node .claude/skills/animate/tools/export.mjs
  pieces/<name> --share` (`--blur 4` IS appropriate here — this style runs on 1s,
  `STYLE.ones = true`).
- **Voice-over (default ON, Edge TTS — the user may name a voice):**
  1. Write `pieces/<name>/voice/script.json` — `{ "lead": 1.2, "tail": 1.8,
     "lines": [{ "id": "open", "text": "…", "after": 0.45 }, …] }`. One line per
     beat; ≤3.5 words/s; longer `after` where the picture needs room (a count, a
     caption, the silence before the payoff).
  2. `python tools/gen_takes_edge.py --piece pieces/<name>` (defaults: voice
     `en-US-ChristopherNeural`, rate `-4%`; pass `--voice`/`--rate`/`--pitch` if
     the user chose). One take per line, cached — re-runs only resynthesize
     changed lines.
  3. `node .claude/skills/animate/tools/voice.mjs pieces/<name> --model base.en`
     → `voice/voice.wav` + `voice.json` (every word's real time, local whisper).
  4. `piece.json`: `"voice": { "file": "voice/voice.wav", "music": -14 }`.
  5. Rebuild after voice: scenes cued on `VL(id)` / `VW(id, word, n)` move with
     the voice automatically. Put the payoff hit in a pause BEFORE the line that
     names it.
  6. Build a timing voice first with `voice.mjs --scratch` only if the user wants
     the picture before the voice; prefer generating real takes immediately.
- Default format **9:16** (1080×1920 @ 24fps, 120 BPM; the 8th grid is 6 frames).
  Native **b-roll is 16:9 at 60fps** (1920×1080) — at 120 BPM an 8th is exactly
  15 frames, so cuts land on whole frames; stay on 8ths. Ask at intake which;
  the skill's formats machinery handles the rest.
- Score: synthesized in code (`src/score.js`) — no audio files. SFX cues land on
  the animation's own landing frames (whoosh during a move, hit at the landing).
- Review from the repo root: `node .claude/skills/animate/tools/review.mjs
  pieces/<name>`; phone strip `review/phone.jpg`; text check over your eye.

## Style pins (the details that make it math)

- `piece.json`: `"style": "math"`. Start by copying `piece.json` + `src/` from
  `.claude/skills/animate/styles/math/demo/` (a 6s 9:16: `a² + b² = c²` drawn as
  unit cells, the square on c morphing into the unit circle while the formula
  Transforms to `cos²θ + sin²θ = 1` and a live readout keeps summing to 1), or
  `templates/beat-cut/`, `templates/piece/`.
- One idea per frame; motion explains — every move maps to a step of the
  argument, decorative motion is the hero only (blink, hop, Flash on the result).
- The equation and the picture agree: readouts computed from the same tracker
  that moves the dot; rounded values add up as displayed. If a claim isn't
  exactly true at the shown precision, change what you show — never state more
  than the math supports, even in a caption.
- Colour coding does the work: give each quantity ONE colour (manim's
  red/green/yellow/blue = quantities 1–4) and keep it everywhere — formula,
  figure, labels, readouts, captions. White = operators, greys = axes/guides,
  pi blue `#2E86AB` = the hero only, `#FFFF00` for Flash only.
- TeX conventions: italic variables, upright digits and function names, TeX
  operator spacing, a true minus `−`, superscripts at 0.6 size. Sizes at
  1080×1920: main formula 90–110px, labels 40–52px, nothing under 28px.
- Run times ~1s: Write 0.7–1.0s, ShowCreation 0.5–1.0s, Transform 0.8–1.0s;
  lag ratios 1.2–1.4 across the glyphs of a Write, 0.5 across siblings.
- The camera stays still — or ONE slow eased push. Formulas are Written, never
  typed like a terminal, never popped.
- The morph bridge shape IS the next idea: the square on c becomes the circle of
  radius c — bridge eras with a shape that carries the argument.
- Don't use grain, wobble, boil, drop shadows, gradients behind math or
  textures; this is the one clean style.

## Done =

Storyboard approved before animating · `review.mjs` passes (cut grid / story arc /
text check / loudness) · contact sheets read at phone size · determinism
(`tile.mjs`) true · voice cued on real word times (if used) · LOG.md filled with
the per-shot PASS table and the weakest shot · MP4 at `pieces/<name>/renders/`.
