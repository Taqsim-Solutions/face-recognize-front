<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { STATUS_FILTER_OPTIONS } from '@/constants/entityStatus'

defineProps<{
  modelValue: string
}>()
const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>()
const { t } = useI18n()
</script>

<template>
  <Select
    :model-value="modelValue"
    @update:model-value="(v: any) => emit('update:modelValue', String(v))"
  >
    <SelectTrigger class="h-11 rounded-lg border border-gray-300 bg-white min-w-[150px]">
      <SelectValue :placeholder="t('status', 'Holat')" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem
        v-for="opt in STATUS_FILTER_OPTIONS"
        :key="opt.value"
        :value="opt.value"
      >
        {{ t(opt.labelKey, opt.labelFallback) }}
      </SelectItem>
    </SelectContent>
  </Select>
</template>
