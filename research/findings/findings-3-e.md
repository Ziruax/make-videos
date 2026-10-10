# Findings — Task 3-e (research batch E)

Repos analyzed (work-trees at `research/external/`, `.git` skipped):
1. `ginonave_Motion-Synthesizer` (2 files — read both in full)
2. `Boriwatopal_agent-skill-remotion-motion-graphics` (all 30 files read: SKILL.md, README, 14 reference files, 8 assets, 4 scripts)
3. `t3knobox_klik-anim-skill-creation` (all 3 skills read in full: klik-anim SKILL.md + 5 references + lint script, klik-cam SKILL.md + 2 references, klik-remotion-method SKILL.md + 5 references + 4 templates + 2 scripts, README/CLAUDE.md/METHOD-FEEDBACK.md/INSTALL.md)
Plus a skim of the top-level README/SKILL.md of all 18 external repos for the family comparison.

---

# 1. ginonave_Motion-Synthesizer

Files: `README.md` (155 lines), `Motion-Synthesizer-v-07.html` (2,658 lines, the entire app).

## 1.1 Architecture

**Not an agent skill — a hand-operated browser motion-design tool.** Single HTML file, PixiJS v7 (WebGL) via CDN + `pixi-filters`, vanilla JS, all state in one `S` object, groups saved to `localStorage`. There is no pipeline, no script, no voice, no music, no QA — the human is the director. Its value to us is **pure motion vocabulary and 3D math**, not process.

Core model: canvas → *groups* → each group has one **shape** (15 types: circle…star, ring, cross, text, marker), one **layout** (10: grid, honeycomb, radial, circle-pack, **text-pack** (shapes masked to a rasterized text outline), scatter (seeded), row/column, diagonal, **obj-mesh** (3D point cloud)) → per-group **animation tracks** (property, mode, values) → per-group post-FX → motion trails. Export: WebM via MediaRecorder, MP4 via **WebCodecs + mp4-muxer** (frame-accurate).

## 1.2 Pipeline stages

None — it's an editor. Open → click preset (50+ built-in) → tweak → export. The only "pipeline" concept worth keeping is that the whole render is a pure function `renderFrame(t)` driven by a scrub timeline (`S.pb.t`), and export just steps `t` from 0..dur at `f/fps`.

## 1.3 Techniques we LACK (with code)

### A. Phase propagation — "field motion" as a first-class primitive
`Motion-Synthesizer-v-07.html:812-837` — `calcPhase(pos, mode)` returns a 0..1 fraction **per shape** used as a phase offset. Nine modes:
```js
const PHASE_MODES=['wave','wave-x','wave-y','diagonal','center-out','inside-out','sequential','radial','random'];
// center-out (grid fallback): d=sqrt((r-cr)²+(c-cc)²)/(sqrt(cr²+cc²)||1)
// sequential: f=i/(n-1); random: f=rg() (seeded); radial: f=(p.i||i)/(p.n||n)
```
And the oscillator (`:1304-1322`):
```js
// phi = 2π * freq * t + phiFrac * phaseSpread * 2π
const phi = 2*Math.PI*a.freq*t + phiFrac*(a.phaseSpread||1)*2*Math.PI;
const mid=(a.from+a.to)/2, amp=(a.to-a.from)/2;
v = mid + amp*Math.sin(phi);
```
Keyframe mode adds `stagger`/`staggerTime` per shape, loop modes `loop|pingpong|none`. **We do dual-frequency drift and spring settles per element, but we have no composable "how motion spreads across a field of N shapes" dial** (wave / center-out / radial / sequential / random × phaseSpread 0..4). This is the vocabulary behind Mario de Meyer / dvdp-style grids.

### B. Two-mode animation per property with huge property coverage
Animatable (`README.md:44-46`): `scale scaleX scaleY rotate rotDeg moveX moveY opacity skewX skewY spread spreadX spreadY orbitAngle orbitRadius colorCycle colorHue colorGrad colorRandom textSpacing mesh3dRotX/Y/Z mesh3dScale` + all FX params + group-level `gMoveX gMoveY gScale gRotate`. Notable per-property math (`:1562-1611`): `orbitAngle` rotates each shape's position around the **layout center** (atan2 + r·cos/sin); `spread` scales positions from center; `colorCycle` lerps hex between palette entries; `colorHue` shifts hue.

### C. A full 3D point-cloud system WITHOUT three.js — directly relevant to our 3D-cutaway work
- **9 primitives** (`:393-503`): sphere, icosphere (subdivided icosahedron, detail 0-4), box (6 grid faces), tube, torus, cone, plane, helix, **Möbius**. Each is ~10 lines returning `[[x,y,z],…]`.
- **6 stackable deformers** (`:545-631`), all pure vertex maps: **Twist** (`angle·t` rotation per axis), **Bend** (`R=1/angle` circular arc: `[x, R·sin(a), R·(1−cos(a))+z]`), **Noise** (3-axis layered sines with seed), **Wave** (sine displacement along an axis), **Taper** (linear scale by normalized axis position), **Inflate** (push vertices toward unit sphere: `x+(x/len−x)·amount`). **These are exactly the moves of exploded-view / technical-illustration animation** (twist a bolt stack, taper a housing, inflate a bladder).
- **`project3D`** (`:645-688`): normalize to [−1,1], rotate Z→X→Y, perspective divide with `d=Math.max(fov,0.1); px=rx·d/pz`, and returns `dist=(rz−minZ)/zRange` (0=back, 1=front) — painter's-order depth plus a per-point `R` for radial phase modes.
- **Live re-projection per frame** (`renderFrame:1527-1538`): mesh groups cache the *sampled* point set, and `mesh3dRotX/Y/Z` animations accumulate onto the base rotation each frame and re-project — i.e. **3D rotation is just an animated re-projection, not a scene graph**.
- **Text→3D mesh** (`genTextMesh :507-537`): rasterize any loaded font to an offscreen canvas at 240px, sample pixels on a stride, normalize, then extrude: `zLayers = max(1, min(40, round(depth·sc/stride)))` — "Z layers scaled to match XY pixel spacing → uniform 3D density". No font fetching; uses already-loaded CSS fonts.
- **OBJ import** (`parseOBJ :634-643`, vertex lines only) — arbitrary 3D models as point clouds.
- **Farthest Point Sampling** (`:691-718`): deterministic (seeded) O(n·k) point-reduction that keeps `maxPts` (default 300) points maximally spread — better than random decimation for even shape density.

### D. Motion trails
`mkTrail() :368` — `{segments:12, timeStep:0.05, thickness:3, color, alpha:0.7, taper:true, smooth:true, dash:0, gap:8}`; `drawTrail` (`:952`) draws a polyline through `evalShapePos(g,i,t−s·step)` — i.e. **evaluate the animation at past times** to get the trail, free of any physics. We have no trails primitive.

### E. Post-FX catalogue (pixi-filters, `:1326-1390`)
Glow, AdvancedBloom, **RGB split** (chromatic aberration, per-channel X/Y offsets), Kawase blur, **CRT** (curvature/scanlines/noise/vignette), Glitch (slice-based), **Radial/zoom blur** (strength/center/innerRadius), **Tilt shift** (gradient blur between two endpoints), **Bulge/Pinch** (lens distortion), **Old film** (sepia/scratch/noise). Every parameter is animatable via `fx_*` prefixed anim tracks. Our canvas engine has grain/glows but not zoom-blur/tilt-shift/bulge/CRT as named recipes.

### F. WebCodecs MP4 export (`:2520-2560`) — an alternative render path we don't have
```js
const muxer=new Muxer({target,video:{codec:'avc',width:W,height:H},fastStart:'in-memory'});
const enc=new VideoEncoder({output:(c,m)=>muxer.addVideoChunk(c,m),error:console.error});
enc.configure({codec:'avc1.4d0032',width:W,height:H,bitrate:50_000_000,framerate:fps,latencyMode:'quality'});
for(let f=0;f<tf;f++){
  while(enc.encodeQueueSize > 10) await new Promise(r=>setTimeout(r,5));   // backpressure
  renderFrame(f/fps);                    // render to main WebGL canvas (filters applied)
  offCtx.drawImage(app.view, 0, 0);      // copy to OffscreenCanvas → VideoFrame
  const vf=new VideoFrame(off,{timestamp:Math.round(f/fps*1e6),duration:Math.round(1e6/fps)});
  enc.encode(vf,{keyFrame:f%30===0}); vf.close();
}
```
(plus `preserveDrawingBuffer:true` so the WebGL canvas can be read back). We render via Playwright screenshots + ffmpeg; this in-browser encode is a possible fast-preview path, not needed for delivery.

### G. 50+ presets = a parameter recipe table
`PRESETS` at `:2405+` are single-line recipes, e.g.:
```js
{name:'Hex Spin',shape:'hexagon',layout:'grid',L:{rows:5,cols:7,sx:195,sy:170},
 anims:[mkAnim({mode:'oscillate',prop:'rotate',from:0,to:1,freq:.3,phase:'center-out',phaseSpread:.8}),
        mkAnim({mode:'oscillate',prop:'scale',from:.5,to:1,freq:.3,phase:'center-out',phaseSpread:.8})]},
{name:'Curtain Drop',shape:'rect-t',L:{rows:1,cols:10,...},anims:[mkAnim({prop:'scaleY',from:.04,to:1,freq:.35,phase:'sequential',phaseSpread:1})]},
{name:'Neon Orbit',shape:'dot',layout:'radial',L:{n:48,r:420},anims:[{prop:'scale',from:.1,to:2.5,freq:.5,phase:'radial',phaseSpread:2},...]},
```
Read as a table: *shape × layout × property × phase-mode × spread × frequency*. That's a compact motion-idea generator for grid/field scenes.

## 1.4 Reusable assets worth porting
- `calcPhase` + `evalAnim` (~40 lines total) as a `phaseField()` helper.
- The 6 deformers + `project3D` + `genTextMesh` + `farthestPointSample` (~200 lines, zero deps) — for the animate engine and 3D-cutaway.
- The preset parameter table (as documentation, not code).

## 1.5 3D/cutaway relevance — HIGH
- Deformers (twist/bend/taper/inflate) are the canonical "part separates / housing shells / stack unwinds" moves.
- `project3D` gives us **3D point-cloud looks inside the plain canvas-2D animate engine with no three.js** — an `obj-mesh` guest mechanism (particle-exploded cutaway of an OBJ model) could be ~150 lines.
- Text-to-mesh = 3D extruded type without a font library.
- OBJ import = ingest real technical models (e.g. a drive enclosure) and cut them into point clouds.
- Painter's-order with `dist` we already use in iso-1-seek; their formulation is a clean reusable function.

## 1.6 Verdict
- **ADOPT-EXACTLY-WHAT**: (a) phase-propagation schema (9 modes × phaseSpread) → `make-motion-graphics` / fusion.tsx field components; (b) deformers + project3D + text-to-mesh + FPS sampling → the upcoming **Three.js 3D-cutaway skill** and a canvas-2D `obj-mesh` guest; (c) trail primitive (eval-at-past-t) → animate engine; (d) preset recipe table → craft docs.
- **ALREADY-HAVE**: deterministic seeded RNG (`srng` xorshift ≈ our `mulberry`/seeded rand), pure-function-of-t rendering, painter's-order cutaway (iso-1-seek did it), radial layouts.
- **REJECT**: the tool itself — a manual GUI editor (localStorage, undo, panels) with no script/voice/music/QA pipeline; PixiJS WebGL stack vs our headless-Chromium canvas/Remotion flow; 60fps default aesthetic. Not an agent skill; nothing to copy structurally.

---

# 2. Boriwatopal/agent-skill-remotion-motion-graphics

A Claude skill for kinetic-typography/logo/brand promos in **Remotion 4, React, no three/@react-three, no 3D**. Same philosophical core as ours (`SKILL.md:8-9`): "every frame is a React render of `useCurrentFrame()`, so timing is exact, edits are cheap". Directly comparable to our Remotion tracks.

## 2.1 Architecture

Workflow skill + copy-in starter code (`assets/`) + 4 shell/node scripts + 2 original reference docs + 13 official Remotion rule files (copied unchanged from `remotion-dev/skills`, credited). Project skeleton: `theme.ts` (colors `C`, `SCENES` named durations, `TOTAL`) + `layout.ts` (`useLayout()`) + `anim.ts` (curves, `prog`, `springAt`) + one file per scene + `Main.tsx` (Series) + `Root.tsx` (2 Compositions).

## 2.2 Pipeline stages

1. **Reference-clip analysis** — `scripts/analyze_reference.sh <video> <dir>`: ffprobe, then a 1fps `overview.png` (6-col tile of the whole video) + per-8s `seg_XXs.png` sheets at 4fps, "read them with the image viewer and write the beat map". SKILL.md §1.1: for each 0.5-2s beat note background, what enters, how, what leaves, transition. **"Match its rhythm; you are cloning motion, not content."**
2. **Brand reading** — `curl` the site for copy/fonts/colors; or `grep -o 'fill="[^"]*"' logo.svg | sort | uniq -c` for the palette. "Real copy beats invented copy; when you must invent lines, say so at the end."
3. **SVG artwork mapping** — `node scripts/svg_to_paths.mjs --report logo.svg` prints every path's index/fill/position/size; the agent decides which indices are wordmark letters vs character; `--out src/logo/paths.ts` emits TS path data. Sort letter indices in reading order "along an arc: by angle around a point below the arc". "Don't trust rsvg/quicklook previews on macOS; verify splits with a Remotion still."
4. **Scaffold** — `npx create-video@latest --yes --blank --no-tailwind`; copy `assets/` in.
5. **Scenes from the pattern catalogue** (`references/scene-patterns.md`).
6. **Verify like an editor** — `tsc --noEmit` → `scripts/check_render.sh <CompId> out/check` (0.3-scale MP4 + tiled contact sheets at 2fps per 12s window) → view every sheet → still-render suspicious frames → final render `--codec=h264 --crf=18` → "pull a frame or two from the final file as proof" (the final render is what ships).
7. **Deliver** — MP4 via `SendUserFile`, Remotion Studio on port 3011 for scrubbing; summary states what was invented and what was not done.

No voiceover, no TTS, no audio timeline at all (only the sfx rules file), no loudness QA, no determinism byte-check.

## 2.3 Techniques we LACK

### A. Dual-ratio rendering from one codebase — `assets/layout.ts`
```ts
export const designScale = (width, height) => (width > height ? 1.2 : 1);
export const useLayout = () => {
  const { width, height } = useVideoConfig();
  const s = designScale(width, height);
  const W = width / s, H = height / s;
  return { W, H, cx: W/2, cy: H/2, wide: W > H, diag: Math.hypot(W, H), scale: s };
};
```
"The wide version is designed at 1600x900 and scaled 1.2x in `<Main>`" (`Main.template.tsx:20`: inner div `width:W height:H transform:scale(s) transformOrigin:"0 0"`). Every scene positions through `cx − 218`, `H * 0.615`, `wide ? … : …` — never literal 1080/1920. `Root.template.tsx` registers `Promo` (1080×1920@30) + `PromoWide` (1920×1080@30) on the same `Main`. **All our tracks are locked 1080×1920; this is the cleanest one-code-two-aspects pattern I've seen** (better than responsive sniffing). Also: "When adding a second orientation, re-check the first one's sheet to prove nothing moved."

### B. SVG logo → per-path animation — `scripts/svg_to_paths.mjs` + `assets/components/SvgArt.tsx`
The script (79 lines) parses `<path d fill>` (warns about rect/circle/text needing conversion), resolves `url(#gradient)` fills to first stop color, computes bbox per path, emits:
```ts
export const logo: SvgData = { box, paths: [{ d, fill, box: [x,y,x2,y2] }] };
```
`SvgArt.tsx` then animates **parts** = named groups of path indices: `popEach {start, stagger:2, damping:10, stiffness:170}` scales each path in via guarded springs with `transformBox:'fill-box', transformOrigin:'center'`; or a part-level `style(frame,fps)` + `origin:"50% 100%"` (pivot on the feet). Ready-made `characterStyle({entrance, bobAmp:55, period:36, tilt:2.5})`: spring in from below (damping 12), then `bob = sin(frame/period·2π)·bobAmp`, `rot = sin(...+1.2)·tilt`. `fadeLeft` masks edge-cropped artwork: `linear-gradient(90deg, transparent 0%, transparent 4.5%, black 17%, black 100%)`. **We have no brand-SVG ingestion path at all** — this is the whole thing, in ~180 lines.

### C. Pattern catalogue with numbers — `references/scene-patterns.md` (16 patterns, 148 lines)
E.g.: "Phrase swap: stack all phrases absolutely at the same spot and give each an IN[i]/OUT[i] window (about 40-50 frames per phrase). Keep fixed text right-aligned to a fixed x and the phrase left-aligned to it so the layout never reflows." "Circle wipe: grows from centre to `diag × 1.25` over 20 frames (EASE_INOUT); text sits at the circle's centre so it stays fixed." "Burst → lockup: 18 chips start on a ring (radius 700-1200, seeded angle), rush to centre with EASE_IN over 16 frames while blurring (`blur((1-p)*6px)`) and fading; logo springs in with damping 11-12." Cursor chaining: `const x = lerp(lerp(x0, x1, c1), x2, c2)` — "Cursor moves are chained springs so it never teleports."
Timing table at the end (30fps): "Hook with 3 phrase swaps: 135 frames… Total ≈ 1020 (34 s). **Cut faster than feels comfortable in code; it plays slower than it reads.**" Plus blanket rules: stagger words 5-7f, entrances 12-16f, exits 8-10f, "a beat holds ≥ 20 frames after its last element lands."

### D. The gotchas file — `references/verification-and-gotchas.md`
Remotion-specific traps worth adding to our craft docs:
- "CSS applies `filter` before `clip-path`, so a blurred cone clipped to a polygon has razor edges. Blur the parent, clip the child." (spotlight pattern)
- "A 'cleanup' full-frame overlay drawn after the content covers the text; usually the wipe shape already covers the frame."
- Edge-cropped SVG art on dark bg: mask gradient "fully transparent for the first ~4% and opaque by ~17%; a 9% fade is too weak".
- `url(#gradient)` fills render black without `<defs>` — the script swaps to first stop color.
- Per-path transforms need `transformBox: 'fill-box'` or pivots land on the canvas origin.
- `pathLength={1}` normalizes stroke-dash math so `strokeDashoffset = 1 − p` draws any path.
- `interpolate` input ranges must strictly increase — duplicate stops crash the frame.
- Negative-frame springs: guard `frame <= start ? 0`.
- "Bob amplitude inside an SVG is in viewBox units, not screen px (50 units on a 4096 canvas ≈ 10 px at 840 px wide)."
- "Emoji render fine in Remotion's Chrome on macOS; on Linux CI install a colour emoji font."

### E. SFX library rule — `references/remotion-rules/sfx.md`
`<Audio src>` with free hosted WAVs: `remotion.media/whoosh|whip|page-turn|switch|mouse-click|shutter-modern|shutter-old|ding|bruh|vine-boom|windows-xp-error.wav`. We synthesize everything; this is a zero-effort fallback library (worth knowing, not adopting over our synth).

### F. Light leaks — `references/remotion-rules/light-leaks.md`
`@remotion/light-leaks` `<LightLeak seed hueShift durationInFrames>` (WebGL) "reveals during the first half of its duration and retracts during the second half", typically inside `<TransitionSeries.Overlay>` over a cut. A one-line premium transition we don't have. Also the transitions rule file: fade/slide/wipe/flip/**clockWipe** presentations with `linearTiming`/`springTiming`, and the duration arithmetic (transitions shorten the timeline: `60+60−15`).

## 2.4 What they do differently from us (comparison)
- **30fps default, no voice**: theirs is music-less silent promo design; timing is free-form beats, not voice-locked. Ours: 15fps + Edge TTS + whisper word times as the clock. Their entire timing layer is hand-authored frame constants in `SCENES`; ours derives from speech — stronger for explainers, weaker for beat-driven promos.
- **No fusion**: single look per project, style from brand (logo fills / site CSS). Our one-guest-per-beat routing table is a superset.
- **QA**: contact sheets + human/agent look-pass + tsc. No loudness (no audio), no frozen-time detection, no determinism check, no story-arc scoring. Our review.mjs measured QA is ahead.
- **Ratio-agnostic layout** (theirs) vs fixed portrait (ours) — adopt theirs.
- **`premountFor={15}`** on every Sequence so fonts/images are ready — we should confirm we do this on our Remotion tracks.
- Brand-token elicitation from a live site (`curl -sL -A "Mozilla/5.0"`) — we don't scrape brands.

## 2.5 3D/cutaway relevance
None — no three, no 2.5D, no cutaways. Only transferable: `transformBox: fill-box` gotcha, and the "sort letter indices by angle around a point" trick for arc-set wordmarks.

## 2.6 Verdict
- **ADOPT-EXACTLY-WHAT** (→ our Remotion skills): (1) `useLayout()`/designScale dual-ratio pattern + two-Composition Root (`layout.ts`, `Root.template.tsx`) — port into `make-minimal-reel`/`make-on-script` for optional 16:9 delivery; (2) `svg_to_paths.mjs` + `SvgArt.tsx` per-path logo animation — new "brand-logo path" for make-on-script guests; (3) `scripts/analyze_reference.sh` reference→contact-sheet beat-map intake — pre-step for "make it like this video" requests; (4) scene-patterns timing numbers (phrase swap 40-50f, stagger 5-7f, exits 8-10f, hold ≥20f, "cut faster than it reads") into craft laws; (5) the gotchas list into our Remotion notes; (6) `premountFor` check.
- **ALREADY-HAVE**: frame-pure React Remotion 4, named bezier curves (`EASE_OUT (0.16,1,0.3,1)`, `EASE_IN (0.7,0,0.84,0)` — identical values to house rules), typewriter-by-string-slicing, guarded springs, contact-sheet verification, tsc-first.
- **REJECT**: nothing major. Their narrower scope (silent brand promos, no audio pipeline, no measured QA) means we only cherry-pick patterns.

---

# 3. t3knobox/klik-anim-skill-creation

Three skills + a field report. **The most idea-dense repo in batch E** — a complete craft-law system with measured numbers, honest failure post-mortems, and two QA scripts that measure things we don't.

## 3.1 Architecture

- **`klik-anim/`** — element-animation craft: Part A laws A0-A18 (style-agnostic, non-negotiable), Part B Remotion layer (delegates all API mechanics to Remotion's official skills; contains only beat-sync math), Part C style hooks (pacing dial C0.5, style interview C2), Part D 33-item pre-flight checklist. References: `motion-library.md` (measured springs/curves), `kinetic-type.md` (reveal taxonomy + inertia law + painted/morph systems), `effects.md` (12 render-verified finish recipes), `music-motion.md` (music→motion recipes with code), `layout.md` (5 composition models, frame-verified against a 7-title canon). Plus `scripts/lint-motion.mjs`.
- **`klik-cam/`** — camera craft: C0 dial (1-5), CAM-1..6 laws, 10-item checklist; `references/camera-moves.md` (named move vocabulary with exact 2.5D implementations), `references/camera-music.md` (3 presets + sidechain math).
- **`klik-remotion-method/`** — orchestration: 5-stage pipeline with gates; `references/` per stage; `templates/` (SSOT, storyboard.html, EXECUTION_PLAN, PROGRESS); `scripts/analyze-audio.py` (BPM/downbeat/music-map, optional demucs stems) + `scripts/measure-motion.py` (frame-diff energy-arc QA).
- **`METHOD-FEEDBACK.md`** — 489-line field report from two real production runs; every law traces to a shipped defect. Example: "a 21-character line got 7 frames (0.23 s) of legibility — below the acquisition time alone — and it shipped to the user before anyone noticed."

No shipped React components — pure laws + scripts + templates. Dependency: Remotion official skills installed via `npx remotion skills add`.

## 3.2 Pipeline stages (the method)

Discovery (fixed 8-item SSOT intake — "never generate an artifact the user already has; every section asks 'do you have one?'") → **music & script analysis** (deterministic: BPM/downbeat/energy map + script-density feasibility) → style **elicitation** ("the style is the user's to specify; the agent's job is elicitation, not proposal"; render 2-3 style frames of the user's actual copy) → **visual storyboard gated as PIXELS** ("rendered still frames, one per beat… tile them into a contact sheet, and present *that* for approval"; "Motion-graphics work cannot be gated on prose") → frozen execution plan ("the context-blind test: could an agent with zero chat history build this from the plan + SSOT + board + craft skills alone?"; token estimate bands: simple 15-25k / component 25-45k / heavy 45-80k + 30k setup) → build (**timing contract first**; proof-scene hard gate; per-scene look-pass) → **QA in a FRESH context** ("an author reviewing its own work rubber-stamps"), incl. 0.75×/0.5× playback probes and a distraction test.

Key process laws: "Prose gates facts. Pixels gate aesthetics." — "Cheap pixels early beat expensive pixels late." — artifacts live on disk (`klik/` folder, PROGRESS.md resume ladder); "edits must land" (post-condition checks on every string replace — `str.replace` no-ops on miss); "rebuilds must be visibly new" (V1/V2 compositions, never in-place).

## 3.3 Techniques we LACK (this is the gold)

### A. Reading-hold arithmetic (§A12 + feedback 7.1)
```
MIN_LEGIBLE_HOLD = max(0.70s, 0.25s + characters ÷ 17)
comprehension target (hero lines read cold): 0.3s × words + 1.5s
```
"0.25 s = visual acquisition (saccade + fixation ≈ simple reaction time); 17 chars/s = Netflix adult-English subtitle standard." "Hold = FULLY legible: reveal and exit frames do not count; typed-out text counts from typing START." "**Budget PER LINE, not per scene** — a scene can pass its total while lines inside it fail in both directions; that exact bug shipped." "**Feasibility at discovery: Σ min-holds vs duration is day-one arithmetic**" (a 667f script against a 600f spec was discovered only after the whole piece was animated). **We have voice-clock word times but no on-screen-text hold law — this should become a review.mjs check.**
Plus: `v_crit = height_px × fps ÷ k` (k≈1.5-2.0) for text read in motion; hard ceilings ~1200px/s, rotation ±15° while reading (±45° display-only); **rotation dwell tax `DWELL × (1 + |θ| ÷ 90)`** — ×1.33 at 30°, ×1.50 at 45°. SPEED-READ device grammar measured off Honda "Keep Up": base 4f/word @25fps, sentence-end holds 12-18f (3-4.5× base), ratchet 5→4→3f bursting to 2f, ~5.9 words/sec — "the long hold IS the punctuation".

### B. `scripts/measure-motion.py` — measured energy-arc QA (162 lines, stdlib+ffmpeg)
Frame-diffs the rendered MP4 into an actual energy curve:
```python
cmd = ["ffmpeg","-i",path,"-vf","tblend=all_mode=difference,scale=320:180,signalstats,"
       "metadata=mode=print:key=lavfi.signalstats.YAVG:file=-","-f","null","-"]
```
Then: rest ratio vs **floor-relative threshold `p10 + 0.35·(p90−p10)`** ("textural treatments (grain/boil grounds) elevate the energy floor — rest is measured against the baseline (p10), never against zero"), event/rest contrast `(p90−p10)/p50`, with `--map` a per-bar Pearson correlation against the designed energy tier curve + per-tier mean monotonicity, and an ASCII sparkline. **This is the direct upgrade path for our frozen-time detection**: ours is a binary "no movement over N seconds" check; theirs measures the piece's whole event/rest shape and validates it against the designed arc (§A18). Also §A6: "40–60% of the piece's duration is holds… below ~40% the piece is churn; above ~60% it stalls" — a target band we've never quantified.

### C. Device ledger / anti-repetition (§A14 + feedback 4.7b)
"Keep a ledger of every device in play — reveal type, transition, camera signature, supporting elements… **No device is reused unvaried.** Used twice it's a motif; used everywhere it's a tic." "High-contrast inversion devices strobe past TWO back-to-back repetitions." "**Parameterising is not varying** — variants were added but every call site passed explicit overrides that replaced the profile. Verify the variation **reaches the render**: compare frames, not parameters." `lint-motion.mjs` has a heuristic: same component + identical props at 3+ call sites → flag. **Our one-guest-per-beat fusion prevents style repetition but nothing tracks device (reveal/transition) repetition across beats.**

### D. Boundary law (§A15) — transitions continue, never reset
"The failing pattern is **exit → gap → entrance**… it reads as two edits with a hole between them." Techniques (render-proven): "overrun the outgoing wipe a few frames past the cut and paint it *on top of* the successor (JSX paint order)"; "complete an inversion exactly AT the cut into a same-colour ground"; "persist the transition's shape as the next scene's compositional anchor"; implementation: "render scenes through one `renderScene(name, localFrame)` function so the outgoing scene can be drawn PAST its window (`local + SCENE_LEN`)". "**Convergence must resolve to ZERO** — collapsing to 28% left an illegible smudge." "**Exits are performed by ELEMENTS, never by the frame** — a transform on the scene container reads as an edit effect"; each device exits "in its own voice: run backwards (backspace, un-draw, retrace) or one step too far". "The incoming attractor exists AT the cut — within ~2f of any cut, something of the incoming scene is on stage."

### E. The inertia law for type (`kinetic-type.md`) — three phases, F=ma
1. LAUNCH — drag: base accelerates, mass above lags → lean backward ∝ acceleration, decays ~2.5f.
2. CRUISE — upright, no deformation. "**The motion profile must be a trapezoid** (ramp → cruise → hard stop): an eased arrival spends the momentum before the stop and leaves nothing to whip."
3. ARREST — velocity-seeded ring-down:
```ts
// θ(t) = A·e^(−t/τ)·sin(ω_d·t)   — ω_d ≈ 0.55 rad/f (period ~11f), τ ≈ 7f
// PEAK ∝ ARRIVAL SPEED: peakSkew = min(24°, 2.3·√v) · peakStretch = min(0.24, 0.021·√v)
```
"Failed models, kept as warnings: displacement-seeded ('jump to max angle') and lean-while-moving ('sprinter lean' — models an accelerating body, not a cruising one)." **This is a complete, physical alternative to our spring-settle entrance vocabulary, and it's parameterized by arrival velocity — variance for free.**

### F. The painted cursive system (`kinetic-type.md`) — construction, not revelation
"Break each letter into its **ductus**… letters CONNECTED exit-to-entry so the pen never lifts inside the word; the deferred strokes (i-dot, t-cross) draw AFTER the word completes." "Catmull-Rom the skeletons into dense polylines." "Line weight is the pressure model — never constant: render each stroke as a **ribbon** (offset ±width/2 along the normal): `w = wMin + (wMax−wMin) × downwardComponent` — downstrokes thick, upstrokes thin, tapered over the first/last ~30px of arc." "The brush draws at constant px/f speed… **Mid-frames must be real partial letterforms** — a cursive `n` is a single leg before its arch." Failed models kept: outline dash-trace (graffiti), clipPath-stencil zigzag, constant-width polylines. **Direct upgrade for our crosshatch/sketchbook animate styles and InkStroke fusion guest.**

### G. True morph system — fluid typography
"opentype.js loads the TTF, glyph outlines flatten to polylines (14 samples/curve)… **Canonicalize** every contour: resample to a fixed N (96) points by arc length · force clockwise winding · rotate the index so point 0 is the topmost — this stops morphs twisting… Morph = lerp the point sets… **Holes**: pair the inner contour with a sub-pixel degenerate ring (r ≈ 0.01) at the target's centre (r = 1 leaves a visible dot — render-found)."

### H. Music→motion as data + recipes (`music-motion.md`, `analyze-audio.py`)
`analyze-audio.py` (542 lines, stdlib+ffmpeg, optional demucs): BPM by "autocorrelation + whole-track grid-alignment refinement" ("tempo error is cumulative, so the tail disambiguates decisively — scores 0.230 vs 0.039"), first downbeat, `energy_tier_per_bar` ("111222155543…"), music map per section (tier, spectral lead, attack/sustain), per-source rhythm patterns on a 16th-note grid, and JSON `events` (kick/snare/hats/vocals/bass frame lists) + `levels` (per-frame 0-1 per source). Verified helpers:
```ts
export const hitPulse = (events, frame, decay=3.5, window=18) => { /* binary-search latest ≤ frame; return Math.exp(-(frame-best)/decay) */ };
export const levelAt = (levels, frame, smooth=4) => { /* ±4f box average */ };
export const everyNth = (ev, n, off=0) => ev.filter((_, i) => i % n === off);
/** THE INTEGRAL LAW: pos = frame × rate(frame) JUMPS by frame × Δrate (measured 733° in ONE frame) */
export const rateIntegral = (base, gain) => { /* accumulate a += base + gain*heatAt(f) per frame */ };
```
Mappings table: kick → squash-pop `scale(1+0.05p, 1+0.10p)` + seeded screen-shake ±3px·p, decay 4; snare → `hitPulse(snare, frame−3)` echo at ≤60% kick amplitude ("the 3f lag makes it an echo, not a competitor"); hats → `everyNth(hats,2)` shimmer ("never every hat — mickey-mousing"); vocals → glow on the copy; bass → blob scale/vignette ("weight, not flashes"); tier → density. ADSR law (§A16): "sharp transient (<30ms) earns a near-vertical burst… soft swell (>90ms) earns a long anticipatory ramp with no overshoot. A snap move on a swell reads as bad sync even when the frame numbers land on the grid." Discipline: "Match each parameter to its signal's TIME-SCALE. Transient pulses → frame-scale; levels → word/beat-scale; bar tiers → density; **temperature/palette → SECTION-scale only** (a color that flickers with bar-to-bar tier changes reads as noise)." **We have a procedural synth score and beat-cue plans, but no measured analysis of imported tracks and no level/event data driving visuals.**

### I. Camera craft (`klik-cam`) — the C0 dial + grammar
C0 dial: 1 Locked / 2 Anchored (≤0.5% creep) / 3 Motivated (default) / 4 Flowing / 5 Perpetual. Laws: **anti-AI-camera** "never a pure `scale()`/truck move — always pair zoom with a rotation axis or lateral vector; resolve every move into residual drift, never a dead stop"; **monotone-spline poses** (no camera bounce); **shutter blur at velocity peaks** (2-5f, landing sharp); **focus discipline** — "the focal plane sits on the words… a camera push that ramps focusZ off the type plane shipped 2.25px of permanent blur on a hero line"; **3D hygiene** — "no filter OR opacity<1 on the space or its ancestors — either flattens the perspective" (render-verified: CameraMotionBlur's fractional-opacity samples vanish preserve-3d planes); **CAM-6 sidechain** — "elements > composition > music; the camera claims only the residual": `duckEnv(f) = max over k∈0..30 of elementMotion(f−k)·exp(−k/12)`, `DIAL_GAIN=[—,0,0.18,0.5,1.0,1.5]`, margin cap `|x|≤55px, |y|≤40px`, "complementary axes: elements own the frame plane, the camera's residual lives in depth/roll". **Motivation timing** (CAM-4): "the CAUSE of a camera move must be on screen ~10–14f before the move begins… reaction delay is camera grammar." Preset A Hold & Glide: "scenes live side by side in world space (2400px apart); the camera travel IS the scene change; the glide STARTS T frames before the next section's boundary and LANDS exactly on its downbeat; `T = clamp(56 − 6·tier, 24, 50)`; poses quantized (zoom ∈ {0,80,150} · y ∈ {−45,0,45} · roll ∈ {−0.9°,0,0.9°})". Preset C element-follow: "the follow target is where the focal will LAND, not where it is… lookahead ~14f into the future (the future is data)… camera x = trailing exponential average `Σ target(f−k)·e^(−k/10)`, k≤36" + **the governor**: "an event may only start a travel phrase if the previous phrase has landed" + "sustained camera speed cap ~13px/f at 1080p".

### J. `references/effects.md` — 12 render-verified finish recipes with parameter bands
- Grain: `seed = Math.floor(frame/2) % 3` (fresh every 2f, 3-pose loop); the three post-turbulence lines are load-bearing ("raw turbulence is RGB confetti (desaturate), mid-gray mush (contrast transfer slope 2.6 intercept −0.8), and a noisy alpha that makes it vanish (feFuncA forces solid)"). "Cost warning (measured): stepped full-frame grain destroys temporal compression — a 33s 1080p piece jumped ~6× in file size; grain-heavy boil work needs a delivery CRF/bitrate plan." **← we hit this exact problem with GIF previews; now we know it hits MP4 delivery too.**
- Line boil: 3 poses held 3f (`floor(frame/3)%3`), `feDisplacementMap scale 1.5-4`; **letterform boil variant**: `baseFrequency 0.003 0.0062 · numOctaves 1 · scale ~6.5`, 4 cels, filter region `x −18% w 136% · y −36% h 172%`; failed model: "continuously drifting the field reads as jagged jitter, not life. Never interpolate between cels."
- **One-clock rule**: "when a piece commits to a boil, EVERY textural layer shares one held step — type-warp cels, grain plates, ambient color fields all snap on the same `floor(f/N)`… frame-diff within a step must be pixel-identical (measured 0.0)". **Hybrid rates ARE the look: ground world on 3s (~10fps) under element motion at full frame rate.**
- Stop-motion: "sample AFTER easing — compute full thin-peak motion, then quantize the clock" + fresh micro-offset per held pose ("the hand that repositioned the puppet").
- Riso: misregistration "static + seeded, never animated (it's a printing error, not a wobble)"; "inks must be mid-value and translucent — two dark saturated inks multiply to near-black sludge; keep the top ink at 0.6-0.8 opacity".
- Cutout: hard shadow "0–1px blur (a soft blur breaks the illusion)"; die-cut sticker: stacked `<use>` with fat stroke, `strokeLinejoin="round"` mandatory.
- Inset wipe (§11) as the plain reveal primitive: "both halves of a boundary run the **same expression in opposite directions**" — `close = interpolate(t,[0,1],[0,100])` on outgoing / `open = [100,0]` on incoming.
- Gradient-field ground: "5–7 blobs, r 330–470 at 1080-base, base opacity 0.4–0.6; type is INK with NO glow… drift ±88/66px (periods ~71/83f) — computed smooth, SAMPLED on the boil step."

### K. Composition models (`references/layout.md`) — five, frame-verified against a 7-title canon
**Fixed anchor** ("the anchor is a feature of the PLATE, not the frame centre — Honda sets the word's baseline exactly on the horizon at ~48.5% frame height"; cap height ~10% of active height). **Accretion artboard** — copy accumulates, nothing exits; **the reading pocket**: "a fixed region in screen space where the active run is always delivered; the camera moves so the pocket stays put while the canvas travels beneath it"; "the camera counter-rotates so the active baseline reads near-horizontal in the pocket… a run authored at 45° on the canvas but presented at ~5° in the pocket pays ~6%, not 50%"; **the demotion ladder**: "on the next run's arrival, every existing run steps down one tier: hero → secondary → caption/texture; each step is scale ÷ φ; caption tier is texture — NOT budgeted for reading time"; "adjacent runs at different angles must differ in colour role… two adjacent runs in the same ink at different angles is the ambiguity bug"; Brazil: "~175 settle/move cycles in 152s — a new composition roughly every 0.87s". **Growing line** ("the anchor does not re-centre as the line grows — optical re-centring on every word is the tell that kills it"). **World-space type** ("occlusion is the tell that sells it — scene geometry must pass in front of the type"; "grade-match, never pure white"; "DOF applies to type"). **Annotation layer** ("1px hairlines… it counts and measures things that are actually there… annotation that annotates nothing is decoration").

### L. Frame laws (§A10-A11) — numbers we lack
Eye pull order: "**motion > size > contrast > saturation/glow > position** — a small moving thing outranks a huge static one". Type scale on the golden ratio ×1.618 (step to ×1.25-1.414 only for dense frames); "two sizes that are close-but-different read as a mistake"; leading 1.6× on reading text, 0.95-1.1 on stacked display. Margins: "nothing readable within 5% of a frame edge (96px at 1920-base); hero 120-160px; elements either respect the margin or bleed decisively". Optical center 45-48% height. 60/30/10 color weight. Hierarchy in time: "the boss enters FIRST and exits LAST; support follows with staged delays (secondary +0.3-0.5s, tertiary +0.5-1s), smaller displacement (boss 40-60px · secondary 20-30px · tertiary 10-15px), shorter holds (boss 3-5s…)". Squint test as the gate.

### M. Motion semantics alignment table (§A17)
"| Urgency | fast, direct paths | short (<0.5s) | alerts…| | Authority | slow, centered motion | long holds (>3s) |…| Precision | grid-aligned, constant velocity | quantized, dead stops | specs, data, terminals |". Plus the licensed **PRECISION device** (the one legal linear motion): "a *driven* system moves at constant speed and stops dead… linear travel with a bouncy arrival is physically incoherent… never in the same shot as inertia devices."

### N. Timing-contract-first build discipline (`build-qa.md`)
"**The timing contract comes first:** before any scene, write `timeline.ts` (+ a `copyTiming.ts` mirror) with every line's legible window computed from §A12's reading law, device assignments per scene, and a lint check that FAILS on any violated window. Scenes are then written to satisfy the contract — cue-level timing never lives only in scene code." Proof gate: "the agreed proof scene + signature transition… **Nothing else gets built until they approve.**" QA extra probes: "re-watch at 0.75× and 0.5× playback — pacing defects surface at reduced speed"; "**the distraction test**: after the watch-down, write the copy from memory… if you remember the animation but not the words, motion is too dominant."

### O. Copy-discipline inventory (§A8)
"Only the user's words go on screen… The inventory — the specific things that get invented: eyebrow labels above a line (`SELECTED WORK`, `THE PROCESS`) · scene numbering (`01 / 02 / 03`) · version stamps · timecode and frame HUDs · atmospheric metadata strips (`LIS 14:23 · 18°C`, `35mm · f/1.4 · ISO 400`) · a middle dot gluing invented fragments… **The furniture counts too, even carrying no words:** decorative status dots, crosshair and hairline grids that organise nothing, and product UI faked out of rectangles." (Each of these shipped as a real defect in their runs.) Good checklist extension for our verbatim-script law.

## 3.4 3D/cutaway relevance — HIGH (klik-cam + layout)
- **2.5D rig convention** (camera-music.md): one `perspective: 1100` wrapper (NO filters ever) → THE SPACE div with `preserve-3d` carrying exactly one camera transform `translate3d(−x,−y,z) rotateZ(−rz) rotateY(ry) rotateX(rx)` → planes at `translateZ(−380/0/+240)` with per-plane DOF blur (2px/0/1px). Outer-wrapper `scale()` = FOV zoom (post-projection).
- **Dolly-zoom formula**: "`z: 0→c` while outer scale compensates `s = (P − c)/P` (P = perspective, 1100): focal plane holds size, background crawls — the strongest move in the kit, one per piece, on the biggest narrative turn."
- **Move vocabulary table** (camera-moves.md): truck/pedestal/dolly/zoom/pan (≤6°)/tilt (≤5°, "never tilt across crisp focal copy")/roll/crane ("`y` down→up eased WITH compensating `rx` so the focal stays framed")/whip ("this is a TRANSITION, not a shot; A14 ledger — twice max")/rack focus ("crossfade per-plane DOF blurs over 12–20f; it must LAND on the narrative target"). "Pan produces NO parallax; translation separates the planes. In 2.5D, big 'pans' are almost always trucks." "Zoom vs dolly: zoom magnifies everything equally; a dolly changes the *relationships* — this difference is the whole reason to build in 2.5D."
- **World-space type integration checklist** (layout.md) — for cutaway labels standing in the 3D scene: occlusion by scene geometry, grade-match not pure white, atmospheric haze with distance, DOF applies.
- **The flattening trap**: any grouping property (filter, opacity<1, and `CameraMotionBlur`'s fractional-opacity samples) on the 3D space or ancestors collapses preserve-3d. For our Three.js work the DOM-side trap doesn't apply, but the "blur per plane, never on the space" law does, and the velocity-smear math (`smear = clamp((speed−3)·0.35, 0, 4.5)px`) is portable.
- **CAM-6 yields-to-elements + focusZ-on-the-copy** is exactly the cutaway grammar: the camera follows *which layer is being explained*, and everything else stays soft.

## 3.5 Verdict
- **ADOPT-EXACTLY-WHAT** (map to our skills):
  - `measure-motion.py` → upgrade review.mjs/QA in BOTH engines (energy curve, floor-relative rest ratio 40-60% band, arc correlation, sparkline). Port as `research` → `animate/scripts/measure-motion.py` + Remotion QA.
  - MIN_LEGIBLE_HOLD + per-line budgets + Σ feasibility + rotation tax + v_crit → a new **text-hold check in review.mjs** and a craft law in make-on-script/make-minimal-reel SKILL.md (voice-clock already gives us the word times; multiply by the reading law).
  - Inertia-law three-phase type entrance (velocity-seeded ring-down) + painted-ductus cursive + canonicalized morph → `remotion/src/lib/fusion.tsx` new guests + animate-engine crosshatch/sketchbook upgrade.
  - klik-cam C0 dial, camera vocabulary table, dolly-zoom formula, sidechain yields-to-elements, focus-on-words → **the backbone of the new Three.js 3D-cutaway skill's camera section**.
  - Device ledger + boundary law (renderScene past-window painting, exits by elements, shared-origin wipes) → craft laws across all tracks; lint-style check could live in review.
  - `analyze-audio.py` (BPM/downbeat/events/levels) + hitPulse/levelAt/rateIntegral + ADSR law → our synth-score cue planner (beat grid from measured audio, not assumed).
  - effects.md recipes (one-clock rule, boil params, riso ink translucency, grain compression warning) → animate style skills (we already have riso/cut-paper; their numbers sharpen them).
  - A8 copy-inventory list, distraction test, 0.75×/0.5× speed probes, timing-contract-first, fresh-context QA → process upgrades for make-on-script.
- **ALREADY-HAVE**: determinism law (A0 ≈ our frame-pure + seeded RNG + byte-identical check — we even verify byte-identity, they only lint), look-at-frames-before-showing (A9 ≈ our VLM frame QA + review.mjs), beat-grid math (B1 ≈ our cue plan, but theirs is measured from audio), typewriter string slicing, copy-verbatim intake, contact-sheet review, "render your own output before the user sees it".
- **REJECT**: Fable-5/Opus model-split personas and token-band estimating (Claude-session-specific, not applicable to our pipeline); 30fps default (our 15fps is a house style); the SSOT 8-section intake is heavier than our one-confirmation-round script intake — keep ours for shorts, consider SSOT only if we ever do 60s+ client work with brand guides.

---

# 4. Family comparison (all 18 repos, top-level README/SKILL skim)

The 18 repos in `research/external/` are one family with three genera. **(1) Agent-skill systems for code-driven motion graphics** — the majority: `charlie947_motion-graphics-skills` (14 skills, "launch-grade motion graphics… Every frame is code"), `imMamdouhaboammar_motion-graphics-skills` (53 skills + 7 demo films with original audio), `bangtutorial_bang-motion` (single `index.html` deliverables that "play like video, not slides", 6 explainer styles + AE bridge), `whaleyxbt_claude-motion` (motion rules with numbers + a review-loop skill + a pure-Python synth sound engine + a `sims/` three.js pipeline: "one HTML page per piece, `render(t)` pure function, frame-exact headless-Chromium capture, `beats.py` tempo/drop detection"), `howseen-ai_claude-motion-design` (pure-code HTML+Playwright+ffmpeg, "the whole film is one `seek(t)` function… beat-synced by construction, SFX placed by peak, −14 LUFS"), `Miftahul-Islam-Efaz_Motion-graphics-skill` (a director-style playbook: Canvas/SVG/Three.js/GSAP, word-level VO timing, −14 LUFS mixes), `Sunwood-ai-labs_hyperframes-motion-reel-skill` (HyperFrames/GSAP: "one paused GSAP timeline for choreography + a pure `render(t)` for generative layers", 120 BPM grid, code-generated sound, "deterministic rendering — seeded PRNG, no `Date.now()`/`Math.random()`"), `Boriwatopal` (Remotion brand promos), `t3knobox` (the klik craft-law system), `Barty-Bart_motion-graphics` (B-roll generation from a transcript: "each clip is one continuous shape that keeps morphing (pill → card → terminal → chart) and never cuts, with a cursor driving every change", transparent ProRes 4444 panels), `olegkupshukov_claude-resolve` (DaVinci Resolve Studio plugin rendering ProRes 4444 with alpha onto the timeline), `notivn_AIEV` (a full web dashboard: Claude Agent SDK drives HyperFrames scene engine + Remotion assembler, faster-whisper karaoke subtitles, 100+ SFX library, render queue). **(2) Curated prompt/case galleries**: `zhuyansen_awesome-opus-5.5-video` (1,465 X posts with 5k+ views, 375 with prompts, verbatim only), `mikenevermiss_motionpromptgallery` (a Next.js static site of pieces next to their prompts). **(3) Standalone tools**: `ginonave_Motion-Synthesizer` (the manual PixiJS editor above).

What the family shares: **frames as pure functions of time** (`useCurrentFrame()`/`seek(t)`/`render(t)` — determinism is the stated religion in at least four repos); **ffmpeg as the assembler** and headless Chromium as the rasterizer; **approval gates + look-at-real-frames review loops** before showing the user (contact sheets everywhere); **beat-grid timing derived from actual music analysis** (BPM/drop detection in whaleyxbt, Sunwood, t3knobox, howseen); "no After Effects, no stock, everything drawn in code" as the identity; and a strong current of *craft-as-law* — writing the taste rules down as machine-checkable or checklistable constraints (t3knobox most extreme: 18 laws, 33-item pre-flight, a linter; whaleyxbt: "Motion rules with numbers. Not 'make it smooth'").

**Where our house system is already ahead**: (a) **measured QA** — we loudness-normalize to a LUFS target with LRA/TP readouts, run frozen-time detection, and byte-compare frames for determinism; only t3knobox (measure-motion.py, floor-relative rest ratio, per-tier arc correlation) and whaleyxbt (self-review contact sheets, −14 LUFS mastering) approach that rigor, and none of them check determinism byte-identically. (b) **voice-is-the-clock** — Edge TTS + faster-whisper word times driving every cut and caption; AIEV and anything2explainer also transcribe, but most of the family is music-only or silent. (c) **word-exact captions** synced to measured word boundaries. (d) **style fusion** — one-guest-per-beat routing across 7+ looks in a single film; every family repo is one-look-per-project. (e) **delivery as GitHub Releases** with MP4 + docs; none of the 18 ship releases the way we do. (f) a **deliberate 15fps house style** vs their 30/60fps defaults — a taste position none of them take. Where the family is ahead of us: reference-video intake (Boriwatopal's `analyze_reference.sh`, t3knobox's segment-pass reference library), reading-hold arithmetic and the rest ratio (t3knobox only), camera craft vocabulary (t3knobox's klik-cam), dual-ratio rendering (Boriwatopal), SVG brand-logo ingestion (Boriwatopal), measured BPM/downbeat analysis of imported music (t3knobox/whaleyxbt/Sunwood), and per-piece generative 3D/sims pipelines (whaleyxbt `sims/` — three.js exploded-view engine example, ginonave's point-cloud system).

---

# 5. ADOPT list (one place, with exact source paths)

| # | What | Source file | Destination |
|---|---|---|---|
| 1 | Phase-propagation field motion (9 modes × phaseSpread, calcPhase + evalAnim) | `ginonave_Motion-Synthesizer/Motion-Synthesizer-v-07.html:812-837, 1304-1322` | fusion.tsx field guests / animate engine |
| 2 | 3D point-cloud kit: 9 primitives, 6 deformers, project3D, genTextMesh, farthestPointSample | same file `:393-718` | Three.js 3D-cutaway skill + canvas obj-mesh guest |
| 3 | Dual-ratio layout (useLayout/designScale + 2 Compositions) | `Boriwatopal…/assets/layout.ts`, `assets/Root.template.tsx`, `assets/Main.template.tsx` | all Remotion make-* tracks (optional 16:9) |
| 4 | SVG logo → per-path animation (svg_to_paths.mjs + SvgArt.tsx + characterStyle) | `Boriwatopal…/scripts/svg_to_paths.mjs`, `assets/components/SvgArt.tsx` | make-on-script brand guest |
| 5 | Reference-clip contact-sheet beat-map intake | `Boriwatopal…/scripts/analyze_reference.sh` | "make it like this video" pre-step |
| 6 | Scene-pattern timing table (16 patterns + numbers) | `Boriwatopal…/references/scene-patterns.md` | craft laws, make-minimal-reel / make-on-script |
| 7 | Remotion gotchas (filter-before-clip-path, fill-box, premountFor, pathLength=1, …) | `Boriwatopal…/references/verification-and-gotchas.md` | Remotion craft notes |
| 8 | MIN_LEGIBLE_HOLD + comprehension target + rotation tax + v_crit + per-line budgets | `t3knobox…/klik-anim/SKILL.md` §A12, `klik-remotion-method/METHOD-FEEDBACK.md` §7.1 | new review.mjs text-hold check + SKILL law |
| 9 | measure-motion.py (energy curve, floor-relative rest ratio 40-60%, arc correlation, sparkline) | `t3knobox…/klik-remotion-method/scripts/measure-motion.py` | review.mjs upgrade (both engines) |
| 10 | Inertia law (3-phase, velocity-seeded ring-down θ=A·e^(−t/τ)·sin(ω_d·t)) | `t3knobox…/klik-anim/references/kinetic-type.md` | fusion.tsx type entrances |
| 11 | Painted cursive ductus system (ribbon + pressure + deferred strokes) | same file | crosshatch/sketchbook animate styles, InkStroke |
| 12 | Canonicalized true morph (opentype.js → 96-pt contours → lerp → evenodd; holes r≈0.01) | same file | fusion.tsx morph guest |
| 13 | Camera dial C0 + move vocabulary + dolly-zoom `s=(P−c)/P` + sidechain + focus-on-words | `t3knobox…/klik-cam/SKILL.md`, `references/camera-moves.md`, `references/camera-music.md` | Three.js 3D-cutaway camera grammar |
| 14 | analyze-audio.py (BPM/downbeat/tiers/events/levels; demucs optional) + hitPulse/levelAt/rateIntegral + ADSR law | `t3knobox…/klik-remotion-method/scripts/analyze-audio.py`, `klik-anim/references/music-motion.md` | synth-score cue planner (measured beat grid) |
| 15 | Device ledger + boundary law (renderScene past-window, exits by elements, shared-origin) | `t3knobox…/klik-anim/SKILL.md` §A14/§A15 | craft laws all tracks |
| 16 | Effects recipes (one-clock rule, boil/letterform-boil params, riso ink translucency 0.6-0.8, grain ~6× file-size warning, inset-wipe shared expression) | `t3knobox…/klik-anim/references/effects.md` | animate style skills + delivery settings |
| 17 | Rest-ratio band 40-60% + energy arc shapes (§A6/§A18) | `t3knobox…/klik-anim/SKILL.md` | QA targets |
| 18 | Composition models (reading pocket, demotion ladder ÷φ, world-space occlusion checklist, speed-read grammar) | `t3knobox…/klik-anim/references/layout.md` | layout options for kinetic pieces |
| 19 | Process: timing-contract-first, fresh-context QA, distraction test, 0.75×/0.5× probes, edits-must-land postconditions | `t3knobox…/klik-remotion-method/references/build-qa.md` | make-on-script process |
| 20 | A8 invented-copy inventory (eyebrow labels, scene numbering, metadata strips, furniture) | `t3knobox…/klik-anim/SKILL.md` §A8 | verbatim-script checklist extension |
| 21 | Motion-semantics alignment table + PRECISION device grammar | `t3knobox…/klik-anim/references/kinetic-type.md` | motion selection in fusion routing |
| 22 | Motion trails (eval-at-past-t, taper/dash) | `ginonave…/Motion-Synthesizer-v-07.html:368, 945-970` | animate engine primitive |
| 23 | 2.5D rig + "no grouping property on the 3D space" + per-plane velocity smear | `t3knobox…/klik-cam/references/camera-music.md` | 3D-cutaway + any DOM-3D scenes |
