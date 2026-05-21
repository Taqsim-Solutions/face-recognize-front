<script setup lang="ts">
import { ref } from 'vue'
import { vMaska } from 'maska/vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useMutation } from '@tanstack/vue-query'
import { cn } from '@/lib/utils'
import { createEmployee } from '../api'

import type { CreateEmployeeModel } from '../types'
import type { Identifier } from '../../types'

import * as z from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { FieldArray } from 'vee-validate'
import { CheckIcon, CircleIcon, DotIcon, Cross1Icon } from '@radix-icons/vue'
import {
  Stepper,
  StepperDescription,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger
} from '@/components/ui/stepper'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'vue-sonner'
import { Textarea } from '@/components/ui/textarea'
import { AxiosError } from 'axios'

const { t } = useI18n()

const formSchema = [
  z.object({
    phoneNumber: z
      .string({ message: 'validation.required-field' })
      .length(19, { message: 'validation.phone-number-should-be-valid' })
      .default('+998'),
    inn: z
      .string({ message: 'validation.required-field' })
      .length(9, 'validation.tin-should-be-valid')
      .optional()
      .nullable(),
    passportSerial: z.string({ message: 'validation.required-field' }).regex(/^[A-Za-z]{2}$/, {
      message: 'validation.passport-serial-should-be-valid'
    }),
    passportNumber: z.string({ message: 'validation.required-field' }).regex(/^\d{7}$/, {
      message: 'validation.passport-number-should-be-valid'
    }),
    pinfl: z
      .string({ message: 'validation.required-field' })
      .length(18, 'validation.pinfl-should-be-valid'),
    accountCredit: z
      .string({ message: 'validation.required-field' })
      .length(23, 'validation.account-credit-should-be-valid'),
    mfo: z.string({ message: 'validation.required-field' })
  }),
  z.object({
    status: z.string({ message: 'validation.required-field' }),
    contractType: z.enum(['staff', 'gph'], { message: 'validation.required-field' }),
    salary: z.string({ message: 'validation.required-field' }),
    fte: z.coerce
      .number({ message: 'validation.fte-should-be-valid' })
      .min(0.1, { message: 'validation.fte-should-be-valid' })
      .max(3, { message: 'validation.fte-should-be-valid' }),
    percentAllowed: z
      .number({ message: 'validation.required-field' })
      .min(0, { message: 'validation.min-allowed-percent-amount' })
      .max(80, { message: 'validation.max-allowed-percent-amount' }),
    comment: z.string({ message: 'validation.required-field' }),
    cardNumbers: z.array(
      z.object({
        value: z
          .string({ message: 'Kamida 1-ta karta qoshilishi kerak' })
          .length(19, { message: 'validation.card-number-should-be-valid' })
      })
    )
  })
]

const stepIndex = ref(1)
const steps = [
  {
    step: 1,
    title: 'employee-create-step-one-title',
    description: 'employee-create-step-one-desc'
  },
  {
    step: 2,
    title: 'employee-create-step-two-title',
    description: 'employee-create-step-two-desc'
  }
]



type FormValues = {
  phoneNumber: string
  inn?: string | null
  passportSerial: string
  passportNumber: string
  pinfl: string
  accountCredit: string
  mfo: string
  cardNumbers: { value: string }[]
  status: 'active' | 'blocked' | 'leftTheCompany'
  contractType: 'staff' | 'gph'
  salary: string
  fte: number
  percentAllowed: number
  comment: string
}

const prepareValuesToSend = (values: FormValues): CreateEmployeeModel => {
  const identifiers = [
    {
      type: 'accountCredit',
      value: values.accountCredit.replace(/\s+/g, '')
    },
    {
      type: 'passportSerialNumber',
      value: `${values.passportSerial}${values.passportNumber}`
    },
    {
      type: 'phoneNumber',
      value: values.phoneNumber.replace(/\D+/g, '')
    },
    {
      type: 'pinfl',
      value: values.pinfl.replace(/\s+/g, '')
    },
    {
      type: 'mfo',
      value: values.mfo
    }
  ]

  if (values.inn) {
    identifiers.push({
      type: 'inn',
      value: values.inn
    })
  }

  return {
    percentAllowed: values.percentAllowed,
    fte: values.fte,
    salary: Number(values.salary),
    status: values.status,
    contractType: values.contractType,
    comment: values.comment.trim(),
    identifiers: identifiers as Identifier[],
    cardNumbers: values.cardNumbers?.length
      ? values.cardNumbers.map((el) => el.value.replace(/\s+/g, ''))
      : null
  }
}

type ErrorResponse = {
  data: {
    error: {
      code?: string
      errors?: string[]
      message?: string
    }
    isSuccess: boolean
    status: number
  }
}

const router = useRouter()
const { isPending, mutate } = useMutation({
  mutationFn: createEmployee,
  onSuccess: () => {
    toast.success(t('success.employee-added'))
    router.push({ name: 'employees-list' })
  },
  onError: (error: AxiosError) => {
    const errorRes = error.response as ErrorResponse

    if (errorRes?.data?.error?.errors) {
      toast.error(t(errorRes.data.error.errors[0]))
    } else {
      toast.error(t('error-occurred'))
    }
  }
})
const onSubmit = async (values: FormValues) => {
  const payload = prepareValuesToSend(values)
  mutate(payload)
}
</script>

<template>
  <div>
    <header class="flex items-center justify-between mb-6">
      <h2
        class="mt-10 scroll-m-20 text-3xl font-semibold tracking-tight transition-colors first:mt-0"
      >
        {{ t('new-employee-add') }}
      </h2>
    </header>

    <Form
      v-slot="{ meta, values, validate }"
      as=""
      keep-values
      :validation-schema="toTypedSchema(formSchema[stepIndex - 1])"
      :initialValues="{ cardNumbers: [{ value: '' }], contractType: 'staff' }"
    >
      <Stepper
        v-slot="{ isNextDisabled, isPrevDisabled, nextStep, prevStep }"
        v-model="stepIndex"
        class="block w-full border p-4 pt-6 rounded-lg max-w-[500px]"
      >
        <form
          @submit="
            (e) => {
              e.preventDefault()
              validate()

              if (stepIndex === steps.length && meta.valid) {
                onSubmit(values as FormValues)
              }
            }
          "
        >
          <div class="flex w-full flex-start gap-2">
            <StepperItem
              v-for="step in steps"
              :key="step.step"
              v-slot="{ state }"
              class="relative flex w-full flex-col items-center justify-center"
              :step="step.step"
            >
              <StepperSeparator
                v-if="step.step !== steps[steps.length - 1].step"
                class="absolute left-[calc(50%+20px)] right-[calc(-50%+10px)] top-5 block h-0.5 shrink-0 rounded-full bg-muted group-data-[state=completed]:bg-foreground"
              />

              <StepperTrigger as-child>
                <Button
                  :variant="state === 'completed' || state === 'active' ? 'default' : 'outline'"
                  size="icon"
                  class="rounded-full shrink-0"
                  :class="[
                    state === 'active' && 'ring-2 ring-ring ring-offset-2 ring-offset-background'
                  ]"
                  :disabled="state !== 'completed' && !meta.valid"
                >
                  <CheckIcon v-if="state === 'completed'" class="size-5" />
                  <CircleIcon v-if="state === 'active'" />
                  <DotIcon v-if="state === 'inactive'" />
                </Button>
              </StepperTrigger>

              <div class="mt-5 flex flex-col items-center text-center">
                <StepperTitle
                  :class="[state === 'active' && 'text-primary']"
                  class="text-sm font-semibold transition lg:text-base"
                >
                  {{ t(step.title) }}
                </StepperTitle>
                <StepperDescription
                  :class="[state === 'active' && 'text-primary']"
                  class="sr-only text-xs text-muted-foreground transition md:not-sr-only lg:text-sm"
                >
                  {{ t(step.description) }}
                </StepperDescription>
              </div>
            </StepperItem>
          </div>

          <div class="flex flex-col gap-4 mt-4">
            <template v-if="stepIndex === 1">
              <FormField v-slot="{ componentField }" name="phoneNumber">
                <FormItem>
                  <FormLabel>{{ t('phone-number') }}</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      v-bind="componentField"
                      v-maska="'+998 (##) ###-##-##'"
                      placeholder="+998 90 123 45 67"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="inn">
                <FormItem>
                  <FormLabel>{{ t('tin') }}</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      v-bind="componentField"
                      v-maska="'#########'"
                      placeholder="123456789"
                      class="tabular-nums"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <div class="grid grid-cols-2 items-start">
                <FormField v-slot="{ componentField }" name="passportSerial">
                  <FormItem>
                    <FormLabel>{{ t('passport-serial') }}</FormLabel>
                    <FormControl>
                      <Input
                        class="w-[55px] text-center"
                        type="text"
                        v-bind="componentField"
                        v-maska="{
                        mask: '@@',
                        tokens: {
                          '@': { pattern: /[a-zA-Z]/, transform: (char: string) => char.toUpperCase() }
                        }
                      }"
                        placeholder="AA"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>

                <FormField v-slot="{ componentField }" name="passportNumber">
                  <FormItem>
                    <FormLabel>{{ t('passport-number') }}</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        v-bind="componentField"
                        v-maska="'#######'"
                        placeholder="1234567"
                        class="tabular-nums"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
              </div>

              <FormField v-slot="{ componentField }" name="pinfl">
                <FormItem>
                  <FormLabel>{{ t('pinfl') }}</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      v-bind="componentField"
                      v-maska="'# ###### ### ### #'"
                      placeholder="3 162436 512 463 5"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="accountCredit">
                <FormItem>
                  <FormLabel>{{ t('account-credit') }}</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      v-bind="componentField"
                      v-maska="'##### ##### ##### #####'"
                      placeholder="12345 12345 12345 12345"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="mfo">
                <FormItem>
                  <FormLabel>{{ t('mfo') }}</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      v-bind="componentField"
                      v-maska="'#####'"
                      placeholder="12345"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>
            </template>

            <template v-if="stepIndex === 2">
              <FormField v-slot="{ componentField }" name="salary">
                <FormItem>
                  <FormLabel>{{ t('salary') }}</FormLabel>
                  <FormControl>
                    <Input
                      v-bind="componentField"
                      v-maska="'########'"
                      :placeholder="t('enter-salary')"
                      class="tabular-nums"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="fte">
                <FormItem>
                  <FormLabel>{{ t('fte') }}</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      inputmode="decimal"
                      step="0.05"
                      max="3"
                      min="0.1"
                      :placeholder="t('fte')"
                      v-bind="componentField"
                      :disabled="isPending"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="percentAllowed">
                <FormItem>
                  <FormLabel>{{ t('allowed-percent') }}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      max="80"
                      min="0"
                      :placeholder="t('enter-allowed-percent')"
                      v-bind="componentField"
                      :disabled="isPending"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField, value }" name="status">
                <FormItem>
                  <FormLabel> {{ t('status') }}</FormLabel>
                  <Select v-bind="componentField">
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          :class="cn(value ? '' : 'text-muted-foreground')"
                          :placeholder="t('select-status')"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="active"> {{ t('active') }} </SelectItem>
                        <SelectItem value="blocked"> {{ t('blocked') }} </SelectItem>
                        <SelectItem value="leftTheCompany">{{ t('left-the-company') }}</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField, value }" name="contractType">
                <FormItem>
                  <FormLabel> {{ t('contract-type') }}</FormLabel>
                  <Select v-bind="componentField">
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          :class="cn(value ? '' : 'text-muted-foreground')"
                          placeholder="Staff"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="staff"> {{ t('staff') }} </SelectItem>
                        <SelectItem value="gph"> {{ t('gph') }} </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField, value }" name="comment">
                <FormItem>
                  <FormLabel>{{ t('comment') }}</FormLabel>
                  <FormControl>
                    <div class="flex flex-col gap-2 items-end">
                      <Textarea
                        v-bind="componentField"
                        maxlength="200"
                        :placeholder="t('enter-comment')"
                      />
                      <span class="text-sm text-muted-foreground">
                        {{ value ? value.length : '0' }} / 200
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>
              <div>
                <FieldArray v-slot="{ fields, push, remove }" name="cardNumbers">
                  <div v-for="(field, index) in fields" :key="`cardNumbers-${field.key}`">
                    <FormField v-slot="{ componentField }" :name="`cardNumbers[${index}].value`">
                      <FormItem>
                        <FormLabel :class="cn(index !== 0 && 'sr-only')">{{
                          t('card-numbers')
                        }}</FormLabel>
                        <FormDescription></FormDescription>
                        <div class="relative flex items-center">
                          <FormControl>
                            <Input
                              type="text"
                              v-bind="componentField"
                              v-maska="'#### #### #### ####'"
                              :disabled="isPending"
                              class="tabular-nums"
                              placeholder="1234 1234 1234 1234"
                            />
                          </FormControl>
                          <button
                            type="button"
                            class="absolute py-2 pe-3 end-0 text-muted-foreground"
                            @click="remove(index)"
                          >
                            <Cross1Icon class="w-3" />
                          </button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    </FormField>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    class="text-xs mt-2"
                    @click="push({ value: '' })"
                  >
                    {{ t('add-field-for-card') }}
                  </Button>
                </FieldArray>
              </div>
            </template>
          </div>

          <div class="flex items-center justify-between mt-4">
            <Button :disabled="isPrevDisabled" variant="outline" size="sm" @click="prevStep()">
              {{ t('back') }}
            </Button>
            <div class="flex items-center gap-3">
              <Button
                v-if="stepIndex !== 2"
                :type="meta.valid ? 'button' : 'submit'"
                :disabled="isNextDisabled"
                size="sm"
                @click="meta.valid && nextStep()"
              >
                {{ t('next') }}
              </Button>
              <Button v-if="stepIndex === 2" size="sm" type="submit" :loading="isPending">
                {{ t('confirm') }}
              </Button>
            </div>
          </div>
        </form>
      </Stepper>
    </Form>
  </div>
</template>
