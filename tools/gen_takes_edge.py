#!/usr/bin/env python3
"""
gen_takes_edge.py — per-line Edge TTS takes for animate pieces.

The animate skill's voice flow (`.claude/skills/animate/tools/voice.mjs`) wants ONE
audio file per script line (a "take"), saved as pieces/<name>/voice/<id>.mp3 with
`"file"` set on the line. This script synthesizes those takes with Edge TTS
(free, no API key) so the whole flow works without the ElevenLabs connector:

  1. write pieces/<name>/voice/script.json:
       { "lead": 1.2, "tail": 1.8,
         "lines": [ { "id": "open", "text": "As it is spoken.", "after": 0.45 }, ... ] }
  2. python tools/gen_takes_edge.py --piece pieces/<name> \
         [--voice en-US-ChristopherNeural] [--rate -4%] [--pitch 0Hz] [--force]
       -> voice/<id>.mp3 per line (cached by text hash in voice/.takes.json)
  3. node .claude/skills/animate/tools/voice.mjs pieces/<name> --model base.en
       -> voice/voice.wav + voice.json (real word times, faster-whisper, local)
  4. piece.json: "voice": { "file": "voice/voice.wav", "music": -14 }
  5. rebuild + export (scenes cued on VOICE move with the voice automatically)

Re-run after editing lines: only changed lines re-synthesize (--force for all).
Voice names: python tools/gen_voice_edge.py --list-voices
"""
import argparse
import asyncio
import hashlib
import json
import os
import sys

try:
    import edge_tts
except ImportError:
    sys.exit("edge-tts is not installed. Run:  pip install edge-tts")

DEFAULT_VOICE = "en-US-ChristopherNeural"  # calm documentary narrator (repo default)


def text_hash(text: str, voice: str, rate: str, pitch: str) -> str:
    h = hashlib.sha256(f"{voice}|{rate}|{pitch}|{text}".encode()).hexdigest()[:16]
    return h


async def synth_line(voice, rate, pitch, volume, text, out_path, retries=3):
    for attempt in range(retries):
        try:
            tts = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch, volume=volume)
            await tts.save(out_path)
            if os.path.getsize(out_path) > 512:
                return True
        except Exception as e:  # noqa: BLE001 - network retry
            if attempt == retries - 1:
                print(f"  FAILED {os.path.basename(out_path)}: {e}")
                return False
            await asyncio.sleep(1.5 * (attempt + 1))
    return False


async def run(piece, voice, rate, pitch, volume, force, dry):
    vdir = os.path.join(piece, "voice")
    script_path = os.path.join(vdir, "script.json")
    if not os.path.exists(script_path):
        sys.exit(f"no script at {script_path} — write it first (see module docstring)")
    with open(script_path, encoding="utf-8") as f:
        S = json.load(f)
    cache_path = os.path.join(vdir, ".takes.json")
    cache = {}
    if os.path.exists(cache_path):
        try:
            with open(cache_path, encoding="utf-8") as f:
                cache = json.load(f)
        except json.JSONDecodeError:
            cache = {}

    jobs = []
    for i, L in enumerate(S.get("lines", [])):
        lid = L.get("id") or f"l{i + 1}"
        text = L["text"].strip()
        # set "file" on the line so voice.mjs finds the take
        L["file"] = f"{lid}.mp3"
        out = os.path.join(vdir, f"{lid}.mp3")
        h = text_hash(text, voice, rate, pitch)
        fresh = force or not os.path.exists(out) or cache.get(lid) != h
        jobs.append((lid, text, out, h, fresh))

    with open(script_path, "w", encoding="utf-8") as f:
        json.dump(S, f, indent=1)
        f.write("\n")

    todo = [j for j in jobs if j[4]]
    if dry:
        for lid, text, out, h, fresh in jobs:
            print(f"  {'SYNTH' if fresh else 'keep '} {lid}: {text[:60]}")
        return
    print(f"{len(todo)} take(s) to synthesize with {voice} (rate {rate}, pitch {pitch})")
    sem = asyncio.Semaphore(6)

    async def one(lid, text, out, h, fresh):
        if not fresh:
            return
        async with sem:
            ok = await synth_line(voice, rate, pitch, volume, text, out)
            if ok:
                cache[lid] = h
                print(f"  ok {lid}.mp3 ({os.path.getsize(out) // 1024} KB)")

    await asyncio.gather(*(one(*j) for j in jobs))
    with open(cache_path, "w", encoding="utf-8") as f:
        json.dump(cache, f, indent=1)
    missing = [lid for lid, t, o, h, fr in jobs if not os.path.exists(o)]
    if missing:
        sys.exit(f"missing takes after synthesis: {missing}")
    print(f"\nnext: node .claude/skills/animate/tools/voice.mjs {piece} --model base.en")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--piece", required=True, help="piece folder, e.g. pieces/my-piece")
    ap.add_argument("--voice", default=DEFAULT_VOICE, help="Edge TTS voice ShortName (default %(default)s)")
    ap.add_argument("--rate", default="-4%", help="rate adjustment, e.g. -4%% (default %(default)s)")
    ap.add_argument("--pitch", default="+0Hz", help="pitch adjustment (default %(default)s)")
    ap.add_argument("--volume", default="+0%", help="volume adjustment (default %(default)s)")
    ap.add_argument("--force", action="store_true", help="re-synthesize every line")
    ap.add_argument("--dry-run", action="store_true", help="show the plan only")
    a = ap.parse_args()
    asyncio.run(run(a.piece, a.voice, a.rate, a.pitch, a.volume, a.force, a.dry_run))


if __name__ == "__main__":
    main()
