#!/usr/bin/env bash
# peakmem.sh <pid> <outfile>: samples RSS (KB) of pid + all descendants every 0.25s, writes running max.
pid=$1; out=$2; max=0
desc() { local p=$1; echo $p; for c in $(pgrep -P $p); do desc $c; done; }
while kill -0 $pid 2>/dev/null; do
  s=0; for p in $(desc $pid); do r=$(ps -o rss= -p $p 2>/dev/null); s=$((s + ${r:-0})); done
  (( s > max )) && max=$s && echo $max > $out
  sleep 0.25
done
