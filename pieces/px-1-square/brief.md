# px-1-square — "One Square, Fifty Years"

`/make-pixel` example piece. 9:16, 37.7s @ 24fps, 120 BPM, motion on 2s,
voice-driven (Edge TTS + faster-whisper word times, 74/74 words heard).

## Spec

- **The story:** fifty years of screens, told by resolution itself. One
  square — Pong's ball (1972) — never disappears: it becomes a Game Boy
  life (1989), a 16-bit coin, and finally an app icon on a phone whose
  screen holds 2,073,600 pixels. The payoff counts to that number, one
  power-of-two-ish step at a time; the goodbye bounces the icon like the
  ball, with the paddles flashing back in.
- **Format:** resolution-tells-time morph chain. Four eras, each drawn at
  its TRUE low resolution and scaled up nearest-neighbour: 54×96 CRT
  (20px pixels, scanlines, vignette, static) → 90×160 handheld (4 greens,
  LCD grid + ghosting) → 180×320 16-bit (PAL16, parallax clouds, dithered
  sky) → 360×640 phone (3px pixels). Three shape-morph bridges land in
  the narration pauses, on the 8th grid; the square is picked up where it
  homed (the court centre → the heart → the coin → the icon).
- **Style:** pixel — the resolution IS the timeline; no era ever borrows a
  later era's sharpness. Whole-pixel moves only (TT on 2s, everything
  rounded to the low-res grid); sprites are 1-bit patterns mapped to the
  era's palette; the hero walks/hops/jumps through every era and winks at
  the end.
- **The device (sayable):** one square, fifty years — the ball never
  stopped bouncing.

## Beats (voice = the clock)

| # | t | era | the picture |
|---|---|---|---|
| 1 | 1.2–6.05 | 1972 CRT | the serve; the score types on; the paddles track the ball; THE SQUARE blinks on contact; the hero plays |
| 2 | 6.55–8.67 | 1972 CRT | "that one square was the whole game" — the court holds on the ball; the bridge homes it to centre |
| 3 | 9.22–14.3 | 1989 handheld | dithered green dusk; stars; THE SQUARE is a life (heart pixel); pines sway; a beetle walks; the hero hops to it |
| 4 | 14.8–19.18 | 16-bit | color: dithered night, parallax clouds, city windows on the beat; THE SQUARE spins as a gold coin; the hero jumps for it |
| 5 | 19.68–22.87 | 16-bit | the HUD, the slime patrol, "worlds learned to scroll" |
| 6 | 23.42–27.07 | today | the phone home screen; THE SQUARE is the second-row icon; THE COUNT begins |
| 7 | 27.57–31.57 | today | the hush (0.8s scored silence) then THE HIT at 27.0s — the icon glows; "now it's an icon" |
| 8 | 32.12–35.71 | today | the icon bounces like Pong's ball, paddles flash at the edges; the hero winks; the loop |

## Claims + sources

- Pong: 1972, Atari, "a simple game involving two paddles and a ball"
  (Wikipedia "Pong"; atari.com; museumofplay.org). The ball was a square
  on hardware that could barely draw anything else.
- Game Boy: released in Japan April 21, 1989; the monochrome LCD displays
  four shades of green (Wikipedia "Game Boy" — "The screen displays four
  shades"). "Seventeen years later" = 1972 + 17 = 1989. ✓
- "Screens learned color, 256 at a time": Mode 13h is the standard
  256-color mode on VGA, introduced 1987 with the IBM PS/2 (Wikipedia
  "Mode 13h"). The 16-bit era (arcades and consoles) made 256-color
  scrolling worlds mainstream — Super Mario Bros. (1985) "helped
  popularize the side-scrolling platform game" (Wikipedia).
- "The screen in your pocket has over two million pixels": this film is
  1080×1920 = 2,073,600 px — the count counts the viewer's own screen.
- "Fifty years": 1972 + 50 = 2022, and the film renders in the present;
  "fifty years" is the honest round number for 1972→now.
- No trademarked art is drawn: the eras are period-accurate generic
  vocabulary (paddles + square, four greens, parallax city, icon grid).

## Sound plan

- Era-true beeps: the CRT bleeps square waves; the handheld plays a 4-note
  loop (pulse waves, LCD-tight); the 16-bit era runs arps + bass; today is
  airy and quiet. The count ticks; THE HIT at 27.0s is the single loudest
  moment with 0.8s of silence before it; the goodbye is two soft boings
  and the loop.
- Music stem −14 dB under the voice; delivered mix −14.2 LUFS integrated,
  true peak −1.5 dBFS (review-measured).
