---
name: make-crosshatch
description: Make a CROSSHATCH INK animation (sketchy ink style) end-to-end in the animate engine — one canvas drawn in code, joined by shape-morphs, with a synthesized score, rendered to MP4 via headless Chromium + ffmpeg. A boiling sketchy ink line, crosshatch and coloured-pencil shading clipped inside shapes, stipple, paper grain; warm cream paper and wood by day, navy "inside the computer" worlds with periwinkle lines and glowing accents by night; terracotta #d97757 is the hero dot and red pencil dashes mean a plan. Deterministic, storyboard-approved before animating, measured review at the end. Voice-over by Edge TTS with real word times (picture cues on the words). Use when the user asks for "crosshatch", "ink", "sketchy ink animation", "boiling line", says "/make-crosshatch", or picks this style from the gallery. For a photo-cutout documentary reel use /make-motion-graphics instead; for Remotion tracks use /make-short or /make-vox; this is the procedural canvas crosshatch-ink engine.
argument-hint: "[what the video is about] [length] [voice?]"
---

# make-crosshatch — the animate flow, pinned to crosshatch

This command runs the **animate** skill's full pipeline with the style locked to
**crosshatch** (Crosshatch ink). The style supplies the drawing kit; story
grammar, timing, sound, renderer and review tools are shared. One style per
piece.

## Read before anything (in order, from this repo's root)

1. `.claude/skills/animate/SKILL.md` — the flow: intake → story check → look check
   (2–4 style frames) → storyboard check (every beat) → build → review → deliver.
   Its **non-negotiables** apply fully: no animating before an approved storyboard,
   look at `styles/crosshatch/sample.png` + `demo/` before drawing, web-check every
   fact, seeded randomness only, "done" is `review.mjs` numbers + contact sheets.
2. `.claude/skills/animate/craft.md` — the craft rules.
3. `.claude/skills/animate/grammar/FORMATS.md`, `grammar/STORY.md`, `grammar/FRAME.md`.
4. `.claude/skills/animate/styles/crosshatch/STYLE.md` — the style's full rules, kit
   API (`ink`, `paint` with `tex` hatch/cross/pencil/stipple, `grain`, `toolPill`,
   `planInk`, `dotHero`, `inkTag`, `inkCaption`, `monoText`, `irisHole`) and frame
   checklist.
5. Environment notes below.

## The style in one breath

A sketchy ink line that boils on 2s, crosshatch and coloured-pencil shading
clipped inside shapes, stipple, paper grain; warm cream paper and wood by day,
navy "inside the computer" worlds with periwinkle lines and glowing accents by
night. Terracotta `#d97757` is the hero (the ink dot); red pencil dashes mean a
plan. Lines write on, code types itself (`monoText`), and an iris (`irisHole`)
dives into the dark world. The line boils even in held frames — the drawing is
alive when nothing moves.

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

## Style pins (the details that make it crosshatch)

- `piece.json`: `"style": "crosshatch"`. Start by copying `piece.json` + `src/`
  from `.claude/skills/animate/styles/crosshatch/demo/` (a 6s desk by day that
  becomes the machine at night), or `templates/beat-cut/` for hard-cut-on-beat
  pieces, `templates/piece/` for the plainest morph piece.
- Every filled shape has a texture (hatch, cross, pencil or stipple) shaped by
  light — density falling toward the bottom-right, lit from the top-left. No
  flat fills except paper.
- The line boils even in held frames (the wobble reseeds each boil step);
  write-ons (`frac`) for lines, plans and handwriting; `monoText(..., { count })`
  types code; tool-call pills (`toolPill`) make agent steps readable — and must
  be true.
- The dark world and the paper world must differ on a contact sheet: navy +
  periwinkle lines inside the machine, cream + ink outside. The hero dot keeps
  its terracotta + asterisk in both worlds (it glows in the dark).
- Show the plan (red pencil dashes) first, then the doing (ink) — the same
  thing done for real.
- Dark close-ups on 9:16 need ~1.2× zoom to fill the phone-safe area.
- Don't fade props with `globalAlpha` (`paint()`/`hatch()` reset it) — skip the
  prop instead.

## Done =

Storyboard approved before animating · `review.mjs` passes (cut grid / story arc /
text check / loudness) · contact sheets read at phone size · determinism
(`tile.mjs`) true · voice cued on real word times (if used) · LOG.md filled with
the per-shot PASS table and the weakest shot · MP4 at `pieces/<name>/renders/`.
