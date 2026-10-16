# Bundle experiments (Oct 2026)

Goal: reduce the cost of shipping all 4083 Material Symbols Rounded icons (outline + filled), especially for
Angular SSR, under these constraints:

- users keep importing every icon from **one entry point** (no per-icon import paths or packages);
- icons stay **styled automatically** (no extra class or `styles.css` step);
- long library build times are fine. A ~4000-entry-point split is out of scope.

Branches (all off `feat/bundle-experiments`, none merged):

| Branch | What it changes |
| --- | --- |
| `exp/baseline` | Nothing. Today's build. |
| `exp/shared-css` | Removes the per-icon `styles` block. The host directive injects one shared `<style id="msr-icon-styles">` per document (with `CSP_NONCE` support), with the same selectors and specificity. |
| `exp/unflattened-fesm` | Post-build step `tools/icons/unflatten-esm.mjs`: `ngc` partial compilation emits one ES module per icon under `esm2022/`, and `exports["."]` points at `esm2022/public-api.js`. Still one entry point; the flat 14 MB FESM is no longer shipped. |
| `exp/combined` | `exp/shared-css` + `exp/unflattened-fesm`. |
| `exp/ts-to-rust-generator` | Phase profiling for the icon generator (`MSR_SYNC_PROFILE=1`) and `tools/bench/profile-generator.sh`. |

## Results

Library and consumer numbers. Timings are the median of 3 runs (all runs in brackets). Consumer = Angular 22.2 SSR app
(zoneless) with 30 eager icons (28 outline + 2 filled) and 2 icons used only on a lazy route.

| Metric | baseline | shared-css | unflattened-fesm | combined |
| --- | ---: | ---: | ---: | ---: |
| Library build, both packages (s) | 45.8 (47.6/45.8/45.6) | 40.5 (55.0/40.5/40.2) | 73.1 (88.5/73.1/71.9) | 67.6 |
| dist size outline / filled (MB) | 27.4 / 26.9 | 23.7 / 23.2 | 18.8 / 18.5 | 16.3 / 15.9 |
| dist file count (outline) | 7 | 7 | 4093 | 4093 |
| Tarball outline / filled (KB) | 1113 / 1032 | 1088 / 1004 | 1247 / 1163 | 1210 / 1126 |
| Prod initial JS raw / gzip (KB) | 283.8 / 85.4 | 276.2 / 85.6 | 287.5 / 85.1 | 276.9 / 85.3 |
| Lazy-route icons stay in lazy chunk? | no (initial) | no (initial) | no (initial) | no (initial) |
| Server bundle, all `.mjs` (KB) | 1776 | 1757 | 1783 | 1758 |
| Prerendered HTML, 30 icons (KB) | 29.5 | **17.9** | 32.4 | **17.9** |
| …of which `<style>` (bytes / blocks) | 9613 / 30 | **540 / 2** | 12523 / 30 | **540 / 2** |
| Hydration (prod SSR server, `/` and `/lazy`) | OK | OK | OK | OK |
| Storybook build | pass | pass | pass | pass |
| `ng serve` SSR cold first page (s), default prebundling | 39.3 (38.9/39.3/39.5) | 36.1 (36.1/35.3/36.7) | 65.4 (58.2/199.8/65.4) | 52.6 (51.7/53.6/52.6) |
| `ng serve` peak RSS (MB), default prebundling | 6876 | 6518 | 7142 | 6585 |
| `ng serve` cold (s), consumer sets `prebundle.exclude` for the icon packages | 168.2 (53.4/214.3/168.2) | — | **23.4** (23.4/23.2/24.0) | **22.1** (23.3/21.1/22.1) |
| `ng serve` peak RSS (MB), with `prebundle.exclude` | 9231 | — | **4943** | **4919** |
| `ng serve` dev initial JS, with `prebundle.exclude` | 29.43 MB | — | 128.7 kB | 107.5 kB |

A second baseline pass (`baseline-recheck`, same tarballs) gave 39.9 s cold start, which confirms the baseline.
Memory figures are noisy (±10%) because the box is shared.

### Icon generator (`pnpm sync:icons`) profile

One run, because a run takes more than 5 minutes (547.6 s wall time, full outline + filled, Node 24.21):

| Phase | ms | Share |
| --- | ---: | ---: |
| git sparse checkout of the SVG files (2 targets) | 483 188 | 88.2% |
| git ls-tree | 39 350 | 7.2% |
| git clone (blobless, depth 1, once per target) | 23 066 | 4.2% |
| read SVGs | 808 | 0.15% |
| write component files (8166) | 799 | 0.15% |
| sanitize SVGs | 71 | 0.01% |
| clear old files + index/map/manifest | 292 | 0.05% |

The JavaScript work (reading, sanitizing and writing the 8166 files) takes about **2 s of 548 s**. The rest is
git fetching blobs over the network one sparse checkout at a time, twice (once per target).

### TypeScript-to-Rust tool from Theo / T3

- What it is: **tsc-rs (a.k.a. ts-rust)**, https://github.com/pingdotgg/ts-rust, npm `tsc-rs` (0.7.0, 2026-10-14),
  announced by Theo on X on 2026-10-07. Its README calls it "an experimental Rust port of the TypeScript 7 compiler (tsc)",
  a direct, LLM-written port of Microsoft's Go-based native compiler (TypeScript 7, formerly `typescript-go`).
  Same CLI, LSP and options as `tsc`.
- What it is **not**: it does not turn your TypeScript into Rust. It is a type checker and JS emitter written in Rust.
- Related: Microsoft's TypeScript 7 (native Go port, stable since 2026-07-08, `typescript@7`, formerly `tsgo` /
  `@typescript/native-preview`). Theo's March 2025 video "TypeScript just changed forever" was about that Go port.
- Fit for the generator: the generator (`tools/icons/sync-material-symbols-rounded.mjs`) is plain JavaScript with no
  TypeScript compile step, so tsc-rs has nothing to speed up there. Even a hand port of the generator to Rust could
  save at most about 2 s of 548 s. The big win is in the git strategy (see the recommendations).
- Fit for the library build: ng-packagr and `ngc` use the TypeScript **compiler API**. TypeScript 7 has no stable API yet
  (planned for 7.1), and tsc-rs has no Angular compiler, so neither can replace TypeScript inside the Angular build.
  They can only run as a separate plain `tsc --noEmit` check, which does not check Angular templates.
  Typecheck timing, `tsc -p projects/material-symbols-rounded-icons/tsconfig.lib.json --noEmit` (4089 files), median of 3,
  all with 0 errors:

  | Checker | Median (s) | Runs (s) | vs TS 6 |
  | --- | ---: | --- | ---: |
  | TypeScript 6.0 (repo's `tsc`) | 4.95 | 5.27 / 4.95 / 4.83 | 1× |
  | TypeScript 7.0.2 (native, Go) | 0.99 | 0.96 / 0.99 / 1.06 | 5.0× |
  | tsc-rs 0.7.0 (Rust, T3) | 0.41 | 0.44 / 0.41 / 0.40 | 12× |

  Only useful as an optional extra CI or editor check. The library build (`ngc` inside ng-packagr) still needs TypeScript 6.

## Method

- Box: shared Linux VM, 8 vCPU, 15 GB RAM, Node 24.21.0, pnpm 11.1.2, Angular 22.2.x.
- `tools/bench/bench.sh <label> 3` per branch: `pnpm build:lib` 3× (clean `dist` each time), `npm pack` both packages,
  install the tarballs into `/workspace/icons/ssr-test` (`ng new --ssr --zoneless`), write the test app with
  `tools/bench/gen-app.mjs`, then:
  - production `ng build`: initial JS = scripts and modulepreloads in `index.csr.html`, gzip -9 per file; lazy check = which
    chunk holds the path data of the lazy-only `settings`/`delete` icons; server bundle = sum of `dist/server/**/*.mjs`;
    HTML = prerendered `index.html`;
  - hydration: production SSR server + headless Chrome (`tools/bench/hydration-check.mjs`): no console errors, all
    `ngh` markers consumed, and no server-rendered `<svg>` node removed during boot (MutationObserver);
  - `ng serve` cold start 3×: `.angular/cache` deleted, time until `/` returns 200 with icons, peak RSS of the process tree
    sampled every 250 ms. `CI` is unset, because Angular turns off its cache and prebundling when `CI` is set.
    `PREBUNDLE_EXCLUDE=1` adds `serve.options.prebundle.exclude` for both icon packages to the consumer's `angular.json`;
  - `pnpm build-storybook`.
- Generator: `tools/bench/profile-generator.sh` on `exp/ts-to-rust-generator`.

## Findings, pros and cons

**shared-css** — works, low risk.
- Pros: prerendered HTML is 39% smaller for 30 icons (29.5 → 17.9 KB), with 1 `<style>` per package instead of 1 per icon.
  dist is 3.7 MB smaller per package, the library build is a bit faster, and prod raw JS drops 7.5 KB (gzip unchanged,
  because gzip already compressed the repeated CSS well). Rendering is identical: computed size 16×16 / `inline-flex` /
  `0 0 auto` / `currentColor`, hydration is clean, and the client doesn't add a second style element.
- Cons: the styles are global (class-based) instead of emulated-encapsulated. They don't reach into a consumer's
  `ShadowDom` component; that case would need the exported `MSR_ICON_STYLES`. It also writes to `document.head` via `DOCUMENT`
  (SSR-safe, honors `CSP_NONCE`).

**unflattened-fesm** — works, but only pays off together with a consumer setting.
- Pros: with `prebundle.exclude`, `ng serve` cold start drops from 39 s to 23 s and peak memory from 6.9 GB to 4.9 GB.
  The dev bundle becomes 129 KB instead of 29 MB, because esbuild can then drop unused icons in dev too.
- Cons: with Angular's default prebundling it is *slower* (65 s). The library build is ~60% slower, there are 4093 files
  per package, and tarballs are ~12% bigger. Raw `ngc` output also skips ng-packagr's CSS minification, so the HTML grows
  unless combined with shared-css. Prod bundles are unchanged.

**combined** — the best of both: 17.9 KB HTML, and 22 s / 4.9 GB dev with `prebundle.exclude`.

**Lazy-route isolation** — not solved by any variant. esbuild puts every icon used anywhere in the app into a chunk
shared with the entry, because all icons come through the same entry module (FESM file or barrel). Per-icon entry
points would fix this, but they are out of scope. The cost is ~4 KB raw (~1 KB gzip) per icon.

**Prod and SSR server** — every variant is within ±2% for prod initial JS and the server bundle. Tree-shaking already
works in production builds.

## Recommendation

1. Adopt **shared-css** now. It's the only change with a clear user-facing win (smaller SSR HTML) and no downside within the constraints.
2. Adopt **unflattened ESM** (i.e. ship `exp/combined`) **only together with docs** telling SSR/dev users to add
   `"prebundle": { "exclude": ["@captains-chest/material-symbols-rounded-icons", "@captains-chest/material-symbols-rounded-icons-filled"] }`
   to `ng serve` options. Without that setting it makes the dev server slower, so treat it as optional.
3. Generator: don't port it to Rust. Make the git step faster instead: clone once for both targets, run one sparse
   checkout with both variants' paths, and replace `ls-tree` + checkout with a single batched blob fetch. That targets ~95% of the
   548 s.
4. Native TypeScript: TS 7 (5×) or tsc-rs (12×) make a plain typecheck faster, but there is no such step today, and neither can replace TypeScript inside ng-packagr or `ngc`. tsc-rs is also 2 weeks old and LLM-written, so I'd not adopt it. Revisit TS 7 when Angular supports it.

---

# Round 2 (PR #27 follow-up)

Same rules and method as above. Status: complete.

## exp/svg-cache: faster icon generation

The generator (`tools/icons/sync-material-symbols-rounded.mjs`) now builds one **upstream snapshot** for both targets:
one blobless depth-1 clone, one `git ls-tree`, then **one batched `git fetch --stdin` of exactly the 8166 needed blob
IDs** (`git cat-file --batch` to read them). This replaces the two per-target clones and non-cone sparse checkouts.
The snapshot lives in `.cache/material-symbols/<ref>` (git-ignored, override with `MSR_SVG_CACHE_DIR`). The next run
uses it with no network at all. Output is byte-identical: `git diff` on the generated files is empty.

Full outline + filled generation, Node 24.21, same box:

| Variant | Runs (s) | Median (s) |
| --- | --- | ---: |
| main / baseline (2× clone + sparse checkout) | 547.6 (1 run, > 5 min) | 547.6 |
| svg-cache, **cold** (no snapshot) | 22.8 / 23.7 / 22.2 | **22.8** (24× faster) |
| svg-cache, **warm** (snapshot cached) | 2.2 / 2.3 / 2.1 | **2.2** (250× faster) |

Cold-run phases (ms): clone 11 655, fetch ref 2 994, ls-tree 2 156, **fetch 8166 blobs 838**, cat-file 130, write
snapshot 1 707, then the actual generation ≈ 2 100 (read 900, sanitize 78, write 1 005, index/map/manifest ~100).
The old 483 s was the non-cone sparse checkout with ~4000 patterns per target, not the download.

The CI cache key is the **pinned ref from `tools/icons/upstream.json`**, not `git ls-remote`. The ref is already a pinned
SHA, while `ls-remote` would follow the moving upstream branch and miss the cache whenever Google pushes. A whole-repo
tarball from codeload isn't worth it: the repo is multi-GB, and the blob fetch is under 1 s.

Workflow diff (`.github/workflows/ci.yml`, `deterministic-baseline` job):

```diff
       - name: Install dependencies
         run: pnpm install --frozen-lockfile
 
+      - name: Read pinned upstream icon ref
+        id: upstream
+        run: echo "ref=$(node -p "require('./tools/icons/upstream.json').ref")" >> "$GITHUB_OUTPUT"
+
+      - name: Cache upstream SVG snapshot
+        uses: actions/cache@55cc8345863c7cc4c66a329aec7e433d2d1c52a9 # v6.1.0
+        with:
+          path: .cache/material-symbols
+          key: material-symbols-${{ steps.upstream.outputs.ref }}-v1
+
       - name: Run deterministic baseline
         run: pnpm ci:baseline
```

Risk: low. If the cache is wrong or corrupt, delete the directory or bump `-v1`. The snapshot manifest is checked
against the configured ref and family before it is used.

## Ideas that keep the usage contract

Contract: one import, everything bundled, lazy loading as today, automatic styling, no per-icon import paths, no paid CDN.
The estimates are mine, based on the round 1 numbers; "measured" means this round measured it.

| # | Idea | Expected gain | Risk | Verdict |
| --- | --- | --- | --- | --- |
| 1 | **Shared CSS** via the host directive (round 1, `exp/shared-css`) | −39% SSR HTML, −3.7 MB dist | Low. Global class styles don't reach Shadow DOM | **Do** |
| 2 | **Static templates** (`exp/slim-template`): `viewBox`/`focusable` become static attributes; `ariaLabel` input and aria bindings move to the shared host/svg directives, so each icon is a class with no body plus a static template | Less per-icon compiled code, so a smaller FESM and faster dev linking | Low–medium. `ariaLabel` is now a host-directive input: the template API is unchanged, but code reading `component.ariaLabel` directly breaks | **Prototyped** |
| 3 | Compress path data (zig-zag varint + base64, decoded at runtime) | Raw −3% | Runtime decode on every render, SSR CPU | **Rejected (measured):** gzip gets *worse*, 0.610 → 0.971 MB for all outline paths. gzip already squeezes the ASCII path syntax well |
| 4 | Shared path dictionary / dedupe outline + filled | 1394 of 4083 icons (34%, 770 KB raw) are identical in both variants | Needs a shared data package or filled→outline dependency. Only helps apps that use the same icon in both variants | Not worth it |
| 5 | `<symbol>` sprite per document + `<use href>` (SSR-safe registry like the shared CSS) | Saves path bytes only when the same icon repeats on a page (lists, tables) | Hydration ordering, id collisions, Shadow DOM, no gain for distinct icons | Optional later, for icon-heavy lists |
| 6 | ng-packagr post-step / builder that moves lazily used icons into lazy chunks | ~1 KB gzip per lazy-only icon | Chunking happens in the *consumer's* esbuild. A library post-step can't influence it, and a custom builder breaks "no extra step" | **Rejected:** not possible from the library side |
| 7 | Dev-only stub module via the `development` export condition | Smaller dev bundle | Wrong or blank icons in dev = not visually identical. Angular's prebundler still bundles whatever the condition points to | **Rejected** |
| 8 | Template-less renderer: build the SVG with `innerHTML` / precomputed DOM | Smaller per-icon code | Needs `bypassSecurityTrustHtml` (security, Trusted Types/CSP), hydration mismatch risk. #2 gets most of the gain safely | **Rejected** |
| 9 | Content-hashed incremental generation (skip unchanged icons) | ≤ 1 s, since a warm svg-cache run is 2.2 s in total | More code, cache invalidation bugs | Not worth it after svg-cache |
| 10 | Parallel library builds (outline and filled at the same time) | ~40% faster `build:lib` on multi-core CI | 2× peak memory | Cheap, optional (measured below) |
| 11 | Unflattened per-file ESM (round 1, `exp/unflattened-fesm`) | −40% dev cold start, −2 GB, **only** with consumer `prebundle.exclude` | Slower without that setting; 4093 files | Optional, with docs |
| 12 | Generator snapshot + CI cache (`exp/svg-cache`) | 548 s → 22.8 s cold / 2.2 s warm | Low | **Do** |

## Prototypes

Same harness (`tools/bench/bench.sh`, median of 3). `exp/slim-template` = shared-css + static templates (idea #2).
`exp/slim-combined` = slim-template + unflattened ESM. The baseline and shared-css columns are copied from round 1.

| Metric | baseline | shared-css | **slim-template** | slim-combined |
| --- | ---: | ---: | ---: | ---: |
| Library build, both packages (s) | 45.8 | 40.5 | **30.5** (39.5/30.5/30.2) | 66.5 (66.5/375.0*/56.9) |
| dist outline / filled (MB) | 27.4 / 26.9 | 23.7 / 23.2 | **19.4 / 18.9** | 13.2 / 12.8 (4093 files each) |
| FESM JS outline (MB) | 14.4 | 12.4 | **9.9** | 11.5 (per-file ESM) |
| Tarball outline / filled (KB) | 1113 / 1032 | 1088 / 1004 | **1054 / 972** | 1182 / 1096 |
| Prod initial JS raw / gzip (KB) | 283.8 / 85.4 | 276.2 / 85.6 | 272.9 / 85.6 | 273.5 / 85.2 |
| Lazy-route icons in lazy chunk? | no | no | no | no |
| Server bundle (KB) | 1776 | 1757 | 1754 | 1754 |
| HTML 30 icons (KB) | 29.5 | 17.9 | 17.9 | 17.9 |
| Hydration / Storybook | OK / pass | OK / pass | OK / pass (`aria-label`+`role="img"` and `aria-hidden` render as before) | OK / pass |
| `ng serve` cold (s) / peak (MB), default | 39.3 / 6876 | 36.1 / 6518 | **31.1 / 5771** (31.1/30.8/31.8) | 47.3 / 5573 (53.6/47.3/46.7) |
| `ng serve` cold / peak, `prebundle.exclude` | 168 / 9231 | — | — | **20.0 / 4596** (20.0/20.8/20.0) |

\* One build run hit 375 s because the shared box was under load; the median is unaffected.

**Parallel library builds (idea #10)**, measured on `exp/slim-template`: `build:lib:outline` and `build:lib:filled` run
at the same time took 36.7 / 15.1 / 13.5 s (median **15.1 s**), versus 30.5 s run one after the other. That's ~50% faster, for a
one-line `package.json` change (or two CI jobs).

What slim-template shows: removing per-icon bindings and the per-icon input cuts each compiled icon declaration
substantially. FESM is −31% vs baseline, the library build −33%, and the default `ng serve` cold start goes from 39.3 to 31.1 s
(−21%), with 1.1 GB less peak memory and **no consumer setting needed**. Gzipped prod bytes don't move, because gzip
already compressed the repeated boilerplate. The same pattern as before: gzip absorbs repetition, so the wins are in
dev/build time, raw size and HTML, not in gzip transfer.

## Round 2 recommendation (ranked)

1. **`exp/svg-cache`**: generator 548 s → 22.8 s cold / 2.2 s warm, identical output. Low risk; CI-only workflow change.
2. **`exp/slim-template`** (includes shared-css): −39% SSR HTML, −31% package JS, −33% library build, −21% `ng serve` cold
   start and −1.1 GB, with no consumer changes. The one API nuance: `ariaLabel` is now an input of the host directive, so templates
   are unaffected but direct `component.ariaLabel` access isn't. Ship it in a minor release with a changelog note (or a major,
   if you want to be strict).
3. **Parallel `build:lib`**: ~50% faster library build, trivial.
4. **Unflattened ESM** (`exp/slim-combined`): only together with README guidance for `prebundle.exclude` (20 s / 4.6 GB dev).
   Without that setting it's slower (47 s), so it stays optional.
5. Not worth doing: path compression (worse under gzip), outline/filled dedupe, sprite, innerHTML renderer, dev stub, lazy-chunk
   post-step (impossible from the library side), incremental generation (≤ 1 s after svg-cache).

