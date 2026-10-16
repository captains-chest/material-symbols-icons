# On-demand generated sources

We stopped committing generated icon sources (`projects/*/src/lib/icons/**` and `projects/*/src/lib/generated/**`). `tools/icons/ensure-generated.mjs` (`pnpm icons:ensure`) regenerates them when they are missing or stale. `pnpm check`, the `lib` build tasks, and both Storybook scripts run it first. This replaces the earlier Committed Generated Sources policy.

Freshness is tracked by a per-variant stamp (`src/lib/generated/.generation-stamp.json`) that the sync script writes last. It records a hash of the generator inputs (`upstream.json`, the sync script, the SVG sanitizer, and the stamp module), the generated icon count, and whether the run covered the full set. The sync script deletes the stamp before regenerating, so a failed run never looks fresh.

We changed this because the 8,166 committed files accounted for over 99% of tracked files and about 90% of repository size. Every template change produced an 8,166-file diff that nobody could review. CI already regenerated and compared the files on every run, so committing them added review noise without adding verification. Measured on the history at the time:

|                  | Committed | On demand                                                            |
| ---------------- | --------- | -------------------------------------------------------------------- |
| Tracked files    | 8,243     | 73                                                                   |
| Packed history   | 7.5 MB    | 0.8 MB                                                               |
| Local clone      | 0.56 s    | 0.05 s                                                               |
| `git status`     | 80 ms     | 17 ms                                                                |
| Extra build cost | none      | ~19 s cold (network), ~1.1 s with snapshot cache, ~0.04 s when fresh |

Accepted trade-offs:

- The first generation on a new machine, and on a CI run without a cache hit, depends on GitHub being reachable. The fetch reads only the pinned immutable SHA, and CI caches the snapshot by ref.
- There is no committed diff of generated output. Upstream and generator changes are reviewed through `upstream.json` and generator code changes, plus the smoke and render tests.
- The publish workflow regenerates from the pinned ref instead of reusing committed files. It deliberately uses no snapshot cache, so release inputs come straight from upstream.
