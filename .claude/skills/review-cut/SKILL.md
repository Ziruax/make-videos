---
name: review-cut
description: The independent-critic review loop (Gauntlet) for any rendered video in this repo — shorts, reels, map films, collages, AI clips. Spawn fresh critics that see ONLY the render + brief (never the builder's reasoning), extract their own frames, judge pixels and measurements, rank defects, verify prior fixes item-by-item, and return SHIP / ONE MORE PASS. Use when the user says "review this video", "critique the cut", "is it good enough", "gauntlet this", "make it better", or automatically as the final QA gate on flagship productions of any track. Complements (never replaces) the frame-by-frame QA in each make-* skill — this is the second pair of eyes.
---

# review-cut — the Gauntlet: builder ≠ judge

A builder grading its own work is how "clean but basic" videos ship. This skill is the
countermeasure, adapted from the motion-video-kit Gauntlet (itself field-proven across
dozens of rounds): every review goes to a FRESH critic that receives only the artifact,
the brief, and the references — and judges rendered pixels, never intentions.

## Rules

1. **Fresh critic every round.** A new agent session (or the user relaying the prompt in
   another tool). Never the builder. Never carry the builder's reasoning into the prompt.
2. **The critic sees only:** the render path (MP4 or a frames dir) · the one-paragraph
   brief (what the video is for, the audience) · the client's/user's own words when they
   exist · the PREVIOUS critic's report (verification rounds only).
3. **Critics extract their own evidence.** They run ffmpeg themselves — a contact sheet
   every 0.2–0.25s, dense 1/30s windows around every transition, crops into details.
   Never hand the critic frames you chose; choosing the frames IS the bias.
4. **Measure, don't vibe.** `tools/qa_frozen_time.sh` (near-frozen time), 
   `tools/qa_loudness.sh` (LUFS/LRA/peak), `tools/qa_determinism.sh <CompId>` (same
   frame twice = same pixels) run on the artifact before or by the critic.
5. **Fix the largest meaningful gap first** — don't average away a weak opening.
6. **Verify, don't assume.** The NEXT round is a new critic checking every prior item:
   FIXED / PARTLY / STILL PRESENT, plus NEW regressions (fixes create defects — z-order
   losses, moved objects crossing headlines, audio clashing with new cuts).
7. **Stop** at the quality bar, at diminishing returns (remaining items sub-frame or
   cosmetic), or when the user says stop — not after N rounds.

## The prompts (copy, fill <>, send to a fresh agent)

### Component critic (before a scene/component joins the video)
```
You are an independent visual critic in a Gauntlet loop; you did not build this. Judge
only rendered pixels.

Artifact: <path to scene/component stills or short proof> (<duration>s, <WxH>, <fps>).
A scene/component for a <genre> short (brand: <palette hex>, <typefaces>). It shows
<one-sentence description of what it should communicate>. Bar: <MOTION.md's quality
bar — composition density, no text collisions, readable landings, deterministic motion>.

Method: extract frames with ffmpeg (a contact sheet every 0.1–0.25s, plus native frames
at <key times>) and look at them. Crop into details: joins, label legibility, collisions,
pops or holds.

Report (under 450 words), also written to <path>:
- Verdict: KEEP / REVISE / REJECT.
- Defects ranked by severity, with timestamps and screen regions.
- The 3 highest-value fixes, implementable in code.
```

### Full-film critic
```
You are an independent, harsh video critic. You did NOT build this; judge rendered
pixels and measurable audio, not intentions.

Artifact: <path> (<duration>s, <WxH>, <fps>fps, with audio). Brief: <what the video is
for, the audience, the one thing it must achieve>. Brand: <palette hex>, <typefaces>.
<If prior round:> Previous critic report: <path>. Verify which issues are fixed.

Method: extract frames with ffmpeg — a contact sheet every 0.25s plus dense frames
around every transition you find — and LOOK at them. Crop into details: text legibility,
collisions, z-order, alignment, sync. Run bash tools/qa_frozen_time.sh <path> and
bash tools/qa_loudness.sh <path> from the repo root and read the numbers.

Report (under 700 words, also written to <report-path>):
1. Per scene: time range, what's on screen, % dead frame, seconds it could lose, ranked problems.
2. Transition defects with timestamps.
3. Audio problems: sync, balance, anything harsh (check the 2–8 kHz region on clicky
   cues — MOTION.md's band rules).
4. On mute: does a first-time viewer still get the payoff? (Sound-off is the default
   viewing state.)
5. The top 6 changes ranked by impact, each implementable in one code edit.
Be blunt; no padding.
```

### Verification critic
```
You are an independent critic; you did NOT build this. Artifact: <new render>. The
previous critic's report: <path>. Timings shifted by ~<x>s (<new scene map>).

For every item in that report's top fixes: FIXED / PARTLY / STILL PRESENT, with
timestamps. Then NEW defects: glitch frames, overlaps, clipped text, awkward
transitional frames, audio regressions. Write the report (under 500 words) to <path>,
ending with exactly one line: SHIP or ONE MORE PASS (at most 3 fixes listed).
```

### Storyboard critic (before any pixels are built)
```
Review this storyboard for a <length>s video about <topic/claim>. You did not write it.
Check: does the chronology hold; is every claim true or labelled; does each beat have a
distinct composition and a job; which beats are filler; does the ending land the payoff
(no filler outro); is the loop honest? Return a ranked list of problems, one concrete
fix each.
```

## Round types

| Round | Artifact | Critic focus |
|---|---|---|
| Storyboard | the beats table | chronology, truth, filler beats, loop honesty, composition variety |
| Component | isolated scene stills + motion proof | the component-critic prompt above |
| Frame QA (each track's own stage) | PNG grids | the track's own checklist (this stays in the make-* skills) |
| Full film | the rendered MP4 | holds, dead space, transitions, text, audio, pacing, on-mute payoff |
| Verification | new render + prior report | item-by-item + regressions + SHIP/ONE MORE PASS |

## The ledger (proof of craft)

Keep `output/critique-log.md` in the project folder, one table per round:
`round → artifact → critic's top findings → changes made → measured result (frozen-time,
LUFS)`. Three real examples of what this loop catches that builders miss:

- a one-frame pop when an ease started at full velocity (fix: smootherstep + tiny stagger)
- ~10s of a 36s render effectively frozen — invisible to the builder, obvious in the
  frame-diff numbers
- a title wipe splicing two words together ("Sur|ctions.") — fix: outgoing leaves BEFORE
  the wipe, incoming enters AFTER it

## Integration with the tracks

Every make-* skill's "measured QA" step is the cheap automatic gate; THIS skill is the
fresh-eyes gate. Run it: always on a new series' first video · on flagships · when a video
feels "fine but forgettable" · when the user asks. Rounds cost minutes; shipping costs
reputation.
