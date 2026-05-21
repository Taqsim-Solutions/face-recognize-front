<script setup lang="ts">
import type { Identifier } from '../../types'
import type { EmployeesJSON, EmployeeSendListPayload, EmployeeSendListResponse } from '../types'

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { read, utils } from 'xlsx'
import { UploadCloudIcon, FileSpreadsheetIcon, Trash2Icon } from 'lucide-vue-next'

import { useSendEmployeeList } from '../query/usePostEmployeeList'

import UploadEmployeesDialog from '../modules/UploadEmployeesDialog.vue'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'vue-sonner'

const router = useRouter()
const { t } = useI18n()
const { mutate } = useSendEmployeeList()

const previewExcelData = ref<EmployeeSendListResponse[]>([])
const previewFile = ref<File | null>(null)

const preparePayload = (json: EmployeesJSON[]): EmployeeSendListPayload[] => {
  return json.map((employee) => {
    console.log(employee)
    const identifiers: Identifier[] = [
      { type: 'phoneNumber', value: employee.phone?.toString() || '' },
      // { type: 'inn', value: employee.inn?.toString() || '' },
      // { type: 'passportSerialNumber', value: employee.passport || '' },
      { type: 'pinfl', value: employee.pinfl?.toString() || '' }
      // { type: 'accountCredit', value: employee.account?.toString() || '' }
      // { type: 'mfo', value: employee.mfo?.toString() || '' }
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

const handleFileUpload = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = target?.files
  if (!files?.length) return

  const file = files[0]
  previewFile.value = file

  const reader = new FileReader()
  reader.readAsArrayBuffer(file)

  reader.onload = (event) => {
    try {
      const data = new Uint8Array(event.target?.result as ArrayBuffer)
      const workbook = read(data, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const json = utils.sheet_to_json(worksheet) as EmployeesJSON[]
      const payload = preparePayload(json)

      mutate(payload, {
        onSuccess: ({ data }) => {
          const hasErrors = data.some((item) => !item.result.isSuccess)
          if (hasErrors) {
            previewExcelData.value = data
          } else {
            toast.success(t('success.employee-list-added'))
            router.push({ name: 'users-list' })
          }
        },
        onError: ({ message }) => {
          toast.error(message)
        }
      })
    } catch (error) {
      toast.error(t('error.excel-parse-failed'))
      console.error('Excel parsing error:', error)
    }
  }
}

const clearExcel = () => {
  previewExcelData.value = []
  previewFile.value = null
}
</script>

<template>
  <main class="max-w-[1620px]">
    <header class="mb-5 flex flex-wrap gap-3 items-center justify-between">
      <h2 class="lg:text-3xl text-2xl font-semibold">{{ t('upload-employees') }}</h2>
      <UploadEmployeesDialog />
    </header>

    <Separator class="mb-8" />

    <div class="flex justify-center">
      <div v-if="!previewExcelData.length">
        <h3 class="lg:text-2xl text-lg font-bold text-center">
          {{ t('upload-modified-excel-file') }}
        </h3>
        <div
          class="mt-5 relative border border-primary border-dashed rounded-lg bg-muted max-w-[800px] px-5"
        >
          <div class="absolute inset-0 flex flex-col justify-center items-center gap-y-3 my-10">
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

      <div v-else class="max-w-[800px]">
        <h3 class="lg:text-2xl text-lg font-bold text-center">
          {{ t('upload-modified-excel-file-desc') }}
        </h3>

        <div class="flex items-center justify-between border rounded bg-muted p-3 mb-10 mt-5">
          <div class="flex items-center">
            <FileSpreadsheetIcon />
            <p class="ml-2">{{ previewFile?.name }}</p>
          </div>
          <Button size="icon" variant="ghost" @click="clearExcel">
            <Trash2Icon />
          </Button>
        </div>

        <div class="grid gap-4">
          <template v-for="(row, i) in previewExcelData" :key="i">
            <Card v-if="row.result.error?.errors?.length">
              <CardHeader>
                <CardTitle>
                  {{
                    `${row.request.comment} - (${
                      row.request.identifiers.find((el) => el.type === 'passportSerialNumber')
                        ?.value || '---'
                    })`
                  }}
                </CardTitle>
                <CardDescription>
                  {{ t('excel-upload-row-error-desc', { v: i + 2 }) }}
                </CardDescription>
              </CardHeader>
              <CardContent class="text-destructive">
                <ul class="list-disc px-5">
                  <li v-for="(error, idx) in row.result.error.errors" :key="idx">
                    {{
                      error === 'CardNumber must contain only 16 digits.'
                        ? t('validation.card-number-must-contain')
                        : error ===
                          'Identifier PhoneNumber Value must be exactly 12 digits and begin with 998.'
                        ? t('validation.phone-number-must-contain')
                        : error === 'Identifier INN Value must be exactly 7 digits.'
                        ? t('validation.tin-must-contain')
                        : error === 'Identifier PINFL Value must be exactly 14 digits.'
                        ? t('validation.pinfl-must-contain')
                        : error === 'Identifiers cannot contain duplicate values.'
                        ? t('validation.identifiers-cannot-contain-duplicate-values')
                        : error
                    }}
                  </li>
                </ul>
              </CardContent>
              <CardFooter />
            </Card>
          </template>
        </div>
      </div>
    </div>
  </main>
</template>
