# Research: supporting the full Material Symbols variant space

Status: research / proposal (no decision recorded yet — would become an ADR).
Date: 2026-10 · Upstream pin examined: `google/material-design-icons@5a4e1b7fd26f11ce3d2abf7d7fcd13274f874e6c` (2026-05-08), referred to below as **`@pin`**.

Scope: all three styles (Outlined, Rounded, Sharp) × all axes FILL, wght, GRAD, opsz, measured against the current user contract.

---

## 1. TL;DR and recommendation

**Facts that drive the design**

- **The static grid is too big to publish as-is.** Upstream ships 168 static SVGs per icon per style:
  - 7 wght × 3 GRAD {−25, 0, 200} × 2 FILL × 4 opsz {20, 24, 40, 48}.
  - That is 4,083 icons × 3 styles = **2,057,832 files, ~1.5 GB**.
  - One npm package per static combination means **504 packages** (~6.8 GB unpacked).
  - One package per style with a subpath per combination means **~686k modules per package**.
- **The variable fonts are the compact, continuous source.**
  - Size: `variablefont/MaterialSymbols{Outlined,Rounded,Sharp}[FILL,GRAD,opsz,wght].ttf` is 34 MB in total.
  - Axes are continuous: FILL 0–1, wght 100–700, **GRAD −50–200** (wider than the static SVGs), opsz 20–48.
  - fontTools turns them into SVG paths in **~2 s per axis location for the whole Rounded set**.
  - The output matches upstream static SVGs within 0.1 % of pixels for 94.5 % of icons.
  - The remaining ~150 icons differ because **the repo SVGs are stale**: the font matches `fonts.gstatic.com` exactly.
- **A tiny interpolatable glyph model works.** It is built from the font's `glyf` + `gvar` (+ `avar`) data and is ~2.3 KB gzip per icon. A ~60-line pure evaluator reproduces fontTools instancing at _any_ axis value (max error 1.7×10⁻⁵ of pixels). Because every output path has the same command structure, axis changes can be animated.
  - This makes **continuous axes possible as plain inline SVG**: SSR-correct, no web font, no FOUT, same a11y/CSS contract.

**Recommendation: "one glyph model, many emitters", rolled out additively.** Every phase is a minor release, opt-in, and reversible with `npm deprecate`.

| Phase                        | Ships                                                                                                                                                                                                                                                                                        | Contract impact                                                   | Reversible?       |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------- |
| 0 (internal)                 | Generator takes **style** as a per-target parameter. Add the variable-font pin and model extraction behind a flag. Record an ADR.                                                                                                                                                            | none                                                              | yes (no release)  |
| 1 (**first shippable step**) | `@captains-chest/material-symbols-outlined-icons[-filled]` (`mso-`/`msof-`). Then `…-sharp-icons[-filled]` (`mss-`/`mssf-`). Static, from upstream SVGs, same shape as today.                                                                                                                | additive; Lockstep Variant Versioning extends to the new packages | deprecate package |
| 2                            | `@captains-chest/material-symbols-{rounded,outlined,sharp}-variable-icons` (`msrv-`/`msov-`/`mssv-`). One component per icon with signal inputs `fill`, `weight`, `grade`, `opticalSize` plus DI defaults. Path computed from the embedded glyph model. Rounded first, on a `next` dist-tag. | additive; existing packages untouched                             | deprecate package |
| 3                            | `ng generate @captains-chest/material-symbols-icons:icon home --style sharp --weight 300 --grade -25 --fill 1` writes a static standalone component into the consumer's repo. Zero runtime cost, any axis value, uses the same model and evaluator.                                          | additive                                                          | delete schematic  |
| 4 (decision, maybe major)    | Choose the single source of truth: font vs repo SVGs (see §7).                                                                                                                                                                                                                               | major if static packages switch to font geometry                  | n/a               |

Rejected as the default: font-backed components (option D). They break Embedded-SVG Distribution and ADR 0001 (FOUT, CSP `font-src`, PUA text in DOM, 42 icons missing) and would be a major release. Worth keeping as an opt-in recipe only.

---

## 2. Current user contract (what every option must uphold)

Sources: `projects/material-symbols-rounded-icons/package.json`, `projects/*/src/lib/shared/*.ts`, `tools/icons/sync-material-symbols-rounded.mjs` (`componentSource()`), `tools/icons/upstream.json`, `CONTEXT.md`, `docs/adr/*`, `docs/release.md`, and the published tarball `@captains-chest/material-symbols-rounded-icons@3.0.0`.

| Aspect                                               | Contract today                                                                                                                                                                                                                                                                                                                                                                              |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Packages (Package Identity, Filled Package Identity) | `@captains-chest/material-symbols-rounded-icons` and `@captains-chest/material-symbols-rounded-icons-filled`, both `3.0.0`, MIT. Upstream assets are Apache-2.0 (`LICENSE-THIRD-PARTY.md`).                                                                                                                                                                                                 |
| Versioning                                           | Icon SemVer Policy: added icons are minor; removals, renames and rendering-contract breaks are major. Lockstep Variant Versioning (`docs/release.md`, `verify-lockstep-version.mjs`). Trusted-publisher OIDC publish.                                                                                                                                                                       |
| Import path                                          | Per-icon subpath `@captains-chest/material-symbols-rounded-icons/<kebab-name>` via `exports["./*"] → ./icons/*.js` and `.d.ts`. The root `.` export carries shared symbols only: `MsrIconHostDirective`, `MsrIconSvgDirective`, `MSR_ICON_STYLES`, `MSR_ICON_NAMES`/`MsrIconName`, `ICON_MANIFEST` (packageName, upstream ref/sha/committedAt, `variant {fill,wght,grad,opsz}`, iconCount). |
| Names                                                | Selector Naming Contract: `msr-<kebab>-icon` / `msrf-<kebab>-icon`. Variant-Distinct Component Naming: `Msr<Pascal>IconComponent` / `Msrf<Pascal>IconComponent`.                                                                                                                                                                                                                            |
| Component shape                                      | Standalone-Only Delivery. Empty class body. `hostDirectives: [{directive: MsrIconHostDirective, inputs: ['ariaLabel']}]`. Template `<svg msrIconSvg focusable="false" viewBox="0 -960 960 960"><path d="…"/></svg>`.                                                                                                                                                                        |
| Inputs                                               | Only `ariaLabel` (signal input, `string \| null`).                                                                                                                                                                                                                                                                                                                                          |
| A11y                                                 | Decorative-First Accessibility: `aria-hidden="true"` by default; with `ariaLabel`, `role="img"` plus `aria-label` on the `<svg>` (`msr-icon-svg.directive.ts`).                                                                                                                                                                                                                             |
| Styling                                              | Variant Host Class Contract `.msr-icon`/`.msrf-icon`, Variant SVG Class Contract `.msr-icon-svg`/`.msrf-icon-svg`. Content-Sized Icon Defaults: `inline-flex`, `flex:0 0 auto`, `inline-size/block-size: var(--msr-icon-size, 1em)`, `fill: currentColor`.                                                                                                                                  |
| Style delivery                                       | One `<style id="msr-icon-styles">` per document, honours `CSP_NONCE`, SSR-safe. Shadow-DOM consumers add `MSR_ICON_STYLES` themselves.                                                                                                                                                                                                                                                      |
| Packaging                                            | Embedded-SVG Distribution (no raw SVG assets). Compile-Time Icon Resolution (no runtime fetching). Pure Entrypoint Contract, `sideEffects: false`. Peers `@angular/{core,common} >=17`.                                                                                                                                                                                                     |
| Migration                                            | `ng update` schematic (3.0.0 "subpath-imports") rewrites root imports to subpaths using generated `icon-subpaths.json`.                                                                                                                                                                                                                                                                     |
| Generation                                           | Pinned Sync Pipeline, Shared Upstream Pin, Full Upstream Inclusion, Collision-Strict Generation, Variant Availability Tolerance (missing-variant reports), Upstream Availability Boundary. Fail-closed SVG sanitizer (`docs/security/svg-sanitization-policy.md`). On-Demand Generated Sources (ADR 0004).                                                                                  |
| Catalog                                              | Storybook at icons.captains-chest.com, 8,166 components (2 × 4,083), lazily grouped.                                                                                                                                                                                                                                                                                                        |

Measured package and build numbers:

- **Published 3.0.0 tarball:** 1.24 MB packed, 13.46 MB unpacked, 8,176 files.
- **`icons/*.js`:** 11.16 MB in total; per icon module the median is 2,646 B and the max 6,500 B. The template string appears twice: in `ɵcmp` and in the class metadata.
- **Build** (measured on a clean scratch clone, macOS, `/usr/bin/time -l`):
  - `icons:ensure` cold, both targets, including network: 51 s, 985 MB max RSS.
  - `build:lib:outline` (ng-packagr + `emit-icon-entry-points.mjs`): **29.8 s, 1.34 GB max RSS**.
  - Snapshot cache: 33 MB.
- **History** (commit messages):
  - ng-packagr secondary entry points cost ~5 min / ~10 GB per package, which led to the custom emitter.
  - Subpath imports cut a 30-icon SSR app's cold serve from 10.3 s to 2.5 s and memory from 5.4 GB to 1.9 GB.

Contract tension already present: `CONTEXT.md` "Single Entrypoint Imports" and "Material Symbols Rounded … sole icon family in v1" predate 3.0 subpaths. A multi-style future needs glossary updates. These are documentation changes, not user-facing breaks.

---

## 3. Upstream facts

### 3.1 Static SVG layout at `@pin` (verified by `git ls-tree` on a blobless clone)

Path pattern ([tree](https://github.com/google/material-design-icons/tree/5a4e1b7fd26f11ce3d2abf7d7fcd13274f874e6c/symbols/web)):

```
symbols/web/<name>/materialsymbols{outlined|rounded|sharp}/<name>[_wght{100,200,300,500,600,700}][grad{200|N25}][fill1]_{20|24|40|48}px.svg
```

Examples:

- `home_24px.svg`
- `home_fill1_24px.svg`
- `home_wght300_24px.svg`
- `home_grad200fill1_48px.svg`
- `home_wght100gradN25fill1_20px.svg`

When wght or grad comes first, no underscore separates it from the next token; the first token always has a leading `_`.

|                                            | Outlined | Rounded | Sharp   | Total                      |
| ------------------------------------------ | -------- | ------- | ------- | -------------------------- |
| Icon dirs                                  | 4,083    | 4,083   | 4,083   | —                          |
| Files per icon                             | 168      | 168     | 168     | —                          |
| Files                                      | 685,944  | 685,944 | 685,944 | **2,057,832**              |
| Unique blobs                               | 558,318  | 563,141 | 558,140 | 1,351,903 (overall unique) |
| Avg default `_24px` size                   | 473 B    | 661 B   | 429 B   | —                          |
| Est. total bytes (108-icon sample × 4,083) | ~461 MB  | ~679 MB | ~404 MB | **~1.54 GB**               |

- Static values shipped:
  - wght: {100, 200, 300, 400, 500, 600, 700}
  - GRAD: {−25, 0, 200}
  - FILL: {0, 1}
  - opsz: {20, 24, 40, 48}
- Values available only in the variable font:
  - Every intermediate value of each axis.
  - GRAD −50…−25.
  - opsz values other than 20, 24, 40 and 48.
- Every SVG uses `viewBox="0 -960 960 960"`. Only the `width`/`height` attributes change with opsz; the geometry changes too (opsz is a real design axis).

### 3.2 Variable fonts

- **Location** ([tree](https://github.com/google/material-design-icons/tree/5a4e1b7fd26f11ce3d2abf7d7fcd13274f874e6c/variablefont)): `variablefont/MaterialSymbols{Outlined,Rounded,Sharp}[FILL,GRAD,opsz,wght].{ttf,woff2,codepoints}`.

  | Style    | TTF      | WOFF2   |
  | -------- | -------- | ------- |
  | Rounded  | 14.96 MB | 5.30 MB |
  | Outlined | 10.56 MB | 3.93 MB |
  | Sharp    | 8.77 MB  | 3.48 MB |

- **Licence:** Apache-2.0 ([LICENSE](https://github.com/google/material-design-icons/blob/5a4e1b7fd26f11ce3d2abf7d7fcd13274f874e6c/LICENSE), [README](https://github.com/google/material-design-icons/blob/5a4e1b7fd26f11ce3d2abf7d7fcd13274f874e6c/README.md)).
- **Font internals** (inspected with fontTools):
  - Version 2.938, `unitsPerEm` 960 (equals the SVG viewBox after a y-flip), 6,552 glyphs.
  - Tables: `glyf`, `gvar`, `avar`, `HVAR`, `STAT`, `GSUB` (ligatures in Extension/type 7 lookups), `cmap`.
- **`fvar` axes** — all continuous (OpenType [fvar](https://learn.microsoft.com/en-us/typography/opentype/spec/fvar), [gvar](https://learn.microsoft.com/en-us/typography/opentype/spec/gvar), [avar](https://learn.microsoft.com/en-us/typography/opentype/spec/avar)):

  | Axis | Min | Default | Max |
  | ---- | --- | ------- | --- |
  | FILL | 0   | 0       | 1   |
  | GRAD | −50 | 0       | 200 |
  | opsz | 20  | 24      | 48  |
  | wght | 100 | 400     | 700 |
  - `avar` makes the wght mapping non-linear.
  - The font has 7 named instances.

- **Docs vs font:**
  - The upstream README describes Fill as "0 to 100" and grade "−50 to 200"; `fvar` says FILL is 0–1.
  - [developers.google.com/fonts/docs/material_symbols](https://developers.google.com/fonts/docs/material_symbols) documents the same axes and says only 20/24 dp opsz are pixel-grid optimised (per the README; the claim itself is unverified).
- **Name coverage:**
  - The `.codepoints` file has 4,244 names, 3,944 unique codepoints.
  - **42 SVG icon names have no glyph in the font**, e.g. `float_portrait`, `hangout_meeting`, `app_spark`, `chrome_*`.
  - The font has 203 names not present as SVG dirs: 194 aliases plus ~8 new glyphs, e.g. `drawing_recognition`, `work_off`.
- **Google Fonts CSS2 API** ([css2 docs](https://developers.google.com/fonts/docs/css2), [material_symbols docs](https://developers.google.com/fonts/docs/material_symbols)), probed live with a Chrome UA:

  | Rounded request                             | WOFF2 size |
  | ------------------------------------------- | ---------- |
  | Default static, full set                    | 373 KB     |
  | All axes, full set                          | 5.40 MB    |
  | `icon_names=home,search,settings`, all axes | 8,404 B    |
  | Same 3 icons, static default                | 1,856 B    |
  - Sharp, 3 icons, all axes: 6,468 B.
  - Served font versions: v378 for Rounded, v374 for Sharp.
  - Docs say `icon_names` must be alphabetically sorted.
  - Requesting the documented `ROND` axis returned HTTP 400 "Missing font family" (observed; may be a rollout/documentation mismatch — unverified).

- **CSS:** axes are driven by [`font-variation-settings`](https://www.w3.org/TR/css-fonts-4/#font-variation-settings-def) ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variation-settings)) and render only for text, never for inline `<svg>`.

### 3.3 Upstream SVGs vs font vs fonts.google.com: drift

- `https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/<name>/default/24px.svg` (the fonts.google.com download) matches the **font** pixel-for-pixel (0.0 diff) for `query_stats`, `devices_wearables` and `table_view`.
- For the same icons, the repo SVG at `@pin` differs by 31–39 % of pixels.
- So the repo `symbols/web` tree lags the font for ~150 Rounded icons (≈3.7 %); see §4.1.
- Upstream HEAD has moved past the pin (`49d4db35`, 2026-10-09). Whether HEAD fixes the drift is unverified.

---

## 4. Feasibility experiments

All work ran in a throwaway scratch dir (deleted). Tools: Python 3 venv with `fonttools`, `brotli` and `pillow`; Node with `fontkit@2.0.4`, `svgo@4.1.0`, `subset-font` and `harfbuzzjs`. Rasterisation: 96×96 px, alpha diff > 25 % counted as an "off" pixel.

### 4.1 Font → SVG via fontTools (reference-quality)

Recipe:

1. Ligature name → glyph via the GSUB ligature lookups. Codepoint → glyph via `cmap` gives the same result.
2. `TTFont.getGlyphSet(location={...})`.
3. Draw with `SVGPathPen` through `TransformPen((1,0,0,-1,0,0))` (y-flip into `0 -960 960 960`).

| Measure                                   | Result                                                                                                                                                     |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Speed                                     | Whole Rounded set (4,041 glyph-backed icons) in **~2 s per axis location**, peak RSS 628 MB                                                                |
| Raw `d` bytes, default location           | 4.46 MB (fontTools pen output, unoptimised; upstream 2.32 MB)                                                                                              |
| Default Rounded vs upstream `_24px.svg`   | 3,817 icons < 0.1 % pixels off; 55 < 1 %; 19 < 5 %; **150 ≥ 5 %** (redesigns: `query_stats`, `devices_wearables`, `table_view`, `car_fan_*`, `hearing`, …) |
| 106-icon sample × 10 axis combos, Rounded | Mean off 0.5–3 %. The tail is driven by the same drifted icons; worst is `query_stats`                                                                     |
| Same check, Outlined and Sharp            | Mean off 0.47–3.2 % per combo; worst again `query_stats`. The method generalises across styles                                                             |

Conclusion: geometry identical to upstream statics, except where upstream statics are stale.

### 4.2 Pure JS alternative (fontkit + svgo)

- Extracting all Rounded icons plus svgo took **~1 s** and produced 2.13 MB of paths, smaller than upstream.
- fontkit **crashes on `okonomiyaki`** (gvar `decodePoints`) at the default location.
- It deviates 0.15–0.2 % of pixels from fontTools on 5 of 106 icons.
- ESM import must be `import * as fontkit`.
- Verdict: fontkit is not trustworthy enough as the source of truth. Use fontTools, or our own evaluator (§4.4), in the generator.

### 4.3 Can upstream static SVGs be interpolated at runtime?

No. Across axis files of the same icon, the path command sequences are identical for only **1–13 of 106** sampled icons. Upstream optimisation varies `q/Q/T`, segment merging and so on. SVG-level morphing between statics is a dead end.

### 4.4 Interpolatable glyph model (the key enabler)

Built per glyph from the font:

- base `glyf` points
- **dense** `gvar` deltas, with IUP inferred deltas applied at build time
- region tuples
- `fvar` axis ranges
- the `avar` maps

| Measure                            | Result                                                                                                                                                                                                                                |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Model shape                        | Mean 86 points and 19.5 delta tuples per glyph (range 12–25). The 106-glyph sample shares only 25 distinct regions, so regions can be deduplicated per package.                                                                       |
| Evaluator                          | ~60 lines: normalise axes → `avar` piecewise-linear map → tuple scalar → Σ scalar·delta → quadratic contours → `d` string ([OpenType variations overview](https://learn.microsoft.com/en-us/typography/opentype/spec/otvaroverview)). |
| Accuracy vs `fontTools` instancing | Max 1.7×10⁻⁵ pixel fraction across 4 locations, including intermediate values (FILL 0.5, wght 350, GRAD 50, opsz 30).                                                                                                                 |
| Size per icon (naive int16)        | 8.0 KB raw, **2.26 KB gzip**, 3.1 KB as base64-of-gzip. Naive JSON: 2.4 KB gzip.                                                                                                                                                      |
| Bonus                              | The same command structure at every location means `d` can be animated, e.g. FILL 0→1 on toggle via CSS `d` transition or rAF ([MDN `d`](https://developer.mozilla.org/en-US/docs/Web/CSS/d); Safari support unverified).             |

Gotcha: IUP needs coordinates _including_ the 4 phantom points, while the contour `ends` array excludes them.

### 4.5 Build-time font subsetting (for option D)

fontTools subsetter, by PUA codepoints, GSUB dropped, WOFF2:

| Icons | All 4 axes | FILL-only (others pinned) | Static default |
| ----- | ---------- | ------------------------- | -------------- |
| 1     | 2,976 B    | 972 B                     | 700 B          |
| 10    | 13.5 KB    | 2.2 KB                    | 1.8 KB         |
| 50    | 60.7 KB    | 7.8 KB                    | 7.0 KB         |
| 200   | 272 KB     | 28 KB                     | 21.9 KB        |

- Subsetting takes under 1 s.
- Subsetting by ligature _text_ pulls in nearly all ligatures through letter closure. The usable route is codepoints, which means rendering PUA characters in the DOM.

### 4.6 Payload math, Rounded

| Payload                                                                    | Raw        | gzip        |
| -------------------------------------------------------------------------- | ---------- | ----------- |
| Default static path (today's per-icon payload, before Angular boilerplate) | mean 574 B | 278 B       |
| All 168 static variants of one icon embedded                               | 149 KB     | 35.3 KB     |
| 7 weights × 2 fills at 24 px                                               | 11 KB      | 2.56 KB     |
| Interpolatable model, continuous, all 4 axes                               | 8 KB       | **2.26 KB** |

---

## 5. Options compared

Assumptions:

- N = 4,083 icons per style.
- "Today" means one static package: 13.5 MB unpacked, 8.2k files, ~30 s / 1.3 GB build.
- Values are per style unless stated.

|                      | A. More static packages                                                     | B1. Per-style package, all variants embedded                   | B2. Per-style package, per-variant subpaths                                    | C. Build-time instancing + consumer generator                                                           | D. Variable-font components                                                          | E. Glyph-model components                                                              | F. Compiler / builder inlining                                                         |
| -------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| What                 | Package per style × fill (6); optionally × weight (42) or × full grid (504) | `<msr-home-icon weight=300>` with all 168 paths in each module | `/home`, `/home/w300-g0-o24-f1`, …                                             | Generator instances any axis combo from the font. Ship presets; `ng g` emits custom combos into the app | One subset font; component renders a PUA glyph styled with `font-variation-settings` | One component per icon with continuous signal inputs; `d` computed from embedded model | Custom builder or Vite plugin rewrites `<msr-icon name weight>` into inline static SVG |
| Contract             | Preserved; new names per package                                            | New inputs; same names; module size explodes                   | Preserved for defaults; new subpaths                                           | Preserved; generated code lives in the consumer repo                                                    | **Broken**: not Embedded-SVG; a11y and SSR change; major                             | Preserved for existing packages; new packages/selectors are additive                   | Breaks Standalone-Only/Per-Icon API (string names); major                              |
| Per-icon bundle (gz) | ~0.3 KB path + boilerplate                                                  | ~35 KB                                                         | ~0.3 KB per variant used                                                       | ~0.3 KB per variant used                                                                                | ~3 KB/icon in a shared font (all axes); ~0.7 KB static                               | ~2.3 KB + ~1 KB shared evaluator (est.)                                                | ~0.3 KB                                                                                |
| Tree-shaking         | Per icon                                                                    | Per icon, but each icon is fat                                 | Per icon-variant                                                               | Per icon-variant                                                                                        | Needs app-wide icon collection (no Angular plugin API)                               | Per icon                                                                               | Per usage                                                                              |
| Package size         | 13.5 MB each: 6 → 81 MB, 42 → ~570 MB, 504 → ~6.8 GB total                  | ~600 MB+ unpacked                                              | ~686k modules, ~1.1 GB+ unpacked                                               | Presets as A; schematic carries models (~10 MB gz per style)                                            | ~5 MB woff2 + tiny components                                                        | ~25–50 MB unpacked (est. from 8 KB raw model + ~3 KB boilerplate)                      | Font or model + plugin                                                                 |
| Build time / memory  | ~30 s / 1.3 GB each; 6 packages ≈ 3 min sequential                          | Emit fine; Storybook/test heavy                                | ngc over 686k components is infeasible (cf. 5 min / 10 GB for 4k entry points) | Instancing ~2 s per location per style                                                                  | Trivial                                                                              | ~30 s like today + model extraction ~seconds                                           | Plugin per build                                                                       |
| Generator cache      | +~33 MB per pair (est.)                                                     | 1.5 GB of SVGs, or 34 MB of fonts                              | same                                                                           | 34 MB fonts                                                                                             | 34 MB fonts                                                                          | 34 MB fonts                                                                            | —                                                                                      |
| SSR                  | ✅                                                                          | ✅                                                             | ✅                                                                             | ✅                                                                                                      | ⚠️ text node SSRs, glyph needs font load; FOUT/tofu                                  | ✅ path computed on server                                                             | ✅                                                                                     |
| A11y                 | ✅ same                                                                     | ✅                                                             | ✅                                                                             | ✅                                                                                                      | ⚠️ PUA text exposed; needs `aria-hidden` on text and careful labelling               | ✅ same directives                                                                     | ✅                                                                                     |
| Security             | Sanitizer as today                                                          | as today                                                       | as today                                                                       | Sanitizer on emitted SVG                                                                                | CSP `font-src`; font is a binary, outside the sanitizer                              | Numeric model, no markup; policy amendment                                             | as today                                                                               |
| Storybook            | +4,083 stories per package                                                  | axis controls                                                  | combinatorial                                                                  | presets only                                                                                            | axis sliders                                                                         | **axis sliders + animation**                                                           | n/a                                                                                    |
| Missing icons        | 0 (static SVG source)                                                       | 0                                                              | 0                                                                              | 42 (font source)                                                                                        | 42                                                                                   | 42 (font source)                                                                       | depends                                                                                |
| Maintenance (3 devs) | Low; mechanical                                                             | Low code, high size cost                                       | High                                                                           | Medium (schematic + model)                                                                              | Medium-high (plugins, fonts, CSP docs)                                               | Medium (evaluator + model extraction)                                                  | High (builder upkeep per Angular major)                                                |
| Verdict              | ✅ for 3 styles × 2 fills (Phase 1); ❌ beyond                              | ❌                                                             | ❌                                                                             | ✅ as Phase 3                                                                                           | ❌ default; recipe only                                                              | ✅ Phase 2                                                                             | ❌ for now                                                                             |

### Prose notes

- **A. Package-count explosion.**
  - Style × fill gives 6 packages, which is fine: the release pipeline already handles 2 in lockstep and each new package needs a one-time npm trusted-publisher setup ([npm docs](https://docs.npmjs.com/trusted-publishers)).
  - Adding the 7 weights gives 42 packages. Adding GRAD × opsz gives 504. Prior art stopped at weight packages: marella publishes `@material-symbols/svg-{100…700}`, ~23.6k files and ~13 MB each ([repo](https://github.com/marella/material-symbols)).
- **B. Embedding variants.**
  - B1 is what `@material-symbols-svg/react` does with weights: its README says each icon module contains all weight variants, and the package is 332 MB unpacked across 23,715 files ([repo](https://github.com/k-s-h-r/material-symbols-svg)).
  - Extending that to the full grid gives ~35 KB gz per icon.
  - B2 is bounded by our own build history: per-icon ngc emit scaled to 4k, not 686k.
- **C. Build-time instancing.** This is the honest answer to "arbitrary combos without shipping the universe".
  - Implement it in the generator once and reuse it for curated preset grids (e.g. Rounded wght 300/500 if asked for) and for a consumer `ng generate` schematic.
  - Schematics run in Node, so they need the JS evaluator from E, not fontTools. That makes E's evaluator a shared asset.
- **D. Variable-font components.** Smallest bytes when an app uses many icons at many axes, and the only way to get CSS-driven axis changes (`font-variation-settings` transitions). But it is incompatible with several parts of the contract:
  - Embedded-SVG Distribution and ADR 0001.
  - Compile-Time Icon Resolution: font loading is runtime.
  - FOUT / tofu on first paint and during SSR hydration.
  - CSP `font-src` requirements.
  - Ligature-subset closure makes text subsetting useless, so it must use PUA codepoints.
  - The Angular application builder exposes no esbuild-plugin option ([schema](https://github.com/angular/angular-cli/blob/main/packages/angular/build/src/builders/application/schema.json)), so collecting used icons needs a custom builder or a post-build CLI.
  - Angular Material already covers the font route via `MatIcon` `fontSet` / `registerFontClassAlias` ([icon.md](https://github.com/angular/components/blob/main/src/material/icon/icon.md)). Our niche is SVG.
- **E. Glyph-model components.** This is the radical-but-contract-preserving option, and the measurements show it works.
  - Same host/SVG directives, a11y, `currentColor` and sizing; SSR emits a concrete `<path d>`.
  - Costs ~2 KB gz more per _used_ icon than a static component.
  - Fine for apps using tens of icons. For hundreds of icons, a static package is still cheaper, which is why both coexist.
- **F. Compiler inlining** (an Iconify-style `name` string API, cf. [`@iconify-json/material-symbols`](https://www.npmjs.com/package/@iconify-json/material-symbols)).
  - Needs a builder we would maintain per Angular major.
  - Abandons the Per-Icon Component API. Not worth it for the team size.

---

## 6. Recommended architecture

### 6.1 One source, many emitters

```
upstream.json  ──►  createSnapshot()  ──► symbols/web SVGs (static targets)      ──► Emitter: static component (today)
 (ref, styles,       blobless clone        variablefont/*.ttf (variable targets) ──► Model extractor (fontTools, CI-pinned)
  targets[])         + batched blob fetch                                             ├─► Emitter: model component (Phase 2)
                                                                                      ├─► Emitter: preset static grid (optional)
                                                                                      └─► Model data for ng-generate schematic (Phase 3)
```

- `upstream.json` changes:
  - `symbolFamily` moves from global config into each target, e.g. `"style": "outlined"`.
  - Targets gain `"kind": "static" | "variable"`.
  - Static targets keep `variant.fileSuffix`.
  - Variable targets reference `variablefont/MaterialSymbols<Style>[FILL,GRAD,opsz,wght].ttf`.
  - All of this stays within the Parameterized Generation Core and Shared Upstream Pin.
- Collision-Strict Generation, Variant Availability Tolerance (missing reports for the 42 glyph-less names) and Traceable Upstream Compliance (`ICON_MANIFEST` with the font file blob SHA) all carry over.

### 6.2 Phase 1: static style pairs (first shippable, small, reversible)

| Package                                                  | Selector           | Class                      | Root symbols                                 |
| -------------------------------------------------------- | ------------------ | -------------------------- | -------------------------------------------- |
| `@captains-chest/material-symbols-outlined-icons`        | `mso-<kebab>-icon` | `Mso<Pascal>IconComponent` | `MsoIconHostDirective`, `MSO_ICON_STYLES`, … |
| `@captains-chest/material-symbols-outlined-icons-filled` | `msof-…`           | `Msof…`                    | `Msof…`                                      |
| `@captains-chest/material-symbols-sharp-icons`           | `mss-…`            | `Mss…`                     | `Mss…`                                       |
| `@captains-chest/material-symbols-sharp-icons-filled`    | `mssf-…`           | `Mssf…`                    | `Mssf…`                                      |

- Same subpath exports, `sideEffects: false`, styles (`.mso-icon`, `--mso-icon-size`?) and a11y directives.
- **Open naming question:** should size share one custom property (`--msr-icon-size`) across styles so theming is style-agnostic? Recommendation: introduce `--ms-icon-size` as the fallback (`var(--mso-icon-size, var(--ms-icon-size, 1em))`) in the new packages only. Today's packages are unchanged.
- **Cost per pair:**
  - Generation: ~1 min cold.
  - Builds: ~2 × 30 s / 1.3 GB.
  - Cache: +~2 × 4,083 blobs.
  - Storybook: +8,166 stories, in the same lazy groups with a style switch.
- **Rollout:** ship Outlined first, then Sharp in the next minor. Lockstep Variant Versioning extends to all packages; `verify-lockstep-version.mjs` needs only a list change.
- **Reversal:** `npm deprecate`. No consumer of existing packages is affected.
- **Repo name:** `material-symbols-rounded-icons` becomes a misnomer. Renaming the GitHub repo is cosmetic (GitHub redirects); npm names of existing packages stay.

### 6.3 Phase 2: variable (glyph-model) packages

```ts
// @captains-chest/material-symbols-rounded-variable-icons/home
@Component({
  selector: 'msrv-home-icon',
  imports: [MsrvIconSvgDirective],
  hostDirectives: [
    {
      directive: MsrvIconHostDirective,
      inputs: ['ariaLabel', 'fill', 'weight', 'grade', 'opticalSize'],
    },
  ],
  template: `<svg msrvIconSvg focusable="false" viewBox="0 -960 960 960">
    <path [attr.d]="d()" />
  </svg>`,
})
export class MsrvHomeIconComponent {
  protected readonly d = msrvPath(MODEL /* per-icon packed glyph model */);
}
```

- **Inputs** (signal inputs on the host directive):
  - `fill` (0..1), `weight` (100..700), `grade` (−50..200), `opticalSize` (20..48), each clamped.
  - Defaults come from `provideMsrvIconDefaults({ weight: 300, … })` (DI) and fall back to the Normalized Symbol Variant (0/400/0/24).
  - `msrvPath` is a `computed()` over those inputs and lives in the root entrypoint (shared evaluator, still a pure export).
- **Contract preservation:** the same Decorative-First Accessibility, Content-Sized Icon Defaults, `currentColor`, CSP-nonce style injection and SSR (the path string is in server HTML). Compile-Time Icon Resolution holds: the model is a static import, nothing is fetched.
- **Security:** the model is numbers in a typed array. `d` is produced by our evaluator, and the sanitizer policy is amended to "model data validated at generation (finite numbers, bounded counts); emitted `d` matches `[MLQZ0-9 .-]`".
- **Optimisations to evaluate:**
  - Deduplicate regions per package.
  - Delta-encode to int8 where deltas fit.
  - Emit `M/L/Q/Z` only.
  - Optional partial instancing presets, e.g. a `…-variable-icons/wght/home` build with FILL, GRAD and opsz pinned, which shrinks tuples. Savings are unmeasured.
- **Source of truth:** the font. The package therefore lacks the 42 glyph-less icons (reported as missing) and shows the current fonts.google.com geometry for ~150 icons that differ from the static packages. Document this in the README and `ICON_MANIFEST`.
- **Rollout:**
  - Rounded only, on the `next` dist-tag; gather feedback; then Outlined and Sharp.
  - Whether variable packages join lockstep or version independently until stable is an open question (§7).

### 6.4 Phase 3: consumer generator (`ng generate`)

A schematic package (or a schematic inside the variable package) that:

- reads the packed model and runs the same evaluator;
- writes `src/app/icons/<name>-<style>-w300-g-25-o20-f1.component.ts`, a static, sanitized, standalone component;
- imports the shared host/SVG directives from the matching static package, so it carries the same a11y and CSS contract.

Result: zero-runtime-cost arbitrary axis values, with the consumer owning the generated code (cf. shadcn-style copy-in). Optional `--animate` could emit a FILL toggle using the variable component instead.

### 6.5 Migration via `ng update`

- Phases 1–3 are additive, so no migration is required.
- If a later major consolidates (e.g. `…-rounded-icons-filled` replaced by `msrv` with `fill=1`, or static packages switched to font geometry), extend the existing schematic:
  - Map `Msrf<X>IconComponent` + `msrf-x-icon` → `Msrv<X>IconComponent` + `<msrv-x-icon [fill]="1">`.
  - Rewrite subpaths with the same `icon-subpaths.json` mechanism.
- Recommendation: do **not** consolidate unless measurements show the ~2 KB gz per icon premium is acceptable to real consumers.

---

## 7. Open questions and risks

1. **Source-of-truth policy (biggest decision).** Repo SVGs (byte-stable with today, 4,083 icons, stale for ~3.7 %) vs the font (matches fonts.google.com, 34 MB, continuous, 42 icons missing, extra aliases).
   - Mixing them means `msr-query-stats-icon` ≠ `msrv-query-stats-icon` visually.
   - Switching static packages to font geometry is a rendering change, so it is **major** under Icon SemVer.
   - Unverified: whether upstream HEAD regenerated the SVGs.
2. **Python in the toolchain.** fontTools is the reference implementation. Options:
   - Pin it via `uv`/`pip` in CI.
   - Write a JS `gvar` reader using our verified evaluator. fontkit is not reliable enough (`okonomiyaki` crash).
   - Committing models conflicts with On-Demand Generated Sources (ADR 0004).
3. **npm limits.** No hard tarball or file-count limit was verified in npm docs. marella ships ~23.6k files per package and `@material-symbols-svg/react` 332 MB unpacked, so scale is evidently accepted. Still **unverified**.
4. **Variable package bundle size.**
   - ~2.3 KB gz per icon is measured for the raw model.
   - Angular boilerplate per module and the evaluator size (~1 KB gz) are **estimates**.
   - Lighthouse-level impact for 50+ icons is untested.
5. **Rendering parity.** 0.0–0.2 % pixel differences come from quadratic-to-path conversion and anti-aliasing. They are invisible in tests, but CI should keep a render test (cf. `tools/icons/render.test.mjs`) with a threshold.
6. **opsz semantics.** opsz is not size. Options:
   - Auto-derive it from rendered size (ResizeObserver, not SSR-safe).
   - Keep it explicit. Recommendation: explicit, with a default of 24.
7. **Animation.** Does CSS `d` interpolation work in all target browsers (Safari unverified)? A JS rAF fallback is easy because the structure is constant.
8. **Lockstep scope.** Versioning 10 packages in lockstep forces empty releases. Alternative: lockstep per kind (static vs variable). Needs `docs/release.md` changes.
9. **Upstream format change.** If Google reorganises `variablefont/` or switches to COLR/other formats, the model extractor breaks. Mitigated by the pin and Manual-First Sync Governance.
10. **Google Fonts `ROND` axis.** Documented but returned 400 in our probe. If it ships, the model approach supports any new axis for free; the static-package approach doesn't.
11. **Licensing.** Apache-2.0 allows derived outlines. `LICENSE-THIRD-PARTY.md` needs to mention font-derived data (low risk, but legal wording unverified).

---

## 8. Sources

Repo (this project):

- `CONTEXT.md`, `README.md`, `docs/adr/0001-generated-per-icon-standalone-components.md`, `docs/adr/0002-public-variant-css-classes-for-generated-icons.md`, `docs/adr/0003-content-sized-icon-defaults.md`, `docs/adr/0004-on-demand-generated-sources.md`, `docs/release.md`, `docs/security/svg-sanitization-policy.md`
- `tools/icons/upstream.json`, `tools/icons/sync-material-symbols-rounded.mjs`, `tools/icons/emit-icon-entry-points.mjs`, `tools/icons/svg-sanitizer.mjs`, `tools/icons/ng-update/`, `tools/icons/render.test.mjs`
- `projects/material-symbols-rounded-icons/package.json`, `projects/material-symbols-rounded-icons/src/lib/shared/msr-icon-host.directive.ts`, `…/msr-icon-svg.directive.ts`
- Published tarball: https://www.npmjs.com/package/@captains-chest/material-symbols-rounded-icons (v3.0.0)

Upstream (Google):

- Static SVG tree at pin: https://github.com/google/material-design-icons/tree/5a4e1b7fd26f11ce3d2abf7d7fcd13274f874e6c/symbols/web
- Variable fonts at pin: https://github.com/google/material-design-icons/tree/5a4e1b7fd26f11ce3d2abf7d7fcd13274f874e6c/variablefont
- README / LICENSE at pin: https://github.com/google/material-design-icons/blob/5a4e1b7fd26f11ce3d2abf7d7fcd13274f874e6c/README.md, https://github.com/google/material-design-icons/blob/5a4e1b7fd26f11ce3d2abf7d7fcd13274f874e6c/LICENSE
- Material Symbols guide: https://developers.google.com/fonts/docs/material_symbols
- CSS2 API: https://developers.google.com/fonts/docs/css2
- fonts.google.com SVG download endpoint (observed): https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/query_stats/default/24px.svg
- Icon catalogue: https://fonts.google.com/icons

Specs:

- CSS Fonts 4, `font-variation-settings`: https://www.w3.org/TR/css-fonts-4/#font-variation-settings-def
- MDN: https://developer.mozilla.org/en-US/docs/Web/CSS/font-variation-settings, https://developer.mozilla.org/en-US/docs/Web/CSS/d
- OpenType: https://learn.microsoft.com/en-us/typography/opentype/spec/otvaroverview, …/fvar, …/gvar, …/avar

Tools and prior art:

- fontTools instancer: https://fonttools.readthedocs.io/en/latest/varLib/instancer.html
- Angular Material icon: https://github.com/angular/components/blob/main/src/material/icon/icon.md
- Angular application builder schema: https://github.com/angular/angular-cli/blob/main/packages/angular/build/src/builders/application/schema.json
- marella/material-symbols: https://github.com/marella/material-symbols, https://www.npmjs.com/package/@material-symbols/svg-400, https://www.npmjs.com/package/material-symbols
- k-s-h-r/material-symbols-svg: https://github.com/k-s-h-r/material-symbols-svg, https://www.npmjs.com/package/@material-symbols-svg/react
- Iconify: https://www.npmjs.com/package/@iconify-json/material-symbols
- npm trusted publishing: https://docs.npmjs.com/trusted-publishers
