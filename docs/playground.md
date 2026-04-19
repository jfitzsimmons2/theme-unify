# Playground

The playground ([packages/playground](../packages/playground)) is a Vue 3
app that serves as a **visual smoke test** for the generators — a wide
range of PrimeVue components is rendered in
[src/App.vue](../packages/playground/src/App.vue), along with a
dark-mode toggle, a brand-switch demo, and a palette viewer.

It depends on the `theme-unify` package via `workspace:*`.

## Token config

[tokens.config.ts](../packages/playground/tokens.config.ts) is the
canonical example consumed by `pnpm generate`. It defines:

- Five color scales (beetroot, blueberry, kale, carrot, eggplant) plus
  two surface palettes (chickpea, oatmeal).
- Spacing, radii, shadows, typography (Ringside Narrow SSm).
- Semantic roles: `primary: "blueberry"`, `surface: { light: "oatmeal",
  dark: "chickpea" }`, and `extra: { success, info, warning, danger }`.
- A `preset.overrides` block that demonstrates `semantic.focusRing`,
  `semantic.formField`, and a `components.card` override (using a `ref`
  into `radii`).
- Six UnoCSS shortcuts mapping common roles (`bg-page`, `text-default`,
  …) with light/dark variants.

Treat this as the reference for the `ThemeUnifyConfig` shape.

## Generated outputs

Live in [src/generated/](../packages/playground/src/generated):

- `preset.ts` — passed as `theme.preset` in
  [main.ts](../packages/playground/src/main.ts).
- `uno-theme.ts` — imported by
  [uno.config.ts](../packages/playground/uno.config.ts). All values are
  `var(--p-*)` references so utility classes follow runtime preset
  changes.
- `shortcuts.ts` — also imported by `uno.config.ts`.

These are produced by `pnpm generate` (which runs the CLI). They are
checked in for convenience but should always match what the current CLI
would produce.

## CSS layering

PrimeVue is mounted with `cssLayer: { name: "primevue", order:
"unbase, primevue, unutilities" }` and UnoCSS is configured with the
matching `layers` map. This ordering means UnoCSS utility classes
(`p-md`, `bg-primary-500`) always override PrimeVue component defaults.

## Brand-switch demo

[src/App.vue](../packages/playground/src/App.vue) includes a Select in
the header that calls `updatePreset({ semantic: { primary: { …refs to
the chosen scale… } } })` from `@primeuix/themes`. Because the UnoCSS
theme uses CSS variables, every `bg-primary-*` / `text-primary-*` class
updates instantly with no rebuild — this is the headline demonstration
of the new architecture.

## Why a separate playground

Keeping the demo in its own package means:

- The published `theme-unify` package has no Vue / PrimeVue dependency.
- Visual regressions are caught manually before publishing.
- The `tokens.config.ts` here doubles as documentation.
