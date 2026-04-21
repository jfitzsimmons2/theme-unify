/**
 * `theme-unify/aura` — typed authoring entry pre-bound to the
 * PrimeUix Aura preset.
 *
 * ```ts
 * import { defineTokens } from "theme-unify/aura";
 *
 * export default defineTokens({
 *   // ...full PrimeVue autocomplete on preset.overrides
 * });
 * ```
 *
 * Requires `@primeuix/themes` to be installed (declared as an optional
 * peer dependency of `theme-unify`).
 *
 * @packageDocumentation
 */

import type { Preset } from "@primeuix/themes/types";
import type { AuraBaseDesignTokens } from "@primeuix/themes/aura/base";

import {
    defineTypedTokens,
    type TypedThemeUnifyConfig,
    type TypedPresetOverrides,
} from "./typed.js";

/** Aura preset shape (`Preset<AuraBaseDesignTokens>`). */
export type AuraPreset = Preset<AuraBaseDesignTokens>;

/** {@link TypedThemeUnifyConfig} pre-bound to the Aura preset. */
export type AuraTokensConfig = TypedThemeUnifyConfig<AuraPreset>;

/** {@link TypedPresetOverrides} pre-bound to the Aura preset. */
export type AuraPresetOverrides = TypedPresetOverrides<AuraPreset>;

/**
 * Identity helper for `tokens.config.ts` with full autocomplete on
 * `preset.overrides` against the Aura preset.
 */
export function defineTokens<T extends AuraTokensConfig>(schema: T): T {
    return defineTypedTokens<AuraPreset, T>(schema);
}

export type { TypedThemeUnifyConfig, TypedPresetOverrides, DeepTokenValue } from "./typed.js";
