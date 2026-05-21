<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuery, } from '@tanstack/vue-query'
import { createColumns, DataTable, CreateUserDrawer } from '../modules'
import { Input } from '@/components/ui/input'
import Can from '@/components/can.vue'
import ServerError from '@/components/error/ServerError.vue'
import type { FetchEmployeesParams } from '../types'
import { fetchEmployees } from '../api'
import UploadEmployeesModal from '../modules/UploadEmployeesModal.vue'
import { Button } from '@/components/ui/button'
import { useGetDepartments } from '@/views/departments/query/useGetDepartments'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet'
import { MenuIcon, DownloadIcon } from 'lucide-vue-next'
import * as XLSX from 'xlsx'
import { prettify, prettifyPhoneNumber } from '@/lib/utils'

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
const status = ref<string>('active')
const sorting = ref<{
  orderBy: string | null
  order: 'asc' | 'desc' | null
}>({
  orderBy: null,
  order: null
})

const rowSelection = ref<Record<string, boolean>>({})

const departmentParams = ref({ isAll: true })
const { data: departmentsData } = useGetDepartments(departmentParams)
const selectedDepartmentId = ref<string>(props.departmentId || 'all')

const selectedEmployeeIds = computed(() => {
  return Object.keys(rowSelection.value).filter((key) => rowSelection.value[key])
})

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
  status: 'active',
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

watch([status], () => {
  params.value = {
    ...params.value,
    status: status.value === 'all' ? undefined : status.value,
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

watch(() => props.departmentId, (newId) => {
  params.value.departmentId = newId
  selectedDepartmentId.value = newId || 'all'
  params.value.page = 1
})

const { data, isLoading, isError } = useQuery({
  queryKey: ['employees', params],
  queryFn: () => fetchEmployees(params.value),
  staleTime: 600000,
  gcTime: Infinity,
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

import { useRouter } from 'vue-router'

const router = useRouter()


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

watch(tableData, (newData) => {
  newData.forEach((row) => {
    if (row.id && row.user_id) {
      employeeIdToUserIdMap.value[String(row.id)] = String(row.user_id)
    }
  })
}, { immediate: true })



import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

const isLoadingExport = ref(false)

const exportToExcel = async () => {
  try {
    isLoadingExport.value = true
    const response = await fetchEmployees({
      ...params.value,
      isAll: true
    })

    const resData = response.data?.result?.data || response.data?.data
    if (!resData) return

    const rawData = resData.map((employee: any) => flattenObject(employee))
    const wsData: any[][] = []

    // Header
    const headers = [
      'ID',
      t('fio'),
      t('phone-number'),
      'INN',
      ('passport'),
      'PINFL',
      ('account-number'),
      'MFO',
      t('salary'),
      ('gross-salary'),
      t('allowed-percent'),
      t('contract-type'),
      t('status')
    ]
    wsData.push(headers)

    // Rows
    rawData.forEach((item) => {
      const fullName = item.user_lastName
        ? `${item.user_lastName} ${item.user_firstName}`
        : item.comment

      const row = [
        item.employeeNumber || '',
        fullName || t('no-data'),
        item.phoneNumber ? prettifyPhoneNumber(item.phoneNumber) : '',
        item.inn || '',
        item.passportSerialNumber || '',
        item.pinfl || '',
        item.accountCredit || '',
        item.mfo || '',
        item.salary ? prettify(item.salary) : '',
        item.grossSalary ? prettify(item.grossSalary) : '',
        item.percentAllowed ? `${item.percentAllowed}%` : '',
        item.contractType || '',
        t(item.status)
      ]
      wsData.push(row)
    })

    const ws = XLSX.utils.aoa_to_sheet(wsData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, t('employees'))

    const fileName = `${t('employees')}_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, fileName)
  } catch (e) {
    console.error('Export failed:', e)
  } finally {
    isLoadingExport.value = false
  }
}



const handleRowClick = (row: any) => {
  router.push({ name: 'users-edit', params: { id: row.id } })
}
</script>

<template>
  <div>
    <header
      class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 border-b lg:pb-3 pb-5 px-6">
      <div class="flex flex-col mt-1">
        <h2 class="scroll-m-20 lg:text-xl text-2xl font-semibold tracking-tight transition-colors">
          {{ t('employees') }}
          <span v-if="!isLoading && tablePagination.totalCount > 0" class="text-sm ml-2 font-medium text-[#8796AF]">
            {{ tablePagination.totalCount }}
            {{ tablePagination.totalCount === 1 ? t('count') : t('count').toLowerCase() }}
          </span>
        </h2>
      </div>

      <div class="flex items-center gap-3 w-full lg:w-auto">
        <!-- Search - Always visible but expands on desktop -->
        <div class="flex-1 lg:flex-none lg:w-[200px] custom-xl:w-[200px]">
          <Can i="employees.list">
            <Input id="employees-search" name="search" v-model="search" :placeholder="t('search')"
              class="h-9 focus:ring-0 focus:ring-offset-0 ring-0 outline-none">
              <template #left>
                <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </template>
            </Input>
          </Can>
        </div>

        <!-- Desktop Actions (Visible on 1400px+) -->
        <div class="hidden custom-xl:flex items-center gap-3">

          <!-- Status -->
          <div
            class="flex items-center h-9 border border-gray-200 rounded-lg bg-white pl-3 focus-within:ring-1 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all">
            <label for="status-desktop"
              class="text-[10px] font-bold uppercase text-[#8796AF] mr-1 border-r border-gray-100 pr-2 whitespace-nowrap cursor-pointer">{{
                t('status') }}</label>
            <Select v-model="status" name="status">
              <SelectTrigger id="status-desktop"
                class="border-none shadow-none h-8 min-w-[120px] max-w-[200px] focus:ring-0 text-gray-700 font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{{ t('all') }}</SelectItem>
                <SelectItem value="active">{{ t('active') }}</SelectItem>
                <SelectItem value="blocked">{{ t('blocked') }}</SelectItem>
                <SelectItem value="leftTheCompany">{{ t('left-the-company') }}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <template v-if="selectedEmployeeIds.length === 0 && !props.departmentId">
            <Button :loading="isLoadingExport" variant="outline" size="sm"
              class="h-9 border-[#E0E6F0] text-gray-700 hover:bg-gray-50" @click="exportToExcel">
              <DownloadIcon :size="16" />
            </Button>
            <Can i="employees.add">
              <UploadEmployeesModal />
            </Can>
            <Can i="employees.add">
              <CreateUserDrawer />
            </Can>
          </template>
        </div>

        <!-- Mobile/Compact Menu (Visible below 1400px) -->
        <div class="flex custom-xl:hidden items-center gap-2">
          <Sheet>
            <SheetTrigger as-child>
              <Button variant="outline" size="icon" class="h-9 w-9 border-[#E0E6F0]">
                <MenuIcon :size="20" class="text-gray-600" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" class="w-[300px] sm:w-[400px]">
              <SheetHeader class="mb-6">
                <SheetTitle>{{ t('actions') }}</SheetTitle>
              </SheetHeader>

              <div class="flex flex-col gap-6">
                <!-- Mobile Filters -->
                <div class="flex flex-col gap-4">
                  <!-- Department Mobile -->
                  <template v-if="!props.departmentId">
                    <div class="flex flex-col gap-1.5">
                      <label for="department-mobile" class="text-sm font-medium text-gray-700 ml-1 cursor-pointer">{{
                        t('departments') }}</label>
                      <Select v-model="selectedDepartmentId" name="department-mobile">
                        <SelectTrigger id="department-mobile" class="h-10 w-full border-[#E0E6F0]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{{ t('all') }}</SelectItem>
                          <SelectItem v-for="dept in (departmentsData?.data?.data as any)" :key="dept.id"
                            :value="dept.id">{{ dept.name }}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </template>

                  <!-- Status Mobile -->
                  <div class="flex flex-col gap-1.5">
                    <label for="status-mobile" class="text-sm font-medium text-gray-700 ml-1 cursor-pointer">{{
                      t('status')
                    }}</label>
                    <Select v-model="status" name="status-mobile">
                      <SelectTrigger id="status-mobile" class="h-10 w-full border-[#E0E6F0]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{{ t('all') }}</SelectItem>
                        <SelectItem value="active">{{ t('active') }}</SelectItem>
                        <SelectItem value="blocked">{{ t('blocked') }}</SelectItem>
                        <SelectItem value="leftTheCompany">{{ t('left-the-company') }}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <!-- Mobile Add/Upload Buttons -->
                <template v-if="selectedEmployeeIds.length === 0 && !props.departmentId">
                  <div class="flex flex-col gap-3 mt-4 [&_button]:w-full">
                    <span class="text-xs font-semibold text-gray-500 uppercase">{{ t('tools') }}</span>
                    <Can i="employees.add">
                      <UploadEmployeesModal />
                    </Can>
                    <Can i="employees.add">
                      <CreateUserDrawer />
                    </Can>
                  </div>
                </template>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>

    <Can i="employees.list">
      <template v-if="isError">
        <ServerError />
      </template>
      <template v-else>
        <div class="mt-5 w-full px-6">
          <DataTable :data="tableData" :columns="columns" :pagination="tablePagination" :loading="isLoading"
            @update:pagination="handlePaginationUpdate" :sorting="sorting"
            @update:sorting="(val) => (sorting = val as any)" v-model:row-selection="rowSelection"
            @row-click="handleRowClick" />
        </div>
      </template>
    </Can>
  </div>
</template>
