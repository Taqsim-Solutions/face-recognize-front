<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Input } from '@/components/ui/input'
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

// Local display value. Re-synced from the prop only when it differs from what
// we already show (edit prefill / reset). We never write back into this from
// our own emit, which is what caused the one-keystroke-behind ("press twice").
const display = ref(sanitizePhone(props.modelValue || ''))

watch(
  () => props.modelValue,
  (v) => {
    const next = sanitizePhone(v || '')
    if (next !== display.value) display.value = next
  }
)

const handle = (e: Event) => {
  const sanitized = sanitizePhone((e.target as HTMLInputElement).value)
  display.value = sanitized
  // Keep the DOM input in sync immediately so typing a letter just shows
  // nothing rather than waiting for a round-trip.
  ;(e.target as HTMLInputElement).value = sanitized
  emit('update:modelValue', sanitized)
  emit('validity', isValidPhone(sanitized))
}

const ph = computed(() => props.placeholder || callingCodeFor(detectCountry()))
</script>

<template>
  <Input
    type="tel"
    inputmode="tel"
    :value="display"
    :placeholder="ph"
    :disabled="disabled"
    autocomplete="tel"
    class="h-11 border border-gray-300 rounded-lg focus:border-primary bg-white"
    @input="handle"
  />
</template>
