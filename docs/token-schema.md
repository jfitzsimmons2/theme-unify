# Token schema

Source of truth: [packages/core/src/types.ts](../packages/core/src/types.ts).

theme-unify has **one** input schema, `ThemeUnifyConfig`. It's modeled
around the way PrimeVue 4 organizes design tokens: a `primitive` layer of
raw values, a `semantic` layer that names roles, and `preset.overrides`
for full PrimeVue customization. The same config also drives UnoCSS so
utility classes resolve to the exact same `var(--p-*)` variables PrimeVue
emits at runtime.

## Top-level shape

```ts
interface ThemeUnifyConfig {
  meta: { name: string; darkModeSelector?: string };
  primitive: PrimitiveConfig;
  semantic: SemanticConfig;
  preset?: { base?: PrimeVueBaseTheme; overrides?: DeepTokenValue<AuraPreset> };
  unocss?: { shortcuts?: Record<string, { light: string; dark: string }> };
}
```

`darkModeSelector` defaults to `.dark` and is consumed by both PrimeVue
(`theme.options.darkModeSelector`) and the UnoCSS shortcuts generator.

## `primitive`

Raw token values. **No refs allowed inside `primitive`.**

| Field | Type | Notes |
| --- | --- | --- |
| `colors` | `Record<string, ColorScale>` | Each scale must have all 11 steps (`50`–`950`). |
| `spacing` | `Record<string, string>` | Optional. Emitted as `--p-spacing-*`. |
| `radii` | `Record<string, string>` | Optional. Merged into PrimeVue's `borderRadius` primitive. |
| `shadows` | `Record<string, string>` | Optional. Emitted as `--p-shadow-*`. |
| `typography` | `{ fontFamily?, baseFontSize?, baseLineHeight? }` | Optional. Emitted as `--p-font-family`, `--p-font-size-base`, `--p-line-height-base`. |
| `fontWeight` | `Record<string, string>` | Optional. Emitted as `--p-font-weight-*`. |

```ts
type ColorStep = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;
type ColorScale = Record<ColorStep, string>;
```

## `semantic`

The "design intent" layer. Each role is a `SemanticScaleRef`:

```ts
type SemanticScaleRef = string | ColorScale;
```

A string names a scale (a key in `primitive.colors` or a [builtin
palette](#builtin-palettes)). An inline `ColorScale` object lets you
provide a one-off scale without polluting `primitive.colors`.

| Field | Type | Notes |
| --- | --- | --- |
| `primary` | `SemanticScaleRef` | Becomes PrimeVue's `semantic.primary` (50–950 step refs). |
| `surface` | `{ light: SemanticScaleRef; dark: SemanticScaleRef }` | Surface palette per color scheme. Step `0` is added automatically: `#ffffff` (light) / `#0a0a0a` (dark). |
| `extra` | `Record<string, SemanticScaleRef>` | Free-form named roles such as `success`, `warning`, `info`, `danger`. Each emits a full 50–950 scale under `--p-{name}-*`. |

Example:

```ts
semantic: {
  primary: "blueberry",
  surface: { light: "oatmeal", dark: "chickpea" },
  extra: {
    success: "kale",
    warning: "carrot",
    danger: "beetroot",
    info:    "eggplant",
  },
}
```

## `preset`

Optional. Lets you reach the full Aura preset shape.

| Field | Type | Notes |
| --- | --- | --- |
| `base` | `"aura" \| "lara" \| "nora" \| "material"` | Defaults to `"aura"`. Drives the `definePreset` import in the generated file. |
| `overrides` | `DeepTokenValue<AuraPreset>` | Deep-merged onto the generated preset. Refs (`{ ref: "radii.sm" }`) are resolved before merge. Use this for `semantic.focusRing`, `semantic.formField`, `components.*`, etc. |

`overrides` is typed via the `AuraPreset` type from `@primeuix/themes` —
your IDE will autocomplete every PrimeVue knob.

## `unocss.shortcuts`

```ts
unocss: {
  shortcuts: {
    "bg-page":     { light: "bg-surface-50",  dark: "dark:bg-surface-950" },
    "text-default":{ light: "text-surface-900", dark: "dark:text-surface-50" },
  }
}
```

Each entry is collapsed to a single space-joined utility string
(`bg-surface-50 dark:bg-surface-950`) so the dark-mode variant rides
along automatically.

## Refs

Anywhere a value is accepted in `preset.overrides`, you may use either a
literal or a ref:

```ts
{ ref: "radii.sm" }            // → primitive.radii.sm
{ ref: "colors.beetroot.500" } // → primitive.colors.beetroot[500]
{ ref: "spacing.md" }          // → primitive.spacing.md
{ ref: "shadows.lg" }          // → primitive.shadows.lg
{ ref: "fontWeight.bold" }     // → primitive.fontWeight.bold
```

The resolver expands these aliases — see
[packages/core/src/resolver.ts](../packages/core/src/resolver.ts).
Cycles throw `CircularReferenceError`; missing targets throw
`UnresolvedRefError`.

> **Note**: refs are NOT used inside `semantic` itself — `semantic`
> entries reference scales by name (string) or inline scale (object).

## Builtin palettes

Source: [packages/core/src/builtin-palettes.ts](../packages/core/src/builtin-palettes.ts).

theme-unify ships 22 ready-made color scales whose hex values match the
Tailwind v3 / PrimeUix Aura palettes verbatim. Any `SemanticScaleRef`
string may name one:

```ts
semantic: {
  primary: "purple",                                  // builtin
  surface: { light: "slate", dark: "zinc" },          // both builtin
  extra: { success: "emerald", danger: "red" },       // both builtin
}
```

Available names (`BUILTIN_PALETTE_NAMES`):
`emerald`, `green`, `lime`, `red`, `orange`, `amber`, `yellow`, `teal`,
`cyan`, `sky`, `blue`, `indigo`, `violet`, `purple`, `fuchsia`, `pink`,
`rose`, `slate`, `gray`, `zinc`, `neutral`, `stone`.

### Resolution rules

- **User-defined wins.** If `primitive.colors.<name>` exists, it shadows
  the builtin of the same name; `resolveScale` emits a one-time
  `console.warn` on collision.
- **Validation.** The validator rejects any scale name that is neither in
  `primitive.colors` nor a builtin.
- **UnoCSS emission stays lean.** Builtins are included in the generated
  `colors` export only when actually referenced via `semantic`.

### Public API

From [packages/core/src/index.ts](../packages/core/src/index.ts):

- `BUILTIN_PALETTES: Record<BuiltinPaletteName, ColorScale>`
- `BUILTIN_PALETTE_NAMES: readonly BuiltinPaletteName[]`
- `isBuiltinPalette(name: string): name is BuiltinPaletteName`
- `resolveScale(name, primitive): ColorScale | undefined`
- `type BuiltinPaletteName`

### Editor autocomplete

The playground's `defineTypedTokens` helper widens scale-name fields
with `BuiltinPaletteName | (string & {})` so editors suggest builtin
names alongside user-defined keys. See
[packages/playground/tokens.types.ts](../packages/playground/tokens.types.ts).
