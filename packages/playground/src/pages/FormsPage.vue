<script setup lang="ts">
import { ref } from 'vue'
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
import Card from 'primevue/card'
import Fluid from 'primevue/fluid'
import TreeSelect from 'primevue/treeselect'

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
</script>

<template>
    <section class="flex flex-col gap-6">
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
                        <Select v-model="selectedCity" :options="cities" optionLabel="name" placeholder="Select a City"
                            class="w-full" />
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
                        <CascadeSelect v-model="cascadeValue" :options="cascadeCountries" optionLabel="cname"
                            optionGroupLabel="name" :optionGroupChildren="['children', 'children']"
                            placeholder="Select a City" class="w-full" />
                    </template>
                </Card>

                <Card>
                    <template #title>TreeSelect</template>
                    <template #content>
                        <TreeSelect v-model="treeSelectValue" :options="treeSelectNodes" placeholder="Select Item"
                            class="w-full" />
                    </template>
                </Card>

                <Card>
                    <template #title>Listbox</template>
                    <template #content>
                        <Listbox v-model="listboxValue" :options="cities" optionLabel="name" class="w-full" />
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
</template>
