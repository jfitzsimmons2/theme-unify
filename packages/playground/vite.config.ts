import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import UnoCSS from "unocss/vite";
import type { Plugin } from "vite";

function themeUnifyDtsPlugin(): Plugin {
    const virtualId = "virtual:theme-unify-dts";
    const resolvedVirtualId = "\0" + virtualId;
    const dtsPath = fileURLToPath(
        new URL("./node_modules/theme-unify/dist/index.d.ts", import.meta.url),
    );
    return {
        name: "theme-unify-dts",
        resolveId(id) {
            if (id === virtualId) return resolvedVirtualId;
        },
        load(id) {
            if (id === resolvedVirtualId) {
                this.addWatchFile(dtsPath);
                const content = readFileSync(dtsPath, "utf-8");
                return `export default ${JSON.stringify(content)};`;
            }
        },
        handleHotUpdate({ file, server }) {
            if (file === dtsPath) {
                const mod = server.moduleGraph.getModuleById(resolvedVirtualId);
                if (mod) {
                    server.moduleGraph.invalidateModule(mod);
                    return [mod];
                }
            }
        },
    };
}

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue(), UnoCSS(), themeUnifyDtsPlugin()],
    optimizeDeps: {
        include: ["monaco-editor"],
    },
});
