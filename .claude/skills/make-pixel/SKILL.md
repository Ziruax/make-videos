---
name: make-pixel
description: Make a PIXEL-ART animation (pixel style) end-to-end in the animate engine — one canvas drawn in code, joined by shape-morphs, with a synthesized score, rendered to MP4 via headless Chromium + ffmpeg. Drawn at a low internal resolution (90x160 / 135x240 / 180x320 for 9:16 — resolutions must divide 1080x1920 exactly) with whole-pixel primitives in a limited palette (PAL16 16-colour or HANDHELD 4-green), ordered Bayer dithering instead of gradients, a built-in 5x7 bitmap font (never a system font), sprites from string arrays, device screen effects (LCD grid, scanlines, curved-tube vignette), then upscaled nearest-neighbour to 1080x1920; resolution tells time — later eras are sharper. Deterministic, storyboard-approved before animating, measured review at the end. Voice-over by Edge TTS with real word times (picture cues on the words). Use when the user asks for "pixel art", "8-bit", "16-bit animation", "retro game style", "handheld", says "/make-pixel", or picks this style from the gallery. For a photo-cutout documentary reel use /make-motion-graphics instead; for Remotion tracks use /make-short or /make-vox; this is the procedural canvas pixel-art engine.
argument-hint: "[what the video is about] [length] [voice?]"
---

# make-pixel — the animate flow, pinned to pixel

This command runs the **animate** skill's full pipeline with the style locked to
**pixel** (low-res pixel art, upscaled nearest-neighbour). The style supplies
the drawing kit; story grammar, timing, sound, renderer and review tools are
shared. One style per piece.

## Read before anything (in order, from this repo's root)

1. `.claude/skills/animate/SKILL.md` — the flow: intake → story check → look check
   (2–4 style frames) → storyboard check (every beat) → build → review → deliver.
   Its **non-negotiables** apply fully: no animating before an approved storyboard,
   look at `styles/pixel/sample.png` + `demo/` before drawing, web-check every
   fact, seeded randomness only, "done" is `review.mjs` numbers + contact sheets.
2. `.claude/skills/animate/craft.md` — the craft rules.
3. `.claude/skills/animate/grammar/FORMATS.md`, `grammar/STORY.md`, `grammar/FRAME.md`.
4. `.claude/skills/animate/styles/pixel/STYLE.md` — the style's full rules, kit
   API (`lowres(res, draw, { fx })`, `pset`/`prect`/`pline`/`pellipse`/`pdither`/
   `pgrad`/`pglow`, `FONT5` + `pixText`, `sprite`, `pixHero`,
   `pixCaption`/`pixTag`/`pixBox`/`pixOverlay`, `ERA_RES` + `ERA_POST`) and frame
   checklist.
5. Environment notes below.

## The style in one breath

Drawn at a low internal resolution (90x160 / 135x240 / 180x320 for 9:16 —
resolutions must divide 1080x1920 exactly) with whole-pixel primitives in a
limited palette (PAL16 16-colour or HANDHELD 4-green), then upscaled
nearest-neighbour to 1080x1920. Hard square pixels, ordered Bayer dithering
instead of gradients, a built-in 5x7 bitmap font (never a system font), sprites
from string arrays, device screen effects (LCD grid, scanlines, curved-tube
vignette). RESOLUTION TELLS TIME: later eras are sharper — a chronology gets
sharper as it goes.

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

## Style pins (the details that make it pixel)

- `piece.json`: `"style": "pixel"`. Start by copying `piece.json` + `src/` from
  `.claude/skills/animate/styles/pixel/demo/` (a 4-colour handheld dusk at
  90x160 whose moon becomes a spinning coin over a 16-colour arcade night at
  180x320), or `templates/beat-cut/`, `templates/piece/`.
- Declare `ERA_RES = [[w, h], ...]` + `ERA_POST` in `src/bridges.js`;
  resolutions must divide 1080x1920 exactly with a ≥2x step between
  neighbouring eras. RESOLUTION TELLS TIME: later eras are sharper.
- Whole-pixel moves only — positions are integers in pixel space
  (`Math.floor(TT * 12)` per boil, `Math.round` on eased paths). On 2s by
  default (`STYLE.ones = false`); a piece needing smooth scrolling may set
  `STYLE.ones = true` in its scenes.
- Sprite frames flip on beats (`Math.floor(TT / BEAT) % 2`); jumps are
  whole-pixel parabolas; things blink rather than fade (on/off keyed on `B` or
  the beat — never an alpha ramp).
- NO camera: `pieceCam` returns null — move the world instead; to "zoom in", cut
  to a finer resolution. Place bridge objects with `pixToWorld` so the morph
  lands on the drawn object.
- One palette per era, enforced with `fx: { pal }` snap (and `ERA_POST[e].pal`):
  PAL16 arcade or HANDHELD 4-green; mixed colours are dithered, never blended.
  Design sprites at true size — a later era's hero has MORE pixels, not bigger
  ones. The morph blob's grid steps between the eras' pixel sizes (12 → 10 →
  8 → 6 px).
- Text in `FONT5` + `pixText` (count = typing reveal, cursor = blinking block),
  in the era's own resolution — never a system font. Never anti-alias, `arc`,
  `stroke` or `fillText` inside `lowres`; never scale sprites by non-integers.
- Don't imitate any specific commercial game's characters, logos or iconic
  blocks — the arcade vocabulary (coins, bricks, a score) is generic.

## Done =

Storyboard approved before animating · `review.mjs` passes (cut grid / story arc /
text check / loudness) · contact sheets read at phone size · determinism
(`tile.mjs`) true · voice cued on real word times (if used) · LOG.md filled with
the per-shot PASS table and the weakest shot · MP4 at `pieces/<name>/renders/`.
