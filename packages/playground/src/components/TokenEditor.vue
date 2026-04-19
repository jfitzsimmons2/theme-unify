<script setup lang="ts">
import { ref, watch } from 'vue'
import { VueMonacoEditor } from '@guolao/vue-monaco-editor'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Menu from 'primevue/menu'
import Message from 'primevue/message'
import themeUnifyDts from 'virtual:theme-unify-dts'

const props = defineProps<{
    modelValue: string
    parseError: string | null
    validationErrors: { path: string; message: string }[]
    isProcessing: boolean
}>()

const emit = defineEmits<{
    'update:modelValue': [value: string]
    apply: []
    downloadConfig: []
    downloadGenerated: []
    downloadAll: []
    reset: []
}>()

const editorRef = ref()
const monacoRef = ref<any>(null)
const autoApply = ref(true)
const downloadMenuRef = ref()

let debounceTimer: ReturnType<typeof setTimeout> | null = null

function onEditorChange(value: string | undefined) {
    if (value == null) return
    emit('update:modelValue', value)

    if (autoApply.value) {
        if (debounceTimer) clearTimeout(debounceTimer)
        debounceTimer = setTimeout(() => emit('apply'), 500)
    }
}

function handleApply() {
    emit('apply')
}

const downloadItems = ref([
    {
        label: 'Download Config',
        icon: 'i-prime-file',
        command: () => emit('downloadConfig'),
    },
    {
        label: 'Download Generated (zip)',
        icon: 'i-prime-download',
        command: () => emit('downloadAll'),
    },
])

function toggleDownloadMenu(event: Event) {
    downloadMenuRef.value.toggle(event)
}

const hasErrors = ref(false)

const editorOptions = {
    minimap: { enabled: false },
    fontSize: 13,
    lineNumbers: 'on' as const,
    scrollBeyondLastLine: false,
    wordWrap: 'on' as const,
    automaticLayout: true,
    tabSize: 2,
    renderWhitespace: 'none' as const,
    padding: { top: 8, bottom: 8 },
}

function onEditorBeforeMount(monaco: any) {
    monacoRef.value = monaco
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ESNext,
        module: monaco.languages.typescript.ModuleKind.ESNext,
        moduleResolution: 2, // NodeJs
        allowNonTsExtensions: true,
        strict: true,
    })
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
        `declare module 'theme-unify' { ${themeUnifyDts} }`,
        'file:///node_modules/theme-unify/index.d.ts',
    )
}

/**
 * Extract a line number from an error message or stack trace.
 */
function extractErrorLine(err: string): number | null {
    // Sucrase errors: "<input>:42:5" or similar
    const sucraseMatch = err.match(/<input>:(\d+)/)
    if (sucraseMatch) return parseInt(sucraseMatch[1], 10)
    // "new Function" eval errors: "<anonymous>:42:5"
    const anonMatch = err.match(/<anonymous>:(\d+)/)
    if (anonMatch) return parseInt(anonMatch[1], 10)
    // Generic "line X" or "Line X"
    const lineMatch = err.match(/\bline\s+(\d+)/i)
    if (lineMatch) return parseInt(lineMatch[1], 10)
    return null
}

watch(
    () => [props.parseError, props.validationErrors] as const,
    () => {
        hasErrors.value = !!props.parseError || props.validationErrors.length > 0

        const monaco = monacoRef.value
        const editor = editorRef.value
        if (!monaco || !editor) return

        const model = editor.getModel()
        if (!model) return

        const markers: any[] = []

        if (props.parseError) {
            const line = extractErrorLine(props.parseError)
            markers.push({
                severity: monaco.MarkerSeverity.Error,
                message: props.parseError,
                startLineNumber: line ?? 1,
                startColumn: 1,
                endLineNumber: line ?? 1,
                endColumn: model.getLineMaxColumn(line ?? 1),
            })
        }

        for (const err of props.validationErrors) {
            markers.push({
                severity: monaco.MarkerSeverity.Warning,
                message: `${err.path}: ${err.message}`,
                startLineNumber: 1,
                startColumn: 1,
                endLineNumber: 1,
                endColumn: 1,
            })
        }

        monaco.editor.setModelMarkers(model, 'theme-unify', markers)
    },
    { immediate: true },
)
</script>

<template>
    <div class="flex flex-col h-full">
        <!-- Toolbar -->
        <div class="flex items-center gap-2 px-3 py-2 border-b border-default bg-surface flex-shrink-0">
            <span class="font-semibold text-sm">tokens.config.ts</span>
            <Tag v-if="hasErrors"
                :value="parseError ? 'Parse Error' : `${validationErrors.length} issue${validationErrors.length !== 1 ? 's' : ''}`"
                severity="danger" class="text-xs" />
            <Tag v-else-if="isProcessing" value="Processing..." severity="info" class="text-xs" />
            <Tag v-else value="Valid" severity="success" class="text-xs" />

            <div class="flex-1" />

            <label class="flex items-center gap-1 text-xs cursor-pointer select-none">
                <input type="checkbox" v-model="autoApply" class="accent-current" />
                Auto-apply
            </label>

            <Button v-if="!autoApply" label="Apply" icon="i-prime-check" size="small" @click="handleApply"
                :disabled="isProcessing" />

            <Button icon="i-prime-download" size="small" severity="secondary" @click="toggleDownloadMenu"
                v-tooltip="'Download'" />
            <Menu ref="downloadMenuRef" :model="downloadItems" :popup="true" />

            <Button icon="i-prime-undo" size="small" severity="secondary" @click="$emit('reset')"
                v-tooltip="'Reset to default'" />
        </div>

        <!-- Editor -->
        <div class="flex-1 min-h-0">
            <VueMonacoEditor :value="modelValue" language="typescript" theme="vs-dark" :options="editorOptions"
                @change="onEditorChange" @beforeMount="onEditorBeforeMount"
                @mount="(editor: any) => { editorRef = editor }" />
        </div>

        <!-- Error Panel -->
        <div v-if="hasErrors" class="max-h-40 overflow-y-auto border-t border-default bg-surface flex-shrink-0 p-2">
            <Message v-if="parseError" severity="error" :closable="false" class="mb-1 text-xs">
                {{ parseError }}
            </Message>
            <Message v-for="(err, idx) in validationErrors" :key="idx" severity="warn" :closable="false"
                class="mb-1 text-xs">
                <strong>{{ err.path }}</strong>: {{ err.message }}
            </Message>
        </div>
    </div>
</template>
