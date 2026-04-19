import type { ValidationIssue } from "./errors.js";
import type { TokenSchema, AutoTokenSchema } from "./types.js";
import { COLOR_STEPS, PRIMEVUE_BASE_THEMES, isRef } from "./types.js";

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

  // Validate surface scale references
  if (tokens.semantic?.surface) {
    const { scale, darkScale } = tokens.semantic.surface;
    if (!tokens.primitive.colors[scale]) {
      issues.push({
        path: "semantic.surface.scale",
        message: `Surface scale "${scale}" does not exist in primitive.colors`,
      });
    }
    if (darkScale && !tokens.primitive.colors[darkScale]) {
      issues.push({
        path: "semantic.surface.darkScale",
        message: `Surface darkScale "${darkScale}" does not exist in primitive.colors`,
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
  for (const part of parts) {
    if (
      current === null ||
      current === undefined ||
      typeof current !== "object"
    ) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}
