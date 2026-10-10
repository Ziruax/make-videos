# iso-1-seek — "Fifteen Milliseconds"

`/make-isometric` example piece. 9:16, 33.5s @ 24fps, 120 BPM, motion on 1s
with spring settles, voice-driven (Edge TTS + faster-whisper word times,
66/77 words heard, the rest filled).

## Spec

- **The story:** how a hard drive actually works, drawn as it actually is.
  The sealed box drops in ("no moving parts visible"); the lid opens on its
  back hinge — a true cutaway; two platters spin up to 7200 RPM (marked by
  an orbiting dot and rim ticks — drawn readable, the caption carries the
  true number); one arm holds a head that never touches the surface, flying
  on a cushion of air nanometers above the platter (a camera push, a gap
  bracket, a bob); you save a file — the arm seeks; then THE PAYOFF, in
  1.2 s of scored silence: two bars at true proportion — a blink of your
  eye (300 ms) vs the arm crossing the entire disc (15 ms), 20:1. The hit
  lands in the pause before the line that names it, and the arm crosses
  the disc live on the word "crosses". The goodbye closes the lid: the end
  is the start, changed.
- **Format:** a locked-off build, voice as the clock — no cuts, no morphs,
  one framing; the layers accumulate (plinth → tray → interior → front
  wall → lid → hero → save props → bars). Camera: still, except one slow
  push (z 1.045) to the head for the close-up, pulled back before the
  payoff, and a 1.02 settle push at the close.
- **Style:** isometric line art — 2:1 dimetric, constant hairlines
  (2.0 px at 1080), white faces doing the hidden-line work, painter's
  order, rounded slabs, detail from repetition (vents, pins, track rings,
  barcode), one dark accent per frame: **the read/write head** (the hero's
  eyes aside). The lid is a real slab on a hinge; closed, its fill hides
  the interior; the front wall hides the front slivers — the cutaway needs
  no dissolve.
- **The device (sayable):** your eye blinks in 300 milliseconds; the arm
  crosses the whole disc in fifteen.

## Beats (voice = the clock)

| # | t | the picture |
|---|---|---|
| 1 | 1.20-2.67 | the plinth + drive drop in, the hero lands; a grey LED lamp blinks on the front wall |
| 2 | 3.12-5.36 | the lid opens on its hinge — the cutaway: two platters, the spindle, the pivot |
| 3 | 5.86-8.79 | the spin-up: the marker + rim ticks accelerate; the tick-tock begins |
| 4 | 9.29-12.78 | the arm swings in from the park ramp; the dark head flies over the platter |
| 5 | 13.28-16.57 | the camera pushes to the head; the gap bracket + "five nanometers of air"; the head bobs |
| 6 | 17.12-20.81 | a file card drops, a cable to the SATA port; the arm seeks an inner track (the ring flashes) |
| 7 | 21.31-23.96 | the two bars rise; the blink bar fills with the spoken line |
| 8 | 23.96-24.5 | THE HUSH: the music and the whir stop; the bars hold |
| 9 | 24.5 | **THE HIT** — the seek bar pops to 11 units (true proportion); the arm does the full stroke in ~0.1 s; the hero hops |
| 10 | 24.96-27.71 | the line names it; the arm crosses the disc again, live, on "crosses" |
| 11 | 28.41-31.46 | the lid closes (a soft thunk), the arm parks; the hero hops; the settle chime |

## Claims + sources

- **The head never touches the platter; it flies on a cushion of air:**
  "In a hard disk drive, the heads fly above the disk surface with
  clearance of..." — nanometers (Wikipedia, "Hard disk drive / read–write
  head"; modern flying heights are single-digit nanometers). The drawn gap
  is honestly labelled ("five nanometers of air") and the bracket marks
  where it is; drawn ~250,000× taller than reality (noted in the brief,
  not claimed on screen).
- **7200 RPM** is the standard desktop spindle speed (Wikipedia, "hard
  disk drive"); 7200 revolutions per minute = 120 per second.
- **A blink of the eye: ~300 ms** — typical blink duration 150–400 ms
  (Ranti et al., *Nature Scientific Reports* 2020: "duration of an eye
  blink (typically 150–400 ms)"; Review of Ophthalmology: 300–400 ms). The
  piece says "three hundred milliseconds" — the midpoint of the sourced
  range.
- **The full-stroke seek: 15 ms** — average seek time is ~8 ms with
  full-stroke (max) seeks ~15–20 ms on 7200 RPM desktop drives
  (Wikipedia, "hard disk drive § seek time"; typical spec sheets). "The
  arm crosses the entire disc in fifteen" = the full stroke, honestly the
  slower of the two seek numbers.
- **"Seventy years old":** the first commercial hard drive shipped in
  1956 (IBM RAMAC / Model 350 disk storage — IBM's own history pages and
  the Computer History Museum) → 70 years by 2026, and the mechanism
  still spins in data centers.
- **"Still spinning your files":** bulk cloud storage still runs on hard
  drives (widely reported; the general claim is kept vague deliberately).
- No trademarked art is drawn: the drive is a generic 3.5-inch form
  factor with period-accurate vocabulary (torx screws implied by the
  caption, a warranty sticker joke, a SATA port, a park ramp).

## Sound plan

- A calm D-major bed that thins at the close-up; the **clockwork
  motif** — a tick-tock pair (D4/A4) that tightens to 8ths as the seek
  nears; a synthesized motor **whir** that rises with the spin-up and
  hard-stops at the hush (the piece performs its subject: silence is what
  a drive's speed buys you the right to hear).
- **THE HIT at 24.5 s** (in the pause before l8 names it): a chord stab +
  sub on the sfx bus + the servo down-chirp — measured the loudest 100 ms
  window of the score (−9.0 dBFS), with 1.2 s of ≤ −40 dB scored silence
  before it. Delivered −14.3 LUFS, true peak −1.5 dBFS.
- Servo sweeps for the arm (in, the seek, the hit, the live re-cross);
  soft thunks for the lid and the drop (kept under the payoff).
