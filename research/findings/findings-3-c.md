# Research Findings — Batch C (Task 3-c)

Repos analyzed (work-tree only, .git skipped):
1. `Sunwood-ai-labs_hyperframes-motion-reel-skill` (~15 meaningful files)
2. `Vincentwei1021_anything2explainer` (209 files — the big one, read in depth)
3. `zhuyansen_awesome-opus-5.5-video` (21 files — an index, not a prompt corpus)
4. `olegkupshukov_claude-resolve` (~70 files)

Base path for all excerpts: `/home/z/my-project/shorts-creator/research/external/`

---

# 1. Sunwood-ai-labs/hyperframes-motion-reel-skill

## 1.1 Architecture

A Claude Code skill that produces showreel-grade motion graphics with **HyperFrames** (npm `hyperframes`, Apache-2.0) instead of Remotion — explicitly to avoid Remotion's Company License. Stack: HTML + GSAP 3 (paused timeline) + SVG + Canvas 2D + CSS 3D; rendered by the HyperFrames CLI (Chrome) at default **120 BPM / 60 FPS / 1920×1080**, MP4 H.264.

Key: a **two-layer animation architecture** (from `SKILL.md` "ANIMATION ARCHITECTURE"):

```js
// 1. GSAP timeline (choreography layer)
const tl = gsap.timeline({ paused: true });
tl.fromTo("#title", { yPercent: 110 }, { yPercent: 0, duration: b(0.5), ease: "expo.out" }, b(4));
window.__timelines["main"] = tl;   // key must match root data-composition-id

// 2. time→state pure function (generative layer): ONE ease:"none" proxy tween
const clock = { t: 0 };
tl.to(clock, { t: CFG.DURATION_SEC, duration: CFG.DURATION_SEC, ease: "none",
  onUpdate: () => render(clock.t) }, 0);
```
`render(t)` keeps no state from previous frames → any frame seek-safe. This is their equivalent of our "every frame a pure function of frame number" law, achieved with GSAP by registering exactly one paused timeline and driving a clock proxy.

## 1.2 Pipeline stages (10-step workflow, `SKILL.md` WORKFLOW)

1. Concept in one sentence → 2. Design system written to `DESIGN.md` → 3. Timeline in **seconds + beats + frames** (`b(8) = 4.0s = f240`) → 4. Motion design naming HyperFrames blueprints/rules per scene → 5. Sound design → 6. Implementation (`npx hyperframes init` → DESIGN.md → generate-audio.mjs → HTML/JS) → 7. `lint` then `check` until **0 findings** (lint/runtime/layout/motion/contrast) → 8. `snapshot --at <scene-peak>` for every scene, reviewed as images → 9. `render --fps 60` → 10. `ffprobe` + `ffmpeg -ss <t> -frames:v 1` frame extraction from the **final MP4** to compare against the snapshots.

## 1.3 Techniques we LACK (concrete)

- **Beat grid as the only clock.** `SKILL.md`: "シーン境界・インパクト・カットはすべて `b(拍数)` で書く（秒の直書き禁止）" — all scene boundaries/impacts/cuts must be written as `b(n)`, raw seconds forbidden. Derived values: `TOTAL_FRAMES = DURATION_SEC × FPS`, `SEC_PER_BEAT = 60/BPM` (0.5s = 30 frames at 120 BPM). Cuts align to 1/½/¼ beat (0.5/0.25/0.125s). Audio generator reads **the same beat table** so picture and sound are frame-aligned. *We have frame-purity but no beat grid; our SFX cue tables could gain a `beat(n)` helper + a single shared beat table consumed by both picture and score.*
- **Anticipation & follow-through as named laws.** MOTION PRINCIPLES bans plain fadeIn chains and lists: overshoot (`back.out(2)`), **anticipation** (small pull in the reverse direction before `expo.out`), **follow-through** (child elements delayed a few frames / `elastic.out`), stagger `from: "center"|"edges"` (random must be seeded), spring `elastic.out(1, 0.4)`, masking via `clipPath inset()/polygon()` tweens. *We have "no linear moves (named easings)" but not anticipation/follow-through as named move types.*
- **Motion blur budgeting**: element-level `motion-blur` registry component (visible in preview) + render-time whole-frame `motionBlur` option, "only on fast 1–3 beat moves; never on readable text, slow moves, fades."
- **Morphing transitions law** (TRANSITIONS): "前のシーンの要素を次のシーンへ変形させてください … 文字 → ライン → グラフ → 3Dグリッド → トンネル → ロゴ — **同じ形状を別の意味へ変換するトランジション**" (same shape, different meaning; crossfades banned). Scenes sharing surviving elements are ONE composition with internal phase divs (keep tweening the same element); only hard cuts become sub-compositions.
- **Typography as footage**: giant/overflow/decompose/mask/depth-placement/letter-spacing changes/mirror/rotate/perspective/scan/stretch/crop; intentional overflow flagged with `data-layout-bleed="true"` so layout audits can distinguish intent.
- **Determinism gotchas we don't have documented** (GSAP-specific but the *class* of bug matters): "fromTo の from 側だけに書いたプロパティ（例：{opacity:1, scale:0} → {scale:1}）は、並列ワーカーの途中シークでは適用されず要素が消える … from に書いたプロパティは必ず to にも同じ値で書く" — properties written only on the `from` side vanish under parallel-worker mid-seeks; must repeat on both sides. Also: CSS must live in the inline `<style>` (external stylesheet `font-family` escapes font embedding → correct in snapshot, wrong in final render), and **"snapshot and render can differ — after rendering, extract peak frames from the production MP4 with `ffmpeg -ss` and compare"**.
- **Seeded PRNG recipe** (portable):
```js
function mulberry32(seed) { return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const rand = (i, salt = 0) => mulberry32(i * 9973 + salt)();   // deterministic from index
```
Particle initial values generated once into arrays; `render(t)` never draws new randoms.
- **Code-generated sound with Node built-ins only** (AUDIO): kick = fast frequency-descending sine; hi-hat = high-frequency noise; impact = low sine + noise + short decay; plus rise/sub/UI beeps; written to WAV via Node stdlib (`scripts/generate-audio.mjs` → `assets/audio/score.wav`); `<audio id data-start data-duration data-track-index data-volume>` must have an `id` or it's silently unmixed; fades/ducking via `data-automation` volume lanes; "carve" mixing when voice is present (BGM stays out of the voice's band/volume). *We have a procedural synth score — the "carve" concept (band-aware ducking for VO) is the new bit.*
- **Visual-quality ban list** (worth pinning in our craft laws): PowerPoint-ish animation, text simply flowing L→R, fadeIn chains, meaningless gradients, SaaS-ad template look, excessive rounded-card UI, same speed in all scenes, too-small text (headline 60px+, body 20px+, 90px+ for social feeds), center-only composition, fear-of-whitespace info cramming, theme-unrelated effects.

## 1.4 Reusable assets

- `SKILL.md` — full creative brief + parameters table + rules (the single densest file; JP with EN README mirror).
- `README.md` / `docs/guide/architecture.md` — EN distillation (two layers, beat grid, rendering-method table, sound, determinism).
- `DESIGN.md` template fields: Main/Accent/Background color, Typography (display+data faces), Grid, Shape language, **Motion language** (e.g. "Fast / mechanical / elastic"), **Camera language** (e.g. "Aggressive push-in + depth transition") — our palette-lock could grow `motion language` + `camera language` rows.
- Rendering-method routing table: Typography/UI → CSS transforms+clipPath; Lines/graphs → SVG `strokeDasharray/dashoffset` (+`getTotalLength()`); 3D → CSS 3D (`perspective/z/rotationX/Y/preserve-3d`); Particles → one Canvas 2D from `render(t)`; Motion blur → registry component or render option.
- Workflow ritual: `check` must reach **0 findings** including a *contrast* audit; snapshot review of every scene peak; final-MP4 frame extraction vs snapshot.

## 1.5 3D / cutaway relevance

CSS 3D only (no Three.js): "3D — 可能なものは CSS 3D で構築 … トンネル、カード空間、タイポグラフィ空間。`rules/3d-camera-flight.md`, `rules/3d-text-depth-layers.md`, `blueprints/camera-journey.md`" — the *rule names* (camera flight, text depth layers, camera journey) are a useful vocabulary for our Three.js cutaway skill's camera choreography; the actual rule files are not in this repo (they live in separate `/hyperframes-*` skills). A registry of named looks (`npx hyperframes catalog --query "<look>"`) is a pattern worth noting: searchable effect library (glitch, grain, CRT, confetti…).

## 1.6 Verdict

**ADOPT (mapped):** beat-grid `b(n)` discipline + shared beat table for picture & score → all `/make-*` SFX planning (make-minimal-reel, make-on-script); anticipation/follow-through/follow-through-delay into our named-easings law → fusion.tsx / animate styles; morph-transition law ("same shape, new meaning") as a fusion/cutaway transition rule → make-on-script; DESIGN.md fields (motion language, camera language) → our brief/palette lock docs; "extract peak frames from final MP4 and compare to snapshot" as an extra QA step → review.mjs; mulberry32 `rand(i, salt)` (we already have deterministic RNG — theirs is index-addressed, nice for arrays).
**ALREADY-HAVE:** frame-pure rendering, determinism discipline, procedural synth score, measured QA loop, palette-lock (≈DESIGN.md), lint/check ritual ≈ our review.mjs.
**REJECT:** adopting HyperFrames/GSAP as an engine (we're committed to Remotion + canvas-in-code; GSAP's paused-timeline pattern is only relevant if we ever want DOM-choreography animations).

---

# 2. Vincentwei1021/anything2explainer — the flagship repo

A complete, industrial method for turning **any topic** into a 2–8 min narrated black-canvas motion-graphics explainer (Remotion 4 + React 19, 1280×720@30fps). "It is not a CLI. What ships here is the whole method an AI coding agent needs to finish the film" (README). PolyForm Noncommercial license — port *rules and techniques*, not code wholesale.

## 2.1 Architecture

- **Compilable Remotion template** (`template/`): `src/common/` (StarField, Fog, DotFieldBg, Glitch, easing, Subtitle, ProgressBar, Footage), `src/ui.tsx` (496-line primitive library + palette), `src/fx.tsx` (242-line light/set-piece/camera library), `src/overlay/` (title, chapter cards, HUD, process rail, ending), `src/config.ts`, `scripts/` (tts_build.py, render_storyboard.py, preview.sh, still.sh, test_render.sh, render.sh, sheet.py, frame_metrics.py, motion_check.py, selfcheck.py).
- Every shot is a component file `src/shots/Gn/SCxx.tsx`; each build group G1–Gn exports `SHOTS_Gn: ShotDef[]` ({id, from, to, Comp, layer?}) + `BG_Gn` backdrop overrides. `const N = useCurrentFrame() + F0`; all animation pure functions of N; randomness only via seeded `rnd`.
- Persistent layer stack (style-guide.md §1): black base < backdrop (Fog+StarField or DotFieldBg) < footage < overlay < shots < ending blackout < progress bar < aboveBar shots < subtitles.

## 2.2 Pipeline stages (SKILL.md "流程", 0–8, with 4 user checkpoints)

Stage 0 new project → Stage 1 **research agent** (parallel, `reference/research-brief.md` prompt; output `research/调研.md` with exec summary, situation/problem, origin, mechanism, boundaries, controversies, real cases & failure modes, **numbers-and-metaphors list with credibility stars (★★★ primary paper / ★★ official blog / ★ secondary) + felt-scale conversions for each number**, terminology, unverified list; every fact with URL) → Stage 2 narration + timeline (main session; read `narration-guidance.md` 13 principles first) → **checkpoint 2** narration sign-off → **checkpoint 3** TTS preference → `tts_build.py` (voice wav + timeline.ts + subs.ts + timeline.md) → Stage 3 storyboard (`storyboard_src.md` with `{S12.from-8}` `{S12.c3}` `{C2}` tokens → `render_storyboard.py` → 分镜表.md) → Stage 4 overlay + semantic icons → Stage 5a **build G1 only → `preview.sh 30` → checkpoint 4 (first-30-seconds sample)** → Stage 5b parallel build G2–G8 (one agent per group, 5–7 shots each) → Stage 6 render + contact sheet + frame_metrics → Stage 7 QC per chapter → fix agents → v2 → re-verify agents → v3 + final check → Stage 8 delivery notes + write lessons back.

**Duration-driven scaling table** (SKILL.md confirmation point 1):
| Length | zh chars / en words | lines≈shots | chapters | build groups | wall clock |
|---|---|---|---|---|---|
| 2–3 min | 650–880 / 280–420 | 24–32 | 1 (no chapter cards) | 4–6 | ≈1 h |
| 3–5 min (reference tier) | 1100–1400 / 420–700 | 40–50 | 3–4 (each ≥60 s) | 8 | ≈2 h |
| 5–8 min | 1650–2200 / 700–1150 | 60–80 | 4–6 | 10–14 | ≈2–3 h |

**Multi-agent dispatch protocol** (`reference/prompts.md` + lessons): dispatch in waves of 4 (pane/fork limits are machine-wide — `ListAgents` before dispatch, `TaskStop` to release finished agents); "one agent, one heavy job" (build 5–7 shots / QC one chapter / fix 1–2 groups — image-heavy agents given a second heavy job die ~30% of the time with "input too long"); agents that die from API errors can be woken with one SendMessage — **check disk before re-dispatching** (work is usually further along than the last message); "append as you go" is a hard requirement for QC agents (one ran 46 min with 0 bytes on disk); watchdog = check each group's index.ts/BUILD_NOTES mtime every 30–40 min; adjudicate builder deviations in one sentence and record them.

## 2.3 Techniques we LACK (the gold)

### A. Timing system (the "stay budget")
- **Paragraph = shot**: a blank line in `narration.txt` is a paragraph = one shot of 2–4 sentences. `tts_build.py`: intra-paragraph sentence gap `GAP=10` frames ("one breath, not a pause"), paragraph end `+PARA_GAP=20` (total 30 ≈ 1 s), `CHAPTER_GAP=45`, `LEAD=40`, `TAIL=90`. **The finished film is deliberately 5–8% longer than raw speech** — that margin IS the hold budget.
- `## gap 15–30` directive inserts extra hold after a sentence whose last subtitle block is <45 frames (22f entrance + 8f exit can't fit a 30f hold); tts_build lists these ¶ sentences automatically.
- Sentence-level TTS **cache** (`audio/cache/` keyed by engine params + model file fingerprint path|size|mtime|sha1-head) — change one line, resynthesize only that line, re-run in seconds.
- edge-tts gotcha: **word boundaries must be requested explicitly** (`boundary="WordBoundary"`; ≥7.2.0 default may be SentenceBoundary → silently empty → subtitles degrade to char-count interpolation). Voice: zh `zh-CN-YunxiNeural RATE=+0%` (≈5.5 chars/s, default no speed-up), en kokoro-82m `am_liam` (measured **2.3 words/s → write at ≈125 wpm; multiply edge word budgets ×0.78**); `[word](/IPA/)` PRONOUNCE overrides for kokoro mispronunciations (CUDA, "v5.0"); en `|` blocks are re-joined with spaces for TTS (a `powerful|but` once became "powerfulbut").

### B. Motion vocabulary with exact frame counts (`reference/motion-vocabulary.md`)
Entrances: **SoftIn** (default; 8f, opacity easeOut(2.5), **first frame ≈25%** — `fadeIn(0)=0` leaves an empty first frame, so `softOp` or `softOp(n+1,6)`; +10px rise) · **GlitchIn** 12f opacity template `[.5,1,.5,0,.5,0,.5,1,.75,.5,.75,1]` · slide-up `Δ·(1−n/22)^2.5`, **Δ≤120** (Δ300 crosses the subtitle band) · side entry Δ260–320 + 6f pre-fade · scale-in cubic-bezier(.1,.1,.35,1) 21f · stagger 2f/item (never GlitchIn for stagger — looks like dropped frames) · draw-on arrows "grow from root, head follows shaft" 16–28f · typewriter 2f/char · Counter 14–26f · row wipe 2f/row.
Emphasis: `emphasisPulse(n,{peak:1.11, up:13, hold:4, down:13})` · grey→purple 11f (border+fill together) · glow-on 8f · white flash filter brightness 1→1.6→1 6–10f · highlight bar wipe 12f.
**Exits must reach zero before a hard cut**: `opacity = 1 − (n/N)^1.5` (N=6–12, last frame 0). The lesson behind it: "6.7%/帧的 exitFade 单独用于硬切前（末帧还剩 40–60% 会"啪"）". Glow-bearing elements **kill the glow 6 frames first** (`glowOffK`), then fade.

### C. Camera vocabulary + budget (`motion-vocabulary.md` §镜头运动)
- Push-in `1→1.33 / 33f` bezier(.6,.05,.4,.95) (reference film: 1→1.329/33f, 1→1.358/35f pow 2.5); pull-back 37–42f bezier(.55,.05,.4,1); **handoff move** 16f easeInOutPow(2.5) — previous shot's hero shrinks to 0.6 and moves to a corner, same component + same params in both shots; group pan 20–30f; full-page scroll 43f; **parallax 2–3 layers at 6.4/9.6/12.8 px/frame with background dimmed ×0.43**; whip 1–3f (≤2 per chapter); screen-space vignette 18f during push-in.
- Budget: **≥3 camera moves per chapter, ≤1 per shot**, 30–45f easeInOut; no GlitchIn/stagger during a move; HUD/rail/subtitles stay in screen space (do not ride the camera); **camera never enters the last beat** (move ends ≥30f before exit); text stays ≤1.33 scale (strokes fatten >1.4); content stays in x89–1191 / y122–607 after a 1.05 slow-push.
- Rationale with measurement: "风格来源的原片每分钟 6.6 次整体运镜、平均 16 帧 … 早期两片只有 2.2–2.5 次/分钟且零次推近，观感差距主要在这里" — the reference film had 6.6 camera moves/min; their early films 2.2–2.5 and zero push-ins, and that was the main quality gap.
- Slow push 1.0→1.05 as the default "always-alive layer" for shots with no other move ("它是给观众的常动层，不是给 metric 的").

### D. Composition & light — the aesthetic rules that QC measures (`reference/composition-and-light.md`)
- **One hero per shot, three size tiers**: hero ≥170px tall (or ≥96px text with the full line ≥300px wide; 2–3 char words need 110–150px), supporting 60–110, labels 22–30. Nothing else. Max object <110px for >45f = defect (<80px = high).
- **Light follows the hero**: hero always carries light (GLOW_PURPLE double-layer / HeroGlow / HaloRing / text hard shadow `6px 6px 0 PURPLE, 0 0 28px rgba(102,45,248,.45)`); supporting cast carries none; exactly ≤1 small-focus glow per frame; **three light tiers: white bloom (structure lines) < purple soft glow (hero + current focus) < white flash (events 3–6f)**; light colors only purple/orange/red; hero glow breathes 30f ±15%; glow dies 6f before exit.
- **Set pieces** ("高光时刻"): ≤1 per chapter; types: hero-reveal / thesis / big-number / symbol. The full **SET_PIECE** choreography (`fx.tsx`):
```ts
export const SET_PIECE = {
  sweeps: [4, 22, 40], // three LightSweep rounds (relative to T0)
  line: 18,            // StageLine start
  ghost: 37,           // GhostText start
  pulse: 12,           // emphasisPulse (relative to T1)
  sub: 16,             // subtitle slideUp Δ80/22
  pills: 24,           // split-word pills SoftIn, 2f stagger
  minLen: 90,          // minimum shot length
};
```
Three-round light sweep: each round 3 bars, 2f stagger, 16f, α .6/.55/.55, white core; StageLine widens to 720 over 14f then breathes .45±.15; GhostText = white-stroke 10% outline foreshadowing the hero 40f early; at beat frame T1 the line white-flashes 3f and dies while the hero GlitchIns.
- **Rationing by whitelist**: ≤1 GlitchIn per shot and only the shot's core term (a film once had 102 glitches — user vetoed; a whole-screen glitching page reads as frame drops); LightSweep/StageLine/GhostText only in the **sweep whitelist ≤2 shots per film** (core-concept first appearance + optional ending callback; reference film used 1 in 44 shots); `selfcheck.py` counts these statically.
- Empty-frame math: a sweep/line phase with content-area soft glow ≥10000px² doesn't count as empty (a single round was measured at only 5004px² — fixed by going to three rounds + doubling StageLine radius); "登场型高光时刻的前 60–80 帧要单独算一遍'这几帧最大物体多大'".
- **Verb-driven continuous action + landing hold** (§7, their most original rule): every subtitle block's verb must have an action persisting to the next beat (data flow / pulse dots running along arrows / line-by-line typing / cell-by-cell lighting / growth / gate open-close / queue compression); full stillness >3 s is a defect; **never add fake drift/float/breathing to game the metric** ("不为凑指标给静止的物体加漂浮、飘动、呼吸"); the last element of every shot must **land and hold 30–45f before exit** ("落位停留"); "入场即停" (enter-and-stop) and "落位即切" (land-and-cut) are both named defects.
- **Chapter seams** ("章界要有起承转合"): chapter end leaves a hook; chapter first sentence refers back to the previous chapter's result then opens the question; the chapter's first shot **carries over the previous chapter's hero/symbol** (same component, same params, shrunk/moved) instead of clear-and-redraw; chapter-card subtitle written as "上一章产物 → 本章动作".
- The diagnosis that produced these rules (§风格传递): "两片动效数量、节奏、柔光总面积几乎相同——差距不在「动得多不多」" — same motion quantity, the gap was entirely hero size (172 vs 219px median), light placement, and set-piece choreography. *Lesson: don't fix "feels flat" by adding more motion.*

### E. Shot design pattern table (`narration-storyboard.md` §4)
20+ **content-agnostic visual relations** ("画面关系" not domain concepts), each with layout + hero/size/light + reference source file: entity+features (icon + numbered dashed boxes) · analogy concrete object ≥260px · hero reveal (set piece) · provenance/year (source card ≥240px + BigNumber 96 "never stands alone on an empty screen >30f") · ordered process (process rail + input→processor→output, processor ≥200×110 purple) · three-tier tradeoff (red X / green check, middle card active) · point set & neighborhood (grid plane + grey dot cloud + purple neighbors + orange target) · layered structure (TiltPlane ×3, 90px layer spacing, path draw-on between layers) · container & admission (cylinder ≥160 + cards fly in with ACL tags) · two streams merge (result ≥72px) · funnel (`Trap` trapezoid, cards grey out falling through, survivors turn purple) · curve discovery (chart card 440×300, source caption needs ≥2.5 s hold) · request→process→grounded reply (typewriter request, citation badges [1][2] with leader lines to source cards) · parallel lists · weighing scale ≥400px · network (nodes light via rnd, edges draw-on, community circles) · feedback loop (ring ≥300px + ball running laps + round counter) · magnitude/threshold (BigNumber 20f count + comparison object + orange conclusion) · closing callback (return to opening metaphor object ≥260px + HaloRing) · timeline (must be given a hero: "0.1 秒" at 96px, cursor GLOW_PURPLE_S) · formula (token-by-token every 3f, result ≥72px) · table (current row 1.15× + purple, others grey; >6 rows → full-page scroll) · "many" (2–3 layer parallax wall, not confetti) · **"two things that look alike but differ" — build the real mechanism** (see 3D section).

### F. Quantitative QC scripts (we have review.mjs; these extend the idea)
- **`motion_check.py`** (138 lines): renders a group at 0.5× JPEG q80 every 3rd frame, or reads final `fin_frames/`; content region = 320×180 grayscale mean change; **THR=0.35 still-frame threshold; HOLD_THR=1.5 "large change" threshold (landed verb actions read 0.4–1.2; entrances/22f slides/33f push-ins read 2.5–15 — so 'hold' measures 'layout settled', not 'absolutely frozen')**; verdicts: longest still ≤3.0 s; last-beat hold ≥30 f (excluding the 6f glow-off and frames already exiting, detected by brightness < 0.9× tail median); in full-res mode classifies offenders: changed-pixels <800 = truly still → give it a verb action; 800–2500 = small-area motion → increase amplitude, not element count; "group-level readings are loose — re-run on final frames, that's the criterion."
- **`frame_metrics.py`** (159 lines): per shot, hero size = largest connected bright object; **wide objects scored as `max(h, min(w, 4h)/2.5)`** (a row of big text counts as one object via 13×41 binary dilation — merges characters ≤40px apart but not pills ≥50px apart); dot-field backdrop dots masked out by regenerating the exact same grid coordinates before counting (and glow lower bound raised 10→22 because the #0b0c11 dot base is slightly blue); hero-region soft-glow area (sat>.25, 22<lum<110) median; purple-fragment count ≥8 = "purple sprayed on supporting cast"; background debris ≥10 small shapes = defect (but "an ordered dot matrix that lights on beat is a matrix; randomly scattered icons are debris — QC looks at the frame to tell them apart"); empty = no ≥110px object AND glow <10000px².
- **`selfcheck.py`** (106 lines, no render, seconds): frame coverage vs storyboard (holes/overlaps — chapter-card gaps whitelisted); GlitchIn count per shot file vs glitch whitelist; LightSweep/StageLine/GhostText usage vs sweep whitelist (≤2); **on-screen string literals extracted from source, CSS noise filtered, diffed against the fact list** — "QC checks pixels and can't see frames it didn't sample; source reconciliation scans 8 groups at once and caught a counter the four QC agents all missed."

### G. Crash-log lessons worth pinning (`reference/lessons.md`, ~200 lines of rework causes)
- **Counter intermediate values are on-screen numbers**: "年份 1995→1998 线性计数会让 1995/1996/1997 清晰可读 4–6 帧 … 通则：中间值若是「看起来像事实但没出处」的数字，要么让它不可读，要么不做计数" (year rolls need blur 12→9px throughout + snap to 0 at landing).
- Self-built illustrative arithmetic must be self-consistent with on-screen captions (a counter reading +2405/s next to "billions a day" — 30× off; a formula whose 8th bar ≈34 while the caption says ≈1/5).
- kf first-value trap: keyframe tables must start with `[shotStart, offscreenValue]` or elements pre-sit mid-state.
- Transform scale eats font size: "凡是整组 scale/transform 的地方，把里面所有字号乘一遍缩放系数再对照 22px 下限" (26px × 0.72 = 18.7px < 22px min; QC measures ink height and misses it).
- Don't double-fade (a component with its own opacity ramp wrapped in fadeIn = a 1–2 frame dip); don't render the same element twice (a constant SoftIn copy fully covers a GlitchIn copy).
- Orbitron has no ¥ ≠ ≈ glyphs (fallback chain must survive); an isolated "0" reads as Ø.
- HUD word changes need a 10f width crossfade, not 1-frame swap; progress-bar chapter highlight must switch at the chapter **card** frame, not the first sentence frame; ending blackout start eats the final action — compute `(S_last.to − endingFade) − lastBlockStart ≥ 30f`; GlitchIn's 12 frames are half-dark — budget double for readable time on a closing line.
- Fonts: CJK line-box ink sits 3–7px low → pre-subtract dy −2…−5; Noto Sans SC curly quotes/ellipsis are 1em full-width (use straight quotes + three periods in English); min font 22px measured as ink height.
- Performance red lines: "禁 feConvolveMatrix；blur σ≥1（σ<0.8 在 Chromium 无效）；SVG filter 加 colorInterpolationFilters="sRGB"" — feConvolveMatrix goes software path at 0.13 fps; ≤600 DOM nodes/frame, ≤6 SVG filter instances.
- QC quantified readings as evidence ("SC37 两框人物 275/275px 相等而背景门高 197 vs 158px（差 20%）"), and "派 QC 时要指名要哪几个读数" — request specific numbers when dispatching QC.
- "写进 lessons 的模板 bug 要当场改模板" — a lesson recorded twice without fixing the template is a process failure.

### H. Narration principles (`reference/narration-guidance.md`, 13 rules + pre-flight checklist)
0. The one test: "does the listener now know, picture, or feel something they didn't a sentence ago?" · 1. Start inside a situation, not a definition · 2. One spine (if sections could be reordered, there is no spine — the failure mode is a glossary) · 3. Motivation before mechanism (what goes wrong without it → how it works → what that buys; cut mechanism detail first) · 4. Numbers converted to felt scale or cut · 5. Analogies are tools: only when they let the listener infer; kept consistent while in use; dropped when they stop predicting · 6. Voice = a person who finds this interesting talking to one smart friend; honesty about limits builds trust · 7. Vary sentence rhythm (mark any 3 same-shape sentences in a row; rewrite one) · 8. Jargon labels something already understood ("…this is what people call X") · 9. Stakes early, payoff reframes the opening at the end · 10. Cut restatements, announcements, lists >3 · 11. Say what the picture cannot (never narrate the diagram) · 12. Precision earns trust (real names, dates, sources; mark approximations) · 13. Hand off at seams ("the manual is built; now the real exam starts" — announce nothing, motivate everything).
The English-film lesson: a first draft following the reference book's section order scored 4.3 in blind review; the independently rewritten version with a spine scored 8.2.

## 2.4 Reusable assets (port targets)

| Asset | Path | What to port |
|---|---|---|
| Motion vocabulary | `reference/motion-vocabulary.md` | the entrance/emphasis/light/exit/camera tables with frame counts → our craft-law reference |
| Composition & light | `reference/composition-and-light.md` | hero-tier sizes, light-follows-hero, set-piece choreography, QC thresholds |
| SET_PIECE + fx library | `template/src/fx.tsx` | LightBar/LightSweep/StageLine/GhostText/HaloRing/HeroGlow/BigNumber/TiltPlane/CameraRig/camAt as design specs (license: PolyForm NC — reimplement, don't copy) |
| motion_check.py | `template/scripts/motion_check.py` | the hold/still metric → extend review.mjs (our frozen-time detection gains a *landing-hold* metric and true-still vs small-motion classification) |
| frame_metrics.py | `template/scripts/frame_metrics.py` | hero-size/glow/purple-fragment/debris metrics |
| selfcheck.py | `template/scripts/selfcheck.py` | static whitelist + literal-vs-facts reconciliation |
| tts_build.py | `template/scripts/tts_build.py` | paragraph/beat gap system (GAP/PARA_GAP/CHAPTER_GAP/LEAD/TAIL), per-sentence cache, explicit WordBoundary, `## gap N` directive |
| prompts.md | `reference/prompts.md` | the 6 agent prompt templates (research/build/QC/fix/re-verify/final) |
| Shot pattern table | `reference/narration-storyboard.md` §4 | the visual-relation → layout mapping |
| lessons.md | `reference/lessons.md` | the crash log as a "don't do this" appendix |
| Sample film | `examples/rag/` | full paper trail: research → narration → storyboard → 44 shot sources → QC reports; `examples/contrast/` = 6 bad/good frame pairs with the delta named |

## 2.5 3D / cutaway relevance (HIGH)

- **"When the topic itself is geometric, build the real one"** (lessons.md, 第三片《电影运镜》): the film's thesis was "perspective depends only on camera position, not focal length", so they implemented **real pinhole projection in ui.tsx (`project3` / `FrameScene` / `camOrbit` / `camDollyZoom`)** — push = change cam.z only, zoom = change cam.f only — and QC verified pixel-wise: "SC37 两框人物 275/275px 相等而背景门高 197 vs 158px（差 20%）". Generalized: "**凡是「两种做法看起来像但其实不同」的主题…都必须让底层机制真的不同**". → For our Three.js cutaway skill: a cutaway must be a real section through real geometry, not a fake sprite swap; exploded views must really separate parts.
- **Probe pattern before parallel dispatch**: "我先写了一个 `_probe.tsx`，一帧一格渲染 8 种相机状态，出 8 张图看一眼。当场抓到两个会让 8 个组集体做错的问题 … 探针成本 10 分钟，返工成本 3 个组" — render one frame per camera state, look, fix the shared system, then dispatch. The probe output becomes a "camera parameter cheat table" (cam.z → subject screen height) given to builders with numbers.
- **Scene geometry designed for the most extreme camera move**: "场景几何要按「最极端的那次运镜」来设计，不是按默认机位好看来设计。派单前把所有运镜的角度/位移列一遍，问一句「这个角度下画框四边各是什么」" (adding two side walls saved three groups and the perspective convergence lines became the best evidence of parallax).
- **TiltPlane** depth stacks for hierarchy/index shots: `skewX(-20deg) scaleY(.5)`, layers 90px apart, back layers opacity .6, text/icons placed "upright" on the plane (children get squashed by scaleY — put them standing).
- Dual-panel consistency: the plan view must be back-derived from the world geometry (`SCENE`), not hand-drawn to look nice — or explicitly declared a diagram.

## 2.6 Verdict

**ADOPT-EXACTLY-WHAT (mapped to our skills):**
- `motion-vocabulary.md` tables + composition/light hero rules → **make-on-script / make-minimal-reel / make-vox** craft laws (they are frame-counted, testable, and complement our silence-before-payoff / voice-is-the-clock laws).
- motion_check.py hold metric (30–45f landing hold, no-fake-breathing rule) + frame_metrics.py hero/glow/debris + selfcheck.py literal-fact reconciliation → **our review.mjs / measured-QA** across all tracks.
- Paragraph-gap timing system (GAP 10 / PARA_GAP 30 / CHAPTER_GAP 45 / 5–8% stay budget / `## gap N`) + per-sentence TTS cache + explicit WordBoundary → **make-vox / make-on-script** (we already trim Edge trailing silence; this adds the pause grammar).
- Multi-agent build/QC/fix/re-verify protocol + waves-of-4 dispatch + preview-30s checkpoint → our pipeline orchestration for long films (new capability: films >1 min).
- Narration-guidance 13 principles + research-brief fact system with credibility stars → **make-short / make-on-script** script stage (we have fact-checking; the felt-scale-number rule and the spine test are upgrades).
- Shot pattern table (visual relations) → **make-on-script routing table** (a second, content-agnostic routing axis).
- 3D lessons (real mechanism, probe pattern, extreme-camera geometry) → **the upcoming Three.js 3D-cutaway skill** directly.
**ALREADY-HAVE:** Remotion frame-purity, deterministic rnd, TTS+alignment pipeline, measured loudness/QA, fact-checking, contact-sheet review, contrast/anti-cliché bans.
**REJECT:** wholesale code reuse (PolyForm Noncommercial license — reimplement the *rules*, quote as spec); 1280×720@30fps 16:9 format (we're 1080×1920@15fps); kokoro/piper engines (Edge TTS works for us).

---

# 3. zhuyansen/awesome-opus-5.5-video

## 3.1 What it actually is

**A curated index, not a prompt corpus.** 21 files: README (EN/ZH), 8 category case lists (`cases/*.md`), `cases.json` (1465 entries), CONTRIBUTING, CI sync workflow. Every entry is an X post ≥5000 views of a video "made with Claude Opus 5.5 / Sonnet 5.5 / Haiku 5.5 / Fable 5.5 (limited preview)" — model attribution as stated by creators, not reproduced. **The prompt text itself is NOT in the repo**: `cases.json`'s `prompt` field only holds `{kind: brief|full, source, source_url, length, page_url}` pointing to jasonzhu.ai. Verified programmatically: the union of prompt keys is `{page_url, source, length, source_url, kind}` — no local prompt text. So "extract prompt patterns" from the work-tree is not possible; do not pretend otherwise.

## 3.2 What IS locally valuable

- **Taxonomy** (8 categories): motion (235), product (185), education (137), stories (148), art3d (204), game (255), production (107), comparison (194) — a good coverage checklist for what an AI-video studio can be asked to make.
- **Tool landscape from `tools_reported`** (my count over 1465 entries): **Three.js 123 (the #1 tool)**, Blender 83, Higgsfield 58, Claude Code 50, ElevenLabs 29, Suno 26, After Effects 25, Python 23, ffmpeg 20, Remotion 18, WebGPU 14, Unreal 13, Godot 13, **HyperFrames 12**, Tripo 11. → external validation that a Three.js track is the single most-proven 3D route for this ecosystem; Blender second (often via MCP).
- **Idea bank / precedent list for the 3D-cutaway skill** (titles from `cases.json` / `cases/art3d.md` / `cases/education.md`): "Interactive Raptor 3 rocket engine explainer" (0:35, prompt: brief), "NVIDIA Blackwell GPU zoom-through animation" (0:49), "Interactive jet engine lesson" (Three.js), "3D keyboard assembly video" (Three.js), "Floor plan to 3D interior design tool" (Three.js, full prompt), "Sketch-to-3D house design animation" (Three.js + TSL), "3D gym equipment builder app" (Manifold CAD + Three.js, full prompt), "Jelly watermelon slicing simulation" (full prompt), "Working computer built from logic gates" (1:02, full prompt), "'What is a Transformer' explainer" (12:12), "AI documentary about superintelligence" (5:15, full prompt), "Battle of Austerlitz procedural film" (5:01, full prompt).
- Duration norm: the viral sweet spot is 0:10–1:00; explainers 0:30–12:00.
- Reference hygiene rules worth copying: inclusion rule (creator's own post + native video + 5000 views), "prompts kept verbatim, never rewritten or translated", corrections-removal policy.

## 3.3 3D / cutaway relevance

The precedent list above is the relevance: rocket-engine explainer, GPU zoom-through, jet engine lesson, keyboard assembly, floor-plan→3D — five direct precedents for a "technical object, exploded/sectioned, zoom-through" skill. `cases/art3d.md` and `cases/education.md` are the files to mine for titles; actual prompts would need fetching from `page_url` (external, not in scope of work-tree analysis).

## 3.4 Verdict

**ADOPT (small):** the category taxonomy as a coverage checklist; the tool-landscape data point (Three.js-first) as validation for our planned 3D track; the precedent title list as idea bank for the 3D-cutaway skill.
**REJECT (as a prompt source):** the repo contains links, not prompts. If the main agent wants the 155 full prompts, they must be fetched from `jasonzhu.ai/en/prompts/claude-opus-5-5/...` — out of scope here. Being plain: this repo is an index with metadata value only.

---

# 4. olegkupshukov/claude-resolve

## 4.1 Architecture

A **DaVinci Resolve Studio 21 Workflow Integration plugin** (sandboxed Electron) that embeds Claude Code CLI as a subprocess: user types a prompt → Claude emits ONE self-contained HTML file → plugin renders it via Playwright frame-by-frame → PNGs → **ffmpeg ProRes 4444 with alpha (yuva444p10le)** → auto-imports the .mov into the current timeline at the playhead on an empty track. Prompts for: title cards, text reveals, glitch, lower thirds, transitions.

Generation flow (`plugin/ipc/claude.js`): spawn `claude -p --model sonnet|opus --input-format stream-json --output-format stream-json --permission-mode acceptEdits --no-session-persistence`; first turn injects a system prompt containing session context (project/page/timeline names, width/height/fps, "ProRes 4444 with alpha"); stream messages parsed for usage/tool_use/text → UI status; abort = taskkill; restart respawns + re-injects context.

## 4.2 Pipeline stages

1. User prompt in plugin UI → 2. Claude writes HTML (single ```html block, `<!-- FILE: Name.html -->` first line) → 3. In-app sandboxed preview (iframe srcdoc with inlined UMDs + base64 @font-face) → 4. "Render .mov" → `renderer/render.js` (Playwright) → 5. ffmpeg ProRes 4444 → 6. Media Pool import into "Claude Resolve" bin → 7. Timeline placement (find empty track, AppendToTimeline at playhead) → 8. Asset management (sync to Media Pool, delete).

## 4.3 Techniques we LACK (concrete, high value)

### A. The deterministic clock hijack (`plugin/renderer/render.js` lines 83–123) — THE crown jewel
```js
const TIME_HIJACK = `
(() => {
    if (window.__renderHijack) return;
    window.__renderHijack = true;
    window.__renderTime = 0;
    window.__renderActive = true;
    const origPerfNow = performance.now.bind(performance);
    performance.now = () => window.__renderActive ? window.__renderTime : origPerfNow();
    const origDateNow = Date.now.bind(Date);
    Date.now = () => window.__renderActive ? window.__renderTime : origDateNow();
    const callbacks = [];
    window.requestAnimationFrame = (cb) => { callbacks.push(cb); return callbacks.length; };
    // WAAPI: pause every animation on creation, remember the render-time it
    // was created at, then drive its currentTime from __stepFrame.
    const waapiAnims = [];
    const origAnimate = Element.prototype.animate;
    Element.prototype.animate = function (keyframes, options) {
        const anim = origAnimate.call(this, keyframes, options);
        if (window.__renderActive) { try { anim.pause(); } catch (_) {}
            waapiAnims.push({ anim: anim, startTime: window.__renderTime }); }
        return anim;
    };
    window.__stepFrame = (timeMs) => {
        window.__renderTime = timeMs;
        const cbs = callbacks.splice(0);
        cbs.forEach((cb) => { try { cb(timeMs); } catch (_) {} });
        for (const rec of waapiAnims) {
            try { const local = timeMs - rec.startTime;
                rec.anim.currentTime = local < 0 ? 0 : local; } catch (_) {}
        }
    };
})();
`;
```
Installed via `page.addInitScript` **before any HTML script** so React/Framer Motion mount on a clock frozen at t=0 with entrance animations *queued, not played*. The critical insight in their comment: "FM v10 offloads opacity/transform to WAAPI, which the performance.now / rAF overrides alone cannot reach — without this an entrance animation plays in real wall-clock time during page load and is already settled before the first frame is stepped."
→ **This upgrades our animate engine from "must draw everything in canvas code" to "any CSS/WAAPI/Framer-Motion/DOM animation becomes deterministic and frame-steppable."**

### B. Two-mode render contract (`ipc/claude.js` SYSTEM_PROMPT_TEMPLATE)
- **frame mode**: HTML implements `window.renderFrame(frame, fps)` — renderer calls it per frame then screenshots; "NEVER use React, setState, or any async batching inside renderFrame(). Mutate the DOM imperatively."
- **realtime-precise mode**: no renderFrame → clock hijack + `__stepFrame`; renderer sub-steps **3 times per frame** (`tMs + (k/3)*(1000/fps)`) "so Framer Motion springs settle smoothly", waits 8ms for DOM commit, 500ms initial settle at frozen t=0, `document.fonts.ready` wait (5s timeout) + 200ms extra font-decode settle.
- Duration contract: `window.getAnimationDuration()` → seconds, recommended 2–8, **hard clamp 30 s** with a warning event.
- Mode selection guidance in the prompt: frame mode for procedural/counters/charts/deterministic; realtime for springs/FLIP layout/AnimatePresence/complex stagger.

### C. ProRes 4444 alpha output (`render.js` lines 340–349)
```js
const ffmpegArgs = ['-y', '-framerate', String(args.fps),
    '-i', path.join(framesDir, 'frame_%06d.png'),
    '-c:v', 'prores_ks', '-profile:v', '4444', '-pix_fmt', 'yuva444p10le',
    '-vendor', 'apl0', args.output];
```
with `page.screenshot({ path, omitBackground: true })` per frame. → transparent overlay .mov deliverables (lower thirds, titles) for editor compositing; a new deliverable class for us. Also: thumbnail saved from the ~85% frame ("late enough to show the resolved state, before any fade-out").

### D. The generation system prompt structure (worth stealing wholesale as an engine-adjacent doc)
`SYSTEM_PROMPT_TEMPLATE` sections: `<identity>` (session context) → `<output_contract>` (exactly one ```html block with FILE comment) → `<rendering_modes>` → `<aesthetic_direction>` ("Commit to ONE bold aesthetic per generation … Never blend three aesthetics into mush"; bundled fonts Bricolage Grotesque / Fraunces / JetBrains Mono; "Avoid generic AI aesthetic: purple→pink gradients, centered-everything, glow without a clear aesthetic reason, three-card grids; Vary between generations. Never converge … If the user iterates ('make it different') — go further from the previous output, don't tweak it") → `<motion_principles>` (**"Open with a hook. The first frame must already be moving or have just resolved its first reveal"**; "Sequential, not simultaneous. Stagger 50–100ms"; **"End with stillness. Hold the final frame for at least 300ms"**; entrances ease-out cubic-bezier(0.23,1,0.32,1) or spring stiffness 300 damping 30; movement ease-in-out cubic-bezier(0.77,0,0.175,1); snappy emphasis stiffness 400+ damping 15–20; luxury 600–900ms; animate transform+opacity only; **never scale(0), start scale(0.95)+opacity 0**; motion personality table: news→snappy 200–400ms, luxury→600–1200ms, playful→bouncy, brutalist→hard cuts) → `<text_rules>` (min 48px@1080p / 72px@4K; line-height 0.9–1.1; letter-spacing −0.02..−0.04em for display; 5–10% safe margins; **8+ words → animate by line/phrase, not word-by-word — reveal phrase 1, hold, swap**; word-level default for kinetic typography; for char-level, wrap each word in a container "so line wrapping never splits a word") → `<technical_rules>` (transparent only on explicit keywords "lower third/overlay/transparent/alpha/talking head"; 1 CSS px = 1 output px, avoid vw/vh; **no CDN / Google Fonts / external images — inline everything**; no audio; multi-turn: "Modify your previous HTML, don't regenerate"; "You will not see render errors … Write defensively") → `<examples>` (both modes, complete) → `<response_style>` (short replies; 1–2 lines: chosen aesthetic + one decision).

### E. Resolve/NLE automation patterns (`ipc/overlay.js`, `ipc/resolve.js`)
- `timecodeToFrame("HH:MM:SS:FF", fps)`; `findEmptyTrack`: iterate video tracks from V2, **skip locked or disabled tracks ("A locked or disabled track silently rejects AppendToTimeline")**, overlap check `[atFrame, atFrame+clipFrames)` vs each item's GetStart/GetEnd, else `timeline.AddTrack('video')`.
- **Import is two-stage so the clip is never lost**: import into a dedicated "Claude Resolve" bin first (restore previous folder after); placement is best-effort and returns structured `{imported, placed, reason}`.
- `AppendToTimeline([{mediaPoolItem, trackIndex, recordFrame, mediaType: 1}])`; diagnostic logging of placement inputs/outputs.
- Runs render.js with **Resolve's bundled Electron as Node** (`ELECTRON_RUN_AS_NODE=1`) — no system Node dependency; ffmpeg path re-resolved at use time because "Resolve's Electron has a stripped PATH".
- JSON progress lines on stdout (progress/mode_detected/warning/error/done/thumbnail) parsed by the parent; "fatal errors emit the structured JSON event AND mirror one flat line to stderr".

### F. Bundled `emil-design-eng` skill (`skills/emil-design-eng/SKILL.md`, 680 lines)
Emil Kowalski's design-engineering philosophy — a UI-animation craft codex: **animation decision framework** (frequency table: 100+/day = never animate — "Raycast has no open/close animation. That is the optimal experience"; tens/day = reduce; occasional = standard; rare = delight); purpose test; **easing decision tree** (entering/exit → ease-out; moving on screen → ease-in-out; hover → ease; constant → linear; default → ease-out; "Never use ease-in for UI animations"); duration table (button 100–160ms, tooltip 125–200, dropdown 150–250, modal 200–500; "UI animations should stay under 300ms"); custom curves `--ease-out: cubic-bezier(0.23,1,0.32,1)`, `--ease-in-out: cubic-bezier(0.77,0,0.175,1)`, `--ease-drawer: cubic-bezier(0.32,0.72,0,1)`; springs (Apple-style `{duration: 0.5, bounce: 0.2}`, bounce 0.1–0.3, interruptibility); **never scale(0)** ("Nothing in the real world appears from nothing … like a balloon that has a visible shape even when deflated"); origin-aware popovers (modals exempt); tooltip skip-delay-on-subsequent; transitions over keyframes for interruptible UI; **blur(2px) to mask imperfect crossfades** ("trick the eye into perceiving a single smooth transformation"); @starting-style; translateY percentages; clip-path insets (hold-to-delete 2s linear press vs 200ms ease-out release — **asymmetric timing: slow where the user is deciding, fast where the system responds**); momentum dismissal (velocity > 0.11 flick); damping at boundaries; performance (only transform+opacity; Framer Motion x/y props are NOT hardware-accelerated — use full transform strings; CSS animations beat JS under load; WAAPI for programmatic CSS); accessibility (prefers-reduced-motion = fewer/gentler, not zero); **Sonner principles** (good defaults > options; handle edge cases invisibly; cohesion: "the easing and duration fit the vibe… everything in harmony"); "Review your work the next day … play animations in slow motion or frame by frame"; review checklist as a Before|After|Why markdown table (mandatory format).

## 4.4 Reusable assets

- `plugin/renderer/render.js` — the whole TIME_HIJACK + two-mode renderer (MIT licensed, 376 lines) — directly portable to our animate engine.
- `plugin/ipc/claude.js` SYSTEM_PROMPT_TEMPLATE — the generation contract text.
- `plugin/ipc/overlay.js` — NLE import/place automation reference.
- `skills/emil-design-eng/SKILL.md` — craft-law source for easing tables + review checklist.
- Bundled font set (Bricolage Grotesque, Fraunces, JetBrains Mono) as an anti-generic-aesthetic trio.

## 4.5 3D / cutaway relevance

No Three.js; CSS 3D only (an orbit keyframes example in the emil skill: `rotateY(0) translateZ(72px) rotateY(360deg)`). The relevant port is **engine-level**: if our Three.js cutaway skill wants DOM/SVG overlay layers (callouts, dimension lines, HUD) animated with CSS/WAAPI, the TIME_HIJACK makes them frame-deterministic alongside the WebGL canvas.

## 4.6 Verdict

**ADOPT-EXACTLY-WHAT:** TIME_HIJACK deterministic clock + `__stepFrame` + WAAPI pause-on-create → **our animate engine** (unlocks CSS/Framer-Motion/WAAPI as first-class frame-pure citizens; also fixes "entrance settles during page load" class of bugs); the `renderFrame(frame,fps)` / realtime auto-detect two-mode contract → animate engine's HTML interface; ProRes 4444 alpha output + `omitBackground` screenshots → a new overlay-element deliverable class; the system-prompt section structure + aesthetic-direction bans → our SKILL.md generation contracts; emil easing tables/frequency framework/Before|After review table → craft laws.
**ALREADY-HAVE:** Playwright + headless Chromium + ffmpeg assembly (that's our animate engine's shape), determinism via code-drawn frames (theirs adds the DOM path we lack).
**REJECT:** the DaVinci Resolve integration itself (no NLE in our delivery path; GitHub Releases MP4 stands) — unless we later want an "export overlay for editors" feature, in which case overlay.js is the reference.

---

# Cross-repo synthesis for the Three.js 3D-cutaway skill (task flag)

1. **Build the real mechanism** (anything2explainer): dolly vs zoom must differ at the projection level; a cutaway must be a real section. Pixel-verifiable claims ("275/275px vs 197/158px") turn the argument into proof.
2. **Probe before dispatch** (anything2explainer): one frame per camera state, 8 states, look before committing the shot plan; produce a camera-parameter cheat table (camera distance → subject screen height) with measured numbers.
3. **Design geometry for the most extreme camera move** — list every move's angle/displacement first and ask "what's at each edge of the frame here".
4. **Tool validation** (zhuyansen): Three.js is the #1 reported tool (123/1465) for these works; Blender second (83). Precedents: rocket engine explainer, GPU zoom-through, jet engine lesson, keyboard assembly, floor plan→3D.
5. **Camera vocabulary to port**: push-in 1→1.33/33f bezier(.6,.05,.4,.95) (anything2explainer); camera flight / camera journey / text depth layers (hyperframes rule names); CSS-3D orbit pattern (emil skill); CameraRig world→screen wrapper with easeInOutPow(2.5) keyframe interpolation and first-value-trap guard.
6. **Overlay/callout layers** can stay DOM+CSS and still be frame-deterministic via TIME_HIJACK (claude-resolve).
7. Beat-grid `b(n)` (hyperframes) as the timing grammar if the cutaway film is scored.

# Top ADOPT list (exact source paths)

1. `Vincentwei1021_anything2explainer/reference/motion-vocabulary.md` — frame-counted entrance/emphasis/light/exit/camera tables.
2. `Vincentwei1021_anything2explainer/reference/composition-and-light.md` — hero tiers, light-follows-hero, SET_PIECE, §7 verb-action + 30–45f landing hold.
3. `Vincentwei1021_anything2explainer/template/scripts/motion_check.py` — hold/still metric with true-still vs small-motion classification.
4. `Vincentwei1021_anything2explainer/template/scripts/frame_metrics.py` — hero size (min(w,4h)/2.5), glow area, purple fragments, debris.
5. `Vincentwei1021_anything2explainer/template/scripts/selfcheck.py` — static whitelist + literal-vs-fact reconciliation.
6. `Vincentwei1021_anything2explainer/reference/prompts.md` + `agent-build-rules.md` + `agent-qc-rules.md` — the multi-agent protocol.
7. `Vincentwei1021_anything2explainer/reference/narration-guidance.md` — 13 script principles + pre-flight.
8. `Vincentwei1021_anything2explainer/reference/narration-storyboard.md` §4 — visual-relation shot pattern table.
9. `Vincentwei1021_anything2explainer/template/scripts/tts_build.py` — GAP/PARA_GAP/CHAPTER_GAP/`## gap N` + per-sentence cache + WordBoundary.
10. `Vincentwei1021_anything2explainer/reference/lessons.md` — the crash log (counter intermediates, ending-fade math, scale-eats-font, etc.).
11. `olegkupshukov_claude-resolve/plugin/renderer/render.js` — TIME_HIJACK + two-mode renderer + ProRes 4444 alpha.
12. `olegkupshukov_claude-resolve/plugin/ipc/claude.js` — SYSTEM_PROMPT_TEMPLATE generation contract.
13. `olegkupshukov_claude-resolve/skills/emil-design-eng/SKILL.md` — easing tables, frequency framework, review checklist.
14. `Sunwood-ai-labs_hyperframes-motion-reel-skill/SKILL.md` — beat grid `b(n)`, motion principles, ban list, DESIGN.md fields, snapshot-vs-render check.
15. `zhuyansen_awesome-opus-5.5-video/cases.json` — taxonomy + tool landscape + precedent titles (no local prompts — index only).
