<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { toast } from 'vue-sonner'
import { AxiosError } from 'axios'
import { UploadCloud, X, Camera } from 'lucide-vue-next'

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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  updateStudent,
  postStudentPhoto,
  fetchRegions,
  fetchSchoolsByCity,
  fetchClassesBySchool
} from '../api'
import type { StudentModel } from '../types'
import { useCameraCapture } from '@/composables/useCameraCapture'

const props = defineProps<{
  open: boolean
  student: StudentModel
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

// Photo + camera logic (shared composable)
const {
  photoFile, photoPreviewUrl, isDragging, fileInputRef,
  triggerFileInput, handleFileSelect, removePhoto,
  onDragOver, onDragLeave, onDrop,
  isCameraOpen, videoRef, cameraError,
  openCamera, closeCamera, capturePhoto
} = useCameraCapture()

// Cascade APIs
const { data: regionsRes } = useQuery({
  queryKey: ['regions'],
  queryFn: fetchRegions,
  staleTime: Infinity
})
const regions = computed(() => {
  const res = regionsRes.value as any
  return res?.data?.result || res?.result || []
})

const formSchema = toTypedSchema(
  z.object({
    regionId: z.number({ required_error: 'validation.required-field' }),
    cityId: z.number({ required_error: 'validation.required-field' }),
    schoolId: z.number({ required_error: 'validation.required-field' }),
    classId: z.number({ required_error: 'validation.required-field' }),
    lastName: z
      .string({ required_error: 'validation.required-field' })
      .min(1, { message: 'validation.required-field' }),
    firstName: z
      .string({ required_error: 'validation.required-field' })
      .min(1, { message: 'validation.required-field' }),
    fatherName: z
      .string({ required_error: 'validation.required-field' })
      .min(1, { message: 'validation.required-field' }),
    phoneNumber: z
      .string({ required_error: 'validation.required-field' })
      .min(1, { message: 'validation.required-field' })
      .refine((v) => isValidPhone(v), { message: 'validation.phone-number-should-be-valid' }),
    fatherFullName: z.string().optional().nullable(),
    motherFullName: z.string().optional().nullable(),
    additionalPhoneNumber: z
      .string()
      .optional()
      .nullable()
      .refine((v) => !v || isValidPhone(v), { message: 'validation.phone-number-should-be-valid' })
  })
)

const { handleSubmit, resetForm, meta, values, setFieldValue } = useForm({
  validationSchema: formSchema,
  initialValues: {
    regionId: undefined as any,
    cityId: undefined as any,
    schoolId: undefined as any,
    classId: undefined as any,
    lastName: '',
    firstName: '',
    fatherName: '',
    phoneNumber: '',
    fatherFullName: '',
    motherFullName: '',
    additionalPhoneNumber: ''
  }
})

const isPrefilling = ref(false)

// Prefill form when drawer opens or student changes
watch(
  () => props.open,
  (isOpenVal) => {
    if (isOpenVal && props.student) {
      isPrefilling.value = true

      const matchedRegionId = props.student.regionId ? Number(props.student.regionId)
        : props.student.region?.id ? Number(props.student.region.id) : undefined
      const matchedCityId = props.student.cityId ? Number(props.student.cityId)
        : props.student.city?.id ? Number(props.student.city.id) : undefined
      const matchedSchoolId = props.student.schoolId ? Number(props.student.schoolId) : undefined
      const matchedClassId = props.student.classId ? Number(props.student.classId) : undefined

      const father = props.student.parents?.find((p) => p.gender === 0)
      const mother = props.student.parents?.find((p) => p.gender === 1)

      const fName = father
        ? `${father.lastName || ''} ${father.firstName || ''} ${father.fatherName || ''}`.trim()
        : ''
      const mName = mother
        ? `${mother.lastName || ''} ${mother.firstName || ''} ${mother.fatherName || ''}`.trim()
        : ''

      resetForm({
        values: {
          regionId: matchedRegionId,
          cityId: matchedCityId,
          schoolId: matchedSchoolId,
          classId: matchedClassId,
          lastName: props.student.lastName || '',
          firstName: props.student.firstName || '',
          fatherName: props.student.fatherName || '',
          phoneNumber: props.student.phoneNumber || '',
          fatherFullName: fName,
          motherFullName: mName,
          additionalPhoneNumber: mother?.phoneNumber || ''
        }
      })

      // Set photo preview to student's existing profile photo if any
      photoFile.value = null
      const lastImage = props.student.mainImageName || (props.student.imageIds && props.student.imageIds.length > 0
        ? props.student.imageIds[props.student.imageIds.length - 1]
        : null)

      photoPreviewUrl.value = lastImage
        ? `/api/images?filename=${lastImage}`
        : null

      nextTick(() => {
        isPrefilling.value = false
      })
    }
  },
  { immediate: true }
)

// 2. Cities list based on selected region
const availableCities = computed(() => {
  if (!values.regionId) return []
  const selectedRegion = regions.value.find((r: any) => r.id === values.regionId)
  return selectedRegion?.cities || []
})

// Reset city & school when region changes (skip during prefill)
watch(
  () => values.regionId,
  () => {
    if (isPrefilling.value) return
    setFieldValue('cityId', undefined as any)
    setFieldValue('schoolId', undefined as any)
  }
)

// 3. Schools list based on selected city (district)
const { data: schoolsRes } = useQuery({
  queryKey: ['schools-by-city', values.cityId],
  queryFn: () => fetchSchoolsByCity(values.cityId as number),
  enabled: () => !!values.cityId
})
const schools = computed(() => {
  const res = schoolsRes.value as any
  return res?.data?.result?.data || res?.data?.data || res?.result?.data || []
})

// Reset school when city changes (skip during prefill)
watch(
  () => values.cityId,
  () => {
    if (isPrefilling.value) return
    setFieldValue('schoolId', undefined as any)
  }
)

// 4. Classes list based on selected school
const { data: classesRes } = useQuery({
  queryKey: ['classes-by-school', values.schoolId],
  queryFn: () => fetchClassesBySchool(values.schoolId as number),
  enabled: () => !!values.schoolId
})
const classes = computed(() => {
  const res = classesRes.value as any
  const rawList = res?.data?.result?.data || res?.data?.result || res?.result?.data || []

  return rawList
    .filter((cls: any) => {
      if (!cls) return false
      // Keep named classes (e.g. "Yulduzcha") that have a Name but no numeric grade.
      if (cls.name && String(cls.name).trim() && (!cls.degree || Number(cls.degree) < 1)) return true
      const deg = Number(cls.degree)
      if (isNaN(deg) || deg < 1 || deg > 11) return false
      return true
    })
    .sort((a: any, b: any) => {
      const degA = Number(a.degree) || 0
      const degB = Number(b.degree) || 0
      if (degA !== degB) {
        return degA - degB
      }
      const symA = (a.symbol || '').trim().toUpperCase()
      const symB = (b.symbol || '').trim().toUpperCase()
      return symA.localeCompare(symB, 'uz-UZ')
    })
})

// Reset class when school changes (skip during prefill)
watch(
  () => values.schoolId,
  () => {
    if (isPrefilling.value) return
    setFieldValue('classId', undefined as any)
  }
)



// Helper to split parent F.I.Sh
const parseParentFullName = (fullName: string) => {
  const parts = (fullName || '').trim().split(/\s+/)
  return {
    lastName: parts[0] || '',
    firstName: parts[1] || '',
    fatherName: parts.slice(2).join(' ') || ''
  }
}

// Mutation to update student
const { isPending: isSubmitPending, mutate } = useMutation({
  mutationFn: async (payload: any) => {
    const fatherParsed = parseParentFullName(payload.fatherFullName)
    const motherParsed = parseParentFullName(payload.motherFullName)

    const dateOfBirthStudent = props.student.dateOfBirth || new Date(Date.now() - 12 * 365 * 24 * 60 * 60 * 1000).toISOString()
    const dateOfBirthParent = new Date(Date.now() - 40 * 365 * 24 * 60 * 60 * 1000).toISOString()

    const mainPhone = toE164(payload.phoneNumber)
    const addPhone = payload.additionalPhoneNumber ? toE164(payload.additionalPhoneNumber) : ''

    const updatePayload: any = {
      classId: payload.classId,
      firstName: payload.firstName,
      lastName: payload.lastName,
      fatherName: payload.fatherName,
      dateOfBirth: dateOfBirthStudent,
      phoneNumber: mainPhone,
      gender: props.student.gender || 0,
      father: {
        firstName: fatherParsed.firstName,
        lastName: fatherParsed.lastName,
        fatherName: fatherParsed.fatherName,
        dateOfBirth: dateOfBirthParent,
        phoneNumber: mainPhone,
        passport: "",
        workplace: ""
      },
      mother: {
        firstName: motherParsed.firstName,
        lastName: motherParsed.lastName,
        fatherName: motherParsed.fatherName,
        dateOfBirth: dateOfBirthParent,
        phoneNumber: addPhone || mainPhone,
        passport: "",
        workplace: ""
      }
    }

    const res = await updateStudent({ id: props.student.id, payload: updatePayload })

    // Upload photo via POST /api/students/{id}/photo — backend stores a single
    // photo per student (the new one replaces any existing one and becomes main).
    if (photoFile.value) {
      await postStudentPhoto(props.student.id, photoFile.value)
    }

    return res
  },
  onSuccess: () => {
    toast.success(t('success.student-updated', "O'quvchi muvaffaqiyatli tahrirlandi"))
    isOpen.value = false
    queryClient.invalidateQueries({ queryKey: ['students'] })
  },
  onError: (error: AxiosError) => {
    console.error('Update student error:', error)
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
  mutate(formValues)
})

const handleCancel = () => {
  isOpen.value = false
}
</script>

<template>
  <Sheet v-model:open="isOpen">
    <SheetContent
      side="right"
      class="w-full sm:max-w-[480px] p-0 flex flex-col h-full bg-[#f8faf9] border-l border-gray-200 shadow-xl"
    >
      <SheetHeader
        class="flex flex-row items-center justify-between bg-white p-3 px-6 border-b border-gray-200 space-y-0"
      >
        <SheetTitle class="text-[17px] font-semibold text-[#1b1b1b]">
          {{ t('edit-student', "O'quvchini tahrirlash") }}
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
        <div class="flex-1 overflow-y-auto px-6 space-y-4 pb-10 pt-4">
          <!-- Region Dropdown (Disabled during Edit) -->
          <FormField v-slot="{ componentField }" name="regionId">
            <FormItem>
              <FormLabel class="text-sm font-semibold text-gray-700">{{ t('region', 'Viloyat/Shahar') }}</FormLabel>
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

          <!-- City Dropdown (Disabled during Edit) -->
          <FormField v-slot="{ componentField }" name="cityId">
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

          <!-- School Dropdown (Disabled during Edit) -->
          <FormField v-slot="{ componentField }" name="schoolId">
            <FormItem>
              <FormLabel class="text-sm font-semibold text-gray-700">{{ t('school') }}</FormLabel>
              <FormControl>
                <Select
                  :model-value="
                    componentField.modelValue ? String(componentField.modelValue) : undefined
                  "
                  @update:model-value="
                    (val) => componentField['onUpdate:modelValue']?.(Number(val))
                  "
                  name="schoolId"
                  
                >
                  <SelectTrigger
                    class="h-11 border border-gray-300 rounded-lg text-gray-700 focus:ring-0 focus:ring-offset-0 focus:ring-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-transparent focus:border-primary focus-visible:border-primary bg-white"
                  >
                    <SelectValue :placeholder="t('select-school')" />
                  </SelectTrigger>
                  <SelectContent class="bg-white">
                    <SelectItem
                      v-for="sc in schools"
                      :key="sc.id"
                      :value="String(sc.id)"
                    >
                      {{ sc.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Class Dropdown (Disabled during Edit) -->
          <FormField v-slot="{ componentField }" name="classId">
            <FormItem>
              <FormLabel class="text-sm font-semibold text-gray-700">{{ t('sinf', 'Sinf') }}</FormLabel>
              <FormControl>
                <Select
                  :model-value="
                    componentField.modelValue ? String(componentField.modelValue) : undefined
                  "
                  @update:model-value="
                    (val) => componentField['onUpdate:modelValue']?.(Number(val))
                  "
                  name="classId"
                  
                >
                  <SelectTrigger
                    class="h-11 border border-gray-300 rounded-lg text-gray-700 focus:ring-0 focus:ring-offset-0 focus:ring-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-transparent focus:border-primary focus-visible:border-primary bg-white"
                  >
                    <SelectValue :placeholder="t('select-class')" />
                  </SelectTrigger>
                  <SelectContent class="bg-white">
                    <SelectItem
                      v-for="cls in classes"
                      :key="cls.id"
                      :value="String(cls.id)"
                    >
                      {{ cls.name || (cls.degree + '-' + cls.symbol) }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Photo Uploader -->
          <div class="space-y-1.5">
            <label class="text-sm font-semibold text-gray-700 block">{{
              t('camera.upload-photo', 'Fotosuratni yuklang')
            }}</label>
            <div
              @dragover="onDragOver"
              @dragleave="onDragLeave"
              @drop="onDrop"
              @click="triggerFileInput"
              :class="[
                'border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group min-h-[140px]',
                isDragging
                  ? 'border-[#ff792d] bg-orange-50/20'
                  : 'border-gray-300 hover:border-[#ff792d] hover:bg-orange-50/10'
              ]"
            >
              <input
                ref="fileInputRef"
                type="file"
                class="hidden"
                accept="image/png, image/jpeg, image/jpg"
                @change="handleFileSelect"
              />

              <template v-if="photoPreviewUrl">
                <div
                  class="relative w-24 h-24 rounded-full overflow-hidden border border-gray-200 shadow-sm"
                >
                  <img :src="photoPreviewUrl" class="w-full h-full object-cover" />
                  <div
                    class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <span class="text-white text-xs font-semibold">{{ t('edit') }}</span>
                  </div>
                </div>
                <!-- Remove Button -->
                <button
                  type="button"
                  @click.stop="removePhoto"
                  class="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/95 hover:bg-red-50 text-gray-500 hover:text-red-600 flex items-center justify-center shadow-sm border border-gray-100 transition-all z-10 cursor-pointer"
                >
                  <X class="w-4 h-4" />
                </button>
              </template>

              <template v-else>
                <div
                  class="w-10 h-10 rounded-full bg-[#fdf2ec] text-[#ff792d] flex items-center justify-center mb-2"
                >
                  <UploadCloud class="w-5 h-5" />
                </div>
                <div class="text-xs text-gray-600 font-semibold mb-1 text-center">
                  {{
                    t('camera.drag-drop-text', 'Rasmni yuklash uchun bu yerga sudrab olib keling')
                  }}
                </div>
                <div class="text-[10px] text-gray-400 mb-4 text-center">
                  {{
                    t('camera.drag-drop-subtext', 'JPG yoki PNG formatida, maksimal hajmi 10 MB')
                  }}
                </div>
                <div class="flex items-center gap-3" @click.stop>
                  <button
                    type="button"
                    @click="triggerFileInput"
                    class="h-9 px-4 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs transition-all cursor-pointer bg-white"
                  >
                    {{ t('camera.select-file', 'Fayl tanlash') }}
                  </button>
                  <button
                    type="button"
                    @click="openCamera"
                    class="h-9 px-4 rounded-lg bg-[#ff792d] hover:bg-[#e05e1a] text-white font-semibold text-xs transition-all flex items-center gap-1.5 shadow-none border-none cursor-pointer"
                  >
                    <Camera class="w-3.5 h-3.5" />
                    {{ t('camera.open-camera', 'Kamerani ochish') }}
                  </button>
                </div>
              </template>
            </div>
          </div>

          <!-- Familiya -->
          <FormField v-slot="{ componentField }" name="lastName">
            <FormItem>
              <FormLabel class="text-sm font-semibold text-gray-700">{{ t('lastName', 'Familiya') }}</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  v-bind="componentField"
                  placeholder="Familiyani kiriting"
                  class="h-11 border border-gray-300 rounded-lg focus:border-primary bg-white"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Ism -->
          <FormField v-slot="{ componentField }" name="firstName">
            <FormItem>
              <FormLabel class="text-sm font-semibold text-gray-700">{{ t('firstName', 'Ism') }}</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  v-bind="componentField"
                  placeholder="Ismni kiriting"
                  class="h-11 border border-gray-300 rounded-lg focus:border-primary bg-white"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Sharif -->
          <FormField v-slot="{ componentField }" name="fatherName">
            <FormItem>
              <FormLabel class="text-sm font-semibold text-gray-700">{{ t('teacher-middleName', 'Sharif') }}</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  v-bind="componentField"
                  placeholder="Otasining ismini kiriting"
                  class="h-11 border border-gray-300 rounded-lg focus:border-primary bg-white"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Ota yoki Ona tel raqami -->
          <FormField v-slot="{ componentField }" name="phoneNumber">
            <FormItem>
              <FormLabel class="text-sm font-semibold text-gray-700">{{ t('parent_phone', 'Ota yoki Ona telefon raqami') }}</FormLabel>
              <FormControl>
                <PhoneInput
                  :model-value="componentField.modelValue"
                  @update:model-value="componentField['onUpdate:modelValue']"
                  placeholder="+998 90 123 45 67"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Otasining F.I.Sh -->
          <FormField v-slot="{ componentField }" name="fatherFullName">
            <FormItem>
              <FormLabel class="text-sm font-semibold text-gray-700">{{ t('father_fullname', 'Otasining F.I.Sh') }}</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  v-bind="componentField"
                  placeholder="Familiya Ism Sharif"
                  class="h-11 border border-gray-300 rounded-lg focus:border-primary bg-white"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Onasining F.I.O -->
          <FormField v-slot="{ componentField }" name="motherFullName">
            <FormItem>
              <FormLabel class="text-sm font-semibold text-gray-700">{{ t('mother_fullname', 'Onasining F.I.O') }}</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  v-bind="componentField"
                  placeholder="Familiya Ism Sharif"
                  class="h-11 border border-gray-300 rounded-lg focus:border-primary bg-white"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Qo'shimcha telefon raqam -->
          <FormField v-slot="{ componentField }" name="additionalPhoneNumber">
            <FormItem>
              <FormLabel class="text-sm font-semibold text-gray-700">{{ t('additional_phone', 'Qo\'shimcha telefon raqam') }}</FormLabel>
              <FormControl>
                <PhoneInput
                  :model-value="componentField.modelValue"
                  @update:model-value="componentField['onUpdate:modelValue']"
                  placeholder="+998 90 123 45 67"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>

        <!-- Sticky Footer -->
        <div class="border-t border-gray-200 bg-white p-4 px-6 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            @click="handleCancel"
            :disabled="isSubmitPending"
            class="h-11 px-6 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold text-sm shadow-none cursor-pointer bg-white transition-all"
          >
            {{ t('cancel') }}
          </Button>
          <Button
            type="submit"
            :loading="isSubmitPending"
            :disabled="isSubmitPending || !meta.valid"
            class="h-11 px-6 bg-[#ff792d] hover:bg-[#e06c27] text-white rounded-lg font-semibold text-sm shadow-none cursor-pointer transition-all border-none"
          >
            {{ t('save', 'Saqlash va qo\'shish') }}
          </Button>
        </div>
      </form>
    </SheetContent>
  </Sheet>

  <!-- Live Camera Modal -->
  <Dialog v-model:open="isCameraOpen">
    <DialogContent class="sm:max-w-[540px] p-5 rounded-xl border-none bg-white">
      <DialogHeader class="border-b pb-3 flex flex-row items-center justify-between">
        <DialogTitle class="text-lg font-bold text-gray-800 -mt-1">
          {{ t('camera.capture-photo-title', 'Rasmga olish') }}
        </DialogTitle>
      </DialogHeader>
      <button
        type="button"
        @click="closeCamera"
        class="absolute right-3 top-3 w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 bg-white cursor-pointer z-50 text-gray-600"
      >
        <X class="w-4 h-4" />
      </button>

      <div class="flex flex-col items-center justify-center pt-4">
        <div
          v-if="cameraError"
          class="text-red-500 text-sm font-semibold p-4 text-center bg-red-50 rounded-lg border border-red-100"
        >
          {{ cameraError }}
        </div>
        <div
          v-else
          class="relative w-full max-w-[480px] aspect-[4/3] bg-black rounded-lg overflow-hidden border border-gray-200 shadow-inner flex items-center justify-center"
        >
          <video
            ref="videoRef"
            autoplay
            playsinline
            class="w-full h-full object-cover transform -scale-x-100"
          ></video>
        </div>
      </div>

      <div class="flex items-center justify-end gap-3 pt-6 border-t mt-4">
        <Button
          type="button"
          variant="outline"
          @click="closeCamera"
          class="h-10 px-5 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold text-sm cursor-pointer transition-all bg-white"
        >
          {{ t('cancel') }}
        </Button>
        <Button
          v-if="!cameraError"
          type="button"
          @click="capturePhoto"
          class="h-10 px-5 bg-[#ff792d] hover:bg-[#e06c27] text-white rounded-lg font-semibold text-sm cursor-pointer transition-all flex items-center gap-1.5 border-none"
        >
          <Camera class="w-4 h-4" />
          {{ t('camera.capture', 'Rasmga olish') }}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
