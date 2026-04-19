// Public API
export { defineTokens } from "./define-tokens.js";
export { loadTokens } from "./load-tokens.js";
export { resolveRefs } from "./resolver.js";
export { validateTokens } from "./validator.js";
export {
    generatePrimeVue,
    buildPrimeVuePreset,
} from "./generators/primevue.js";
export { generateUnoCSS } from "./generators/unocss-theme.js";
export { generateShortcuts } from "./generators/unocss-shortcuts.js";
export {
    generatePrimeVuePT,
    buildPrimeVuePTObject,
} from "./generators/primevue-pt.js";
export {
    BUILTIN_PALETTES,
    BUILTIN_PALETTE_NAMES,
    isBuiltinPalette,
    resolveScale,
} from "./builtin-palettes.js";
export type { BuiltinPaletteName } from "./builtin-palettes.js";

// Types
export type {
    TokenSchema,
    AutoTokenSchema,
    PTSeverityClassMap,
    PTSurfaceClassMap,
    ColorStep,
    ColorScale,
    Ref,
    TokenValue,
    MetaConfig,
    PrimitiveConfig,
    SemanticConfig,
    PrimeVueConfig,
    PrimeVueOverrides,
    UnoCSSConfig,
    UnoCSSShortcut,
    ResolvedTokens,
    ResolvedAutoTokens,
    ResolvedPrimeVueConfig,
    ResolvedPrimeVueOverrides,
    PrimeVueBaseTheme,
    TypographyTokens,
    SemanticColorMapping,
    SemanticRefMapping,
    SemanticSurfaceConfig,
} from "./types.js";

export { COLOR_STEPS, PRIMEVUE_BASE_THEMES, isRef } from "./types.js";
