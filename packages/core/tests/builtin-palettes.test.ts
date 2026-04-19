import { describe, it, expect, vi, beforeEach } from "vitest";
import {
    BUILTIN_PALETTES,
    BUILTIN_PALETTE_NAMES,
    isBuiltinPalette,
    resolveScale,
    _resetCollisionWarnings,
} from "../src/builtin-palettes.js";
import { resolveRefs } from "../src/resolver.js";
import { validateTokens } from "../src/validator.js";
import { generatePrimeVue } from "../src/generators/primevue.js";
import { generateUnoCSS } from "../src/generators/unocss-theme.js";
import type { AutoTokenSchema } from "../src/types.js";

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

describe("BUILTIN_PALETTES", () => {
    it("ships 22 named palettes", () => {
        expect(BUILTIN_PALETTE_NAMES.length).toBe(22);
    });

    it("each palette has all 11 standard steps with valid hex values", () => {
        const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
        for (const name of BUILTIN_PALETTE_NAMES) {
            const scale = BUILTIN_PALETTES[name];
            for (const step of steps) {
                const value = scale[step as keyof typeof scale];
                expect(HEX_RE.test(value), `${name}.${step} = ${value}`).toBe(true);
            }
        }
    });
});

describe("isBuiltinPalette", () => {
    it("recognizes builtin names", () => {
        expect(isBuiltinPalette("purple")).toBe(true);
        expect(isBuiltinPalette("indigo")).toBe(true);
        expect(isBuiltinPalette("eggplant")).toBe(false);
    });
});

describe("resolveScale", () => {
    beforeEach(() => _resetCollisionWarnings());

    it("returns user-defined scale when present", () => {
        const result = resolveScale("custom", {
            colors: { custom: BUILTIN_PALETTES.purple },
        });
        expect(result).toBe(BUILTIN_PALETTES.purple);
    });

    it("falls back to builtin when user scale is absent", () => {
        const result = resolveScale("purple", { colors: {} });
        expect(result).toBe(BUILTIN_PALETTES.purple);
    });

    it("returns undefined for unknown names", () => {
        expect(resolveScale("nonexistent", { colors: {} })).toBeUndefined();
    });

    it("warns once on user/builtin collision", () => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => { });
        const userPurple = { ...BUILTIN_PALETTES.purple, 500: "#abcdef" };
        resolveScale("purple", { colors: { purple: userPurple } });
        resolveScale("purple", { colors: { purple: userPurple } });
        expect(warn).toHaveBeenCalledTimes(1);
        expect(warn.mock.calls[0][0]).toContain("shadows builtin palette");
        warn.mockRestore();
    });
});

function autoTokensWithBuiltin(): AutoTokenSchema {
    return {
        meta: {
            name: "Builtin Test",
            darkModeStrategy: "class",
            darkModeSelector: ".dark",
        },
        primitive: {
            colors: {
                oatmeal: {
                    50: "#F7F4EE",
                    100: "#EDE8DD",
                    200: "#DDD5C4",
                    300: "#C7BAA2",
                    400: "#B09E80",
                    500: "#9A8568",
                    600: "#7D6B52",
                    700: "#615341",
                    800: "#4A3F32",
                    900: "#362E25",
                    950: "#211C17",
                },
            },
        },
        semantic: {
            colors: {
                primary: { scale: "purple" },
                success: { scale: "emerald" },
            },
            surface: {
                scale: "oatmeal",
                invertInDarkMode: true,
            },
        },
    };
}

describe("validator with builtin palettes", () => {
    it("accepts builtin scale names in semantic.colors", () => {
        const issues = validateTokens(autoTokensWithBuiltin());
        expect(issues).toEqual([]);
    });

    it("accepts builtin scale name in semantic.surface", () => {
        const tokens = autoTokensWithBuiltin();
        tokens.semantic.surface = { scale: "slate", darkScale: "zinc" };
        const issues = validateTokens(tokens);
        expect(issues).toEqual([]);
    });

    it("rejects unknown scale names with helpful message", () => {
        const tokens = autoTokensWithBuiltin();
        tokens.semantic.colors!.primary = { scale: "purpel" };
        const issues = validateTokens(tokens);
        expect(issues.length).toBeGreaterThan(0);
        expect(issues[0].path).toBe("semantic.colors.primary.scale");
        expect(issues[0].message).toContain('Unknown color scale "purpel"');
        expect(issues[0].message).toContain("purple");
    });

    it("rejects unknown surface scale", () => {
        const tokens = autoTokensWithBuiltin();
        tokens.semantic.surface = { scale: "moonbeam" };
        const issues = validateTokens(tokens);
        expect(issues.some((i) => i.path === "semantic.surface.scale")).toBe(true);
    });
});

describe("resolver with builtin palettes", () => {
    it("resolves refs into builtin palette steps", () => {
        const tokens: AutoTokenSchema = {
            ...autoTokensWithBuiltin(),
            primevue: {
                base: "aura",
                overrides: {
                    focusRing: { color: { ref: "colors.purple.500" } },
                },
            },
        };
        const resolved = resolveRefs(tokens);
        expect(resolved.primevue?.overrides?.focusRing?.color).toBe(
            BUILTIN_PALETTES.purple[500],
        );
    });
});

describe("generatePrimeVue with builtin palettes", () => {
    it("emits builtin purple as primary color scale", () => {
        const resolved = resolveRefs(autoTokensWithBuiltin());
        const output = generatePrimeVue(resolved);
        expect(output).toContain(`'500': '${BUILTIN_PALETTES.purple[500]}'`);
        expect(output).toContain(`'50': '${BUILTIN_PALETTES.purple[50]}'`);
    });
});

describe("generateUnoCSS with builtin palettes", () => {
    it("emits referenced builtin palettes into the colors export", () => {
        const resolved = resolveRefs(autoTokensWithBuiltin());
        const output = generateUnoCSS(resolved);
        expect(output).toContain("purple");
        expect(output).toContain(BUILTIN_PALETTES.purple[500]);
        expect(output).toContain("emerald");
        expect(output).toContain(BUILTIN_PALETTES.emerald[500]);
    });

    it("does not emit unreferenced builtin palettes", () => {
        const resolved = resolveRefs(autoTokensWithBuiltin());
        const output = generateUnoCSS(resolved);
        // fuchsia is not referenced anywhere, so its hex should not appear
        expect(output).not.toContain(BUILTIN_PALETTES.fuchsia[500]);
    });

    it("user-defined scale shadows the builtin in emitted output", () => {
        const tokens = autoTokensWithBuiltin();
        tokens.primitive.colors.purple = {
            ...BUILTIN_PALETTES.purple,
            500: "#abcdef",
        };
        _resetCollisionWarnings();
        const warn = vi.spyOn(console, "warn").mockImplementation(() => { });
        const resolved = resolveRefs(tokens);
        const output = generateUnoCSS(resolved);
        expect(output).toContain("#abcdef");
        expect(output).not.toContain(BUILTIN_PALETTES.purple[500]);
        warn.mockRestore();
    });
});
