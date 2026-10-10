# LOG — cp-1-dancing-goats

## Run (the /make-cut-paper example)

Built end-to-end this run: intake (facts web-checked, 8 sources in brief.md),
story (F2 morph chain, the ray device + the cherry loop), 11-line script,
Edge TTS takes, whisper word times (83/84 heard), 6 worlds in scenes.js,
5 bridges, score, build, tiles, storyboard (7-panel board read by VLM),
export, review, fix loop.

### Fix log (measured review → fix → re-review)

1. **`smoothM` is a math-kit function** — crashed era 4a at build time. Swapped
   to `EZ.io` (the core easing). Lesson: kits share names only partially; core
   has EZ/popS/ev/seg/springMove.
2. **head.html closing tags**: the built file is closed by `kit/score-tail.js`
   (`</script></body></html>`) — the head must NOT close the document, or the
   build concatenation produces invalid JS. (tri-180's head was already right;
   this one wasn't.)
3. **`nz()` takes note names, not Hz** (`unknown note "2100"`): the mug-clink
   chimes now use `['A6','B6','Cs7','E7']`.
4. **Narration density FAIL (l8 "It liked the weather." at 4.4 w/s)**: re-took
   that line with edge-tts at −35% (3.04 w/s) and l11 at −10%; era boundaries
   T4/T5/T6 + `cu.count` became voice-derived with constants as fallbacks, so
   the slam/bridges still land in the new pauses.
5. **Story arc 2/4**: the gift act was only 1.5s with its own opening slam
   counted as a cut (0.67 cuts/s) → act extended through the reveal (2.25s,
   0.44); goodbye pad dropped 0.034 → 0.016 peak (−23.1 vs gift −15.2, PASS).
6. **The today groove outshouted the slam** (loudest window moved to 28.0s, the
   silence check lost its window): boosted the slam (+3 dB: stab 0.46, sub 0.9,
   chime 0.11, noiseHits 0.3/0.36), slowed today's swell (pad att 0.7, groove
   entering at T5+0.4 at −1 dB, big-cup landing hit halved). Result: loudest =
   the slam at 26.3s, **1.3s of scored silence before it**, PASS.
7. **Storyboard critique (VLM) on the night panel** — "empty upper-left, seedling
   small": added the paper ship on the window's horizon (the Cayenne crossing),
   wall stars, bouquet ×1.15, sprout ×170px.

### Contact-sheet reads (VLM)

- look frames (9 frames): every era passes the style checklist (torn edges,
  shadows, grain, patterns, one wall colour, the spark present with a face).
- morph tiles (T1 cherry→bean, T2 pot→urn): "reads very smoothly … no glitches".
- phone sheet: all captions legible; the flagged "blank" strips are write-ons
  (capStrip's `frac`) and the morph windows (captions deferred); the "black
  last cell" is sheet padding — the LOOP diff (3.30) proves the real last frame
  matches frame 0.

### Per-shot PASS table

| # | shot | verdict |
|---|---|---|
| 1 | legend (goats, cherry, wake) | PASS — goats prance on 2s, the spark wakes on the motif, Kaldi reacts |
| 2 | monastery 1400s | PASS — fire flicker, moth orbit, beads, bean on the table; the pot in frame for the bridge |
| 3 | London 1652 | PASS — chalkboard writes on "news", mugs pop on "penny", chatter + clinks |
| 4 | the heist (night) | PASS — the hush reads; the sprout completes and holds before the slam |
| 5 | the bloom | PASS — the slam lands on the grid; cherries cascade by row |
| 6 | today | PASS — cup grid pops on "billion"; both tags write on their words |
| 7 | the hillside, changed | PASS — goat's cup, the title writes, the pad decays; loops to frame 0 |

**Weakest shot:** shot 2 (the monastery) — its wall pattern is the quietest of
the six worlds and the monk is the least-acting character; next run: give the
monk a pouring ladle action on "brewing".

**Not verified by me:** the listening experience — the numbers say the mix is
right (slam loudest, 1.3s silence, −13.9 LUFS); a human should hear it once.
