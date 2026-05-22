<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { toast } from 'vue-sonner'
import { AxiosError } from 'axios'
import { UploadCloud, X, Image as ImageIcon } from 'lucide-vue-next'

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { createTeacher, uploadTeacherPhoto, fetchRegions, fetchSchoolsByCity } from '../api'

const props = defineProps<{
  open: boolean
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
  staleTime: Infinity,
  enabled: computed(() => props.open)
})
const regions = computed(() => {
  const res = regionsRes.value as any
  return res?.data?.result || res?.result || []
})

const formSchema = toTypedSchema(
  z.object({
    firstName: z.string({ required_error: 'validation.required-field' }).min(1, { message: 'validation.required-field' }),
    lastName: z.string({ required_error: 'validation.required-field' }).min(1, { message: 'validation.required-field' }),
    email: z.string({ required_error: 'validation.required-field' }).email({ message: 'validation.email-should-be-valid' }),
    login: z.string({ required_error: 'validation.required-field' }).min(3, { message: 'validation.required-field' }),
    password: z.string({ required_error: 'validation.required-field' }).min(8, { message: 'validation.password-min' }),
    regionId: z.number({ required_error: 'validation.required-field' }),
    cityId: z.number({ required_error: 'validation.required-field' }),
    schoolId: z.number({ required_error: 'validation.required-field' })
  })
)

const { handleSubmit, resetForm, meta, values, setFieldValue } = useForm({
  validationSchema: formSchema,
  initialValues: {
    firstName: '',
    lastName: '',
    email: '',
    login: '',
    password: '',
    regionId: undefined as any,
    cityId: undefined as any,
    schoolId: undefined as any
  }
})

// 2. Cities list based on selected region
const availableCities = computed(() => {
  if (!values.regionId) return []
  const selectedRegion = regions.value.find((r: any) => r.id === values.regionId)
  return selectedRegion?.cities || []
})

// Reset city & school when region changes
watch(() => values.regionId, () => {
  setFieldValue('cityId', undefined as any)
  setFieldValue('schoolId', undefined as any)
})

// 3. Schools list based on selected city (district)
const { data: schoolsRes, isPending: isSchoolsLoading } = useQuery({
  queryKey: ['schools-by-city', values.cityId],
  queryFn: () => fetchSchoolsByCity(values.cityId as number),
  enabled: computed(() => !!values.cityId)
})
const schools = computed(() => {
  const res = schoolsRes.value as any
  return res?.data?.result?.data || res?.data?.data || res?.result?.data || []
})

// Reset school when city changes
watch(() => values.cityId, () => {
  setFieldValue('schoolId', undefined as any)
})

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
    toast.error('Faqat rasm fayllari qabul qilinadi')
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    toast.error('Rasm hajmi 5MB dan oshmasligi kerak')
    return
  }
  photoFile.value = file
  photoPreviewUrl.value = URL.createObjectURL(file)
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
  if (photoPreviewUrl.value) {
    URL.revokeObjectURL(photoPreviewUrl.value)
    photoPreviewUrl.value = null
  }
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

// Reset form & photo when sheet closes or opens
watch(() => props.open, (val) => {
  if (val) {
    resetForm()
    removePhoto()
  }
})

// Mutation to create teacher and upload photo
const { isPending: isSubmitPending, mutate } = useMutation({
  mutationFn: async (payload: any) => {
    // 1. Create Teacher
    const res = await createTeacher({
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      login: payload.login,
      password: payload.password,
      isDirectorOrAssistandDirector: false,
      schoolId: payload.schoolId,
      classId: 0 // defaulted to 0
    })

    const responseData = res.data as any
    const teacherId = responseData?.result?.id || responseData?.id || responseData?.result?.data?.id || responseData?.result
    
    if (!teacherId) {
      throw new Error('Teacher ID not returned from API')
    }

    // 2. Upload Photo if selected
    if (photoFile.value) {
      await uploadTeacherPhoto(teacherId, photoFile.value)
    }

    return res
  },
  onSuccess: () => {
    toast.success(t('success.teacher-added'))
    isOpen.value = false
    queryClient.invalidateQueries({ queryKey: ['teachers'] })
  },
  onError: (error: AxiosError) => {
    console.error('Create teacher error:', error)
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
    <SheetContent side="right" class="w-full sm:max-w-[500px] flex flex-col p-0 bg-white [&>button]:hidden">
      <SheetHeader
        class="flex flex-row items-center justify-between bg-white p-3 px-6 border-b border-gray-200 space-y-0">
        <SheetTitle class="text-[17px] font-semibold text-[#1b1b1b]">
          {{ t('new-teacher-add') }}
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

          <!-- Image Upload Drag and Drop -->
          <div class="space-y-1.5">
            <FormLabel class="text-sm font-semibold text-gray-700">Rasm (F.I.Sh)</FormLabel>
            <div
              @dragover="onDragOver"
              @dragleave="onDragLeave"
              @drop="onDrop"
              @click="triggerFileInput"
              :class="[
                'border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group min-h-[140px]',
                isDragging ? 'border-[#ff792d] bg-orange-50/20' : 'border-gray-300 hover:border-[#ff792d] hover:bg-orange-50/10'
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
                <div class="relative w-24 h-24 rounded-full overflow-hidden border border-gray-200 shadow-sm">
                  <img :src="photoPreviewUrl" class="w-full h-full object-cover" />
                  <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span class="text-white text-xs font-semibold">Tahrirlash</span>
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
                <div class="w-10 h-10 rounded-full bg-[#fdf2ec] text-[#ff792d] flex items-center justify-center mb-2">
                  <UploadCloud class="w-5 h-5" />
                </div>
                <div class="text-xs text-gray-600 font-semibold mb-1">
                  Rasm yuklash yoki bu yerga tortib olib keling
                </div>
                <div class="text-[10px] text-gray-400">
                  PNG, JPG yoki JPEG (maksimal 5MB)
                </div>
              </template>
            </div>
          </div>

          <!-- Region Dropdown -->
          <FormField v-slot="{ componentField }" name="regionId">
            <FormItem>
              <FormLabel class="text-sm font-semibold text-gray-700">{{ t('region') }}</FormLabel>
              <FormControl>
                <Select :model-value="componentField.modelValue ? String(componentField.modelValue) : undefined"
                  @update:model-value="(val) => componentField['onUpdate:modelValue']?.(Number(val))" name="regionId">
                  <SelectTrigger
                    class="h-11 border border-gray-300 rounded-lg text-gray-700 focus:ring-0 focus:ring-offset-0 focus:ring-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-transparent focus:border-primary focus-visible:border-primary bg-white">
                    <SelectValue :placeholder="t('select-region')" />
                  </SelectTrigger>
                  <SelectContent class="bg-white">
                    <SelectItem v-for="region in regions" :key="region.id" :value="String(region.id)">
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
              <FormLabel class="text-sm font-semibold text-gray-700">{{ t('city-label') }}</FormLabel>
              <FormControl>
                <Select :model-value="componentField.modelValue ? String(componentField.modelValue) : undefined"
                  @update:model-value="(val) => componentField['onUpdate:modelValue']?.(Number(val))" name="cityId">
                  <SelectTrigger
                    class="h-11 border border-gray-300 rounded-lg text-gray-700 focus:ring-0 focus:ring-offset-0 focus:ring-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-transparent focus:border-primary focus-visible:border-primary bg-white"
                    :disabled="!values.regionId">
                    <SelectValue :placeholder="t('select-city')" />
                  </SelectTrigger>
                  <SelectContent class="bg-white">
                    <SelectItem v-for="city in availableCities" :key="city.id" :value="String(city.id)">
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
                <Select :model-value="componentField.modelValue ? String(componentField.modelValue) : undefined"
                  @update:model-value="(val) => componentField['onUpdate:modelValue']?.(Number(val))" name="schoolId">
                  <SelectTrigger
                    class="h-11 border border-gray-300 rounded-lg text-gray-700 focus:ring-0 focus:ring-offset-0 focus:ring-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-transparent focus:border-primary focus-visible:border-primary bg-white"
                    :disabled="!values.cityId || isSchoolsLoading">
                    <SelectValue :placeholder="isSchoolsLoading ? t('loading') + '...' : t('select-govt-type', 'Maktabni tanlang')" />
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

          <!-- First Name -->
          <FormField v-slot="{ componentField }" name="firstName">
            <FormItem>
              <FormLabel class="text-sm font-semibold text-gray-700">{{ t('firstName') }}</FormLabel>
              <FormControl>
                <Input type="text" v-bind="componentField" :placeholder="t('firstName_placeholder')"
                  class="h-11 border border-gray-300 rounded-lg focus:border-primary bg-white" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Last Name -->
          <FormField v-slot="{ componentField }" name="lastName">
            <FormItem>
              <FormLabel class="text-sm font-semibold text-gray-700">{{ t('lastName') }}</FormLabel>
              <FormControl>
                <Input type="text" v-bind="componentField" :placeholder="t('lastName_placeholder')"
                  class="h-11 border border-gray-300 rounded-lg focus:border-primary bg-white" />
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
                  class="h-11 border border-gray-300 rounded-lg focus:border-primary bg-white" />
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
                  class="h-11 border border-gray-300 rounded-lg focus:border-primary bg-white" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Password -->
          <FormField v-slot="{ componentField }" name="password">
            <FormItem>
              <FormLabel class="text-sm font-semibold text-gray-700">{{ t('password') }}</FormLabel>
              <FormControl>
                <Input type="password" v-bind="componentField" :placeholder="t('password_placeholder')"
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
          <Button type="submit" :loading="isSubmitPending" :disabled="!meta.valid || isSubmitPending"
            class="h-10 px-5 rounded-lg bg-[#ff792d] hover:bg-[#e05e1a] text-white font-medium transition-all shadow-none border-none disabled:opacity-60 disabled:cursor-not-allowed">
            {{ t('save') }}
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
