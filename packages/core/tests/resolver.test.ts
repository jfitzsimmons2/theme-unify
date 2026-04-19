import { describe, it, expect } from "vitest";
import { resolveRefs } from "../src/resolver.js";
import { CircularReferenceError, UnresolvedRefError } from "../src/errors.js";
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
            radii: { sm: "0.25rem", md: "0.5rem" },
        },
        ...overrides,
    };
}

describe("resolveRefs", () => {
    it("resolves color ref inside preset overrides", () => {
        const tokens = minimalTokens({
            preset: {
                base: "aura",
                overrides: {
                    semantic: {
                        focusRing: { color: { ref: "colors.red.500" } },
                    },
                },
            },
        });
        const resolved = resolveRefs(tokens);
        const sem = (resolved.preset?.overrides as Record<string, Record<string, Record<string, unknown>>>).semantic;
        expect(sem.focusRing.color).toBe("#ef4444");
    });

    it("resolves radii ref", () => {
        const tokens = minimalTokens({
            preset: {
                base: "aura",
                overrides: {
                    semantic: {
                        formField: { borderRadius: { ref: "radii.sm" } },
                    },
                },
            },
        });
        const resolved = resolveRefs(tokens);
        const sem = (resolved.preset?.overrides as Record<string, Record<string, Record<string, unknown>>>).semantic;
        expect(sem.formField.borderRadius).toBe("0.25rem");
    });

    it("passes literal `{primary.color}` strings through unchanged", () => {
        const tokens = minimalTokens({
            preset: {
                base: "aura",
                overrides: {
                    semantic: {
                        focusRing: { width: "3px", color: "{primary.color}" },
                    },
                },
            },
        });
        const resolved = resolveRefs(tokens);
        const sem = (resolved.preset?.overrides as Record<string, Record<string, Record<string, unknown>>>).semantic;
        expect(sem.focusRing.color).toBe("{primary.color}");
    });

    it("detects circular refs", () => {
        const tokens = minimalTokens({
            preset: {
                base: "aura",
                overrides: {
                    a: { ref: "preset.overrides.b" },
                    b: { ref: "preset.overrides.a" },
                    test: { value: { ref: "preset.overrides.a" } },
                },
            },
        });
        expect(() => resolveRefs(tokens)).toThrow(CircularReferenceError);
    });

    it("throws on missing ref target", () => {
        const tokens = minimalTokens({
            preset: {
                base: "aura",
                overrides: {
                    test: { color: { ref: "colors.grape.500" } },
                },
            },
        });
        expect(() => resolveRefs(tokens)).toThrow(UnresolvedRefError);
    });

    it("resolves full fixture without errors", () => {
        const resolved = resolveRefs(validTokens);
        expect(resolved.meta.name).toBe("Test Theme");
        const sem = (resolved.preset?.overrides as Record<string, Record<string, Record<string, unknown>>>).semantic;
        expect(sem.formField.borderRadius).toBe("0.25rem");
    });
});
