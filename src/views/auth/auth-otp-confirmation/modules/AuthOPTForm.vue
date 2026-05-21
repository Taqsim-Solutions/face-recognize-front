<script setup lang="ts">
import type { TokenResponse, OTPModel } from '../../types'

import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { getDeviceInfo } from '@/lib/device'
import { useAuthRedirect } from '../../composables/useAuthRedirect'

import axios from 'axios'
import * as z from 'zod'

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form'
import {
  PinInput,
  PinInputGroup,
  PinInputInput,
  PinInputSeparator
} from '@/components/ui/pin-input'

import { Button } from '@/components/ui/button'
import { toast } from 'vue-sonner'

const { t } = useI18n()
const props = defineProps<{
  requestId: string
}>()

const formSchema = toTypedSchema(
  z.object({
    code: z.array(z.coerce.string()).length(6, { message: 'Invalid input' })
  })
)

const { handleSubmit, setFieldValue } = useForm({
  validationSchema: formSchema
})

const { saveTokenAndRedirect } = useAuthRedirect()

const loading = ref(false)
const onSubmit = handleSubmit(async (values) => {
  const payload: OTPModel = {
    code: values.code.join(''),
    requestId: props.requestId,
    device: await getDeviceInfo()
  }

  try {
    loading.value = true
    const { data, status } = await axios.post<TokenResponse>('/api/auth/otp', payload)

    if (status === 200) {
      const tokenRes = data as TokenResponse
      await saveTokenAndRedirect(tokenRes)
    }
  } catch (err) {
    if (axios.isAxiosError(err)) {
      if ((err.status && err.status > 499) || (err.status && err.status === 405)) {
        toast.error(t('error.try-later'))
      } else {
        err.response
          ? err.response.data.title === 'Bad Request' && err.status === 400
            ? toast.error(t('entered-wrong-code'))
            : toast.error(t('error-occurred'))
          : toast.error(t('error-occurred'))
      }
    }
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <form @submit="onSubmit">
    <FormField v-slot="{ componentField, value }" name="code">
      <FormItem>
        <FormLabel>OTP</FormLabel>
        <FormControl>
          <PinInput
            id="pin-input"
            :model-value="value"
            placeholder="○"
            class="flex items-center mt-1"
            otp
            type="number"
            :name="componentField.name"
            @update:model-value="
              (arrStr) => {
                setFieldValue('code', arrStr.filter(Boolean))
              }
            "
          >
            <PinInputGroup class="gap-1 flex justify-between flex-1">
              <template v-for="(id, index) in 6" :key="id">
                <PinInputInput class="rounded-md border w-12 h-12" :index="index" />
                <template v-if="index !== 5">
                  <PinInputSeparator />
                </template>
              </template>
            </PinInputGroup>
          </PinInput>
        </FormControl>
        <FormDescription> </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>

    <Button
      type="submit"
      class="bg-[#12B76A] hover:bg-[#12B76A] text-base hover:opacity-90 transition-all w-full mt-3 h-10 rounded-lg border border-[#12B76A]"
      >{{ t('confirm') }}</Button
    >
  </form>
</template>
