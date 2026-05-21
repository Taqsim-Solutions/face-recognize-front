<script setup lang="ts">
import type { CreateManualPayment } from '../types'

import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { read, utils } from 'xlsx'

import UploadPaymentsDialog from '../modules/UploadPaymentsDialog.vue'
import CustomManualPaymentsTable from '../modules/CustomManualPaymentsTable.vue'

import { UploadCloudIcon, Trash2Icon, FileSpreadsheetIcon } from 'lucide-vue-next'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const { t } = useI18n()

const payments = ref<CreateManualPayment[]>([])
const previewFile = ref<File | null>(null)

const handleFileUpload = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = target.files
  if (!files) return

  const file = files[0]
  previewFile.value = file

  const reader = new FileReader()
  reader.readAsArrayBuffer(file)
  reader.onload = (e) => {
    const data = new Uint8Array(e.target?.result as ArrayBuffer)
    const workbook = read(data, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const json: CreateManualPayment[] = utils.sheet_to_json(worksheet)
    payments.value = json.map((entry) => {
      return {
        amount: entry.amount && Number(entry.amount),
        account: entry.account && entry.account.toString(),
        cardHolder: entry.cardHolder && entry.cardHolder.toString(),
        cardNumber: entry.cardNumber && entry.cardNumber.toString(),
        fullName: entry.fullName && entry.fullName.toString(),
        mfo: entry.mfo && entry.mfo.toString()
      }
    })
  }
}

const clearExcel = () => {
  previewFile.value = null
  payments.value = []
}
</script>

<template>
  <main>
    <header class="mb-10 flex flex-wrap gap-3 justify-between items-center">
      <h2
        class="mt-10 scroll-m-20 lg:text-3xl text-2xl font-semibold tracking-tight transition-colors first:mt-0"
      >
        {{ t('mass-transfers') }}
      </h2>
      <UploadPaymentsDialog />
    </header>

    <div v-if="!payments.length">
      <h3 class="text-xl font-bold">{{ t('upload-modified-excel-file') }}</h3>
      <div
        class="mt-2 relative border border-primary border-dashed rounded-lg bg-muted max-w-[600px]"
      >
        <div
          class="absolute flex flex-col justify-center items-center gap-y-3 my-10 top-0 bottom-0 left-0 right-0"
        >
          <UploadCloudIcon />
          <p>{{ t('drag-drop-file-desc') }}</p>
        </div>
        <Input
          class="h-64 max-w-[600px] cursor-pointer opacity-0"
          type="file"
          accept=".xlsx"
          @change="handleFileUpload"
        />
      </div>
    </div>

    <template v-if="payments.length">
      <h3 class="text-xl font-bold">{{ t('upload-modified-excel-file-desc') }}</h3>
      <div class="flex items-center justify-between border rounded bg-muted p-3 mt-5 max-w-[600px]">
        <div class="flex items-center">
          <FileSpreadsheetIcon />
          <p class="ml-2">{{ previewFile!.name }}</p>
        </div>
        <Button size="icon" variant="ghost" @click="clearExcel">
          <Trash2Icon />
        </Button>
      </div>
    </template>

    <template v-if="payments.length">
      <CustomManualPaymentsTable :payments="payments" />
    </template>
  </main>
</template>
