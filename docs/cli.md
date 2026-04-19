# CLI

Source: [packages/core/src/cli.ts](../packages/core/src/cli.ts).

The CLI is built on [`cac`](https://github.com/cacjs/cac). It has a single
default command — there are no subcommands. The published binary is
`theme-unify` (configured via `bin` in
[packages/core/package.json](../packages/core/package.json)).

## Flags

| Flag | Default | Notes |
| --- | --- | --- |
| `-c, --config <path>` | `./tokens.config.ts` | Resolved against `process.cwd()` |
| `-o, --outDir <path>` | `./generated` | Created if missing |
| `--primevue <filename>` | `primevue-preset.ts` | Styled-mode preset output |
| `--unocss <filename>` | `unocss-theme.ts` | UnoCSS theme exports |
| `--shortcuts <filename>` | `unocss-shortcuts.ts` | UnoCSS shortcuts |
| `--pt <filename>` | `primevue-pt.ts` | PrimeVue passthrough preset |
| `--primevue-base-css <filename>` | `primevue-base.css` | PrimeVue typography preflight CSS (only written when `primitive.typography.baseFontSize` or `baseLineHeight` is set) |
| `--dry-run` | off | Print all outputs to stdout, do not write |
| `--validate` | off | Run `loadTokens` (which validates) and exit 0 |
| `-w, --watch` | off | **Not implemented** — prints a warning |
| `-h, --help` | — | Built-in `cac` help |
| `-v, --version` | — | Hard-coded to `0.1.0` in `cli.ts` |

## Behavior

1. Resolve `--config` and `--outDir` against the cwd.
2. `loadTokens(configPath)` — also validates.
3. If `--validate`, print `✓ Token config is valid.` and exit 0.
4. `resolveRefs(tokens)`.
5. Run all generators (`generatePrimeVue`, `generateUnoCSS`,
   `generateShortcuts`, `generatePrimeVuePT`,
   `generatePrimeVueBaseCss`).
6. If `--dry-run`, print `// === <filename> ===` headers followed by code
   to stdout; otherwise call `writeOutput` for each.
7. Print one line per file: `✓ name` (written) or `· name (unchanged)`.
8. Print `Output written to <outDir>`.
9. If `--watch`, print the not-implemented warning.

## Exit codes

| Code | Cause |
| --- | --- |
| 0 | Success (or `--validate` passed) |
| 1 | Any thrown error — `TokenValidationError` is formatted; others print `Error: <message>` |

## Future work (`--watch`)

The flag is wired but no implementation. A reasonable v0.2 design:

- Use `chokidar` to watch the resolved config path.
- On change: re-run steps 2–7, swallowing errors so the watcher doesn't
  die on a broken config.
- Optionally watch transitively-imported files (jiti exposes the import
  graph).

See also [vite-plugin.md](vite-plugin.md) for the alternative HMR-based
approach.
