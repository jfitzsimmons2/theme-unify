// ---- Color Steps ----
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

export const COLOR_STEPS: readonly ColorStep[] = [
    50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
];

export type ColorScale = Record<ColorStep, string>;

// ---- Ref ----
export interface Ref {
    ref: string;
}

export type TokenValue = string | Ref;

export function isRef(value: unknown): value is Ref {
    return (
        typeof value === "object" &&
        value !== null &&
        "ref" in value &&
        typeof (value as Ref).ref === "string"
    );
}

// ---- Meta ----
export interface MetaConfig {
    name: string;
    /** CSS selector PrimeVue/UnoCSS use to switch into dark mode (default: ".dark"). */
    darkModeSelector?: string;
}

// ---- Primitive ----
export interface TypographyTokens {
    fontFamily: string;
    baseFontSize?: string;
    baseLineHeight?: string;
}

export interface PrimitiveConfig {
    colors: Record<string, ColorScale>;
    spacing?: Record<string, string>;
    radii?: Record<string, string>;
    shadows?: Record<string, string>;
    typography?: TypographyTokens;
    fontWeight?: Record<string, string>;
}

// ---- Semantic ----
/**
 * A semantic role can either point to a named scale (user-defined or builtin)
 * or supply a full literal scale inline.
 */
export type SemanticScaleRef = string | ColorScale;

export interface SemanticSurfaceConfig {
    scale: SemanticScaleRef;
    darkScale?: SemanticScaleRef;
}

export interface SemanticConfig {
    /** Brand color. Drives PrimeVue `semantic.primary.{step}` and UnoCSS `var(--p-primary-*)`. */
    primary?: SemanticScaleRef;
    /** Surface scale (light) and optional darkScale; emitted under colorScheme. */
    surface?: SemanticSurfaceConfig;
    /**
     * Additional semantic roles — each emitted as a custom semantic scale
     * (e.g. `success`, `warn`, `danger`, `info`). PrimeVue exposes them as
     * `--p-{role}-{step}`.
     */
    extra?: Record<string, SemanticScaleRef>;
}

// ---- Preset (PrimeVue base + overrides) ----
export type PrimeVueBaseTheme = "aura" | "lara" | "nora" | "material";

export const PRIMEVUE_BASE_THEMES: readonly PrimeVueBaseTheme[] = [
    "aura",
    "lara",
    "nora",
    "material",
];

/**
 * Free-form overrides passed straight into `definePreset(Base, { ... })`.
 * Anything PrimeVue accepts (focusRing, formField, components, colorScheme,
 * extra primitive entries, ...) can live here. Refs are still resolved.
 */
export type PresetOverrides = Record<string, unknown>;

export interface PresetConfig {
    base?: PrimeVueBaseTheme;
    overrides?: PresetOverrides;
}

// ---- UnoCSS ----
export interface UnoCSSShortcut {
    light: string;
    dark: string;
}

export interface UnoCSSConfig {
    shortcuts?: Record<string, UnoCSSShortcut>;
}

// ---- Token Schema (input) ----
export interface ThemeUnifyConfig {
    meta: MetaConfig;
    primitive: PrimitiveConfig;
    semantic?: SemanticConfig;
    preset?: PresetConfig;
    unocss?: UnoCSSConfig;
}

// ---- Resolved (output — refs replaced with literals) ----
export interface ResolvedPresetConfig {
    base?: PrimeVueBaseTheme;
    overrides?: PresetOverrides;
}

export interface ResolvedTokens {
    meta: MetaConfig;
    primitive: PrimitiveConfig;
    semantic?: SemanticConfig;
    preset?: ResolvedPresetConfig;
    unocss?: UnoCSSConfig;
}
