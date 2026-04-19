# Vite plugin

Source: [packages/core/src/vite.ts](../packages/core/src/vite.ts).

## Current state

Placeholder. The exported `themeUnifyPlugin()` returns a plugin object with
just a name and no hooks. It exists so the package's `./vite` subpath
export and `dist/vite.{js,cjs,d.ts}` build artifacts are in place ahead of
the v0.2 implementation.

## Intended design (v0.2)

The plugin should make the playground (and any consumer Vite app)
regenerate token outputs as part of the dev server lifecycle.

Sketch:

```ts
export function themeUnifyPlugin(options?: {
  config?: string;       // default ./tokens.config.ts
  outDir?: string;       // default ./src/generated
  filenames?: { primevue?, unocss?, shortcuts?, pt? };
}) {
  return {
    name: "theme-unify",
    async buildStart() {
      // Run the same pipeline as the CLI once at startup.
    },
    configureServer(server) {
      // Watch the config file and any imports.
      // On change: regenerate, then trigger HMR on the generated files.
    },
  };
}
```

Key concerns to address:

1. **Imports of the config** — `jiti` knows what was loaded; surface that
   list and add each path to the watcher.
2. **Error recovery** — surface validation errors via `server.ws.send` so
   the overlay shows them; don't crash the server.
3. **Idempotent writes** — `writeOutput` already returns `false` for
   unchanged content; only trigger HMR when at least one file was rewritten.
4. **Subpath consumers** — keep the existing `theme-unify/vite` export
   working; don't move the entry without a deprecation cycle.

A contributor picking this up should be able to do so without touching the
existing CLI — both plugin and CLI should call the same internal pipeline
helpers.
