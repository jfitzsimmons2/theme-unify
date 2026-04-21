import type { ThemeUnifyConfig } from "../../src/types.js";

/**
 * Comprehensive token fixture for the new ThemeUnifyConfig schema.
 */
export const validTokens: ThemeUnifyConfig = {
    meta: {
        name: "Test Theme",
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
        },

        spacing: {
            xs: "0.25rem",
            sm: "0.5rem",
            md: "0.75rem",
            lg: "1rem",
        },

        radii: {
            none: "0",
            sm: "0.25rem",
            md: "0.5rem",
            lg: "1rem",
            full: "9999px",
        },

        shadows: {
            sm: "0 1px 3px rgba(44, 24, 16, 0.06)",
            md: "0 2px 8px rgba(44, 24, 16, 0.08)",
            lg: "0 4px 16px rgba(44, 24, 16, 0.12)",
        },

        typography: {
            fontFamily: "'Ringside Narrow SSm A', Arial, sans-serif",
            baseFontSize: "1.125rem",
            baseLineHeight: "1.6",
        },

        fontWeight: {
            normal: "400",
            medium: "500",
            bold: "700",
        },

        breakpoints: {
            sm: "640px",
            md: "768px",
            lg: "1024px",
        },

        zIndex: {
            base: "0",
            overlay: "1100",
            modal: "1200",
            tooltip: "1400",
        },

        transitions: {
            property: { all: "all" },
            duration: { fast: "120ms", base: "200ms" },
            timingFunction: { standard: "cubic-bezier(0.2, 0, 0, 1)" },
        },

        animations: {
            "fade-in": "fade-in 200ms ease-out both",
        },
    },

    semantic: {
        primary: "beetroot",
        surface: {
            scale: "oatmeal",
            darkScale: "chickpea",
        },
        extra: {
            success: "kale",
            warn: "carrot",
        },
    },

    preset: {
        base: "aura",
        overrides: {
            semantic: {
                focusRing: {
                    width: "3px",
                    style: "solid",
                    color: "{primary.color}",
                    offset: "2px",
                },
                formField: {
                    borderRadius: { ref: "radii.sm" },
                },
            },
            components: {
                card: {
                    colorScheme: {
                        light: { root: { background: "{surface.0}" } },
                        dark: { root: { background: "{surface.900}" } },
                    },
                },
            },
        },
    },

    unocss: {
        shortcuts: {
            "bg-page": { light: "bg-chickpea-50", dark: "dark:bg-chickpea-950" },
            "bg-surface": {
                light: "bg-surface-100",
                dark: "dark:bg-surface-900",
            },
            "text-body": {
                light: "text-surface-900",
                dark: "dark:text-surface-100",
            },
            "text-muted": {
                light: "text-surface-500",
                dark: "dark:text-surface-400",
            },
            "border-default": {
                light: "border-surface-300",
                dark: "dark:border-surface-700",
            },
        },
    },
};

/**
 * Backwards-compatibility fixture using the deprecated `warning` /
 * `error` role aliases. Validator should emit warning-severity issues
 * for both, and generators should canonicalize them to `warn` /
 * `danger` in the output.
 */
export const legacyTokensFixture: ThemeUnifyConfig = {
    ...validTokens,
    semantic: {
        ...validTokens.semantic,
        extra: {
            success: "kale",
            warning: "carrot",
            error: "beetroot",
        },
    },
};
