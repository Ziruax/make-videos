#!/usr/bin/env bash
# Determinism QA: the same frame rendered twice must give identical pixels.
# Catches unseeded Math.random / Date.now / render state — the vidtsx hard rules
# make these impossible in theory; this proves it on the actual render.
# Usage: bash tools/qa_determinism.sh <CompositionId> [frame,frame,...]
#        (no frames -> 0, middle, last)
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(dirname "$HERE")"
cd "$ROOT/remotion"
exec node scripts/determinism.mjs "$@"
