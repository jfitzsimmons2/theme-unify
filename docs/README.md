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
| [architecture.md](architecture.md) | Monorepo layout, modules, public API surface, runtime-source-of-truth model |
| [token-schema.md](token-schema.md) | `ThemeUnifyConfig`, semantic refs, color scales, builtin palettes |
| [pipeline.md](pipeline.md) | `loadTokens` → `validateTokens` → `resolveRefs` → generators |
| [generators.md](generators.md) | PrimeVue preset, UnoCSS theme (CSS-var backed), UnoCSS shortcuts |
| [adding-a-generator.md](adding-a-generator.md) | Step-by-step for a new output format |
| [cli.md](cli.md) | CLI flags, defaults, exit codes |
| [vite-plugin.md](vite-plugin.md) | Current placeholder + planned HMR design |
| [playground.md](playground.md) | Visual smoke test app |
| [testing.md](testing.md) | Vitest setup, fixtures, adding tests |
| [contributing.md](contributing.md) | Workflow, code style, public-API stability |
| [release.md](release.md) | Versioning, build output, publish checklist |

## Historical references

- [UNSTYLED-PLAN.md](../UNSTYLED-PLAN.md) — the migration plan that
  introduced the now-removed unstyled-mode + PT generator. Superseded by
  the current architecture; kept for historical context only. The
  PrimeVue PT generator and `primevue.ts` styled-mode generator have
  been removed in favor of a single `definePreset`-based pipeline — see
  [generators.md](generators.md).
