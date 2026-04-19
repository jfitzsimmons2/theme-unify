# Step 4 — Honor `meta.darkModeStrategy` (or reject unsupported values)

## Goal
Make `meta.darkModeStrategy` a real switch instead of a silently ignored
field. Today the validator accepts `"class" | "media"`, but every consumer
(PT generator, PrimeVue preset, UnoCSS shortcuts) hard-codes the `class`
strategy and ignores `meta.darkModeSelector`. A user who sets
`darkModeStrategy: "media"` ends up with PT class strings full of `dark:`
variants that only react to a `.dark` ancestor — exactly what they asked
to avoid.

## Current State (verified)

- `MetaConfig` in [packages/core/src/types.ts](../packages/core/src/types.ts#L38-L42)
  declares `darkModeStrategy: "class" | "media"` and
  `darkModeSelector: string`.
- Validator does **not** check that `darkModeStrategy` is one of the
  permitted values.
- `darkModeSelector` is referenced in [docs/token-schema.md](../docs/token-schema.md#L50-L54)
  as "consumed by both PrimeVue and the UnoCSS shortcuts generator", but
  `grep` over `packages/core/src` shows zero call sites — the field is
  effectively dead.
- [packages/core/src/generators/primevue-pt.ts](../packages/core/src/generators/primevue-pt.ts#L186-L250)
  always pairs every surface class with a `dark:` variant via the local
  `pair()` and `withModifier()` helpers.
- [packages/core/src/generators/primevue.ts](../packages/core/src/generators/primevue.ts)
  emits both `colorScheme.light` and `colorScheme.dark` blocks
  unconditionally; PrimeVue itself toggles between them based on its
  runtime `darkModeSelector`/`.system` setting, but theme-unify never
  forwards that choice.

## Decision

Implement the `media` strategy properly rather than rejecting it. The
work is contained because all dark-mode emission already flows through a
single helper in the PT generator and a single options object in the
PrimeVue preset.

Canonical mapping:

| Strategy | PT generator output                              | PrimeVue preset                                    | UnoCSS                                                          |
| -------- | ------------------------------------------------ | -------------------------------------------------- | --------------------------------------------------------------- |
| `class`  | `light dark:dark` paired classes (today)         | `options.darkModeSelector = meta.darkModeSelector` | shortcuts already use `dark:` variant (UnoCSS class-mode)       |
| `media`  | Variants emitted under `@media (prefers-color-scheme: dark)` via the UnoCSS `@media` variant prefix | `options.darkModeSelector = ".system"` (PrimeVue's media-query sentinel) | Switch `dark` variant to media via `presetMini({ dark: 'media' })` guidance in docs |

UnoCSS supports both `dark:foo` (class) and `@dark:foo`/media-query
variants. We will keep generating the same `dark:` token in PT output —
UnoCSS's `dark` mode (`class` vs `media`) is a config-time choice on the
playground side, so the **PT classes can stay identical** as long as the
playground passes the right preset option. The actual change in PT
output is **only** required if we want theme-unify to be the single
source of truth for *how* `dark:` resolves at runtime; we achieve that
by forwarding the strategy into the generated UnoCSS theme file.

## Files to change

### 1. `packages/core/src/validator.ts`
- Reject `meta.darkModeStrategy` values outside `"class" | "media"`.
- Require `meta.darkModeSelector` to be a non-empty CSS selector when
  strategy is `"class"`. When strategy is `"media"`, warn (don't error)
  if a selector other than the default is set, since it will be ignored.

### 2. `packages/core/src/generators/primevue.ts`
- When emitting the preset, set `options.darkModeSelector` based on
  strategy:
  - `"class"` → `meta.darkModeSelector` (default `.dark`).
  - `"media"` → `.system` (PrimeVue's documented sentinel for
    prefers-color-scheme).
- Add a unit test asserting the emitted options block.

### 3. `packages/core/src/generators/unocss-theme.ts`
- Export a new top-level constant `darkMode` (string: `"class"` or
  `"media"`) so the playground's `uno.config.ts` can spread it into
  `presetMini({ dark: darkMode })` (or equivalent) instead of hard-coding.
- Cover with a test that toggling `meta.darkModeStrategy` flips the
  exported value.

### 4. `packages/core/src/generators/unocss-shortcuts.ts`
- No structural change — UnoCSS rewrites the `dark:` variant at
  preset-resolution time. Add a doc comment at the top of the generated
  file noting the variant is interpreted per `darkMode` from
  `unocss-theme.ts`.

### 5. `packages/core/src/generators/primevue-pt.ts`
- Keep emitting `light dark:dark` paired strings (UnoCSS handles the
  semantics).
- Add a generated banner comment at the top of the output naming the
  active `darkModeStrategy` so users debugging PT output can see which
  mode the file was generated under.
- **No runtime branching needed.** If `runtime media-query strings`
  become necessary later, we can add a `darkMode === 'media'` branch in
  `withModifier` / `pair` that emits `[@media(prefers-color-scheme:dark)]:`
  prefixes (Tailwind/UnoCSS arbitrary variant). Track as follow-up.

### 6. `packages/playground/uno.config.ts`
- Import the new `darkMode` constant from `src/generated/unocss-theme.ts`
  and pass it into the UnoCSS preset (e.g. `presetMini({ dark: darkMode })`).
- Verify with the playground that switching `meta.darkModeStrategy` to
  `"media"` causes the OS-level dark mode to drive the UI without the
  manual class toggle.

### 7. `packages/playground/tokens.config.ts`
- Leave default at `"class"` so existing demo behaviour is unchanged.
- Add a commented-out `darkModeStrategy: "media"` example.

### 8. Tests
- `packages/core/tests/validator.test.ts` — reject invalid strategies,
  accept the two valid ones, warn on stale selector with media mode.
- `packages/core/tests/generators/primevue.test.ts` — assert preset
  options contain the right `darkModeSelector` for each strategy.
- `packages/core/tests/generators/unocss-theme.test.ts` — assert the
  exported `darkMode` constant matches strategy.
- `packages/core/tests/generators/primevue-pt.test.ts` — snapshot the
  banner comment under both strategies.

### 9. Documentation
- `docs/token-schema.md` — clarify the two strategies, what each does,
  and that `darkModeSelector` is only honoured under `"class"`.
- `docs/generators.md` — note the new `darkMode` export from the
  UnoCSS theme generator and the `darkModeSelector` plumbing in the
  PrimeVue preset.
- `docs/architecture.md` — short paragraph on the dark-mode pipeline.

## Acceptance Criteria

1. Setting `meta.darkModeStrategy: "media"` in `tokens.config.ts` makes
   the playground respond to OS dark-mode preference *without* any
   `.dark` class on the document.
2. Setting `meta.darkModeStrategy: "class"` (default) preserves
   today's behaviour exactly — playground toggle button still works.
3. An invalid value (e.g. `"manual"`) fails validation with a clear
   error pointing at `meta.darkModeStrategy`.
4. A typo in `meta.darkModeSelector` under `"media"` mode produces a
   warning advising the field is ignored.
5. `pnpm test` passes; new tests cover all three branches.

## Out of scope (deferred)

- Rewriting PT class strings to use UnoCSS arbitrary media-query
  variants (`[@media(prefers-color-scheme:dark)]:`). Only needed if a
  consumer wants to use the generated PT *without* UnoCSS — not a
  current requirement.
- A user-facing "auto / light / dark" tri-state. Strategy stays a build
  time switch.

## Rollout

1. Validator + types tightening (no behaviour change for valid configs).
2. Generator changes + tests in one commit.
3. Playground wiring + manual smoke test of both strategies.
4. Docs update.
5. CHANGELOG entry under the next core version bump (see plan §
   Cross-cutting tasks).
