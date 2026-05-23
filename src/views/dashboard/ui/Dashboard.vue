<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuery } from '@tanstack/vue-query'
import { type DateValue } from '@internationalized/date'
import { ChevronDown } from 'lucide-vue-next'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RangeCalendar } from '@/components/ui/range-calendar'
import { Button } from '@/components/ui/button'

import {
  DashboardStats,
  WeeklyPerformanceChart,
  MonthlyOverviewChart,
  SchoolDetailsTable,
  OverallStatisticsChart,
  AbsentStudentsTable
} from '../modules'
import { fetchRegions } from '../api'

const { t, locale } = useI18n()

// Filter states
const regionFilter = ref<string>('all')
const cityFilter = ref<string>('all')

const dateFrom = ref<string>('')
const dateTo = ref<string>('')
const selectedDateRange = ref<any>(undefined)
const isCalendarOpen = ref(false)

// Cascading filters resets
watch(regionFilter, () => {
  cityFilter.value = 'all'
})

// Fetch regions list for cascade filter
const { data: regionsRes } = useQuery({
  queryKey: ['regions-dashboard-filter'],
  queryFn: fetchRegions,
  staleTime: Infinity
})

const regions = computed(
  () => (regionsRes.value as any)?.data?.result || (regionsRes.value as any)?.result || []
)

const citiesForFilter = computed(() => {
  if (regionFilter.value === 'all') return []
  const selectedRegion = regions.value.find((r: any) => String(r.id) === regionFilter.value)
  return selectedRegion?.cities || []
})

// Date Formatting helpers for Uzbek, Russian and English
const formatDateValue = (dateVal: DateValue) => {
  const year = dateVal.year
  const monthIdx = dateVal.month - 1
  const day = dateVal.day
  const currentLang = locale.value

  let monthName = ''
  if (currentLang === 'ru') {
    const ruMonths = [
      'Январь',
      'Февраль',
      'Март',
      'Апрель',
      'Май',
      'Июнь',
      'Июль',
      'Август',
      'Сентябрь',
      'Октябрь',
      'Ноябрь',
      'Декабрь'
    ]
    monthName = ruMonths[monthIdx]
  } else if (currentLang === 'uzc') {
    const uzcMonths = [
      'Январь',
      'Февраль',
      'Март',
      'Апрель',
      'Май',
      'Июнь',
      'Июль',
      'Август',
      'Сентябрь',
      'Октябрь',
      'Ноябрь',
      'Декабрь'
    ]
    monthName = uzcMonths[monthIdx]
  } else if (currentLang === 'uz') {
    const uzMonths = [
      'Yanvar',
      'Fevral',
      'Mart',
      'Aprel',
      'May',
      'Iyun',
      'Iyul',
      'Avgust',
      'Sentabr',
      'Oktabr',
      'Noyabr',
      'Dekabr'
    ]
    monthName = uzMonths[monthIdx]
  } else {
    const enMonths = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ]
    monthName = enMonths[monthIdx]
  }

  return `${day} ${monthName}, ${year}`
}

const dateRangeLabel = computed(() => {
  if (
    !selectedDateRange.value ||
    (!selectedDateRange.value.start && !selectedDateRange.value.end)
  ) {
    return t('pick-date', 'Sana')
  }
  const start = selectedDateRange.value.start
  const end = selectedDateRange.value.end

  if (start && end) {
    return `${formatDateValue(start)} - ${formatDateValue(end)}`
  } else if (start) {
    return `${formatDateValue(start)} - ...`
  }
  return t('pick-date', 'Sana')
})

const calendarLocale = computed(() => {
  const currentLang = locale.value
  if (currentLang === 'ru') return 'ru-RU'
  if (currentLang === 'uzc') return 'uz-Cyrl-UZ'
  return 'uz-UZ'
})

// Confirm range selection and format for API parameters
const handleRangeConfirm = (val: any) => {
  selectedDateRange.value = val
  if (val && val.start) {
    const startObj = val.start
    dateFrom.value = `${startObj.year}-${String(startObj.month).padStart(2, '0')}-${String(startObj.day).padStart(2, '0')}T00:00:00Z`
  } else {
    dateFrom.value = ''
  }
  if (val && val.end) {
    const endObj = val.end
    dateTo.value = `${endObj.year}-${String(endObj.month).padStart(2, '0')}-${String(endObj.day).padStart(2, '0')}T23:59:59Z`
  } else {
    dateTo.value = ''
  }
  if (val && val.start && val.end) {
    isCalendarOpen.value = false
  }
}

const handleClearRange = () => {
  selectedDateRange.value = undefined
  dateFrom.value = ''
  dateTo.value = ''
  isCalendarOpen.value = false
}

// Compute the parameters to pass down as props
const filterParams = computed(() => ({
  regionId: regionFilter.value === 'all' ? undefined : Number(regionFilter.value),
  cityId: cityFilter.value === 'all' ? undefined : Number(cityFilter.value),
  fromDate: dateFrom.value || undefined,
  toDate: dateTo.value || undefined
}))
</script>

<template>
  <div class="flex flex-col w-full px-0 py-4 pt-2 bg-white min-h-[calc(100vh-60px)]">
    <!-- Header Title -->
    <header class="flex justify-between items-center px-6 pb-4 border-b border-gray-200">
      <h1 class="text-[22px] font-bold text-gray-900 tracking-tight">
        {{ t('dashboard.statistics', 'Statistika') }}
      </h1>
    </header>

    <!-- Filters Row in Parent View -->
    <div class="flex flex-wrap items-center gap-3 py-6 bg-white px-6">
      <!-- Region Filter -->
      <Select v-model="regionFilter" name="regionId">
        <SelectTrigger
          class="h-10 w-full sm:w-[220px] border border-gray-200 rounded-xl focus:ring-0 text-gray-700 bg-white text-left font-medium transition-all hover:bg-gray-50/50 cursor-pointer"
        >
          <SelectValue :placeholder="t('select-region', 'Viloyatni tanlang')" />
        </SelectTrigger>
        <SelectContent class="bg-white">
          <SelectItem value="all">{{ t('select-region', 'Viloyatni tanlang') }}</SelectItem>
          <SelectItem v-for="region in regions" :key="region.id" :value="String(region.id)">
            {{ region.name }}
          </SelectItem>
        </SelectContent>
      </Select>

      <!-- City Filter (Appears if Region selected) -->
      <Select v-model="cityFilter" name="cityId" :disabled="regionFilter === 'all'">
        <SelectTrigger
          class="h-10 w-full sm:w-[220px] border border-gray-200 rounded-xl focus:ring-0 text-gray-700 bg-white text-left font-medium transition-all hover:bg-gray-50/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <SelectValue :placeholder="t('select-city', 'Tumanni tanlang')" />
        </SelectTrigger>
        <SelectContent class="bg-white">
          <SelectItem value="all">{{ t('select-city', 'Tumanni tanlang') }}</SelectItem>
          <SelectItem v-for="city in citiesForFilter" :key="city.id" :value="String(city.id)">
            {{ city.name }}
          </SelectItem>
        </SelectContent>
      </Select>

      <!-- Date Range Filter -->
      <div class="relative">
        <Popover v-model:open="isCalendarOpen">
          <PopoverTrigger as-child>
            <Button
              variant="outline"
              class="h-10 px-4 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50 flex items-center justify-between text-sm select-none cursor-pointer shadow-none min-w-[160px]"
            >
              <span class="mr-2 text-sm">
                {{ dateRangeLabel }}
              </span>
              <ChevronDown class="w-4 h-4 text-gray-400 shrink-0" />
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-auto p-0 z-[110]" align="start">
            <RangeCalendar
              :model-value="selectedDateRange"
              :locale="calendarLocale"
              initial-focus
              :week-starts-on="1"
              :weekday-format="'short'"
              @update:model-value="handleRangeConfirm"
            />
            <div v-if="selectedDateRange" class="p-3 pt-0 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                class="text-xs font-normal"
                @click="handleClearRange"
              >
                {{ t('cancel', 'Bekor qilish') }}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>

    <div class="px-6">
      <!-- Statistics Cards Submodule Component -->
      <DashboardStats
        :regionId="filterParams.regionId"
        :cityId="filterParams.cityId"
        :fromDate="filterParams.fromDate"
        :toDate="filterParams.toDate"
      />
    </div>

    <!-- Charts Modules Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 px-6 pb-6">
      <WeeklyPerformanceChart
        :regionId="filterParams.regionId"
        :cityId="filterParams.cityId"
      />
      <MonthlyOverviewChart
        :regionId="filterParams.regionId"
        :cityId="filterParams.cityId"
      />
    </div>

    <!-- New 50% 50% Grid for Student Overall Stats and Absents list, located before schools table -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 px-6 pb-6">
      <OverallStatisticsChart
        :regionId="filterParams.regionId"
        :cityId="filterParams.cityId"
        :fromDate="filterParams.fromDate"
        :toDate="filterParams.toDate"
      />
      <AbsentStudentsTable
        :regionId="filterParams.regionId"
        :cityId="filterParams.cityId"
        :fromDate="filterParams.fromDate"
        :toDate="filterParams.toDate"
      />
    </div>

    <!-- School Details Table Module -->
    <div class="px-6 pb-6">
      <SchoolDetailsTable
        :regionId="filterParams.regionId"
        :cityId="filterParams.cityId"
        :fromDate="filterParams.fromDate"
        :toDate="filterParams.toDate"
      />
    </div>
  </div>
</template>
