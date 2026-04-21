<script setup lang="ts">
import { ref } from 'vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Dialog from 'primevue/dialog'
import Drawer from 'primevue/drawer'
import InputText from 'primevue/inputtext'
import Popover from 'primevue/popover'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'

const toast = useToast()
const confirm = useConfirm()

const dialogVisible = ref(false)
const drawerVisible = ref(false)
const popoverRef = ref()

function showConfirmDialog() {
    confirm.require({
        group: 'dialog',
        message: 'Are you sure you want to proceed?',
        header: 'Confirm',
        icon: 'i-prime-exclamation-triangle',
        accept: () => toast.add({ severity: 'info', summary: 'Confirmed', detail: 'You accepted', life: 2000 }),
        reject: () => toast.add({ severity: 'warn', summary: 'Cancelled', detail: 'You rejected', life: 2000 }),
    })
}

function showConfirmPopup(event: Event) {
    confirm.require({
        group: 'popup',
        target: event.currentTarget as HTMLElement,
        message: 'Do you want to delete this?',
        icon: 'i-prime-info-circle',
        acceptClass: 'p-button-danger',
        accept: () => toast.add({ severity: 'info', summary: 'Deleted', life: 2000 }),
    })
}
</script>

<template>
    <section class="flex flex-col gap-6">
        <h2 class="text-xl font-semibold flex items-center gap-2">
            <i class="i-prime-window-maximize" /> Overlays
        </h2>

        <Card>
            <template #title>Dialog</template>
            <template #content>
                <Button label="Open Dialog" icon="i-prime-external-link" @click="dialogVisible = true" />
                <Dialog v-model:visible="dialogVisible" header="Dialog Title" :style="{ width: '30rem' }" modal>
                    <p>This is a modal dialog. You can put any content here including forms, data tables,
                        etc.</p>
                    <template #footer>
                        <Button label="Cancel" severity="secondary" @click="dialogVisible = false" />
                        <Button label="Save" @click="dialogVisible = false" />
                    </template>
                </Dialog>
            </template>
        </Card>

        <Card>
            <template #title>Drawer (Sidebar)</template>
            <template #content>
                <Button label="Open Drawer" icon="i-prime-arrow-right" @click="drawerVisible = true" />
                <Drawer v-model:visible="drawerVisible" header="Drawer" position="right">
                    <p>Drawer content here. This slides in from the side of the screen.</p>
                    <div class="mt-4 flex flex-col gap-3">
                        <InputText placeholder="Name" class="w-full" />
                        <InputText placeholder="Email" class="w-full" />
                        <Button label="Submit" class="w-full" />
                    </div>
                </Drawer>
            </template>
        </Card>

        <Card>
            <template #title>Confirm Dialog &amp; Confirm Popup</template>
            <template #content>
                <div class="flex gap-3 justify-center flex-wrap">
                    <Button label="Confirm Dialog" icon="i-prime-check" @click="showConfirmDialog" />
                    <Button label="Confirm Popup" icon="i-prime-question-circle" severity="warn"
                        @click="showConfirmPopup($event)" />
                </div>
            </template>
        </Card>

        <Card>
            <template #title>Popover</template>
            <template #content>
                <Button label="Show Popover" icon="i-prime-share-alt" severity="info"
                    @click="(e: Event) => popoverRef.toggle(e)" />
                <Popover ref="popoverRef">
                    <div class="p-3 flex flex-col gap-2" style="width: 200px">
                        <p class="font-semibold">Popover Title</p>
                        <p class="text-sm text-muted">This is a popover overlay panel.</p>
                        <Button label="Action" size="small" />
                    </div>
                </Popover>
            </template>
        </Card>

        <Card>
            <template #title>Tooltip (v-tooltip)</template>
            <template #content>
                <div class="flex gap-3 flex-wrap">
                    <Button label="Top" v-tooltip.top="'Top tooltip'" />
                    <Button label="Right" v-tooltip.right="'Right tooltip'" severity="info" />
                    <Button label="Bottom" v-tooltip.bottom="'Bottom tooltip'" severity="success" />
                    <Button label="Left" v-tooltip.left="'Left tooltip'" severity="warn" />
                </div>
            </template>
        </Card>
    </section>
</template>
