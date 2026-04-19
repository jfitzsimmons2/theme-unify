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
- `spacing`, `radii`, `shadows`, `typography`, `fontWeight` — flat string
  maps (typography is structured, see `TypographyTokens`).

### `semantic`

The "design intent" layer. Refs into `primitive` are typical here.

- `colors: Record<string, { scale: string }>` — names a color role
  (`primary`, `secondary`, …) and points it at a primitive color name.
- `backgrounds: Record<string, { ref: string }>` — named background tokens
  (e.g. `pageLight`, `pageDark`).
- `surface: { scale, darkScale?, invertInDarkMode? }` — special: drives the
  generated 0–950 surface palette. `invertInDarkMode` reverses the scale in
  dark mode (Aura convention). See `buildSurfaceObject` in
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

## Resolved types

After `resolveRefs`, every `TokenValue` is a string. Generators only ever
operate on `ResolvedTokens` / `ResolvedAutoTokens`.
