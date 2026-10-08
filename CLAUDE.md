# CLAUDE.md — claude-faceless-shorts-creator

A **faceless-shorts factory** driven by Claude Code. Six production tracks, one repo — the
right skill is picked automatically from the request:

| The user asks for… | Skill | Pixels come from | Projects live in |
|---|---|---|---|
| "make a short about X" (default) | `/make-short` | 100% TSX (Remotion animation) | `shorts/short-N-<niche>/` |
| "make an AI video short", "blue-man video" | `/make-ai-short` | a fal video model (locked recurring character) | `ai-shorts/<series>/` |
| "vox style / documentary / explainer short" | `/make-vox` | layered paper-collage (AI images + cutouts) | `vox-shorts/vox-N-<topic>/` |
| "map video", "war map", "geopolitics explainer" | `/make-map` | data-driven animated map (world-atlas + d3-geo) | `map-films/map-N-<slug>/` |
| "story reel", "documentary reel", "vs video" | `/make-motion-graphics` | photo cutouts + 12fps film-look engine | `mg-reels/mg-N-<slug>/` |
| "minimal reel", "metaphor reel", "tactile/paper short" | `/make-minimal-reel` | layered cut-outs + drawn shapes (+ optional 3D GLB) under a shared paper/halftone finish, 15fps | `minimal-reels/mr-N-<slug>/` |
| "review this video", "is it good enough" | `/review-cut` | — (the fresh-critic Gauntlet loop) | `<proj>/output/critique-log.md` |

All tracks share the same backbone: **script-first intake** (a user-supplied script is
adapted — never rewritten — with one confirmation round before voice/pixels), a
`beats.json` contract, a voiceover with word-exact captions, the **MOTION.md motion
grammar + quality bar** (six rules, composition density, pacing numbers, mechanism
catalog), frame-by-frame QA at phone scale, measured QA (frozen-time, loudness,
determinism) + the on-mute payoff test, library-first SFX (`/suggest-sfx`), optional
music bed, seamless frame-0==last-frame loops, no CTA outros. TSX crash rules live in
`/vidtsx-2d-generator`; the fresh-critic Gauntlet lives in `/review-cut`.

**Voice: Edge TTS by default** — free, no API key, the USER names the voice
(`tools/gen_voice_edge.py`, e.g. `--voice en-US-ChristopherNeural`; `--list-voices`
browses). ElevenLabs `tools/gen_voice.py` remains for emotion-tagged narration (needs
ELEVENLABS_API_KEY). Both write the same beats.json + vo.gen.ts contract.

## Layout

```
tools/            Python tools: gen_voice_edge (Edge TTS), gen_voice (ElevenLabs), gen_sfx,
                  gen_music, mix_sfx, mix_music, gen_chords, gen_image, gen_clip,
                  bakeoff_clip, cutout, capture_web + qa_frozen_time.sh, qa_loudness.sh
remotion/         the Remotion project — src/lib/ (shared kits: shorts, engine, filmlook,
                  collage + niche kits), src/shots/{short-N, ai-N, vox-N, map-N, mg-N, mr-N}/
media/            Remotion's public root: library/ (reusable: sfx, music, logos, textures)
                  + projects/<proj>/ (media for ONE video — incl. committed AI clips & layers)
shorts/           TSX shorts: script.md, beats.json, sfx-plan.json each
ai-shorts/        generative shorts: + character.json (LOCKED reference), shot sidecars, IDEAS.md
vox-shorts/       collage shorts: + DESIGN.md (the visual language — read before any vox work)
map-films/        animated-map documentaries (world-atlas/d3-geo — see /make-map)
mg-reels/         documentary motion-graphics reels (film-look engine — see /make-motion-graphics)
minimal-reels/    tactile metaphor minimal reels (15fps paper/halftone finish — see /make-minimal-reel)
brand.md          the style contract every skill reads (palette, motion, safe areas, SFX taste)
MOTION.md         the motion grammar + quality bar every TSX track follows (six rules,
                  composition density, pacing numbers, mechanism catalog, audio discipline)
IDEAS.md          the TSX-shorts idea bank + niche ranking
.claude/skills/   make-short, make-ai-short, make-vox, make-map, make-motion-graphics,
                  make-minimal-reel, review-cut, vidtsx-2d-generator, suggest-sfx
```

## Conventions (hard rules)

- **Run everything from the repo root.** Tools resolve engine paths (media/library, catalogs)
  against their own location, but project paths (`shorts/...`) against the CWD.
- **Python:** any Python 3.10+ — the core pipeline is stdlib-only. Voice needs
  `pip install edge-tts`; vox layer production needs `pip install pillow rembg`
  (cutout.py) and `pip install playwright && playwright install chromium`
  (capture_web.py). `ffmpeg`/`ffprobe` and `node`/`npx` on PATH.
- **API keys** live in `.env` at the repo root (copy `.env.example`). Never commit `.env`.
  NONE are needed for the TSX/map/reel/minimal tracks with Edge TTS voice. Optional:
  ELEVENLABS_API_KEY (voice/SFX/music) · FAL_KEY (AI clips + images) · GEMINI_API_KEY (images).
- **Asset sourcing ladder:** library catalogs first → the agent's own generation/search
  skills (image generation, web image search, web SFX search) when the library misses →
  repo tools (gen_image.py, gen_sfx.py) when an API-backed artifact is wanted. ALWAYS
  record source + license in a `.json` sidecar or the catalog.
- **Registry is generated:** after adding/renaming a shot, `cd remotion && npm run gen`
  (frames.mjs/render-all.mjs do NOT run it themselves).
- **Media rules:** `media/library/` is for CROSS-VIDEO reusable assets only (each with a
  catalog). Anything generated FOR ONE video (story frames, AI clips, collage layers,
  reel cutouts, map plates) goes in `media/projects/<proj>/`, referenced as
  `staticFile('projects/<proj>/x')`. Reuse before you generate — check the catalogs first.
- **Committed vs gitignored media:** AI-generated clips and collage layers in
  `media/projects/` ARE committed (paid, non-reproducible pixels). `*/voice/` and `*/output/`
  are gitignored everywhere (regenerable); `ai-shorts/*/shots/*.mp4` working copies too — the
  canonical clip lives in `media/projects/<name>/`.
- **Costs (ai-shorts only):** state the derived generation cost BEFORE spending it, and never
  regenerate a locked character from text (see /make-ai-short's iron rules).
- **QA is not optional:** render frames at phone scale and READ them before any full render
  (including the **on-mute payoff test** — captions + visuals must carry the video with the
  sound off); measure the final cut (`tools/qa_frozen_time.sh`, `tools/qa_loudness.sh`,
  `tools/qa_determinism.sh`); flagships get a fresh-critic round (`/review-cut`).
  "No bugs" is not "good" — clean, smooth, error-free versions still get rejected for
  being basic, empty or slow; measure AND judge creatively.
