# mr-1 · "Beneath the Surface" — attention, chosen

The tactile minimal-reel track's first production (`make-minimal-reel`). **1080×1920 @
15fps, 332 frames = 22.13s**, three scenes, the shared paper/halftone finish, one
metaphor per scene.

## The VO (first — the storyboard backbone; 5 lines, the classic arc)

| # | line | beat | window |
|---|---|---|---|
| 1 | "Your attention is pulled in a hundred directions." | the claim | 0.8–4.2 |
| 2 | "Choose one thing." | the choice | 5.0–6.4 |
| 3 | "Show up for it, a little, every day." | the practice | 7.4–11.0 |
| 4 | "Some days, it will feel like nothing is happening." | the doubt | 11.8–14.6 |
| 5 | "There is more beneath the surface." | the reveal | 16.2–19.4 |

Only the VO words appear on screen.

## The three metaphors (one per scene)

| scene | frames | condition | metaphor | movement | the reveal |
|---|---|---|---|---|---|
| S1 | 0–104 (6.93s) | light, ivory | **the scanning eye**: a drawn eye whose gaze jumps between eight scattered notification glyphs | the iris/pupil track a target list (turn time proportional to angle); the vision cone sweeps with the gaze; icons under the cone flip tone (TwoToneText trick). On "Choose one thing" the gaze LOCKS one glyph (gold ring), everything else dims | the choice |
| S2 | 104–228 (15.2s) | dark, teal night | **the charging battery**: under a swinging pendant lamp that ignites | pendant already swinging on arrival (sine 3.5° @4.8s); ignition = the FIXED stepped sequence [0.85, 0.08, 1, 0.22, 0.7] @0.49s; the beam follows the pendant; the battery fills bottom→top, five segments; during the doubt line the 4th cell flickers and hesitates, then completes | the practice + the doubt |
| S3 | 228–332 (22.13s) | same night, continuous | **the iceberg**: a cut-out berg settling into a living waterline | arrives at 1.18 + blurred, settles to 1.0 over ~0.6s (scale and blur together); WaveSurface + WaterSplit on the SAME boundary (submerged copy darker + underwater paper); buoy rides `waveYAt` + own bob + rock; the claim lands as a flapping gold PaperTag | the reveal |

**Camera continuity:** S1 exits by PUSHING INTO THE PUPIL (portal — the world scales up
around the pupil until it fills the frame in black); S2 enters from that black with a
focus hunt, and exits by RECEDING AND BLURRING together (shrink to 0.72, accelerating,
night background continuous beneath); S3 arrives continuous. No background cuts.

## Sound (layered to the CONTROLS, not the timeline)

- Music: `ambient-pad` (calm, minimal) under everything, vol ≤ 0.22, hard-ducked.
- SFX: soft tick per battery cell (follows the FILLING cells, not timestamps) · lamp
  buzz while lit (follows ignition state) · water ambience riding the wave · ONE deep
  impact + reversed swell exactly on the reveal word ("surface", ~19s).
- Voice: Edge TTS `en-US-AvaNeural` (the skill's calm-close pick; user hasn't named one).

## Production notes

- Finish: `<Tactile paperFile="projects/mr-1-attention/paper-tile.png"
  grainFile="library/textures/grain.jpg" stepFps={15}>` — identical across scenes; the
  two texture kinds respected (underwater paper is applied to the SUBMERGED COPY only).
- World moves on regular sines; the tag flutters (irregular, seeded); ignition is the
  fixed stepped sequence — never random flashing.
- Text sits ABOVE the peripheral blur.
- Ends on the revealed truth (the arc is a reveal — no forced loop); the final hold
  breathes with a slow 1.0→1.03 push.
- Seeds the **metaphor series**: deep work → rest → compounding (all reuse the kit:
  eye/battery/iceberg become dial/battery-lines/root-system…).
