import { describe, it, expect } from "vitest";
import { generatePreset, buildPresetObject, buildThemeOptions } from "../../src/generators/preset.js";
import { resolveRefs } from "../../src/resolver.js";
import { validTokens } from "../fixtures/tokens.fixture.js";

describe("generatePreset", () => {
    it("includes definePreset import + Aura import", () => {
        const out = generatePreset(resolveRefs(validTokens));
        expect(out).toContain("import { definePreset } from '@primeuix/themes';");
        expect(out).toContain("import Aura from '@primeuix/themes/aura';");
        expect(out).toContain("export const GeneratedPreset = definePreset(Aura,");
    });

    it("emits user palettes under primitive", () => {
        const obj = buildPresetObject(resolveRefs(validTokens));
        const prim = obj.primitive as Record<string, Record<string, string>>;
        expect(prim.beetroot["500"]).toBe("#D02B4B");
        expect(prim.oatmeal["500"]).toBe("#9A8568");
    });

    it("emits opt-in builtin palettes under primitive", () => {
        const obj = buildPresetObject(
            resolveRefs({
                meta: { name: "T" },
                primitive: { colors: {} },
                unocss: { includeBuiltinPalettes: ["purple"] },
            }),
        );
        const prim = obj.primitive as Record<string, Record<string, string>>;
        expect(prim.purple).toBeDefined();
        expect(prim.purple["500"]).toMatch(/^#[0-9a-fA-F]{6}$/);
        // Not opted in
        expect(prim.lime).toBeUndefined();
    });

    it("emits referenced builtin palettes under primitive", () => {
        const obj = buildPresetObject(
            resolveRefs({
                meta: { name: "T" },
                primitive: { colors: {} },
                semantic: { surface: { scale: "slate" } },
            }),
        );
        const prim = obj.primitive as Record<string, Record<string, string>>;
        expect(prim.slate).toBeDefined();
        expect(prim.slate["500"]).toMatch(/^#[0-9a-fA-F]{6}$/);
    });

    it("emits non-color primitives (spacing/borderRadius/shadow/font/fontWeight)", () => {
        const obj = buildPresetObject(resolveRefs(validTokens));
        const prim = obj.primitive as Record<string, Record<string, string>>;
        expect(prim.spacing.md).toBe("0.75rem");
        expect(prim.borderRadius.lg).toBe("1rem");
        expect(prim.shadow.sm).toContain("rgba");
        expect(prim.fontWeight.bold).toBe("700");
        expect(prim.font.family).toContain("Ringside");
        expect(prim.font.size).toBe("1.125rem");
        expect(prim.font.lineHeight).toBe("1.6");
    });

    it("emits semantic.primary as scale references", () => {
        const obj = buildPresetObject(resolveRefs(validTokens));
        const sem = obj.semantic as Record<string, Record<string, string>>;
        expect(sem.primary["500"]).toBe("{beetroot.500}");
        expect(sem.primary["50"]).toBe("{beetroot.50}");
    });

    it("emits semantic.extra roles as scale references", () => {
        const obj = buildPresetObject(resolveRefs(validTokens));
        const sem = obj.semantic as Record<string, Record<string, string>>;
        expect(sem.success["500"]).toBe("{kale.500}");
        expect(sem.warn["500"]).toBe("{carrot.500}");
    });

    it("canonicalizes legacy role names (warning → warn, error → danger)", () => {
        const obj = buildPresetObject(
            resolveRefs({
                meta: { name: "T" },
                primitive: { colors: {} },
                semantic: {
                    extra: { warning: "carrot", error: "beetroot" },
                },
            } as never),
        );
        const sem = obj.semantic as Record<string, Record<string, string>>;
        expect(sem.warn["500"]).toBe("{carrot.500}");
        expect(sem.danger["500"]).toBe("{beetroot.500}");
        expect(sem.warning).toBeUndefined();
        expect(sem.error).toBeUndefined();
    });

    it("passes non-canonical roles through verbatim", () => {
        const obj = buildPresetObject(
            resolveRefs({
                meta: { name: "T" },
                primitive: { colors: {} },
                semantic: { extra: { accent: "carrot" } },
            } as never),
        );
        const sem = obj.semantic as Record<string, Record<string, string>>;
        expect(sem.accent["500"]).toBe("{carrot.500}");
    });

    it("emits semantic.colorScheme.{light,dark}.surface", () => {
        const obj = buildPresetObject(resolveRefs(validTokens));
        const sem = obj.semantic as Record<string, Record<string, Record<string, Record<string, string>>>>;
        expect(sem.colorScheme.light.surface["0"]).toBe("#ffffff");
        expect(sem.colorScheme.light.surface["500"]).toBe("{oatmeal.500}");
        // Aura convention: surface.0 is `#ffffff` in BOTH light and dark —
        // it is the brightest possible surface, not a dark page background.
        expect(sem.colorScheme.dark.surface["0"]).toBe("#ffffff");
        expect(sem.colorScheme.dark.surface["500"]).toBe("{chickpea.500}");
    });

    it("merges preset.overrides into the result", () => {
        const obj = buildPresetObject(resolveRefs(validTokens));
        const sem = obj.semantic as Record<string, Record<string, unknown>>;
        const focusRing = sem.focusRing as Record<string, string>;
        expect(focusRing.width).toBe("3px");
        expect(focusRing.offset).toBe("2px");
        const formField = sem.formField as Record<string, string>;
        expect(formField.borderRadius).toBe("0.25rem");

        const components = obj.components as Record<string, unknown>;
        expect(components.card).toBeDefined();
    });

    it("supports inline ColorScale for semantic.primary", () => {
        const inline = {
            50: "#fff",
            100: "#eee",
            200: "#ddd",
            300: "#ccc",
            400: "#bbb",
            500: "#aaa",
            600: "#999",
            700: "#888",
            800: "#777",
            900: "#666",
            950: "#555",
        };
        const obj = buildPresetObject(
            resolveRefs({
                meta: { name: "T" },
                primitive: { colors: {} },
                semantic: { primary: inline },
            }),
        );
        const sem = obj.semantic as Record<string, Record<string, string>>;
        expect(sem.primary["500"]).toBe("#aaa");
    });

    it("emits semantic.zIndex when primitive.zIndex is provided", () => {
        const obj = buildPresetObject(resolveRefs(validTokens));
        const sem = obj.semantic as Record<string, Record<string, string>>;
        expect(sem.zIndex).toBeDefined();
        expect(sem.zIndex.modal).toBe("1200");
        expect(sem.zIndex.tooltip).toBe("1400");
    });

    it("omits semantic.zIndex when primitive.zIndex is absent", () => {
        const obj = buildPresetObject(
            resolveRefs({
                meta: { name: "T" },
                primitive: { colors: {} },
            }),
        );
        const sem = (obj.semantic ?? {}) as Record<string, unknown>;
        expect(sem.zIndex).toBeUndefined();
    });

    it("preset.overrides.semantic.colorScheme does not clobber zIndex", () => {
        const obj = buildPresetObject(
            resolveRefs({
                meta: { name: "T" },
                primitive: {
                    colors: {},
                    zIndex: { modal: "1200" },
                },
                preset: {
                    overrides: {
                        semantic: {
                            focusRing: { width: "2px" },
                        },
                    },
                },
            }),
        );
        const sem = obj.semantic as Record<string, Record<string, string>>;
        expect(sem.zIndex.modal).toBe("1200");
        expect((sem.focusRing as Record<string, string>).width).toBe("2px");
    });
});

describe("buildThemeOptions", () => {
    it("emits darkModeSelector from meta when strategy is class (default)", () => {
        const opts = buildThemeOptions(
            resolveRefs({
                meta: { name: "T", darkModeSelector: "[data-dark]" },
                primitive: { colors: {} },
            }),
        );
        expect(opts.darkModeSelector).toBe("[data-dark]");
    });

    it("defaults darkModeSelector to .dark when strategy is class and no selector set", () => {
        const opts = buildThemeOptions(
            resolveRefs({
                meta: { name: "T" },
                primitive: { colors: {} },
            }),
        );
        expect(opts.darkModeSelector).toBe(".dark");
    });

    it("emits .system when strategy is media", () => {
        const opts = buildThemeOptions(
            resolveRefs({
                meta: { name: "T", darkModeStrategy: "media" },
                primitive: { colors: {} },
            }),
        );
        expect(opts.darkModeSelector).toBe(".system");
    });

    it("ignores darkModeSelector when strategy is media", () => {
        const opts = buildThemeOptions(
            resolveRefs({
                meta: { name: "T", darkModeStrategy: "media", darkModeSelector: ".dark" },
                primitive: { colors: {} },
            }),
        );
        expect(opts.darkModeSelector).toBe(".system");
    });
});

describe("generatePreset output", () => {
    it("includes themeOptions export", () => {
        const out = generatePreset(resolveRefs(validTokens));
        expect(out).toContain("export const themeOptions");
        expect(out).toContain("darkModeSelector");
    });
});
