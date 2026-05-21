<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  availableHours,
  availableMinutes,
  type HourValue,
  type MinuteValue,
  type TimeValue
} from './hours-and-minutes'

import { ChevronDownIcon, ChevronUpIcon, ArrowLeftIcon, ClockIcon } from 'lucide-vue-next'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineOptions({
  inheritAttrs: false
})

const props = defineProps<{
  modelValue?: TimeValue
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: TimeValue): void
}>()

const pickedHour = ref<HourValue | null>(
  props.modelValue ? (props.modelValue.split(':')[0] as HourValue) : null
)
const pickedMinute = ref<MinuteValue | null>(
  props.modelValue ? (props.modelValue.split(':')[1] as MinuteValue) : null
)

watch(
  () => props.modelValue,
  (val: TimeValue | undefined) => {
    if (val) {
      const [h, m] = val.split(':')
      pickedHour.value = h as HourValue
      pickedMinute.value = m as MinuteValue
    } else {
      pickedHour.value = null
      pickedMinute.value = null
    }
  }
)
const hourBeingPicked = ref(false)
const minuteBeingPicked = ref(false)

const emitValue = () => {
  if (pickedHour.value && pickedMinute.value) {
    emit('update:modelValue', `${pickedHour.value}:${pickedMinute.value}`)
  }
}

const handleHourPicking = (val: HourValue) => {
  pickedHour.value = val
  hourBeingPicked.value = false
  emitValue()
}
const handleMinutePicking = (val: MinuteValue) => {
  pickedMinute.value = val
  minuteBeingPicked.value = false
  emitValue()
}

const changeHour = (e: 'up' | 'down') => {
  const hour = Number(pickedHour.value)
  let updatedHour: number

  e === 'up' ? (updatedHour = (hour + 1) % 24) : (updatedHour = (hour - 1 + 24) % 24)

  const formattedHour = updatedHour.toString().padStart(2, '0') as HourValue
  pickedHour.value = formattedHour
  emitValue()
}

const changeMinute = (e: 'up' | 'down') => {
  const minute = Number(pickedMinute.value)
  let updatedMinute: number

  e === 'up' ? (updatedMinute = (minute + 5) % 60) : (updatedMinute = (minute - 5 + 60) % 60)

  const formattedMinute = updatedMinute.toString().padStart(2, '0') as MinuteValue
  pickedMinute.value = formattedMinute
  emitValue()
}
</script>

<template>
  <Popover>
    <PopoverTrigger>
      <Button
        variant="outline"
        size="lg"
        class="justify-start text-left font-normal px-4 w-40 gap-2"
        type="button"
        v-bind="$attrs"
      >
        <ClockIcon :size="16" class="text-muted-foreground" />
        <span v-if="pickedHour && pickedMinute">{{ pickedHour }} : {{ pickedMinute }}</span>
        <span v-else class="text-muted-foreground">{{ t('pick-a-time') }}</span>
      </Button>
    </PopoverTrigger>

    <PopoverContent>
      <div
        v-if="!hourBeingPicked && !minuteBeingPicked"
        class="flex gap-4 items-center justify-center"
      >
        <div class="flex flex-col gap-4">
          <Button variant="ghost" @click="changeHour('up')">
            <ChevronUpIcon :size="24" />
          </Button>
          <Button variant="outline" class="tabular-nums" @click="() => (hourBeingPicked = true)">
            <span v-if="pickedHour">{{ pickedHour }}</span>
            <span v-else class="text-muted-foreground">HH</span>
          </Button>
          <Button variant="ghost" @click="changeHour('down')">
            <ChevronDownIcon :size="24" />
          </Button>
        </div>
        <p>:</p>
        <div class="flex flex-col gap-4">
          <Button variant="ghost" @click="changeMinute('up')">
            <ChevronUpIcon :size="24" />
          </Button>
          <Button variant="outline" class="tabular-nums" @click="() => (minuteBeingPicked = true)">
            <span v-if="pickedMinute">{{ pickedMinute }}</span>
            <span v-else class="text-muted-foreground">mm</span>
          </Button>
          <Button variant="ghost" @click="changeMinute('down')">
            <ChevronDownIcon :size="24" />
          </Button>
        </div>
      </div>

      <div v-else-if="hourBeingPicked">
        <div class="grid grid-cols-4">
          <Button
            v-for="hour in availableHours"
            :key="hour"
            variant="ghost"
            class="tabular-nums"
            @click="handleHourPicking(hour)"
          >
            {{ hour }}
          </Button>
        </div>
        <Button variant="ghost" class="w-full mt-1" @click="() => (hourBeingPicked = false)">
          <ArrowLeftIcon :size="24" />
        </Button>
      </div>

      <div v-else-if="minuteBeingPicked">
        <div class="grid grid-cols-4">
          <Button
            v-for="minute in availableMinutes"
            :key="minute"
            variant="ghost"
            class="tabular-nums"
            @click="handleMinutePicking(minute)"
          >
            {{ minute }}
          </Button>
        </div>
        <Button variant="ghost" class="w-full mt-1" @click="() => (minuteBeingPicked = false)">
          <ArrowLeftIcon :size="24" />
        </Button>
      </div>
    </PopoverContent>
  </Popover>
</template>
