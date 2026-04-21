<script setup lang="ts">
import Accordion from 'primevue/accordion'
import AccordionPanel from 'primevue/accordionpanel'
import AccordionHeader from 'primevue/accordionheader'
import AccordionContent from 'primevue/accordioncontent'
import Avatar from 'primevue/avatar'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Fieldset from 'primevue/fieldset'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import InputText from 'primevue/inputtext'
import Panel from 'primevue/panel'
import ScrollPanel from 'primevue/scrollpanel'
import Splitter from 'primevue/splitter'
import SplitterPanel from 'primevue/splitterpanel'
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
import Toolbar from 'primevue/toolbar'
</script>

<template>
    <section class="flex flex-col gap-6">
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
                                    <Button label="Back" severity="secondary" @click="activateCallback('1')" />
                                    <Button label="Next" @click="activateCallback('3')" />
                                </div>
                            </div>
                        </StepPanel>
                        <StepPanel v-slot="{ activateCallback }" value="3">
                            <div class="p-4">
                                <p>Deployment phase content</p>
                                <Button label="Back" severity="secondary" class="mt-3" @click="activateCallback('2')" />
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
</template>
