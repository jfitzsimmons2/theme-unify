<script setup lang="ts">
import Button from 'primevue/button'
import ButtonGroup from 'primevue/buttongroup'
import Card from 'primevue/card'
import SpeedDial from 'primevue/speeddial'
import SplitButton from 'primevue/splitbutton'
import { useToast } from 'primevue/usetoast'

const toast = useToast()

const speedDialItems = [
    { label: 'Add', icon: 'i-prime-plus', command: () => toast.add({ severity: 'info', summary: 'Add', life: 2000 }) },
    { label: 'Edit', icon: 'i-prime-pencil', command: () => toast.add({ severity: 'success', summary: 'Edit', life: 2000 }) },
    { label: 'Delete', icon: 'i-prime-trash', command: () => toast.add({ severity: 'error', summary: 'Delete', life: 2000 }) },
]
</script>

<template>
    <section class="flex flex-col gap-6">
        <h2 class="text-xl font-semibold flex items-center gap-2">
            <i class="i-prime-bolt" /> Buttons
        </h2>

        <Card>
            <template #title>Button Severities</template>
            <template #content>
                <div class="flex flex-wrap gap-3">
                    <Button label="Primary" icon="i-prime-check" />
                    <Button label="Secondary" icon="i-prime-bookmark" severity="secondary" />
                    <Button label="Success" icon="i-prime-check-circle" severity="success" />
                    <Button label="Info" icon="i-prime-info-circle" severity="info" />
                    <Button label="Warn" icon="i-prime-exclamation-triangle" severity="warn" />
                    <Button label="Danger" icon="i-prime-times-circle" severity="danger" />
                    <Button label="Help" icon="i-prime-question-circle" severity="help" />
                    <Button label="Contrast" icon="i-prime-star" severity="contrast" />
                </div>
            </template>
        </Card>

        <Card>
            <template #title>Button Variants</template>
            <template #content>
                <div class="flex flex-wrap items-center gap-3 mb-4">
                    <Button label="Outlined" variant="outlined" />
                    <Button label="Text" variant="text" />
                    <Button label="Link" variant="link" />
                </div>
                <div class="flex flex-wrap items-center gap-3 mb-4">
                    <Button label="Raised" raised />
                    <Button label="Rounded" rounded />
                    <Button icon="i-prime-check" rounded />
                    <Button label="Small" size="small" />
                    <Button label="Large" size="large" />
                </div>
                <div class="flex flex-wrap items-center gap-3 mb-4">
                    <Button label="Loading" icon="i-prime-spinner" loading />
                    <Button label="Disabled" disabled />
                    <Button label="Badge" icon="i-prime-bell" badge="8" badgeSeverity="danger" />
                </div>
            </template>
        </Card>

        <Card>
            <template #title>Button Group &amp; SplitButton</template>
            <template #content>
                <div class="flex flex-wrap gap-4 items-start">
                    <ButtonGroup>
                        <Button label="Save" icon="i-prime-save" />
                        <Button label="Delete" icon="i-prime-trash" severity="danger" />
                        <Button label="Cancel" icon="i-prime-times" severity="secondary" />
                    </ButtonGroup>
                    <SplitButton label="Save" icon="i-prime-save" :model="[
                        { label: 'Save As', icon: 'i-prime-copy' },
                        { label: 'Export', icon: 'i-prime-download' },
                    ]" />
                </div>
            </template>
        </Card>

        <Card>
            <template #title>SpeedDial</template>
            <template #content>
                <div class="relative h-32">
                    <SpeedDial :model="speedDialItems" direction="right" :style="{ left: '1rem', top: '1rem' }"
                        :buttonProps="{ severity: 'info', rounded: true }" />
                </div>
            </template>
        </Card>
    </section>
</template>
