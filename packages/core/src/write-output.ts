import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Write content to a file, but only if the content has changed.
 * Creates the directory if it doesn't exist.
 */
export function writeOutput(
  outDir: string,
  filename: string,
  content: string,
): boolean {
  mkdirSync(outDir, { recursive: true });

  const filePath = join(outDir, filename);

  // Skip write if content hasn't changed (avoids unnecessary HMR triggers)
  if (existsSync(filePath)) {
    const existing = readFileSync(filePath, "utf-8");
    if (existing === content) {
      return false;
    }
  }

  writeFileSync(filePath, content, "utf-8");
  return true;
}
