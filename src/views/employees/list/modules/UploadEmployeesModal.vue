<!-- UploadEmployeesModal.vue -->
<script setup lang="ts">
import type { Identifier } from '../../types'
import type {
  EmployeesJSON,
  EmployeeSendListPayload,
  EmployeeSendListResponse
} from '../../upload-list/types'

import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { read, utils, writeFile } from 'xlsx'
import { FileSpreadsheetIcon, Trash2Icon, UploadIcon, DownloadIcon, UploadCloudIcon } from 'lucide-vue-next'
import { useQueryClient } from '@tanstack/vue-query'

import { useSendEmployeeList } from '../../upload-list/query/usePostEmployeeList'
import excelTemplate from '@/assets/excel-templates/employees.json'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'vue-sonner'

const { t } = useI18n()
const queryClient = useQueryClient()

const isOpen = ref(false)
const loading = ref(false)
const previewExcelData = ref<EmployeeSendListResponse[]>([])
const previewFile = ref<File | null>(null)

const downloadTemplate = async () => {
  loading.value = true

  const worksheet = utils.json_to_sheet(excelTemplate)
  const workbook = utils.book_new()
  utils.book_append_sheet(workbook, worksheet, 'Employees')
  writeFile(workbook, 'Xodimlar.xlsx', { compression: true })

  loading.value = false
}

const preparePayload = (json: EmployeesJSON[]): EmployeeSendListPayload[] => {
  return json.map((employee) => {
    const identifiers: Identifier[] = [
      { type: 'phoneNumber', value: employee.phone?.toString() || '' },
      { type: 'pinfl', value: employee.pinfl?.toString() || '' }
    ]

    return {
      cardNumbers: String(employee.cardNumbers)
        ?.split(',')
        .map((el) => el.trim()) || [''],
      identifiers,
      comment: employee.comment?.toString() || '',
      salary: Number(employee.salary) || 0,
      percentAllowed: Number(employee.percent) || 0
    }
  })
}

const { mutate } = useSendEmployeeList()

const fileInput = ref<HTMLInputElement | null>(null)

const validateExcelFile = (file: File): boolean => {
  const validTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel' // .xls
  ]

  if (!validTypes.includes(file.type)) {
    toast.error(t('error.invalid-file-type'))
    return false
  }

  return true
}

const handleFileDrop = (e: DragEvent) => {
  const file = e.dataTransfer?.files[0]
  if (!file) return

  if (validateExcelFile(file)) {
    previewFile.value = file
  }
}

const handleFileUpload = (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = target?.files
  if (!files?.length) return

  const file = files[0]
  if (validateExcelFile(file)) {
    previewFile.value = file
  }
}

const clearExcel = () => {
  previewExcelData.value = []
  previewFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const handleUpload = async () => {
  if (!previewFile.value) {
    toast.error(t('error.no-file-selected'))
    return
  }

  loading.value = true
  try {
    const reader = new FileReader()

    const fileData = await new Promise((resolve, reject) => {
      reader.onload = (e) => resolve(e.target?.result)
      reader.onerror = (e) => reject(e)
      reader.readAsArrayBuffer(previewFile.value!)
    })

    const data = new Uint8Array(fileData as ArrayBuffer)
    const workbook = read(data, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const json = utils.sheet_to_json(worksheet) as EmployeesJSON[]
    const payload = preparePayload(json)

    await mutate(payload, {
      onSuccess: ({ data }) => {
        const hasErrors = data.some((item) => !item.result.isSuccess)
        if (hasErrors) {
          previewExcelData.value = data.filter((item) => !item.result.isSuccess)
        } else {
          toast.success(t('success.employee-list-added'))
          clearExcel()
          isOpen.value = false
          queryClient.invalidateQueries({ queryKey: ['employees'] })
        }
      },
      onError: ({ message }) => {
        toast.error(message)
      }
    })
  } catch (error) {
    toast.error(t('error.excel-parse-failed'))
    console.error('Excel parsing error:', error)
  } finally {
    loading.value = false
  }
}

const handleClose = () => {
  isOpen.value = false
}

watch(isOpen, (newVal) => {
  if (!newVal) {
    clearExcel()
  }
})
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogTrigger as-child>
      <Button
        variant="outline"
        class="bg-[#2D384C] flex gap-2 border-none text-white rounded-lg h-9 hover:bg-[#2D384C] hover:text-white hover:opacity-85 transition-all"
      >
        <UploadIcon :size="16" />
        <span class="lg:hidden block">
          {{ t('download-excel-file') }}
        </span>
      </Button>
    </DialogTrigger>

    <DialogContent class="sm:max-w-[800px] px-0">
      <DialogClose as-child>
        <button
          class="absolute right-3 top-4 rounded-lg hover:opacity-100 transition bg-white z-10"
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

      <DialogHeader class="pb-6 pt-1 border-b border-[#E0E6F0] px-6">
        <DialogTitle>{{ t('upload-employees') }}</DialogTitle>
        <DialogDescription class="sr-only">{{ t('upload-employees') }}</DialogDescription>
      </DialogHeader>

      <div class="">
        <div
          v-if="!previewFile"
          class="flex flex-wrap items-center gap-3 justify-between mx-6 mb-4 p-4 bg-[#EFF3F8] rounded-lg border border-[#E0E6F0]"
        >
          <div class="flex items-center gap-3 lg:w-[60%]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M10 7.5H10.0083M9.16667 10H10V13.3333H10.8333M2.5 10C2.5 10.9849 2.69399 11.9602 3.0709 12.8701C3.44781 13.7801 4.00026 14.6069 4.6967 15.3033C5.39314 15.9997 6.21993 16.5522 7.12987 16.9291C8.03982 17.306 9.01509 17.5 10 17.5C10.9849 17.5 11.9602 17.306 12.8701 16.9291C13.7801 16.5522 14.6069 15.9997 15.3033 15.3033C15.9997 14.6069 16.5522 13.7801 16.9291 12.8701C17.306 11.9602 17.5 10.9849 17.5 10C17.5 8.01088 16.7098 6.10322 15.3033 4.6967C13.8968 3.29018 11.9891 2.5 10 2.5C8.01088 2.5 6.10322 3.29018 4.6967 4.6967C3.29018 6.10322 2.5 8.01088 2.5 10Z"
                stroke="#596881"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <p class="text-sm pr-5 text-[#596881] w-[90%]">
              {{ t('upload-modified-excel-file-desc') }}
            </p>
          </div>
          <Button
            class="flex gap-2 rounded-lg bg-[#2D384C] hover:bg-[#2D384C] hover:opacity-85 transition-all hover:text-white"
            :loading="loading"
            @click="downloadTemplate"
          >
            <DownloadIcon :size="18" />
            {{ t('download-excel-template') }}
          </Button>
        </div>

        <div v-if="!previewFile">
          <div
            class="relative border border-dashed border-[#33B586] rounded-lg text-green bg-[#EBF9F4] px-5 mx-6 cursor-pointer"
            @click="fileInput?.click()"
            @dragover.prevent
            @drop.prevent="handleFileDrop"
          >
            <div class="absolute inset-0 flex flex-col justify-center items-center gap-y-3 my-10">
              <UploadCloudIcon :size="35" class="text-[#33B586]" />
              <p>{{ t('drag-drop-file-desc') }}</p>
            </div>
            <input
              ref="fileInput"
              type="file"
              accept=".xlsx"
              class="h-56 max-w-[600px] opacity-0 cursor-pointer"
              @change="handleFileUpload"
            />
          </div>
        </div>

        <div v-else>
          <div class="flex items-center justify-between border bg-muted p-3 px-6 mx-6 rounded-lg">
            <div class="flex items-center">
              <FileSpreadsheetIcon />
              <p class="ml-2">{{ previewFile.name }}</p>
            </div>
            <Button size="icon" variant="ghost" @click="clearExcel">
              <Trash2Icon />
            </Button>
          </div>

          <div v-if="previewExcelData.length" class="mx-6 mt-4 max-h-[400px] overflow-y-auto">
            <div
              v-for="(item, index) in previewExcelData"
              :key="index"
              class="mb-4 p-4 border border-red-200 rounded-lg bg-red-50"
            >
              <div class="flex items-start gap-2 mb-2">
                <div class="p-1 rounded-full bg-red-100">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="text-red-500"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="font-medium text-red-700">{{ t('error.validation-failed') }}</p>
                  <div class="mt-1">
                    <p class="text-sm text-red-600 mb-1">
                      {{ t('employee') }}: {{ item.request.comment }}
                    </p>
                    {{ console.log(item.result.error?.errors) }}
                    <ul class="list-disc list-inside">
                      <li
                        v-for="(error, errorIndex) in item.result.error?.errors"
                        :key="errorIndex"
                        class="text-sm text-red-600 ml-2"
                      >
                        {{ t(error) }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mx-6 mt-5 flex justify-end gap-3">
          <Button
            @click="handleClose"
            variant="outline"
            class="bg-white text-black border border-[#E0E6F0] transition-all rounded-lg"
          >
            {{ t('cancel') }}
          </Button>
          <Button :loading="loading" @click="handleUpload" class="rounded-lg">
            {{ t('save') }}
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
