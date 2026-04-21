<script setup lang="ts">
import { ref } from 'vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Tag from 'primevue/tag'

const colorSteps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const

const animationKey = ref(0)
function replayAnimations() {
    animationKey.value += 1
}
</script>

<template>
    <section class="flex flex-col gap-6">
        <h2 class="text-xl font-semibold flex items-center gap-2">
            <i class="i-prime-palette" /> UnoCSS Theme Utilities
        </h2>

        <!-- Semantic Shortcuts -->
        <Card>
            <template #title>Semantic Shortcuts</template>
            <template #subtitle>Pre-composed light/dark utility combos from shortcuts config</template>
            <template #content>
                <div class="flex flex-col gap-3">
                    <div class="flex flex-wrap gap-3">
                        <div class="bg-page border border-default rounded-sm p-4 text-body">
                            <code class="text-xs">bg-page</code>
                        </div>
                        <div class="bg-surface border border-default rounded-sm p-4 text-body">
                            <code class="text-xs">bg-surface</code>
                        </div>
                        <div class="bg-elevated border border-default rounded-sm p-4 text-white dark:text-warm-100">
                            <code class="text-xs">bg-elevated</code>
                        </div>
                    </div>
                    <div class="flex flex-wrap gap-3">
                        <div class="bg-surface rounded-sm p-4 text-body border border-default">
                            <code class="text-xs">text-body</code>
                        </div>
                        <div class="bg-surface rounded-sm p-4 text-muted border border-default">
                            <code class="text-xs">text-muted</code>
                        </div>
                        <div class="bg-surface rounded-sm p-4 border-2 border-default">
                            <code class="text-xs">border-default</code>
                        </div>
                    </div>
                </div>
            </template>
        </Card>

        <!-- Surface Scale -->
        <Card>
            <template #title>Surface Scale (Unified with PrimeVue)</template>
            <template #subtitle>bg-surface-{step} / text-surface-{step} — shared source of truth with
                PrimeVue
                surface tokens</template>
            <template #content>
                <div class="flex flex-col gap-4">
                    <div>
                        <p class="text-xs text-muted mb-1">Light surface (oatmeal)</p>
                        <div class="flex gap-1">
                            <div v-for="step in [0, ...colorSteps]" :key="step"
                                class="flex-1 h-12 flex items-end justify-center pb-1 rounded-sm first:rounded-l last:rounded-r"
                                :class="`bg-surface-${step}`">
                                <span class="text-[10px] font-mono"
                                    :class="step < 400 ? 'text-surface-900' : 'text-surface-50'">{{ step
                                    }}</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <p class="text-xs text-muted mb-1">Dark surface (chickpea)</p>
                        <div class="flex gap-1">
                            <div v-for="step in [0, ...colorSteps]" :key="step"
                                class="flex-1 h-12 flex items-end justify-center pb-1 rounded-sm first:rounded-l last:rounded-r"
                                :class="`bg-surface-dark-${step}`">
                                <span class="text-[10px] font-mono"
                                    :class="step < 400 ? 'text-surface-dark-900' : 'text-surface-dark-50'">{{
                                        step }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </Card>

        <!-- Border Radius -->
        <Card>
            <template #title>Border Radius</template>
            <template #subtitle>rounded-{size} utilities from radii tokens</template>
            <template #content>
                <div class="flex flex-wrap gap-4 items-end">
                    <div class="flex flex-col items-center gap-1"
                        v-for="r in ['none', 'sm', 'DEFAULT', 'md', 'lg', 'full']" :key="r">
                        <div class="w-16 h-16 bg-beetroot-500" :class="r === 'DEFAULT' ? 'rounded' : `rounded-${r}`" />
                        <code class="text-[10px] text-muted">{{ r === 'DEFAULT' ? 'rounded' : `rounded-${r}` }}</code>
                    </div>
                </div>
            </template>
        </Card>

        <!-- Box Shadow -->
        <Card>
            <template #title>Box Shadow</template>
            <template #subtitle>shadow-{size} utilities from shadow tokens</template>
            <template #content>
                <div class="flex flex-wrap gap-6 items-end">
                    <div class="flex flex-col items-center gap-2" v-for="s in ['sm', 'DEFAULT', 'md', 'lg']" :key="s">
                        <div class="w-20 h-20 rounded bg-surface-50 dark:bg-surface-800"
                            :class="s === 'DEFAULT' ? 'shadow' : `shadow-${s}`" />
                        <code class="text-[10px] text-muted">{{ s === 'DEFAULT' ? 'shadow' : `shadow-${s}` }}</code>
                    </div>
                </div>
            </template>
        </Card>

        <!-- Font Weight -->
        <Card>
            <template #title>Font Weight</template>
            <template #subtitle>font-{weight} utilities from fontWeight tokens</template>
            <template #content>
                <div class="flex flex-col gap-2">
                    <p v-for="w in ['normal', 'medium', 'semibold', 'bold', 'extrabold']" :key="w" :class="`font-${w}`"
                        class="text-body text-lg">
                        The quick brown fox — <code class="text-xs text-muted font-normal">font-{{ w }}</code>
                    </p>
                </div>
            </template>
        </Card>

        <!-- Font Family -->
        <Card>
            <template #title>Font Family</template>
            <template #subtitle>font-sans — mapped from typography.fontFamily</template>
            <template #content>
                <p class="font-sans text-body text-lg">
                    The quick brown fox jumps over the lazy dog
                    <code class="text-xs text-muted">font-sans</code>
                </p>
            </template>
        </Card>

        <!-- Breakpoints -->
        <Card>
            <template #title>Breakpoints</template>
            <template #subtitle>md:flex hidden — uses primitive.breakpoints (md = 768px)</template>
            <template #content>
                <div class="flex flex-col gap-2">
                    <p class="text-xs text-muted">
                        Resize the viewport to cross 768px and watch the row swap orientation.
                    </p>
                    <div class="hidden md:flex gap-2 p-3 rounded-sm bg-primary-100 text-primary-900">
                        <Tag value="md+" severity="info" />
                        <span>Visible at md (≥768px) and above via <code class="text-xs">md:flex hidden</code>.</span>
                    </div>
                    <div class="md:hidden p-3 rounded-sm bg-warn-100 text-warn-900">
                        <Tag value="< md" severity="warn" />
                        Visible below md (under 768px) via <code class="text-xs">md:hidden</code>.
                    </div>
                </div>
            </template>
        </Card>

        <!-- Z-Index -->
        <Card>
            <template #title>Z-Index</template>
            <template #subtitle>z-{role} utilities — shared with PrimeVue semantic.zIndex</template>
            <template #content>
                <div class="relative h-32">
                    <div class="absolute top-0 left-0 w-40 h-20 rounded-sm bg-primary-300 z-base p-2 text-xs">
                        z-base (0)
                    </div>
                    <div class="absolute top-4 left-12 w-40 h-20 rounded-sm bg-success-300 z-overlay p-2 text-xs">
                        z-overlay (1100)
                    </div>
                    <div class="absolute top-8 left-24 w-40 h-20 rounded-sm bg-warn-300 z-modal p-2 text-xs">
                        z-modal (1200)
                    </div>
                    <div class="absolute top-12 left-36 w-40 h-20 rounded-sm bg-danger-300 z-tooltip p-2 text-xs">
                        z-tooltip (1400)
                    </div>
                </div>
                <p class="text-xs text-muted mt-2">
                    The same values feed PrimeVue's <code>semantic.zIndex</code> so overlay components stack
                    consistently with these utilities.
                </p>
            </template>
        </Card>

        <!-- Transitions -->
        <Card>
            <template #title>Transitions</template>
            <template #subtitle>duration-{key} + ease-{key} from primitive.transitions</template>
            <template #content>
                <div class="flex flex-wrap gap-3">
                    <button
                        class="px-4 py-2 rounded-sm bg-primary-500 text-white transition-colors duration-fast hover:bg-primary-700">
                        duration-fast (120ms)
                    </button>
                    <button
                        class="px-4 py-2 rounded-sm bg-primary-500 text-white transition-colors duration-base hover:bg-primary-700">
                        duration-base (200ms)
                    </button>
                    <button
                        class="px-4 py-2 rounded-sm bg-primary-500 text-white transition-colors duration-slow hover:bg-primary-700">
                        duration-slow (320ms)
                    </button>
                </div>
            </template>
        </Card>

        <!-- Animations -->
        <Card>
            <template #title>Animations</template>
            <template #subtitle>animate-{name} from primitive.animations (keyframes in style.css)</template>
            <template #content>
                <div class="flex flex-wrap gap-6 items-center">
                    <div class="flex flex-col items-center gap-2">
                        <Button label="Replay" size="small" severity="secondary" @click="replayAnimations" />
                    </div>
                    <div :key="`fade-${animationKey}`"
                        class="px-4 py-3 rounded-sm bg-success-200 text-success-900 animate-fade-in">
                        animate-fade-in
                    </div>
                    <div :key="`slide-${animationKey}`"
                        class="px-4 py-3 rounded-sm bg-info-200 text-info-900 animate-slide-up">
                        animate-slide-up
                    </div>
                </div>
            </template>
        </Card>

        <!-- Color Alias -->
        <Card>
            <template #title>Color Alias</template>
            <template #subtitle>warm → oatmeal (from colorAliases config)</template>
            <template #content>
                <div class="flex flex-col gap-2">
                    <div>
                        <p class="text-xs text-muted mb-1">warm (alias)</p>
                        <div class="flex gap-1">
                            <div v-for="step in colorSteps" :key="step" class="w-8 h-8 rounded-sm"
                                :class="`bg-warm-${step}`" />
                        </div>
                    </div>
                    <div>
                        <p class="text-xs text-muted mb-1">oatmeal (source)</p>
                        <div class="flex gap-1">
                            <div v-for="step in colorSteps" :key="step" class="w-8 h-8 rounded-sm"
                                :class="`bg-oatmeal-${step}`" />
                        </div>
                    </div>
                </div>
            </template>
        </Card>

        <!-- Icons -->
        <Card>
            <template #title>PrimeIcons via UnoCSS</template>
            <template #subtitle>i-prime-{name} — from @iconify-json/prime via presetIcons</template>
            <template #content>
                <div class="flex flex-wrap gap-4 text-2xl text-body">
                    <i class="i-prime-check" v-tooltip="'i-prime-check'" />
                    <i class="i-prime-times" v-tooltip="'i-prime-times'" />
                    <i class="i-prime-search" v-tooltip="'i-prime-search'" />
                    <i class="i-prime-user" v-tooltip="'i-prime-user'" />
                    <i class="i-prime-cog" v-tooltip="'i-prime-cog'" />
                    <i class="i-prime-heart" v-tooltip="'i-prime-heart'" />
                    <i class="i-prime-star" v-tooltip="'i-prime-star'" />
                    <i class="i-prime-bell" v-tooltip="'i-prime-bell'" />
                    <i class="i-prime-home" v-tooltip="'i-prime-home'" />
                    <i class="i-prime-trash" v-tooltip="'i-prime-trash'" />
                    <i class="i-prime-pencil" v-tooltip="'i-prime-pencil'" />
                    <i class="i-prime-download" v-tooltip="'i-prime-download'" />
                    <i class="i-prime-upload" v-tooltip="'i-prime-upload'" />
                    <i class="i-prime-plus" v-tooltip="'i-prime-plus'" />
                    <i class="i-prime-minus" v-tooltip="'i-prime-minus'" />
                    <i class="i-prime-lock" v-tooltip="'i-prime-lock'" />
                    <i class="i-prime-globe" v-tooltip="'i-prime-globe'" />
                    <i class="i-prime-calendar" v-tooltip="'i-prime-calendar'" />
                    <i class="i-prime-chart-bar" v-tooltip="'i-prime-chart-bar'" />
                    <i class="i-prime-envelope" v-tooltip="'i-prime-envelope'" />
                </div>
            </template>
        </Card>
    </section>
</template>
