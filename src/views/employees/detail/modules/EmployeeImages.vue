<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import { Trash2, Upload, Loader2 } from 'lucide-vue-next'
import {
  getEmployeeFiles,
  uploadEmployeeFile,
  deleteEmployeeFile,
  type EmployeeFile
} from '../api/employeeFiles'

const props = defineProps<{
  employeeId: string
}>()

const { t } = useI18n()
const queryClient = useQueryClient()

const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)

const queryKey = ['employee-files', props.employeeId]

const { data: filesResponse, isLoading } = useQuery({
  queryKey,
  queryFn: () =>
    getEmployeeFiles({ employeeId: props.employeeId, type: 'faceImage', isAll: true }),
  staleTime: 60000
})

const files = computed(() => filesResponse.value?.data?.data || [])

const { mutate: uploadFile, isPending: isUploading } = useMutation({
  mutationFn: (file: File) =>
    uploadEmployeeFile({ employeeId: props.employeeId, file, type: 'faceImage' }),
  onSuccess: () => {
    toast.success(t('image-uploaded'))
    queryClient.invalidateQueries({ queryKey })
  },
  onError: () => {
    toast.error(t('error-occurred'))
  }
})

const { mutate: deleteFile, isPending: isDeleting } = useMutation({
  mutationFn: (id: string) => deleteEmployeeFile(id),
  onSuccess: () => {
    toast.success(t('image-deleted'))
    queryClient.invalidateQueries({ queryKey })
  },
  onError: () => {
    toast.error(t('error-occurred'))
  }
})

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp']
const MAX_SIZE_BYTES = 2 * 1024 * 1024 // 2MB

const validateFile = (file: File): boolean => {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    toast.error(t('invalid-image-format'))
    return false
  }
  if (file.size > MAX_SIZE_BYTES) {
    toast.error(t('image-too-large'))
    return false
  }
  return true
}

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    if (validateFile(target.files[0])) {
      uploadFile(target.files[0])
    }
    target.value = ''
  }
}

const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file && validateFile(file)) {
    uploadFile(file)
  }
}

// Add cache-busting query param to avoid showing old image
const getFileUrl = (file: EmployeeFile) => {
  return `/api/employee-files/${file.id}/download?cb=${Date.now()}`
}
</script>

<template>
  <div class="border border-[#E0E6F0] rounded-lg mt-6">
    <h3 class="text-lg text-[#111625] font-bold p-4 border-[#E0E6F0] border-b flex items-center gap-2">
      {{ t('employee-photos') }}
    </h3>

    <div class="p-4">
      <!-- Loading state -->
      <div v-if="isLoading" class="flex items-center justify-center py-8">
        <Loader2 class="w-6 h-6 animate-spin text-[#8796AF]" />
      </div>

      <template v-else>
        <!-- Images grid + Upload button -->
        <div class="flex flex-wrap gap-3">
          <!-- Existing images -->
          <div
            v-for="file in files"
            :key="file.id"
            class="relative group w-24 h-24 rounded-xl overflow-hidden border border-[#E0E6F0] bg-[#F7F9FB] flex items-center justify-center"
          >
            <img
              :src="getFileUrl(file)"
              :alt="file.name"
              class="w-full h-full object-cover"
            />
            <!-- Delete overlay -->
            <div
              class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <button
                @click="deleteFile(file.id)"
                :disabled="isDeleting"
                class="p-1.5 bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50"
                :title="t('delete')"
              >
                <Loader2 v-if="isDeleting" class="w-4 h-4 text-white animate-spin" />
                <Trash2 v-else class="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          <!-- Upload / Drop zone button -->
          <div
            @dragover.prevent="isDragging = true"
            @dragleave="isDragging = false"
            @drop.prevent="handleDrop"
            @click="fileInputRef?.click()"
            :class="[
              'w-24 h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer transition-all',
              isDragging
                ? 'border-primary bg-primary/5 scale-105'
                : 'border-[#E0E6F0] hover:border-primary/60 hover:bg-[#F7F9FB] bg-white'
            ]"
          >
            <Loader2 v-if="isUploading" class="w-5 h-5 animate-spin text-primary" />
            <template v-else>
              <Upload class="w-5 h-5 text-[#8796AF]" />
              <span class="text-[10px] text-[#8796AF] font-medium text-center leading-tight px-1">
                {{ t('add-photo') }}
              </span>
            </template>
          </div>

          <input
            ref="fileInputRef"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/bmp"
            class="hidden"
            @change="handleFileChange"
          />
        </div>

        <!-- Empty state -->
        <p v-if="!files.length && !isLoading" class="text-sm text-[#8796AF] mt-3">
          {{ t('no-photos-yet') }}
        </p>
      </template>
    </div>
  </div>
</template>