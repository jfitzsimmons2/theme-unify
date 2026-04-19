import { ref, watch, shallowRef } from "vue";
import { transform } from "sucrase";
import {
  defineTokens,
  validateTokens,
  resolveRefs,
  generatePrimeVue,
  generateUnoCSS,
  generateShortcuts,
  generatePrimeVuePT,
  buildPrimeVuePTObject,
  COLOR_STEPS,
  type TokenSchema,
  type ResolvedTokens,
} from "theme-unify";
import { usePrimeVue } from "primevue/config";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import defaultConfigRaw from "../../tokens.config.ts?raw";

export interface ValidationIssue {
  path: string;
  message: string;
}

const STORAGE_KEY = "theme-unify-editor-content";
const RUNTIME_STYLE_ID = "theme-unify-runtime-css";

/**
 * Build a color lookup from resolved tokens (primitive colors + surface + aliases).
 */
function buildColorMap(
  resolved: ResolvedTokens,
): Record<string, Record<string, string>> {
  const colors: Record<string, Record<string, string>> = {};
  for (const [name, scale] of Object.entries(resolved.primitive.colors)) {
    const scaleObj: Record<string, string> = {};
    for (const step of COLOR_STEPS) {
      if (scale[step]) scaleObj[String(step)] = scale[step];
    }
    colors[name] = scaleObj;
  }
  if (resolved.semantic?.surface) {
    const surfaceScale =
      resolved.primitive.colors[resolved.semantic.surface.scale];
    if (surfaceScale) {
      const obj: Record<string, string> = {};
      for (const step of COLOR_STEPS) {
        if (surfaceScale[step]) obj[String(step)] = surfaceScale[step];
      }
      obj["0"] = surfaceScale[50];
      colors["surface"] = obj;
    }
  }
  if (resolved.unocss?.colorAliases) {
    for (const [alias, target] of Object.entries(
      resolved.unocss.colorAliases,
    )) {
      if (colors[target]) colors[alias] = { ...colors[target] };
    }
  }
  return colors;
}

/**
 * Resolve a single UnoCSS utility class (e.g. "bg-chickpea-50") to a CSS declaration,
 * or return null if unrecognized.
 */
function resolveUtility(
  cls: string,
  colors: Record<string, Record<string, string>>,
): { property: string; value: string } | null {
  // border-{color}-{step}
  const borderMatch = cls.match(/^border-(.+)-(\d+)$/);
  if (borderMatch) {
    const color = colors[borderMatch[1]]?.[borderMatch[2]];
    if (color) return { property: "border-color", value: color };
  }
  // bg-{color}-{step}
  const bgMatch = cls.match(/^bg-(.+)-(\d+)$/);
  if (bgMatch) {
    const color = colors[bgMatch[1]]?.[bgMatch[2]];
    if (color) return { property: "background-color", value: color };
  }
  // text-{color}-{step}
  const textMatch = cls.match(/^text-(.+)-(\d+)$/);
  if (textMatch) {
    const color = colors[textMatch[1]]?.[textMatch[2]];
    if (color) return { property: "color", value: color };
  }
  return null;
}

/**
 * Generate a CSS stylesheet from resolved tokens that overrides UnoCSS shortcuts at runtime.
 */
function buildRuntimeCSS(resolved: ResolvedTokens): string {
  const shortcuts = resolved.unocss?.shortcuts;
  if (!shortcuts || Object.keys(shortcuts).length === 0) return "";

  const colors = buildColorMap(resolved);
  const darkSelector = resolved.meta.darkModeSelector || ".dark";
  const rules: string[] = [];

  for (const [name, mapping] of Object.entries(shortcuts)) {
    const lightClasses = mapping.light.split(/\s+/).filter(Boolean);
    const darkClasses = mapping.dark
      .split(/\s+/)
      .filter(Boolean)
      .map((c) => c.replace(/^dark:/, ""));

    const lightDecls: string[] = [];
    for (const cls of lightClasses) {
      const result = resolveUtility(cls, colors);
      if (result) lightDecls.push(`  ${result.property}: ${result.value};`);
    }
    const darkDecls: string[] = [];
    for (const cls of darkClasses) {
      const result = resolveUtility(cls, colors);
      if (result) darkDecls.push(`  ${result.property}: ${result.value};`);
    }

    if (lightDecls.length > 0) {
      rules.push(`.${name} {\n${lightDecls.join("\n")}\n}`);
    }
    if (darkDecls.length > 0) {
      rules.push(`${darkSelector} .${name} {\n${darkDecls.join("\n")}\n}`);
    }
  }

  // Also generate utility classes for all colors (bg-{color}-{step}, text-{color}-{step}, border-{color}-{step})
  for (const [name, scale] of Object.entries(colors)) {
    for (const [step, hex] of Object.entries(scale)) {
      rules.push(`.bg-${name}-${step} { background-color: ${hex}; }`);
      rules.push(`.text-${name}-${step} { color: ${hex}; }`);
      rules.push(`.border-${name}-${step} { border-color: ${hex}; }`);
    }
  }

  return rules.join("\n");
}

function injectRuntimeCSS(css: string) {
  let el = document.getElementById(RUNTIME_STYLE_ID);
  if (!el) {
    el = document.createElement("style");
    el.id = RUNTIME_STYLE_ID;
    document.head.appendChild(el);
  }
  el.textContent = css;
}

function loadSavedContent(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return saved;
  } catch {
    // localStorage unavailable
  }
  return defaultConfigRaw;
}

function saveContent(content: string) {
  try {
    localStorage.setItem(STORAGE_KEY, content);
  } catch {
    // localStorage full/unavailable
  }
}

export function useTokenEditor() {
  const editorContent = ref(loadSavedContent());
  const parseError = ref<string | null>(null);
  const validationErrors = ref<ValidationIssue[]>([]);
  const resolvedTokens = shallowRef<ResolvedTokens | null>(null);
  const generatedPrimeVue = ref("");
  const generatedUnoCSS = ref("");
  const generatedShortcuts = ref("");
  const generatedPT = ref("");
  const isProcessing = ref(false);
  const lastValidContent = ref(editorContent.value);

  function parseTokenConfig(code: string): TokenSchema {
    // Transpile TS → JS using Sucrase
    const jsCode = transform(code, {
      transforms: ["typescript"],
      disableESTransforms: true,
    }).code;

    // Replace import + export default with a return
    const stripped = jsCode
      .replace(/^import\s+.*?;\s*$/gm, "")
      .replace(/^export\s+default\s+/m, "return ");

    // Provide defineTokens as identity function in scope
    const fn = new Function("defineTokens", stripped);
    return fn(defineTokens);
  }

  function processTokens(code: string) {
    isProcessing.value = true;
    parseError.value = null;
    validationErrors.value = [];

    try {
      // 1. Parse
      const tokens = parseTokenConfig(code);

      // 2. Validate
      const issues = validateTokens(tokens);
      if (issues.length > 0) {
        validationErrors.value = issues;
        isProcessing.value = false;
        return; // don't apply invalid tokens
      }

      // 3. Resolve refs
      const resolved = resolveRefs(tokens);
      resolvedTokens.value = resolved;

      // 4. Generate output strings
      generatedPrimeVue.value = generatePrimeVue(resolved);
      generatedUnoCSS.value = generateUnoCSS(resolved);
      generatedShortcuts.value = generateShortcuts(resolved);
      generatedPT.value = generatePrimeVuePT(resolved);

      // 5. Apply PrimeVue theme at runtime
      applyPrimeVueTheme(resolved);

      // 6. Apply UnoCSS overrides at runtime
      injectRuntimeCSS(buildRuntimeCSS(resolved));

      lastValidContent.value = code;
    } catch (err: unknown) {
      parseError.value =
        err instanceof Error ? err.message : "Unknown error occurred";
    } finally {
      isProcessing.value = false;
    }
  }

  function applyPrimeVueTheme(resolved: ResolvedTokens) {
    const newPT = buildPrimeVuePTObject(resolved);
    const pv = usePrimeVue();
    pv.config.pt = newPT;
  }

  function downloadConfig() {
    const blob = new Blob([editorContent.value], {
      type: "text/typescript;charset=utf-8",
    });
    saveAs(blob, "tokens.config.ts");
  }

  function downloadSingleFile(filename: string, content: string) {
    const blob = new Blob([content], {
      type: "text/typescript;charset=utf-8",
    });
    saveAs(blob, filename);
  }

  async function downloadAllGenerated() {
    const zip = new JSZip();
    zip.file("primevue-preset.ts", generatedPrimeVue.value);
    zip.file("primevue-pt.ts", generatedPT.value);
    zip.file("unocss-theme.ts", generatedUnoCSS.value);
    zip.file("unocss-shortcuts.ts", generatedShortcuts.value);
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "theme-unify-generated.zip");
  }

  function resetToDefault() {
    editorContent.value = defaultConfigRaw;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    processTokens(editorContent.value);
  }

  // Persist editor content on change
  watch(editorContent, (val) => saveContent(val));

  // Initial processing
  processTokens(editorContent.value);

  return {
    editorContent,
    parseError,
    validationErrors,
    resolvedTokens,
    generatedPrimeVue,
    generatedUnoCSS,
    generatedShortcuts,
    generatedPT,
    isProcessing,
    processTokens,
    downloadConfig,
    downloadSingleFile,
    downloadAllGenerated,
    resetToDefault,
    defaultConfigRaw,
  };
}
