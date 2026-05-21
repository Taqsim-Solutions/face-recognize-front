<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { useCreateDeposit } from '../../query/useCreateDeposit'
import { toast } from 'vue-sonner'
import { Plus, Upload } from 'lucide-vue-next'

interface Props {
  eposTerminalId: number
}

const props = defineProps<Props>()
const { t } = useI18n()

const open = ref(false)
const amount = ref<number>()
const comment = ref('')
const receiptFile = ref<File>()
const fileInput = ref<HTMLInputElement>()

const createDepositMutation = useCreateDeposit(props.eposTerminalId)

const isFormValid = computed(() => {
  return amount.value && amount.value > 0 && receiptFile.value
})

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    receiptFile.value = target.files[0]
  }
}

const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

const handleSubmit = async () => {
  if (!isFormValid.value) return

  try {
    await createDepositMutation.mutateAsync({
      amount: amount.value!,
      comment: comment.value || undefined,
      receiptFile: receiptFile.value!
    })

    toast.success(t('deposit-created'))
    resetForm()
    open.value = false
  } catch (error: any) {
    const message = error.response?.data?.error?.message || t('error-occurred')
    toast.error(message)
  }
}

const resetForm = () => {
  amount.value = undefined
  comment.value = ''
  receiptFile.value = undefined
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('uz-UZ', {
    style: 'currency',
    currency: 'UZS',
    minimumFractionDigits: 0
  }).format(value)
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger asChild>
      <Button class="bg-green text-white">
        <Plus class="h-4 w-4 mr-2" />
        {{ t('new-deposit') }}
      </Button>
    </DialogTrigger>

    <DialogContent class="sm:max-w-md">
      <button
        @click="open = false"
        class="absolute right-3 top-4 rounded-md hover:opacity-100 transition bg-white z-10"
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
      <DialogHeader>
        <DialogTitle class="text-lg font-bold pb-4 mb-2 -mt-1 border-b">{{
          t('create-deposit')
        }}</DialogTitle>
      </DialogHeader>

      <div class="space-y-4">
        <!-- Amount -->
        <div class="space-y-2">
          <Label for="amount">{{ t('deposit-amount') }} *</Label>
          <Input
            id="amount"
            v-model.number="amount"
            type="number"
            :placeholder="t('enter-amount')"
            min="1"
            step="1000"
          />
          <p v-if="amount" class="text-xs text-gray-500">
            {{ formatCurrency(amount) }}
          </p>
        </div>

        <!-- Comment -->
        <div class="space-y-2">
          <Label for="comment">{{ t('deposit-comment') }}</Label>
          <Textarea id="comment" v-model="comment" :placeholder="t('enter-comment')" rows="3" />
        </div>

        <!-- Receipt File -->
        <div class="space-y-2">
          <Label for="receipt">{{ t('receipt-file') }} *</Label>
          <div class="flex items-center space-x-2">
            <input
              id="receipt"
              ref="fileInput"
              type="file"
              accept="image/*,.pdf"
              @change="handleFileChange"
              class="hidden"
            />
            <Button type="button" variant="outline" @click="triggerFileInput" class="w-full">
              <Upload class="h-4 w-4 mr-2" />
              {{ receiptFile ? receiptFile.name : t('upload-receipt') }}
            </Button>
          </div>
          <p class="text-xs text-gray-500">PNG, JPG, PDF (max 10MB)</p>
        </div>
      </div>

      <DialogFooter class="flex space-x-2">
        <Button
          variant="outline"
          @click="open = false"
          :disabled="createDepositMutation.isPending.value"
        >
          {{ t('cancel') }}
        </Button>
        <Button
          @click="handleSubmit"
          :disabled="!isFormValid || createDepositMutation.isPending.value"
          :loading="createDepositMutation.isPending.value"
        >
          {{ t('create-deposit') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
