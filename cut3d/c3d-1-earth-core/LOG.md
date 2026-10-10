# c3d-1 "The Shell" — LOG

`/make-cutaway-3d` proof piece · 1080×1920 @30fps · 1020 frames = 34.0s ·
Three.js cutaway of the Earth's interior · en-US-ChristopherNeural.

## The build

- **Feasibility first:** WebGL smoke test (clipped box + wedge + gold core)
  rendered via @remotion/three in headless Chromium — VLM-verified visuals,
  byte-identical determinism on 4 frames. The 3D track is viable on this box.
- **VO:** 7 lines, Edge TTS en-US-ChristopherNeural at −4%. Three fit rounds:
  (1) window overflow (periods make Christopher pause ~0.7s — commas, not
  periods, in punchy lines); (2) natural-speed windows so tempo ≤1.18 (never
  cap the voice); (3) final: audible gaps ~1s, payoff pause 1.25s before
  line 5. Word times real (whisper-verified pipeline), all cues on real words.
- **Facts** (brief.md table, 6 sources): mantle 2,900 km; outer core liquid
  Fe-Ni 2,260 km, 4,000–5,000 °C; field from convection (geodynamo); inner
  core solid, 1,220 km radius, ~5,700 K ≈ sun's surface; solid because
  pressure (~3.6 M atm) raises iron's melting point.
- **Geometry true-proportion** (1u = 3,185.5 km): mantle 0.911u, outer 0.690u,
  inner 0.383u. Crust drawn at schematic minimum thickness; the LABEL carries
  the honest 5–70 km (the iso-1-seek caption-carries-the-number law).

## Probe-and-fix loop (VLM-read contact sheets)

1. **Probe sheet 1 (15 keys):** story reads end-to-end; wedge/dive/field/core
   all render. Sheet built WRONG first (ffmpeg %04d needs sequential frames —
   black tiles; PIL tiling is the right tool for sparse frame sets).
2. **Frame-level VLM:** label text teal-on-ink UNREADABLE → ivory (dark-scene
   label palette); leader lines + dots invisible on night → ivory; captions
   mid-frame → house wrapper (top:1480, left/right 80); DEPTH counter showing
   0 KM early and running BACKWARD when the camera eased off → start at the
   wedge mouth (8.0s) + freeze at the deepest point (the instrument-never-
   runs-backward law, caught live); stack crowding → camera raised.
3. **Gauntlet critic pass (17-frame sheet):** harsh but flattening-from-stills;
   full-res verification showed depth counter (957 KM at 11.9s — correct
   radial) and caption contrast were fine. REAL: label chips overlapping the
   stack spheres (the crust sphere spans ~93% of frame width — unavoidable)
   → **ink label chips** (the whaleyxbt convention): rounded rect + border +
   ivory text, readable over any geometry. Also: shorter subs, particle size
   0.032→0.042, glow build-release (0.75 arrival → 0.47 dip through the hold
   → 0.66 at the explode — the critic's "build-up and release" note).
4. **Post-fix probe:** chips fully readable, no overlaps, dots on the right
   layers, no cutoffs, glow arc visible. FIXED.

## Measured QA

| check | result | verdict |
|---|---|---|
| qa_determinism C3d1Shell 0,300,600,780,1019 | 5/5 byte-identical | PASS — deterministic WebGL |
| qa_frozen_time (final) | 0 near-frozen samples (~0.0s) | PASS |
| loudness (final, post-loudnorm) | I −14.9 LUFS · LRA 3.4 · TP −1.3 dBFS | PASS |
| loudest second | 24 (−13.4) — the explode/stack hold | PASS (payoff loudest) |
| end-hold | last word 31.08 → +2.9s held close, fade to −24.7 LUFS at 34s | PASS |
| final encode | 2-pass 5.0 Mbps, 22.2 MB, decodes clean | in family (os-1 4.9 Mbps) |

## Sandbox lessons (this piece's additions)

- **The API-route render-spawn trick:** jobs >10 min (renders, encodes) die at
  tool-call boundaries — even setsid'd. Spawn them detached from a Next.js
  API route (child of the dev-server tree) and poll: `/api/run-job`.
- **30fps procedural noise costs bitrate:** the 156 MB crf-18 master → final
  2-pass 5 Mbps (22 MB). Keep `-c:v copy` through the whole audio chain; one
  final encode.
- **r3f 8.17 has NO makeDefault:** drive the default camera imperatively via
  useThree in render body (pure per frame) — proven deterministic.
- **ffmpeg %04d image2 reads SEQUENTIAL frames only** — tile sparse probe sets
  with PIL, not ffmpeg.
- **SwiftShader: ~2.5s/frame at 1080×1920 scale 1** — a 1020-frame piece is a
  35-40 min background render; probe before you commit.

## The weakest shot

S2's field-bloom window (17.3–18.9s): the camera holds at the core while the
arcs bloom around it — the arcs read best from farther out, and this window
is the one place the stills look "static". Next run: drift the camera back
2.0→2.6 during the bloom so the arcs sweep past the frame edges.
