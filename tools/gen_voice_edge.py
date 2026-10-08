#!/usr/bin/env python3
"""
gen_voice_edge.py — Edge TTS (Microsoft neural voices) voice track for a short, driven by
its beats.json. FREE, no API key — the user supplies a voice NAME.

Same contract as tools/gen_voice.py (ElevenLabs): reads a beats.json vo[] (estimated
start/end seconds), synthesizes each line with REAL per-word timestamps (Edge TTS
WordBoundary events), time-fits overflows (gentle atempo, capped), assembles one timed
voice track, and writes ACTUAL timings back into beats.json — captions retime from it.

Lines are generated concurrently with retries; cached by (index, text-hash) so unchanged
lines are never re-synthesized. --force regenerates everything.

Usage:
  python tools/gen_voice_edge.py --beats shorts/short-1-chess/beats.json
  python tools/gen_voice_edge.py --beats ... --voice en-GB-RyanNeural
  python tools/gen_voice_edge.py --beats ... --voice "Guy"            # fuzzy name match
  python tools/gen_voice_edge.py --beats ... --emit-ts remotion/src/shots/short-1/vo.gen.ts
  python tools/gen_voice_edge.py --beats ... --mux remotion/out/Short1Chess.mp4
  python tools/gen_voice_edge.py --list-voices                        # browse voices
  python tools/gen_voice_edge.py --beats ... --dry-run                # plan only

Requirements: pip install edge-tts  ·  ffmpeg/ffprobe on PATH.
Rate/pitch/volume use the Edge TTS syntax: --rate "-4%"  --pitch "+2Hz"  --volume "+0%".
"""
import argparse
import asyncio
import hashlib
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_VOICE = "en-US-ChristopherNeural"  # calm, documentary-leaning narrator
MAX_ATEMPO = 1.3  # never speed a line up more than 30% (same cap as the ElevenLabs tool)
TAG_RE = re.compile(r"\[[^\]]*\]")  # delivery tags like [excited] are ElevenLabs-only

try:
    import edge_tts
except ImportError:
    sys.exit("edge-tts is not installed. Run:  pip install edge-tts")


def run(cmd):
    r = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    if r.returncode != 0:
        sys.exit(f"command failed: {' '.join(cmd)}\n{r.stdout}")
    return r.stdout


def probe_duration(path):
    out = run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
               "-of", "default=noprint_wrappers=1:nokey=1", path])
    return float(out.strip())


async def list_voice_names():
    return sorted(v["ShortName"] for v in await edge_tts.list_voices())


async def resolve_voice(name):
    """Accept a full ShortName, or a fuzzy fragment like 'Guy' or 'ryan'."""
    voices = await list_voice_names()
    if name in voices:
        return name
    low = name.lower()
    exact = [v for v in voices if v.lower() == low]
    if exact:
        return exact[0]
    hits = [v for v in voices if low in v.lower()]
    if len(hits) == 1:
        return hits[0]
    if hits:
        print(f"voice {name!r} is ambiguous; candidates:")
        for v in hits[:12]:
            print(f"  {v}")
        sys.exit(f"pass the full ShortName, e.g. --voice {hits[0]}")
    print(f"voice {name!r} not found. Sample voices (use --list-voices for all):")
    for v in ["en-US-ChristopherNeural", "en-US-GuyNeural", "en-US-AndrewNeural",
              "en-US-AriaNeural", "en-GB-RyanNeural", "en-GB-SoniaNeural",
              "en-AU-WilliamNeural", "en-IN-PrabhatNeural"]:
        print(f"  {v}")
    sys.exit(1)


async def tts_line(voice, rate, pitch, volume, text, out_path, retries=3):
    """Synthesize one line -> mp3 + <out_path>.words.json (per-word start/end seconds,
    Edge TTS WordBoundary events: offsets are 100-ns ticks). Retries transient failures."""
    clean = TAG_RE.sub(" ", text).strip()  # [excited]-style tags are not spoken
    last_err = None
    for attempt in range(retries):
        try:
            comm = edge_tts.Communicate(clean, voice, rate=rate, pitch=pitch,
                                        volume=volume, boundary="WordBoundary")
            words = []
            with open(out_path, "wb") as f:
                async for chunk in comm.stream():
                    if chunk["type"] == "audio":
                        f.write(chunk["data"])
                    elif chunk["type"] == "WordBoundary":
                        words.append({
                            "w": chunk["text"],
                            "start": round(chunk["offset"] / 1e7, 3),
                            "end": round((chunk["offset"] + chunk["duration"]) / 1e7, 3),
                        })
            if os.path.getsize(out_path) == 0:
                raise RuntimeError("no audio received")
            with open(out_path + ".words.json", "w", encoding="utf-8") as f:
                json.dump(words, f, ensure_ascii=False)
            return
        except Exception as e:  # noqa: BLE001 — edge-tts raises assorted transport errors
            last_err = e
            if os.path.exists(out_path):
                os.remove(out_path)
            await asyncio.sleep(1.5 * (attempt + 1))
    sys.exit(f"Edge TTS failed after {retries} attempts for: {text!r}\n{last_err}")


def emit_ts(vo, path, engine):
    """Write the VO (with exact word times) as a TS module the shot imports —
    same shape as the ElevenLabs tool's output, so every shot works unchanged."""
    lines = [f"// AUTO-GENERATED by tools/gen_voice_edge.py — do not edit.",
             f"// Word times are the REAL {engine} WordBoundary alignment; captions sync exactly.",
             "import type { VoLine } from '../../lib/shorts';", "",
             "export const VO: VoLine[] = ["]
    for line in vo:
        esc = line["text"].replace("\\", "\\\\").replace("'", "\\'")
        ws = ", ".join(
            "{ w: '%s', start: %s, end: %s }" % (
                w["w"].replace("\\", "\\\\").replace("'", "\\'"), w["start"], w["end"])
            for w in line.get("words", []))
        lines.append(f"  {{ text: '{esc}', start: {line['start']}, end: {line['end']}, words: [{ws}] }},")
    lines += ["];", ""]
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--beats", help="path to the short's beats.json")
    ap.add_argument("--voice", default=DEFAULT_VOICE,
                    help="Edge TTS voice name, e.g. en-GB-RyanNeural (or a fuzzy fragment)")
    ap.add_argument("--rate", default="-4%",
                    help="speech rate (Edge syntax, e.g. -4%% slightly slower)")
    ap.add_argument("--pitch", default="+0Hz")
    ap.add_argument("--volume", default="+0%")
    ap.add_argument("--mux", help="optional rendered mp4 to mux the voice onto (-voiced.mp4)")
    ap.add_argument("--emit-ts",
                    help="write the VO as a TS module, e.g. remotion/src/shots/short-N/vo.gen.ts")
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--list-voices", action="store_true")
    args = ap.parse_args()

    if args.list_voices:
        for v in asyncio.run(list_voice_names()):
            print(v)
        return
    if not args.beats:
        ap.error("--beats is required (or use --list-voices)")

    voice = asyncio.run(resolve_voice(args.voice))
    print(f"voice: {voice}  rate: {args.rate}  pitch: {args.pitch}")

    beats_path = os.path.abspath(args.beats)
    beats = json.load(open(beats_path, encoding="utf-8"))
    vo = beats["vo"]
    total = float(beats["format"]["durationSec"])
    vdir = os.path.join(os.path.dirname(beats_path), "voice")
    os.makedirs(vdir, exist_ok=True)

    # Plan: which lines need synthesis (cache miss or --force)?
    plan = []  # (index, tts_text, raw_path, start, window)
    for i, line in enumerate(vo):
        start = float(line["start"])
        next_start = float(vo[i + 1]["start"]) if i + 1 < len(vo) else total - 0.3
        window = next_start - start - 0.05
        tts_text = line.get("tts", line["text"])
        h = hashlib.sha1(f"{voice}|edge|{args.rate}|{args.pitch}|{tts_text}".encode()).hexdigest()[:8]
        raw = os.path.join(vdir, f"line-{i:02d}-{h}.mp3")
        plan.append((i, tts_text, raw, start, window))

    if args.dry_run:
        print(f"{'line':4s} {'start':>6s} {'window':>6s}  text")
        for i, text, raw, start, window in plan:
            cached = " (cached)" if os.path.exists(raw) and not args.force else ""
            print(f"{i:4d} {start:6.2f} {window:6.2f}  {text}{cached}")
        return

    todo = [(i, t, r) for i, t, r, _s, _w in plan
            if args.force or not os.path.exists(r) or not os.path.exists(r + ".words.json")]
    if todo:
        print(f"synthesizing {len(todo)} line(s) with Edge TTS…")

        async def synth_all():
            await asyncio.gather(*(tts_line(voice, args.rate, args.pitch, args.volume, t, r)
                                   for _i, t, r in todo))

        asyncio.run(synth_all())

    # Fit + assemble (identical machinery to the ElevenLabs tool)
    fitted = []
    print(f"{'line':4s} {'start':>6s} {'window':>6s} {'clip':>6s} {'tempo':>5s}  text")
    for i, tts_text, raw, start, window in plan:
        fit = os.path.splitext(raw)[0] + "-fit.wav"
        dur = probe_duration(raw)
        tempo = 1.0
        if dur > window:
            tempo = min(MAX_ATEMPO, dur / window)
        if args.force or not os.path.exists(fit):
            run(["ffmpeg", "-y", "-v", "error", "-i", raw,
                 "-filter:a", f"atempo={tempo:.4f}", "-ar", "44100", "-ac", "2", fit])
        fdur = probe_duration(fit)
        overflow = " OVERFLOW" if fdur > window + 0.05 else ""
        print(f"{i:4d} {start:6.2f} {window:6.2f} {fdur:6.2f} {tempo:5.2f}  {vo[i]['text']}{overflow}")
        vo[i]["end"] = round(start + fdur, 2)
        raw_words = json.load(open(raw + ".words.json", encoding="utf-8"))
        vo[i]["words"] = [{"w": w["w"],
                           "start": round(start + w["start"] / tempo, 3),
                           "end": round(start + w["end"] / tempo, 3)} for w in raw_words]
        fitted.append((fit, start, fdur))

    # assemble: delay each line to its start, sum (lines never overlap), pad to length
    voice_wav = os.path.join(vdir, "voice.wav")
    inputs, parts = [], []
    for j, (path, start, _d) in enumerate(fitted):
        inputs += ["-i", path]
        ms = int(round(start * 1000))
        parts.append(f"[{j}:a]adelay={ms}|{ms}[a{j}]")
    chain = "".join(f"[a{j}]" for j in range(len(fitted)))
    fc = ";".join(parts) + f";{chain}amix=inputs={len(fitted)}:normalize=0,apad,atrim=0:{total}," \
         f"loudnorm=I=-16:TP=-1.5:LRA=11[out]"
    run(["ffmpeg", "-y", "-v", "error", *inputs, "-filter_complex", fc,
         "-map", "[out]", "-ar", "44100", "-ac", "2", voice_wav])
    print(f"voice track -> {os.path.relpath(voice_wav, ROOT)}")

    beats["voiceStatus"] = f"edge-tts:{voice}"
    json.dump(beats, open(beats_path, "w", encoding="utf-8"), indent=2, ensure_ascii=False)
    print(f"actual line timings + word maps written back -> {os.path.relpath(beats_path, ROOT)}")

    if args.emit_ts:
        emit_ts(vo, rp := os.path.abspath(args.emit_ts), "Edge TTS")
        print(f"VO TS module -> {os.path.relpath(rp, ROOT)}")

    if args.mux:
        out = os.path.splitext(args.mux)[0] + "-voiced.mp4"
        run(["ffmpeg", "-y", "-v", "error", "-i", args.mux, "-i", voice_wav,
             "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
             "-t", str(total), out])
        print(f"voiced preview -> {os.path.relpath(out, ROOT)}")


if __name__ == "__main__":
    main()
