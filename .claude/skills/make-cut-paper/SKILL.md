---
name: make-cut-paper
description: Make a TORN-PAPER COLLAGE animation (cut-paper style) end-to-end in the animate engine — one canvas drawn in code, joined by shape-morphs, with a synthesized score, rendered to MP4 via headless Chromium + ffmpeg. Torn edges, drop shadows, crayon fills, patterns (gingham, stripes, wood grain), full-bleed colour worlds, characters with simple faces that react; the hero colour is reserved. Deterministic, storyboard-approved before animating, measured review at the end. Voice-over by Edge TTS with real word times (picture cues on the words). Use when the user asks for "cut paper", "torn paper", "paper collage animation in code", says "/make-cut-paper", or picks this style from the gallery. For a photo-cutout documentary reel use /make-motion-graphics instead; for the Remotion VOX paper-collage look use /make-vox; this is the procedural canvas cut-paper engine.
argument-hint: "[what the video is about] [length] [voice?]"
---

# make-cut-paper — the animate flow, pinned to cut-paper

This command runs the **animate** skill's full pipeline with the style locked to
**cut-paper**. The style supplies the drawing kit; story grammar, timing, sound,
renderer and review tools are shared. One style per piece.

## Read before anything (in order, from this repo's root)

1. `.claude/skills/animate/SKILL.md` — the flow: intake → story check → look check
   (2–4 style frames) → storyboard check (every beat) → build → review → deliver.
   Its **non-negotiables** apply fully: no animating before an approved storyboard,
   look at `styles/cut-paper/sample.png` + `demo/` before drawing, web-check every
   fact, seeded randomness only, "done" is `review.mjs` numbers + contact sheets.
2. `.claude/skills/animate/craft.md` — the craft rules.
3. `.claude/skills/animate/grammar/FORMATS.md`, `grammar/STORY.md`, `grammar/FRAME.md`.
4. `.claude/skills/animate/styles/cut-paper/STYLE.md` — the style's full rules, kit
   API (`cut`, `rect`, `pat.*`, `face`, `spark`, `person`, `tag`, `yearTag`,
   `capStrip`, `handText`) and frame checklist.
5. Environment notes below.

## The style in one breath

Torn-edge paper shapes with soft drop shadows, paper grain and crayon in the fills,
patterns (stripes, dots, gingham, wood grain), full-bleed colour worlds (one
dominant wall colour per scene so eras read on a contact sheet), characters with
simple faces that act and react. Orange `#ec7a4f` is RESERVED for the spark (the
hero) — never decoration. Morphs happen on blank cream paper through a torn-hole
window. Motion on 2s; pops for arrivals, write-ons for words; the spark idles
(bob, blink, ray sway). A character with a face, acting, in a full-bleed world,
plus 3+ details of background life, in EVERY key frame.

## Environment specifics (this repo)

- The skill lives at `.claude/skills/animate/` — run its tools from the repo root:
  `node .claude/skills/animate/tools/build.mjs pieces/<name>` etc.
- Pieces live at `pieces/<name>/` (repo root). `pieces/*/frames/`,
  `pieces/*/renders/`, `pieces/*/voice/` are gitignored; commit piece.json, src/,
  brief.md, LOG.md, voice/script.json.
- Verified working E2E here (including the Edge-TTS voice bridge): build, still, tile, export, review (Playwright 1.63 + Chromium cached; ffmpeg on PATH). SANDBOX NOTE: export completes but the process hangs at exit — run it in the background (or under a timeout) and verify outputs landed in pieces/<name>/renders/ (final.mp4, audio.wav, stems).
  cached; ffmpeg on PATH). Export: `node .claude/skills/animate/tools/export.mjs
  pieces/<name> --share` (adds `--blur` only for `STYLE.ones` styles — NOT this one).
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

## Style pins (the details that make it cut-paper)

- `piece.json`: `"style": "cut-paper"`. Start by copying `piece.json` + `src/`
  from `.claude/skills/animate/styles/cut-paper/demo/` (it already speaks the kit
  and joins eras with a morph), or `templates/beat-cut/` for hard-cut-on-beat
  pieces, `templates/piece/` for the plainest morph piece.
- One dominant wall colour per era; torn edges + shadow + at least one pattern per
  frame; hand-lettered tags (`yearTag`, `capStrip`) — never bare type.
- Bridge objects ≥ 200px and in frame at the boundary; morphs on blank cream
  paper; ≤3 morphs under 30s (each costs ~1.2s) or `{ tc, d: 0.4 }` short bridges.
- Ray-count device for chronologies (the spark gains a ray each era); the end is
  the start, changed.
- Don't fade props with `globalAlpha` (textures reset it) — skip them instead.

## Done =

Storyboard approved before animating · `review.mjs` passes (cut grid / story arc /
text check / loudness) · contact sheets read at phone size · determinism
(`tile.mjs`) true · voice cued on real word times (if used) · LOG.md filled with
the per-shot PASS table and the weakest shot · MP4 at `pieces/<name>/renders/`.
