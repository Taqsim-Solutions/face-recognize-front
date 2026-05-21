<script setup lang="ts">
import * as z from 'zod'
import { watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { toast } from 'vue-sonner'

import { useUpdateOrganizationLeaveOptions } from '../query/useUpdateOrganizationLeaveOptions'
import { useGetOrganizationLeaveOptions } from '../query/useGetOrganizationLeaveOptions'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const { t } = useI18n()

const leaveFields = [
  { name: 'annualLeave', label: 'annual-leave', tooltip: 'enter-annual-leave' },
  { name: 'sickLeave', label: 'sick-leave', tooltip: 'enter-sick-leave' },
  { name: 'maternityLeave', label: 'maternity-leave', tooltip: 'enter-maternity-leave' },
  { name: 'businessTrip', label: 'business-trip', tooltip: 'enter-business-trip' },
  { name: 'unpaidLeave', label: 'unpaid-leave', tooltip: 'enter-unpaid-leave' }
] as const

const { data: optionsData, refetch } = useGetOrganizationLeaveOptions()
const data = computed(() => optionsData.value?.data.data)

const formSchema = toTypedSchema(
  z.object({
    annualLeave: z
      .number({ message: 'validation.required-field' })
      .min(0, { message: 'validation.min-allowed-percent-amount' })
      .max(100, { message: 'validation.max-allowed-percent-amount' }),
    sickLeave: z
      .number({ message: 'validation.required-field' })
      .min(0, { message: 'validation.min-allowed-percent-amount' })
      .max(100, { message: 'validation.max-allowed-percent-amount' }),
    maternityLeave: z
      .number({ message: 'validation.required-field' })
      .min(0, { message: 'validation.min-allowed-percent-amount' })
      .max(100, { message: 'validation.max-allowed-percent-amount' }),
    businessTrip: z
      .number({ message: 'validation.required-field' })
      .min(0, { message: 'validation.min-allowed-percent-amount' })
      .max(100, { message: 'validation.max-allowed-percent-amount' }),
    unpaidLeave: z
      .number({ message: 'validation.required-field' })
      .min(0, { message: 'validation.min-allowed-percent-amount' })
      .max(100, { message: 'validation.max-allowed-percent-amount' })
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
        annualLeave: val.annualLeave,
        sickLeave: val.sickLeave,
        maternityLeave: val.maternityLeave,
        businessTrip: val.businessTrip,
        unpaidLeave: val.unpaidLeave
      })
    }
  },
  { immediate: true }
)

const { mutate, isPending } = useUpdateOrganizationLeaveOptions()

const onSubmit = handleSubmit((values) => {
  if (!data.value || isPending.value) return
  mutate(values, {
    onSuccess: () => {
      toast.success(t('success.settings-updated'))
      refetch()
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || t('error-occurred')
      toast.error(message)
    }
  })
})
</script>

<template>
  <Card class="rounded-2xl border border-gray-200 bg-white shadow-none w-full overflow-hidden">
    <CardHeader class="border-b pt-4 mb-5 bg-gray-50">
      <CardTitle class="text-lg font-semibold -mb-1">{{ t('leave-options') }}</CardTitle>
      <p class="text-sm text-muted-foreground">{{ t('settings-leave-options-desc') }}</p>
    </CardHeader>
    <CardContent>
      <form class="grid grid-cols-1 md:grid-cols-2 gap-6" @submit.prevent="onSubmit">
        <FormField
          v-for="field in leaveFields"
          :key="field.name"
          v-slot="{ componentField }"
          :name="field.name"
        >
          <FormItem>
            <div class="flex items-center gap-1.5 mb-1">
              <FormLabel>{{ t(field.label) }} (%)</FormLabel>
            </div>
            <FormControl>
              <Input
                type="number"
                :placeholder="t(field.tooltip)"
                v-bind="componentField"
                :disabled="isPending"
                class="h-11"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>


        <div class="col-span-1 md:col-span-2 flex justify-end">
          <Button
            type="submit"
            :loading="isPending"
            :disabled="isPending"
            class="px-8 h-9 min-w-[120px]"
          >
            {{ t('save') }}
          </Button>
        </div>
      </form>
    </CardContent>
  </Card>
</template>
