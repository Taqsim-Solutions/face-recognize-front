<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { FilePlus2Icon } from 'lucide-vue-next'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'

import { utils, writeFile } from 'xlsx'
import excelTemplate from '@/assets/excel-templates/payments.json'

const { t } = useI18n()
const loading = ref(false)
const downloadTemplate = async () => {
  loading.value = true

  const worksheet = utils.json_to_sheet(excelTemplate)
  const workbook = utils.book_new()
  utils.book_append_sheet(workbook, worksheet, 'Payments')
  writeFile(workbook, `${t('payments')}.xlsx`, { compression: true })

  loading.value = false
}
</script>

<template>
  <Dialog>
    <DialogTrigger as-child>
      <Button class="mr-4" :loading="loading">
        {{ t('download-excel-template') }}
        <FilePlus2Icon class="ml-2" :size="20" />
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ t('upload-payments') }}</DialogTitle>
        <DialogDescription>
          {{ t('upload-payments-desc') }}
        </DialogDescription>
      </DialogHeader>

      <Button size="lg" class="mt-6" :loading="loading" @click="downloadTemplate">
        {{ t('download-excel-template') }}
      </Button>
    </DialogContent>
  </Dialog>
</template>
