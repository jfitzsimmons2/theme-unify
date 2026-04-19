# CLI

Source: [packages/core/src/cli.ts](../packages/core/src/cli.ts).

The CLI is built on [`cac`](https://github.com/cacjs/cac). It has a
single default command — there are no subcommands. The published binary
is `theme-unify` (configured via `bin` in
[packages/core/package.json](../packages/core/package.json)).

## Flags

| Flag | Default | Notes |
| --- | --- | --- |
| `-c, --config <path>` | `./tokens.config.ts` | Resolved against `process.cwd()` |
| `-o, --outDir <path>` | `./generated` | Created if missing |
| `--preset <filename>` | `preset.ts` | PrimeVue preset output |
| `--uno-theme <filename>` | `uno-theme.ts` | UnoCSS theme exports (CSS-variable backed) |
| `--shortcuts <filename>` | `shortcuts.ts` | UnoCSS shortcuts |
| `--dry-run` | off | Print all outputs to stdout, do not write |
| `--force` | off | Always write, even if content is unchanged |
| `--validate` | off | Run `loadTokens` (which validates) and exit 0 |
| `-w, --watch` | off | **Not implemented** — prints a warning |
| `-h, --help` | — | Built-in `cac` help |
| `-v, --version` | — | Reads from package.json |

## Behavior

1. Resolve `--config` and `--outDir` against the cwd.
2. `loadTokens(configPath)` — also validates.
3. If `--validate`, print `✓ Token config is valid.` and exit 0.
4. `resolveRefs(tokens)`.
5. Run `generatePreset`, `generateUnoTheme`, `generateShortcuts`.
6. If `--dry-run`, print `// === <filename> ===` headers followed by
   code to stdout; otherwise call `writeOutput` for each.
7. Print one line per file: `✓ name`, `✓ name (forced)`, or
   `· name (unchanged)`.
8. Print `Output written to <outDir>`.

## Exit codes

| Code | Cause |
| --- | --- |
| 0 | Success (or `--validate` passed) |
| 1 | Any thrown error — `TokenValidationError` is formatted; others print `Error: <message>` |
