# LOG — tri-180

## Run (example piece for /make-math)

WIP from an earlier session (scenes/score/head written, voice never generated);
finished end-to-end this run: Edge TTS takes (en-US-ChristopherNeural, rate −4%),
faster-whisper word times (14/17 heard, 3 filled between neighbours), rebuild,
tiles, export `--blur 4 --share`, review.

### Fix log (review → fix → re-review)

1. **MORPHS not on the 8th grid** (bridge at 6.03s): snapped `T_BR` to the grid
   (6.0s) with `snap8()`. → PASS.
2. **No scored silence before the payoff** (0.0s): pad now hard-stops 0.7s before
   the flash; the count chime became two short dry plucks (a chime's 1.3s tail
   ate the silence); wedge plucks shortened (0.22s, send 0.08). → 0.7s at
   ≤ −40 dBFS. PASS.
3. **DEAD BEATS 1.25–5.75s** (twice): first attempt (construction guides + gaze
   tracking + hero mood) did not register on the pixel-diff metric — 2px grey
   lines are invisible at 96px-wide grayscale. Real fixes: **one slow eased
   camera push** (era 1: z 1→1.13 onto the triangle centroid, STYLE.md's "one
   slow, eased push"; era 2: the pull-back reveal of the whole line), **vertex
   dots** (manim's Dot, colour-coded) and **DrawBorderThenFill** (the STYLE.md
   motion habit I had skipped: border draws, fill fades up at 12% — the step
   that finally reads at phone size AND on the metric). → PASS.

Also: hero feet moved (830, 1700) → screen-pinned (830, 1470) via `uncam()` —
the old y=1700 sat inside the platform-UI strip (safe area ends at y 1500);
pinned under the camera so it never drifts.

### Review numbers (final)

- cuts on grid: PASS · morphs on grid (1 @ 6.0s): PASS
- narration: 17 words, density ≤ 3.5 w/s PASS, word hits PASS
- story arc: PASS (gift loudest act, p90 −23.3 vs −25.6; gift held)
- text: PASS (0 cut-off/overlap, 0 in safe zone)
- sound: loudest 100ms at 8.2s in the payoff act; **0.7s silence before it**;
  −14.4 LUFS integrated, TP −1.5 dBFS
- dead beats: PASS (median frame-diff 0.47)

### Contact-sheet read (VLM, phone.jpg + both shot sheets)

Captions legible at 360px; no cut-offs/overlaps; the wedge tiling reads as a
clean half-disc (no gaps); right-angle mark visible; hero visible, not clipped,
in every frame. "Blank" frames = the lead-in/tail and the bridge — intentional.
Two notes investigated: "residual lines f138–144" = the bridge morph blob itself
(the triangle→bar blend, correct); "text fading f198" = the readout's scripted
fade-out as the formula takes over.

### Per-shot PASS table

| shot | title | verdict |
|---|---|---|
| 1 | the triangle and its three angle arcs | PASS — side draw + dots + fill + labels + guides + right angle all read; gaze tracking keeps the hero alive |
| 2 | the wedges fill a straight angle: 180° | PASS — wedges tile exactly; count lands on the word; formula + brace clean; flash payoff in scored silence |

**Weakest shot:** shot 1's middle (2.6–4.3s) still relies on quiet true detail
(guides, right-angle mark) — next run could pop a small tick-label or move the
triangle's labels with the arcs for one more visible beat.

**Not verified:** I cannot listen to the score — the numbers say the mix is
right (−14.4 LUFS, payoff window clean); a human should listen once.
