/**
 * `theme-unify/nora` — typed authoring entry pre-bound to the
 * PrimeUix Nora preset.
 *
 * @packageDocumentation
 */

import type { Preset } from "@primeuix/themes/types";
import type { NoraBaseDesignTokens } from "@primeuix/themes/nora/base";

import {
    defineTypedTokens,
    type TypedThemeUnifyConfig,
    type TypedPresetOverrides,
} from "./typed.js";

/** Nora preset shape (`Preset<NoraBaseDesignTokens>`). */
export type NoraPreset = Preset<NoraBaseDesignTokens>;

/** {@link TypedThemeUnifyConfig} pre-bound to the Nora preset. */
export type NoraTokensConfig = TypedThemeUnifyConfig<NoraPreset>;

/** {@link TypedPresetOverrides} pre-bound to the Nora preset. */
export type NoraPresetOverrides = TypedPresetOverrides<NoraPreset>;

/**
 * Identity helper for `tokens.config.ts` with full autocomplete on
 * `preset.overrides` against the Nora preset.
 */
export function defineTokens<T extends NoraTokensConfig>(schema: T): T {
    return defineTypedTokens<NoraPreset, T>(schema);
}

export type { TypedThemeUnifyConfig, TypedPresetOverrides, DeepTokenValue } from "./typed.js";
