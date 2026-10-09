# STUDIO-CRAFT — universal film-craft rules for the Remotion tracks

Distilled from the animate repo's craft.md (rules learned the hard way on real
pieces) plus this repo's own accumulated lessons. Applies to make-short,
make-vox, make-map, make-motion-graphics, make-minimal-reel. Each skill's own
SKILL.md is the authority for its genre; this file is the shared floor.

## Story
- **The plot is a true process.** The real steps, in their real order; every beat
  follows from the one before. Pace belongs to what a beat *means*, not to fixed
  seconds.
- **One constant the eye can hold** — a hero, a stage, a page — while everything
  else changes.
- **Colour means one thing** for the whole film (visited/not, the system, the
  threat, the payoff). Never spend that colour on decoration.
- **Silence before the payoff, loudest on the payoff.** A 0.5-2s drop of the
  music bed on a held image, then the single loudest hit on the turn. The
  busiest moment is NOT the loudest — peak density goes just before the silence.
- **The end is the start, changed.** Return to the opening image with the
  difference the story made. (Also: NO CTA outro — every track ends on its
  payoff, not on "subscribe".)
- **One device you can say in a sentence** ("the ring gains a car each beat",
  "the page fills as the empire grows"), revealed at the 80-95% mark.

## Frame
- **Something new every 2-4 seconds** — a move, a reveal, a cut, a reaction.
  QA flags longer still stretches (silence acts are exempt).
- **Banned defaults** (they read as generic AI video): a centred title on a
  gradient; everything fading in; corner frame borders; glows on UI chrome;
  generic particle bursts; a logo sting as the only ending.
- **Small life even in held frames** (steam, a blink, a cursor, an idle bob) —
  3+ details of background life per frame in character work.
- **Act ideas out literally** ("AI winter" = snow on a closed lab).
- **Vary scale across the film**, including at least one extreme close-up.
- **Phone scale:** anything that matters ≥ ~100px on the 1080-wide frame;
  captions ≥ 48px; 9:16 content inside x 60-940, y 250-1500.

## Motion & staging
- **Nothing linear.** Named easings (decel enters, accel exits, a couple of
  landing curves); exits ~40-50% shorter than enters; contextual durations, never
  one everywhere.
- **Anticipation is opposite the main action 9 times out of 10** (a 5-10f
  counter-move before the move); **overshoot 5-8%, never 20%**.
- **Hard cuts land on finished frames:** what defines the new shot is fully
  drawn on its first frame. Write-ons start a few frames early.
- **What existed before the step is on screen from frame 0.** Only the step's
  own effects animate in (the files were staged before the commit; they don't
  pop in during it).
- **Captions hold ≥ 1.25s**; ≤ 3.5 words/s in the VO.
- **Camera returns precede scene entrances by ~15f** (a map lesson, true
  everywhere: annotate AFTER the camera settles, hold 1.5-2s).
- **≤ 3-4 independently moving things at once** (perceptual limit); group movers
  (a fleet, a queue, a grid) into ONE perceived unit.

## Voice & sound
- **The voice is the clock.** Beats start ~0.3s after the previous sentence
  ends; the payoff hit sits in a PAUSE before the line that names it — under
  speech the duck swallows it.
- **The words always win.** Voice ≥ music; if a cue fights a word, the cue loses.
- **Whoosh DURING the move, hit AT the landing frame** — frame-locked, trimmed
  to the attack.
- **You can't hear the mix.** Measure it (`qa_loudness.sh`, voice ≥ -16 LUFS)
  and say what you measured.

## Code
- **Every frame is a pure function of the frame number.** No state, no
  `Math.random`, seeded randomness only (Remotion `random(seed)`), interpolate
  ranges strictly increasing, `<Sequence>` local frames = global_from
  subtraction. `qa_determinism.sh` proves it.
- **Deterministic review discipline:** frame contact sheets per scene while
  building (READ them — with VLM, at phone scale), measured QA scripts, and a
  written per-shot PASS table in the project LOG. Name the weakest shot and what
  would fix it — it's the next run's to-do list.
- **Don't trust your eye for text.** Measure readability against the actual
  background; a cropped label can look fine on a contact sheet.
