/**
 * `theme-unify/lara` — typed authoring entry pre-bound to the
 * PrimeUix Lara preset.
 *
 * @packageDocumentation
 */

import type { Preset } from "@primeuix/themes/types";
import type { LaraBaseDesignTokens } from "@primeuix/themes/lara/base";

import {
    defineTypedTokens,
    type TypedThemeUnifyConfig,
    type TypedPresetOverrides,
} from "./typed.js";

/** Lara preset shape (`Preset<LaraBaseDesignTokens>`). */
export type LaraPreset = Preset<LaraBaseDesignTokens>;

/** {@link TypedThemeUnifyConfig} pre-bound to the Lara preset. */
export type LaraTokensConfig = TypedThemeUnifyConfig<LaraPreset>;

/** {@link TypedPresetOverrides} pre-bound to the Lara preset. */
export type LaraPresetOverrides = TypedPresetOverrides<LaraPreset>;

/**
 * Identity helper for `tokens.config.ts` with full autocomplete on
 * `preset.overrides` against the Lara preset.
 */
export function defineTokens<T extends LaraTokensConfig>(schema: T): T {
    return defineTypedTokens<LaraPreset, T>(schema);
}

export type { TypedThemeUnifyConfig, TypedPresetOverrides, DeepTokenValue } from "./typed.js";
