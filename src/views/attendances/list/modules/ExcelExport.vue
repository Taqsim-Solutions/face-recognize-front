<script setup lang="ts">
import type { AttendanceTableData } from '../types'

import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { utils, writeFile } from 'xlsx'

import { Button } from '@/components/ui/button'
import { DownloadIcon } from 'lucide-vue-next'

const { t } = useI18n()

const props = defineProps<{
  data?: AttendanceTableData[]
}>()

const loading = ref(false)
const handleDownload = () => {
  if (props.data) {
    loading.value = true

    const worksheet = utils.json_to_sheet(props.data)
    const workbook = utils.book_new()

    utils.book_append_sheet(workbook, worksheet, 'Attendances')
    writeFile(workbook, 'Attendances.xlsx', { compression: true })

    loading.value = false
  }
}
</script>

<template>
  <Button
    variant="outline"
    :disabled="!data || !data.length"
    :loading="loading"
    @click="handleDownload"
  >
    <DownloadIcon :size="16" class="mr-2" /> {{ t('download') }}
  </Button>
</template>
