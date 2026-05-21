<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { vMaska } from 'maska/vue'
import { toast } from 'vue-sonner'
import { AxiosError } from 'axios'
import { Eye, EyeOff, Plus } from 'lucide-vue-next'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
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
import { cleanPhoneNumber } from '@/lib/utils'

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
    sharif: z.string().optional(),
    phoneNumber: z
      .string({ required_error: 'validation.required-field' })
      .length(19, { message: 'validation.phone-number-should-be-valid' }),
    email: z
      .string({ required_error: 'validation.required-field' })
      .min(1, { message: 'validation.required-field' })
      .email('validation.email-should-be-valid'),
    level: z.coerce.number({ required_error: 'validation.required-field' }).min(1).max(5),
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
    confirmPassword: z.string({ required_error: 'validation.required-field' })
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'validation.passwords-must-match',
    path: ['confirmPassword']
  })
)

const { handleSubmit, resetForm, meta, values } = useForm({
  validationSchema: formSchema,
  initialValues: {
    lastName: '',
    firstName: '',
    sharif: '',
    phoneNumber: '',
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
  // We clean up phoneNumber and omit 'sharif' (as backend doesn't persist it)
  const payload = {
    firstName: formValues.firstName,
    lastName: formValues.lastName,
    login: formValues.login,
    email: formValues.email,
    password: formValues.password,
    level: formValues.level,
    phoneNumber: cleanPhoneNumber(formValues.phoneNumber),
    status: 'active',
    salary: 0,
    percentAllowed: 0,
    fte: 1,
    contractType: 'staff' as const,
    cardNumbers: null,
    identifiers: [
      { type: 'phoneNumber', value: cleanPhoneNumber(formValues.phoneNumber) }
    ]
  }
  
  mutate(payload as any)
})

const handleCancel = () => {
  isOpen.value = false
  resetForm()
}

const roles = [
  { value: 1, label: 'Teacher' },
  { value: 2, label: 'Director' },
  { value: 3, label: 'District government' },
  { value: 4, label: 'Region government' },
  { value: 5, label: 'Admin' }
]
</script>

<template>
  <Sheet v-model:open="isOpen">
    <SheetTrigger as-child>
      <Button
        variant="outline"
        class="bg-primary flex gap-1 border-none text-white rounded-lg h-9 hover:bg-primary hover:text-white hover:opacity-85 transition-all"
        type="button"
      >
        <Plus :size="18" class="text-white" />
        {{ t('new-employee-add', "Foydalanuvchi qo'shish") }}
      </Button>
    </SheetTrigger>

    <SheetContent side="right" class="w-full sm:max-w-[500px] flex flex-col p-0 bg-white">
      <SheetHeader class="bg-gray-50/50 p-6 border-b border-gray-100">
        <SheetTitle class="text-xl font-bold text-gray-800">
          {{ t('new-employee-add', "Foydalanuvchi qo'shish") }}
        </SheetTitle>
      </SheetHeader>

      <form @submit="onSubmit" class="flex flex-col flex-1 overflow-hidden">
        <!-- Scrollable fields container -->
        <div class="flex-1 overflow-y-auto p-6 space-y-4">
          <!-- Familiya -->
          <FormField v-slot="{ componentField }" name="lastName">
            <FormItem>
              <FormLabel class="text-sm font-semibold text-gray-700">Familiya</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  v-bind="componentField"
                  placeholder="Foydalanuvchi familiyasini kiriting"
                  class="h-10 border border-gray-300 rounded-lg focus:border-primary"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Ism -->
          <FormField v-slot="{ componentField }" name="firstName">
            <FormItem>
              <FormLabel class="text-sm font-semibold text-gray-700">Ism</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  v-bind="componentField"
                  placeholder="Foydalanuvchi ismini kiriting"
                  class="h-10 border border-gray-300 rounded-lg focus:border-primary"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Sharif -->
          <FormField v-slot="{ componentField }" name="sharif">
            <FormItem>
              <FormLabel class="text-sm font-semibold text-gray-700">Sharif</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  v-bind="componentField"
                  placeholder="Foydalanuvchi sharifini kiriting"
                  class="h-10 border border-gray-300 rounded-lg focus:border-primary"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Telefon raqam -->
          <FormField v-slot="{ componentField }" name="phoneNumber">
            <FormItem>
              <FormLabel class="text-sm font-semibold text-gray-700">Telefon raqam</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  v-bind="componentField"
                  v-maska="'+998 (##) ###-##-##'"
                  placeholder="+998 00 000 00 00"
                  inputmode="tel"
                  class="h-10 border border-gray-300 rounded-lg focus:border-primary font-medium"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Elektron pochta -->
          <FormField v-slot="{ componentField }" name="email">
            <FormItem>
              <FormLabel class="text-sm font-semibold text-gray-700">Elektron pochta</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  v-bind="componentField"
                  placeholder="Foydalanuvchi elektron pochta manzilini kiriting"
                  class="h-10 border border-gray-300 rounded-lg focus:border-primary"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Rol -->
          <FormField v-slot="{ componentField }" name="level">
            <FormItem>
              <FormLabel class="text-sm font-semibold text-gray-700">Rol</FormLabel>
              <FormControl>
                <Select
                  :model-value="componentField.modelValue ? String(componentField.modelValue) : undefined"
                  @update:model-value="(val) => componentField['onUpdate:modelValue'](Number(val))"
                  name="level"
                >
                  <SelectTrigger class="h-10 border border-gray-300 rounded-lg text-gray-700 focus:border-primary">
                    <SelectValue placeholder="Foydalanuvchi rolini tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="role in roles"
                      :key="role.value"
                      :value="String(role.value)"
                    >
                      {{ role.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Login -->
          <FormField v-slot="{ componentField }" name="login">
            <FormItem>
              <FormLabel class="text-sm font-semibold text-gray-700">Login</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  v-bind="componentField"
                  placeholder="Foydalanuvchi uchun login o'ylab toping"
                  class="h-10 border border-gray-300 rounded-lg focus:border-primary"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Parol -->
          <FormField v-slot="{ componentField }" name="password">
            <FormItem>
              <FormLabel class="text-sm font-semibold text-gray-700">Parol</FormLabel>
              <FormControl>
                <div class="relative w-full items-center">
                  <Input
                    :type="isPasswordVisible ? 'text' : 'password'"
                    v-bind="componentField"
                    placeholder="Foydalanuvchi uchun parol yaratib bering"
                    class="h-10 border border-gray-300 rounded-lg focus:border-primary pr-10 font-medium"
                  />
                  <button
                    type="button"
                    class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer border-none bg-transparent"
                    @click="isPasswordVisible = !isPasswordVisible"
                  >
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
              <FormLabel class="text-sm font-semibold text-gray-700">Parolni takrorlang</FormLabel>
              <FormControl>
                <div class="relative w-full items-center">
                  <Input
                    :type="isConfirmPasswordVisible ? 'text' : 'password'"
                    v-bind="componentField"
                    placeholder="Parolni qayta kiriting"
                    class="h-10 border border-gray-300 rounded-lg focus:border-primary pr-10 font-medium"
                  />
                  <button
                    type="button"
                    class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer border-none bg-transparent"
                    @click="isConfirmPasswordVisible = !isConfirmPasswordVisible"
                  >
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
        <div class="p-6 border-t border-gray-100 flex items-center gap-3 bg-gray-50/50">
          <Button
            type="button"
            variant="outline"
            @click="handleCancel"
            class="flex-1 h-11 rounded-lg border-gray-200 text-gray-600 hover:bg-gray-100 font-medium"
          >
            Bekor qilish
          </Button>
          <Button
            type="submit"
            :loading="isPending"
            :disabled="!meta.valid || isPending"
            class="flex-1 h-11 rounded-lg bg-[#F5C2A5] hover:bg-[#F3B390] text-white font-medium transition-all shadow-none border-none disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Saqlash va qo'shish
          </Button>
        </div>
      </form>
    </SheetContent>
  </Sheet>
</template>
