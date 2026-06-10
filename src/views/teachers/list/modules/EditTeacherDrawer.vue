<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { toast } from 'vue-sonner'
import { AxiosError } from 'axios'
import { X } from 'lucide-vue-next'

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet'
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  updateTeacher,
  uploadTeacherPhoto,
  fetchRegions,
  fetchSchoolsByCity,
  fetchClassesBySchool
} from '../api'
import type { TeacherModel } from '../types'

const props = defineProps<{
  open: boolean
  teacher: TeacherModel
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

// Photo state
const photoFile = ref<File | null>(null)
const photoPreviewUrl = ref<string | null>(null)
const isDragging = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

// Cascade APIs
// 1. Fetch Regions
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
    firstName: z
      .string({ required_error: 'validation.required-field' })
      .min(1, { message: 'validation.required-field' }),
    lastName: z
      .string({ required_error: 'validation.required-field' })
      .min(1, { message: 'validation.required-field' }),
    login: z
      .string({ required_error: 'validation.required-field' })
      .min(7, { message: 'validation.required-field' }),
    regionId: z.number({ required_error: 'validation.required-field' }),
    cityId: z.number({ required_error: 'validation.required-field' }),
    schoolId: z.number({ required_error: 'validation.required-field' }),
    classId: z.number().nullable().optional(),
    isTeacher: z.boolean().optional()
  })
)

const { handleSubmit, resetForm, meta, values, setFieldValue } = useForm({
  validationSchema: formSchema,
  initialValues: {
    firstName: '',
    lastName: '',
    login: '',
    regionId: undefined as any,
    cityId: undefined as any,
    schoolId: undefined as any,
    classId: undefined as any,
    isTeacher: true
  }
})

const isPrefilling = ref(false)

// Prefill form when drawer opens or teacher changes
watch(
  () => props.open,
  (isOpenVal) => {
    if (isOpenVal && props.teacher) {
      isPrefilling.value = true

      const matchedRegionId = props.teacher.region?.id ? Number(props.teacher.region.id) : undefined
      const matchedCityId = props.teacher.city?.id ? Number(props.teacher.city.id) : undefined
      const matchedSchoolId = props.teacher.schoolId ? Number(props.teacher.schoolId) : undefined
      const matchedClassId = props.teacher.class?.id ? Number(props.teacher.class.id) : undefined

      resetForm({
        values: {
          firstName: props.teacher.firstName || '',
          lastName: props.teacher.lastName || '',
          login: props.teacher.login || '',
          regionId: matchedRegionId,
          cityId: matchedCityId,
          schoolId: matchedSchoolId,
          classId: matchedClassId,
          isTeacher: props.teacher.isTeacher !== false
        }
      })

      // Set photo preview to teacher's existing profile photo if any
      photoFile.value = null
      const lastImage =
        props.teacher.imageIds && props.teacher.imageIds.length > 0
          ? props.teacher.imageIds[props.teacher.imageIds.length - 1]
          : props.teacher.mainImageName

      photoPreviewUrl.value = lastImage ? `/api/images?filename=${lastImage}` : null

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

// 3. Schools list based on selected city
const { data: schoolsRes, isPending: isSchoolsLoading } = useQuery({
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
const { data: classesRes, isPending: isClassesLoading } = useQuery({
  queryKey: ['classes-by-school', values.schoolId],
  queryFn: () => fetchClassesBySchool(values.schoolId as number),
  enabled: () => !!values.schoolId
})
const classes = computed(() => {
  const res = classesRes.value as any
  const rawList = res?.data?.result?.data || res?.data?.result || res?.result?.data || []

  const allowedSymbols = new Set([
    // Latin common class letters
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    // Cyrillic common class letters
    'А',
    'Б',
    'В',
    'Г',
    'Д',
    'Е'
  ])

  return rawList
    .filter((cls: any) => {
      if (!cls) return false
      const deg = Number(cls.degree)
      if (isNaN(deg) || deg < 1 || deg > 11) return false

      const sym = (cls.symbol || '').trim().toUpperCase()
      return allowedSymbols.has(sym)
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

// Photo drag & drop handlers
const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    processFile(file)
  }
}

const processFile = (file: File) => {
  if (!file.type.startsWith('image/')) {
    toast.error(t('validation.only-images-allowed', 'Faqat rasm fayllari qabul qilinadi'))
    return
  }
  if (file.size > 10 * 1024 * 1024) {
    toast.error(t('validation.image-size-limit-10mb', 'Rasm hajmi 10MB dan oshmasligi kerak'))
    return
  }
  compressImage(file).then((compressed) => {
    photoFile.value = compressed
    photoPreviewUrl.value = URL.createObjectURL(compressed)
  })
}

const onDragOver = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = true
}

const onDragLeave = () => {
  isDragging.value = false
}

const onDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) {
    processFile(file)
  }
}

const removePhoto = () => {
  photoFile.value = null
  if (photoPreviewUrl.value && photoPreviewUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(photoPreviewUrl.value)
  }
  photoPreviewUrl.value = null
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

// Camera capture logic
const isCameraOpen = ref(false)
const videoRef = ref<HTMLVideoElement | null>(null)
const mediaStream = ref<MediaStream | null>(null)
const cameraError = ref<string | null>(null)

const openCamera = async () => {
  isCameraOpen.value = true
  cameraError.value = null
  await nextTick()
  try {
    let stream: MediaStream | null = null
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
      })
    } catch {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      })
    }
    mediaStream.value = stream
    if (videoRef.value) {
      videoRef.value.srcObject = stream
      videoRef.value.setAttribute('playsinline', 'true')
      videoRef.value.setAttribute('autoplay', 'true')
      try { await videoRef.value.play() } catch { /* ok */ }
    }
  } catch (err: any) {
    console.error('Kameraga kirishda xatolik:', err)
    cameraError.value = t(
      'camera.failed-to-start',
      "Kamerani ishga tushirib bo'lmadi. Kameraga ruxsat berilganini tekshiring."
    )
  }
}

const closeCamera = () => {
  if (mediaStream.value) {
    mediaStream.value.getTracks().forEach((track) => track.stop())
    mediaStream.value = null
  }
  isCameraOpen.value = false
}


// Compress image before upload (max 800px, 80% quality)
const compressImage = (file: File, maxSize = 800, quality = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width, height } = img
      if (width > maxSize || height > maxSize) {
        if (width > height) { height = Math.round(height * maxSize / width); width = maxSize }
        else { width = Math.round(width * maxSize / height); height = maxSize }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob((blob) => {
        if (blob) resolve(new File([blob], file.name, { type: 'image/jpeg' }))
        else resolve(file)
      }, 'image/jpeg', quality)
    }
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file) }
    img.src = url
  })
}

const capturePhoto = () => {
  if (videoRef.value) {
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.value.videoWidth || 640
    canvas.height = videoRef.value.videoHeight || 480
    const ctx = canvas.getContext('2d')
    if (ctx) {
      // Mirror the image to match screen preview
      // No mirror transform - capture as-is for correct face recognition
      ctx.drawImage(videoRef.value, 0, 0, canvas.width, canvas.height)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const file = new File([blob], `camera_${Date.now()}.jpg`, { type: 'image/jpeg' })
            photoFile.value = file

            if (
              photoPreviewUrl.value &&
              !photoPreviewUrl.value.startsWith('/api') &&
              photoPreviewUrl.value.startsWith('blob:')
            ) {
              URL.revokeObjectURL(photoPreviewUrl.value)
            }
            photoPreviewUrl.value = URL.createObjectURL(blob)

            closeCamera()
          }
        },
        'image/jpeg',
        0.95
      )
    }
  }
}

watch(isCameraOpen, (val) => {
  if (!val) {
    closeCamera()
  }
})

// Mutation to update teacher and optionally upload photo
const { isPending: isSubmitPending, mutate } = useMutation({
  mutationFn: async (formValues: any) => {
    // 1. Update Teacher
    await updateTeacher({
      id: props.teacher.id,
      payload: {
        firstName: formValues.firstName,
        lastName: formValues.lastName,
        login: formValues.login,
        isDirectorOrAssistandDirector: false,
        schoolId: formValues.schoolId,
        classId: formValues.isTeacher ? (formValues.classId || null) : null,
        isTeacher: formValues.isTeacher ?? true
      }
    })

    // 2. Upload Photo if a new file is explicitly selected
    if (photoFile.value) {
      await uploadTeacherPhoto(props.teacher.id, photoFile.value)
    }
  },
  onSuccess: () => {
    toast.success(t('success.teacher-updated'))
    isOpen.value = false
    queryClient.invalidateQueries({ queryKey: ['teachers'] })
  },
  onError: (error: AxiosError) => {
    console.error('Update teacher error:', error)
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
      class="w-full sm:max-w-[500px] flex flex-col p-0 bg-white [&>button]:hidden"
    >
      <SheetHeader
        class="flex flex-row items-center justify-between bg-white p-3 px-6 border-b border-gray-200 space-y-0"
      >
        <SheetTitle class="text-[17px] font-semibold text-[#1b1b1b]">
          {{ t('edit-teacher') }}
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
        <div class="flex-1 overflow-y-auto px-6 space-y-4 pb-10">
          <!-- Region Dropdown -->
          <FormField v-slot="{ componentField }" name="regionId">
            <FormItem>
              <FormLabel class="text-sm font-semibold text-gray-700">{{ t('region') }}</FormLabel>
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
                    :disabled="true"
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
                    class="h-11 border border-gray-300 rounded-lg text-gray-700 focus:ring-0 focus:ring-offset-0 focus:ring-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-transparent focus:border-primary focus-visible:border-primary bg-white opacity-60 cursor-not-allowed"
                    :disabled="true"
                  >
                    <SelectValue
                      :placeholder="
                        !values.regionId
                          ? t('select-region-first', 'Avval viloyatni tanlang')
                          : t('select-city')
                      "
                    />
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

          <!-- School Dropdown -->
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
                    class="h-11 border border-gray-300 rounded-lg text-gray-700 focus:ring-0 focus:ring-offset-0 focus:ring-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-transparent focus:border-primary focus-visible:border-primary bg-white opacity-60 cursor-not-allowed"
                    :disabled="true"
                  >
                    <SelectValue
                      :placeholder="
                        !values.cityId
                          ? t('select-city-first', 'Avval tumanni tanlang')
                          : isSchoolsLoading
                            ? t('loading') + '...'
                            : t('select-school', 'Maktabni tanlang')
                      "
                    />
                  </SelectTrigger>
                  <SelectContent class="bg-white">
                    <SelectItem v-for="sch in schools" :key="sch.id" :value="String(sch.id)">
                      {{ sch.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Is Teacher toggle -->
          <FormField v-slot="{ value, handleChange }" name="isTeacher">
            <FormItem>
              <div class="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
                <div>
                  <FormLabel class="text-sm font-semibold text-gray-700">
                    {{ t('is-teacher', "O'qituvchimi?") }}
                  </FormLabel>
                  <p class="text-xs text-gray-400 mt-0.5">
                    {{ t('is-teacher-hint', "O'chirilsa — xodim (qorovul, oshpaz va h.k.)") }}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  :aria-checked="value !== false"
                  @click="handleChange(value === false)"
                  class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors"
                  :class="value !== false ? 'bg-[#ff792d]' : 'bg-gray-300'"
                >
                  <span
                    class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                    :class="value !== false ? 'translate-x-6' : 'translate-x-1'"
                  />
                </button>
              </div>
            </FormItem>
          </FormField>

          <!-- Class Dropdown -->
          <FormField v-if="values.isTeacher !== false" v-slot="{ componentField }" name="classId">
            <FormItem>
              <FormLabel class="text-sm font-semibold text-gray-700">{{ t('sinf') }}</FormLabel>
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
                    class="h-11 border border-gray-300 rounded-lg text-gray-700 focus:ring-0 focus:ring-offset-0 focus:ring-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-transparent focus:border-primary focus-visible:border-primary bg-white opacity-60 cursor-not-allowed"
                    :disabled="true"
                  >
                    <SelectValue
                      :placeholder="
                        !values.schoolId
                          ? t('select-school-first', 'Avval maktabni tanlang')
                          : isClassesLoading
                            ? t('loading') + '...'
                            : t('select-class', 'Sinfni tanlang')
                      "
                    />
                  </SelectTrigger>
                  <SelectContent class="bg-white">
                    <SelectItem v-for="cls in classes" :key="cls.id" :value="String(cls.id)">
                      {{ cls.degree }}-{{ cls.symbol }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Image Upload Drag and Drop -->
          <div class="space-y-1.5">
            <label class="text-sm font-semibold text-gray-700">{{
              t('camera.upload-photo-label', 'Fotosuratni yuklang')
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="lucide lucide-upload-cloud"
                  >
                    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                    <path d="M12 12v9" />
                    <path d="m16 16-4-4-4 4" />
                  </svg>
                </div>
                <div class="text-sm text-gray-600 font-semibold mb-1 text-center">
                  {{
                    t('camera.drag-drop-text', 'Rasmni yuklash uchun bu yerga sudrab olib keling')
                  }}
                </div>
                <div class="text-[12px] text-gray-400 mb-4 text-center">
                  {{
                    t('camera.drag-drop-subtext', 'JPG yoki PNG formatida, maksimal hajmi 10 MB')
                  }}
                </div>
                <div class="flex items-center gap-3" @click.stop>
                  <button
                    type="button"
                    @click="triggerFileInput"
                    class="h-9 px-4 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-sm transition-all cursor-pointer bg-white"
                  >
                    {{ t('camera.select-file', 'Fayl tanlash') }}
                  </button>
                  <button
                    type="button"
                    @click="openCamera"
                    class="h-9 px-4 rounded-lg bg-[#ff792d] hover:bg-[#e05e1a] text-white font-semibold text-sm transition-all flex items-center gap-1.5 shadow-none border-none cursor-pointer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="lucide lucide-camera"
                    >
                      <path
                        d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"
                      />
                      <circle cx="12" cy="13" r="3" />
                    </svg>
                    {{ t('camera.open-camera', 'Kamerani ochish') }}
                  </button>
                </div>
              </template>
            </div>
          </div>

          <!-- First Name -->
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

          <!-- Last Name -->
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

          <!-- Login (phone number) -->
          <FormField v-slot="{ componentField }" name="login">
            <FormItem>
              <FormLabel class="text-sm font-semibold text-gray-700">{{ t('phone-login', 'Telefon raqam (login)') }}</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  v-bind="componentField"
                  :placeholder="t('phone-login-placeholder', '+998 90 123 45 67')"
                  class="h-11 border border-gray-300 rounded-lg focus:border-primary bg-white"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
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
            :loading="isSubmitPending"
            :disabled="!meta.valid || isSubmitPending"
            class="h-10 px-5 rounded-lg bg-[#ff792d] hover:bg-[#e05e1a] text-white font-medium transition-all shadow-none border-none disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {{ t('save') }}
          </Button>
        </div>
      </form>
      <!-- Camera Capture Dialog -->
      <Dialog v-model:open="isCameraOpen">
        <DialogContent class="sm:max-w-[500px] !rounded-xl p-5 gap-0 border-none bg-white">
          <DialogHeader class="border-b border-gray-300 pb-3 text-left">
            <DialogTitle class="text-base sm:text-lg font-semibold text-[#1b1b1b] -mt-1">
              {{ t('camera.capture-title', 'Kameradan rasmga olish') }}
            </DialogTitle>
          </DialogHeader>
          <!-- Custom Close Button -->
          <button
            type="button"
            @click="closeCamera"
            class="absolute z-10 right-3 top-3 rounded-full border border-gray-200 w-8 h-8 flex items-center justify-center hover:text-gray-600 hover:bg-gray-50 transition-all cursor-pointer bg-white"
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
          </button>

          <div class="py-5 flex flex-col items-center">
            <div
              class="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-900 border border-gray-200 flex items-center justify-center"
            >
              <template v-if="cameraError">
                <p class="text-sm text-red-500 font-semibold px-6 text-center">{{ cameraError }}</p>
              </template>
              <template v-else>
                <video
                  ref="videoRef"
                  autoplay
                  playsinline
                  class="w-full h-full object-cover transform scale-x-[-1]"
                ></video>
                <div
                  v-if="!mediaStream"
                  class="absolute inset-0 flex items-center justify-center bg-slate-950/80"
                >
                  <span class="text-white text-sm font-semibold flex items-center gap-2">
                    <svg
                      class="animate-spin h-5 w-5 text-[#ff792d]"
                      xmlns="http://www.w3.org/2000/svg"
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
                      ></circle>
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {{ t('camera.loading', 'Kamera yuklanmoqda...') }}
                  </span>
                </div>
              </template>
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 mt-2">
            <Button
              type="button"
              variant="outline"
              @click="closeCamera"
              class="h-10 px-5 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold text-sm shadow-none cursor-pointer transition-all bg-white"
            >
              {{ t('cancel') }}
            </Button>
            <Button
              type="button"
              @click="capturePhoto"
              :disabled="!mediaStream"
              class="h-10 px-5 bg-[#ff792d] hover:bg-[#e05e1a] text-white rounded-lg font-semibold text-sm shadow-none cursor-pointer transition-all border-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ t('camera.take-photo', 'Rasmga olish') }}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
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
