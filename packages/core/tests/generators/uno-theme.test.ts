import { describe, it, expect } from "vitest";
import { generateUnoTheme } from "../../src/generators/uno-theme.js";
import { resolveRefs } from "../../src/resolver.js";
import { validTokens } from "../fixtures/tokens.fixture.js";

describe("generateUnoTheme", () => {
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

    it("omits breakpoints / zIndex / transitions / animation when absent", () => {
        const minimal = generateUnoTheme(
            resolveRefs({
                meta: { name: "M" },
                primitive: { colors: {} },
            }),
        );
        expect(minimal).not.toContain("export const breakpoints");
        expect(minimal).not.toContain("export const zIndex");
        expect(minimal).not.toContain("export const transitionProperty");
        expect(minimal).not.toContain("export const transitionDuration");
        expect(minimal).not.toContain("export const transitionTimingFunction");
        expect(minimal).not.toContain("export const animation");
    });

    it("emits each transition sub-bag independently", () => {
        const onlyDuration = generateUnoTheme(
            resolveRefs({
                meta: { name: "M" },
                primitive: {
                    colors: {},
                    transitions: { duration: { base: "200ms" } },
                },
            }),
        );
        expect(onlyDuration).toContain("export const transitionDuration");
        expect(onlyDuration).not.toContain("export const transitionProperty");
        expect(onlyDuration).not.toContain("export const transitionTimingFunction");
    });
});
