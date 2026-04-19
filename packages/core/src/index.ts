// Public API
export { defineTokens } from "./define-tokens.js";
export { loadTokens } from "./load-tokens.js";
export { resolveRefs } from "./resolver.js";
export { validateTokens } from "./validator.js";
export {
    generatePreset,
    buildPresetObject,
    resolveSemanticScale,
} from "./generators/preset.js";
export { generateUnoTheme } from "./generators/uno-theme.js";
export { generateShortcuts } from "./generators/shortcuts.js";
export {
    BUILTIN_PALETTES,
    BUILTIN_PALETTE_NAMES,
    isBuiltinPalette,
    resolveScale,
} from "./builtin-palettes.js";
export type { BuiltinPaletteName } from "./builtin-palettes.js";

// Types
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
} from "./types.js";

export { COLOR_STEPS, PRIMEVUE_BASE_THEMES, isRef } from "./types.js";
