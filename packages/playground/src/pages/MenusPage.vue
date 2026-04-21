<script setup lang="ts">
import { ref } from 'vue'
import Breadcrumb from 'primevue/breadcrumb'
import Card from 'primevue/card'
import ContextMenu from 'primevue/contextmenu'
import Dock from 'primevue/dock'
import InputText from 'primevue/inputtext'
import MegaMenu from 'primevue/megamenu'
import Menu from 'primevue/menu'
import Menubar from 'primevue/menubar'
import PanelMenu from 'primevue/panelmenu'
import Steps from 'primevue/steps'
import TabMenu from 'primevue/tabmenu'
import TieredMenu from 'primevue/tieredmenu'

const breadcrumbItems = ref([
    { label: 'Home', icon: 'i-prime-home' },
    { label: 'Components' },
    { label: 'Menus' },
])
const breadcrumbHome = ref({ icon: 'i-prime-home', url: '#' })

const menuItems = ref([
    { label: 'New', icon: 'i-prime-plus' },
    { label: 'Open', icon: 'i-prime-folder-open' },
    { separator: true },
    { label: 'Save', icon: 'i-prime-save' },
    { label: 'Delete', icon: 'i-prime-trash' },
])

const menubarItems = ref([
    {
        label: 'File',
        items: [
            { label: 'New', icon: 'i-prime-plus' },
            { label: 'Open', icon: 'i-prime-folder-open' },
            { separator: true },
            { label: 'Quit', icon: 'i-prime-times' },
        ],
    },
    {
        label: 'Edit',
        items: [
            { label: 'Undo', icon: 'i-prime-undo' },
            { label: 'Redo', icon: 'i-prime-redo' },
        ],
    },
    {
        label: 'Help',
        items: [
            { label: 'About', icon: 'i-prime-info-circle' },
        ],
    },
])

const tieredMenuItems = ref([
    {
        label: 'File',
        items: [
            { label: 'New' },
            { label: 'Open' },
            { label: 'Recent', items: [{ label: 'Project 1' }, { label: 'Project 2' }] },
        ],
    },
    { label: 'Edit' },
    { separator: true },
    { label: 'Quit' },
])

const megaMenuItems = ref([
    {
        label: 'Components',
        items: [
            [
                { label: 'Form', items: [{ label: 'InputText' }, { label: 'Select' }, { label: 'Checkbox' }] },
                { label: 'Button', items: [{ label: 'Button' }, { label: 'SplitButton' }] },
            ],
            [
                { label: 'Data', items: [{ label: 'DataTable' }, { label: 'Tree' }] },
            ],
        ],
    },
    {
        label: 'Resources',
        items: [
            [{ label: 'Docs', items: [{ label: 'Getting Started' }, { label: 'API Reference' }] }],
        ],
    },
])

const panelMenuItems = ref([
    {
        label: 'Files',
        icon: 'i-prime-folder',
        items: [
            { label: 'Documents', icon: 'i-prime-file' },
            { label: 'Images', icon: 'i-prime-image' },
        ],
    },
    {
        label: 'Settings',
        icon: 'i-prime-cog',
        items: [
            { label: 'Profile', icon: 'i-prime-user' },
            { label: 'Security', icon: 'i-prime-lock' },
        ],
    },
])

const tabMenuItems = ref([
    { label: 'Dashboard', icon: 'i-prime-home' },
    { label: 'Transactions', icon: 'i-prime-chart-line' },
    { label: 'Products', icon: 'i-prime-list' },
    { label: 'Messages', icon: 'i-prime-inbox' },
])
const activeTabMenuIndex = ref(0)

const stepsItems = ref([
    { label: 'Personal' },
    { label: 'Seat' },
    { label: 'Payment' },
    { label: 'Confirmation' },
])
const activeStepIndex = ref(0)

const contextMenuRef = ref()
const contextMenuItems = ref([
    { label: 'Copy', icon: 'i-prime-copy' },
    { label: 'Paste', icon: 'i-prime-clipboard' },
    { separator: true },
    { label: 'Delete', icon: 'i-prime-trash' },
])
const onContextRightClick = (event: MouseEvent) => {
    contextMenuRef.value.show(event)
}

const dockItems = ref([
    { label: 'Finder', icon: 'i-prime-search' },
    { label: 'Terminal', icon: 'i-prime-desktop' },
    { label: 'App Store', icon: 'i-prime-shopping-bag' },
    { label: 'Photos', icon: 'i-prime-image' },
    { label: 'Trash', icon: 'i-prime-trash' },
])
</script>

<template>
    <ContextMenu ref="contextMenuRef" :model="contextMenuItems" />

    <section class="flex flex-col gap-6">
        <h2 class="text-xl font-semibold flex items-center gap-2">
            <i class="i-prime-bars" /> Menus &amp; Navigation
        </h2>

        <Card>
            <template #title>Menubar</template>
            <template #content>
                <Menubar :model="menubarItems">
                    <template #end>
                        <InputText placeholder="Search" size="small" />
                    </template>
                </Menubar>
            </template>
        </Card>

        <Card>
            <template #title>Breadcrumb</template>
            <template #content>
                <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" />
            </template>
        </Card>

        <Card>
            <template #title>TabMenu</template>
            <template #content>
                <TabMenu :model="tabMenuItems" v-model:activeIndex="activeTabMenuIndex" />
            </template>
        </Card>

        <Card>
            <template #title>Steps</template>
            <template #content>
                <Steps :model="stepsItems" v-model:activeStep="activeStepIndex" />
            </template>
        </Card>

        <Card>
            <template #title>TieredMenu</template>
            <template #content>
                <TieredMenu :model="tieredMenuItems" />
            </template>
        </Card>

        <Card>
            <template #title>MegaMenu</template>
            <template #content>
                <MegaMenu :model="megaMenuItems" />
            </template>
        </Card>

        <Card>
            <template #title>Menu (Popup)</template>
            <template #content>
                <Menu :model="menuItems" />
            </template>
        </Card>

        <Card>
            <template #title>PanelMenu</template>
            <template #content>
                <PanelMenu :model="panelMenuItems" class="w-80" />
            </template>
        </Card>

        <Card>
            <template #title>ContextMenu (right-click below)</template>
            <template #content>
                <div class="p-6 border-2 border-dashed border-default rounded text-center text-muted cursor-context-menu"
                    @contextmenu="onContextRightClick">
                    Right-click here to see the context menu
                </div>
            </template>
        </Card>

        <Card>
            <template #title>Dock</template>
            <template #content>
                <div class="relative h-24 border border-default rounded overflow-hidden">
                    <Dock :model="dockItems" position="bottom">
                        <template #item="{ item }">
                            <a v-tooltip.top="item.label" class="flex flex-col items-center gap-1 p-2 cursor-pointer">
                                <i :class="item.icon" class="text-xl" />
                            </a>
                        </template>
                    </Dock>
                </div>
            </template>
        </Card>
    </section>
</template>
