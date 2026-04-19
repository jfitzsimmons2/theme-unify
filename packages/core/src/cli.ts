#!/usr/bin/env node
import cac from "cac";
import { resolve } from "node:path";
import { loadTokens } from "./load-tokens.js";
import { resolveRefs } from "./resolver.js";
import { generatePreset } from "./generators/preset.js";
import { generateUnoTheme } from "./generators/uno-theme.js";
import { generateShortcuts } from "./generators/shortcuts.js";
import { writeOutput } from "./write-output.js";
import { TokenValidationError } from "./errors.js";

const cli = cac("theme-unify");

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
    .option("--dry-run", "Print output to stdout instead of writing files")
    .option("--validate", "Validate config and exit (no output)")
    .option(
        "-f, --force",
        "Always write output files, even when content is unchanged",
    )
    .option("-w, --watch", "Re-generate on token file change")
    .action(async (_args: string[], options: Record<string, unknown>) => {
        const configPath = resolve(options.config as string);
        const outDir = resolve(options.outDir as string);
        const dryRun = options.dryRun as boolean;
        const validateOnly = options.validate as boolean;
        const force = options.force as boolean;
        const watch = options.watch as boolean;

        const presetName = options.preset as string;
        const unoThemeName = options.unoTheme as string;
        const shortcutsName = options.shortcuts as string;

        try {
            const tokens = await loadTokens(configPath);

            if (validateOnly) {
                console.log("✓ Token config is valid.");
                process.exit(0);
            }

            const resolved = resolveRefs(tokens);

            const presetCode = generatePreset(resolved);
            const unoThemeCode = generateUnoTheme(resolved);
            const shortcutsCode = generateShortcuts(resolved);

            if (dryRun) {
                console.log(`\n// === ${presetName} ===\n`);
                console.log(presetCode);
                console.log(`\n// === ${unoThemeName} ===\n`);
                console.log(unoThemeCode);
                console.log(`\n// === ${shortcutsName} ===\n`);
                console.log(shortcutsCode);
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
            ];

            for (const r of results) {
                if (r.written) {
                    console.log(force ? `  ✓ ${r.name} (forced)` : `  ✓ ${r.name}`);
                } else {
                    console.log(`  · ${r.name} (unchanged)`);
                }
            }
            console.log(`\nOutput written to ${outDir}`);

            if (watch) {
                console.log(
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

cli.help();
cli.version("0.2.0");
cli.parse();
