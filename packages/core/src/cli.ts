#!/usr/bin/env node
import cac from "cac";
import { resolve } from "node:path";
import { loadTokens } from "./load-tokens.js";
import { resolveRefs } from "./resolver.js";

import { generatePrimeVue } from "./generators/primevue.js";
import { generateUnoCSS } from "./generators/unocss-theme.js";
import { generateShortcuts } from "./generators/unocss-shortcuts.js";
import { generatePrimeVuePT } from "./generators/primevue-pt.js";
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
  .option("-o, --outDir <path>", "Output directory", { default: "./generated" })
  .option("--primevue <filename>", "PrimeVue output filename", {
    default: "primevue-preset.ts",
  })
  .option("--unocss <filename>", "UnoCSS theme output filename", {
    default: "unocss-theme.ts",
  })
  .option("--shortcuts <filename>", "UnoCSS shortcuts output filename", {
    default: "unocss-shortcuts.ts",
  })
  .option("--pt <filename>", "PrimeVue PT (passthrough) output filename", {
    default: "primevue-pt.ts",
  })
  .option("--dry-run", "Print output to stdout instead of writing files")
  .option("--validate", "Validate config and exit (no output)")
  .option("-w, --watch", "Re-generate on token file change")
  .action(async (_args: string[], options: Record<string, unknown>) => {
    const configPath = resolve(options.config as string);
    const outDir = resolve(options.outDir as string);
    const dryRun = options.dryRun as boolean;
    const validateOnly = options.validate as boolean;
    const watch = options.watch as boolean;

    try {
      // Load and validate
      const tokens = await loadTokens(configPath);

      if (validateOnly) {
        console.log("✓ Token config is valid.");
        process.exit(0);
      }

      // Resolve refs
      const resolved = resolveRefs(tokens);

      // Generate output
      const primevueCode = generatePrimeVue(resolved);
      const unoCSSCode = generateUnoCSS(resolved);
      const shortcutsCode = generateShortcuts(resolved);
      const ptCode = generatePrimeVuePT(resolved);

      if (dryRun) {
        console.log(`\n// === ${options.primevue} ===\n`);
        console.log(primevueCode);
        console.log(`\n// === ${options.unocss} ===\n`);
        console.log(unoCSSCode);
        console.log(`\n// === ${options.shortcuts} ===\n`);
        console.log(shortcutsCode);
        console.log(`\n// === ${options.pt} ===\n`);
        console.log(ptCode);
        return;
      }

      // Write files
      const results = [
        {
          name: options.primevue as string,
          written: writeOutput(
            outDir,
            options.primevue as string,
            primevueCode,
          ),
        },
        {
          name: options.unocss as string,
          written: writeOutput(outDir, options.unocss as string, unoCSSCode),
        },
        {
          name: options.shortcuts as string,
          written: writeOutput(
            outDir,
            options.shortcuts as string,
            shortcutsCode,
          ),
        },
        {
          name: options.pt as string,
          written: writeOutput(outDir, options.pt as string, ptCode),
        },
      ];

      for (const r of results) {
        if (r.written) {
          console.log(`  ✓ ${r.name}`);
        } else {
          console.log(`  · ${r.name} (unchanged)`);
        }
      }
      console.log(`\nOutput written to ${outDir}`);

      if (watch) {
        // TODO v0.2: Implement file watching with chokidar
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
cli.version("0.1.0");
cli.parse();
