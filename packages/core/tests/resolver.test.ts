import { describe, it, expect } from "vitest";
import { resolveRefs } from "../src/resolver.js";
import { CircularReferenceError, UnresolvedRefError } from "../src/errors.js";
import type { TokenSchema } from "../src/types.js";
import { validTokens } from "./fixtures/tokens.fixture.js";

function minimalTokens(overrides?: Partial<TokenSchema>): TokenSchema {
  return {
    meta: {
      name: "Test",
      darkModeStrategy: "class",
      darkModeSelector: ".dark",
    },
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
  it("resolves simple color ref", () => {
    const tokens = minimalTokens({
      primevue: {
        base: "aura",
        colorScheme: {
          light: {
            primary: {
              color: { ref: "colors.red.500" },
            },
          },
        },
      },
    });

    const resolved = resolveRefs(tokens);
    expect(resolved.primevue?.colorScheme?.light?.primary.color).toBe(
      "#ef4444",
    );
  });

  it("resolves nested ref (semantic → primitive)", () => {
    const tokens = minimalTokens({
      semantic: {
        backgrounds: {
          page: { ref: "colors.red.50" },
        },
      },
      primevue: {
        base: "aura",
        colorScheme: {
          light: {
            formField: {
              background: { ref: "semantic.backgrounds.page" },
            },
          },
        },
      },
    });

    const resolved = resolveRefs(tokens);
    expect(resolved.primevue?.colorScheme?.light?.formField.background).toBe(
      "#fef2f2",
    );
  });

  it("resolves radii ref", () => {
    const tokens = minimalTokens({
      primevue: {
        base: "aura",
        formField: {
          borderRadius: { ref: "radii.sm" },
        },
      },
    });

    const resolved = resolveRefs(tokens);
    expect(resolved.primevue?.formField?.borderRadius).toBe("0.25rem");
  });

  it("passes through literal values unchanged", () => {
    const tokens = minimalTokens({
      primevue: {
        base: "aura",
        focusRing: {
          width: "3px",
          color: "{primary.color}",
        },
      },
    });

    const resolved = resolveRefs(tokens);
    expect(resolved.primevue?.focusRing?.width).toBe("3px");
    expect(resolved.primevue?.focusRing?.color).toBe("{primary.color}");
  });

  it("detects circular references", () => {
    const tokens: TokenSchema = {
      meta: {
        name: "Test",
        darkModeStrategy: "class",
        darkModeSelector: ".dark",
      },
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
      semantic: {
        backgrounds: {
          a: { ref: "semantic.backgrounds.b" },
          b: { ref: "semantic.backgrounds.a" },
        },
      },
      primevue: {
        base: "aura",
        colorScheme: {
          light: {
            test: {
              value: { ref: "semantic.backgrounds.a" },
            },
          },
        },
      },
    };

    expect(() => resolveRefs(tokens)).toThrow(CircularReferenceError);
  });

  it("throws on missing ref target", () => {
    const tokens = minimalTokens({
      primevue: {
        base: "aura",
        colorScheme: {
          light: {
            primary: {
              color: { ref: "colors.grape.500" },
            },
          },
        },
      },
    });

    expect(() => resolveRefs(tokens)).toThrow(UnresolvedRefError);
  });

  it("resolves full fixture without errors", () => {
    const resolved = resolveRefs(validTokens);
    expect(resolved.meta.name).toBe("Test Theme");
    expect(resolved.primevue?.colorScheme?.light?.primary.color).toBe(
      "#D02B4B",
    );
    expect(resolved.primevue?.colorScheme?.dark?.primary.color).toBe("#EF8E9E");
    expect(resolved.primevue?.formField?.borderRadius).toBe("0.25rem");
  });
});
