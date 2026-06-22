<script setup lang="ts">
import { ref, computed } from 'vue'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList
} from '@/components/ui/command'
import { ChevronsUpDownIcon, CheckIcon } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

interface Option {
  value: string
  label: string
}

const props = withDefaults(defineProps<{
  modelValue: string
  options: Option[]
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
}>(), {
  placeholder: 'Tanlang',
  searchPlaceholder: 'Qidirish...',
  emptyText: 'Topilmadi',
  disabled: false
})

const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>()

const open = ref(false)

const selectedLabel = computed(() =>
  props.options.find((o) => o.value === props.modelValue)?.label || ''
)

function pick(value: string) {
  emit('update:modelValue', value)
  open.value = false
}
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child :disabled="disabled">
      <button
        type="button"
        :disabled="disabled"
        :class="cn(
          'flex h-11 w-full items-center justify-between rounded-lg border bg-gray-50 px-3 text-sm',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          !selectedLabel && 'text-gray-400'
        )"
      >
        <span class="truncate text-left">{{ selectedLabel || placeholder }}</span>
        <ChevronsUpDownIcon class="ml-2 h-4 w-4 shrink-0 text-gray-400" />
      </button>
    </PopoverTrigger>
    <PopoverContent class="p-0 w-[--radix-popover-trigger-width] min-w-[220px]" align="start">
      <Command>
        <CommandInput :placeholder="searchPlaceholder" class="h-10" />
        <CommandList>
          <CommandEmpty>{{ emptyText }}</CommandEmpty>
          <CommandGroup>
            <CommandItem
              v-for="opt in options"
              :key="opt.value"
              :value="opt.label"
              @select="pick(opt.value)"
              class="cursor-pointer"
            >
              <CheckIcon
                :class="cn('mr-2 h-4 w-4', modelValue === opt.value ? 'opacity-100' : 'opacity-0')"
              />
              {{ opt.label }}
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</template>
