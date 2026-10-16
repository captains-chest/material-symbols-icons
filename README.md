# @captains-chest/material-symbols-rounded-icons workspace

Angular workspace for publishable Material Symbols Rounded icon libraries (outline + filled) with a Storybook-only playground.

Browse the icon catalog in Storybook: https://icons.captains-chest.com

## Workspace shape

- `projects/material-symbols-rounded-icons`: publishable outline standalone component library
- `projects/material-symbols-rounded-icons-filled`: publishable filled standalone component library
- `stories/` + `.storybook/`: Storybook catalog browser playground
- `src/main.ts`, `src/index.html`, and `src/styles.css`: minimal Angular Storybook host scaffolding only

There is intentionally no standalone Angular demo application. Storybook is the only playground surface.

Generated icon sources (`projects/*/src/lib/icons/**` and `projects/*/src/lib/generated/**`) are not committed. `pnpm icons:ensure` regenerates them whenever they are missing or stale, and `pnpm check`, `pnpm build:lib`, `pnpm storybook`, and `pnpm build-storybook` run it first, so a fresh clone works without a manual sync. A stamp file records a hash of the generator inputs (`tools/icons/upstream.json`, the sync script, the SVG sanitizer), so changing the pinned ref or the generator triggers a regeneration. The first run fetches the pinned upstream SVGs into `.cache/material-symbols/` (about 20 s); after that, regeneration takes about 1 s and needs no network. Build outputs such as `dist/` and `storybook-static/` are ignored too. See ADR 0004.

`pnpm build:lib` runs `ng build` for the root entry point (shared directives, styles, icon names and manifest) and then `tools/icons/emit-icon-entry-points.mjs`. That step emits one partial-compiled ES module and `.d.ts` per icon under `icons/`, served through the `"./*"` subpath export in each project's `package.json` (for example `@captains-chest/material-symbols-rounded-icons/home`). Icon modules import the shared directives from the package root by name, so every icon shares one directive instance. The step also packages the `ng update` migration from `tools/icons/ng-update/` into `schematics/`, with a generated class-name-to-subpath map. ng-packagr secondary entry points would produce the same layout, but a full 4,083-entry build took about 5 minutes and 10 GB of memory per package. This step is custom and sits outside the Angular Package Format, so re-check it when upgrading Angular or ng-packagr.

## Core commands

```bash
pnpm icons:ensure     # generate icon sources only if missing or stale (run automatically by the commands below)
pnpm sync:icons       # force-regenerate icon components for outline + filled from pinned upstream source
pnpm build:lib        # build both publishable Angular libraries (cached, see below)
pnpm exec vp fmt      # format hand-written sources with Oxfmt
pnpm check            # generate icon sources if needed, then format check + type-aware lint
pnpm storybook        # run Storybook playground
pnpm build-storybook  # build the Storybook playground
pnpm ci:baseline      # tests + generation + build + smoke checks
pnpm release:check    # full pre-publish validation + npm pack dry-run
pnpm release:publish  # publish dist packages to npm
```

## Toolchain

The workspace uses [Vite+](https://viteplus.dev) (`vite-plus`) for formatting (Oxfmt), linting (Oxlint), tests (Vitest), and task caching. Angular builds still run through the Angular CLI and ng-packagr.

`pnpm build:lib` runs the `lib:outline` and `lib:filled` tasks from `vite.config.ts` in parallel. When their inputs are unchanged, Vite+ restores `dist/` from `node_modules/.vite/task-cache` instead of rebuilding. Run `pnpm exec vp cache clean` to clear it, or `pnpm exec vp run --no-cache lib` to force a rebuild.

Generated icon sources (`projects/*/src/lib/icons/**` and `projects/*/src/lib/generated/**`) are excluded from formatting and linting so they stay byte-identical to the generator output.

## Generation scope

By default, `pnpm sync:icons` generates the full Material Symbols Rounded set for both outline and filled variants at the pinned upstream ref.

For fast local checks, use `pnpm sync:icons:sample` to generate the sample list from `tools/icons/sample-icons.txt`. A sample generation is marked partial, so the next `pnpm icons:ensure` restores the full set.

The sync pipeline is pinned by `tools/icons/upstream.json`:

- family: Material Symbols Rounded
- outline variant: FILL=0, wght=400, GRAD=0, opsz=24
- filled variant: FILL=1, wght=400, GRAD=0, opsz=24

The generator fetches the upstream SVGs for all variants once (a blobless clone plus one batched blob fetch) and stores them as a snapshot in `.cache/material-symbols/<ref>` (git-ignored). Later runs at the same pinned ref read the snapshot and need no network. Set `MSR_SVG_CACHE_DIR` to use another directory, or delete `.cache/` to force a fresh download. CI caches this directory with `actions/cache`, keyed on the pinned ref in `tools/icons/upstream.json`.

## Accessibility and rendering contract

- decorative-first (`aria-hidden` default)
- optional `ariaLabel` turns icon into `role="img"`
- `currentColor` fill
- host + SVG contract for container-driven sizing in flex layouts
