<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
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
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { createGovernment, fetchRegions } from '../api'

const { t } = useI18n()
const queryClient = useQueryClient()
const isOpen = ref(false)
const isPasswordVisible = ref(false)
const isConfirmPasswordVisible = ref(false)

// Fetch regions list
const { data: regionsRes } = useQuery({
  queryKey: ['regions'],
  queryFn: fetchRegions,
  staleTime: Infinity
})
const regions = computed(() => {
  const res = regionsRes.value as any
  return res?.data?.result || res?.result || []
})

// Zod Schema matching unified creation fields for governments
const formSchema = toTypedSchema(
  z
    .object({
      lastName: z
        .string({ required_error: 'validation.required-field' })
        .min(1, { message: 'validation.required-field' }),
      firstName: z
        .string({ required_error: 'validation.required-field' })
        .min(1, { message: 'validation.required-field' }),
      email: z
        .string({ required_error: 'validation.required-field' })
        .min(1, { message: 'validation.required-field' })
        .email('validation.email-should-be-valid'),
      level: z.number({ required_error: 'validation.required-field' }),
      regionId: z
        .number({ required_error: 'validation.required-field' })
        .min(1, { message: 'validation.required-field' }),
      cityId: z.number().nullable().optional(),
      login: z
        .string({ required_error: 'validation.required-field' })
        .min(1, { message: 'validation.required-field' }),
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
    .refine(
      (data) => {
        if (data.level === 3) {
          return typeof data.cityId === 'number' && data.cityId > 0
        }
        return true
      },
      {
        message: 'validation.required-field',
        path: ['cityId']
      }
    )
)

const { handleSubmit, resetForm, meta, values, setFieldValue } = useForm({
  validationSchema: formSchema,
  initialValues: {
    lastName: '',
    firstName: '',
    email: '',
    level: 4, // 4 = Viloyat hokimi, 3 = Tuman hokimi
    regionId: undefined as any,
    cityId: undefined as any,
    login: '',
    password: '',
    confirmPassword: ''
  }
})

// Cities list based on selected region
const availableCities = computed(() => {
  if (!values.regionId) return []
  const selectedRegion = regions.value.find((r: any) => r.id === values.regionId)
  return selectedRegion?.cities || []
})

// Reset city when level or region changes
watch(
  () => values.level,
  (newLevel) => {
    if (newLevel === 4) {
      setFieldValue('cityId', undefined)
    }
  }
)

watch(
  () => values.regionId,
  () => {
    setFieldValue('cityId', undefined)
  }
)

// Mutation to create government

const { isPending, mutate } = useMutation({
  mutationFn: createGovernment,
  onSuccess: () => {
    toast.success(t('success.government-added', "Hokim muvaffaqiyatli qo'shildi"))
    isOpen.value = false
    queryClient.invalidateQueries({ queryKey: ['governments'] })
    resetForm()
  },
  onError: (error: AxiosError) => {
    const errorRes = (error.response as any) ?? {}
    const errorData = errorRes.data
    let firstMsg = 'error-occurred'

    if (Array.isArray(errorData) && errorData.length > 0) {
      firstMsg = errorData[0]?.errorMessage || errorData[0]?.message || 'error-occurred'
    } else {
      firstMsg =
        errorRes?.data?.error?.errors?.[0] ||
        errorRes?.data?.error?.message ||
        errorRes?.data?.message ||
        errorRes?.data?.title ||
        'error-occurred'
    }

    toast.error(t(firstMsg))
  }
})

const onSubmit = handleSubmit((formValues) => {
  const payload = {
    firstName: formValues.firstName,
    lastName: formValues.lastName,
    login: formValues.login,
    email: formValues.email,
    password: formValues.password,
    confirmPassword: formValues.confirmPassword,
    level: formValues.level,
    regionId: formValues.regionId,
    cityId: formValues.level === 4 ? null : formValues.cityId || null
  }

  mutate(payload)
})

const handleCancel = () => {
  isOpen.value = false
  resetForm()
}
</script>

<template>
  <Sheet v-model:open="isOpen">
    <SheetTrigger as-child>
      <Button
        variant="outline"
        class="bg-[#ff792d] hover:bg-[#e05e1a] flex gap-1 border-none text-white rounded-lg h-9 hover:text-white transition-all shadow-none"
        type="button"
      >
        <Plus :size="18" class="text-white" />
        {{ t('new-government-add', "Hokim qo'shish") }}
      </Button>
    </SheetTrigger>

    <SheetContent
      side="right"
      class="w-full sm:max-w-[500px] flex flex-col p-0 bg-white [&>button]:hidden"
    >
      <SheetHeader
        class="flex flex-row items-center justify-between bg-white p-3 px-6 border-b border-gray-200 space-y-0"
      >
        <SheetTitle class="text-[17px] font-semibold text-[#1b1b1b]">
          {{ t('new-government-add') }}
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
        <div class="flex-1 overflow-y-auto px-6 space-y-3 pb-10 mt-4">
          <!-- Radio Type Select (Viloyat hokimi / Tuman hokimi) -->
          <div class="space-y-1.5">
            <label class="text-sm font-semibold text-gray-700 block">{{
              t('select-govt-type', 'Hokimlik darajasini tanlang')
            }}</label>
            <div class="flex items-center gap-6 py-2">
              <label
                @click="setFieldValue('level', 4)"
                class="flex items-center gap-2 cursor-pointer font-medium text-gray-700 text-sm select-none"
              >
                <span
                  class="w-5 h-5 rounded-full border flex items-center justify-center transition-all"
                  :class="
                    values.level === 4
                      ? 'border-[#ff792d] bg-[#ff792d] text-white'
                      : 'border-gray-300 bg-white'
                  "
                >
                  <span v-if="values.level === 4" class="w-2 h-2 rounded-full bg-white"></span>
                </span>
                <span>{{ t('roles.region', 'Viloyat hokimi') }}</span>
              </label>

              <label
                @click="setFieldValue('level', 3)"
                class="flex items-center gap-2 cursor-pointer font-medium text-gray-700 text-sm select-none"
              >
                <span
                  class="w-5 h-5 rounded-full border flex items-center justify-center transition-all"
                  :class="
                    values.level === 3
                      ? 'border-[#ff792d] bg-[#ff792d] text-white'
                      : 'border-gray-300 bg-white'
                  "
                >
                  <span v-if="values.level === 3" class="w-2 h-2 rounded-full bg-white"></span>
                </span>
                <span>{{ t('roles.district', 'Tuman hokimi') }}</span>
              </label>
            </div>
          </div>

          <!-- Region Dropdown -->
          <FormField v-slot="{ componentField }" name="regionId">
            <FormItem>
              <FormLabel class="text-sm font-semibold text-gray-700"
                >{{ t('region-label', 'Viloyat/Shahar') }}
              </FormLabel>
              <FormControl>
                <Select
                  :model-value="
                    componentField.modelValue ? String(componentField.modelValue) : undefined
                  "
                  @update:model-value="
                    (val) => componentField['onUpdate:modelValue']?.(Number(val))
                  "
                  name="regionId"
                >
                  <SelectTrigger
                    class="h-11 border border-gray-300 rounded-lg text-gray-700 focus:ring-0 focus:ring-offset-0 focus:ring-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-transparent focus:border-primary focus-visible:border-primary bg-white"
                  >
                    <SelectValue :placeholder="t('select-region')" />
                  </SelectTrigger>
                  <SelectContent class="bg-white">
                    <SelectItem
                      v-for="region in regions"
                      :key="region.id"
                      :value="String(region.id)"
                    >
                      {{ region.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- City Dropdown (Only visible if Tuman hokimi level = 3) -->
          <FormField v-slot="{ componentField }" name="cityId" v-if="values.level === 3">
            <FormItem>
              <FormLabel class="text-sm font-semibold text-gray-700">{{
                t('city-label', 'Shahar/Tuman')
              }}</FormLabel>
              <FormControl>
                <Select
                  :model-value="
                    componentField.modelValue ? String(componentField.modelValue) : undefined
                  "
                  @update:model-value="
                    (val) => componentField['onUpdate:modelValue']?.(Number(val))
                  "
                  name="cityId"
                >
                  <SelectTrigger
                    class="h-11 border border-gray-300 rounded-lg text-gray-700 focus:ring-0 focus:ring-offset-0 focus:ring-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-transparent focus:border-primary focus-visible:border-primary bg-white"
                    :disabled="!values.regionId"
                  >
                    <SelectValue :placeholder="t('select-city')" />
                  </SelectTrigger>
                  <SelectContent class="bg-white">
                    <SelectItem
                      v-for="city in availableCities"
                      :key="city.id"
                      :value="String(city.id)"
                    >
                      {{ city.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Ism -->
          <FormField v-slot="{ componentField }" name="firstName">
            <FormItem>
              <FormLabel class="text-sm font-semibold text-gray-700">{{
                t('firstName')
              }}</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  v-bind="componentField"
                  :placeholder="t('firstName_placeholder')"
                  class="h-11 border border-gray-300 rounded-lg focus:border-primary bg-white"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Familiya -->
          <FormField v-slot="{ componentField }" name="lastName">
            <FormItem>
              <FormLabel class="text-sm font-semibold text-gray-700">{{ t('lastName') }}</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  v-bind="componentField"
                  :placeholder="t('lastName_placeholder')"
                  class="h-11 border border-gray-300 rounded-lg focus:border-primary bg-white"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Elektron pochta -->
          <FormField v-slot="{ componentField }" name="email">
            <FormItem>
              <FormLabel class="text-sm font-semibold text-gray-700">{{ t('email') }}</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  v-bind="componentField"
                  :placeholder="t('email_placeholder')"
                  class="h-11 border border-gray-300 rounded-lg focus:border-primary bg-white"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Login -->
          <FormField v-slot="{ componentField }" name="login">
            <FormItem>
              <FormLabel class="text-sm font-semibold text-gray-700">{{ t('login') }}</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  v-bind="componentField"
                  :placeholder="t('login_placeholder')"
                  class="h-11 border border-gray-300 rounded-lg focus:border-primary bg-white"
                />
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
                  <Input
                    :type="isPasswordVisible ? 'text' : 'password'"
                    v-bind="componentField"
                    :placeholder="t('password_placeholder')"
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

        <!-- Footer Actions (Cancel and Save & Add) -->
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
            {{ t('save_add') }}
          </Button>
        </div>
      </form>
    </SheetContent>
  </Sheet>
</template>

<style scoped>
:deep(.absolute.right-4.top-4),
:deep(button[class*='absolute'][class*='right-4']),
:deep(button[class*='opacity-70']) {
  display: none !important;
}
</style>
