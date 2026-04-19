# Getting started

## Prerequisites

- **Node.js** 18+ (tested on 20 / 22)
- **pnpm** 8+ — this repo is a pnpm workspace; `npm` and `yarn` are not
  supported

## Install

```bash
pnpm install
```

Installs dependencies for the root, [packages/core](../packages/core), and
[packages/playground](../packages/playground).

## Common scripts

Run from the repo root unless noted.

| Command | What it does |
| --- | --- |
| `pnpm build` | Build every package (currently just `theme-unify`) via `tsup` |
| `pnpm test` | Run vitest in every package |
| `pnpm dev` | Start the playground dev server (proxies to `@theme-unify/playground`) |
| `pnpm generate` | Re-run the CLI against the playground's `tokens.config.ts` |

Per-package scripts:

- [packages/core/package.json](../packages/core/package.json) — `build`,
  `dev` (tsup watch), `test`, `test:watch`
- [packages/playground/package.json](../packages/playground/package.json) —
  `dev`, `build`, `preview`, `generate`

## Typical workflow

1. Edit something under [packages/core/src](../packages/core/src).
2. `pnpm --filter theme-unify build` (or `pnpm --filter theme-unify dev` for
   watch mode).
3. `pnpm generate` — regenerate the playground's
   [src/generated](../packages/playground/src/generated) files using your
   new build.
4. `pnpm dev` — visually inspect changes in the playground.
5. `pnpm test` — run unit tests.

## Troubleshooting

- **CLI uses stale code after editing `core`** — `tsup` builds to
  [packages/core/dist](../packages/core/dist). Re-run `pnpm --filter
  theme-unify build` or use `pnpm --filter theme-unify dev` for incremental
  rebuilds.
- **Config not picked up** — `loadTokens` uses `jiti` for dynamic TS
  imports. Ensure the path passed to `--config` exists and exports a
  default. See [pipeline.md](pipeline.md).
- **UnoCSS classes missing in production build** — generated PT class
  strings are scanned via `content.filesystem` in
  [packages/playground/uno.config.ts](../packages/playground/uno.config.ts).
  If you add a new generated file, add it to that array.
- **`vite-tsc` errors after editing types** — re-run the core build first;
  the playground depends on the published `dist/index.d.ts`.
