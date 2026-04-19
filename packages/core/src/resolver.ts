import type {
  TokenSchema,
  AutoTokenSchema,
  ResolvedTokens,
  ResolvedAutoTokens,
  ResolvedPrimeVueConfig,
  ResolvedPrimeVueOverrides,
} from "./types.js";
import { isRef } from "./types.js";
import { CircularReferenceError, UnresolvedRefError } from "./errors.js";

/**
 * Eagerly resolve all { ref } pointers in the token tree.
 * Returns a new tree where every ref is replaced with its literal value.
 */
export function resolveRefs(tokens: TokenSchema): ResolvedTokens;
export function resolveRefs(tokens: AutoTokenSchema): ResolvedAutoTokens;
export function resolveRefs(
  tokens: TokenSchema | AutoTokenSchema,
): ResolvedTokens | ResolvedAutoTokens;
export function resolveRefs(
  tokens: TokenSchema | AutoTokenSchema,
): ResolvedTokens | ResolvedAutoTokens {
  const resolver = new RefResolver(tokens as TokenSchema);

  // Detect auto mode: semantic is required, and primevue has { base?, overrides? } shape
  if (isAutoSchema(tokens)) {
    const resolvedOverrides = tokens.primevue?.overrides
      ? (resolver.resolveNode(
          tokens.primevue.overrides,
          "primevue.overrides",
        ) as ResolvedPrimeVueOverrides)
      : undefined;

    return {
      meta: tokens.meta,
      primitive: tokens.primitive,
      semantic: tokens.semantic,
      primevue: tokens.primevue
        ? {
            base: tokens.primevue.base,
            overrides: resolvedOverrides,
          }
        : undefined,
      unocss: tokens.unocss,
    } as ResolvedAutoTokens;
  }

  // Legacy mode
  const resolvedPrimevue = tokens.primevue
    ? (resolver.resolveNode(
        tokens.primevue,
        "primevue",
      ) as ResolvedPrimeVueConfig)
    : undefined;

  return {
    meta: tokens.meta,
    primitive: tokens.primitive,
    semantic: tokens.semantic,
    primevue: resolvedPrimevue,
    unocss: tokens.unocss,
  };
}

function isAutoSchema(
  tokens: TokenSchema | AutoTokenSchema,
): tokens is AutoTokenSchema {
  if (!tokens.semantic) return false;
  if (!tokens.primevue) return true; // semantic but no primevue = auto mode
  // Auto mode: primevue has { base?, overrides? } but NOT { colorScheme, focusRing, formField }
  const pv = tokens.primevue as Record<string, unknown>;
  return (
    ("overrides" in pv || "base" in pv) &&
    !("colorScheme" in pv) &&
    !("focusRing" in pv) &&
    !("formField" in pv)
  );
}

class RefResolver {
  private root: TokenSchema | AutoTokenSchema;

  // Aliases so refs like "colors.beetroot.500" resolve to "primitive.colors.beetroot.500"
  private static PRIMITIVE_ALIASES: ReadonlyMap<string, string> = new Map([
    ["colors", "primitive.colors"],
    ["spacing", "primitive.spacing"],
    ["radii", "primitive.radii"],
    ["shadows", "primitive.shadows"],
    ["typography", "primitive.typography"],
    ["fontWeight", "primitive.fontWeight"],
  ]);

  constructor(root: TokenSchema | AutoTokenSchema) {
    this.root = root;
  }

  /**
   * Resolve a single ref string to its literal value.
   * Tracks the visited path set to detect cycles.
   */
  resolveRef(
    refPath: string,
    location: string,
    visited: Set<string> = new Set(),
  ): string {
    if (visited.has(refPath)) {
      const cycle = [...visited, refPath];
      throw new CircularReferenceError(cycle);
    }
    visited.add(refPath);

    const value = this.getValueAtPath(refPath);
    if (value === undefined) {
      throw new UnresolvedRefError(refPath, location);
    }

    // If the resolved value is itself a ref, resolve recursively
    if (isRef(value)) {
      return this.resolveRef(value.ref, location, visited);
    }

    if (typeof value === "string") {
      return value;
    }

    // If it's an object (e.g., a semantic background that points to another ref)
    if (typeof value === "object" && value !== null && "ref" in value) {
      return this.resolveRef((value as { ref: string }).ref, location, visited);
    }

    throw new UnresolvedRefError(refPath, location);
  }

  /**
   * Recursively resolve all refs in an arbitrary object tree.
   */
  resolveNode(node: unknown, path: string): unknown {
    if (node === null || node === undefined) return node;

    if (isRef(node)) {
      return this.resolveRef(node.ref, path);
    }

    if (
      typeof node === "string" ||
      typeof node === "number" ||
      typeof node === "boolean"
    ) {
      return node;
    }

    if (Array.isArray(node)) {
      return node.map((item, i) => this.resolveNode(item, `${path}[${i}]`));
    }

    if (typeof node === "object") {
      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(
        node as Record<string, unknown>,
      )) {
        result[key] = this.resolveNode(value, `${path}.${key}`);
      }
      return result;
    }

    return node;
  }

  /**
   * Navigate the token tree by dot-path, applying primitive aliases.
   */
  private getValueAtPath(refPath: string): unknown {
    let fullPath = refPath;
    const firstSegment = refPath.split(".")[0];
    const alias = RefResolver.PRIMITIVE_ALIASES.get(firstSegment);
    if (alias) {
      fullPath = alias + refPath.slice(firstSegment.length);
    }

    const parts = fullPath.split(".");
    let current: unknown = this.root;
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
}
