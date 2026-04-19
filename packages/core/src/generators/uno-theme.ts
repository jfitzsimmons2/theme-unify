import type { ResolvedTokens } from "../types.js";
import { COLOR_STEPS } from "../types.js";
import { fileHeader, serializeValue } from "./utils.js";
import { isBuiltinPalette } from "../builtin-palettes.js";

/**
 * Generate UnoCSS theme entries that point at the `--p-*` CSS variables
 * PrimeVue emits. Brand-color or surface edits to the PrimeVue preset
 * propagate to UnoCSS utilities at runtime — no rebuild required.
 *
 * Emitted exports: `colors`, `spacing`, `borderRadius`, `boxShadow`,
 * `fontFamily`, `fontSize`, `lineHeight`, `fontWeight`.
 */
export function generateUnoTheme(resolved: ResolvedTokens): string {
    const sections: string[] = [fileHeader()];

    // ----- colors -----
    const colors: Record<string, Record<string, string>> = {};

    // Every user palette → bg-{name}-{step} resolves to var(--p-{name}-{step})
    for (const name of Object.keys(resolved.primitive.colors)) {
        colors[name] = scaleVarObject(name);
    }

    // Builtin palettes referenced via semantic also need to resolve
    const referencedScales = collectReferencedScaleNames(resolved);
    for (const name of referencedScales) {
        if (colors[name]) continue;
        if (isBuiltinPalette(name)) {
            colors[name] = scaleVarObject(name);
        }
    }

    // Semantic roles
    if (resolved.semantic?.primary !== undefined) {
        colors["primary"] = scaleVarObject("primary");
    }
    if (resolved.semantic?.extra) {
        for (const role of Object.keys(resolved.semantic.extra)) {
            colors[role] = scaleVarObject(role);
        }
    }

    // Surface (semantic.colorScheme.{light,dark}.surface)
    if (resolved.semantic?.surface) {
        colors["surface"] = surfaceVarObject();
    }

    sections.push(`export const colors = ${serializeValue(colors, 0)} as const;`);
    sections.push("");

    // ----- spacing -----
    if (resolved.primitive.spacing) {
        const spacing: Record<string, string> = {};
        for (const key of Object.keys(resolved.primitive.spacing)) {
            spacing[key] = `var(--p-spacing-${key})`;
        }
        sections.push(
            `export const spacing = ${serializeValue(spacing, 0)} as const;`,
        );
        sections.push("");
    }

    // ----- borderRadius -----
    if (resolved.primitive.radii) {
        const borderRadius: Record<string, string> = {};
        for (const key of Object.keys(resolved.primitive.radii)) {
            borderRadius[key] = `var(--p-border-radius-${key})`;
        }
        sections.push(
            `export const borderRadius = ${serializeValue(borderRadius, 0)} as const;`,
        );
        sections.push("");
    }

    // ----- boxShadow -----
    if (resolved.primitive.shadows) {
        const boxShadow: Record<string, string> = {};
        for (const key of Object.keys(resolved.primitive.shadows)) {
            boxShadow[key] = `var(--p-shadow-${key})`;
        }
        sections.push(
            `export const boxShadow = ${serializeValue(boxShadow, 0)} as const;`,
        );
        sections.push("");
    }

    // ----- fontFamily -----
    if (resolved.primitive.typography?.fontFamily) {
        sections.push(
            `export const fontFamily = ${serializeValue({ sans: "var(--p-font-family)" }, 0)} as const;`,
        );
        sections.push("");
    }

    // ----- fontSize / lineHeight -----
    const t = resolved.primitive.typography;
    if (t?.baseFontSize || t?.baseLineHeight) {
        const fontSize: Record<string, string | [string, string]> = {
            base: t?.baseLineHeight
                ? ["var(--p-font-size)", "var(--p-font-line-height)"]
                : "var(--p-font-size)",
        };
        sections.push(
            `export const fontSize = ${serializeValue(fontSize, 0)} as const;`,
        );
        sections.push("");
        if (t?.baseLineHeight) {
            sections.push(
                `export const lineHeight = ${serializeValue({ base: "var(--p-font-line-height)" }, 0)} as const;`,
            );
            sections.push("");
        }
    }

    // ----- fontWeight -----
    if (resolved.primitive.fontWeight) {
        const fontWeight: Record<string, string> = {};
        for (const key of Object.keys(resolved.primitive.fontWeight)) {
            fontWeight[key] = `var(--p-font-weight-${key})`;
        }
        sections.push(
            `export const fontWeight = ${serializeValue(fontWeight, 0)} as const;`,
        );
        sections.push("");
    }

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

function collectReferencedScaleNames(resolved: ResolvedTokens): Set<string> {
    const names = new Set<string>();
    const sem = resolved.semantic;
    if (!sem) return names;
    if (typeof sem.primary === "string") names.add(sem.primary);
    if (sem.surface) {
        if (typeof sem.surface.scale === "string") names.add(sem.surface.scale);
        if (typeof sem.surface.darkScale === "string")
            names.add(sem.surface.darkScale);
    }
    if (sem.extra) {
        for (const ref of Object.values(sem.extra)) {
            if (typeof ref === "string") names.add(ref);
        }
    }
    return names;
}
