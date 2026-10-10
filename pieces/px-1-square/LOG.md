# LOG — px-1-square

## Run (the /make-pixel example)

End-to-end: story (resolution as the timeline; the square as the thread),
8-line script, Edge TTS, faster-whisper word times (74/74 words), four
eras at their TRUE low resolutions, three morph bridges, export, review,
fix loop.

### Fix log

1. **Review stdout lost on background run** — review.mjs run under nohup
   wrote its sheets but the report vanished with the process (buffered
   stdout lost at kill). Re-ran in the foreground with a 10-minute window;
   the full report landed. Rule: review always runs in the foreground.
2. **Dead-beats WARN 27.25–37.71s** — the measure (96px-wide grayscale
   diff) cannot see the count text, the icon glints or the 4px bounce.
   VLM on the shot-04 sheet confirms the count visibly progresses
   (2 → 2073600 PX) and the glow/bounce/sparkle change through the act;
   the gift act is *supposed* to hold (the arc rule "gift is held ≤ 0.5
   cuts/s" PASSes). Verdict: measurement false positive, kept as-is.
3. **VLM "final frame black" on shot 1/4 sheets** — checked every flagged
   frame at source resolution: f216/f342 are designed morph in-betweens
   (mean 24–26, full contrast), f48/f900 are normal dark-era frames
   (min 0 / max 240). No blank frames exist; the flat-frame scan agrees
   ("none"). VLM thumbnails misread dark CRTs.
4. **VLM caption misreads** ("4 SHADES OF GREY", "cut off") — the 5×7
   pixel font defeats VLM reading at zoom; textcheck.mjs (which traces
   every drawn string's screen rect) reports 0 cut-off / 0 overlap / 0 in
   the safe zone, and the phone sheet reads "1972", "1989",
   "COLOR. PARALLAX. COINS." plus the era captions at 360px. Kept.

### Contact-sheet reads (VLM)

- shot 1 (CRT): authentic chunky pixels + scanlines; caption reads.
- shot 2 (handheld): green LCD palette + dithering read; hero animates.
- shot 3 (16-bit): "reads as an authentic 16-bit era game scene"; coin
  and hero read clearly; no broken frames.
- shot 4 (today): the count visibly progresses; the home screen reads as
  a phone home screen (status bar, icon grid, dock).
- phone.jpg (360px): era progression reads clearly B&W → green → color →
  phone; era tags legible.

### Per-shot PASS table

| # | shot | verdict |
|---|---|---|
| 1 | 1972 CRT | PASS — the serve, the square blinking on contact, the score typing on |
| 2 | 1989 handheld | PASS — four greens, the heart life, the beetle, the hop |
| 3 | 16-bit arcade | PASS — parallax + city + spinning coin + the platformer jump |
| 4 | today | PASS — the count to 2,073,600, THE HIT, the icon bouncing like the ball |

**Weakest shot:** shot 1 — the Pong court is the sparsest picture of the
four (it is the point, but the strip between court and caption can feel
empty for a beat); next run: one more blink of static life mid-shot.

**Not verified by me:** the listening experience; numbers say the mix is
right (THE HIT at 27.0s, 0.8s silence before it, −14.2 LUFS, peak
−1.5 dBFS, goodbye decays 10 dB below the gift).
