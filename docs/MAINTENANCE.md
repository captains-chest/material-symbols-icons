# Maintenance log

Short notes on upkeep work in this repository: dependency updates, CI fixes, and security patches.

## 2026-10-26

- Dependabot's npm job for the six library folders under `projects/` started failing: Dependabot no longer updates pnpm workspace packages from a subdirectory. Removed that entry from `.github/dependabot.yml`; the root npm entry already covers the whole workspace.
