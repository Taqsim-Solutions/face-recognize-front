<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMutation } from '@tanstack/vue-query'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { toast } from 'vue-sonner'
import { AxiosError } from 'axios'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { updateTeacherPassword } from '../api'

const props = defineProps<{
  open: boolean
  teacherId: number | string
}>()

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void
}>()

const { t } = useI18n()

const isOpen = computed({
  get: () => props.open,
  set: (val) => emit('update:open', val)
})

const formSchema = toTypedSchema(
  z
    .object({
      password: z
        .string({ required_error: 'validation.required-field' })
        .min(8, { message: 'validation.password-min' }),
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

// Mutation to update password
const { isPending, mutate } = useMutation({
  mutationFn: (newPassword: string) =>
    updateTeacherPassword({ id: props.teacherId, newPassword }),
  onSuccess: () => {
    toast.success(t('auth.password-updated'))
    isOpen.value = false
    resetForm()
  },
  onError: (error: AxiosError) => {
    const errorRes = (error.response as any) ?? {}
    const firstMsg =
      errorRes?.data?.message ||
      errorRes?.data?.title ||
      'error_occurred'
    toast.error(t(firstMsg))
  }
})

const onSubmit = handleSubmit((values) => {
  mutate(values.password)
})

const handleCancel = () => {
  isOpen.value = false
  resetForm()
}
</script>

<template>
  <Sheet v-model:open="isOpen">
    <SheetContent side="right" class="w-full sm:max-w-[500px] flex flex-col p-0 bg-white [&>button]:hidden">
      <SheetHeader
        class="flex flex-row items-center justify-between bg-white p-3 px-6 border-b border-gray-200 space-y-0">
        <SheetTitle class="text-[17px] font-semibold text-[#1b1b1b]">
          {{ t('auth.update-password') }}
        </SheetTitle>
        <SheetClose
          class="rounded-full border border-gray-200 w-8 h-8 flex items-center justify-center hover:text-gray-600 hover:bg-gray-50 transition-all cursor-pointer bg-white">
          <svg class="ml-0.5" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 12 12">
            <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
        </SheetClose>
      </SheetHeader>

      <form @submit="onSubmit" class="flex flex-col flex-1 overflow-hidden">
        <div class="flex-1 overflow-y-auto px-6 space-y-4 pt-4 pb-10">
          
          <!-- Password Input -->
          <FormField v-slot="{ componentField }" name="password">
            <FormItem>
              <FormLabel class="text-sm font-semibold text-gray-700">{{ t('auth.new-password') }}</FormLabel>
              <FormControl>
                <Input type="password" v-bind="componentField" :placeholder="t('auth.new-password-placeholder')"
                  class="h-11 border border-gray-300 rounded-lg focus:border-primary bg-white" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Confirm Password Input -->
          <FormField v-slot="{ componentField }" name="confirmPassword">
            <FormItem>
              <FormLabel class="text-sm font-semibold text-gray-700">{{ t('confirm_password') }}</FormLabel>
              <FormControl>
                <Input type="password" v-bind="componentField" :placeholder="t('confirm_password_placeholder')"
                  class="h-11 border border-gray-300 rounded-lg focus:border-primary bg-white" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

        </div>

        <!-- Footer Actions -->
        <div class="p-4 px-6 border-t border-gray-100 flex items-center justify-end gap-3 bg-white">
          <Button type="button" variant="outline" @click="handleCancel"
            class="h-10 px-5 rounded-lg border-gray-200 text-gray-700 hover:bg-gray-50 font-medium transition-all">
            {{ t('cancel') }}
          </Button>
          <Button type="submit" :loading="isPending" :disabled="!meta.valid || isPending"
            class="h-10 px-5 rounded-lg bg-[#ff792d] hover:bg-[#e05e1a] text-white font-medium transition-all shadow-none border-none disabled:opacity-60 disabled:cursor-not-allowed">
            {{ t('auth.update-password') }}
          </Button>
        </div>
      </form>
    </SheetContent>
  </Sheet>
</template>

<style scoped>
:deep(.absolute.right-4.top-4),
:deep(button[class*="absolute"][class*="right-4"]),
:deep(button[class*="opacity-70"]) {
  display: none !important;
}
</style>
