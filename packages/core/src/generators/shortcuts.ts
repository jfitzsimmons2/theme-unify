import type { ResolvedTokens, UnoCSSShortcut } from "../types.js";
import { fileHeader } from "./utils.js";

/**
 * Generate UnoCSS shortcuts. Each entry combines a light and dark variant
 * into a single space-separated string consumable by `shortcuts:` in
 * `uno.config.ts`.
 *
 * Example: `{ light: "bg-chickpea-50", dark: "dark:bg-chickpea-950" }`
 *   → `'bg-page': 'bg-chickpea-50 dark:bg-chickpea-950'`
 *
 * The `dark:` variant is interpreted per the `darkMode` export from
 * `uno-theme.ts`. When `darkMode` is `"class"`, UnoCSS activates `dark:`
 * via a CSS class selector; when `"media"`, via `prefers-color-scheme`.
 * The shortcut strings themselves are identical in both modes.
 */
export function generateShortcuts(resolved: ResolvedTokens): string {
    const lines = [fileHeader({ meta: resolved.meta })];

    const shortcuts: Record<string, UnoCSSShortcut> = {
        ...(resolved.unocss?.shortcuts ?? {}),
    };

    if (Object.keys(shortcuts).length === 0) {
        lines.push("export const shortcuts: Record<string, string> = {};");
        lines.push("");
        return lines.join("\n");
    }

    const entries: string[] = [];
    for (const [name, mapping] of Object.entries(shortcuts)) {
        const combined = `${mapping.light} ${mapping.dark}`.trim();
        const safeName = name.replace(/'/g, "\\'");
        const safeValue = combined.replace(/'/g, "\\'");
        entries.push(`  '${safeName}': '${safeValue}'`);
    }

    lines.push("export const shortcuts: Record<string, string> = {");
    lines.push(entries.join(",\n") + ",");
    lines.push("};");
    lines.push("");

    return lines.join("\n");
}
