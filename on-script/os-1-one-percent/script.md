# os-1 · "The One Percent Rule" — the /make-on-script flagship

The all-in-one track's first production. **1080×1920 @ 15fps, 384 frames = 25.6s**, three
scenes, the minimal-reel host system with four routed guest mechanisms. The proof piece
for the fusion architecture: one finish, one palette, one arc — the best machinery of the
repo quietly doing the work.

## The SUPPLIED SCRIPT (verbatim — the intake contract)

```
Nobody notices one percent.
One percent better, every single day.
It doesn't add. It multiplies.
One year later, you're thirty-seven times better.
And one percent worse, every day? Almost nothing.
Invisible, until it's inevitable.
```

Six lines, one idea, the classic arc: the claim → the choice → the mechanism → the
payoff → the twist → the inevitable close. **Nothing was rewritten** — all six sentences
ship verbatim; the adaptation only assigned beats and windows.

## The line table (beat grammar)

| # | line (verbatim) | beat | window (real) | guest |
|---|---|---|---|---|
| 1 | "Nobody notices one percent." | HOOK — the claim | 0.80–3.05 | **TornBits** (cut-paper: the overload) |
| 2 | "One percent better, every single day." | THE CHOICE | 3.60–6.42 | pure host (the lock + portal) |
| 3 | "It doesn't add. It multiplies." | THE MECHANISM | 7.60–10.92 | **IsoStage** (isometric: add vs multiply) |
| 4 | "One year later, you're thirty-seven times better." | THE PAYOFF | 11.45–14.52 | **Counter** (math: the serif count-up, lands on "thirty-seven") |
| 5 | "And one percent worse, every day? Almost nothing." | THE TWIST | 15.85–20.24 | host carrying the established stage (the mirror collapse) |
| 6 | "Invisible, until it's inevitable." | THE CLOSE | 21.60–24.01 | **KineticPayoff** (mg: the word flies through) |

## The scenes

| scene | frames | condition | what happens | exit |
|---|---|---|---|---|
| S1 | 0–108 (7.2s) | light, ivory | nine torn scraps drift and scatter (the noise); one small "1%" scrap sits nearly lost among them. On the choice line the gold ring LOCKS it, everything else dims and stills | push INTO the locked scrap (portal) |
| S2 | 108–231 (8.2s) | dark, teal night | focus-hunt arrival. Two dimetric stages: LEFT "adds" (+1% × 365 — a short stack, steady cadence, caps at 2 blocks / 4.65×); RIGHT "multiplies" (1.01 compounding — the cascade accelerates, the tower climbs to 16 blocks). The counter lands ×37.8 on the spoken word | recede-and-blur together to 0.72 |
| S3 | 231–384 (10.2s) | same night, continuous | the twist: a dim mirror stack labelled 0.99³⁶⁵ collapses to almost nothing (×0.03). Silence. Then "INEVITABLE" scales through the camera, revealing the pure-host close: the gold tag on a breathing hold | settle on the revealed truth |

**Camera continuity:** portal into the locked scrap → S2 enters from black (focus hunt);
S2 recedes and blurs together → S3 arrives continuous (1.18×, blurred, settling to 1.0
over ~9f). No background cuts anywhere.

## Signature mechanisms (named, in plain words)

1. **The scrap that locks** — one nearly-invisible torn scrap among the noise gets the
   single gold ring of the film; the portal pushes INTO it.
2. **The grid that multiplies itself** — two isometric towers, one adding (steady, short,
   done), one compounding (accelerating, still climbing), with the serif counter landing
   the exact number on the spoken word.
3. **The mirror that collapses to zero** — the same stacking language, dimmed and
   reversed, dissolving to almost nothing on the twist line.

## Facts (all on-screen math is true — computed, not sourced)

- `1.01^365 = 37.78` (e^{365·ln 1.01} = e^{3.6319}) — shown rounded as **37.8×**
- `1 + 0.01 × 365 = 4.65` — the "adds" column's cap, shown as **4.65×**
- `0.99^365 = 0.0255` — the twist, shown as **0.03×** ("almost nothing")
- Tower proportions are TRUE: 2 blocks : 16 blocks = 1 : 8 ≈ 4.65 : 37.8
- The popular framing (1% every day) is James Clear's *Atomic Habits* meme; we state the
  raw math, no attribution claims on screen.

## The fusion ledger (the three laws, audited)

- **Host intact:** MR palette + `<Tactile>` finish + 15fps cadence + camera continuity +
  word-exact serif captions in all three scenes; guests render in MR colours only.
- **One guest per beat:** beats 1/3/4/6 each carry exactly one guest; beats 2/5 are host.
  Pure-host moments: the lock (S1) and the entire final composition (S3 close).
- **Re-graded at the door:** TornBits drift on regular sines (host law); IsoStage blocks
  land on easeOutBack with 5-8% overshoot at 15fps; the Counter snaps to the 15fps
  cadence and uses the repo's easeOutExpo landing; KineticPayoff eases out fast (MOTION
  rule 4) and reveals the next beat already in place (rule 1).

## Sound (layered to the CONTROLS, not the timeline)

- Music: `ambient-pad` bed under everything, vol ≤ 0.22, hard-ducked under voice; a
  ~1.2s silence drop before the close line.
- SFX: paper flutter as scraps still; ONE soft tick per block LANDING (follows the
  stacking cadence — accelerating on the compounding tower); the lock gets a pop; the
  portal a whoosh; the collapse a descending fade; ONE deep impact + reversed swell
  exactly on "inevitable".
- Voice: Edge TTS `en-US-ChristopherNeural` (the repo default; user hasn't named one).

## Production notes

- Finish: `<Tactile paperFile="projects/os-1-one-percent/paper-tile.png"
  grainFile="library/textures/grain.jpg" stepFps={15}>` — identical across scenes (same
  tile as mr-1's, copied into this project's media).
- Text sits ABOVE the peripheral blur; captions use the SceneWords word-exact highlight.
- The towers' block landings are scheduled from a fixed frame table (deterministic —
  qa_determinism must pass with the accelerating cadence).
- Ends on the revealed truth with a slow 1.0→1.03 breathing push (no forced loop — the
  arc is a reveal).

## The measured QA record (the shipped state)

- **Voice:** Edge TTS `en-US-ChristopherNeural` at natural speed (tempo 1.0 on every
  line — the trailing-silence trim pass: Edge clips ship ~0.9s of tail; each was cut to
  last-word + 0.22s so windows fit without atempo). Word times real, captions exact.
- **Frozen time:** 0.7s near-frozen total (target ≤ ~0.85s for 25.6s; two of the seven
  samples are the silence act + end hold — the deliberate-hold exemption). Fixed from a
  first-read 2.6s by: dual-frequency scrap drift, the S2 continuous 1.0→1.06 camera push,
  the S3 world-bob + pre-collapse tremble, and stronger landing pulses.
- **Loudness (release master):** I −15.2 LUFS · LRA 3.9 LU · true peak −1.1 dBFS
  (final loudnorm pass after the mix clipped +0.3 — SFX stack: 29 cues).
- **Determinism:** PASS — frames 0/190/300/380 byte-identical across two renders.
- **On mute:** the arc reads with sound off — word-exact captions + the visual story
  (lock → two towers → the mirror collapse → the tag).
- Voice-forward mix: `ambient-pad` bed at −10dB, hard-ducked 9dB; SFX follow the
  controls (16 accelerating ticks follow the compounding tower's landing schedule).
