# Playground

The playground ([packages/playground](../packages/playground)) is a Vue 3
app that serves as a **visual smoke test** for the generators — every
PrimeVue component the PT generator targets is rendered in
[src/App.vue](../packages/playground/src/App.vue), with a dark-mode
toggle and a UnoCSS palette viewer.

It depends on the `theme-unify` package via `workspace:*`.

## Token config

[tokens.config.ts](../packages/playground/tokens.config.ts) is the canonical
example consumed by `pnpm generate`. It defines:

- Six color scales (beetroot, kale, carrot, eggplant, chickpea, oatmeal).
- Spacing, radii, shadows, typography (Ringside Narrow SSm).
- Semantic roles (primary/secondary/accent/info), background refs, and a
  surface scale that inverts in dark mode.
- A full PrimeVue config (base `aura`, light/dark `colorScheme`, focus
  ring, card override).
- UnoCSS color alias (`warm` → `oatmeal`) and 6 shortcuts.

Treat this as the reference for the `TokenSchema` shape.

## Generated outputs

Live in [src/generated/](../packages/playground/src/generated):

- `primevue-preset.ts` — passed as `theme.preset` in
  [main.ts](../packages/playground/src/main.ts)
- `primevue-pt.ts` — passed as `pt` in `main.ts`
- `unocss-theme.ts` — imported by
  [uno.config.ts](../packages/playground/uno.config.ts)
- `unocss-shortcuts.ts` — also imported by `uno.config.ts`

These are produced by `pnpm generate` (which runs the CLI). They are
checked in for convenience but should always match what the current CLI
would produce.

## UnoCSS scanning

The PT generator emits class names inside JS string literals and arrow
functions. UnoCSS only scans template/JSX/CSS by default, so
[uno.config.ts](../packages/playground/uno.config.ts) explicitly adds:

```ts
content: {
  filesystem: ['src/generated/primevue-pt.ts'],
},
```

If a new generator emits classes into a new file, add that path here too.
There's also a `safelist` constructed from the resolved color palette to
guarantee `bg-/text-/border-/hover:/focus:` variants for all color steps.

## Why a separate playground

Keeping the demo in its own package means:

- The published `theme-unify` package has no Vue / PrimeVue dependency.
- Visual regressions are caught manually before publishing.
- The `tokens.config.ts` here doubles as documentation.
