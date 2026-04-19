import type { TokenSchema, AutoTokenSchema } from "./types.js";
import { validateTokens } from "./validator.js";
import { TokenValidationError } from "./errors.js";

export async function loadTokens(
  configPath: string,
): Promise<TokenSchema | AutoTokenSchema> {
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
  ) as TokenSchema | AutoTokenSchema;

  if (
    !tokens ||
    typeof tokens !== "object" ||
    !tokens.meta ||
    !tokens.primitive
  ) {
    throw new Error(
      `Token config at "${configPath}" must export a valid TokenSchema (use defineTokens())`,
    );
  }

  const issues = validateTokens(tokens);
  if (issues.length > 0) {
    throw new TokenValidationError(issues);
  }

  return tokens;
}
