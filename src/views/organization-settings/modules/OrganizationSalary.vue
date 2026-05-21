<script setup lang="ts">
import type { OrganizationSalaryModel, SalaryDayModel } from '../types'
import { PersonalIncomeTaxEnum } from '../types'

import { useUpdateOrganizationSalaryOptions } from '../query/useEditOrganizationOptions'
import { useGetOrganizationOptions } from '../query/useGetOrganizationOptions'

import * as z from 'zod'
import { watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'

import { toast } from 'vue-sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { HelpCircle } from 'lucide-vue-next'


const { t } = useI18n()

const { data: optionsData, refetch } = useGetOrganizationOptions()
const data = computed<OrganizationSalaryModel | undefined>(() => optionsData.value?.data.data)

const salaryDayOptions: SalaryDayModel[] = [
  'lastDay',
  ...Array.from({ length: 26 }, (_, i) => `day${i + 2}` as SalaryDayModel)
]

const formSchema = toTypedSchema(
  z.object({
    salaryDay: z
      .string({ required_error: 'validation.required-field' })
      .min(1, 'validation.required-field'),
    advanceDay: z
      .string({ required_error: 'validation.required-field' })
      .min(1, 'validation.required-field'),
    balanceLimit: z.preprocess(
      (v) => (v === '' || v === undefined ? NaN : Number(v)),
      z
        .number({
          required_error: 'validation.required-field',
          invalid_type_error: 'validation.required-field'
        })
        .min(0)
        .refine((val) => !isNaN(val), { message: 'validation.required-field' })
    ),
    advancePercent: z.preprocess(
      (v) => (v === '' || v === undefined ? NaN : Number(v)),
      z
        .number({
          required_error: 'validation.required-field',
          invalid_type_error: 'validation.required-field'
        })
        .min(10, { message: 'validation.advance-percent-min' })
        .max(100, { message: 'validation.advance-percent-max' })
        .refine((val) => !isNaN(val), { message: 'validation.required-field' })
    ),
    personalIncomeTax: z
      .string({ required_error: 'validation.required-field' })
      .min(1, 'validation.required-field'),
    dailySalaryRequestLimit: z.preprocess(
      (v) => (v === '' || v === undefined ? NaN : Number(v)),
      z
        .number({
          required_error: 'validation.required-field',
          invalid_type_error: 'validation.required-field'
        })
        .min(0)
        .refine((val) => !isNaN(val), { message: 'validation.required-field' })
    )
  })
)

const { handleSubmit, setValues } = useForm({
  validationSchema: formSchema
})

watch(
  () => data.value,
  (val) => {
    if (val) {
      setValues({
        salaryDay: val.salaryDay,
        advanceDay: val.advanceDay,
        balanceLimit: val.balanceLimit ?? 0,
        advancePercent: val.advancePercent,
        personalIncomeTax: val.personalIncomeTax,
        dailySalaryRequestLimit: val.dailySalaryRequestLimit
      })
    }
  },
  { immediate: true }
)

const { mutate, isPending } = useUpdateOrganizationSalaryOptions()

const onSubmit = handleSubmit((values) => {
  if (!data.value || isPending.value) return

  // Client-side validation: Ensure salaryDay and advanceDay are different
  if (values.salaryDay === values.advanceDay) {
    toast.error(t('error.same-salary-and-advance-day'))
    return
  }

  const payload: OrganizationSalaryModel = {
    ...data.value,
    salaryDay: values.salaryDay as SalaryDayModel,
    advanceDay: values.advanceDay as SalaryDayModel,
    balanceLimit: Number(values.balanceLimit),
    advancePercent: Number(values.advancePercent),
    personalIncomeTax: values.personalIncomeTax,
    dailySalaryRequestLimit: Number(values.dailySalaryRequestLimit)
  }

  mutate(payload, {
    onSuccess: () => {
      toast.success(t('success.settings-updated'))
      refetch()
    },
    onError: (error: any) => {
      console.error('Salary options update failed:', error)
      const errorCode = error?.response?.data?.error?.code
      const message =
        errorCode === 'InvalidAdvancePercent'
          ? t('error.invalid-advance-percent')
          : errorCode === 'SameSalaryAndAdvanceDay'
          ? t('error.same-salary-and-advance-day')
          : t('error-occurred')

      toast.error(message)
    }
  })
})
</script>

<template>
  <Card class="rounded-2xl border border-gray-200 bg-white shadow-none w-full overflow-hidden">
    <CardHeader class="border-b pt-4 mb-5 bg-gray-50">
      <CardTitle class="text-lg font-semibold -mb-1">{{ t('salary-and-advance') }}</CardTitle>
      <p class="text-sm text-muted-foreground">{{ t('settings-salary-desc') }}</p>
    </CardHeader>
    <CardContent>
      <form :aria-busy="isPending" class="grid grid-cols-1 md:grid-cols-2 gap-6" @submit.prevent="onSubmit">
        <!-- salaryDay -->
        <FormField v-slot="{ componentField }" name="salaryDay">
          <FormItem>
            <div class="flex items-center gap-1.5 mb-1">
              <FormLabel>{{ t('salary-day') }}</FormLabel>
              <Popover>
                <PopoverTrigger as-child>
                  <button
                    type="button"
                    class="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <HelpCircle :size="14" />
                  </button>
                </PopoverTrigger>
                <PopoverContent side="right" class="w-auto max-w-[280px] p-3">
                  <p class="text-xs">{{ t('you-need-to-select-salary-day-here') }}</p>
                </PopoverContent>
              </Popover>
            </div>
            <Select v-bind="componentField">
              <FormControl>
                <SelectTrigger
                  :disabled="isPending"
                  :aria-label="t('salary-day')"
                  class="h-11"
                >
                  <SelectValue :placeholder="t('select-salary-day')" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectGroup>
                  <SelectItem v-for="day in salaryDayOptions" :key="day" :value="day">
                    {{ day === 'lastDay' ? t(day) : t('day-of', { v: day.replace('day', '') }) }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- advanceDay -->
        <FormField v-slot="{ componentField }" name="advanceDay">
          <FormItem>
            <div class="flex items-center gap-1.5 mb-1">
              <FormLabel>{{ t('advance-day') }}</FormLabel>
              <Popover>
                <PopoverTrigger as-child>
                  <button
                    type="button"
                    class="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <HelpCircle :size="14" />
                  </button>
                </PopoverTrigger>
                <PopoverContent side="right" class="w-auto max-w-[280px] p-3">
                  <p class="text-xs">{{ t('you-need-to-select-advance-day-here') }}</p>
                </PopoverContent>
              </Popover>
            </div>
            <Select v-bind="componentField">
              <FormControl>
                <SelectTrigger
                  :disabled="isPending"
                  :aria-label="t('advance-day')"
                  class="h-11"
                >
                  <SelectValue :placeholder="t('select-advance-day')" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectGroup>
                  <SelectItem v-for="day in salaryDayOptions" :key="day" :value="day">
                    {{ day === 'lastDay' ? t(day) : t('day-of', { v: day.replace('day', '') }) }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- balanceLimit -->
        <FormField v-slot="{ componentField }" name="balanceLimit">
          <FormItem>
            <div class="flex items-center gap-1.5 mb-1">
              <FormLabel>{{ t('balance-limit') }}</FormLabel>
              <Popover>
                <PopoverTrigger as-child>
                  <button
                    type="button"
                    class="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <HelpCircle :size="14" />
                  </button>
                </PopoverTrigger>
                <PopoverContent side="right" class="w-auto max-w-[280px] p-3">
                  <p class="text-xs">{{ t('you-need-to-provide-balance-limit-of-your-company') }}</p>
                </PopoverContent>
              </Popover>
            </div>
            <FormControl>
              <Input
                type="number"
                :placeholder="t('enter-balance-limit')"
                v-bind="componentField"
                :disabled="isPending"
                :aria-label="t('balance-limit')"
                class="h-11"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- advancePercent -->
        <FormField v-slot="{ componentField }" name="advancePercent">
          <FormItem>
            <div class="flex items-center gap-1.5 mb-1">
              <FormLabel>{{ t('advance-percent') }}</FormLabel>
              <Popover>
                <PopoverTrigger as-child>
                  <button
                    type="button"
                    class="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <HelpCircle :size="14" />
                  </button>
                </PopoverTrigger>
                <PopoverContent side="right" class="w-auto max-w-[280px] p-3">
                  <p class="text-xs">{{ t('here-you-can-define-how-high-advance-percent-can-get') }}</p>
                </PopoverContent>
              </Popover>
            </div>
            <FormControl>
              <Input
                type="number"
                :placeholder="t('enter-advance-percent')"
                v-bind="componentField"
                :disabled="isPending"
                :aria-label="t('advance-percent')"
                class="h-11"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- personalIncomeTax -->
        <FormField v-slot="{ componentField }" name="personalIncomeTax">
          <FormItem>
            <div class="flex items-center gap-1.5 mb-1">
              <FormLabel>{{ t('personal-income-tax') }}</FormLabel>
              <Popover>
                <PopoverTrigger as-child>
                  <button
                    type="button"
                    class="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <HelpCircle :size="14" />
                  </button>
                </PopoverTrigger>
                <PopoverContent side="right" class="w-auto max-w-[280px] p-3">
                  <p class="text-xs">{{ t('personal-income-tax-desc') }}</p>
                </PopoverContent>
              </Popover>
            </div>
            <Select v-bind="componentField">
              <FormControl>
                <SelectTrigger
                  :disabled="isPending"
                  :aria-label="t('personal-income-tax')"
                  class="h-11"
                >
                  <SelectValue :placeholder="t('enter-personal-income-tax')" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectGroup>
                  <SelectItem :value="PersonalIncomeTaxEnum.none"> 0 % </SelectItem>
                  <SelectItem :value="PersonalIncomeTaxEnum.sevenPointFivePercent"> 7.5 % </SelectItem>
                  <SelectItem :value="PersonalIncomeTaxEnum.twelvePercent"> 12 % </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- dailySalaryRequestLimit -->
        <FormField v-slot="{ componentField }" name="dailySalaryRequestLimit">
          <FormItem>
            <div class="flex items-center gap-1.5 mb-1">
              <FormLabel>{{ t('daily-salary-request-limit') }}</FormLabel>
            </div>
            <FormControl>
              <Input
                type="number"
                :placeholder="t('daily-salary-request-limit')"
                v-bind="componentField"
                :disabled="isPending"
                :aria-label="t('daily-salary-request-limit')"
                class="h-11"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <div class="col-span-1 md:col-span-2 flex justify-end">
          <Button type="submit" :loading="isPending" class="px-8 h-9 min-w-[120px]">
            {{ t('save') }}
          </Button>
        </div>
      </form>
    </CardContent>
  </Card>
</template>
