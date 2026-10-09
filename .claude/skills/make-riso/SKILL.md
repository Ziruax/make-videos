---
name: make-riso
description: Make a THREE-INK RISOGRAPH PRINT animation (riso style) end-to-end in the animate engine — one canvas drawn in code, joined by shape-morphs, with a synthesized score, rendered to MP4 via headless Chromium + ffmpeg. Halftone screens at their own angles (teal 15°, pink 75°, yellow 45°), overprints instead of mixed colours, plates a few pixels off register, ink dropouts that sparkle in the darks, on cream paper #f2ece3 — nothing is painted, everything is printed; no black ink, no white ink (white is a paper knockout). Deterministic, storyboard-approved before animating, measured review at the end. Voice-over by Edge TTS with real word times (picture cues on the words). Use when the user asks for "riso", "risograph", "screen print", "halftone print animation", says "/make-riso", or picks this style from the gallery. For a photo-cutout documentary reel use /make-motion-graphics instead; for Remotion tracks use /make-short or /make-vox; this is the procedural canvas riso-print engine.
argument-hint: "[what the video is about] [length] [voice?]"
---

# make-riso — the animate flow, pinned to riso

This command runs the **animate** skill's full pipeline with the style locked to
**riso** (three-ink risograph print). The style supplies the drawing kit; story
grammar, timing, sound, renderer and review tools are shared. One style per
piece.

## Read before anything (in order, from this repo's root)

1. `.claude/skills/animate/SKILL.md` — the flow: intake → story check → look check
   (2–4 style frames) → storyboard check (every beat) → build → review → deliver.
   Its **non-negotiables** apply fully: no animating before an approved storyboard,
   look at `styles/riso/sample.png` + `demo/` before drawing, web-check every
   fact, seeded randomness only, "done" is `review.mjs` numbers + contact sheets.
2. `.claude/skills/animate/craft.md` — the craft rules.
3. `.claude/skills/animate/grammar/FORMATS.md`, `grammar/STORY.md`, `grammar/FRAME.md`.
4. `.claude/skills/animate/styles/riso/STYLE.md` — the style's full rules, kit API
   (`beginSheet`/`beginLayer`/`printLayer`, `fill(path, tones)`, `line(P, tones)`,
   `type`, `risoHero`, `risoTag`/`risoCaption`, `MIX`, `PITCH`) and frame
   checklist.
5. Environment notes below.

## The style in one breath

A three-ink risograph print on cream paper `#f2ece3` — halftone screens at their
own angles (teal 15°, pink 75°, yellow 45°), overprints instead of mixed
colours, plates a few pixels off register, ink dropouts that sparkle in the
darks. **The one rule: nothing is painted, everything is printed** — no black
ink, no white ink (white is the paper, knocked out); olive-black darks are
three-ink overprints. The print shimmers on 2s without crawling; worlds open as
circles with rough teal rims.

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

## Style pins (the details that make it riso)

- `piece.json`: `"style": "riso"`. Start by copying `piece.json` + `src/` from
  `.claude/skills/animate/styles/riso/demo/` (a 6s 9:16 morph chain: a rooftop
  at dawn whose sun becomes an orange in a market crate), or `templates/beat-cut/`
  for hard-cut-on-beat pieces, `templates/piece/` for the plainest morph piece.
- **Nothing is painted, everything is printed.** Every colour is plate tones
  `{ teal, pink, yellow }` or a `MIX` name — no RGB in a scene, no black ink, no
  white ink (white is a paper knockout, `fill(path, {})`).
- One screen pitch per layer, scaled with the illustration: `fine` 7px (tags,
  small vignettes, a lone hero), `world` 10.8px (a full-frame world), `field`
  17.5px (a coarse far field). Dots visibly change size across a gradient.
- Fills knock out, lines overprint (a teal line over yellow reads green; knock a
  pink detail on a dark ground or it turns ink-blue). Darks are three-ink
  olive-black overprints with dropouts that sparkle.
- Misregistration: pink (+4, −3), yellow (−3, +4) against the teal key, keyed
  `B % 3` — fringes visible on any dark or ink-blue edge.
- Worlds open as circles with rough teal rims; cuts and event cues on the 8th
  grid (120 BPM at 24fps = 6 frames), fast onsets on 16ths.
- Cost: ~70–100ms per full-frame layer (the per-pixel print pass) — give small
  things a `box`; a world is one field layer + one world layer.
- Don't use the crosshatch kit's `ink()`/`paint()` here — this medium has no
  pen. No smooth RGB gradients, drop shadows, blurs or `ctx.filter` on top of a
  print; the paper stays flat (no vignette, no grain on top).

## Done =

Storyboard approved before animating · `review.mjs` passes (cut grid / story arc /
text check / loudness) · contact sheets read at phone size · determinism
(`tile.mjs`) true · voice cued on real word times (if used) · LOG.md filled with
the per-shot PASS table and the weakest shot · MP4 at `pieces/<name>/renders/`.
