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
import { Input } from '@/components/ui/input'
import { toast } from 'vue-sonner'
import { useBulkUpdatePercentAllowed } from '../query/useBulkUpdatePercentAllowed'

const props = defineProps<{
  employeeIds: string[]
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
  (e: 'success'): void
}>()

const { t } = useI18n()
const percentAllowed = ref<number>(0)

const { mutate: updatePercent, isPending } = useBulkUpdatePercentAllowed()

const handleClose = () => {
  emit('update:isOpen', false)
  percentAllowed.value = 0
}

const handleSubmit = () => {
  if (percentAllowed.value < 0 || percentAllowed.value > 80) {
    toast.error(t('validation.max-allowed-percent-amount'))
    return
  }

  updatePercent(
    {
      percentAllowed: percentAllowed.value,
      employeeIds: props.employeeIds
    },
    {
      onSuccess: () => {
        toast.success(t('success.bulk-percent-updated'))
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
        class="absolute right-3 top-3 rounded-md hover:opacity-100 transition bg-white z-10 outline-none"
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
        <DialogTitle>{{ t('update-percent-allowed') }}</DialogTitle>
      </DialogHeader>

      <div class="px-6 py-3">
        <p class="text-sm text-[#596881] mb-6">
          {{ t('update-percent-allowed-desc', { count: employeeIds.length }) }}
        </p>

        <div class="grid gap-2">
          <label class="text-sm font-semibold text-[#1F2937] ml-0.5">{{ t('percent-allowed') }} (%)</label>
          <div class="relative">
            <Input
              type="number"
              v-model.number="percentAllowed"
              :min="0"
              :max="80"
              placeholder="0-80"
              class="h-11 border-[#E0E6F0] focus:ring-0 focus:ring-offset-0 ring-0 outline-none pl-4 pr-10"
              @keyup.enter="handleSubmit"
            />
            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">%</span>
          </div>
        </div>
      </div>

      <DialogFooter class="p-4 pt-1 flex flex-row justify-end gap-3">
        <Button
          class="h-10 min-w-[110px] text-[#596881] border-[#E0E6F0] hover:bg-gray-100/50"
          variant="outline"
          type="button"
          @click="handleClose"
        >
          {{ t('cancel') }}
        </Button>
        <Button
          class="h-10 min-w-[110px] bg-primary hover:bg-primary/90 shadow-sm"
          type="button"
          :disabled="isPending"
          :loading="isPending"
          @click="handleSubmit"
        >
          {{ t('save') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
