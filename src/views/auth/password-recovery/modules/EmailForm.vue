<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'

import axios from 'axios'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

const { t } = useI18n()

const emit = defineEmits<{
  (e: 'otpRequested', email: string): void
}>()

const loading = ref(false)

const formSchema = z.object({
  email: z
    .string({ message: 'validation.required-field' })
    .min(1, { message: 'validation.required-field' })
    .email({ message: 'validation.email-should-be-valid' })
})

const form = useForm({
  validationSchema: toTypedSchema(formSchema),
  initialValues: {
    email: ''
  }
})

const requestOtp = async (email: string) => {
  try {
    loading.value = true
    await axios.post(`/api/authentication/recovery/${email}`)
    emit('otpRequested', email)
    return true
  } catch (err) {
    if (axios.isAxiosError(err)) {
      if ((err.status && err.status > 499) || (err.status && err.status === 405)) {
        toast.error(t('error.try-later'))
      } else {
        const errorMessage = err.response?.data?.message || err.response?.data?.error?.message
        toast.error(errorMessage || t('error-occurred'))
      }
    }
    return false
  } finally {
    loading.value = false
  }
}

const onSubmit = form.handleSubmit(async (values) => {
  try {
    const success = await requestOtp(values.email)
    if (!success) {
      toast.error(t('error.invalid-email'))
    }
  } catch (err) {
    if (axios.isAxiosError(err)) {
      if ((err.status && err.status > 499) || (err.status && err.status === 405)) {
        toast.error(t('error.try-later'))
      } else {
        const errorMessage = err.response?.data?.message || err.response?.data?.error?.message
        toast.error(errorMessage || t('error-occurred'))
      }
    }
  }
})
</script>

<template>
  <form @submit="onSubmit" class="space-y-6">
    <FormField v-slot="{ componentField }" name="email">
      <FormItem>
        <FormLabel class="text-grayx2 text-base">{{ t('email') }}</FormLabel>
        <FormControl>
          <div class="relative w-full items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#8796AF"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="absolute top-3 left-3"
            >
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            <Input
              v-bind="componentField"
              type="email"
              :placeholder="t('email_placeholder')"
              class="h-10 border border-border pl-10"
            />
          </div>
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <Button
      type="submit"
      size="default"
      :loading="loading"
      class="bg-[#FF7A2E] hover:bg-[#FF7A2E] text-base hover:opacity-90 transition-all w-full mt-8 h-10 rounded-lg"
    >
      {{ t('auth.send-otp') }}
    </Button>
  </form>
</template>
