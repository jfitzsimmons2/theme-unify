# Plan: Close theme-unify Single-Source-of-Truth Gaps

## Goal
Ensure every theming variable a user can define in `tokens.config.ts` flows consistently into both PrimeVue (preset + PT) and UnoCSS (theme + shortcuts) outputs, eliminating drift between the two frameworks.

## Current State Summary
- ✅ Colors, semantic roles, surface (light/dark), borderRadius, boxShadow, fontFamily, fontWeight sync correctly
- ✅ Dark mode via `class` strategy works end-to-end
- ➖ Spacing is intentionally left to each framework's defaults (PrimeVue and UnoCSS each manage their own scale); `primitive.spacing` is not synced
- ❌ `typography.baseFontSize` / `baseLineHeight` discarded
- ❌ Schema lacks breakpoints, zIndex, transitions, animations
- ❌ Semantic role names diverge between styled preset and PT generator (`warning`/`error` vs `warn`/`danger`)
- ❌ `meta.darkModeStrategy: "media"` is accepted but PT generator always emits `dark:` classes
- ⚠️ PT scale name resolution by `500`-step hex is collision-prone

---

## Step 1 — Pipe typography base values
**Priority: MEDIUM**

**Files:**
- `packages/core/src/generators/unocss-theme.ts` — export `fontSize` / `lineHeight` (or a `typography` object) when `baseFontSize` / `baseLineHeight` are set
- `packages/core/src/generators/primevue.ts` — emit `:root { font-size, line-height }` via PrimeVue `semantic` tokens or a sibling CSS string export
- `packages/core/tests/generators/*` — coverage for both outputs
- `docs/token-schema.md` — clarify what each field maps to

**Open question:** Should `baseFontSize` become UnoCSS `theme.fontSize.base` plus a global preflight rule, or only the latter? Decide before implementing.

---

## Step 2 — Extend `PrimitiveConfig` with breakpoints / zIndex / transitions / animations
**Priority: MEDIUM**

**Files:**
- `packages/core/src/types.ts` — add optional fields to `PrimitiveConfig`:
  - `breakpoints?: Record<string, string>`
  - `zIndex?: Record<string, string>`
  - `transitions?: Record<string, string>`
  - `animations?: Record<string, string>`
- `packages/core/src/validator.ts` — validate CSS values for each
- `packages/core/src/generators/unocss-theme.ts` — export each as a top-level UnoCSS theme key
- `packages/core/src/generators/primevue.ts` — decide which (if any) propagate to PrimeVue (z-index for overlays is the most useful)
- `packages/playground/tokens.config.ts` — add example values
- `packages/playground/uno.config.ts` — wire imports
- Tests + `docs/token-schema.md`

**Acceptance:** A breakpoint defined once is usable as `md:` in templates AND respected by PrimeVue responsive components.

---

## Step 3 — Normalize semantic role names across generators
**Priority: MEDIUM**

**Decision needed:** Pick canonical set. Recommend PrimeVue's own vocabulary: `primary, secondary, success, info, warn, danger, help, contrast`.

**Files:**
- `packages/core/src/types.ts` — narrow `SemanticConfig.colors` keys to the canonical union (or document strongly while keeping `Record<string, …>`)
- `packages/core/src/validator.ts` — warn on non-canonical role names, suggest canonical replacement
- `packages/core/src/generators/primevue.ts` — apply the same alias map currently in `primevue-pt.ts` so styled preset and PT agree
- `packages/core/src/generators/primevue-pt.ts` — consume canonical names directly; remove alias workaround once schema enforces them
- `packages/playground/tokens.config.ts` — rename `warning`→`warn`, `error`→`danger`
- Update tests and `docs/token-schema.md`

---

## Step 4 — Honor `meta.darkModeStrategy: "media"` (or reject it)
**Priority: MEDIUM-LOW**

**Files:**
- `packages/core/src/generators/primevue-pt.ts` — when strategy is `"media"`, emit dark variants under `@media (prefers-color-scheme: dark)` via PT `style` strings instead of `dark:` class variants, OR
- `packages/core/src/validator.ts` — if implementing media-mode is too complex, throw a clear error stating only `"class"` is supported and update docs accordingly
- `docs/token-schema.md` — clarify supported strategies

---

## Step 5 — Make PT scale name resolution deterministic
**Priority: LOW**

**Files:**
- `packages/core/src/generators/primevue-pt.ts` — replace `resolveScaleName()` reverse-lookup with one of:
  - **Option A:** Pass through the originating scale name from the resolver (extend `ResolvedAutoTokens` so each semantic color carries its source scale name)
  - **Option B:** Validator enforces uniqueness of `500`-step hex across `primitive.colors`
- Tests for collision scenario

---

## Cross-cutting tasks
- After Steps 1–2, regenerate playground outputs and verify `App.vue` showcase still renders identically
- Update `docs/architecture.md` and `docs/pipeline.md` to reflect new schema fields and generator outputs
- Bump core version, add CHANGELOG entry
- Consider exposing a `theme-unify doctor` CLI command that reports any tokens defined but not consumed by any generator

## Out of scope (track separately)
- Runtime CSS-variable export for DevTools inspection
- Syncing `primitive.spacing` across PrimeVue and UnoCSS — both frameworks own their own spacing scales by design; revisit only if a concrete cross-framework use case appears
- Documenting PT component coverage list
