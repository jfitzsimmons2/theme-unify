/**
 * Compute the effective set of builtin palettes that should be emitted
 * alongside user-defined `primitive.colors`.
 *
 * The effective set is the union of:
 *
 * 1. **Referenced builtins** — names mentioned in `semantic.primary`,
 *    `semantic.surface.scale`/`darkScale`, or `semantic.extra.*`. These
 *    are required for the auto-generated preset to resolve and are
 *    always included.
 * 2. **Opt-in builtins** — names declared via
 *    `unocss.includeBuiltinPalettes`. `true` opts in every builtin,
 *    an array opts in just the listed names. Defaults to `false` (no
 *    extras).
 *
 * User palettes always win over builtins of the same name. When an
 * opted-in builtin name is shadowed by a user palette, a one-time
 * `console.warn` is emitted (mirroring the warning produced by
 * `resolveScale`).
 *
 * @packageDocumentation
 */

import type { ResolvedTokens } from "./types.js";
import {
    BUILTIN_PALETTE_NAMES,
    isBuiltinPalette,
    type BuiltinPaletteName,
} from "./builtin-palettes.js";

const warnedShadowOptIns = new Set<string>();

/** Test-only: reset the opt-in shadow warning memo. */
export function _resetEffectiveBuiltinWarnings(): void {
    warnedShadowOptIns.clear();
}

/**
 * Names of builtin palettes referenced by `semantic` — always emitted
 * regardless of `unocss.includeBuiltinPalettes`.
 */
export function collectReferencedBuiltins(
    resolved: ResolvedTokens,
): Set<BuiltinPaletteName> {
    const names = new Set<BuiltinPaletteName>();
    const sem = resolved.semantic;
    if (!sem) return names;

    const add = (name: unknown): void => {
        if (typeof name === "string" && isBuiltinPalette(name)) {
            names.add(name);
        }
    };

    add(sem.primary);
    if (sem.surface) {
        add(sem.surface.scale);
        add(sem.surface.darkScale);
    }
    if (sem.extra) {
        for (const v of Object.values(sem.extra)) add(v);
    }
    return names;
}

/**
 * Names of builtin palettes opted in via `unocss.includeBuiltinPalettes`.
 *
 * Filters out names already shadowed by `primitive.colors` and emits a
 * one-time `console.warn` for each shadow.
 */
export function collectOptInBuiltins(
    resolved: ResolvedTokens,
): Set<BuiltinPaletteName> {
    const names = new Set<BuiltinPaletteName>();
    const opt = resolved.unocss?.includeBuiltinPalettes;
    if (!opt) return names;

    const userPalettes = resolved.primitive.colors ?? {};
    const candidates: readonly BuiltinPaletteName[] =
        opt === true ? BUILTIN_PALETTE_NAMES : opt;

    for (const name of candidates) {
        if (!isBuiltinPalette(name)) continue;
        if (userPalettes[name]) {
            if (!warnedShadowOptIns.has(name)) {
                warnedShadowOptIns.add(name);
                console.warn(
                    `[theme-unify] unocss.includeBuiltinPalettes lists "${name}", but primitive.colors.${name} shadows it. Using user definition.`,
                );
            }
            continue;
        }
        names.add(name);
    }
    return names;
}

/**
 * Combined set of builtin palette names that should be emitted by
 * generators. Excludes names shadowed by user-defined
 * `primitive.colors`.
 */
export function collectEffectiveBuiltins(
    resolved: ResolvedTokens,
): Set<BuiltinPaletteName> {
    const out = new Set<BuiltinPaletteName>();
    const userPalettes = resolved.primitive.colors ?? {};
    for (const name of collectReferencedBuiltins(resolved)) {
        if (!userPalettes[name]) out.add(name);
    }
    for (const name of collectOptInBuiltins(resolved)) out.add(name);
    return out;
}
