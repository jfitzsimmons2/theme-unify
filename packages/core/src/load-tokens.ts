import type { ThemeUnifyConfig } from "./types.js";
import { validateTokens } from "./validator.js";
import { TokenValidationError } from "./errors.js";

/**
 * Load and validate a `tokens.config.ts` file from disk.
 *
 * Uses [`jiti`](https://github.com/unjs/jiti) to import the TS file
 * dynamically — no Node loader hooks or precompilation required. The
 * config's default export must be a {@link ThemeUnifyConfig} (typically
 * produced by {@link defineTokens}).
 *
 * Validation runs automatically before the function returns; any issues
 * are aggregated and thrown as a {@link TokenValidationError}.
 *
 * @param configPath Absolute or relative path to the config file.
 *   Relative paths are resolved against `process.cwd()` by the CLI; if
 *   you're calling `loadTokens` directly, pass an absolute path or
 *   resolve it yourself first.
 * @returns The parsed and validated {@link ThemeUnifyConfig}.
 *
 * @throws {Error} If the file cannot be imported or does not export a
 *   `ThemeUnifyConfig`-shaped object.
 * @throws {TokenValidationError} If the schema validates structurally
 *   but contains semantic issues (missing color steps, unknown scale
 *   names, unresolved refs, …).
 *
 * @example
 * ```ts
 * import { loadTokens, resolveRefs, generatePreset } from "@jfitzsimmons2/theme-unify";
 *
 * const tokens   = await loadTokens("./tokens.config.ts");
 * const resolved = resolveRefs(tokens);
 * const preset   = generatePreset(resolved);
 * ```
 */
export async function loadTokens(configPath: string): Promise<ThemeUnifyConfig> {
    const { createJiti } = await import("jiti");
    const jiti = createJiti(import.meta.url, { interopDefault: true });

    let mod: unknown;
    try {
        mod = await jiti.import(configPath);
    } catch (err) {
        throw new Error(
            `Failed to load token config from "${configPath}": ${err instanceof Error ? err.message : err}`,
        );
    }

    const tokens = (
        mod && typeof mod === "object" && "default" in mod
            ? (mod as Record<string, unknown>).default
            : mod
    ) as ThemeUnifyConfig;

    if (
        !tokens ||
        typeof tokens !== "object" ||
        !tokens.meta ||
        !tokens.primitive
    ) {
        throw new Error(
            `Token config at "${configPath}" must export a valid ThemeUnifyConfig (use defineTokens())`,
        );
    }

    const issues = validateTokens(tokens);
    const errors: typeof issues = [];
    for (const issue of issues) {
        const sev = issue.severity ?? "error";
        if (sev === "error") {
            errors.push(issue);
        } else if (sev === "warning") {
            console.warn(`[theme-unify] ${issue.path}: ${issue.message}`);
        } else {
            console.info(`[theme-unify] ${issue.path}: ${issue.message}`);
        }
    }
    if (errors.length > 0) {
        throw new TokenValidationError(errors);
    }

    return tokens;
}
