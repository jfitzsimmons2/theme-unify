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

    describe("meta.darkModeSelector", () => {
        const cases: Array<[string, string]> = [
            [".dark", "class selector"],
            ["#app.dark", "id + class"],
            ["[data-theme='dark']", "attribute selector"],
            ["[data-theme=dark]", "unquoted attribute"],
            [":where(.dark) &", "where + nesting"],
            [":is(html.dark, body.dark)", "is() list"],
            ["html.dark body", "descendant combinator"],
        ];
        for (const [sel, label] of cases) {
            it(`accepts ${label} (${sel})`, () => {
                const tokens = minimalTokens();
                tokens.meta.darkModeSelector = sel;
                expect(validateTokens(tokens)).toEqual([]);
            });
        }

        const invalid: Array<[unknown, string]> = [
            ["", "empty string"],
            ["   ", "whitespace only"],
            ["> .dark", "leading combinator"],
            [".dark[", "unbalanced bracket"],
            [":where(.dark", "unbalanced paren"],
            [123 as unknown, "non-string"],
        ];
        for (const [sel, label] of invalid) {
            it(`rejects ${label}`, () => {
                const tokens = minimalTokens();
                (tokens.meta as { darkModeSelector: unknown }).darkModeSelector = sel;
                const issues = validateTokens(tokens);
                expect(issues.some((i) => i.path === "meta.darkModeSelector")).toBe(true);
            });
        }
    });

    describe("semantic role canonicalization", () => {
        it("emits a warning-severity issue for deprecated `warning` alias", () => {
            const tokens = minimalTokens({
                semantic: { extra: { warning: "red" } },
            });
            const issues = validateTokens(tokens);
            const issue = issues.find((i) => i.path === "semantic.extra.warning");
            expect(issue).toBeDefined();
            expect(issue?.severity).toBe("warning");
            expect(issue?.message).toContain('"warn"');
        });

        it("emits a warning-severity issue for deprecated `error` alias", () => {
            const tokens = minimalTokens({
                semantic: { extra: { error: "red" } },
            });
            const issues = validateTokens(tokens);
            const issue = issues.find((i) => i.path === "semantic.extra.error");
            expect(issue).toBeDefined();
            expect(issue?.severity).toBe("warning");
            expect(issue?.message).toContain('"danger"');
        });

        it("emits an info-severity issue for non-canonical role names", () => {
            const tokens = minimalTokens({
                semantic: { extra: { accent: "red" } },
            });
            const issues = validateTokens(tokens);
            const issue = issues.find((i) => i.path === "semantic.extra.accent");
            expect(issue).toBeDefined();
            expect(issue?.severity).toBe("info");
        });

        it("does not throw severity-error issues for legacy or custom roles", () => {
            const tokens = minimalTokens({
                semantic: {
                    extra: { warning: "red", error: "red", accent: "red" },
                },
            });
            const issues = validateTokens(tokens);
            const errors = issues.filter(
                (i) => (i.severity ?? "error") === "error",
            );
            expect(errors).toEqual([]);
        });

        it("produces zero role-related issues when only canonical names are used", () => {
            const tokens = minimalTokens({
                semantic: { extra: { success: "red", warn: "red", danger: "red" } },
            });
            const issues = validateTokens(tokens).filter((i) =>
                i.path.startsWith("semantic.extra."),
            );
            expect(issues).toEqual([]);
        });
    });

    describe("breakpoints / zIndex / transitions / animations", () => {
        it("rejects an invalid breakpoint value", () => {
            const tokens = minimalTokens();
            tokens.primitive.breakpoints = { md: "wide" };
            const issues = validateTokens(tokens);
            expect(
                issues.some((i) => i.path === "primitive.breakpoints.md"),
            ).toBe(true);
        });

        it("rejects breakpoints in non-length units (e.g. ms)", () => {
            const tokens = minimalTokens();
            tokens.primitive.breakpoints = { md: "640ms" };
            const issues = validateTokens(tokens);
            expect(
                issues.some((i) => i.path === "primitive.breakpoints.md"),
            ).toBe(true);
        });

        it("accepts valid px/rem/em breakpoints", () => {
            const tokens = minimalTokens();
            tokens.primitive.breakpoints = {
                sm: "640px",
                md: "48rem",
                lg: "60em",
            };
            const issues = validateTokens(tokens).filter((i) =>
                i.path.startsWith("primitive.breakpoints."),
            );
            expect(issues).toEqual([]);
        });

        it("rejects an invalid z-index value", () => {
            const tokens = minimalTokens();
            tokens.primitive.zIndex = { modal: "high" };
            const issues = validateTokens(tokens);
            expect(issues.some((i) => i.path === "primitive.zIndex.modal")).toBe(true);
        });

        it("accepts auto and negative integers for z-index", () => {
            const tokens = minimalTokens();
            tokens.primitive.zIndex = { base: "auto", below: "-1", modal: "1200" };
            const issues = validateTokens(tokens).filter((i) =>
                i.path.startsWith("primitive.zIndex."),
            );
            expect(issues).toEqual([]);
        });

        it("rejects empty transition duration / timing function values", () => {
            const tokens = minimalTokens();
            tokens.primitive.transitions = {
                duration: { fast: "" },
                timingFunction: { standard: "" },
            };
            const issues = validateTokens(tokens);
            expect(
                issues.some(
                    (i) => i.path === "primitive.transitions.duration.fast",
                ),
            ).toBe(true);
            expect(
                issues.some(
                    (i) =>
                        i.path === "primitive.transitions.timingFunction.standard",
                ),
            ).toBe(true);
        });

        it("rejects empty animation shorthand", () => {
            const tokens = minimalTokens();
            tokens.primitive.animations = { "fade-in": "" };
            const issues = validateTokens(tokens);
            expect(
                issues.some((i) => i.path === "primitive.animations.fade-in"),
            ).toBe(true);
        });

        it("resolves refs that use breakpoints / zIndex / transitions / animations aliases", () => {
            const tokens = minimalTokens({
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
                    zIndex: { modal: "1200" },
                    breakpoints: { md: "768px" },
                },
                preset: {
                    overrides: {
                        semantic: {
                            myZ: { ref: "zIndex.modal" },
                            myBp: { ref: "breakpoints.md" },
                        },
                    },
                },
            });
            const issues = validateTokens(tokens);
            expect(
                issues.filter((i) => i.message.startsWith("Unresolved ref")),
            ).toEqual([]);
        });
    });

    describe("meta.darkModeStrategy", () => {
        it("accepts 'class' strategy", () => {
            const tokens = minimalTokens();
            tokens.meta.darkModeStrategy = "class";
            const issues = validateTokens(tokens).filter(
                (i) => i.path === "meta.darkModeStrategy",
            );
            expect(issues).toEqual([]);
        });

        it("accepts 'media' strategy", () => {
            const tokens = minimalTokens();
            tokens.meta.darkModeStrategy = "media";
            // Remove selector to avoid the "ignored" warning
            delete tokens.meta.darkModeSelector;
            const issues = validateTokens(tokens).filter(
                (i) => i.path === "meta.darkModeStrategy",
            );
            expect(issues).toEqual([]);
        });

        it("rejects an invalid strategy", () => {
            const tokens = minimalTokens();
            (tokens.meta as { darkModeStrategy: unknown }).darkModeStrategy = "manual";
            const issues = validateTokens(tokens);
            const issue = issues.find((i) => i.path === "meta.darkModeStrategy");
            expect(issue).toBeDefined();
            expect(issue?.message).toContain('"manual"');
            expect(issue?.message).toContain('"class"');
            expect(issue?.message).toContain('"media"');
        });

        it("warns when darkModeSelector is set with media strategy", () => {
            const tokens = minimalTokens();
            tokens.meta.darkModeStrategy = "media";
            tokens.meta.darkModeSelector = ".dark";
            const issues = validateTokens(tokens);
            const issue = issues.find((i) => i.path === "meta.darkModeSelector");
            expect(issue).toBeDefined();
            expect(issue?.severity).toBe("warning");
            expect(issue?.message).toContain("ignored");
        });

        it("defaults to 'class' when strategy is omitted", () => {
            const tokens = minimalTokens();
            delete tokens.meta.darkModeStrategy;
            tokens.meta.darkModeSelector = ".dark";
            const issues = validateTokens(tokens).filter(
                (i) =>
                    i.path === "meta.darkModeStrategy" ||
                    i.path === "meta.darkModeSelector",
            );
            expect(issues).toEqual([]);
        });
    });
});
