# Token schema

The full source of truth is
[packages/core/src/types.ts](../packages/core/src/types.ts). This page
gives a contributor-oriented overview.

## Two schemas

There are **two** input schemas, both routed through the same pipeline.

### `TokenSchema` (explicit)

The original schema. The user fully specifies the PrimeVue and UnoCSS
sections. Used by all current tests
([packages/core/tests/fixtures/tokens.fixture.ts](../packages/core/tests/fixtures/tokens.fixture.ts)).

```ts
interface TokenSchema {
  meta: MetaConfig;
  primitive: PrimitiveConfig;
  semantic?: SemanticConfig;
  primevue?: PrimeVueConfig;
  unocss?: UnoCSSConfig;
}
```

### `AutoTokenSchema` (derived)

A simplified schema where PrimeVue and UnoCSS configs are auto-derived from
`semantic`. Users only provide overrides:

```ts
interface AutoTokenSchema {
  meta: MetaConfig;
  primitive: PrimitiveConfig;
  semantic: SemanticConfig;            // required here
  primevue?: { base?, overrides? };
  unocss?: { colorAliases?, extraShortcuts? };
}
```

Generators accept either via the union types `ResolvedTokens |
ResolvedAutoTokens`.

## Sections

### `meta`

```ts
{ name: string; darkModeStrategy: "class" | "media"; darkModeSelector: string }
```

`darkModeSelector` is consumed by both PrimeVue (`options.darkModeSelector`)
and the UnoCSS shortcuts generator.

### `primitive`

Raw values — no refs allowed inside primitive itself.

- `colors: Record<string, ColorScale>` — each scale must have all 11 steps:
  `50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950` (see
  `COLOR_STEPS`).
- `spacing`, `radii`, `shadows`, `fontWeight` — flat string maps.
- `typography: TypographyTokens` — structured:
  - `fontFamily?: string` → emitted as UnoCSS `fontFamily.sans` and as a
    `font-family` declaration in the PrimeVue base CSS.
  - `baseFontSize?: string` → emitted as UnoCSS `fontSize.base` (paired with
    `baseLineHeight` as a tuple when both are set) and as a `font-size`
    declaration in the PrimeVue base CSS preflight.
  - `baseLineHeight?: string` → emitted as UnoCSS `lineHeight.base` and as a
    `line-height` declaration in the PrimeVue base CSS preflight.

  Both frameworks share these typography baselines so PrimeVue components and
  UnoCSS utilities (`text-base`, `leading-base`) stay aligned.

### `semantic`

The "design intent" layer. Refs into `primitive` are typical here.

- `colors: Record<string, { scale: string }>` — names a color role
  (`primary`, `secondary`, …) and points it at a primitive color name
  **or a builtin palette name** (see [Builtin palettes](#builtin-palettes)).
- `backgrounds: Record<string, { ref: string }>` — named background tokens
  (e.g. `pageLight`, `pageDark`).
- `surface: { scale, darkScale?, invertInDarkMode? }` — special: drives the
  generated 0–950 surface palette. `scale` and `darkScale` may also name a
  builtin palette. `invertInDarkMode` reverses the scale in dark mode
  (Aura convention). See `buildSurfaceObject` in
  [packages/core/src/generators/utils.ts](../packages/core/src/generators/utils.ts).

### `primevue`

Either `PrimeVueConfig` (explicit, with `base`, `colorScheme`, `focusRing`,
`formField`, `components`) or `{ base?, overrides? }` for auto-mode.

`base` must be one of `PRIMEVUE_BASE_THEMES`: `"aura" | "lara" | "nora" |
"material"`.

### `unocss`

`colorAliases` rename a primitive color in the UnoCSS theme (e.g. `warm` →
`oatmeal` exposes both `bg-warm-500` and `bg-oatmeal-500`).
`shortcuts` / `extraShortcuts` map a class name to `{ light, dark }`
strings — see [generators.md](generators.md#unocss-shortcuts).

## Refs

Anywhere a `TokenValue` is accepted, you can use either a string literal or
`{ ref: "dot.path.string" }`.

### Path aliases

The resolver expands these prefixes — see
[packages/core/src/resolver.ts](../packages/core/src/resolver.ts):

| Alias | Expands to |
| --- | --- |
| `colors.x.500` | `primitive.colors.x.500` |
| `spacing.md` | `primitive.spacing.md` |
| `radii.lg` | `primitive.radii.lg` |
| `shadows.md` | `primitive.shadows.md` |
| `fontWeight.bold` | `primitive.fontWeight.bold` |

Refs may chain (a ref pointing at another ref). Cycles throw
`CircularReferenceError`.

## Color scales

```ts
type ColorStep = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;
type ColorScale = Record<ColorStep, string>;
```

The validator enforces that every color scale has all 11 steps. Surface
generation also relies on this completeness.

## Builtin palettes

Source:
[packages/core/src/builtin-palettes.ts](../packages/core/src/builtin-palettes.ts).

theme-unify ships 22 ready-made color scales whose hex values match the
Tailwind v3 / PrimeUix Aura palettes verbatim. Any
`semantic.colors.<role>.scale`, `semantic.surface.scale`, or
`semantic.surface.darkScale` may name a builtin instead of a key from
`primitive.colors`:

```ts
semantic: {
  colors: {
    primary: { scale: "purple" },   // builtin
    success: { scale: "emerald" },  // builtin
    accent:  { scale: "carrot" },   // user-defined in primitive.colors
  },
  surface: { scale: "slate", darkScale: "zinc" }, // both builtin
}
```

Refs into builtins also work via the existing `colors.<name>.<step>`
alias — e.g. `{ ref: "colors.purple.500" }` resolves to `#a855f7`
regardless of whether `purple` exists in `primitive.colors`.

Available names (`BUILTIN_PALETTE_NAMES`):

`emerald`, `green`, `lime`, `red`, `orange`, `amber`, `yellow`, `teal`,
`cyan`, `sky`, `blue`, `indigo`, `violet`, `purple`, `fuchsia`, `pink`,
`rose`, `slate`, `gray`, `zinc`, `neutral`, `stone`.

### Resolution rules

- **User-defined wins.** If `primitive.colors.<name>` exists, it shadows
  the builtin of the same name; `resolveScale` emits a one-time
  `console.warn` on collision so the override is intentional.
- **Validation.** The validator rejects any scale name that is neither in
  `primitive.colors` nor a builtin, with an error message that lists the
  builtin names.
- **UnoCSS emission is lean.** [unocss-theme.ts](generators.md#unocss-themets--unocss-theme)
  only includes a builtin in the generated `colors` export when it is
  actually referenced via `semantic`.
- **PrimeVue parity.** Builtin hexes match PrimeUix Aura defaults so a
  `primary: { scale: "purple" }` config renders identically to PrimeVue's
  out-of-the-box purple theme.

### Public API

From [packages/core/src/index.ts](../packages/core/src/index.ts):

- `BUILTIN_PALETTES: Record<BuiltinPaletteName, ColorScale>`
- `BUILTIN_PALETTE_NAMES: readonly BuiltinPaletteName[]`
- `isBuiltinPalette(name: string): name is BuiltinPaletteName`
- `resolveScale(name, primitive): ColorScale | undefined` — user-defined
  first, then builtin fallback
- `type BuiltinPaletteName`

### Editor autocomplete

The playground's `defineTypedTokens` helper widens `scale` fields with
`BuiltinPaletteName | (string & {})` so editors suggest builtin names
alongside user-defined keys. See
[packages/playground/tokens.types.ts](../packages/playground/tokens.types.ts).

## Resolved types

After `resolveRefs`, every `TokenValue` is a string. Generators only ever
operate on `ResolvedTokens` / `ResolvedAutoTokens`.
