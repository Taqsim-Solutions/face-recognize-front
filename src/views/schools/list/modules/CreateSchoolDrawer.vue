<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { toast } from 'vue-sonner'
import { AxiosError } from 'axios'
import { Plus, Eye, EyeOff } from 'lucide-vue-next'

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
import { createSchool, updateSchoolDirector, fetchRegions, fetchDirectors } from '../api'
import { createEmployee } from '@/views/users/create/api'

const { t } = useI18n()
const queryClient = useQueryClient()
const isOpen = ref(false)
const isNewUserOpen = ref(false)
const newUserLogin = ref('')
const newUserPassword = ref('')
const newUserConfirmPassword = ref('')
const newUserFirstName = ref('')
const newUserLastName = ref('')
const newUserEmail = ref('')
const isNewUserPasswordVisible = ref(false)
const isNewUserConfirmPasswordVisible = ref(false)

const newUserPasswordError = computed(() => {
  const p = newUserPassword.value
  if (!p) return ''
  if (p.length < 8) return "Parol kamida 8 ta belgidan iborat bo'lishi kerak"
  if (!/[A-Z]/.test(p)) return "Parol kamida bitta bosh harfdan iborat bo'lishi kerak"
  if (!/[a-z]/.test(p)) return "Parol kamida bitta kichik harfdan iborat bo'lishi kerak"
  if (!/\d/.test(p)) return "Parolda raqam bo'lishi kerak"
  return ''
})

const newUserConfirmPasswordError = computed(() => {
  if (!newUserConfirmPassword.value) return ''
  if (newUserPassword.value !== newUserConfirmPassword.value) return t('validation.passwords-must-match', "Parollar mos kelmayapti")
  return ''
})

const isNewUserPasswordValid = computed(() => {
  const p = newUserPassword.value
  return p.length >= 8 && /[A-Z]/.test(p) && /[a-z]/.test(p) && /\d/.test(p)
    && newUserPassword.value === newUserConfirmPassword.value
})

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

// Fetch directors (users with level=2)
const { data: directorsRes } = useQuery({
  queryKey: ['directors'],
  queryFn: fetchDirectors,
  staleTime: Infinity
})
const directors = computed(() => {
  const res = directorsRes.value as any
  const data = res?.data?.result?.data || res?.data?.data || res?.result?.data || []
  return data
})

const formSchema = toTypedSchema(
  z.object({
    name: z
      .string({ required_error: 'validation.required-field' })
      .min(1, { message: 'validation.required-field' }),
    regionId: z
      .number({ required_error: 'validation.required-field' })
      .min(1, { message: 'validation.required-field' }),
    cityId: z
      .number({ required_error: 'validation.required-field' })
      .min(1, { message: 'validation.required-field' }),
    directorId: z.number().nullable().optional()
  })
)

const { handleSubmit, resetForm, meta, values, setFieldValue } = useForm({
  validationSchema: formSchema,
  initialValues: {
    name: '',
    regionId: undefined as any,
    cityId: undefined as any,
    directorId: undefined as any
  }
})

// Cities list based on selected region
const availableCities = computed(() => {
  if (!values.regionId) return []
  const selectedRegion = regions.value.find((r: any) => r.id === values.regionId)
  return selectedRegion?.cities || []
})

// Reset city when region changes
watch(
  () => values.regionId,
  () => {
    setFieldValue('cityId', undefined)
  }
)

const { isPending, mutate } = useMutation({
  mutationFn: createSchool,
  onSuccess: async (res: any, vars: any) => {
    const schoolId = res?.data?.result?.id || res?.data?.id
    // Assign director if selected
    if (vars.directorId && vars.directorId > 0 && schoolId) {
      try {
        await updateSchoolDirector({ id: schoolId, directorId: vars.directorId })
      } catch (dirErr: any) {
        const msg =
          dirErr?.response?.data?.message || dirErr?.response?.data?.title || 'error_occurred'
        toast.error(msg)
        queryClient.invalidateQueries({ queryKey: ['schools'] })
        isOpen.value = false
        resetForm()
        return
      }
    }
    toast.success(t('success.school-added'))
    isOpen.value = false
    queryClient.invalidateQueries({ queryKey: ['schools'] })
    resetForm()
  },
  onError: (error: AxiosError) => {
    const errorRes = (error.response as any) ?? {}
    const errorData = errorRes.data
    let firstMsg = 'error_occurred'

    if (Array.isArray(errorData) && errorData.length > 0) {
      firstMsg = errorData[0]?.errorMessage || errorData[0]?.message || 'error_occurred'
    } else {
      firstMsg =
        errorRes?.data?.error?.errors?.[0] ||
        errorRes?.data?.error?.message ||
        errorRes?.data?.message ||
        errorRes?.data?.title ||
        'error_occurred'
    }

    toast.error(t(firstMsg))
  }
})

const onSubmit = handleSubmit((formValues) => {
  const payload: any = {
    name: formValues.name,
    cityId: formValues.cityId,
    directorId: formValues.directorId ?? null
  }
  mutate(payload)
})

const handleCancel = () => {
  isOpen.value = false
  resetForm()
}

// Create new director user inline
const createDirectorMutation = useMutation({
  mutationFn: createEmployee,
  onSuccess: (res: any) => {
    const newUser = res?.data?.result || res?.data
    toast.success(t('success.employee-added', "Direktor muvaffaqiyatli qo'shildi"))
    queryClient.invalidateQueries({ queryKey: ['directors'] })
    // Auto-select the newly created user as director
    if (newUser?.id) {
      setFieldValue('directorId', newUser.id)
    }
    isNewUserOpen.value = false
    newUserLogin.value = ''
    newUserPassword.value = ''
    newUserConfirmPassword.value = ''
    newUserFirstName.value = ''
    newUserLastName.value = ''
    newUserEmail.value = ''
  },
  onError: (error: any) => {
    const msg =
      error?.response?.data?.message || error?.response?.data?.error?.message || 'error-occurred'
    toast.error(t(msg, msg))
  }
})

const submitNewDirector = () => {
  if (!newUserLogin.value || !newUserPassword.value || !newUserFirstName.value) return
  createDirectorMutation.mutate({
    login: newUserLogin.value,
    password: newUserPassword.value,
    firstName: newUserFirstName.value,
    lastName: newUserLastName.value,
    email: newUserEmail.value,
    level: 2
  } as any)
}
</script>

<template>
  <Sheet v-model:open="isOpen">
    <SheetTrigger as-child>
      <Button
        class="h-10 px-5 rounded-xl bg-[#ff792d] hover:bg-[#e05e1a] text-white font-bold text-sm flex items-center gap-1.5 transition-all shadow-none border-none cursor-pointer hover:text-white"
        type="button"
      >
        <Plus class="w-4 h-4 stroke-[2.5]" />
        {{ t('new-school-add') }}
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
          {{ t('new-school-add') }}
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
        <div class="flex-1 overflow-y-auto px-6 space-y-3 pb-10">
          <!-- School Name -->
          <FormField v-slot="{ componentField }" name="name">
            <FormItem>
              <FormLabel class="text-sm font-semibold text-gray-700">{{
                t('school-name')
              }}</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  v-bind="componentField"
                  :placeholder="t('school-name-placeholder')"
                  class="h-11 border border-gray-300 rounded-lg focus:border-primary bg-white"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Region Dropdown -->
          <FormField v-slot="{ componentField }" name="regionId">
            <FormItem>
              <FormLabel class="text-sm font-semibold text-gray-700">{{
                t('region-label')
              }}</FormLabel>
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

          <!-- City Dropdown -->
          <FormField v-slot="{ componentField }" name="cityId">
            <FormItem>
              <FormLabel class="text-sm font-semibold text-gray-700">{{
                t('city-label')
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

          <!-- Director Dropdown -->
          <FormField v-slot="{ componentField }" name="directorId">
            <FormItem>
              <FormLabel class="text-sm font-semibold text-gray-700">{{
                t('school-director')
              }}</FormLabel>
              <FormControl>
                <Select
                  :model-value="
                    componentField.modelValue !== undefined && componentField.modelValue !== null
                      ? String(componentField.modelValue)
                      : undefined
                  "
                  @update:model-value="
                    (val) => componentField['onUpdate:modelValue']?.(Number(val))
                  "
                  name="directorId"
                >
                  <SelectTrigger
                    class="h-11 border border-gray-300 rounded-lg text-gray-700 focus:ring-0 focus:ring-offset-0 focus:ring-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-transparent focus:border-primary focus-visible:border-primary bg-white"
                  >
                    <SelectValue :placeholder="t('select-school-director')" />
                  </SelectTrigger>
                  <SelectContent class="bg-white">
                    <SelectItem value="0">
                      {{ t('no-director') }}
                    </SelectItem>
                    <SelectItem
                      v-for="director in directors"
                      :key="director.id"
                      :value="String(director.id)"
                    >
                      <span class="flex items-center gap-2">
                        <span>{{
                          [director.lastName, director.firstName].filter(Boolean).join(' ') ||
                          director.login
                        }}</span>
                        <span v-if="director.schoolName" class="text-xs text-gray-400 font-normal"
                          >({{ director.schoolName }})</span
                        >
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Quick create director button -->
          <button
            type="button"
            @click="isNewUserOpen = true"
            class="flex items-center gap-1.5 h-8 text-sm text-black border border-gray-300 rounded-lg px-3 hover:bg-gray-50 transition-all w-fit cursor-pointer bg-white shadow-sm"
          >
            <Plus class="w-3.5 h-3.5 shrink-0" />
            {{ t('add-new') }}
          </button>
        </div>

        <!-- Footer Actions -->
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

  <!-- Nested Sheet: Quick create director -->
  <Sheet v-model:open="isNewUserOpen">
    <SheetContent
      side="right"
      class="w-full sm:max-w-[440px] flex flex-col p-0 bg-white [&>button]:hidden z-[130]"
    >
      <SheetHeader
        class="flex flex-row items-center justify-between bg-white p-3 px-6 border-b border-gray-200 space-y-0"
      >
        <SheetTitle class="text-[17px] font-semibold text-[#1b1b1b]">
          {{ t('new-employee-add', "Yangi direktor qo'shish") }}
        </SheetTitle>
        <SheetClose
          @click="isNewUserOpen = false"
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

      <div class="flex-1 overflow-y-auto px-6 space-y-4">
        <!-- First Name -->
        <div class="space-y-1.5">
          <label class="text-sm font-semibold text-gray-700">{{ t('firstName') }} *</label>
          <input
            v-model="newUserFirstName"
            type="text"
            :placeholder="t('firstName_placeholder', 'Ismni kiriting')"
            class="w-full h-11 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-[#ff792d] bg-white"
          />
        </div>

        <!-- Last Name -->
        <div class="space-y-1.5">
          <label class="text-sm font-semibold text-gray-700">{{ t('lastName') }}</label>
          <input
            v-model="newUserLastName"
            type="text"
            :placeholder="t('lastName_placeholder', 'Familiyani kiriting')"
            class="w-full h-11 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-[#ff792d] bg-white"
          />
        </div>

        <!-- Email -->
        <div class="space-y-1.5">
          <label class="text-sm font-semibold text-gray-700">{{ t('email') }}</label>
          <input
            v-model="newUserEmail"
            type="email"
            :placeholder="t('email_placeholder', 'Email kiriting')"
            class="w-full h-11 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-[#ff792d] bg-white"
          />
        </div>

        <!-- Login -->
        <div class="space-y-1.5">
          <label class="text-sm font-semibold text-gray-700">{{ t('login') }}</label>
          <input
            v-model="newUserLogin"
            type="text"
            :placeholder="t('login_placeholder', 'Login kiriting')"
            class="w-full h-11 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-[#ff792d] bg-white"
          />
        </div>

        <!-- Password -->
        <div class="space-y-1.5">
          <label class="text-sm font-semibold text-gray-700">{{ t('password') }}</label>
          <div class="relative">
            <input
              v-model="newUserPassword"
              :type="isNewUserPasswordVisible ? 'text' : 'password'"
              :placeholder="t('password_placeholder', 'Parol kiriting')"
              class="w-full h-11 rounded-lg border border-gray-300 px-3 pr-10 text-sm outline-none focus:border-[#ff792d] bg-white"
              :class="{ 'border-red-400': newUserPassword && newUserPasswordError }"
            />
            <button
              type="button"
              @click="isNewUserPasswordVisible = !isNewUserPasswordVisible"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer bg-transparent border-none p-0"
            >
              <Eye v-if="!isNewUserPasswordVisible" class="w-4 h-4" />
              <EyeOff v-else class="w-4 h-4" />
            </button>
          </div>
          <p v-if="newUserPassword && newUserPasswordError" class="text-xs text-red-500 mt-1">{{ newUserPasswordError }}</p>
          <p v-else-if="!newUserPassword" class="text-xs text-gray-400 mt-1">Kamida 8 ta belgi, 1 ta bosh harf, 1 ta kichik harf, 1 ta raqam</p>
        </div>

        <!-- Confirm Password -->
        <div class="space-y-1.5">
          <label class="text-sm font-semibold text-gray-700">{{ t('confirm_password', 'Parolni takrorlang') }}</label>
          <div class="relative">
            <input
              v-model="newUserConfirmPassword"
              :type="isNewUserConfirmPasswordVisible ? 'text' : 'password'"
              :placeholder="t('confirm_password_placeholder', 'Parolni qayta kiriting')"
              class="w-full h-11 rounded-lg border border-gray-300 px-3 pr-10 text-sm outline-none focus:border-[#ff792d] bg-white"
              :class="{ 'border-red-400': newUserConfirmPassword && newUserConfirmPasswordError }"
            />
            <button
              type="button"
              @click="isNewUserConfirmPasswordVisible = !isNewUserConfirmPasswordVisible"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer bg-transparent border-none p-0"
            >
              <Eye v-if="!isNewUserConfirmPasswordVisible" class="w-4 h-4" />
              <EyeOff v-else class="w-4 h-4" />
            </button>
          </div>
          <p v-if="newUserConfirmPassword && newUserConfirmPasswordError" class="text-xs text-red-500 mt-1">{{ newUserConfirmPasswordError }}</p>
        </div>
      </div>

      <div class="p-4 px-6 border-t border-gray-100 flex items-center justify-end gap-3 bg-white">
        <Button
          type="button"
          variant="outline"
          @click="isNewUserOpen = false"
          class="h-10 px-5 rounded-lg border-gray-200 text-gray-700 hover:bg-gray-50 font-medium transition-all"
        >
          {{ t('cancel') }}
        </Button>
        <Button
          type="button"
          :disabled="
            !newUserLogin ||
            !newUserPassword ||
            !isNewUserPasswordValid ||
            !newUserConfirmPassword ||
            !!newUserConfirmPasswordError ||
            !newUserFirstName ||
            createDirectorMutation.isPending.value
          "
          @click="submitNewDirector"
          class="h-10 px-5 rounded-lg bg-[#ff792d] hover:bg-[#e05e1a] text-white font-medium transition-all shadow-none border-none disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <svg
            v-if="createDirectorMutation.isPending.value"
            class="w-4 h-4 animate-spin mr-1"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          {{ t('save_add', 'Saqlash') }}
        </Button>
      </div>
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
