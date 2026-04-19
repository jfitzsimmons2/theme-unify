# Release

## Versioning

`theme-unify` follows semver. The current version is hard-coded in two
places that must stay in sync:

- [packages/core/package.json](../packages/core/package.json) `version`
  field
- [packages/core/src/cli.ts](../packages/core/src/cli.ts) `cli.version(...)`
  call

See the public-API stability rules in
[contributing.md](contributing.md#public-api-stability) for what counts as
patch / minor / major.

## Build

```bash
pnpm --filter theme-unify build
```

[tsup.config.ts](../packages/core/tsup.config.ts) produces:

- `dist/index.{js,cjs,d.ts}` — main entry
- `dist/cli.{js,cjs,d.ts}` — CLI binary (referenced by `bin.theme-unify`)
- `dist/vite.{js,cjs,d.ts}` — `theme-unify/vite` subpath
- Source maps and split chunks

Both ESM and CJS are emitted because the package's `exports` map provides
both.

## What ships

The `files` field in
[packages/core/package.json](../packages/core/package.json) restricts the
published tarball to `dist/`. README / LICENSE / package.json are added by
npm automatically. Source files, tests, and the playground are **not**
published.

Verify with:

```bash
pnpm --filter theme-unify pack --dry-run
```

## Pre-publish checklist

1. `pnpm install` — clean install.
2. `pnpm test` — all green.
3. `pnpm --filter theme-unify build` — no errors, `dist/` regenerated.
4. `pnpm generate` — playground outputs regenerated and committed if
   different.
5. `pnpm dev` — manual visual smoke test on the playground:
   - All 8 severities × variants × sizes for Button.
   - Forms, DataTable, overlays, menus, messages.
   - Dark-mode toggle.
   - Token editor live update.
6. Bump `version` in `packages/core/package.json` **and** `cli.version` in
   `packages/core/src/cli.ts`.
7. Update CHANGELOG (if/when one exists — none today).
8. Tag and push: `git tag vX.Y.Z && git push --tags`.
9. From `packages/core`: `pnpm publish --access public`.

## Post-publish

- Verify the package on npm has the expected `files` and `bin`.
- `npx theme-unify@latest --version` should report the new version.
- Update any consuming docs that reference the old version.
