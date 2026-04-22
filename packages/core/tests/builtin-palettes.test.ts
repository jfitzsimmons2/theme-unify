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
import { generatePreset } from "../src/generators/preset.js";
import { generateUnoTheme } from "../src/generators/uno-theme.js";
import type { ThemeUnifyConfig } from "../src/types.js";

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

function tokensWithBuiltin(): ThemeUnifyConfig {
    return {
        meta: { name: "Builtin Test", darkModeSelector: ".dark" },
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
            primary: "purple",
            surface: { scale: "oatmeal", darkScale: "slate" },
            extra: { success: "emerald" },
        },
    };
}

describe("validator with builtin palettes", () => {
    it("accepts builtin scale names in semantic", () => {
        expect(validateTokens(tokensWithBuiltin())).toEqual([]);
    });

    it("rejects unknown scale names", () => {
        const tokens = tokensWithBuiltin();
        tokens.semantic!.primary = "purpel";
        const issues = validateTokens(tokens);
        expect(issues.some((i) => i.path === "semantic.primary")).toBe(true);
        expect(issues[0].message).toContain("purple");
    });
});

describe("generatePreset with builtin palettes", () => {
    it("emits semantic.primary as references to the builtin scale", () => {
        const resolved = resolveRefs(tokensWithBuiltin());
        const output = generatePreset(resolved);
        // semantic.primary should reference {purple.500}
        expect(output).toContain("{purple.500}");
        // semantic.colorScheme.dark.surface should reference {slate.X}
        expect(output).toContain("{slate.500}");
    });
});

describe("generateUnoTheme with builtin palettes", () => {
    it("emits referenced builtin palettes as var(--p-*) entries", () => {
        const resolved = resolveRefs(tokensWithBuiltin());
        const output = generateUnoTheme(resolved);
        expect(output).toMatch(/purple:\s*\{/);
        expect(output).toContain("var(--p-purple-500)");
        expect(output).toMatch(/emerald:\s*\{/);
        expect(output).toContain("var(--p-emerald-500)");
    });
});

describe("collectPalettes (catalog)", () => {
    it("includes only referenced builtins by default", async () => {
        const { collectPalettes } = await import("../src/generators/palettes.js");
        const catalog = collectPalettes(resolveRefs(tokensWithBuiltin()));
        expect(catalog.referencedBuiltins).toEqual(["emerald", "purple", "slate"]);
        expect(catalog.optInBuiltins).toEqual([]);
        expect(Object.keys(catalog.builtin).sort()).toEqual([
            "emerald",
            "purple",
            "slate",
        ]);
    });

    it("includes opt-in builtins on top of referenced ones", async () => {
        const { collectPalettes } = await import("../src/generators/palettes.js");
        const tokens = tokensWithBuiltin();
        tokens.unocss = { includeBuiltinPalettes: ["lime", "purple"] };
        const catalog = collectPalettes(resolveRefs(tokens));
        // `purple` is referenced, so it stays in referencedBuiltins (not optIn)
        expect(catalog.optInBuiltins).toEqual(["lime"]);
        expect(Object.keys(catalog.builtin).sort()).toEqual([
            "emerald",
            "lime",
            "purple",
            "slate",
        ]);
    });

    it("includes every builtin when opt-in is `true`", async () => {
        const { collectPalettes } = await import("../src/generators/palettes.js");
        const tokens = tokensWithBuiltin();
        tokens.unocss = { includeBuiltinPalettes: true };
        const catalog = collectPalettes(resolveRefs(tokens));
        expect(Object.keys(catalog.builtin).length).toBe(BUILTIN_PALETTE_NAMES.length);
    });

    it("describes semantic roles with their backing scale and source kind", async () => {
        const { collectPalettes } = await import("../src/generators/palettes.js");
        const catalog = collectPalettes(resolveRefs(tokensWithBuiltin()));
        expect(catalog.semantic).toEqual([
            { role: "primary", className: "primary", source: "purple", sourceKind: "builtin" },
            {
                role: "surface",
                className: "surface",
                source: "oatmeal",
                sourceKind: "custom",
                darkSource: "slate",
                darkSourceKind: "builtin",
            },
            { role: "success", className: "success", source: "emerald", sourceKind: "builtin" },
        ]);
    });

    it("canonicalizes legacy extra role names and flags inline scales", async () => {
        const { collectPalettes } = await import("../src/generators/palettes.js");
        const tokens = tokensWithBuiltin();
        tokens.semantic!.primary = {
            50: "#ffffff",
            100: "#eeeeee",
            200: "#dddddd",
            300: "#cccccc",
            400: "#bbbbbb",
            500: "#aaaaaa",
            600: "#999999",
            700: "#777777",
            800: "#555555",
            900: "#333333",
            950: "#111111",
        };
        tokens.semantic!.extra = { warning: "orange", error: "rose" };
        const catalog = collectPalettes(resolveRefs(tokens));
        const roles = catalog.semantic.map((e) => ({
            role: e.role,
            source: e.source,
            sourceKind: e.sourceKind,
        }));
        expect(roles).toEqual([
            { role: "primary", source: null, sourceKind: "inline" },
            { role: "surface", source: "oatmeal", sourceKind: "custom" },
            { role: "warn", source: "orange", sourceKind: "builtin" },
            { role: "danger", source: "rose", sourceKind: "builtin" },
        ]);
    });
});

describe("validator with includeBuiltinPalettes", () => {
    it("accepts a valid array", () => {
        const tokens = tokensWithBuiltin();
        tokens.unocss = { includeBuiltinPalettes: ["lime", "rose"] };
        expect(validateTokens(tokens)).toEqual([]);
    });

    it("accepts boolean values", () => {
        const tokens = tokensWithBuiltin();
        tokens.unocss = { includeBuiltinPalettes: true };
        expect(validateTokens(tokens)).toEqual([]);
        tokens.unocss = { includeBuiltinPalettes: false };
        expect(validateTokens(tokens)).toEqual([]);
    });

    it("rejects unknown palette names", () => {
        const tokens = tokensWithBuiltin();
        tokens.unocss = {
            includeBuiltinPalettes: ["lime", "purpel" as never],
        };
        const issues = validateTokens(tokens);
        expect(
            issues.some((i) =>
                i.path === "unocss.includeBuiltinPalettes.1" &&
                i.message.includes("purpel"),
            ),
        ).toBe(true);
    });

    it("rejects non-boolean / non-array values", () => {
        const tokens = tokensWithBuiltin();
        tokens.unocss = { includeBuiltinPalettes: "all" as never };
        const issues = validateTokens(tokens);
        expect(
            issues.some((i) => i.path === "unocss.includeBuiltinPalettes"),
        ).toBe(true);
    });
});
