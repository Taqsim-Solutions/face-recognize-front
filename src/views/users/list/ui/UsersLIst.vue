<script setup lang="ts">
import UserContextBadges from '@/components/UserContextBadges.vue'
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuery } from '@tanstack/vue-query'
import { createColumns, DataTable, CreateUserDrawer } from '../modules'
import Can from '@/components/can.vue'
import StatusFilterSelect from '@/components/StatusFilterSelect.vue'
import ServerError from '@/components/error/ServerError.vue'
import type { FetchEmployeesParams } from '../types'
import { fetchEmployees, bulkChangeUserStatus } from '../api'
import SimpleBulkStatusBar from '@/components/table/SimpleBulkStatusBar.vue'
import { SearchIcon } from 'lucide-vue-next'

// Export the flattened data type for use in DataTable
export type FlattenedData = Record<string, any>

const props = defineProps<{
  departmentId?: string
}>()

const { t } = useI18n()

// Calculate date 5 years ago
const fiveYearsAgo = new Date()
fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5)

const search = ref('')
const debouncedSearch = ref('')
const levelFilter = ref<string>('all')
const statusFilter = ref<string>('all')
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

const selectedDepartmentId = ref<string>(props.departmentId || 'all')

let searchTimeout: NodeJS.Timeout | null = null

watch(search, (newValue) => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(() => {
    debouncedSearch.value = newValue
  }, 1000)
})

// Params
const params = ref<FetchEmployeesParams>({
  page: 1,
  size: 20,
  departmentId: props.departmentId,
  search: '',
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
    page: 1
  }
})

watch([statusFilter], () => {
  params.value = {
    ...params.value,
    entityStatus: statusFilter.value === 'all' ? undefined : Number(statusFilter.value),
    page: 1
  }
})

// Removed watcher that cleared selection on page change

watch([debouncedSearch], () => {
  params.value.search = debouncedSearch.value
  params.value.page = 1
})

watch(selectedDepartmentId, (val) => {
  params.value.departmentId = val === 'all' ? undefined : val
  params.value.page = 1
})

watch(
  () => props.departmentId,
  (newId) => {
    params.value.departmentId = newId
    selectedDepartmentId.value = newId || 'all'
    params.value.page = 1
  }
)

const { data, isLoading, isError } = useQuery({
  queryKey: ['employees', params],
  queryFn: () => fetchEmployees(params.value),
  staleTime: 600000,
  gcTime: Infinity
})

const tablePagination = computed(() => {
  const result = data.value?.data?.result
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
  if (data.value?.headers?.['x-pagination']) {
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
      currentPage: 1,
      totalCount: 0,
      totalPages: 1,
      pageSize: params.value.size,
      canPrevPage: false,
      canNextPage: false
    }
  }
})

const columns = computed(() => {
  return createColumns()
})

const handlePaginationUpdate = (val: { size?: number; page?: number }) => {
  if (val.page !== undefined) {
    params.value.page = val.page
  }
  if (val.size !== undefined) {
    params.value.size = val.size
    params.value.page = 1 // Reset to first page when changing page size
  }
}

const tableData = computed(() => {
  const resultData = data.value?.data?.result?.data || data.value?.data?.data
  if (resultData && Array.isArray(resultData)) {
    return resultData.map((employee) => flattenObject(employee))
  }
  return []
})

const flattenObject = (
  obj: Record<string, any>,
  parentKey = '',
  result: Record<string, any> = {}
): Record<string, any> => {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const newKey = parentKey ? `${parentKey}_${key}` : key

      if (key === 'identifiers' && Array.isArray(obj[key])) {
        obj[key].forEach((identifier: { type: string; value: any }) => {
          result[identifier.type] = identifier.value
        })
      } else if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        flattenObject(obj[key], newKey, result)
      } else {
        result[newKey] = obj[key]
      }
    }
  }
  return result
}

const employeeIdToUserIdMap = ref<Record<string, string>>({})

watch(
  tableData,
  (newData) => {
    newData.forEach((row) => {
      if (row.id && row.user_id) {
        employeeIdToUserIdMap.value[String(row.id)] = String(row.user_id)
      }
    })
  },
  { immediate: true }
)

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

const handleRowClick = () => {
  // Row click is disabled since edit is handled via drawer in RowActions
}
</script>

<template>
  <div>
    <!-- Header Title & Add Button -->
    <header
      class="flex justify-between items-center py-4 pt-0 px-6 border-b border-gray-200 bg-white"
    >
      <div>
      <h1 class="text-[20px] font-bold text-[#1b1b1b] tracking-tight">
        {{ t('users', 'Foydalanuvchilar') }}
      </h1>
        <UserContextBadges />
      </div>

      <Can i="employees.add">
        <CreateUserDrawer />
      </Can>
    </header>

    <!-- Filters Row -->
    <div class="flex flex-wrap items-center gap-3 px-6 pt-5 bg-white">
      <!-- Search Input -->
      <div
        class="flex items-center h-10 w-full sm:w-[420px] border border-gray-200 rounded-xl bg-white px-3 focus-within:ring-1 focus-within:ring-[#ff792d]/20 focus-within:border-[#ff792d]/50 transition-all"
      >
        <SearchIcon class="w-4 h-4 text-gray-400 mr-2 shrink-0" />
        <input
          v-model="search"
          type="text"
          :placeholder="t('search-placeholder', 'Ism-familiya bo\'yicha qidiruv')"
          class="border-none outline-none bg-transparent text-sm text-gray-600 placeholder-gray-400 w-full font-medium"
        />
      </div>

      <!-- Level (Role) Filter Select -->
      <Select v-model="levelFilter" name="level">
        <SelectTrigger
          class="h-10 w-full sm:w-[200px] border border-gray-200 rounded-xl focus:ring-0 text-gray-600 bg-white text-left font-medium"
        >
          <SelectValue :placeholder="t('select-role', 'Rolni tanlang')" />
        </SelectTrigger>
        <SelectContent class="bg-white">
          <SelectItem value="all">{{ t('all-roles', 'Rolni tanlang') }}</SelectItem>
          <SelectItem value="1">{{ t('roles.teacher') }}</SelectItem>
          <SelectItem value="2">{{ t('roles.director') }}</SelectItem>
          <SelectItem value="3">{{ t('roles.district') }}</SelectItem>
          <SelectItem value="4">{{ t('roles.region') }}</SelectItem>
          <SelectItem value="5">{{ t('roles.admin') }}</SelectItem>
        </SelectContent>
      </Select>

      <StatusFilterSelect v-model="statusFilter" />
    </div>

    <Can i="employees.list">
      <template v-if="isError">
        <ServerError />
      </template>
      <template v-else>
        <div class="mt-5 w-full px-6">
          <SimpleBulkStatusBar :selected-ids="selectedIds" :apply="bulkChangeUserStatus" @done="clearSelection" />
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
