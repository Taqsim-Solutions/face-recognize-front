<script setup lang="ts">
import { computed, watch, ref, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { toast } from 'vue-sonner'
import { AxiosError } from 'axios'
import { Plus, Eye, EyeOff } from 'lucide-vue-next'

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import PhoneInput from '@/components/PhoneInput.vue'
import { isValidPhone, toE164 } from '@/composables/usePhoneInput'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { updateSchool, updateSchoolDirector, fetchRegions, fetchDirectors } from '../api'
import { createEmployee } from '@/views/users/create/api'

const props = defineProps<{
  open: boolean
  school: any
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

// Fetch directors (users with level=2)
const { data: directorsRes } = useQuery({
  queryKey: ['directors'],
  queryFn: fetchDirectors,
  staleTime: Infinity
})
const directors = computed(() => {
  const res = directorsRes.value as any
  return res?.data?.result?.data || res?.data?.data || res?.result?.data || []
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

const isPrefilling = ref(false)
const initialDirectorId = ref<number | null | undefined>(undefined)

// Prefill form when drawer opens, school changes, or directors list is loaded
watch(
  [() => props.open, () => directors.value],
  ([isOpenVal, directorsList]) => {
    if (isOpenVal && props.school) {
      isPrefilling.value = true

      let currentDirectorId = undefined as any
      if (directorsList && directorsList.length > 0) {
        const matchedDirector = directorsList.find((d: any) => d.schoolId === props.school.id)
        if (matchedDirector) {
          currentDirectorId = Number(matchedDirector.id)
        }
      }

      if (!currentDirectorId && props.school.directorId && props.school.directorId !== 0) {
        currentDirectorId = Number(props.school.directorId)
      }

      initialDirectorId.value = currentDirectorId ?? null

      resetForm({
        values: {
          name: props.school.name || '',
          regionId: props.school.region?.id ? Number(props.school.region.id) : (undefined as any),
          cityId: props.school.city?.id ? Number(props.school.city.id) : (undefined as any),
          directorId: currentDirectorId
        }
      })
      nextTick(() => {
        isPrefilling.value = false
      })
    }
  },
  { immediate: true }
)

// Cities list based on selected region
const availableCities = computed(() => {
  if (!values.regionId) return []
  const selectedRegion = regions.value.find((r: any) => r.id === values.regionId)
  return selectedRegion?.cities || []
})

// Reset city when region changes (but not during prefill)
watch(
  () => values.regionId,
  (_, oldReg) => {
    if (isPrefilling.value) return
    if (oldReg !== undefined) {
      setFieldValue('cityId', undefined)
    }
  }
)

// Mutation to update school info
const { isPending, mutate } = useMutation({
  mutationFn: ({ id, payload }: { id: any; payload: any; directorId?: number | null }) =>
    updateSchool({ id, payload }),
  onSuccess: async (_, vars) => {
    // Call PUT /api/schools/{id}/director separately if director has changed
    const normNewDir = vars.directorId ? Number(vars.directorId) : 0
    const normOldDir = initialDirectorId.value ? Number(initialDirectorId.value) : 0

    if (normNewDir !== normOldDir) {
      try {
        await updateSchoolDirector({ id: props.school.id, directorId: normNewDir })
      } catch (dirErr: any) {
        const msg =
          dirErr?.response?.data?.message || dirErr?.response?.data?.title || 'error_occurred'
        toast.error(msg)
        return
      }
    }
    toast.success(t('success.school-updated'))
    isOpen.value = false
    queryClient.invalidateQueries({ queryKey: ['schools'] })
    queryClient.invalidateQueries({ queryKey: ['directors'] })
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
  // Only send name + cityId to PUT /api/schools/{id}
  const payload = {
    name: formValues.name,
    cityId: formValues.cityId
  }

  // directorId is passed at top-level so mutationFn can strip it before calling updateSchool
  mutate({ id: props.school.id, payload, directorId: formValues.directorId ?? null } as any)
})

const handleCancel = () => {
  isOpen.value = false
}

// Quick create director
const isNewUserOpen = ref(false)
const newUserLogin = ref('')
const newUserPassword = ref('')
const newUserFirstName = ref('')
const newUserLastName = ref('')
const newUserEmail = ref('')
const isNewUserPasswordVisible = ref(false)

const createDirectorMutation = useMutation({
  mutationFn: createEmployee,
  onSuccess: (res: any) => {
    const newUser = res?.data?.result || res?.data
    toast.success(t('success.employee-added', "Direktor muvaffaqiyatli qo'shildi"))
    queryClient.invalidateQueries({ queryKey: ['directors'] })
    if (newUser?.id) {
      setFieldValue('directorId', newUser.id)
    }
    isNewUserOpen.value = false
    newUserLogin.value = ''
    newUserPassword.value = ''
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
  if (!isValidPhone(newUserLogin.value)) {
    toast.error(t('validation.phone-number-should-be-valid', "Telefon raqami haqiqiy bo'lishi kerak"))
    return
  }
  createDirectorMutation.mutate({
    login: toE164(newUserLogin.value),
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
    <SheetContent
      side="right"
      class="w-full sm:max-w-[500px] flex flex-col p-0 bg-white [&>button]:hidden"
    >
      <SheetHeader
        class="flex flex-row items-center justify-between bg-white p-3 px-6 border-b border-gray-200 space-y-0"
      >
        <SheetTitle class="text-[17px] font-semibold text-[#1b1b1b]">
          {{ t('edit-school') }}
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
            {{ t('save') }}
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
        <div class="space-y-1.5">
          <label class="text-sm font-semibold text-gray-700">{{ t('firstName') }} *</label>
          <input
            v-model="newUserFirstName"
            type="text"
            :placeholder="t('firstName_placeholder', 'Ismni kiriting')"
            class="w-full h-11 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-[#ff792d] bg-white"
          />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-semibold text-gray-700">{{ t('lastName') }}</label>
          <input
            v-model="newUserLastName"
            type="text"
            :placeholder="t('lastName_placeholder', 'Familiyani kiriting')"
            class="w-full h-11 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-[#ff792d] bg-white"
          />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-semibold text-gray-700">{{ t('email') }}</label>
          <input
            v-model="newUserEmail"
            type="email"
            :placeholder="t('email_placeholder', 'Email kiriting')"
            class="w-full h-11 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-[#ff792d] bg-white"
          />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-semibold text-gray-700">{{ t('login') }}</label>
          <PhoneInput
            v-model="newUserLogin"
            :placeholder="t('login_placeholder', 'Login kiriting')"
          />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-semibold text-gray-700">{{ t('password') }}</label>
          <div class="relative">
            <input
              v-model="newUserPassword"
              :type="isNewUserPasswordVisible ? 'text' : 'password'"
              :placeholder="t('password_placeholder', 'Parol kiriting')"
              class="w-full h-11 rounded-lg border border-gray-300 px-3 pr-10 text-sm outline-none focus:border-[#ff792d] bg-white"
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
