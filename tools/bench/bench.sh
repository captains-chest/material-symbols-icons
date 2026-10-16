#!/usr/bin/env bash
# bench.sh <label> [runs]
# Measures the currently checked-out variant of this repo against an Angular SSR consumer app.
# Env: APP (SSR app dir, default /workspace/icons/ssr-test), OUT (results dir), BENCH_TOOLS (dir with puppeteer-core).
set -uo pipefail
label=$1; runs=${2:-3}
repo=$(cd "$(dirname "$0")/../.." && pwd)
APP=${APP:-/workspace/icons/ssr-test}; OUT=${OUT:-/workspace/icons/bench-results}
export BENCH_TOOLS=${BENCH_TOOLS:-/workspace/icons/bench-tools}
res=$OUT/$label; mkdir -p $res/tgz; rm -f $res/*.txt
here=$(cd "$(dirname "$0")" && pwd)
median() { sort -n | awk '{a[NR]=$1} END{print (NR%2)? a[(NR+1)/2] : (a[NR/2]+a[NR/2+1])/2}'; }
kv() { echo "$1=$2" >> $res/results.txt; echo "$1=$2"; }
: > $res/results.txt

# 1. library build (x runs)
cd $repo
for i in $(seq $runs); do
  rm -rf dist; s=$(date +%s.%N)
  pnpm build:lib > $res/build-$i.log 2>&1 || { echo "BUILD FAILED"; tail -30 $res/build-$i.log; exit 1; }
  echo "$(date +%s.%N) - $s" | bc >> $res/buildtimes.txt
done
kv build_s_median $(median < $res/buildtimes.txt); kv build_s_all "$(tr '\n' ' ' < $res/buildtimes.txt)"
for p in material-symbols-rounded-icons material-symbols-rounded-icons-filled; do
  kv dist_bytes_$p $(du -sb dist/$p | cut -f1)
  kv dist_files_$p $(find dist/$p -type f | wc -l)
  kv dist_js_bytes_$p $(find dist/$p -name '*.mjs' -printf '%s\n' | paste -sd+ | bc)
  (cd dist/$p && npm pack --pack-destination $res/tgz > /dev/null 2>&1)
done
for t in $res/tgz/*.tgz; do kv tgz_bytes_$(basename $t .tgz | sed 's/captains-chest-//; s/-[0-9.]*$//') $(stat -c %s $t); done

# 2. install into consumer app
cd $APP
node $here/gen-app.mjs $APP > /dev/null
npm i $res/tgz/*.tgz > $res/install.log 2>&1 || { echo INSTALL FAILED; exit 1; }

# 3. prod build
rm -rf .angular/cache dist
npx ng build > $res/prod.log 2>&1 || { echo PROD BUILD FAILED; tail -30 $res/prod.log; exit 1; }
b=dist/ssr-test/browser
init=$(grep -oE '(src|href)="[^"]+\.js"' $b/index.csr.html | sed -E 's/.*="([^"]+)"/\1/' | sort -u)
raw=0; gz=0; for f in $init; do raw=$((raw + $(stat -c %s $b/$f))); gz=$((gz + $(gzip -9c $b/$f | wc -c))); done
kv prod_initial_files "$(echo $init | tr '\n' ' ')"; kv prod_initial_raw $raw; kv prod_initial_gzip $gz
for sig in 'M433-80q' 'M280-120q'; do
  c=$(grep -l -- "$sig" $b/*.js | xargs -n1 basename | tr '\n' ' ')
  if echo "$init" | grep -qw "$(echo $c | cut -d' ' -f1)"; then where=initial; else where=lazy; fi
  kv lazy_icon_${sig%%-*}_chunk "$c($where)"
done
kv lazy_chunk_bytes "$(grep -oE 'chunk-[A-Z0-9]+\.js +\| lazy +\| +[0-9.]+ [kB]+' $res/prod.log | awk -F'|' '{print $3}' | xargs)"
kv server_bundle_bytes $(find dist/ssr-test/server -name '*.mjs' -printf '%s\n' | paste -sd+ | bc)
h=$b/index.html
kv html_bytes_30icons $(stat -c %s $h)
kv html_style_blocks $(grep -o '<style' $h | wc -l)
kv html_style_bytes $(grep -oE '<style[^>]*>[^<]*</style>' $h | awk '{s+=length} END{print s+0}')
kv html_svg_count $(grep -o '<svg' $h | wc -l)

# 4. ng serve SSR cold start (x runs)
for i in $(seq $runs); do
  rm -rf .angular/cache; port=$((4400 + i))
  s=$(date +%s.%N)
  NG_ALLOWED_HOSTS=localhost npx ng serve --port $port > $res/serve-$i.log 2>&1 &
  spid=$!; rm -f $res/peak-$i; $here/peakmem.sh $spid $res/peak-$i & mpid=$!
  ok=0; for t in $(seq 600); do
    code=$(curl -s -o $res/serve-$i.html -w '%{http_code}' localhost:$port/ 2>/dev/null)
    [ "$code" = 200 ] && grep -q '<msr-home-icon' $res/serve-$i.html && { ok=1; break; }; sleep 0.25
  done
  echo "$(date +%s.%N) - $s" | bc >> $res/servetimes.txt
  [ $ok = 1 ] || echo "serve run $i did not return 200" >> $res/results.txt
  curl -s localhost:$port/lazy > $res/serve-lazy-$i.html
  if [ $i = 1 ]; then node $here/hydration-check.mjs http://localhost:$port/ http://localhost:$port/lazy > $res/hydration.json 2>&1; fi
  sleep 2; pkill -P $spid; kill $spid 2>/dev/null; pkill -f "ng serve --port $port"; wait $spid 2>/dev/null; sleep 1; kill $mpid 2>/dev/null
  cat $res/peak-$i >> $res/peaks.txt
done
kv serve_cold_s_median $(median < $res/servetimes.txt); kv serve_cold_s_all "$(tr '\n' ' ' < $res/servetimes.txt)"
kv serve_peak_mb_median $(median < $res/peaks.txt | awk '{printf "%d", $1/1024}'); kv serve_peak_mb_all "$(awk '{printf "%d ", $1/1024}' $res/peaks.txt)"
kv serve_lazy_html_has_icons $(grep -c '<msr-settings-icon' $res/serve-lazy-1.html)
kv hydration "$(cat $res/hydration.json)"

# 5. storybook
cd $repo; s=$(date +%s.%N)
if pnpm build-storybook > $res/storybook.log 2>&1; then sb=pass; else sb=FAIL; fi
kv storybook "$sb ($(echo "$(date +%s.%N) - $s" | bc | cut -d. -f1)s)"
echo DONE $label
