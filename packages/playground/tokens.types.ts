import type { AutoTokenSchema, BuiltinPaletteName, Ref } from "theme-unify";
import type { ComponentsDesignTokens, Preset } from "@primeuix/themes/types";
import type { AuraBaseDesignTokens } from "@primeuix/themes/aura/base";

/**
 * Recursively widens every `string` leaf to `string | Ref` so theme-unify
 * cross-references (`{ ref: "radii.sm" }`) remain valid wherever PrimeVue
 * design-token types expect a string. Other primitive leaves
 * (numbers, booleans, etc.) are preserved as-is.
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
type AuraSemantic = NonNullable<AuraPreset["semantic"]>;

export type TypedFocusRing = DeepTokenValue<NonNullable<AuraSemantic["focusRing"]>>;
export type TypedFormField = DeepTokenValue<NonNullable<AuraSemantic["formField"]>>;
export type TypedComponents = DeepTokenValue<ComponentsDesignTokens>;
export type TypedColorScheme = DeepTokenValue<NonNullable<AuraSemantic["colorScheme"]>>;

export interface TypedPrimeVueOverrides {
    focusRing?: Partial<TypedFocusRing>;
    formField?: Partial<TypedFormField>;
    components?: TypedComponents;
    colorScheme?: TypedColorScheme;
}

export type TypedAutoTokenSchema = Omit<AutoTokenSchema, "primevue" | "semantic"> & {
    primevue?: {
        base?: NonNullable<AutoTokenSchema["primevue"]>["base"];
        overrides?: TypedPrimeVueOverrides;
    };
    semantic: TypedSemanticConfig;
};

/**
 * Widen `scale` fields with a `BuiltinPaletteName` union so editors
 * autocomplete builtin palettes (purple, sky, indigo, …) alongside any
 * user-defined primitive color keys. Plain `string` is still accepted for
 * user-defined names that aren't part of the builtin set.
 */
type ScaleName = BuiltinPaletteName | (string & {});

export interface TypedSemanticColorMapping {
    scale: ScaleName;
}

export interface TypedSemanticSurfaceConfig {
    scale: ScaleName;
    darkScale?: ScaleName;
    invertInDarkMode?: boolean;
}

type BaseSemantic = NonNullable<AutoTokenSchema["semantic"]>;
export type TypedSemanticConfig = Omit<BaseSemantic, "colors" | "surface"> & {
    colors?: Record<string, TypedSemanticColorMapping>;
    surface?: TypedSemanticSurfaceConfig;
};

export function defineTypedTokens<T extends TypedAutoTokenSchema>(schema: T): T {
    return schema;
}
