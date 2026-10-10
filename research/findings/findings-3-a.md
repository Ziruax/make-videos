# Findings — Task 3-a (research batch A)

Repos analyzed (work-trees only, all files read):
1. `research/external/whaleyxbt_claude-motion` ("claude-motion" — Remotion + web-sims + sfx engine)
2. `research/external/howseen-ai_claude-motion-design` (Howseen "motion-design" skill — seek(t) HTML engine, remake mode)
3. `research/external/Barty-Bart_motion-graphics` (motion-broll + object-separation)
4. `research/external/charlie947_motion-graphics-skills` (14-skill prompt pack)

All four are "code-only motion" systems like ours. Repo 1 is the only one with a real **3D/sim pipeline** (three.js + frame-stepped headless capture) — directly relevant to our planned Three.js 3D-cutaway skill. Repos 2–3 are the deepest on **render/QA mechanics** (subframe motion blur, pops/flash detection, loop-seam checks, beat maps). Repo 4 is the best **prompt-engineering / brief-authoring** library.

---

## 1. whaleyxbt/claude-motion

### 1.1 Architecture
Two pipelines in one repo:

- **Remotion track** (`src/`): React TSX, 60fps 1080×1080, `EffortVideo` (22s) as reference piece. `timeline.json` is the single source of truth — components read it via `TL` in `src/lib.ts`, and the sound cue sheet reads the SAME file. Palette `C` + fonts `F` defined once in `lib.ts`. (Same philosophy as our minimal-reel track: pure function of frame, no Math.random, no Date, no CSS transitions.)
- **Web-sims track** (`sims/`): one HTML page per sim, `render(t)` pure function of time, three.js + fonts inlined by `sims/build.mjs` (esbuild bundle → `sims/dist/<name>.html`, works offline, also plays live with keyboard controls). `sims/capture.mjs` opens it in headless Chromium, calls `window.SIM.render(t)` per frame, screenshots as JPEG q97, pipes to ffmpeg (x264 crf 16, `image2pipe`), then muxes music with `loudnorm=I=<lufs>:TP=-3,afade in/out`. `--stills 0,4,8` makes tiled review sheets. `--dpr` multiplies output (1080×1350 CSS layout → 1440×1800 pixels at dpr 4/3).
- Kit: `sims/kit/runtime.js` (boot, config merge, live loop, `window.SIM`), `stage3d.js` (three.js renderer + EffectComposer + UnrealBloom + ACESFilmic tone mapping + `project()` world→screen + `setCrop()` punch-in via `camera.setViewOffset`), `util.js` (easings, `keyed()` keyframe interpolator, mulberry32 `rng`, `hash`, `merge`), `hud.js`, `director.js`.
- **Sound**: pure-Python stdlib synth `sfx/` (48kHz): `synth.py` generators (click/key/blip/pop/chime/whoosh/riser/impact/scratch/pad/envelope), `mix.py` (place at time with equal-power pan, `typing()` humanized keystrokes, auto-master to −14 LUFS with soft-clip drive ladder and true-peak ≤ −2 dBFS ceiling), `loudness.py` (BS.1770), `dsp.py` (biquad/SVF filters for long-form noise beds). Cue sheet = one Python function `score(mix, tl)` per video (`sfx/cues/effort.py`: 128 sounds + pad).
- **QA**: `scripts/sheet.mjs` (contact sheet of one frame per timeline beat +0.3s "settled", scrub mode `--from --to --every 0.2`, exact timestamps, timestamps burned into tiles), `scripts/wave.mjs` (waveform PNG with every beat drawn as a coral line + ebur128 loudness + true-peak check).

### 1.2 Pipeline stages
`idea → storyboard (user agreement on message/hero moment) → timeline.json (every beat, before ANY component code) → scenes/components → review loop (draft at half-res → contact sheets → checklist → fix → repeat until a clean pass) → cue sheet → render+mux → loudness check on final file → examples/ entry`.

Effort-level table for Claude Code `/effort`: storyboard=low, building scenes=medium, review/retime/polish=high, autonomous end-to-end=xhigh/max.

### 1.3 Techniques we LACK (concrete)

**A. Timeline-as-SSOT for AUDIO.** Our Remotion track re-derives word times from whisper per piece; our animate track has per-piece cue JSONs but not a named-beat timeline that BOTH the picture and the sound read. Their rule: "Never hardcode a start time inside a component. Offsets relative to a beat (`s1.exit + 0.05`) are fine." and "Retiming = editing timeline.json, then `npm run sfx` so audio follows." Files: `.claude/skills/motion-design/SKILL.md` §1, `timeline.json`, `sfx/cues/effort.py`.

**B. Waveform-beat overlay sync check.** `scripts/wave.mjs` draws every timeline beat as a coral `drawbox` line over `showwavespic`, then prints LUFS/true-peak: "In `out/wave.png` every coral line is a timeline beat. Each transient should sit on a line or a hair after it. A hit between lines means a hardcoded time or a stale WAV." — a cheap visual sync audit we don't have (we measure LUFS but never *see* hits vs beats).

**C. Subframe motion blur via tmix (HOWSEEN + BARTY both do this too, whaleyxbt does NOT — whaleyxbt renders direct 60fps).** See repo 2/3 sections — 4–8 subframes per frame across a 180° shutter blended with ffmpeg `tmix`, never blurring across hard cuts. Our animate engine records 1 sample per frame: fast slams strobe. THIS is the single biggest render-quality gap.

**D. Beat-map-driven cutting from real music** (`sims/beats.py`, 210 lines, pure Python + ffmpeg decode): onset envelope from log-energy diff; tempo from autocorrelation weighted toward ~126 BPM (`w = exp(-0.5*(log2(bpm/126)/0.6)^2)`) with parabolic refinement; beat grid phase-fit then local snapping only when the peak is clearly there; downbeats = phase with most low-band attack; kicks = low-band onset peaks over adaptive 90th-percentile threshold; energy per bar; **drop = biggest sustained jump vs previous 4 bars that holds for 2**; `--start auto` places the window so the drop lands ~40% into the clip, snapped to a bar. Output `{bpm, beats, downbeats, kicks[time,strength], barEnergy, drop}` handed to the sim as `cfg.beats` — "Snap your big moments to them." Our synth scores are hand-composed to integer BPMs; we have no analyzer if we ever drop in a real track.

**E. Auto-mastering ladder with honest failure.** `sfx/mix.py::master()`: tries drives (1.2…4.0), soft-clips `tanh(drive*x/peak)/tanh(drive)`, computes BS.1770 LUFS in Python, picks the least-corrective drive that hits target within ceiling, and if the mix is too sparse to reach −14 without crushing it PRINTS: "the mix is too sparse to get louder without clipping. Add sustained sound (a pad, longer tails) or accept it quieter." That message-as-QA-gate is better than our "final loudnorm pass" (which fixes level but can crush sparse hit-based mixes silently).

**F. Gain-hierarchy + panning doctrine** (`sound-design/SKILL.md`): "Hero hits: gain 0.25–0.35. Supporting: 0.08–0.2. Pad ~0.03, ducked ~65% under the hero transition. Pan follows on-screen position (−1…+1). Sequences sweep across the stereo field. Pick ONE key and keep every tonal sound in it; pitch rises with progress and resolves on the payoff." Plus "Accent, don't narrate: continuous motion (drift, grain, rotation) stays silent." And a self-critique: "In the effort example the pad and slider notes are D major, but the scene 3 pops and chime are still in C major. Don't copy that." — our mix_sfx lacks a declared musical key and stereo-pan-follows-position rule.

**G. Reading-hold formula with numbers** (`motion-design/SKILL.md` §4): "Every readable state needs a hold after it settles: ≥1 s for a short phrase, add ~0.25 s per word beyond three, ≥2 s for the final hook. The 22 s cut of the effort video exists because the 15 s one flashed text too fast — when in doubt, hold longer and animate less." Also stagger numbers: words ~0.09s, list items 0.2–0.25s, rings/dots 0.06s; exits ≈ half the entrance duration; typing ≈0.035s/char; caret 2.4Hz. We have "voice-is-the-clock" but no numeric hold table.

**H. Easing-table with bezier coordinates + named spring presets.**
```
easeOut = bezier(0.16, 1, 0.3, 1)  entrances/reveals
easeIn  = bezier(0.6, 0, 0.9, 0.35)  exits — leaves fast, doesn't linger
easeInOut = bezier(0.65, 0, 0.35, 1)  state-to-state
overshoot = bezier(0.55, 0, 0.2, 1.12)  values that "land"
```
Spring presets: default 14/140/0.8, heavy 15–20/140–240/0.6–1, knob 12/190/0.75, pop 9–11/200–230/0.7, "elastic accent 8/200 — one hero moment per video, not more." "Springs for things that feel physical (UI, objects). Bezier tweens for type and camera-like moves."

**I. Texture/anti-dead-frame kit** (Remotion components): `Grain` (film grain opacity ≈0.09 "reseeded on twos"), `WobbleFilter` (hand-drawn line boil "faded out as quality rises"), `Background` (vignette + dot grid drifting a few px/s), plus "Idle elements breathe: a ticking clock, a blinking caret, a slow rotation" and "Drive glow from state, not time (`glow = effort`): light should explain the story."

**J. Velocity-derived squash/trails**: "Use velocity: derive motion trails / squash from `value(frame) - value(frame - 1)` instead of faking it." (motion-design §8).

**K. Frame-0 law (X thumbnail):** "An empty or black frame 0 — X autoplays muted and the first frame is the thumbnail." appears in motion-design §9, review-loop checklist, and sims/README ("Frame 0 is the thumbnail on X. It must already be busy and beautiful."). We already live this in the animate track ("blank first frames fixed"), worth keeping as a written law in Remotion track QA too.

### 1.4 3D / cutaway / exploded view — DIRECT blueprint for our Three.js skill
`sims/engine/main.js` (715 lines) — a methane rocket-engine "explorer" film: skirt opens → chapters FEED/SPIN/BURN/BLAST light the flows they describe → camera flies through injector → chamber → throat → into the plume → throttle-down → exploded view into labelled parts → reassembly → relight → close (loops). Concrete stealable techniques:

1. **Clipping-plane cutaway wedge** (3 planes, `clipIntersection: true`):
```js
const CLIP = [new THREE.Plane(), new THREE.Plane(), new THREE.Plane()];
const setCut = (h, yTop) => {
  CLIP[0].set(new THREE.Vector3(-Math.cos(h), 0, -Math.sin(h)), 0);
  CLIP[1].set(new THREE.Vector3( Math.cos(h), 0, -Math.sin(h)), 0);
  CLIP[2].set(new THREE.Vector3(0, 1, 0), -yTop);
};
// materials: clippingPlanes: o.clip ? CLIP : null, clipIntersection: true
// renderer.localClippingEnabled = true;  setCut(0.95*open, 1.75+0.75*ex) per frame
```
A wedge that opens with the cowling (`open`) and widens with the explode (`ex`).

2. **Exploded view as eased per-part offsets**: `const OFF = {inlets:[0,1.2,0], pre:[0,1.6,0], pumpL:[-1,0.25,0], pumpR:[1,0.25,0], inj:[0,0.75,0], chamber:[0,0,0], nozzle:[0,-1.4,0], ducts:[0,0.45,0]}`; `explAt(t) = easeInOutCubic((t-TL.explode)/1.4) * (1 - easeInOutCubic((t-TL.assemble)/1.3))` — parts drift out AND back with one function; labels track `L.a + off*ex`.

3. **Camera keyframe table with per-segment easing and fly-THROUGH**:
```js
const K = [
 {t: 0, c:[5.2,-4.6,13.5], l:[0,0.3,0]},
 {t: TL.flyIn, c:[0.35,3.3,1.5], l:[0,1.0,0]},
 {t: TL.flyIn+0.9, c:[0.02,1.25,0.06], l:[0,-0.75,-0.08], ease:'in'},
 {t: TL.flyIn+1.7, c:[0,-0.2,0.04], l:[0,-2.2,-0.06], ease:'lin'},
 {t: TL.flyOut, c:[0,-3.4,0.05], l:[0,-5.4,-0.06], ease:'lin'},
 ...
```
`c`=camera position, `l`=lookAt; segment ease 'out'|'in'|'lin'|easeInOutCubic. Web-sims SKILL.md: "A camera that flies *through* the object is worth more than ten orbits." Camera `near=0.02, far=12000` for the interior pass.

4. **State-driven camera shake**: `buzz = 0.006*pw + 0.05*relit; camera.position = cam + buzz*[sin(t*91), sin(t*127+1), sin(t*73+2)]` — vibration amplitude proportional to engine power (a storytelling device, not noise).

5. **Chapter-gated flow focus**: each glowing stream is tagged `chapter`; per frame `focus = chap===S.chapter ? 1.2 : 0.3` (0.7 for all in 'blast') — the pipes for the CURRENT chapter glow, others dim. Same trick powers the chapter chips in the HUD and the sound (turbopump whine only during SPIN).

6. **Screen-space label system with leader lines + collision stacking**: labels are DOM elements with world anchors `{text, sub, part, a:[x,y,z], side, t0, t1, c}`; per frame project the anchor (offset by the explode), keep on-screen, stack per side at 70px min spacing (`for u of used[side] if |u-ly|<70 → ly=u+70*sign`), draw the leader on a 2D canvas: horizontal segment at label edge → 35% toward the anchor → anchor, plus a 4.5px dot. Labels fade with `smooth((t-t0)/0.3)*(1-smooth((t-t1)/0.3))`. Sub-labels carry REAL numbers ("~300 bar · ~3,500 K").

7. **Lathe-based technical geometry**: chamber profile function `wallR(y)` with cosine throat curve and `(1-(1-s)^2.1)` bell; `LatheGeometry` + a vertex pass that adds coolant-tube ridges (`k = 1+0.02*pow(0.5+0.5*cos(atan2(x,z)*84),0.6)*smooth(...)`) — the "channels in the copper wall" look, pure math. Torus rings as manifolds; `InstancedMesh` for 52 bolts.

8. **Emissive heat gradient**: 4×256 canvas gradient (black→#3a0c00→#ff6a1c) as `emissiveMap` on `copperHot` with `emissiveIntensity = 0.9*pw` — walls glow only while running.

9. **Flow-in-pipe shader** (`STREAM_FRAG`): additive tube inside faint glass tube; `p = fract(vUv.x*uLen*2.4 - uT*uSpeed)`; pulse `smoothstep(0,.12,p)*smoothstep(1,.35,p)`; fresnel face term `pow(abs(dot(N,V)),0.7)`. Plus plume shell shader readable from INSIDE (`PLUME_FRAG` with `side:DoubleSide`, face term + fbm turbulence + shock diamonds as lathe diamonds `d.scale.set(0.62-k*0.03,...)`).

10. **Physics-of-integration for rotors**: `rotorAngle(t)` integrates `omega(x)` from 0 to t at 1/120 steps — pure function, deterministic, spins up with power.

11. **Bloom discipline** (web-sims SKILL.md "Lessons"): "Bloom eats detail: keep emissive and additive layers under ~1.0 and raise them only for the one hero moment." "Glossy metal plus a low sun gives white streaks. Use roughness ≥ 0.45 and envMapIntensity ≈ 0.5 on big surfaces." "One NaN pixel blacks out the whole frame through bloom: clamp pow() bases in shaders." Stage: `bloom {strength 0.34, radius 0.5, threshold 0.92}`, exposure 0.55, ACESFilmic, HalfFloat + 4-sample target.

12. **Sky + PMREM environment**: `Sky` addon scaled 6000, PMREMGenerator from a scene containing only the sky → `scene.environment` — cheap studio-quality metal reflections.

13. **Timeline for the engine** is a flat 13-key JSON (`duration, open, feed, spin, burn, flyIn, flyOut, blast, throttle, explode, assemble, relight, close`) — same SSOT read by the sim AND `sims/engine/sound.py`.

14. **Generated ambient sound design on the timeline** (`sims/engine/sound.py`): continuous layers (air rush svf-white always; roar = brown noise with cutoff `700+2000*fly(t)` and envelope `power*(0.75+0.55*fly)`; 36+51Hz sub sine; turbopump whine with harmonics `sin+0.35*sin(2.01ph)+0.12*sin(3.03ph)` gated to SPIN chapter), event layers (servo whir + thump + clicks on skirt open/close at TL.open/TL.close; whooshes on explode/assemble; relight thump), and **Poisson crackle** while running: `t += -log(1-rand)/22` rate, amplitude `0.3+0.7*r) * power * (1+fly)`, random pan, HP-filtered 1.4kHz. Stereo decorrelation: "Same layer from two seeds: decorrelated left/right." Master: gentle `tanh(1.2x)` soft clip + normalize (no LUFS — muxed with `--lufs -24`).

### 1.5 Reusable assets (port list)
- `sims/kit/stage3d.js` — drop-in three.js stage (bloom/ACES/project/setCrop). 108 lines.
- `sims/kit/util.js` — easings/`keyed()`/mulberry32/`merge`. 79 lines.
- `sims/capture.mjs` — frame-stepping capture harness (`window.SIM.render(t)` → jpeg q97 → image2pipe → x264 crf16 → optional music mux with loudnorm + afades). 154 lines.
- `sims/beats.py` — full beat/drop analyzer. 210 lines.
- `sfx/synth.py` + `mix.py` + `loudness.py` — complete no-dependency sound engine (193+111+72 lines). Our animate track's synth score could adopt `mix.py`'s pan/typing/master API as a second backend.
- `scripts/sheet.mjs` (beat contact sheets) and `scripts/wave.mjs` (waveform+beat overlay) — QA tools.
- `.claude/skills/motion-design/SKILL.md` §2–§9: the numbers table (easings/springs/stagger/holds/type/color/texture/transitions/anti-patterns). Very compatible with our craft laws; worth diffing line-by-line against our SKILL.mds.
- `sims/engine/main.js` — the 3D-cutaway reference implementation (cutaway wedge, exploded view, fly-through camera, labels, shaders).
- Contact-sheet offsets: one frame per beat at **+0.3s** ("so motion has settled").

### 1.6 Verdict
**ADOPT-EXACTLY:**
- `sims/` pipeline concept + `capture.mjs` + `kit/stage3d.js` + `kit/util.js` → **the backbone of our new make-3d-cutaway skill** (frame-pure render(t), headless Chromium stepping, stills review).
- `sims/engine/main.js` cutaway/exploded/camera/label patterns → **make-3d-cutaway** directly (and make-isometric for camera keyframing ideas).
- `beats.py` → animate-track QA/optional real-music support.
- `scripts/wave.mjs` beat-overlay waveform → our measured-QA suite (add to review.mjs family).
- `mix.py` honest-mastering gate + key/pan doctrine → our sound stage (make-short / animate score).
- motion-design numbers (hold table, stagger table, exit=half-entrance, overlap scenes) → our craft laws doc.
**ALREADY-HAVE:** Remotion frame-purity, palette-lock, contact-sheet review, −14ish LUFS target (we do −16), procedural synth (we have our own), determinism (byte-identical checks — ours is stronger, we check bytes; they don't).
**REJECT:** nothing material. Minor: 60fps render cost on our 2 vCPUs (their engine sims would need dpr/fps downscale here); watermark default on (we'd set '').

---

## 2. howseen-ai/claude-motion-design

### 2.1 Architecture
Single skill (`skill/motion-design/SKILL.md`, ~700 dense lines) + scripts. **Pure `window.seek(t)` HTML engine** (no Remotion): every frame computed from time; Playwright screenshots; ffmpeg encodes. One folder per film: `<name>.html + render.py + audio.py + out/`. Two engine flavors:
- Time-based `seek(t)` (examples/howseen-launch/film.html — 24s LinkedIn 4:5 launch film, 11 scenes, entirely DOM+SVG).
- **Frame-number engine** for remakes (`scripts/remake/core.js`): `seek(t)` → `F = round(t*FPS)`, `SHOT({id,f0,f1,render(lf,F)})` registry sorted by f0, per-shot HTML string rendering (innerHTML per frame!), `paletteFilter()` post-processes the HTML string to re-hue leftover old-brand colors. `kf(F, [[f,v],...], ease)` keyframe tables, `samples(F,f0,arr)` for measured per-frame values (cursor path measured from the reference video!), closed-form `spring(tau,f,z)`.

### 2.2 Pipeline stages
1. Inputs (AskUserQuestion with recommended defaults first).
2. Beat map (`BEATMAP.md`): "BPM → beat length, every scene on a beat, the music drop on the key visual moment. Nothing still for > 1 s."
3. **4 stills (or one-frame-per-beat sheet) → look at them → fix → only then full render.**
4. Full render → pops scan → audio → mux → reveal file.
Remake mode: Phase 0 analysis (extract every frame, detect cuts, write SPEC.md shot table) → Phase 1 engine+stubs → Phase 2 **4 parallel build agents** (one shot group each, side-by-side compare sheets) + 1 audio agent → Phase 3 integrate + split-screen encode + QA. Product-film mode adds: director's brief before code (named reference style, timed states, layer list, sound plan), then **motion critic + design critic as separate read-only agents, default reject**, FIXES file per agent.

### 2.3 Techniques we LACK (concrete)

**A. Subframe motion blur, done right** (`scripts/render_template.py::full`):
```python
SUB = 8; SHUTTER = 0.5   # 180° film shutter; 1.0 = smeary
offs = [(j-(SUB-1)/2)*SHUTTER/(FPS*SUB) for j in range(SUB)]
# per subframe t = i/FPS + o, clamped; CUTS list keeps every subframe
# on the same side of a hard cut as the frame centre
# encode: -framerate FPS*SUB -i s_%05d.jpg
#   -vf "tmix=frames=SUB,select='eq(mod(n,SUB),SUB-1)',setpts=N/FPS/TB" -r FPS
```
Plus **adaptive subframes** (from their §9c, credited to Kimeur): "measure the fastest element's px/frame; still → 1 sample, ≤20px → 4, above → ceil(px/5) up to 64" and **targeted blur**: "blur only the 1-3 slam moves; never blur text meant to be read or any move < one element width per frame. Supersample 2× (device_scale_factor=2, Lanczos down) for razor text, cheaper than tmix on static type."

**B. Pop / one-frame-flash detection** (numpy on downscaled gray frames):
```python
d = mean-abs-diff between consecutive frames
pop: d[i] > 3*max(d[i-1], d[i+1], 0.3) and d[i] > 2.0
flash: min(a,b) > 2.0 and |fr[n+1]-fr[n-1]| < 0.35*min(a,b)   # frame n differs from BOTH neighbours
```
"intentional beat cuts show up too: say so, don't hide."

**C. Loop-seam check in position AND velocity** (`render_template.py::loop_check`): seam diff = mean|last−first| ≤ 2×median step; `vin = |fr[-1]-fr[-2]|`, `vout = |fr[1]-fr[0]|` — "A loop must match in position AND velocity: fix velocity by adding the spring tails of the previous 2 cycles."

**D. Capture hygiene**: "wait `document.fonts.ready`, pause `document.getAnimations()` and kill CSS transitions after load (`*,*::before,*::after{transition:none!important}`), and **wait 2 requestAnimationFrame after every seek(t)** before the screenshot." Also `visibility:inherit` (not `visible`) on children of hidden parents; deterministic Chromium flags: `--deterministic-mode --run-all-compositor-stages-before-draw --disable-threaded-animation --disable-checker-imaging --font-render-hinting=none --force-color-profile=srgb`; `WEBGL=1` → SwiftShader/ANGLE flags for headless WebGL (otherwise black).

**E. Drop-finding by band energy, never trusting the grid**: "per-bar low/full band energy, then 20-50ms windows around the jump. Start the song at `drop_in_song - drop_in_film`." Their measured Mixkit track table (BPM + exact drop seconds) is a reusable fact table: mixkit-207 120BPM drop 31.97s; mixkit-190 120BPM drop 16.01s; minimal-techno-01 119.99BPM true drop 39.98s ("auto grid is 2 beats off"); Cat Walk 130BPM drop 14.769s; etc.

**F. SFX placed by measured peak** (`examples/howseen-launch/audio.py`): `i0 = round(t*SR) - argmax(|s|)` — each stock SFX is aligned so its LOUDEST sample lands on the event time (not its file start). Two-pass loudnorm with `measured_*` values from pass 1 and `linear=true`. Music ducked ~9dB under voice (promo60).

**G. Camera in log space + beat punches** (§2 engine): "zoom interpolated in log space, never zoom in/out back-to-back. Beat punches: `+0.012` per beat, `+0.03` per bar after the drop, exp decay." The example implements: `punch += .018*exp(-(t-bt)*7)*sin(min(PI,(t-bt)*22))` per 4-beat and `.01*exp(-9*(t-bt))*sin(...)` per beat, applied as container scale.

**H. Flood transition geometry**: "circle from the source object, must clear the farthest corner (`hypot` to the 4 corners ×1.05) in ~0.3-0.35 s, then contract into the next object."

**I. Masked word rise with stagger 55ms + rotation**, accent words get a MOVING gradient via `background-clip:text` with `backgroundPosition` driven by t; `wordify()` wraps every word in spans automatically and marks colored ancestors as accents.

**J. Anti-"AI motion" rules** (§9b): "ONE accent colour; one thing moves at a time; one shape/visual system start to end, transformations not cuts; springs with damping ratio ≥ 0.72, tiny overshoot, never cartoon bounce; banned: rainbow gradients, particles, glowing chrome, emoji, lorem ipsum, gratuitous 3D flips; 9:16 safe zone decided at storyboard (text inside centre 1080×1080). Silent 'one sentence' test: show the loop muted; if a stranger summarises it in one sentence, it works."

**K. Critic-agent architecture**: "motion critic + design critic as separate read-only agents (default reject)" and "Judge ≠ builder: run the critique as a separate read-only sub-agent, and have a fresh agent restate the message from the frames alone (if it can't, the film fails)." Plus 1–10 scoring per dimension and "fix only ≤7, don't touch shots at 9+" and "Repeat until every score is 8+."

**L. Format fan-out**: "write scenes against a layout function, then render 9:16, 1:1, 16:9 and 4:5 from the same timeline, reframing type and UI per format (never crop)."

**M. Reference-remake measuring**: "MEASURE with numpy on ref frames (ink bboxes, typing char count, cursor tip, camera scale/offset, fade timing) → drive motion with CORE.samples." `remake_analyze.py` extracts all frames, detects hard cuts by mean-abs-diff spikes vs local median (`d[i] > 6 and d[i] > 3.5*(loc+0.5)`), writes shot sheets with frame numbers + "CUT" labels.

**N. Honesty rules**: illustrative data labeled "Example data" ON SCREEN; "no 'made in 10 minutes' if it wasn't; no '0 external tools' if Cartesia/Mixkit were used; no 'one shot' after iterations." We already fact-check but don't burn "Example data" labels.

**O. Poster-frame mux** (§9c): `-filter_complex "[0:v][1:v]overlay=0:0:enable='eq(n,0)'"` because "X/Slack/Discord ignore the cover."

**P. Spring presets (stiffness k / damping d)**: snappy UI 320/30, default containers/camera 170/26, heavy type/logos 120/24, playful 180/12. "Leading and trailing edges of a stretching indicator on different springs."

### 2.4 Reusable assets
- `scripts/render_template.py` — probe/beats/draft/full/pops/loop commands with CUTS-aware subframes. The single most portable render script of the four repos.
- `examples/howseen-launch/film.html` — complete 11-scene seek(t) film (wordify/rise/flood/borderBeam/cursor/KPI rings/heatmap/typing) as a style reference.
- `scripts/remake/core.js` — frame-number engine + `kf/samples/paletteFilter/pixelDissolve/cursor/words` helpers.
- `scripts/remake/BRIEF_TEMPLATE.md` — parallel-agent build contract ("Write ONLY shots/Gx.js… Never claim a match without viewing ref|ours").
- `scripts/audio_template.py`, `analyze_song.py`, `mixkit_sfx_search.py`, `svgl_logos.py` (svgl.app API for brand SVG logos + simple-icons CDN fallback).
- SKILL.md §9c "Stolen from the other public motion skills" — a curated cross-repo technique digest (GSAP seek, WAAPI pause+currentTime, Lottie goToAndStop, deterministic Chromium flags, adaptive subframes, cut seams, captions rules, poster frame, music cues formula `0.45·onset+0.25·contrast+0.20·rms+0.10·bass`).

### 2.5 3D/cutaway
No 3D beyond "banned: gratuitous 3D flips" and a 3D cube in a reference film. Nothing for our Three.js skill. (Their `WEBGL=1` SwiftShader flag list IS useful if our cutaway page ever renders in headless without GPU.)

### 2.6 Verdict
**ADOPT-EXACTLY:**
- subframe motion blur + CUTS clamp + adaptive-subframe guidance → **our animate engine's recorder** (biggest single visual upgrade available).
- pops + one-frame-flash + loop velocity checks → **review.mjs** (we have frozen-time detection; these are the frame-diff complements).
- 2-rAF-after-seek + fonts.ready + getAnimations().pause() capture hygiene → our recorder.
- SFX-by-measured-peak + two-pass loudnorm → our mix stage.
- "Judge ≠ builder" critic sub-agent + 1–10 scoring + fresh-agent-restates-the-message → our review loop for flagship pieces.
- render_template.py as a reference implementation.
**ALREADY-HAVE:** seek(t) purity, determinism, contact sheets, drafts before masters, beat-locked scenes (we lock to VO instead — theirs is music-locked; both valid, ours is voice-is-the-clock).
**REJECT:** Mixkit/stock-asset dependency paths (we're procedural-by-policy), meme library, paid services. Their 8-subframe default is wasteful on 2 vCPUs — use adaptive (1/4/8).

---

## 3. Barty-Bart/motion-graphics

### 3.1 Architecture
Two skills:
- **motion-broll**: one HTML fragment per clip (`motion/clips/NN-name.html`) + shared engine (`engine/motion.js` = `window.M` API; `build.py` wraps fragment + engine + fonts + cursor into one self-contained page; `render.js` = Playwright frame capture, **4 subframes/frame, 180° shutter, tmix weights 1 1 1 1, select every 4th**, PNG pipe, alpha clips → **ProRes 4444 yuva444p10le** for transparent panels, else x264 crf14; `beats.js` stills sheets).
- **object-separation**: SAM 2.1 video segmentation via HF transformers, fully local (model auto-picked by hardware: large 898MB ≥12GB NVIDIA / base-plus 323MB Apple Silicon / tiny 156MB CPU; ~5s/frame on CPU), chunked 60-frame propagation with mask seeding, green-tint preview + per-frame PNG masks.

### 3.2 Pipeline
Interview (density: light 2–4 clips/min, medium 4–7, heavy) → **inspect_video.py** (resolution/fps + **layout sections full vs PiP detected by dark column bands at 4fps** + subject box tracking through PiP sections + warning if the box changes size) → words.py (SRT → word list) → **plan table with treatment per clip (full-frame cutaway / transparent panel / nothing) + WHY, user approves** → build fragments → beats.js stills at key words → fix → render at the source video's fps → composite.py preview + make_pages.py (viewer.html, compare.html) → TIMING.md.

### 3.3 Techniques we LACK

**A. One-shape-that-never-cuts clip grammar.** "Every clip is one shape that never cuts: it morphs its size, corners and colour from state to state while its content swaps with a short blur. A cursor drives the changes with real clicks and drags." State machine in `M.scene({SH:{state:{w,h,r,bg,cam}}, start, SEQ:[[t,'state']]})`; geometry interpolated by `M.track` = **sum of one closed-form spring per target change**:
```js
M.track = (v0,keys,def,period=0)=>{
  let prev=v0; const ks=[];
  for(const k of keys){const d=k[1]-prev; prev=k[1]; ...}
  return t=>{let v=v0; for(const k of ks) v+=k[1]*S(t-k[0],k[2],k[3]); return v;};
};
```
(with loop-residue support: `v += k[1]*(S(t+period-k[0])-1)` so t=period ≡ t=0 — elegant exact-loop trick for springs.) Color version `M.ctrack('#hex', keys)`.

**B. Leading/trailing edge on different springs** — "Liquid indicator: two M.tracks for left/right edges; the edge moving forward uses M.FAST, the trailing one M.SLOW." Spring presets: MORPH [15,0.84], FAST [27,0.86], SLOW [12.5,0.9], SOFT [10,0.95], CAM [7.5,1], INSTANT [∞,1].

**C. Content-swap timing so text never overlaps** (`M.vis`): "exit blurs out fast (lout 0.12), enter waits `din` 0.07 then blurs in over `lin` 0.26" with blur 12px and 0.94–1.0 scale. Our minimal-reel has text-exit timing but not a parameterized blur-swap primitive.

**D. Human cursor path**: `M.path([[t,x,y]...])` eased with "a slight human arc" (`arc = sin(PI*u)*0.06` perpendicular offset); `M.presses` = spring-press around click times ([c−0.07 press-in, c+0.035 release]). "Keep the cursor inside the frame at every camera zoom, including during morphs."

**E. `M.crossTimes(f,t0,t1,thresholds)`** — precompute (1ms scan) when a monotonic value crosses thresholds → trigger springs from a dragged value. Nice pattern for drag→snap interactions.

**F. PiP/empty-space detection + panel placement** (`inspect_video.py`): 4fps thumbnails to 96×54 gray; `dark = f[:,60:].mean()<8 or f[:,:36].mean()<8` → layout sections; in PiP sections track subject bbox via `np.where(f.max(0)>20)`; flag box changes > 2 columns. Then transparent ProRes panels are "centred in the empty area, sized to stay clear of the speaker's box at every moment… can run long (15s+) as one continuous morph."

**G. Alpha pipeline for overlays**: `screenshot({omitBackground:true})` → `format=gbrap` → `tmix` → `prores_ks -profile:v 4 -pix_fmt yuva444p10le` — transparent video that any editor can drop over footage. render.js encodes `framerate FPS*4` input then `select='eq(mod(n,4),3)'` at the true rate (handles 30000/1001 as `['30000/1001','120000/1001']`).

**H. Composite preview with hold-last-frame**: `tpad=stop_mode=clone:stop_duration=2` + overlay `enable='between(t,in,out)'` chains — "Clips shorter than their slot hold their last frame."

**I. Interaction vocabulary table** (engine-api.md): pill+click, progress, check, status island, card with drag, slider (rubber band), toggle, tabs, chart+tooltip, search/filter, file drag-and-drop, terminal typing, side-by-side comparison, chapter card. "Map each idea onto an interaction from the vocabulary."

**J. B-roll placement doctrine** (SKILL.md §4): "Full-frame cutaway: cut away for the length of the idea (3–10s), then give the face back. Don't cut away in the first second of the hook or on personal, emotional or opinion lines. Leave at least ~2s of face between cutaways." "Pace to speech, not music: one change per spoken beat, about 0.4–1.2s apart." "Put important changes on the first or last word of a cue [SRT drift]."

**K. Icon set with normalized stroke**: `M.icon(name,size,color,sw)` — `stroke-width = sw*24/size` so every icon has the same world stroke width. 14 Lucide-derived paths in `M.IC`.

**L. object-separation's SAM 2.1 workflow** — local subject extraction with chunked mask-seeded propagation and a green-edge preview for verification. Relevant if we ever composite cutouts over our films (e.g., a product or hand over a procedural background).

**M. Gotchas worth keeping**: "Never put `will-change` on anything the camera scales; text renders blurry." "mix-blend-mode:difference labels must sit in a layer that has the blend mode itself." "Items that slide under a highlight need M.FAST springs, or the highlight row sits empty for a moment." "Text swapping inside a morphing container needs its own enter/exit timing."

### 3.4 Reusable assets
- `engine/motion.js` (146 lines) — the whole M API; could be ported as an "interaction clip" guest for our animate engine.
- `engine/render.js` (22 lines) — minimal alpha-capable subframe recorder.
- `scripts/inspect_video.py` (34 lines) — layout/empty-space detection.
- `reference/engine-api.md` — the clip grammar spec + interaction vocabulary (good doc pattern for our skills).
- `examples/opus-aoe2/*.html` — 6 finished clips incl. drag-and-drop with ghost drop target (`04-master-prompt.html`), PiP panel (`02-pip-builds.html`).
- `scripts/composite.py` — preview-with-hold-last-frame overlay chain.

### 3.5 3D/cutaway
Their "cutaway" = B-roll cutaway (editorial), NOT technical 3D cutaway. No Three.js. The 3D-cutaway relevant pieces are zero; the B-roll doctrine (J) and PiP panel logic (F) could inform a future "graphics over talking-head" mode of make-vox.

### 3.6 Verdict
**ADOPT-EXACTLY:**
- `M.track` spring-summation + loop-residue → our fusion kit / animate engine easing layer (exact loops with springs — solves our loop-seam pain in one function).
- `M.vis` blur-swap primitive + edge-on-different-springs indicator → make-minimal-reel / make-motion-graphics components.
- render.js alpha ProRes path → if we ever need overlay clips.
- PiP/empty-space inspection + B-roll treatment table → a future make-broll skill (we don't have one; this is the blueprint).
- Icon stroke normalization + `M.path` human cursor arc → animate-engine HUD/cursor moments.
**ALREADY-HAVE:** frame purity, springs, contact-sheet review (beats.js ≈ our review sheets), no-invented-numbers rule (we fact-check with web search — stronger).
**REJECT:** SAM 2.1 for now (heavy download, 5s/frame CPU; no current use case in our pipeline).

---

## 4. charlie947/motion-graphics-skills

### 4.1 Architecture
No code engine at all — 14 prompt-workflow SKILL.mds + 5 prompt files. Each skill = interview questions → "wait for a yes" gates → a paste-ready build brief (a prompt for Claude Code) → check lists → export note (relies on HyperFrames or ffmpeg for MP4; the skills themselves only produce HTML with `window.seek(seconds)`). Brand layer: `brand-intake` writes `brand.md` + `MOTION.md` and injects a read-first rule into CLAUDE.md that every other skill reads.

### 4.2 Pipeline stages (per skill)
Ask 4–5 things → wait → script/beat sheet → wait for approval → build brief (paste-ready) → build → capture one frame from the middle of every shot/beat → check (cut-off text, overlaps, facts character-for-character) → export. Motion-effects: fixed 8s loop clock (0–2.2 move, 2.2–6.6 hold, 6.6–8.0 return, frame 8 ≡ frame 0).

### 4.3 Techniques we LACK (mostly prompt-engineering + QA rules)

**A. MOTION.md brand-file pattern** (brand-intake): a machine-readable design system generated FROM 3–5 reference frames: "1. Every colour as a hex code, and what each one is for 2. fonts and type sizes 3. Timing: how things come in, how long they hold, how they leave 4. How things move: frame rate, easing, anything handmade 5. Texture and finish 6. Five things my motion must never do, named plainly 7. One example, described shot by shot, of it done right. Work only from what is in the frames. Where you cannot tell, write ASK ME." Plus the CLAUDE.md rule: "The file sets the look, not the ambition. When I say go all out, go all out." — This is a cleaner intake artifact than our brief.md; could become a make-brief template.

**B. Banned-defaults list** (house rules): "typewriter text, glow, bounce, gradients on text, purple-to-blue backgrounds" + per-skill additions. **Motion on twos**: "hold each drawn pose for 2 frames at 24fps" for handmade feel (vox-explainer). Our craft laws don't have a banned-list this blunt.

**C. The 16-effect recipe clock** (motion-effects/references/effects.md): every effect = 8s loop with move 0–2.2 / hold 2.2–6.6 / return 6.6–8.0; stagger vocabulary "early <0.8s, middle 0.8–1.4, late 1.4–2.2"; and the premium details per effect, e.g.: "a faint ghost of the button stays where it started" / "the title is a shared element. It moves, it is never duplicated" / "the leading edge moves first and the trailing edge follows a beat behind, so the pill gets long, then short again" / "label colour follows how much of the pill sits over it" / "each card follows a real spring with its own damping… a small easing graph in the corner shows a dot riding the overshoot curve in time with the card." This is a ready-made motion vocabulary for UI-morph beats.

**D. Loop QA with numbers** (loop-cover): measured seam and "excursion" (max diff vs frame 0 — "near zero means nothing visible moves"; targets seam 0.0–0.3, excursion 0.7–2.8 at 216×154 gray); "Rotate the loop so frame 1 is the finished picture" (inbox preview shows frame 1); GIF encode `palettegen=max_colors=128:stats_mode=full` + `paletteuse=dither=none` ("dither adds flicker"); "Never measure motion at the halfway frame. A sine is back at zero there."

**E. `willReadFrequently:true` determinism gotcha** (milestone-reveal): "After repeated pixel reads Chrome switches drawing mode, so a frame came out slightly different. Create the canvas context with `willReadFrequently: true` and every seek gives the same pixels." + "My passing build had 0 pixels different between frame 0 and frame 12" — measured, not eyeballed.

**F. Font preload gotcha** (motion-effects): "An embedded font does not load until something uses it, so the first frame can paint in a fallback. Load every font explicitly before the first seek(0)."

**G. Reel export recipe** (reel-export): full safe-zone numbers (nothing below y1420, right 120px, headline y360–520; 16:9→1080 wide = 608 tall at y660), silent AAC track when no sound (`anullsrc`), bt709/tv-range/full flag set, and the ffprobe pass gate: "video h264, 1080×1920, yuv420p, color_range=tv, bt709, plus one aac audio stream. If you see hevc or color_range=pc, encode again."

**H. Facts-first doctrine as a hard gate**: "Do not start building until every fact on screen has a source." (vox-explainer) / "The number is the user's real, sourced number. Never round it up, never add '+', never swap a target for a result." (milestone-reveal) / "Say 'looks like', never 'is', when the research only shows a similarity." We share this ethos; their phrasing ("a target is not a result") is worth porting into brief templates.

**I. Designer-notes protocol** (prompts/briefs.md): one thing per note, say how it FEELS not how to fix it, point at a moment. Real examples: "the text at the start undersells what's coming next", "you can't really hear the audio on top of the sound effects". Good model for our confirmation rounds.

**J. Reference-to-motion split**: MOVES reference (video → pace/change/type/one-idea) vs LOOK reference (site/moodboard → colors/fonts/feel); "take the grammar, never the content or logos"; output is a <300-word prompt with per-scene time ranges. Also their breakdown method: five lines (pace, change, type, color+light, the one idea).

**K. Milestone particle-number technique**: "Build the number's shape by drawing it in the bold weight on an offscreen canvas and sampling its filled pixels as targets. Give most points to the number so it reads crisply at feed size, comma included. The rest stay as dimmer drifting stars." with ratio learned: "about 2,700 of 3,200 points on the number, each 2.5px at near full opacity."

**L. Brief-shape for "why" films**: "[The question]? And then [the visual turn: what happens on screen that nobody expects]. [The metaphor that shows the idea]."

**M. Structural QA questions**: "If you cannot say what a shot proves, cut it." / "The last shot is the takeaway, in five words or fewer." / "Would a stranger know what's launching by second 4?" / "Is it readable on a phone, with the sound off?"

### 4.4 Reusable assets
- `skills/motion-effects/references/effects.md` — 16 effect recipes on the 8s clock (premium details are the gold).
- `skills/brand-intake/SKILL.md` — MOTION.md template + CLAUDE.md read-first block (port as our brief-intake format).
- `skills/reel-export/SKILL.md` + `skills/model-showdown/SKILL.md` — exact ffmpeg/ffprobe delivery recipes with flags.
- `skills/loop-cover/SKILL.md` — GIF seam/exursion measurement script.
- `prompts/briefs.md` + `polish.md` — note-giving protocol and the "fix one thing only" prompt.
- `skills/vox-explainer/SKILL.md` — shot-type table (kinetic statement / paper cards / before-after / label callout / counter / grid).
- `skills/milestone-reveal/SKILL.md` — particle-number build brief (canvas text sampling).

### 4.5 3D/cutaway
`skills/title-sequence-3d/SKILL.md` — thin but useful as a PROMPT spec for 3D scenes: "Low-poly buildings, wet reflective ground, fine rain. Each logo drawn onto a canvas texture on a plane with soft bloom (UnrealBloomPass, subtle, never blown out). Camera: one slow, steady dolly forward and slightly up. No shake, no spins… Keep the ground under the title dark enough that reflections never show through the letters." Plus: "rain (seeded, never Math.random at render time)". It's a sibling of whaleyxbt's engine sim but with zero implementation. Relevant rules for our cutaway skill: pinned Three.js version, seeded particles, subtle bloom, dolly-not-orbit (contrast: whaleyxbt says fly-through > orbits), reflection-vs-text contrast guard.

### 4.6 Verdict
**ADOPT-EXACTLY:**
- effects.md 16-recipe clock + premium details → motion vocabulary for make-motion-graphics / make-on-script guest beats (e.g. "ghost of the start state", "shared element travels", "leading/trailing edge springs" — the last two overlap Barty's).
- MOTION.md intake template + "file sets the look, not the ambition" → our brief.md format.
- reel-export ffprobe gate + exact delivery flags → our release checklist (we deliver MP4s via GitHub Releases; adding the color_range/bt709/aac checks costs nothing).
- loop-cover seam/excursion measurement + frame-1-rotation → our GIF previews (we already make GIFs for releases; measuring the seam would formalize it).
- willReadFrequently + font-preload-before-seek(0) gotchas → our recorder determinism notes.
- milestone particle-number recipe → a make-motion-graphics payoff primitive (KineticPayoff sibling).
**ALREADY-HAVE:** facts-first (we source with web search), phone-readability checks, "no invented numbers" (both houses converged), frame-0 busy (whaleyxbt also).
**REJECT:** the skills' dependence on HyperFrames for export (we have our own recorder); "model-showdown" and "newsletter-promo" as product ideas (not our use case); no QA automation at all in this repo (all checks are "look at frames" — we have measured QA; treat this repo as prompts, not engineering).

---

## Cross-repo ADOPT list (mapped to our skills)

| Adopt | Source file(s) | Target skill |
|---|---|---|
| 3-Plane clipping-wedge cutaway + exploded offsets + camera keyframe table + state-driven shake + chapter-gated flow focus + screen-space labels with leader lines | whaleyxbt `sims/engine/main.js`, `sims/engine/timeline.json` | **new make-3d-cutaway** (the blueprint) |
| Frame-stepped capture harness (render(t) → jpeg → image2pipe → x264; --stills review sheets; --dpr scaling) | whaleyxbt `sims/capture.mjs`, `sims/kit/runtime.js` | make-3d-cutaway + animate engine |
| three.js stage (ACES, bloom, PMREM sky env, project(), setCrop) + util (keyed, rng) | whaleyxbt `sims/kit/stage3d.js`, `sims/kit/util.js` | make-3d-cutaway |
| Sky+PMREM environment, lathe profiles with ridge pass, emissive heat gradient, stream/plume shaders, Poisson crackle sound, decorrelated stereo | whaleyxbt `sims/engine/main.js`, `sims/engine/sound.py` | make-3d-cutaway |
| Bloom discipline rules (emissive<1, roughness≥0.45, envMapIntensity~0.5, clamp pow bases) | whaleyxbt `.claude/skills/web-sims/SKILL.md` "Lessons" | make-3d-cutaway craft laws |
| Subframe motion blur (SHUTTER=0.5, tmix, CUTS clamp, adaptive 1/4/8+, supersample 2× for text) | howseen `scripts/render_template.py`, SKILL.md §3/§9c; Barty `engine/render.js` | animate engine recorder (all make-* styles) |
| Pops + one-frame-flash + loop position/velocity checks | howseen `render_template.py::pops/loop_check` | review.mjs |
| Capture hygiene (fonts.ready, pause getAnimations, 2 rAF after seek, deterministic Chromium flags, WEBGL=1 SwiftShader) | howseen SKILL.md §3/§9c | animate recorder + 3D skill |
| Waveform with beat-lines overlay + LUFS/TP print | whaleyxbt `scripts/wave.mjs` | measured QA suite |
| Beat/drop analyzer (autocorrelation+downbeats+kicks+drop, drop@40% windowing) | whaleyxbt `sims/beats.py` | animate engine (optional real-music mode) |
| SFX placed by measured peak + two-pass linear loudnorm; music duck −9dB under VO | howseen `examples/howseen-launch/audio.py` | mix stage of make-short/on-script |
| Honest-mastering gate ("too sparse → add a pad, don't crush") + key/pan doctrine | whaleyxbt `sfx/mix.py`, sound-design SKILL.md | our synth score stage |
| `M.track` spring-summation with loop residue; edge-on-different-springs; `M.vis` blur swap; cursor human arc; icon stroke normalization | Barty `engine/motion.js` | fusion.tsx + animate engine |
| Reading-hold formula (≥1s + 0.25s/word, ≥2s hook), stagger table, exits = half entrances, overlap scenes | whaleyxbt motion-design SKILL.md §4 | craft laws (all skills) |
| 16-effect recipe clock + premium details (ghost of start, shared element, label-follows-pill) | charlie947 `skills/motion-effects/references/effects.md` | make-motion-graphics / fusion kit |
| MOTION.md intake + "sets the look, not the ambition" + designer-notes protocol | charlie947 brand-intake SKILL.md, prompts/briefs.md | brief.md template + confirmation rounds |
| Delivery gate: ffprobe h264/yuv420p/tv/bt709/aac; poster frame mux; Reel safe-zone numbers | charlie947 reel-export + model-showdown SKILL.md; howseen §9c | release checklist |
| Loop-cover seam/excursion measurement + frame-1 rotation + dither=none GIF | charlie947 loop-cover SKILL.md | GIF previews in releases |
| Particle-number payoff (canvas text sampling, 2700/3200 on glyphs) | charlie947 milestone-reveal SKILL.md | KineticPayoff-style primitive |
| "Judge ≠ builder" read-only critic agents + fresh-agent-restates-the-message + 1–10 scoring | howseen SKILL.md §9b/§9c | flagship review loop |
| willReadFrequently + explicit font load before seek(0) | charlie947 milestone/motion-effects | determinism notes |
| One-shape-never-cuts clip grammar + interaction vocabulary + PiP empty-space detection | Barty engine-api.md, inspect_video.py | future make-broll (blueprint only) |

## Priority recommendation for the 3D-cutaway skill
1. Fork the shape of `sims/`: one HTML page per film, `render(t)` pure, `runSim(DEFAULTS, ...)` contract, build.mjs-style bundling (or plain script tags), capture via frame-stepped Playwright.
2. Lift `stage3d.js` + `util.js` almost verbatim (MIT).
3. Copy from `sims/engine/main.js`: the `CLIP` wedge + `setCut`, `OFF`+`explAt` exploded table, `K` camera keys with per-segment easing (include at least one fly-THROUGH), label array with `{a, side, t0, t1, sub}` + 70px side-stacking + canvas leader lines, `rotorAngle` integration trick, chapter-gated intensity.
4. Keep the whaleyxbt lessons as craft laws: bloom <1.0 emissive, roughness ≥0.45, frame-0 busy, clamp pow() bases, labels never cover the subject, chapters+one-line caption+real numbers "make a simulation read as an explanation, not just eye candy."
5. Add what they lack (our strengths): measured QA (LUFS, determinism byte-check, frozen-time), palette lock, silence-before-payoff, and our own synth score reading the same timeline.json.
