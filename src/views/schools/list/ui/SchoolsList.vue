<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuery } from '@tanstack/vue-query'
import { createColumns, DataTable, CreateSchoolDrawer } from '../modules'
import Can from '@/components/can.vue'
import StatusFilterSelect from '@/components/StatusFilterSelect.vue'
import ServerError from '@/components/error/ServerError.vue'
import type { FetchSchoolsParams } from '../types'
import { fetchSchools, fetchRegions, fetchDirectors, bulkChangeSchoolStatus } from '../api'
import SimpleBulkStatusBar from '@/components/table/SimpleBulkStatusBar.vue'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { SearchIcon } from 'lucide-vue-next'
import UserContextBadges from '@/components/UserContextBadges.vue'
import { useCurrentUser } from '@/composables/useCurrentUser'

const { t } = useI18n()
const { hideRegionFilter, hideCityFilter } = useCurrentUser()

const regionFilter = ref<string>('all')
const cityFilter = ref<string>('all')
const statusFilter = ref<string>('all')
const searchQuery = ref<string>('')

const sorting = ref<{
  orderBy: string | null
  order: 'asc' | 'desc' | null
}>({
  orderBy: null,
  order: null
})

const rowSelection = ref<Record<string, boolean>>({})
const selectedIds = computed(() => Object.keys(rowSelection.value).filter((k) => rowSelection.value[k]))
const clearSelection = () => { rowSelection.value = {} }

// Query Params
const params = ref<FetchSchoolsParams>({
  page: 1,
  size: 10,
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

watch([regionFilter], () => {
  params.value = {
    ...params.value,
    regionId: regionFilter.value === 'all' ? undefined : Number(regionFilter.value),
    cityId: undefined,
    page: 1
  }
  cityFilter.value = 'all'
})

watch([cityFilter], () => {
  params.value = {
    ...params.value,
    cityId: cityFilter.value === 'all' ? undefined : Number(cityFilter.value),
    page: 1
  }
})

watch([statusFilter], () => {
  params.value = {
    ...params.value,
    status: statusFilter.value === 'all' ? undefined : Number(statusFilter.value),
    page: 1
  }
})

let searchTimeout: ReturnType<typeof setTimeout> | null = null
watch(searchQuery, (val) => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    params.value = {
      ...params.value,
      search: val || undefined,
      page: 1
    }
  }, 400)
})

// Fetch schools list
const { data, isLoading, isError } = useQuery({
  queryKey: ['schools', params],
  queryFn: () => fetchSchools(params.value),
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

// Fetch directors to resolve names in table
const { data: directorsRes } = useQuery({
  queryKey: ['directors'],
  queryFn: fetchDirectors,
  staleTime: Infinity
})
const directors = computed(() => {
  const res = directorsRes.value as any
  return res?.data?.result?.data || res?.data?.data || res?.result?.data || []
})

// Cities for the selected region filter
const citiesForFilter = computed(() => {
  if (regionFilter.value === 'all') return []
  const selectedRegion = regions.value.find((r: any) => String(r.id) === regionFilter.value)
  return selectedRegion?.cities || []
})

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

const columns = computed(() => createColumns(directors.value))

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

const handleRowClick = () => {
  // Row click disabled; actions handled via buttons
}
</script>

<template>
  <div>
    <!-- Header Title & Add Button -->
    <header
      class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 py-4 pt-0 px-4 sm:px-6 border-b border-gray-200 bg-white"
    >
      <div>
      <h1 class="text-[20px] font-bold text-[#1b1b1b] tracking-tight">
        {{ t('schools', 'Maktablar') }}
      </h1>
        <UserContextBadges />
      </div>

      <Can i="employees.add">
        <CreateSchoolDrawer />
      </Can>
    </header>

    <!-- Filters Row -->
    <div class="flex flex-wrap items-center gap-3 px-4 sm:px-6 pt-5 bg-white">
      <!-- Search Input -->
      <div
        class="flex items-center h-10 w-full sm:w-[420px] border border-gray-200 rounded-xl bg-white px-3 focus-within:ring-1 focus-within:ring-[#ff792d]/20 focus-within:border-[#ff792d]/50 transition-all"
      >
        <SearchIcon class="w-4 h-4 text-gray-400 mr-2 shrink-0" />
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="t('search-school', 'Maktab nomi bo\'yicha qidiruv')"
          class="border-none outline-none bg-transparent text-sm text-gray-600 placeholder-gray-400 w-full font-medium"
        />
      </div>

      <!-- Region Filter Select -->
      <Select v-if="!hideRegionFilter" v-model="regionFilter" name="regionId">
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

      <!-- City Filter Select -->
      <Select v-if="!hideCityFilter" v-model="cityFilter" name="cityId" :disabled="regionFilter === 'all' && !hideRegionFilter">
        <SelectTrigger
          class="h-10 w-full sm:w-[200px] border border-gray-200 rounded-xl focus:ring-0 text-gray-600 bg-white text-left font-medium disabled:opacity-60"
        >
          <SelectValue :placeholder="t('select-city', 'Tumanni tanlang')" />
        </SelectTrigger>
        <SelectContent class="bg-white">
          <SelectItem value="all">{{ t('all-cities', 'Tumanni tanlang') }}</SelectItem>
          <SelectItem v-for="city in citiesForFilter" :key="city.id" :value="String(city.id)">
            {{ city.name }}
          </SelectItem>
        </SelectContent>
      </Select>

      <StatusFilterSelect v-model="statusFilter" />
    </div>

    <Can i="employees.list">
      <template v-if="isError">
        <ServerError />
      </template>
      <template v-else>
        <div class="mt-5 w-full px-4 sm:px-6">
          <SimpleBulkStatusBar :selected-ids="selectedIds" :apply="bulkChangeSchoolStatus" @done="clearSelection" />
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
