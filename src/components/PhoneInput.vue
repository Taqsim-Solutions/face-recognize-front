<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { sanitizePhone, isValidPhone, detectCountry, callingCodeFor } from '@/composables/usePhoneInput'

const props = defineProps<{
  modelValue?: string | null
  placeholder?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
  (e: 'validity', v: boolean): void
}>()

// Plain native input (not the shadcn Input, whose internal useVModel fought our
// binding and caused the one-keystroke-behind bug). Single local ref, sanitized
// on every input, written straight back to the DOM so letters never appear.
const display = ref(sanitizePhone(props.modelValue || ''))

watch(
  () => props.modelValue,
  (v) => {
    const next = sanitizePhone(v || '')
    if (next !== display.value) display.value = next
  }
)

const onInput = (e: Event) => {
  const el = e.target as HTMLInputElement
  const sanitized = sanitizePhone(el.value)
  display.value = sanitized
  if (el.value !== sanitized) el.value = sanitized
  emit('update:modelValue', sanitized)
  emit('validity', isValidPhone(sanitized))
}

const ph = computed(() => props.placeholder || callingCodeFor(detectCountry()))
</script>

<template>
  <input
    :value="display"
    type="tel"
    inputmode="tel"
    :placeholder="ph"
    :disabled="disabled"
    autocomplete="tel"
    @input="onInput"
    class="flex h-11 w-full rounded-lg border-2 border-border bg-transparent px-3 py-1 text-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
  />
</template>
