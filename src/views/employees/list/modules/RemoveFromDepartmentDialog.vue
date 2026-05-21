<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useRemoveFromDepartment } from '@/views/departments/query'
import { toast } from 'vue-sonner'

const props = defineProps<{
  employeeIds: string[]
  departmentId: string
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
  (e: 'success'): void
}>()

const { t } = useI18n()

const { mutate: removeFromDepartment, isPending } = useRemoveFromDepartment()

const handleClose = () => {
  emit('update:isOpen', false)
}

const handleSubmit = () => {
  removeFromDepartment(
    {
      id: props.departmentId,
      employeeIds: props.employeeIds
    },
    {
      onSuccess: () => {
        toast.success(t('employees-removed-from-department-successfully'))
        emit('success')
        handleClose()
      },
      onError: () => {
        toast.error(t('error-occurred'))
      }
    }
  )
}
</script>

<template>
  <Dialog :open="isOpen" @update:open="handleClose">
    <DialogContent class="sm:max-w-[425px] p-0 overflow-hidden">
       <button
        @click="handleClose"
        class="absolute right-3 top-3 rounded-md hover:opacity-100 transition bg-white z-10"
        aria-label="Close"
        type="button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
        >
          <rect x="0.5" y="0.5" width="31" height="31" rx="7.5" fill="white" />
          <rect x="0.5" y="0.5" width="31" height="31" rx="7.5" stroke="#E0E6F0" />
          <path
            d="M20 12L12 20M12 12L20 20"
            stroke="#596881"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <DialogHeader class="bg-gray-50 p-5 border-b border-border">
        <DialogTitle>{{ t('remove-employees-from-department') }}</DialogTitle>
      </DialogHeader>
      
      <div class="pb-4 pt-4 px-4">
        <DialogDescription class="text-sm text-gray-500 mb-4">
          {{ t('remove-employees-from-department-confirm', { count: employeeIds.length }) }}
        </DialogDescription>
      </div>

      <DialogFooter class="pb-4 px-4">
        <Button variant="outline" type="button" @click="handleClose">{{ t('cancel') }}</Button>
        <Button 
          type="button" 
          variant="destructive"
          :disabled="isPending" 
          :loading="isPending"
          @click="handleSubmit"
        >
          {{ t('remove') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
