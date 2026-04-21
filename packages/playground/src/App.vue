<script setup lang="ts">
import { ref } from 'vue'
import Button from 'primevue/button'
import Menubar from 'primevue/menubar'
import Select from 'primevue/select'
import Tag from 'primevue/tag'
import ConfirmDialog from 'primevue/confirmdialog'
import ConfirmPopup from 'primevue/confirmpopup'
import Toast from 'primevue/toast'
import ScrollTop from 'primevue/scrolltop'

import { updatePreset } from '@primeuix/themes'

// --- Dark mode ---
const isDark = ref(false)
function toggleDark() {
    isDark.value = !isDark.value
    document.documentElement.classList.toggle('dark', isDark.value)
}

// --- Brand switch demo ---
const brandOptions = [
    { label: 'Blueberry', value: 'blueberry' },
    { label: 'Beetroot', value: 'beetroot' },
    { label: 'Kale', value: 'kale' },
    { label: 'Carrot', value: 'carrot' },
    { label: 'Eggplant', value: 'eggplant' },
    { label: 'Chickpea', value: 'chickpea' },
    { label: 'Oatmeal', value: 'oatmeal' },
]
const activeBrand = ref<string>('blueberry')
function scaleRefs(scale: string) {
    return Object.fromEntries(
        [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((s) => [s, `{${scale}.${s}}`]),
    )
}
function applyBrand() {
    updatePreset({ semantic: { primary: scaleRefs(activeBrand.value) } })
}

// --- Surface switch demo ---
const surfaceOptions = [
    { label: 'Kale', value: 'kale' },
    { label: 'Chickpea', value: 'chickpea' },
    { label: 'Oatmeal', value: 'oatmeal' },
    { label: 'Blueberry', value: 'blueberry' },
    { label: 'Beetroot', value: 'beetroot' },
    { label: 'Eggplant', value: 'eggplant' },
    { label: 'Carrot', value: 'carrot' },
]
const activeSurfaceLight = ref<string>('kale')
const activeSurfaceDark = ref<string>('chickpea')
function applySurface() {
    updatePreset({
        semantic: {
            colorScheme: {
                light: { surface: scaleRefs(activeSurfaceLight.value) },
                dark: { surface: scaleRefs(activeSurfaceDark.value) },
            },
        },
    })
}

// --- Navigation ---
const navItems = ref([
    { label: 'Buttons', icon: 'i-prime-bolt', route: '/buttons' },
    { label: 'Form Inputs', icon: 'i-prime-pencil', route: '/forms' },
    { label: 'Data', icon: 'i-prime-table', route: '/data' },
    { label: 'Panels', icon: 'i-prime-clone', route: '/panels' },
    { label: 'Overlays', icon: 'i-prime-window-maximize', route: '/overlays' },
    { label: 'Menus', icon: 'i-prime-bars', route: '/menus' },
    { label: 'Messages', icon: 'i-prime-comment', route: '/messages' },
    { label: 'Media', icon: 'i-prime-image', route: '/media' },
    { label: 'Misc', icon: 'i-prime-box', route: '/misc' },
    { label: 'UnoCSS', icon: 'i-prime-palette', route: '/unocss' },
    { label: 'Palette', icon: 'i-prime-palette', route: '/palette' },
])
</script>

<template>
    <div class="bg-page min-h-screen text-body">
        <Toast />
        <ConfirmDialog group="dialog" />
        <ConfirmPopup group="popup" />

        <!-- Sticky Header -->
        <header class="sticky top-0 z-50 bg-surface border-b border-default px-6 py-3">
            <div class="flex items-center justify-between mb-3">
                <h1 class="text-2xl font-bold flex items-center gap-2 dark:text-surface-50 text-surface-700">
                    <i class="i-prime-palette text-xl" />
                    theme-unify Playground
                </h1>
                <div class="flex items-center gap-3">
                    <Tag value="PrimeVue 4" severity="info" />
                    <Select v-model="activeBrand" :options="brandOptions" optionLabel="label" optionValue="value"
                        @change="applyBrand" placeholder="Brand" size="small" class="w-36"
                        v-tooltip.bottom="'Live-swap the PrimeVue primary scale — UnoCSS bg-primary-* utilities follow automatically.'" />
                    <Select v-model="activeSurfaceLight" :options="surfaceOptions" optionLabel="label"
                        optionValue="value" @change="applySurface" placeholder="Surface" size="small" class="w-36"
                        v-tooltip.bottom="'Live-swap the light surface scale — repaints page chrome via var(--p-surface-*).'" />
                    <Select v-model="activeSurfaceDark" :options="surfaceOptions" optionLabel="label"
                        optionValue="value" @change="applySurface" placeholder="Surface (dark)" size="small"
                        class="w-36"
                        v-tooltip.bottom="'Live-swap the dark surface scale — applies when the .dark class is active.'" />
                    <Button :icon="isDark ? 'i-prime-sun' : 'i-prime-moon'" :label="isDark ? 'Light' : 'Dark'"
                        @click="toggleDark" severity="secondary" size="small" />
                </div>
            </div>
            <Menubar :model="navItems">
                <template #item="{ item, props }">
                    <router-link v-if="item.route" v-slot="{ href, navigate, isActive }" :to="item.route" custom>
                        <a v-ripple :href="href" v-bind="props.action" @click="navigate" :style="isActive ? {
                            background: 'var(--p-menubar-item-active-background)',
                            color: 'var(--p-menubar-item-active-color)',
                            borderRadius: 'var(--p-menubar-item-border-radius)',
                        } : undefined">
                            <span :class="item.icon" />
                            <span>{{ item.label }}</span>
                        </a>
                    </router-link>
                </template>
            </Menubar>
        </header>

        <div class="flex" :style="{ height: 'calc(100vh - 110px)' }">
            <main class="flex-1 overflow-y-auto p-6">
                <router-view />
            </main>
        </div>

        <ScrollTop />
    </div>
</template>
