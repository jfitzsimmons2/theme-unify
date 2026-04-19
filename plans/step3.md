# Step 3 — Normalize Semantic Role Names Across Generators

## Context
Today the styled PrimeVue preset (`generatePrimeVue`) and the PT generator
(`generatePrimeVuePT`) interpret `semantic.colors.*` keys differently:

- `generatePrimeVue` writes whatever keys the user provides directly into the
  PrimeVue `semantic` block (e.g. `warning`, `error`, `accent`).
- `generatePrimeVuePT` only recognizes PrimeVue's own severity vocabulary and
  uses an internal alias map (`SEVERITY_ALIASES` in
  `packages/core/src/generators/primevue-pt.ts`) to translate
  `warning → warn`, `error → danger` when matching PT severities.

Result: a token like `semantic.colors.warning` produces a working PrimeVue
preset color (`{warning.500}`) but PT components (e.g. `<Button severity="warn">`)
silently fall back to the `warn`-keyed scale, which may not exist. Drift.

The playground (`packages/playground/tokens.config.ts` lines 150-158) currently
defines both `warning` and `error`, demonstrating the gap end-to-end.

## Decision
Adopt **PrimeVue's official severity vocabulary** as the canonical role set:

```
primary | secondary | success | info | warn | danger | help | contrast
```

Rationale:
- Matches the values PrimeVue components accept for `severity` props.
- Keeps the PT generator authoritative — no translation layer required.
- `accent` is **not** part of the canonical set; users who want an accent color
  should use `help` (PrimeVue's existing "fifth color" slot) or define a
  non-canonical role and accept that PT severity coverage will not include it.

Non-canonical role names remain **allowed** (still typed as `Record<string, …>`)
but trigger a warning from the validator pointing the user at the canonical
equivalent. This preserves backward compatibility for one minor version while
nudging users toward the canonical names.

## File-by-file changes

### 1. `packages/core/src/types.ts`
- Add and export a canonical role union and constant:
  ```ts
  export type CanonicalSemanticRole =
      | "primary"
      | "secondary"
      | "success"
      | "info"
      | "warn"
      | "danger"
      | "help"
      | "contrast";

  export const CANONICAL_SEMANTIC_ROLES: readonly CanonicalSemanticRole[] = [
      "primary", "secondary", "success", "info",
      "warn", "danger", "help", "contrast",
  ];
  ```
- Keep `SemanticConfig.colors` as `Record<string, SemanticColorMapping>` (do
  **not** narrow to the union — non-canonical roles are still permitted but
  warned about). Add a JSDoc comment naming the canonical set and documenting
  that `severity`-aware PT components only react to canonical names.

### 2. `packages/core/src/validator.ts`
- Add a deprecated-alias map:
  ```ts
  const DEPRECATED_ROLE_ALIASES: Record<string, CanonicalSemanticRole> = {
      warning: "warn",
      error:   "danger",
  };
  ```
- After existing scale validation in `tokens.semantic?.colors`, iterate keys:
  - If key is in `DEPRECATED_ROLE_ALIASES`, push a warning-severity issue:
    `Semantic role "warning" is deprecated; rename to "warn" to align with PrimeVue severities.`
  - Else if key is not in `CANONICAL_SEMANTIC_ROLES`, push an info-severity
    issue suggesting the user keep it only if they don't need PT severity
    coverage.
- Requires extending `ValidationIssue` (in `packages/core/src/errors.ts`) with
  an optional `severity?: "error" | "warning" | "info"` field (default
  `"error"`). Existing callers (`loadTokens`) should only `throw` on
  `severity === "error"`; warnings get printed via `console.warn` instead.

### 3. `packages/core/src/generators/primevue.ts`
- Before writing `semantic[role] = scaleToObject(scale)` in `buildAutoPreset`,
  apply the **same** alias map used by PT (`warning → warn`, `error → danger`)
  so the styled preset and PT see the same role keys.
- Implementation: extract the alias map into a shared helper in
  `packages/core/src/generators/utils.ts` (e.g.
  `canonicalizeSemanticRole(role: string): string`) and import it from both
  `primevue.ts` and `primevue-pt.ts`.
- Keys not covered by the alias map and not canonical pass through unchanged
  (preserves user-defined extras like `accent` for the styled preset).

### 4. `packages/core/src/generators/primevue-pt.ts`
- Replace the inline `SEVERITY_ALIASES` lookup in `getSemanticColorScale` with
  the shared `canonicalizeSemanticRole` helper. The function should:
  1. Canonicalize the requested role.
  2. First look up `sem.colors[canonical]`.
  3. Fall back to scanning `sem.colors` for any key whose canonicalized form
     matches (handles legacy `warning` keys still in user configs).
- Remove the now-redundant `SEVERITY_ALIASES` constant once all reads go
  through the helper.

### 5. `packages/core/src/generators/utils.ts`
- Add and export:
  ```ts
  export const SEMANTIC_ROLE_ALIAS_MAP: Record<string, string> = {
      warning: "warn",
      error:   "danger",
  };

  export function canonicalizeSemanticRole(role: string): string {
      return SEMANTIC_ROLE_ALIAS_MAP[role] ?? role;
  }
  ```

### 6. `packages/playground/tokens.config.ts`
- Rename the semantic color keys:
  - `warning: { scale: "carrot" }` → `warn: { scale: "carrot" }`
  - `error: { scale: "beetroot" }` → `danger: { scale: "beetroot" }`
- Leave `accent` as-is (illustrates the "extra non-canonical role" path).

### 7. Regenerate playground outputs
After the source changes, regenerate:
- `packages/playground/src/generated/primevue-preset.ts`
- `packages/playground/src/generated/primevue-pt.ts`

via `pnpm --filter @theme-unify/playground generate` (or whatever script the
repo exposes; check `package.json`).

### 8. `packages/playground/src/App.vue`
- Search for any hard-coded `severity="warning"` / `severity="error"` props on
  PrimeVue components and update to `"warn"` / `"danger"`. (Quick `grep` should
  list every usage.)

## Tests

### `packages/core/tests/validator.test.ts` (new cases)
- Config with `semantic.colors.warning` produces a warning-severity issue
  whose message names the canonical replacement `warn`.
- Config with `semantic.colors.foo` (entirely non-canonical) produces an
  info-severity issue, **does not** throw.
- Config using only canonical names produces zero role-related issues.

### `packages/core/tests/generators/primevue.test.ts` (new cases)
- Given `semantic.colors.warning`, the generated preset contains a `warn` key
  (not `warning`) under `semantic`.
- Given a non-aliased custom role (`accent`), it passes through verbatim.

### `packages/core/tests/generators/primevue-pt.test.ts` (update)
- Update the existing `danger`/`warn` severity tests so the fixture uses the
  canonical names directly, demonstrating no alias translation is required.
- Add a regression test: legacy fixture with `warning` still resolves the
  scale via `canonicalizeSemanticRole` (proves the back-compat path works).

### `packages/core/tests/fixtures/tokens.fixture.ts`
- Update fixture to use canonical names; add a small `legacyTokensFixture`
  variant that still uses `warning` / `error` for the back-compat tests.

## Documentation

### `docs/token-schema.md`
- Add a "Canonical semantic roles" subsection listing the eight names, marking
  `warning` and `error` as deprecated aliases of `warn` and `danger`.
- Note that PT severity-aware components require canonical role names.

### `docs/generators.md`
- Under the PrimeVue generator section, document that role keys are
  canonicalized before being written into the preset's `semantic` block.

### `docs/architecture.md`
- Update the "auto-derivation from semantic" bullet to mention role
  canonicalization as a generator step.

## Acceptance Criteria
1. Playground builds and renders identically (visual parity) after renaming
   `warning`→`warn` and `error`→`danger`.
2. `<Button severity="warn">` and `<Button severity="danger">` in playground
   pick up the carrot and beetroot scales respectively (verified by inspecting
   computed styles or PT class output).
3. The styled `GeneratedPreset` exposes `semantic.warn.500` (not
   `semantic.warning.500`) when the source uses either the legacy or canonical
   key.
4. Loading a config with `warning` prints a deprecation warning to stderr but
   does not throw; loading a config with an unknown role like `accent` is
   silent at error-level (info issue only).
5. All existing tests pass; new tests above pass.

## Out of Scope (defer)
- Hard-removing the legacy-alias path (deferred to next major version).
- Auto-rewriting user `tokens.config.ts` files via a codemod.
- Extending PT severity coverage to non-canonical roles.
