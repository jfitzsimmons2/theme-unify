import { describe, it, expect } from "vitest";
import { validateTokens } from "../src/validator.js";
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
    },
    ...overrides,
  };
}

describe("validateTokens", () => {
  it("passes for valid full fixture", () => {
    const issues = validateTokens(validTokens);
    expect(issues).toEqual([]);
  });

  it("rejects invalid color step", () => {
    const tokens = {
      ...minimalTokens(),
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
            42: "#bad", // invalid step
          } as Record<number, string>,
        },
      },
    } as TokenSchema;

    const issues = validateTokens(tokens);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].message).toContain('Invalid color step "42"');
  });

  it("rejects unknown PrimeVue base theme", () => {
    const tokens = minimalTokens({
      primevue: {
        base: "nord" as never,
      },
    });

    const issues = validateTokens(tokens);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].message).toContain('Unknown base theme "nord"');
  });

  it("rejects invalid CSS value in spacing", () => {
    const tokens = minimalTokens();
    tokens.primitive.spacing = { xs: "banana" };

    const issues = validateTokens(tokens);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].message).toContain('Invalid CSS value "banana"');
  });

  it("rejects unresolved ref", () => {
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

    const issues = validateTokens(tokens);
    expect(
      issues.some((i) =>
        i.message.includes('Unresolved ref "colors.grape.500"'),
      ),
    ).toBe(true);
  });
});
