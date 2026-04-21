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

`theme-unify` follows semver. The version lives in
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

Pick `theme-unify`, choose patch / minor / major, write a one-line
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
pnpm --filter theme-unify build
pnpm --filter theme-unify pack --dry-run
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
| `NPM_TOKEN` | both release workflows | npm automation token with publish rights for `theme-unify`. Must be an **Automation** token if 2FA is enabled on the account. |
| `RELEASE_TOKEN` *(optional)* | `release.yml` | Personal access token used to push the version commit + tags back to `main` if branch protection rules block `GITHUB_TOKEN`. Falls back to `GITHUB_TOKEN` when unset. |

## Local dry-run

Useful before relying on CI for the first time:

```bash
pnpm install
pnpm test
pnpm -r build
pnpm changeset status --verbose
pnpm --filter theme-unify pack --dry-run
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
