# vox-2 · "The Lines That Never Left" — the Berlin Conference

The collage track's second production (`make-vox`). **1080×1920 @30fps, ~40.5s.** Every
scene is dissected into layers (paper board, the 1880 map, the Berlin archival print,
the ruler + pen cutouts, the 1914 partition map, chips/stamps/lines) and ONE camera
travels across all scene boundaries.

## Facts, verified

| claim | value |
|---|---|
| the conference | Berlin, Nov 1884 – Feb 1885 (opened Nov 15, 1884) |
| who attended | 14 European powers + the United States |
| who was absent | no African leaders were invited (no African representation) |
| straight borders | ~44% of African boundaries are straight/astronomical lines (AU delimitation literature) |
| the result | by 1914 ~90% of Africa under European control; only Ethiopia and Liberia independent |
| 1880 baseline | on the eve of the Scramble, almost all of the interior was still ruled by Africans |

## VO (locked first — the scene windows are cut from it)

| # | line | window |
|---|---|---|
| 1 | "In 1880, almost all of Africa was ruled by Africans." | 0.5–4.0 |
| 2 | "Then fourteen European powers sat down in Berlin — and divided the continent." | 5.0–9.4 |
| 3 | "No African was in the room." | 10.4–13.2 |
| 4 | "Drawn with rulers, thousands of kilometres from the people who lived there." | 14.2–19.4 |
| 5 | "Forty-four percent of the borders are straight lines." | 20.2–23.2 |
| 6 | "By 1914, ninety percent of Africa was European." | 24.2–27.2 |
| 7 | "Only Ethiopia and Liberia remained free." | 27.8–30.6 |
| 8 | "A hundred and thirty years on, the lines are still here." | 31.6–35.6 |

## Scene dissection (sentence → layers → camera)

| scene | frames (global @30) | layers | camera |
|---|---|---|---|
| S1 HOOK | 0–156 | PaperBG (library) · africa1880 placed · SerifStatement title · chip "1880" | wide (540,960,z1) → 1.06 push |
| S2 BERLIN | 156–306 | africa1880 stays (continuity) · ArchivalPhoto berlin placed over the map's lower half · chip "BERLIN · 1884" | push down to the table (540,1150,z1.5) |
| S3 THE ROOM | 306–420 | macro INTO the archival photo · SketchArrow to the empty chairs · SerifStatement (backing) "No African was in the room." · RubberStamp "NOT INVITED" | macro (540,1300,z2.2) |
| S4 THE LINES | 420–600 | camera back to the map · Cutout ruler (top-right) + pen (bottom-left) slide in · three straight red lines DRAW across map fractions (TSX) · chip "44% STRAIGHT LINES" on the word | return to map (540,960,z1.35) |
| S5 THE PARTITION | 600–918 | africa1914 wipes in OVER africa1880 at the SAME position (the continuity handoff) · chips "90% EUROPEAN" + "ETHIOPIA · LIBERIA FREE" (stacked, shared left edge) | pull wide (540,940,z1.12) |
| S6 TODAY | 918–1215 | the 1914 map stays (the borders are today's) · SerifStatement "The lines are still here." · stamp "STILL HERE" · title back at ~1100 for the loop | settle home (540,960,z1) |

**Signature mechanisms:** the archival photo lands ON the map and the camera dives
INTO it (the table becomes the scene); the 1880 map is OVERWRITTEN in place by the 1914
partition (one map becomes the other — the borders ARE the story); the ruler + pen
props draw the straight lines that outlive their authors.

## Production notes

- Contrast rule: SerifStatement over the archival photo uses `backing` (cream strips);
  chips use dark `kickerColor`.
- The paper texture graduated to `media/library/collage/paper.png` (reused from vox-1).
- Map geometry constants + fraction-derived annotation points (regenerating art only
  means re-eyeballing fractions).
- Camera: one journey over one board — never a cut, always a travel.
- Voice: Edge TTS `en-GB-SoniaNeural` (documentary British; the user hasn't named one).
- No CTA outro; the title returns for a loop-friendly tail.
