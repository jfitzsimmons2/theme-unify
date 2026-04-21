<script setup lang="ts">
import Card from 'primevue/card'
import {
    customPalettes,
    builtinPalettes,
    referencedBuiltinPalettes,
    shadowedBuiltinPalettes,
} from '../generated/palettes'

const colorSteps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const
const customPaletteEntries = Object.entries(customPalettes) as Array<
    [string, Record<string, string>]
>
const builtinPaletteEntries = Object.entries(builtinPalettes) as Array<
    [string, Record<string, string>]
>
const referencedBuiltinSet = new Set<string>(referencedBuiltinPalettes)
const shadowedBuiltinSet = new Set<string>(shadowedBuiltinPalettes)
</script>

<template>
    <section class="flex flex-col gap-6">
        <h2 class="text-xl font-semibold flex items-center gap-2">
            <i class="i-prime-palette" /> Color Palette
        </h2>

        <Card>
            <template #title>Custom palettes ({{ customPaletteEntries.length }})</template>
            <template #subtitle>
                From <code>primitive.colors</code> in tokens.config.ts.
            </template>
            <template #content>
                <div class="flex flex-col gap-4">
                    <div v-for="[name, scale] in customPaletteEntries" :key="name">
                        <p class="text-sm font-medium mb-1 text-muted">
                            {{ name }}
                            <span v-if="shadowedBuiltinSet.has(name)"
                                class="ml-2 text-xs px-1.5 py-0.5 rounded-sm bg-surface-200 dark:bg-surface-700">shadows
                                builtin</span>
                        </p>
                        <div class="flex gap-1">
                            <div v-for="step in colorSteps" :key="step"
                                class="w-10 h-10 rounded-sm border border-surface-200 dark:border-surface-700"
                                :style="{ backgroundColor: scale[String(step)] }"
                                :title="`${name}-${step} ${scale[String(step)]}`" />
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
                                class="w-10 h-10 rounded-sm border border-surface-200 dark:border-surface-700"
                                :style="{ backgroundColor: scale[String(step)] }"
                                :title="`${name}-${step} ${scale[String(step)]}`" />
                        </div>
                    </div>
                </div>
            </template>
        </Card>
    </section>
</template>
