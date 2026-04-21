import type { ColorScale } from "../types.js";
import type { ResolvedTokens } from "../types.js";
import {
    BUILTIN_PALETTES,
    BUILTIN_PALETTE_NAMES,
    isBuiltinPalette,
} from "../builtin-palettes.js";
import { collectEffectiveBuiltins } from "../effective-builtins.js";
import { canonicalizeSemanticRole, fileHeader, serializeValue } from "./utils.js";

/**
 * Where the scale backing a semantic role comes from.
 * - `custom`: user-defined palette in `primitive.colors`
 * - `builtin`: shipped builtin palette (e.g. `slate`, `emerald`)
 * - `inline`: inline {@link ColorScale} object (no named source)
 */
export type SemanticPaletteSourceKind = "custom" | "builtin" | "inline";

/**
 * One semantic role entry in {@link PaletteCatalog.semantic}. Describes
 * which scale backs the role at runtime so consumers (docs, palette
 * pages) can label the swatches.
 */
export interface SemanticPaletteEntry {
    /** Canonical role name (`primary`, `surface`, `success`, `warn`, …). */
    role: string;
    /** Source palette name when the config used a string ref; `null` for inline scales. */
    source: string | null;
    /** Surface dark scheme source palette name (`surface` only). */
    darkSource?: string | null;
    /** Source kind for the light/default scale. */
    sourceKind: SemanticPaletteSourceKind;
    /** Source kind for the dark surface scale (`surface` only). */
    darkSourceKind?: SemanticPaletteSourceKind;
}

/**
 * Cataloged palette data describing every color scale theme-unify knows about
 * for a given config. Returned by `collectPalettes` and serialized by
 * `generatePalettes`.
 */
export interface PaletteCatalog {
    /** User-defined scales from `primitive.colors` (hex values). */
    custom: Record<string, ColorScale>;
    /**
     * Builtin palettes actually emitted for this build — i.e. the union
     * of builtins referenced via `semantic` and those opted in via
     * `unocss.includeBuiltinPalettes`. Hex values.
     */
    builtin: Record<string, ColorScale>;
    /** Subset of builtin palette names actually referenced by `semantic`. */
    referencedBuiltins: string[];
    /**
     * Names opted in via `unocss.includeBuiltinPalettes` (excluding any
     * referenced or shadowed by user palettes — those are already
     * covered by `referencedBuiltins` / `custom`).
     */
    optInBuiltins: string[];
    /** Custom palette names that shadow a builtin of the same name. */
    shadowedBuiltins: string[];
    /**
     * Semantic role → backing scale entries, in emit order: `primary`,
     * `surface`, then each `extra` role (canonicalized). Each entry
     * mirrors what the preset/uno-theme generators emit as
     * `--p-{role}-{step}` / `bg-{role}-{step}`.
     */
    semantic: SemanticPaletteEntry[];
}

/**
 * Build a `PaletteCatalog` for the resolved tokens. Pure data — useful for
 * the CLI `colors` subcommand and for the file generator below.
 */
export function collectPalettes(resolved: ResolvedTokens): PaletteCatalog {
    const custom: Record<string, ColorScale> = {};
    for (const [name, scale] of Object.entries(resolved.primitive.colors)) {
        custom[name] = scale;
    }

    const effective = collectEffectiveBuiltins(resolved);
    const builtin: Record<string, ColorScale> = {};
    for (const name of effective) {
        builtin[name] = BUILTIN_PALETTES[name];
    }

    const referenced = new Set<string>();
    const sem = resolved.semantic;
    if (sem) {
        if (typeof sem.primary === "string" && isBuiltinPalette(sem.primary)) {
            referenced.add(sem.primary);
        }
        if (sem.surface) {
            if (
                typeof sem.surface.scale === "string" &&
                isBuiltinPalette(sem.surface.scale)
            ) {
                referenced.add(sem.surface.scale);
            }
            if (
                typeof sem.surface.darkScale === "string" &&
                isBuiltinPalette(sem.surface.darkScale)
            ) {
                referenced.add(sem.surface.darkScale);
            }
        }
        if (sem.extra) {
            for (const v of Object.values(sem.extra)) {
                if (typeof v === "string" && isBuiltinPalette(v)) {
                    referenced.add(v);
                }
            }
        }
    }

    const shadowed = Object.keys(custom).filter((n) => isBuiltinPalette(n));
    const optIn = [...effective].filter((n) => !referenced.has(n)).sort();

    const semanticEntries: SemanticPaletteEntry[] = [];
    if (sem) {
        if (sem.primary !== undefined) {
            semanticEntries.push(makeSemanticEntry("primary", sem.primary, custom));
        }
        if (sem.surface) {
            const light = makeSemanticEntry("surface", sem.surface.scale, custom);
            const darkRef = sem.surface.darkScale ?? sem.surface.scale;
            const dark = makeSemanticEntry("surface", darkRef, custom);
            light.darkSource = dark.source;
            light.darkSourceKind = dark.sourceKind;
            semanticEntries.push(light);
        }
        if (sem.extra) {
            for (const [rawRole, ref] of Object.entries(sem.extra)) {
                const role = canonicalizeSemanticRole(rawRole);
                semanticEntries.push(makeSemanticEntry(role, ref, custom));
            }
        }
    }

    return {
        custom,
        builtin,
        referencedBuiltins: [...referenced].sort(),
        optInBuiltins: optIn,
        shadowedBuiltins: shadowed,
        semantic: semanticEntries,
    };
}

function makeSemanticEntry(
    role: string,
    ref: unknown,
    custom: Record<string, ColorScale>,
): SemanticPaletteEntry {
    if (typeof ref === "string") {
        const sourceKind: SemanticPaletteSourceKind = custom[ref]
            ? "custom"
            : isBuiltinPalette(ref)
                ? "builtin"
                : "custom";
        return { role, source: ref, sourceKind };
    }
    return { role, source: null, sourceKind: "inline" };
}

/**
 * Generate a `palettes.ts` file documenting every color scale available to
 * the current config: user palettes, the builtin palettes actually shipped
 * (referenced + opted in), the subset referenced by semantic roles, the
 * subset purely opted in, and any builtin names shadowed by custom
 * palettes. The full discoverable list is exported as
 * `availableBuiltinPaletteNames`.
 *
 * Emitted exports: `customPalettes`, `builtinPalettes`,
 * `referencedBuiltinPalettes`, `optInBuiltinPalettes`,
 * `shadowedBuiltinPalettes`, `availableBuiltinPaletteNames`,
 * `semanticPalettes`.
 */
export function generatePalettes(resolved: ResolvedTokens): string {
    const catalog = collectPalettes(resolved);
    const sections: string[] = [fileHeader({ meta: resolved.meta })];

    sections.push(
        `export const customPalettes = ${serializeValue(catalog.custom, 0)} as const;`,
    );
    sections.push("");
    sections.push(
        `export const builtinPalettes = ${serializeValue(catalog.builtin, 0)} as const;`,
    );
    sections.push("");
    sections.push(
        `export const referencedBuiltinPalettes = ${serializeValue(catalog.referencedBuiltins, 0)} as const;`,
    );
    sections.push("");
    sections.push(
        `export const optInBuiltinPalettes = ${serializeValue(catalog.optInBuiltins, 0)} as const;`,
    );
    sections.push("");
    sections.push(
        `export const shadowedBuiltinPalettes = ${serializeValue(catalog.shadowedBuiltins, 0)} as const;`,
    );
    sections.push("");
    sections.push(
        `export const availableBuiltinPaletteNames = ${serializeValue(BUILTIN_PALETTE_NAMES as readonly string[] as string[], 0)} as const;`,
    );
    sections.push("");
    sections.push(
        `export const semanticPalettes = ${serializeValue(catalog.semantic, 0)} as const;`,
    );
    sections.push("");

    return sections.join("\n");
}
