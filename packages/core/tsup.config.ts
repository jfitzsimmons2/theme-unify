import { defineConfig } from "tsup";

export default defineConfig({
    entry: {
        index: "src/index.ts",
        cli: "src/cli.ts",
        vite: "src/vite.ts",
        typed: "src/typed.ts",
        "typed-aura": "src/typed-aura.ts",
        "typed-lara": "src/typed-lara.ts",
        "typed-nora": "src/typed-nora.ts",
        "typed-material": "src/typed-material.ts",
    },
    format: ["esm", "cjs"],
    dts: true,
    clean: true,
    splitting: true,
    banner({ format }) {
        // Inject hashbang only for CLI entry in ESM format
        if (format === "esm") {
            return { js: "" };
        }
        return {};
    },
});
