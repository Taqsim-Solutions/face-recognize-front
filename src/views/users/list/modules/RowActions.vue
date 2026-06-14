<script setup lang="ts">
import type { FlattenedData } from '../ui/UsersLIst.vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { deleteEmployee, changeUserStatus } from '../api'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import { ref, computed } from 'vue'
import { EntityStatus } from '@/constants/entityStatus'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import EditUserDrawer from './EditUserDrawer.vue'
import UpdatePasswordDrawer from './UpdatePasswordDrawer.vue'
import { AxiosError } from 'axios'

// Create employee Mutation
type ErrorResponse = {
  data: {
    error?: {
      code?: string
      errors?: string[]
      message?: string
    }
    message?: string
    isSuccess?: boolean
    status?: number
  }
}

const props = defineProps<{
  employee: FlattenedData
}>()

const { t } = useI18n()
const queryClient = useQueryClient()
const isDeleteDialogOpen = ref(false)
const isEditOpen = ref(false)
const isPasswordUpdateOpen = ref(false)

// 1. Edit Action
const handleEdit = () => {
  isEditOpen.value = true
}

// Lock toggle status mutation removed as button is now mapped to change password drawer

// 3. Delete Action
const { isPending: isDeletePending, mutate: performDelete } = useMutation({
  mutationFn: () => {
    console.log('performDelete mutationFn triggered for employee ID:', props.employee.id)
    return deleteEmployee(props.employee.id)
  },
  onSuccess: () => {
    console.log('performDelete mutation succeeded')
    toast.success(t('user_deleted'))
    isDeleteDialogOpen.value = false
    queryClient.invalidateQueries({ queryKey: ['employees'] })
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

const handleDeleteClick = () => {
  console.log('Delete button clicked! Calling performDelete()...')
  performDelete()
}

const isActive = computed(() => ((props.employee as any).status ?? EntityStatus.Active) === EntityStatus.Active)
const isDeletedStatus = computed(() => ((props.employee as any).status ?? EntityStatus.Active) === EntityStatus.Deleted)

const { isPending: isStatusPending, mutate: performStatusChange } = useMutation({
  mutationFn: (next: number) => changeUserStatus(props.employee.id, next),
  onSuccess: () => {
    toast.success(t('status-updated', 'Holat yangilandi'))
    queryClient.invalidateQueries({ queryKey: ['employees'] })
  },
  onError: (error: any) => {
    console.error('changeUserStatus failed:', error)
    toast.error(t('error_occurred'))
  }
})

const toggleStatus = () => {
  performStatusChange(isActive.value ? EntityStatus.Inactive : EntityStatus.Active)
}
</script>

<template>
  <div class="flex items-center gap-2" @click.stop>
    <!-- Edit Button (Green) -->
    <button
      @click="handleEdit"
      title="Edit"
      class="w-8 h-8 rounded-full flex items-center justify-center bg-[#E8F5E9] hover:bg-[#C8E6C9] text-[#2E7D32] transition-colors border-none shadow-none cursor-pointer"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M5.68102 13.3356H2.66443V10.319C2.66443 10.0098 2.78721 9.71321 3.0059 9.49463L10.1609 2.33964C10.3795 2.12065 10.6762 1.99759 10.9856 1.99759C11.295 1.99759 11.5917 2.12065 11.8102 2.33964L13.6603 4.18975C13.8793 4.40832 14.0024 4.70502 14.0024 5.01443C14.0024 5.32383 13.8793 5.62053 13.6603 5.8391L6.50536 12.9941C6.28661 13.2125 5.99017 13.3353 5.68102 13.3356Z"
          stroke="#006F1F"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M8.66699 3.99834L12.0017 7.33306"
          stroke="#006F1F"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M5.99915 10.0008L7.99998 8"
          stroke="#006F1F"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>

    <!-- Lock Toggle Button (Orange) - Now triggers Change Password -->
    <button
      @click="isPasswordUpdateOpen = true"
      title="Change Password"
      class="w-8 h-8 rounded-full flex items-center justify-center bg-[#FFF3E0] hover:bg-[#FFE0B2] text-[#E65100] transition-colors border-none shadow-none cursor-pointer"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
      >
        <path
          d="M5.33337 6.66667V4.66667V4.66667C5.33337 3.194 6.52737 2 8.00004 2V2C9.47271 2 10.6667 3.194 10.6667 4.66667V4.66667V6.66667"
          stroke="#FF7A2E"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M7.99996 9.33333V11.3333"
          stroke="#FF7A2E"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M11.3334 14H4.66671C3.93004 14 3.33337 13.4033 3.33337 12.6667V8.00001C3.33337 7.26334 3.93004 6.66667 4.66671 6.66667H11.3334C12.07 6.66667 12.6667 7.26334 12.6667 8.00001V12.6667C12.6667 13.4033 12.07 14 11.3334 14Z"
          stroke="#FF7A2E"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>

    <!-- Status Toggle (activate / deactivate) -->
    <button v-if="!isDeletedStatus" @click="toggleStatus" :disabled="isStatusPending"
      :title="isActive ? t('deactivate', 'Vaqtincha ochirish') : t('activate', 'Faollashtirish')"
      class="w-8 h-8 rounded-full flex items-center justify-center transition-colors border-none shadow-none cursor-pointer"
      :class="isActive ? 'bg-[#FFF4E5] hover:bg-[#FFE0B2] text-[#B26A00]' : 'bg-[#E8F5E9] hover:bg-[#C8E6C9] text-[#2E7D32]'">
      <svg v-if="isActive" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 16 16" fill="none">
        <rect x="4.5" y="3" width="2.4" height="10" rx="1" fill="currentColor" />
        <rect x="9.1" y="3" width="2.4" height="10" rx="1" fill="currentColor" />
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 16 16" fill="none">
        <path d="M5 3.5L12 8L5 12.5V3.5Z" fill="currentColor" />
      </svg>
    </button>

    <!-- Delete Button (Red) -->
    <button
      @click="isDeleteDialogOpen = true"
      title="Delete"
      class="w-8 h-8 rounded-full flex items-center justify-center bg-[#FFEBEE] hover:bg-[#FFCDD2] text-[#C62828] transition-colors border-none shadow-none cursor-pointer"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
      >
        <path
          d="M12 4L4 12M4 4L12 12"
          stroke="#FF4345"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>

    <!-- Beautiful Deletion Confirmation Dialog -->
    <Dialog v-model:open="isDeleteDialogOpen">
      <DialogContent class="sm:max-w-[460px] !rounded-xl p-5 gap-0 border-none">
        <DialogHeader class="border-b border-gray-300 pb-3 text-left">
          <DialogTitle class="text-base sm:text-lg font-semibold text-[#1b1b1b] -mt-1">
            {{ t('delete_user') }}
          </DialogTitle>
        </DialogHeader>
        <!-- Custom Close Button -->
        <button
          type="button"
          @click="isDeleteDialogOpen = false"
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
        <div class="py-7 text-center">
          <p
            class="text-base sm:text-base text-[#1b1b1b] leading-relaxed font-semibold max-w-[280px] sm:max-w-[380px] mx-auto"
          >
            {{ t('confirm_delete_msg') }}
          </p>
        </div>
        <div class="flex items-center justify-end gap-3 pt-10">
          <Button
            type="button"
            variant="outline"
            @click="isDeleteDialogOpen = false"
            :disabled="isDeletePending"
            class="h-10 px-5 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold text-sm shadow-none cursor-pointer transition-all"
          >
            {{ t('cancel') }}
          </Button>
          <Button
            type="button"
            @click="handleDeleteClick"
            :loading="isDeletePending"
            :disabled="isDeletePending"
            class="h-10 px-5 bg-[#f27a3a] hover:bg-[#e06c27] text-white rounded-lg font-semibold text-sm shadow-none cursor-pointer transition-all border-none"
          >
            {{ t('delete') }}
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    <!-- Edit User Drawer -->
    <EditUserDrawer v-model:open="isEditOpen" :employee="props.employee" />

    <!-- Update Password Drawer -->
    <UpdatePasswordDrawer v-model:open="isPasswordUpdateOpen" :employee="props.employee" />
  </div>
</template>
