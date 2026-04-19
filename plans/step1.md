# Step 1 — Pipe `typography.baseFontSize` & `baseLineHeight` end‑to‑end

> Parent plan: [plan-themeUnifySyncGaps.prompt.md](./plan-themeUnifySyncGaps.prompt.md)

## Problem
`primitive.typography.baseFontSize` and `primitive.typography.baseLineHeight` are
already part of `TypographyTokens`, validated, and authored in
[packages/playground/tokens.config.ts](../packages/playground/tokens.config.ts#L132-L137),
but neither generator emits them. The values are silently discarded, so the two
frameworks (PrimeVue + UnoCSS) cannot share a single typography baseline.

Today only `typography.fontFamily` is consumed
([packages/core/src/generators/unocss-theme.ts](../packages/core/src/generators/unocss-theme.ts#L112-L118)).

## Goal
A user setting `baseFontSize` / `baseLineHeight` once in `tokens.config.ts` gets:
1. UnoCSS `text-base` / `leading-base` utilities reflecting those values.
2. A global CSS preflight rule (`:root { font-size; line-height }`) that
   PrimeVue components inherit, keeping form controls / typography aligned with
   UnoCSS utilities.

## Decision (resolves open question in parent plan)
Emit **both**:
- UnoCSS `theme.fontSize.base = [baseFontSize, baseLineHeight]` (UnoCSS tuple
  form) so `text-base` covers font‑size and line‑height.
- A sibling CSS string export (`baseTypographyCss`) the playground (and any
  consumer) injects via `import "…/generated/primevue-base.css"`-style usage.
  Generating real CSS — not a JS object — keeps the rule cascade-safe and avoids
  bloating the PrimeVue preset object with non‑standard `semantic` keys that
  PrimeVue would ignore.

PrimeVue semantic schema does **not** define a top‑level `fontSize` /
`lineHeight`, so we deliberately do not invent custom semantic keys. The CSS
preflight is the canonical bridge.

---

## Files to change

### 1. `packages/core/src/generators/unocss-theme.ts`
Append after the existing `fontFamily` block:

```ts
// Font size + line height (paired) from typography base
if (
  resolved.primitive.typography?.baseFontSize ||
  resolved.primitive.typography?.baseLineHeight
) {
  const size = resolved.primitive.typography.baseFontSize ?? "1rem";
  const lh = resolved.primitive.typography.baseLineHeight;
  const fontSize: Record<string, string | [string, string]> = {
    base: lh ? [size, lh] : size,
  };
  sections.push(
    `export const fontSize = ${serializeValue(fontSize, 0)} as const;`,
  );
  sections.push("");

  if (lh) {
    sections.push(
      `export const lineHeight = ${serializeValue({ base: lh }, 0)} as const;`,
    );
    sections.push("");
  }
}
```

Verify `serializeValue` already handles array tuples; if not, extend it (small
addition: array branch in `serializeValue`).

### 2. `packages/core/src/generators/primevue.ts`
Add a new exported function alongside `generatePrimeVue`:

```ts
export function generatePrimeVueBaseCss(
  resolved: ResolvedTokens | ResolvedAutoTokens,
): string | null {
  const t = resolved.primitive.typography;
  if (!t?.baseFontSize && !t?.baseLineHeight) return null;
  const decls: string[] = [];
  if (t?.baseFontSize) decls.push(`  font-size: ${t.baseFontSize};`);
  if (t?.baseLineHeight) decls.push(`  line-height: ${t.baseLineHeight};`);
  if (t?.fontFamily) decls.push(`  font-family: ${t.fontFamily};`);
  return `${fileHeader("/*", "*/")}\n:root {\n${decls.join("\n")}\n}\n`;
}
```

(`fileHeader` may need a small refactor to accept comment delimiters; if not,
inline the header string here.)

### 3. `packages/core/src/index.ts`
Export the new function:
```ts
export { generatePrimeVue, generatePrimeVueBaseCss } from "./generators/primevue.js";
```

### 4. `packages/core/src/write-output.ts`
Wire the new CSS output into the generated bundle. Write
`primevue-base.css` next to `primevue-preset.ts` when
`generatePrimeVueBaseCss` returns non‑null.

### 5. `packages/core/src/vite.ts`
Expose the CSS as a virtual module (e.g.
`virtual:theme-unify/primevue-base.css`) so the Vite plugin path works without
filesystem writes. Mirror existing virtual‑module wiring for `primevue-preset`.

### 6. `packages/playground/uno.config.ts`
Import and pass the new exports into `theme`:
```ts
import { fontSize, lineHeight } from "./src/generated/unocss-theme";
// inside defineConfig theme: { ..., fontSize, lineHeight }
```
(Conditional spread if either may be undefined.)

### 7. `packages/playground/src/main.ts` (or `style.css`)
Import the generated base CSS once:
```ts
import "./generated/primevue-base.css";
```

### 8. `packages/playground/src/generated/`
Re‑run the build / dev pipeline so the new files are produced. Commit the
regenerated artifacts (project convention — these are checked in for the
playground today).

### 9. Tests
- `packages/core/tests/generators/unocss-theme.test.ts` — add cases:
  - emits `fontSize.base` as tuple when both base values are set
  - emits `fontSize.base` as string when only `baseFontSize` is set
  - omits both exports when typography has only `fontFamily`
- New `packages/core/tests/generators/primevue-base-css.test.ts`:
  - returns `null` when neither base value is set
  - emits `:root { font-size; line-height; font-family }` block when set
  - excludes missing declarations

### 10. Docs
- `docs/token-schema.md` — under `TypographyTokens`, document where each field
  flows: `fontFamily` → UnoCSS `fontFamily.sans` + PrimeVue base CSS;
  `baseFontSize` / `baseLineHeight` → UnoCSS `fontSize.base` (tuple) + PrimeVue
  base CSS preflight.
- `docs/generators.md` — list `generatePrimeVueBaseCss` and the new
  `fontSize` / `lineHeight` UnoCSS exports.
- `docs/pipeline.md` — note that the PrimeVue generator now emits two
  artifacts (preset object + base CSS).
- `docs/architecture.md` — diagram update if it shows generator outputs.
- `docs/vite-plugin.md` — document the new virtual module ID.

---

## Acceptance criteria
- Setting `primitive.typography.baseFontSize = "1.25rem"` in the playground:
  - regenerates `unocss-theme.ts` with `export const fontSize = { base: ["1.25rem", "<lh>"] }`
  - regenerates `primevue-base.css` with `:root { font-size: 1.25rem; … }`
  - playground renders all body text at the new size (PrimeVue `Card`,
    `Button`, plain UnoCSS utilities all aligned).
- All existing tests still pass; new tests cover the three branches above.
- Removing `baseFontSize` and `baseLineHeight` from `tokens.config.ts` produces
  no `fontSize` / `lineHeight` exports and no `primevue-base.css` file.

## Out of scope
- A full type ramp (`xs`/`sm`/`lg`/`xl`). Only the **base** values are wired
  here — a typography ramp is its own schema extension (defer to a later step).
- Per-component PrimeVue typography overrides via PT (covered by the broader
  PT effort already noted in the parent plan's "Out of scope").
- Responsive base font size (e.g. fluid clamp). Authors can still write
  `clamp(...)` as the string value; no extra handling required.

## Risk / migration notes
- Adding a new file to the playground `generated/` folder requires the Vite
  plugin (or `pnpm build`) to run before the dev server boots, otherwise the
  `import "./generated/primevue-base.css"` statement will fail. Update
  `docs/getting-started.md` if the bootstrap order changes.
- `serializeValue` array support (if added) should be covered by a focused
  unit test to avoid silently breaking other generators.
