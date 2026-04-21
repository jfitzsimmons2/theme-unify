# Project change suggestions

Concrete proposals to make `theme-unify` easier to **adopt**, **author
configs in**, and **integrate** into downstream projects. Ordered
roughly by user-visible impact / effort ratio. Each item lists the
*pain point* it addresses, the *proposed change*, and the *trade-offs*
so you can cherry-pick.

---

## 1. Promote `defineTypedTokens` into the published package — ✅ shipped in 0.3.0

Shipped as five new entry points: `theme-unify/typed` (generic
`defineTypedTokens<Preset>()`) plus `theme-unify/aura`,
`theme-unify/lara`, `theme-unify/nora`, and `theme-unify/material`
(each re-exports `defineTokens` pre-bound to that PrimeUix preset).
`@primeuix/themes` is now an optional peer dependency, so the bare
`theme-unify` import remains zero-dep.

---

## 2. Implement `--watch` and a real Vite plugin

**Pain.** `--watch` prints a "not implemented" warning. The `vite`
entry is a placeholder. Users today wire it up themselves via a
`predev` script + manual file watcher.

**Proposal.**

- CLI: watch the config file (and any `import`-ed deps via `jiti`'s
  resolver hook), debounce, regenerate, exit gracefully on SIGINT.
- Vite plugin: `themeUnify({ config, outDir })` that calls the same
  pipeline on `buildStart`, registers the config path as a watched
  file, and triggers a server reload after writes.

**Trade-offs.** Watching transitive imports requires walking the jiti
module graph. A simpler v1 watches just the config file and re-loads
on any change.

---

## 3. Auto-derive surface from `meta.darkMode` defaults

**Pain.** Every theme repeats the same `surface: { scale: "slate",
darkScale: "zinc" }` boilerplate. Users frequently make a typo (e.g.
`darkscale`) that the validator catches but the IDE doesn't surface
visually until then.

**Proposal.** When `semantic.surface` is omitted entirely, default to
`{ scale: "slate", darkScale: "zinc" }` (or to whatever the chosen
`preset.base` ships with). Document the defaults in `MetaConfig` and
`SemanticConfig` JSDoc. Add an opt-out (`semantic.surface: null`).

**Trade-offs.** Defaults are an ergonomic win but can hide what's
actually emitted. Mitigated by the `palettes.ts` catalog +
`theme-unify colors` listing.

---

## 4. Surface validation results in editor (LSP / `lint` command)

**Pain.** Validation only runs at CLI invocation. A typo'd palette
name is silent until you `pnpm tokens`.

**Proposal.** Two complementary fronts:

1. **`theme-unify lint`** — emits issues in a format compatible with
   common reporters (default: ESLint stylish; `--format json` for
   editor consumers, `--format checkstyle` for CI).
2. **VS Code extension** (separate package) that runs `validateTokens`
   on save and reports `ValidationIssue`s as diagnostics in the active
   `tokens.config.ts`.

**Trade-offs.** The lint command is small and high-impact. The
extension is a meaningful sunk cost — defer until usage justifies it.

---

## 5. Schema-level types over `Record<string, unknown>` — ✅ partially shipped in 0.3.0

`DeepTokenValue<T>` and `TypedThemeUnifyConfig<Preset>` now live in
core at [`packages/core/src/typed.ts`](packages/core/src/typed.ts) and
are consumed by the per-base entries shipped under #1. The bare
`theme-unify` entry intentionally keeps `PresetOverrides` as
`Record<string, unknown>` so the core import stays peer-free —
autocomplete is opt-in via `theme-unify/aura` (etc.).

---

## 6. Re-introduce `unocss.colorAliases`

**Pain.** Earlier versions allowed `unocss: { colorAliases: { warm:
"oatmeal" } }` so designers could ship semantic UnoCSS class names
without polluting `primitive.colors`. The current schema dropped this
in favor of `semantic.extra`, but `extra` keys also become PrimeVue
roles — sometimes you want UnoCSS-only aliases.

**Proposal.** Add `unocss.colorAliases?: Record<string, string>`
back. Generator emits an extra entry in `colors` (`bg-warm-500` →
`var(--p-oatmeal-500)`) without touching the PrimeVue preset.

**Trade-offs.** Minimal; restores a known-useful escape hatch.

---

## 7. Pluggable generators

**Pain.** Adding a new output (Tailwind config, CSS variables file,
JSON tokens for Storybook, etc.) requires forking. The CLI currently
wires four hardcoded generators.

**Proposal.** Accept a `theme-unify.config.ts` next to the tokens
config that exports `{ generators: GeneratorPlugin[] }`. A
`GeneratorPlugin` is `{ name, filename, build(resolved): string }`.
Bundle the four built-ins as plugins; the CLI composes them with any
user plugins.

**Trade-offs.** Increases the API surface. Worth it once a real-world
need lands (e.g. someone wanting a Figma JSON export).

---

## 8. Source maps / generated-file headers with provenance

**Pain.** When a generated value looks wrong, the dev has to grep the
config to find what produced it.

**Proposal.** In each generated file, emit a leading comment with the
absolute config path, the `theme-unify` version, and a UTC timestamp.
For each generated semantic scale, append `// from semantic.primary
("brand")`. Consider a `--source-map` flag that emits a sibling
`.map.json` mapping output keys back to config paths.

**Trade-offs.** Comments are free; source maps are significant work
for marginal benefit. Start with the comment headers.

---

## 9. Better error messages from the CLI

**Pain.** `Error: <message>` for any non-validation failure swallows
the stack and gives no recovery hint.

**Proposal.**

- Wrap common failure modes (config not found, default export missing,
  ESM/CJS interop issue) in named errors with actionable messages.
- Add `--verbose` to print stacks.
- For `TokenValidationError`, group issues by top-level key and
  highlight the offending config snippet (use `chalk` if added; plain
  text otherwise).

**Trade-offs.** Adds a few hundred lines to the CLI; pays for itself
the first time a user hits one of these.

---

## 10. Publish a starter kit / `create-theme-unify`

**Pain.** Getting from "I installed the package" to "I see PrimeVue
recoloured" requires reading three docs and editing four files.

**Proposal.** Ship `create-theme-unify` (npm `init` template) that
scaffolds:

- A `tokens.config.ts` with the playground's `defineTypedTokens`
  helper inlined.
- Pre-wired Vite + UnoCSS + PrimeVue config.
- An `npm scripts` block that runs the CLI before dev/build.
- A `README` that points back to the consumer guide.

**Trade-offs.** Templates rot — keep the surface narrow (no React /
Solid variants until requested). Test it as part of release CI.

---

## 11. Stable JSON schema for `tokens.config`

**Pain.** Tooling outside of TypeScript (Figma plugins, design-system
docs sites, validators in other languages) cannot consume the config.

**Proposal.** Generate a JSON Schema from the TS types (e.g. via
`ts-json-schema-generator`). Publish to `theme-unify/schema.json` and
a Schema Store entry so JSON-mode editors get validation.

**Trade-offs.** JSON Schema cannot express `DeepTokenValue<...>` so
the schema covers the static shape only — refs end up as `{ ref:
string }`. Acceptable for tooling that doesn't resolve.

---

## 12. Optional `theme-unify.config.ts` for CLI defaults

**Pain.** Users repeat `-c ./tokens.config.ts -o ./src/generated` in
every script. Adding extra flags (e.g. custom filenames) makes the
script lines unreadable.

**Proposal.** Read `theme-unify.config.ts` (or `.js` / `.json`) at cwd
if present and merge with CLI flags. Keys: `config`, `outDir`,
`preset`, `unoTheme`, `shortcuts`, `palettes`, `force`.

**Trade-offs.** Yet another config file. Counter-balance by also
honoring a `themeUnify` key in `package.json`.

---

## 13. Tighten public API: graduate or hide low-level helpers

**Pain.** `buildPresetObject`, `resolveSemanticScale`, and
`collectPalettes` are exported but not documented as stable. Consumers
who use them risk breakage.

**Proposal.** Audit and either:

- Document them as part of the **stable** public API (prefer this;
  they're useful for runtime swap and catalog UIs).
- Move them to `theme-unify/internals` with a "no semver guarantee"
  warning.

**Trade-offs.** Either way the change is mostly a docs + JSDoc
update. Pick stability and write the contract down.

---

## 14. Test fixtures for downstream consumers

**Pain.** A consumer who wants to regression-test their generated
preset has to roll their own fixtures.

**Proposal.** Export the playground's resolved tokens (or a minimal
fixture) under `theme-unify/fixtures` so consumers can `import` known-
good inputs into their own test suite.

**Trade-offs.** Adds files to the published tarball. Use `exports`
sub-paths and `files` glob to keep the increase small (<5kB).

---

## 15. Track a public **Compatibility matrix**

**Pain.** Users don't know which `primevue` / `@primeuix/themes` /
`unocss` versions are tested.

**Proposal.** Maintain a `COMPATIBILITY.md` (or a section in the
README) listing the known-good versions for each `theme-unify`
release. CI runs against the latest of each.

**Trade-offs.** Maintenance overhead. Worth it once any of the
dependencies cuts a major.

---

## Appendix — quick wins (≤ 1 hour each)

_All previously listed quick wins have shipped:_

- `theme-unify init` writes a starter `tokens.config.ts` (refuses
  overwrite without `--force`).
- The CLI prints generated paths and the output directory as `file://`
  URLs (clickable in most terminals).
- Every generated file now has a `// Auto-generated by
  theme-unify@<version> — do not edit` header, plus a
  `// theme: "<name>"` line when `meta.name` is set.
- `meta.darkModeSelector` is validated for plausibility (rejects empty
  strings, unbalanced brackets, leading combinators).
- The build command emits a one-line summary at end of run:
  `4 files, 3 written, 1 unchanged`.
- The build command refuses to run when `--outDir` is the same
  directory as the token config (avoids accidental clobber).
- `--silent` suppresses informational stdout (errors still print).

Add new low-effort ideas here as they come up.
