<script setup lang="ts">
import type { RequestsFetchParams } from '../types'
import { Input } from '@/components/ui/input'
import { ref, computed, watch } from 'vue'
import { useCheckPermission } from '@/composables/useCheckPermission'
import { refDebounced } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import { DatePicker } from '../../../attendances/list/modules'
import type { DateValue } from '@internationalized/date'
import { getLocalTimeZone } from '@internationalized/date'
import { DataTable, useColumns } from '../modules'

import { useGetRequests } from '../query/useGetRequests'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown } from 'lucide-vue-next'
import { useQuery } from '@tanstack/vue-query'
import { fetchEmployees } from '@/views/users/list/api'
import { MenuIcon } from 'lucide-vue-next'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger
} from '@/components/ui/sheet'

const { t } = useI18n()
const router = useRouter()
const { hasPermission: hasDetailPermission } = useCheckPermission('employees.detail')
const { hasPermission: hasEmployeesListPermission } = useCheckPermission('employees.list')
const columns = useColumns(router, hasDetailPermission)
const now = dayjs()
const oneMonthAgo = now.subtract(1, 'month')
const fromCreatedAt = ref<Dayjs | undefined>(oneMonthAgo)
const toCreatedAt = ref<Dayjs | undefined>(now)
const search = ref('')
const debouncedSearch = refDebounced(search, 800)
const openEmployeeSelect = ref(false)
const employeeFilterSearch = ref('')
const debouncedEmployeeFilterSearch = refDebounced(employeeFilterSearch, 600)

const employeesParams = computed(() => ({
  size: 50,
  page: 1,
  search: debouncedEmployeeFilterSearch.value,
  isAll: false
}))
const { data: employeesResponse, isLoading: loadingEmployees } = useQuery({
  queryKey: ['employees', employeesParams],
  queryFn: () => fetchEmployees(employeesParams.value),
  staleTime: 600000,
  gcTime: Infinity,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  enabled: hasEmployeesListPermission
})
const employees = computed(() => (employeesResponse.value?.data?.data || []).filter((e) => e.userId))

const params = ref<{
  page: number
  size: number
  search?: string
  employeeId?: string
  fromCreatedAt?: string
  toCreatedAt?: string
}>({
  page: 1,
  size: 20,
  search: '',
  employeeId: undefined,
  fromCreatedAt: fromCreatedAt.value?.startOf('day').toISOString(),
  toCreatedAt: toCreatedAt.value?.endOf('day').toISOString()
})
const { data, isLoading } = useGetRequests(params)

const tableData = computed(() => {
  return data.value ? data.value.data.data : []
})
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

const handlePaginationUpdate = (val: RequestsFetchParams) => {
  params.value = { ...params.value, ...val }
}

watch([fromCreatedAt, toCreatedAt], () => {
  params.value = {
    ...params.value,
    fromCreatedAt: fromCreatedAt.value?.startOf('day').toISOString(),
    toCreatedAt: toCreatedAt.value?.endOf('day').toISOString(),
    page: 1
  }
})

const isDateValue = (value: unknown): value is DateValue =>
  typeof value === 'object' &&
  value !== null &&
  'toDate' in value &&
  typeof (value as DateValue).toDate === 'function'

const handleDateFilter = (
  date: DateValue | Date | undefined,
  key: 'fromCreatedAt' | 'toCreatedAt'
) => {
  if (!date) {
    if (key === 'fromCreatedAt') fromCreatedAt.value = undefined
    else toCreatedAt.value = undefined
  } else {
    const baseDate: Date =
      date instanceof Date
        ? date
        : isDateValue(date)
        ? date.toDate(getLocalTimeZone())
        : new Date(date as unknown as string | number | Date)
    const d = dayjs(baseDate)
    if (key === 'fromCreatedAt') fromCreatedAt.value = d
    else toCreatedAt.value = d
  }

  params.value = {
    ...params.value,
    fromCreatedAt: fromCreatedAt.value?.startOf('day').toISOString(),
    toCreatedAt: toCreatedAt.value?.endOf('day').toISOString(),
    page: 1
  }
}

const fromCreatedAtInitial = computed(() =>
  fromCreatedAt.value ? fromCreatedAt.value.format('YYYY-MM-DD') : undefined
)

const toCreatedAtInitial = computed(() =>
  toCreatedAt.value ? toCreatedAt.value.format('YYYY-MM-DD') : undefined
)

watch(debouncedSearch, () => {
  params.value.search = debouncedSearch.value
  params.value.page = 1
})

watch(() => params.value.employeeId, () => {
  params.value.page = 1
})
</script>

<template>
  <!-- Header Section -->
  <header
    class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 border-b lg:pb-3 pb-5 px-6"
  >
    <div class="flex flex-col mt-1">
      <h2 class="scroll-m-20 lg:text-xl text-2xl font-semibold tracking-tight transition-colors">
        {{ t('requests') }}
      </h2>
    </div>

    <div class="flex items-center gap-3 w-full lg:w-auto">
      <!-- Search - Always visible but expands on desktop -->
      <div class="flex-1 lg:flex-none custom-lg:w-[200px]">
        <Input
          id="search-input"
          name="search"
          v-model="search"
          :placeholder="t('search')"
          class="h-9"
        >
          <template #left>
            <svg
              class="h-4 w-4"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </template>
        </Input>
      </div>

      <!-- Desktop Actions (Visible on 1000px+) -->
      <div class="hidden custom-lg:flex items-center gap-3">
        <!-- Employee Select -->
        <Popover v-model:open="openEmployeeSelect" v-if="hasEmployeesListPermission">
          <PopoverTrigger asChild>
            <Button
              id="employee-select"
              name="employeeSelect"
              variant="outline"
              role="combobox"
              :aria-expanded="openEmployeeSelect"
              class="h-9 w-[200px] justify-between border-gray-200"
            >
              <span class="truncate">
                {{
                  params.employeeId
                    ? employees.find((employee) => employee.id.toString() === params.employeeId)?.user
                      ? `${employees.find((employee) => employee.id.toString() === params.employeeId)?.user?.firstName || ''} ${employees.find((employee) => employee.id.toString() === params.employeeId)?.user?.lastName || ''}`
                      : t('select-employee')
                    : t('select-employee')
                }}
              </span>
              <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-[200px] p-0 shadow-lg border-[#E0E6F0] rounded-lg">
            <Command v-model:search-term="employeeFilterSearch" :filter-results="false">
              <CommandInput :placeholder="t('search')" class="border-none focus:ring-0" />
              <CommandEmpty v-if="!loadingEmployees">{{ t('no-data') }}</CommandEmpty>
              <CommandEmpty v-else>{{ t('loading') }}...</CommandEmpty>
              <CommandList>
                <CommandGroup>
                  <CommandItem
                    value="all"
                    @select="() => {
                      params.employeeId = undefined
                      openEmployeeSelect = false
                      employeeFilterSearch = ''
                    }"
                  >
                    <Check
                      :class="cn(
                        'mr-2 h-4 w-4',
                        !params.employeeId ? 'opacity-100' : 'opacity-0'
                      )"
                    />
                    {{ t('all') }}
                  </CommandItem>
                  <CommandItem
                    v-for="employee in employees"
                    :key="employee.id"
                    :value="`${employee.user?.firstName || ''} ${employee.user?.lastName || ''} ${employee.comment || ''} ${employee.id}`"
                    @select="() => {
                      const val = employee.id.toString()
                      params.employeeId = params.employeeId === val ? undefined : val
                      openEmployeeSelect = false
                      employeeFilterSearch = ''
                    }"
                  >
                    <Check
                      :class="cn(
                        'mr-2 h-4 w-4',
                        params.employeeId === employee.id.toString() ? 'opacity-100' : 'opacity-0'
                      )"
                    />
                    {{ employee.user?.firstName || employee.comment }} {{ employee.user?.lastName || '' }}
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <div class="flex items-center h-9 border border-gray-200 rounded-lg bg-white pl-3 focus-within:ring-1 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all">
          <span class="text-[10px] font-bold uppercase text-[#8796AF] mr-1 border-gray-100 pr-2 whitespace-nowrap">{{ t('from') }}</span>
          <DatePicker
            :initial="fromCreatedAtInitial"
            @confirm:date="(e: any) => handleDateFilter(e, 'fromCreatedAt')"
            class="border-none shadow-none h-8 w-[130px] focus:ring-0 text-gray-700 font-medium"
          />
        </div>
        <div class="flex items-center h-9 border border-gray-200 rounded-lg bg-white pl-3 focus-within:ring-1 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all">
          <span class="text-[10px] font-bold uppercase text-[#8796AF] mr-1 border-gray-100 pr-2 whitespace-nowrap">{{ t('to') }}</span>
          <DatePicker
            :initial="toCreatedAtInitial"
            @confirm:date="(e: any) => handleDateFilter(e, 'toCreatedAt')"
            class="border-none shadow-none h-8 w-[130px] focus:ring-0 text-gray-700 font-medium"
          />
        </div>
      </div>

      <!-- Mobile/Compact Menu (Visible below 1000px) -->
      <div class="flex custom-lg:hidden items-center gap-2">
        <Sheet>
          <SheetTrigger as-child>
            <Button variant="outline" size="icon" class="h-9 w-9 border-[#E0E6F0]">
              <MenuIcon :size="20" class="text-gray-600" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" class="w-[300px] sm:w-[400px]">
            <SheetHeader class="mb-6">
            </SheetHeader>
            
            <div class="flex flex-col gap-6">
              <div class="flex flex-col gap-4">
                <!-- Employee Mobile -->
                <div class="flex flex-col gap-1.5" v-if="hasEmployeesListPermission">
                  <label class="text-sm font-medium text-gray-700 ml-1">{{ t('employees') }}</label>
                  <Popover v-model:open="openEmployeeSelect">
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        :aria-expanded="openEmployeeSelect"
                        class="h-10 w-full justify-between border-[#E0E6F0]"
                      >
                        <span class="truncate">
                          {{
                            params.employeeId
                              ? employees.find((employee) => employee.id.toString() === params.employeeId)?.user
                                ? `${employees.find((employee) => employee.id.toString() === params.employeeId)?.user?.firstName || ''} ${employees.find((employee) => employee.id.toString() === params.employeeId)?.user?.lastName || ''}`
                                : t('select-employee')
                              : t('select-employee')
                          }}
                        </span>
                        <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent class="w-[var(--radix-popover-trigger-width)] p-0">
                      <Command v-model:search-term="employeeFilterSearch" :filter-results="false">
                        <CommandInput :placeholder="t('search')" />
                        <CommandEmpty v-if="!loadingEmployees">{{ t('no-data') }}</CommandEmpty>
                        <CommandEmpty v-else>{{ t('loading') }}...</CommandEmpty>
                        <CommandList>
                          <CommandGroup>
                            <CommandItem
                              value="all"
                              @select="() => {
                                params.employeeId = undefined
                                openEmployeeSelect = false
                                params.page = 1
                              }"
                            >
                              <Check
                                :class="cn(
                                  'mr-2 h-4 w-4',
                                  !params.employeeId ? 'opacity-100' : 'opacity-0'
                                )"
                              />
                              {{ t('all') }}
                            </CommandItem>
                            <CommandItem
                              v-for="employee in employees"
                              :key="employee.id"
                              :value="`${employee.user?.firstName || ''} ${employee.user?.lastName || ''}`"
                              @select="() => {
                                const val = employee.id.toString()
                                params.employeeId = params.employeeId === val ? undefined : val
                                openEmployeeSelect = false
                                params.page = 1
                              }"
                            >
                              <Check
                                :class="cn(
                                  'mr-2 h-4 w-4',
                                  params.employeeId === employee.id.toString() ? 'opacity-100' : 'opacity-0'
                                )"
                              />
                              {{ employee.user?.firstName || employee.comment }} {{ employee.user?.lastName || '' }}
                            </CommandItem>
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div class="flex flex-col gap-1.5">
                  <label class="text-sm font-medium text-gray-700 ml-1">{{ t('from') }}</label>
                  <DatePicker
                    :initial="fromCreatedAtInitial"
                    @confirm:date="(e: any) => handleDateFilter(e, 'fromCreatedAt')"
                    class="h-10 w-full border-[#E0E6F0]"
                  />
                </div>
                <div class="flex flex-col gap-1.5">
                  <label class="text-sm font-medium text-gray-700 ml-1">{{ t('to') }}</label>
                  <DatePicker
                    :initial="toCreatedAtInitial"
                    @confirm:date="(e: any) => handleDateFilter(e, 'toCreatedAt')"
                    class="h-10 w-full border-[#E0E6F0]"
                  />
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  </header>

  <div class="mt-6 w-full px-6">
    <DataTable
      :data="tableData"
      :columns="columns"
      :pagination="tablePagination"
      :loading="isLoading"
      @update:pagination="handlePaginationUpdate"
    />
  </div>
</template>
