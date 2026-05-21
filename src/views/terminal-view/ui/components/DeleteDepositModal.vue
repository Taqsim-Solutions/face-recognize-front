<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useDeleteDeposit } from '../../query/useDeleteDeposit'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog'
import { toast } from 'vue-sonner'

const { t } = useI18n()

const props = defineProps<{
  depositId: number
  eposTerminalId: number
  open: boolean
  onClose: () => void
}>()

const { isPending, mutate } = useDeleteDeposit()

const handleDelete = () => {
  mutate(
    {
      eposTerminalId: props.eposTerminalId, // @ts-ignore
      depositId: Number(props.depositId)
    },
    {
      onSuccess: () => {
        props.onClose()
        toast.success(t('deposit-was-successfully-deleted'))
      },
      onError: () => {
        toast.error('Error')
      }
    }
  )
}
</script>

<template>
  <Dialog v-model:open="props.open">
    <DialogContent class="p-0">
      <DialogHeader class="p-5 pb-0">
        <DialogTitle>{{ t('delete-deposit') }}</DialogTitle>
        <DialogDescription />
      </DialogHeader>

      <div class="py-6 px-5 border-y mb-1">
        <p class="text-base font-medium text-[#596881]">
          {{ t('delete-deposit-dialog-text') }}
        </p>
      </div>

      <DialogFooter class="p-5 pt-0">
        <DialogClose>
          <Button variant="outline" :disabled="isPending" class="rounded-lg">
            {{ t('cancel') }}
          </Button>
        </DialogClose>
        <Button variant="destructive" :loading="isPending" @click="handleDelete" class="rounded-lg">
          {{ t('delete') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
