<script setup lang="ts">
import { computed, watch } from 'vue'
import { Input } from '@/components/ui/input'
import { usePhoneInput } from '@/composables/usePhoneInput'

const props = defineProps<{
  modelValue?: string | null
  placeholder?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
  (e: 'validity', v: boolean): void
}>()

const { model, onInput, isValid, callingCode } = usePhoneInput(props.modelValue || '')

// Keep the local model in sync if the parent sets the value externally
// (e.g. resetForm, edit prefill).
watch(
  () => props.modelValue,
  (v) => { if ((v || '') !== model.value) model.value = v || '' }
)

// Emit sanitized value + validity upward whenever the user types.
const handle = (e: Event) => {
  const raw = (e.target as HTMLInputElement).value
  onInput(raw)
  emit('update:modelValue', model.value)
  emit('validity', isValid.value)
}

const ph = computed(() => props.placeholder || callingCode.value)
</script>

<template>
  <Input
    type="tel"
    inputmode="tel"
    :value="model"
    :placeholder="ph"
    :disabled="disabled"
    autocomplete="tel"
    class="h-11 border border-gray-300 rounded-lg focus:border-primary bg-white"
    @input="handle"
  />
</template>
