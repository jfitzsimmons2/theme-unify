<script setup lang="ts">
import Button from 'primevue/button'
import Card from 'primevue/card'
import Message from 'primevue/message'
import { useToast } from 'primevue/usetoast'

const toast = useToast()

function showToast(severity: 'success' | 'info' | 'warn' | 'error') {
    toast.add({ severity, summary: severity.charAt(0).toUpperCase() + severity.slice(1), detail: `This is a ${severity} toast message`, life: 3000 })
}
</script>

<template>
    <section class="flex flex-col gap-6">
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
</template>
