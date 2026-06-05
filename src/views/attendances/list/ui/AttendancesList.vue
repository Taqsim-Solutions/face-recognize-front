<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuery } from '@tanstack/vue-query'
import { fetchAttendanceRange } from '../api'
import {
  fetchRegions,
  fetchSchoolsByCity,
  fetchClassesBySchool
} from '@/views/students/list/api'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
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
import { parseDate } from '@internationalized/date'
import {
  AlertCircle,
  RefreshCw,
  Calendar,
  ChevronDown,
  ArrowLeftIcon,
  ArrowRightIcon
} from 'lucide-vue-next'
import UserContextBadges from '@/components/UserContextBadges.vue'
import { useCurrentUser } from '@/composables/useCurrentUser'

const { t, locale } = useI18n()
const { hideRegionFilter, hideCityFilter, hideSchoolFilter } = useCurrentUser()
// Filters
const regionFilter = ref<string>('all')
const cityFilter = ref<string>('all')
const schoolFilter = ref<string>('all')
const classFilter = ref<string>('all')

const todayStr = new Date().toISOString().split('T')[0]
const defaultStart = `${new Date().getFullYear()}-01-01`

const selectedDateRange = ref<any>({
  start: parseDate(defaultStart),
  end: parseDate(todayStr)
})
const dateFrom = ref<string>(defaultStart)
const dateTo   = ref<string>(todayStr)
const isCalendarOpen = ref(false)

watch(selectedDateRange, (val) => {
  if (val?.start) dateFrom.value = val.start.toString()
  if (val?.end)   dateTo.value   = val.end.toString()
  if (val?.start && val?.end) isCalendarOpen.value = false
})

const formatDateValue = (dateVal: any) => {
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
  if (!selectedDateRange.value?.start) return t('pick-date')
  const s = formatDateValue(selectedDateRange.value.start)
  if (!selectedDateRange.value.end) return `${s} - ...`
  return `${s} — ${formatDateValue(selectedDateRange.value.end)}`
})

const calendarLocale = computed(() => {
  const currentLang = locale.value
  if (currentLang === 'ru') return 'ru-RU'
  if (currentLang === 'uzc') return 'uz-Cyrl-UZ'
  return 'uz-UZ'
})

// Pagination
const currentPage = ref(1)
const pageSize = ref(20)

// Reset pagination and cascading selections
watch([dateFrom, dateTo, regionFilter, cityFilter, schoolFilter, classFilter], () => {
  currentPage.value = 1
})

watch(regionFilter, () => {
  cityFilter.value = 'all'
  schoolFilter.value = 'all'
  classFilter.value = 'all'
})

watch(cityFilter, () => {
  schoolFilter.value = 'all'
  classFilter.value = 'all'
})

watch(schoolFilter, () => {
  classFilter.value = 'all'
})

// Fetch attendances
const { data: rangeData, isLoading, isError, refetch } = useQuery({
  queryKey: ['attendances-range', dateFrom, dateTo],
  queryFn: () => fetchAttendanceRange(`${dateFrom.value}Z`, `${dateTo.value}Z`),
  staleTime: 5000
})

// Flat list of class-day rows across all days in range
const attendanceRows = computed(() => {
  const days: any[] = rangeData.value?.data?.result || rangeData.value?.result || []
  if (!Array.isArray(days) || !days.length) return []

  // Flatten: each row = { date, classId, degree, symbol, studentsCount, absentStudentsCount, isStudyDay }
  const rows: any[] = []
  for (const day of days) {
    const date = day.date
    for (const cls of (day.classes || [])) {
      rows.push({ ...cls, date })
    }
  }
  return rows
})

// Cascading Filter Options Fetch
const { data: regionsRes } = useQuery({
  queryKey: ['regions-attendances'],
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

const { data: schoolsRes, isPending: isSchoolsLoading } = useQuery({
  queryKey: ['schools-by-city-attendances', cityFilter],
  queryFn: () => fetchSchoolsByCity(Number(cityFilter.value)),
  enabled: computed(() => cityFilter.value !== 'all'),
  staleTime: 60000
})
const schools = computed(() => {
  const res = schoolsRes.value as any
  return res?.data?.result?.data || res?.data?.data || res?.result?.data || []
})

const { data: classesRes, isPending: isClassesLoading } = useQuery({
  queryKey: ['classes-by-school-attendances', schoolFilter],
  queryFn: () => fetchClassesBySchool(Number(schoolFilter.value)),
  enabled: computed(() => schoolFilter.value !== 'all'),
  staleTime: 60000
})
const classes = computed(() => {
  const res = classesRes.value as any
  return (
    res?.data?.result?.data ||
    res?.data?.result ||
    res?.data?.data ||
    res?.result?.data ||
    res?.result ||
    []
  )
})

// Safe Parsers





// Local filtering implementation
const filteredAttendanceRows = computed(() => {
  return attendanceRows.value.filter((item: any) => {
    // 1. Region filter
    if (regionFilter.value !== 'all') {
      const rId = item.regionId || item.student?.regionId || item.school?.regionId
      if (String(rId) !== regionFilter.value) return false
    }

    // 2. City filter
    if (cityFilter.value !== 'all') {
      const cId = item.cityId || item.student?.cityId || item.school?.cityId
      if (String(cId) !== cityFilter.value) return false
    }

    // 3. School filter
    if (schoolFilter.value !== 'all') {
      const sId = item.schoolId || item.student?.schoolId || item.school?.id
      if (String(sId) !== schoolFilter.value) return false
    }

    // 4. Class filter
    if (classFilter.value !== 'all') {
      const clId = item.classId || item.student?.classId || item.class?.id
      if (String(clId) !== classFilter.value) return false
    }

    return true
  })
})

// Local Client-side Pagination
const paginatedAttendanceRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredAttendanceRows.value.slice(start, end)
})

const totalPagesCount = computed(() => {
  return Math.ceil(filteredAttendanceRows.value.length / pageSize.value) || 1
})

const getPageNumbers = () => {
  const total = totalPagesCount.value
  const current = currentPage.value
  const range: (number | string)[] = []

  if (total <= 7) {
    for (let i = 1; i <= total; i++) range.push(i)
  } else {
    if (current <= 4) {
      range.push(1, 2, 3, 4, 5, '...', total)
    } else if (current >= total - 3) {
      range.push(1, '...', total - 4, total - 3, total - 2, total - 1, total)
    } else {
      range.push(1, '...', current - 1, current, current + 1, '...', total)
    }
  }
  return range
}
</script>

<template>
  <div>
    <!-- Header Title -->
    <header
      class="flex justify-between items-center py-4 pt-0 px-6 border-b border-gray-200 bg-white"
    >
      <div>
      <h1 class="text-[20px] font-bold text-[#1b1b1b] tracking-tight">
        {{ t('davomad', 'Davomad') }}
      </h1>
        <UserContextBadges />
      </div>

      <Button
        @click="() => refetch()"
        class="h-10 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm flex items-center gap-2 transition-all shadow-none cursor-pointer"
      >
        <RefreshCw class="w-4 h-4 text-gray-500" :class="{ 'animate-spin': isLoading }" />
        <span>{{ t('dashboard.retry', 'Yangilash') }}</span>
      </Button>
    </header>

    <!-- Filters Row -->
    <div class="flex flex-wrap items-center gap-3 px-6 pt-5 bg-white pb-5">
      <!-- Date Range Selector Popover -->
      <Popover v-model:open="isCalendarOpen">
        <PopoverTrigger as-child>
          <Button
            variant="outline"
            class="h-10 w-full sm:w-[280px] border border-gray-200 rounded-xl bg-white text-gray-600 font-semibold px-3 hover:bg-gray-50 flex items-center justify-between text-sm select-none cursor-pointer"
          >
            <div class="flex items-center">
              <Calendar class="w-4 h-4 text-gray-400 mr-2 shrink-0" />
              <span>{{ dateRangeLabel }}</span>
            </div>
            <ChevronDown class="w-4 h-4 text-gray-400 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          class="w-auto p-0 z-[100] bg-white border border-gray-100 rounded-2xl shadow-xl"
          align="start"
        >
          <RangeCalendar
            v-model="selectedDateRange"
            :locale="calendarLocale"
            initial-focus
            :week-starts-on="1"
            :weekday-format="'short'"
          />
          <div v-if="selectedDateRange?.start" class="px-3 pb-3 flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              class="text-xs"
              @click="selectedDateRange = { start: parseDate(todayStr), end: parseDate(todayStr) }; isCalendarOpen = false"
            >
              {{ t('today', 'Bugun') }}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              class="text-xs"
              @click="isCalendarOpen = false"
            >
              {{ t('done', 'Tayyor') }}
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <!-- Region Select -->
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

      <!-- City Select -->
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

      <!-- School Select -->
      <Select
        v-if="!hideSchoolFilter"
        v-model="schoolFilter"
        name="schoolId"
        :disabled="cityFilter === 'all' && !hideCityFilter || isSchoolsLoading"
      >
        <SelectTrigger
          class="h-10 w-full sm:w-[200px] border border-gray-200 rounded-xl focus:ring-0 text-gray-600 bg-white text-left font-medium disabled:opacity-60"
        >
          <SelectValue
            :placeholder="isSchoolsLoading ? t('loading') + '...' : t('school', 'Maktab')"
          />
        </SelectTrigger>
        <SelectContent class="bg-white">
          <SelectItem value="all">{{ t('school') }}</SelectItem>
          <SelectItem v-for="sch in schools" :key="sch.id" :value="String(sch.id)">
            {{ sch.name }}
          </SelectItem>
        </SelectContent>
      </Select>

      <!-- Class Select -->
      <Select
        v-model="classFilter"
        name="classId"
        :disabled="schoolFilter === 'all' || isClassesLoading"
      >
        <SelectTrigger
          class="h-10 w-full sm:w-[200px] border border-gray-200 rounded-xl focus:ring-0 text-gray-600 bg-white text-left font-medium disabled:opacity-60"
        >
          <SelectValue :placeholder="isClassesLoading ? t('loading') + '...' : t('sinf', 'Sinf')" />
        </SelectTrigger>
        <SelectContent class="bg-white">
          <SelectItem value="all">{{ t('sinf', 'Sinf') }}</SelectItem>
          <SelectItem v-for="cls in classes" :key="cls.id" :value="String(cls.id)">
            {{ cls.degree }}-{{ cls.symbol }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Table Section with Standard Style -->
    <div class="mt-1 w-full px-6">
      <div
        class="relative border border-gray-200 rounded-t-lg w-full overflow-auto lg:max-h-[calc(100vh-260px)]"
      >
        <Table class="text-nowrap">
          <TableHeader class="sticky top-0 bg-white drop-shadow-sm z-20">
            <TableRow>
              <TableHead class="text-nowrap text-sm text-[#74757d] select-none border border-t-0 p-3 pl-4 first:pl-3 relative border-l-0 font-semibold bg-[#f2f5f4]">
                {{ t('date', 'Sana') }}
              </TableHead>
              <TableHead class="text-nowrap text-sm text-[#74757d] select-none border border-t-0 p-3 pl-4 relative font-semibold bg-[#f2f5f4]">
                {{ t('dashboard.absents.class', 'Sinf') }}
              </TableHead>
              <TableHead class="text-nowrap text-sm text-[#74757d] select-none border border-t-0 p-3 pl-4 relative font-semibold bg-[#f2f5f4]">
                {{ t('students-present', 'Kelgan') }}
              </TableHead>
              <TableHead class="text-nowrap text-sm text-[#74757d] select-none border border-t-0 p-3 pl-4 relative font-semibold bg-[#f2f5f4]">
                {{ t('students-absent', 'Kelmagan') }}
              </TableHead>
              <TableHead class="text-nowrap text-sm text-[#74757d] select-none border border-t-0 p-3 pl-4 relative border-r-0 font-semibold bg-[#f2f5f4]">
                {{ t('jami', 'Jami') }}
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            <!-- Loading Skeleton -->
            <template v-if="isLoading">
              <TableRow v-for="i in 5" :key="i" class="animate-pulse">
                <TableCell class="border p-3 pl-4 border-l-0">
                  <div class="flex items-center">
                    <div class="w-8 h-8 rounded-full bg-gray-100 mr-3 shrink-0" />
                    <div class="h-4 bg-gray-100 rounded w-36" />
                  </div>
                </TableCell>
                <TableCell class="border p-3"
                  ><div class="h-4 bg-gray-100 rounded w-24"></div
                ></TableCell>
                <TableCell class="border p-3"
                  ><div class="h-4 bg-gray-100 rounded w-16"></div
                ></TableCell>
                <TableCell class="border p-3"
                  ><div class="h-4 bg-gray-100 rounded w-20"></div
                ></TableCell>
                <TableCell class="border p-3 border-r-0"
                  ><div class="h-6 bg-gray-100 rounded-full w-20"></div
                ></TableCell>
              </TableRow>
            </template>

            <!-- Error -->
            <template v-else-if="isError">
              <TableRow>
                <TableCell colspan="5" class="h-64 text-center border-none">
                  <div class="flex flex-col items-center justify-center py-10">
                    <AlertCircle class="w-12 h-12 text-red-500 mb-2" />
                    <h3 class="text-lg font-bold text-gray-800">
                      {{ t('error_occurred', 'Xatolik yuz berdi') }}
                    </h3>
                    <p class="text-sm text-gray-500 mt-1 mb-4">
                      Statistika ma'lumotlarini yuklashda xatolik yuz berdi.
                    </p>
                    <Button
                      @click="() => refetch()"
                      size="sm"
                      class="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-none"
                    >
                      {{ t('dashboard.retry', 'Qayta urinish') }}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </template>

            <!-- Empty Data -->
            <template v-else-if="filteredAttendanceRows.length === 0">
              <TableRow>
                <TableCell colspan="5" class="h-64 text-center border-none">
                  <div class="flex flex-col items-center justify-center py-10">
                    <div
                      class="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-3"
                    >
                      <AlertCircle class="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 class="text-base font-bold text-gray-700">
                      {{ t('no-data', 'Ma’lumotlar topilmadi') }}
                    </h3>
                    <p class="text-sm text-gray-400 mt-1">
                      {{ t('no-attendance-data', `Ushun sana bo'yicha hech qanday davomad ma'lumoti mavjud emas.`) }}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            </template>

            <!-- Data Rows -->
            <template v-else>
              <TableRow
                v-for="(row, idx) in paginatedAttendanceRows"
                :key="idx"
                class="hover:bg-gray-50/50 transition-colors"
                :class="{ 'opacity-50': !row.isStudyDay }"
              >
                <!-- Date -->
                <TableCell class="border p-3 pl-4 border-l-0 text-gray-700 text-sm font-medium">
                  {{ new Date(row.date).toLocaleDateString(calendarLocale, { day:'2-digit', month:'short', year:'numeric' }) }}
                </TableCell>

                <!-- Class -->
                <TableCell class="border p-3 text-gray-800 font-semibold text-sm">
                  {{ row.degree }}-{{ row.symbol }}
                </TableCell>

                <!-- Present -->
                <TableCell class="border p-3 text-sm">
                  <span class="inline-flex items-center gap-1 font-semibold text-green-600">
                    <span class="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                    {{ row.studentsCount - row.absentStudentsCount }}
                  </span>
                </TableCell>

                <!-- Absent -->
                <TableCell class="border p-3 text-sm">
                  <span class="inline-flex items-center gap-1 font-semibold" :class="row.absentStudentsCount > 0 ? 'text-red-500' : 'text-gray-400'">
                    <span class="w-2 h-2 rounded-full inline-block" :class="row.absentStudentsCount > 0 ? 'bg-red-500' : 'bg-gray-300'"></span>
                    {{ row.absentStudentsCount }}
                  </span>
                </TableCell>

                <!-- Total -->
                <TableCell class="border p-3 border-r-0 text-gray-600 text-sm font-medium">
                  {{ row.studentsCount }}
                </TableCell>
              </TableRow>
            </template>
          </TableBody>
        </Table>
      </div>

      <!-- Pagination Footer -->
      <div
        v-if="filteredAttendanceRows.length > 0"
        class="flex items-center justify-between border border-t-0 rounded-b-lg px-4 py-2.5 text-xs text-gray-600 bg-white shrink-0"
      >
        <span class="font-semibold text-[#596881] text-xs">
          {{
            t('dashboard.school-details.page-info', {
              current: currentPage,
              total: totalPagesCount
            })
          }}
        </span>

        <div class="flex items-center gap-1.5">
          <button
            class="w-7 h-7 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            :disabled="currentPage === 1"
            @click="currentPage > 1 && currentPage--"
          >
            <ArrowLeftIcon class="w-3.5 h-3.5" />
          </button>

          <div class="flex items-center gap-1 bg-[#f4f4f5] p-0.5 rounded-lg">
            <template v-for="page in getPageNumbers()" :key="page">
              <span
                v-if="page === '...'"
                class="px-1.5 text-gray-400 font-medium select-none text-[11px]"
              >
                ...
              </span>

              <button
                v-else
                class="min-w-[24px] h-6 px-1 flex items-center justify-center text-[11px] font-semibold rounded-lg transition-all border-none bg-transparent cursor-pointer"
                :class="[
                  currentPage === page
                    ? 'bg-white text-black shadow-sm font-bold'
                    : 'text-gray-600 hover:text-black hover:bg-gray-200/50'
                ]"
                @click="currentPage = page as number"
              >
                {{ page }}
              </button>
            </template>
          </div>

          <button
            class="w-7 h-7 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            :disabled="currentPage >= totalPagesCount"
            @click="currentPage < totalPagesCount && currentPage++"
          >
            <ArrowRightIcon class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
