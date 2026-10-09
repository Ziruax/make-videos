# short-13 · Emergence — "The Traffic Jam With No Cause"

Opens the **emergence** engine (IDEAS #13, first of the 8-new-engines slate). New niche
lib: `lib/agents.tsx` — **22 independently-simulated drivers** on a ring road. The jam is
not keyframed: it crystallises from one brake tap, travels **backward** through traffic,
and every number on screen is measured from the same simulation the composition draws.

**The idea (Sugiyama 2008).** Researchers put 22 drivers on a 230 m circular track and
told them: *drive at approximately 30 km/h, maintain a safe distance.* No bottleneck, no
merge, no accident. Yet a jam appeared — and travelled **backward** through the ring at
roughly 20 km/h. The jam is not a thing, it's a wave: cars flow through it, it flows
through cars.

---

## The facts, verified (and the model that earns them)

| claim | value | source |
|---|---|---|
| the experiment | 22 human drivers, 230 m circular track, "approximately 30 km/h, safe distance" | Sugiyama et al., *New J. Phys.* 10 (2008) 033001 |
| the jam moves backward | "roughly 20 km/h", cluster "maintains its motion" | the same paper (and New Scientist's coverage) |
| what we claim on screen | **−17.9 km/h**, measured | `measureJam(sim, 20, 126)` — our sim, its whole visible life |

**Why the OVM (optimal velocity model, Bando et al. 1995) and not IDM:** the experiment's
ring is 22 cars at 96 veh/km — the density where a *metastable* "30 km/h at ~6 m gaps"
state exists. IDM at this density simply gridlocks (its equilibrium is congested; no wave
ever appears). The OVM with a **sharp confidence curve** (`V(s) = vmax/2·(1+tanh((s−4.2)/0.5))`)
is stable at long gaps — everyone holds 30 like the real drivers did — and violently
unstable when a tap compresses a gap below the confidence point. That instability IS the
mechanism the experiment demonstrated; the model was chosen because it reproduces the
phenomenon, and it says so in its header.

Two bug-hunt notes that generalise (kept in `lib/agents.tsx` comments):

- **The ring wrap.** The gap to the leader must wrap for ANY car whose leader crossed
  the 0/230 boundary, not just `i === n−1`. A queue parked on the wrap point otherwise
  reads a −180 m gap, V clamps to 0, and the queue's front dead-locks forever — the sim
  "works" but the wave never moves.
- **Late reaction means you must also save the cars.** Pure OVM with a slow `aSens`
  physically overlaps cars in the pile-up phase (brake-late drivers). Real drivers brake
  to the floor before touching bumpers — a collision-avoidance term provides that, and
  the hard stop it produces is exactly what makes the wave visible.

**Geometry is true scale.** The ring is drawn at ~8.7 px/m: 230 m ring → 320 px radius;
a 4.5 m car → ~39 px. Nothing is exaggerated; at phone scale a 39 px car with brake
lights is legible, and in the 2.4× zoom phase the same car is 94 px.

**From the measurement runs** (`measure.ts`, same constants as the composition):

- pre-tap: all 22 at 29–30 km/h (the metastable state) for 4+ s;
- one tap (−2.5 m/s² for 0.7 s on car #0) → first jam ~t=7 s, 12/22 cars stopped by t=30;
- the wave: −17.9 km/h backward, cluster of 12 cars, ~6.5 m spacing inside it;
- a free car (e.g. #7) enters the jam at t=44, sits ~17 s while the wave slides
  backwards past it, escapes out the front at t=61 — cars pass through; the wave stays.

---

## Beat sheet (~42 s)

| time | on screen | VO |
|---|---|---|
| **0.0–5.2 · HOOK** | Frame 0 fully composed: the mature jam already on the ring (12 stopped cars, red glow, brake lights), the **gold wave chevron riding the crest** with its dashed trail, title over it. Punch settles 1.05→1. | "This jam is moving." · "It has no cause." · "No accident. No blockage." |
| **5.2–8.1 · SETUP (THE REWIND)** | Sim time runs **backward 28×**: the jam un-forms, cars spread to a uniform 30 km/h ring; camera pushes in toward car #0 (indigo, the future tapper). | "Researchers put twenty-two drivers on a circle." |
| **8.1–11.0 · SETUP 2** | Uniform flow, camera close (2.4×) on car #0. Experiment chip: 22 drivers · 230 m · no exits. | "Drive about thirty. Keep your distance." |
| **11.0–13.4 · TAP** | Car #0's brake lights slam on (its decel comes from the sim). Stamp: ONE TAP. | "Then one driver taps the brakes." |
| **13.8–16.4 · QUIZ** | **Slow-motion ripple (0.4×)**: the tap mid-ripple, brake lights glowing, under the PauseCard. | "Pause. Which way does the jam travel?" |
| **16.8–28.0 · REVEAL** | Real time: the tap hits car #21 — harder (its brake lights flare). The brake-light chain propagates backward 1:1. First full stop (2.2×). Then the wave marker returns and the jam crest begins to rotate **backward** as every car drives forward; camera pulls 2.4→1.0 to keep up. Stamp: BACKWARDS. | "The tap hits the car behind. Harder." · "Every driver brakes a little too late." · "That overshoot becomes a wave." · "And the wave crawls backwards, while every car drives forwards." |
| **28.4–40.6 · TWIST** | Spotlight on car #7 (2.6× sim speed): it slows, stops; the wave slides backwards past it; it escapes out the front. Live mono speed-tag on the car (30 → 0 → 30 km/h). Then the measured wave-speed chip lands. | "Watch one car." · "It slows, it stops, and the wave slides backwards past it." · "It escapes out the front, and the wave carries on." · "Backwards, at about eighteen kilometres an hour." |
| **40.6–42.0 · LOOP** | Title fades back over the still-sweeping wave → rhyme with frame 0 (jam + marker + title + punch 1.0→1.05). | — (no CTA) |

**VO budget:** 101 words, longest line 11 words in 3.4 s ≈ 2.9 wps — inside the
2.7 wps + slack rule.

---

## Signature mechanisms (what makes it re-watchable)

1. **The brake-light ripple.** Lights are driven by each car's *simulated deceleration*
   (cause → effect is automatic): one tap → a red chain reaction you can read from
   across the room, even on mute.
2. **The backward rider.** A gold chevron rides the jam crest with a dashed trail over
   the arc it swept — the one element on screen moving against traffic, which is the
   entire point of the video.
3. **One car passes through.** The spotlight + live speed-tag prove the thesis: the jam
   isn't the cars. Cars escape; the wave persists.

## Production notes

- **The camera is part of the payoff** (short-11/12's lesson): the tap happens at 2.4×
  on car #0 (brake-light detail legible); the wave's growth outruns the frame and the
  camera pulls back to 1.0 exactly when the whole ring needs to be seen.
- **One animated quantity per spoken number** (short-10's rule): the chip lands on
  "eighteen", the stamp on "backwards", the spotlight on "Watch one car".
- **The rewind earns the hook** (short-10/11/12's trick, fourth outing): frame 0 *is*
  the end state of the story; the setup rewinds it; the reveal replays it. The loop
  tail is a rhyme, not a pixel-exact match — an agent sim cannot close a pixel-exact
  loop (car identities differ); the jam + marker + title + punch carry the rhyme, and
  the sim freezes nothing.
- **Sim-time mapping** (video s → sim s), knots stored in `beats.json.sim`:
  `0→85 · 4.9→95.8 · 5.2→95.8 · 8.1→0 · 11→4 · 16.4→6.2 · 19.7→7.6 · 22.3→12 ·
  24.3→16 · 28→34 · 28.4→38 · 38.2→64.5 · 40.6→74 · 42→79`. The hook shows t=85
  (crest at arc ~165 m, upper-left); the loop ends at t=79 sweeping on.
- **On-screen text avoids em-dashes** (brand §1): separators are "·".
- Seeds the **emergence series** (all reuse `lib/agents.tsx`): bird murmurations
  (boids), applause synchronising, the wave at a stadium, panic crowding.
