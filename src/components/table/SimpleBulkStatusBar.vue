<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMutation } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { EntityStatus, STATUS_LABEL } from '@/constants/entityStatus'

// A small bar shown when rows are selected, offering a bulk status change.
// The parent passes the actual API call via `apply`.
const props = defineProps<{
  selectedIds: (number | string)[]
  apply: (ids: (number | string)[], status: number) => Promise<any>
}>()
const emit = defineEmits<{ (e: 'done'): void }>()

const { t } = useI18n()
const count = computed(() => props.selectedIds.length)

const open = ref(false)
const statusValue = ref<string>(String(EntityStatus.Inactive))

const { isPending, mutate } = useMutation({
  mutationFn: () => props.apply(props.selectedIds, Number(statusValue.value)),
  onSuccess: (res: any) => {
    toast.success(t('bulk-status-done', 'Holat yangilandi') + ` (${res?.data?.result ?? ''})`)
    open.value = false
    emit('done')
  },
  onError: () => toast.error(t('error_occurred'))
})
</script>

<template>
  <div
    v-if="count > 0"
    class="flex items-center gap-3 px-4 py-3 mb-3 bg-[#FFF4E5] border border-[#FFE0B2] rounded-lg"
  >
    <span class="text-sm font-semibold text-[#B26A00]">
      {{ count }} {{ t('selected', 'tanlandi') }}
    </span>
    <Button type="button" @click="open = true"
      class="h-9 px-3 ml-auto bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium">
      {{ t('change-status', "Holatni o'zgartirish") }}
    </Button>

    <Dialog :open="open" @update:open="(v) => (open = v)">
      <DialogContent class="sm:max-w-[420px] bg-white rounded-xl">
        <DialogHeader>
          <DialogTitle>{{ t('change-status', "Holatni o'zgartirish") }}</DialogTitle>
        </DialogHeader>
        <div class="py-3">
          <Select v-model="statusValue">
            <SelectTrigger class="h-11 bg-white border border-gray-300 rounded-lg w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem :value="String(EntityStatus.Active)">{{ STATUS_LABEL[1] }}</SelectItem>
              <SelectItem :value="String(EntityStatus.Inactive)">{{ STATUS_LABEL[2] }}</SelectItem>
              <SelectItem :value="String(EntityStatus.Deleted)">{{ STATUS_LABEL[3] }}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="flex justify-end gap-2">
          <Button variant="outline" @click="open = false" class="h-10 px-4 bg-white border rounded-lg">{{ t('cancel') }}</Button>
          <Button :loading="isPending" @click="mutate" class="h-10 px-4 bg-[#f27a3a] text-white rounded-lg">{{ t('apply', 'Qollash') }}</Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
