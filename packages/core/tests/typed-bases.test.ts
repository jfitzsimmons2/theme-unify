import { describe, expect, it } from "vitest";

import { defineTokens as defineAura } from "../src/typed-aura.js";
import { defineTokens as defineLara } from "../src/typed-lara.js";
import { defineTokens as defineMaterial } from "../src/typed-material.js";
import { defineTokens as defineNora } from "../src/typed-nora.js";

describe("per-base typed entries", () => {
    const minimal = {
        meta: { name: "T" },
        primitive: { colors: {} },
    } as const;

    it("aura defineTokens is identity", () => {
        expect(defineAura(minimal)).toBe(minimal);
    });

    it("lara defineTokens is identity", () => {
        expect(defineLara(minimal)).toBe(minimal);
    });

    it("nora defineTokens is identity", () => {
        expect(defineNora(minimal)).toBe(minimal);
    });

    it("material defineTokens is identity", () => {
        expect(defineMaterial(minimal)).toBe(minimal);
    });

    it("aura accepts a config with refs in preset.overrides", () => {
        const cfg = defineAura({
            meta: { name: "T" },
            primitive: {
                colors: {
                    brand: {
                        50: "#fff",
                        100: "#eee",
                        200: "#ddd",
                        300: "#ccc",
                        400: "#bbb",
                        500: "#aaa",
                        600: "#999",
                        700: "#777",
                        800: "#555",
                        900: "#333",
                        950: "#111",
                    },
                },
            },
            preset: {
                base: "aura",
                overrides: {
                    semantic: {
                        focusRing: {
                            width: "3px",
                            color: { ref: "colors.brand.500" },
                        },
                    },
                },
            },
        });
        expect(cfg.preset?.base).toBe("aura");
    });
});
