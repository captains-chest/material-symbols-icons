#!/usr/bin/env bash
# profile-generator.sh [runs]: times `pnpm sync:icons` (full outline + filled generation) with phase profiling.
set -uo pipefail
runs=${1:-3}; cd "$(dirname "$0")/../.."
out=${OUT:-/workspace/icons/bench-results}/generator; mkdir -p $out; : > $out/times.txt; : > $out/phases.txt
for i in $(seq $runs); do
  s=$(date +%s.%N)
  MSR_SYNC_PROFILE=1 /usr/bin/env node tools/icons/sync-material-symbols-rounded.mjs --target all > $out/run-$i.log 2>&1 || { cat $out/run-$i.log; exit 1; }
  awk -v a=$(date +%s.%N) -v b=$s 'BEGIN{printf "%.1f\n", a-b}' >> $out/times.txt
  grep MSR_SYNC_PROFILE $out/run-$i.log >> $out/phases.txt
done
echo "wall_s: $(tr '\n' ' ' < $out/times.txt)"; cat $out/phases.txt
git diff --quiet -- projects && echo "deterministic: generated files unchanged" || echo "WARNING: generated files changed"
