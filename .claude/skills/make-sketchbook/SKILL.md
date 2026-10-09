---
name: make-sketchbook
description: Make a GRAPHITE SKETCHBOOK animation (sketchbook style) end-to-end in the animate engine — one canvas drawn in code, joined by shape-morphs, with a synthesized score, rendered to MP4 via headless Chromium + ffmpeg. Graphite and ONE accent colour (terracotta #d97757, the hero only) on a warm sketchbook page #f2ead8 — dot grid, spiral binding, smudges and a coffee ring stay in view; things get pencilled in, inked over, then coloured with a quick scribble; hand lettering narrates; the camera moves across the page instead of cutting away. Deterministic, storyboard-approved before animating, measured review at the end. Voice-over by Edge TTS with real word times (picture cues on the words). Use when the user asks for "sketchbook", "graphite", "hand-drawn sketch animation", "notebook doodle", says "/make-sketchbook", or picks this style from the gallery. For a photo-cutout documentary reel use /make-motion-graphics instead; for Remotion tracks use /make-short or /make-vox; this is the procedural canvas sketchbook engine.
argument-hint: "[what the video is about] [length] [voice?]"
---

# make-sketchbook — the animate flow, pinned to sketchbook

This command runs the **animate** skill's full pipeline with the style locked to
**sketchbook** (graphite on a sketchbook page). The style supplies the drawing
kit; story grammar, timing, sound, renderer and review tools are shared. One
style per piece.

## Read before anything (in order, from this repo's root)

1. `.claude/skills/animate/SKILL.md` — the flow: intake → story check → look check
   (2–4 style frames) → storyboard check (every beat) → build → review → deliver.
   Its **non-negotiables** apply fully: no animating before an approved storyboard,
   look at `styles/sketchbook/sample.png` + `demo/` before drawing, web-check every
   fact, seeded randomness only, "done" is `review.mjs` numbers + contact sheets.
2. `.claude/skills/animate/craft.md` — the craft rules.
3. `.claude/skills/animate/grammar/FORMATS.md`, `grammar/STORY.md`, `grammar/FRAME.md`.
4. `.claude/skills/animate/styles/sketchbook/STYLE.md` — the style's full rules,
   kit API (`gline`, `gpencil`, `gfill`, `ghatch`, `scribbleFill`, `handLetter`,
   `sketchPage`, `pencilTool`, `eraserTool`, `doodleHero`, `pageTag`,
   `pageCaption`) and frame checklist.
5. Environment notes below.

## The style in one breath

Graphite and ONE accent colour (terracotta `#d97757`, the hero only) on a warm
sketchbook page `#f2ead8` — dot grid, spiral binding, smudges, a coffee ring,
all staying in view. Things get pencilled in, inked over, then coloured with a
quick scribble; hand lettering narrates; the camera moves across the page
instead of cutting away. Two pens: `gline` (ink, confident) and `gpencil`
(graphite, provisional) — colour sits off the line. Highlighter yellow on ONE
word per caption; red marker for one underline per scene. Everything boils on
2s but structure never moves.

## Environment specifics (this repo)

- The skill lives at `.claude/skills/animate/` — run its tools from the repo root:
  `node .claude/skills/animate/tools/build.mjs pieces/<name>` etc.
- Pieces live at `pieces/<name>/` (repo root). `pieces/*/frames/`,
  `pieces/*/renders/`, `pieces/*/voice/` are gitignored; commit piece.json, src/,
  brief.md, LOG.md, voice/script.json.
- Verified working E2E here (including the Edge-TTS voice bridge): build, still, tile, export, review (Playwright 1.63 + Chromium cached; ffmpeg on PATH). SANDBOX NOTE: export completes but the process hangs at exit — run it in the background (or under a timeout) and verify outputs landed in pieces/<name>/renders/ (final.mp4, audio.wav, stems).
  cached; ffmpeg on PATH). Export: `node .claude/skills/animate/tools/export.mjs
  pieces/<name> --share` (`--blur` does nothing for styles on 2s — NOT this one).
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
- Default format **9:16** (1080×1920 @ 24fps, 120 BPM). Ask at intake for 16:9 /
  1:1 / multiple formats; the skill's formats machinery handles the rest.
- Score: synthesized in code (`src/score.js`) — no audio files. SFX cues land on
  the animation's own landing frames (whoosh during a move, hit at the landing).
- Review from the repo root: `node .claude/skills/animate/tools/review.mjs
  pieces/<name>`; phone strip `review/phone.jpg`; text check over your eye.

## Style pins (the details that make it sketchbook)

- `piece.json`: `"style": "sketchbook"`. Start by copying `piece.json` + `src/`
  from `.claude/skills/animate/styles/sketchbook/demo/` (a 6s: a lightbulb doodle
  morphs into the sun over a sketched hill), or `templates/beat-cut/` for
  hard-cut-on-beat pieces, `templates/piece/` for the plainest morph piece.
- Two pens: `gline` is ink (settled, confident), `gpencil` is graphite
  (provisional). Mess is graphite; what's settled is ink — graphite does most of
  the drawing, terracotta appears only on the hero.
- Write-ons instead of pops: an object is pencilled in (`part`), inked over, then
  coloured with a quick scribble — and the pencil prop (`pencilTool` at
  `writeEnd(...)`) follows the line as it goes; rubbing out uses `eraserTool`.
- Colour sits off the line (`gfill` lands a few pixels off the ink;
  `scribbleFill` for the colour pass). Highlighter yellow `#f7d64a` on ONE word
  per caption; red marker for ONE underline or stamp per scene.
- Lettering is the narrator (`handLetter` with `reveal`): ~20 characters a line,
  2 lines at most, readable at phone size without the picture.
- Everything boils on 2s but structure never moves — only the tremor changes;
  nothing slides smoothly on 1s apart from the camera.
- The page is the world: some page shows in every frame (grid, binding, smudge,
  coffee ring, page edge) and the morph happens on the bare page. Don't fill the
  frame edge-to-edge — leave paper.
- Shading is hatching (`ghatch`), never a gradient; no second accent colour, no
  typeset-looking type, no web fonts or images.

## Done =

Storyboard approved before animating · `review.mjs` passes (cut grid / story arc /
text check / loudness) · contact sheets read at phone size · determinism
(`tile.mjs`) true · voice cued on real word times (if used) · LOG.md filled with
the per-shot PASS table and the weakest shot · MP4 at `pieces/<name>/renders/`.
