import type { ResolvedTokens } from "../types.js";
import { COLOR_STEPS } from "../types.js";
import {
    fileHeader,
    serializeValue,
    canonicalizeSemanticRole,
    toKebabCase,
} from "./utils.js";
import { collectEffectiveBuiltins } from "../effective-builtins.js";

/**
 * Generate UnoCSS theme entries that point at the `--p-*` CSS variables
 * PrimeVue emits. Brand-color or surface edits to the PrimeVue preset
 * propagate to UnoCSS utilities at runtime — no rebuild required.
 *
 * Emitted exports: `darkMode`, `colors`, `spacing`, `borderRadius`,
 * `boxShadow`, `fontFamily`, `fontSize`, `lineHeight`, `fontWeight`,
 * `breakpoints`, `zIndex`, `transitionProperty`, `transitionDuration`,
 * `transitionTimingFunction`, `animation`. **All exports are always
 * emitted** so consumers can statically import every name; sections
 * whose primitive block is absent are emitted as empty `{}` (or `""`
 * for the typography scalars). `darkMode` reflects
 * `meta.darkModeStrategy` and defaults to `'class'`.
 *
 * The `colors` export contains: every user-defined palette in
 * `primitive.colors`, plus the subset of builtin palettes that are
 * either referenced via `semantic` or opted in via
 * `unocss.includeBuiltinPalettes`. Builtins are exposed as
 * `var(--p-{name}-{step})` references — the preset emits the matching
 * CSS variables. Set `unocss.includeBuiltinPalettes: true` to expose
 * every shipped builtin, or pass an array to opt in a subset.
 */
export function generateUnoTheme(resolved: ResolvedTokens): string {
    const sections: string[] = [fileHeader({ meta: resolved.meta })];

    // ----- darkMode -----
    const strategy = resolved.meta.darkModeStrategy ?? "class";
    sections.push(
        `export const darkMode = ${strategy === "media" ? "'media'" : "'class'"} as const;`,
    );
    sections.push("");

    // ----- colors -----
    // Export keys and the embedded `var(--p-{name}-{step})` references
    // are kebab-cased so they line up with the CSS variables PrimeUix's
    // `toVariables` actually emits (it kebab-cases every key as it walks
    // the preset). User palettes may be authored in camelCase
    // (e.g. `eggplantPurple`); the resulting UnoCSS class fragment is
    // `bg-eggplant-purple-500`.
    const colors: Record<string, Record<string, string>> = {};

    // Every user palette → bg-{kebab(name)}-{step} resolves to
    // var(--p-{kebab(name)}-{step})
    for (const name of Object.keys(resolved.primitive.colors)) {
        const key = toKebabCase(name);
        colors[key] = scaleVarObject(key);
    }

    // Builtins that are referenced via semantic OR opted into via
    // `unocss.includeBuiltinPalettes`. Both flow through the preset as
    // `--p-{name}-{step}` CSS variables, so we reference them the same
    // way as user palettes. Builtin names are already lowercase, but
    // run them through the same kebab helper for consistency.
    for (const name of collectEffectiveBuiltins(resolved)) {
        const key = toKebabCase(name);
        if (colors[key]) continue;
        colors[key] = scaleVarObject(key);
    }

    // Semantic roles
    if (resolved.semantic?.primary !== undefined) {
        colors["primary"] = scaleVarObject("primary");
    }
    if (resolved.semantic?.extra) {
        for (const role of Object.keys(resolved.semantic.extra)) {
            const canonical = toKebabCase(canonicalizeSemanticRole(role));
            colors[canonical] = scaleVarObject(canonical);
        }
    }

    // Surface (semantic.colorScheme.{light,dark}.surface)
    if (resolved.semantic?.surface) {
        colors["surface"] = surfaceVarObject();
    }

    sections.push(`export const colors = ${serializeValue(colors, 0)} as const;`);
    sections.push("");

    // ----- spacing -----
    const spacing: Record<string, string> = {};
    if (resolved.primitive.spacing) {
        for (const key of Object.keys(resolved.primitive.spacing)) {
            const k = toKebabCase(key);
            spacing[k] = `var(--p-spacing-${k})`;
        }
    }
    sections.push(`export const spacing = ${serializeValue(spacing, 0)} as const;`);
    sections.push("");

    // ----- borderRadius -----
    const borderRadius: Record<string, string> = {};
    if (resolved.primitive.radii) {
        for (const key of Object.keys(resolved.primitive.radii)) {
            const k = toKebabCase(key);
            borderRadius[k] = `var(--p-border-radius-${k})`;
        }
    }
    sections.push(
        `export const borderRadius = ${serializeValue(borderRadius, 0)} as const;`,
    );
    sections.push("");

    // ----- boxShadow -----
    const boxShadow: Record<string, string> = {};
    if (resolved.primitive.shadows) {
        for (const key of Object.keys(resolved.primitive.shadows)) {
            const k = toKebabCase(key);
            boxShadow[k] = `var(--p-shadow-${k})`;
        }
    }
    sections.push(
        `export const boxShadow = ${serializeValue(boxShadow, 0)} as const;`,
    );
    sections.push("");

    // ----- fontFamily -----
    const fontFamily: Record<string, string> = resolved.primitive.typography?.fontFamily
        ? { sans: "var(--p-font-family)" }
        : {};
    sections.push(
        `export const fontFamily = ${serializeValue(fontFamily, 0)} as const;`,
    );
    sections.push("");

    // ----- fontSize / lineHeight -----
    const t = resolved.primitive.typography;
    const fontSize: Record<string, string | [string, string]> = {};
    const lineHeight: Record<string, string> = {};
    if (t?.baseFontSize || t?.baseLineHeight) {
        fontSize["base"] = t?.baseLineHeight
            ? ["var(--p-font-size)", "var(--p-font-line-height)"]
            : "var(--p-font-size)";
        if (t?.baseLineHeight) {
            lineHeight["base"] = "var(--p-font-line-height)";
        }
    }
    sections.push(`export const fontSize = ${serializeValue(fontSize, 0)} as const;`);
    sections.push("");
    sections.push(
        `export const lineHeight = ${serializeValue(lineHeight, 0)} as const;`,
    );
    sections.push("");

    // ----- fontWeight -----
    const fontWeight: Record<string, string> = {};
    if (resolved.primitive.fontWeight) {
        for (const key of Object.keys(resolved.primitive.fontWeight)) {
            const k = toKebabCase(key);
            fontWeight[k] = `var(--p-font-weight-${k})`;
        }
    }
    sections.push(
        `export const fontWeight = ${serializeValue(fontWeight, 0)} as const;`,
    );
    sections.push("");

    // ----- breakpoints / zIndex / transitions / animations -----
    // These export literal values (not `--p-*` vars) — UnoCSS consumes
    // them directly at build time, and PrimeVue components either don't
    // care (breakpoints/transitions/animations) or read them via
    // `semantic.zIndex` (handled in the preset generator).
    sections.push(
        `export const breakpoints = ${serializeValue(resolved.primitive.breakpoints ?? {}, 0)} as const;`,
    );
    sections.push("");

    sections.push(
        `export const zIndex = ${serializeValue(resolved.primitive.zIndex ?? {}, 0)} as const;`,
    );
    sections.push("");

    const tr = resolved.primitive.transitions;
    sections.push(
        `export const transitionProperty = ${serializeValue(tr?.property ?? {}, 0)} as const;`,
    );
    sections.push("");
    sections.push(
        `export const transitionDuration = ${serializeValue(tr?.duration ?? {}, 0)} as const;`,
    );
    sections.push("");
    sections.push(
        `export const transitionTimingFunction = ${serializeValue(tr?.timingFunction ?? {}, 0)} as const;`,
    );
    sections.push("");

    sections.push(
        `export const animation = ${serializeValue(resolved.primitive.animations ?? {}, 0)} as const;`,
    );
    sections.push("");

    return sections.join("\n");
}

function scaleVarObject(name: string): Record<string, string> {
    const obj: Record<string, string> = {};
    for (const step of COLOR_STEPS) {
        obj[String(step)] = `var(--p-${name}-${step})`;
    }
    return obj;
}

function surfaceVarObject(): Record<string, string> {
    const obj: Record<string, string> = { "0": "var(--p-surface-0)" };
    for (const step of COLOR_STEPS) {
        obj[String(step)] = `var(--p-surface-${step})`;
    }
    return obj;
}
