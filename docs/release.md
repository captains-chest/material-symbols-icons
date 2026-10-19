# Release and publish

This repository uses two separate governance models:

- **Manual-first sync governance**: maintainers decide when to update the pinned upstream Material Symbols commit in `tools/icons/upstream.json`.
- **Trusted publish governance**: packages are published from GitHub Actions when a GitHub release is published for a protected release tag, using npm trusted publishing (OIDC) with provenance attached.

Packages are published only to the public npmjs registry (`https://registry.npmjs.org`). They are not published to GitHub Packages.

## Prerequisites

Complete these once after moving the repository to GitHub. npm does not validate the trusted-publisher form when you save it; a mismatch only fails at publish time.

1. Create a GitHub Environment named `npm-publish` and require repository-owner approval.
2. Protect release tags matching `v*.*.*`.
3. On each npm package, add a trusted publisher with **GitHub Actions** as the provider:

   | Field                | Value                            |
   | -------------------- | -------------------------------- |
   | Organization or user | `captains-chest`                 |
   | Repository           | `material-symbols-rounded-icons` |
   | Workflow filename    | `publish.yml`                    |
   | Environment name     | `npm-publish`                    |
   | Allowed actions      | `npm publish`                    |

   Configure all six packages (one per target in `tools/icons/upstream.json`):

   - [@captains-chest/material-symbols-rounded-icons](https://www.npmjs.com/package/@captains-chest/material-symbols-rounded-icons)
   - [@captains-chest/material-symbols-rounded-icons-filled](https://www.npmjs.com/package/@captains-chest/material-symbols-rounded-icons-filled)
   - [@captains-chest/material-symbols-outlined-icons](https://www.npmjs.com/package/@captains-chest/material-symbols-outlined-icons)
   - [@captains-chest/material-symbols-outlined-icons-filled](https://www.npmjs.com/package/@captains-chest/material-symbols-outlined-icons-filled)
   - [@captains-chest/material-symbols-sharp-icons](https://www.npmjs.com/package/@captains-chest/material-symbols-sharp-icons)
   - [@captains-chest/material-symbols-sharp-icons-filled](https://www.npmjs.com/package/@captains-chest/material-symbols-sharp-icons-filled)

   Open **Settings → Trusted Publisher**, choose **GitHub Actions**, and enter the values above exactly. The workflow filename is only `publish.yml`, not the `.github/workflows/` path.

4. After a successful trusted publish, optionally set **Publishing access** to **Require two-factor authentication and disallow tokens**. Do this only after the OIDC path has published once, or emergency local publish will be blocked.
5. All package manifests must use the same version.
6. Each published `package.json` `repository.url` must be the GitHub HTTPS URL. Trusted publishing generates provenance, and npm rejects the publish when that field does not match the GitHub repository.

### Adding a new package

npm can only attach a trusted publisher to a package that already exists, so the first version of a new package (such as the Outlined and Sharp packages added in ADR 0005) must be published by hand:

1. Build and check everything with `pnpm release:check`.
2. Log in with `npm login` (an account with publish rights on the `@captains-chest` scope), then publish only the new packages from their `dist/` folders, for example `cd dist/material-symbols-outlined-icons && npm publish --access public`.
3. Add the trusted publisher from step 3 above to each new package.
4. Only then publish the GitHub release. The publish workflow publishes every package, so it fails if a new package has no trusted publisher yet.

Do the manual publish with the version that the release will tag. If the release workflow later fails because that version already exists for a new package, publish the remaining packages by hand from the same `dist/` build.

Do not add an `NPM_TOKEN` repository secret for the normal publish path. The publish workflow authenticates with a short-lived OIDC token from GitHub Actions.

## Validate before release

```bash
pnpm release:check
```

This runs:

- SVG sanitizer and upstream policy tests
- generation stamp tests and icon source generation (regenerated if missing or stale)
- all six library builds
- smoke checks, including forbidden SVG pattern gates
- SSR render tests for `ariaLabel` (template, `setInput`, `NgComponentOutlet`) and shared styles
- npm pack dry-runs from every `dist/<package>` folder (`tools/release/for-each-package.mjs`)

## Manual-first icon sync

Syncing remains a maintainer-controlled local action:

```bash
pnpm sync:icons
pnpm ci:baseline
```

The sync command enforces the Shared Upstream Pin policy before generation. The upstream owner must remain `google`, the repository must remain `material-design-icons`, and `ref` must be a 40-character immutable commit SHA.

## Trusted publish flow

1. Confirm the release check passes locally:

   ```bash
   pnpm release:check
   ```

2. Bump `version` in every `projects/*/package.json` to the same value, open a PR, and merge it once CI is green.
3. Create and publish a GitHub release whose tag matches the lockstep package version. The tag must point at the merged version-bump commit on `main`:

   ```bash
   gh release create v1.0.1 --target main --title v1.0.1 --notes-file notes.md
   ```

   Pushing a tag alone does not publish. Saving a draft release does not trigger it either. Only a **published** release does.

4. GitHub Actions runs `.github/workflows/publish.yml` (trigger: `release: types: [published]`) in the `npm-publish` environment. An owner must approve the deployment.
5. The workflow checks out the release tag (`github.event.release.tag_name`), verifies tag/package version lockstep against that tag, runs release checks, then publishes every package to `https://registry.npmjs.org`. Provenance is generated automatically because the job uses trusted publishing.

## Lockstep variant versioning

The publish workflow releases all six packages (three styles, each unfilled and filled) from one controlled flow. `tools/release/verify-lockstep-version.mjs` reads the package list from `tools/icons/upstream.json` and fails the release if:

- the tag does not use `v<semver>` format
- package versions differ
- the tag version does not match every package version

## Emergency local publish

Local publishing is not the normal trust path. If maintainers must publish manually, use:

```bash
pnpm release:publish
```

This still runs hardening checks first. Local publish cannot use GitHub OIDC, so it still needs an npm login or token. Prefer the protected GitHub Actions workflow.

## Suggested post-publish checks

```bash
node tools/release/for-each-package.mjs npm view . name version dist.integrity
```

Run it after `pnpm build:lib`; `npm view .` reads the package name from each `dist/` folder.
