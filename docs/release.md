# Release

Releases are automated with
[Changesets](https://github.com/changesets/changesets) and the
[`changesets/action`](https://github.com/changesets/action) GitHub
Action. There is no manual `pnpm publish` step in the normal flow.

## Branches

| Branch | npm dist-tag | Trigger | Tag git? | Consumes changesets? |
| --- | --- | --- | --- | --- |
| `main` | `latest` | push (any merge) | yes (`vX.Y.Z`) | yes |

Consumers install:

- `npm i @jfitzsimmons2/theme-unify` — stable (`latest`).

## Versioning

`@jfitzsimmons2/theme-unify` follows semver. The version lives in
[`packages/core/package.json`](../packages/core/package.json) and is
imported into the CLI at runtime, so there is exactly one source of
truth. Changesets bumps it automatically.

See [contributing.md](contributing.md#public-api-stability) for the
patch / minor / major rules.

## Adding a changeset (per PR)

Every PR with a user-visible change must include a changeset:

```bash
pnpm changeset
```

Pick `@jfitzsimmons2/theme-unify`, choose patch / minor / major, write a
one-line summary in the present tense (it lands in `CHANGELOG.md`), and
commit the generated `.changeset/<name>.md` file with the rest of your
change.

For repo-internal-only PRs (docs, tests, CI, playground tweaks,
no-observable-effect refactors), skip the changeset. CI does not
require one.

See [`.changeset/README.md`](../.changeset/README.md) for details.

## What ships

The `files` field in
[`packages/core/package.json`](../packages/core/package.json) restricts
the published tarball to `dist/`. Source files, tests, and the
playground are **not** published.

Verify the tarball contents locally:

```bash
pnpm --filter @jfitzsimmons2/theme-unify build
pnpm --filter @jfitzsimmons2/theme-unify pack --dry-run
```

[`tsup.config.ts`](../packages/core/tsup.config.ts) emits both ESM and
CJS plus types for every `exports` entry (`.`, `./vite`, `./typed`,
`./aura`, `./lara`, `./nora`, `./material`).

## Stable releases — push to `main`

[`.github/workflows/release.yml`](../.github/workflows/release.yml) runs
on every push to `main`. It uses the official
[`changesets/action`](https://github.com/changesets/action), which
implements a two-phase, PR-based release flow:

1. **Setup.** Checkout (full history), install pnpm with
   [`pnpm/action-setup@v4`](https://github.com/pnpm/action-setup) — the
   pnpm version is read from the `packageManager` field in the root
   [`package.json`](../package.json) — set up Node.js 22 with the npm
   registry configured, then `pnpm install --frozen-lockfile`. The
   workflow then upgrades the npm CLI to the latest version (≥ 11.5.1
   is required for OIDC trusted publishing — see
   [Required secrets](#required-secrets)).
2. **Build.** `pnpm --filter @jfitzsimmons2/theme-unify run build` so
   the package's `dist/` is ready before publish.
3. **Changesets action.** `changesets/action@v1` does one of three
   things depending on repo state:
   - **Pending changesets exist.** It opens (or updates) a PR titled
     `chore(release): version packages`. The PR consumes
     `.changeset/*.md`, bumps versions, and regenerates `CHANGELOG.md`.
     Review and merge that PR when you're ready to ship.
   - **The version PR was just merged.** It runs `pnpm run ci:publish`
     (which is `changeset publish`), publishing the bumped packages to
     npm under the `latest` dist-tag and creating annotated git tags
     `vX.Y.Z`.
   - **Nothing pending and nothing to publish.** It exits cleanly.
     Doc-only and chore merges are no-ops.

Concurrency is keyed on `${{ github.workflow }}-${{ github.ref }}` so
overlapping pushes don't race.

### Day-to-day developer flow

1. Make a change in `packages/core` on a feature branch.
2. From the repo root, run `pnpm changeset`. Select
   `@jfitzsimmons2/theme-unify`, pick the bump type, write the summary.
3. Commit the generated `.changeset/<name>.md` alongside your code.
4. Open and merge a PR to `main`.
5. The action opens a `chore(release): version packages` PR. When
   that PR is merged, packages publish to npm automatically.

## Required secrets

Publishing to npm uses [npm trusted publishing][trusted-pub] (OIDC),
so there is **no `NPM_TOKEN`** in the workflow. Instead, npm verifies
a short-lived OIDC token minted by GitHub Actions against the Trusted
Publisher configured for `@jfitzsimmons2/theme-unify` on npmjs.com.

[trusted-pub]: https://docs.npmjs.com/trusted-publishers

Requirements for trusted publishing to work:

- The job must have `id-token: write` (set in `release.yml`).
- npm CLI ≥ 11.5.1 must be on `PATH` when `npm publish` runs.
  `release.yml` runs `npm install -g npm@latest` after `setup-node`
  to satisfy this on Node 22 runners.
- A **Trusted Publisher** for `@jfitzsimmons2/theme-unify` must be
  configured on npmjs.com pointing at this repo's `release.yml`
  workflow on the `main` branch.

Configure these in **Settings → Secrets and variables → Actions**:

| Secret | Used by | Purpose |
| --- | --- | --- |
| `SCOPED_GITHUB_TOKEN` | `release.yml` | Fine-grained PAT (or GitHub App token) with `contents: write` and `pull-requests: write` on this repo. Used by `changesets/action` to push the release branch and open the version PR. The default `GITHUB_TOKEN` works too if **Settings → Actions → General → Workflow permissions → Allow GitHub Actions to create and approve pull requests** is enabled. |

## Local dry-run

Useful before relying on CI for the first time:

```bash
pnpm install
pnpm test
pnpm -r build
pnpm changeset status --verbose
pnpm --filter @jfitzsimmons2/theme-unify pack --dry-run
```

## Manual fallback

If automation is broken and a release must go out:

1. `pnpm install && pnpm -r build && pnpm test`.
2. `pnpm changeset version` (or edit `packages/core/package.json`
   directly for a hotfix).
3. `cd packages/core && pnpm publish --access public`.
4. `git tag vX.Y.Z && git push --tags`.

The root `release` script (`pnpm release`) wraps steps 1–3 for the
common case. Treat manual publishing as a last resort and re-enable
automation immediately afterwards.

## Post-publish checks

- The npm page shows the expected `dist/` contents and `bin`.
- `npx @jfitzsimmons2/theme-unify@latest --version` reports the
  published version.
- Consuming docs that pin a version are updated.
# Release

Releases are automated with
[Changesets](https://github.com/changesets/changesets) and GitHub
Actions. There is no manual `pnpm publish` step in the normal flow.

## Branches

| Branch | npm dist-tag | Trigger | Tag git? | Consumes changesets? |
| --- | --- | --- | --- | --- |
| `main` | `latest` | push (any merge) | yes (`vX.Y.Z`) | yes |
| `develop` | `dev` | push (any merge) | no | no (snapshot only) |

Consumers install:

- `npm i theme-unify` — stable (`latest`).
- `npm i theme-unify@dev` — latest snapshot from `develop`.

## Versioning

`@jfitzsimmons2/theme-unify` follows semver. The version lives in
[`packages/core/package.json`](../packages/core/package.json) and is
imported into the CLI at runtime, so there is exactly one source of
truth. Changesets bumps it automatically.

See [contributing.md](contributing.md#public-api-stability) for the
patch / minor / major rules.

## Adding a changeset (per PR)

Every PR with a user-visible change must include a changeset:

```bash
pnpm changeset
```

Pick `@jfitzsimmons2/theme-unify`, choose patch / minor / major, write a one-line
summary in the present tense (it lands in `CHANGELOG.md`), and commit
the generated `.changeset/<name>.md` file with the rest of your change.

For repo-internal-only PRs (docs, tests, CI, playground tweaks,
no-observable-effect refactors), skip the changeset. CI does not
require one.

See [`.changeset/README.md`](../.changeset/README.md) for details.

## What ships

The `files` field in
[`packages/core/package.json`](../packages/core/package.json) restricts
the published tarball to `dist/`. Source files, tests, and the
playground are **not** published.

Verify the tarball contents locally:

```bash
pnpm --filter @jfitzsimmons2/theme-unify build
pnpm --filter @jfitzsimmons2/theme-unify pack --dry-run
```

[`tsup.config.ts`](../packages/core/tsup.config.ts) emits both ESM and
CJS plus types for every `exports` entry (`.`, `./vite`, `./typed`,
`./aura`, `./lara`, `./nora`, `./material`).

## Stable releases — push to `main`

[`.github/workflows/release.yml`](../.github/workflows/release.yml) runs
on every push to `main`:

1. Install, build, test.
2. `pnpm changeset status` — if no pending changesets, exit cleanly
   (no-op). This makes doc-only / chore merges safe.
3. `pnpm changeset version` — bump versions, regenerate
   `CHANGELOG.md`, delete consumed `.changeset/*.md` files.
4. `pnpm release` (which runs `pnpm changeset publish`) — publish to
   npm under `latest` and create annotated git tags `vX.Y.Z`.
5. Commit the version bump + push tags back to `main` with
   `[skip ci]`.

The job uses concurrency group `release-main` so only one release runs
at a time.

## Dev snapshots — push to `develop`

[`.github/workflows/release-dev.yml`](../.github/workflows/release-dev.yml)
runs on every push to `develop`:

1. Install, build, test.
2. `pnpm changeset status` — if no pending changesets, exit cleanly.
3. `pnpm changeset version --snapshot dev` — produce versions like
   `0.4.0-dev-<timestamp>` **without** consuming the changeset files
   or committing anything. This means the same changeset can later
   ship a stable release from `main`.
4. `pnpm changeset publish --no-git-tag --snapshot --tag dev` —
   publish to npm under the `dev` dist-tag only. No git tags are
   pushed.

Snapshots never overwrite `latest`.

## Required secrets

Configure these in **Settings → Secrets and variables → Actions**:

| Secret | Used by | Purpose |
| --- | --- | --- |
| `NPM_TOKEN` | both release workflows | npm automation token with publish rights for `@jfitzsimmons2/theme-unify`. Must be an **Automation** token if 2FA is enabled on the account. |
| `RELEASE_TOKEN` *(optional)* | `release.yml` | Personal access token used to push the version commit + tags back to `main` if branch protection rules block `GITHUB_TOKEN`. Falls back to `GITHUB_TOKEN` when unset. |

## Local dry-run

Useful before relying on CI for the first time:

```bash
pnpm install
pnpm test
pnpm -r build
pnpm changeset status --verbose
pnpm --filter @jfitzsimmons2/theme-unify pack --dry-run
```

To preview a snapshot version without publishing:

```bash
pnpm changeset version --snapshot dev
git restore .changeset packages/core/package.json packages/core/CHANGELOG.md 2>/dev/null || true
```

## Manual fallback

If automation is broken and a release must go out:

1. `pnpm install && pnpm -r build && pnpm test`.
2. `pnpm changeset version` (or edit `packages/core/package.json`
   directly for a hotfix).
3. `cd packages/core && pnpm publish --access public`.
4. `git tag vX.Y.Z && git push --tags`.

Treat this as a last resort and re-enable automation immediately
afterwards.

## Post-publish checks

- The npm page shows the expected `dist/` contents and `bin`.
- `npx theme-unify@latest --version` reports the published version.
- `npx theme-unify@dev --version` reports the latest snapshot.
- Consuming docs that pin a version are updated.
