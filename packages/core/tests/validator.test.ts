import { describe, it, expect } from "vitest";
import { validateTokens } from "../src/validator.js";
import type { ThemeUnifyConfig } from "../src/types.js";
import { validTokens } from "./fixtures/tokens.fixture.js";

function minimalTokens(overrides?: Partial<ThemeUnifyConfig>): ThemeUnifyConfig {
    return {
        meta: { name: "Test", darkModeSelector: ".dark" },
        primitive: {
            colors: {
                red: {
                    50: "#fef2f2",
                    100: "#fee2e2",
                    200: "#fecaca",
                    300: "#fca5a5",
                    400: "#f87171",
                    500: "#ef4444",
                    600: "#dc2626",
                    700: "#b91c1c",
                    800: "#991b1b",
                    900: "#7f1d1d",
                    950: "#450a0a",
                },
            },
        },
        ...overrides,
    };
}

describe("validateTokens", () => {
    it("passes for valid full fixture", () => {
        expect(validateTokens(validTokens)).toEqual([]);
    });

    it("rejects invalid color step", () => {
        const tokens = minimalTokens();
        (tokens.primitive.colors.red as Record<number, string>)[42] = "#bad";
        const issues = validateTokens(tokens);
        expect(issues.length).toBeGreaterThan(0);
        expect(issues[0].message).toContain('Invalid color step "42"');
    });

    it("rejects unknown PrimeVue base theme", () => {
        const tokens = minimalTokens({
            preset: { base: "nord" as never },
        });
        const issues = validateTokens(tokens);
        expect(issues.some((i) => i.message.includes('Unknown base theme "nord"'))).toBe(true);
    });

    it("rejects invalid CSS value in spacing", () => {
        const tokens = minimalTokens();
        tokens.primitive.spacing = { xs: "banana" };
        const issues = validateTokens(tokens);
        expect(issues.some((i) => i.message.includes('Invalid CSS value "banana"'))).toBe(true);
    });

    it("rejects unresolved ref", () => {
        const tokens = minimalTokens({
            preset: {
                base: "aura",
                overrides: {
                    semantic: {
                        focusRing: { color: { ref: "colors.grape.500" } },
                    },
                },
            },
        });
        const issues = validateTokens(tokens);
        expect(issues.some((i) => i.message.includes('Unresolved ref "colors.grape.500"'))).toBe(true);
    });

    it("rejects unknown semantic.primary scale name", () => {
        const tokens = minimalTokens({ semantic: { primary: "moonbeam" } });
        const issues = validateTokens(tokens);
        expect(issues.some((i) => i.path === "semantic.primary")).toBe(true);
    });

    it("accepts inline ColorScale for semantic.primary", () => {
        const tokens = minimalTokens({
            semantic: {
                primary: {
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
                },
            },
        });
        expect(validateTokens(tokens)).toEqual([]);
    });
});
