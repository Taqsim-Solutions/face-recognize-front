<script setup lang="ts">
import type { HTMLAttributes, Component } from 'vue'
import { useVModel } from '@vueuse/core'
import { cn } from '@/lib/utils'
import { ref, computed } from 'vue'
import { Eye, EyeOff } from 'lucide-vue-next'

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

// Password show/hide support: when type is "password", render an eye toggle.
const isPassword = computed(() => props.type === 'password')
const showPassword = ref(false)
const effectiveType = computed(() => {
  if (!isPassword.value) return props.type || 'text'
  return showPassword.value ? 'text' : 'password'
})
</script>

<template>
  <div class="relative w-full">
    <div v-if="props.left" class="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
      <component :is="props.left" :size="22" class="w-4 h-4" />
    </div>

    <input ref="inputRef" v-model="modelValue" v-bind="$attrs" :type="effectiveType"
      :placeholder="props.placeholder" autocomplete="new-password" :class="cn(
        'flex h-9 w-full bg-transparent py-1 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 rounded-lg border-2 border-border focus:border-primary focus:outline-none focus:ring-offset-0',
        {
          'pl-10': props.left,
          'pl-3': !props.left,
          'pr-10': isPassword,
          'pr-3': !isPassword
        },
        props.class
      )
        " />

    <!-- Password show/hide eye toggle -->
    <button
      v-if="isPassword"
      type="button"
      tabindex="-1"
      @click="showPassword = !showPassword"
      class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
      :aria-label="showPassword ? 'Hide password' : 'Show password'"
    >
      <EyeOff v-if="showPassword" class="w-4 h-4" />
      <Eye v-else class="w-4 h-4" />
    </button>
  </div>
</template>
