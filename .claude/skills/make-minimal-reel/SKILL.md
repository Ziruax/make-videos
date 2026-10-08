---
name: make-minimal-reel
description: Build a MINIMAL typographic reel (1080×1920, 15-30s) end-to-end — the kinetic-typography genre: bold statements on clean surfaces, one accent color, word-by-word reveal synced to an Edge TTS voiceover (user names the voice), sparse geometry (lines, dots, grids), generous negative space, subtle premium motion (fade+rise, scale pops ≤1.06, stagger 3-4f), optional 2-3 abstract AI-generated backdrops, and a seamless loop. Use for "minimal reel", "text reel", "quote reel", "motivational short", "facts list", "stat reel", "manifesto video", or the mr-N series — when the WORDS are the visual, not photos/maps/collage (those are make-minimal-reel's siblings: make-motion-graphics, make-map, make-vox). Defers TSX crash rules to vidtsx-2d-generator and SFX taste to suggest-sfx.
---

# make-minimal-reel — typography-first minimal reels

The genre: the WORDS ARE THE VISUAL. One idea, 3–6 statements, each landing as a composed
typographic frame — think Swiss poster design that breathes at 30fps. No photos, no
footage (optional: 2–3 abstract AI backdrops). What carries it: type hierarchy, timing
locked to the voice, and restraint. A minimal reel that feels empty failed; one that feels
*calm and expensive* nailed it.

## The form

- 1080×1920 @30fps, **15–30s** (shorter than the 40s TSX track — minimal reels punch fast).
- **3–6 statements**, one per beat: HOOK statement (frame 0 fully composed, the payoff
  word already visible) → supporting statements (each ONE idea, ≤8 words on screen) →
  payoff statement → LOOP (last frame == frame 0).
- **One accent color** from brand.md (violet/teal/pink/yellow) on a paper/ink surface.
  Never two accents in one reel. On-screen words are pulled straight from the VO line.
- Type: FONT_DISPLAY (Space Grotesk) for statements, FONT_BODY (Inter) for small labels,
  FONT_CODE (JetBrains Mono) for numbers/stats. One type size ladder: ~120/72/40/28.
  Weights 600/500 only — minimal reels never mix 4 weights.

## Artifact contract

```
minimal-reels/mr-N-<slug>/
  script.md        — the statements + beat table (time | statement | accent word | motion)
  beats.json       — machine contract: vo[] (one line per statement) + format
  voice/ · sfx-plan.json · output/                                  [voice/output gitignored]
remotion/src/shots/mr-N/MrN<Name>.tsx  — THE composition
media/projects/mr-N-<slug>/            — optional abstract backdrops (committed)
```

Kit: `remotion/src/lib/shorts.tsx` (Captions, Kicker, SAFE, EASE_OUT) + the motion engine
(`lib/engine.tsx`). A minimal-reel statement component belongs in the kit
(`lib/minimal.tsx` — add on first use): `Statement` (big line, accent-word highlight wipe,
fade+rise entrance), `Meta` (small mono label top-left), `Rule` (hairline that draws on),
`Dot`, `Counter` (numbers ticking up).

## Stage 1 — script: cut every word

Write the statements like a copywriter on deadline: ≤8 words on screen at a time, the
hook states the payoff's RESULT (not a tease), the payoff statement is the shareable
sentence. VO mirrors the on-screen words exactly (captions ARE the statement).
~2.7 wps windows, slack to the next line. Then beats.json (same vo[] contract).

## Stage 2 — the composition

- ONE persistent surface (paper `#fffef7` or ink `#1a1a2e`) — never a cut; beats dissolve
  INTO each other (outgoing statement exits down 24px + fade over ~7f while the next rises).
- **Statement entrance:** fade + rise (translateY 24px→0, ~7f, ease-out), staggered
  3–4f between lines of a multi-line statement. **Accent word:** the ONE word per
  statement gets the accent color + a highlight wipe behind it (scaleX 0→1 left-origin)
  landing exactly on its spoken syllable (word time from vo.gen.ts).
- **Scale pops ≤1.06**, springs damping 200 — never bouncy (brand.md §5).
- **Numbers tick, they don't pop:** a stat (e.g. "×11") counts up over ~20f in mono.
- Sparse geometry as rhythm: a hairline `Rule` drawing on under a settled statement,
  a 3-dot progress cluster, a dot grid faintly drifting in the background (drift ±6px,
  8–20s loop). ONE geometry motif per reel — don't mix rules, dots AND grids.
- **Optional backdrops:** 2–3 abstract AI images (soft gradient fields, paper texture,
  out-of-focus bokeh — "no text, no objects") via the image-generation skill, placed at
  8–12% opacity under the ink surface so type contrast stays WCAG-AA. Skip entirely for
  the purest look.
- Captions block centered ~y1500 when VO word-synced highlight is wanted (the `Captions`
  kit component works as-is); or make the STATEMENTS themselves the captions (cleaner —
  then no separate caption block).
- Safe areas: bottom 340px / right 160px free; frame 0 fully composed; loop settles
  back onto the hook statement exactly.

## Stage 3 — QA + render

```
cd remotion && npm run gen
node scripts/frames.mjs MrNName 0,<statement-landings,accent-wipes,last> --scale=0.5
```
READ the PNGs: every statement lands READABLE (≥1.2s hold per statement at 30fps) · accent
wipe synced to the word · no element inside the safe-zone dead zone · loop frame ≈ frame 0.
Measured: `bash tools/qa_frozen_time.sh` — minimal reels get ONE exemption: the deliberate
reading hold between statements, but no single stretch > 1.2s, and the hold still breathes
(slow 1.0→1.03 push on the statement). Render `--scale=1`.

## Stage 4 — voice

Edge TTS, the user names the voice (minimal reels suit clean, younger voices:
`en-US-AndrewNeural`, `en-US-AvaNeural`, `en-GB-SoniaNeural`):
```
python tools/gen_voice_edge.py --beats minimal-reels/mr-N-<slug>/beats.json \
    --voice en-US-AndrewNeural --emit-ts remotion/src/shots/mr-N/vo.gen.ts \
    --mux remotion/out/MrN<Name>.mp4
```
Statement entrances re-time to the REAL word times (the tool writes them back).

## Stage 5 — sound (sparse: the genre is quiet)

SFX: one soft `ui-click-soft`/`pop-reveal` per statement landing (gain ~0..+3), one
`whoosh-soft` (−6..−9) on the loop transition. That's the ceiling — resist more. Music:
one calm bed (ambient-pad/lofi-warm from the library) hard-ducked, or SILENCE with
deliberate room tone (a valid minimal choice — state it in the plan). The user's ear
is the gate.

## Done =

statements cut to ≤8 words · one accent color, one geometry motif · every statement
readable ≥1.2s with the accent word synced to speech · measured QA passed (with the
reading-hold exemption applied honestly) · Edge TTS voice muxed · sparse sound ·
seamless loop back to the hook.
