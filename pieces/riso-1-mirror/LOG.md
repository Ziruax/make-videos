# LOG — riso-1-mirror

## Run (the /make-riso example)

End-to-end: story (the medium IS the physics: pink/teal overprints, paper
knockout = silence), 9-line script, Edge TTS (all 57 words heard, all ≤3.4
w/s first try), 6 eras, 2 bridges + 3 cuts, build, tiles, storyboard read,
export, review, fix loop.

### Fix log

1. **`rgbHex()` takes an RGB array, not tones** — `rgbHex(MIX.blue)` crashed
   the whole script at load (which then surfaced as a bogus `eraAt` TDZ
   error). Correct call: `rgbHex(inkRGB(tones))`.
2. **Empty point array kills the ribbon**: `waveLine` with `x0 > x1` during
   its write-on produced `P = []` → `ribbon` TypeError. Clamped the x0.
   Lesson: guard every generated-path span when animating bounds.
3. **type() only supports `align: 'center'`** — my `align: 'right'` fell
   through to left-align and ran `<- mirror` off the frame edge. Manual
   right-align: `x - typeW(str, size)`.
4. **Text overlaps**: 'flipped' printed at y 1490 sat on the caption card
   (y 1440) → moved beside the chip. The decorative 'dr r ne' wall label was
   cut by the frame edge → removed.
5. **No pre-slam silence** (the drone ran to the slam): the drone + noise bed
   now hard-stop at 16.85, the riser ends 16.95 → 0.6s of true ≤−40 dB
   silence before the hit. The metaphor survives: the WAVES still close on
   screen through the silence; the drone never returns.
6. **Dead beats 6.3s in the quiet cabin** → halved by drifting clouds
   (clipped to the window), then killed (3.5→PASS) by the "isn't magic"
   event: a printed sparkle pops on the word and a teal X crosses it out.

### Contact-sheet reads (VLM)

- look frames: "Excellent… a clear vertical misregistration on the wall,
  very authentic to the medium"; the colour code "perfectly consistent";
  the cancellation frame "effectively uses the paper color to represent
  silence".
- phone sheet: all captions read; "the progression from pink waves to teal
  to a straight white band is clearly legible"; opens noisy, ends quiet.

### Per-shot PASS table

| # | shot | verdict |
|---|---|---|
| 1 | the cabin (drone) | PASS — pink ribbons wash on 2s; the wall's pink glow radiates |
| 2 | the earcup | PASS — pulse rings, pins, THE FLIP animates phase 0→π |
| 3 | the mirror | PASS — the inverted copy + pairing dots on the dashed line |
| 4 | both play | PASS — trains grow toward each other; dots lock with brackets |
| 5 | the meet | PASS — the knockout blooms; `noise + mirror = 0` prints |
| 6 | the quiet cabin | PASS — steam, drifting clouds, the crossed sparkle, the title |

**Weakest shot:** shot 3 (the diagram) — 1.5s of two labelled wave bands;
next run: let the pairing dots animate a slide down the wave before the cut.

**Not verified by me:** the listening experience; numbers say the mix works
(slam loudest, 0.6s silence, drone dead after, −14.0 LUFS).

### Perf note

Riso runs ~200–380 ms/frame (per-pixel print passes): a full 27.8s export
≈ 9 min. For late visual fixes, `export.mjs --from F --to N` re-renders only
that span — but the mux is skipped for partial renders, so finish with a
manual ffmpeg mux against the fresh audio.wav.
