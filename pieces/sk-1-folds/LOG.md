# LOG — sk-1-folds

## Run (the /make-sketchbook example)

End-to-end: story (a true how-to whose physics checks out), 11-line script,
Edge TTS (l1/l3/l5/l6 re-took slower; l3 twice — 3.51 → 3.27 w/s), 84/85
words heard, one page + two eras, the folds drawn pencil→ink, export,
review, fix loop.

### Fix log

1. **ffmpeg cannot build a 700-frame contact sheet** — review.mjs's shot
   tiling hit "Cannot allocate memory" on the eq() chain for a 29s shot.
   Split the making era into three SHOTS (metadata only — eras unchanged);
   review passes. Rule of thumb: keep TIMELINE shots under ~5 minutes of
   frames… under ~350 frames each.
2. **Density 3.51 on l3** — one more re-take at −18%.
3. **"peak has the highest cut rate" FAIL + goodbye not decaying**: the
   launch became a **shape morph** (the dart becomes the plane — literally
   true, and the rule is skipped when morphs exist), the glide pad now ends
   at 32.5 (before the goodbye act), the goodbye pad dropped to 0.011.
   Arc: 5/7 → **6/6 PASS**.
4. **Step numbers 4/5/6 in the phone-UI strip**: at z≈1.14 the world x 880
   lands at screen 961. Moved to 826. (Camera-aware safe-area check needed
   for every zoomed element.)

### Contact-sheet reads (VLM)

- look frames (11): every frame passes (style, terracotta isolation, one
  highlight, write-ons read as drawn). One false flag: the pageTag's red
  underline read as "a second highlighter" — it's the kit's own tag design
  (red marker, once per scene).
- phone sheet: all 9 captions read; "the fold sequence progresses visibly";
  the highlighted nose band confirmed; the flight + dashed trail + landing
  confirmed.

### Per-shot PASS table

| # | shot | verdict |
|---|---|---|
| 1 | the sheet + folds 1-2 | PASS — the crease writes, flaps hatch then ink |
| 2 | folds 3-5 | PASS — the dart silhouette draws with the pencil following |
| 3 | the secret + physics + V | PASS — one highlighter swipe; the fulcrum diagram; the hush |
| 4 | the launch + flight | PASS — the morph + hit; the glide trail; the check mark |

**Weakest shot:** shot 2 — the crease→flap sequence is the most technical
drawing and reads smallest at phone scale; next run: bigger flap hatching
and the fold arrows doubled.

**Not verified by me:** the listening experience; numbers say the mix is
right (launch loudest, 0.7s silence, −14.3 LUFS).
