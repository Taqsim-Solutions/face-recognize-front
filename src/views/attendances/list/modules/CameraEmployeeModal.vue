<template>
  <Dialog :open="modelValue" @update:open="(val) => emit('update:modelValue', val)">
    <DialogContent class="sm:max-w-[600px] rounded-2xl p-0 overflow-hidden">
      <DialogHeader class="border-b px-6 py-4 bg-gray-50 flex flex-row items-center justify-between shrink-0 relative">
        <div>
          <DialogTitle class="text-lg font-semibold">{{ t('camera-access') }}</DialogTitle>
          <DialogDescription class="text-sm text-gray-500">{{ employeeName }}</DialogDescription>
        </div>
        <DialogClose as-child>
          <button
            class="rounded-lg hover:opacity-100 transition bg-white z-10 -mt-6 -mr-3"
            aria-label="Close"
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
        </DialogClose>
      </DialogHeader>

      <div class="px-6 py-1 max-h-[60vh] overflow-y-auto">
        <div v-if="isLoadingCameras || isLoadingEmployeeCameras" class="flex flex-col items-center justify-center py-10 gap-2">
          <Loader2 class="w-8 h-8 animate-spin text-primary" />
          <p class="text-sm text-gray-500">{{ t('loading') }}...</p>
        </div>

        <div v-else-if="mergedCameras.length === 0" class="text-center py-10">
          <p class="text-gray-500">{{ t('no-cameras-found') }}</p>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="camera in mergedCameras"
            :key="camera.id"
            class="flex p-4 border rounded-xl transition-all duration-200"
            :class="[
              editingAssignment?.cameraId === camera.id 
                ? 'flex-col gap-4' 
                : 'flex-row items-center justify-between gap-3 hover:bg-gray-50/50'
            ]"
          >
            <div class="min-w-0" :class="{ 'flex-1': editingAssignment?.cameraId !== camera.id }">
              <div class="flex items-center gap-2">
                <p class="font-semibold text-gray-900 truncate">{{ camera.name }}</p>
                <div v-if="camera.assignment" class="bg-primary/10 mt-0.5 text-primary text-[10px] font-semibold px-2 py-0.5 rounded uppercase">
                  {{ t('assigned') }}
                </div>
              </div>
              
              <div v-if="camera.assignment && editingAssignment?.cameraId !== camera.id" class="mt-1.5 text-sm">
                <span class="text-gray-500">{{ t('camera-employee-id') }}:</span>
                <span class="font-mono font-medium ml-1.5 text-gray-900">{{ camera.assignment.employeeNo }}</span>
              </div>
            </div>

            <div 
              class="flex items-center gap-2" 
              :class="editingAssignment?.cameraId === camera.id ? 'w-full' : 'shrink-0'"
            >
            <template v-if="editingAssignment?.cameraId === camera.id">
              <div class="w-full bg-gray-50 border rounded-xl p-4 space-y-3">
    
                <!-- LABEL -->
                <div class="text-sm -mb-1 text-gray-500 font-medium">
                  {{ t('camera-employee-id') }}
                </div>

                <!-- INPUT -->
                <Input 
                  v-model="editingAssignment!.employeeNo" 
                  class="w-full h-11 rounded-xl bg-white border-gray-200 focus:border-primary font-semibold"
                  :placeholder="t('camera-employee-id')" 
                  maxlength="32"
                  @keyup.enter="saveAssignment"
                />

                <!-- ACTIONS -->
                <div class="flex items-center justify-end gap-3 pt-1">
                  <Button 
                    variant="ghost"
                    class="h-9 px-4 rounded-lg border border-gray-200 bg-white"
                    @click="cancelEdit"
                  >
                    <X class="w-4 h-4 mr-1" />
                    {{ t('cancel') }}
                  </Button>

                  <Button 
                    class="h-9 px-5 rounded-lg bg-primary hover:bg-primary/90"
                    @click="saveAssignment"
                    :loading="createMutation.isPending.value || updateMutation.isPending.value"
                    :disabled="createMutation.isPending.value || updateMutation.isPending.value"
                  >
                    <Check class="w-4 h-4 mr-1" />
                    {{ t('save') }}
                  </Button>
                </div>
              </div>
            </template>

              <template v-else>
                <template v-if="camera.assignment">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    class="h-8 w-8 p-0 flex items-center justify-center rounded-lg bg-[#E9F9F2] text-[#15803D] transition-colors duration-200 hover:bg-[#D7F3E6] focus:outline-none focus:ring-2 focus:ring-[#A7F3D0] focus:ring-offset-2 shadow-none"
                    @click="startEdit(camera)"
                    title="Edit"
                  >
                    <PencilLine class="w-4 h-4" />
                  </Button>
                  
                  <DeleteConfirmationDialog 
                    :id="camera.assignment.id" 
                    :onConfirm="handleDelete"
                    variant="destructive"
                  >
                    <template #trigger>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        class="h-8 w-8 p-0 flex items-center justify-center rounded-lg bg-[#FEF3F2] text-[#DC2626] transition-colors duration-200 hover:bg-[#FBE1DE] focus:outline-none focus:ring-2 focus:ring-[#FECACA] focus:ring-offset-2 shadow-none"
                        title="Delete"
                      >
                        <Trash2 class="w-4 h-4" />
                      </Button>
                    </template>
                  </DeleteConfirmationDialog>
                </template>
                
                <template v-else>
                  <Button 
                    size="sm" 
                    variant="outline"
                    class="h-9 border-dashed border-gray-300 hover:border-primary hover:text-primary hover:bg-primary/5"
                    @click="startEdit(camera)"
                  >
                    <Plus class="w-4 h-4 mr-1.5" /> {{ t('add') }}
                  </Button>
                </template>
              </template>
            </div>
          </div>
        </div>
      </div>
      
      <DialogFooter class="px-6 py-4 border-t bg-gray-50 flex justify-end">
        <Button variant="outline" @click="emit('update:modelValue', false)">
          {{ t('close') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useGetCameras } from '@/views/organization-settings/query/useCamera'
import { useGetCameraEmployees, useCreateCameraEmployee, useUpdateCameraEmployee, useDeleteCameraEmployee } from '@/views/organization-settings/query/useCameraEmployees'
import { toast } from 'vue-sonner'
import { Loader2, Plus, PencilLine, Trash2, X, Check } from 'lucide-vue-next'
import DeleteConfirmationDialog from '@/views/organization-settings/modules/DeleteConfirmationDialog.vue'

const { t } = useI18n()

interface Props {
  modelValue: boolean
  employeeId?: string
  employeeName?: string
  defaultEmployeeNo?: string
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])

const camerasParams = ref({ page: 1, size: 100 })
const { data: camerasResponse, isLoading: isLoadingCameras } = useGetCameras(camerasParams)

const employeeCamerasParams = computed(() => ({ employeeId: props.employeeId || '' }))
const { data: employeeCamerasResponse, isLoading: isLoadingEmployeeCameras, refetch: refetchEmployeeCameras } = useGetCameraEmployees(employeeCamerasParams)

const createMutation = useCreateCameraEmployee()
const updateMutation = useUpdateCameraEmployee()
const deleteMutation = useDeleteCameraEmployee()

const mergedCameras = computed(() => {
  if (!camerasResponse.value?.data?.data) return []
  
  const allCameras = camerasResponse.value.data.data
  const employeeCameras = employeeCamerasResponse.value?.data?.data || []
  
  return allCameras.map((camera: any) => {
    const assignment = employeeCameras.find((ec: any) => ec.acsCameraId === camera.id)
    return {
      ...camera,
      assignment
    }
  })
})

const editingAssignment = ref<{
  cameraId: number
  assignmentId?: number
  employeeNo: string
} | null>(null)

const startEdit = (camera: any) => {
  if (createMutation.isPending.value || updateMutation.isPending.value || deleteMutation.isPending.value) return

  editingAssignment.value = {
    cameraId: camera.id,
    assignmentId: camera.assignment?.id,
    employeeNo: camera.assignment?.employeeNo || props.defaultEmployeeNo || ''
  }
}

const cancelEdit = () => {
  editingAssignment.value = null
}

const saveAssignment = async () => {
  if (!editingAssignment.value || !props.employeeId) return
  
  const { cameraId, assignmentId, employeeNo } = editingAssignment.value
  
  if (!employeeNo.trim()) {
    toast.error(t('validation.required-field'))
    return
  }
  
  try {
    if (assignmentId) {
      await updateMutation.mutateAsync({
        id: assignmentId,
        data: {
          acsCameraId: cameraId,
          employeeId: props.employeeId,
          employeeNo
        }
      })
      toast.success(t('success.updated'))
    } else {
      await createMutation.mutateAsync({
        acsCameraId: cameraId,
        employeeId: props.employeeId,
        employeeNo
      })
      toast.success(t('success.created'))
    }
    await refetchEmployeeCameras()
    editingAssignment.value = null
  } catch (error: any) {
    const errorMessage = error.response?.data?.error?.message || error?.response?.data?.message || error.message || t('error-occurred')
    toast.error(t('error-occurred'), {
      description: errorMessage
    })
  }
}

const handleDelete = async (id: number) => {
  if (deleteMutation.isPending.value) return

  try {
    await deleteMutation.mutateAsync(id)
    toast.success(t('success.deleted'))
    await refetchEmployeeCameras()
  } catch (error: any) {
    const errorMessage = error.response?.data?.error?.message || error?.response?.data?.message || error.message || t('error-occurred')
    toast.error(t('error-occurred'), {
      description: errorMessage
    })
  }
}
</script>
