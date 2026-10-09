# animate style wrappers — a routing index

Seven `/make-<style>` commands pin the **animate** skill to one visual style.
Every one of them runs the same engine and the same pipeline: one canvas drawn
in code, a synthesized score, an MP4 via headless Chromium + ffmpeg, Edge TTS
voice with real word times, intake → story check → look frames → storyboard
approval → build → measured review → deliver. One style per piece; pieces live
at `pieces/<name>/`.

| command | the look | use when | engine |
|---|---|---|---|
| `/make-cut-paper` | torn-paper collage: torn edges, drop shadows, crayon fills, patterns, full-bleed colour worlds, characters with faces | paper-craft stories and histories for a broad audience | animate (canvas, on 2s) |
| `/make-crosshatch` | sketchy ink that boils, hatch + coloured-pencil shading, cream paper by day vs navy "inside the computer" at night | explaining software, agents, terminals, tools | animate (canvas, on 2s) |
| `/make-riso` | three-ink risograph print: halftone screens at their own angles, overprints, misregistration | a flat, bright, printed-poster look | animate (canvas, on 2s) |
| `/make-sketchbook` | graphite + one terracotta accent on a sketchbook page, hand lettering, pencil→ink→scribble | how-tos, learning, warm personal explainers | animate (canvas, on 2s) |
| `/make-math` | manim-style math: near-black stage, Written serif formulas, sweeping graphs, colour-coded quantities | equations, proofs, functions — ONLY when the math on screen can be true | animate (canvas, on 1s, `--blur 4`; 16:9 60fps b-roll option) |
| `/make-pixel` | low-res eras upscaled nearest-neighbour, limited palettes, 5x7 bitmap font, device screens | retro games, devices, history-of-tech (resolution tells time) | animate (canvas, on 2s) |
| `/make-isometric` | dimetric hairline product illustration, white faces, one dark accent, spring settles | product UIs, hardware, calm tech explainers (dark variant available) | animate (canvas, on 1s, `--blur 4`; 1:1 also good) |

The Remotion family (React compositions) covers everything those don't:

| command | use when |
|---|---|
| `/make-short` | algorithm / data stories — simulations, emergence, measured numbers |
| `/make-vox` | paper-collage VOX-style documentary explainers |
| `/make-map` | d3-geo map documentaries — routes, trade, history on the globe |
| `/make-motion-graphics` | brand / documentary motion-design reels, photo cutouts |
| `/make-minimal-reel` | tactile-metaphor minimal reels at 15fps |

Routing rules of thumb:

- The user names a LOOK ("ink", "print", "pixel", "graphite", "iso", "torn
  paper", "manim") → the matching `/make-<style>` wrapper above.
- The subject needs real footage, photos, maps or a documentary edit → the
  Remotion family table.
- A look nobody has yet → animate's `new-style.md` can measure a style from the
  user's references and save it; then route back here.
- Voice is default ON everywhere (Edge TTS, real word times); the user may name
  a voice. Full per-style rules live at
  `.claude/skills/animate/styles/<name>/STYLE.md`; the shared flow at
  `.claude/skills/animate/SKILL.md`.
