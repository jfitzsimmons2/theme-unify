import { describe, it, expect } from "vitest";
import { collectPalettes, generatePalettes } from "../../src/generators/palettes.js";
import { resolveRefs } from "../../src/resolver.js";

const camelTokens = {
    meta: { name: "T" },
    primitive: {
        colors: {
            eggplantPurple: {
                50: "#fff", 100: "#fff", 200: "#fff", 300: "#fff",
                400: "#fff", 500: "#abcdef", 600: "#fff", 700: "#fff",
                800: "#fff", 900: "#fff", 950: "#fff",
            },
            purple: {
                50: "#fff", 100: "#fff", 200: "#fff", 300: "#fff",
                400: "#fff", 500: "#123456", 600: "#fff", 700: "#fff",
                800: "#fff", 900: "#fff", 950: "#fff",
            },
        },
    },
    semantic: {
        primary: "eggplantPurple",
        surface: { scale: "slate" },
        extra: { success: "purple" },
    },
};

describe("collectPalettes", () => {
    it("emits a paletteClassNames map with kebab-case fragments", () => {
        const cat = collectPalettes(resolveRefs(camelTokens));
        expect(cat.classNames).toMatchObject({
            eggplantPurple: "eggplant-purple",
            purple: "purple",
            slate: "slate",
        });
    });

    it("decorates semantic entries with kebab className", () => {
        const cat = collectPalettes(resolveRefs(camelTokens));
        const primary = cat.semantic.find((e) => e.role === "primary");
        const success = cat.semantic.find((e) => e.role === "success");
        expect(primary?.className).toBe("primary");
        expect(success?.className).toBe("success");
        // Source still records the authored camelCase name for display
        expect(primary?.source).toBe("eggplantPurple");
    });

    it("flags purple as a shadowed builtin", () => {
        const cat = collectPalettes(resolveRefs(camelTokens));
        expect(cat.shadowedBuiltins).toContain("purple");
    });
});

describe("generatePalettes", () => {
    it("emits the new paletteClassNames export", () => {
        const out = generatePalettes(resolveRefs(camelTokens));
        expect(out).toContain("export const paletteClassNames");
        expect(out).toMatch(/eggplantPurple:\s*'eggplant-purple'/);
    });
});
