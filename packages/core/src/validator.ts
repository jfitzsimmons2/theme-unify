import type { ValidationIssue } from "./errors.js";
import type { TokenSchema, AutoTokenSchema } from "./types.js";
import { COLOR_STEPS, PRIMEVUE_BASE_THEMES, isRef } from "./types.js";
import {
    BUILTIN_PALETTES,
    BUILTIN_PALETTE_NAMES,
    isBuiltinPalette,
} from "./builtin-palettes.js";

const CSS_VALUE_RE =
    /^(-?\d+(\.\d+)?(px|rem|em|%|vh|vw|vmin|vmax|ch|ex|cm|mm|in|pt|pc|s|ms|deg|rad|turn)?|0|none|auto|inherit|initial|unset|#[\da-fA-F]{3,8}|rgba?\(.+\)|hsla?\(.+\)|'.+'|".+"|\d+(\.\d+)?)$/;

export function validateTokens(
    tokens: TokenSchema | AutoTokenSchema,
): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Validate color scales have valid steps
    if (tokens.primitive.colors) {
        for (const [name, scale] of Object.entries(tokens.primitive.colors)) {
            for (const key of Object.keys(scale)) {
                const step = Number(key);
                if (!COLOR_STEPS.includes(step as never)) {
                    issues.push({
                        path: `primitive.colors.${name}.${key}`,
                        message: `Invalid color step "${key}" in "${name}". Expected one of: ${COLOR_STEPS.join(", ")}`,
                    });
                }
            }
        }
    }

    // Validate PrimeVue base theme
    if (tokens.primevue && "base" in tokens.primevue && tokens.primevue.base) {
        if (!PRIMEVUE_BASE_THEMES.includes(tokens.primevue.base as never)) {
            issues.push({
                path: "primevue.base",
                message: `Unknown base theme "${tokens.primevue.base}". Expected: ${PRIMEVUE_BASE_THEMES.join(", ")}`,
            });
        }
    }

    // Validate spacing values
    if (tokens.primitive.spacing) {
        for (const [key, value] of Object.entries(tokens.primitive.spacing)) {
            if (!CSS_VALUE_RE.test(value)) {
                issues.push({
                    path: `primitive.spacing.${key}`,
                    message: `Invalid CSS value "${value}" in spacing.${key}`,
                });
            }
        }
    }

    // Validate radii values
    if (tokens.primitive.radii) {
        for (const [key, value] of Object.entries(tokens.primitive.radii)) {
            if (!CSS_VALUE_RE.test(value)) {
                issues.push({
                    path: `primitive.radii.${key}`,
                    message: `Invalid CSS value "${value}" in radii.${key}`,
                });
            }
        }
    }

    // Validate shadows values (these are complex, allow anything with parens or numbers)
    if (tokens.primitive.shadows) {
        for (const [key, value] of Object.entries(tokens.primitive.shadows)) {
            if (typeof value !== "string" || value.trim().length === 0) {
                issues.push({
                    path: `primitive.shadows.${key}`,
                    message: `Invalid shadow value in shadows.${key}`,
                });
            }
        }
    }

    // Validate scale-name references against primitive.colors ∪ builtins.
    const scaleExists = (name: string): boolean =>
        Boolean(tokens.primitive.colors?.[name]) || isBuiltinPalette(name);
    const unknownScaleMessage = (name: string): string =>
        `Unknown color scale "${name}". Define it in primitive.colors or use a builtin palette (${BUILTIN_PALETTE_NAMES.join(", ")}).`;

    if (tokens.semantic?.colors) {
        for (const [role, mapping] of Object.entries(tokens.semantic.colors)) {
            if (!scaleExists(mapping.scale)) {
                issues.push({
                    path: `semantic.colors.${role}.scale`,
                    message: unknownScaleMessage(mapping.scale),
                });
            }
        }
    }

    if (tokens.semantic?.surface) {
        const { scale, darkScale } = tokens.semantic.surface;
        if (!scaleExists(scale)) {
            issues.push({
                path: "semantic.surface.scale",
                message: unknownScaleMessage(scale),
            });
        }
        if (darkScale && !scaleExists(darkScale)) {
            issues.push({
                path: "semantic.surface.darkScale",
                message: unknownScaleMessage(darkScale),
            });
        }
    }

    // Validate all refs resolve to existing paths
    validateRefs(tokens, tokens, "", issues);

    return issues;
}

function validateRefs(
    root: TokenSchema | AutoTokenSchema,
    node: unknown,
    currentPath: string,
    issues: ValidationIssue[],
): void {
    if (node === null || node === undefined) return;
    if (typeof node !== "object") return;

    if (isRef(node)) {
        const resolved = resolveRefPath(root, node.ref);
        if (resolved === undefined) {
            issues.push({
                path: currentPath,
                message: `Unresolved ref "${node.ref}" in ${currentPath}`,
            });
        }
        return;
    }

    for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
        const childPath = currentPath ? `${currentPath}.${key}` : key;
        validateRefs(root, value, childPath, issues);
    }
}

function resolveRefPath(
    root: TokenSchema | AutoTokenSchema,
    refPath: string,
): unknown {
    // Try direct resolution from primitive first
    const primitiveAliases: Record<string, string> = {
        colors: "primitive.colors",
        spacing: "primitive.spacing",
        radii: "primitive.radii",
        shadows: "primitive.shadows",
        typography: "primitive.typography",
        fontWeight: "primitive.fontWeight",
    };

    let fullPath = refPath;
    const firstSegment = refPath.split(".")[0];
    if (primitiveAliases[firstSegment]) {
        fullPath =
            primitiveAliases[firstSegment] + refPath.slice(firstSegment.length);
    }

    const parts = fullPath.split(".");
    let current: unknown = root;
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (
            current === null ||
            current === undefined ||
            typeof current !== "object"
        ) {
            return undefined;
        }
        const next = (current as Record<string, unknown>)[part];
        if (
            next === undefined &&
            i >= 1 &&
            parts[i - 1] === "colors" &&
            parts[i - 2] === "primitive" &&
            isBuiltinPalette(part)
        ) {
            current = BUILTIN_PALETTES[part];
            continue;
        }
        current = next;
    }
    return current;
}
