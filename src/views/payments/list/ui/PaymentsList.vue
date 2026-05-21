<script setup lang="ts">
import type { FetchPaymentsParams } from '../types'
import { ref, computed, watch, reactive, onMounted } from 'vue'
import type { DateValue } from '@internationalized/date'
import { getLocalTimeZone } from '@internationalized/date'
import { useI18n } from 'vue-i18n'
import { useGetPayments } from '../query/useGetPayments'
import { columns } from '../modules'
import DataTable from '../modules/DataTable.vue'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Check, ChevronsUpDown, MenuIcon } from 'lucide-vue-next'
import { useQuery } from '@tanstack/vue-query'
import { fetchEmployees } from '@/views/users/list/api'
import { refDebounced } from '@vueuse/core'
import TransactionModal from '../modules/TransactionModal.vue'
import { useCheckPermission } from '@/composables/useCheckPermission'
import ServerError from '@/components/error/ServerError.vue'
import ExcelExport from '../modules/ExcelExport.vue'
import { fetchEposTerminals } from '@/views/dashboard/api'
import { EposTermimalModal } from '@/views/dashboard/type'
import { DatePicker } from '../../../attendances/list/modules'

import humoLogo from '@/assets/humo.png'
import davrLogo from '@/assets/davr.png'
import uzcardLogo from '@/assets/uzcard.png'
import xaznaLogo from '@/assets/xazna.svg'

import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger
} from '@/components/ui/sheet'
import Can from '@/components/can.vue'

const getLogo = (provider?: string) => {
  switch (provider) {
    case 'humo':
      return humoLogo
    case 'boGate':
      return davrLogo
    case 'xazna':
      return xaznaLogo
    default:
      return uzcardLogo
  }
}

const { t } = useI18n()
const { hasPermission: hasTerminalsPermission } = useCheckPermission('payment.terminals')
const { hasPermission: hasEmployeesPermission } = useCheckPermission('employees.list')

const now = dayjs()
const oneMonthAgo = now.subtract(1, 'month')

const fromCreatedAt = ref<Dayjs | undefined>(oneMonthAgo)
const toCreatedAt = ref<Dayjs | undefined>(now)
const selectedEmployeeId = ref<string | undefined>(undefined)
const search = ref('')
const debouncedSearch = refDebounced(search, 800)

const selectedTransaction = ref<any | null>(null)
const isTransactionModalOpen = ref(false)

const handleRowClick = (transaction: any) => {
  selectedTransaction.value = transaction
  isTransactionModalOpen.value = true
}

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
  enabled: hasEmployeesPermission
})

const employees = computed(() =>
  (employeesResponse.value?.data?.data || []).filter((e) => e.userId)
)

const sorting = ref<{
  orderBy: string | null
  order: 'asc' | 'desc' | null
}>({
  orderBy: null,
  order: null
})

const params = ref<FetchPaymentsParams>({
  page: 1,
  size: 20,
  search: '',
  fromCreatedAt: fromCreatedAt.value?.startOf('day').toISOString(),
  toCreatedAt: toCreatedAt.value?.endOf('day').toISOString()
})

const isDateValue = (value: unknown): value is DateValue =>
  typeof value === 'object' &&
  value !== null &&
  'toDate' in value &&
  typeof (value as DateValue).toDate === 'function'

// DatePicker emits 'Date | undefined' through confirm:date in our usage, but types may include other libraries' DateValue.
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

// ✅ Watch sorting
watch(
  sorting,
  (s) => {
    if (s.orderBy && s.order) {
      params.value.orderBy = s.orderBy
      params.value.order = s.order
    } else {
      params.value.orderBy = undefined
      params.value.order = undefined
    }
  },
  { deep: true }
)

watch([fromCreatedAt, toCreatedAt, selectedEmployeeId], () => {
  params.value = {
    ...params.value,
    fromCreatedAt: fromCreatedAt.value?.startOf('day').toISOString(),
    toCreatedAt: toCreatedAt.value?.endOf('day').toISOString(),
    employeeId: selectedEmployeeId.value || undefined,
    page: 1
  }
})

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

const { data, isLoading, isError } = useGetPayments(params)

// ✅ Pagination
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
      canPrevPage: false,
      canNextPage: false
    }
  }
})

const handlePaginationUpdate = (val: { size?: number; page?: number }) => {
  params.value = { ...params.value, ...val }
}

// ✅ EPOS terminals state
const terminalState = reactive({
  terminals: [] as EposTermimalModal[],
  activeTerminalId: null as number | null
})

const fetchTerminals = async () => {
  const res = await fetchEposTerminals({
    ...params.value,
    size: 100,
    page: params.value.page ?? 1,
    isAll: true
  })
  if (res?.data?.isSuccess && Array.isArray(res.data.data)) {
    terminalState.terminals = res.data.data
    if (terminalState.terminals.length > 0) {
      terminalState.activeTerminalId = terminalState.terminals[0].eposTerminalId
    }
  }
}

onMounted(() => {
  if (hasTerminalsPermission.value) {
    fetchTerminals()
  }
})
</script>

<template>
  <div>
    <!-- Header Section -->
    <header
      class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 border-b lg:pb-3 pb-5 px-6"
    >
      <div class="flex flex-col mt-1">
        <h2 class="scroll-m-20 lg:text-xl text-2xl font-semibold tracking-tight transition-colors">
          {{ t('payments') }}
        </h2>
      </div>

      <div class="flex items-center gap-3 w-full lg:w-auto">
        <!-- Search - Always visible but expands on desktop -->
        <div class="flex-1 lg:flex-none custom-lg:w-[200px]">
          <Input id="payments-search" name="search" v-model="search" :placeholder="t('search')" class="h-9">
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
          <template v-if="hasEmployeesPermission">
            <Popover v-model:open="openEmployeeSelect">
              <PopoverTrigger asChild>
                <Button
                  id="employee-select"
                  variant="outline"
                  role="combobox"
                  :aria-expanded="openEmployeeSelect"
                  class="h-9 w-[200px] justify-between border-gray-200 bg-white"
                >
                  <span class="truncate">
                    {{
                      selectedEmployeeId
                        ? employees.find((emp) => emp.id.toString() === selectedEmployeeId)?.user
                          ? `${employees.find((emp) => emp.id.toString() === selectedEmployeeId)?.user?.firstName || ''} ${employees.find((emp) => emp.id.toString() === selectedEmployeeId)?.user?.lastName || ''}`
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
                          selectedEmployeeId = undefined
                          openEmployeeSelect = false
                          employeeFilterSearch = ''
                        }"
                      >
                        <Check
                          :class="cn(
                            'mr-2 h-4 w-4',
                            !selectedEmployeeId ? 'opacity-100' : 'opacity-0'
                          )"
                        />
                        {{ t('all') }}
                      </CommandItem>
                      <CommandItem
                        v-for="employee in employees"
                        :key="employee.id"
                        :value="`${employee.user?.firstName || ''} ${employee.user?.lastName || ''} ${employee.id}`"
                        @select="() => {
                          const val = employee.id.toString()
                          selectedEmployeeId = selectedEmployeeId === val ? undefined : val
                          openEmployeeSelect = false
                          employeeFilterSearch = ''
                        }"
                      >
                        <Check
                          :class="cn(
                            'mr-2 h-4 w-4',
                            selectedEmployeeId === employee.id.toString() ? 'opacity-100' : 'opacity-0'
                          )"
                        />
                        {{ employee.user?.firstName }} {{ employee.user?.lastName }}
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </template>

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
          <ExcelExport :params="params" />
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
                  <template v-if="hasEmployeesPermission">
                    <div class="flex flex-col gap-1.5">
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
                                selectedEmployeeId
                                  ? employees.find((emp) => emp.id.toString() === selectedEmployeeId)?.user
                                    ? `${employees.find((emp) => emp.id.toString() === selectedEmployeeId)?.user?.firstName || ''} ${employees.find((emp) => emp.id.toString() === selectedEmployeeId)?.user?.lastName || ''}`
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
                                    selectedEmployeeId = undefined
                                    openEmployeeSelect = false
                                    employeeFilterSearch = ''
                                  }"
                                >
                                  <Check
                                    :class="cn(
                                      'mr-2 h-4 w-4',
                                      !selectedEmployeeId ? 'opacity-100' : 'opacity-0'
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
                                    selectedEmployeeId = selectedEmployeeId === val ? undefined : val
                                    openEmployeeSelect = false
                                    employeeFilterSearch = ''
                                  }"
                                >
                                  <Check
                                    :class="cn(
                                      'mr-2 h-4 w-4',
                                      selectedEmployeeId === employee.id.toString() ? 'opacity-100' : 'opacity-0'
                                    )"
                                  />
                                  {{ employee.user?.firstName }} {{ employee.user?.lastName }}
                                </CommandItem>
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </template>

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

                <div class="[&_button]:w-full mt-4">
                  <ExcelExport :params="params" />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>

   <Can i="payment.terminals">
     <!-- EPOS Cards -->
    <div class="p-4 rounded-xl bg-[#F7F9FB] mt-4 mx-6">
      <div class="grid gap-4 grid-cols-1 md:grid-cols-2 custom-lg:grid-cols-3">
        <Card
          v-for="terminal in terminalState.terminals"
          :key="terminal.id"
          class="relative overflow-hidden transition-transform duration-300 rounded-xl shadow-sm group bg-white"
        >
          <CardHeader class="flex justify-between items-center flex-row relative z-10 p-4 pb-0">
            <div class="h-10">
              <CardTitle class="text-black leading-tight flex font-bold text-lg pl-1">
                {{ t(terminal.eposTerminal?.paymentMethod?.provider) || '—' }}
              </CardTitle>
            </div>

            <span
              class="inline-flex -mt-3 rounded-lg border items-center gap-1 px-2 py-0.5 text-sm font-semibold justify-center shadow-sm transition-all duration-200"
              :class="
                terminal.status === 'active'
                  ? 'bg-[#c0efdf] text-[#37b488] border-[#37b488]'
                  : 'bg-yellow-200 text-yellow-800'
              "
            >
              {{ t(terminal.status) }}
            </span>
          </CardHeader>

          <CardContent class="flex justify-between items-center relative z-10 px-2 pb-6 gap-4">
            <div class="px-5 py-2 w-36 flex justify-center items-center">
              <img
                :src="getLogo(terminal.eposTerminal?.paymentMethod?.provider)"
                alt="payment provider logo"
              />
            </div>

            <div class="flex-1">
              <div class="text-base mb-2">
                {{ t('balance') }}:
                <span class="font-semibold text-base text-gray-900">
                  {{ terminal.balance?.toLocaleString() }} {{ t('currency') }}
                </span>
                <div class="text-sm text-[#596881] mt-0.5">
                  {{
                    new Date(terminal.updatedAt).toLocaleString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })
                  }}
                </div>
              </div>

              <button
                v-if="terminal.isOwner"
                @click="
                  $router.push({
                    name: 'terminal-view',
                    params: { id: terminal.eposTerminalId, orgId: terminal.id }
                  })
                "
                class="group inline-flex items-center gap-1 px-3 py-1.5 mt-2 text-sm font-medium text-[#12B76A] bg-[#eaf9f4] hover:bg-[#d7f2e8] hover:text-[#0f9a58] rounded-lg shadow-sm transition-all duration-300 ease-in-out"
              >
                {{ t('details') }}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  class="ml-1"
                >
                  <path
                    d="M3.33331 8.00016H12.6666M12.6666 8.00016L9.99998 10.6668M12.6666 8.00016L9.99998 5.3335"
                    stroke="currentColor"
                    stroke-width="1.73333"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
   </Can>

    <!-- Data Table -->
    <template v-if="isError">
      <ServerError />
    </template>
    <template v-else>
      <div class="mt-6 w-full px-6">
        <DataTable
          :columns="columns as any"
          :data="data?.data.data"
          :pagination="tablePagination"
          :loading="isLoading"
          @update:pagination="handlePaginationUpdate"
          :sorting="sorting"
          @update:sorting="(val: any) => (sorting = val)"
          @row-click="handleRowClick"
        />
      </div>
    </template>
    
    <TransactionModal
      v-model:open="isTransactionModalOpen"
      :transaction="selectedTransaction"
    />
  </div>
</template>
