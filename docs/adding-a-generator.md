# Adding a new generator

This walks through adding a hypothetical `generateTailwind` output. The
same pattern applies to any new format.

## 1. Create the generator file

`packages/core/src/generators/tailwind.ts`:

```ts
import type { ResolvedThemeUnifyConfig } from "../types.js";
import { fileHeader, serializeObject } from "./utils.js";

export function buildTailwindObject(
  resolved: ResolvedThemeUnifyConfig,
): Record<string, unknown> {
  // Pure transform from resolved tokens → output object
  return { /* … */ };
}

export function generateTailwind(
  resolved: ResolvedThemeUnifyConfig,
): string {
  const obj = buildTailwindObject(resolved);
  return (
    fileHeader() +
    `export const tailwindTheme = ${serializeObject(obj)} as const;\n`
  );
}
```

Use the existing generators as references:

- Simplest: [shortcuts.ts](../packages/core/src/generators/shortcuts.ts)
- Mid: [uno-theme.ts](../packages/core/src/generators/uno-theme.ts)
- Complex (with `definePreset` import + deep-merge):
  [preset.ts](../packages/core/src/generators/preset.ts)

## 2. Re-export from the public API

In [packages/core/src/index.ts](../packages/core/src/index.ts), add:

```ts
export {
  generateTailwind,
  buildTailwindObject,
} from "./generators/tailwind.js";
```

Note the `.js` extension — required because the package is built as ESM.

## 3. Wire into the CLI

In [packages/core/src/cli.ts](../packages/core/src/cli.ts):

1. Add an import for `generateTailwind`.
2. Add a `--tailwind <filename>` option with a sensible default
   (e.g. `tailwind-theme.ts`).
3. Call `generateTailwind(resolved)` alongside the existing generators.
4. Add it to the `--dry-run` output block.
5. Add a `writeOutput` entry to the `results` array.

## 4. Add a test

Create `packages/core/tests/generators/tailwind.test.ts` mirroring an
existing test such as
[uno-theme.test.ts](../packages/core/tests/generators/uno-theme.test.ts).
Use the shared fixture:

```ts
import { describe, it, expect } from "vitest";
import { resolveRefs } from "../../src/resolver.js";
import { generateTailwind } from "../../src/generators/tailwind.js";
import { validTokens } from "../fixtures/tokens.fixture.js";

describe("generateTailwind", () => {
  it("emits a valid module", () => {
    const code = generateTailwind(resolveRefs(validTokens));
    expect(code).toContain("export const tailwindTheme");
    // Structural assertions over the resulting code or rebuilt object…
  });
});
```

Prefer **structural assertions** (does it contain the expected keys with
the expected resolved values?) over snapshot tests. Note that
`serializeObject` emits unquoted keys for valid identifiers — match
against `/name:\s*\{/` rather than `/'name':/`. See
[testing.md](testing.md).

## 5. Update the playground (optional)

If you want the new output to be live:

1. Add `--tailwind tailwind-theme.ts` to the `generate` script in
   [packages/playground/package.json](../packages/playground/package.json).
2. Import the generated file from somewhere in
   [packages/playground/src](../packages/playground/src) so it actually
   gets used.

## 6. Document it

Add a section to [generators.md](generators.md) covering inputs, output
shape, and any conventions specific to the new format.
