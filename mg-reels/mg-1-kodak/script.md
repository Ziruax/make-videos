# mg-1 · "Kodak vs the Future" — the company that invented its own executioner

The motion-graphics track's first production (`make-motion-graphics`). **1080×1920
@30fps, 32s, 6 scenes @ ~5s** — photo cutouts + textured backdrops, the 12fps
stop-motion engine, the aged-film treatment, and the signature moves.

**THE VOICEOVER IS THE SOURCE CODE** — locked before any pixel. One line per scene:

| # | VO line (locked) | window |
|---|---|---|
| 1 | "In 1975, a Kodak engineer built the first digital camera." | 0.5–4.4 |
| 2 | "Eight pounds. Black and white. Twenty-three seconds a shot. Kodak shelved it." | 5.0–9.6 |
| 3 | "Film printed money. Why kill the machine that prints it?" | 11.2–15.4 |
| 4 | "Then every phone became a camera." | 16.6–19.0 |
| 5 | "In 2012, Kodak filed for bankruptcy." | 21.6–24.2 |
| 6 | "That same year: Instagram. Thirteen people. One billion dollars." | 26.8–30.6 |

## The facts, verified

| claim | value | source |
|---|---|---|
| the invention | Steven Sasson, Kodak engineer, 1975: first self-contained digital camera | Wikipedia / contemporaneous reporting |
| the prototype | ~8 lb, 0.01 MP **black-and-white**, cassette tape, **23 s** per image | widely reported specs |
| the burial | Kodak patented it (1977) but protected the film business ("that's cute — but don't tell anyone", Sasson's retelling) | reported interviews |
| the fall | Eastman Kodak **Chapter 11, January 19, 2012** | court record / press |
| the irony | Facebook bought **Instagram for $1B, 13 employees**, April 2012 — the same year | press |

## The storyboard (scene → look → signature move → assets)

| scene | beat | look | THE signature move | assets |
|---|---|---|---|---|
| S1 0–5.6 | opener | museum wall, framed B&W photo, date plaque "1975" | **zoom-through with weld/detach**: wall accelerates to 6.8× while the photo WELDS to the frame, then the frame flies past and the photo settles full-frame B&W→colour, blurBurst 9px | wall.png, photo1975.png |
| S2 5.6–10.8 | the burial | the boss cutout rises (softSpring) + smoke plume | **screen-blend smoke** glued to the boss + **slot-machine text** that SLAMS on "SHELVED" + hand-drawn wireframe diamonds around the spec props (8 lb / B&W / 23 s) + the punctuation beat (2-frame negative flicker, B&W, red eye glows) | boss.png, smoke.png |
| S3 10.8–16.0 | the money | three headline clippings drop on a paper-strewn desk | **papers drop** (left/right/bottom entrances, −26°→−7°, softSpring 1.1→1.0, boil) + **focus-hunt opener** (blur clearing ~14f) | TSX-drawn clippings (no image) |
| S4 16.0–21.2 | the fall | dusk street, phone cutout | **parallax punch anchored at the base**: street pushes 1.0→1.12 while the phone punches to ~1.7 (the phone outgrowing the wall IS the illusion); shadow = the phone flipped/skewed/blurred from its base; stacked words every ~6f | street.png, phone.png |
| S5 21.2–26.4 | the payoff | dark room, banker lamp, the word in the light pool | **drawn lamp light**: 4 stacked radial gradients + funnel beam on screen blend, ALL parented to the lamp, swinging ±3°; **focus-hunt camera** (defocus → snap → dip → creep 1.08); yellow pencil oval scribble on "BANKRUPTCY" | lamp.png, wall.png (dimmed) |
| S6 26.4–32.0 | the finale | clone of S4 | **clone + reskin**: the fall's parallax punch/shadow/camera kept, words swapped to Instagram's numbers; **the red foam finger** rises bottom-right (0.72→1 over ~12f) and wags "no" (`decaySwing`) on "One billion dollars." | street.png, phone.png + TSX foam finger |

**Signature mechanisms (plain words):** the museum photo welds into the scene and then
tears free in colour; the boss's cigarette smoke is glued to him; the money word slams
in like a slot machine; the phone grows faster than the street behind it; the lamp light
is drawn, not photographed, and sways with the lamp; the finale clones the fall and adds
the wagging foam finger.

## Production notes

- Every scene wraps in `FilmLook grainFile="library/textures/grain.jpg"
  grungeFile="library/textures/grunge.jpg" stepFps={12}` with per-scene grades (S4/S5
  sombre ~0.62 sat; S6 payoff ~0.82).
- Every moving value derives from `posterizeFrame(frame)`; boil on everything; gate
  weave on. Default props inline.
- **Serif-italic captions** pulled word-exact from the VO (the words always win).
- One file per scene (`S1.tsx`…`S6.tsx`, each registered so it previews standalone) +
  `Mg1Kodak.tsx` master that drops them in order in `<Sequence>`s — scene-local frames
  inside the master (THE recurring bug, honoured by design).
- Scene ends are hand-off cuts (matched subject/scale/direction, motion continues).
- No CTA: ends on the payoff line ("One billion dollars.") with the finger still wagging.
- Voice: Edge TTS `en-US-AndrewNeural` (the skill's documentary-voice recommendation,
  rate −4%; the user hasn't named a voice).
- Seeds the **story-reel series**: Blockbuster vs Netflix · Nokia · De Beers · Tower
  Records vs the iPod.
