# Contributing

## Workflow

1. Fork / branch from `main`.
2. `pnpm install`.
3. Make your change. If touching `packages/core`, run `pnpm --filter
   theme-unify dev` in one terminal and `pnpm dev` (playground) in another.
4. `pnpm test` — must pass.
5. `pnpm generate` — regenerate the playground outputs and commit any
   changes alongside your source changes.
6. Open a PR with a short description of the user-visible effect.

## Code style

- **TypeScript strict mode** — see
  [tsconfig.json](../tsconfig.json). No `any` unless explicitly justified
  in a comment.
- **ESM only** — internal imports use the `.js` extension (required by the
  TS NodeNext module resolution).
- **No new runtime dependencies** without discussion. Current runtime deps
  are intentionally minimal: only `cac` (CLI parsing) and `jiti` (TS
  config loading). Dev deps are unrestricted.
- **No framework code in `packages/core`** — no Vue, no PrimeVue runtime
  imports. The generators emit `import { … } from "@primeuix/themes/…"`
  strings into output files, but the core package itself does not depend
  on those packages.
- **Pure functions in the pipeline** — `validateTokens`, `resolveRefs`,
  and every generator must be pure. Only `loadTokens` and `writeOutput`
  perform IO.

## Public API stability

Anything re-exported from
[packages/core/src/index.ts](../packages/core/src/index.ts) is part of the
package's public API and follows semver:

- **Patch**: bug fixes, internal refactors, doc-only changes, generator
  output changes that produce equivalent CSS/JS.
- **Minor**: new generators, new optional config fields, new exports, new
  CLI flags with defaults that preserve current behavior.
- **Major**: removing or renaming any public export, changing a function
  signature, removing a config field, changing the shape of generator
  output in a way that breaks downstream consumers.

Internal helpers (anything not re-exported from `index.ts`) can change
freely.

## Generator output changes

Treat generated files as part of the public API:

- If a change to a generator produces different output for the same input,
  call it out in the PR description.
- Re-run `pnpm generate` and commit the regenerated playground outputs
  in the same PR.

## Commit messages

Conventional Commits encouraged but not enforced:

```
feat(generators): add tailwind theme generator
fix(resolver): detect cycles through alias prefixes
docs: add adding-a-generator guide
chore(deps): bump vitest to 3.2
```

Keep commits focused — one logical change per commit.

## When to update which doc

| Change | Update |
| --- | --- |
| New CLI flag | [cli.md](cli.md), [README](../README.md) |
| New generator | [generators.md](generators.md), [adding-a-generator.md](adding-a-generator.md) (if it changes the recipe), [README](../README.md) |
| New schema field | [token-schema.md](token-schema.md), [README](../README.md) |
| Pipeline change | [pipeline.md](pipeline.md), maybe [architecture.md](architecture.md) |
| Build / publish change | [release.md](release.md) |
| Major migration | Add a planning doc at the repo root (mirror [UNSTYLED-PLAN.md](../UNSTYLED-PLAN.md)) and reference it from [docs/README.md](README.md) |

## Things that don't need a doc

- Bug fixes that don't change observable behavior.
- Internal refactors.
- Test additions.
