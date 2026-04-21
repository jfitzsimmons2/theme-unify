/**
 * Typed authoring entry — `theme-unify/typed`.
 *
 * Provides {@link defineTypedTokens}, a generic version of
 * {@link defineTokens} that accepts a PrimeUix `Preset<...>` type
 * argument and uses it to type `preset.overrides` end-to-end.
 *
 * Type-only — no runtime cost beyond the identity function. The
 * `@primeuix/themes` package is not imported here; consumers either
 * supply their own preset type, or import a pre-bound helper from one
 * of the per-base subpaths (`theme-unify/aura`, `theme-unify/lara`,
 * `theme-unify/nora`, `theme-unify/material`).
 *
 * @example
 * ```ts
 * import { defineTypedTokens } from "@jfitzsimmons2/theme-unify/typed";
 * import type { Preset } from "@primeuix/themes/types";
 * import type { AuraBaseDesignTokens } from "@primeuix/themes/aura/base";
 *
 * type AuraPreset = Preset<AuraBaseDesignTokens>;
 *
 * export default defineTypedTokens<AuraPreset>({ ... });
 * ```
 *
 * @packageDocumentation
 */

import type { BuiltinPaletteName } from "./builtin-palettes.js";
import type {
    ColorScale,
    PrimeVueBaseTheme,
    Ref,
    ThemeUnifyConfig,
} from "./types.js";

/**
 * Recursively widens every `string` leaf to `string | Ref` so
 * theme-unify cross-references (`{ ref: "radii.sm" }`) remain valid
 * wherever PrimeVue design-token types expect a string.
 */
export type DeepTokenValue<T> = T extends string
    ? string | Ref
    : T extends number | boolean | bigint | symbol | null | undefined
    ? T
    : T extends (...args: never[]) => unknown
    ? T
    : T extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepTokenValue<U>>
    : T extends object
    ? { [K in keyof T]: DeepTokenValue<T[K]> }
    : T;

/**
 * `preset.overrides` widened with refs at every string leaf, given a
 * PrimeUix `Preset<...>` type argument. Use directly or via
 * {@link TypedThemeUnifyConfig}.
 */
export type TypedPresetOverrides<Preset> = DeepTokenValue<Preset>;

/** Either a built-in palette name, a user-defined scale name, or an inline {@link ColorScale}. */
type ScaleNameOrInline = BuiltinPaletteName | (string & {}) | ColorScale;

/** {@link ThemeUnifyConfig.semantic.surface} with palette-name autocomplete. */
export interface TypedSemanticSurfaceConfig {
    scale: ScaleNameOrInline;
    darkScale?: ScaleNameOrInline;
}

/** {@link ThemeUnifyConfig.semantic} with palette-name autocomplete. */
export interface TypedSemanticConfig {
    primary?: ScaleNameOrInline;
    surface?: TypedSemanticSurfaceConfig;
    extra?: Record<string, ScaleNameOrInline>;
}

/**
 * {@link ThemeUnifyConfig} with `preset.overrides` typed against a
 * caller-supplied PrimeUix `Preset<...>` type and `semantic` widened
 * for palette-name autocomplete.
 */
export type TypedThemeUnifyConfig<Preset> = Omit<
    ThemeUnifyConfig,
    "preset" | "semantic"
> & {
    semantic?: TypedSemanticConfig;
    preset?: {
        base?: PrimeVueBaseTheme;
        overrides?: TypedPresetOverrides<Preset>;
    };
};

/**
 * Identity helper that gives a `tokens.config.ts` full type inference
 * including `preset.overrides`. Pass the PrimeUix preset type as the
 * first generic argument.
 *
 * For a per-base pre-bound version, import `defineTokens` from one of
 * the sugar entries: `theme-unify/aura`, `/lara`, `/nora`,
 * `/material`.
 */
export function defineTypedTokens<
    Preset,
    T extends TypedThemeUnifyConfig<Preset> = TypedThemeUnifyConfig<Preset>,
>(schema: T): T {
    return schema;
}
