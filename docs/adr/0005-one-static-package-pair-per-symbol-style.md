# One static package pair per Material Symbols style

We publish Outlined and Sharp the same way as Rounded: one unfilled and one filled package per style, each generated from the upstream static SVGs at the Normalized Symbol Variant (wght=400, GRAD=0, opsz=24). That makes six packages in lockstep:

| Style    | Unfilled                                          | Filled                                                   | Prefixes       |
| -------- | ------------------------------------------------- | -------------------------------------------------------- | -------------- |
| Rounded  | `@captains-chest/material-symbols-rounded-icons`  | `@captains-chest/material-symbols-rounded-icons-filled`  | `msr` / `msrf` |
| Outlined | `@captains-chest/material-symbols-outlined-icons` | `@captains-chest/material-symbols-outlined-icons-filled` | `mso` / `msof` |
| Sharp    | `@captains-chest/material-symbols-sharp-icons`    | `@captains-chest/material-symbols-sharp-icons-filled`    | `mss` / `mssf` |

We picked this because it is additive (a minor release, and existing consumers see no change), keeps every icon at today's ~0.3 KB gzip, and reuses the generator, build, tests and release flow with only configuration changes. One upstream pin and one snapshot cover all three styles.

## Considered options

- **Weight, grade and optical size as component inputs** (one component per icon whose path is computed from a glyph model extracted from the variable font). It works and is SSR-safe, but costs ~2.3 KB gzip per icon (about 8× today), needs Python/fontTools or a custom `gvar` reader in the generator, and changes the geometry of ~150 Rounded icons (the repo SVGs lag the font) while 42 icons have no glyph in the font. That makes it a major release for a feature nobody has asked for yet. See `docs/research/material-symbols-full-variant-space.md`.
- **Font-backed components** (`font-variation-settings` on a ligature font). Rejected: breaks Embedded-SVG Distribution, adds FOUT and a `font-src` CSP requirement, and puts ligature text in the DOM.
- **One package per axis combination.** Upstream ships 168 static SVGs per icon per style; one package per combination would be 504 packages.

## Consequences

- Fixed weights can still be added later from the upstream static SVGs (for example per-icon subpaths such as `/home/w300`) without the variable font. That is tracked in #42.
- Internal target IDs are now `<style>[-filled]` (`rounded`, `rounded-filled`, …). The old `outline` / `filled` IDs read as styles once Outlined exists; "unfilled" is the word for FILL=0.
- New packages ship the 3.0 `ng update` migration like the Rounded ones. It never runs for them, because they are first published after 3.0.0, but it keeps the build identical for every target.
- Many icons are the same in more than one style. At the pinned ref, 2,029 of 4,083 unfilled Outlined SVGs are byte-identical to Sharp, and 550 to Rounded (filled: 2,041 and 557). This is upstream's design, not a generator bug. Each package still ships every icon, so consumers never need to mix styles.
- npm trusted publishing can only be configured on a package that exists, so the first publish of each new package is a manual step (see `docs/release.md`).
