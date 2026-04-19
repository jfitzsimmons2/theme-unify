import { defineConfig, presetUno, presetIcons } from "unocss";
import {
  colors,
  borderRadius,
  boxShadow,
  fontFamily,
  fontWeight,
} from "./src/generated/unocss-theme";
import { shortcuts } from "./src/generated/unocss-shortcuts";

// Generate safelist for dynamically-constructed classes (bg/text/border-{color}-{step})
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
  content: {
    filesystem: ["src/generated/primevue-pt.ts"],
  },
  theme: { colors, borderRadius, boxShadow, fontFamily, fontWeight },
  shortcuts,
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
