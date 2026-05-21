<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { cn } from '@/lib/utils'
import { DateFormatter, type DateValue, getLocalTimeZone, parseDate } from '@internationalized/date'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'

const props = defineProps<{
  initial?: string
}>()

const { t } = useI18n()
const df = new DateFormatter('ru-RU', {
  dateStyle: 'short'
})

const emit = defineEmits<{
  (e: 'confirm:date', value: DateValue | undefined): void
}>()

const value = ref<DateValue>()
const isOpen = ref(false)

// Initialize picker display from external initial value (YYYY-MM-DD)
watch(
  () => props.initial,
  (val) => {
    if (!val) {
      value.value = undefined
      return
    }
    try {
      value.value = parseDate(val)
    } catch (e) {
      value.value = undefined
    }
  },
  { immediate: true }
)

const handleConfirm = () => {
  emit('confirm:date', value.value)
  isOpen.value = false
}
const handleCancel = () => {
  value.value = undefined
  emit('confirm:date', value.value)
  isOpen.value = false
}
</script>

<template>
  <Popover v-model:open="isOpen">
    <PopoverTrigger as-child class="pr-0 mr-0">
      <Button
        variant="outline"
        v-bind="$attrs"
        :class="
          cn(
            'w-[136px] pl-3 justify-start text-left font-normal rounded-lg',
            !value && 'text-muted-foreground'
          )
        "
      >


        {{ value ? df.format(value.toDate(getLocalTimeZone())) : t('pick-date') }}

        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          class="ml-2"
        >
          <path
            d="M12 2.25V5.25M6 2.25V5.25M3 8.25H15M8.25 11.25H9V13.5M3 5.25C3 4.85217 3.15804 4.47064 3.43934 4.18934C3.72064 3.90803 4.10218 3.75 4.5 3.75H13.5C13.8978 3.75 14.2794 3.90803 14.5607 4.18934C14.842 4.47064 15 4.85217 15 5.25V14.25C15 14.6478 14.842 15.0294 14.5607 15.3107C14.2794 15.592 13.8978 15.75 13.5 15.75H4.5C4.10218 15.75 3.72064 15.592 3.43934 15.3107C3.15804 15.0294 3 14.6478 3 14.25V5.25Z"
            stroke="#111625"
            stroke-width="1.0125"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-auto p-0">
      <Calendar v-model="value" initial-focus :week-starts-on="1" :weekday-format="'short'" />
      <div class="p-3 pt-0 flex justify-between">
        <Button variant="outline" size="xs" class="font-normal" @click="handleCancel">
          {{ t('cancel') }}
        </Button>
        <Button size="xs" class="font-normal" @click="handleConfirm">{{ t('confirm') }}</Button>
      </div>
    </PopoverContent>
  </Popover>
</template>
