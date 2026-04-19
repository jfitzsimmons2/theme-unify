# theme-unify

Compile a single token definition into a **PrimeVue 4 theme preset** and **UnoCSS theme config** — one source of truth for colors, spacing, typography, and dark mode.

## Quick start

```bash
pnpm install
pnpm build          # build the core package
pnpm generate       # run the CLI against the playground config
pnpm dev            # start the playground dev server
```

## How it works

1. You write a `tokens.config.ts` file using `defineTokens()`.
2. The CLI reads that config, resolves cross-references (e.g. `{ ref: "colors.beetroot.500" }`), and generates:
   - **`primevue-preset.ts`** — a `definePreset(Aura, { … })` you pass to PrimeVue's `config`.
   - **`unocss-theme.ts`** — `colors`, `borderRadius`, `boxShadow`, `fontFamily`, and `fontWeight` exports for UnoCSS's `theme`.
   - **`unocss-shortcuts.ts`** — semantic shortcut classes like `bg-page`, `text-body`, `border-default` with built-in dark mode variants.

## CLI usage

```
theme-unify [options]
```

| Flag                     | Default               | Description                                             |
| ------------------------ | --------------------- | ------------------------------------------------------- |
| `-c, --config <path>`    | `./tokens.config.ts`  | Path to the token config file                           |
| `-o, --outDir <path>`    | `./generated`         | Output directory for generated files                    |
| `--primevue <filename>`  | `primevue-preset.ts`  | PrimeVue preset output filename                         |
| `--unocss <filename>`    | `unocss-theme.ts`     | UnoCSS theme output filename                            |
| `--shortcuts <filename>` | `unocss-shortcuts.ts` | UnoCSS shortcuts output filename                        |
| `--dry-run`              | —                     | Print generated code to stdout instead of writing files |
| `--validate`             | —                     | Validate the config and exit (no output)                |
| `-w, --watch`            | —                     | Re-generate on file change _(planned for v0.2)_         |
| `-h, --help`             | —                     | Show help                                               |
| `-v, --version`          | —                     | Show version                                            |

### Examples

The CLI is available as a local dependency — run it with `pnpm exec`, `npx`, or via a `package.json` script:

```bash
# Generate with defaults
pnpm exec theme-unify -c ./tokens.config.ts -o ./src/generated

# Validate only
pnpm exec theme-unify -c ./tokens.config.ts --validate

# Dry run (preview output)
pnpm exec theme-unify -c ./tokens.config.ts --dry-run

# Custom filenames
pnpm exec theme-unify -c ./tokens.config.ts -o ./theme \
  --primevue my-preset.ts \
  --unocss my-theme.ts \
  --shortcuts my-shortcuts.ts
```

Or add a script to your `package.json`:

```json
{
  "scripts": {
    "generate": "theme-unify -c ./tokens.config.ts -o ./src/generated"
  }
}
```

Then run `pnpm generate`.

## Token config

Create a `tokens.config.ts` using the `defineTokens` helper for full type safety:

```ts
import { defineTokens } from "theme-unify";

export default defineTokens({
  meta: {
    name: "My Theme",
    darkModeStrategy: "class",
    darkModeSelector: ".dark",
  },

  primitive: {
    colors: {
      brand: {
        50: "#FDF2F4",
        100: "#FAE0E4",
        // ... 200 through 950
      },
    },
    radii: { sm: "0.25rem", md: "0.5rem", lg: "1rem", full: "9999px" },
    shadows: {
      sm: "0 1px 3px rgba(0,0,0,0.06)",
      md: "0 2px 8px rgba(0,0,0,0.08)",
    },
    typography: { fontFamily: "Inter, sans-serif" },
    fontWeight: { normal: "400", medium: "500", bold: "700" },
  },

  semantic: {
    colors: {
      primary: { scale: "brand" }, // maps the full brand scale → PrimeVue primary
    },
    backgrounds: {
      pageLight: { ref: "colors.brand.50" },
      pageDark: { ref: "colors.brand.950" },
    },
    surface: { scale: "brand", invertInDarkMode: true },
  },

  primevue: {
    base: "aura", // base theme: "aura" | "lara" | "nora" | "material"
    colorScheme: {
      light: {
        primary: {
          color: { ref: "colors.brand.500" },
          hoverColor: { ref: "colors.brand.600" },
        },
      },
    },
    focusRing: {
      width: "3px",
      style: "solid",
      color: "{primary.color}",
      offset: "2px",
    },
  },

  unocss: {
    colorAliases: { main: "brand" }, // use `bg-main-500` as alias for `bg-brand-500`
    shortcuts: {
      "bg-page": { light: "bg-brand-50", dark: "dark:bg-brand-950" },
      "text-body": { light: "text-brand-900", dark: "dark:text-brand-100" },
    },
  },
});
```

### Cross-references

Use `{ ref: "..." }` to point at any value in the config. Paths are dot-separated:

- `colors.brand.500` → `primitive.colors.brand[500]`
- `radii.sm` → `primitive.radii.sm`
- `semantic.backgrounds.pageLight` → resolved value of that background ref

## Programmatic API

```ts
import {
  defineTokens,
  loadTokens,
  resolveRefs,
  validateTokens,
  generatePrimeVue,
  generateUnoCSS,
  generateShortcuts,
} from "theme-unify";

const tokens = await loadTokens("./tokens.config.ts");
const resolved = resolveRefs(tokens);

const primevueCode = generatePrimeVue(resolved);
const unoCSSCode = generateUnoCSS(resolved);
const shortcutCode = generateShortcuts(resolved);
```

## Project structure

```
packages/
  core/           # CLI + generators + public API (npm: theme-unify)
  playground/     # Vue 3 demo app using PrimeVue + UnoCSS with generated output
```

## Contributing

See [docs/](docs/README.md) for contributor documentation — architecture,
the token pipeline, generators, CLI internals, testing, and release
process. Start with [docs/getting-started.md](docs/getting-started.md).

## License

MIT
