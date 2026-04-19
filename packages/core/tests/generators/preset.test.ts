import { describe, it, expect } from "vitest";
import { generatePreset, buildPresetObject } from "../../src/generators/preset.js";
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
        expect(sem.warning["500"]).toBe("{carrot.500}");
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
});
