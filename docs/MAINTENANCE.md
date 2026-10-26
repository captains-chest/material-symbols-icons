# Maintenance log

Short notes on upkeep work in this repository: dependency updates, CI fixes, and security patches.

## 2026-10-26

- Dependabot's npm job for the six library folders under `projects/` started failing: Dependabot no longer updates pnpm workspace packages from a subdirectory. Removed that entry from `.github/dependabot.yml`; the root npm entry already covers the whole workspace.
- Updated the dev-only transitive `fast-uri` from 3.1.8 to 3.1.9 for Dependabot alerts 87 to 90. Re-resolving the lockfile also moved a few other dev-only transitive packages up by a patch version.
