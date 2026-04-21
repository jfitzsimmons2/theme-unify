import type { ColorScale } from "../types.js";
import type { ResolvedTokens } from "../types.js";
import {
    BUILTIN_PALETTES,
    BUILTIN_PALETTE_NAMES,
    isBuiltinPalette,
} from "../builtin-palettes.js";
import { fileHeader, serializeValue } from "./utils.js";

/**
 * Cataloged palette data describing every color scale theme-unify knows about
 * for a given config. Returned by `collectPalettes` and serialized by
 * `generatePalettes`.
 */
export interface PaletteCatalog {
    /** User-defined scales from `primitive.colors` (hex values). */
    custom: Record<string, ColorScale>;
    /** All builtin (PrimeVue / Tailwind v3 / Aura) palettes (hex values). */
    builtin: Record<string, ColorScale>;
    /** Subset of builtin palette names actually referenced by `semantic`. */
    referencedBuiltins: string[];
    /** Custom palette names that shadow a builtin of the same name. */
    shadowedBuiltins: string[];
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

    const builtin: Record<string, ColorScale> = {};
    for (const name of BUILTIN_PALETTE_NAMES) {
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

    return {
        custom,
        builtin,
        referencedBuiltins: [...referenced].sort(),
        shadowedBuiltins: shadowed,
    };
}

/**
 * Generate a `palettes.ts` file documenting every color scale available to
 * the current config: user palettes, all builtin (PrimeVue/Aura) palettes,
 * the subset of builtins actually referenced by semantic roles, and any
 * builtin names shadowed by custom palettes.
 *
 * Emitted exports: `customPalettes`, `builtinPalettes`,
 * `referencedBuiltinPalettes`, `shadowedBuiltinPalettes`,
 * `availableBuiltinPaletteNames`.
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
        `export const shadowedBuiltinPalettes = ${serializeValue(catalog.shadowedBuiltins, 0)} as const;`,
    );
    sections.push("");
    sections.push(
        `export const availableBuiltinPaletteNames = ${serializeValue(BUILTIN_PALETTE_NAMES as readonly string[] as string[], 0)} as const;`,
    );
    sections.push("");

    return sections.join("\n");
}
