---
name: make-short
description: Build a fully-synthetic vertical short (1080×1920, ~40s) end-to-end from a topic OR a user-supplied SCRIPT — script intake + beats.json, linked TSX beats over a persistent canvas, motion grammar (MOTION.md), phone-scale QA, determinism check, render, Edge TTS voice (free, user-provided voice name; ElevenLabs optional) with exact word-synced captions, SFX audition, optional music bed. Use when the user wants to "make a short", "create a shorts video", brings a script/narration to turn into a short, builds a TSX short for a niche (chess, math, algorithms, dev tips, Excel…), adds voice/captions to a short, or continues the short-N series in this repo. This is the 100%-TSX track — for video-model pixels use make-ai-short, for the paper-collage documentary look use make-vox, for animated map films use make-map, for documentary motion-graphics reels use make-motion-graphics, for tactile metaphor reels use make-minimal-reel. Defers raw TSX crash rules to vidtsx-2d-generator, motion grammar to MOTION.md, and SFX taste to suggest-sfx + brand §7.
---

# make-short — fully-TSX vertical shorts, end to end

Everything is code: no footage, no stock. One short = one Remotion composition fed by a
beats contract, with voice and SFX layered on after render. Proven across the 12 example
shorts in `shorts/`. The idea bank + niche ranking lives in **`IDEAS.md`** — read it when
picking a topic, and grow it when brainstorming.

Run everything from the **repo root**. Tools are stdlib-only Python 3.10+ (voice needs
`pip install edge-tts`); `ffmpeg`/`node` must be on PATH; API keys live in `.env` (see
`.env.example`) and are only needed for optional ElevenLabs/music passes.

## Script-first entry (when the user brings a script)

The user's script IS the brief — never rewrite its meaning, only its shape:

1. **Route check.** Read it once and confirm this track fits (100% code-animated niches
   with a teachable payoff — chess/math/algorithms/tips). If the script is a narrated
   story → make-motion-graphics; a metaphor piece → make-minimal-reel; a geography/
   conflict explainer → make-map. Say so and route; don't force-fit.
2. **Adapt to the beat grammar.** Map sentences onto HOOK → SETUP → (QUIZ) → REVEAL →
   TWIST → LOOP. Cut words, not claims: every fact survives, filler phrases go. On-screen
   text ≤ 8 words per beat, pulled from the script's own words. Time the VO at ~2.7 wps
   and CUT or PAD to the 38–42s budget — if the script is 2× over, ask before gutting it.
3. **One confirmation round.** Show the beat table + what you cut and why, and get a
   thumbs-up BEFORE voice or pixels. Then run the normal pipeline from Stage 2 (script.md
   and beats.json get built FROM the user's words, keeping their phrasing wherever it
   already works as captions).

## Artifact contract

```
shorts/short-N-<niche>/
  script.md        — hook, beat sheet table (time | on screen | VO), production notes
  beats.json       — machine contract: format, vo[] (text+start/end+words), beats[], niche timeline
  voice/           — per-line TTS clips + voice.wav        (gen_voice_edge.py)  [gitignored]
  sfx-plan.json    — cue sheet on the global timeline       (mix_sfx.py)
  output/          — short-N-sfx.mp4 (+ music auditions)                       [gitignored]
remotion/src/shots/short-N/
  ShortN<Name>.tsx — THE composition (registered by npm run gen)
  vo.gen.ts        — AUTO-GENERATED VO with exact word times (never hand-edit)
```

Shared kit: `remotion/src/lib/shorts.tsx` (Captions, Kicker, BigTitle, Stamp, PauseCard,
StatChip, ProgressBar, ShortsBackdrop, SAFE areas, prog helper). Motion engine:
`remotion/src/lib/engine.tsx` (posterizeFrame, boil, drift, softSpring, blurBurst,
focusHunt, decaySwing, ScreenBlend). Film treatment: `remotion/src/lib/filmlook.tsx`.
Niche libs so far: `lib/chess.tsx`, `lib/math.tsx`, `lib/algo.tsx`, `lib/sheet.tsx`,
`lib/piano.tsx`, `lib/prob.tsx`, `lib/map.tsx`, `lib/orbit.tsx`, `lib/chart.tsx`,
`lib/story.tsx`… **Add at most ONE new niche lib per short**, generic enough for a series.

## Stage 1 — script + beats

Beat grammar (~38–42s): **HOOK** (0–3.4s, frame 0 FULLY composed — the payoff already visible,
no fade from black) → **SETUP** → optional **QUIZ** (PauseCard, ~2.5s — drives comments) →
**REVEAL** in 2–4 steps, each synced to a VO word → **TWIST** → **LOOP** (last frame == frame 0,
dissolving the payoff back into the intro so it replays seamlessly).

**Outros — no fluff.** NEVER end on an old-school engagement-CTA. End on the PAYOFF
line, and let the visual LOOP blend back into the intro — the loop-into-intro *is* the ending.
Trim the composition so it ends shortly after the payoff, not seconds of dead air.

VO rules: ~100 words total, estimate line windows at **~2.7 words/sec with slack to the next
line's start**. Facts must be verified before scripting. Write `script.md` + `beats.json`
(vo lines with estimated start/end; niche timeline in global SECONDS).

## Stage 2 — the composition

- One `.tsx` under `remotion/src/shots/short-N/`, `compositionConfig` 1080×1920 @30, ~42s.
  Follow vidtsx-2d-generator's hard rules (frame-based only, monotonic ranges, Easing.bezier).
- Beats = `<Sequence>` scenes over ONE persistent canvas (the board/equation/array is the
  continuity — rewinds and evolutions happen in a single component's timeline, not cuts).
- `Captions lines={VO}` + `ProgressBar` mounted at the ROOT (global time), scenes beneath.
- **THE recurring bug: frames inside a `<Sequence>` are LOCAL.** Converting a global beat
  second to a scene cue is `local_f = global_s*fps − sequence_from`. Check every cue twice.
- Frame-0 rule: hook scene uses `warm` props and negative `at`s so highlights/stamps are
  already on at f0. Loop scene reverses the hook's punch-in (settle 1.06→1 vs grow 1→1.06).
- Safe areas: captions block centered ~y1500; nothing critical in bottom 340px / right 160px.

### Motion grammar (the six rules — MOTION.md is the full reference)

1. **The foreground becomes the transition.** The payoff word/shape scales through the
   camera with directional blur while the next beat is already in place underneath — no
   empty gap between scenes.
2. **One persistent actor.** The board/array/equation keeps its identity across beats;
   unrelated reveals in sequence feel like a slideshow however well each is animated.
3. **Change speed; don't drift.** Eases INTO a landing so the viewer can read, then leaves
   quickly. No motionless stretch over ~0.6s; reading holds still breathe (slow 3–5% push).
4. **Layer the frame:** one primary move + supporting staggers + fine tertiary detail
   (ticks, edge sweeps) overlapping — never start/stop the whole frame on every beat.
5. **Hard cuts are allowed when matched** (subject, scale, direction, material) and
   motion continues after the cut — otherwise carry an object through instead.
6. **Cause → effect.** Every animated action visibly produces a result (a click produces
   a state, a scan produces a finding). Motion that decorates without consequence is
   filler.

**Composition density (critics reject 'basic' before anything else):** the lead subject
fills **60–85% of the usable frame** in feature beats · 10–15 distinct compositions per
30s · vary the composition TYPE (macro close-up / wide / overhead / UI close-up / type
impact) · 1–2 reading targets at a time · equal spacing + shared left edges in lists ·
**scale pops stay ≤1.06; stagger list entrances 3–4 frames** (brand.md §5) · motion-blur
burst (engine `blurBurst`) on the fastest point of the 2–3 biggest moves.

**Name the 2–3 signature mechanisms** in script.md (from MOTION.md's catalog, in plain
words: "the equation collapses into the answer", "the wasted-move path draws as a dashed
trace") — that's what makes a short re-watchable.

### Optional: the film-look pass

If the short wants a documentary/aged texture: wrap the root in
`<FilmLook grainFile="library/…" grungeFile="…" stepFps={12}>` (see `lib/filmlook.tsx`) —
scan lines + inverted grain multiply + grunge colour-burn + vignette + 12fps gate weave.
Not for the default light/airy brand look — only when the topic calls for it.

## Stage 3 — QA (do not skip, it catches real bugs every time)

```
cd remotion && npm run gen        # frames.mjs does NOT run gen-registry itself
node scripts/frames.mjs ShortNName 0,<beat-boundaries+hero-frames>,<last> --scale=0.5
```
READ every PNG (phone scale). Checklist: frame 0 composed & thumbnail-grade · every reveal
synced to its beat · nothing covering the payoff element · kickers swap with the narration ·
captions clear of UI zones · loop frame ≈ frame 0 · **on mute, a first-time viewer still
gets the payoff** (captions + visuals carry it — sound off is the default viewing state).

**Measured QA after the full render** (cheap, catches what the eye misses):
```
bash tools/qa_frozen_time.sh remotion/out/ShortNName.mp4   # near-frozen time ≤ ~1s per 30s
bash tools/qa_loudness.sh remotion/out/ShortNName-voiced.mp4  # ~-15.5 LUFS shorts calibration
bash tools/qa_determinism.sh ShortNName 0,<mid>,<last>        # same frame twice = same pixels
```
For a flagship video, run a fresh-critic round too: the `/review-cut` skill (builder ≠
judge; the critic sees only the render + brief).

Fix, re-render frames, only then:
```
node scripts/render-all.mjs ShortNName --scale=1     # -> remotion/out/ShortNName.mp4
```

## Stage 4 — voice (Edge TTS default: FREE, no API key; user picks the voice name)

```
python tools/gen_voice_edge.py --beats shorts/short-N-<niche>/beats.json \
    --voice en-US-ChristopherNeural \
    --emit-ts remotion/src/shots/short-N/vo.gen.ts
```
- **The user names the voice** (any Edge TTS voice, e.g. `en-GB-RyanNeural`,
  `en-US-GuyNeural`, `en-IN-PrabhatNeural`…). `--list-voices` browses them; fuzzy
  fragments resolve. Ask the user for their preferred voice if not given.
- Per-line synthesis with WordBoundary events → REAL per-word times (tempo-scaled,
  global) written into beats.json AND `vo.gen.ts`. Same contract as the ElevenLabs tool:
  captions then highlight on the exact spoken word. Never estimate when a voice track exists.
- Clips are cached by text-hash: rewriting one line only re-synthesizes that line.
- `--rate "-4%"` default keeps narration calm; fit overflows are capped atempo like always.
- Then re-render the composition (captions retimed) and mux:
  `ffmpeg -i remotion/out/<Id>.mp4 -i shorts/.../voice/voice.wav -map 0:v -map 1:a -c:v copy
   -c:a aac -b:a 192k -t 42 remotion/out/<Id>-voiced.mp4`
  (or `--mux remotion/out/<Id>.mp4` on the tool).
- ElevenLabs remains available for emotion-tagged narration:
  `python tools/gen_voice.py --beats … --voice TX3LPaxmHKxFdv7VOQHJ` (needs
  ELEVENLABS_API_KEY; v3 tags like [whisper] still work there).

## Stage 5 — SFX (the suggest-sfx machinery, shorts flavor)

Read `brand.md` §7 + `media/library/sfx/catalog.json`. Library-first; add generic recipes to
`palette.json` + `python tools/gen_sfx.py` only for genuine misses. Author
`shorts/short-N-<niche>/sfx-plan.json` (preview = the -voiced.mp4, out = output/short-N-sfx.mp4).

Shorts taste adaptations: **diegetic action sounds are the content** (piece thocks, digit
pops) and may exceed long-form density; decorative cues stay `optional: true`; layer the 2–3
hero moments. Cue times from EXACT landing frames: `at_s = (move.at + move.dur + sequence_from) / fps`.

```
PYTHONIOENCODING=utf-8 python tools/mix_sfx.py shorts/short-N-<niche>/sfx-plan.json --print
PYTHONIOENCODING=utf-8 python tools/mix_sfx.py shorts/short-N-<niche>/sfx-plan.json
```
The mix is an AUDITION — the user's ear is the audit gate before anything is called final.
Update catalog `used_in` afterwards. **Internet SFX sourcing:** when the library misses and
generation is weak, web-search free libraries (Mixkit Sound Effects Free License, Pixabay)
for the specific cue; record `source` + `license` in the catalog like any other clip.

## Stage 6 — music (optional, per video)

Library beds in `media/library/music/` (gen_music.py to grow). Audition over the SFX mix:
`python tools/mix_music.py --all --base shorts/short-N-<niche>/output/short-N-sfx.mp4`
(or `--bed <id>`). Hard-ducked under voice. **Audition 2–3 beds at identical integrated
loudness** (the tool normalizes) so the user compares MUSIC, not volume — and structure
the chosen bed to the picture (fill from the hook, resolve on the payoff; a bed that
dies before the ending is a reject, check its loudness over time).

## Done =

script.md + beats.json authored (facts verified) · composition QA'd frame-by-frame AND
measured (frozen-time, loudness, determinism) · on-mute payoff confirmed · rendered at
scale 1 · Edge TTS voice generated with word-exact captions and muxed (or ElevenLabs when
asked) · SFX plan authored + audition mixed (~−15.5 LUFS, awaiting the user's ear) ·
library used_in updated · IDEAS.md queue updated.
