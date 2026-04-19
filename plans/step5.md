# Step 5 — Make PT Scale Name Resolution Deterministic

## Background

The PrimeVue PT generator (`packages/core/src/generators/primevue-pt.ts`) emits Tailwind/UnoCSS class strings like `bg-emerald-500` for each semantic severity (`primary`, `success`, `warn`, …). To produce these strings it needs the *name* of the source palette (`emerald`), not just its eleven hex values.

Today this is recovered by `resolveScaleName()`, a reverse lookup that scans every entry of `primitive.colors` and `BUILTIN_PALETTES` for a scale whose `[500]` step matches the resolved hex:

```ts
// packages/core/src/generators/primevue-pt.ts (lines 110–124)
function resolveScaleName(scale, resolved) {
  const val500 = scale[500];
  for (const [name, s] of Object.entries(resolved.primitive.colors)) {
    if (s[500] === val500) return name;
  }
  for (const [name, s] of Object.entries(BUILTIN_PALETTES)) {
    if (s[500] === val500) return name;
  }
  return undefined;
}
```

### Problems

1. **Collision-prone.** Two palettes that happen to share the same `#xxxxxx` at step `500` (e.g. a user-defined `brand` cloned from `emerald`) silently resolve to whichever entry is iterated first. The resulting PT class strings (`bg-brand-500` vs `bg-emerald-500`) are non-deterministic relative to the user's intent.
2. **Unnecessary work.** The information is already known: every code path that calls `resolveScaleName()` arrived there via a `semantic.colors[role].scale` or `semantic.surface.scale` string. We discard that name when we call `resolveScale(...)`, then immediately reverse-engineer it.
3. **Fragile to palette ordering.** Any future change to insertion order of `primitive.colors` or `BUILTIN_PALETTES` could change generated output without any token edit.

## Decision

Implement **Option A** from the parent plan: thread the originating scale name through the resolver/helpers so `primevue-pt.ts` never needs to reverse-lookup. Option B (validator-enforced uniqueness of `[500]` hex) is rejected because (a) it forbids legitimate use cases (a user wanting `brand` as an alias of `emerald`), and (b) it doesn't fix the underlying smell of throwing away information we already have.

## Files Touched

- `packages/core/src/generators/primevue-pt.ts` — primary refactor
- `packages/core/tests/generators/primevue-pt.test.ts` — collision regression test
- `docs/generators.md` — note the determinism guarantee
- `docs/architecture.md` — brief mention in the "PT generator" section

No changes to `types.ts`, `resolver.ts`, or `validator.ts` are required: the scale *name* is already present on `ResolvedAutoTokens.semantic.colors[role].scale` and `semantic.surface.scale|darkScale`. We just need to use it.

## Implementation Plan

### 6.1 Replace `getSemanticColorScale` returns to include the name

Introduce a tiny internal type and helper that returns *both* the scale and its name:

```ts
interface NamedScale {
  name: string;
  scale: ColorScale;
}

function getSemanticColorNamedScale(
  resolved: ResolvedTokens | ResolvedAutoTokens,
  role: string,
): NamedScale | undefined {
  const sem = resolved.semantic;
  if (!sem?.colors) return undefined;

  const direct = sem.colors[role];
  if (direct) {
    const scale = resolveScale(direct.scale, resolved.primitive);
    return scale ? { name: direct.scale, scale } : undefined;
  }

  // Existing alias fallback
  for (const alias of SEVERITY_ALIASES[role] ?? []) {
    const aliased = sem.colors[alias];
    if (aliased) {
      const scale = resolveScale(aliased.scale, resolved.primitive);
      return scale ? { name: aliased.scale, scale } : undefined;
    }
  }
  return undefined;
}
```

Apply the same pattern to `getSurfaceScale` and `getPrimaryScale` (return `NamedScale | undefined`).

### 6.2 Delete `resolveScaleName`

Remove the function entirely once all call sites are migrated. Drop the now-unused `BUILTIN_PALETTES` and `isBuiltinPalette` imports if no other code in the file needs them (verify — `getSurfaceScale`'s dark-scale fallback still uses `isBuiltinPalette`, so it stays).

### 6.3 Update `buildSeverityClassMapsResolved`

```ts
for (const severity of severities) {
  const named = getSemanticColorNamedScale(resolved, severity);
  if (!named) continue;
  const { name } = named;
  maps[severity] = {
    bg: `bg-${name}-500`,
    bgHover: `bg-${name}-600`,
    // …unchanged
  };
}
```

The `scale` field of `NamedScale` is no longer needed here (the loop only ever used the name), so we can simplify further if desired.

### 6.4 Update `buildSurfaceClassMapResolved`

Replace the two `resolveScaleName(...)` calls with the `.name` field returned by the new helpers:

```ts
const lightNamed = getSurfaceScale(resolved);
const primaryNamed = getPrimaryScale(resolved);
const lightName = lightNamed?.name;
const primaryName = primaryNamed?.name;

const darkScaleName = resolved.semantic?.surface?.darkScale;
const darkName =
  darkScaleName &&
  (resolved.primitive.colors[darkScaleName] || isBuiltinPalette(darkScaleName))
    ? darkScaleName
    : lightName;
```

The `darkScaleName` branch already uses the raw string, so no change there.

### 6.5 Verify no other callers

Grep for `resolveScaleName` across `packages/core/src` and `packages/core/tests` — should be zero matches after the refactor.

## Tests

Add to `packages/core/tests/generators/primevue-pt.test.ts`:

### Test A — Collision regression

```ts
it("emits the user-defined scale name when two palettes share the same #500", () => {
  const tokens = defineTokens({
    meta: { name: "t", darkModeStrategy: "class", darkModeSelector: ".dark" },
    primitive: {
      colors: {
        // Identical scales, different names
        brand: { 50: "#ecfdf5", 100: "#d1fae5", 200: "#a7f3d0", 300: "#6ee7b7",
                 400: "#34d399", 500: "#10b981", 600: "#059669", 700: "#047857",
                 800: "#065f46", 900: "#064e3b", 950: "#022c22" },
        emerald: { /* same hexes */ },
      },
    },
    semantic: {
      colors: { primary: { scale: "brand" } },
      surface: { scale: "brand" },
    },
  });
  const resolved = resolveTokens(tokens);
  const out = generatePrimeVuePT(resolved);
  expect(out).toContain("bg-brand-500");
  expect(out).not.toContain("bg-emerald-500");
});
```

### Test B — Builtin palette unaffected

Confirm the existing snapshot/string assertions for a config that uses `scale: "emerald"` directly still produce `bg-emerald-*`. (Likely already covered by current tests; add an explicit assertion if not.)

### Test C — Surface darkScale name preserved

A token config with `surface: { scale: "neutral", darkScale: "zinc" }` should produce class strings that reference `neutral` for light and `zinc` for dark, regardless of any `[500]` collision elsewhere.

## Documentation Updates

### `docs/generators.md`

Under the PT generator section, add:

> **Deterministic scale names.** Class strings (`bg-emerald-500`, `text-brand-700`, …) always use the palette name declared in `semantic.colors[role].scale` / `semantic.surface.scale`. Two palettes with identical hex values do not collide.

### `docs/architecture.md`

In the "Generators" subsection, replace any wording suggesting PT does a reverse lookup with a note that it consumes the scale name directly from the resolved semantic tokens.

## Acceptance Criteria

1. Defining two palettes whose `[500]` hexes match produces PT output that references the palette name actually selected in `semantic.colors`/`semantic.surface`.
2. `resolveScaleName` no longer exists in the codebase.
3. All existing tests pass; new collision test passes.
4. Playground regenerates without diff (no current playground palette triggers a collision, so output should be byte-identical).
5. `docs/generators.md` and `docs/architecture.md` reflect the new guarantee.

## Out of Scope

- Validator changes to forbid duplicate `[500]` hexes (rejected — see Decision).
- Restructuring `ResolvedAutoTokens` to carry a `name` field on every semantic mapping (already present as `scale: string` — no schema change needed).
- PT class-string customization beyond the existing severity/surface maps.

## Rollout

Single PR. No migration required for users — generated output is identical for all non-colliding configs (i.e. every existing config in the wild). For colliding configs the output changes to the *correct* name, which is a bug fix.
