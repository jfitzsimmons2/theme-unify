import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Write `content` to `outDir/filename`, creating the directory if
 * needed. By default the write is a no-op when the existing file is
 * byte-identical — this prevents spurious HMR / file-watcher triggers
 * when generators run on every save.
 *
 * @param outDir   Output directory (created recursively if missing).
 * @param filename Bare filename, joined to `outDir`.
 * @param content  File contents (UTF-8).
 * @param force    When `true`, write even when content is unchanged.
 * @returns `true` if the file was actually written, `false` if skipped
 *   because the content was identical.
 */
export function writeOutput(
    outDir: string,
    filename: string,
    content: string,
    force: boolean = false,
): boolean {
    mkdirSync(outDir, { recursive: true });

    const filePath = join(outDir, filename);

    // Skip write if content hasn't changed (avoids unnecessary HMR triggers)
    if (!force && existsSync(filePath)) {
        const existing = readFileSync(filePath, "utf-8");
        if (existing === content) {
            return false;
        }
    }

    writeFileSync(filePath, content, "utf-8");
    return true;
}
