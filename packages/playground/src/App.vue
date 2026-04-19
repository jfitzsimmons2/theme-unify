<script setup lang="ts">
import { ref } from 'vue'
import TokenEditor from './components/TokenEditor.vue'
import { useTokenEditor } from './composables/useTokenEditor'

// --- Form Components ---
import AutoComplete from 'primevue/autocomplete'
import CascadeSelect from 'primevue/cascadeselect'
import Checkbox from 'primevue/checkbox'
import CheckboxGroup from 'primevue/checkboxgroup'
import ColorPicker from 'primevue/colorpicker'
import DatePicker from 'primevue/datepicker'
import FloatLabel from 'primevue/floatlabel'
import IftaLabel from 'primevue/iftalabel'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import InputChips from 'primevue/inputchips'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import InputMask from 'primevue/inputmask'
import InputNumber from 'primevue/inputnumber'
import InputOtp from 'primevue/inputotp'
import InputText from 'primevue/inputtext'
import Knob from 'primevue/knob'
import Listbox from 'primevue/listbox'
import MultiSelect from 'primevue/multiselect'
import Password from 'primevue/password'
import RadioButton from 'primevue/radiobutton'
import RadioButtonGroup from 'primevue/radiobuttongroup'
import Rating from 'primevue/rating'
import Select from 'primevue/select'
import SelectButton from 'primevue/selectbutton'
import Slider from 'primevue/slider'
import Textarea from 'primevue/textarea'
import ToggleButton from 'primevue/togglebutton'
import ToggleSwitch from 'primevue/toggleswitch'

// --- Button Components ---
import Button from 'primevue/button'
import ButtonGroup from 'primevue/buttongroup'
import SpeedDial from 'primevue/speeddial'
import SplitButton from 'primevue/splitbutton'

// --- Data Display ---
import Accordion from 'primevue/accordion'
import AccordionPanel from 'primevue/accordionpanel'
import AccordionHeader from 'primevue/accordionheader'
import AccordionContent from 'primevue/accordioncontent'
import Avatar from 'primevue/avatar'
import AvatarGroup from 'primevue/avatargroup'
import Badge from 'primevue/badge'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import DataView from 'primevue/dataview'
import Fieldset from 'primevue/fieldset'
import OrderList from 'primevue/orderlist'
import OrganizationChart from 'primevue/organizationchart'
import Panel from 'primevue/panel'
import PickList from 'primevue/picklist'
import ScrollPanel from 'primevue/scrollpanel'
import Stepper from 'primevue/stepper'
import Step from 'primevue/step'
import StepList from 'primevue/steplist'
import StepPanels from 'primevue/steppanels'
import StepPanel from 'primevue/steppanel'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'
import Tag from 'primevue/tag'
import Timeline from 'primevue/timeline'
import Tree from 'primevue/tree'

// --- Overlay / Popup ---
import ConfirmDialog from 'primevue/confirmdialog'
import ConfirmPopup from 'primevue/confirmpopup'
import Dialog from 'primevue/dialog'
import Drawer from 'primevue/drawer'
import Popover from 'primevue/popover'
import Toast from 'primevue/toast'

// --- Menu Components ---
import Breadcrumb from 'primevue/breadcrumb'
import ContextMenu from 'primevue/contextmenu'
import Dock from 'primevue/dock'
import MegaMenu from 'primevue/megamenu'
import Menu from 'primevue/menu'
import Menubar from 'primevue/menubar'
import PanelMenu from 'primevue/panelmenu'
import TabMenu from 'primevue/tabmenu'
import TieredMenu from 'primevue/tieredmenu'
import Steps from 'primevue/steps'

// --- Messages ---
import Message from 'primevue/message'

// --- Media ---
import Carousel from 'primevue/carousel'
import Galleria from 'primevue/galleria'
import Image from 'primevue/image'
import ImageCompare from 'primevue/imagecompare'

// --- Misc / Utility ---
import BlockUI from 'primevue/blockui'
import Chip from 'primevue/chip'
import Divider from 'primevue/divider'
import Fluid from 'primevue/fluid'
import Inplace from 'primevue/inplace'
import MeterGroup from 'primevue/metergroup'
import OverlayBadge from 'primevue/overlaybadge'
import ProgressBar from 'primevue/progressbar'
import ProgressSpinner from 'primevue/progressspinner'
import ScrollTop from 'primevue/scrolltop'
import Skeleton from 'primevue/skeleton'
import Splitter from 'primevue/splitter'
import SplitterPanel from 'primevue/splitterpanel'
import Toolbar from 'primevue/toolbar'
import TreeSelect from 'primevue/treeselect'
import TreeTable from 'primevue/treetable'

import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'

const toast = useToast()
const confirm = useConfirm()

// --- Dark mode ---
const isDark = ref(false)
function toggleDark() {
    isDark.value = !isDark.value
    document.documentElement.classList.toggle('dark', isDark.value)
}

interface Product {
    name: string
    price: number
    category: string
    inventoryStatus: string
}

// --- Color palette ---
const paletteColors = ['beetroot', 'blueberry', 'kale', 'carrot', 'eggplant', 'chickpea', 'oatmeal'] as const
const colorSteps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const

// --- Active nav section ---
const activeSection = ref('buttons')
const sections = [
    { label: 'Buttons', value: 'buttons' },
    { label: 'Form Inputs', value: 'forms' },
    { label: 'Data', value: 'data' },
    { label: 'Panels', value: 'panels' },
    { label: 'Overlays', value: 'overlays' },
    { label: 'Menus', value: 'menus' },
    { label: 'Messages', value: 'messages' },
    { label: 'Media', value: 'media' },
    { label: 'Misc', value: 'misc' },
    { label: 'UnoCSS', value: 'unocss' },
    { label: 'Palette', value: 'palette' },
]

// --- Form state ---
const textValue = ref('')
const numberValue = ref(42)
const sliderValue = ref(50)
const ratingValue = ref(3)
const dateValue = ref<Date | null>(null)
const colorValue = ref('ff6600')
const selectedCity = ref(null)
const multiSelectValue = ref([])
const passwordValue = ref('')
const maskValue = ref('')
const otpValue = ref('')
const chipsValue = ref(['Vue', 'PrimeVue'])
const knobValue = ref(60)
const checkboxValues = ref<string[]>(['Option A'])
const radioValue = ref('Option A')
const toggleBtnValue = ref(false)
const switchValue = ref(true)
const selectButtonValue = ref('One')
const cascadeValue = ref(null)
const listboxValue = ref(null)
const floatLabelValue = ref('')
const iftaLabelValue = ref('')
const treeSelectValue = ref(null)

const autoCompleteValue = ref('')
const autoCompleteSuggestions = ref<string[]>([])
const searchAutoComplete = (event: { query: string }) => {
    const items = ['Apple', 'Apricot', 'Avocado', 'Banana', 'Blueberry', 'Cherry', 'Coconut', 'Date', 'Fig', 'Grape', 'Kiwi', 'Lemon', 'Mango', 'Orange', 'Papaya', 'Peach', 'Pear', 'Plum', 'Raspberry', 'Strawberry']
    autoCompleteSuggestions.value = items.filter(i => i.toLowerCase().indexOf(event.query.toLowerCase()) !== -1)
}

const cities = [
    { name: 'New York', code: 'NY' },
    { name: 'London', code: 'LDN' },
    { name: 'Paris', code: 'PRS' },
    { name: 'Tokyo', code: 'TKY' },
    { name: 'Berlin', code: 'BRL' },
]

const cascadeCountries = [
    {
        name: 'Americas',
        code: 'AM',
        children: [
            { name: 'United States', code: 'US', children: [{ cname: 'New York', code: 'NY' }, { cname: 'Chicago', code: 'CHI' }] },
            { name: 'Brazil', code: 'BR', children: [{ cname: 'São Paulo', code: 'SP' }] },
        ],
    },
    {
        name: 'Europe',
        code: 'EU',
        children: [
            { name: 'Germany', code: 'DE', children: [{ cname: 'Berlin', code: 'BER' }] },
            { name: 'France', code: 'FR', children: [{ cname: 'Paris', code: 'PAR' }] },
        ],
    },
]

const selectButtonOptions = ['One', 'Two', 'Three']

// --- DataTable ---
const tableData = ref([
    { id: 1, name: 'Alice Johnson', role: 'Engineer', status: 'Active', rating: 5 },
    { id: 2, name: 'Bob Smith', role: 'Designer', status: 'Inactive', rating: 3 },
    { id: 3, name: 'Carol White', role: 'Manager', status: 'Active', rating: 4 },
    { id: 4, name: 'David Brown', role: 'Engineer', status: 'Active', rating: 4 },
    { id: 5, name: 'Eve Davis', role: 'Designer', status: 'Active', rating: 5 },
])

// --- Tree ---
const treeNodes = ref([
    {
        key: '0', label: 'Documents', icon: 'i-prime-folder',
        children: [
            { key: '0-0', label: 'Resume.pdf', icon: 'i-prime-file' },
            { key: '0-1', label: 'Cover Letter.pdf', icon: 'i-prime-file' },
        ],
    },
    {
        key: '1', label: 'Photos', icon: 'i-prime-folder',
        children: [
            { key: '1-0', label: 'vacation.jpg', icon: 'i-prime-image' },
            { key: '1-1', label: 'portrait.png', icon: 'i-prime-image' },
        ],
    },
    {
        key: '2', label: 'Music', icon: 'i-prime-folder',
        children: [{ key: '2-0', label: 'playlist.mp3', icon: 'i-prime-file' }],
    },
])

const treeSelectNodes = ref([
    {
        key: '0', label: 'Documents',
        children: [
            { key: '0-0', label: 'Resume.pdf' },
            { key: '0-1', label: 'Cover Letter.pdf' },
        ],
    },
    {
        key: '1', label: 'Photos',
        children: [
            { key: '1-0', label: 'vacation.jpg' },
        ],
    },
])

// --- TreeTable ---
const treeTableNodes = ref([
    {
        key: '0', data: { name: 'src', size: '4kb', type: 'Folder' },
        children: [
            { key: '0-0', data: { name: 'main.ts', size: '1kb', type: 'TypeScript' } },
            { key: '0-1', data: { name: 'App.vue', size: '3kb', type: 'Vue' } },
        ],
    },
    {
        key: '1', data: { name: 'public', size: '2kb', type: 'Folder' },
        children: [
            { key: '1-0', data: { name: 'favicon.ico', size: '2kb', type: 'Image' } },
        ],
    },
])

// --- Timeline ---
const timelineEvents = ref([
    { status: 'Created', date: '2026-01-15', icon: 'i-prime-plus', color: '#4caf50' },
    { status: 'In Progress', date: '2026-02-20', icon: 'i-prime-spinner', color: '#ff9800' },
    { status: 'Review', date: '2026-03-10', icon: 'i-prime-search', color: '#2196f3' },
    { status: 'Completed', date: '2026-03-29', icon: 'i-prime-check', color: '#4caf50' },
])

// --- Organization Chart ---
const orgData = ref({
    key: '0', type: 'person', data: { label: 'CEO', name: 'Alice', avatar: '' },
    children: [
        {
            key: '1', type: 'person', data: { label: 'CTO', name: 'Bob' },
            children: [
                { key: '1-1', type: 'person', data: { label: 'Dev Lead', name: 'Carol' } },
                { key: '1-2', type: 'person', data: { label: 'QA Lead', name: 'Dan' } },
            ],
        },
        {
            key: '2', type: 'person', data: { label: 'CFO', name: 'Eve' },
            children: [
                { key: '2-1', type: 'person', data: { label: 'Accountant', name: 'Frank' } },
            ],
        },
    ],
})

// --- OrderList / PickList ---
const orderListItems = ref([
    { name: 'Vue.js', category: 'Frontend' },
    { name: 'React', category: 'Frontend' },
    { name: 'Angular', category: 'Frontend' },
    { name: 'Svelte', category: 'Frontend' },
    { name: 'Solid', category: 'Frontend' },
])
const pickListValue = ref([
    [{ name: 'TypeScript' }, { name: 'JavaScript' }, { name: 'Python' }, { name: 'Rust' }],
    [{ name: 'Go' }],
])

// --- Carousel ---
const carouselItems = ref([
    { title: 'Slide 1', description: 'First slide content', color: '#ef4444' },
    { title: 'Slide 2', description: 'Second slide content', color: '#3b82f6' },
    { title: 'Slide 3', description: 'Third slide content', color: '#22c55e' },
    { title: 'Slide 4', description: 'Fourth slide content', color: '#f59e0b' },
])

// --- Galleria ---
const galleriaImages = ref([
    { src: 'https://picsum.photos/seed/a/800/400', alt: 'Image 1', title: 'Image 1' },
    { src: 'https://picsum.photos/seed/b/800/400', alt: 'Image 2', title: 'Image 2' },
    { src: 'https://picsum.photos/seed/c/800/400', alt: 'Image 3', title: 'Image 3' },
])

// --- DataView ---
const dataViewProducts = ref([
    { name: 'Widget A', price: 25, category: 'Electronics', inventoryStatus: 'In Stock' },
    { name: 'Widget B', price: 50, category: 'Clothing', inventoryStatus: 'Low Stock' },
    { name: 'Widget C', price: 75, category: 'Electronics', inventoryStatus: 'Out of Stock' },
    { name: 'Widget D', price: 35, category: 'Home', inventoryStatus: 'In Stock' },
])
const dataViewLayout = ref<'list' | 'grid'>('list')

// --- MeterGroup ---
const meterGroupValues = ref([
    { label: 'Apps', value: 16, color: '#3b82f6' },
    { label: 'Messages', value: 8, color: '#22c55e' },
    { label: 'Media', value: 24, color: '#f59e0b' },
    { label: 'System', value: 10, color: '#ef4444' },
])

// --- Menu data ---
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

// --- SpeedDial ---
const speedDialItems = ref([
    { label: 'Add', icon: 'i-prime-plus', command: () => toast.add({ severity: 'info', summary: 'Add', life: 2000 }) },
    { label: 'Edit', icon: 'i-prime-pencil', command: () => toast.add({ severity: 'success', summary: 'Edit', life: 2000 }) },
    { label: 'Delete', icon: 'i-prime-trash', command: () => toast.add({ severity: 'error', summary: 'Delete', life: 2000 }) },
])

// --- Overlays ---
const dialogVisible = ref(false)
const drawerVisible = ref(false)
const popoverRef = ref()

function showToast(severity: 'success' | 'info' | 'warn' | 'error') {
    toast.add({ severity, summary: severity.charAt(0).toUpperCase() + severity.slice(1), detail: `This is a ${severity} toast message`, life: 3000 })
}

function showConfirmDialog() {
    confirm.require({
        message: 'Are you sure you want to proceed?',
        header: 'Confirm',
        icon: 'i-prime-exclamation-triangle',
        accept: () => toast.add({ severity: 'info', summary: 'Confirmed', detail: 'You accepted', life: 2000 }),
        reject: () => toast.add({ severity: 'warn', summary: 'Cancelled', detail: 'You rejected', life: 2000 }),
    })
}

function showConfirmPopup(event: Event) {
    confirm.require({
        target: event.currentTarget as HTMLElement,
        message: 'Do you want to delete this?',
        icon: 'i-prime-info-circle',
        acceptClass: 'p-button-danger',
        accept: () => toast.add({ severity: 'info', summary: 'Deleted', life: 2000 }),
    })
}

// --- BlockUI ---
const blockUIActive = ref(false)

// --- Token Editor ---
const {
    editorContent,
    parseError,
    validationErrors,
    isProcessing,
    processTokens,
    downloadConfig,
    downloadAllGenerated,
    resetToDefault,
} = useTokenEditor()

const showEditor = ref(true)
</script>

<template>
    <div class="bg-page min-h-screen text-body">
        <Toast />
        <ConfirmDialog />
        <ConfirmPopup />
        <ContextMenu ref="contextMenuRef" :model="contextMenuItems" />

        <!-- Sticky Header -->
        <header class="sticky top-0 z-50 bg-surface border-b border-default px-6 py-3">
            <div class="flex items-center justify-between mb-3">
                <h1 class="text-2xl font-bold flex items-center gap-2">
                    <i class="i-prime-palette text-xl" />
                    theme-unify Playground
                </h1>
                <div class="flex items-center gap-3">
                    <Tag value="PrimeVue 4" severity="info" />
                    <Button :icon="showEditor ? 'i-prime-eye-slash' : 'i-prime-pencil'"
                        :label="showEditor ? 'Hide Editor' : 'Edit Tokens'" @click="showEditor = !showEditor"
                        severity="secondary" size="small" />
                    <Button :icon="isDark ? 'i-prime-sun' : 'i-prime-moon'" :label="isDark ? 'Light' : 'Dark'"
                        @click="toggleDark" severity="secondary" size="small" />
                </div>
            </div>
            <SelectButton v-model="activeSection" :options="sections" optionLabel="label" optionValue="value"
                :allowEmpty="false" class="text-sm" />
        </header>

        <div class="flex" :style="{ height: 'calc(100vh - 110px)' }">
            <!-- Editor Panel -->
            <div v-if="showEditor" class="w-[480px] flex-shrink-0 border-r border-default">
                <TokenEditor v-model="editorContent" :parse-error="parseError" :validation-errors="validationErrors"
                    :is-processing="isProcessing" @apply="processTokens(editorContent)"
                    @download-config="downloadConfig()" @download-all="downloadAllGenerated()"
                    @reset="resetToDefault()" />
            </div>

            <!-- Showcase Panel -->
            <main class="flex-1 overflow-y-auto p-6">

                <!-- ==== BUTTONS ==== -->
                <section v-show="activeSection === 'buttons'" class="flex flex-col gap-6">
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
                            <div class="flex flex-wrap gap-3 mb-4">
                                <Button label="Outlined" variant="outlined" />
                                <Button label="Text" variant="text" />
                                <Button label="Link" variant="link" />
                            </div>
                            <div class="flex flex-wrap gap-3 mb-4">
                                <Button label="Raised" raised />
                                <Button label="Rounded" rounded />
                                <Button icon="i-prime-check" rounded />
                                <Button label="Small" size="small" />
                                <Button label="Large" size="large" />
                            </div>
                            <div class="flex flex-wrap gap-3 mb-4">
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
                                <SpeedDial :model="speedDialItems" direction="right"
                                    :style="{ left: '1rem', top: '1rem' }"
                                    :buttonProps="{ severity: 'info', rounded: true }" />
                            </div>
                        </template>
                    </Card>
                </section>

                <!-- ==== FORM INPUTS ==== -->
                <section v-show="activeSection === 'forms'" class="flex flex-col gap-6">
                    <h2 class="text-xl font-semibold flex items-center gap-2">
                        <i class="i-prime-pencil" /> Form Inputs
                    </h2>

                    <Fluid>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Card>
                                <template #title>InputText</template>
                                <template #content>
                                    <InputText v-model="textValue" placeholder="Enter text..." class="w-full" />
                                </template>
                            </Card>

                            <Card>
                                <template #title>IconField</template>
                                <template #content>
                                    <IconField>
                                        <InputIcon class="i-prime-search" />
                                        <InputText placeholder="Search..." class="w-full" />
                                    </IconField>
                                </template>
                            </Card>

                            <Card>
                                <template #title>FloatLabel</template>
                                <template #content>
                                    <FloatLabel>
                                        <InputText id="float-input" v-model="floatLabelValue" class="w-full" />
                                        <label for="float-input">Username</label>
                                    </FloatLabel>
                                </template>
                            </Card>

                            <Card>
                                <template #title>IftaLabel</template>
                                <template #content>
                                    <IftaLabel>
                                        <InputText id="ifta-input" v-model="iftaLabelValue" class="w-full" />
                                        <label for="ifta-input">Username</label>
                                    </IftaLabel>
                                </template>
                            </Card>

                            <Card>
                                <template #title>InputGroup</template>
                                <template #content>
                                    <InputGroup>
                                        <InputGroupAddon>
                                            <i class="i-prime-user" />
                                        </InputGroupAddon>
                                        <InputText placeholder="Username" />
                                    </InputGroup>
                                </template>
                            </Card>

                            <Card>
                                <template #title>Password</template>
                                <template #content>
                                    <Password v-model="passwordValue" toggleMask class="w-full" />
                                </template>
                            </Card>

                            <Card>
                                <template #title>InputNumber</template>
                                <template #content>
                                    <InputNumber v-model="numberValue" showButtons :min="0" :max="100" class="w-full" />
                                </template>
                            </Card>

                            <Card>
                                <template #title>InputMask</template>
                                <template #content>
                                    <InputMask v-model="maskValue" mask="(999) 999-9999" placeholder="(999) 999-9999"
                                        class="w-full" />
                                </template>
                            </Card>

                            <Card>
                                <template #title>InputOtp</template>
                                <template #content>
                                    <InputOtp v-model="otpValue" :length="4" />
                                </template>
                            </Card>

                            <Card>
                                <template #title>InputChips</template>
                                <template #content>
                                    <InputChips v-model="chipsValue" class="w-full" />
                                </template>
                            </Card>

                            <Card>
                                <template #title>Textarea</template>
                                <template #content>
                                    <Textarea placeholder="Enter long text here..." rows="3" class="w-full" />
                                </template>
                            </Card>

                            <Card>
                                <template #title>AutoComplete</template>
                                <template #content>
                                    <AutoComplete v-model="autoCompleteValue" :suggestions="autoCompleteSuggestions"
                                        @complete="searchAutoComplete" placeholder="Type a fruit..." class="w-full" />
                                </template>
                            </Card>

                            <Card>
                                <template #title>Select (Dropdown)</template>
                                <template #content>
                                    <Select v-model="selectedCity" :options="cities" optionLabel="name"
                                        placeholder="Select a City" class="w-full" />
                                </template>
                            </Card>

                            <Card>
                                <template #title>MultiSelect</template>
                                <template #content>
                                    <MultiSelect v-model="multiSelectValue" :options="cities" optionLabel="name"
                                        placeholder="Select Cities" :maxSelectedLabels="3" class="w-full" />
                                </template>
                            </Card>

                            <Card>
                                <template #title>CascadeSelect</template>
                                <template #content>
                                    <CascadeSelect v-model="cascadeValue" :options="cascadeCountries"
                                        optionLabel="cname" optionGroupLabel="name"
                                        :optionGroupChildren="['children', 'children']" placeholder="Select a City"
                                        class="w-full" />
                                </template>
                            </Card>

                            <Card>
                                <template #title>TreeSelect</template>
                                <template #content>
                                    <TreeSelect v-model="treeSelectValue" :options="treeSelectNodes"
                                        placeholder="Select Item" class="w-full" />
                                </template>
                            </Card>

                            <Card>
                                <template #title>Listbox</template>
                                <template #content>
                                    <Listbox v-model="listboxValue" :options="cities" optionLabel="name"
                                        class="w-full" />
                                </template>
                            </Card>

                            <Card>
                                <template #title>DatePicker</template>
                                <template #content>
                                    <DatePicker v-model="dateValue" showIcon class="w-full" />
                                </template>
                            </Card>

                            <Card>
                                <template #title>ColorPicker</template>
                                <template #content>
                                    <ColorPicker v-model="colorValue" />
                                </template>
                            </Card>

                            <Card>
                                <template #title>Slider</template>
                                <template #content>
                                    <Slider v-model="sliderValue" class="w-full" />
                                    <p class="text-sm mt-2 text-muted">Value: {{ sliderValue }}</p>
                                </template>
                            </Card>

                            <Card>
                                <template #title>Knob</template>
                                <template #content>
                                    <Knob v-model="knobValue" :size="100" />
                                </template>
                            </Card>

                            <Card>
                                <template #title>Rating</template>
                                <template #content>
                                    <Rating v-model="ratingValue" />
                                </template>
                            </Card>

                            <Card>
                                <template #title>Checkbox &amp; CheckboxGroup</template>
                                <template #content>
                                    <CheckboxGroup v-model="checkboxValues" class="flex flex-col gap-2">
                                        <div v-for="opt in ['Option A', 'Option B', 'Option C']" :key="opt"
                                            class="flex items-center gap-2">
                                            <Checkbox :inputId="opt" :value="opt" />
                                            <label :for="opt">{{ opt }}</label>
                                        </div>
                                    </CheckboxGroup>
                                </template>
                            </Card>

                            <Card>
                                <template #title>RadioButton &amp; RadioButtonGroup</template>
                                <template #content>
                                    <RadioButtonGroup v-model="radioValue" class="flex flex-col gap-2">
                                        <div v-for="opt in ['Option A', 'Option B', 'Option C']" :key="opt"
                                            class="flex items-center gap-2">
                                            <RadioButton :inputId="'radio-' + opt" :value="opt" />
                                            <label :for="'radio-' + opt">{{ opt }}</label>
                                        </div>
                                    </RadioButtonGroup>
                                </template>
                            </Card>

                            <Card>
                                <template #title>ToggleButton &amp; ToggleSwitch</template>
                                <template #content>
                                    <div class="flex flex-col gap-3">
                                        <ToggleButton v-model="toggleBtnValue" onLabel="On" offLabel="Off" />
                                        <div class="flex items-center gap-2">
                                            <ToggleSwitch v-model="switchValue" />
                                            <span>{{ switchValue ? 'On' : 'Off' }}</span>
                                        </div>
                                    </div>
                                </template>
                            </Card>

                            <Card>
                                <template #title>SelectButton</template>
                                <template #content>
                                    <SelectButton v-model="selectButtonValue" :options="selectButtonOptions" />
                                </template>
                            </Card>
                        </div>
                    </Fluid>
                </section>

                <!-- ==== DATA ==== -->
                <section v-show="activeSection === 'data'" class="flex flex-col gap-6">
                    <h2 class="text-xl font-semibold flex items-center gap-2">
                        <i class="i-prime-table" /> Data Display
                    </h2>

                    <Card>
                        <template #title>DataTable</template>
                        <template #content>
                            <DataTable :value="tableData" stripedRows paginator :rows="5" tableStyle="min-width: 40rem">
                                <Column field="id" header="ID" sortable />
                                <Column field="name" header="Name" sortable />
                                <Column field="role" header="Role" sortable />
                                <Column field="status" header="Status" sortable>
                                    <template #body="{ data }">
                                        <Tag :value="data.status"
                                            :severity="data.status === 'Active' ? 'success' : 'danger'" />
                                    </template>
                                </Column>
                                <Column field="rating" header="Rating" sortable>
                                    <template #body="{ data }">
                                        <Rating :modelValue="data.rating" readonly :cancel="false" />
                                    </template>
                                </Column>
                            </DataTable>
                        </template>
                    </Card>

                    <Card>
                        <template #title>DataView</template>
                        <template #content>
                            <DataView :value="dataViewProducts" :layout="dataViewLayout">
                                <template #header>
                                    <div class="flex justify-end">
                                        <SelectButton v-model="dataViewLayout" :options="[
                                            { icon: 'i-prime-list', value: 'list' },
                                            { icon: 'i-prime-th-large', value: 'grid' },
                                        ]" optionLabel="icon" optionValue="value">
                                            <template #option="{ option }">
                                                <i :class="option.icon" />
                                            </template>
                                        </SelectButton>
                                    </div>
                                </template>
                                <template #list="slotProps">
                                    <div v-for="(item, index) in (slotProps.items as Product[])" :key="index"
                                        class="flex items-center gap-4 p-3 border-b border-default">
                                        <span class="font-semibold">{{ item.name }}</span>
                                        <Tag :value="item.inventoryStatus"
                                            :severity="item.inventoryStatus === 'In Stock' ? 'success' : item.inventoryStatus === 'Low Stock' ? 'warn' : 'danger'" />
                                        <span class="ml-auto font-bold">${{ item.price }}</span>
                                    </div>
                                </template>
                                <template #grid="slotProps">
                                    <div class="grid grid-cols-2 md:grid-cols-3 gap-4 p-3">
                                        <div v-for="(item, index) in (slotProps.items as Product[])" :key="index"
                                            class="border border-default rounded p-4">
                                            <h4 class="font-semibold mb-1">{{ item.name }}</h4>
                                            <Tag :value="item.inventoryStatus"
                                                :severity="item.inventoryStatus === 'In Stock' ? 'success' : item.inventoryStatus === 'Low Stock' ? 'warn' : 'danger'" />
                                            <p class="mt-2 font-bold">${{ item.price }}</p>
                                        </div>
                                    </div>
                                </template>
                            </DataView>
                        </template>
                    </Card>

                    <Card>
                        <template #title>Tree</template>
                        <template #content>
                            <Tree :value="treeNodes" selectionMode="checkbox" />
                        </template>
                    </Card>

                    <Card>
                        <template #title>TreeTable</template>
                        <template #content>
                            <TreeTable :value="treeTableNodes">
                                <Column field="name" header="Name" expander />
                                <Column field="size" header="Size" />
                                <Column field="type" header="Type" />
                            </TreeTable>
                        </template>
                    </Card>

                    <Card>
                        <template #title>Organization Chart</template>
                        <template #content>
                            <OrganizationChart :value="orgData">
                                <template #default="slotProps">
                                    <div class="text-center p-2">
                                        <div class="font-bold">{{ slotProps.node.data.label }}</div>
                                        <div class="text-sm text-muted">{{ slotProps.node.data.name }}</div>
                                    </div>
                                </template>
                            </OrganizationChart>
                        </template>
                    </Card>

                    <Card>
                        <template #title>OrderList</template>
                        <template #content>
                            <OrderList v-model="orderListItems" dataKey="name" listStyle="height: auto">
                                <template #option="{ option }">
                                    <div class="flex items-center gap-2">
                                        <span class="font-semibold">{{ option.name }}</span>
                                        <Tag :value="option.category" severity="info" />
                                    </div>
                                </template>
                            </OrderList>
                        </template>
                    </Card>

                    <Card>
                        <template #title>PickList</template>
                        <template #content>
                            <PickList v-model="pickListValue" dataKey="name" breakpoint="768px">
                                <template #option="{ option }">
                                    {{ option.name }}
                                </template>
                            </PickList>
                        </template>
                    </Card>

                    <Card>
                        <template #title>Timeline</template>
                        <template #content>
                            <Timeline :value="timelineEvents" class="max-w-xl">
                                <template #marker="slotProps">
                                    <span class="flex w-8 h-8 items-center justify-center rounded-full"
                                        :style="{ backgroundColor: slotProps.item.color }">
                                        <i :class="slotProps.item.icon" class="text-white text-sm" />
                                    </span>
                                </template>
                                <template #content="slotProps">
                                    <div>
                                        <span class="font-semibold">{{ slotProps.item.status }}</span>
                                        <div class="text-sm text-muted">{{ slotProps.item.date }}</div>
                                    </div>
                                </template>
                            </Timeline>
                        </template>
                    </Card>
                </section>

                <!-- ==== PANELS ==== -->
                <section v-show="activeSection === 'panels'" class="flex flex-col gap-6">
                    <h2 class="text-xl font-semibold flex items-center gap-2">
                        <i class="i-prime-clone" /> Panels &amp; Containers
                    </h2>

                    <Card>
                        <template #title>Accordion</template>
                        <template #content>
                            <Accordion value="0">
                                <AccordionPanel value="0">
                                    <AccordionHeader>Header I</AccordionHeader>
                                    <AccordionContent>
                                        <p>Content for the first accordion panel. Any PrimeVue content can go here.</p>
                                    </AccordionContent>
                                </AccordionPanel>
                                <AccordionPanel value="1">
                                    <AccordionHeader>Header II</AccordionHeader>
                                    <AccordionContent>
                                        <p>Content for the second accordion panel.</p>
                                    </AccordionContent>
                                </AccordionPanel>
                                <AccordionPanel value="2">
                                    <AccordionHeader>Header III</AccordionHeader>
                                    <AccordionContent>
                                        <p>Content for the third accordion panel.</p>
                                    </AccordionContent>
                                </AccordionPanel>
                            </Accordion>
                        </template>
                    </Card>

                    <Card>
                        <template #title>Tabs</template>
                        <template #content>
                            <Tabs value="0">
                                <TabList>
                                    <Tab value="0">Header I</Tab>
                                    <Tab value="1">Header II</Tab>
                                    <Tab value="2">Header III</Tab>
                                </TabList>
                                <TabPanels>
                                    <TabPanel value="0">
                                        <p class="p-4">Tab panel 1 content</p>
                                    </TabPanel>
                                    <TabPanel value="1">
                                        <p class="p-4">Tab panel 2 content</p>
                                    </TabPanel>
                                    <TabPanel value="2">
                                        <p class="p-4">Tab panel 3 content</p>
                                    </TabPanel>
                                </TabPanels>
                            </Tabs>
                        </template>
                    </Card>

                    <Card>
                        <template #title>Stepper</template>
                        <template #content>
                            <Stepper value="1" linear>
                                <StepList>
                                    <Step value="1">Design</Step>
                                    <Step value="2">Develop</Step>
                                    <Step value="3">Deploy</Step>
                                </StepList>
                                <StepPanels>
                                    <StepPanel v-slot="{ activateCallback }" value="1">
                                        <div class="p-4">
                                            <p>Design phase content</p>
                                            <Button label="Next" class="mt-3" @click="activateCallback('2')" />
                                        </div>
                                    </StepPanel>
                                    <StepPanel v-slot="{ activateCallback }" value="2">
                                        <div class="p-4">
                                            <p>Development phase content</p>
                                            <div class="flex gap-2 mt-3">
                                                <Button label="Back" severity="secondary"
                                                    @click="activateCallback('1')" />
                                                <Button label="Next" @click="activateCallback('3')" />
                                            </div>
                                        </div>
                                    </StepPanel>
                                    <StepPanel v-slot="{ activateCallback }" value="3">
                                        <div class="p-4">
                                            <p>Deployment phase content</p>
                                            <Button label="Back" severity="secondary" class="mt-3"
                                                @click="activateCallback('2')" />
                                        </div>
                                    </StepPanel>
                                </StepPanels>
                            </Stepper>
                        </template>
                    </Card>

                    <Card>
                        <template #title>Panel (Toggleable)</template>
                        <template #content>
                            <Panel header="Toggleable Panel" toggleable>
                                <p>This panel can be collapsed and expanded.</p>
                            </Panel>
                        </template>
                    </Card>

                    <Card>
                        <template #title>Fieldset</template>
                        <template #content>
                            <Fieldset legend="Legend" toggleable>
                                <p>Fieldset content goes here. It supports toggle as well.</p>
                            </Fieldset>
                        </template>
                    </Card>

                    <Card>
                        <template #title>Splitter</template>
                        <template #content>
                            <Splitter style="height: 200px">
                                <SplitterPanel :size="40" :minSize="20">
                                    <div class="flex items-center justify-center h-full">
                                        <span class="font-semibold">Panel 1</span>
                                    </div>
                                </SplitterPanel>
                                <SplitterPanel :size="60" :minSize="20">
                                    <Splitter layout="vertical">
                                        <SplitterPanel :size="50">
                                            <div class="flex items-center justify-center h-full">
                                                <span class="font-semibold">Panel 2</span>
                                            </div>
                                        </SplitterPanel>
                                        <SplitterPanel :size="50">
                                            <div class="flex items-center justify-center h-full">
                                                <span class="font-semibold">Panel 3</span>
                                            </div>
                                        </SplitterPanel>
                                    </Splitter>
                                </SplitterPanel>
                            </Splitter>
                        </template>
                    </Card>

                    <Card>
                        <template #title>ScrollPanel</template>
                        <template #content>
                            <ScrollPanel style="width: 100%; height: 150px">
                                <p v-for="i in 20" :key="i">Scrollable content line {{ i }}</p>
                            </ScrollPanel>
                        </template>
                    </Card>

                    <Card>
                        <template #title>Toolbar</template>
                        <template #content>
                            <Toolbar>
                                <template #start>
                                    <Button icon="i-prime-plus" class="mr-2" />
                                    <Button icon="i-prime-upload" severity="success" />
                                </template>
                                <template #center>
                                    <IconField>
                                        <InputIcon class="i-prime-search" />
                                        <InputText placeholder="Search" size="small" />
                                    </IconField>
                                </template>
                                <template #end>
                                    <Button icon="i-prime-download" severity="help" />
                                </template>
                            </Toolbar>
                        </template>
                    </Card>

                    <Card>
                        <template #title>Card Variants</template>
                        <template #content>
                            <div class="flex flex-wrap gap-4">
                                <Card class="w-64">
                                    <template #header>
                                        <div class="h-24 bg-gradient-to-r from-blue-400 to-purple-500 rounded-t" />
                                    </template>
                                    <template #title>Simple Card</template>
                                    <template #subtitle>With a header image</template>
                                    <template #content>
                                        <p class="text-sm text-muted">Card body text goes here.</p>
                                    </template>
                                    <template #footer>
                                        <div class="flex gap-2">
                                            <Button label="Save" size="small" />
                                            <Button label="Cancel" severity="secondary" size="small" variant="text" />
                                        </div>
                                    </template>
                                </Card>
                                <Card class="w-64">
                                    <template #title>Advanced Card</template>
                                    <template #content>
                                        <div class="flex items-center gap-3">
                                            <Avatar label="A" shape="circle" size="large" />
                                            <div>
                                                <p class="font-semibold">Alice</p>
                                                <p class="text-sm text-muted">Developer</p>
                                            </div>
                                        </div>
                                    </template>
                                </Card>
                            </div>
                        </template>
                    </Card>
                </section>

                <!-- ==== OVERLAYS ==== -->
                <section v-show="activeSection === 'overlays'" class="flex flex-col gap-6">
                    <h2 class="text-xl font-semibold flex items-center gap-2">
                        <i class="i-prime-window-maximize" /> Overlays
                    </h2>

                    <Card>
                        <template #title>Dialog</template>
                        <template #content>
                            <Button label="Open Dialog" icon="i-prime-external-link" @click="dialogVisible = true" />
                            <Dialog v-model:visible="dialogVisible" header="Dialog Title" :style="{ width: '30rem' }"
                                modal>
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
                            <div class="flex gap-3 flex-wrap">
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

                <!-- ==== MENUS ==== -->
                <section v-show="activeSection === 'menus'" class="flex flex-col gap-6">
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
                                        <a v-tooltip.top="item.label"
                                            class="flex flex-col items-center gap-1 p-2 cursor-pointer">
                                            <i :class="item.icon" class="text-xl" />
                                        </a>
                                    </template>
                                </Dock>
                            </div>
                        </template>
                    </Card>
                </section>

                <!-- ==== MESSAGES ==== -->
                <section v-show="activeSection === 'messages'" class="flex flex-col gap-6">
                    <h2 class="text-xl font-semibold flex items-center gap-2">
                        <i class="i-prime-comment" /> Messages
                    </h2>

                    <Card>
                        <template #title>Message</template>
                        <template #content>
                            <div class="flex flex-col gap-3">
                                <Message severity="success">Success message content</Message>
                                <Message severity="info">Info message content</Message>
                                <Message severity="warn">Warning message content</Message>
                                <Message severity="error">Error message content</Message>
                                <Message severity="secondary">Secondary message content</Message>
                                <Message severity="contrast">Contrast message content</Message>
                            </div>
                        </template>
                    </Card>

                    <Card>
                        <template #title>Toast</template>
                        <template #content>
                            <div class="flex flex-wrap gap-3">
                                <Button label="Success" severity="success" @click="showToast('success')" />
                                <Button label="Info" severity="info" @click="showToast('info')" />
                                <Button label="Warn" severity="warn" @click="showToast('warn')" />
                                <Button label="Error" severity="danger" @click="showToast('error')" />
                            </div>
                        </template>
                    </Card>
                </section>

                <!-- ==== MEDIA ==== -->
                <section v-show="activeSection === 'media'" class="flex flex-col gap-6">
                    <h2 class="text-xl font-semibold flex items-center gap-2">
                        <i class="i-prime-image" /> Media
                    </h2>

                    <Card>
                        <template #title>Image (with preview)</template>
                        <template #content>
                            <Image src="https://picsum.photos/seed/demo/400/250" alt="Demo" width="400" preview />
                        </template>
                    </Card>

                    <Card>
                        <template #title>Galleria</template>
                        <template #content>
                            <Galleria :value="galleriaImages" :numVisible="3" containerStyle="max-width: 640px"
                                :showThumbnails="true" :showIndicators="true">
                                <template #item="slotProps">
                                    <img :src="slotProps.item.src" :alt="slotProps.item.alt"
                                        style="width: 100%; display: block" />
                                </template>
                                <template #thumbnail="slotProps">
                                    <img :src="slotProps.item.src" :alt="slotProps.item.alt" style="width: 80px" />
                                </template>
                            </Galleria>
                        </template>
                    </Card>

                    <Card>
                        <template #title>Carousel</template>
                        <template #content>
                            <Carousel :value="carouselItems" :numVisible="2" :numScroll="1" :circular="true">
                                <template #item="slotProps">
                                    <div class="border border-default rounded m-2 p-6 text-center"
                                        :style="{ borderLeft: `4px solid ${slotProps.data.color}` }">
                                        <h4 class="font-bold mb-1">{{ slotProps.data.title }}</h4>
                                        <p class="text-sm text-muted">{{ slotProps.data.description }}</p>
                                    </div>
                                </template>
                            </Carousel>
                        </template>
                    </Card>

                    <Card>
                        <template #title>ImageCompare</template>
                        <template #content>
                            <ImageCompare class="w-full max-w-xl">
                                <template #left>
                                    <img src="https://picsum.photos/seed/left/600/300" alt="Left" />
                                </template>
                                <template #right>
                                    <img src="https://picsum.photos/seed/right/600/300" alt="Right" />
                                </template>
                            </ImageCompare>
                        </template>
                    </Card>
                </section>

                <!-- ==== MISC ==== -->
                <section v-show="activeSection === 'misc'" class="flex flex-col gap-6">
                    <h2 class="text-xl font-semibold flex items-center gap-2">
                        <i class="i-prime-box" /> Miscellaneous
                    </h2>

                    <Card>
                        <template #title>Avatar &amp; AvatarGroup</template>
                        <template #content>
                            <div class="flex items-center gap-4 flex-wrap">
                                <Avatar label="A" size="large" shape="circle" />
                                <Avatar label="B" size="large" shape="circle"
                                    style="background-color: #2196f3; color: #fff" />
                                <Avatar icon="i-prime-user" size="large" shape="circle"
                                    style="background-color: #9c27b0; color: #fff" />
                                <Divider layout="vertical" />
                                <AvatarGroup>
                                    <Avatar label="A" shape="circle" />
                                    <Avatar label="B" shape="circle" style="background-color: #2196f3; color: #fff" />
                                    <Avatar label="C" shape="circle" style="background-color: #9c27b0; color: #fff" />
                                    <Avatar label="+2" shape="circle" style="background-color: #607d8b; color: #fff" />
                                </AvatarGroup>
                            </div>
                        </template>
                    </Card>

                    <Card>
                        <template #title>Badge &amp; OverlayBadge</template>
                        <template #content>
                            <div class="flex items-center gap-4 flex-wrap">
                                <Badge value="2" />
                                <Badge value="8" severity="success" />
                                <Badge value="4" severity="info" size="large" />
                                <Badge value="12" severity="danger" size="xlarge" />
                                <OverlayBadge value="3">
                                    <i class="i-prime-bell text-2xl" />
                                </OverlayBadge>
                            </div>
                        </template>
                    </Card>

                    <Card>
                        <template #title>Tag</template>
                        <template #content>
                            <div class="flex flex-wrap gap-3">
                                <Tag value="Primary" />
                                <Tag value="Success" severity="success" />
                                <Tag value="Info" severity="info" />
                                <Tag value="Warn" severity="warn" />
                                <Tag value="Danger" severity="danger" />
                                <Tag value="Secondary" severity="secondary" />
                                <Tag value="Contrast" severity="contrast" />
                                <Tag icon="i-prime-user" value="With Icon" />
                                <Tag value="Rounded" rounded />
                            </div>
                        </template>
                    </Card>

                    <Card>
                        <template #title>Chip</template>
                        <template #content>
                            <div class="flex flex-wrap gap-3">
                                <Chip label="Vue" />
                                <Chip label="React" />
                                <Chip label="Angular" removable />
                                <Chip label="Svelte" removable />
                                <Chip label="With Icon" icon="i-prime-star" />
                            </div>
                        </template>
                    </Card>

                    <Card>
                        <template #title>ProgressBar &amp; ProgressSpinner</template>
                        <template #content>
                            <div class="flex flex-col gap-4">
                                <ProgressBar :value="65" />
                                <ProgressBar :value="35" severity="success" />
                                <ProgressBar mode="indeterminate" style="height: 6px" />
                                <div class="flex items-center gap-4">
                                    <ProgressSpinner style="width: 40px; height: 40px" />
                                    <span class="text-muted text-sm">Loading...</span>
                                </div>
                            </div>
                        </template>
                    </Card>

                    <Card>
                        <template #title>MeterGroup</template>
                        <template #content>
                            <MeterGroup :value="meterGroupValues" />
                        </template>
                    </Card>

                    <Card>
                        <template #title>Skeleton</template>
                        <template #content>
                            <div class="flex flex-col gap-3">
                                <Skeleton width="100%" height="2rem" />
                                <Skeleton width="75%" height="1rem" />
                                <Skeleton width="50%" height="1rem" />
                                <div class="flex gap-3">
                                    <Skeleton shape="circle" size="3rem" />
                                    <div class="flex-1">
                                        <Skeleton width="100%" height="1rem" class="mb-2" />
                                        <Skeleton width="60%" height="1rem" />
                                    </div>
                                </div>
                            </div>
                        </template>
                    </Card>

                    <Card>
                        <template #title>BlockUI</template>
                        <template #content>
                            <div class="mb-3">
                                <Button :label="blockUIActive ? 'Unblock' : 'Block'"
                                    @click="blockUIActive = !blockUIActive"
                                    :severity="blockUIActive ? 'success' : 'danger'" />
                            </div>
                            <BlockUI :blocked="blockUIActive">
                                <Panel header="Blockable Panel">
                                    <p>This panel can be blocked. Click the button above to toggle.</p>
                                    <InputText placeholder="Try typing..." class="mt-2" />
                                </Panel>
                            </BlockUI>
                        </template>
                    </Card>

                    <Card>
                        <template #title>Inplace</template>
                        <template #content>
                            <Inplace>
                                <template #display>
                                    <span class="text-muted">Click to edit</span>
                                </template>
                                <template #content>
                                    <InputText autofocus />
                                </template>
                            </Inplace>
                        </template>
                    </Card>

                    <Card>
                        <template #title>Divider</template>
                        <template #content>
                            <p>Content above</p>
                            <Divider />
                            <p>Content below</p>
                            <Divider align="center">
                                <span class="text-sm text-muted">OR</span>
                            </Divider>
                            <p>More content</p>
                        </template>
                    </Card>
                </section>

                <!-- ==== UNOCSS ==== -->
                <section v-show="activeSection === 'unocss'" class="flex flex-col gap-6">
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
                                    <div
                                        class="bg-elevated border border-default rounded-sm p-4 text-white dark:text-warm-100">
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
                                    <div class="w-16 h-16 bg-beetroot-500"
                                        :class="r === 'DEFAULT' ? 'rounded' : `rounded-${r}`" />
                                    <code
                                        class="text-[10px] text-muted">{{ r === 'DEFAULT' ? 'rounded' : `rounded-${r}` }}</code>
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
                                <div class="flex flex-col items-center gap-2" v-for="s in ['sm', 'DEFAULT', 'md', 'lg']"
                                    :key="s">
                                    <div class="w-20 h-20 rounded bg-surface-50 dark:bg-surface-800"
                                        :class="s === 'DEFAULT' ? 'shadow' : `shadow-${s}`" />
                                    <code
                                        class="text-[10px] text-muted">{{ s === 'DEFAULT' ? 'shadow' : `shadow-${s}` }}</code>
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
                                <p v-for="w in ['normal', 'medium', 'semibold', 'bold', 'extrabold']" :key="w"
                                    :class="`font-${w}`" class="text-body text-lg">
                                    The quick brown fox — <code
                                        class="text-xs text-muted font-normal">font-{{ w }}</code>
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

                <!-- ==== COLOR PALETTE ==== -->
                <section v-show="activeSection === 'palette'" class="flex flex-col gap-6">
                    <h2 class="text-xl font-semibold flex items-center gap-2">
                        <i class="i-prime-palette" /> Color Palette
                    </h2>

                    <Card>
                        <template #content>
                            <div class="flex flex-col gap-4">
                                <div v-for="color in paletteColors" :key="color">
                                    <p class="text-sm font-medium mb-1 text-muted">{{ color }}</p>
                                    <div class="flex gap-1">
                                        <div v-for="step in colorSteps" :key="step" class="w-10 h-10 rounded-sm"
                                            :class="`bg-${color}-${step}`" :title="`${color}-${step}`" />
                                    </div>
                                </div>
                            </div>
                        </template>
                    </Card>
                </section>

            </main>
        </div>

        <ScrollTop />
    </div>
</template>
