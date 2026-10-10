# ch-1-enter — "What Happens When You Press Enter"

`/make-crosshatch` example piece. 9:16, 33.6s @ 24fps, 120 BPM, motion on 2s,
voice-driven (Edge TTS + faster-whisper word times).

## Spec

- **The story:** the round trip of one command — you type `ls`, press Enter,
  and the terracotta dot (the command) rides the whole pipeline: the shell
  parses the line, forks a copy of itself, execs the real `ls`, the program
  asks the kernel, the kernel asks the disk, the names come back as bytes,
  and the answer writes itself onto your screen. The payoff: a stopwatch —
  the hand swept a sliver. **0.003 s.** The cursor blinks. Press Enter again.
- **Format:** F5 fixed-hero journey, proven — 10 stations joined by 7 hard
  cuts on the 8th grid + 2 hero-to-hero bridges (down into the machine, back
  out). The dot holds (540, 880) through the byte rush — the anchor, 100%.
- **Style:** crosshatch ink. Warm paper userland by day; navy
  "inside-the-computer" worlds with periwinkle lines by night. The line
  boils; every filled shape carries hatch/cross/pencil texture; the red
  dashed plan draws first (the pipeline), then the journey follows it for
  real — the style's own idiom.
- **The device (sayable):** the dot is the command — it keeps its terracotta
  and asterisk in both worlds, glows in the dark, and ends where it started:
  settled into the cursor line, blinking.

## Beats (voice = the clock)

| # | t | station | world |
|---|---|---|---|
| 1 | 1.2–3.3 | type l, s; Enter clacks; the dot launches from the screen | day |
| 2 | 3.5–6.8 | the line splits: `$` stays with the shell, `ls` becomes the command box | day |
| 3 | 7.0–10.5 | fork: the shell divides; a twin waits, the hero hops to the copy | day |
| 4 | 10.75–14.8 | exec: the code streams in from the folder on disk; the label flips sh→ls | day |
| 5 | 15.0–17.6 | **the bridge down**; the kernel fortress; the request card | night |
| 6 | 17.75–19.5 | the disk: platter, tracks, the arm sweeps to the read position | night |
| 7 | 19.75–21.6 | the rush: bytes rise in 16th steps; the names type in above the dot (anchor) | night |
| 8 | 21.75–25.2 | **the bridge out**; the answer writes onto the laptop line by line | day |
| 9 | 25.5–28.2 | 0.7s of scored silence on the completed screen, then the stopwatch hit | day |
| 10 | 28.5–33.6 | the cursor: the dot settles into the prompt line and blinks — the loop | day |

## Claims + sources

The pipeline is the standard UNIX process model, simplified only in depth:
- The shell reads the line and splits it into words (argv) — POSIX Shell
  Command Language, opengroup.org.
- `fork()` duplicates the calling process; `exec()` replaces the child's
  image with the program — POSIX fork/exec; Stevens, *APUE* ch. 1–8.
- `ls` lists a directory by asking the kernel (opendir/getdents64) and the
  kernel performs the block I/O — coreutils/glibc; any OS text.
- "A few milliseconds" for a small-directory `ls` on a warm cache — typical
  measured values (1–5 ms); the stopwatch shows 0.003 s, consistent with the
  claim. Simplification noted: with a warm cache the kernel may answer from
  memory, not the platter — the piece shows the cold path.

## Sound plan

Paper-groove day theme (D-G-A pad + 8th plucks, the dot's D-Fs-A motif) →
the pitch drops at the bridge (D2 drone + machine pulse + hum) → the 16th
rush rises (bytes ticking, plucks climbing D5→Fs6) — busy, NOT loud → the
day theme returns under the write and **dries up** → 0.7s true silence →
**the stopwatch hit** (stab + sub + chime, the single loudest moment) → the
opening pad, decaying, and soft blink blips. SFX: key clacks, the Enter sub,
the split scratch, the fork blip pair, code-stream ticks, the two whooshes,
platter ticks, the head-seek riser, typing, the stopwatch snap. −14.1 LUFS.

## Review (measured, final run)

7/7 cuts on the 8th grid · 2 bridges on grid · narration 77 words ≤ 3.5 w/s ·
story arc **6/6** (gift loudest; busiest ≠ loudest; silence −51 vs peak −17;
journey present; gift held; goodbye decays) · anchor **100%** (42/42 frames,
max offset 4px) · text PASS (0 cut-off, 0 in safe zone) · dead beats PASS ·
loudest = the hit at 26.0s in the payoff act · **0.7s scored silence before
it** · −14.1 LUFS, TP −1.5 dBFS.
