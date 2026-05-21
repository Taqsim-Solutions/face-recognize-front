<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useGetDepartments, useAddToDepartment } from '@/views/departments/query'
import { toast } from 'vue-sonner'

const props = defineProps<{
  employeeIds: string[]
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
  (e: 'success'): void
}>()

const { t } = useI18n()
const selectedDepartmentId = ref<string>('')

const departmentsParams = ref({
  isAll: true
})

const { data: departmentsData, isLoading: isLoadingDepartments } = useGetDepartments(departmentsParams)

const { mutate: addToDepartment, isPending } = useAddToDepartment()

const handleClose = () => {
  emit('update:isOpen', false)
  selectedDepartmentId.value = ''
}

const handleSubmit = () => {
  if (!selectedDepartmentId.value) return

  addToDepartment(
    {
      departmentId: selectedDepartmentId.value,
      employeeIds: props.employeeIds
    },
    {
      onSuccess: () => {
        toast.success(t('success.employees-added-to-department'))
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
        <DialogTitle>{{ t('add-employees-to-department') }}</DialogTitle>
      </DialogHeader>
      
      <div class="pb-4 pt-1 px-4">
        <p class="text-sm text-gray-500 mb-4">
          {{ t('add-employees-to-department-desc', { count: employeeIds.length }) }}
        </p>

        <div class="grid gap-2 min-w-0">
           <label class="text-sm font-medium">{{ t('department') }}</label>
           <Select v-model="selectedDepartmentId">
            <SelectTrigger>
              <SelectValue :placeholder="isLoadingDepartments ? t('loading') : t('select-department')" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem 
                v-for="dept in departmentsData?.data?.data || []" 
                :key="dept.id" 
                :value="dept.id"
              >
                {{ dept.name }}
              </SelectItem>
            </SelectContent>
           </Select>
        </div>
      </div>

      <DialogFooter class="pb-4 px-4 sm:justify-center flex-row justify-center gap-3">
        <Button class="min-w-[110px]" variant="outline" type="button" @click="handleClose">{{ t('cancel') }}</Button>
        <Button 
          class="min-w-[110px]"
          type="button" 
          :disabled="!selectedDepartmentId || isPending" 
          :loading="isPending"
          @click="handleSubmit"
        >
          {{ t('save') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
