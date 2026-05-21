<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGetNotificationDashboard } from '../query'
import Can from '@/components/can.vue'
import SendNotificationDialog from './components/SendNotificationDialog.vue'
import NotificationDetailsModal from './components/NotificationDetailsModal.vue'
import DataTable from './components/DataTable.vue'
import { useDashboardColumns } from './components/useDashboardColumns'
import type { GetNotificationDashboardParams } from '../types'


import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useGetNotificationTemplates } from '../query'

const { t, locale } = useI18n()

const params = ref<GetNotificationDashboardParams>({
  page: 1,
  size: 10,
  orderBy: 'createdAt',
  order: 'desc',
  templateId: undefined
})

const { data: templatesData } = useGetNotificationTemplates(ref({ page: 1, size: 100 }))
const templates = computed(() => (templatesData.value?.data?.data || []).filter((t: any) => t.state === 'active'))

import { watch } from 'vue'
watch(templates, (newTemplates) => {
  if (newTemplates.length > 0 && !params.value.templateId) {
    params.value.templateId = newTemplates[0].id
  }
}, { immediate: true })

const { data: dashboardData, isLoading } = useGetNotificationDashboard(params)

const items = computed(() => dashboardData.value?.data?.data || [])

const selectedId = ref<string | null>(null)
const detailsOpen = ref(false)

const openDetails = (id: string) => {
  selectedId.value = id
  detailsOpen.value = true
}

const dashboardColumns = useDashboardColumns(
  computed(() => params.value.page || 1), 
  computed(() => params.value.size || 10),
  openDetails
)

const pagination = computed(() => {
  if (dashboardData.value?.headers?.['x-pagination']) {
    const xPag = JSON.parse(dashboardData.value?.headers?.['x-pagination'])
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
      totalCount: items.value.length,
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
    <div class="flex justify-between items-center px-6 mt-4">
      <div class="w-[300px]">
        <Select
          :model-value="params.templateId ? String(params.templateId) : undefined"
          @update:model-value="(v: string) => { params.templateId = Number(v); params.page = 1 }"
        >
          <SelectTrigger>
            <SelectValue :placeholder="t('select-template')" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem 
                v-for="template in templates" 
                :key="template.id" 
                :value="String(template.id)"
            >
              {{
                template.locales?.find((l: any) => l.localeKey === locale)?.title ||
                template.locales?.[0]?.title ||
                t(template.type)
              }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Can i="notifications.modifier">
        <SendNotificationDialog />
      </Can>
    </div>

    <div class="w-full px-6">
      <DataTable 
        :columns="dashboardColumns" 
        :data="items" 
        :loading="isLoading"
        :pagination="pagination"
        @update:pagination="handlePaginationUpdate"
        @row-click="(row) => openDetails(row.id)"
      />
    </div>

    <NotificationDetailsModal
      v-model:open="detailsOpen"
      :id="selectedId"
    />
  </div>
</template>
