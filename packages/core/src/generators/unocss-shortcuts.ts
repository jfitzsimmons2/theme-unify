import type {
  ResolvedTokens,
  ResolvedAutoTokens,
  UnoCSSShortcut,
} from "../types.js";
import { fileHeader } from "./utils.js";

export function generateShortcuts(
  resolved: ResolvedTokens | ResolvedAutoTokens,
): string {
  const lines = [fileHeader()];

  // Collect shortcuts from the appropriate source
  let shortcuts: Record<string, UnoCSSShortcut> = {};

  if (
    resolved.unocss &&
    "shortcuts" in resolved.unocss &&
    resolved.unocss.shortcuts
  ) {
    // Legacy mode: explicit shortcuts
    shortcuts = { ...resolved.unocss.shortcuts };
  }

  // Merge extraShortcuts (used in both modes)
  if (
    resolved.unocss &&
    "extraShortcuts" in resolved.unocss &&
    resolved.unocss.extraShortcuts
  ) {
    shortcuts = { ...shortcuts, ...resolved.unocss.extraShortcuts };
  }

  if (Object.keys(shortcuts).length === 0) {
    lines.push("export const shortcuts: Record<string, string> = {};");
    lines.push("");
    return lines.join("\n");
  }

  const entries: string[] = [];
  for (const [name, mapping] of Object.entries(shortcuts)) {
    const combined = `${mapping.light} ${mapping.dark}`;
    // Escape single quotes in the values
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
