# theme-unify

Compile a single token definition into a **PrimeVue 4 theme preset** and a
**matching UnoCSS theme config** — one source of truth for colors,
spacing, typography, and dark mode across both libraries.

The generated PrimeVue preset emits `--p-*` CSS variables; the generated
UnoCSS theme reads from the same variables. Swap your preset at runtime
and every utility class follows automatically — no rebuild required.

---

## Highlights

- **One config, two systems.** Define palettes, spacing, radii, shadows,
  typography, and dark mode once. Generate a `definePreset(...)` call for
  PrimeVue **and** matching UnoCSS `colors` / `spacing` / `borderRadius`
  / `boxShadow` / `fontFamily` / `fontSize` / `lineHeight` / `fontWeight`
  exports.
- **22 builtin palettes.** Tailwind v3 / PrimeUix Aura palettes shipped
  in-box (`emerald`, `slate`, `purple`, …). Reference them by name from
  `semantic`. Define your own primitive scales to override or extend.
- **Lazy refs.** Cross-reference any value with `{ ref: "radii.sm" }`,
  `{ ref: "colors.brand.500" }`, etc. — handy inside `preset.overrides`.
- **Strict validation.** All 11 color steps required, ref paths checked,
  CSS values sniff-tested. Failures surface in one consolidated error.
- **Idempotent writes.** Generated files only re-write when contents
  change, so file watchers and HMR stay calm.
- **Catalog generator.** Emits a fifth `palettes.ts` describing every
  scale your config can reach (custom + builtin), perfect for swatch
  pickers and design-system docs.

---

## Install

```bash
pnpm add -D theme-unify
# or npm i -D theme-unify / yarn add -D theme-unify
```

The package ships with a CLI, programmatic API, and TypeScript types.

---

## 60-second tour

### 1. Author a config

```ts
// tokens.config.ts
import { defineTokens } from "theme-unify";

export default defineTokens({
  meta: { name: "My Theme", darkModeSelector: ".dark" },

  primitive: {
    colors: {
      brand: {
        50: "#FDF2F4", 100: "#FAE0E4", 200: "#F5BDC6", 300: "#EF8E9E",
        400: "#E65A73", 500: "#D02B4B", 600: "#B2213E", 700: "#8E1A32",
        800: "#6E1528", 900: "#4E1020", 950: "#300A14",
      },
    },
    spacing: { xs: "0.25rem", sm: "0.5rem", md: "0.75rem", lg: "1rem" },
    radii:   { sm: "0.25rem", md: "0.5rem", lg: "1rem", full: "9999px" },
    typography: { fontFamily: "'Inter', system-ui, sans-serif" },
  },

  semantic: {
    primary: "brand",
    surface: { scale: "slate", darkScale: "zinc" }, // builtins
    extra:   { success: "emerald", warning: "amber", danger: "red" },
  },

  preset: {
    base: "aura",
    overrides: {
      semantic: {
        focusRing: { width: "3px", style: "solid", color: "{primary.color}", offset: "2px" },
        formField: { borderRadius: { ref: "radii.sm" } },
      },
    },
  },

  unocss: {
    shortcuts: {
      "bg-page":    { light: "bg-surface-50",     dark: "dark:bg-surface-950" },
      "text-body":  { light: "text-surface-900",  dark: "dark:text-surface-100" },
      "text-muted": { light: "text-surface-500",  dark: "dark:text-surface-400" },
    },
  },
});
```

### 2. Run the CLI

```bash
pnpm exec theme-unify -c ./tokens.config.ts -o ./src/generated
```

This writes four files into `./src/generated/`:

| File           | Exports                                                                     |
| -------------- | --------------------------------------------------------------------------- |
| `preset.ts`    | `GeneratedPreset` — pass to PrimeVue's `theme.preset`                       |
| `uno-theme.ts` | `colors`, `spacing`, `borderRadius`, `boxShadow`, `fontFamily`, `fontSize`, `lineHeight`, `fontWeight` |
| `shortcuts.ts` | `shortcuts` — `Record<string, string>` ready for UnoCSS `shortcuts:` config |
| `palettes.ts`  | `customPalettes`, `builtinPalettes`, `referencedBuiltinPalettes`, `shadowedBuiltinPalettes`, `availableBuiltinPaletteNames` |

### 3. Wire into your app

```ts
// main.ts (Vue)
import { createApp } from "vue";
import PrimeVue from "primevue/config";
import { GeneratedPreset } from "./generated/preset";
import App from "./App.vue";

createApp(App)
  .use(PrimeVue, {
    theme: { preset: GeneratedPreset, options: { darkModeSelector: ".dark" } },
  })
  .mount("#app");
```

```ts
// uno.config.ts
import { defineConfig, presetUno } from "unocss";
import {
  colors, spacing, borderRadius, boxShadow,
  fontFamily, fontSize, lineHeight, fontWeight,
} from "./src/generated/uno-theme";
import { shortcuts } from "./src/generated/shortcuts";

export default defineConfig({
  presets: [presetUno({ dark: { dark: ".dark" } })],
  theme:   { colors, spacing, borderRadius, boxShadow,
             fontFamily, fontSize, lineHeight, fontWeight },
  shortcuts,
});
```

That's it. `bg-primary-500` works in your templates; PrimeVue components
share the exact same color. Toggle `.dark` on `<html>` and both flip.

---

## CLI

```
theme-unify [options]
theme-unify colors [options]
```

### Default command

| Flag                     | Default              | Notes                                                |
| ------------------------ | -------------------- | ---------------------------------------------------- |
| `-c, --config <path>`    | `./tokens.config.ts` | Path to the token config file                        |
| `-o, --outDir <path>`    | `./generated`        | Output directory (created if missing)                |
| `--preset <filename>`    | `preset.ts`          | PrimeVue preset filename                             |
| `--uno-theme <filename>` | `uno-theme.ts`       | UnoCSS theme filename                                |
| `--shortcuts <filename>` | `shortcuts.ts`       | UnoCSS shortcuts filename                            |
| `--palettes <filename>`  | `palettes.ts`        | Palette catalog filename                             |
| `--dry-run`              | —                    | Print everything to stdout instead of writing        |
| `--validate`             | —                    | Validate config and exit (no output)                 |
| `-f, --force`            | —                    | Always write, even when content is unchanged         |
| `-w, --watch`            | —                    | Re-generate on token-file change *(planned for v0.2)* |
| `-h, --help`             | —                    | Show help                                            |
| `-v, --version`          | —                    | Show version                                         |

### `colors` subcommand

```bash
theme-unify colors [-c <path>] [--json]
```

Lists every color scale theme-unify can resolve for your config — your
custom palettes, the builtin palettes referenced by `semantic`, and the
full set of builtin names you can pull from. `--json` prints a
machine-readable `PaletteCatalog` instead.

### Adding it to your project

```jsonc
// package.json
{
  "scripts": {
    "tokens": "theme-unify -c ./tokens.config.ts -o ./src/generated",
    "tokens:check": "theme-unify -c ./tokens.config.ts --validate"
  }
}
```

Then `pnpm tokens` (or run it before `dev` / `build`).

---

## Token config (cheat sheet)

```ts
ThemeUnifyConfig {
  meta: {
    name: string;              // human-readable label
    darkModeSelector?: string; // default ".dark"
  };

  primitive: {                          // raw values — NO refs
    colors:    Record<string, ColorScale>;        // each scale needs all 11 steps
    spacing?:  Record<string, string>;
    radii?:    Record<string, string>;
    shadows?:  Record<string, string>;
    typography?: { fontFamily; baseFontSize?; baseLineHeight? };
    fontWeight?: Record<string, string>;
  };

  semantic?: {                          // role mapping
    primary?: SemanticScaleRef;                   // string name OR inline ColorScale
    surface?: { scale: SemanticScaleRef; darkScale?: SemanticScaleRef };
    extra?:   Record<string, SemanticScaleRef>;
  };

  preset?: {                            // PrimeVue overrides — refs allowed
    base?: "aura" | "lara" | "nora" | "material"; // default "aura"
    overrides?: Record<string, unknown>;
  };

  unocss?: {
    shortcuts?: Record<string, { light: string; dark: string }>;
  };
}
```

A `SemanticScaleRef` is either:

- a **string** naming a scale in `primitive.colors` or one of the 22
  builtin palettes (`emerald`, `green`, `lime`, `red`, `orange`,
  `amber`, `yellow`, `teal`, `cyan`, `sky`, `blue`, `indigo`, `violet`,
  `purple`, `fuchsia`, `pink`, `rose`, `slate`, `gray`, `zinc`,
  `neutral`, `stone`); **or**
- an inline `ColorScale` literal with all 11 steps.

Refs (only inside `preset.overrides`):

```ts
{ ref: "colors.brand.500" } { ref: "radii.sm" } { ref: "spacing.md" }
{ ref: "shadows.lg" }       { ref: "fontWeight.bold" }
{ ref: "typography.fontFamily" }
```

For full editor autocomplete on `preset.overrides` (every PrimeVue knob),
import `defineTokens` from one of the per-base typed entries:

```ts
import { defineTokens } from "theme-unify/aura"; // or /lara, /nora, /material
```

These require `@primeuix/themes` (an optional peer dependency). For
custom presets, use the generic `theme-unify/typed` entry.

See the [consumer guide](docs/consumer-guide.md) and the [token-schema
reference](docs/token-schema.md) for the full surface.

---

## Programmatic API

```ts
import {
  defineTokens,
  loadTokens,
  resolveRefs,
  validateTokens,
  generatePreset,
  generateUnoTheme,
  generateShortcuts,
  generatePalettes,
  collectPalettes,
  // builtin palettes
  BUILTIN_PALETTES, BUILTIN_PALETTE_NAMES, isBuiltinPalette, resolveScale,
  // errors
  TokenValidationError, CircularReferenceError, UnresolvedRefError,
} from "theme-unify";

const tokens   = await loadTokens("./tokens.config.ts");   // load + validate
const resolved = resolveRefs(tokens);                       // expand { ref }

const presetCode    = generatePreset(resolved);             // string of TS source
const unoThemeCode  = generateUnoTheme(resolved);
const shortcutsCode = generateShortcuts(resolved);
const palettesCode  = generatePalettes(resolved);

// or get the raw object without serializing:
import { buildPresetObject } from "theme-unify";
const presetObject = buildPresetObject(resolved);
```

Every public symbol carries JSDoc — hover any import in your editor for
inline docs. See [docs/consumer-guide.md](docs/consumer-guide.md) for
worked examples (Vite plugins, Storybook builders, runtime theme
swappers, …).

---

## Project layout

```
packages/
  core/         # CLI + generators + public API (npm: theme-unify)
  playground/   # Vue 3 demo app using PrimeVue + UnoCSS with generated output
docs/           # Contributor + consumer documentation
```

---

## Documentation

- [Consumer guide](docs/consumer-guide.md) — recipes for app developers
  (Vue, Vite, Nuxt, Storybook, runtime theme swap).
- [Token schema](docs/token-schema.md) — full reference for every config
  field.
- [CLI](docs/cli.md) — flags, subcommands, exit codes.
- [Generators](docs/generators.md) — what each output file looks like.
- [Pipeline](docs/pipeline.md) — load → validate → resolve → generate.
- [Architecture](docs/architecture.md) — monorepo layout and modules.
- [Contributing](docs/contributing.md) — workflow, code style, releases.

---

## License

MIT
