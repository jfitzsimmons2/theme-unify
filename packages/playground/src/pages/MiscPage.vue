<script setup lang="ts">
import { ref } from 'vue'
import Avatar from 'primevue/avatar'
import AvatarGroup from 'primevue/avatargroup'
import Badge from 'primevue/badge'
import BlockUI from 'primevue/blockui'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Chip from 'primevue/chip'
import Divider from 'primevue/divider'
import Inplace from 'primevue/inplace'
import InputText from 'primevue/inputtext'
import MeterGroup from 'primevue/metergroup'
import OverlayBadge from 'primevue/overlaybadge'
import Panel from 'primevue/panel'
import ProgressBar from 'primevue/progressbar'
import ProgressSpinner from 'primevue/progressspinner'
import Skeleton from 'primevue/skeleton'
import Tag from 'primevue/tag'

const blockUIActive = ref(false)

const meterGroupValues = ref([
    { label: 'Apps', value: 16, color: '#3b82f6' },
    { label: 'Messages', value: 8, color: '#22c55e' },
    { label: 'Media', value: 24, color: '#f59e0b' },
    { label: 'System', value: 10, color: '#ef4444' },
])
</script>

<template>
    <section class="flex flex-col gap-6">
        <h2 class="text-xl font-semibold flex items-center gap-2">
            <i class="i-prime-box" /> Miscellaneous
        </h2>

        <Card>
            <template #title>Avatar &amp; AvatarGroup</template>
            <template #content>
                <div class="flex items-center gap-4 flex-wrap">
                    <Avatar label="A" size="large" shape="circle" />
                    <Avatar label="B" size="large" shape="circle" style="background-color: #2196f3; color: #fff" />
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
                    <Button :label="blockUIActive ? 'Unblock' : 'Block'" @click="blockUIActive = !blockUIActive"
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
</template>
