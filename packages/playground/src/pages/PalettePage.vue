<script setup lang="ts">
import Card from 'primevue/card'
import {
    customPalettes,
    builtinPalettes,
    referencedBuiltinPalettes,
    shadowedBuiltinPalettes,
    paletteClassNames,
    semanticPalettes,
} from '../generated/palettes'
import { BUILTIN_PALETTES } from '@jfitzsimmons2/theme-unify'

const colorSteps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const
const surfaceSteps = [0, ...colorSteps] as const
const customPaletteEntries = Object.entries(customPalettes) as Array<
    [string, Record<string, string>]
>
const builtinPaletteEntries = Object.entries(builtinPalettes) as Array<
    [string, Record<string, string>]
>
const referencedBuiltinSet = new Set<string>(referencedBuiltinPalettes)
const shadowedBuiltinSet = new Set<string>(shadowedBuiltinPalettes)
const classNameMap = paletteClassNames as Record<string, string>

// Source palettes from BUILTIN_PALETTES so we can show the original
// hex values alongside the user override below.
const shadowedOriginals = (shadowedBuiltinPalettes as readonly string[]).map(
    (name) => ({
        name,
        original: (BUILTIN_PALETTES as Record<string, Record<string, string>>)[name],
        override: (customPalettes as Record<string, Record<string, string>>)[name],
        className: classNameMap[name] ?? name,
    }),
)

const classFor = (sourceName: string): string => classNameMap[sourceName] ?? sourceName

type SemanticEntry = (typeof semanticPalettes)[number]

const semanticStepsFor = (entry: SemanticEntry): readonly number[] =>
    entry.role === 'surface' ? surfaceSteps : colorSteps

const semanticSourceLabel = (entry: SemanticEntry): string => {
    const fmt = (src: string | null | undefined, kind: string | undefined): string => {
        if (!src) return '(inline scale)'
        return kind === 'builtin' ? `${src} (builtin)` : src
    }
    if (entry.role === 'surface') {
        const light = fmt(entry.source, entry.sourceKind)
        const dark = fmt(entry.darkSource ?? entry.source, entry.darkSourceKind ?? entry.sourceKind)
        return light === dark ? light : `${light} / ${dark} (dark)`
    }
    return fmt(entry.source, entry.sourceKind)
}
</script>

<template>
    <section class="flex flex-col gap-6">
        <h2 class="text-xl font-semibold flex items-center gap-2">
            <i class="i-prime-palette" /> Color Palette
        </h2>

        <Card>
            <template #title>Semantic palettes ({{ semanticPalettes.length }})</template>
            <template #subtitle>
                Roles from <code>semantic</code> in tokens.config.ts. Swatches resolve at runtime via
                <code>--p-{role}-{step}</code> CSS variables, so preset overrides repaint these
                instantly.
            </template>
            <template #content>
                <div class="flex flex-col gap-4">
                    <div v-for="entry in semanticPalettes" :key="entry.role">
                        <p class="text-sm font-medium mb-1 text-muted">
                            {{ entry.role }}
                            <span class="text-xs text-surface-500 dark:text-surface-400">
                                → {{ semanticSourceLabel(entry) }}
                            </span>
                        </p>
                        <div class="flex gap-1">
                            <div v-for="step in semanticStepsFor(entry)" :key="step"
                                :class="[`bg-${entry.className}-${step}`, 'w-10 h-10 rounded-sm border border-surface-200 dark:border-surface-700']"
                                :title="`${entry.role}-${step}`" />
                        </div>
                    </div>
                </div>
            </template>
        </Card>

        <Card>
            <template #title>Custom palettes ({{ customPaletteEntries.length }})</template>
            <template #subtitle>
                From <code>primitive.colors</code> in tokens.config.ts. CamelCase source names map to
                kebab-case UnoCSS classes (e.g. <code>eggplantPurple</code> →
                <code>bg-eggplant-purple-500</code>).
            </template>
            <template #content>
                <div class="flex flex-col gap-4">
                    <div v-for="[name, scale] in customPaletteEntries" :key="name">
                        <p class="text-sm font-medium mb-1 text-muted">
                            {{ name }}
                            <span class="ml-2 text-xs text-surface-500 dark:text-surface-400">
                                → bg-{{ classFor(name) }}-*
                            </span>
                            <span v-if="shadowedBuiltinSet.has(name)"
                                class="ml-2 text-xs px-1.5 py-0.5 rounded-sm bg-surface-200 dark:bg-surface-700">shadows
                                builtin</span>
                        </p>
                        <div class="flex gap-1">
                            <div v-for="step in colorSteps" :key="step"
                                :class="[`bg-${classFor(name)}-${step}`, 'w-10 h-10 rounded-sm border border-surface-200 dark:border-surface-700']"
                                :title="`${name}-${step} ${scale[String(step)]}`" />
                        </div>
                    </div>
                </div>
            </template>
        </Card>

        <Card v-if="shadowedOriginals.length > 0">
            <template #title>Custom overrides of builtins ({{ shadowedOriginals.length }})</template>
            <template #subtitle>
                User palettes in <code>primitive.colors</code> sharing a name with a shipped builtin
                always win — both for PrimeVue's <code>--p-{name}-{step}</code> CSS vars and the
                matching UnoCSS classes. The top row shows the rendered (overridden) values; the
                bottom row shows the original builtin hex for comparison.
            </template>
            <template #content>
                <div class="flex flex-col gap-6">
                    <div v-for="entry in shadowedOriginals" :key="entry.name">
                        <p class="text-sm font-medium mb-1 text-muted">
                            {{ entry.name }}
                            <span
                                class="ml-2 text-xs px-1.5 py-0.5 rounded-sm bg-primary-100 dark:bg-primary-800 text-primary-900 dark:text-primary-100">override
                                active</span>
                        </p>
                        <div class="flex flex-col gap-1">
                            <div class="flex items-center gap-2">
                                <span class="text-xs w-16 text-surface-500 dark:text-surface-400">override</span>
                                <div class="flex gap-1">
                                    <div v-for="step in colorSteps" :key="`o-${step}`"
                                        :class="[`bg-${entry.className}-${step}`, 'w-10 h-10 rounded-sm border border-surface-200 dark:border-surface-700']"
                                        :title="`${entry.name}-${step} ${entry.override?.[String(step)]}`" />
                                </div>
                            </div>
                            <div class="flex items-center gap-2 opacity-70">
                                <span class="text-xs w-16 text-surface-500 dark:text-surface-400">builtin</span>
                                <div class="flex gap-1">
                                    <div v-for="step in colorSteps" :key="`b-${step}`"
                                        :style="{ backgroundColor: entry.original?.[String(step)] }"
                                        class="w-10 h-10 rounded-sm border border-surface-200 dark:border-surface-700"
                                        :title="`${entry.name}-${step} (builtin) ${entry.original?.[String(step)]}`" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </Card>

        <Card>
            <template #title>Builtin palettes ({{ builtinPaletteEntries.length }})</template>
            <template #subtitle>
                Tailwind v3 / PrimeUix Aura palettes shipped with theme-unify. Reference any of these by
                name in <code>semantic</code>.
            </template>
            <template #content>
                <div class="flex flex-col gap-4">
                    <div v-for="[name, scale] in builtinPaletteEntries" :key="name">
                        <p class="text-sm font-medium mb-1 text-muted">
                            {{ name }}
                            <span v-if="referencedBuiltinSet.has(name)"
                                class="ml-2 text-xs px-1.5 py-0.5 rounded-sm bg-primary-100 dark:bg-primary-800 text-primary-900 dark:text-primary-100">referenced</span>
                        </p>
                        <div class="flex gap-1">
                            <div v-for="step in colorSteps" :key="step"
                                :class="[`bg-${classFor(name)}-${step}`, 'w-10 h-10 rounded-sm border border-surface-200 dark:border-surface-700']"
                                :title="`${name}-${step} ${scale[String(step)]}`" />
                        </div>
                    </div>
                </div>
            </template>
        </Card>
    </section>
</template>
