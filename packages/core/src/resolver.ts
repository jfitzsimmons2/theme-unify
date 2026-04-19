import type {
    ThemeUnifyConfig,
    ResolvedTokens,
    ResolvedPresetConfig,
    PresetOverrides,
} from "./types.js";
import { isRef } from "./types.js";
import { CircularReferenceError, UnresolvedRefError } from "./errors.js";
import { BUILTIN_PALETTES, isBuiltinPalette } from "./builtin-palettes.js";

/**
 * Eagerly resolve all `{ ref }` pointers in the token tree.
 * Returns a new tree where every ref is replaced with its literal value.
 */
export function resolveRefs(tokens: ThemeUnifyConfig): ResolvedTokens {
    const resolver = new RefResolver(tokens);

    let preset: ResolvedPresetConfig | undefined;
    if (tokens.preset) {
        const overrides = tokens.preset.overrides
            ? (resolver.resolveNode(
                tokens.preset.overrides,
                "preset.overrides",
            ) as PresetOverrides)
            : undefined;
        preset = { base: tokens.preset.base, overrides };
    }

    return {
        meta: tokens.meta,
        primitive: tokens.primitive,
        semantic: tokens.semantic,
        preset,
        unocss: tokens.unocss,
    };
}

class RefResolver {
    private root: ThemeUnifyConfig;

    private static PRIMITIVE_ALIASES: ReadonlyMap<string, string> = new Map([
        ["colors", "primitive.colors"],
        ["spacing", "primitive.spacing"],
        ["radii", "primitive.radii"],
        ["shadows", "primitive.shadows"],
        ["typography", "primitive.typography"],
        ["fontWeight", "primitive.fontWeight"],
    ]);

    constructor(root: ThemeUnifyConfig) {
        this.root = root;
    }

    resolveRef(
        refPath: string,
        location: string,
        visited: Set<string> = new Set(),
    ): string {
        if (visited.has(refPath)) {
            throw new CircularReferenceError([...visited, refPath]);
        }
        visited.add(refPath);

        const value = this.getValueAtPath(refPath);
        if (value === undefined) {
            throw new UnresolvedRefError(refPath, location);
        }

        if (isRef(value)) {
            return this.resolveRef(value.ref, location, visited);
        }

        if (typeof value === "string") {
            return value;
        }

        if (typeof value === "object" && value !== null && "ref" in value) {
            return this.resolveRef(
                (value as { ref: string }).ref,
                location,
                visited,
            );
        }

        throw new UnresolvedRefError(refPath, location);
    }

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

    private getValueAtPath(refPath: string): unknown {
        let fullPath = refPath;
        const firstSegment = refPath.split(".")[0];
        const alias = RefResolver.PRIMITIVE_ALIASES.get(firstSegment);
        if (alias) {
            fullPath = alias + refPath.slice(firstSegment.length);
        }

        const parts = fullPath.split(".");
        let current: unknown = this.root;
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
}
