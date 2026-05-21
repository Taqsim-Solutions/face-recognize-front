<!-- CreateEmployeeModal.vue -->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { createEmployee } from '../../create/api'

import type { CreateEmployeeModel } from '../../create/types'
import type { Identifier } from '../../types'

import { Stepper } from '@/components/ui/stepper'
import { Button } from '@/components/ui/button'
import { toast } from 'vue-sonner'
import { AxiosError } from 'axios'
import {
  Dialog,
  DialogScrollContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog'

import CreateEmployeeIdentifiersStep from './CreateEmployeeIdentifiersStep.vue'
import CreateEmployeeInfoStep from './CreateEmployeeInfoStep.vue'
import type { FormValues, Step1FormValues, Step2FormValues } from './createEmployeeSchemas'

const { t } = useI18n()
const queryClient = useQueryClient()

// ============================================
// DEFAULT VALUES FACTORY FUNCTIONS
// ============================================
const createDefaultStep1Values = (): Step1FormValues => ({
  phoneNumber: '',
  inn: '',
  passportSerial: '',
  passportNumber: '',
  pinfl: '',
  accountCredit: '',
  mfo: ''
})

const createDefaultStep2Values = (): Step2FormValues => ({
  status: 'active',
  salary: '',
  percentAllowed: null,
  comment: '',
  fte: 1,
  contractType: 'staff',
  cardNumbers: [{ value: '' }]
})

// ============================================
// STATE MANAGEMENT
// ============================================
const isOpen = ref(false)
const stepIndex = ref(1)

const step1Values = ref<Step1FormValues>(createDefaultStep1Values())
const step2Values = ref<Step2FormValues>(createDefaultStep2Values())

const step1Ref = ref<InstanceType<typeof CreateEmployeeIdentifiersStep> | null>(null)
const step2Ref = ref<InstanceType<typeof CreateEmployeeInfoStep> | null>(null)

// ============================================
// COMPUTED PROPERTIES
// ============================================
const steps = computed(() => [
  {
    step: 1,
    title: t('employee-idenfication'),
    active: stepIndex.value === 1,
    completed: stepIndex.value > 1
  },
  {
    step: 2,
    title: t('employee-info'),
    active: stepIndex.value === 2,
    completed: stepIndex.value > 2
  }
])

const isFirstStep = computed(() => stepIndex.value === 1)
const isLastStep = computed(() => stepIndex.value === steps.value.length)

// ============================================
// DATA PREPARATION UTILITIES
// ============================================
const prepareValuesToSend = (values: FormValues): CreateEmployeeModel => {
  if (values.percentAllowed == null) {
    throw new Error('percentAllowed is required')
  }

  // Format phone number
  let phone = String(values.phoneNumber ?? '').replace(/\D+/g, '')
  phone = '998' + phone

  // Build identifiers array
  const identifiers: Identifier[] = [
    { type: 'accountCredit', value: String(values.accountCredit ?? '').replace(/\s+/g, '') },
    {
      type: 'passportSerialNumber',
      value: `${String(values.passportSerial ?? '')}${String(values.passportNumber ?? '')}`
    },
    { type: 'phoneNumber', value: phone },
    { type: 'pinfl', value: String(values.pinfl ?? '').replace(/\s+/g, '') },
    { type: 'mfo', value: String(values.mfo ?? '').replace(/\s+/g, '') }
  ]

  // Add INN if provided
  if (values.inn) {
    identifiers.push({ type: 'inn', value: String(values.inn).replace(/\s+/g, '') })
  }

  return {
    percentAllowed: Number(values.percentAllowed),
    salary: Number(values.salary),
    status: values.status,
    comment: String(values.comment ?? '').trim(),
    fte: Number(values.fte ?? 1),
    identifiers,
    contractType: values.contractType,
    cardNumbers: values.cardNumbers?.length
      ? values.cardNumbers.map((c) => String(c.value).replace(/\s+/g, ''))
      : null
  }
}

type ErrorResponse = {
  data?: {
    error?: {
      code?: string
      errors?: string[]
      message?: string
    }
    isSuccess?: boolean
    status?: number
  }
}

// ============================================
// API MUTATION
// ============================================
const { isPending, mutate } = useMutation({
  mutationFn: createEmployee,
  onSuccess: () => {
    toast.success(t('success.employee-added'))
    handleClose()
    queryClient.invalidateQueries({ queryKey: ['employees'] })
  },
  onError: (error: AxiosError) => {
    const errorRes = (error.response as ErrorResponse) ?? {}
    const firstMsg =
      errorRes?.data?.error?.errors?.[0] || errorRes?.data?.error?.message || 'error-occurred'
    toast.error(t(firstMsg))
  }
})

// ============================================
// EVENT HANDLERS
// ============================================
const handleContinue = async () => {
  if (!step1Ref.value) return

  const isValid = await step1Ref.value.validateStep()
  if (!isValid) return

  stepIndex.value += 1
}

const handleBack = () => {
  stepIndex.value = Math.max(1, stepIndex.value - 1)
}

const handleSave = async () => {
  if (!step2Ref.value) return

  const isValid = await step2Ref.value.validateStep()
  if (!isValid) return

  const mergedValues: FormValues = {
    ...step1Values.value,
    ...step2Values.value
  }

  onSubmit(mergedValues)
}

const onSubmit = (values: FormValues) => {
  try {
    const payload = prepareValuesToSend(values)
    mutate(payload)
  } catch (err) {
    console.error('prepareValuesToSend error', err)
    toast.error(t('error-occurred'))
  }
}

const handleClose = () => {
  isOpen.value = false
}

watch(isOpen, (newVal) => {
  if (!newVal) {
    stepIndex.value = 1
    step1Values.value = createDefaultStep1Values()
    step2Values.value = createDefaultStep2Values()
  }
})
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogTrigger as-child>
      <Button
        variant="outline"
        class="bg-primary flex gap-1 border-none text-white rounded-lg h-9 hover:bg-primary hover:text-white hover:opacity-85 transition-all"
        type="button"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 16 16">
          <path
            d="M7.99992 3.33325V12.6666M3.33325 7.99992H12.6666"
            stroke="white"
            stroke-width="1.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        {{ t('new-employee-add') }}
      </Button>
    </DialogTrigger>

    <DialogScrollContent
      class="sm:max-w-[600px] px-0 pt-0 max-h-[85vh] flex flex-col gap-0 overflow-hidden"
    >
      <!-- Header -->
      <DialogHeader class="bg-gray-50 p-5 border-b border-border">
        <DialogTitle>{{ t('new-employee-add') }}</DialogTitle>
        <DialogDescription class="sr-only">{{ t('new-employee-add') }}</DialogDescription>
      </DialogHeader>

      <!-- Close Button -->
      <DialogClose as-child>
        <button
          @click="handleClose"
          class="absolute right-3 top-3 rounded-md hover:opacity-100 transition bg-white z-10"
          aria-label="Close"
          type="button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
          >
            <rect x="0.5" y="0.5" width="31" height="31" rx="7.5" fill="white" />
            <rect x="0.5" y="0.5" width="31" height="31" rx="7.5" stroke="#E0E6F0" />
            <path
              d="M20 12L12 20M12 12L20 20"
              stroke="#596881"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </DialogClose>

      <!-- Stepper Content -->
      <Stepper v-model="stepIndex" class="block w-full px-5 pt-5 pb-1 overflow-y-auto flex-1">
        <div class="flex flex-col h-full">
          <!-- Step Indicator -->
          <div class="flex w-full items-center justify-between gap-4 mb-6">
            <div v-for="step in steps" :key="step.step" class="flex-1">
              <div class="flex items-center gap-2">
                <div
                  :class="[
                    'flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all shrink-0',
                    step.active || step.completed
                      ? 'bg-[#2aa579] border-[#2aa579]'
                      : 'bg-[#E5E9F0] border-[#E5E9F0]'
                  ]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="3"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span
                  :class="[
                    'text-sm md:text-base font-medium whitespace-nowrap',
                    step.active ? 'text-[#4C5B72]' : 'text-[#A0A8B5]'
                  ]"
                >
                  {{ step.title }}
                </span>
              </div>
              <div
                :class="[
                  'h-1.5 rounded-full mt-3 transition-all',
                  step.active || step.completed ? 'bg-[#2aa579]' : 'bg-[#E7EBF3]'
                ]"
              ></div>
            </div>
          </div>

          <!-- Step Content -->
          <div class="flex-1 min-h-0">
            <CreateEmployeeIdentifiersStep
              v-if="stepIndex === 1"
              ref="step1Ref"
              v-model="step1Values"
              key="step1"
            />
            <CreateEmployeeInfoStep
              v-else-if="stepIndex === 2"
              ref="step2Ref"
              v-model="step2Values"
              key="step2"
            />
          </div>

          <!-- Action Buttons -->
          <div :class="['flex gap-3 mt-7', isFirstStep ? 'justify-end' : 'justify-between']">
            <!-- Back Button (Step 2 only) -->
            <Button
              v-if="!isFirstStep"
              type="button"
              variant="outline"
              @click="handleBack"
              :disabled="isPending"
              class="px-6 h-11 border border-[#DF1C41] text-[#DF1C41] hover:bg-[#DF1C41] hover:text-white transition-all rounded-lg font-medium"
            >
              {{ t('back') }}
            </Button>

            <!-- Continue Button (Step 1 only) - Full Width -->
            <Button
              v-if="isFirstStep"
              type="button"
              :disabled="isPending"
              class="w-full h-11 bg-[#29A679] hover:bg-[#239367] text-white rounded-lg flex items-center justify-center gap-2 font-medium transition-all"
              @click="handleContinue"
            >
              {{ t('continue') }}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M6 12L10 8L6 4"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </Button>

            <!-- Create Button (Step 2 only) -->
            <Button
              v-if="isLastStep"
              type="button"
              :disabled="isPending"
              :loading="isPending"
              class="flex-1 h-11 bg-primary hover:bg-primary hover:opacity-90 border-none text-white rounded-lg font-medium transition-all"
              @click="handleSave"
            >
              {{ t('create-employee') }}
            </Button>
          </div>
        </div>
      </Stepper>
    </DialogScrollContent>
  </Dialog>
</template>
