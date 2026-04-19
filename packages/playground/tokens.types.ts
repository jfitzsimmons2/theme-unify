import type { ThemeUnifyConfig, BuiltinPaletteName, Ref } from "theme-unify";
import type { Preset } from "@primeuix/themes/types";
import type { AuraBaseDesignTokens } from "@primeuix/themes/aura/base";

/**
 * Recursively widens every `string` leaf to `string | Ref` so theme-unify
 * cross-references (`{ ref: "radii.sm" }`) remain valid wherever PrimeVue
 * design-token types expect a string.
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

type AuraPreset = Preset<AuraBaseDesignTokens>;

/**
 * Aura preset shape with refs allowed at every string leaf — used as the
 * type for `preset.overrides` so editors autocomplete every PrimeVue knob.
 */
export type TypedPresetOverrides = DeepTokenValue<AuraPreset>;

type ScaleName = BuiltinPaletteName | (string & {});

export interface TypedSemanticSurfaceConfig {
    scale: ScaleName | NonNullable<ThemeUnifyConfig["primitive"]["colors"]>[string];
    darkScale?: ScaleName | NonNullable<ThemeUnifyConfig["primitive"]["colors"]>[string];
}

export type TypedSemanticConfig = {
    primary?: ScaleName | NonNullable<ThemeUnifyConfig["primitive"]["colors"]>[string];
    surface?: TypedSemanticSurfaceConfig;
    extra?: Record<string, ScaleName | NonNullable<ThemeUnifyConfig["primitive"]["colors"]>[string]>;
};

export type TypedThemeUnifyConfig = Omit<
    ThemeUnifyConfig,
    "preset" | "semantic"
> & {
    semantic?: TypedSemanticConfig;
    preset?: {
        base?: NonNullable<ThemeUnifyConfig["preset"]>["base"];
        overrides?: TypedPresetOverrides;
    };
};

export function defineTypedTokens<T extends TypedThemeUnifyConfig>(schema: T): T {
    return schema;
}
