# CLI

Source: [packages/core/src/cli.ts](../packages/core/src/cli.ts).

The CLI is built on [`cac`](https://github.com/cacjs/cac). It exposes a
default generation command plus `init` and `colors` subcommands. The
published binary is `theme-unify` (configured via `bin` in
[packages/core/package.json](../packages/core/package.json)).

## Flags

| Flag | Default | Notes |
| --- | --- | --- |
| `-c, --config <path>` | `./tokens.config.ts` | Resolved against `process.cwd()` |
| `-o, --outDir <path>` | `./generated` | Created if missing |
| `--preset <filename>` | `preset.ts` | PrimeVue preset output |
| `--uno-theme <filename>` | `uno-theme.ts` | UnoCSS theme exports (CSS-variable backed) |
| `--shortcuts <filename>` | `shortcuts.ts` | UnoCSS shortcuts |
| `--palettes <filename>` | `palettes.ts` | Color palette catalog (custom + shipped builtin hex values) |
| `--dry-run` | off | Print all outputs to stdout, do not write |
| `--force` | off | Always write, even if content is unchanged |
| `--validate` | off | Run `loadTokens` (which validates) and exit 0 |
| `--silent` | off | Suppress informational output (errors still print) |
| `-w, --watch` | off | **Not implemented** — prints a warning |
| `-h, --help` | — | Built-in `cac` help |
| `-v, --version` | — | Reads from package.json |

## Behavior

1. Resolve `--config` and `--outDir` against the cwd.
2. **Refuse** if `--outDir` is the same directory as `--config` (would
   clobber the config). Exits with a non-zero code and a hint.
3. `loadTokens(configPath)` — also validates.
4. If `--validate`, print `✓ Token config is valid.` and exit 0.
5. `resolveRefs(tokens)`.
6. Run `generatePreset`, `generateUnoTheme`, `generateShortcuts`,
   `generatePalettes`.
7. If `--dry-run`, print `// === <filename> ===` headers followed by
   code to stdout; otherwise call `writeOutput` for each.
8. Print one line per file with a clickable `file://` URL: `✓ name`,
   `✓ name (forced)`, or `· name (unchanged)`.
9. Print a one-line summary: `4 files, 3 written, 1 unchanged`.
10. Print `Output directory: file://…` (clickable in most terminals).

Under `--silent`, steps 4 and 8–10 are suppressed; errors still print to
`stderr`.

## `init` subcommand

```
theme-unify init [path] [--force] [--silent]
```

Writes a starter `tokens.config.ts` at `path` (default
`./tokens.config.ts`). Refuses to overwrite an existing file unless
`--force` is passed. The starter contains one custom palette (`brand`),
uses `slate` / `zinc` for surfaces, and is ready to run through the main
command without further edits.

## `colors` subcommand

```
theme-unify colors [-c <path>] [--json]
```

Lists every color scale theme-unify knows about for the given config:

- **Custom palettes** — every entry in `primitive.colors`, with hex
  values. Names that shadow a builtin are tagged.
- **Referenced builtins** — the subset of builtin (Tailwind v3 / Aura)
  palettes used by `semantic.primary`, `semantic.surface.{scale,darkScale}`,
  or `semantic.extra.*`, with hex values.
- **Opt-in builtins** — builtins additionally exposed via
  `unocss.includeBuiltinPalettes`, with hex values.
- **All available builtin names** — the full list of 22 builtin palettes
  you can reference from `semantic` or opt into via `unocss.includeBuiltinPalettes`.

Pass `--json` to print the raw `PaletteCatalog` object instead of the
formatted listing.

## Exit codes

| Code | Cause |
| --- | --- |
| 0 | Success (or `--validate` passed) |
| 1 | Any thrown error — `TokenValidationError` is formatted; others print `Error: <message>` |
