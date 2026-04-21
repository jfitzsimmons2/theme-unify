/**
 * `theme-unify/material` — typed authoring entry pre-bound to the
 * PrimeUix Material preset.
 *
 * @packageDocumentation
 */

import type { Preset } from "@primeuix/themes/types";
import type { MaterialBaseDesignTokens } from "@primeuix/themes/material/base";

import {
    defineTypedTokens,
    type TypedThemeUnifyConfig,
    type TypedPresetOverrides,
} from "./typed.js";

/** Material preset shape (`Preset<MaterialBaseDesignTokens>`). */
export type MaterialPreset = Preset<MaterialBaseDesignTokens>;

/** {@link TypedThemeUnifyConfig} pre-bound to the Material preset. */
export type MaterialTokensConfig = TypedThemeUnifyConfig<MaterialPreset>;

/** {@link TypedPresetOverrides} pre-bound to the Material preset. */
export type MaterialPresetOverrides = TypedPresetOverrides<MaterialPreset>;

/**
 * Identity helper for `tokens.config.ts` with full autocomplete on
 * `preset.overrides` against the Material preset.
 */
export function defineTokens<T extends MaterialTokensConfig>(schema: T): T {
    return defineTypedTokens<MaterialPreset, T>(schema);
}

export type { TypedThemeUnifyConfig, TypedPresetOverrides, DeepTokenValue } from "./typed.js";
