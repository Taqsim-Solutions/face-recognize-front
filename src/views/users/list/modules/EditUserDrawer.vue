<script setup lang="ts">
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQueryClient } from '@tanstack/vue-query'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { toast } from 'vue-sonner'

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
import { useGetUserById } from '../query/useGetUserById'
import { useUpdateEmployee } from '../query/useUpdateEmployee'

const props = defineProps<{
  open: boolean
  employee: any
}>()

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void
}>()

const { t } = useI18n()
const queryClient = useQueryClient()

const isOpen = computed({
  get: () => props.open,
  set: (val) => emit('update:open', val)
})

// Zod Schema matching update fields (firstName, lastName, email, login)
const formSchema = toTypedSchema(
  z.object({
    lastName: z.string({ required_error: 'validation.required-field' }).min(1, { message: 'validation.required-field' }),
    firstName: z.string({ required_error: 'validation.required-field' }).min(1, { message: 'validation.required-field' }),
    email: z
      .string()
      .email('validation.email-should-be-valid')
      .optional()
      .or(z.literal('')),
    login: z.string({ required_error: 'validation.required-field' }).min(1, { message: 'validation.required-field' })
  })
)

const { handleSubmit, resetForm, meta } = useForm({
  validationSchema: formSchema,
  initialValues: {
    lastName: '',
    firstName: '',
    email: '',
    login: ''
  }
})

// Fetch fresh details when open is true
const { data: user } = useGetUserById({ id: props.employee.id })

// Prefill form immediately when drawer opens or employee changes
watch(
  () => props.open,
  (isOpenVal) => {
    if (isOpenVal && props.employee) {
      resetForm({
        values: {
          firstName: props.employee.firstName || '',
          lastName: props.employee.lastName || '',
          email: props.employee.email || '',
          login: props.employee.login || ''
        }
      })
    }
  },
  { immediate: true }
)

// Also watch query details to ensure we have the absolute latest data from DB
watch(user, (newData) => {
  if (props.open && newData) {
    const rawUser = newData.result || newData.data || newData
    resetForm({
      values: {
        firstName: rawUser.firstName || '',
        lastName: rawUser.lastName || '',
        email: rawUser.email || '',
        login: rawUser.login || ''
      }
    })
  }
})

// Update employee Mutation
type ErrorResponse = {
  data: {
    error?: {
      code?: string
      errors?: string[]
      message?: string
    }
    message?: string
    isSuccess?: boolean
    status?: number
  }
}

const { isPending, mutate } = useUpdateEmployee()

const onSubmit = handleSubmit((formValues) => {
  mutate(
    {
      id: props.employee.id,
      payload: {
        firstName: formValues.firstName,
        lastName: formValues.lastName,
        login: formValues.login,
        email: formValues.email
      } as any
    },
    {
      onSuccess: () => {
        toast.success(t('success.employee-updated', 'User updated successfully'))
        isOpen.value = false
        queryClient.invalidateQueries({ queryKey: ['employees'] })
      },
      onError: (error: any) => {
        const errorRes = error.response as ErrorResponse
        const msg =
          errorRes?.data?.message ||
          errorRes?.data?.error?.message ||
          errorRes?.data?.error?.errors?.[0] ||
          'error-occurred'
        toast.error(t(msg, msg))
      }
    }
  )
})

const handleCancel = () => {
  isOpen.value = false
}
</script>

<template>
  <Sheet v-model:open="isOpen">
    <SheetContent side="right" class="w-full sm:max-w-[500px] flex flex-col p-0 bg-white [&>button]:hidden">
      <SheetHeader
        class="flex flex-row items-center justify-between bg-white p-3 px-6 border-b border-gray-200 space-y-0">
        <SheetTitle class="text-[17px] font-semibold text-[#1b1b1b]">
          {{ t('edit_user', 'Edit User') }}
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
        <!-- Scrollable fields container -->
        <div class="flex-1 overflow-y-auto px-6 space-y-3 pb-10">

          <!-- Ism -->
          <FormField v-slot="{ componentField }" name="firstName">
            <FormItem>
              <FormLabel class="text-sm font-semibold text-gray-700">{{ t('firstName') }}</FormLabel>
              <FormControl>
                <Input type="text" v-bind="componentField" :placeholder="t('firstName_placeholder')"
                  class="h-11 border border-gray-300 rounded-lg focus:border-primary" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Familiya -->
          <FormField v-slot="{ componentField }" name="lastName">
            <FormItem>
              <FormLabel class="text-sm font-semibold text-gray-700">{{ t('lastName') }}</FormLabel>
              <FormControl>
                <Input type="text" v-bind="componentField" :placeholder="t('lastName_placeholder')"
                  class="h-11 border border-gray-300 rounded-lg focus:border-primary" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Elektron pochta -->
          <FormField v-slot="{ componentField }" name="email">
            <FormItem>
              <FormLabel class="text-sm font-semibold text-gray-700">{{ t('email') }}</FormLabel>
              <FormControl>
                <Input type="email" v-bind="componentField" :placeholder="t('email_placeholder')"
                  class="h-11 border border-gray-300 rounded-lg focus:border-primary" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Login -->
          <FormField v-slot="{ componentField }" name="login">
            <FormItem>
              <FormLabel class="text-sm font-semibold text-gray-700">{{ t('login') }}</FormLabel>
              <FormControl>
                <Input type="text" v-bind="componentField" :placeholder="t('login_placeholder')"
                  class="h-11 border border-gray-300 rounded-lg focus:border-primary" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>

        <!-- Footer Actions (Cancel and Save) -->
        <div class="p-4 px-6 border-t border-gray-100 flex items-center justify-end gap-3 bg-white">
          <Button type="button" variant="outline" @click="handleCancel"
            class="h-10 px-5 rounded-lg border-gray-200 text-gray-700 hover:bg-gray-50 font-medium transition-all">
            {{ t('cancel') }}
          </Button>
          <Button type="submit" :loading="isPending" :disabled="!meta.valid || isPending"
            class="h-10 px-5 rounded-lg bg-[#ff792d] hover:bg-[#e05e1a] text-white font-medium transition-all shadow-none border-none disabled:opacity-60 disabled:cursor-not-allowed">
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
:deep(button[class*="absolute"][class*="right-4"]),
:deep(button[class*="opacity-70"]) {
  display: none !important;
}
</style>
