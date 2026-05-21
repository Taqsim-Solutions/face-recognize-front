<script setup lang="ts">
import type { FetchManualPaymentsParams } from '../types'

import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useGetManualPayments } from '../query/useGetManualPayments'

import { Button } from '@/components/ui/button'
import { columns } from '../modules/columns'
import DataTable from '../modules/DataTable.vue'

const { t } = useI18n()
const router = useRouter()

const params = ref<FetchManualPaymentsParams>({ page: 1, size: 20 })
const { data, isLoading } = useGetManualPayments(params)

const tablePagination = computed(() => {
  if (data.value) {
    const xPag = JSON.parse(data.value.headers['x-pagination'])
    return {
      currentPage: xPag.currentPage,
      totalCount: xPag.totalCount,
      totalPages: xPag.totalPages,
      pageSize: xPag.pageSize,
      canPrevPage: xPag.hasPrevious,
      canNextPage: xPag.hasNext
    }
  } else {
    return {
      currentPage: 0,
      totalCount: 0,
      totalPages: 0,
      pageSize: 0,
      canPrevPage: 0,
      canNextPage: 0
    }
  }
})

const handlePaginationUpdate = (val: FetchManualPaymentsParams) => {
  params.value = { ...params.value, ...val }
}
</script>

<template>
  <header class="flex justify-between items-center">
    <h2
      class="mt-10 scroll-m-20 text-3xl font-semibold tracking-tight transition-colors first:mt-0"
    >
      {{ t('mass-transfers') }}
    </h2>
    <Button variant="outline" @click="router.push({ name: 'manual-payments-create' })">
      {{ t('mass-transfers') }}
    </Button>
  </header>

  <div class="mt-6 w-full">
    <DataTable
      :columns="columns"
      :data="data?.data.data"
      :pagination="tablePagination"
      :loading="isLoading"
      @update:pagination="handlePaginationUpdate"
    />
  </div>
</template>
