<script setup lang="ts">
import { ref, provide } from 'vue'
import { useI18n } from 'vue-i18n'
import { vMaska } from 'maska/vue'
import { useRouter } from 'vue-router'
import { toTypedSchema } from '@vee-validate/zod'
import { cleanPhoneNumber } from '@/lib/utils'

import * as z from 'zod'

import { toast } from 'vue-sonner'
import { EyeOpenIcon, EyeClosedIcon } from '@radix-icons/vue'

import { Input } from '@/components/ui/input'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

import FormStep from './FormStep.vue'
import FormWizard from './FormWizard.vue'

const { t } = useI18n()

const validationSchema = [
  toTypedSchema(
    z.object({
      firstName: z.string({ message: 'validation.required-field' }),
      lastName: z.string({ message: 'validation.required-field' })
    })
  ),
  toTypedSchema(
    z
      .object({
        phoneNumber: z
          .string({ message: 'validation.required-field' })
          .length(19, { message: 'validation.phone-number-should-be-valid' }),
        password: z
          .string({ message: 'validation.required-field' })
          .min(8, { message: 'validation.password-min' })
          .refine((value) => /[A-Z]/.test(value), {
            message: 'validation.password-must-contain-one-uppercase'
          })
          .refine((value) => /[a-z]/.test(value), {
            message: 'validation.password-must-contain-one-lowercase'
          })
          .refine((value) => /\d/.test(value), {
            message: 'validation.password-must-contain-number'
          }),
        confirmPassword: z.string({ message: 'validation.required-field' })
      })
      .refine((data) => data.password === data.confirmPassword, {
        message: 'validation.passwords-must-match',
        path: ['confirmPassword']
      })
  )
]

const router = useRouter()
const isPasswordVisible = ref(false)
const isConfirmVisible = ref(false)

type RegisterUserPayload = {
  firstName: string
  lastName: string
  phoneNumber: string
  password: string
  confirmPassword: string
}

import axios from 'axios'
import { AxiosError } from 'axios'

const loading = ref(false)
provide('FORM_SUBMITTING', loading)
const onSubmit = async (formData: RegisterUserPayload) => {
  try {
    loading.value = true
    formData.phoneNumber = cleanPhoneNumber(formData.phoneNumber)
    const res = await axios.post('/api/auth/register', formData)
    if (res.status === 200) {
      const requestId = res.data.requestId
      router.push({ name: 'auth-otp-confirmation', params: { id: requestId } })
    }
  } catch (err) {
    if (err instanceof AxiosError) {
      toast.error(err.response?.data.error.message)
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <FormWizard :validation-schema="validationSchema" @submit="onSubmit">
    <FormStep>
      <FormField v-slot="{ componentField }" name="firstName">
        <FormItem class="mb-5">
          <FormLabel>{{ t('first-name') }}</FormLabel>
          <FormControl>
            <Input
              v-bind="componentField"
              type="text"
              :placeholder="t('enter-first-name')"
              autocomplete="family-name"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="lastName">
        <FormItem>
          <FormLabel>{{ t('last-name') }}</FormLabel>
          <FormControl>
            <Input
              v-bind="componentField"
              type="text"
              :placeholder="t('enter-last-name')"
              autocomplete="given-name"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </FormStep>

    <FormStep>
      <FormField v-slot="{ componentField }" name="phoneNumber">
        <FormItem class="mb-5">
          <FormLabel>{{ t('phone-number') }}</FormLabel>
          <FormControl>
            <Input
              v-bind="componentField"
              type="text"
              :placeholder="t('enter-phone-number')"
              autocomplete="tel"
              v-maska="'+998 (##) ###-##-##'"
              inputmode="tel"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="password">
        <FormItem class="mb-5">
          <FormLabel>{{ t('password') }}</FormLabel>
          <FormControl>
            <div class="relative w-full items-center">
              <Input
                class="pr-10"
                :type="isPasswordVisible ? 'text' : 'password'"
                v-bind="componentField"
                :placeholder="t('enter-password')"
                autocomplete="current-password"
              />
              <span
                class="absolute end-0 inset-y-0 flex items-center justify-center px-2 cursor-pointer"
                @click="isPasswordVisible = !isPasswordVisible"
              >
                <EyeClosedIcon v-if="!isPasswordVisible" class="size-5 text-muted-foreground" />
                <EyeOpenIcon v-else class="size-5 text-muted-foreground" />
              </span>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="confirmPassword">
        <FormItem>
          <FormLabel>{{ t('confirm-password') }}</FormLabel>
          <FormControl>
            <div class="relative w-full items-center">
              <Input
                class="pr-10"
                :type="isConfirmVisible ? 'text' : 'password'"
                v-bind="componentField"
                :placeholder="t('reenter-password')"
                autocomplete="off"
              />
              <span
                class="absolute end-0 inset-y-0 flex items-center justify-center px-2 cursor-pointer"
                @click="isConfirmVisible = !isConfirmVisible"
              >
                <EyeClosedIcon v-if="!isConfirmVisible" class="size-5 text-muted-foreground" />
                <EyeOpenIcon v-else class="size-5 text-muted-foreground" />
              </span>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </FormStep>
  </FormWizard>
</template>
