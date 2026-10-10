# The field survey — 18 GitHub projects analyzed, techniques adopted

Five parallel research agents analyzed 18 external repos against our house system.
Full reports: `research/findings/findings-3-{a,b,c,d,e}.md`. This file is the
adoption ledger — what we took, where it landed, what we rejected.

## The repos

| repo | what it is | verdict |
|---|---|---|
| whaleyxbt/claude-motion | Remotion-style sims: a full Three.js cutaway engine (rocket), Python sfx engine, beat analyzer | **the #1 haul** — became make-cutaway-3d's blueprint |
| Vincentwei1021/anything2explainer | 8-stage multi-agent explainer factory, motion vocabulary, QC scripts | **#2 haul** — timing grammar + QC metrics + probe pattern |
| imMamdouhaboammar/motion-graphics-skills | QA post-mortems with root-cause labels | **#3 haul** — end-hold, determinism-under-load, critic discipline |
| bangtutorial/bang-motion | 3,800-line craft skill: anti-PPT laws, camera rig, mobile legibility | adopted: lint laws + instrument law + legibility table |
| t3knobox/klik-anim-skill-creation | reading-hold arithmetic, measure-motion energy curve, klik-cam grammar | adopted: hold math + energy QA + camera grammar |
| Mort1d/motion-graphics-skills | our closest sibling, one generation ahead in sound+plan-lint | adopted: plan-check idea, score fingerprint, shuffled determinism |
| notivn/AIEV | HyperFrames+Remotion product w/ QC gate server | adopted: SFX onset law, stamp-after-reveal, caption fixes |
| howseen-ai/claude-motion-design | seek(t) engine, subframe motion blur, remake mode | adopted: pops/flash/loop-velocity QA, capture hygiene |
| Barty-Bart/motion-graphics | motion-broll + spring-summation loops | adopted: loop-residue springs; B-roll ideas parked |
| charlie947/motion-graphics-skills | 14 prompt-workflow skills | adopted: MOTION.md intake, 16-effect recipes, delivery gates |
| Miftahul-Islam-Efaz/Motion-graphics-skill | near-clone of our renderer, better iteration loop | adopted: range preview loop, FOV semantics, intensity dial |
| Boriwatopal/agent-skill-remotion-motion-graphics | Remotion 4 silent promos | adopted: dual-ratio layout idea, svg_to_paths; mostly ALREADY-HAVE |
| Anil-matcha/vox-ai-motion-graphics-generator | AI-gen pipeline (MuAPI/Veo) | prompt formula + accent_color() noted; pipeline REJECT (paid, non-deterministic) |
| Sunwood-ai-labs/hyperframes-motion-reel-skill | beat-grid discipline, morph grammar | adopted: beat-grid law references |
| ginonave/Motion-Synthesizer | PixiJS manual tool | adopted: phase propagation + 3D point-cloud ideas (future guest) |
| olegkupshukov/claude-resolve | DaVinci Resolve automation | adopted: TIME_HIJACK pattern + ProRes 4444 alpha notes |
| mikenevermiss/motionpromptgallery | 178 curated prompts (47 w/ code) | the 3D-cutaway prompt corpus — choreography laws extracted |
| zhuyansen/awesome-opus-5.5-video | index of Opus prompts (links only) | taxonomy + idea bank only |

## Adopted → where it landed

| technique | source | landed in |
|---|---|---|
| wedge clipping (2 radial planes + cap, clipIntersection), OFF-table explode, camera keyframe table, label leader-lines + 70px stacking, chapter-gated glow, camera buzz | whaleyxbt sims/engine | `lib/cut3d.tsx` + **make-cutaway-3d** (new skill) |
| dolly-not-zoom (fov constant), camera never enters last beat, probe-a-frame-before-building, "design geometry for the most extreme camera move" | Vincentwei + klik-cam | make-cutaway-3d + STUDIO-CRAFT 3D floor |
| reading-hold arithmetic `max(0.70, 0.25+chars/17)` | t3knobox | STUDIO-CRAFT (holds section) |
| word cues LEAD ~0.1s; stamps land ≥0.10-0.25s after reveal | imMamdouh, AIEV | STUDIO-CRAFT |
| end-hold 3-layer contract (no `-shortest`, apad, verify final frame count) | imMamdouh | STUDIO-CRAFT |
| instrument-never-runs-backward | bang | STUDIO-CRAFT (caught live in c3d-1's depth counter!) |
| the video never numbers itself ("01/06") | Mort1d | STUDIO-CRAFT |
| no opacity-crossfade between saturated fields | imMamdouh | STUDIO-CRAFT |
| anti-slide-deck grep laws | bang | STUDIO-CRAFT |
| red/green QA proofs; one scan-one batch-one pass | imMamdouh | STUDIO-CRAFT + review-cut |
| restates-message-from-frames-first; watch twice; 7-axis ≥8 gate | howseen, imMamdouh, Mort1d | review-crit (full-film critic) |
| SFX by measured onset; bigger=lower+slower; headroom before layering | AIEV, Miftahul | suggest-sfx |
| escape-hatch routing to the 3D cutaway track | — | make-on-script routing table |
| range preview loop; pops/flash/loop-velocity QA; shuffled determinism; subframe tmix motion blur; frame-diff energy curve | Miftahul, howseen, Mort1d, t3knobox | animate/craft.md (field-survey section) |

## Parked (good, no home yet)

- **make-broll** (Barty-Bart's PiP/empty-space detection for talking-head B-roll) — needs a face-footage use case first.
- **Beat/drop analyzer** (whaleyxbt beats.py) — our tracks are voice-clocked; adopt when a music-led track lands.
- **Score-uniqueness fingerprint** (Mort1d) — adopt when the synth score generates >5 films in a series.
- **Phase propagation + text-to-mesh point clouds** (ginonave) — a future fusion guest for make-on-script.
- **TIME_HIJACK deterministic clock for WAAPI/Framer DOM pages** (olegkupshukov) — the animate engine is canvas-pure; adopt if we ever animate DOM-animated pages.
- **Dual-ratio 9:16+16:9 from one code** (Boriwatopal) — needs a client ask; the layout math is noted in findings-3-e.

## Rejected (and why)

- SAM 2.1 local object separation (Barty-Bart): heavy, no use case in our procedural pipeline.
- AI image/video generation as the primary renderer (Anil-matcha, parts of anything2explainer): non-deterministic, unmeasurable — against the house's frame-pure law.
- GSAP timeline cores (bang, Efaz): we're frame-pure; GSAP's wall-clock timelines fight determinism.
- Stock/meme/Mixkit asset flows (howseen): the house is procedural + library-first by policy.
- whaleyxbt's 60fps + dpr 4/3 defaults: too hot for this 2-vCPU box — we run 30fps dpr 1.

## What we confirmed we're ahead on

Every repo family shares: pure-function frames, ffmpeg, contact-sheet review loops.
**Ours alone:** measured LUFS loudness gates, frozen-time detection, byte-identical
determinism QA, whisper word-exact captions, the voice-clock law, one-guest fusion,
the 15fps house identity, GitHub-Release delivery, and now a real deterministic
Three.js cutaway track (nobody in the survey has WebGL + Remotion + determinism
together — whaleyxbt has WebGL but no QA gates; Boriwatopal has Remotion but no
WebGL).
