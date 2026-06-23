<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'

import axios from 'axios'
import api from '@/api'
import * as z from 'zod'

import { EyeOpenIcon, EyeClosedIcon } from '@radix-icons/vue'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useAuthRedirect } from '../../composables/useAuthRedirect'

const { t } = useI18n()

// ✅ Validate login field
const formSchema = toTypedSchema(
  z.object({
    login: z.string({ message: 'validation.required-field' }).min(1, { message: 'validation.required-field' }),
    password: z.string({ message: 'validation.required-field' })
  })
)

const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    login: ''
  }
})

const passwordInputRef = ref<InstanceType<typeof Input> | null>(null)
const isPasswordVisible = ref(false)
const handlePasswordVisible = () => {
  isPasswordVisible.value = !isPasswordVisible.value
  nextTick(() => passwordInputRef.value?.focus())
}
const { saveTokenAndRedirect } = useAuthRedirect()

type LoginResponse = {
  code: number
  message: string
  result: string
}

const loading = ref(false)
const onSubmit = form.handleSubmit(async (values) => {
  try {
    loading.value = true

    const payload = {
      login: values.login.trim(),
      password: values.password
    }

    const { data, status } = await api.post<LoginResponse>('/api/authentication', payload, {
      validateStatus: (s) => s === 200
    })

    // 200 → direct token response
    if (status === 200 && data.result) {
      await saveTokenAndRedirect(data.result)
    }
  } catch (err) {
    if (axios.isAxiosError(err)) {
      if ((err.status && err.status > 499) || (err.status && err.status === 405)) {
        toast.error(t('error.try-later'))
      } else {
        const errorMessage = err.response?.data?.message || err.response?.data?.error?.message
        if (errorMessage === 'Login or password is incorrect') {
          toast.error(t('auth.incorrect-credentials'))
        } else {
          toast.error(errorMessage || t('error-occurred'))
        }
      }
    }
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <form @submit="onSubmit">
    <FormField v-slot="{ componentField }" name="login">
      <FormItem class="mb-5">
        <FormLabel class="text-grayx2 text-base">{{ t('auth.login') }}</FormLabel>
        <FormControl>
          <Input
            v-bind="componentField"
            type="text"
            :placeholder="t('auth.enter-login')"
            class="h-10 border border-border"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="password">
      <FormItem>
        <FormLabel class="text-grayx2 text-base">{{ t('password') }}</FormLabel>
        <FormControl>
          <div class="relative w-full items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 16 16"
              fill="none"
              class="absolute top-3 left-3"
            >
              <path
                d="M5.33333 7.33333V4.66667C5.33333 3.95942 5.61428 3.28115 6.11438 2.78105C6.61447 2.28095 7.29275 2 8 2C8.70724 2 9.38552 2.28095 9.88561 2.78105C10.3857 3.28115 10.6667 3.95942 10.6667 4.66667V7.33333M3.33333 8.66667C3.33333 8.31304 3.4738 7.97391 3.72385 7.72386C3.9739 7.47381 4.31304 7.33333 4.66666 7.33333H11.3333C11.687 7.33333 12.0261 7.47381 12.2761 7.72386C12.5262 7.97391 12.6667 8.31304 12.6667 8.66667V12.6667C12.6667 13.0203 12.5262 13.3594 12.2761 13.6095C12.0261 13.8595 11.687 14 11.3333 14H4.66666C4.31304 14 3.9739 13.8595 3.72385 13.6095C3.4738 13.3594 3.33333 13.0203 3.33333 12.6667V8.66667ZM7.33333 10.6667C7.33333 10.8435 7.40357 11.013 7.52859 11.1381C7.65361 11.2631 7.82318 11.3333 8 11.3333C8.17681 11.3333 8.34638 11.2631 8.4714 11.1381C8.59642 11.013 8.66666 10.8435 8.66666 10.6667C8.66666 10.4899 8.59642 10.3203 8.4714 10.1953C8.34638 10.0702 8.17681 10 8 10C7.82318 10 7.65361 10.0702 7.52859 10.1953C7.40357 10.3203 7.33333 10.4899 7.33333 10.6667Z"
                stroke="#8796AF"
                stroke-width="1.44"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <Input
              ref="passwordInputRef"
              class="h-10 border border-border px-10"
              :type="isPasswordVisible ? 'text' : 'password'"
              v-bind="componentField"
              :placeholder="t('enter-password')"
            />
            <span
              class="absolute right-3 inset-y-0 flex items-center cursor-pointer"
              @click="handlePasswordVisible"
            >
              <EyeClosedIcon v-if="!isPasswordVisible" class="size-5 text-muted-foreground" />
              <EyeOpenIcon v-else class="size-5 text-muted-foreground" />
            </span>
          </div>
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <p class="mt-2.5 text-secondary-foreground text-sm flex justify-between">
      {{ t('cant-remember-password') }}
      <RouterLink :to="{ name: 'password-recovery' }" class="text-[#12B76A]">
        {{ t('password-recovery') }}
      </RouterLink>
    </p>

    <Button
      type="submit"
      class="bg-[#FF7A2E] hover:bg-[#FF7A2E] text-base hover:opacity-90 transition-all w-full mt-8 h-10 rounded-lg"
      :loading="loading"
    >
      {{ t('auth.sign-in') }}
    </Button>
  </form>
</template>
