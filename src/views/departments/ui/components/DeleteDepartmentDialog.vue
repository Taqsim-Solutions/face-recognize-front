<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'vue-sonner'
import { useDeleteDepartment } from '../../query/useDeleteDepartment'

interface Props {
  id: string
}

const props = defineProps<Props>()
const { t } = useI18n()
const open = ref(false)

const { mutate: remove, isPending } = useDeleteDepartment()

const handleDelete = () => {
  remove(props.id, {
    onSuccess: () => {
      open.value = false
      toast.success(t('department-deleted'))
    },
    onError: () => {
      toast.error(t('error-occurred'))
    }
  })
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <Button
        variant="outline"
        class="bg-[#FFE9E9] hover:bg-[#FFE9E9] hover:opacity-80 transition-all border-none px-[8px] h-7"
      >
        <svg stroke="#EF4444" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2.66699 4.66667H13.3337M6.66699 7.33333V11.3333M9.33366 7.33333V11.3333M3.33366 4.66667L4.00033 12.6667C4.00033 13.0203 4.1408 13.3594 4.39085 13.6095C4.6409 13.8595 4.98004 14 5.33366 14H10.667C11.0206 14 11.3598 13.8595 11.6098 13.6095C11.8598 13.3594 12.0003 13.0203 12.0003 12.6667L12.667 4.66667M6.00033 4.66667V2.66667C6.00033 2.48986 6.07056 2.32029 6.19559 2.19526C6.32061 2.07024 6.49018 2 6.66699 2H9.33366C9.51047 2 9.68004 2.07024 9.80506 2.19526C9.93009 2.32029 10.0003 2.48986 10.0003 2.66667V4.66667" stroke="#EF4444" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
      </Button>
    </DialogTrigger>
    <DialogContent class="p-0 sm:max-w-[425px]">
      <button
        @click="open = false"
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
          <rect x="0.5" y="0.5" width="31" height="31" rx="7.5" fill="white"></rect>
          <rect x="0.5" y="0.5" width="31" height="31" rx="7.5" stroke="#E0E6F0"></rect>
          <path
            d="M20 12L12 20M12 12L20 20"
            stroke="#596881"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></path>
        </svg>
      </button>
      <DialogHeader class="p-5 pb-0 text-left">
        <DialogTitle>{{ t('delete-department') }}</DialogTitle>
        <DialogDescription class="sr-only">
          {{ t('confirm-delete-department') }}
        </DialogDescription>
      </DialogHeader>

      <div class="py-6 px-5 border-y mb-1">
        <p class="text-base font-medium text-[#596881]">
          {{ t('confirm-delete-department') }}
        </p>
      </div>

      <DialogFooter class="p-5 pt-0">
        <DialogClose as-child>
          <Button variant="outline" :disabled="isPending" class="rounded-lg">
            {{ t('cancel') }}
          </Button>
        </DialogClose>
        <Button variant="destructive" :disabled="isPending" @click="handleDelete" class="rounded-lg">
          <span v-if="isPending">{{ t('loading') }}...</span>
          <span v-else>{{ t('delete') }}</span>
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
