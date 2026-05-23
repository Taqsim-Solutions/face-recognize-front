<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuery } from '@tanstack/vue-query'
import { createColumns, DataTable, CreateTeacherDrawer } from '../modules'
import Can from '@/components/can.vue'
import ServerError from '@/components/error/ServerError.vue'
import type { FetchTeachersParams } from '../types'
import { fetchTeachers, fetchRegions, fetchSchoolsByCity } from '../api'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { SearchIcon, Plus } from 'lucide-vue-next'

const { t } = useI18n()

const regionFilter = ref<string>('all')
const cityFilter = ref<string>('all')
const schoolFilter = ref<string>('all')
const searchQuery = ref<string>('')
const isCreateDrawerOpen = ref(false)

const sorting = ref<{
  orderBy: string | null
  order: 'asc' | 'desc' | null
}>({
  orderBy: null,
  order: null
})

const rowSelection = ref<Record<string, boolean>>({})

// Query Params
const params = ref<FetchTeachersParams>({
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

watch([regionFilter], () => {
  params.value = {
    ...params.value,
    regionId: regionFilter.value === 'all' ? undefined : Number(regionFilter.value),
    cityId: undefined,
    schoolId: undefined,
    page: 1
  }
  cityFilter.value = 'all'
  schoolFilter.value = 'all'
})

watch([cityFilter], () => {
  params.value = {
    ...params.value,
    cityId: cityFilter.value === 'all' ? undefined : Number(cityFilter.value),
    schoolId: undefined,
    page: 1
  }
  schoolFilter.value = 'all'
})

watch([schoolFilter], () => {
  params.value = {
    ...params.value,
    schoolId: schoolFilter.value === 'all' ? undefined : Number(schoolFilter.value),
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

// Fetch teachers list
const { data, isLoading, isError } = useQuery({
  queryKey: ['teachers', params],
  queryFn: () => fetchTeachers(params.value),
  staleTime: 60000,
  gcTime: Infinity
})

// Fetch regions list
const { data: regionsRes } = useQuery({
  queryKey: ['regions'],
  queryFn: fetchRegions,
  staleTime: Infinity
})
const regions = computed(
  () => (regionsRes.value as any)?.data?.result || (regionsRes.value as any)?.result || []
)

// Cities for selected region
const citiesForFilter = computed(() => {
  if (regionFilter.value === 'all') return []
  const selectedRegion = regions.value.find((r: any) => String(r.id) === regionFilter.value)
  return selectedRegion?.cities || []
})

// Fetch schools list when city is selected
const { data: schoolsRes, isPending: isSchoolsLoading } = useQuery({
  queryKey: ['schools-by-city-filter', cityFilter],
  queryFn: () => fetchSchoolsByCity(Number(cityFilter.value)),
  enabled: computed(() => cityFilter.value !== 'all'),
  staleTime: 60000
})
const schools = computed(() => {
  const res = schoolsRes.value as any
  return res?.data?.result?.data || res?.data?.data || res?.result?.data || []
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

const columns = computed(() => createColumns())

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
  // Row click disabled; actions handled via row actions
}
</script>

<template>
  <div>
    <header
      class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 border-b lg:pb-3 pb-5 px-6"
    >
      <div class="flex flex-col">
        <h1 class="text-[17px] font-semibold text-[#1b1b1b]">
          {{ t('teachers', "O'qituvchilar") }}
        </h1>
      </div>

      <div class="flex flex-wrap items-center gap-3 w-full lg:w-auto">
        <!-- Search Input -->
        <div
          class="flex items-center h-9 border border-gray-200 rounded-lg bg-white pl-3 focus-within:ring-1 focus-within:ring-[#ff792d]/20 focus-within:border-[#ff792d]/50 transition-all"
        >
          <SearchIcon class="w-4 h-4 text-gray-400 mr-2 shrink-0" />
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="t('search-teachers', 'Ism va familiya qidirish')"
            class="border-none outline-none bg-transparent text-sm text-gray-700 placeholder-gray-400 w-60 font-semibold"
          />
        </div>

        <!-- Region Filter Select -->
        <div
          class="flex items-center h-9 border border-gray-200 rounded-lg bg-white pl-3 focus-within:ring-1 focus-within:ring-[#ff792d]/20 focus-within:border-[#ff792d]/50 transition-all"
        >
          <label
            for="region-filter"
            class="text-[10px] font-bold uppercase text-[#8796AF] mr-1 border-r border-gray-100 pr-2 whitespace-nowrap cursor-pointer"
          >
            {{ t('region', 'Viloyat') }}
          </label>
          <Select v-model="regionFilter" name="regionId">
            <SelectTrigger
              id="region-filter"
              class="border-none shadow-none h-8 min-w-[120px] max-w-[180px] focus:ring-0 text-gray-700 font-semibold bg-transparent"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent class="bg-white">
              <SelectItem value="all">{{ t('all', 'Barchasi') }}</SelectItem>
              <SelectItem v-for="region in regions" :key="region.id" :value="String(region.id)">
                {{ region.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- City Filter Select (shown only when region is selected) -->
        <div
          v-if="regionFilter !== 'all'"
          class="flex items-center h-9 border border-gray-200 rounded-lg bg-white pl-3 focus-within:ring-1 focus-within:ring-[#ff792d]/20 focus-within:border-[#ff792d]/50 transition-all"
        >
          <label
            for="city-filter"
            class="text-[10px] font-bold uppercase text-[#8796AF] mr-1 border-r border-gray-100 pr-2 whitespace-nowrap cursor-pointer"
          >
            {{ t('city-label', 'Tuman') }}
          </label>
          <Select v-model="cityFilter" name="cityId">
            <SelectTrigger
              id="city-filter"
              class="border-none shadow-none h-8 min-w-[120px] max-w-[180px] focus:ring-0 text-gray-700 font-semibold bg-transparent"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent class="bg-white">
              <SelectItem value="all">{{ t('all', 'Barchasi') }}</SelectItem>
              <SelectItem v-for="city in citiesForFilter" :key="city.id" :value="String(city.id)">
                {{ city.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- School Filter Select (shown only when city is selected) -->
        <div
          v-if="cityFilter !== 'all'"
          class="flex items-center h-9 border border-gray-200 rounded-lg bg-white pl-3 focus-within:ring-1 focus-within:ring-[#ff792d]/20 focus-within:border-[#ff792d]/50 transition-all"
        >
          <label
            for="school-filter"
            class="text-[10px] font-bold uppercase text-[#8796AF] mr-1 border-r border-gray-100 pr-2 whitespace-nowrap cursor-pointer"
          >
            {{ t('school', 'Maktab') }}
          </label>
          <Select v-model="schoolFilter" name="schoolId">
            <SelectTrigger
              id="school-filter"
              class="border-none shadow-none h-8 min-w-[140px] max-w-[200px] focus:ring-0 text-gray-700 font-semibold bg-transparent"
              :disabled="isSchoolsLoading"
            >
              <SelectValue :placeholder="isSchoolsLoading ? t('loading') + '...' : undefined" />
            </SelectTrigger>
            <SelectContent class="bg-white">
              <SelectItem value="all">{{ t('all', 'Barchasi') }}</SelectItem>
              <SelectItem v-for="sch in schools" :key="sch.id" :value="String(sch.id)">
                {{ sch.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Add Teacher Button -->
        <Can i="employees.add">
          <Button
            @click="isCreateDrawerOpen = true"
            class="h-9 px-4 rounded-lg bg-[#ff792d] hover:bg-[#e05e1a] text-white font-semibold text-sm flex items-center gap-1.5 transition-all shadow-none border-none cursor-pointer"
          >
            <Plus class="w-4 h-4 stroke-[2.5]" />
            {{ t('new-teacher-add', "Yangi o'qituvchi") }}
          </Button>
        </Can>
      </div>
    </header>

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
          />
        </div>
      </template>
    </Can>

    <!-- Create Teacher Drawer -->
    <CreateTeacherDrawer v-model:open="isCreateDrawerOpen" />
  </div>
</template>
