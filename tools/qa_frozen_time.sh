#!/usr/bin/env bash
# Report near-frozen moments in a render: frame-to-frame luma difference below a
# threshold, sampled at 10fps. Target: total frozen time <= ~1s per 30s of film;
# no single hold > 0.6s except the final CTA/end card.
# Adapted from echris6/motion-video-kit (MIT).
# Usage: tools/qa_frozen_time.sh film.mp4 [threshold=0.35]
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
f="$1"; th="${2:-0.35}"
[ -f "$f" ] || { echo "no such file: $f" >&2; exit 1; }
ffmpeg -hide_banner -i "$f" -vf "fps=10,scale=320:-1,format=gray,tblend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YAVG" -an -f null - 2>&1 \
 | grep -o "YAVG=[0-9.]*" | awk -F= -v th="$th" '
   {t=NR/10; if($2<th){n++; printf "%.1f ", t}}
   END{printf "\nnear-frozen samples: %d (≈%.1fs)\n", n, n/10}'
