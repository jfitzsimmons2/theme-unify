import type { TokenSchema, AutoTokenSchema } from "./types.js";

export function defineTokens<T extends TokenSchema | AutoTokenSchema>(
  schema: T,
): T {
  return schema;
}
