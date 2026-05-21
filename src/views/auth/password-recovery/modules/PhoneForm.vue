<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { vMaska } from 'maska/vue'
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
  (e: 'otpRequested', phoneNumber: string, requestId: string): void
}>()

const loading = ref(false)

const formSchema = z.object({
  phoneNumber: z
    .string({ message: 'validation.required-field' })
    .transform((value) => value.replace(/\D/g, ''))
    .refine((value) => /^\d{9}$/.test(value), {
      message: 'validation.phone-number-should-be-valid'
    })
})

const form = useForm({
  validationSchema: toTypedSchema(formSchema),
  initialValues: {
    phoneNumber: ''
  }
})

const requestOtp = async (phoneNumber: string) => {
  try {
    loading.value = true
    const { data } = await axios.post('/api/auth/recover-password', { phoneNumber })
    emit('otpRequested', phoneNumber, data.requestId)
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

const onSubmit = form.handleSubmit(async (values) => {
  try {
    const phoneNumber = `${998}${values.phoneNumber}`
    const success = await requestOtp(phoneNumber)
    if (!success) {
      toast.error(t('error.invalid-phone'))
    }
  } catch (err) {
    if (axios.isAxiosError(err)) {
      if ((err.status && err.status > 499) || (err.status && err.status === 405)) {
        toast.error(t('error.try-later'))
      } else {
        toast.error(err.response ? err.response.data.error.message : t('error-occurred'))
      }
    }
  }
})
</script>

<template>
  <form @submit="onSubmit" class="space-y-6">
    <FormField v-slot="{ componentField }" name="phoneNumber">
      <FormItem>
        <FormLabel class="text-grayx2 text-base">{{ t('phone-number') }}</FormLabel>
        <FormControl>
          <div class="flex">
            <div
              class="h-10 border border-border px-3 w-[100px] flex items-center gap-2 rounded-lg border-r-0 rounded-r-none text-sm bg-muted"
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
                    d="M10.2306 3.23718L10.3498 3.604H10.7355L10.4235 3.8308L10.5427 4.19762L10.2306 3.97089L9.9185 4.19762L10.0377 3.8308L9.72563 3.604H10.1114L10.2306 3.23718Z"
                    fill="#F0F0F0"
                  />
                  <path
                    d="M11.4618 3.23718L11.581 3.604H11.9668L11.6547 3.8308L11.7739 4.19762L11.4618 3.97089L11.1497 4.19762L11.269 3.8308L10.9569 3.604H11.3426L11.4618 3.23718Z"
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

            <!-- Input for remaining 9 digits -->
            <Input
              v-bind="componentField"
              type="text"
              inputmode="tel"
              autocomplete="tel"
              v-maska="'(##) ###-##-##'"
              :placeholder="t('enter-phone-number')"
              class="h-10 border border-border rounded-l-none"
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
      class="bg-[#12B76A] hover:bg-[#12B76A] text-base hover:opacity-90 transition-all w-full mt-8 h-10 rounded-lg border border-[#12B76A]"
    >
      {{ t('auth.send-otp') }}
    </Button>
  </form>
</template>
