<script setup lang="ts">
import type { HTMLAttributes, Component } from 'vue'
import { useVModel } from '@vueuse/core'
import { cn } from '@/lib/utils'
import { ref } from 'vue'

defineOptions({
  inheritAttrs: false
})

const props = defineProps<{
  defaultValue?: string | number
  modelValue?: string | number
  class?: HTMLAttributes['class']
  placeholder?: string
  left?: Component | null
  type?: string // ✅ added type prop
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string | number): void
}>()

const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue
})

const inputRef = ref<HTMLInputElement | null>(null)
defineExpose({
  focus: () => inputRef.value?.focus()
})
</script>

<template>
  <div class="relative w-full">
    <div
      v-if="props.left"
      class="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground"
    >
      <component :is="props.left" />
    </div>

    <input
      ref="inputRef"
      v-model="modelValue"
      v-bind="$attrs"
      :type="props.type || 'text'"
      :placeholder="props.placeholder"
      autocomplete="new-password"
      :class="
        cn(
          'flex h-9 w-full bg-transparent pr-3 py-1 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 rounded-lg border-2 border-border focus:border-green focus:outline-none focus:ring-offset-0',
          {
            'pl-10': props.left,
            'pl-3': !props.left
          },
          props.class
        )
      "
    />
  </div>
</template>

