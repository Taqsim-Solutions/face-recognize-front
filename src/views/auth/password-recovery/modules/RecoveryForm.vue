<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'

import axios from 'axios'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import {
  PinInput,
  PinInputGroup,
  PinInputInput,
  PinInputSeparator
} from '@/components/ui/pin-input'

const props = defineProps<{
  email: string
}>()

const { t } = useI18n()
const router = useRouter()

const loading = ref(false)
const resendDisabled = ref(false)
const resendTimer = ref(60)

const formSchema = z
  .object({
    pin: z.array(z.coerce.string()).length(6, { message: t('validation.invalid-otp') }),
    password: z
      .string()
      .min(8, { message: t('validation.password-min-length') })
      .max(50),
    confirmPassword: z.string()
  })
  .refine(
    (values) => {
      return values.password === values.confirmPassword
    },
    {
      message: t('validation.passwords-must-match'),
      path: ['confirmPassword']
    }
  )

const form = useForm({
  validationSchema: toTypedSchema(formSchema),
  initialValues: {
    pin: [],
    password: '',
    confirmPassword: ''
  }
})

const startResendTimer = () => {
  resendDisabled.value = true
  resendTimer.value = 60
  const timer = setInterval(() => {
    resendTimer.value--
    if (resendTimer.value <= 0) {
      resendDisabled.value = false
      clearInterval(timer)
    }
  }, 1000)
}




const requestOtp = async () => {
  try {
    loading.value = true
    await axios.post(`/api/authentication/recovery/${encodeURIComponent(props.email)}`)
    startResendTimer()
    return true
  } catch (err) {
    if (axios.isAxiosError(err)) {
      if ((err.status && err.status > 499) || (err.status && err.status === 405)) {
        toast.error(t('error.try-later'))
      } else {
        toast.error(err.response ? err.response.data.error.message : t('error-occurred'))
      }
    }
    return false
  } finally {
    loading.value = false
  }
}

const resendOtp = async () => {
  await requestOtp()
}

const onSubmit = form.handleSubmit(async (values) => {
  try {
    loading.value = true

    // Validate OTP and password fields
    if (!values.pin || values.pin.length !== 6) {
      toast.error(t('validation.invalid-otp'))
      return
    }

    if (!values.password || values.password.length < 8) {
      toast.error(t('validation.password-min-length'))
      return
    }

    if (values.password !== values.confirmPassword) {
      toast.error(t('validation.passwords-must-match'))
      return
    }

    const payload = {
      otp: Number(values.pin.join('')),
      email: props.email,
      newPassword: values.password
    }

    const { status } = await axios.put('/api/authentication/recovery-confirmation', payload)
    if (status === 200) {
      toast.success(t('auth.password-updated'))
      router.push({ name: 'login' })
    }
  } catch (err) {
    if (axios.isAxiosError(err)) {
      if ((err.status && err.status > 499) || (err.status && err.status === 405)) {
        toast.error(t('error.try-later'))
      } else {
        const errorMessage = err.response?.data?.error?.message || err.response?.data?.message
        toast.error(errorMessage || t('error-occurred'))
      }
    }
  } finally {
    loading.value = false
  }
})

onMounted(() => {
  startResendTimer()
})
</script>

<template>
  <form @submit="onSubmit" class="space-y-6">
    <!-- OTP Block -->
    <FormField v-slot="{ componentField, value }" name="pin">
      <FormItem>
        <FormLabel class="text-grayx2 text-base">{{ t('auth.otp-code') }}</FormLabel>
        <FormControl>
          <PinInput
            id="pin-input"
            :model-value="value"
            placeholder="○"
            class="flex items-center font-bold"
            otp
            type="number"
            :name="componentField.name"
            @update:model-value="
              (arrStr) => {
                componentField.onChange(arrStr.filter(Boolean))
              }
            "
          >
            <PinInputGroup class="gap-1 flex justify-between flex-1">
              <template v-for="(id, index) in 6" :key="id">
                <PinInputInput class="rounded-md border border-border w-12 h-12" :index="index" />
                <template v-if="index !== 5">
                  <PinInputSeparator />
                </template>
              </template>
            </PinInputGroup>
          </PinInput>
        </FormControl>
        <div class="mt-4 flex flex-col items-center justify-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            :disabled="resendDisabled"
            @click="resendOtp"
            class="h-auto font-medium mt-2 py-2 bg-gray-50"
          >
            <template v-if="resendDisabled">
              <div class="flex items-center gap-2">
                <span>{{ t('auth.send-otp-again') }} ({{ resendTimer }}s)</span>
              </div>
            </template>
            <template v-else>
              <span class="text-primary">{{ t('auth.send-otp-again') }}</span>
            </template>
          </Button>
        </div>
      </FormItem>
    </FormField>

    <!-- Password Block -->
    <div class="space-y-4">
      <!-- THIS INPUT IS FOR ACCESSIBILITY REASONS -->
      <input type="text" autocomplete="username" value="asd" hidden />
      <!--  -->

      <FormField v-slot="{ componentField }" name="password">
        <FormItem>
          <FormLabel class="text-grayx2 text-base">{{ t('auth.new-password') }}</FormLabel>
          <FormControl>
            <Input
              class="text-base h-12 border border-border"
              type="password"
              autocomplete="new-password"
              v-bind="componentField"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="confirmPassword">
        <FormItem>
          <FormLabel class="text-grayx2 text-base">{{ t('auth.confirm-password') }}</FormLabel>
          <FormControl>
            <Input
              class="text-base h-12 border border-border"
              type="password"
              autocomplete="new-password"
              v-bind="componentField"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>

    <Button
      type="submit"
      size="default"
      :loading="loading"
      class="bg-[#FF7A2E] hover:bg-[#FF7A2E] text-base hover:opacity-90 transition-all w-full mt-8 h-10 rounded-lg"
    >
      {{ t('auth.update-password') }}
    </Button>
  </form>
</template>
