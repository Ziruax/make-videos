# LOG — iso-1-seek

## Run (the /make-isometric example)

End-to-end: story (the drive as it truly is; the payoff a true-proportion
comparison), 9-line script, Edge TTS (l1 re-took at −18%: 3.97 → 3.41 w/s;
l6 at −16% on the first pass), faster-whisper word times, a locked-off
build (no cuts, no morphs — the lid's fill and painter's order do the
cutaway), export, review, fix loop, release.

### Fix log

1. **build.mjs syntax error (`Unexpected token '<'`)** — my head.html
   closed `</script></body></html>`; the parts list appends the kit after
   the head and `kit/score-tail.js` closes the document. Rule: the head
   stays open; only the tail closes. (Same trap in reverse: `storyboard.mjs`
   needs a `HAND` font const in the head — added.)
2. **l1 density 3.97 w/s** — re-took at −18% (3.41). l6 was pre-emptively
   taken at −16% after seeing 3.70 on the timing pass.
3. **TEXT overlap: "SEEK 15 MS" × "seventy years young"** — ground-plane
   text set into the +x face **dives down-right at slope 0.5 on screen**
   (a 200-unit run lands ~100 px lower); the label's right end landed in
   the caption band. Rule for this style: long ground-plane labels near
   the caption band are a trap — use short strings or screen-space mono
   (the captions' own device). Fixed with two screen-space labels beside
   the bars' bases.
4. **The loudest window was the lid-close thunk, not THE HIT** — two
   causes, both fixed: (a) the hit's sub sat on the music bus, which the
   export ducks −14 dB under the voice — moved the impact (sub, servo
   chirp, noise hit) to the sfx bus; (b) **the master limiter ceilings
   every hot impact to the same −8.8 dBFS** — sub(1.15) and sub(0.3)
   measured identically. Fixed by cutting the thunks to sub 0.1–0.12 so
   the hit stands alone at the ceiling. Rule: with a brickwall limiter,
   "louder payoff" means *quieter everything else*.
5. **story arc 4/6 → 6/6** — the silence act ran to hit+0.05, so THE HIT's
   window counted against the silence act's p90 (−8.9 vs the gift's
   −12.9); boundary moved to exactly `CUES.hit` (the px piece's pattern).
   The journey act had no music after the 8ths ended at 20.9 — added a
   soft turn bed (E3/A3) through 23.4.
6. **FLAT FRAMES 0-3** — the piece opened on 4 blank white frames before
   the drop. The plinth now renders from frame 0 (mid-air, its spring at
   0); the drop cue moved to 0.05.
7. **Dead-beats WARN (5 stretches)** — measured at 96 px, the style's
   hairline life (orbiting dot, rim ticks, steam, lamp, bob) is
   sub-threshold: an 8-unit tick moving 2.9 px/frame contributes ~0.08 to
   the windowed diff against a 0.80 threshold. VLM on the sheets confirms
   the visible life (orbit + ticks + sway + blinks) and the story reads
   at phone scale; the isometric style is *designed* still between events
   ("Held frames are truly still apart from tiny idle life"). Accepted as
   a measurement limit, same call as px-1-square.
8. **VLM misreads dismissed with pixel checks** — "frame 32 is a solid
   black square": f768 measures min 35 / max 255 / mean 253 — the
   white-ground style at settle (white faces, hairlines). "No robot
   hero": the hero renders (verified in a zoomed crop — the eye, the
   antenna); it is ~20 px at phone scale, small by the style's design.

### Contact-sheet reads (VLM)

- Tiles (t 1.5/4.0/7.0/10.0/17.5/19.5/22.0/29.0): "isometric rendering
  correct", "hard drive clearly recognizable", nothing cut off or
  overlapping wrongly; the closed box → the cutaway → the arm over the
  platters → the bars → the closed-again sequence all confirmed.
- Payoff frames (23.0/24.3/26.9/33.0): the blink bar clearly filled and
  the seek bar absent at 23.0; the tiny seek bar appeared at the hit with
  "dramatic" 20:1 proportion; both labels readable; the drive closed and
  settled at the end; no broken geometry.
- Storyboard (8 panels): the story reads across the panels; composition
  consistent; all 8 board captions legible.
- Phone sheet (360 px): the drive's open/closed state readable in every
  frame; **all 9 captions** legible; phase tags legible; bars + labels
  legible.

### Per-shot PASS table

| # | shot | verdict |
|---|---|---|
| 1 | the box | PASS — the drop, the sealed lid (vents, sticker, screws), the LED |
| 2 | the cutaway | PASS — the lid opens on its hinge; the tray revealed |
| 3 | the spin | PASS — spin-up with dot + rim ticks; the arm swings in from the park ramp |
| 4 | the float | PASS — the camera push, the gap bracket, the head's bob |
| 5 | the seek | PASS — the file card, the cable, the servo seek, the ring flash |
| 6 | fifteen | PASS — the hush, THE HIT, the true-proportion bars, the live re-cross |
| 7 | the close | PASS — the lid closes, the arm parks, the settle |

**Weakest shot:** shot 3 is the longest hold (the spin era, 15 s) — the
picture is alive (orbit, ticks, tick-tock) but the *events* are sparse;
next run: a small periodic head settle or a platter-shimmer would give the
era one more visible beat.

**Not verified by me:** the listening experience; the numbers say the mix
is right (THE HIT the loudest window at −9.0 dBFS in the payoff act, 1.2 s
of scored silence before it, −14.3 LUFS, true peak −1.5 dBFS, goodbye
decaying 10.6 dB below the gift).
