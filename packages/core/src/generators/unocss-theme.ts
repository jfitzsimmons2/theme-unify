import type { ResolvedTokens, ResolvedAutoTokens, ColorScale } from "../types.js";
import { COLOR_STEPS } from "../types.js";
import { fileHeader, serializeValue, buildSurfaceObject } from "./utils.js";
import { resolveScale, isBuiltinPalette } from "../builtin-palettes.js";

/** Collect every scale name referenced via semantic (colors + surface). */
function collectReferencedScales(
    resolved: ResolvedTokens | ResolvedAutoTokens,
): Set<string> {
    const names = new Set<string>();
    const sem = resolved.semantic;
    if (sem?.colors) {
        for (const mapping of Object.values(sem.colors)) {
            names.add(mapping.scale);
        }
    }
    if (sem?.surface) {
        names.add(sem.surface.scale);
        if (sem.surface.darkScale) names.add(sem.surface.darkScale);
    }
    return names;
}

function scaleToObject(scale: ColorScale): Record<string, string> {
    const obj: Record<string, string> = {};
    for (const step of COLOR_STEPS) {
        if (scale[step]) obj[String(step)] = scale[step];
    }
    return obj;
}

export function generateUnoCSS(
    resolved: ResolvedTokens | ResolvedAutoTokens,
): string {
    const sections: string[] = [fileHeader()];

    // Colors: all primitive color scales
    const colors: Record<string, Record<string, string>> = {};
    for (const [name, scale] of Object.entries(resolved.primitive.colors)) {
        colors[name] = scaleToObject(scale);
    }

    // Emit referenced builtin palettes that aren't shadowed by user definitions
    for (const name of collectReferencedScales(resolved)) {
        if (colors[name]) continue;
        if (!isBuiltinPalette(name)) continue;
        const scale = resolveScale(name, resolved.primitive);
        if (scale) colors[name] = scaleToObject(scale);
    }

    // Surface: derive from semantic.surface using the shared buildSurfaceObject
    if (resolved.semantic?.surface) {
        const surfaceScale = resolveScale(
            resolved.semantic.surface.scale,
            resolved.primitive,
        );
        if (surfaceScale) {
            colors["surface"] = buildSurfaceObject(surfaceScale, false, "light");
        }
    }

    // Dark surface: derive from semantic.surface.darkScale or inverted
    if (resolved.semantic?.surface) {
        const { scale, darkScale, invertInDarkMode } = resolved.semantic.surface;
        const lightScale = resolveScale(scale, resolved.primitive);
        if (lightScale) {
            let darkSurface: Record<string, string>;
            if (darkScale) {
                const dk = resolveScale(darkScale, resolved.primitive);
                darkSurface = dk
                    ? buildSurfaceObject(dk, false, "dark")
                    : buildSurfaceObject(lightScale, invertInDarkMode ?? false, "dark");
            } else {
                darkSurface = buildSurfaceObject(lightScale, invertInDarkMode ?? false, "dark");
            }
            colors["surface-dark"] = darkSurface;
        }
    }

    // Apply color aliases (from either schema shape)
    const aliases =
        resolved.unocss && "colorAliases" in resolved.unocss
            ? resolved.unocss.colorAliases
            : undefined;
    if (aliases) {
        for (const [alias, target] of Object.entries(aliases)) {
            if (colors[target]) {
                colors[alias] = { ...colors[target] };
            }
        }
    }

    sections.push(`export const colors = ${serializeValue(colors, 0)} as const;`);
    sections.push("");

    // Border radius from radii
    if (resolved.primitive.radii) {
        sections.push(
            `export const borderRadius = ${serializeValue(resolved.primitive.radii, 0)} as const;`,
        );
        sections.push("");
    }

    // Box shadow from shadows
    if (resolved.primitive.shadows) {
        sections.push(
            `export const boxShadow = ${serializeValue(resolved.primitive.shadows, 0)} as const;`,
        );
        sections.push("");
    }

    // Font family from typography
    if (resolved.primitive.typography?.fontFamily) {
        const fontFamily = { sans: resolved.primitive.typography.fontFamily };
        sections.push(
            `export const fontFamily = ${serializeValue(fontFamily, 0)} as const;`,
        );
        sections.push("");
    }

    // Font weight
    if (resolved.primitive.fontWeight) {
        sections.push(
            `export const fontWeight = ${serializeValue(resolved.primitive.fontWeight, 0)} as const;`,
        );
        sections.push("");
    }

    return sections.join("\n");
}
