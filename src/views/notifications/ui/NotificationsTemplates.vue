<script setup lang="ts">
import { ref, computed } from 'vue'

import { useGetNotificationTemplates } from '../query'
import Can from '@/components/can.vue'
import CreateNotificationTemplateDialog from './components/CreateNotificationTemplateDialog.vue'
import DataTable from './components/DataTable.vue'
import { columns } from './components/columns'
import type { GetNotificationTemplatesParams } from '../types'


const params = ref<GetNotificationTemplatesParams>({
  page: 1,
  size: 10,
  orderBy: 'createdAt',
  order: 'desc'
})

const { data: templatesData, isLoading } = useGetNotificationTemplates(params)

const templates = computed(() => templatesData.value?.data?.data || [])

const pagination = computed(() => {
  if (templatesData.value?.headers?.['x-pagination']) {
    const xPag = JSON.parse(templatesData.value?.headers?.['x-pagination'])
    return {
      currentPage: xPag.currentPage || 1,
      totalCount: xPag.totalCount || 0,
      totalPages: xPag.totalPages || 1,
      pageSize: xPag.pageSize || params.value.size || 10,
      canPrevPage: xPag.hasPrevious || false,
      canNextPage: xPag.hasNext || false
    }
  } else {
    return {
      currentPage: params.value.page || 1,
      totalCount: templates.value.length,
      totalPages: 1,
      pageSize: params.value.size || 10,
      canPrevPage: false,
      canNextPage: false
    }
  }
})

const handlePaginationUpdate = (val: { size?: number; page?: number }) => {
  if (val.page !== undefined) {
    params.value.page = val.page
  }
  if (val.size !== undefined) {
    params.value.size = val.size
    params.value.page = 1 
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex justify-end px-6 mt-4">
      <Can i="notifications.modifier">
        <CreateNotificationTemplateDialog />
      </Can>
    </div>

    <div class="w-full px-6">
      <DataTable 
        :columns="columns" 
        :data="templates" 
        :loading="isLoading"
        :pagination="pagination"
        @update:pagination="handlePaginationUpdate"
      />
    </div>
  </div>
</template>
