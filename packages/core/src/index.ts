/**
 * `theme-unify` — compile a single token definition into a PrimeVue 4
 * theme preset and a matching UnoCSS theme config.
 *
 * ```ts
 * import {
 *   defineTokens,
 *   loadTokens,
 *   resolveRefs,
 *   generatePreset,
 *   generateUnoTheme,
 *   generateShortcuts,
 *   generatePalettes,
 * } from "theme-unify";
 * ```
 *
 * Most consumers only need {@link defineTokens} (in their config file)
 * and the CLI. The programmatic API is exposed for build-tool authors
 * who want to integrate generation into a custom pipeline.
 *
 * @packageDocumentation
 */

// ---- Authoring helpers ----

/** Identity helper that gives a `tokens.config.ts` full type inference. */
export { defineTokens } from "./define-tokens.js";

// ---- Pipeline (load → validate → resolve → generate) ----

/** Load and validate a `tokens.config.ts` from disk. */
export { loadTokens } from "./load-tokens.js";

/** Replace every `{ ref }` in `preset.overrides` with its literal value. */
export { resolveRefs } from "./resolver.js";

/** Statically validate a config; returns issues without throwing. */
export { validateTokens } from "./validator.js";

// ---- Generators ----

/**
 * Generators emit TypeScript source as a string. The CLI writes them to
 * disk via `writeOutput`; programmatic consumers can pipe the strings
 * elsewhere or call the `build*Object` helpers for raw data.
 */
export {
    generatePreset,
    buildPresetObject,
    buildThemeOptions,
    resolveSemanticScale,
} from "./generators/preset.js";
export { generateUnoTheme } from "./generators/uno-theme.js";
export { generateShortcuts } from "./generators/shortcuts.js";
export { generatePalettes, collectPalettes } from "./generators/palettes.js";

/** Pure data describing every palette known to a config. */
export type { PaletteCatalog } from "./generators/palettes.js";

// ---- Builtin palettes ----

/**
 * Tailwind v3 / PrimeUix Aura palettes shipped with theme-unify. Any
 * `SemanticScaleRef` string may name one.
 */
export {
    BUILTIN_PALETTES,
    BUILTIN_PALETTE_NAMES,
    isBuiltinPalette,
    resolveScale,
} from "./builtin-palettes.js";
export type { BuiltinPaletteName } from "./builtin-palettes.js";

// ---- Errors ----

export {
    CircularReferenceError,
    UnresolvedRefError,
    TokenValidationError,
} from "./errors.js";
export type { ValidationIssue } from "./errors.js";

// ---- Types ----

export type {
    ThemeUnifyConfig,
    ColorStep,
    ColorScale,
    Ref,
    TokenValue,
    MetaConfig,
    PrimitiveConfig,
    SemanticConfig,
    SemanticScaleRef,
    SemanticSurfaceConfig,
    PresetConfig,
    PresetOverrides,
    UnoCSSConfig,
    UnoCSSShortcut,
    ResolvedTokens,
    ResolvedPresetConfig,
    PrimeVueBaseTheme,
    TypographyTokens,
    CanonicalSemanticRole,
    TransitionsTokens,
} from "./types.js";

export { COLOR_STEPS, PRIMEVUE_BASE_THEMES, CANONICAL_SEMANTIC_ROLES, isRef } from "./types.js";
