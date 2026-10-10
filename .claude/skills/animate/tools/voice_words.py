#!/usr/bin/env python3
"""Word timings for a voice-over, read from the audio itself (faster-whisper, local, no API).
   usage: python tools/voice_words.py <voice.wav> [--model small.en]
   prints JSON: [{"w": "word", "t0": 1.23, "t1": 1.51}, ...]
Called by tools/voice.mjs; it falls back to an estimate when faster-whisper isn't installed (pip install faster-whisper)."""
import json
import subprocess
import sys


def _decode_audio(path, sr=16000):
    """Decode any audio file to mono float32 numpy at 16 kHz via ffmpeg.

    A drop-in replacement for faster_whisper.audio.decode_audio that avoids
    PyAV version mismatches (av>=19 removed the metadata_errors kwarg).
    """
    import numpy as np
    raw = subprocess.run(
        ['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(sr), '-f', 'f32le', '-'],
        check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32)


def main():
    args = sys.argv[1:]
    model = 'base.en'
    if '--model' in args:
        i = args.index('--model')
        model = args[i + 1]
        del args[i:i + 2]
    import numpy as np  # noqa: F401  (ensures numpy present for decode_audio)
    from faster_whisper import WhisperModel
    m = WhisperModel(model, device='cpu', compute_type='int8')
    audio = _decode_audio(args[0])
    segs, _ = m.transcribe(audio, word_timestamps=True, vad_filter=False, beam_size=5, language='en')
    out = []
    for s in segs:
        for w in s.words or []:
            out.append({'w': w.word.strip(), 't0': round(w.start, 3), 't1': round(w.end, 3)})
    print(json.dumps(out))


if __name__ == '__main__':
    main()
