# Research findings — Task 3-b (batch B)

Repos analyzed (work-tree only, `.git` skipped):
1. `Anil-matcha_vox-ai-motion-graphics-generator` (25 files)
2. `bangtutorial_bang-motion` (v1.19.0, MIT, 2.4 MB — dense Indonesian-language skill)
3. `Miftahul-Islam-Efaz_Motion-graphics-skill` (one skill: motion-video-director, 508-line SKILL.md + 5 scripts)
4. `imMamdouhaboammar_motion-graphics-skills` (53 skills; 825 MB is `projects/` media — real source is `skills/`, `Failure-lessons/`, `tools/animation-export-kit/`, `prompts/`)

All paths below are relative to `/home/z/my-project/shorts-creator/research/external/`.

---

# 1. Anil-matcha_vox-ai-motion-graphics-generator ("MuAPI Director")

## Architecture
- **NOT Remotion, NOT canvas.** A Python pipeline that treats video generation as *image-first, motion-second*: each beat is generated as a finished **collage poster** (flux-dev / nano-banana-2), then animated by an **image-to-video model (Veo 3.1 / Runway / Kling)**, then TTS narration (minimax-speech-2.6) + Suno BGM + ffmpeg assembly.
- `SKILL.md` defines three input modalities:
  - **B-roll** (topic → film): `beats.json` → style bake-off → keyframes → clips → audio → assemble.
  - **A-roll** (talking-head → collage): Whisper ASR segmentation → per-beat video-edit restyle (veo) preserving lip-sync frame-for-frame → remux.
  - **C-roll** (one photo → anchored collage): photo becomes a "photographic sticker" frozen inside generated collage posters.
- Pipeline stages (`scripts/`): `style_bakeoff.py → keyframes.py → clips.py → audio.py → assemble.py` (+ `asr_beats.py / aroll_clips.py / aroll_assemble.py / croll_keyframes.py`, `muapi_client.py`/`provider.py` for job queue with polling/retry/stall detection).
- Every stage **reads and rewrites the same `out/<project>/beats.json`** — the SSOT accumulates `keyframe_url/clip_url/audio_path` per shot; stages are idempotent (skip shots that already have artifacts). Two human gates: approve beat map, pick theme from bake-off.

## Concrete techniques worth porting

### a) Image-prompt formula (5-part structure) — `references/prompt-guide.md`
```
[1 STYLE BLOCK] mixed-media hand-cut paper collage, editorial zine style. Torn paper edges,
scissor-cut borders, tape corners, halftone print dot patterns, paper drop shadows. Figures
are printed-texture cut-outs from vintage photography or woodblocks. NOT 3D, NOT CGI...
[2 SCENE DETAILS] SCENE as layered paper cut-outs: {subject}, {props}, {accents}; clean
cut-out outlines, casting subtle drop shadows on layers below.
[3 BACKGROUND] on a bold flat {bg_color} cardboard paper background.
[4 TEXT BANNER] A torn paper banner with a big bold headline "{TEXT}" in heavy sans-serif capitals.
[5 TECHNICAL] flat-lay scanned look, straight-on composition, 1k resolution.
```
Plus a **theme catalog** with palette/type/finish/motion-style per theme (`scripts/styles.py` `THEME_PRESETS`): american-retro, swiss-modern, punk-zine, soviet-constructivist, wpa-propaganda, 70s-groovy, chinese-ink, atomic-age, newsprint-editorial, gilded-deco. Each preset carries a **motion_style** field (`calm|punchy|max`) that feeds the animation prompt amplitude.

### b) "Designing for animation" rules (image prompts tuned for the video model) — `references/prompt-guide.md` §3
> 1. Maintain high contrast: clear silhouettes against flat background allow the video model to separate layers.
> 2. Avoid busy textures in background: gradients or detailed backgrounds cause video morphing issues.
> 3. **Isolate text**: keep text on a clean solid paper banner; do not place text over complex details, or it will smear during animation.

### c) Motion-prompt vocabulary with guardrails — `scripts/clips.py`
- `CAMERA_VOCAB` maps 10 camera moves to natural language: static/push_in/pull_out/pan/tilt/parallax/orbit/dolly_zoom/roll/whip.
- `AMPLITUDE` levels: calm = "subtle, restrained amplitude", punchy = "lively, energetic", max = "elements burst, scatter and fly boldly".
- The strict constraint block is the most reusable single quote:
> "Keep the layout stable. Stay flat 2D — no 3D rotation, no perspective change, camera parallel to the poster. ONE continuous move that does not loop, retract or reset. Rigid paper — no morph/melt. Animate the motion only; don't re-render the picture."
> Text lock: "Keep the HEADLINE TEXT sharp, legible and stable — do not warp or wobble the lettering."

### d) Photo-anchor identity locks (C-roll) — `scripts/croll_keyframes.py`
- `FACE_LOCK`: face is a "PHOTOGRAPHIC sticker with a torn white paper border — keep the facial identity... pixel-faithful; do not redraw, repaint or stylize the face; NO halftone dots, print texture or ink treatment on the face"; body from the neck down is "a hand-drawn paper-doll illustration jointed like a vintage paper puppet".
- `FREEZE` dict: passed into the *video* prompt as `anchor_freeze` — "FREEZE the photographic face sticker — a frozen layer, pixel-identical to the still for the entire duration".
- `CROLL_GUARDS`: "Newspaper scraps carry completely UNREADABLE blurred micro-text. No readable text anywhere in the image." (prevents the video model from hallucinating gibberish labels.)

### e) ASR beat segmentation rules — `scripts/asr_beats.py`
Word-level Whisper → beats: `MAX_BEAT_DUR=9.5`, `MIN_BEAT_DUR=2.0`, `PAUSE_GAP_S=0.35`; a beat flushes on sentence end (`.!?`) or gap ≥ 0.35 s once ≥ 2 s long; then short beats are merged into the previous. Simple, reusable for any "cut a monologue into beats" tool.

### f) ffmpeg assembly tricks — `scripts/assemble.py`
- **Segment padding to narration**: each beat's shot durations are stretched (`setpts=factor*PTS`) so `sum(durs) ≥ narration_dur + 0.5 TAIL`, with `tpad=stop_mode=clone` for freeze-frame fill.
- **Blurred-blur backdrop** for aspect fill: `split → [s0] scale+crop+boxblur=26:2,eq=brightness=-0.05 [bg]; [s1] scale=decrease [fg]; overlay`.
- **Sidechain ducking with explicit params**: `sidechaincompress=threshold=0.08:ratio=6:attack=15:release=250`, then `amix=weights=1.2 0.7`. (We have our own ducking; theirs is a compact alternative to loudnorm-sidechain mixes.)
- **Caption accent color extracted from the keyframe** — `scripts/text_overlay.py: accent_color()` quantizes the frame to 24 colors, filters `sat ≥ 0.45`, `0.35 ≤ val ≤ 0.92`, scores `sat*val*count**0.3`, picks the winner → caption underline color. Nice "palette-locked per film" automation for us: derive UI accents from the rendered frame rather than hardcoding.

### g) Voice roster — `references/voices.md`
MiniMax voice IDs with per-tone mapping ("English_expressive_narrator for documentary explainers, English_Upbeat_Woman for product ads") — only useful if we ever switch TTS providers; Edge TTS covers us.

## Comparison with our make-vox
Ours: frame-pure Remotion + measured QA + deterministic; theirs: AI-generated imagery + generative video motion, zero determinism, no QA beyond assembly. **Their pipeline answers a question we don't currently ask: "what if the collage art itself is generated?"** The reusable ideas are prompt formulas, theme presets with motion amplitude, camera vocabulary, style bake-off gate, and the accent-color extraction — all portable into our animate/make-vox docs. The Veo/A-roll/C-roll generation flows need MUAPI keys and are out of scope.

## Verdict
- **ADOPT (docs/prompt patterns)**: the 5-part image prompt formula, theme catalog with `motion_style` amplitude, `CAMERA_VOCAB` + strict constraints text, "designing for animation" rules, FACE_LOCK/FREEZE identity-lock prompt pattern → useful for `make-vox` (if we ever add an AI-asset path via FAL/MuAPI) and for any `make-ai-short` resurrection.
- **ADOPT (code)**: `accent_color()` (keyframe → caption accent), ASR beat segmentation constants, ffmpeg blurred-backdrop fill, `sidechaincompress` ducking params as an alternative recipe.
- **REJECT (pipeline)**: paid MuAPI dependency, non-deterministic output, no frame QA — violates our craft laws.

---

# 2. bangtutorial_bang-motion (v1.19.0)

## Architecture
- Single-file **HTML + CSS + GSAP (+ Three.js optional)** motion graphics; deliverable is `index.html` that autoplays + loops with NO player; export via puppeteer frame-by-frame (`scripts/export-frames.mjs`) → ffmpeg. This is philosophically our "animate" engine, but with GSAP timelines instead of pure `drawFrame(t)` — determinism law: **"Deterministic or die: not one line reads the system clock; all visuals are pure functions of `tl.time()`"** (SKILL.md Hukum #2).
- Stacks: 7 starter templates (`assets/starter-opener.html`, `starter-explainer{,-kartun,-jurnalisme,-katalog,-sketsa,-panggung}.html`), 8 reference docs (~3,800 lines), an AE/Higgsfield MCP bridge, and a rich toolchain (`snap.mjs` verification, `vo-pauses.html` browser-based silence detector, `kepala-ekspressi.py` local face-expression generator).

## The pieces we lack (with quotes)

### a) Mechanically checkable anti-PPT laws — SKILL.md "Larangan struktural"
8 structural prohibitions that can be checked *from the code*, e.g.:
> 1. `grep -c "class=\"scene\"\|<section"` — if ≥ 3 scenes are `<section>`s toggled by `autoAlpha` → it's a slide deck. Scenes must change because the WORLD/CAMERA moves.
> 4. Ken Burns (scale 1.0→1.05 on photos) as the only motion → PPT. Motion every second must come from the chosen background-motion language menu.
> 7. "A miniature is a slide": camera zoom < 1.08 so a house is thumb-sized and empty ground fills half the screen → still PPT even though everything moves.

This is a level of *pre-code design QA* we don't have: our review.mjs catches text cutoff and frozen time, but nothing forbids "slide-deck structure". Their list is grep-able and would map well onto our animate skill's review.mjs as a static lint.

### b) Word-emphasis menu + typography hard rules — `references/techniques.md` §1
A 7-row menu for keyword emphasis (`tanpa/pill/under/marker/box/color/strike`) with CSS+JS recipes (`.hl` with `<i>` that `scaleX 0→1`, punctuation as a separate `.txt2` element that pops last). Hard rules:
> Sentence case weight 500–600. ALL-CAPS + 800 weight only for ONE emphasis scene. Titles/claims default WITHOUT periods; punctuation only if it changes meaning or rhythm. Two consecutive scenes must not match in size, direction, or text position.

Also the "pocket" contrast rule (§1b): **under text, background luminance must be ≤ 25% or ≥ 80%, never "busy mid"; background elements ≤ 0.35 opacity in the pocket, ≤ 40 bright elements; grayscale test — no background part as bright as the letters.** That is a *measurable* legibility gate we could actually implement in review.mjs (frame sampling in the caption band).

### c) Directional motion blur via `feGaussianBlur` — `references/techniques.md` §2
> CSS `filter: blur()` blurs in all directions → looks "out of focus". AE motion blur blurs ALONG the motion. `feGaussianBlur` takes separate `stdDeviation="x y"`:
> ```js
> f.setAttribute('x','-70%'); ... 'width','240%';  // widen the filter region (default clips the tail)
> blur.setAttribute('stdDeviation', `${v} ${v*0.08}`);  // horizontal motion
> ```
> Attach the filter when the tween starts, DETACH when done (`filter:'none'`) — an element that keeps an SVG filter is re-rasterized every frame (expensive).
We have named-easing laws but no motion-blur recipe; this is directly portable to both Remotion (SVG filter) and canvas (directional blur draws).

### d) Shot-size camera system (CAM rig + `frameOn`) — `references/techniques.md` §3b
A compact rig: `const CAM = {s, fx, fy}` with `applyCam(t)` including edge-clamping so world edges are never exposed, plus a helper that computes the scale needed so a given element fills a given fraction of frame:
> `const frameOn = (el, fill) => { const r = rectIn(el, world); return [Math.max(1, Math.min(W*fill/r.w, H*fill/r.h)), r.x+r.w/2, r.y+r.h/2]; }`
> `shot(at, dur, s, fx, fy)` = tween; `cutTo(at, ...)` = jump at a cut. "Camera welcomes, doesn't chase" — text appears AFTER the camera arrives, not mid-move. Overscan: world must be larger than frame.
Our make-on-script fusion has camera primitives but nothing this systematic about shot-size vocabulary (wide/medium-close/close computed from element geometry).

### e) The 12-entry background-motion menu (§7c) and background-surface menu (§7d)
"Motion every second" ≠ things flying sideways. Menu includes: textured bg + breathing camera; big gradient drifting (8–15 s); floating blobs; grain living (offset from `t`, deterministic); one light sweep per segment; huge brand shape rotating 20–40 s; rising particles; breathing grid; giant ghost text; Ken Burns + parallax; horizontal flow ONLY for speed themes; alternating palette fields. Surfaces menu with CSS (horizon glow, duotone diagonal, mesh blobs, spotlight+tint, layered sky, texture+tint, grainy-gradient). This is a "background language" taxonomy we don't have — our animate styles each invent one.

### f) Grainy-gradient recipe incl. encode survival — `references/techniques.md` §7d
> `feTurbulence baseFrequency .8, numOctaves 3` + `feColorMatrix saturate 0`, overlay at opacity .22; deterministic grain: `const k=Math.floor(t*12); translate(k*37%60-30, k*61%60-30)`.
> Encode with `-crf 10–12 -tune grain` and check the MP4 — grain that's too fine vanishes at upload resolutions; slightly larger grain survives compression. (We hit exactly this with hqdn3d GIF denoising in task 1 — their rule is the general form.)

### g) Explainer craft — `references/explainer.md`
- **Six explainer styles** with full recipes: cartoon collage, visual journalism (black + real photos + yellow highlighter), white catalog (grid + cutouts + mixed type), vintage sketchbook (sepia engravings, `mix-blend-mode:multiply` so ink "soaks" into paper), continuous action (one hero never leaves frame), puppet stage.
- **"One scene = 3–5 stacking elements"**: each VO phrase ADDS one element; old ones stay; final state has subject + evidence + scale + date-stamp + scribble. "Repetition for scale: one photo multiplied into a grid with `back.out` stagger reads better than a number alone."
- **"Entities that are named MUST appear"** — every person/company/product named gets its photo in that scene, with a source-order (free-license → official og:image → user → labeled illustration; never generate real faces).
- **Camera choreography**: "born in close-up (z≈1.4) → glide to second asset → zoom out to HOME → FREEZE; text only after zoom-out FINISHES (≥0.1 s after `home()`)" — with the reason: text born mid-zoom "feels cut off".
- **Mobile legibility hard table**: body ≥ 44 px, labels ≥ 34, credits ≥ 30, handwriting ≥ 48, title ≥ 100 px on a 1080-wide stage — "no text under 30 px, period. If info doesn't fit, cut it, don't shrink it." (Direct upgrade for our caption-band rules.)
- **VO delivery protocol**: build first with reading timing, deliver `index.html` + full VO script IN the closing message, user records/generates and returns audio, then **retime by mapping scene boundaries linearly** (`T(t)` from OLD bounds to NEW whisper/silence bounds; tween durations preserved, only positions stretch; push-through transitions recomputed in new time as `T(cut)-0.9`). Their `vo-pauses.html` is a browser-based `silencedetect` equivalent (Web Audio RMS, −30 dB relative to peak, 0.45 s min pause, 0.8 s paragraph) — for us this is a zero-dependency alternative when ffmpeg isn't around, though we already have whisper word times.

### h) The map-simulation recipe (angle-change catalog) — `references/explainer.md` "Sudut pandang WAJIB berganti"
A table mapping each *fact type* to its *instrument*: speed → driver-cabin speedometer; route → map simulation with `getPointAtLength` marker + tangent rotation, stations popping at length fractions, camera zoom 2–2.5× following then relaxing; terrain → elevation profile; time comparison → "map race: three markers depart together, one arrives while the other is ¼ of the way — not a panel"; capacity → interior corridor with seats lighting in sequence; scale → head-on approach. Rule: **no 3 consecutive scenes with the same angle; each new fact ideally gets its own instrument.** This is directly relevant to our make-map and to a future 3D-cutaway skill's "instrument per fact" rule.

### i) Puppet-stage rig (kartun-panggung) — `references/kartun-panggung.md`
- Camera NEVER wide (zoom 1.08–1.95; reference project keyframe plan: 1.95→1.08 · 1.65→1.14→1.18 · 1.90→1.12→1.36).
- Between stages: cut or 96 px/72 px slide with ≤10 px blur, formulas: exit `offset = -d·q²` over 0.28 s, enter `offset = +d·(1-q)³` over 0.42 s, NO scale bump.
- **Every stage ≥ 10 moving objects** (fan `t·100°`, meter needle, status lights, water drops following pipe path parametrically via `getPointAtLength`, cracks via stroke-dashoffset...).
- **Joint rig with null-per-joint proxies** because GSAP `transformOrigin` on SVG is bbox-relative (bbox moves when children animate) and GSAP `x/y` tweens clobber existing `translate`. Their solution (this is THE answer to rigged SVG):
```js
function J(el,tx=0,ty=0){const j={el,tx,ty,x:0,y:0,r:0,sx:1,sy:1,
  apply(){el.setAttribute('transform',`translate(${j.tx+j.x},${j.ty+j.y}) rotate(${j.r}) scale(${j.sx},${j.sy})`);}};
  j.apply();return j;}
tl.to(j,{r:-62,duration:.42,onUpdate:j.apply},at);   // rotation axis = local origin
```
- Idle animation numbers: body ±1.1°/1.7 s, head ±1.7°/2.3 s, arms ±1–1.5°/1.9 s, **blink every ≈3.5 s for 0.13 s** (offset per character). Walk: `step=sin(t·8)`; thigh `step·15°`, shin `max(0,step)·18°`, bob `|step|·3–4 px`, ellipse shadow follows.
- **Zero captions; text is diegetic only** (signs "AIRLOCK", tube labels "O2"). "If the viewer needs to read, the picture hasn't explained it yet."
- Head pipeline: generate ONLY the head with a strict prompt ("eyes ONLY TWO SMALL SOLID BLACK DOTS, no sclera... a clean silhouette for a cutout animation puppet"), then `scripts/kepala-ekspresi.py` detects pupils/mouth via connected components (numpy+cv2) and locally renders happy/worried/shocked + blink variants — no re-generation, deterministic, cheap.

### j) Verification discipline — SKILL.md step 5 + `scripts/snap.mjs`
> "You cannot watch video; you can only see FRAMES. Shoot 6–20 key seconds with snap.mjs, tile into a contact sheet, judge like a director: text cut off? overlapping? text appearing before the camera finished? still feels like slides? DO NOT render all frames to check — full render is only for export."
`snap.mjs` seeks via `OPENER.seek(t)` (defined as `tl.pause(t,false); applyCam(); gsap.ticker.tick()` — the `false` is critical so GSAP callbacks fire during scrub) and screenshots after double-rAF. Our review.mjs + contact sheets are equivalent, but their **"?debug=1 scrub panel + ?clean=1 export hold + hidden R/space keys"** and the rule "preview ≠ export are two different things" is a nice UX split we could adopt in animate pieces.

### k) Pitfall table — `references/techniques.md` §10
Real bug catalog with causes and fixes: bloom threshold low → white frame; specific CSS selector beats initial `opacity:0` → element precedes its animation; SVG filter region 110% clips blur tails; split before fonts loaded → wrong widths (wait `document.fonts.ready`); tabular-nums + min-width for running numbers; rAF throttling in hidden tabs → provide explicit `seek()` for puppeteer. Our animate skill has hit several of these (fonts.ready, tabular-nums); porting the whole table into our STUDIO-CRAFT.md is cheap insurance.

## 3D/cutaway relevance
- Three.js is "one background language of eight" in the opener starter (nebula FBM plane with `NormalBlending` NOT additive — additive stacks through bloom → white; dust 1000–1500 Points size ∝ 1/z; fwidth-antialiased grid faded BEFORE horizon so lines don't pile into a bright band; extruded beveled `Shape` ornaments rotated with sinus ±0.55 rad never full Y; UnrealBloomPass strength .75–.95 threshold .52).
- The `kartun-panggung` "well & soil cross-section" stage (surface at y≈520, stacked layers, aquifer, labeled suction pipe) is effectively a **2D cutaway law set**: layers stack, camera tilts to follow steam, character height 0.85 when underground so head + aquifer fit one frame at zoom 1.08. Relevant reference for our Three.js cutaway skill's framing rules.
- AE bridge (`references/ae-bridge-higgsfield.md` + `scripts/ae/bridge/rig-tokoh.py`): builds the same puppet rig as native AE shape layers (~90 ops per character) via MCP — not applicable to us, but its CAM-null formula `CAM.Position=[960−x·z, 540−y·z], CAM.Scale=[100z,100z]` is the same math as our `applyCam`.

## Verdict
- **ADOPT-EXACTLY (mapped)**:
  - anti-PPT structural laws + grep-able checks → `animate/review.mjs` static lint + STUDIO-CRAFT.md.
  - typography rules (sentence case 500–600, no auto periods, emphasis menu, alternating size/direction/position) + pocket luminance ≤25%/≥80% rule → `make-minimal-reel`/`make-on-script` caption QA + review.mjs measurable check.
  - `feGaussianBlur` directional motion blur recipe → fusion kit + animate styles.
  - CAM rig + `frameOn()` shot-size system → make-on-script fusion (camera welcomes, text after arrival, edge clamp, overscan).
  - background-motion menu (12) + surface menu → style docs; grainy-gradient encode rule (`-tune grain`, check MP4) → delivery/encode docs.
  - explainer mobile-legibility px table → our caption band rules.
  - "entities named must appear" + evidence-hierarchy + 3–5 stacking elements → make-vox/make-on-script script checks.
  - map-simulation + fact→instrument table → make-map + future 3D-cutaway skill.
  - kartun-panggung joint-rig `J()` proxy pattern + idle numbers + ≥10 moving objects + zoom ≥1.08 law → animate cut-paper / future character work; `J()` also solves our TornBits if we ever rig groups.
  - `kepala-ekspresi.py` local expression generation → optional utility for character pieces.
  - pitfall table → STUDIO-CRAFT.md.
- **ALREADY-HAVE**: determinism law, frame-pure (we're stricter — we use `drawFrame(t)` not timeline scrub), contact-sheet review, ffmpeg assembly, single-file HTML delivery.
- **REJECT**: GSAP-timeline as the core engine for us (we're frame-pure; their seek machinery exists to make GSAP scrub-safe — we don't need it), AE/Higgsfield bridge, 16:9 default orientation, no audio/voice QA (they punt VO to the user entirely).

---

# 3. Miftahul-Islam-Efaz_Motion-graphics-skill ("Motion Video Director")

## Architecture
- One 508-line playbook: **plan → paste-ready ElevenLabs script → user generates MP3 → build → fast preview loop → render**. Render pipeline is nearly identical to ours: "deterministic `drawFrame(t)` in Canvas/Three.js → headless Chrome via Playwright, step time per frame → pipe PNG into `ffmpeg -f image2pipe -r 30 ... -crf 18`". Seeded randomness only.
- **Render CLI contract**: `src/render.js` must accept `--from <s> --to <s> --fps <n> --scale <0–1> --out <dir> [--jpg]`. "Every frame depends only on t, so a preview frame is identical to the final frame, just smaller." — this is a formalization of our animate engine worth adopting verbatim (range + scale flags).
- Heavy process scaffolding: PROJECT.md/PROGRESS.md/LOG.md/manifest.json; approval gates at script/plan/preview; never render without explicit approval; `.env` key hygiene (create_env.sh, normalize_env.py, "never print key values").

## Concrete techniques we lack

### a) The fast preview loop (§2b + `scripts/preview.mjs`)
> "Never check a change with a full render or a few random stills. Things that happen BETWEEN stills (cards sliding behind text, cropped elements, bad framing) slip through."
`preview.mjs <from> <to> [--fps 8 --scale 0.25 --cols 6 --mp4]` renders only that range small, tiles ONE contact sheet with a timestamp under every frame (ffmpeg drawtext, fallback ImageMagick montage with labels), optional low-res MP4 with the audio range. Target: one loop under ~20 s. "Fix → re-run the same range → repeat until clean. Only then move to the next scene."
Our review.mjs checks the FULL render after the fact; **the per-scene range preview loop with fixed from/to is the missing middle** — much cheaper iteration.

### b) ElevenLabs scripting craft (§10/10a) — if we ever move off Edge TTS
- v3/v4: no SSML `<break>`; use punctuation (`…` hesitation, `—` short pause, line breaks = breath); audio tags `[excited] [whispers] [curious]` max 1 per 1–2 lines, only where emotion changes.
- **Word budget table**: 15 s = 30–38 words (4–6 lines); 30 s = 65–75; 60 s = 135–150; 90 s = 200–220 (natural VO ≈ 2.3–2.6 w/s; leave 1.5 s for CTA hold). "Count the words in the paste block and state: `≈ 142 words ≈ 58 s at 2.45 w/s`."
- Numbers/units spelled as spoken ("twenty-four seven", "A-I"); brand-name alias pronunciation ("Notion" → "NOH-shun") or v4 IPA; on-screen keywords kept in a SEPARATE list, not in the paste block.
- Always deliver a **variant B hook** for A/B.
- VO intake QA: `ffprobe` + volumedetect/ebur128, transcribe with faster-whisper, **diff the transcript against the approved script and report missing/changed words** before locking beats.json. (We do whisper alignment but never diff against the script — cheap, high value.)

### c) Editing-intensity level system (§4)
5-level table (reel=5 hyper: flashes, glitch, SFX on every beat / SaaS=2 clarity-first: motion supports message / corporate=1 restrained) with the rule: "the more trust the message needs, the less decorative motion. Each effect must serve attention, emphasis, or transition." A useful dial for our make-* routing (our skills are style-first; this adds a per-project intensity knob).

### d) Sound-design mapping table (§9)
> riser (build) → impact (hit) → whoosh (motion); bigger = lower pitch & slower; match SFX length to motion duration; sync the transient to the visual peak frame (±1 frame). UI clicks → interface; swish → text fly-ins; riser → before reveal; sub drop → logo; camera shutter → flash/freeze; paper rip → stickers. Don't SFX everything at intensity 1–2. Mix: VO 10–15 dB above music; music edits on bar lines; −14 LUFS / −1.5 dBTP two-pass loudnorm.
Our suggest-sfx skill covers selection but not the **pitch/size mapping law** or the intensity-linked density rule.

### e) Reference reverse-engineering protocol (§13 + `scripts/analyze_ref.sh`)
`analyze_ref.sh ref.mp4` (first 15 s): ffprobe info; 4 fps contact sheets with per-frame labels; **scene-cut detection `select='gt(scene,0.3)'`** with timestamps; spectrogram; mono 16 kHz audio for whisper. Then a structured breakdown: format & grade / type system (fonts, weights, hex) / per-shot timeline / recurring devices / **SFX map (t → sound → what it syncs to)** / cut rhythm (avg shot length, BPM). Our make-* intake has no reference-analysis step at all.

### f) Four reverse-engineered "recipes" (§14) as taste anchors
Detailed frame-by-frame reconstructions of 4 archetypes (premium caption reel with gradient-fill keywords placed BEHIND the head via matte; cinematic storyteller edit; Slack-style SaaS launch; Frontify-style beat-synced agency promo at ~96 BPM). The shared-taste summary is quotable:
> 1. One accent color carries all emphasis. 2. Keywords get treatment; filler stays quiet. 3. Every sentence = a new visual idea; cut on the first syllable. 4. 2D world, 3D only at peaks. 5. Real proof floats in as cards. 6. SFX mark CHANGES, not every word; silence around the logo hit sells it.

### g) 3D guidance (§11)
> Default to crisp 2D; switch to 3D for hero moments — max 1 big 3D beat per 5–10 s at intensity ≤3. 2D→3D pop (tilt rotateX 10–25°, rotateY 15–35°, extrude 8–30 px, darker side faces) and 3D→2D collapse (shaded object morphs into flat line-art, camera pushes through). Three.js planes textured from Canvas (`CanvasTexture`) so 2D art and 3D share one pipeline. FOV 30–45° = premium, 60–75° = energy. Fake motion blur by averaging 4–8 sub-frames.
Relevant to our Three.js cutaway skill: CanvasTexture bridging, FOV semantics, the 1-3D-beat budget, and the "2D↔3D transition" grammar.

### h) Font research protocol (§12)
Never pick from memory: define type roles → search Fontshare/Open Foundry/Typedump/Font Playground/Dirtyline (license checked) → shortlist with license/weights → **render a type specimen from code with the real headline** → download from official pages only → save the license next to the font → `document.fonts.ready` before frame 0. We lock fonts per skill but have no sourcing/research loop.

### i) Asset hunting with Playwright MCP (§16)
A full loop for browsing Pinterest/Behance/brand sites, judging candidates by screenshot, downloading via `browser_evaluate` reading `img.currentSrc` (Pinterest: swap `/236x/`→`/originals/`), verifying with ffprobe, contact-sheet the picks, `manifest.json` with `use: final|reference-only`. Out of scope for our sandbox but the manifest/credit discipline ("reference-only" flag) is adoptable.

## Verdict
- **ADOPT**: `--from --to --fps --scale` render CLI contract; range-preview loop (< 20 s per loop, same from/to re-run); transcript-diff intake check; word-budget table + spelled numbers (Edge TTS benefits equally); intensity dial (1–5) into routing; SFX size/pitch mapping + intensity-linked density into suggest-sfx; FOV/CanvasTexture/2D↔3D grammar into the Three.js cutaway skill; reference-analysis protocol (analyze_ref.sh) as an optional intake stage for make-on-script; the six shared-taste rules into STUDIO-CRAFT.md.
- **ALREADY-HAVE**: deterministic headless render (theirs is a clone of our approach), contact sheets, loudnorm QA (theirs −14 LUFS vs ours −16), word timestamps.
- **REJECT**: the whole ElevenLabs/user-in-the-loop flow (we synthesize VO ourselves), MCP/API-key scaffolding, stock-asset hunting (we're procedural).

---

# 4. imMamdouhaboammar_motion-graphics-skills (53 skills)

## Architecture
- An **aggregator + originals**: `skills-lock.json` pins third-party skills (leonxlnx/taste-skill, agents365-ai/365-skills...) alongside original content. The 825 MB is `projects/` (rendered films + assets). Real IP:
  - `skills/motion-director/` — 501-line master skill + 15 references (~3,800 lines) + scripts (route_motion.py router, clip-audit.js, work_guard.py, gpu_policy.py, browser probes) + evals.
  - `Failure-lessons/` — 8 post-mortem docs (~1,700 lines) with a formal entry format (context/symptom/impact/root-cause+confidence/fix/verification/prevention rule).
  - `tools/animation-export-kit/render.mjs` — hardened single-file HTML→MP4 renderer.
  - Specialist skills: paper-cut-motion, jump-cut-pacing, speaker-cutout, video-spotlight, tonejs, sfx-picker, video-review-loop, mix-and-match, brand-intake...
- Engine: HyperFrames (external) by default for greenfield work; existing projects keep their own deterministic renderer ("Do not rebuild an engine that already exists" ladder: reuse project → pack skill → HyperFrames → native browser → GSAP → Three.js → custom infra LAST).

## Concrete techniques we lack

### a) The end-hold contract (render-pipeline.md) — the single best QA lesson in the batch
> The end hold broke three separate times, each at a different layer: (1) `-shortest` cut the video back to audio length; (2) grain kept cycling because the composition kept advancing time; (3) the render range clamped to `Math.min(t1, DURATION)`. **Define duration ONCE, in the composition; render range and mux derive from it. Verify the hold on the FINAL FILE by frame count, not by reading the command.**
Fix pattern: `window.seek` clamps to `VO_DUR−1e-4` (tail frames repeat exactly, grain included); mux pads audio `apad=pad_dur=N` and NEVER `-shortest` when a hold exists. Also: "Plan the end hold in the beat map: compute VO-end minus last-keyword at intake; if the hold doesn't fit, decide NOW whether delivery adds a silent tail, and tell the client which ships."
We add tails by feel; this turns it into a measured intake computation + final-file frame-count check (trivially added to our loudness/QA pass).

### b) Thenable readiness hang + decode-error swallowing (render-pipeline.md)
> `build` ended with `return tl`; a GSAP timeline is a THENABLE, so the readiness promise adopted it and waited for a paused timeline — the clip audit hung 25 minutes. Fix: readiness resolves to a plain value; timelines live in a registry. Opposite defect in the same promise: each `decode()` had `.catch(()=>{})`, so a missing cutout still resolved readiness and would render blank — decode failures now reject WITH the asset path.
"A readiness promise should neither hang nor lie."

### c) Determinism under load: never swap resource URLs during capture (render-pipeline.md)
> The grain layer changed tile by assigning a new `background-image` URL every 2 frames. Renders disagreed run-to-run (48–798 frames differ, PSNR 46–62 dB) ONLY under CPU load; idle pairs matched. Fix: all three grain tiles are always-painted layers switched by opacity/position. **Run the determinism check with the second render UNDER LOAD, because an idle pair can pass while the race is still there.**
This is a sharper version of our byte-identical determinism check (we render twice but not under load; and our canvas engine doesn't swap URLs, but the rule generalizes: any fetch/decode starting at seek time can lose the race).

### d) Color-blend midpoint rule (composition-and-transitions.md)
> A crossfade between navy and brand-blue produced LAVENDER mid-frames — a color that exists nowhere in the brand. Never opacity-crossfade two saturated fields; cut, wipe with a shaped mask, or carry one object across (the blue mark from the previous shot stretches into a stroke that floods the frame). When a fade is unavoidable, inspect the midpoint frame.
Directly relevant to our palette-lock law — we should add "check transition midpoints against the palette" to review.mjs (sample frames around cuts, flag off-palette hues).

### e) Other composition lessons (same file)
- Perspective walls converge on the vanishing point in 9:16 — posters from both walls overlapped at the exact spot the headline sits. Fix: face-on depth stack, ≤3 visible, "an object that passes the camera leaves by MOVING, never by turning translucent" (occlusion exit, not dissolve).
- Travelling camera: "every label is owned by its station: it arrives with it and leaves BEFORE it does"; keyframes chosen so each label sits ≥140 px below top when read.
- Text inside a light cone/polygon reveal: check the word's bbox against the cone after narrowing.

### f) `tools/animation-export-kit/render.mjs` — hardened renderer worth stealing wholesale
- Blocks all non-`file:/data:/blob:` requests ("the file must be self-contained") and records blocked URLs.
- Requires `window.seek(seconds)`; optional `window.__ready === true` gate; `document.fonts.ready` wait; **scrollWidth check** (design bigger than frame → hard stop); PNG header size check vs expected; start/middle/end frames saved; start==middle warning ("check that seek really moves"); loop-match check reported in render-log.json; ffmpeg piped via stdin with **backpressure handling** (`once(ff.stdin,'drain')` raced against ffmpeg exit), exit-code verification, 2-minute completion timeout, SIGINT cleanup that deletes the half-written MP4.
- Color management: `-vf scale=in_range=pc:out_range=tv:out_color_matrix=bt709` + `-color_range tv -colorspace bt709` — the correct PC→TV range tagging we should confirm our pipeline has.
- GIF path: `fps=15,scale=540:-2:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse`.

### g) motion-director phases worth porting (SKILL.md)
- **Phase 3 visual mechanism before scenes**: "for every beat solve: message → visual mechanism → transition logic. A good scene is rarely 'text appears, icon appears'. Prefer one object becoming another, a line becoming a path, a chart becoming architecture, a plan standing up into a stage." 
- **Phase 4 motion thesis**: one paragraph answering "what moves, what stays stable, what recurring device carries continuity, dominant transition family, what the film REFUSES to do" — a one-paragraph contract per film (our brief.md is facts-heavy; a motion-thesis paragraph is a cheap discipline upgrade).
- **Phase 7 explore-before-committing**: build 3 genuinely different opening directions (typography-led / object-led / camera-led...), render first 2–4 s, judge first-frame strength/legibility/originality; "do not pick the busiest route by default."
- **Phase 11 still-frame gate** with the exact shot list (first frame, 0.5 s, 1 s, midpoint of every beat, every major transition, CTA, final frame) + `clip-audit.js` — **measures every visible text run against the frame and every clipping container, reports persistent cuts; `--safe` warns near-edge text; designed crops declared with `data-crop="intentional"`**. This is a stronger, DOM-measured version of our canvas text-cutoff detection (theirs reads exact text boxes, ours is pixel-diff).
- **Phase 12 motion gate**: watch twice (sound on normal size; sound OFF phone-size), then "one complete defect scan, fix in one batch, at most one confirmation pass. Do not polish forever."
- **"Trust a check only after you have seen it fail. Reintroduce the defect in a copy, run the check, restore"** — red/green proof for QA tooling (they practice it: rename a font file → check must FAIL; delete a cutout → font gate must FAIL with the path).
- Decision priority ladder (user constraints > brand rules > factual gates > narrative > hierarchy > craft > taste) and non-negotiables ("Do not turn narration into subtitles", "Do not call a film finished after code passes — the rendered film is the product").

### h) video-review-loop skill — the QA framework
- Severity model: **Hard** (delivery contract: wrong dims/fps/duration, audio drift, end hold not proven — blocks signoff) / **Warning** (machine-suspicious: black interval, frozen interval, long silence, clipping risk, VFR signal — needs eyes) / **Review** (machine can't decide: weak hierarchy...).
- "A screenshot can prove one frame. It cannot prove timing, pacing, transition continuity, flashes, dropped or frozen time, audio sync, end behavior."
- `strict_video_signals.py`: surfaces **one-frame luma flashes and extreme frame-to-frame brightness changes** that contact sheets miss. (We have frozen-time detection; we do NOT have flash/single-frame-luma-spike detection — easy ffmpeg signalstats pass, worth adding.)
- Evidence package per round (`.motion-review/rounds/<id>/` with manifest/technical/findings/review.md + contact-sheet + waveform), timecoded findings, bounded rounds.

### i) paper-cut-motion skill (closest sibling to our make-cut-paper)
- 12 fps stepped motion ("smooth interpolation erases the handmade character"), one light source for all shadows, heavy paper stops quickly, **replace sheets by covering/removing, never morph paper into unrelated geometry**, backward seek must reconstruct the earlier frame, seed randomness from stable piece data.
- Evidence hierarchy first: 1 anchor + 3–6 evidence + only needed connectors; "too many pins/strings/stamps turn evidence into decoration."
- Tactile sound only where contact happens (dry paper slide, tape pull, pin click, stamp impact).
Our make-cut-paper is visual-only at 15 fps; the 12 fps stepping + "contact-only SFX" laws are concrete upgrades.

### j) tonejs skill — audio craft
GSAP↔Tone sync via `Tone.getDraw().schedule(cb, time)` (defers DOM writes to the audio-scheduled moment, avoiding drift), Transport-based BPM locking, Analyser waveform/FFT for audio-reactive visuals. We already synthesize scores procedurally; `Tone.Draw` scheduling is the one mechanism we don't use.

### k) Failure-lessons repo hygiene (delivery-and-repo-workflow.md)
"Heavy failed renders out of normal Git history; docs that claim unshipped files; stale outputs; two changes between renders with one wrong culprit — test the smallest part in isolation." The **lessons-index + entry format** (root cause with confidence labels Confirmed/Strongly-indicated/Unresolved) is a culture worth copying for our piece LOG.md files.

### l) Beat-map format (projects/jedar-lesh-majani/beat-map.md)
Scene | Time | VO phrase | Visual, one row per scene, with per-beat specifics ("«سري» stamp lands at 2.48"), plus a section computing the end hold, plus "script requirement checks" (last-5-seconds CTA verified on-screen 54.1→59.0; no music in first 3 s). **Word cues fire 0.1 s BEFORE the spoken word (LEAD)** — a small timing law we could test against our whisper alignment (we currently fire on word start).

## 3D/cutaway relevance
- `title-sequence-3d` skill exists (8–15 s cinematic 3D opener; Three.js); technique-atlas has camera sections (push in, pull out, orbit, whip, rack focus, z-space cascade) and "Depth separation: subject z=0, text behind z=−1, particles z=+1" (also in Efaz). 
- The arabic-motion reference and clip-audit.js solve RTL text metrics — only relevant if we ever do Arabic.
- Nothing Three.js-cutaway-specific (their 3D is logo/product opens); the transferable cutaway knowledge stays with bang-motion's kartun-panggung cross-section stage + Efaz's CanvasTexture/FOV notes.

## Verdict
- **ADOPT**: end-hold contract (3-layer, frame-count check on final file, beat-map computation); readiness-thenable + decode-reject rules; determinism-under-load check; crossfade midpoint palette check; occlusion-exit law; label-ownership law for travelling cameras; `render.mjs` hardening set (self-contained request blocking, scrollWidth check, backpressure, color-range tagging, signal cleanup); motion-thesis paragraph + explore-3-openings phase + still-frame gate shot list; clip-audit.js DOM-measured text audit idea (data-crop intentional declarations); video-review-loop severity model + luma-flash signal audit; red/green proof discipline for QA tools; word-cue LEAD 0.1 s; paper-cut 12 fps + contact-only SFX laws; Tone.Draw scheduling; beat-map format with script-requirement checks.
- **ALREADY-HAVE**: deterministic render loop, contact sheets, whisper timing, brand-locking (brand-intake ≈ our palette-per-film), pack-of-skills organization itself.
- **REJECT**: HyperFrames dependency and its routing/GPU-policy bureaucracy (over-engineered for our scale), the 30+ third-party aggregated skills (font/taste/UI skills are for web design, not film), Arabic/RTL specifics, the Rust CLI contract.

---

# Cross-repo synthesis — top ADOPT list (ranked)

1. **End-hold contract + final-file frame-count check** (imMamdouh render-pipeline.md) → every make-* QA.
2. **Range preview loop** `preview.mjs <from> <to> --fps 8 --scale 0.25` + render CLI contract `--from --to --fps --scale` (Efaz) → animate engine.
3. **Directional motion blur** `feGaussianBlur stdDeviation="x y"` + filter-region widening + attach/detach (bang techniques.md §2) → fusion kit + animate.
4. **Anti-PPT structural laws, grep-checkable** + pocket luminance ≤25% / ≥80% measurable text-contrast rule (bang SKILL.md + techniques.md §1b) → review.mjs + STUDIO-CRAFT.md.
5. **Shot-size camera rig** `CAM {s,fx,fy}` + `frameOn(el, fill)` + "text after camera arrives" (bang §3b) → make-on-script/make-motion-graphics.
6. **Background-motion menu (12) + surface menu** (bang §7c/7d) → style docs; grain determinism `k=floor(t*12)` offset + `-tune grain` encode check.
7. **Mobile legibility px table** body ≥44 / labels ≥34 / credits ≥30 / handwriting ≥48 / title ≥100 (bang explainer.md) → caption-band rules.
8. **Fact→instrument angle table + map-simulation recipe** (bang explainer.md) → make-map + Three.js 3D-cutaway skill.
9. **Luma-flash / single-frame brightness signal audit** + severity model Hard/Warning/Review (imMamdouh video-review-loop) → review.mjs.
10. **Crossfade-midpoint palette check** (imMamdouh composition-and-transitions.md) → review.mjs.
11. **Puppet joint rig `J()` null-proxy pattern** + idle numbers + ≥10-movers-per-stage + zoom ≥1.08 law + 96 px stage transitions (bang kartun-panggung.md) → character/animate work.
12. **12 fps stepped paper + contact-only tactile SFX + evidence hierarchy** (imMamdouh paper-cut-motion) → make-cut-paper.
13. **Transcript-diff intake + word-budget table + spelled numbers + variant-B hook** (Efaz §10a) → VO intake for make-vox/make-on-script.
14. **Editing-intensity 1–5 dial + SFX size/pitch mapping law** (Efaz §4/§9) → routing + suggest-sfx.
15. **Motion-thesis paragraph + 3-opening exploration + still-frame gate shot list + "watch twice: sound-on, then sound-off phone-size"** (imMamdouh motion-director Phases 4/7/11/12) → STUDIO-CRAFT.md.
16. **Vox collage prompt system** (Anil styles.py/prompt-guide.md) → make-vox reference if AI assets are ever enabled; `accent_color()` keyframe→caption-accent extraction now.
17. **Red/green proof for QA tools** ("trust a check only after you've seen it fail") (imMamdouh) → QA culture.
18. **`render.mjs` hardening details**: request blocking for self-containment, scrollWidth vs frame check, PNG header size check, ffmpeg stdin backpressure, SIGINT cleanup, `in_range=pc:out_range=tv:out_color_matrix=bt709` (imMamdouh animation-export-kit).
19. **Word-cue LEAD 0.1 s before spoken word + beat-map with script-requirement checks** (imMamdouh jedar project) → timing docs.
20. **Determinism check under CPU load + never-swap-URL-during-capture** (imMamdouh) → determinism check upgrade.
