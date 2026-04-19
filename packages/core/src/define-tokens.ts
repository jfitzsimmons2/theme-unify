import type { ThemeUnifyConfig } from "./types.js";

export function defineTokens<T extends ThemeUnifyConfig>(schema: T): T {
    return schema;
}
