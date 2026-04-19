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
  darkModeStrategy: "class" | "media";
  darkModeSelector: string;
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
export interface SemanticColorMapping {
  scale: string;
}

export interface SemanticRefMapping {
  ref: string;
}

export interface SemanticSurfaceConfig {
  scale: string;
  darkScale?: string;
  invertInDarkMode?: boolean;
}

export interface SemanticConfig {
  colors?: Record<string, SemanticColorMapping>;
  backgrounds?: Record<string, SemanticRefMapping>;
  surface?: SemanticSurfaceConfig;
}

// ---- PrimeVue ----
export type PrimeVueBaseTheme = "aura" | "lara" | "nora" | "material";

export const PRIMEVUE_BASE_THEMES: readonly PrimeVueBaseTheme[] = [
  "aura",
  "lara",
  "nora",
  "material",
];

export interface PrimeVueConfig {
  base: PrimeVueBaseTheme;
  colorScheme?: {
    light?: Record<string, Record<string, TokenValue>>;
    dark?: Record<string, Record<string, TokenValue>>;
  };
  focusRing?: Record<string, TokenValue>;
  formField?: Record<string, TokenValue>;
  components?: Record<string, unknown>;
}

/**
 * Lightweight PrimeVue overrides — used when the user only wants to tweak
 * auto-derived values. The generators will first auto-derive a full
 * PrimeVue config from semantic tokens, then deep-merge these overrides.
 */
export interface PrimeVueOverrides {
  focusRing?: Record<string, TokenValue>;
  formField?: Record<string, TokenValue>;
  components?: Record<string, unknown>;
  colorScheme?: {
    light?: Record<string, Record<string, TokenValue>>;
    dark?: Record<string, Record<string, TokenValue>>;
  };
}

// ---- UnoCSS ----
export interface UnoCSSShortcut {
  light: string;
  dark: string;
}

export interface UnoCSSConfig {
  colorAliases?: Record<string, string>;
  shortcuts?: Record<string, UnoCSSShortcut>;
  extraShortcuts?: Record<string, UnoCSSShortcut>;
}

// ---- Token Schema (input) ----
export interface TokenSchema {
  meta: MetaConfig;
  primitive: PrimitiveConfig;
  semantic?: SemanticConfig;
  primevue?: PrimeVueConfig;
  unocss?: UnoCSSConfig;
}

/**
 * Simplified token schema that auto-derives PrimeVue and UnoCSS configs
 * from semantic tokens, with optional overrides.
 */
export interface AutoTokenSchema {
  meta: MetaConfig;
  primitive: PrimitiveConfig;
  semantic: SemanticConfig;
  primevue?: {
    base?: PrimeVueBaseTheme;
    overrides?: PrimeVueOverrides;
  };
  unocss?: {
    colorAliases?: Record<string, string>;
    extraShortcuts?: Record<string, UnoCSSShortcut>;
  };
}

// ---- Resolved types (output — all refs replaced with string) ----
export interface ResolvedPrimeVueConfig {
  base: PrimeVueBaseTheme;
  colorScheme?: {
    light?: Record<string, Record<string, string>>;
    dark?: Record<string, Record<string, string>>;
  };
  focusRing?: Record<string, string>;
  formField?: Record<string, string>;
  components?: Record<string, unknown>;
}

export interface ResolvedPrimeVueOverrides {
  focusRing?: Record<string, string>;
  formField?: Record<string, string>;
  components?: Record<string, unknown>;
  colorScheme?: {
    light?: Record<string, Record<string, string>>;
    dark?: Record<string, Record<string, string>>;
  };
}

export interface ResolvedTokens {
  meta: MetaConfig;
  primitive: PrimitiveConfig;
  semantic?: SemanticConfig;
  primevue?: ResolvedPrimeVueConfig;
  unocss?: UnoCSSConfig;
}

export interface ResolvedAutoTokens {
  meta: MetaConfig;
  primitive: PrimitiveConfig;
  semantic: SemanticConfig;
  primevue?: {
    base?: PrimeVueBaseTheme;
    overrides?: ResolvedPrimeVueOverrides;
  };
  unocss?: {
    colorAliases?: Record<string, string>;
    extraShortcuts?: Record<string, UnoCSSShortcut>;
  };
}

// ---- PT (Passthrough) internal types ----

/**
 * Maps a severity role to its UnoCSS class strings for filled/outlined/subtle variants.
 * Internal to the PT generator — not exported as user-facing config.
 */
export interface PTSeverityClassMap {
  /** Filled background (e.g. "bg-beetroot-500") */
  bg: string;
  /** Hover state filled background */
  bgHover: string;
  /** Active state filled background */
  bgActive: string;
  /** Text color on filled background */
  text: string;
  /** Border color for filled variant */
  border: string;
  /** Subtle/tinted background for outlined/text variants */
  bgSubtle: string;
  /** Text color for outlined/text variants */
  textSubtle: string;
  /** Border color for outlined variants */
  borderSubtle: string;
}

/**
 * Maps surface/page/elevated background class strings.
 * Internal to the PT generator — not exported as user-facing config.
 */
export interface PTSurfaceClassMap {
  pageBg: string;
  surfaceBg: string;
  elevatedBg: string;
  cardBg: string;
  text: string;
  textMuted: string;
  border: string;
  inputBg: string;
  inputBorder: string;
  inputBorderHover: string;
  inputBorderFocus: string;
}
