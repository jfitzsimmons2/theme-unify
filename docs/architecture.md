# Architecture

## Monorepo layout

```
packages/
  core/        # The published `theme-unify` package — CLI, generators, public API
  playground/  # @theme-unify/playground — Vue 3 + PrimeVue + UnoCSS demo app
```

The root [package.json](../package.json) is private and only exists to host
workspace-wide scripts.

## High-level data flow

```mermaid
flowchart LR
  A[tokens.config.ts] --> B[loadTokens]
  B --> C[validateTokens]
  C --> D[resolveRefs]
  D --> E1[generatePrimeVue]
  D --> E2[generatePrimeVuePT]
  D --> E3[generateUnoCSS]
  D --> E4[generateShortcuts]
  E1 --> F[writeOutput]
  E2 --> F
  E3 --> F
  E4 --> F
  F --> G[src/generated/*.ts]
```

See [pipeline.md](pipeline.md) for the per-stage details.

## Core modules

All paths are under [packages/core/src](../packages/core/src).

| File | Responsibility |
| --- | --- |
| [index.ts](../packages/core/src/index.ts) | Public API surface — every export is part of the package contract |
| [define-tokens.ts](../packages/core/src/define-tokens.ts) | `defineTokens()` identity helper for type inference |
| [load-tokens.ts](../packages/core/src/load-tokens.ts) | Resolve and dynamically import a config file via `jiti` |
| [validator.ts](../packages/core/src/validator.ts) | Schema/value/ref validation; throws `TokenValidationError` |
| [resolver.ts](../packages/core/src/resolver.ts) | Replace `{ ref: "…" }` with primitives, with cycle detection |
| [types.ts](../packages/core/src/types.ts) | All public + internal token types |
| [builtin-palettes.ts](../packages/core/src/builtin-palettes.ts) | 22 Tailwind/PrimeUix color scales + `resolveScale` lookup with builtin fallback |
| [errors.ts](../packages/core/src/errors.ts) | `CircularReferenceError`, `UnresolvedRefError`, `TokenValidationError` |
| [write-output.ts](../packages/core/src/write-output.ts) | Idempotent file writer (skip if unchanged) |
| [cli.ts](../packages/core/src/cli.ts) | `cac`-based CLI entry; bin: `theme-unify` |
| [vite.ts](../packages/core/src/vite.ts) | Placeholder Vite plugin (v0.2) |
| [generators/](../packages/core/src/generators) | One file per output format — see [generators.md](generators.md) |

## Public API contract

Anything re-exported from
[packages/core/src/index.ts](../packages/core/src/index.ts) is part of the
public API and follows the stability rules in
[contributing.md](contributing.md). Currently:

- Functions: `defineTokens`, `loadTokens`, `resolveRefs`, `validateTokens`,
  `generatePrimeVue`, `buildPrimeVuePreset`, `generatePrimeVuePT`,
  `buildPrimeVuePTObject`, `generateUnoCSS`, `generateShortcuts`,
  `isBuiltinPalette`, `resolveScale`
- Types: `TokenSchema`, `AutoTokenSchema`, `ResolvedTokens`,
  `ResolvedAutoTokens`, the various config sub-types, plus the PT class
  maps, plus `BuiltinPaletteName`
- Constants: `COLOR_STEPS`, `PRIMEVUE_BASE_THEMES`, `BUILTIN_PALETTES`,
  `BUILTIN_PALETTE_NAMES`, `isRef`

## Build output

[tsup.config.ts](../packages/core/tsup.config.ts) builds three entries
(`index`, `cli`, `vite`) in both ESM and CJS, with `.d.ts` files. Only the
`dist/` folder ships — see [release.md](release.md).
