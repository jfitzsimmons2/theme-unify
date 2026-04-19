import type { ValidationIssue } from "./errors.js";
import type { ThemeUnifyConfig, SemanticScaleRef, ColorScale } from "./types.js";
import { COLOR_STEPS, PRIMEVUE_BASE_THEMES, isRef } from "./types.js";
import {
    BUILTIN_PALETTES,
    BUILTIN_PALETTE_NAMES,
    isBuiltinPalette,
} from "./builtin-palettes.js";

const CSS_VALUE_RE =
    /^(-?\d+(\.\d+)?(px|rem|em|%|vh|vw|vmin|vmax|ch|ex|cm|mm|in|pt|pc|s|ms|deg|rad|turn)?|0|none|auto|inherit|initial|unset|#[\da-fA-F]{3,8}|rgba?\(.+\)|hsla?\(.+\)|'.+'|".+"|\d+(\.\d+)?)$/;

export function validateTokens(tokens: ThemeUnifyConfig): ValidationIssue[] {
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
    if (tokens.preset?.base) {
        if (!PRIMEVUE_BASE_THEMES.includes(tokens.preset.base as never)) {
            issues.push({
                path: "preset.base",
                message: `Unknown base theme "${tokens.preset.base}". Expected: ${PRIMEVUE_BASE_THEMES.join(", ")}`,
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

    // Validate scale references in semantic
    const scaleExists = (name: string): boolean =>
        Boolean(tokens.primitive.colors?.[name]) || isBuiltinPalette(name);
    const unknownScaleMessage = (name: string): string =>
        `Unknown color scale "${name}". Define it in primitive.colors or use a builtin palette (${BUILTIN_PALETTE_NAMES.join(", ")}).`;

    const checkScaleRef = (ref: SemanticScaleRef, path: string): void => {
        if (typeof ref === "string") {
            if (!scaleExists(ref)) {
                issues.push({ path, message: unknownScaleMessage(ref) });
            }
            return;
        }
        // Inline ColorScale
        if (typeof ref !== "object" || ref === null) {
            issues.push({ path, message: `Expected scale name or ColorScale at ${path}` });
            return;
        }
        for (const step of COLOR_STEPS) {
            if (typeof (ref as ColorScale)[step] !== "string") {
                issues.push({
                    path: `${path}.${step}`,
                    message: `Inline scale at ${path} is missing step "${step}"`,
                });
            }
        }
    };

    if (tokens.semantic?.primary !== undefined) {
        checkScaleRef(tokens.semantic.primary, "semantic.primary");
    }
    if (tokens.semantic?.surface) {
        checkScaleRef(tokens.semantic.surface.scale, "semantic.surface.scale");
        if (tokens.semantic.surface.darkScale !== undefined) {
            checkScaleRef(
                tokens.semantic.surface.darkScale,
                "semantic.surface.darkScale",
            );
        }
    }
    if (tokens.semantic?.extra) {
        for (const [role, ref] of Object.entries(tokens.semantic.extra)) {
            checkScaleRef(ref, `semantic.extra.${role}`);
        }
    }

    // Validate all refs resolve to existing paths
    validateRefs(tokens, tokens, "", issues);

    return issues;
}

function validateRefs(
    root: ThemeUnifyConfig,
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

function resolveRefPath(root: ThemeUnifyConfig, refPath: string): unknown {
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
