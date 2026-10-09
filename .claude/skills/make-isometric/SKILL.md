---
name: make-isometric
description: Make an ISOMETRIC PRODUCT-ILLUSTRATION animation (isometric style) end-to-end in the animate engine — one canvas drawn in code, joined by shape-morphs, with a synthesized score, rendered to MP4 via headless Chromium + ffmpeg. Calm, precise product illustration: objects in 2:1 dimetric isometric on a white ground, drawn ONLY with constant hairlines (edge #a4a4ac 2px, inner #e0e0e4, one dark accent #232327 per frame on the focus); grey silhouettes and edges, faces filled white so nearer objects hide farther lines; rounded slabs and plates with visible thickness, stacked layers, grids of repeated parts (keys, vents, ports); motion on 1s, every move settles on a spring, otherwise truly still (dark variant available). Deterministic, storyboard-approved before animating, measured review at the end. Voice-over by Edge TTS with real word times (picture cues on the words). Use when the user asks for "isometric", "product illustration animation", "technical line art", "dimetric", says "/make-isometric", or picks this style from the gallery. For a photo-cutout documentary reel use /make-motion-graphics instead; for Remotion tracks use /make-short or /make-vox; this is the procedural canvas isometric line-art engine.
argument-hint: "[what the video is about] [length] [voice?]"
---

# make-isometric — the animate flow, pinned to isometric

This command runs the **animate** skill's full pipeline with the style locked to
**isometric** (2:1 dimetric hairline line art). The style supplies the drawing
kit; story grammar, timing, sound, renderer and review tools are shared. One
style per piece.

## Read before anything (in order, from this repo's root)

1. `.claude/skills/animate/SKILL.md` — the flow: intake → story check → look check
   (2–4 style frames) → storyboard check (every beat) → build → review → deliver.
   Its **non-negotiables** apply fully: no animating before an approved storyboard,
   look at `styles/isometric/sample.png` + `demo/` before drawing, web-check every
   fact, seeded randomness only, "done" is `review.mjs` numbers + contact sheets.
2. `.claude/skills/animate/craft.md` — the craft rules.
3. `.claude/skills/animate/grammar/FORMATS.md`, `grammar/STORY.md`, `grammar/FRAME.md`.
4. `.claude/skills/animate/styles/isometric/STYLE.md` — the style's full rules,
   kit API (`setIso`/`iso`/`isoP`, `hair()`, `isoSlab`/`isoBox`/`isoCyl`/
   `isoPlates`/`isoGrid`, `faceOf`/`slabFace`/`faceRR`/`faceSlab`/`facePts`/
   `isoText`/`accentDot`/`lamp`, `spring`/`kick`/`springTo`, `isoMug`/`isoPlant`/
   `isoCable`, `cubeBot`, `isoCaption`/`isoTag`) and frame checklist.
5. Environment notes below.

## The style in one breath

Calm, precise product illustration — objects in 2:1 dimetric isometric on a
white ground, drawn ONLY with constant hairlines (edge `#a4a4ac` 2px, inner
`#e0e0e4`, one dark accent `#232327` per frame on the focus); grey silhouettes
and edges, faces filled white so nearer objects hide farther lines. Rounded
slabs and plates with visible thickness, stacked layers, grids of repeated
parts (keys, vents, ports). Motion on 1s, every move settles on a spring —
otherwise truly still.

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
- Default format **9:16** (1080×1920 @ 24fps, 120 BPM); **1:1** also suits this
  look. Ask at intake for 16:9 / multiple formats; the skill's formats machinery
  handles the rest.
- Score: synthesized in code (`src/score.js`) — no audio files. SFX cues land on
  the animation's own landing frames (whoosh during a move, hit at the landing).
- Review from the repo root: `node .claude/skills/animate/tools/review.mjs
  pieces/<name>`; phone strip `review/phone.jpg`; text check over your eye.

## Style pins (the details that make it isometric)

- `piece.json`: `"style": "isometric"`. Start by copying `piece.json` + `src/`
  from `.claude/skills/animate/styles/isometric/demo/`, or `demo-dark/` for the
  dark variant (`const ISO_DARK = true;` — ground `#101014`, the accent becomes
  the brightest thing), or `templates/beat-cut/`, `templates/piece/`.
- Every edge sits on an iso axis (slope ±0.5 or vertical) unless visibly
  rotating. Hairlines are CONSTANT on screen at any zoom — `hair()` divides by
  the transform scale, so a camera push never thickens a line; same weight
  everywhere, only the colour changes (edge vs inner).
- Painter's order back-to-front (smaller x + y first; lower z first in a stack);
  white faces hide what's behind — no line shows through a solid; riders (the
  hero on a blade) drawn last.
- Detail comes from repetition, not texture — a grid of keys, vents, ports,
  plates; big faces stay empty. White space around the object is part of the
  look: one object group spanning ~75–80% of the frame width, nothing touching
  the frame edge. No shadows, gradients, grain or colour.
- Motion: every move settles on a spring (`spring(t, t0, { k, damp })`, `kick`,
  `springTo`) and then holds still; stagger reveals along the iso diagonal,
  never all at once. Camera still or a slow push z ≤ 1.05 — never shake.
- Labels set INTO faces (`isoText` skews the glyphs into the plane; `faceRR`,
  `faceSlab` for parts on faces; never stroke inside a skewed transform).
- One dark accent per frame, and it is the focus (the cursor, the live LED;
  the hero's eyes too) — don't add a second dark element, move the accent.
- Build L-shapes from two slabs (`isoSlab` fills the convex hull; non-convex
  outlines are not a primitive). Bridge morphs with a face outline (`facePts`)
  on both sides so the shape stays in-plane.

## Done =

Storyboard approved before animating · `review.mjs` passes (cut grid / story arc /
text check / loudness) · contact sheets read at phone size · determinism
(`tile.mjs`) true · voice cued on real word times (if used) · LOG.md filled with
the per-shot PASS table and the weakest shot · MP4 at `pieces/<name>/renders/`.
