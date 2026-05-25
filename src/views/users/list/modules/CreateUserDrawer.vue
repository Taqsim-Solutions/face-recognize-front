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
import { fetchRegions } from '@/views/schools/list/api'
import api from '@/api'

const { t } = useI18n()
const queryClient = useQueryClient()
const isOpen = ref(false)
const isPasswordVisible = ref(false)
const isConfirmPasswordVisible = ref(false)

// Selected level reactive ref (separate from form for cascade logic)
const selectedLevel = ref<number | undefined>(undefined)
const selectedRegionId = ref<number | undefined>(undefined)
const selectedCityId = ref<number | undefined>(undefined)
const selectedSchoolId = ref<number | undefined>(undefined)

// Fetch regions
const { data: regionsRes } = useQuery({
  queryKey: ['regions'],
  queryFn: fetchRegions,
  staleTime: Infinity
})
const regions = computed(() => {
  const res = regionsRes.value as any
  return res?.data?.result || res?.result || []
})

// Cities based on selected region
const availableCities = computed(() => {
  if (!selectedRegionId.value) return []
  const reg = regions.value.find((r: any) => r.id === selectedRegionId.value)
  return reg?.cities || []
})

// Schools based on selected city
const { data: schoolsRes, isPending: isSchoolsLoading } = useQuery({
  queryKey: ['schools-by-city-user', selectedCityId],
  queryFn: () => api.get('/api/schools', { params: { CityId: selectedCityId.value, PageSize: 999 } }),
  enabled: computed(() => !!selectedCityId.value)
})
const schools = computed(() => {
  const res = schoolsRes.value as any
  return res?.data?.result?.data || res?.data?.data || []
})

// Reset cascades when region changes
watch(selectedRegionId, () => {
  selectedCityId.value = undefined
  selectedSchoolId.value = undefined
})
watch(selectedCityId, () => {
  selectedSchoolId.value = undefined
})
watch(selectedLevel, () => {
  selectedRegionId.value = undefined
  selectedCityId.value = undefined
  selectedSchoolId.value = undefined
})

// Which extra fields to show per level
// Level 4 = Viloyat hokimi → region
// Level 3 = Tuman hokimi → region + city
// Level 2 = Direktor → region + city + school
// Level 1 = Teacher → region + city + school
const needsRegion = computed(() => selectedLevel.value && [1, 2, 3, 4].includes(selectedLevel.value))
const needsCity   = computed(() => selectedLevel.value && [1, 2, 3].includes(selectedLevel.value))
const needsSchool = computed(() => selectedLevel.value && [1, 2].includes(selectedLevel.value))

// Dynamic schema
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
      .refine((value) => /[A-Z]/.test(value), { message: 'validation.password-must-contain-one-uppercase' })
      .refine((value) => /[a-z]/.test(value), { message: 'validation.password-must-contain-one-lowercase' })
      .refine((value) => /\d/.test(value), { message: 'validation.password-must-contain-number' }),
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

// Extra field validation
const extraFieldsValid = computed(() => {
  if (!selectedLevel.value) return false
  if (needsRegion.value && !selectedRegionId.value) return false
  if (needsCity.value && !selectedCityId.value) return false
  if (needsSchool.value && !selectedSchoolId.value) return false
  return true
})

type ErrorResponse = {
  data: {
    error?: { code?: string; errors?: string[]; message?: string }
    message?: string
    isSuccess?: boolean
    status?: number
  }
}

const { isPending, mutate } = useMutation({
  mutationFn: createEmployee,
  onSuccess: () => {
    toast.success(t('success.employee-added', 'User created successfully'))
    isOpen.value = false
    queryClient.invalidateQueries({ queryKey: ['employees'] })
    doReset()
  },
  onError: (error: AxiosError) => {
    const errorRes = error.response as ErrorResponse
    const msg =
      errorRes?.data?.message ||
      errorRes?.data?.error?.message ||
      errorRes?.data?.error?.errors?.[0] ||
      'error-occurred'
    toast.error(t(msg, msg))
  }
})

const onSubmit = handleSubmit((formValues) => {
  const payload: any = {
    firstName: formValues.firstName,
    lastName: formValues.lastName,
    login: formValues.login,
    email: formValues.email,
    password: formValues.password,
    level: formValues.level
  }
  if (selectedRegionId.value) payload.regionId = selectedRegionId.value
  if (selectedCityId.value) payload.cityId = selectedCityId.value
  if (selectedSchoolId.value) payload.schoolId = selectedSchoolId.value
  mutate(payload)
})

const doReset = () => {
  resetForm()
  selectedLevel.value = undefined
  selectedRegionId.value = undefined
  selectedCityId.value = undefined
  selectedSchoolId.value = undefined
}

const handleCancel = () => {
  isOpen.value = false
  doReset()
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

          <!-- Email -->
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
                <Select
                  :model-value="componentField.modelValue ? String(componentField.modelValue) : undefined"
                  @update:model-value="(val) => { componentField['onUpdate:modelValue']?.(Number(val)); selectedLevel = Number(val) }"
                  name="level">
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

          <!-- Viloyat (Level 1,2,3,4) -->
          <div v-if="needsRegion" class="space-y-1.5">
            <label class="text-sm font-semibold text-gray-700">{{ t('region-label') }}</label>
            <Select
              :model-value="selectedRegionId ? String(selectedRegionId) : undefined"
              @update:model-value="(val) => selectedRegionId = Number(val)">
              <SelectTrigger class="h-11 border border-gray-300 rounded-lg text-gray-700 focus:border-primary bg-white">
                <SelectValue :placeholder="t('select-region')" />
              </SelectTrigger>
              <SelectContent class="bg-white">
                <SelectItem v-for="region in regions" :key="region.id" :value="String(region.id)">
                  {{ region.name }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p v-if="needsRegion && !selectedRegionId" class="text-xs text-red-500">{{ t('validation.required-field') }}</p>
          </div>

          <!-- Tuman (Level 1,2,3) -->
          <div v-if="needsCity" class="space-y-1.5">
            <label class="text-sm font-semibold text-gray-700">{{ t('city-label') }}</label>
            <Select
              :model-value="selectedCityId ? String(selectedCityId) : undefined"
              @update:model-value="(val) => selectedCityId = Number(val)"
              :disabled="!selectedRegionId">
              <SelectTrigger class="h-11 border border-gray-300 rounded-lg text-gray-700 focus:border-primary bg-white">
                <SelectValue :placeholder="selectedRegionId ? t('select-city') : t('select-region-first')" />
              </SelectTrigger>
              <SelectContent class="bg-white">
                <SelectItem v-for="city in availableCities" :key="city.id" :value="String(city.id)">
                  {{ city.name }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p v-if="needsCity && !selectedCityId" class="text-xs text-red-500">{{ t('validation.required-field') }}</p>
          </div>

          <!-- Maktab (Level 1,2) -->
          <div v-if="needsSchool" class="space-y-1.5">
            <label class="text-sm font-semibold text-gray-700">{{ t('school') }}</label>
            <Select
              :model-value="selectedSchoolId ? String(selectedSchoolId) : undefined"
              @update:model-value="(val) => selectedSchoolId = Number(val)"
              :disabled="!selectedCityId">
              <SelectTrigger class="h-11 border border-gray-300 rounded-lg text-gray-700 focus:border-primary bg-white">
                <SelectValue :placeholder="!selectedRegionId ? t('select-region-first') : !selectedCityId ? t('select-city-first') : isSchoolsLoading ? t('loading') : t('select-school')" />
              </SelectTrigger>
              <SelectContent class="bg-white">
                <SelectItem v-for="school in schools" :key="school.id" :value="String(school.id)">
                  {{ school.name }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p v-if="needsSchool && !selectedSchoolId" class="text-xs text-red-500">{{ t('validation.required-field') }}</p>
          </div>

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

        <!-- Footer -->
        <div class="p-4 px-6 border-t border-gray-100 flex items-center justify-end gap-3 bg-white">
          <Button type="button" variant="outline" @click="handleCancel"
            class="h-10 px-5 rounded-lg border-gray-200 text-gray-700 hover:bg-gray-50 font-medium transition-all">
            {{ t('cancel') }}
          </Button>
          <Button type="submit" :loading="isPending" :disabled="!meta.valid || !extraFieldsValid || isPending"
            class="h-10 px-5 rounded-lg bg-[#ff792d] hover:bg-[#e05e1a] text-white font-medium transition-all shadow-none border-none disabled:opacity-60 disabled:cursor-not-allowed">
            {{ t('save_add') }}
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
