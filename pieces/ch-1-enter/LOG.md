# LOG — ch-1-enter

## Run (the /make-crosshatch example)

End-to-end this run: story (F5 fixed-hero, the pipeline), 10-line script,
Edge TTS (4 lines re-took slower: l1 −8%, l2 −14%, l8 −16%, l9 −18% — all
≤ 3.5 w/s), whisper 75/77 words, 10 stations, 7 cuts + 2 bridges, score,
build, tiles, storyboard, export, review, fix loop.

### Fix log

1. **`dot` is a cut-paper kit function, not core** — crashed sDisk/sPayoff at
   render. Replaced with a local `dot2` arc fill. (Same class of lesson as
   cut-paper's `smoothM`: check the kit's API table in STYLE.md, not the
   other styles' kits.)
2. **Text placement (review FAIL: 'the shell' cut off by the frame edge)**:
   the fork boxes slid too far apart (gap 360 put the parent box at x −10).
   Boxes narrowed 380→320 and gap capped 360→240. Four safe-zone WARNs fixed
   by moving the desk sticky notes (850,1560 → 720,1080), the disk label
   (900,1500 → 660,1290) and the stopwatch readout card (y 1490 → 1330).
3. **VLM look-check fixes**: 'the shell keeps the prompt' label darkened
   (0.6→0.88 alpha, 34→38px); the kernel request card text enlarged to 48px
   white; the cursor settle point moved (266→340 x) clear of the coffee mug.

### Contact-sheet reads (VLM)

- 10 look frames: every station passes (textures, hero, day/night palette);
  the stopwatch frame called "a strong frame for the specific style".
- bridge tiles: both transitions read as clean iris-style travels, the dot
  the "singular point of continuity"; no glitches.
- storyboard: the dot carries through all 10 panels; panel 9 (stopwatch)
  named weakest for abstracting the dot — accepted: it is the payoff object
  and the look-check praised it.
- phone sheet: all captions/tags legible; the "truncated" reads are
  mid-write-on frames — the measured text check (authoritative) PASSes.

### Per-shot PASS table

| # | station | verdict |
|---|---|---|
| 1 | desk (type + Enter) | PASS — keycaps press on their words; the dot launches on Enter |
| 2 | parse | PASS — the split line + the argv box pop on "splits"/"words" |
| 3 | fork | PASS — cell-division read; twin pops; hero hops on "Fork" |
| 4 | exec | PASS — code streams on "program"; label flips on "Exec"; ghost dashed outline |
| 5 | kernel | PASS — the fortress + crenellations; the card hands up on "kernel" |
| 6 | disk | PASS — platter tracks rotate on 2s; the arm sweeps on "asks" |
| 7 | the return | PASS — the anchor holds 100%; bytes rise in 16ths |
| 8 | the write | PASS — the answer types in; the mug returns (the world came back) |
| 9 | the stopwatch | PASS — 0.7s silence, then the hit; the hand sweeps a sliver; 0.003 s |
| 10 | the cursor | PASS — the settle + blink; the Enter key waits; the loop |

**Weakest shot:** shot 6 (the disk) — the platter's perspective ellipse makes
the arm's read position land visually above the track it reads; next run,
draw the head ON the ellipse path with the same y-squash.

**Not verified by me:** the listening experience; the numbers say the mix is
right (hit loudest, 0.7s silence, −14.1 LUFS).
