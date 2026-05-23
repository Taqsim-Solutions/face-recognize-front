<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { toast } from 'vue-sonner'
import { AxiosError } from 'axios'
import { Eye, EyeOff, Plus } from 'lucide-vue-next'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { createEmployee } from '../../create/api'

const { t } = useI18n()
const queryClient = useQueryClient()
const isOpen = ref(false)
const isPasswordVisible = ref(false)
const isConfirmPasswordVisible = ref(false)

// Zod Schema matching unified creation fields
const formSchema = toTypedSchema(
  z.object({
    lastName: z.string({ required_error: 'validation.required-field' }).min(1, { message: 'validation.required-field' }),
    firstName: z.string({ required_error: 'validation.required-field' }).min(1, { message: 'validation.required-field' }),
    email: z
      .string({ required_error: 'validation.required-field' })
      .min(1, { message: 'validation.required-field' })
      .email('validation.email-should-be-valid'),
    level: z.number({ required_error: 'validation.required-field', invalid_type_error: 'validation.required-field' }),
    login: z.string({ required_error: 'validation.required-field' }).min(1, { message: 'validation.required-field' }),
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
    confirmPassword: z.string({ required_error: 'validation.required-field' }).min(1, { message: 'validation.required-field' })
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'validation.passwords-must-match',
    path: ['confirmPassword']
  })
)

const { handleSubmit, resetForm, meta } = useForm({
  validationSchema: formSchema,
  initialValues: {
    lastName: '',
    firstName: '',
    email: '',
    level: undefined as any,
    login: '',
    password: '',
    confirmPassword: ''
  }
})

// Create employee Mutation
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

const { isPending, mutate } = useMutation({
  mutationFn: createEmployee,
  onSuccess: () => {
    toast.success(t('success.employee-added', 'User created successfully'))
    isOpen.value = false
    queryClient.invalidateQueries({ queryKey: ['employees'] })
    resetForm()
  },
  onError: (error: AxiosError) => {
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
  const payload = {
    firstName: formValues.firstName,
    lastName: formValues.lastName,
    login: formValues.login,
    email: formValues.email,
    password: formValues.password,
    level: formValues.level
  }

  mutate(payload as any)
})

const handleCancel = () => {
  isOpen.value = false
  resetForm()
}

const roles = computed(() => [
  { value: 1, label: t('roles.teacher', 'Teacher') },
  { value: 2, label: t('roles.director', 'Director') },
  { value: 3, label: t('roles.district', 'District government') },
  { value: 4, label: t('roles.region', 'Region government') },
  { value: 5, label: t('roles.admin', 'Admin') }
])
</script>

<template>
  <Sheet v-model:open="isOpen">
    <SheetTrigger as-child>
      <Button
        class="h-10 px-5 rounded-xl bg-[#ff792d] hover:bg-[#e05e1a] text-white font-bold text-sm flex items-center gap-1.5 transition-all shadow-none border-none cursor-pointer hover:text-white"
        type="button">
        <Plus class="w-4 h-4 stroke-[2.5]" />
        {{ t('new-employee-add', "Foydalanuvchi qo'shish") }}
      </Button>
    </SheetTrigger>

    <SheetContent side="right" class="w-full sm:max-w-[500px] flex flex-col p-0 bg-white [&>button]:hidden">
      <SheetHeader
        class="flex flex-row items-center justify-between bg-white p-3 px-6 border-b border-gray-200 space-y-0">
        <SheetTitle class="text-[17px] font-semibold text-[#1b1b1b]">
          {{ t('new-employee-add') }}
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

          <!-- Rol -->
          <FormField v-slot="{ componentField }" name="level">
            <FormItem>
              <FormLabel class="text-sm font-semibold text-gray-700">{{ t('role') }}</FormLabel>
              <FormControl>
                <Select :model-value="componentField.modelValue ? String(componentField.modelValue) : undefined"
                  @update:model-value="(val) => componentField['onUpdate:modelValue']?.(Number(val))" name="level">
                  <SelectTrigger class="h-11 border border-gray-300 rounded-lg text-gray-700 focus:border-primary">
                    <SelectValue :placeholder="t('role_placeholder')" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="role in roles" :key="role.value" :value="String(role.value)">
                      {{ role.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Parol -->
          <FormField v-slot="{ componentField }" name="password">
            <FormItem>
              <FormLabel class="text-sm font-semibold text-gray-700">{{ t('password') }}</FormLabel>
              <FormControl>
                <div class="relative w-full items-center">
                  <Input :type="isPasswordVisible ? 'text' : 'password'" v-bind="componentField"
                    :placeholder="t('password_placeholder')"
                    class="h-11 border border-gray-300 rounded-lg focus:border-primary pr-10 font-medium" />
                  <button type="button"
                    class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer border-none bg-transparent"
                    @click="isPasswordVisible = !isPasswordVisible">
                    <EyeOff v-if="!isPasswordVisible" :size="18" class="text-gray-400 hover:text-gray-600" />
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
              <FormLabel class="text-sm font-semibold text-gray-700">{{ t('confirm_password') }}</FormLabel>
              <FormControl>
                <div class="relative w-full items-center">
                  <Input :type="isConfirmPasswordVisible ? 'text' : 'password'" v-bind="componentField"
                    :placeholder="t('confirm_password_placeholder')"
                    class="h-11 border border-gray-300 rounded-lg focus:border-primary pr-10 font-medium" />
                  <button type="button"
                    class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer border-none bg-transparent"
                    @click="isConfirmPasswordVisible = !isConfirmPasswordVisible">
                    <EyeOff v-if="!isConfirmPasswordVisible" :size="18" class="text-gray-400 hover:text-gray-600" />
                    <Eye v-else :size="18" class="text-gray-400 hover:text-gray-600" />
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>

        <!-- Footer Actions (Cancel and Save & Add) -->
        <div class="p-4 px-6 border-t border-gray-100 flex items-center justify-end gap-3 bg-white">
          <Button type="button" variant="outline" @click="handleCancel"
            class="h-10 px-5 rounded-lg border-gray-200 text-gray-700 hover:bg-gray-50 font-medium transition-all">
            {{ t('cancel') }}
          </Button>
          <Button type="submit" :loading="isPending" :disabled="!meta.valid || isPending"
            class="h-10 px-5 rounded-lg bg-[#ff792d] hover:bg-[#e05e1a] text-white font-medium transition-all shadow-none border-none disabled:opacity-60 disabled:cursor-not-allowed">
            {{ t('save_add') }}
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
