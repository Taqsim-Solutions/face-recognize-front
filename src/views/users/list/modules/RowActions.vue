<script setup lang="ts">
import type { FlattenedData } from '../ui/EmployeesList.vue'
import { useRouter } from 'vue-router'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { bulkUpdateStatus, deleteEmployee } from '../api'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import { Pencil, Lock, Unlock, X } from 'lucide-vue-next'
import { ref } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const props = defineProps<{
  employee: FlattenedData
}>()

const router = useRouter()
const { t } = useI18n()
const queryClient = useQueryClient()
const isDeleteDialogOpen = ref(false)

// 1. Edit Action
const handleEdit = () => {
  router.push({ name: 'users-edit', params: { id: props.employee.id } })
}

// 2. Lock Toggle Action
const { isPending: isLockPending, mutate: toggleLock } = useMutation({
  mutationFn: () => {
    const nextStatus = props.employee.status === 'blocked' ? 'active' : 'blocked'
    return bulkUpdateStatus({
      employeeIds: [props.employee.id],
      status: nextStatus
    })
  },
  onSuccess: () => {
    const action = props.employee.status === 'blocked' ? t('unblocked', 'unblocked') : t('blocked', 'blocked')
    toast.success(`${t('success.status-updated', 'Status updated successfully')} (${action})`)
    queryClient.invalidateQueries({ queryKey: ['employees'] })
  },
  onError: () => {
    toast.error(t('error-occurred', 'Error occurred'))
  }
})

// 3. Delete Action
const { isPending: isDeletePending, mutate: performDelete } = useMutation({
  mutationFn: () => deleteEmployee(props.employee.id),
  onSuccess: () => {
    toast.success(t('success.employee-deleted', 'User deleted successfully'))
    isDeleteDialogOpen.value = false
    queryClient.invalidateQueries({ queryKey: ['employees'] })
  },
  onError: () => {
    toast.error(t('error-occurred', 'Error occurred'))
  }
})
</script>

<template>
  <div class="flex items-center gap-2" @click.stop>
    <!-- Edit Button (Green) -->
    <button
      @click="handleEdit"
      title="Edit"
      class="w-8 h-8 rounded-full flex items-center justify-center bg-[#E8F5E9] hover:bg-[#C8E6C9] text-[#2E7D32] transition-colors border-none shadow-none cursor-pointer"
    >
      <Pencil :size="16" />
    </button>

    <!-- Lock Toggle Button (Orange) -->
    <button
      @click="toggleLock()"
      :disabled="isLockPending"
      title="Toggle Status"
      class="w-8 h-8 rounded-full flex items-center justify-center bg-[#FFF3E0] hover:bg-[#FFE0B2] text-[#E65100] transition-colors border-none shadow-none cursor-pointer disabled:opacity-50"
    >
      <Unlock v-if="props.employee.status === 'blocked'" :size="16" />
      <Lock v-else :size="16" />
    </button>

    <!-- Delete Button (Red) -->
    <button
      @click="isDeleteDialogOpen = true"
      title="Delete"
      class="w-8 h-8 rounded-full flex items-center justify-center bg-[#FFEBEE] hover:bg-[#FFCDD2] text-[#C62828] transition-colors border-none shadow-none cursor-pointer"
    >
      <X :size="18" />
    </button>

    <!-- Beautiful Deletion Confirmation Dialog -->
    <Dialog v-model:open="isDeleteDialogOpen">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{{ t('delete-confirmation', 'Delete Confirmation') }}</DialogTitle>
          <DialogDescription>
            {{ t('are-you-sure-delete', 'Are you sure you want to delete this user? This action cannot be undone.') }}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="flex gap-2 justify-end mt-4">
          <Button
            type="button"
            variant="outline"
            @click="isDeleteDialogOpen = false"
            :disabled="isDeletePending"
          >
            {{ t('cancel', 'Cancel') }}
          </Button>
          <Button
            type="button"
            variant="destructive"
            @click="performDelete()"
            :loading="isDeletePending"
            :disabled="isDeletePending"
            class="bg-red-600 hover:bg-red-700 text-white"
          >
            {{ t('delete', 'Delete') }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
