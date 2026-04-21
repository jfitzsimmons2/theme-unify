<script setup lang="ts">
import { ref } from 'vue'
import Card from 'primevue/card'
import Carousel from 'primevue/carousel'
import Galleria from 'primevue/galleria'
import Image from 'primevue/image'
import ImageCompare from 'primevue/imagecompare'

const galleriaImages = ref([
    { src: 'https://picsum.photos/seed/a/800/400', alt: 'Image 1', title: 'Image 1' },
    { src: 'https://picsum.photos/seed/b/800/400', alt: 'Image 2', title: 'Image 2' },
    { src: 'https://picsum.photos/seed/c/800/400', alt: 'Image 3', title: 'Image 3' },
])

const carouselItems = ref([
    { title: 'Slide 1', description: 'First slide content', color: '#ef4444' },
    { title: 'Slide 2', description: 'Second slide content', color: '#3b82f6' },
    { title: 'Slide 3', description: 'Third slide content', color: '#22c55e' },
    { title: 'Slide 4', description: 'Fourth slide content', color: '#f59e0b' },
])
</script>

<template>
    <section class="flex flex-col gap-6">
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
                        <img :src="slotProps.item.src" :alt="slotProps.item.alt" style="width: 100%; display: block" />
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
</template>
