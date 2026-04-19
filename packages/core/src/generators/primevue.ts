import type {
    ResolvedTokens,
    ResolvedAutoTokens,
    ColorScale,
    PrimitiveConfig,
} from "../types.js";
import { COLOR_STEPS } from "../types.js";
import { fileHeader, serializeValue, buildSurfaceObject } from "./utils.js";
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

export function generatePrimeVue(
    resolved: ResolvedTokens | ResolvedAutoTokens,
): string {
    const base = getBase(resolved);
    const importPath = BASE_THEME_IMPORTS[base];
    const baseName = BASE_THEME_NAMES[base];

    const presetObj = buildPrimeVuePreset(resolved);

    const lines = [
        fileHeader(),
        `import { definePreset } from '@primeuix/themes';`,
        `import ${baseName} from '${importPath}';`,
        "",
        `export const GeneratedPreset = definePreset(${baseName}, ${serializeValue(presetObj, 0)});`,
        "",
    ];

    return lines.join("\n");
}

function getBase(resolved: ResolvedTokens | ResolvedAutoTokens): string {
    if (isAutoTokens(resolved)) {
        return resolved.primevue?.base ?? "aura";
    }
    return resolved.primevue?.base ?? "aura";
}

function isAutoTokens(
    resolved: ResolvedTokens | ResolvedAutoTokens,
): resolved is ResolvedAutoTokens {
    // Auto tokens have semantic as required and primevue shape is { base?, overrides? }
    // Legacy tokens have primevue as ResolvedPrimeVueConfig with colorScheme at top level
    if (!resolved.semantic) return false;
    if (!resolved.primevue) return true; // semantic present, no primevue = auto mode
    return (
        !("colorScheme" in resolved.primevue) && !("focusRing" in resolved.primevue)
    );
}

/**
 * Build the raw PrimeVue preset configuration object.
 * This is the second argument passed to `definePreset(Base, ...)`.
 *
 * Supports both legacy (explicit PrimeVue config) and auto mode
 * (derive everything from semantic tokens).
 */
export function buildPrimeVuePreset(
    resolved: ResolvedTokens | ResolvedAutoTokens,
): Record<string, unknown> {
    if (isAutoTokens(resolved)) {
        return buildAutoPreset(resolved);
    }
    return buildLegacyPreset(resolved);
}

// ---------------------------------------------------------------------------
// Auto-derive mode: build PrimeVue config entirely from semantic tokens
// ---------------------------------------------------------------------------

function buildAutoPreset(
    resolved: ResolvedAutoTokens,
): Record<string, unknown> {
    const semantic: Record<string, unknown> = {};
    const result: Record<string, unknown> = { semantic };
    const sem = resolved.semantic;
    const prim = resolved.primitive;

    // Map semantic color roles → full 50-950 scales
    if (sem.colors) {
        for (const [role, mapping] of Object.entries(sem.colors)) {
            const scale = resolveScale(mapping.scale, prim);
            if (scale) {
                semantic[role] = scaleToObject(scale);
            }
        }
    }

    // Build colorScheme with surface + auto-derived primary/highlight/formField
    const colorScheme: Record<string, unknown> = {};

    // --- Surface 0-950 for light and dark ---
    if (sem.surface) {
        const lightScale = resolveScale(sem.surface.scale, prim);
        if (lightScale) {
            const lightSurface = buildSurfaceObject(lightScale, false, "light");

            let darkSurface: Record<string, string>;
            if (sem.surface.darkScale) {
                const darkScale = resolveScale(sem.surface.darkScale, prim);
                darkSurface = darkScale
                    ? buildSurfaceObject(darkScale, false, "dark")
                    : buildSurfaceObject(
                        lightScale,
                        sem.surface.invertInDarkMode ?? false,
                        "dark",
                    );
            } else {
                darkSurface = buildSurfaceObject(
                    lightScale,
                    sem.surface.invertInDarkMode ?? false,
                    "dark",
                );
            }

            colorScheme["light"] = { surface: lightSurface };
            colorScheme["dark"] = { surface: darkSurface };
        }
    }

    // --- Auto-derive primary/highlight/formField from semantic roles ---
    const primaryScale = sem.colors?.primary
        ? resolveScale(sem.colors.primary.scale, prim)
        : undefined;
    const surfaceScaleName = sem.surface?.scale;
    const surfaceScale = surfaceScaleName
        ? resolveScale(surfaceScaleName, prim)
        : undefined;

    if (primaryScale) {
        // Light mode primary + highlight
        const lightAuto: Record<string, Record<string, string>> = {
            primary: {
                color: primaryScale[500],
                inverseColor: "#ffffff",
                hoverColor: primaryScale[600],
                activeColor: primaryScale[700],
            },
            highlight: {
                background: primaryScale[50],
                focusBackground: primaryScale[100],
                color: primaryScale[700],
                focusColor: primaryScale[800],
            },
        };

        // Dark mode primary + highlight
        const darkAuto: Record<string, Record<string, string>> = {
            primary: {
                color: primaryScale[300],
                inverseColor: surfaceScale ? surfaceScale[950] : "#1a1a1a",
                hoverColor: primaryScale[200],
                activeColor: primaryScale[100],
            },
            highlight: {
                background: primaryScale[800],
                focusBackground: primaryScale[700],
                color: primaryScale[200],
                focusColor: primaryScale[100],
            },
        };

        // Auto-derive formField from surface scale
        if (surfaceScale) {
            const pageLightBg = sem.backgrounds?.pageLight
                ? (resolveBackgroundRef(sem.backgrounds.pageLight, prim) ??
                    surfaceScale[50])
                : surfaceScale[50];
            const pageDarkBg = sem.backgrounds?.pageDark
                ? (resolveBackgroundRef(sem.backgrounds.pageDark, prim) ??
                    surfaceScale[950])
                : surfaceScale[950];

            lightAuto["formField"] = {
                borderColor: surfaceScale[300],
                hoverBorderColor: primaryScale[400],
                focusBorderColor: primaryScale[500],
                placeholderColor: surfaceScale[500],
                color: surfaceScale[950],
                background: pageLightBg,
            };

            darkAuto["formField"] = {
                borderColor: surfaceScale[700],
                hoverBorderColor: primaryScale[400],
                focusBorderColor: primaryScale[300],
                placeholderColor: surfaceScale[500],
                color: "rgba(255, 255, 255, 0.87)",
                background: pageDarkBg,
            };
        }

        colorScheme["light"] = deepMerge(
            colorScheme["light"] as Record<string, unknown> | undefined,
            lightAuto,
        );
        colorScheme["dark"] = deepMerge(
            colorScheme["dark"] as Record<string, unknown> | undefined,
            darkAuto,
        );
    }

    // --- Merge user overrides on top ---
    const overrides = resolved.primevue?.overrides;
    if (overrides) {
        if (overrides.focusRing) {
            semantic["focusRing"] = overrides.focusRing;
        }
        if (overrides.formField) {
            semantic["formField"] = overrides.formField;
        }
        if (overrides.colorScheme?.light) {
            colorScheme["light"] = deepMerge(
                colorScheme["light"] as Record<string, unknown> | undefined,
                overrides.colorScheme.light,
            );
        }
        if (overrides.colorScheme?.dark) {
            colorScheme["dark"] = deepMerge(
                colorScheme["dark"] as Record<string, unknown> | undefined,
                overrides.colorScheme.dark,
            );
        }
        if (overrides.components) {
            result["components"] = overrides.components;
        }
    }

    if (Object.keys(colorScheme).length > 0) {
        semantic["colorScheme"] = colorScheme;
    }

    return result;
}

/**
 * Resolve a semantic background ref like { ref: "colors.chickpea.50" }
 * to its string value from primitives. Returns undefined if unresolvable.
 */
function resolveBackgroundRef(
    mapping: { ref: string },
    prim: PrimitiveConfig,
): string | undefined {
    const parts = mapping.ref.split(".");
    // Handle aliases: colors.X.Y → primitive.colors.X.Y (with builtin fallback)
    if (parts[0] === "colors" && parts.length === 3) {
        const scale = resolveScale(parts[1], prim);
        return scale ? scale[Number(parts[2]) as keyof ColorScale] : undefined;
    }
    return undefined;
}

// ---------------------------------------------------------------------------
// Legacy mode: explicit PrimeVue config (backwards compatible)
// ---------------------------------------------------------------------------

function buildLegacyPreset(resolved: ResolvedTokens): Record<string, unknown> {
    const semantic: Record<string, unknown> = {};
    const result: Record<string, unknown> = { semantic };

    // Map semantic color scales (primary, secondary, accent, info)
    if (resolved.semantic?.colors) {
        for (const [role, mapping] of Object.entries(resolved.semantic.colors)) {
            const scale = resolveScale(mapping.scale, resolved.primitive);
            if (scale) {
                semantic[role] = scaleToObject(scale);
            }
        }
    }

    // Map focusRing
    if (resolved.primevue?.focusRing) {
        semantic["focusRing"] = resolved.primevue.focusRing;
    }

    // Map formField
    if (resolved.primevue?.formField) {
        semantic["formField"] = resolved.primevue.formField;
    }

    // Build colorScheme
    const colorScheme: Record<string, unknown> = {};

    // Surface mapping
    if (resolved.semantic?.surface) {
        const surfaceScaleName = resolved.semantic.surface.scale;
        const surfaceScale = resolveScale(surfaceScaleName, resolved.primitive);
        if (surfaceScale) {
            const lightSurface = buildSurfaceObject(surfaceScale, false, "light");

            let darkSurface: Record<string, string>;
            if (resolved.semantic.surface.darkScale) {
                const darkScale = resolveScale(
                    resolved.semantic.surface.darkScale,
                    resolved.primitive,
                );
                darkSurface = darkScale
                    ? buildSurfaceObject(darkScale, false, "dark")
                    : buildSurfaceObject(
                        surfaceScale,
                        resolved.semantic.surface.invertInDarkMode ?? false,
                        "dark",
                    );
            } else {
                darkSurface = buildSurfaceObject(
                    surfaceScale,
                    resolved.semantic.surface.invertInDarkMode ?? false,
                    "dark",
                );
            }

            colorScheme["light"] = { surface: lightSurface };
            colorScheme["dark"] = { surface: darkSurface };
        }
    }

    // Merge PrimeVue colorScheme overrides
    if (resolved.primevue?.colorScheme) {
        if (resolved.primevue.colorScheme.light) {
            colorScheme["light"] = {
                ...(colorScheme["light"] as Record<string, unknown> | undefined),
                ...resolved.primevue.colorScheme.light,
            };
        }
        if (resolved.primevue.colorScheme.dark) {
            colorScheme["dark"] = {
                ...(colorScheme["dark"] as Record<string, unknown> | undefined),
                ...resolved.primevue.colorScheme.dark,
            };
        }
    }

    if (Object.keys(colorScheme).length > 0) {
        semantic["colorScheme"] = colorScheme;
    }

    // Pass through component overrides
    if (resolved.primevue?.components) {
        result["components"] = resolved.primevue.components;
    }

    return result;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function scaleToObject(scale: ColorScale): Record<string, string> {
    const obj: Record<string, string> = {};
    for (const step of COLOR_STEPS) {
        obj[String(step)] = scale[step];
    }
    return obj;
}

function deepMerge(
    target: Record<string, unknown> | undefined,
    source: Record<string, unknown>,
): Record<string, unknown> {
    const result = { ...(target ?? {}) };
    for (const [key, value] of Object.entries(source)) {
        if (
            typeof value === "object" &&
            value !== null &&
            !Array.isArray(value) &&
            typeof result[key] === "object" &&
            result[key] !== null
        ) {
            result[key] = deepMerge(
                result[key] as Record<string, unknown>,
                value as Record<string, unknown>,
            );
        } else {
            result[key] = value;
        }
    }
    return result;
}
