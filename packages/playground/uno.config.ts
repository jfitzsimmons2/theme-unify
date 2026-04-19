import { defineConfig, presetUno, presetIcons } from "unocss";
import {
    colors,
    spacing,
    borderRadius,
    boxShadow,
    fontFamily,
    fontSize,
    lineHeight,
    fontWeight,
} from "./src/generated/uno-theme";
import { shortcuts } from "./src/generated/shortcuts";

// Safelist dynamically-constructed `bg/text/border-{color}-{step}` classes for
// every palette name we emit (user palettes + semantic roles + surface).
const colorSteps = [0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const safelist = Object.keys(colors).flatMap((color) =>
    colorSteps.flatMap((step) => [
        `bg-${color}-${step}`,
        `text-${color}-${step}`,
        `border-${color}-${step}`,
        `hover:bg-${color}-${step}`,
        `hover:text-${color}-${step}`,
        `hover:border-${color}-${step}`,
        `focus:border-${color}-${step}`,
    ]),
);

export default defineConfig({
    safelist,
    theme: {
        colors,
        spacing,
        borderRadius,
        boxShadow,
        fontFamily,
        fontSize,
        lineHeight,
        fontWeight,
    },
    shortcuts,
    // CSS layer ordering must match the PrimeVue `cssLayer.order` in main.ts
    // so utility classes always override component defaults.
    layers: {
        unbase: -10,
        primevue: 0,
        unutilities: 10,
    },
    presets: [
        presetUno(),
        presetIcons({
            scale: 1.2,
            extraProperties: {
                display: "inline-block",
                "vertical-align": "middle",
            },
        }),
    ],
});
