#!/bin/bash
# Web clips for the site, cut from the originals in /workspace/cricket/assets/videos (read only).
# Broadly compatible: H.264 Main@3.1, yuv420p, AAC-LC stereo, MP4 with the moov atom first (+faststart),
# rotation baked in (no display-matrix side data), plus a VP9 WebM fallback and a poster frame.
# usage: OUT=<site>/video [ONLY="1 6"] scripts/make_videos.sh
set -e
SRC=${SRC:-/workspace/cricket/assets/videos}; OUT=${OUT:-$(dirname "$0")/../video}; mkdir -p "$OUT"
while read i ss t poster src; do
  [ -n "$ONLY" ] && [[ " $ONLY " != *" $i "* ]] && continue
  IN=$SRC/${src:-clip$i.mp4}
  VF="scale=-2:'min(720,ih)',fps=30,format=yuv420p"
  ffmpeg -nostdin -v error -y -ss $ss -t $t -i "$IN" -vf "$VF" -c:v libx264 -profile:v main -level:v 3.1 -pix_fmt yuv420p -crf 28 -preset slow \
    -c:a aac -b:a 96k -ac 2 -ar 44100 -movflags +faststart -metadata:s:v rotate=0 "$OUT/clip$i.mp4"
  ffmpeg -nostdin -v error -y -ss $ss -t $t -i "$IN" -an -vf "$VF" -c:v libvpx-vp9 -crf 50 -b:v 0 -row-mt 1 -deadline good -cpu-used 2 "$OUT/clip$i.webm"
  ffmpeg -nostdin -v error -y -ss $poster -i "$IN" -frames:v 1 -vf "scale=-2:'min(720,ih)'" -q:v 4 "$OUT/clip$i-poster.jpg"
done <<'L'
1 9 5 11.7
2 15.5 3.2 17.2
3 13 5 14.1
4 1 5 1.2
5 0 5.5 1.0
6 0 5.4 4.6 clip6-harsimran-vs-lasalle.mp4
L
ls -la "$OUT"
