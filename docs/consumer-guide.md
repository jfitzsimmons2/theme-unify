# Consumer guide

Practical recipes for **using** `theme-unify` in an app. If you're
contributing to the library itself, see [contributing.md](contributing.md);
this page is for developers integrating the generated output into a
project.

> The schema reference for every field mentioned here lives in
> [token-schema.md](token-schema.md). The CLI's flags are documented in
> [cli.md](cli.md).

## Table of contents

1. [Install](#install)
2. [Author the config](#author-the-config)
3. [Generate](#generate)
4. [Wire into PrimeVue](#wire-into-primevue)
5. [Wire into UnoCSS](#wire-into-unocss)
6. [Toggling dark mode](#toggling-dark-mode)
7. [Editor autocomplete (`defineTypedTokens`)](#editor-autocomplete-definetypedtokens)
8. [Builtin palettes](#builtin-palettes)
9. [Cross-references in `preset.overrides`](#cross-references-in-presetoverrides)
10. [Programmatic API](#programmatic-api)
11. [Custom build pipelines](#custom-build-pipelines)
12. [Runtime theme swapping](#runtime-theme-swapping)
13. [Catalog UI from `palettes.ts`](#catalog-ui-from-palettests)
14. [Validation in CI](#validation-in-ci)
15. [Troubleshooting](#troubleshooting)

---

## Install

```bash
pnpm add -D theme-unify
```

You will also need `primevue` and `@primeuix/themes` (the base presets
the generator imports from), and `unocss` (or any UnoCSS-compatible
runtime) on the consumer side.

```bash
pnpm add primevue @primeuix/themes
pnpm add -D unocss
```

## Author the config

Use [`defineTokens`](#programmatic-api) for autocomplete and validation.
The result must be the **default export** so the CLI can find it.

```ts
// tokens.config.ts
import { defineTokens } from "theme-unify";

export default defineTokens({
  meta: { name: "My Theme" },
  primitive: { colors: { /* ... */ } },
  semantic:  { primary: "blue" },
});
```

See [token-schema.md](token-schema.md) for the full shape, and
[the playground config](../packages/playground/tokens.config.ts) for a
real-world example.

## Generate

```bash
pnpm exec theme-unify -c ./tokens.config.ts -o ./src/generated
```

Add it to `package.json` so teammates and CI run it the same way:

```jsonc
{
  "scripts": {
    "tokens":       "theme-unify -c ./tokens.config.ts -o ./src/generated",
    "tokens:check": "theme-unify -c ./tokens.config.ts --validate",
    "predev":       "pnpm tokens",
    "prebuild":     "pnpm tokens"
  }
}
```

The four generated files (`preset.ts`, `uno-theme.ts`, `shortcuts.ts`,
`palettes.ts`) are deterministic and idempotent — checking them into git
is fine and gives you a clean diff whenever tokens change.

## Wire into PrimeVue

```ts
// main.ts
import { createApp } from "vue";
import PrimeVue from "primevue/config";
import { GeneratedPreset } from "./generated/preset";
import App from "./App.vue";

createApp(App)
  .use(PrimeVue, {
    theme: {
      preset: GeneratedPreset,
      options: {
        darkModeSelector: ".dark", // must match meta.darkModeSelector
      },
    },
  })
  .mount("#app");
```

## Wire into UnoCSS

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

Every value in `theme` is a `var(--p-*)` reference. Because PrimeVue
emits the actual hex values into those variables at runtime, you don't
need to rebuild UnoCSS to recolor the app — see
[Runtime theme swapping](#runtime-theme-swapping).

> **Production scan**: PrimeVue PassThrough props can hide UnoCSS class
> strings from the static scanner. Add the generated files to
> `content.filesystem` if your build strips utilities you expected to
> ship:
> ```ts
> content: { filesystem: ["src/generated/*.ts"] }
> ```

## Toggling dark mode

```ts
function toggleDark() {
  document.documentElement.classList.toggle("dark");
}
```

Both PrimeVue components (via `theme.options.darkModeSelector`) and
UnoCSS shortcuts (via the `dark:` prefix in your shortcut values) read
the same selector. Use whatever class/attribute suits your stack — set
`meta.darkModeSelector` to match.

## Editor autocomplete (`defineTypedTokens`)

Stock `defineTokens` (from the bare `theme-unify` import) types
`preset.overrides` as `Record<string, unknown>` so the core entry
stays free of any `@primeuix/themes` dependency. To get full
IntelliSense across every PrimeVue knob, import `defineTokens` from
the per-base sugar entry that matches your `preset.base`:

```ts
// tokens.config.ts
import { defineTokens } from "theme-unify/aura"; // or /lara, /nora, /material

export default defineTokens({
  meta: { name: "My Theme" },
  primitive: { colors: { /* ... */ } },
  preset: {
    base: "aura",
    overrides: {
      semantic: {
        focusRing: { width: "3px", color: { ref: "colors.beetroot.500" } },
      },
    },
  },
});
```

The per-base entries:

- Widen every string leaf inside `preset.overrides` to `string | Ref`
  so refs are valid wherever PrimeVue expects a string.
- Surface builtin palette names alongside your custom palette keys in
  `semantic.primary`, `semantic.surface.{scale,darkScale}`, and
  `semantic.extra.*`.

If you need to type against a custom preset that's not one of the four
shipped bases, use the generic entry:

```ts
import { defineTypedTokens } from "theme-unify/typed";
import type { Preset } from "@primeuix/themes/types";
import type { MyBaseTokens } from "./my-base";

export default defineTypedTokens<Preset<MyBaseTokens>>({ /* ... */ });
```

`@primeuix/themes` is an **optional peer dependency** of
`theme-unify` — install it only if you import one of the typed
entries:

```bash
pnpm add -D @primeuix/themes
```

## Builtin palettes

22 Tailwind v3 / PrimeUix Aura palettes are bundled. Reference them by
name from `semantic`:

```ts
semantic: {
  primary: "purple",
  surface: { scale: "slate", darkScale: "zinc" },
  extra:   { success: "emerald", warning: "amber", danger: "red" },
}
```

| Group   | Names                                                                |
| ------- | -------------------------------------------------------------------- |
| Greens  | `emerald`, `green`, `lime`, `teal`                                   |
| Reds    | `red`, `orange`, `amber`, `yellow`, `pink`, `rose`, `fuchsia`        |
| Blues   | `cyan`, `sky`, `blue`, `indigo`, `violet`, `purple`                  |
| Neutrals | `slate`, `gray`, `zinc`, `neutral`, `stone`                         |

Defining a `primitive.colors.purple` shadows the builtin and emits a
one-time `console.warn`. The CLI's `colors` subcommand prints every
palette your config can reach:

```bash
pnpm exec theme-unify colors            # formatted listing
pnpm exec theme-unify colors --json     # machine-readable
```

## Cross-references in `preset.overrides`

Refs are only allowed inside `preset.overrides` (not inside `primitive`
or `semantic`). The path syntax expands a few aliases:

| Path                       | Resolves to                            |
| -------------------------- | -------------------------------------- |
| `colors.brand.500`         | `primitive.colors.brand[500]`          |
| `colors.purple.500`        | builtin `purple` palette, step 500     |
| `radii.sm`                 | `primitive.radii.sm`                   |
| `spacing.md`               | `primitive.spacing.md`                 |
| `shadows.lg`               | `primitive.shadows.lg`                 |
| `fontWeight.bold`          | `primitive.fontWeight.bold`            |
| `typography.fontFamily`    | `primitive.typography.fontFamily`      |

```ts
preset: {
  overrides: {
    semantic: {
      formField: {
        borderRadius: { ref: "radii.sm" },
        focusRing:    { color: { ref: "colors.brand.500" } },
      },
    },
    components: {
      button: { padding: { ref: "spacing.md" } },
    },
  },
}
```

Cycles throw `CircularReferenceError`; missing paths throw
`UnresolvedRefError`. Both are exported from `theme-unify`.

## Programmatic API

```ts
import {
  loadTokens,
  resolveRefs,
  validateTokens,
  generatePreset, generateUnoTheme, generateShortcuts, generatePalettes,
  buildPresetObject, collectPalettes,
  TokenValidationError,
} from "theme-unify";

// Load + validate; throws TokenValidationError on issues.
const tokens = await loadTokens("./tokens.config.ts");

// Resolve { ref } pointers; throws Circular/UnresolvedRefError.
const resolved = resolveRefs(tokens);

// Generators return TypeScript source as strings.
const presetCode    = generatePreset(resolved);
const unoThemeCode  = generateUnoTheme(resolved);
const shortcutsCode = generateShortcuts(resolved);
const palettesCode  = generatePalettes(resolved);

// Or skip serialization and get the raw preset object:
const presetObj = buildPresetObject(resolved);

// Validate without loading from disk:
const issues = validateTokens(tokens);
if (issues.length > 0) {
  throw new TokenValidationError(issues);
}

// Inspect every palette the config can reach:
const catalog = collectPalettes(resolved);
console.log(catalog.referencedBuiltins, catalog.shadowedBuiltins);
```

Hover any import in your editor for inline docs (every public symbol
carries JSDoc).

## Custom build pipelines

### Vite plugin (manual)

```ts
// vite.config.ts
import { defineConfig } from "vite";
import { writeFileSync } from "node:fs";
import {
  loadTokens, resolveRefs,
  generatePreset, generateUnoTheme, generateShortcuts, generatePalettes,
} from "theme-unify";

export default defineConfig({
  plugins: [
    {
      name: "theme-unify",
      async buildStart() {
        const tokens   = await loadTokens("./tokens.config.ts");
        const resolved = resolveRefs(tokens);
        writeFileSync("src/generated/preset.ts",    generatePreset(resolved));
        writeFileSync("src/generated/uno-theme.ts", generateUnoTheme(resolved));
        writeFileSync("src/generated/shortcuts.ts", generateShortcuts(resolved));
        writeFileSync("src/generated/palettes.ts",  generatePalettes(resolved));
      },
    },
  ],
});
```

The shipped `theme-unify/vite` entry is a placeholder slated for a
proper auto-regenerate-on-change implementation in v0.2 — until then,
the snippet above gives you the same effect (run on `buildStart`).

### Storybook / Vitest builders

Run the CLI as a `predev` / `prebuild` hook. Generated files are
plain TS and import cleanly into any toolchain.

## Runtime theme swapping

Because UnoCSS values are `var(--p-*)` references, you can repaint your
entire app at runtime by swapping the PrimeVue preset:

```ts
import { usePreset } from "@primeuix/themes";
import { GeneratedPreset } from "./generated/preset";

usePreset({
  ...GeneratedPreset,
  semantic: {
    ...GeneratedPreset.semantic,
    primary: { 500: "#3b82f6" /* override one step at a time */ },
  },
});
// every bg-primary-* utility on the page updates immediately
```

For multi-theme apps, ship multiple `tokens.config.ts` files, generate
one preset per theme into separate filenames (`--preset
preset-blue.ts`), and `usePreset(...)` to switch.

## Catalog UI from `palettes.ts`

The `palettes.ts` output is purpose-built for swatch pickers and design-
system docs. Five `as const` exports:

| Export                          | Use for                                         |
| ------------------------------- | ----------------------------------------------- |
| `customPalettes`                | render every scale from `primitive.colors`      |
| `builtinPalettes`               | render all 22 builtin palettes                  |
| `referencedBuiltinPalettes`     | render only builtins your config actually uses  |
| `shadowedBuiltinPalettes`       | warn the user about name collisions             |
| `availableBuiltinPaletteNames`  | populate a "scale name" dropdown in tooling     |

```vue
<script setup lang="ts">
import { customPalettes, builtinPalettes } from "@/generated/palettes";
const all = { ...builtinPalettes, ...customPalettes };
</script>

<template>
  <div v-for="(scale, name) in all" :key="name">
    <h3>{{ name }}</h3>
    <div class="flex">
      <span v-for="(hex, step) in scale" :key="step"
            :style="{ background: hex, width: '40px', height: '40px' }" />
    </div>
  </div>
</template>
```

## Validation in CI

```yaml
# .github/workflows/ci.yml
- run: pnpm exec theme-unify -c ./tokens.config.ts --validate
- run: pnpm exec theme-unify -c ./tokens.config.ts -o ./src/generated
- run: git diff --exit-code src/generated
```

The first step fails fast on bad tokens; the third fails if generated
files drift from what's committed (i.e. someone forgot to re-run the
generator).

## Troubleshooting

**`TokenValidationError: Token validation failed`**
The error message lists every issue with its config path. Common causes:

- Color scale missing a step → all 11 keys (50, 100, …, 950) required.
- Unknown `SemanticScaleRef` name → must match a key in
  `primitive.colors` or a builtin palette name.
- Bad CSS in `spacing` / `radii` → must be a recognized CSS length, `0`,
  `none`, etc.

**`UnresolvedRefError: Unresolved ref "..." in preset.overrides...`**
The `{ ref }` path doesn't exist. Check spelling and that the target
exists at that path (refs use primitive aliases — `radii.sm` not
`primitive.radii.sm`).

**`CircularReferenceError`**
A ref points back at itself somewhere in the chain. The error's `cycle`
field shows the full path.

**`bg-primary-500` not styled in production**
The static scanner missed the class. Add the generated file(s) to
UnoCSS `content.filesystem`, or add an explicit safelist for utilities
you only use through PT props.

**Generated file overwrites my manual edits**
That's by design — the file header says *"do not edit"*. Use
`preset.overrides` and `unocss.shortcuts` in `tokens.config.ts` instead.
If you're sure you want to wipe a hand-edit and regenerate, pass
`--force`.

**Editor doesn't autocomplete `preset.overrides`**
Stock `defineTokens` widens overrides to `Record<string, unknown>`.
Import `defineTokens` from `theme-unify/aura` (or `/lara`, `/nora`,
`/material`) for full PrimeVue autocomplete on `preset.overrides` —
see [editor autocomplete](#editor-autocomplete-definetypedtokens).
