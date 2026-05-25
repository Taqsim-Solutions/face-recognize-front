<script setup lang="ts">
import UserContextBadges from '@/components/UserContextBadges.vue'
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuery } from '@tanstack/vue-query'
import { createColumns, DataTable, CreateGovernmentDrawer } from '../modules'
import Can from '@/components/can.vue'
import ServerError from '@/components/error/ServerError.vue'
import type { FetchGovernmentsParams } from '../types'
import { fetchGovernments, fetchRegions } from '../api'

const { t } = useI18n()

const levelFilter = ref<string>('all')
const regionFilter = ref<string>('all')
const sorting = ref<{
  orderBy: string | null
  order: 'asc' | 'desc' | null
}>({
  orderBy: null,
  order: null
})

const rowSelection = ref<Record<string, boolean>>({})

// Query Params
const params = ref<FetchGovernmentsParams>({
  page: 1,
  size: 20,
  orderBy: 'createdAt',
  order: 'desc'
})

watch(sorting, () => {
  if (sorting.value.orderBy && sorting.value.order) {
    params.value.orderBy = sorting.value.orderBy
    params.value.order = sorting.value.order
  } else {
    params.value.orderBy = undefined
  }
})

watch([levelFilter], () => {
  params.value = {
    ...params.value,
    level: levelFilter.value === 'all' ? undefined : Number(levelFilter.value),
    isRegion: levelFilter.value === 'all' ? undefined : levelFilter.value === '4',
    page: 1
  }
})

watch([regionFilter], () => {
  params.value = {
    ...params.value,
    regionId: regionFilter.value === 'all' ? undefined : Number(regionFilter.value),
    page: 1
  }
})

// Fetch governments list
const { data, isLoading, isError } = useQuery({
  queryKey: ['governments', params],
  queryFn: () => fetchGovernments(params.value),
  staleTime: 60000,
  gcTime: Infinity
})

// Fetch regions list to resolve names in table
const { data: regionsRes } = useQuery({
  queryKey: ['regions'],
  queryFn: fetchRegions,
  staleTime: Infinity
})
const regions = computed(
  () => (regionsRes.value as any)?.data?.result || (regionsRes.value as any)?.result || []
)

const tablePagination = computed(() => {
  const result = (data.value as any)?.data?.result || (data.value as any)?.result
  if (result && typeof result.currentPage === 'number') {
    return {
      currentPage: result.currentPage,
      totalCount: result.totalCount || 0,
      totalPages: result.totalPages || 1,
      pageSize: result.pageSize || params.value.size,
      canPrevPage: result.hasPrevious || false,
      canNextPage: result.hasNext || false
    }
  }
  return {
    currentPage: 1,
    totalCount: 0,
    totalPages: 1,
    pageSize: params.value.size,
    canPrevPage: false,
    canNextPage: false
  }
})

const columns = computed(() => {
  return createColumns(regions.value)
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

const tableData = computed(() => {
  const resultData =
    (data.value as any)?.data?.result?.data ||
    (data.value as any)?.data?.data ||
    (data.value as any)?.result?.data ||
    (data.value as any)?.data
  if (resultData && Array.isArray(resultData)) {
    return resultData
  }
  return []
})

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

const handleRowClick = () => {
  // Row click is disabled since actions are handled via buttons
}
</script>

<template>
  <div>
    <header
      class="flex justify-between items-center py-4 pt-0 px-6 border-b border-gray-200 bg-white"
    >
      <div class="flex flex-col">
        <!-- Segmented Tab Filter instead of Title -->
        <div
          class="flex items-center bg-[#F1F5F9] p-0.5 rounded-lg border border-[#E2E8F0] shadow-sm select-none"
        >
          <button
            type="button"
            @click="levelFilter = 'all'"
            :class="[
              'px-4 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200',
              levelFilter === 'all'
                ? 'bg-white text-slate-900 shadow-sm border border-black/5'
                : 'text-slate-500 hover:text-slate-950'
            ]"
          >
            {{ t('all', 'Barchasi') }}
          </button>
          <button
            type="button"
            @click="levelFilter = '4'"
            :class="[
              'px-4 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200',
              levelFilter === '4'
                ? 'bg-white text-slate-900 shadow-sm border border-black/5'
                : 'text-slate-500 hover:text-slate-950'
            ]"
          >
            {{ t('roles.region', 'Viloyat') }}
          </button>
          <button
            type="button"
            @click="levelFilter = '3'"
            :class="[
              'px-4 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200',
              levelFilter === '3'
                ? 'bg-white text-slate-900 shadow-sm border border-black/5'
                : 'text-slate-500 hover:text-slate-950'
            ]"
          >
            {{ t('roles.district', 'Tuman') }}
          </button>
        </div>
      </div>
      <UserContextBadges />

      <div class="flex flex-wrap items-center gap-3 w-full lg:w-auto">
        <!-- Add Government Button -->
        <Can i="employees.add">
          <CreateGovernmentDrawer />
        </Can>
      </div>
    </header>

    <!-- Filters Row -->
    <div class="flex flex-wrap items-center gap-3 px-6 pt-5 bg-white">
      <!-- Region Filter Select -->
      <Select v-model="regionFilter" name="regionId">
        <SelectTrigger
          class="h-10 w-full sm:w-[200px] border border-gray-200 rounded-xl focus:ring-0 text-gray-600 bg-white text-left font-medium"
        >
          <SelectValue :placeholder="t('select-region', 'Viloyatni tanlang')" />
        </SelectTrigger>
        <SelectContent class="bg-white">
          <SelectItem value="all">{{ t('all-regions', 'Viloyatni tanlang') }}</SelectItem>
          <SelectItem v-for="region in regions" :key="region.id" :value="String(region.id)">
            {{ region.name }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <Can i="employees.list">
      <template v-if="isError">
        <ServerError />
      </template>
      <template v-else>
        <div class="mt-5 w-full px-6">
          <DataTable
            :data="tableData"
            :columns="columns"
            :pagination="tablePagination"
            :loading="isLoading"
            @update:pagination="handlePaginationUpdate"
            :sorting="sorting"
            @update:sorting="(val) => (sorting = val as any)"
            v-model:row-selection="rowSelection"
            @row-click="handleRowClick"
            :is-teacher="true"
          />
        </div>
      </template>
    </Can>
  </div>
</template>
