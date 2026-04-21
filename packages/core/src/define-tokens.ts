import type { ThemeUnifyConfig } from "./types.js";

/**
 * Author a `tokens.config.ts` with full type inference.
 *
 * `defineTokens` is an identity function — it returns its argument
 * unchanged — but it constrains the input to {@link ThemeUnifyConfig}
 * so editors light up with autocomplete, hover docs, and inline
 * validation while you author the config. Generic inference (`T extends
 * ThemeUnifyConfig`) preserves the literal shape so downstream consumers
 * can `typeof` the export to derive narrow types (e.g. union of palette
 * names).
 *
 * Make the result the **default export** of your config file; that's
 * what the CLI's `loadTokens` expects.
 *
 * @example
 * ```ts
 * // tokens.config.ts
 * import { defineTokens } from "@jfitzsimmons2/theme-unify";
 *
 * export default defineTokens({
 *   meta: { name: "My Theme", darkModeSelector: ".dark" },
 *   primitive: {
 *     colors: {
 *       brand: { 50: "#…", 100: "#…", ..., 950: "#…" },
 *     },
 *   },
 *   semantic: {
 *     primary: "brand",
 *     surface: { scale: "slate", darkScale: "zinc" },
 *     extra:   { success: "emerald", danger: "red" },
 *   },
 * });
 * ```
 *
 * @param schema A {@link ThemeUnifyConfig} object.
 * @returns The same object, with its literal type preserved.
 */
export function defineTokens<T extends ThemeUnifyConfig>(schema: T): T {
    return schema;
}
