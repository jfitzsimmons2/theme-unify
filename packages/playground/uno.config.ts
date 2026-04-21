import { defineConfig, presetUno, presetIcons } from "unocss";
import {
    darkMode,
    colors,
    spacing,
    borderRadius,
    boxShadow,
    fontFamily,
    fontSize,
    lineHeight,
    fontWeight,
    breakpoints,
    zIndex,
    transitionDuration,
    transitionTimingFunction,
    animation,
} from "./src/generated/uno-theme";
import { shortcuts as generatedShortcuts } from "./src/generated/shortcuts";

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

const sizeSteps = ["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl"];
safelist.push(
    ...sizeSteps.flatMap((size) => [
        `rounded-${size}`,
        `shadow-${size}`,
    ]),
);

// Materialise `animate-{name}` shortcuts from the user's primitive.animations
// shorthand record. UnoCSS's built-in `animate-*` rule expects a
// ThemeAnimation block (keyframes/durations/timingFns) rather than a flat
// shorthand — so we wire the shorthand directly through a shortcut. The
// matching @keyframes rule must still be author-supplied in style.css.
const animationShortcuts = Object.fromEntries(
    Object.entries(animation).map(([name, value]) => [
        `animate-${name}`,
        `[animation:${(value as string).replace(/\s+/g, "_")}]`,
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
        breakpoints,
        zIndex,
        // preset-mini reads `duration-*` from theme.duration and
        // `ease-*` / transition timing from theme.easing — map our
        // generated exports onto those keys.
        duration: transitionDuration,
        easing: transitionTimingFunction,
    },
    shortcuts: { ...generatedShortcuts, ...animationShortcuts },
    // CSS layer ordering must match the PrimeVue `cssLayer.order` in main.ts
    // so utility classes always override component defaults.
    layers: {
        unbase: -10,
        primevue: 0,
        unutilities: 10,
    },
    presets: [
        presetUno({ dark: darkMode }),
        presetIcons({
            scale: 1.2,
            extraProperties: {
                display: "inline-block",
                "vertical-align": "middle",
            },
        }),
    ],
});
