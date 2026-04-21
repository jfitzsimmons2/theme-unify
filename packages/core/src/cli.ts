#!/usr/bin/env node
import cac from "cac";
import { existsSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { loadTokens } from "./load-tokens.js";
import { resolveRefs } from "./resolver.js";
import { generatePreset } from "./generators/preset.js";
import { generateUnoTheme } from "./generators/uno-theme.js";
import { generateShortcuts } from "./generators/shortcuts.js";
import {
    generatePalettes,
    collectPalettes,
} from "./generators/palettes.js";
import { writeOutput } from "./write-output.js";
import { TokenValidationError } from "./errors.js";
import pkg from "../package.json" with { type: "json" };

const VERSION = (pkg as { version: string }).version;

const cli = cac("theme-unify");

// ---------- helpers ----------

let silent = false;
const log = (msg: string = ""): void => {
    if (!silent) console.log(msg);
};

const fileLink = (absPath: string): string =>
    pathToFileURL(absPath).href;

const STARTER_TEMPLATE = `import { defineTokens } from "theme-unify";

export default defineTokens({
    meta: {
        name: "My Theme",
        darkModeSelector: ".dark",
    },

    primitive: {
        // Define one or more custom palettes (50–950). Builtin Tailwind/Aura
        // palettes (slate, zinc, blue, emerald, …) are also available by name.
        colors: {
            brand: {
                50:  "#F5F8FF",
                100: "#E6EEFF",
                200: "#C8D8FF",
                300: "#9BB8FF",
                400: "#6A92FF",
                500: "#3D6BF5",
                600: "#2A4FCC",
                700: "#1F3CA0",
                800: "#172E78",
                900: "#10204F",
                950: "#0A1430",
            },
        },
    },

    semantic: {
        primary: "brand",
        // Light surface uses slate; dark mode uses zinc.
        surface: { scale: "slate", darkScale: "zinc" },
    },
});
`;

// ---------- main "build" command ----------

cli
    .command(
        "[...args]",
        "Generate PrimeVue preset and UnoCSS theme from token config",
    )
    .option("-c, --config <path>", "Path to tokens.config.ts", {
        default: "./tokens.config.ts",
    })
    .option("-o, --outDir <path>", "Output directory", {
        default: "./generated",
    })
    .option("--preset <filename>", "PrimeVue preset output filename", {
        default: "preset.ts",
    })
    .option("--uno-theme <filename>", "UnoCSS theme output filename", {
        default: "uno-theme.ts",
    })
    .option("--shortcuts <filename>", "UnoCSS shortcuts output filename", {
        default: "shortcuts.ts",
    })
    .option(
        "--palettes <filename>",
        "Color palette catalog output filename",
        { default: "palettes.ts" },
    )
    .option("--dry-run", "Print output to stdout instead of writing files")
    .option("--validate", "Validate config and exit (no output)")
    .option(
        "-f, --force",
        "Always write output files, even when content is unchanged",
    )
    .option("-w, --watch", "Re-generate on token file change")
    .option("--silent", "Suppress informational output (errors still print)")
    .action(async (_args: string[], options: Record<string, unknown>) => {
        silent = Boolean(options.silent);

        const configPath = resolve(options.config as string);
        const outDir = resolve(options.outDir as string);
        const dryRun = options.dryRun as boolean;
        const validateOnly = options.validate as boolean;
        const force = options.force as boolean;
        const watch = options.watch as boolean;

        const presetName = options.preset as string;
        const unoThemeName = options.unoTheme as string;
        const shortcutsName = options.shortcuts as string;
        const palettesName = options.palettes as string;

        // Refuse to overwrite the directory containing the config itself.
        if (!dryRun && !validateOnly && outDir === dirname(configPath)) {
            console.error(
                `Error: --outDir (${outDir}) is the same directory as the token config.\n` +
                `       Choose a subdirectory (e.g. "${join(outDir, "generated")}") to avoid clobbering "${configPath}".`,
            );
            process.exit(1);
        }

        try {
            const tokens = await loadTokens(configPath);

            if (validateOnly) {
                log("✓ Token config is valid.");
                process.exit(0);
            }

            const resolved = resolveRefs(tokens);

            const presetCode = generatePreset(resolved);
            const unoThemeCode = generateUnoTheme(resolved);
            const shortcutsCode = generateShortcuts(resolved);
            const palettesCode = generatePalettes(resolved);

            if (dryRun) {
                log(`\n// === ${presetName} ===\n`);
                log(presetCode);
                log(`\n// === ${unoThemeName} ===\n`);
                log(unoThemeCode);
                log(`\n// === ${shortcutsName} ===\n`);
                log(shortcutsCode);
                log(`\n// === ${palettesName} ===\n`);
                log(palettesCode);
                return;
            }

            const results = [
                {
                    name: presetName,
                    written: writeOutput(outDir, presetName, presetCode, force),
                },
                {
                    name: unoThemeName,
                    written: writeOutput(outDir, unoThemeName, unoThemeCode, force),
                },
                {
                    name: shortcutsName,
                    written: writeOutput(outDir, shortcutsName, shortcutsCode, force),
                },
                {
                    name: palettesName,
                    written: writeOutput(outDir, palettesName, palettesCode, force),
                },
            ];

            for (const r of results) {
                const link = fileLink(join(outDir, r.name));
                if (r.written) {
                    log(force ? `  ✓ ${r.name} (forced)  ${link}` : `  ✓ ${r.name}  ${link}`);
                } else {
                    log(`  · ${r.name} (unchanged)  ${link}`);
                }
            }

            const written = results.filter((r) => r.written).length;
            const unchanged = results.length - written;
            log(
                `\n${results.length} files, ${written} written, ${unchanged} unchanged`,
            );
            log(`Output directory: ${fileLink(outDir)}`);

            if (watch) {
                log(
                    "\n⚠ Watch mode is not yet implemented (planned for v0.2).",
                );
            }
        } catch (err) {
            if (err instanceof TokenValidationError) {
                console.error(err.message);
                process.exit(1);
            }
            console.error(`Error: ${err instanceof Error ? err.message : err}`);
            process.exit(1);
        }
    });

// ---------- "init" command ----------

cli
    .command("init [path]", "Write a starter tokens.config.ts")
    .option("-f, --force", "Overwrite the file if it already exists")
    .option("--silent", "Suppress informational output (errors still print)")
    .action(async (path: string | undefined, options: Record<string, unknown>) => {
        silent = Boolean(options.silent);
        const target = resolve(path ?? "./tokens.config.ts");
        const force = Boolean(options.force);

        if (existsSync(target) && !force) {
            console.error(
                `Error: ${target} already exists. Pass --force to overwrite.`,
            );
            process.exit(1);
        }

        try {
            writeFileSync(target, STARTER_TEMPLATE, "utf-8");
            log(`✓ Wrote starter token config: ${fileLink(target)}`);
            log(
                `\nNext: edit your colors, then run \`theme-unify -c ${path ?? "./tokens.config.ts"}\` to generate outputs.`,
            );
        } catch (err) {
            console.error(`Error: ${err instanceof Error ? err.message : err}`);
            process.exit(1);
        }
    });

// ---------- "colors" command ----------

cli
    .command("colors", "List every color palette available to the config")
    .option("-c, --config <path>", "Path to tokens.config.ts", {
        default: "./tokens.config.ts",
    })
    .option("--json", "Print catalog as JSON instead of a formatted listing")
    .option("--silent", "Suppress informational output (errors still print)")
    .action(async (options: Record<string, unknown>) => {
        silent = Boolean(options.silent);
        const configPath = resolve(options.config as string);
        const asJson = options.json as boolean;

        try {
            const tokens = await loadTokens(configPath);
            const resolved = resolveRefs(tokens);
            const catalog = collectPalettes(resolved);

            if (asJson) {
                // JSON output is the whole point of `--json`; print regardless of --silent.
                console.log(JSON.stringify(catalog, null, 2));
                return;
            }

            const fmt = (scale: Record<string, string>): string =>
                Object.entries(scale)
                    .map(([step, hex]) => `      ${step.padEnd(3)} ${hex}`)
                    .join("\n");

            log("\nCustom palettes (primitive.colors):");
            const customNames = Object.keys(catalog.custom);
            if (customNames.length === 0) {
                log("  (none)");
            } else {
                for (const name of customNames) {
                    const tag = catalog.shadowedBuiltins.includes(name)
                        ? " (shadows builtin)"
                        : "";
                    log(`  • ${name}${tag}`);
                    log(fmt(catalog.custom[name]));
                }
            }

            log("\nBuiltin palettes referenced by semantic roles:");
            if (catalog.referencedBuiltins.length === 0) {
                log("  (none)");
            } else {
                for (const name of catalog.referencedBuiltins) {
                    log(`  • ${name}`);
                    log(fmt(catalog.builtin[name]));
                }
            }

            log("\nAll available builtin palette names:");
            const all = Object.keys(catalog.builtin);
            const cols = 6;
            for (let i = 0; i < all.length; i += cols) {
                log(
                    "  " +
                    all
                        .slice(i, i + cols)
                        .map((n) => n.padEnd(10))
                        .join(""),
                );
            }
            log(`\n(${all.length} builtins, ${customNames.length} custom)\n`);
        } catch (err) {
            if (err instanceof TokenValidationError) {
                console.error(err.message);
                process.exit(1);
            }
            console.error(`Error: ${err instanceof Error ? err.message : err}`);
            process.exit(1);
        }
    });

cli.help();
cli.version(VERSION);
cli.parse();
