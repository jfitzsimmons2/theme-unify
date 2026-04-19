import type {
    ResolvedTokens,
    ColorScale,
    SemanticScaleRef,
    PrimitiveConfig,
} from "../types.js";
import { COLOR_STEPS } from "../types.js";
import { fileHeader, serializeValue } from "./utils.js";
import { resolveScale } from "../builtin-palettes.js";

const BASE_THEME_IMPORTS: Record<string, string> = {
    aura: "@primeuix/themes/aura",
    lara: "@primeuix/themes/lara",
    nora: "@primeuix/themes/nora",
    material: "@primeuix/themes/material",
};

const BASE_THEME_NAMES: Record<string, string> = {
    aura: "Aura",
    lara: "Lara",
    nora: "Nora",
    material: "Material",
};

/**
 * Generate the source for `definePreset(Base, { ... })`. PrimeVue is the
 * runtime source of truth: every token here will be emitted as a `--p-*`
 * CSS variable consumed by both PrimeVue components and UnoCSS utilities.
 */
export function generatePreset(resolved: ResolvedTokens): string {
    const base = resolved.preset?.base ?? "aura";
    const importPath = BASE_THEME_IMPORTS[base];
    const baseName = BASE_THEME_NAMES[base];

    const presetObj = buildPresetObject(resolved);

    return [
        fileHeader(),
        `import { definePreset } from '@primeuix/themes';`,
        `import ${baseName} from '${importPath}';`,
        "",
        `export const GeneratedPreset = definePreset(${baseName}, ${serializeValue(presetObj, 0)});`,
        "",
    ].join("\n");
}

/**
 * Build the raw preset configuration object passed as the second argument
 * to `definePreset(Base, ...)`. Exposed for tests and runtime use.
 */
export function buildPresetObject(resolved: ResolvedTokens): Record<string, unknown> {
    const primitive: Record<string, unknown> = {};
    const semantic: Record<string, unknown> = {};
    const result: Record<string, unknown> = {};

    // ----- primitive: every user palette becomes --p-{name}-{step} -----
    for (const [name, scale] of Object.entries(resolved.primitive.colors)) {
        primitive[name] = scaleToObject(scale);
    }

    // primitive non-color tokens → --p-spacing-md, --p-shadow-sm, etc.
    if (resolved.primitive.spacing) {
        primitive["spacing"] = { ...resolved.primitive.spacing };
    }
    if (resolved.primitive.radii) {
        // Merge into PrimeVue's existing borderRadius primitive.
        primitive["borderRadius"] = { ...resolved.primitive.radii };
    }
    if (resolved.primitive.shadows) {
        primitive["shadow"] = { ...resolved.primitive.shadows };
    }
    if (resolved.primitive.fontWeight) {
        primitive["fontWeight"] = { ...resolved.primitive.fontWeight };
    }
    if (resolved.primitive.typography) {
        const t = resolved.primitive.typography;
        const font: Record<string, string> = {};
        if (t.fontFamily) font["family"] = t.fontFamily;
        if (t.baseFontSize) font["size"] = t.baseFontSize;
        if (t.baseLineHeight) font["lineHeight"] = t.baseLineHeight;
        if (Object.keys(font).length > 0) {
            primitive["font"] = font;
        }
    }

    // ----- semantic: primary + extra roles emit --p-{role}-{step} -----
    if (resolved.semantic?.primary !== undefined) {
        semantic["primary"] = scaleRefToReferenceObject(
            resolved.semantic.primary,
            resolved.primitive,
        );
    }

    if (resolved.semantic?.extra) {
        for (const [role, ref] of Object.entries(resolved.semantic.extra)) {
            semantic[role] = scaleRefToReferenceObject(ref, resolved.primitive);
        }
    }

    // ----- colorScheme.{light,dark}.surface -----
    if (resolved.semantic?.surface) {
        const colorScheme: Record<string, Record<string, unknown>> = {
            light: {},
            dark: {},
        };
        const lightSurface = scaleRefToSurfaceObject(
            resolved.semantic.surface.scale,
            resolved.primitive,
            "light",
        );
        const darkRef =
            resolved.semantic.surface.darkScale ?? resolved.semantic.surface.scale;
        const darkSurface = scaleRefToSurfaceObject(
            darkRef,
            resolved.primitive,
            "dark",
        );
        colorScheme["light"]["surface"] = lightSurface;
        colorScheme["dark"]["surface"] = darkSurface;
        semantic["colorScheme"] = colorScheme;
    }

    if (Object.keys(primitive).length > 0) result["primitive"] = primitive;
    if (Object.keys(semantic).length > 0) result["semantic"] = semantic;

    // ----- merge user overrides last so they win -----
    const overrides = resolved.preset?.overrides;
    if (overrides && typeof overrides === "object") {
        for (const [key, value] of Object.entries(overrides)) {
            const existing = result[key];
            if (
                existing &&
                typeof existing === "object" &&
                !Array.isArray(existing) &&
                value &&
                typeof value === "object" &&
                !Array.isArray(value)
            ) {
                result[key] = deepMerge(
                    existing as Record<string, unknown>,
                    value as Record<string, unknown>,
                );
            } else {
                result[key] = value;
            }
        }
    }

    return result;
}

// ----- helpers -----

function scaleToObject(scale: ColorScale): Record<string, string> {
    const obj: Record<string, string> = {};
    for (const step of COLOR_STEPS) {
        if (scale[step] !== undefined) obj[String(step)] = scale[step];
    }
    return obj;
}

/**
 * Resolve a SemanticScaleRef to a PrimeVue-style reference object so the
 * preset stays linked to primitive tokens (changing the primitive scale
 * propagates automatically).
 *
 * - String name → `{ 50: "{name.50}", ..., 950: "{name.950}" }`
 * - Inline scale → `{ 50: "#hex", ..., 950: "#hex" }`
 */
function scaleRefToReferenceObject(
    ref: SemanticScaleRef,
    prim: PrimitiveConfig,
): Record<string, string> {
    if (typeof ref === "string") {
        const obj: Record<string, string> = {};
        for (const step of COLOR_STEPS) {
            obj[String(step)] = `{${ref}.${step}}`;
        }
        return obj;
    }
    // inline scale
    const _ = prim; // referenced to keep parity with future inline-resolution needs
    void _;
    return scaleToObject(ref);
}

/**
 * Build a colorScheme.{light|dark}.surface object. Index `0` follows the
 * Aura convention: `#ffffff` in BOTH light and dark mode. `surface.0`
 * represents the brightest possible surface — used by components for
 * elements that should pop against a dark background (e.g. switch
 * handles, contrast text), not as a dark page background.
 */
function scaleRefToSurfaceObject(
    ref: SemanticScaleRef,
    prim: PrimitiveConfig,
    mode: "light" | "dark",
): Record<string, string> {
    void mode;
    const obj: Record<string, string> = {};
    obj["0"] = "#ffffff";
    if (typeof ref === "string") {
        for (const step of COLOR_STEPS) {
            obj[String(step)] = `{${ref}.${step}}`;
        }
        return obj;
    }
    void prim;
    for (const step of COLOR_STEPS) {
        if (ref[step] !== undefined) obj[String(step)] = ref[step];
    }
    return obj;
}

function deepMerge(
    target: Record<string, unknown>,
    source: Record<string, unknown>,
): Record<string, unknown> {
    const out = { ...target };
    for (const [key, value] of Object.entries(source)) {
        const existing = out[key];
        if (
            existing &&
            typeof existing === "object" &&
            !Array.isArray(existing) &&
            value &&
            typeof value === "object" &&
            !Array.isArray(value)
        ) {
            out[key] = deepMerge(
                existing as Record<string, unknown>,
                value as Record<string, unknown>,
            );
        } else {
            out[key] = value;
        }
    }
    return out;
}

/**
 * Resolve a SemanticScaleRef to its concrete ColorScale. Used by uno-theme
 * generator to know which scale name a role points at.
 */
export function resolveSemanticScale(
    ref: SemanticScaleRef,
    prim: PrimitiveConfig,
): ColorScale | undefined {
    if (typeof ref === "string") return resolveScale(ref, prim);
    return ref;
}
