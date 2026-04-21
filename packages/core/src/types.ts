/**
 * Public type definitions for `theme-unify`.
 *
 * These types describe the shape of a `tokens.config.ts` file and the
 * resolved tree that the generators consume. Most consumers never need
 * to import them directly — `defineTokens()` infers everything — but
 * they are exposed so library authors and advanced users can build on
 * top of `theme-unify`.
 *
 * @packageDocumentation
 */

// ---- Color Steps ----

/**
 * The eleven step keys of a Tailwind v3 / PrimeUix Aura color scale.
 *
 * Every {@link ColorScale} must define **all** of these — partial
 * scales are rejected by the validator so generated PrimeVue and
 * UnoCSS output never references a missing `--p-{name}-{step}`
 * CSS variable.
 */
export type ColorStep =
    | 50
    | 100
    | 200
    | 300
    | 400
    | 500
    | 600
    | 700
    | 800
    | 900
    | 950;

/**
 * The canonical, ordered list of {@link ColorStep} values. Useful when
 * iterating in generators or UI code (e.g. rendering palette swatches).
 *
 * @example
 * ```ts
 * import { COLOR_STEPS } from "theme-unify";
 *
 * for (const step of COLOR_STEPS) {
 *   console.log(step, palette[step]);
 * }
 * ```
 */
export const COLOR_STEPS: readonly ColorStep[] = [
    50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
];

/**
 * A complete color scale: every {@link ColorStep} mapped to a CSS color
 * string (typically `#rrggbb` hex, but `rgb()`, `hsl()`, etc. are also
 * accepted).
 *
 * @example
 * ```ts
 * const beetroot: ColorScale = {
 *   50:  "#FDF2F4",
 *   100: "#FAE0E4",
 *   // ...all 11 steps required...
 *   950: "#300A14",
 * };
 * ```
 */
export type ColorScale = Record<ColorStep, string>;

// ---- Ref ----

/**
 * A lazy cross-reference into another part of the token tree.
 *
 * Refs are resolved at build time by `resolveRefs`. They may appear
 * anywhere inside `preset.overrides` where a string value is expected.
 *
 * Path syntax — dot-separated, with primitive aliases:
 *
 * | Ref path                | Resolves to                       |
 * | ----------------------- | --------------------------------- |
 * | `colors.beetroot.500`   | `primitive.colors.beetroot[500]`  |
 * | `radii.sm`              | `primitive.radii.sm`              |
 * | `spacing.md`            | `primitive.spacing.md`            |
 * | `shadows.lg`            | `primitive.shadows.lg`            |
 * | `fontWeight.bold`       | `primitive.fontWeight.bold`       |
 * | `typography.fontFamily` | `primitive.typography.fontFamily` |
 *
 * Builtin palette steps are also addressable: `colors.purple.500`
 * works even when `purple` is not in `primitive.colors`.
 *
 * @example
 * ```ts
 * preset: {
 *   overrides: {
 *     semantic: {
 *       formField: { borderRadius: { ref: "radii.sm" } },
 *     },
 *   },
 * }
 * ```
 */
export interface Ref {
    /** Dot-separated path. See {@link Ref} for syntax. */
    ref: string;
}

/**
 * A token value: either a literal string or a {@link Ref} pointing at
 * one. Generators always see strings — refs are resolved first.
 */
export type TokenValue = string | Ref;

/**
 * Type guard for {@link Ref}. Returns `true` when `value` is an object
 * with a string `ref` property.
 *
 * @example
 * ```ts
 * if (isRef(value)) {
 *   console.log("resolves from", value.ref);
 * }
 * ```
 */
export function isRef(value: unknown): value is Ref {
    return (
        typeof value === "object" &&
        value !== null &&
        "ref" in value &&
        typeof (value as Ref).ref === "string"
    );
}

// ---- Meta ----

/**
 * High-level metadata about a theme. Consumed verbatim by the
 * generators — no transformation is applied.
 */
export interface MetaConfig {
    /**
     * Human-readable theme name. Surfaced in generated file headers and
     * available to runtime code that imports the resolved tokens.
     */
    name: string;

    /**
     * How dark mode is activated at runtime.
     *
     * - `"class"` (default) — a CSS class (see {@link darkModeSelector})
     *   on a parent element toggles dark mode. PrimeVue and UnoCSS both
     *   react to the selector.
     * - `"media"` — the OS / browser `prefers-color-scheme: dark` media
     *   query drives dark mode. {@link darkModeSelector} is ignored
     *   (PrimeVue receives `".system"`, UnoCSS receives `dark: "media"`).
     *
     * @defaultValue `"class"`
     */
    darkModeStrategy?: "class" | "media";

    /**
     * CSS selector PrimeVue and UnoCSS use to switch into dark mode
     * when {@link darkModeStrategy} is `"class"`.
     *
     * Apply this class/attribute to a parent element (typically
     * `<html>` or `<body>`) to flip both PrimeVue components and UnoCSS
     * shortcuts simultaneously.
     *
     * Ignored when `darkModeStrategy` is `"media"`.
     *
     * @defaultValue `".dark"`
     *
     * @example
     * ```ts
     * meta: { name: "My Theme", darkModeSelector: "[data-theme='dark']" }
     * ```
     */
    darkModeSelector?: string;
}

// ---- Primitive ----

/**
 * Typography primitives. All fields are optional; generators emit only
 * what is present.
 *
 * Maps to PrimeVue:
 * - `fontFamily`     → `primitive.font.family`     → `--p-font-family`
 * - `baseFontSize`   → `primitive.font.size`       → `--p-font-size`
 * - `baseLineHeight` → `primitive.font.lineHeight` → `--p-font-line-height`
 *
 * UnoCSS exports `fontFamily`, `fontSize`, and `lineHeight` consts that
 * point at the same CSS variables.
 */
export interface TypographyTokens {
    /**
     * Font stack used for `--p-font-family`.
     *
     * @example `"'Inter', system-ui, sans-serif"`
     */
    fontFamily: string;
    /** Base font size, e.g. `"1rem"` or `"16px"`. Optional. */
    baseFontSize?: string;
    /** Base line height (unitless or with units), e.g. `"1.5"`. Optional. */
    baseLineHeight?: string;
}

/**
 * Transition primitives. Each sub-record maps directly onto a UnoCSS
 * theme key:
 *
 * - `property`       → `theme.transitionProperty`
 * - `duration`       → `theme.transitionDuration`
 * - `timingFunction` → `theme.transitionTimingFunction`
 *
 * All sub-fields are optional; generators emit only what is present.
 *
 * @example
 * ```ts
 * transitions: {
 *   duration: { fast: "120ms", base: "200ms", slow: "320ms" },
 *   timingFunction: { standard: "cubic-bezier(0.2, 0, 0, 1)" },
 * }
 * ```
 */
export interface TransitionsTokens {
    /** Named transition `transition-property` shorthand values. */
    property?: Record<string, string>;
    /** Named transition durations (e.g. `"200ms"`). */
    duration?: Record<string, string>;
    /** Named transition timing functions / easings. */
    timingFunction?: Record<string, string>;
}

/**
 * The "raw values" tier of the token tree.
 *
 * **Refs are not allowed inside `primitive`.** Every value here must be
 * a literal so generators can emit deterministic output without a
 * resolution pass.
 *
 * Each field corresponds to a family of `--p-*` CSS variables emitted
 * by the generated PrimeVue preset and re-exposed via the generated
 * UnoCSS theme.
 */
export interface PrimitiveConfig {
    /**
     * Named color scales. Each key becomes a PrimeVue primitive
     * palette under `--p-{name}-{step}`.
     *
     * Defining a scale whose name matches a builtin palette (e.g.
     * `purple`, `slate`) shadows that builtin and emits a one-time
     * `console.warn`.
     */
    colors: Record<string, ColorScale>;

    /** Named spacing values. Emitted as `--p-spacing-{key}`. */
    spacing?: Record<string, string>;

    /**
     * Named border-radius values. Merged into PrimeVue's existing
     * `borderRadius` primitive — your keys override Aura defaults of
     * the same name. Emitted as `--p-border-radius-{key}`.
     */
    radii?: Record<string, string>;

    /** Named box-shadow values. Emitted as `--p-shadow-{key}`. */
    shadows?: Record<string, string>;

    /** Typography primitives. See {@link TypographyTokens}. */
    typography?: TypographyTokens;

    /**
     * Named font-weight values. Emitted as `--p-font-weight-{key}`.
     *
     * @example `{ normal: "400", medium: "500", bold: "700" }`
     */
    fontWeight?: Record<string, string>;

    /**
     * Named viewport breakpoints. Each value must be a CSS length
     * (`px`/`rem`/`em`). Maps directly onto UnoCSS `theme.breakpoints`
     * so a key defined once (e.g. `md: "768px"`) drives both `md:`
     * utility variants and any responsive layout that consumes the
     * generated export.
     *
     * Not propagated to PrimeVue components in this release — they
     * compute their own responsive behaviour internally.
     *
     * @example `{ sm: "640px", md: "768px", lg: "1024px" }`
     */
    breakpoints?: Record<string, string>;

    /**
     * Named z-index stacking values. Each value must be an integer (or
     * the literal string `"auto"`). Drives both UnoCSS `theme.zIndex`
     * and PrimeVue's `semantic.zIndex` block so overlay stacking
     * stays in sync between framework components and utility classes.
     *
     * @example
     * `{ base: "0", overlay: "1100", modal: "1200", tooltip: "1400" }`
     */
    zIndex?: Record<string, string>;

    /**
     * Transition primitives — properties, durations and timing
     * functions. See {@link TransitionsTokens}. UnoCSS-only this
     * release; not propagated to PrimeVue.
     */
    transitions?: TransitionsTokens;

    /**
     * Named animation shorthands keyed by name. Each value is a CSS
     * `animation` shorthand string. Maps onto UnoCSS
     * `theme.animation`, enabling utilities like `animate-fade-in`.
     *
     * Author-supplied `@keyframes` declarations remain the consumer's
     * responsibility — the generator only wires the shorthand
     * mapping, not the keyframe definitions.
     *
     * @example
     * ```ts
     * animations: {
     *   "fade-in": "fade-in 200ms ease-out both",
     * }
     * ```
     */
    animations?: Record<string, string>;
}

// ---- Semantic ----

/**
 * A reference to a {@link ColorScale}.
 *
 * Two forms are supported:
 *
 * 1. **By name** — a string that names either a key in
 *    `primitive.colors` or a builtin palette (`"purple"`, `"slate"`,
 *    …). User definitions win on collision. This produces the most
 *    flexible PrimeVue output — semantic roles emit `{ref}` pointers
 *    that follow the primitive scale at runtime.
 *
 * 2. **Inline** — a literal {@link ColorScale} object with all 11
 *    steps. Use when you need a one-off scale that does not live in
 *    `primitive.colors`. Inline scales are emitted as raw hex values
 *    in the generated PrimeVue preset.
 */
export type SemanticScaleRef = string | ColorScale;

/**
 * Surface palette configuration. Surfaces drive page backgrounds,
 * cards, and elevated surfaces in PrimeVue components, and back the
 * `bg-surface-*` / `text-surface-*` UnoCSS utilities.
 *
 * Step `0` is added automatically (`#ffffff`) so PrimeVue components
 * that need a guaranteed brightest tone (e.g. switch handles, menu
 * popovers) always have one.
 */
export interface SemanticSurfaceConfig {
    /** Light-mode surface scale. */
    scale: SemanticScaleRef;
    /**
     * Dark-mode surface scale. Defaults to `scale` (same palette in
     * both modes) when omitted; PrimeVue automatically picks darker
     * steps under the `darkModeSelector`.
     */
    darkScale?: SemanticScaleRef;
}

/**
 * Canonical PrimeVue severity vocabulary — the role names that
 * `severity`-aware PrimeVue components (`Button`, `Tag`, `Message`,
 * `Toast`, …) react to. Use these names as keys in
 * {@link SemanticConfig.extra} to guarantee that PrimeVue components
 * pick up your color scales.
 *
 * Non-canonical role names are still permitted (e.g. an `accent`
 * role used only by your own UnoCSS utilities); the validator emits
 * an info-severity issue noting that severity-aware components will
 * not react to them.
 *
 * The legacy aliases `warning` and `error` are accepted for
 * backwards compatibility but trigger a deprecation warning;
 * generators canonicalize them to `warn` and `danger` respectively.
 */
export type CanonicalSemanticRole =
    | "primary"
    | "secondary"
    | "success"
    | "info"
    | "warn"
    | "danger"
    | "help"
    | "contrast";

/**
 * Ordered list of {@link CanonicalSemanticRole} values. Useful for
 * iterating known roles in tooling and validation.
 */
export const CANONICAL_SEMANTIC_ROLES: readonly CanonicalSemanticRole[] = [
    "primary",
    "secondary",
    "success",
    "info",
    "warn",
    "danger",
    "help",
    "contrast",
];

/**
 * The "design intent" tier — semantic roles mapped onto color scales.
 * Drives PrimeVue's `semantic` block and corresponding UnoCSS color
 * exports (`bg-primary-500`, `text-success-700`, …).
 */
export interface SemanticConfig {
    /**
     * Brand color. Emitted as PrimeVue `semantic.primary.{50–950}` and
     * the UnoCSS `primary` color.
     *
     * Components like `Button`, `Tag`, and `Checkbox` resolve their
     * default appearance from this scale.
     */
    primary?: SemanticScaleRef;

    /**
     * Surface palette per color scheme. See {@link SemanticSurfaceConfig}.
     *
     * Drives `--p-surface-{step}` and the UnoCSS `surface` color
     * export.
     */
    surface?: SemanticSurfaceConfig;

    /**
     * Additional named semantic roles. Each becomes a PrimeVue semantic
     * scale (`--p-{role}-{step}`) and a UnoCSS color (`bg-{role}-500`).
     *
     * Use a {@link CanonicalSemanticRole} name (`success`, `info`,
     * `warn`, `danger`, `help`, `contrast`, …) to make the role
     * available to `severity`-aware PrimeVue components. Non-canonical
     * names are still permitted (e.g. an `accent` role for your own
     * utilities) but the validator emits an info-severity issue noting
     * that they won't surface in PrimeVue's `severity` props.
     *
     * The legacy keys `warning` and `error` are accepted as deprecated
     * aliases for `warn` and `danger`; generators canonicalize them
     * before emitting the preset, so the styled output exposes
     * `semantic.warn` / `semantic.danger` regardless of which spelling
     * appeared in the source.
     *
     * @example
     * ```ts
     * extra: {
     *   success: "kale",
     *   warn:    "carrot",
     *   danger:  "beetroot",
     *   info:    "blueberry",
     * }
     * ```
     */
    extra?: Record<string, SemanticScaleRef>;
}

// ---- Preset (PrimeVue base + overrides) ----

/**
 * The four PrimeVue 4 base themes shipped by `@primeuix/themes`.
 * Picked via `preset.base`; controls which preset the generated file
 * imports and extends via `definePreset`.
 */
export type PrimeVueBaseTheme = "aura" | "lara" | "nora" | "material";

/**
 * Canonical list of valid {@link PrimeVueBaseTheme} values. Useful for
 * validation, dropdowns in tooling, etc.
 */
export const PRIMEVUE_BASE_THEMES: readonly PrimeVueBaseTheme[] = [
    "aura",
    "lara",
    "nora",
    "material",
];

/**
 * Free-form overrides passed straight into `definePreset(Base, { ... })`.
 *
 * Anything PrimeVue accepts — `semantic.focusRing`, `semantic.formField`,
 * `components.button`, additional `primitive` entries, etc. — can be
 * placed here. Refs are resolved before deep-merging with the auto-
 * generated preset.
 *
 * For full editor autocomplete on this object, import `defineTokens`
 * from one of the per-base typed entries (`theme-unify/aura`,
 * `theme-unify/lara`, `theme-unify/nora`, `theme-unify/material`),
 * which substitute `DeepTokenValue<Preset<...>>` from
 * `@primeuix/themes/types`. For a custom preset, use the generic
 * `defineTypedTokens<Preset>()` from `theme-unify/typed`.
 *
 * @see Typed entries: `packages/core/src/typed.ts`.
 */
export type PresetOverrides = Record<string, unknown>;

/**
 * PrimeVue preset configuration block.
 */
export interface PresetConfig {
    /**
     * Base PrimeVue theme. Determines which preset is imported and
     * extended via `definePreset`.
     *
     * @defaultValue `"aura"`
     */
    base?: PrimeVueBaseTheme;

    /** Free-form preset overrides. See {@link PresetOverrides}. */
    overrides?: PresetOverrides;
}

// ---- UnoCSS ----

/**
 * A single UnoCSS shortcut entry, split into light- and dark-mode
 * utility strings. The two halves are space-joined into one shortcut
 * value so the dark variant rides along automatically.
 *
 * @example
 * ```ts
 * { light: "bg-surface-50", dark: "dark:bg-surface-950" }
 * // becomes
 * "bg-surface-50 dark:bg-surface-950"
 * ```
 *
 * The `dark:` prefix (or any other variant) must be included in the
 * `dark` string verbatim — the generator does not add it.
 */
export interface UnoCSSShortcut {
    /** Utility classes applied in light mode (no variant prefix). */
    light: string;
    /** Utility classes applied in dark mode (must include `dark:` prefix where needed). */
    dark: string;
}

/**
 * UnoCSS-specific configuration.
 */
export interface UnoCSSConfig {
    /**
     * Named shortcuts. Each entry becomes a `shortcuts:` row in the
     * generated `shortcuts.ts` file with both halves joined.
     */
    shortcuts?: Record<string, UnoCSSShortcut>;
}

// ---- Token Schema (input) ----

/**
 * The complete shape of a `tokens.config.ts`.
 *
 * Use `defineTokens()` to author a config with full type inference.
 * Pass the result directly as the default export.
 *
 * @example
 * ```ts
 * import { defineTokens } from "theme-unify";
 *
 * export default defineTokens({
 *   meta: { name: "My Theme" },
 *   primitive: {
 *     colors: {
 *       brand: { 50: "#…", 100: "#…", ..., 950: "#…" },
 *     },
 *   },
 *   semantic: {
 *     primary: "brand",
 *     surface: { scale: "slate", darkScale: "zinc" },
 *     extra:   { success: "emerald", danger: "red" },
 *   },
 * });
 * ```
 */
export interface ThemeUnifyConfig {
    /** Theme metadata. See {@link MetaConfig}. */
    meta: MetaConfig;
    /** Raw token values. See {@link PrimitiveConfig}. */
    primitive: PrimitiveConfig;
    /** Semantic role mapping. See {@link SemanticConfig}. */
    semantic?: SemanticConfig;
    /** PrimeVue preset config. See {@link PresetConfig}. */
    preset?: PresetConfig;
    /** UnoCSS-specific config. See {@link UnoCSSConfig}. */
    unocss?: UnoCSSConfig;
}

// ---- Resolved (output — refs replaced with literals) ----

/**
 * {@link PresetConfig} after `resolveRefs` — every {@link Ref} inside
 * `overrides` has been replaced with its literal string value.
 */
export interface ResolvedPresetConfig {
    base?: PrimeVueBaseTheme;
    overrides?: PresetOverrides;
}

/**
 * The fully-resolved token tree consumed by every generator.
 *
 * Returned by `resolveRefs`. Generators never see `{ ref: ... }`
 * objects — only their resolved string values.
 */
export interface ResolvedTokens {
    meta: MetaConfig;
    primitive: PrimitiveConfig;
    semantic?: SemanticConfig;
    preset?: ResolvedPresetConfig;
    unocss?: UnoCSSConfig;
}
