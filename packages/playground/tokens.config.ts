import { defineTypedTokens } from "./tokens.types";

export default defineTypedTokens({
  meta: {
    name: "Vibrant Vitality",
    darkModeStrategy: "class",
    darkModeSelector: ".dark",
  },

  primitive: {
    colors: {
      beetroot: {
        50: "#FDF2F4",
        100: "#FAE0E4",
        200: "#F5BDC6",
        300: "#EF8E9E",
        400: "#E65A73",
        500: "#D02B4B",
        600: "#B2213E",
        700: "#8E1A32",
        800: "#6E1528",
        900: "#4E1020",
        950: "#300A14",
      },
      blueberry: {
        50: "#F0F2FE",
        100: "#DDE2FC",
        200: "#BCC5F9",
        300: "#95A1F4",
        400: "#6E7BED",
        500: "#4F5BD8",
        600: "#3E48B8",
        700: "#323A96",
        800: "#272D74",
        900: "#1C2156",
        950: "#111336",
      },
      kale: {
        50: "#F0F9F4",
        100: "#D9F0E1",
        200: "#B4E1C5",
        300: "#83CCA3",
        400: "#52B57F",
        500: "#2F9A62",
        600: "#217B4E",
        700: "#1A613E",
        800: "#154C31",
        900: "#113A27",
        950: "#0A2418",
      },
      carrot: {
        50: "#FFF7ED",
        100: "#FFEDD5",
        200: "#FED7AA",
        300: "#FDBA74",
        400: "#FB923C",
        500: "#F97316",
        600: "#EA580C",
        700: "#C2410C",
        800: "#9A3412",
        900: "#7C2D12",
        950: "#431407",
      },
      eggplant: {
        50: "#FAF5FF",
        100: "#F3E8FF",
        200: "#E9D5FF",
        300: "#D8B4FE",
        400: "#C084FC",
        500: "#A855F7",
        600: "#9333EA",
        700: "#7E22CE",
        800: "#6B21A8",
        900: "#581C87",
        950: "#3B0764",
      },
      chickpea: {
        50: "#FCF9F2",
        100: "#F8F1E1",
        200: "#F0E2C3",
        300: "#E5CE9B",
        400: "#D9B671",
        500: "#CEA050",
        600: "#B5873A",
        700: "#8F6A2E",
        800: "#6B5023",
        900: "#4E3A1A",
        950: "#332510",
      },
      oatmeal: {
        50: "#F7F4EE",
        100: "#EDE8DD",
        200: "#DDD5C4",
        300: "#C7BAA2",
        400: "#B09E80",
        500: "#9A8568",
        600: "#7D6B52",
        700: "#615341",
        800: "#4A3F32",
        900: "#362E25",
        950: "#211C17",
      },
    },

    spacing: {
      xs: "0.25rem",
      sm: "0.5rem",
      md: "0.75rem",
      lg: "1rem",
      xl: "1.5rem",
      "2xl": "2rem",
      "3xl": "3rem",
      "4xl": "4rem",
    },

    radii: {
      none: "0",
      sm: "0.25rem",
      DEFAULT: "0.5rem",
      md: "0.5rem",
      lg: "1rem",
      full: "9999px",
    },

    shadows: {
      sm: "0 1px 3px rgba(44, 24, 16, 0.06)",
      DEFAULT: "0 2px 8px rgba(44, 24, 16, 0.08)",
      md: "0 2px 8px rgba(44, 24, 16, 0.08)",
      lg: "0 4px 16px rgba(44, 24, 16, 0.12)",
    },

    typography: {
      fontFamily:
        "'Ringside Narrow SSm A', 'Ringside Narrow SSm B', Arial, sans-serif",
      baseFontSize: "1.125rem",
      baseLineHeight: "1.6",
    },

    fontWeight: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
      extrabold: "800",
    },
  },

  semantic: {
    colors: {
      primary: { scale: "blue" },
      secondary: { scale: "kale" },
      accent: { scale: "carrot" },
      info: { scale: "eggplant" },
      success: { scale: "kale" },
      warning: { scale: "carrot" },
      error: { scale: "beetroot" },
    },

    backgrounds: {
      pageLight: { ref: "colors.chickpea.50" },
      surfaceLight: { ref: "colors.oatmeal.100" },
      pageDark: { ref: "colors.chickpea.950" },
      surfaceDark: { ref: "colors.chickpea.900" },
      elevated: { ref: "colors.oatmeal.800" },
    },

    surface: {
      scale: "kale",
      darkScale: "chickpea",
    },
  },

  // PrimeVue: auto-derived from semantic tokens, with overrides
  primevue: {
    base: "aura",

    overrides: {
      focusRing: {
        width: "3px",
        style: "solid",
        color: "{primary.color}",
        offset: "2px",
      },

      formField: {
        borderRadius: { ref: "radii.sm" },
      },

      components: {
        card: {
          colorScheme: {
            light: {
              root: {
                background: "{surface.50}",
                color: "{surface.700}",
              },
            },
            dark: {
              root: {
                background: "{surface.950}",
                color: "{surface.50}",
              },
            },
          },
        },
      },
    },
  },

  // UnoCSS: auto-derived from semantic + primitives, with extras
  unocss: {
    colorAliases: {
      // `warm` tracks the active surface scale so `text-warm-*` follows
      // semantic.surface.scale changes automatically.
      warm: "surface",
    },

    extraShortcuts: {
      // `bg-page` stays pinned to the dedicated page scale (chickpea) so
      // the page background remains distinct from surface in both modes.
      "bg-page": { light: "bg-chickpea-50", dark: "dark:bg-chickpea-950" },
      // Surface-family shortcuts resolve against the auto-emitted
      // `surface-*` (light) and `surface-dark-*` (dark) namespaces, which
      // are derived from semantic.surface.{scale,darkScale}.
      "bg-surface": { light: "bg-surface-100", dark: "dark:bg-surface-dark-900" },
      "bg-elevated": { light: "bg-surface-50", dark: "dark:bg-surface-dark-800" },
      "text-body": { light: "text-surface-900", dark: "dark:text-surface-dark-100" },
      "text-muted": { light: "text-surface-500", dark: "dark:text-surface-dark-400" },
      "border-default": {
        light: "border-surface-300",
        dark: "dark:border-surface-dark-700",
      },
    },
  },
});
