# tri-180 — "Every triangle hides a straight line"

`/make-math` example piece. 9:16, 10.4s @ 24fps, motion on 1s (`--blur 4`), voice-driven.

## Spec

- **Claim (the whole video proves it):** the three interior angles of any triangle
  sum to 180° — shown, not asserted, by taking the three corner wedges off a
  triangle and laying them side by side: they fill exactly a straight angle.
- **Format:** F2-ish morph chain, 2 eras, 1 shape morph (the triangle becomes the
  straight line bar), voice is the clock (Edge TTS, real whisper word times).
- **Style:** math (manim look). Colour code, everywhere: α = `MC.red`,
  β = `MC.green`, γ = `MC.blue`, the result (the line, 180, the readout, the
  flash) = `MC.yellow`. Hero: π (blue, never a quantity's colour).
- **Hero device:** the π character watches the proof — its gaze tracks whatever
  is being drawn (sides, then arcs), goes focus on "Take", wow at the flash.

## Beats (voice = the clock)

| # | cue | what happens | sound |
|---|---|---|---|
| 1 | l1 "triangle" | 3-4-5 right triangle drawn (γ's legs, hypotenuse last), vertex dots pop, DrawBorderThenFill at 12% | 3 plucks D4/Fs4/A4 |
| 2 | l1 "hides" | labels α β γ settle staggered; construction extensions of each side appear | — |
| 3 | l2 "Take" | right-angle mark draws at O | — |
| 4 | l2 "angles" | the three angle arcs sweep, lagged | 3 plucks A4/B4/D5 |
| 5 | l2 "corners" | the wedges come OFF the corners (fill pulse, there-and-back) | — |
| 6 | pause before l3 | **the bridge**: the triangle morphs into the yellow line bar (blank-paper morph, grid-centred at 6.0s) | sweep |
| 7 | l3 start | the baseline draws, half-disc construction arc, the three wedges fly in and land adjacent (α + γ + β = the upper half-disc) | 3 dry plucks |
| 8 | l3 "eighty" | live readout counts 0→180 in steps of 15, lands on 180 exactly on the word | 2 short plucks + ticking |
| 9 | after "eighty" | conclusion formula **Written**: α + γ + β = 180°; brace "a straight angle" under the line | pencil scratch |
| 10 | l3 "time" | **the payoff**: flash on the half-disc (in 0.7s of scored silence) | chime + sub |

## Math on screen (all true)

- The triangle is a 3-4-5 right triangle: γ = 90° at O, α = 53.13° at B,
  β = 36.87° at A. Displayed values add exactly: 53.13 + 36.87 + 90 = 180.00.
- The wedge rearrangement is the classic Euclidean proof picture (angle sum
  theorem, Euclid I.32's neighbours); the wedges' angles in era 2 are computed
  from the same constants (A_RAD = 53.13°, B_RAD = 36.87°, π/2).
- The readout counts in discrete steps of 15 — every shown value is a true
  intermediate count, never a fractional lie.

## Sources (web-checked)

- Interior angle sum = 180°: Euclid Book I; every standard geometry reference
  (e.g. Wikipedia "Internal and external angles": sum = (n−2)×180° for n = 3).
- No other factual claims appear on screen.

## Sound plan

Pad D3+A3 (era 1) → D3+A3+F4 (era 2), hard-stopped 0.7s before the payoff.
Pluck clusters on the drawing events; ticking under the readout count; a dry
pencil scratch on the formula write; chime + sub on the flash. Score mixed at
−14 dB under the voice, master normalised to −14 LUFS.
