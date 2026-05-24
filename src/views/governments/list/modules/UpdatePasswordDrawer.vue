<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQueryClient, useMutation } from '@tanstack/vue-query'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { toast } from 'vue-sonner'
import { Eye, EyeOff } from 'lucide-vue-next'

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { updateGovernmentPassword } from '../api'

const props = defineProps<{
  open: boolean
  employee: any
}>()

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void
}>()

const { t } = useI18n()
const queryClient = useQueryClient()
const isPasswordVisible = ref(false)
const isConfirmPasswordVisible = ref(false)

const isOpen = computed({
  get: () => props.open,
  set: (val) => emit('update:open', val)
})

// Zod Schema matching update fields (password, confirmPassword)
const formSchema = toTypedSchema(
  z
    .object({
      password: z
        .string({ required_error: 'validation.required-field' })
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
      confirmPassword: z
        .string({ required_error: 'validation.required-field' })
        .min(1, { message: 'validation.required-field' })
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'validation.passwords-must-match',
      path: ['confirmPassword']
    })
)

const { handleSubmit, resetForm, meta } = useForm({
  validationSchema: formSchema,
  initialValues: {
    password: '',
    confirmPassword: ''
  }
})

// Reset form when drawer opens
watch(
  () => props.open,
  (isOpenVal) => {
    if (isOpenVal) {
      resetForm()
      isPasswordVisible.value = false
      isConfirmPasswordVisible.value = false
    }
  }
)

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

// Mutation to update password
const { isPending, mutate } = useMutation({
  mutationFn: (newPassword: string) =>
    updateGovernmentPassword({ id: props.employee?.id, newPassword }),
  onSuccess: () => {
    toast.success(t('auth.password-updated', 'Password updated successfully'))
    isOpen.value = false
    queryClient.invalidateQueries({ queryKey: ['governments'] })
    resetForm()
  },
  onError: (error: any) => {
    const errorRes = error.response as ErrorResponse
    if (errorRes?.data?.error?.errors?.[0]) {
      toast.error(t(errorRes.data.error.errors[0]))
    } else if (errorRes?.data?.error?.message) {
      toast.error(t(errorRes.data.error.message))
    } else {
      toast.error(t('error-occurred', 'Error occurred'))
    }
  }
})

const onSubmit = handleSubmit((formValues) => {
  if (!props.employee?.id) {
    toast.error(t('error-occurred', 'Government User ID is missing'))
    return
  }
  mutate(formValues.password)
})

const handleCancel = () => {
  isOpen.value = false
  resetForm()
}
</script>

<template>
  <Sheet v-model:open="isOpen">
    <SheetContent
      side="right"
      class="w-full sm:max-w-[500px] flex flex-col p-0 bg-white [&>button]:hidden"
    >
      <SheetHeader
        class="flex flex-row items-center justify-between bg-white p-3 px-6 border-b border-gray-200 space-y-0"
      >
        <SheetTitle class="text-[17px] font-semibold text-[#1b1b1b]">
          {{ t('auth.update-password') }}
        </SheetTitle>
        <SheetClose
          class="rounded-full border border-gray-200 w-8 h-8 flex items-center justify-center hover:text-gray-600 hover:bg-gray-50 transition-all cursor-pointer bg-white"
        >
          <svg
            class="ml-0.5"
            xmlns="http://www.w3.org/2000/svg"
            width="15"
            height="15"
            viewBox="0 0 12 12"
          >
            <path
              d="M9 3L3 9M3 3L9 9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </SheetClose>
      </SheetHeader>

      <form @submit="onSubmit" class="flex flex-col flex-1 overflow-hidden">
        <!-- Scrollable fields container -->
        <div class="flex-1 overflow-y-auto px-6 space-y-4 pb-10">
          <!-- Yangi parol -->
          <FormField v-slot="{ componentField }" name="password">
            <FormItem>
              <FormLabel class="text-sm font-semibold text-gray-700">{{
                t('auth.new-password')
              }}</FormLabel>
              <FormControl>
                <div class="relative w-full items-center">
                  <Input
                    :type="isPasswordVisible ? 'text' : 'password'"
                    v-bind="componentField"
                    :placeholder="t('auth.new-password-placeholder')"
                    class="h-11 border border-gray-300 rounded-lg focus:border-primary pr-10 font-medium bg-white"
                  />
                  <button
                    type="button"
                    class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer border-none bg-transparent"
                    @click="isPasswordVisible = !isPasswordVisible"
                  >
                    <EyeOff
                      v-if="!isPasswordVisible"
                      :size="18"
                      class="text-gray-400 hover:text-gray-600"
                    />
                    <Eye v-else :size="18" class="text-gray-400 hover:text-gray-600" />
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Parolni takrorlang -->
          <FormField v-slot="{ componentField }" name="confirmPassword">
            <FormItem>
              <FormLabel class="text-sm font-semibold text-gray-700">{{
                t('confirm_password')
              }}</FormLabel>
              <FormControl>
                <div class="relative w-full items-center">
                  <Input
                    :type="isConfirmPasswordVisible ? 'text' : 'password'"
                    v-bind="componentField"
                    :placeholder="t('confirm_password_placeholder')"
                    class="h-11 border border-gray-300 rounded-lg focus:border-primary pr-10 font-medium bg-white"
                  />
                  <button
                    type="button"
                    class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer border-none bg-transparent"
                    @click="isConfirmPasswordVisible = !isConfirmPasswordVisible"
                  >
                    <EyeOff
                      v-if="!isConfirmPasswordVisible"
                      :size="18"
                      class="text-gray-400 hover:text-gray-600"
                    />
                    <Eye v-else :size="18" class="text-gray-400 hover:text-gray-600" />
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>

        <!-- Footer Actions (Cancel and Save) -->
        <div class="p-4 px-6 border-t border-gray-100 flex items-center justify-end gap-3 bg-white">
          <Button
            type="button"
            variant="outline"
            @click="handleCancel"
            class="h-10 px-5 rounded-lg border-gray-200 text-gray-700 hover:bg-gray-50 font-medium transition-all"
          >
            {{ t('cancel') }}
          </Button>
          <Button
            type="submit"
            :loading="isPending"
            :disabled="!meta.valid || isPending"
            class="h-10 px-5 rounded-lg bg-[#ff792d] hover:bg-[#e05e1a] text-white font-medium transition-all shadow-none border-none disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {{ t('save') }}
          </Button>
        </div>
      </form>
    </SheetContent>
  </Sheet>
</template>

<style scoped>
/* Hide the default Radix close button inside SheetContent */
:deep(.absolute.right-4.top-4),
:deep(button[class*='absolute'][class*='right-4']),
:deep(button[class*='opacity-70']) {
  display: none !important;
}
</style>
