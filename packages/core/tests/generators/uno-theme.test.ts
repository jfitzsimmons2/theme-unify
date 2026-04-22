import { describe, it, expect, beforeEach } from "vitest";
import { generateUnoTheme } from "../../src/generators/uno-theme.js";
import { resolveRefs } from "../../src/resolver.js";
import { validTokens } from "../fixtures/tokens.fixture.js";
import { _resetEffectiveBuiltinWarnings } from "../../src/effective-builtins.js";

describe("generateUnoTheme", () => {
    beforeEach(() => _resetEffectiveBuiltinWarnings());
    const out = generateUnoTheme(resolveRefs(validTokens));

    it("emits darkMode as 'class' when strategy is class (default)", () => {
        expect(out).toContain("export const darkMode = 'class'");
    });

    it("emits darkMode as 'media' when strategy is media", () => {
        const mediaOut = generateUnoTheme(
            resolveRefs({
                meta: { name: "M", darkModeStrategy: "media" },
                primitive: { colors: {} },
            }),
        );
        expect(mediaOut).toContain("export const darkMode = 'media'");
    });

    it("emits each user palette as var(--p-{name}-{step}) entries", () => {
        expect(out).toMatch(/beetroot:\s*\{/);
        expect(out).toContain("var(--p-beetroot-500)");
        expect(out).toContain("var(--p-oatmeal-50)");
    });

    it("emits primary + extra semantic roles as var-backed scales", () => {
        expect(out).toMatch(/primary:\s*\{/);
        expect(out).toContain("var(--p-primary-500)");
        expect(out).toMatch(/success:\s*\{/);
        expect(out).toContain("var(--p-success-500)");
        expect(out).toMatch(/warn:\s*\{/);
    });

    it("emits surface scale with `0` index", () => {
        expect(out).toMatch(/surface:\s*\{/);
        expect(out).toContain("var(--p-surface-0)");
        expect(out).toContain("var(--p-surface-950)");
    });

    it("emits spacing as var(--p-spacing-{key})", () => {
        expect(out).toContain("export const spacing");
        expect(out).toContain("var(--p-spacing-md)");
    });

    it("emits borderRadius as var(--p-border-radius-{key})", () => {
        expect(out).toContain("export const borderRadius");
        expect(out).toContain("var(--p-border-radius-lg)");
    });

    it("emits boxShadow as var(--p-shadow-{key})", () => {
        expect(out).toContain("export const boxShadow");
        expect(out).toContain("var(--p-shadow-md)");
    });

    it("emits fontFamily / fontSize / lineHeight from var(--p-font-*)", () => {
        expect(out).toContain("export const fontFamily");
        expect(out).toContain("var(--p-font-family)");
        expect(out).toContain("export const fontSize");
        expect(out).toContain("var(--p-font-size)");
        expect(out).toContain("var(--p-font-line-height)");
        expect(out).toContain("export const lineHeight");
    });

    it("emits fontWeight as var(--p-font-weight-{key})", () => {
        expect(out).toContain("export const fontWeight");
        expect(out).toContain("var(--p-font-weight-bold)");
    });

    it("never emits raw hex literals — values are CSS vars", () => {
        // user hex from primitive shouldn't appear in uno-theme output
        expect(out).not.toContain("#D02B4B");
        expect(out).not.toContain("#9A8568");
    });

    it("omits builtin palettes by default (no opt-in, not referenced)", () => {
        // The default fixture references no builtins via semantic and
        // does not opt any in via unocss.includeBuiltinPalettes, so
        // none of the 22 shipped builtins should appear in `colors`.
        expect(out).not.toMatch(/emerald:\s*\{/);
        expect(out).not.toMatch(/lime:\s*\{/);
        expect(out).not.toMatch(/purple:\s*\{/);
        // ...and no builtin hex either
        expect(out).not.toContain("#10b981");
    });

    it("emits referenced builtin palettes as CSS vars", () => {
        const refOut = generateUnoTheme(
            resolveRefs({
                meta: { name: "M" },
                primitive: { colors: {} },
                semantic: { surface: { scale: "slate" } },
            }),
        );
        expect(refOut).toMatch(/slate:\s*\{/);
        expect(refOut).toContain("var(--p-slate-500)");
        // Only `slate` — other builtins still excluded
        expect(refOut).not.toMatch(/emerald:\s*\{/);
    });

    it("emits opted-in builtin palettes as CSS vars", () => {
        const optOut = generateUnoTheme(
            resolveRefs({
                meta: { name: "M" },
                primitive: { colors: {} },
                unocss: { includeBuiltinPalettes: ["purple", "emerald"] },
            }),
        );
        expect(optOut).toMatch(/purple:\s*\{/);
        expect(optOut).toContain("var(--p-purple-500)");
        expect(optOut).toMatch(/emerald:\s*\{/);
        expect(optOut).toContain("var(--p-emerald-500)");
        // Not opted in
        expect(optOut).not.toMatch(/lime:\s*\{/);
        // No hex duplication for opted-in palettes
        expect(optOut).not.toContain("#10b981");
    });

    it("includes every builtin when includeBuiltinPalettes is `true`", () => {
        const allOut = generateUnoTheme(
            resolveRefs({
                meta: { name: "M" },
                primitive: { colors: {} },
                unocss: { includeBuiltinPalettes: true },
            }),
        );
        for (const name of ["emerald", "lime", "purple", "slate", "rose"]) {
            expect(allOut).toMatch(new RegExp(`${name}:\\s*\\{`));
            expect(allOut).toContain(`var(--p-${name}-500)`);
        }
    });

    it("user palettes shadow builtins of the same name (vars win)", () => {
        const shadowOut = generateUnoTheme(
            resolveRefs({
                meta: { name: "M" },
                primitive: {
                    colors: {
                        red: {
                            50: "#fff",
                            100: "#fff",
                            200: "#fff",
                            300: "#fff",
                            400: "#fff",
                            500: "#abcdef",
                            600: "#fff",
                            700: "#fff",
                            800: "#fff",
                            900: "#fff",
                            950: "#fff",
                        },
                    },
                },
            }),
        );
        // user `red` is emitted as vars (shadowing the builtin)
        expect(shadowOut).toContain("var(--p-red-500)");
        // builtin red hex must NOT appear
        expect(shadowOut).not.toContain("#ef4444");
    });

    it("warns once when an opted-in builtin is shadowed by a user palette", () => {
        const warnings: string[] = [];
        const origWarn = console.warn;
        console.warn = (msg: string) => warnings.push(msg);
        try {
            generateUnoTheme(
                resolveRefs({
                    meta: { name: "M" },
                    primitive: {
                        colors: {
                            red: {
                                50: "#fff", 100: "#fff", 200: "#fff", 300: "#fff",
                                400: "#fff", 500: "#fff", 600: "#fff", 700: "#fff",
                                800: "#fff", 900: "#fff", 950: "#fff",
                            },
                        },
                    },
                    unocss: { includeBuiltinPalettes: ["red"] },
                }),
            );
        } finally {
            console.warn = origWarn;
        }
        expect(warnings.some((w) => w.includes("shadows it"))).toBe(true);
    });

    it("emits breakpoints / zIndex / transitions / animation when present", () => {
        expect(out).toContain("export const breakpoints");
        expect(out).toMatch(/md:\s*['"]768px['"]/);
        expect(out).toContain("export const zIndex");
        expect(out).toMatch(/modal:\s*['"]1200['"]/);
        expect(out).toContain("export const transitionProperty");
        expect(out).toContain("export const transitionDuration");
        expect(out).toMatch(/base:\s*['"]200ms['"]/);
        expect(out).toContain("export const transitionTimingFunction");
        expect(out).toContain("cubic-bezier(0.2, 0, 0, 1)");
        expect(out).toContain("export const animation");
        expect(out).toMatch(/['"]fade-in['"]/);
    });

    it("always emits every optional export (as empty {}) when absent", () => {
        // Consumers statically import these names from the generated file,
        // so each must always be defined — even when the corresponding
        // primitive block is omitted from the user's tokens config.
        const minimal = generateUnoTheme(
            resolveRefs({
                meta: { name: "M" },
                primitive: { colors: {} },
            }),
        );
        for (const name of [
            "spacing",
            "borderRadius",
            "boxShadow",
            "fontFamily",
            "fontSize",
            "lineHeight",
            "fontWeight",
            "breakpoints",
            "zIndex",
            "transitionProperty",
            "transitionDuration",
            "transitionTimingFunction",
            "animation",
        ]) {
            expect(minimal).toContain(`export const ${name} = {`);
        }
    });

    it("emits each transition sub-bag with values when only one is present", () => {
        const onlyDuration = generateUnoTheme(
            resolveRefs({
                meta: { name: "M" },
                primitive: {
                    colors: {},
                    transitions: { duration: { base: "200ms" } },
                },
            }),
        );
        expect(onlyDuration).toMatch(/export const transitionDuration = \{\s*base/);
        // The other two are still emitted as empty objects so the export
        // names stay stable for consumers.
        expect(onlyDuration).toContain("export const transitionProperty = {} as const;");
        expect(onlyDuration).toContain(
            "export const transitionTimingFunction = {} as const;",
        );
    });

    it("kebab-cases camelCase palette keys and their var() refs", () => {
        // PrimeVue's toVariables kebab-cases every key when materializing
        // CSS variables, so theme-unify must do the same in its UnoCSS
        // export keys + `var()` references — otherwise `bg-eggplant-purple-500`
        // would resolve to an undefined `--p-eggplantPurple-500`.
        const camelOut = generateUnoTheme(
            resolveRefs({
                meta: { name: "M" },
                primitive: {
                    colors: {
                        eggplantPurple: {
                            50: "#fff", 100: "#fff", 200: "#fff", 300: "#fff",
                            400: "#fff", 500: "#abcdef", 600: "#fff", 700: "#fff",
                            800: "#fff", 900: "#fff", 950: "#fff",
                        },
                    },
                },
            }),
        );
        expect(camelOut).toMatch(/['"]?eggplant-purple['"]?:\s*\{/);
        expect(camelOut).toContain("var(--p-eggplant-purple-500)");
        // The literal camelCase form must NOT appear as either a key or var name
        expect(camelOut).not.toMatch(/eggplantPurple:\s*\{/);
        expect(camelOut).not.toContain("var(--p-eggplantPurple-500)");
    });

    it("kebab-cases camelCase spacing / radii / shadow / fontWeight keys", () => {
        const out = generateUnoTheme(
            resolveRefs({
                meta: { name: "M" },
                primitive: {
                    colors: {},
                    spacing: { extraLarge: "3rem" },
                    radii: { roundedFull: "9999px" },
                    shadows: { cardShadow: "0 1px 2px #0001" },
                    fontWeight: { extraBold: "800" },
                },
            }),
        );
        expect(out).toContain("var(--p-spacing-extra-large)");
        expect(out).toContain("var(--p-border-radius-rounded-full)");
        expect(out).toContain("var(--p-shadow-card-shadow)");
        expect(out).toContain("var(--p-font-weight-extra-bold)");
    });
});
