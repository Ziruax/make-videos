---
name: make-on-script
description: The ALL-IN-ONE flagship track — build the best-possible vertical video (1080×1920, 15fps, ~20-26s) from a user-supplied SCRIPT, orchestrating the best machinery of every other /make-* skill under ONE dominant visual system (make-minimal-reel's tactile paper language). The user's words are adapted, never rewritten; each story beat BORROWS one guest mechanism routed by content — math count-ups, isometric system diagrams, pixel time-lapses, torn-paper overload, riso overprint punch, sketchbook asides, map geography, kinetic-type fly-throughs — every one re-graded into the shared ivory/teal/ink finish. Use when the user says "on script", "use everything / best of all skills", "make it perfect", "flagship reel", "the one you'd put your name on", brings a script and wants the top-quality treatment, or continues the os-N series. NOT for pure single-genre requests (a plain minimal reel → make-minimal-reel; a map documentary → make-map; 100%-TSX niche shorts → make-short). Defers TSX crash rules to vidtsx-2d-generator, motion grammar to MOTION.md, SFX taste to suggest-sfx, and the craft floor to STUDIO-CRAFT.md.
---

# make-on-script — the all-in-one flagship reel

One skill, every strength, one video. The user hands over a script; this track reads it,
finds the story engine inside it, and conducts a **fusion build**: the minimal-reel system
owns the canvas (palette, paper finish, cadence, camera), and each beat borrows the single
best mechanism from the skill that does that thing best — a count-up lands in math's serif
numerals, a system diagram draws in isometric hairlines, a past era arrives pixelated, an
overload scatters as torn paper. The result should feel like ONE hand made it: one finish,
one palette, one arc — with the best machinery of the whole repo quietly doing the work.

**The pitch line:** dominant minimal-reel + routed guest mechanisms + the full make-short
QA pipeline = the reel you'd put your name on.

## The three laws of fusion

1. **The host owns the canvas.** make-minimal-reel's system is non-negotiable and global:
   1080×1920 @ **15fps** (the stepped cadence), the `MR` palette (ivory `#F1EDE4`, teal
   `#17343D`, muted teal `#527C80`, ink `#080F16`, ONE gold accent `#E8C559`), the
   `<Tactile>` finish (halftone/paper/grain/chromatic-split/vignette/peripheral blur),
   the 3-beat arc (hook → choice/practice → reveal), camera-continuity transitions
   (portal, recede-and-blur), word-exact serif captions. A guest that breaks palette,
   finish, cadence or camera is not a guest — it's a hijacking. Reject it.
2. **One guest per beat, guests ≤ ~40% of screen time.** Each scene speaks ONE borrowed
   language on top of the host. Two guests in one beat compete and both lose. If a beat
   needs two mechanisms, split the beat. At least one scene in every reel stays
   **pure minimal-reel** — the host must be recognizably the host.
3. **Every guest is re-graded at the door.** A borrowed mechanism renders in `MR` colours,
   sits inside the scene's `<Tactile>` wrapper, snaps to the 15fps step (or to its own
   deliberate sub-cadence — pixel guests may step at 4-6fps), uses the repo's named
   easings, and obeys MOTION.md's six rules. Nothing arrives with its native palette,
   its native texture stack, or its native frame rate.

## The routing table (script content → guest mechanism → source)

Read the beats; for each, pick AT MOST one guest. If the beat doesn't call for any, it
stays pure minimal-reel (the default, and always correct).

| the beat contains… | borrow this mechanism | from | kit symbol |
|---|---|---|---|
| a number that lands, a count, a stat | **count-up numerals** in serif, 1-2s ease-out, colour-coded quantity vs unit; formula set as `1.01³⁶⁵ = 37.8` | make-math + make-short's counter discipline | `<Counter>` |
| a system, machine, stack, process | **dimetric hairline stage** — an isometric grid where blocks accumulate/connect; spring settles on landing | make-isometric | `<IsoStage>` |
| the past, history, "then vs now" | **resolution-tells-time** — the past renders as chunky blocks that resolve sharper toward the present | make-pixel | `<PixelEra>` |
| overload, noise, distraction, a hundred things | **torn-paper scatter** — irregular scraps with soft shadows that drift and get swept away | make-cut-paper | `<TornBits>` |
| software, a terminal, a tool, a click | **boiling ink stroke** — hand-drawn hairlines that re-roll every few frames; hatched shading | make-crosshatch | `<InkStroke>` |
| a poster-punch word, a print beat | **overprint misregistration** — the payoff word duplicated in two palette inks, 2-4px offset, screen blend | make-riso | `<RisoWord>` |
| an aside, a note-to-self, warmth | **graphite annotation** — a wobbly hand-note with an underline that draws itself | make-sketchbook | `<GraphiteNote>` |
| geography, a place, a route | **outlines + a path drawing itself** in MR strokes (d3-geo if real geometry matters) | make-map | `lib/mapkit` |
| the payoff moment, the final word | **kinetic fly-through** — the payoff word scales through the camera with directional blur, revealing the next beat already in place | make-motion-graphics + MOTION.md rule 1 | `<KineticPayoff>` |
| layered depth under a calm voice | **collage Z-depth** — CSS-perspective layers with ASSIGNED blur (near 10px, far 5px) + slow drift | make-vox | per-scene CSS |
| one real object to OPEN — "how X works inside", layers, a mechanism, a dive | **escape hatch, not a guest:** hand the whole script to make-cutaway-3d (the wedge/dive/explode IS the film) — a cutaway deserves a full track, not a borrowed beat | make-cutaway-3d | route OUT |

2-3 of these become the reel's **named signature mechanisms** (MOTION.md: name them in
plain words in script.md — "the grid that multiplies itself" — that's what makes it
re-watchable). The rest stay supporting.

## Artifact contract

```
on-script/os-N-<slug>/
  script.md        — the user's script (VERBATIM section) + the adaptation table + the
                     beat→mechanism routing table + signature mechanisms + sources
  beats.json       — machine contract: vo[] (one per sentence) + format {fps 15}
  sfx-plan.json    — cue sheet (SFX follow the controls, not the timeline)
  voice/ · output/                                              [gitignored]
remotion/src/shots/os-N/OsN<Name>.tsx       — the master composition
  (+ OsN<Name>Scene1/2/3.tsx — each independently previewable)
remotion/src/lib/fusion.tsx                 — the fusion kit (guests, re-graded)
media/projects/os-N-<slug>/                 — any piece-specific textures (committed)
```

## Stage 0 — intake (script-first, one confirmation round)

The script IS the brief — never rewrite its meaning, only its shape:

1. **Read once for the engine.** Find the arc in the user's own words (the claim → the
   choice/practice → the hidden truth; or problem → mechanism → payoff → twist). One idea
   only — if the script carries two, ask which one this reel is about.
2. **Adapt to the beat grammar.** Keep 4-7 of their best sentences VERBATIM (their
   phrasing IS the captions); cut filler, never claims. On-screen text ≤ 8 words/beat,
   pulled from their words. VO ≤ 3.5 words/s. Every factual claim gets checked and its
   source recorded in script.md.
3. **Route the mechanisms.** Fill the routing table: each beat → host or ONE guest →
   why. Name the 2-3 signature mechanisms in plain words.
4. **One confirmation round.** Show the line table (kept/cut), the routing table and the
   signatures; get a thumbs-up BEFORE voice or pixels. Then no more questions — this
   track is one confirmation, then execution.

## Stage 1 — voiceover (the backbone, Edge TTS)

```
python tools/gen_voice_edge.py --beats on-script/os-N-<slug>/beats.json \
    --voice <USER-NAMED-VOICE (default en-US-ChristopherNeural)> \
    --emit-ts remotion/src/shots/os-N/vo.gen.ts
```

Real word times flow into beats.json + vo.gen.ts; captions highlight on the exact spoken
word (never estimate when a voice track exists). Calm, close voices suit the host; the
user names one, else the default. `--mux` writes the silent-picture + voice master.

## Stage 2 — storyboard + the fusion build

One board per beat (subject · movement · what the line reveals · guest). Then build
SCENE BY SCENE (each scene registered standalone, previewed alone, tuned, then the master):

- **S1 — the claim (light, ivory).** Frame 0 is a finished composition (make-short rule).
  The distraction/overload beat usually lives here — torn bits or scattered glyphs; the
  CHOICE locks one with the gold ring (the host's gaze language). Exit: push into the
  locked object (the portal).
- **S2 — the practice (dark, teal night).** Enter from the portal black with a focus
  hunt. The mechanism beat: the guest stage (iso grid / machine / count) performs
  CAUSE → EFFECT — every animated action visibly produces a result. Camera: locked or
  one slow push; text above the peripheral blur. Exit: recede-and-blur together.
- **S3 — the reveal (same night, continuous).** The payoff lands as the counter/tag/
  kinetic word; the twist mirrors it in miniature (the same mechanism, gone wrong or
  gone zero — a reversal reads as inevitable, not random). End on the revealed truth
  with a breathing 1.0→1.03 push (loop only if frame 0 == last frame exactly).

**Fusion kit** (`remotion/src/lib/fusion.tsx`): `Counter`, `IsoStage`, `PixelEra`,
`TornBits`, `InkStroke`, `RisoWord`, `GraphiteNote`, `KineticPayoff` — all frame-based
pure functions, all re-graded (MR palette, 15fps snap, repo easings). Extend it when a
piece needs a new guest shape; NEVER inline a one-off mechanism that belongs in the kit.

**Camera continuity is the host's signature:** portal in, recede-and-blur out, continuous
backgrounds — no hard cuts unless matched on subject/scale/direction/material (MOTION.md
rule 5). The payoff word may fly THROUGH the camera (guest) — that's the sanctioned
exception and usually the signature moment.

## Stage 3 — measured QA (the make-short discipline — nothing ships unmeasured)

```
cd remotion && npm run gen
node scripts/frames.mjs OsNName 0,<scene-landings,transition-frames,payoff-frames>,<last> --scale=0.5
```

READ the PNGs at phone scale: every reveal synced to its spoken word · guests re-graded
(no native palettes leaking) · text readable and above peripheral blur · the subject
fills 60-85% of the usable frame · one guest max per beat · **the payoff lands ON MUTE**
(captions + visuals carry it with the sound off — that's the default viewing state) ·
frame 0 composed · the twist reads as the same mechanism reversed.

```
bash tools/qa_frozen_time.sh <master>      # near-frozen ≤ ~1s per 30s (breathing holds exempt)
bash tools/qa_loudness.sh  <voiced master> # ~−16 LUFS calm host, true peak ≤ −1 dBFS
bash tools/qa_determinism.sh OsNName 0,<mid>,<last>   # same frame twice = same pixels
```

Fix, re-render frames, repeat. Then the full render at scale 1 + voice mux.

## Stage 4 — sound carries the meaning

Music: ONE calm bed (ambient/minimal-electronic/lofi from the library, vol ≤ 0.22,
hard-ducked under voice) whose shape mirrors the arc. SFX follow the CONTROLS, not the
timeline (t ticks follow the filling cells, clicks follow the target jumps) — author
`sfx-plan.json` and audition with `tools/mix_sfx.py`. ONE deep impact + reversed swell
exactly on the reveal word; a 0.5-1.5s silence drop just before it. The user's ear is
the final gate. Library-first sourcing; record source + license for anything new.

## Stage 5 — ship

Commit the piece (source + beats + plan + committed media; voice/output stay ignored),
push, and cut a GitHub Release with the final MP4 (the repo's delivery convention).
README embeds the example. Flagship pieces get one fresh-critic round (`/review-cut`)
before the release — builder ≠ judge.

## Done =

script kept verbatim where it earns its place · one confirmation round, then execution ·
routing table filled (2-3 named signatures, one guest max per beat, one pure-host scene) ·
host system intact across every frame (palette/finish/15fps/camera) · word-exact
captions · phone-scale frames READ + measured QA passed (frozen-time, loudness,
determinism) · on-mute payoff confirmed · voice muxed at natural speed · SFX auditioned
against the controls · released with the MP4 as a GitHub Release asset.

## Shared craft floor

[STUDIO-CRAFT.md](../STUDIO-CRAFT.md) — universal film-craft rules (silence before
payoff, one constant, colour means one thing, voice is the clock, perceptual limits,
determinism discipline). The floor; this skill is the ceiling.
