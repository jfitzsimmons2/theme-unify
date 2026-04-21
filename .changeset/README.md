# Changesets

This folder is managed by [Changesets](https://github.com/changesets/changesets).
Each markdown file (other than this README and `config.json`) describes a
user-visible change that should land in the next release of `theme-unify`.

## When to add a changeset

Add a changeset for any PR that should produce a new published version:

- New features, bug fixes, deprecations, removals, or behavior changes in
  `packages/core/src/**`.
- Generator output changes that affect downstream consumers.
- Public-API or CLI surface changes.

Skip changesets for repo-internal changes only: docs, tests, CI, the
playground, and pure refactors with no observable effect.

## How to add a changeset

```bash
pnpm changeset
```

Pick the bump type per the rules in
[`docs/contributing.md`](../docs/contributing.md#public-api-stability):

- **patch** — bug fixes, internal refactors with no observable effect,
  doc-only changes shipped with code, equivalent generator output.
- **minor** — new generators, new optional config fields, new exports,
  new CLI flags with backward-compatible defaults.
- **major** — removing or renaming a public export, changing a function
  signature, removing a config field, changing generator output in a
  breaking way.

Write the summary in the present tense — it lands in the changelog.

Commit the generated `.changeset/<random-name>.md` file alongside the code
change.

## How releases happen

- Pushes to `main` with pending changesets trigger
  [`.github/workflows/release.yml`](../.github/workflows/release.yml),
  which versions, tags, publishes to npm under the `latest` dist-tag, and
  consumes the changeset files.
- Pushes to `develop` trigger
  [`.github/workflows/release-dev.yml`](../.github/workflows/release-dev.yml),
  which publishes a snapshot prerelease (e.g. `0.4.0-dev-<sha>`) under
  the `dev` dist-tag without consuming changesets or tagging git.

See [`docs/release.md`](../docs/release.md) for full details.
