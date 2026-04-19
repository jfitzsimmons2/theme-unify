# Step 2 — Extend `PrimitiveConfig` with `breakpoints` / `zIndex` / `transitions` / `animations`

> Parent plan: [plan-themeUnifySyncGaps.prompt.md](./plan-themeUnifySyncGaps.prompt.md)

## Problem
Authors today can only express colors, spacing, radii, shadows, typography and
font‑weight in `primitive`. Cross‑framework concerns that *both* PrimeVue and
UnoCSS care about — viewport breakpoints, overlay z‑index stacking,
transition timings/easings, and named keyframe animations — are silently
absent from the schema. Each framework therefore picks its own defaults and
the two drift apart (e.g. `md:` in templates resolves at a different width
than a PrimeVue `Drawer` breakpoint, or a UnoCSS overlay sits below a
PrimeVue `Dialog`).

The schema:
[packages/core/src/types.ts](../packages/core/src/types.ts#L46-L55) — current
`PrimitiveConfig` shape.

## Goal
A user defining any of these once in `tokens.config.ts` gets:
1. UnoCSS `theme.breakpoints` / `theme.zIndex` / `theme.transitionProperty`
   (plus duration/timing) / `theme.animation` populated.
2. PrimeVue picks up the values it can semantically consume — at minimum
   z‑index — through its `semantic` token tree, so overlay stacking matches
   utility usage.
3. Both generators ignore (and validators warn on) malformed CSS values.

---

## Decisions (resolve before implementing)

1. **Scope of PrimeVue propagation.** PrimeVue's design token tree exposes
   well‑known z‑index keys (`semantic.overlay`, `semantic.mask`, etc. via
   each component preset). Limit Step 2's PrimeVue side to **z‑index only**
   — propagate user `zIndex.overlay`, `zIndex.modal`, `zIndex.tooltip` into
   the PrimeVue `semantic` block. Breakpoints, transitions and animations
   stay UnoCSS‑only this step (PrimeVue components compute their own
   responsive behaviour internally; mismatches there are tracked separately).
2. **Schema shape.** All four fields are optional `Record<string, string>` —
   matching the existing `spacing` / `radii` / `shadows` style — keeping the
   resolver and serializer changes minimal.
3. **UnoCSS naming.** Map directly to UnoCSS's documented theme keys:
   `breakpoints`, `zIndex`, `transitionProperty` + `transitionDuration` +
   `transitionTimingFunction` (split via key prefix; see "Transitions
   sub‑shape" below), and `animation`. No invented aliases.
4. **Transitions sub‑shape.** A flat `Record<string, string>` cannot
   distinguish properties from durations from easings. Adopt a **nested**
   shape just for `transitions`:
   ```ts
   transitions?: {
       property?: Record<string, string>;
       duration?: Record<string, string>;
       timingFunction?: Record<string, string>;
   }
   ```
   This is the only field that diverges from the flat pattern; it is
   justified by UnoCSS exposing three separate theme keys.

---

## Files to change

### 1. `packages/core/src/types.ts`
Extend `PrimitiveConfig`:

```ts
export interface TransitionsTokens {
    property?: Record<string, string>;
    duration?: Record<string, string>;
    timingFunction?: Record<string, string>;
}

export interface PrimitiveConfig {
    colors: Record<string, ColorScale>;
    spacing?: Record<string, string>;
    radii?: Record<string, string>;
    shadows?: Record<string, string>;
    typography?: TypographyTokens;
    fontWeight?: Record<string, string>;
    breakpoints?: Record<string, string>;
    zIndex?: Record<string, string>;
    transitions?: TransitionsTokens;
    animations?: Record<string, string>;
}
```

Also add the new field names to the `primitiveAliases` map in
[packages/core/src/validator.ts](../packages/core/src/validator.ts#L139-L147)
so refs like `{ ref: "zIndex.modal" }` resolve.

### 2. `packages/core/src/validator.ts`
Add validation blocks mirroring the existing `spacing` / `radii` checks. Use
a **narrower** regex for breakpoints (the shared `CSS_VALUE_RE` accepts time
and angle units, which would let `"640ms"` through):

```ts
const BREAKPOINT_RE = /^\d+(\.\d+)?(px|rem|em)$/;

// Validate breakpoints
if (tokens.primitive.breakpoints) {
    for (const [key, value] of Object.entries(tokens.primitive.breakpoints)) {
        if (!BREAKPOINT_RE.test(value)) {
            issues.push({
                path: `primitive.breakpoints.${key}`,
                message: `Invalid breakpoint "${value}" in breakpoints.${key} (expected px/rem/em length)`,
            });
        }
    }
}

// Validate zIndex (must be integer-like, allow 'auto')
if (tokens.primitive.zIndex) {
    for (const [key, value] of Object.entries(tokens.primitive.zIndex)) {
        if (!/^(auto|-?\d+)$/.test(value)) {
            issues.push({
                path: `primitive.zIndex.${key}`,
                message: `Invalid z-index "${value}" in zIndex.${key} (expected integer or "auto")`,
            });
        }
    }
}

// Validate transitions sub-records
if (tokens.primitive.transitions) {
    for (const sub of ["property", "duration", "timingFunction"] as const) {
        const bag = tokens.primitive.transitions[sub];
        if (!bag) continue;
        for (const [key, value] of Object.entries(bag)) {
            if (typeof value !== "string" || value.trim() === "") {
                issues.push({
                    path: `primitive.transitions.${sub}.${key}`,
                    message: `Invalid transition ${sub} value in transitions.${sub}.${key}`,
                });
            }
        }
    }
}

// Validate animations (free-form CSS shorthand strings)
if (tokens.primitive.animations) {
    for (const [key, value] of Object.entries(tokens.primitive.animations)) {
        if (typeof value !== "string" || value.trim() === "") {
            issues.push({
                path: `primitive.animations.${key}`,
                message: `Invalid animation shorthand in animations.${key}`,
            });
        }
    }
}
```

`CSS_VALUE_RE` already covers `px`/`rem`/`em` so breakpoints validate
without changes.

### 3. `packages/core/src/generators/unocss-theme.ts`
Append after the existing `fontWeight` block, before the final `return`:

```ts
if (resolved.primitive.breakpoints) {
    sections.push(
        `export const breakpoints = ${serializeValue(resolved.primitive.breakpoints, 0)} as const;`,
    );
    sections.push("");
}

if (resolved.primitive.zIndex) {
    sections.push(
        `export const zIndex = ${serializeValue(resolved.primitive.zIndex, 0)} as const;`,
    );
    sections.push("");
}

if (resolved.primitive.transitions) {
    const t = resolved.primitive.transitions;
    if (t.property) {
        sections.push(
            `export const transitionProperty = ${serializeValue(t.property, 0)} as const;`,
        );
        sections.push("");
    }
    if (t.duration) {
        sections.push(
            `export const transitionDuration = ${serializeValue(t.duration, 0)} as const;`,
        );
        sections.push("");
    }
    if (t.timingFunction) {
        sections.push(
            `export const transitionTimingFunction = ${serializeValue(t.timingFunction, 0)} as const;`,
        );
        sections.push("");
    }
}

if (resolved.primitive.animations) {
    sections.push(
        `export const animation = ${serializeValue(resolved.primitive.animations, 0)} as const;`,
    );
    sections.push("");
}
```

### 4. `packages/core/src/generators/primevue.ts`
In **both** the auto‑derive path
([packages/core/src/generators/primevue.ts](../packages/core/src/generators/primevue.ts#L82))
and the explicit‑schema path
([packages/core/src/generators/primevue.ts](../packages/core/src/generators/primevue.ts#L272)),
attach a `zIndex` sub‑object on `semantic` when present:

```ts
if (resolved.primitive.zIndex) {
    semantic["zIndex"] = { ...resolved.primitive.zIndex };
}
```

Place this next to the existing `colorScheme` / `formField` assignments so
overrides can still merge over it. PrimeVue treats unknown semantic keys as
inert, so emitting all user keys (not just `overlay`/`modal`) is safe and
keeps the surface flexible.

**Verification task (do before implementing):** PrimeVue's runtime overlay
stacking is driven by the `zIndex` option on the `PrimeVue` plugin
(`app.use(PrimeVue, { zIndex: { modal, overlay, menu, tooltip } })`), not by
`semantic.zIndex.*` in the preset. Confirm against the installed PrimeVue
version whether `semantic.zIndex` is actually consumed. If it is **not**,
fall back to:
  - emitting a sibling `primevueZIndex` export (object with the four
    well-known slots, derived via an alias map: `modal`/`dialog` → `modal`;
    `overlay`/`dropdown`/`popover` → `overlay`; `menu` → `menu`;
    `tooltip`/`toast` → `tooltip`; max value wins on collision),
  - documenting that the playground passes it to `app.use(PrimeVue, { zIndex })`.
Keep the `semantic.zIndex` block either way for future-proofing and so users
who theme via PT can still reference the values by name.

Breakpoints / transitions / animations are **not** propagated to PrimeVue
this step (see Decision 1). Document the rationale inline.

### 5. `packages/core/src/generators/primevue-pt.ts`
No change required for Step 2 — PT only consumes color tokens today. Add a
`// TODO(step2): consider z-index propagation per component` comment near
the overlay component PT entries (Dialog, Drawer, Tooltip) so the gap is
visible in‑file.

### 6. `packages/playground/tokens.types.ts`
Regenerate / extend the typed wrapper so the new optional fields surface in
the playground's TS autocompletion. If `tokens.types.ts` is hand‑authored,
mirror the new shape; if generated from `types.ts`, re‑run its build.

### 7. `packages/playground/tokens.config.ts`
Add example values under `primitive`:

```ts
breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
},
zIndex: {
    base: "0",
    dropdown: "1000",
    overlay: "1100",
    modal: "1200",
    toast: "1300",
    tooltip: "1400",
},
transitions: {
    duration: { fast: "120ms", base: "200ms", slow: "320ms" },
    timingFunction: {
        standard: "cubic-bezier(0.2, 0, 0, 1)",
        emphasized: "cubic-bezier(0.3, 0, 0, 1)",
    },
},
animations: {
    "fade-in": "fade-in 200ms ease-out both",
    "slide-up": "slide-up 240ms cubic-bezier(0.2, 0, 0, 1) both",
},
```

(Authors of keyframes still need a `@keyframes` block in `style.css` — the
generator only wires the shorthand mapping, not the keyframe definitions.)

### 8. `packages/playground/uno.config.ts`
Import and pass the new exports through:

```ts
import {
    colors, borderRadius, boxShadow, fontFamily, fontWeight,
    breakpoints, zIndex, transitionDuration, transitionTimingFunction, animation,
} from "./src/generated/unocss-theme";

export default defineConfig({
    // ...
    theme: {
        colors, borderRadius, boxShadow, fontFamily, fontWeight,
        breakpoints, zIndex,
        transitionDuration, transitionTimingFunction,
        animation,
    },
});
```

Use a conditional spread (or `??`) for any export that may be undefined when
the corresponding token block is omitted.

### 9. `packages/playground/src/generated/`
Re‑run the build/dev pipeline to regenerate `unocss-theme.ts` and
`primevue-preset.ts`. Commit the regenerated artifacts (project convention).

### 10. `packages/playground/src/App.vue`
Add a small showcase row exercising one breakpoint utility, one z‑index
utility, one transition‑duration utility and one animation utility (e.g.
`md:flex hidden`, `z-modal`, `duration-base`, `animate-fade-in`) so visual
regressions are obvious.

### 11. Tests

`packages/core/tests/generators/unocss-theme.test.ts` — add cases:
- emits `breakpoints` export when `primitive.breakpoints` is set, omits
  otherwise.
- emits `zIndex` export when set.
- emits each of `transitionProperty` / `transitionDuration` /
  `transitionTimingFunction` independently based on which sub‑bag is
  present.
- emits `animation` export when set.

`packages/core/tests/generators/primevue.test.ts` — add cases:
- `semantic.zIndex` is present in the generated config when
  `primitive.zIndex` is provided.
- `semantic.zIndex` is absent when not provided.
- explicit `primevue.colorScheme` overrides do **not** clobber `zIndex`.

`packages/core/tests/validator.test.ts` — add cases:
- invalid breakpoint value (`"wide"`) flagged.
- invalid z‑index value (`"high"`) flagged; valid `"auto"` and `-1`
  accepted.
- invalid transition duration / timing function values flagged.
- valid configurations produce zero issues.

Reuse / extend [packages/core/tests/fixtures/tokens.fixture.ts](../packages/core/tests/fixtures/tokens.fixture.ts) with a fixture
exercising every new field.

### 12. Docs
- [docs/token-schema.md](../docs/token-schema.md) — document each new field
  under `PrimitiveConfig`, the nested shape of `transitions`, the validation
  rules, and exactly which UnoCSS theme key each one populates. Note the
  z‑index‑only PrimeVue propagation.
- [docs/generators.md](../docs/generators.md) — list new exports
  (`breakpoints`, `zIndex`, `transitionProperty`, `transitionDuration`,
  `transitionTimingFunction`, `animation`) and the new
  `semantic.zIndex` block in the PrimeVue preset.
- [docs/pipeline.md](../docs/pipeline.md) — extend the resolver →
  generator diagram with the new fields.
- [docs/architecture.md](../docs/architecture.md) — refresh the schema map
  if it enumerates fields.
- [docs/getting-started.md](../docs/getting-started.md) — add a one‑line
  example showing breakpoint + z‑index definition.

---

## Acceptance criteria
- A breakpoint defined once (e.g. `md: "900px"`) is usable as `md:flex` in
  templates **and** PrimeVue layout components flow with the same width
  (verified via the playground showcase row at 900px viewport).
- A `zIndex.modal` value defined once renders both:
  - UnoCSS `z-modal` utility producing `z-index: <value>`.
  - PrimeVue `Dialog` / `Drawer` mask layered correctly relative to a
    UnoCSS sticky element using `z-overlay`.
- A `transitions.duration.base` value powers both `duration-base` utility
  and is available for future PT propagation (no regression today).
- An `animations["fade-in"]` value yields `animate-fade-in` working in
  templates (with author‑supplied `@keyframes` declared in `style.css`).
- All existing tests pass; new tests cover each generator branch and
  validator rule.
- Removing every new field from `tokens.config.ts` produces a build
  identical to the pre‑Step‑2 baseline (no stray exports).

## Out of scope
- Auto‑generating `@keyframes` rules from token definitions — keyframes
  remain author‑supplied CSS.
- Propagating breakpoints, transitions, or animations into PrimeVue
  components. Tracked as a follow‑up; revisit alongside the PT generator
  expansion.
- Fluid / clamp‑based breakpoint helpers.
- Renaming the existing flat `Record<string, string>` style to nested
  shapes for `radii` / `shadows` etc. — only `transitions` needs nesting.

## Risk / migration notes
- Adding fields to `PrimitiveConfig` is **additive and optional**, so
  existing `tokens.config.ts` files compile unchanged.
- `serializeValue` already handles nested `Record<string, string>` objects
  (used by `colors`); no changes needed.
- The generated playground `uno.config.ts` will fail to import any new
  symbol that the user has not defined — keep imports conditional or rely
  on the regenerated module always exporting the symbols (preferred:
  generator emits the export only when the input is present, and the
  consumer uses `??`/optional spread).
- `primitiveAliases` in `validator.ts` must be updated *together* with the
  new fields, otherwise `{ ref: "zIndex.modal" }` style refs will fail
  validation even though the data exists.
