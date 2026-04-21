import type { ValidationIssue } from "./errors.js";
import type { ThemeUnifyConfig, SemanticScaleRef, ColorScale } from "./types.js";
import {
    COLOR_STEPS,
    PRIMEVUE_BASE_THEMES,
    CANONICAL_SEMANTIC_ROLES,
    isRef,
} from "./types.js";
import {
    BUILTIN_PALETTES,
    BUILTIN_PALETTE_NAMES,
    isBuiltinPalette,
} from "./builtin-palettes.js";
import { SEMANTIC_ROLE_ALIAS_MAP } from "./generators/utils.js";

const CSS_VALUE_RE =
    /^(-?\d+(\.\d+)?(px|rem|em|%|vh|vw|vmin|vmax|ch|ex|cm|mm|in|pt|pc|s|ms|deg|rad|turn)?|0|none|auto|inherit|initial|unset|#[\da-fA-F]{3,8}|rgba?\(.+\)|hsla?\(.+\)|'.+'|".+"|\d+(\.\d+)?)$/;

const BREAKPOINT_RE = /^\d+(\.\d+)?(px|rem|em)$/;
const Z_INDEX_RE = /^(auto|-?\d+)$/;

/**
 * Statically validate a {@link ThemeUnifyConfig} without resolving refs
 * or running generators.
 *
 * Returns a list of {@link ValidationIssue}s; an empty array means the
 * config is valid. `loadTokens` calls this internally and throws a
 * {@link TokenValidationError} when issues are found, but you can call
 * `validateTokens` directly when integrating theme-unify into a build
 * step that needs to surface issues another way (e.g. inline in an
 * editor).
 *
 * Checks performed:
 * - Every {@link ColorScale} in `primitive.colors` has all 11 steps.
 * - Every inline {@link ColorScale} inside `semantic` is fully populated.
 * - Every named {@link SemanticScaleRef} resolves to either a key in
 *   `primitive.colors` or a {@link BuiltinPaletteName}.
 * - `preset.base` (if present) is a known {@link PrimeVueBaseTheme}.
 * - All `{ ref }` paths inside `preset.overrides` point at existing values.
 * - Spacing, radii, and shadow values look like CSS.
 *
 * @example
 * ```ts
 * const issues = validateTokens(myConfig);
 * if (issues.length) {
 *   for (const { path, message } of issues) console.warn(path, message);
 * }
 * ```
 */
export function validateTokens(tokens: ThemeUnifyConfig): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Validate meta.darkModeStrategy (when explicitly set)
    if (tokens.meta && "darkModeStrategy" in tokens.meta) {
        const strategy = tokens.meta.darkModeStrategy;
        if (strategy !== undefined && strategy !== "class" && strategy !== "media") {
            issues.push({
                path: "meta.darkModeStrategy",
                message:
                    `Invalid darkModeStrategy "${strategy}". Expected "class" or "media".`,
            });
        }
    }

    const effectiveStrategy = tokens.meta?.darkModeStrategy ?? "class";

    // Validate meta.darkModeSelector (when explicitly set)
    if (tokens.meta && "darkModeSelector" in tokens.meta) {
        const sel = tokens.meta.darkModeSelector;
        if (sel !== undefined) {
            if (effectiveStrategy === "media") {
                issues.push({
                    path: "meta.darkModeSelector",
                    severity: "warning",
                    message:
                        'meta.darkModeSelector is ignored when darkModeStrategy is "media" (dark mode is driven by the OS prefers-color-scheme media query). You can remove it.',
                });
            } else if (typeof sel !== "string" || sel.trim().length === 0) {
                issues.push({
                    path: "meta.darkModeSelector",
                    message:
                        'meta.darkModeSelector must be a non-empty CSS selector (e.g. ".dark", "[data-theme=\'dark\']", "@media (prefers-color-scheme: dark)").',
                });
            } else if (!isPlausibleCssSelector(sel)) {
                issues.push({
                    path: "meta.darkModeSelector",
                    message: `meta.darkModeSelector "${sel}" does not look like a valid CSS selector. Examples: ".dark", "#app.dark", "[data-theme='dark']", ":where(.dark) &".`,
                });
            }
        }
    }

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

    // Validate breakpoints — narrower than CSS_VALUE_RE so "640ms" is rejected.
    if (tokens.primitive.breakpoints) {
        for (const [key, value] of Object.entries(tokens.primitive.breakpoints)) {
            if (typeof value !== "string" || !BREAKPOINT_RE.test(value)) {
                issues.push({
                    path: `primitive.breakpoints.${key}`,
                    message: `Invalid breakpoint "${value}" in breakpoints.${key} (expected px/rem/em length)`,
                });
            }
        }
    }

    // Validate zIndex — integer or "auto".
    if (tokens.primitive.zIndex) {
        for (const [key, value] of Object.entries(tokens.primitive.zIndex)) {
            if (typeof value !== "string" || !Z_INDEX_RE.test(value)) {
                issues.push({
                    path: `primitive.zIndex.${key}`,
                    message: `Invalid z-index "${value}" in zIndex.${key} (expected integer or "auto")`,
                });
            }
        }
    }

    // Validate transitions sub-records.
    if (tokens.primitive.transitions) {
        for (const sub of ["property", "duration", "timingFunction"] as const) {
            const bag = tokens.primitive.transitions[sub];
            if (!bag) continue;
            for (const [key, value] of Object.entries(bag)) {
                if (typeof value !== "string" || value.trim() === "") {
                    issues.push({
                        path: `primitive.transitions.${sub}.${key}`,
                        message: `Invalid transition ${sub} value in transitions.${sub}.${key}`,
                    });
                }
            }
        }
    }

    // Validate animations — free-form CSS shorthand strings, must be non-empty.
    if (tokens.primitive.animations) {
        for (const [key, value] of Object.entries(tokens.primitive.animations)) {
            if (typeof value !== "string" || value.trim() === "") {
                issues.push({
                    path: `primitive.animations.${key}`,
                    message: `Invalid animation shorthand in animations.${key}`,
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
            const aliasTarget = SEMANTIC_ROLE_ALIAS_MAP[role];
            if (aliasTarget) {
                issues.push({
                    path: `semantic.extra.${role}`,
                    severity: "warning",
                    message: `Semantic role "${role}" is deprecated; rename to "${aliasTarget}" to align with PrimeVue's severity vocabulary. The generated preset will canonicalize it for now.`,
                });
            } else if (
                !CANONICAL_SEMANTIC_ROLES.includes(role as never)
            ) {
                issues.push({
                    path: `semantic.extra.${role}`,
                    severity: "info",
                    message: `Semantic role "${role}" is not part of PrimeVue's severity vocabulary (${CANONICAL_SEMANTIC_ROLES.join(", ")}). It will still be emitted as --p-${role}-* CSS variables, but severity-aware components (Button, Tag, Message, Toast, …) won't react to it.`,
                });
            }
        }
    }

    // Validate unocss.includeBuiltinPalettes
    if (tokens.unocss && "includeBuiltinPalettes" in tokens.unocss) {
        const opt = tokens.unocss.includeBuiltinPalettes;
        if (
            opt !== undefined &&
            typeof opt !== "boolean" &&
            !Array.isArray(opt)
        ) {
            issues.push({
                path: "unocss.includeBuiltinPalettes",
                message:
                    "Invalid includeBuiltinPalettes — expected boolean or an array of builtin palette names.",
            });
        } else if (Array.isArray(opt)) {
            for (let i = 0; i < opt.length; i++) {
                const name = opt[i];
                if (typeof name !== "string" || !isBuiltinPalette(name)) {
                    issues.push({
                        path: `unocss.includeBuiltinPalettes.${i}`,
                        message: `Unknown builtin palette "${String(name)}". Expected one of: ${BUILTIN_PALETTE_NAMES.join(", ")}.`,
                    });
                }
            }
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
        breakpoints: "primitive.breakpoints",
        zIndex: "primitive.zIndex",
        transitions: "primitive.transitions",
        animations: "primitive.animations",
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

/**
 * Permissive CSS selector check used for `meta.darkModeSelector`.
 *
 * Accepts a single selector list made of class (`.foo`), id (`#foo`),
 * tag, attribute (`[data-theme='dark']`), pseudo-class (`:where(.dark)`,
 * `:is(...)`, `:not(...)`, `:has(...)`), descendant / child / sibling
 * combinators, and the universal selector. Rejects empty / whitespace
 * input and obvious garbage (unbalanced brackets, leading combinators).
 *
 * Not a full CSS Selectors Level 4 grammar — intentionally lenient so
 * unusual but legal selectors are not rejected.
 */
function isPlausibleCssSelector(selector: string): boolean {
    const s = selector.trim();
    if (s.length === 0) return false;
    // Must not start with a combinator
    if (/^[>+~,]/.test(s)) return false;
    // Balanced brackets
    let depth = 0;
    for (const ch of s) {
        if (ch === "(" || ch === "[") depth++;
        else if (ch === ")" || ch === "]") {
            depth--;
            if (depth < 0) return false;
        }
    }
    if (depth !== 0) return false;
    // At least one selector-like token (class/id/tag/attr/pseudo/&/*)
    return /[.#:&*\[a-zA-Z_-]/.test(s);
}
