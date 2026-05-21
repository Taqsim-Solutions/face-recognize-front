<script setup lang="ts">
import type { WeekendsModel } from '../types'

import * as z from 'zod'
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'

import { useUpdateOrganizationOptions } from '../query/useEditOrganizationOptions'
import { useGetOrganizationOptions } from '../query/useGetOrganizationOptions'

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TimePicker } from '@/components/ui/time-picker'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { toast } from 'vue-sonner'

const { t } = useI18n()

const { data: optionsData, refetch } = useGetOrganizationOptions()
const data = computed(() => optionsData.value?.data.data)

type Weekdays = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
const weekdaysList: Weekdays[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
]

const toggleWeekend = (
  item: Weekdays,
  value: string[] | undefined,
  handleChange: (val: string[]) => void
) => {
  const newWeekends = [...(value || [])]
  const index = newWeekends.indexOf(item)
  if (index === -1) newWeekends.push(item)
  else newWeekends.splice(index, 1)
  handleChange(newWeekends)
}

const shiftBased = ref(false)

const { handleSubmit, setValues } = useForm({
  validationSchema: computed(() => {
    const baseSchema = {
      weekends: z.array(z.string()).min(1, 'validation.required-field'),
      dayShiftWorkStartTime: z.string({ required_error: 'validation.required-field' }),
      dayShiftWorkEndTime: z.string({ required_error: 'validation.required-field' })
    }

    if (!shiftBased.value) {
      return toTypedSchema(z.object(baseSchema))
    }

    return toTypedSchema(
      z.object({
        ...baseSchema,
        eveningShiftWorkStartTime: z.string({ required_error: 'validation.required-field' }),
        eveningShiftWorkEndTime: z.string({ required_error: 'validation.required-field' })
      })
    )
  })
})

watch(
  () => data.value,
  (val) => {
    if (!val) return

    const {
      weekends,
      dayShiftWorkStartTime,
      dayShiftWorkEndTime,
      eveningShiftWorkStartTime,
      eveningShiftWorkEndTime
    } = val

    if (eveningShiftWorkStartTime || eveningShiftWorkEndTime) {
      shiftBased.value = true
    }

    setValues({
      weekends: weekends || [],
      dayShiftWorkEndTime: dayShiftWorkEndTime || undefined,
      dayShiftWorkStartTime: dayShiftWorkStartTime || undefined,
      eveningShiftWorkStartTime: eveningShiftWorkStartTime || undefined,
      eveningShiftWorkEndTime: eveningShiftWorkEndTime || undefined
    } as any)
  },
  { immediate: true }
)

const { mutate, isPending } = useUpdateOrganizationOptions()

const onSubmit = handleSubmit((values) => {
  if (!data.value || isPending.value) return

  const basePayload = {
    ...data.value,
    weekends: values.weekends as WeekendsModel[],
    dayShiftWorkStartTime: values.dayShiftWorkStartTime,
    dayShiftWorkEndTime: values.dayShiftWorkEndTime
  }

  const payload = shiftBased.value
    ? {
        ...basePayload,
        eveningShiftWorkStartTime: (values as any).eveningShiftWorkStartTime,
        eveningShiftWorkEndTime: (values as any).eveningShiftWorkEndTime
      }
    : {
        ...basePayload,
        eveningShiftWorkStartTime: null,
        eveningShiftWorkEndTime: null
      }

  mutate(payload, {
    onSuccess: () => {
      toast.success(t('success.settings-updated'))
      refetch()
    },
    onError: () => {
      toast.error(t('error-occurred'))
    }
  })
})
</script>

<template>
  <Card class="rounded-2xl border border-gray-200 bg-white shadow-none w-full overflow-hidden">
    <CardHeader class="border-b pt-7 mb-6 text-lg bg-gray-50">
      <CardTitle>{{ t('weekends-and-work-hours') }}</CardTitle>
      <p class="text-sm text-muted-foreground">{{ t('settings-weekends-desc') }}</p>
    </CardHeader>
    <CardContent>
      <form class="space-y-6" @submit.prevent="onSubmit">
        <!-- Weekends Section -->
        <FormField name="weekends">
          <FormItem>
            <div class="mb-4">
              <p class="text-base font-semibold">{{ t('weekends') }}</p>

            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
              <FormField
                v-for="item in weekdaysList"
                v-slot="{ value, handleChange }"
                :key="item"
                type="checkbox"
                :value="item"
                :unchecked-value="false"
                name="weekends"
              >
                <FormItem
                  class="flex flex-col items-center space-y-2 p-3 border rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                  :class="[value?.includes(item) ? 'border-primary/50 bg-primary/5' : 'border-gray-100']"
                  @click="toggleWeekend(item, value, handleChange)"
                >
                  <FormControl>
                    <Checkbox
                      name="weekends"
                      size="lg"
                      :checked="value?.includes(item)"
                      :disabled="isPending"
                      @update:checked="() => toggleWeekend(item, value, handleChange)"
                      @click.stop
                    />
                  </FormControl>
                  <FormLabel class="font-medium text-xs uppercase cursor-pointer">
                    {{ t(item) }}
                  </FormLabel>


                </FormItem>
              </FormField>
            </div>
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- Work Mode Toggle -->
        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div class="space-y-0.5">
            <Label for="shift-type" class="text-base font-semibold">{{ t('24-hour-work-mode') }}</Label>
             </div>
          <Switch id="shift-type" v-model:checked="shiftBased" />
        </div>

        <!-- Shift Settings -->
        <div class="flex flex-col gap-6">
          <!-- Day Shift -->
          <div class="relative group space-y-5 p-6 rounded-2xl border border-gray-200 bg-white hover:border-orange-200/50 transition-all duration-300">
           
            
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sun"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
              </div>
              <h3 class="font-bold text-sm uppercase text-[#475569]">{{ t('day-shift') }}</h3>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField v-slot="{ componentField }" name="dayShiftWorkStartTime">
                <FormItem class="space-y-2">
                  <FormLabel class="text-xs flex items-center gap-1.5 text-slate-600">
                    {{ t('work-start-time') }}
                  </FormLabel>
                  <FormControl>
                    <TimePicker v-bind="componentField" class="max-w-[180px] h-11 border-slate-200" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="dayShiftWorkEndTime">
                <FormItem class="space-y-2">
                  <FormLabel class="text-xs flex items-center gap-1.5 text-slate-600">
                    {{ t('work-end-time') }}
                  </FormLabel>
                  <FormControl>
                    <TimePicker v-bind="componentField" class="max-w-[180px] h-11 border-slate-200" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>
            </div>
          </div>

          <!-- Night Shift -->
          <div v-if="shiftBased" class="relative group space-y-5 p-6 rounded-2xl border border-gray-200 bg-white hover:border-indigo-200/50 transition-all duration-300">
           <div class="flex items-center gap-4">
              <div class="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-moon"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
              </div>
              <h3 class="font-bold text-sm uppercase text-[#475569]">{{ t('night-shift') }}</h3>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-0">
              <FormField v-slot="{ componentField }" name="eveningShiftWorkStartTime">
                <FormItem class="space-y-2">
                  <FormLabel class="text-xs flex items-center gap-1.5 text-slate-600">
                    {{ t('work-start-time') }}
                  </FormLabel>
                  <FormControl>
                    <TimePicker v-bind="componentField" class="max-w-[180px] h-11 border-slate-200" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="eveningShiftWorkEndTime">
                <FormItem class="space-y-2">
                  <FormLabel class="text-xs flex items-center gap-1.5 text-slate-600">
                    {{ t('work-end-time') }}
                  </FormLabel>
                  <FormControl>
                    <TimePicker v-bind="componentField" class="max-w-[180px] h-11 border-slate-200" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>
            </div>
          </div>
        </div>

        <div class="flex justify-end">
          <Button type="submit" :loading="isPending" class="px-8 min-w-[140px]">
            {{ t('save') }}
          </Button>
        </div>
      </form>
    </CardContent>
  </Card>
</template>
