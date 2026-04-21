<script setup lang="ts">
import { ref } from 'vue'
import Card from 'primevue/card'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import DataView from 'primevue/dataview'
import OrderList from 'primevue/orderlist'
import OrganizationChart from 'primevue/organizationchart'
import PickList from 'primevue/picklist'
import Rating from 'primevue/rating'
import SelectButton from 'primevue/selectbutton'
import Tag from 'primevue/tag'
import Timeline from 'primevue/timeline'
import Tree from 'primevue/tree'
import TreeTable from 'primevue/treetable'

interface Product {
    name: string
    price: number
    category: string
    inventoryStatus: string
}

const tableData = ref([
    { id: 1, name: 'Alice Johnson', role: 'Engineer', status: 'Active', rating: 5 },
    { id: 2, name: 'Bob Smith', role: 'Designer', status: 'Inactive', rating: 3 },
    { id: 3, name: 'Carol White', role: 'Manager', status: 'Active', rating: 4 },
    { id: 4, name: 'David Brown', role: 'Engineer', status: 'Active', rating: 4 },
    { id: 5, name: 'Eve Davis', role: 'Designer', status: 'Active', rating: 5 },
])

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

const timelineEvents = ref([
    { status: 'Created', date: '2026-01-15', icon: 'i-prime-plus', color: '#4caf50' },
    { status: 'In Progress', date: '2026-02-20', icon: 'i-prime-spinner', color: '#ff9800' },
    { status: 'Review', date: '2026-03-10', icon: 'i-prime-search', color: '#2196f3' },
    { status: 'Completed', date: '2026-03-29', icon: 'i-prime-check', color: '#4caf50' },
])

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

const dataViewProducts = ref([
    { name: 'Widget A', price: 25, category: 'Electronics', inventoryStatus: 'In Stock' },
    { name: 'Widget B', price: 50, category: 'Clothing', inventoryStatus: 'Low Stock' },
    { name: 'Widget C', price: 75, category: 'Electronics', inventoryStatus: 'Out of Stock' },
    { name: 'Widget D', price: 35, category: 'Home', inventoryStatus: 'In Stock' },
])
const dataViewLayout = ref<'list' | 'grid'>('list')
</script>

<template>
    <section class="flex flex-col gap-6">
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
                            <Tag :value="data.status" :severity="data.status === 'Active' ? 'success' : 'danger'" />
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
</template>
