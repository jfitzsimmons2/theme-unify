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
  meta: {
    name: string;
    darkModeStrategy?: "class" | "media";
    darkModeSelector?: string;
  };
  primitive: PrimitiveConfig;
  semantic: SemanticConfig;
  preset?: { base?: PrimeVueBaseTheme; overrides?: DeepTokenValue<AuraPreset> };
  unocss?: { shortcuts?: Record<string, { light: string; dark: string }> };
}
```

### Dark mode

`darkModeStrategy` controls how dark mode is activated at runtime:

| Strategy | Behaviour | PrimeVue `darkModeSelector` | UnoCSS `dark` variant |
| -------- | --------- | --------------------------- | --------------------- |
| `"class"` (default) | A CSS class/attribute on a parent element toggles dark mode | `meta.darkModeSelector` (default `".dark"`) | `"class"` — reacts to the selector |
| `"media"` | OS / browser `prefers-color-scheme: dark` drives dark mode | `".system"` (PrimeVue's sentinel) | `"media"` — reacts to the media query |

When strategy is `"class"`, `darkModeSelector` defaults to `".dark"` and
is consumed by both PrimeVue (`theme.options.darkModeSelector`) and the
UnoCSS shortcuts generator. The validator rejects empty strings and
obviously malformed selectors (unbalanced brackets, leading combinators);
class (`.dark`), id (`#app.dark`), attribute (`[data-theme='dark']`),
`:where()`/`:is()` wrappers, and descendant combinators are all accepted.

When strategy is `"media"`, `darkModeSelector` is ignored (a warning is
emitted if set). The generated PrimeVue preset receives `".system"` and
the generated UnoCSS theme exports `darkMode = "media"` so UnoCSS
activates the `dark:` variant via `prefers-color-scheme`.

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
| `breakpoints` | `Record<string, string>` | Optional. Each value must be a `px`/`rem`/`em` length. Drives UnoCSS `theme.breakpoints`; not propagated to PrimeVue. |
| `zIndex` | `Record<string, string>` | Optional. Each value must be an integer or `"auto"`. Drives UnoCSS `theme.zIndex` **and** PrimeVue `semantic.zIndex` so overlay stacking stays in sync. |
| `transitions` | `{ property?, duration?, timingFunction? }` | Optional. Each sub-record is `Record<string, string>` and maps to UnoCSS `theme.transitionProperty` / `theme.transitionDuration` / `theme.transitionTimingFunction`. UnoCSS-only. |
| `animations` | `Record<string, string>` | Optional. Each value is a CSS `animation` shorthand. Drives UnoCSS `theme.animation`. Author-supplied `@keyframes` declarations are still required. |

```ts
type ColorStep = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;
type ColorScale = Record<ColorStep, string>;
```

> **Key casing.** Source keys may be camelCase, snake_case, or
> kebab-case — they survive verbatim into PrimeVue's preset object so
> refs like `{ ref: "colors.eggplantPurple.500" }` keep working. The
> generated **UnoCSS** class fragment, however, is always kebab-cased to
> match the `--p-*` CSS variables PrimeUix emits at runtime: a
> `primitive.colors.eggplantPurple` palette is consumed via
> `bg-eggplant-purple-500`. The same applies to `spacing`, `radii`,
> `shadows`, and `fontWeight` keys. The `palettes.ts` catalog exposes
> a `paletteClassNames` map (source name → kebab fragment) so consumers
> don't need to re-implement the rule.

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
| `extra` | `Record<string, SemanticScaleRef>` | Additional named roles. Use a [canonical role name](#canonical-semantic-roles) (`success`, `info`, `warn`, `danger`, …) so PrimeVue's `severity`-aware components react to it; non-canonical names are still emitted as `--p-{name}-*` but won't appear in `severity` props. |

Example:

```ts
semantic: {
  primary: "blueberry",
  surface: { light: "oatmeal", dark: "chickpea" },
  extra: {
    success: "kale",
    warn:    "carrot",
    danger:  "beetroot",
    info:    "eggplant",
  },
}
```

### Canonical semantic roles

These names match PrimeVue's `severity` vocabulary. Use them in
`semantic.extra` to make a scale available to severity-aware
components (`Button`, `Tag`, `Message`, `Toast`, …):

| Role        | Notes                                                       |
| ----------- | ----------------------------------------------------------- |
| `primary`   | Brand color. Defined directly on `semantic.primary`.        |
| `secondary` | Neutral / muted alternative.                                |
| `success`   | Positive / confirmed state.                                 |
| `info`      | Neutral informational accent.                               |
| `warn`      | Caution. **Replaces the legacy `warning` alias.**           |
| `danger`    | Destructive / error state. **Replaces the legacy `error`.** |
| `help`      | Tertiary "fifth color" slot — use for an accent role.       |
| `contrast`  | High-contrast / inverted color.                             |

Non-canonical role names (e.g. `accent`) are accepted: the validator
emits an info-severity issue and the generators emit
`--p-accent-*` CSS variables, but `severity`-aware PrimeVue
components ignore them.

The legacy keys `warning` and `error` are accepted as **deprecated
aliases** for `warn` and `danger`. Loading a config that uses them
prints a deprecation warning to stderr; the generated preset and
UnoCSS theme canonicalize them so the output always uses the
canonical names. Migrate before the next major release.

## `preset`

Optional. Lets you reach the full Aura preset shape.

| Field | Type | Notes |
| --- | --- | --- |
| `base` | `"aura" \| "lara" \| "nora" \| "material"` | Defaults to `"aura"`. Drives the `definePreset` import in the generated file. |
| `overrides` | `DeepTokenValue<AuraPreset>` | Deep-merged onto the generated preset. Refs (`{ ref: "radii.sm" }`) are resolved before merge. Use this for `semantic.focusRing`, `semantic.formField`, `components.*`, etc. |

Stock `defineTokens` from the bare `@jfitzsimmons2/theme-unify` entry types
`overrides` as `Record<string, unknown>` so the core package can stay
free of any `@primeuix/themes` dependency. To get full IntelliSense,
import `defineTokens` from the per-base sugar entry that matches your
`preset.base`:

```ts
import { defineTokens } from "@jfitzsimmons2/theme-unify/aura"; // or /lara, /nora, /material
```

For a custom preset, use the generic entry:

```ts
import { defineTypedTokens } from "@jfitzsimmons2/theme-unify/typed";
export default defineTypedTokens<MyPreset>({ /* ... */ });
```

`@primeuix/themes` is an **optional peer dependency** of
`@jfitzsimmons2/theme-unify` — install it only if you import one of the typed
entries.

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

## `unocss.includeBuiltinPalettes`

By default the generated UnoCSS theme only emits palettes you actually
use: every entry in `primitive.colors` plus any builtin referenced via
`semantic` (e.g. `surface.scale: "slate"`). To expose additional
builtins as utilities — so `bg-emerald-500`, `text-purple-700`, etc.
resolve — opt them in here:

```ts
unocss: {
  // Subset
  includeBuiltinPalettes: ["emerald", "purple"],
  // ...or all 22:
  // includeBuiltinPalettes: true,
}
```

Opted-in builtins flow through the PrimeVue preset as
`--p-{name}-{step}` CSS variables and are surfaced in `uno-theme.ts`'s
`colors` export as `var(--p-{name}-{step})` references — no hex
duplication, and runtime preset edits cascade. A user palette of the
same name always wins; opting in such a name emits a one-time
`console.warn`.

The validator rejects unknown palette names with the same listing
shown for unknown `semantic` scale references.

## Refs

Anywhere a value is accepted in `preset.overrides`, you may use either a
literal or a ref:

```ts
{ ref: "radii.sm" }            // → primitive.radii.sm
{ ref: "colors.beetroot.500" } // → primitive.colors.beetroot[500]
{ ref: "spacing.md" }          // → primitive.spacing.md
{ ref: "shadows.lg" }          // → primitive.shadows.lg
{ ref: "fontWeight.bold" }     // → primitive.fontWeight.bold
{ ref: "zIndex.modal" }        // → primitive.zIndex.modal
{ ref: "breakpoints.md" }      // → primitive.breakpoints.md
{ ref: "transitions.duration.base" } // → primitive.transitions.duration.base
{ ref: "animations.fade-in" }  // → primitive.animations["fade-in"]
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
  `colors` export only when actually referenced via `semantic` or opted
  in via [`unocss.includeBuiltinPalettes`](#unocssincludebuiltinpalettes).

### Public API

From [packages/core/src/index.ts](../packages/core/src/index.ts):

- `BUILTIN_PALETTES: Record<BuiltinPaletteName, ColorScale>`
- `BUILTIN_PALETTE_NAMES: readonly BuiltinPaletteName[]`
- `isBuiltinPalette(name: string): name is BuiltinPaletteName`
- `resolveScale(name, primitive): ColorScale | undefined`
- `type BuiltinPaletteName`

### Editor autocomplete

The per-base typed entries (`@jfitzsimmons2/theme-unify/aura`, `/lara`, `/nora`,
`/material`) and the generic `@jfitzsimmons2/theme-unify/typed` entry widen scale-name
fields with `BuiltinPaletteName | (string & {})` so editors suggest
builtin names alongside user-defined keys. See
[packages/core/src/typed.ts](../packages/core/src/typed.ts).
