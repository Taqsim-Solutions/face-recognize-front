<script setup lang="ts">
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { deleteTeacher } from '../api'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import { ref } from 'vue'
import { KeyRound } from 'lucide-vue-next'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import EditTeacherDrawer from './EditTeacherDrawer.vue'
import UpdatePasswordDrawer from './UpdatePasswordDrawer.vue'
import type { TeacherModel } from '../types'

const props = defineProps<{
  teacher: TeacherModel
}>()

const { t } = useI18n()
const queryClient = useQueryClient()
const isDeleteDialogOpen = ref(false)
const isEditOpen = ref(false)
const isPasswordOpen = ref(false)

// Edit Action
const handleEdit = () => {
  isEditOpen.value = true
}

// Password Action
const handlePassword = () => {
  isPasswordOpen.value = true
}

// Delete Action
const { isPending: isDeletePending, mutate: performDelete } = useMutation({
  mutationFn: () => {
    return deleteTeacher(props.teacher.id)
  },
  onSuccess: () => {
    toast.success(t('teacher_deleted'))
    isDeleteDialogOpen.value = false
    queryClient.invalidateQueries({ queryKey: ['teachers'] })
  },
  onError: (error: any) => {
    console.error('deleteTeacher mutation failed:', error)
    toast.error(t('error_occurred'))
  }
})

const handleDeleteClick = () => {
  performDelete()
}
</script>

<template>
  <div class="flex items-center gap-2" @click.stop>
    <!-- Edit Button (Green) -->
    <button @click="handleEdit" :title="t('edit-teacher')"
      class="w-8 h-8 rounded-full flex items-center justify-center bg-[#E8F5E9] hover:bg-[#C8E6C9] text-[#2E7D32] transition-colors border-none shadow-none cursor-pointer">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path fill-rule="evenodd" clip-rule="evenodd"
          d="M5.68102 13.3356H2.66443V10.319C2.66443 10.0098 2.78721 9.71321 3.0059 9.49463L10.1609 2.33964C10.3795 2.12065 10.6762 1.99759 10.9856 1.99759C11.295 1.99759 11.5917 2.12065 11.8102 2.33964L13.6603 4.18975C13.8793 4.40832 14.0024 4.70502 14.0024 5.01443C14.0024 5.32383 13.8793 5.62053 13.6603 5.8391L6.50536 12.9941C6.28661 13.2125 5.99017 13.3353 5.68102 13.3356Z"
          stroke="#006F1F" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M8.66699 3.99834L12.0017 7.33306" stroke="#006F1F" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M5.99915 10.0008L7.99998 8" stroke="#006F1F" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>

    <!-- Change Password Button (Blue) -->
    <button @click="handlePassword" :title="t('update-password')"
      class="w-8 h-8 rounded-full flex items-center justify-center bg-[#E3F2FD] hover:bg-[#BBDEFB] text-[#1976D2] transition-colors border-none shadow-none cursor-pointer">
      <KeyRound class="w-4 h-4" />
    </button>

    <!-- Delete Button (Red) -->
    <button @click="isDeleteDialogOpen = true" :title="t('delete-teacher')"
      class="w-8 h-8 rounded-full flex items-center justify-center bg-[#FFEBEE] hover:bg-[#FFCDD2] text-[#C62828] transition-colors border-none shadow-none cursor-pointer">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M12 4L4 12M4 4L12 12" stroke="#FF4345" stroke-width="1.5" stroke-linecap="round"
          stroke-linejoin="round" />
      </svg>
    </button>

    <!-- Deletion Confirmation Dialog -->
    <Dialog v-model:open="isDeleteDialogOpen">
      <DialogContent class="sm:max-w-[460px] !rounded-xl p-5 gap-0 border-none bg-white">
        <DialogHeader class="border-b border-gray-300 pb-3 text-left">
          <DialogTitle class="text-base sm:text-lg font-semibold text-[#1b1b1b] -mt-1">
            {{ t('delete-teacher') }}
          </DialogTitle>
        </DialogHeader>
        <!-- Custom Close Button -->
        <button type="button" @click="isDeleteDialogOpen = false"
          class="absolute z-10 right-3 top-3 rounded-full border border-gray-200 w-8 h-8 flex items-center justify-center hover:text-gray-600 hover:bg-gray-50 transition-all cursor-pointer bg-white">
          <svg class="ml-0.5" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 12 12">
            <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
        </button>
        <div class="py-7 text-center">
          <p class="text-base sm:text-base text-[#1b1b1b] leading-relaxed font-semibold max-w-[280px] sm:max-w-[380px] mx-auto">
            {{ t('confirm-delete-teacher-msg') }}
          </p>
        </div>
        <div class="flex items-center justify-end gap-3 pt-10">
          <Button type="button" variant="outline" @click="isDeleteDialogOpen = false" :disabled="isDeletePending"
            class="h-10 px-5 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold text-sm shadow-none cursor-pointer transition-all bg-white">
            {{ t('cancel') }}
          </Button>
          <Button type="button" @click="handleDeleteClick" :loading="isDeletePending" :disabled="isDeletePending"
            class="h-10 px-5 bg-[#f27a3a] hover:bg-[#e06c27] text-white rounded-lg font-semibold text-sm shadow-none cursor-pointer transition-all border-none">
            {{ t('delete') }}
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    <!-- Edit Teacher Drawer -->
    <EditTeacherDrawer v-model:open="isEditOpen" :teacher="props.teacher" />

    <!-- Change Password Drawer -->
    <UpdatePasswordDrawer v-model:open="isPasswordOpen" :teacher-id="props.teacher.id" />
  </div>
</template>
