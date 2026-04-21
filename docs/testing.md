# Testing

## Setup

Tests live in [packages/core/tests](../packages/core/tests) and run under
[vitest](https://vitest.dev/). No vitest config file — defaults are fine.

```bash
pnpm --filter @jfitzsimmons2/theme-unify test           # one-shot
pnpm --filter @jfitzsimmons2/theme-unify test:watch     # watch mode
pnpm test                                # all packages (currently just core)
```

Run a single file:

```bash
pnpm --filter @jfitzsimmons2/theme-unify exec vitest run tests/generators/preset.test.ts
```

## Layout

```
packages/core/tests/
  builtin-palettes.test.ts
  resolver.test.ts
  validator.test.ts
  fixtures/
    tokens.fixture.ts        # shared validTokens used by every generator test
  generators/
    preset.test.ts
    uno-theme.test.ts
```

## Fixture pattern

[tokens.fixture.ts](../packages/core/tests/fixtures/tokens.fixture.ts)
exports a `validTokens: ThemeUnifyConfig` covering every section of the
schema. Use it as the default input for new generator tests:

```ts
import { resolveRefs } from "../../src/resolver.js";
import { validTokens } from "../fixtures/tokens.fixture.js";

const resolved = resolveRefs(validTokens);
```

Add narrow fixtures only when a test needs a specific edge case
(e.g. missing color step, circular ref) — in that case keep them inline
in the test file rather than polluting the shared fixture.

## Assertion style

Prefer **structural assertions** over snapshots:

- ✅ `expect(code).toMatch(/primary:\s*\{/)` — note `serializeObject`
  emits unquoted keys for valid identifiers, so don't write
  `'primary':`.
- ✅ Re-`eval`/parse the emitted code and assert against the resulting
  object (when feasible).
- ❌ `expect(code).toMatchSnapshot()` for color-rich output — snapshots
  churn on every primitive update and provide little signal.

Snapshots are fine for stable, format-only output (e.g. file headers).

## Adding a generator test

See [adding-a-generator.md](adding-a-generator.md#4-add-a-test).

## What to cover

For a new generator, at minimum:

1. The output starts with the standard `fileHeader({ meta })` — version
   line plus optional `theme: "<name>"`.
2. Every named export the public API promises is present.
3. A representative token from each `semantic` role appears in the
   output with its resolved value (or, for `uno-theme`, the matching
   `var(--p-*)` reference — never a raw hex).
4. Dark-mode-specific output (if any) is present and distinct from light.
5. Overrides from `preset.overrides` win over auto-derived defaults.

## What not to test here

- The CLI's process behavior (exit codes, IO) — no e2e harness yet.
  Manual verification via the playground is the current safety net.
- The Vite plugin — it's a placeholder; tests will land with the
  implementation.
