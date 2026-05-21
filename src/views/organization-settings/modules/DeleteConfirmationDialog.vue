<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Trash2Icon } from 'lucide-vue-next'

const props = defineProps<{
  id: string | number
  title?: string
  description?: string
  confirmText?: string
  successMessage?: string
  onConfirm: (id: any) => Promise<void>
  variant?: 'destructive' | 'default'
}>()

const { t } = useI18n()
const open = ref(false)
const isDeleting = ref(false)

const handleDelete = async () => {
  isDeleting.value = true
  await props.onConfirm(props.id)
  isDeleting.value = false
  open.value = false
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <slot name="trigger">
        <button
          type="button"
          class="p-2 hover:bg-gray-100 rounded-md text-red-600 transition-colors"
          :title="t('delete')"
        >
          <Trash2Icon class="w-4 h-4" />
        </button>
      </slot>
    </DialogTrigger>
    <DialogContent class="sm:max-w-[425px] p-0 overflow-hidden">
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
      <DialogHeader class="bg-gray-50 p-5 border-b border-border">
        <DialogTitle>{{ title || t('confirm-delete') }}</DialogTitle>
        <DialogDescription class="sr-only">
          {{ description || t('are-you-sure-you-want-to-delete') }}
        </DialogDescription>
      </DialogHeader>

      <div class="px-5 pb-6 pt-1">
        <p class="text-base text-gray-600 mb-5">
          {{ description || t('are-you-sure-you-want-to-delete') }}
        </p>

        <div class="flex gap-3 justify-end">
          <DialogClose as-child>
            <Button variant="outline" :disabled="isDeleting">
              {{ t('cancel') }}
            </Button>
          </DialogClose>
          <Button
            :variant="variant || 'destructive'"
            :loading="isDeleting"
            :disabled="isDeleting"
            @click="handleDelete"
          >
            {{ confirmText || t('delete') }}
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
