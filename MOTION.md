# MOTION.md — the motion grammar every TSX track follows

Distilled from motion-video-kit's study of 28 professional launch films (81,647 frames
numerically analysed) + the practice kits, adapted to short-form. Every make-* skill
applies these; this file is the shared reference. Read it when storyboarding and when
a cut feels "fine but forgettable".

## The six rules

1. **The foreground becomes the transition.** A headline, shape or payoff scales
   through the camera with directional blur and stretched edges, while the next beat
   is already in place underneath. There is no empty gap between beats — ever.
2. **One persistent actor.** A selected piece, card, equation, cutout, rail or map
   keeps its identity across beats. Unrelated reveals in sequence feel like a
   slideshow however well each one is animated.
3. **Density comes from hierarchy.** One primary camera/object move, supporting
   staggers on cards and labels, and fine tertiary detail (edge sweeps, status ticks),
   all overlapping. Don't start and stop the whole frame on every beat.
4. **Change speed; don't drift at a constant rate.** Readable target → fast exit →
   slowing arrival. Motion eases INTO a landing so the viewer can read, then leaves
   quickly. Never motionless over ~0.6s.
5. **Smooth doesn't mean dissolves only.** Hard cuts work when subject, scale,
   direction and material language match and motion continues after the cut. When in
   doubt, carry an object through the cut instead (rule 2).
6. **Show the beat as cause → effect.** Scans produce findings, clicks produce
   states, fills produce levels. Every animated action should visibly produce a
   result — motion that decorates without consequence reads as filler.

## Composition rules

- **The lead subject fills 60–85% of the usable frame** in feature beats. A small
  card floating in a big empty field reads as cheap.
- **Vary composition types** through the video: physical macro, wide dimensional,
  overhead/plan, UI close-up, typographic impact. Never repeat "heading above three
  cards" twice in a row.
- **1–2 reading targets at a time.** Dense doesn't mean everything competes; the eye
  must always have an obvious place to land.
- **Type is part of the choreography:** oversized words enter on opposing axes, mask
  or reveal the next beat, and never sit still over busy footage without a backing.
- **Hand objects across beats at exact pixel coordinates.** Pre-position the
  destination so the carried object lands on it: last frame of beat A == first frame
  of beat B for the carried object.
- **One wipe direction and one title position** through a sequence of similar beats.
  The outgoing title leaves BEFORE the wipe; the incoming title enters AFTER it (the
  "Sur|ctions" splice bug).
- **Equal spacing and shared left edges** in lists and rows (identical row heights,
  aligned edges, separators). Viewers notice misalignment before they can name it.

## Pacing numbers (calibrated for 30s vertical)

- **10–15 distinct compositions** per 30s; beats of **1.4–3.5s**.
- **No motionless stretch over ~0.6s** (measured by `tools/qa_frozen_time.sh`:
  near-frozen total ≤ ~1s per 30s).
- **Frame 0 is a finished composition** — never a half-entered word or fade from
  black.
- **Reading holds only where the message lands** (the payoff, the stat, the reveal);
  even there, a slow **3–5% push** (or a 1–2px drift/boil) keeps it alive.
- Loop tail: last frame == frame 0 exactly; end card ~1.5–2s max with gentle drift.

## The mechanism catalog (reusable moves — pick by story, not by novelty)

| Mechanism | What it does |
|---|---|
| Foreground fly-through | The payoff word/shape scales past the camera, revealing a pre-positioned next beat |
| Portal | A dark pupil/logo/hole grows until its inside becomes the next frame |
| Selection → expansion | A selected card expands into the detailed workspace for the next beat |
| Materializing result | The shell appears first, then its regions fill in order (status → value → action) |
| Persistent rails | Lines/paths survive a text swap and connect two states |
| Continuous canvas | The camera moves over one spatial layout; the selected item stays sharp while neighbours blur |
| Artifact ring/orbit | Many small artifacts orbit a stable centre sentence |
| Card stack / fan | Cards arrive and occlude; one becomes a collection, or the collection resolves to one |
| Perspective fold | A panel folds to a luminous strip; the next panel rises out of it |
| Exploded layers | A subject separates into its layers, then recombines |
| Registered decomposition | The source stays recognisable while regions lift into labelled categories |
| Wall → one actor | Information overload collapses to a single clear subject |
| Carousel emphasis | A rotating list with one bright active item and receding neighbours |
| Colour-field takeover | A soft gradient fill for a handoff — once per video, max |
| Tile wipe | A grid of tiles as a chapter break — sparingly |
| Slot machine / spin-slam | Values spin past then SLAM to a stop on the payoff word |

Every video names its **signature mechanisms** in the storyboard (2–3, describable
without effect names) — that's what makes it re-watchable.

## The quality bar (a cut ships only when all hold)

**Measured:**
- Near-frozen time ≤ ~1s per 30s; no single hold > 0.6s outside the payoff — `tools/qa_frozen_time.sh`
- Voice-forward mix: ~−16 LUFS calm / −15.5 LUFS shorts / −14 punchy; true peak ≤ −1 dBFS — `tools/qa_loudness.sh`
- Dynamics: loudness range ≥ ~3 LU energetic, 1.5–3 LU calm (a flat wall reads as stock)
- Determinism: the same frame rendered twice gives identical pixels — `tools/qa_determinism.sh`

**Critic-judged (fresh eyes, `/review-cut`):**
- No empty frames (blank bands before a title lands, lone subjects on empty fields)
- No text collisions, including mid-transition
- Equal spacing, aligned edges, lead subject fills the frame
- Transitions carry an object or a matched direction; never unrelated slide-in after unrelated slide-in
- **On mute, a first-time viewer still gets the payoff** — captions + visuals carry it
- Nothing "basic, empty or slow" — clean is not the same as good

## Audio level discipline (the band rules)

Effects are judged in their own frequency band against the voice/music, not by
full-band loudness (full-band hides a 2–8 kHz spike that reads as annoying):
- Story-critical cues land **~+3–4 dB in-band** over the bed; the ear-sensitive
  2–8 kHz region caps at ~+4 dB.
- Repeated sounds keep consistent levels; soften cues that cluster within ~0.15s
  (×0.6) so they don't stack.
- When a complaint arrives ("that whoosh"), isolate it: render the bed-only version
  and check whether it's the music before touching the SFX.
- Change ONE thing per round and name it by timestamp — the audible window is a
  few dB wide.
