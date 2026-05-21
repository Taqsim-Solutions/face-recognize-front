<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { toTypedSchema } from '@vee-validate/zod'
import { vMaska } from 'maska/vue'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { FormContext } from 'vee-validate'

import { step1Schema, type Step1FormValues } from './createEmployeeSchemas'

const { t } = useI18n()

const props = defineProps<{
  modelValue: Step1FormValues
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Step1FormValues): void
}>()

const formRef = ref<FormContext<Step1FormValues> | null>(null)
const isSyncingFromParent = ref(false)

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value))

const initialValues = computed<Step1FormValues>(
  () =>
    Object.assign(
      {
        phoneNumber: '',
        inn: '',
        passportSerial: '',
        passportNumber: '',
        pinfl: '',
        accountCredit: '',
        mfo: ''
      },
      clone(props.modelValue)
    ) as Step1FormValues
)

const syncFromParent = () => {
  if (!formRef.value) return
  isSyncingFromParent.value = true
  formRef.value.resetForm({
    values: clone(initialValues.value)
  })
  nextTick(() => {
    isSyncingFromParent.value = false
  })
}

watch(
  () => props.modelValue,
  () => {
    syncFromParent()
  },
  { deep: true }
)

watch(
  () => formRef.value?.values,
  (newVal) => {
    if (!newVal || isSyncingFromParent.value) return
    emit('update:modelValue', clone(newVal as Step1FormValues))
  },
  { deep: true }
)

onMounted(() => {
  syncFromParent()
})

const validateStep = async () => {
  if (!formRef.value) return false
  const result = await formRef.value.validate()
  if (!result.valid) {
    return false
  }

  emit('update:modelValue', clone(formRef.value.values as Step1FormValues))
  return true
}

defineExpose({ validateStep })
</script>

<template>
  <Form
    ref="formRef"
    :initial-values="initialValues"
    :validation-schema="toTypedSchema(step1Schema)"
    :validate-on-blur="true"
    :validate-on-change="true"
    :validate-on-input="false"
    v-slot="{}"
  >
    <div class="flex flex-col gap-5">
      <FormField v-slot="{ componentField: phoneField, errorMessage }" name="phoneNumber">
        <FormItem>
          <FormLabel class="text-base font-medium text-gray-700">{{ t('phone-number') }}</FormLabel>
          <FormControl>
            <div class="relative flex w-full">
              <div
                class="h-10 border border-gray-300 px-3 w-[100px] flex items-center gap-2 rounded-l-lg border-r-0 text-sm bg-gray-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                >
                  <g clip-path="url(#clip0_205_2490)">
                    <path
                      d="M0.424969 6.26095C0.149273 7.12467 -3.515e-05 8.04482 6.207e-09 8.99998C-3.515e-05 9.95517 0.149309 10.8754 0.425004 11.7391L9 12.1305L17.575 11.7392C17.8507 10.8754 18 9.95517 18 9.00005C18 8.04485 17.8507 7.12467 17.575 6.26092L9 5.86963L0.424969 6.26095Z"
                      fill="#F0F0F0"
                    />
                    <path
                      d="M17.575 6.26092L8.99998 5.86963L0.424951 6.26092C0.343248 6.517 0.272901 6.7781 0.213943 7.04353H17.7859C17.727 6.77807 17.6567 6.51693 17.575 6.26092Z"
                      fill="#D80027"
                    />
                    <path
                      d="M0.21402 10.9565C0.272906 11.222 0.343254 11.483 0.424957 11.7391L0.425801 11.7392L8.99992 12.1304L17.5749 11.7392C17.6566 11.4831 17.727 11.222 17.7859 10.9565H0.21402Z"
                      fill="#D80027"
                    />
                    <path
                      d="M8.99996 18C13.0154 18 16.416 15.3702 17.575 11.7391H0.425003C1.58393 15.3702 4.98466 18 8.99996 18Z"
                      fill="#6DA544"
                    />
                    <path
                      d="M9 3.52479e-10C4.98466 3.51566e-05 1.584 2.62983 0.425003 6.26087L17.575 6.26091C16.4161 2.62979 13.0154 -3.51559e-05 9 3.52479e-10Z"
                      fill="#338AF3"
                    />
                    <path
                      d="M4.11277 3.7175C4.11277 2.87456 4.70519 2.17038 5.49631 1.99762C5.37474 1.97104 5.24857 1.95667 5.11898 1.95667C4.14649 1.95667 3.35811 2.74501 3.35811 3.71754C3.35811 4.69006 4.14642 5.47841 5.11898 5.47841C5.24857 5.47841 5.37471 5.46399 5.49631 5.43745C4.70523 5.26462 4.11277 4.56044 4.11277 3.7175Z"
                      fill="#F0F0F0"
                    />
                    <path
                      d="M6.53701 4.51782L6.65619 4.88468H7.04193L6.72988 5.11144L6.84906 5.47829L6.53701 5.25157L6.2249 5.47829L6.34411 5.11144L6.03203 4.88468H6.41776L6.53701 4.51782Z"
                      fill="#F0F0F0"
                    />
                    <path
                      d="M7.76822 4.51782L7.88743 4.88468H8.27317L7.96109 5.11144L8.0803 5.47829L7.76822 5.25157L7.45614 5.47829L7.57535 5.11144L7.26331 4.88468H7.649L7.76822 4.51782Z"
                      fill="#F0F0F0"
                    />
                    <path
                      d="M8.99934 4.51782L9.11852 4.88468H9.50429L9.19221 5.11144L9.31139 5.47829L8.99934 5.25157L8.68722 5.47829L8.80647 5.11144L8.49435 4.88468H8.88012L8.99934 4.51782Z"
                      fill="#F0F0F0"
                    />
                    <path
                      d="M10.2306 4.51782L10.3498 4.88468H10.7355L10.4235 5.11144L10.5427 5.47829L10.2306 5.25157L9.9185 5.47829L10.0377 5.11144L9.72563 4.88468H10.1114L10.2306 4.51782Z"
                      fill="#F0F0F0"
                    />
                    <path
                      d="M11.4618 4.51782L11.581 4.88468H11.9668L11.6547 5.11144L11.7739 5.47829L11.4618 5.25157L11.1497 5.47829L11.269 5.11144L10.9569 4.88468H11.3426L11.4618 4.51782Z"
                      fill="#F0F0F0"
                    />
                    <path
                      d="M7.76822 3.23718L7.88743 3.604H8.27317L7.96109 3.8308L8.0803 4.19762L7.76822 3.97089L7.45614 4.19762L7.57535 3.8308L7.26331 3.604H7.649L7.76822 3.23718Z"
                      fill="#F0F0F0"
                    />
                    <path
                      d="M8.99934 3.23718L9.11852 3.604H9.50429L9.19221 3.8308L9.31139 4.19762L8.99934 3.97089L8.68722 4.19762L8.80647 3.8308L8.49435 3.604H8.88012L8.99934 3.23718Z"
                      fill="#F0F0F0"
                    />
                    <path
                      d="M10.2306 3.23718L10.3498 3.604H10.7355L10.4235 3.8308L10.5427 4.19762L10.2306 3.97089L9.9185 4.19762L10.0377 3.60468L9.72563 3.604H10.1114L10.2306 3.23718Z"
                      fill="#F0F0F0"
                    />
                    <path
                      d="M11.4618 3.23718L11.581 3.604H11.9668L11.6547 3.8308L11.7739 4.19762L11.4618 3.97089L11.1497 4.19762L11.269 3.8308L10.9569 4.88468H11.3426L11.4618 3.23718Z"
                      fill="#F0F0F0"
                    />
                    <path
                      d="M8.99934 1.95654L9.11852 2.32343H9.50429L9.19221 2.55016L9.31139 2.91705L8.99934 2.69032L8.68722 2.91705L8.80647 2.55016L8.49435 2.32343H8.88012L8.99934 1.95654Z"
                      fill="#F0F0F0"
                    />
                    <path
                      d="M10.2306 1.95654L10.3498 2.32343H10.7355L10.4235 2.55016L10.5427 2.91705L10.2306 2.69032L9.9185 2.91705L10.0377 2.55016L9.72563 2.32343H10.1114L10.2306 1.95654Z"
                      fill="#F0F0F0"
                    />
                    <path
                      d="M11.4618 1.95654L11.581 2.32343H11.9668L11.6547 2.55016L11.7739 2.91705L11.4618 2.69032L11.1497 2.91705L11.269 2.55016L10.9569 2.32343H11.3426L11.4618 1.95654Z"
                      fill="#F0F0F0"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_205_2490">
                      <rect width="18" height="18" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
                <span>+998</span>
              </div>
              <Input
                v-bind="phoneField"
                type="text"
                inputmode="tel"
                autocomplete="tel"
                placeholder="901234567"
                class="h-10 border border-gray-300 rounded-r-lg rounded-l-none pr-10"
                maxlength="9"
                @input="(e: InputEvent) => {
                  const input = e.target as HTMLInputElement
                  const value = input.value.replace(/\D/g, '').slice(0, 9)
                  input.value = value
                  phoneField.onChange?.(value)
                }"
              />
              <TooltipProvider v-if="errorMessage" :delay-duration="0">
                <Tooltip>
                  <TooltipTrigger as-child>
                    <div
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 cursor-help"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        class="h-5 w-5"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.677-1.36 3.442 0l6.518 11.606c.75 1.337-.213 2.995-1.721 2.995H3.46c-1.508 0-2.47-1.658-1.72-2.995L8.257 3.1zm2.493 9.9a1 1 0 11-1.5 0 1 1 0 011.5 0zm-.25-5.25a.75.75 0 00-1.5 0v2.5a.75.75 0 001.5 0v-2.5z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent class="bg-gray-900 text-white">
                    {{ t(errorMessage) }}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </FormControl>
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField: innField, errorMessage }" name="inn">
        <FormItem>
          <FormLabel class="text-base font-medium text-gray-700">{{ t('tin') }}</FormLabel>
          <FormControl>
            <div class="relative">
              <Input
                v-bind="innField"
                v-maska="'#########'"
                placeholder="123456789"
                maxlength="9"
                class="tabular-nums h-10 px-4 pr-10 border border-gray-300 rounded-lg"
                @input="(e: InputEvent) => {
                  const input = e.target as HTMLInputElement
                  if (input.value.length > 9) {
                    input.value = input.value.slice(0, 9)
                    innField.onChange?.(input.value)
                  }
                }"
              />
              <TooltipProvider v-if="errorMessage" :delay-duration="0">
                <Tooltip>
                  <TooltipTrigger as-child>
                    <div
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 cursor-help"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        class="h-5 w-5"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.677-1.36 3.442 0l6.518 11.606c.75 1.337-.213 2.995-1.721 2.995H3.46c-1.508 0-2.47-1.658-1.72-2.995L8.257 3.1zm2.493 9.9a1 1 0 11-1.5 0 1 1 0 011.5 0zm-.25-5.25a.75.75 0 00-1.5 0v2.5a.75.75 0 001.5 0v-2.5z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent class="bg-gray-900 text-white">
                    {{ t(errorMessage) }}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </FormControl>
        </FormItem>
      </FormField>

      <div>
        <p class="text-base mb-2.5 font-medium text-gray-700">{{ t('passport-number') }}</p>
        <div class="flex items-start gap-0">
          <FormField
            v-slot="{ componentField: serialField, errorMessage: serialError }"
            name="passportSerial"
          >
            <FormItem class="w-20">
              <FormControl>
                <div class="relative">
                  <Input
                    v-bind="serialField"
                    type="text"
                    maxlength="2"
                    placeholder="AA"
                    class="tabular-nums h-10 px-4 border border-gray-300 rounded-l-lg rounded-r-none uppercase"
                    @input="(e: InputEvent) => {
                    const val = String((e.target as HTMLInputElement).value ?? '')
                      .replace(/[^A-Za-z]/g, '')
                      .slice(0, 2) as string
                    ;(e.target as HTMLInputElement).value = val
                    serialField.onChange?.(val)
                  }"
                  />
                  <TooltipProvider v-if="serialError" :delay-duration="0">
                    <Tooltip>
                      <TooltipTrigger as-child>
                        <div
                          class="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 cursor-help"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            class="h-5 w-5"
                          >
                            <path
                              fill-rule="evenodd"
                              d="M8.257 3.099c.765-1.36 2.677-1.36 3.442 0l6.518 11.606c.75 1.337-.213 2.995-1.721 2.995H3.46c-1.508 0-2.47-1.658-1.72-2.995L8.257 3.1zm2.493 9.9a1 1 0 11-1.5 0 1 1 0 011.5 0zm-.25-5.25a.75.75 0 00-1.5 0v2.5a.75.75 0 001.5 0v-2.5z"
                              clip-rule="evenodd"
                            />
                          </svg>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent class="bg-gray-900 text-white">
                        {{ t(serialError) }}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </FormControl>
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField: numberField, errorMessage }" name="passportNumber">
            <FormItem class="flex-1">
              <FormControl>
                <div class="relative">
                  <Input
                    v-bind="numberField"
                    v-maska="'#######'"
                    placeholder="1234567"
                    maxlength="7"
                    class="tabular-nums h-10 px-4 border border-gray-300 border-l-0 rounded-r-lg rounded-l-none"
                    @input="(e: InputEvent) => {
                      const input = e.target as HTMLInputElement
                      if (input.value.length > 7) {
                        input.value = input.value.slice(0, 7)
                        numberField.onChange?.(input.value)
                      }
                    }"
                  />
                  <TooltipProvider v-if="errorMessage" :delay-duration="0">
                    <Tooltip>
                      <TooltipTrigger as-child>
                        <div
                          class="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 cursor-help"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            class="h-5 w-5"
                          >
                            <path
                              fill-rule="evenodd"
                              d="M8.257 3.099c.765-1.36 2.677-1.36 3.442 0l6.518 11.606c.75 1.337-.213 2.995-1.721 2.995H3.46c-1.508 0-2.47-1.658-1.72-2.995L8.257 3.1zm2.493 9.9a1 1 0 11-1.5 0 1 1 0 011.5 0zm-.25-5.25a.75.75 0 00-1.5 0v2.5a.75.75 0 001.5 0v-2.5z"
                              clip-rule="evenodd"
                            />
                          </svg>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent class="bg-gray-900 text-white">
                        {{ t(errorMessage) }}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </FormControl>
            </FormItem>
          </FormField>
        </div>
      </div>

      <FormField v-slot="{ componentField: pinflField, errorMessage }" name="pinfl">
        <FormItem>
          <FormLabel class="text-base font-medium text-gray-700">{{ t('pinfl') }}</FormLabel>
          <FormControl>
            <div class="relative">
              <Input
                v-bind="pinflField"
                placeholder="00000000000000"
                maxlength="14"
                class="tabular-nums h-10 px-4 border border-gray-300 rounded-lg"
                :class="{ 'pr-10': errorMessage }"
                @input="(e: InputEvent) => {
                  const input = e.target as HTMLInputElement
                  if (input.value.length > 14) {
                    input.value = input.value.slice(0, 14)
                    pinflField.onChange?.(input.value)
                  }
                }"
              />
              <TooltipProvider v-if="errorMessage" :delay-duration="0">
                <Tooltip>
                  <TooltipTrigger as-child>
                    <div
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 cursor-help"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        class="h-5 w-5"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.677-1.36 3.442 0l6.518 11.606c.75 1.337-.213 2.995-1.721 2.995H3.46c-1.508 0-2.47-1.658-1.72-2.995L8.257 3.1zm2.493 9.9a1 1 0 11-1.5 0 1 1 0 011.5 0zm-.25-5.25a.75.75 0 00-1.5 0v2.5a.75.75 0 001.5 0v-2.5z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent class="bg-gray-900 text-white">
                    {{ t(errorMessage) }}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </FormControl>
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField: accountField, errorMessage }" name="accountCredit">
        <FormItem>
          <FormLabel class="text-base font-medium text-gray-700">{{
            t('account-credit')
          }}</FormLabel>
          <FormControl>
            <div class="relative">
              <Input
                v-bind="accountField"
                placeholder="00000000000000000000"
                maxlength="20"
                class="tabular-nums h-10 px-4 border border-gray-300 rounded-lg"
                :class="{ 'pr-10': errorMessage }"
                @input="(e: InputEvent) => {
                  const input = e.target as HTMLInputElement
                  const value = input.value.replace(/\D/g, '').slice(0, 20)
                  input.value = value
                  accountField.onChange?.(value)
                }"
              />
              <TooltipProvider v-if="errorMessage" :delay-duration="0">
                <Tooltip>
                  <TooltipTrigger as-child>
                    <div
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 cursor-help"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        class="h-5 w-5"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.677-1.36 3.442 0l6.518 11.606c.75 1.337-.213 2.995-1.721 2.995H3.46c-1.508 0-2.47-1.658-1.72-2.995L8.257 3.1zm2.493 9.9a1 1 0 11-1.5 0 1 1 0 011.5 0zm-.25-5.25a.75.75 0 00-1.5 0v2.5a.75.75 0 001.5 0v-2.5z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent class="bg-gray-900 text-white">
                    {{ t(errorMessage) }}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </FormControl>
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField: mfoField, errorMessage }" name="mfo">
        <FormItem>
          <FormLabel class="text-sm font-medium text-gray-700">{{ t('mfo') }}</FormLabel>
          <FormControl>
            <div class="relative">
              <Input
                v-bind="mfoField"
                placeholder="12345"
                maxlength="5"
                class="tabular-nums h-10 px-4 border border-gray-300 rounded-lg"
                :class="{ 'pr-10': errorMessage }"
                @input="(e: InputEvent) => {
                  const input = e.target as HTMLInputElement
                  if (input.value.length > 5) {
                    input.value = input.value.slice(0, 5)
                    mfoField.onChange?.(input.value)
                  }
                }"
              />
              <TooltipProvider v-if="errorMessage" :delay-duration="0">
                <Tooltip>
                  <TooltipTrigger as-child>
                    <div
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 cursor-help"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        class="h-5 w-5"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.677-1.36 3.442 0l6.518 11.606c.75 1.337-.213 2.995-1.721 2.995H3.46c-1.508 0-2.47-1.658-1.72-2.995L8.257 3.1zm2.493 9.9a1 1 0 11-1.5 0 1 1 0 011.5 0zm-.25-5.25a.75.75 0 00-1.5 0v2.5a.75.75 0 001.5 0v-2.5z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent class="bg-gray-900 text-white">
                    {{ t(errorMessage) }}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </FormControl>
        </FormItem>
      </FormField>
    </div>
  </Form>
</template>
