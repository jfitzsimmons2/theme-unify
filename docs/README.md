# Contributor docs

These docs are for **developers contributing to theme-unify**. End-user
usage lives in the root [README](../README.md).

## Where to start

1. [Getting started](getting-started.md) — install, build, dev, test.
2. [Architecture](architecture.md) — monorepo layout and data flow.
3. [Pipeline](pipeline.md) — how a token config becomes generated files.
4. [Generators](generators.md) — what each generator emits.
5. Pick something to work on (see [Contributing](contributing.md)).

## Index

| Doc | Topic |
| --- | --- |
| [getting-started.md](getting-started.md) | Prerequisites, install, common scripts, troubleshooting |
| [architecture.md](architecture.md) | Monorepo layout, modules, public API surface |
| [token-schema.md](token-schema.md) | `TokenSchema`, `AutoTokenSchema`, refs, color scales |
| [pipeline.md](pipeline.md) | `loadTokens` → `validateTokens` → `resolveRefs` → generators |
| [generators.md](generators.md) | PrimeVue preset, PrimeVue PT, UnoCSS theme, UnoCSS shortcuts |
| [adding-a-generator.md](adding-a-generator.md) | Step-by-step for a new output format |
| [cli.md](cli.md) | CLI flags, defaults, exit codes |
| [vite-plugin.md](vite-plugin.md) | Current placeholder + planned HMR design |
| [playground.md](playground.md) | Visual smoke test app and runtime token editor |
| [testing.md](testing.md) | Vitest setup, fixtures, adding tests |
| [contributing.md](contributing.md) | Workflow, code style, public-API stability |
| [release.md](release.md) | Versioning, build output, publish checklist |

## Historical references

- [UNSTYLED-PLAN.md](../UNSTYLED-PLAN.md) — the migration plan that
  introduced the unstyled-mode + PT generator. Kept at the repo root for
  historical context; current architecture facts live in
  [generators.md](generators.md).
