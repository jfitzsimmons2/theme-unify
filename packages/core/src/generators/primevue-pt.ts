import type {
    ResolvedTokens,
    ResolvedAutoTokens,
    ColorScale,
} from "../types.js";
import { fileHeader } from "./utils.js";
import {
    BUILTIN_PALETTES,
    isBuiltinPalette,
    resolveScale,
} from "../builtin-palettes.js";

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

interface PTSeverityClassMap {
    bg: string;
    bgHover: string;
    bgActive: string;
    text: string;
    border: string;
    bgSubtle: string;
    textSubtle: string;
    borderSubtle: string;
}

interface PTSurfaceClassMap {
    pageBg: string;
    surfaceBg: string;
    surfaceBgHover: string;
    elevatedBg: string;
    elevatedBgHover: string;
    cardBg: string;
    cardBgHover: string;
    text: string;
    textHover: string;
    textMuted: string;
    border: string;
    inputBg: string;
    inputBorder: string;
    inputBorderHover: string;
    inputBorderFocus: string;
}

// ---------------------------------------------------------------------------
// Severity role definitions
// ---------------------------------------------------------------------------

const SEVERITY_ALIASES: Record<string, string[]> = {
    primary: ["primary"],
    secondary: ["secondary"],
    success: ["success"],
    info: ["info"],
    warn: ["warn", "warning"],
    danger: ["danger", "error"],
    help: ["help"],
    contrast: ["contrast"],
};

// ---------------------------------------------------------------------------
// Color resolution helpers
// ---------------------------------------------------------------------------

function getSemanticColorScale(
    resolved: ResolvedTokens | ResolvedAutoTokens,
    role: string,
): ColorScale | undefined {
    const sem = resolved.semantic;
    if (!sem?.colors) return undefined;

    // Direct match
    if (sem.colors[role]) {
        return resolveScale(sem.colors[role].scale, resolved.primitive);
    }

    // Try aliases
    for (const [canonical, aliases] of Object.entries(SEVERITY_ALIASES)) {
        if (aliases.includes(role) || canonical === role) {
            // Look for any matching role in semantic.colors
            for (const alias of [canonical, ...aliases]) {
                if (sem.colors[alias]) {
                    return resolveScale(sem.colors[alias].scale, resolved.primitive);
                }
            }
        }
    }

    return undefined;
}

function getSurfaceScale(
    resolved: ResolvedTokens | ResolvedAutoTokens,
): ColorScale | undefined {
    const surfaceScaleName = resolved.semantic?.surface?.scale;
    if (!surfaceScaleName) return undefined;
    return resolveScale(surfaceScaleName, resolved.primitive);
}

function getPrimaryScale(
    resolved: ResolvedTokens | ResolvedAutoTokens,
): ColorScale | undefined {
    return getSemanticColorScale(resolved, "primary");
}

// ---------------------------------------------------------------------------
// Build severity class maps
// ---------------------------------------------------------------------------

function resolveScaleName(
    scale: ColorScale,
    resolved: ResolvedTokens | ResolvedAutoTokens,
): string | undefined {
    const val500 = scale[500];
    for (const [name, s] of Object.entries(resolved.primitive.colors)) {
        if (s[500] === val500) return name;
    }
    // Fall back to builtin palette names
    for (const [name, s] of Object.entries(BUILTIN_PALETTES)) {
        if (s[500] === val500) return name;
    }
    return undefined;
}

function buildSeverityClassMapsResolved(
    resolved: ResolvedTokens | ResolvedAutoTokens,
): Record<string, PTSeverityClassMap> {
    const maps: Record<string, PTSeverityClassMap> = {};
    const severities = [
        "primary",
        "secondary",
        "success",
        "info",
        "warn",
        "danger",
        "help",
        "contrast",
    ];

    for (const severity of severities) {
        const scale = getSemanticColorScale(resolved, severity);
        if (!scale) continue;

        const name = resolveScaleName(scale, resolved);
        if (!name) continue;

        // Check if this is a dark color (500 step is quite dark) — use white text if so
        // Simple heuristic: all our palettes use light text on 500+ steps
        maps[severity] = {
            bg: `bg-${name}-500`,
            bgHover: `bg-${name}-600`,
            bgActive: `bg-${name}-700`,
            text: `text-white`,
            border: `border-${name}-600`,
            bgSubtle: `bg-${name}-50`,
            textSubtle: `text-${name}-700`,
            borderSubtle: `border-${name}-200`,
        };
    }

    return maps;
}

// ---------------------------------------------------------------------------
// Build surface class map
// ---------------------------------------------------------------------------

function buildSurfaceClassMapResolved(
    resolved: ResolvedTokens | ResolvedAutoTokens,
): PTSurfaceClassMap {
    const lightScale = getSurfaceScale(resolved);
    const primaryScale = getPrimaryScale(resolved);
    const lightName = lightScale
        ? resolveScaleName(lightScale, resolved)
        : undefined;
    const primaryName = primaryScale
        ? resolveScaleName(primaryScale, resolved)
        : undefined;

    // Resolve dark-mode surface scale (falls back to the light scale if
    // `semantic.surface.darkScale` is not configured or unknown).
    const darkScaleName = resolved.semantic?.surface?.darkScale;
    const darkName =
        darkScaleName &&
            (resolved.primitive.colors[darkScaleName] ||
                isBuiltinPalette(darkScaleName))
            ? darkScaleName
            : lightName;

    const pair = (lightCls: string, darkCls: string) =>
        `${lightCls} dark:${darkCls}`;

    // Helper: apply a modifier prefix (e.g. `hover:`) to every class in a
    // light/`dark:` paired string so the dark variant also picks up the
    // modifier. `"bg-foo dark:bg-bar"` + `hover:` becomes
    // `"hover:bg-foo dark:hover:bg-bar"`.
    const withModifier = (modifier: string, paired: string) =>
        paired
            .split(/\s+/)
            .filter(Boolean)
            .map((cls) =>
                cls.startsWith("dark:")
                    ? `dark:${modifier}${cls.slice("dark:".length)}`
                    : `${modifier}${cls}`,
            )
            .join(" ");

    // Emit paired light + `dark:` classes so components remain readable in
    // both colour schemes. UnoCSS scans the generated PT file, so the dark
    // variants get included in the produced stylesheet automatically.
    const pageBg =
        lightName && darkName
            ? pair(`bg-${lightName}-50`, `bg-${darkName}-950`)
            : "bg-white dark:bg-gray-900";
    const surfaceBg =
        lightName && darkName
            ? pair(`bg-${lightName}-100`, `bg-${darkName}-900`)
            : "bg-gray-100 dark:bg-gray-800";
    const elevatedBg =
        lightName && darkName
            ? pair(`bg-${lightName}-200`, `bg-${darkName}-800`)
            : "bg-gray-200 dark:bg-gray-700";
    const cardBg =
        lightName && darkName
            ? pair(`bg-${lightName}-50`, `bg-${darkName}-900`)
            : "bg-white dark:bg-gray-900";
    const text =
        lightName && darkName
            ? pair(`text-${lightName}-950`, `text-${darkName}-50`)
            : "text-gray-900 dark:text-gray-100";
    const textMuted =
        lightName && darkName
            ? pair(`text-${lightName}-600`, `text-${darkName}-400`)
            : "text-gray-500 dark:text-gray-400";
    const border =
        lightName && darkName
            ? pair(`border-${lightName}-200`, `border-${darkName}-700`)
            : "border-gray-200 dark:border-gray-700";
    const inputBg =
        lightName && darkName
            ? pair(`bg-${lightName}-50`, `bg-${darkName}-900`)
            : "bg-white dark:bg-gray-900";
    const inputBorder =
        lightName && darkName
            ? pair(`border-${lightName}-300`, `border-${darkName}-700`)
            : "border-gray-300 dark:border-gray-700";
    const inputBorderHover = primaryName
        ? `border-${primaryName}-400`
        : inputBorder;
    const inputBorderFocus = primaryName
        ? `border-${primaryName}-500`
        : inputBorder;

    return {
        pageBg,
        surfaceBg,
        surfaceBgHover: withModifier("hover:", surfaceBg),
        elevatedBg,
        elevatedBgHover: withModifier("hover:", elevatedBg),
        cardBg,
        cardBgHover: withModifier("hover:", cardBg),
        text,
        textHover: withModifier("hover:", text),
        textMuted,
        border,
        inputBg,
        inputBorder,
        inputBorderHover,
        inputBorderFocus,
    };
}

// ---------------------------------------------------------------------------
// PT component generators
// ---------------------------------------------------------------------------

function buildButtonPT(
    severities: Record<string, PTSeverityClassMap>,
    primary: PTSeverityClassMap,
): object {
    return {
        root: ({ props }: { props: Record<string, unknown> }) => {
            const sev =
                typeof props.severity === "string" && severities[props.severity]
                    ? severities[props.severity]
                    : (severities.primary ?? primary);

            const variant = props.variant as string | undefined;
            const size = props.size as string | undefined;
            const rounded = props.rounded as boolean | undefined;
            const raised = props.raised as boolean | undefined;

            let base: string;
            if (variant === "outlined") {
                base = `bg-transparent ${sev.textSubtle} ${sev.borderSubtle} border hover:${sev.bgSubtle} focus:outline-none focus:ring-2 focus:ring-offset-1`;
            } else if (variant === "text") {
                base = `bg-transparent ${sev.textSubtle} border-transparent hover:${sev.bgSubtle} focus:outline-none`;
            } else {
                base = `${sev.bg} ${sev.text} ${sev.border} border hover:${sev.bgHover} active:${sev.bgActive} focus:outline-none focus:ring-2 focus:ring-offset-1`;
            }

            const sizes: Record<string, string> = {
                small: "px-3 py-1.5 text-sm",
                large: "px-6 py-3 text-base",
            };
            const sizeClasses = size
                ? (sizes[size] ?? "px-4 py-2 text-sm")
                : "px-4 py-2 text-sm";
            const roundedClasses = rounded ? "rounded-full" : "rounded";
            const raisedClasses = raised ? "shadow-md" : "";
            const disabledClasses = "disabled:opacity-50 disabled:cursor-not-allowed";
            const transitionClasses = "transition-colors duration-150";

            return `inline-flex items-center justify-center gap-2 font-medium cursor-pointer select-none whitespace-nowrap ${base} ${sizeClasses} ${roundedClasses} ${raisedClasses} ${disabledClasses} ${transitionClasses}`.trim();
        },
        label: "flex-1",
        icon: "shrink-0",
        loadingIcon: "shrink-0 animate-spin",
        badge: "ml-1",
    };
}

function buildCardPT(_surf: PTSurfaceClassMap): object {
    return {
        // Background + text colour are intentionally omitted so the PrimeVue
        // preset's `card.colorScheme.*.root.{background,color}` tokens drive
        // the colour. Title/subtitle inherit `color` from the card root, so we
        // do not add `text-*` utility classes here either — adding them would
        // override the preset colour and break dark mode.
        root: `rounded-lg shadow overflow-hidden`,
        header: `overflow-hidden`,
        body: `p-5 flex flex-col gap-3`,
        title: `text-lg font-semibold`,
        subtitle: `text-sm opacity-70`,
        content: ``,
        footer: `pt-3 mt-auto`,
    };
}

function buildInputTextPT(surf: PTSurfaceClassMap): object {
    return {
        root: ({ props }: { props: Record<string, unknown> }) => {
            const invalid = props.invalid as boolean | undefined;
            const disabled = props.disabled as boolean | undefined;
            const base = `w-full px-3 py-2 text-sm rounded ${surf.inputBg} ${surf.text} ${surf.inputBorder} border outline-none transition-colors duration-150`;
            const states = invalid
                ? "border-red-500 focus:border-red-500"
                : `hover:${surf.inputBorderHover} focus:${surf.inputBorderFocus} focus:ring-2 focus:ring-offset-1`;
            const disabledCls = disabled ? "opacity-50 cursor-not-allowed" : "";
            return `${base} ${states} ${disabledCls}`.trim();
        },
    };
}

function buildTextareaPT(surf: PTSurfaceClassMap): object {
    return {
        root: `w-full px-3 py-2 text-sm rounded ${surf.inputBg} ${surf.text} ${surf.inputBorder} border outline-none transition-colors duration-150 hover:${surf.inputBorderHover} focus:${surf.inputBorderFocus} resize-y`,
    };
}

function buildSelectPT(
    surf: PTSurfaceClassMap,
    primary: PTSeverityClassMap,
): object {
    return {
        root: ({ props }: { props: Record<string, unknown> }) =>
            `inline-flex items-center w-full px-3 py-2 text-sm rounded ${surf.inputBg} ${surf.text} ${surf.inputBorder} border outline-none cursor-pointer transition-colors duration-150 hover:${surf.inputBorderHover} ${props.focused ? `${surf.inputBorderFocus} ring-2 ring-offset-1` : ""} ${props.disabled ? "opacity-50 cursor-not-allowed" : ""}`.trim(),
        label: "flex-1 min-w-0 truncate",
        dropdown: `ml-2 shrink-0 ${surf.textMuted}`,
        overlay: `absolute z-50 ${surf.cardBg} ${surf.border} border rounded-lg shadow-lg py-1 mt-1 min-w-full`,
        list: "py-1",
        option: ({ context }: { context: Record<string, unknown> }) =>
            `px-3 py-2 text-sm cursor-pointer ${context.selected ? `${primary.bgSubtle} ${primary.textSubtle} font-medium` : `${surf.text} ${surf.surfaceBgHover}`}`,
        clearIcon: `ml-1 shrink-0 ${surf.textMuted}`,
    };
}

function buildDataTablePT(
    surf: PTSurfaceClassMap,
    primary: PTSeverityClassMap,
): object {
    return {
        root: `w-full`,
        table: `w-full border-collapse text-sm`,
        header: `px-4 py-3 ${surf.surfaceBg} ${surf.border} border-b`,
        headerRow: ``,
        headerCell: `px-4 py-3 text-left font-semibold ${surf.textMuted} ${surf.border} border-b cursor-pointer select-none ${surf.cardBgHover} transition-colors`,
        bodyRow: ({ context }: { context: Record<string, unknown> }) =>
            `${context.striped ? surf.surfaceBg : surf.cardBg} ${surf.elevatedBgHover} transition-colors`,
        bodyCell: `px-4 py-3 ${surf.border} border-b`,
        paginator: {
            root: `flex items-center justify-between px-4 py-2 ${surf.surfaceBg} ${surf.border} border-t`,
            pages: `flex items-center gap-1`,
            page: ({ context }: { context: Record<string, unknown> }) =>
                `w-8 h-8 flex items-center justify-center rounded text-sm cursor-pointer ${context.active ? `${primary.bg} ${primary.text}` : surf.elevatedBgHover}`,
        },
    };
}

function buildDialogPT(surf: PTSurfaceClassMap): object {
    return {
        root: `relative z-40 flex flex-col rounded-lg shadow-xl ${surf.cardBg} ${surf.text} max-h-screen overflow-hidden`,
        mask: `fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-[2px]`,
        header: `flex items-center justify-between px-6 py-4 ${surf.border} border-b`,
        title: `text-lg font-semibold`,
        content: `px-6 py-4 overflow-y-auto flex-1`,
        footer: `flex items-center justify-end gap-3 px-6 py-4 ${surf.border} border-t`,
        pcCloseButton: {
            root: `ml-auto -mr-2 p-1 rounded ${surf.surfaceBgHover} transition-colors ${surf.textMuted}`,
        },
    };
}

function buildDrawerPT(surf: PTSurfaceClassMap): object {
    return {
        root: `fixed z-40 flex flex-col ${surf.cardBg} ${surf.text} shadow-xl`,
        mask: `fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]`,
        header: `flex items-center justify-between px-6 py-4 ${surf.border} border-b`,
        title: `text-lg font-semibold`,
        content: `px-6 py-4 overflow-y-auto flex-1`,
        pcCloseButton: {
            root: `ml-auto -mr-2 p-1 rounded ${surf.surfaceBgHover} transition-colors ${surf.textMuted}`,
        },
    };
}

function buildMessagePT(
    severities: Record<string, PTSeverityClassMap>,
): object {
    return {
        root: ({ props }: { props: Record<string, unknown> }) => {
            const sev =
                typeof props.severity === "string" && severities[props.severity]
                    ? severities[props.severity]
                    : (severities.info ?? severities.primary);
            if (!sev) return "flex items-start gap-3 p-4 rounded-lg border";
            return `flex items-start gap-3 p-4 rounded-lg ${sev.bgSubtle} ${sev.borderSubtle} border`;
        },
        icon: ({ props }: { props: Record<string, unknown> }) => {
            const sev =
                typeof props.severity === "string" && severities[props.severity]
                    ? severities[props.severity]
                    : (severities.info ?? severities.primary);
            return `shrink-0 ${sev?.textSubtle ?? ""}`;
        },
        text: ({ props }: { props: Record<string, unknown> }) => {
            const sev =
                typeof props.severity === "string" && severities[props.severity]
                    ? severities[props.severity]
                    : (severities.info ?? severities.primary);
            return `text-sm ${sev?.textSubtle ?? ""}`;
        },
        closeButton: `ml-auto -mr-1 p-1 rounded hover:opacity-70 transition-opacity`,
    };
}

function buildToastPT(severities: Record<string, PTSeverityClassMap>): object {
    return {
        root: `fixed z-50 flex flex-col gap-2 p-4`,
        message: ({ props }: { props: Record<string, unknown> }) => {
            const msg = props.message as Record<string, unknown> | undefined;
            const severity =
                typeof msg?.severity === "string" ? msg.severity : undefined;
            const sev =
                severity && severities[severity]
                    ? severities[severity]
                    : (severities.info ?? severities.primary);
            if (!sev)
                return "flex items-start gap-3 p-4 rounded-lg border shadow-lg min-w-64 max-w-sm";
            return `flex items-start gap-3 p-4 rounded-lg ${sev.bgSubtle} ${sev.borderSubtle} border shadow-lg min-w-64 max-w-sm`;
        },
        messageContent: `flex items-start gap-3 flex-1`,
        summary: `font-semibold text-sm`,
        detail: `text-sm mt-0.5 opacity-80`,
        pcCloseButton: {
            root: `ml-auto -mr-1 p-1 rounded hover:opacity-70 transition-opacity shrink-0`,
        },
    };
}

function buildTagPT(severities: Record<string, PTSeverityClassMap>): object {
    return {
        root: ({ props }: { props: Record<string, unknown> }) => {
            const sev =
                typeof props.severity === "string" && severities[props.severity]
                    ? severities[props.severity]
                    : severities.primary;
            if (!sev)
                return "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded";
            return `inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded ${sev.bg} ${sev.text}`;
        },
        icon: `shrink-0 text-xs`,
        label: ``,
    };
}

function buildBadgePT(severities: Record<string, PTSeverityClassMap>): object {
    return {
        root: ({ props }: { props: Record<string, unknown> }) => {
            const sev =
                typeof props.severity === "string" && severities[props.severity]
                    ? severities[props.severity]
                    : severities.primary;
            const size = props.size as string | undefined;
            const sizes: Record<string, string> = {
                small: "min-w-4 h-4 text-[10px] px-1",
                large: "min-w-7 h-7 text-sm px-2",
                xlarge: "min-w-8 h-8 text-base px-2.5",
            };
            const sizeClasses = size
                ? (sizes[size] ?? "min-w-5 h-5 text-xs px-1.5")
                : "min-w-5 h-5 text-xs px-1.5";
            const base = sev ? `${sev.bg} ${sev.text}` : "bg-gray-500 text-white";
            return `inline-flex items-center justify-center rounded-full font-bold ${sizeClasses} ${base}`;
        },
    };
}

function buildPanelPT(surf: PTSurfaceClassMap): object {
    return {
        root: `rounded-lg ${surf.border} border overflow-hidden`,
        header: `flex items-center justify-between px-4 py-3 ${surf.surfaceBg} ${surf.border} border-b`,
        title: `font-semibold ${surf.text}`,
        content: `px-4 py-4 ${surf.cardBg} ${surf.text}`,
        pcToggleButton: {
            root: `p-1 rounded ${surf.elevatedBgHover} transition-colors ${surf.textMuted}`,
        },
    };
}

function buildAccordionPT(surf: PTSurfaceClassMap): object {
    return {
        root: `rounded-lg ${surf.border} border overflow-hidden`,
    };
}

function buildAccordionPanelPT(): object {
    return {
        root: `border-b last:border-b-0`,
    };
}

function buildAccordionHeaderPT(surf: PTSurfaceClassMap): object {
    return {
        root: `w-full flex items-center justify-between px-4 py-3 ${surf.surfaceBg} ${surf.elevatedBgHover} cursor-pointer transition-colors font-medium ${surf.text}`,
        toggleIcon: `shrink-0 ml-2 transition-transform`,
    };
}

function buildAccordionContentPT(surf: PTSurfaceClassMap): object {
    return {
        root: `px-4 py-4 ${surf.cardBg} ${surf.text}`,
    };
}

function buildTabsPT(): object {
    return {
        root: `flex flex-col`,
    };
}

function buildTabListPT(surf: PTSurfaceClassMap): object {
    return {
        root: `flex items-end ${surf.border} border-b overflow-x-auto`,
    };
}

function buildTabPT(
    surf: PTSurfaceClassMap,
    primary: PTSeverityClassMap,
): object {
    return {
        root: ({ context }: { context: Record<string, unknown> }) =>
            `px-4 py-2.5 text-sm font-medium cursor-pointer border-b-2 -mb-px transition-colors whitespace-nowrap ${context.active
                ? `${primary.textSubtle} border-current`
                : `${surf.textMuted} border-transparent ${surf.textHover}`
            }`,
    };
}

function buildTabPanelsPT(): object {
    return {
        root: `flex-1`,
    };
}

function buildTabPanelPT(): object {
    return {
        root: `py-4`,
    };
}

function buildMenuPT(surf: PTSurfaceClassMap): object {
    return {
        root: `rounded-lg ${surf.border} border shadow-lg ${surf.cardBg} py-1 min-w-40`,
        list: ``,
        item: ``,
        itemContent: ``,
        itemLink: `flex items-center gap-2 px-3 py-2 text-sm ${surf.text} ${surf.surfaceBgHover} transition-colors cursor-pointer`,
        itemIcon: `shrink-0 ${surf.textMuted}`,
        itemLabel: ``,
        separator: `my-1 ${surf.border} border-t`,
    };
}

function buildMenubarPT(surf: PTSurfaceClassMap): object {
    return {
        root: `flex items-center px-3 py-1.5 ${surf.surfaceBg} ${surf.border} border-b`,
        rootList: `flex items-center gap-1`,
        item: ``,
        itemContent: ``,
        itemLink: `flex items-center gap-1.5 px-3 py-1.5 text-sm rounded ${surf.text} ${surf.elevatedBgHover} transition-colors cursor-pointer`,
        submenu: `absolute z-50 ${surf.cardBg} ${surf.border} border rounded-lg shadow-lg py-1 min-w-40`,
    };
}

function buildBreadcrumbPT(surf: PTSurfaceClassMap): object {
    return {
        root: `flex items-center`,
        list: `flex items-center gap-1 flex-wrap`,
        item: ``,
        itemLink: `text-sm ${surf.textMuted} ${surf.textHover} transition-colors`,
        separator: `mx-1 ${surf.textMuted}`,
    };
}

function buildAvatarPT(surf: PTSurfaceClassMap): object {
    return {
        root: `inline-flex items-center justify-center rounded-full ${surf.surfaceBg} ${surf.text} overflow-hidden shrink-0`,
        icon: ``,
        label: `font-medium text-sm`,
    };
}

function buildProgressBarPT(
    primary: PTSeverityClassMap,
    surf: PTSurfaceClassMap,
): object {
    return {
        root: `w-full rounded-full overflow-hidden ${surf.surfaceBg} h-2`,
        value: `h-full ${primary.bg} rounded-full transition-all duration-300`,
        label: `text-xs font-medium text-center mt-1 ${surf.text}`,
    };
}

function buildCheckboxPT(
    surf: PTSurfaceClassMap,
    primary: PTSeverityClassMap,
): object {
    return {
        root: `inline-flex items-center`,
        box: ({ props }: { props: Record<string, unknown> }) =>
            `w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${props.modelValue
                ? `${primary.bg} ${primary.border}`
                : `${surf.inputBg} ${surf.inputBorder} hover:${surf.inputBorderHover}`
            } ${props.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`,
        icon: `text-white text-xs`,
    };
}

function buildRadioButtonPT(
    surf: PTSurfaceClassMap,
    primary: PTSeverityClassMap,
): object {
    return {
        root: `inline-flex items-center`,
        box: ({ props }: { props: Record<string, unknown> }) =>
            `w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${props.modelValue === props.value
                ? `${primary.bg} ${primary.border}`
                : `${surf.inputBg} ${surf.inputBorder} hover:${surf.inputBorderHover}`
            } ${props.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`,
        icon: `w-2 h-2 rounded-full bg-white`,
    };
}

function buildToggleSwitchPT(
    primary: PTSeverityClassMap,
    surf: PTSurfaceClassMap,
): object {
    return {
        root: ({ props }: { props: Record<string, unknown> }) =>
            `relative inline-flex w-10 h-6 rounded-full cursor-pointer transition-colors ${props.modelValue ? primary.bg : surf.surfaceBg
            } ${props.disabled ? "opacity-50 cursor-not-allowed" : ""}`,
        slider: ({ props }: { props: Record<string, unknown> }) =>
            `absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${props.modelValue ? "translate-x-4" : "translate-x-0"
            }`,
    };
}

function buildDividerPT(surf: PTSurfaceClassMap): object {
    return {
        root: `flex items-center my-3`,
        content: `px-3 text-sm ${surf.textMuted}`,
        beforeContainer: `flex-1 border-t ${surf.border}`,
        afterContainer: `flex-1 border-t ${surf.border}`,
    };
}

// ---------------------------------------------------------------------------
// Build the full PT object
// ---------------------------------------------------------------------------

function buildPTObject(
    resolved: ResolvedTokens | ResolvedAutoTokens,
): Record<string, unknown> {
    const severities = buildSeverityClassMapsResolved(resolved);
    const surf = buildSurfaceClassMapResolved(resolved);
    const primary = severities.primary ?? {
        bg: "bg-blue-500",
        bgHover: "bg-blue-600",
        bgActive: "bg-blue-700",
        text: "text-white",
        border: "border-blue-600",
        bgSubtle: "bg-blue-50",
        textSubtle: "text-blue-700",
        borderSubtle: "border-blue-200",
    };

    return {
        button: buildButtonPT(severities, primary),
        card: buildCardPT(surf),
        inputtext: buildInputTextPT(surf),
        textarea: buildTextareaPT(surf),
        select: buildSelectPT(surf, primary),
        datatable: buildDataTablePT(surf, primary),
        dialog: buildDialogPT(surf),
        drawer: buildDrawerPT(surf),
        message: buildMessagePT(severities),
        toast: buildToastPT(severities),
        tag: buildTagPT(severities),
        badge: buildBadgePT(severities),
        panel: buildPanelPT(surf),
        accordion: buildAccordionPT(surf),
        accordionpanel: buildAccordionPanelPT(),
        accordionheader: buildAccordionHeaderPT(surf),
        accordioncontent: buildAccordionContentPT(surf),
        tabs: buildTabsPT(),
        tablist: buildTabListPT(surf),
        tab: buildTabPT(surf, primary),
        tabpanels: buildTabPanelsPT(),
        tabpanel: buildTabPanelPT(),
        menu: buildMenuPT(surf),
        menubar: buildMenubarPT(surf),
        breadcrumb: buildBreadcrumbPT(surf),
        avatar: buildAvatarPT(surf),
        progressbar: buildProgressBarPT(primary, surf),
        checkbox: buildCheckboxPT(surf, primary),
        radiobutton: buildRadioButtonPT(surf, primary),
        toggleswitch: buildToggleSwitchPT(primary, surf),
        divider: buildDividerPT(surf),
    };
}

// ---------------------------------------------------------------------------
// Code generation for the file output
// ---------------------------------------------------------------------------

function q(s: string): string {
    return `'${s.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
}

function indent(depth: number): string {
    return "  ".repeat(depth);
}

/**
 * Build a self-contained PT object suitable for code generation —
 * all class-string values are already resolved; functions are replaced
 * with code strings that reference only their own parameters.
 */
function buildPTCodeObject(
    resolved: ResolvedTokens | ResolvedAutoTokens,
): Record<string, unknown> {
    const severities = buildSeverityClassMapsResolved(resolved);
    const surf = buildSurfaceClassMapResolved(resolved);
    const primary = severities.primary ?? {
        bg: "bg-primary-500",
        bgHover: "bg-primary-600",
        bgActive: "bg-primary-700",
        text: "text-white",
        border: "border-primary-600",
        bgSubtle: "bg-primary-50",
        textSubtle: "text-primary-700",
        borderSubtle: "border-primary-200",
    };

    // Build a severity lookup for code generation
    const sevLookup = severities;

    // Button: keep as a function with inline severity maps
    const severityMapCode = Object.entries(sevLookup)
        .map(
            ([k, v]) =>
                `    ${q(k)}: { bg: ${q(v.bg)}, bgHover: ${q(v.bgHover)}, bgActive: ${q(v.bgActive)}, text: ${q(v.text)}, border: ${q(v.border)}, bgSubtle: ${q(v.bgSubtle)}, textSubtle: ${q(v.textSubtle)}, borderSubtle: ${q(v.borderSubtle)} }`,
        )
        .join(",\n");

    const buttonRootFn = `({ props }) => {
      const sevMap = {\n${severityMapCode}\n    };
      const sev = (typeof props.severity === 'string' && sevMap[props.severity]) ? sevMap[props.severity] : sevMap.primary ?? sevMap[Object.keys(sevMap)[0]];
      const variant = props.variant;
      const size = props.size;
      const rounded = props.rounded;
      const raised = props.raised;
      let base;
      if (variant === 'outlined') {
        base = \`bg-transparent \${sev.textSubtle} \${sev.borderSubtle} border hover:\${sev.bgSubtle} focus:outline-none focus:ring-2 focus:ring-offset-1\`;
      } else if (variant === 'text') {
        base = \`bg-transparent \${sev.textSubtle} border-transparent hover:\${sev.bgSubtle} focus:outline-none\`;
      } else {
        base = \`\${sev.bg} \${sev.text} \${sev.border} border hover:\${sev.bgHover} active:\${sev.bgActive} focus:outline-none focus:ring-2 focus:ring-offset-1\`;
      }
      const sizes = { small: 'px-3 py-1.5 text-sm', large: 'px-6 py-3 text-base' };
      const sizeClasses = size ? (sizes[size] ?? 'px-4 py-2 text-sm') : 'px-4 py-2 text-sm';
      const roundedClasses = rounded ? 'rounded-full' : 'rounded';
      const raisedClasses = raised ? 'shadow-md' : '';
      const disabledClasses = 'disabled:opacity-50 disabled:cursor-not-allowed';
      return \`inline-flex items-center justify-center gap-2 font-medium cursor-pointer select-none whitespace-nowrap \${base} \${sizeClasses} \${roundedClasses} \${raisedClasses} \${disabledClasses} transition-colors duration-150\`.trim();
    }`;

    const inputRootFn = `({ props }) => {
      const base = ${q(`w-full px-3 py-2 text-sm rounded ${surf.inputBg} ${surf.text} ${surf.inputBorder} border outline-none transition-colors duration-150`)};
      const states = props.invalid
        ? 'border-red-500 focus:border-red-500'
        : ${q(`hover:${surf.inputBorderHover} focus:${surf.inputBorderFocus} focus:ring-2 focus:ring-offset-1`)};
      const disabledCls = props.disabled ? 'opacity-50 cursor-not-allowed' : '';
      return \`\${base} \${states} \${disabledCls}\`.trim();
    }`;

    const selectRootFn = `({ props }) =>
      \`inline-flex items-center w-full px-3 py-2 text-sm rounded ${surf.inputBg} ${surf.text} ${surf.inputBorder} border outline-none cursor-pointer transition-colors duration-150 hover:${surf.inputBorderHover} \${props.focused ? '${surf.inputBorderFocus} ring-2 ring-offset-1' : ''} \${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}\`.trim()`;

    const selectOptionFn = `({ context }) =>
      \`px-3 py-2 text-sm cursor-pointer \${context.selected ? ${q(`${primary.bgSubtle} ${primary.textSubtle} font-medium`)} : ${q(`${surf.text} ${surf.surfaceBgHover}`)}}\``;

    const dtBodyRowFn = `({ context }) =>
      \`\${context.striped ? ${q(surf.surfaceBg)} : ${q(surf.cardBg)}} ${surf.elevatedBgHover} transition-colors\``;

    const dtPageFn = `({ context }) =>
      \`w-8 h-8 flex items-center justify-center rounded text-sm cursor-pointer \${context.active ? ${q(`${primary.bg} ${primary.text}`)} : ${q(surf.elevatedBgHover)}}\``;

    // Message root with severity map inline
    const msgRootFn = `({ props }) => {
      const sevMap = {\n${severityMapCode}\n    };
      const sev = (typeof props.severity === 'string' && sevMap[props.severity]) ? sevMap[props.severity] : (sevMap.info ?? sevMap.primary ?? sevMap[Object.keys(sevMap)[0]]);
      if (!sev) return 'flex items-start gap-3 p-4 rounded-lg border';
      return \`flex items-start gap-3 p-4 rounded-lg \${sev.bgSubtle} \${sev.borderSubtle} border\`;
    }`;

    const msgIconFn = `({ props }) => {
      const sevMap = {\n${severityMapCode}\n    };
      const sev = (typeof props.severity === 'string' && sevMap[props.severity]) ? sevMap[props.severity] : (sevMap.info ?? sevMap.primary ?? sevMap[Object.keys(sevMap)[0]]);
      return \`shrink-0 \${sev?.textSubtle ?? ''}\`;
    }`;

    const msgTextFn = `({ props }) => {
      const sevMap = {\n${severityMapCode}\n    };
      const sev = (typeof props.severity === 'string' && sevMap[props.severity]) ? sevMap[props.severity] : (sevMap.info ?? sevMap.primary ?? sevMap[Object.keys(sevMap)[0]]);
      return \`text-sm \${sev?.textSubtle ?? ''}\`;
    }`;

    const toastMsgFn = `({ props }) => {
      const sevMap = {\n${severityMapCode}\n    };
      const msg = props.message;
      const severity = typeof msg?.severity === 'string' ? msg.severity : undefined;
      const sev = (severity && sevMap[severity]) ? sevMap[severity] : (sevMap.info ?? sevMap.primary ?? sevMap[Object.keys(sevMap)[0]]);
      if (!sev) return 'flex items-start gap-3 p-4 rounded-lg border shadow-lg min-w-64 max-w-sm';
      return \`flex items-start gap-3 p-4 rounded-lg \${sev.bgSubtle} \${sev.borderSubtle} border shadow-lg min-w-64 max-w-sm\`;
    }`;

    const tagRootFn = `({ props }) => {
      const sevMap = {\n${severityMapCode}\n    };
      const sev = (typeof props.severity === 'string' && sevMap[props.severity]) ? sevMap[props.severity] : (sevMap.primary ?? sevMap[Object.keys(sevMap)[0]]);
      if (!sev) return 'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded';
      return \`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded \${sev.bg} \${sev.text}\`;
    }`;

    const badgeRootFn = `({ props }) => {
      const sevMap = {\n${severityMapCode}\n    };
      const sev = (typeof props.severity === 'string' && sevMap[props.severity]) ? sevMap[props.severity] : (sevMap.primary ?? sevMap[Object.keys(sevMap)[0]]);
      const sizes = { small: 'min-w-4 h-4 text-[10px] px-1', large: 'min-w-7 h-7 text-sm px-2', xlarge: 'min-w-8 h-8 text-base px-2.5' };
      const sizeClasses = props.size ? (sizes[props.size] ?? 'min-w-5 h-5 text-xs px-1.5') : 'min-w-5 h-5 text-xs px-1.5';
      const base = sev ? \`\${sev.bg} \${sev.text}\` : 'bg-gray-500 text-white';
      return \`inline-flex items-center justify-center rounded-full font-bold \${sizeClasses} \${base}\`;
    }`;

    const tabRootFn = `({ context }) =>
      \`px-4 py-2.5 text-sm font-medium cursor-pointer border-b-2 -mb-px transition-colors whitespace-nowrap \${context.active ? ${q(`${primary.textSubtle} border-current`)} : ${q(`${surf.textMuted} border-transparent ${surf.textHover}`)}}\``;

    const checkboxBoxFn = `({ props }) =>
      \`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors \${props.modelValue ? ${q(`${primary.bg} ${primary.border}`)} : ${q(`${surf.inputBg} ${surf.inputBorder} hover:${surf.inputBorderHover}`)}} \${props.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}\``;

    const radioBoxFn = `({ props }) =>
      \`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors \${props.modelValue === props.value ? ${q(`${primary.bg} ${primary.border}`)} : ${q(`${surf.inputBg} ${surf.inputBorder} hover:${surf.inputBorderHover}`)}} \${props.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}\``;

    const toggleRootFn = `({ props }) =>
      \`relative inline-flex w-10 h-6 rounded-full cursor-pointer transition-colors \${props.modelValue ? ${q(primary.bg)} : ${q(surf.surfaceBg)}} \${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}\``;

    const toggleSliderFn = `({ props }) =>
      \`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform \${props.modelValue ? 'translate-x-4' : 'translate-x-0'}\``;

    // Return a special marker object that the code serializer will handle
    return {
        __codeGen: true,
        button: {
            root: { __fn: buttonRootFn },
            label: "flex-1",
            icon: "shrink-0",
            loadingIcon: "shrink-0 animate-spin",
            badge: "ml-1",
        },
        card: {
            // Background + text colour are intentionally omitted so the PrimeVue
            // preset's `card.colorScheme.*.root.{background,color}` tokens drive
            // the colour. Title/subtitle inherit `color` from the card root, so
            // we do not add `text-*` utility classes here either — adding them
            // would override the preset colour and break dark mode.
            root: `rounded-lg shadow overflow-hidden`,
            header: "overflow-hidden",
            body: "p-5 flex flex-col gap-3",
            title: "text-lg font-semibold",
            subtitle: "text-sm opacity-70",
            content: "",
            footer: "pt-3 mt-auto",
        },
        inputtext: { root: { __fn: inputRootFn } },
        textarea: {
            root: `w-full px-3 py-2 text-sm rounded ${surf.inputBg} ${surf.text} ${surf.inputBorder} border outline-none transition-colors duration-150 hover:${surf.inputBorderHover} focus:${surf.inputBorderFocus} resize-y`,
        },
        select: {
            root: { __fn: selectRootFn },
            label: "flex-1 min-w-0 truncate",
            dropdown: `ml-2 shrink-0 ${surf.textMuted}`,
            overlay: `absolute z-50 ${surf.cardBg} ${surf.border} border rounded-lg shadow-lg py-1 mt-1 min-w-full`,
            list: "py-1",
            option: { __fn: selectOptionFn },
            clearIcon: `ml-1 shrink-0 ${surf.textMuted}`,
        },
        datatable: {
            root: "w-full",
            table: "w-full border-collapse text-sm",
            header: `px-4 py-3 ${surf.surfaceBg} ${surf.border} border-b`,
            headerRow: "",
            headerCell: `px-4 py-3 text-left font-semibold ${surf.textMuted} ${surf.border} border-b cursor-pointer select-none ${surf.cardBgHover} transition-colors`,
            bodyRow: { __fn: dtBodyRowFn },
            bodyCell: `px-4 py-3 ${surf.border} border-b`,
            paginator: {
                root: `flex items-center justify-between px-4 py-2 ${surf.surfaceBg} ${surf.border} border-t`,
                pages: "flex items-center gap-1",
                page: { __fn: dtPageFn },
            },
        },
        dialog: {
            root: `relative z-40 flex flex-col rounded-lg shadow-xl ${surf.cardBg} ${surf.text} max-h-screen overflow-hidden`,
            mask: "fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-[2px]",
            header: `flex items-center justify-between px-6 py-4 ${surf.border} border-b`,
            title: "text-lg font-semibold",
            content: "px-6 py-4 overflow-y-auto flex-1",
            footer: `flex items-center justify-end gap-3 px-6 py-4 ${surf.border} border-t`,
            pcCloseButton: {
                root: `ml-auto -mr-2 p-1 rounded ${surf.surfaceBgHover} transition-colors ${surf.textMuted}`,
            },
        },
        drawer: {
            root: `fixed z-40 flex flex-col ${surf.cardBg} ${surf.text} shadow-xl`,
            mask: "fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]",
            header: `flex items-center justify-between px-6 py-4 ${surf.border} border-b`,
            title: "text-lg font-semibold",
            content: "px-6 py-4 overflow-y-auto flex-1",
            pcCloseButton: {
                root: `ml-auto -mr-2 p-1 rounded ${surf.surfaceBgHover} transition-colors ${surf.textMuted}`,
            },
        },
        message: {
            root: { __fn: msgRootFn },
            icon: { __fn: msgIconFn },
            text: { __fn: msgTextFn },
            closeButton:
                "ml-auto -mr-1 p-1 rounded hover:opacity-70 transition-opacity",
        },
        toast: {
            root: "fixed z-50 flex flex-col gap-2 p-4",
            message: { __fn: toastMsgFn },
            messageContent: "flex items-start gap-3 flex-1",
            summary: "font-semibold text-sm",
            detail: "text-sm mt-0.5 opacity-80",
            pcCloseButton: {
                root: "ml-auto -mr-1 p-1 rounded hover:opacity-70 transition-opacity shrink-0",
            },
        },
        tag: {
            root: { __fn: tagRootFn },
            icon: "shrink-0 text-xs",
            label: "",
        },
        badge: {
            root: { __fn: badgeRootFn },
        },
        panel: {
            root: `rounded-lg ${surf.border} border overflow-hidden`,
            header: `flex items-center justify-between px-4 py-3 ${surf.surfaceBg} ${surf.border} border-b`,
            title: `font-semibold ${surf.text}`,
            content: `px-4 py-4 ${surf.cardBg} ${surf.text}`,
            pcToggleButton: {
                root: `p-1 rounded ${surf.elevatedBgHover} transition-colors ${surf.textMuted}`,
            },
        },
        accordion: { root: `rounded-lg ${surf.border} border overflow-hidden` },
        accordionpanel: { root: "border-b last:border-b-0" },
        accordionheader: {
            root: `w-full flex items-center justify-between px-4 py-3 ${surf.surfaceBg} ${surf.elevatedBgHover} cursor-pointer transition-colors font-medium ${surf.text}`,
            toggleIcon: "shrink-0 ml-2 transition-transform",
        },
        accordioncontent: { root: `px-4 py-4 ${surf.cardBg} ${surf.text}` },
        tabs: { root: "flex flex-col" },
        tablist: { root: `flex items-end ${surf.border} border-b overflow-x-auto` },
        tab: { root: { __fn: tabRootFn } },
        tabpanels: { root: "flex-1" },
        tabpanel: { root: "py-4" },
        menu: {
            root: `rounded-lg ${surf.border} border shadow-lg ${surf.cardBg} py-1 min-w-40`,
            list: "",
            item: "",
            itemContent: "",
            itemLink: `flex items-center gap-2 px-3 py-2 text-sm ${surf.text} ${surf.surfaceBgHover} transition-colors cursor-pointer`,
            itemIcon: `shrink-0 ${surf.textMuted}`,
            itemLabel: "",
            separator: `my-1 ${surf.border} border-t`,
        },
        menubar: {
            root: `flex items-center px-3 py-1.5 ${surf.surfaceBg} ${surf.border} border-b`,
            rootList: "flex items-center gap-1",
            item: "",
            itemContent: "",
            itemLink: `flex items-center gap-1.5 px-3 py-1.5 text-sm rounded ${surf.text} ${surf.elevatedBgHover} transition-colors cursor-pointer`,
            submenu: `absolute z-50 ${surf.cardBg} ${surf.border} border rounded-lg shadow-lg py-1 min-w-40`,
        },
        breadcrumb: {
            root: "flex items-center",
            list: "flex items-center gap-1 flex-wrap",
            item: "",
            itemLink: `text-sm ${surf.textMuted} ${surf.textHover} transition-colors`,
            separator: `mx-1 ${surf.textMuted}`,
        },
        avatar: {
            root: `inline-flex items-center justify-center rounded-full ${surf.surfaceBg} ${surf.text} overflow-hidden shrink-0`,
            icon: "",
            label: "font-medium text-sm",
        },
        progressbar: {
            root: `w-full rounded-full overflow-hidden ${surf.surfaceBg} h-2`,
            value: `h-full ${primary.bg} rounded-full transition-all duration-300`,
            label: `text-xs font-medium text-center mt-1 ${surf.text}`,
        },
        checkbox: {
            root: "inline-flex items-center",
            box: { __fn: checkboxBoxFn },
            icon: "text-white text-xs",
        },
        radiobutton: {
            root: "inline-flex items-center",
            box: { __fn: radioBoxFn },
            icon: "w-2 h-2 rounded-full bg-white",
        },
        toggleswitch: {
            root: { __fn: toggleRootFn },
            slider: { __fn: toggleSliderFn },
        },
        divider: {
            root: "flex items-center my-3",
            content: `px-3 text-sm ${surf.textMuted}`,
            beforeContainer: `flex-1 border-t ${surf.border}`,
            afterContainer: `flex-1 border-t ${surf.border}`,
        },
    };
}

function serializePTCodeGen(value: unknown, depth: number = 0): string {
    if (value === null || value === undefined) return String(value);
    // Special marker: function code string
    if (
        typeof value === "object" &&
        value !== null &&
        "__fn" in value &&
        typeof (value as Record<string, unknown>).__fn === "string"
    ) {
        return (value as Record<string, unknown>).__fn as string;
    }
    if (typeof value === "string") return q(value);
    if (typeof value === "number" || typeof value === "boolean")
        return String(value);
    if (Array.isArray(value)) {
        if (value.length === 0) return "[]";
        const ind = indent(depth + 1);
        const items = value.map(
            (item) => `${ind}${serializePTCodeGen(item, depth + 1)}`,
        );
        return `[\n${items.join(",\n")},\n${indent(depth)}]`;
    }
    if (typeof value === "object") {
        const obj = value as Record<string, unknown>;
        // Skip internal markers
        const entries = Object.entries(obj).filter(([k]) => k !== "__codeGen");
        if (entries.length === 0) return "{}";
        const ind = indent(depth + 1);
        const lines = entries.map(([k, v]) => {
            const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : `'${k}'`;
            return `${ind}${safeKey}: ${serializePTCodeGen(v, depth + 1)}`;
        });
        return `{\n${lines.join(",\n")},\n${indent(depth)}}`;
    }
    return String(value);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Build the PrimeVue PT (passthrough) object at runtime.
 * Used by `buildPrimeVuePTObject` for live token editing in the playground.
 */
export function buildPrimeVuePTObject(
    resolved: ResolvedTokens | ResolvedAutoTokens,
): Record<string, unknown> {
    return buildPTObject(resolved);
}

/**
 * Generate a TypeScript file exporting `primevuePT` — the passthrough preset
 * for PrimeVue unstyled mode. Uses UnoCSS utility classes derived from tokens.
 */
export function generatePrimeVuePT(
    resolved: ResolvedTokens | ResolvedAutoTokens,
): string {
    const ptCode = buildPTCodeObject(resolved);
    const serialized = serializePTCodeGen(ptCode, 0);

    return [fileHeader(), `export const primevuePT = ${serialized};`, ""].join(
        "\n",
    );
}
