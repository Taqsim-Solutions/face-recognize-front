<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuery } from '@tanstack/vue-query'
import { fetchAttendanceRange, fetchTeacherAttendanceRange, fetchClassStudentAttendances, fetchStudentScans, fetchTeacherScans } from '../api'
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
// View mode: students vs teachers attendance
const mode = ref<'students' | 'teachers'>('students')
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

// Short "day month" date for the table, e.g. "5 iyun" / "24 may".
// toLocaleDateString doesn't reliably localize Uzbek month names, so map them.
const formatRowDate = (raw: any) => {
  const d = new Date(raw)
  if (isNaN(d.getTime())) return ''
  const day = d.getDate()
  const m = d.getMonth() // 0-11
  const lang = locale.value
  const months: Record<string, string[]> = {
    uz: ['yanvar','fevral','mart','aprel','may','iyun','iyul','avgust','sentyabr','oktyabr','noyabr','dekabr'],
    uzc: ['январ','феврал','март','апрел','май','июн','июл','август','сентябр','октябр','ноябр','декабр'],
    ru: ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря']
  }
  const names = months[lang] || months.uz
  return `${day} ${names[m]}`
}

// Format a UTC timestamp as local HH:mm for the teacher attendance table.
const formatTime = (raw: any) => {
  if (!raw) return ''
  const d = new Date(raw)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Pagination
const currentPage = ref(1)
const pageSize = ref(20)

const classSearch = ref<string>('')  // search text inside the class dropdown
const classDropdownOpen = ref(false)
const classSearchInput = ref<HTMLInputElement | null>(null)

// Canonical label for a class: prefer Name, fall back to degree-symbol.
const classLabel = (c: any) =>
  (c?.name && String(c.name).trim()) ? String(c.name) : `${c?.degree}-${c?.symbol}`

// Normalize a class string for fuzzy matching: lowercase, drop spaces/dashes/quotes,
// and fold common Cyrillic look-alike letters to Latin so "3-А" matches "3-a".
const normalizeClassSearch = (s: string) => {
  const cyr: Record<string, string> = {
    'а': 'a', 'в': 'b', 'е': 'e', 'к': 'k', 'м': 'm', 'н': 'h',
    'о': 'o', 'р': 'p', 'с': 'c', 'т': 't', 'у': 'y', 'х': 'x'
  }
  return String(s || '')
    .toLowerCase()
    .replace(/[\s\-_"'“”«»]/g, '')
    .split('')
    .map((ch) => cyr[ch] || ch)
    .join('')
    .trim()
}

// Options shown in the dropdown, filtered by the search text
const filteredClassOptions = computed(() => {
  const list = classes.value || []
  const q = normalizeClassSearch(classSearch.value)
  if (!q) return list
  return list.filter((c: any) => {
    const label = normalizeClassSearch(classLabel(c))
    return label.includes(q)
  })
})

const selectedClassLabel = computed(() => {
  if (classFilter.value === 'all') return t('sinf', 'Sinf')
  const c = (classes.value || []).find((x: any) => String(x.id) === classFilter.value)
  return c ? classLabel(c) : t('sinf', 'Sinf')
})

const selectClass = (id: string) => {
  classFilter.value = id
  classDropdownOpen.value = false
  classSearch.value = ''
}

// Close dropdown when clicking outside
const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('[data-class-dropdown]')) {
    classDropdownOpen.value = false
  }
}
onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))

// Focus search box when dropdown opens
watch(classDropdownOpen, (open) => {
  if (open) nextTick(() => classSearchInput.value?.focus())
})

const resetFilters = () => {
  regionFilter.value = 'all'
  cityFilter.value   = 'all'
  schoolFilter.value = 'all'
  classFilter.value  = 'all'
  classSearch.value  = ''
  currentPage.value  = 1
}

const hasActiveFilters = computed(() =>
  regionFilter.value !== 'all' ||
  cityFilter.value   !== 'all' ||
  schoolFilter.value !== 'all' ||
  classFilter.value  !== 'all'
)

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
  queryKey: ['attendances-range', dateFrom, dateTo, regionFilter, cityFilter, schoolFilter, classFilter],
  queryFn: () => fetchAttendanceRange(
    `${dateFrom.value}Z`,
    `${dateTo.value}Z`,
    schoolFilter.value !== 'all' ? Number(schoolFilter.value) : undefined,
    cityFilter.value   !== 'all' ? Number(cityFilter.value)   : undefined,
    regionFilter.value !== 'all' ? Number(regionFilter.value) : undefined,
    classFilter.value  !== 'all' ? Number(classFilter.value)  : undefined
  ),
  enabled: computed(() => mode.value === 'students'),
  staleTime: 5000
})

// Teacher attendance range (only fetched in teachers mode)
const {
  data: teacherRangeData,
  isLoading: isTeacherLoading,
  isError: isTeacherError,
  refetch: refetchTeachers
} = useQuery({
  queryKey: ['teachers-attendances-range', dateFrom, dateTo, regionFilter, cityFilter, schoolFilter],
  queryFn: () => fetchTeacherAttendanceRange(
    `${dateFrom.value}Z`,
    `${dateTo.value}Z`,
    schoolFilter.value !== 'all' ? Number(schoolFilter.value) : undefined,
    cityFilter.value   !== 'all' ? Number(cityFilter.value)   : undefined,
    regionFilter.value !== 'all' ? Number(regionFilter.value) : undefined
  ),
  enabled: computed(() => mode.value === 'teachers'),
  staleTime: 5000
})

// Flat list of teacher-day rows across all days in range.
const teacherRows = computed(() => {
  const raw = teacherRangeData.value as any
  const days: any[] = raw?.data?.result || raw?.result || []
  if (!Array.isArray(days) || !days.length) return []
  const rows: any[] = []
  for (const day of days) {
    for (const tch of (day.teachers || [])) {
      rows.push({ ...tch, date: day.date })
    }
  }
  return rows
})

// Flat list of class-day rows across all days in range, grouped so that
// classes with the same date + school + degree + symbol merge into one row
// (e.g. two "1-A" classes in the same school on the same day are summed).
const attendanceRows = computed(() => {
  const raw = rangeData.value as any
  const days: any[] = raw?.data?.result || raw?.result || []
  if (!Array.isArray(days) || !days.length) return []

  const map = new Map<string, any>()

  // Some classes were created with a Cyrillic symbol (e.g. "А" U+0410) and
  // others with the visually identical Latin "A" (U+0041). Normalize common
  // look-alikes so "1-A" and "1-А" group together.
  const normSymbol = (s: any) => {
    const cyrToLat: Record<string, string> = {
      'А': 'A', 'В': 'B', 'Е': 'E', 'К': 'K', 'М': 'M', 'Н': 'H',
      'О': 'O', 'Р': 'P', 'С': 'C', 'Т': 'T', 'У': 'Y', 'Х': 'X'
    }
    const ch = String(s ?? '').toUpperCase()
    return cyrToLat[ch] || ch
  }

  for (const day of days) {
    const date = day.date
    for (const cls of (day.classes || [])) {
      const key = `${date}|${cls.schoolId ?? ''}|${cls.degree}|${normSymbol(cls.symbol)}`
      const existing = map.get(key)
      if (existing) {
        // Merge counts and remember every underlying classId for the detail modal.
        existing.studentsCount += cls.studentsCount || 0
        existing.absentStudentsCount += cls.absentStudentsCount || 0
        existing.classIds.push(cls.id)
      } else {
        map.set(key, {
          ...cls,
          date,
          classIds: [cls.id]
        })
      }
    }
  }
  return Array.from(map.values())
})

// One row per DAY (classes merged): the list no longer shows a row per class.
// studentsCount / absentStudentsCount are summed across the day's classes.
const dayRows = computed(() => {
  const map = new Map<string, any>()
  for (const row of filteredAttendanceRows.value) {
    const key = String(row.date)
    const existing = map.get(key)
    if (existing) {
      existing.studentsCount += row.studentsCount || 0
      existing.absentStudentsCount += row.absentStudentsCount || 0
      existing.classes.push(row)
    } else {
      map.set(key, {
        date: row.date,
        regionName: row.regionName,
        cityName: row.cityName,
        schoolName: row.schoolName,
        isStudyDay: row.isStudyDay,
        studentsCount: row.studentsCount || 0,
        absentStudentsCount: row.absentStudentsCount || 0,
        classes: [row] // each is a per-class row (has classIds, degree, symbol)
      })
    }
  }
  return Array.from(map.values())
})

// The day the user clicked: its classes become filter badges above the table.
const selectedDay = ref<any | null>(null)
const selectDay = (day: any) => {
  // Toggle off if the same day is clicked again.
  selectedDay.value = selectedDay.value?.date === day.date ? null : day
}
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
  queryFn: () => fetchClassesBySchool(Number(schoolFilter.value), true),
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
// ── Student detail modal ─────────────────────────────────────────
const selectedClassRow = ref<any | null>(null)
const isStudentModalOpen = ref(false)

const { data: studentData, isLoading: studentLoading } = useQuery({
  queryKey: ['class-students-att', computed(() => selectedClassRow.value?.date), computed(() => (selectedClassRow.value?.classIds || []).join(','))],
  queryFn: async () => {
    const row = selectedClassRow.value
    if (!row) return null
    const d = new Date(row.date)
    const dateStr = d.toISOString().split('T')[0] + 'Z'
    // A grouped row can cover several underlying class IDs (same name/school).
    const ids: number[] = row.classIds?.length ? row.classIds : [row.id]
    const responses = await Promise.all(ids.map((cid) => fetchClassStudentAttendances(dateStr, cid)))
    // Merge the student lists from every class into one.
    const merged: any[] = []
    for (const res of responses) {
      const list = (res as any)?.data?.result || (res as any)?.result || []
      if (Array.isArray(list)) merged.push(...list)
    }
    return { data: { result: merged } }
  },
  enabled: computed(() => !!selectedClassRow.value),
  staleTime: 0
})

const studentRows = computed(() => {
  const raw = studentData.value as any
  return raw?.data?.result || raw?.result || []
})

// Popup pagination — only kicks in when a class has many students.
const modalPage = ref(1)
const modalPageSize = 15
const modalTotalPages = computed(() => Math.ceil(studentRows.value.length / modalPageSize) || 1)
const paginatedStudentRows = computed(() => {
  const start = (modalPage.value - 1) * modalPageSize
  return studentRows.value.slice(start, start + modalPageSize)
})

const openStudentModal = (row: any) => {
  selectedClassRow.value = row
  modalPage.value = 1
  isStudentModalOpen.value = true
}

// ---- "All scans" popup (raw comings/goings for one person on a day) ----
const isScansOpen = ref(false)
const scanTarget = ref<{ id: number; name: string; date: string; kind: 'student' | 'teacher' } | null>(null)

const { data: scansData, isLoading: scansLoading } = useQuery({
  queryKey: [
    'attendance-scans',
    computed(() => scanTarget.value?.kind),
    computed(() => scanTarget.value?.id),
    computed(() => scanTarget.value?.date)
  ],
  queryFn: async () => {
    const t = scanTarget.value
    if (!t) return []
    const res =
      t.kind === 'student'
        ? await fetchStudentScans(t.id, t.date)
        : await fetchTeacherScans(t.id, t.date)
    return (res as any)?.data?.result || (res as any)?.result || []
  },
  enabled: computed(() => !!scanTarget.value && isScansOpen.value),
  staleTime: 0
})

const scanRows = computed<any[]>(() => (scansData.value as any) || [])

// Build the YYYY-MM-DDZ date string the scan endpoints expect.
const toScanDate = (raw: any): string => {
  const d = new Date(raw)
  return d.toISOString().split('T')[0] + 'Z'
}

const openStudentScans = (s: any) => {
  scanTarget.value = {
    id: s.id ?? s.studentId,
    name: `${s.lastName || ''} ${s.firstName || ''}`.trim(),
    date: toScanDate(selectedClassRow.value?.date),
    kind: 'student'
  }
  isScansOpen.value = true
}

const openTeacherScans = (row: any) => {
  scanTarget.value = {
    id: row.teacherId ?? row.id,
    name: row.fullName || '',
    date: toScanDate(row.date),
    kind: 'teacher'
  }
  isScansOpen.value = true
}

const cameraTypeLabel = (ct: number | null | undefined) => {
  if (ct === 1) return t('entrance', 'Kirish')
  if (ct === 2) return t('exit', 'Chiqish')
  if (ct === 3) return t('entrance-exit', 'Kirish/Chiqish')
  return '—'
}

const formatStudentTime = (dt: string | null | undefined) => {
  if (!dt) return '—'
  const d = new Date(dt)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

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
// Rows to paginate depend on the current mode (students vs teachers).
// Mode-aware loading / error so the table reflects the active query.
const displayLoading = computed(() =>
  mode.value === 'teachers' ? isTeacherLoading.value : isLoading.value
)
const displayError = computed(() =>
  mode.value === 'teachers' ? isTeacherError.value : isError.value
)

// Reset to first page whenever the mode changes.
watch(mode, () => { currentPage.value = 1 })

const activeRows = computed(() =>
  mode.value === 'teachers' ? teacherRows.value : dayRows.value
)

const paginatedAttendanceRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return activeRows.value.slice(start, end)
})

const totalPagesCount = computed(() => {
  return Math.ceil(activeRows.value.length / pageSize.value) || 1
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
      class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 py-4 pt-0 px-4 sm:px-6 border-b border-gray-200 bg-white"
    >
      <div>
      <h1 class="text-[20px] font-bold text-[#1b1b1b] tracking-tight">
        {{ t('davomad', 'Davomad') }}
      </h1>
        <UserContextBadges />
      </div>

      <Button
        @click="() => (mode === 'teachers' ? refetchTeachers() : refetch())"
        class="h-10 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm flex items-center gap-2 transition-all shadow-none cursor-pointer"
      >
        <RefreshCw class="w-4 h-4 text-gray-500" :class="{ 'animate-spin': displayLoading }" />
        <span>{{ t('dashboard.retry', 'Yangilash') }}</span>
      </Button>
    </header>

    <!-- Mode tabs: students vs teachers -->
    <div class="flex items-center gap-2 px-4 sm:px-6 pt-4 bg-white">
      <button
        @click="mode = 'students'"
        :class="[
          'h-9 px-4 rounded-lg text-sm font-semibold transition-all',
          mode === 'students'
            ? 'bg-primary text-white shadow-sm'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        ]"
      >
        {{ t('students', "O'quvchilar") }}
      </button>
      <button
        @click="mode = 'teachers'"
        :class="[
          'h-9 px-4 rounded-lg text-sm font-semibold transition-all',
          mode === 'teachers'
            ? 'bg-primary text-white shadow-sm'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        ]"
      >
        {{ t('teachers', "O'qituvchilar") }}
      </button>
    </div>

    <!-- Filters Row -->
    <div class="flex flex-wrap items-center gap-3 px-4 sm:px-6 pt-5 bg-white pb-5">
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

      <!-- Class searchable select (students mode only) -->
      <div v-if="mode === 'students'" class="relative" data-class-dropdown>
        <button
          type="button"
          :disabled="schoolFilter === 'all' || isClassesLoading"
          @click="classDropdownOpen = !classDropdownOpen"
          class="h-10 w-full sm:w-[200px] border border-gray-200 rounded-xl text-gray-600 bg-white text-left font-medium px-3 flex items-center justify-between disabled:opacity-60 cursor-pointer"
        >
          <span :class="{ 'text-gray-400': classFilter === 'all' }">
            {{ isClassesLoading ? t('loading') + '...' : selectedClassLabel }}
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </button>

        <!-- Dropdown panel -->
        <div
          v-if="classDropdownOpen"
          class="absolute z-50 mt-1 w-full sm:w-[200px] bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
        >
          <!-- Search box inside dropdown -->
          <div class="p-2 border-b border-gray-100">
            <input
              ref="classSearchInput"
              v-model="classSearch"
              type="text"
              :placeholder="t('class-search-placeholder', 'Qidirish: 1-A')"
              class="h-8 w-full px-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-[#ff792d]"
              @click.stop
            />
          </div>
          <!-- Options -->
          <div class="max-h-[240px] overflow-y-auto py-1">
            <button
              type="button"
              @click="selectClass('all')"
              class="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
              :class="classFilter === 'all' ? 'text-[#ff792d] font-semibold bg-orange-50' : 'text-gray-600'"
            >
              {{ t('all-classes', 'Barcha sinflar') }}
            </button>
            <button
              v-for="cls in filteredClassOptions"
              :key="cls.id"
              type="button"
              @click="selectClass(String(cls.id))"
              class="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
              :class="classFilter === String(cls.id) ? 'text-[#ff792d] font-semibold bg-orange-50' : 'text-gray-700'"
            >
              {{ classLabel(cls) }}
            </button>
            <div v-if="!filteredClassOptions.length" class="px-3 py-3 text-sm text-gray-400 text-center">
              {{ t('no-data', "Ma'lumot yo'q") }}
            </div>
          </div>
        </div>
      </div>

      <!-- Reset all filters -->
      <button
        v-if="hasActiveFilters"
        @click="resetFilters"
        class="h-10 px-3 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200 text-sm font-medium flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
        {{ t('reset-filters', 'Tozalash') }}
      </button>
    </div>

    <!-- Class badges for the selected day (students mode) -->
    <div
      v-if="mode === 'students' && selectedDay"
      class="mt-2 w-full px-4 sm:px-6"
    >
      <div class="flex flex-wrap items-center gap-2 p-3 bg-orange-50/60 border border-orange-100 rounded-lg">
        <span class="text-xs font-semibold text-gray-500 mr-1">
          {{ formatRowDate(selectedDay.date) }} — {{ t('select-class', 'Sinfni tanlang') }}:
        </span>
        <button
          v-for="(cls, ci) in selectedDay.classes"
          :key="'badge' + ci"
          type="button"
          @click="openStudentModal(cls)"
          class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-gray-200 text-gray-700 hover:border-[#ff792d] hover:text-[#ff792d] transition-colors cursor-pointer"
        >
          {{ cls.name && String(cls.name).trim() ? cls.name : (cls.degree + '-' + cls.symbol) }}
          <span class="text-green-600">{{ (cls.studentsCount || 0) - (cls.absentStudentsCount || 0) }}</span>
          <span v-if="cls.absentStudentsCount > 0" class="text-red-500">/ {{ cls.absentStudentsCount }}</span>
        </button>
        <button
          type="button"
          @click="selectedDay = null"
          class="ml-auto text-gray-400 hover:text-gray-600 text-xs font-medium"
        >
          {{ t('close', 'Yopish') }} ✕
        </button>
      </div>
    </div>

    <!-- Table Section with Standard Style -->
    <div class="mt-1 w-full px-4 sm:px-6">
      <div
        class="relative border border-gray-200 rounded-t-lg w-full overflow-auto lg:max-h-[calc(100vh-260px)]"
      >
        <Table class="text-nowrap">
          <TableHeader class="sticky top-0 bg-white drop-shadow-sm z-20">
            <!-- Students header -->
            <TableRow v-if="mode === 'students'">
              <TableHead class="text-nowrap text-sm text-[#74757d] select-none border border-t-0 p-3 pl-4 first:pl-3 relative border-l-0 font-semibold bg-[#f2f5f4]">
                {{ t('date', 'Sana') }}
              </TableHead>
              <TableHead class="text-nowrap text-sm text-[#74757d] select-none border border-t-0 p-3 pl-4 relative font-semibold bg-[#f2f5f4]">
                {{ t('region-col', 'Viloyat') }}
              </TableHead>
              <TableHead class="text-nowrap text-sm text-[#74757d] select-none border border-t-0 p-3 pl-4 relative font-semibold bg-[#f2f5f4]">
                {{ t('city-col', 'Tuman/shahar') }}
              </TableHead>
              <TableHead class="text-nowrap text-sm text-[#74757d] select-none border border-t-0 p-3 pl-4 relative font-semibold bg-[#f2f5f4]">
                {{ t('school-col', 'Maktab') }}
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
            <!-- Teachers header -->
            <TableRow v-else>
              <TableHead class="text-nowrap text-sm text-[#74757d] select-none border border-t-0 p-3 pl-4 first:pl-3 relative border-l-0 font-semibold bg-[#f2f5f4]">
                {{ t('date', 'Sana') }}
              </TableHead>
              <TableHead class="text-nowrap text-sm text-[#74757d] select-none border border-t-0 p-3 pl-4 relative font-semibold bg-[#f2f5f4]">
                {{ t('region-col', 'Viloyat') }}
              </TableHead>
              <TableHead class="text-nowrap text-sm text-[#74757d] select-none border border-t-0 p-3 pl-4 relative font-semibold bg-[#f2f5f4]">
                {{ t('city-col', 'Tuman/shahar') }}
              </TableHead>
              <TableHead class="text-nowrap text-sm text-[#74757d] select-none border border-t-0 p-3 pl-4 relative font-semibold bg-[#f2f5f4]">
                {{ t('school-col', 'Maktab') }}
              </TableHead>
              <TableHead class="text-nowrap text-sm text-[#74757d] select-none border border-t-0 p-3 pl-4 relative font-semibold bg-[#f2f5f4]">
                {{ t('teacher-fio', 'F.I.Sh') }}
              </TableHead>
              <TableHead class="text-nowrap text-sm text-[#74757d] select-none border border-t-0 p-3 pl-4 relative font-semibold bg-[#f2f5f4]">
                {{ t('dashboard.absents.class', 'Sinf') }}
              </TableHead>
              <TableHead class="text-nowrap text-sm text-[#74757d] select-none border border-t-0 p-3 pl-4 relative font-semibold bg-[#f2f5f4]">
                {{ t('arrival-time', 'Kelgan vaqti') }}
              </TableHead>
              <TableHead class="text-nowrap text-sm text-[#74757d] select-none border border-t-0 p-3 pl-4 relative font-semibold bg-[#f2f5f4]">
                {{ t('leaving-time', 'Ketgan vaqti') }}
              </TableHead>
              <TableHead class="text-nowrap text-sm text-[#74757d] select-none border border-t-0 p-3 pl-4 relative border-r-0 font-semibold bg-[#f2f5f4]">
                {{ t('status', 'Holat') }}
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            <!-- Loading Skeleton -->
            <template v-if="displayLoading">
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
                  ><div class="h-4 bg-gray-100 rounded w-24"></div
                ></TableCell>
                <TableCell class="border p-3"
                  ><div class="h-4 bg-gray-100 rounded w-24"></div
                ></TableCell>
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
            <template v-else-if="displayError">
              <TableRow>
                <TableCell colspan="9" class="h-64 text-center border-none">
                  <div class="flex flex-col items-center justify-center py-10">
                    <AlertCircle class="w-12 h-12 text-red-500 mb-2" />
                    <h3 class="text-lg font-bold text-gray-800">
                      {{ t('error_occurred', 'Xatolik yuz berdi') }}
                    </h3>
                    <p class="text-sm text-gray-500 mt-1 mb-4">
                      Statistika ma'lumotlarini yuklashda xatolik yuz berdi.
                    </p>
                    <Button
                      @click="() => (mode === 'teachers' ? refetchTeachers() : refetch())"
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
            <template v-else-if="activeRows.length === 0">
              <TableRow>
                <TableCell colspan="9" class="h-64 text-center border-none">
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
              <!-- Students -->
              <template v-if="mode === 'students'">
              <TableRow
                v-for="(row, idx) in paginatedAttendanceRows"
                :key="'s' + idx"
                class="hover:bg-orange-50/60 transition-colors cursor-pointer"
                :class="{ 'opacity-50': !row.isStudyDay, 'bg-orange-50': selectedDay?.date === row.date }"
                @click="selectDay(row)"
              >
                <!-- Date -->
                <TableCell class="border p-3 pl-4 border-l-0 text-gray-700 text-sm font-medium">
                  {{ formatRowDate(row.date) }}
                </TableCell>

                <!-- Region -->
                <TableCell class="border p-3 text-gray-700 text-sm">
                  {{ row.regionName || '—' }}
                </TableCell>

                <!-- City / district -->
                <TableCell class="border p-3 text-gray-700 text-sm">
                  {{ row.cityName || '—' }}
                </TableCell>

                <!-- School -->
                <TableCell class="border p-3 text-gray-700 text-sm">
                  {{ row.schoolName || '—' }}
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

              <!-- Teachers -->
              <template v-else>
              <TableRow
                v-for="(row, idx) in paginatedAttendanceRows"
                :key="'t' + idx"
                class="hover:bg-orange-50/60 transition-colors"
              >
                <TableCell class="border p-3 pl-4 border-l-0 text-gray-700 text-sm font-medium">
                  {{ formatRowDate(row.date) }}
                </TableCell>
                <TableCell class="border p-3 text-gray-700 text-sm">
                  {{ row.regionName || '—' }}
                </TableCell>
                <TableCell class="border p-3 text-gray-700 text-sm">
                  {{ row.cityName || '—' }}
                </TableCell>
                <TableCell class="border p-3 text-gray-700 text-sm">
                  {{ row.schoolName || '—' }}
                </TableCell>
                <TableCell class="border p-3 text-gray-800 font-semibold text-sm">
                  {{ row.fullName }}
                  <span v-if="!row.isTeacher" class="ml-1 text-xs font-normal text-gray-400">({{ t('staff', 'Xodim') }})</span>
                </TableCell>
                <TableCell class="border p-3 text-gray-700 text-sm">
                  {{ row.className || '—' }}
                </TableCell>
                <TableCell class="border p-3 text-sm">
                  <span v-if="row.comingTime" class="font-semibold text-green-600">{{ formatTime(row.comingTime) }}</span>
                  <span v-else class="text-gray-400">—</span>
                </TableCell>
                <TableCell class="border p-3 text-sm">
                  <span v-if="row.leavingTime" class="font-semibold text-amber-600">{{ formatTime(row.leavingTime) }}</span>
                  <span v-else class="text-gray-400">—</span>
                </TableCell>
                <TableCell class="border p-3 border-r-0 text-sm">
                  <span
                    class="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full text-xs"
                    :class="row.attended ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'"
                  >
                    {{ row.attended ? t('arrived', 'Keldi') : t('not-attended', 'Kelmagan') }}
                  </span>
                  <button
                    type="button"
                    @click="openTeacherScans(row)"
                    class="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                  >
                    {{ t('all-scans', 'Hammasi') }}
                  </button>
                </TableCell>
              </TableRow>
              </template>
            </template>
          </TableBody>
        </Table>
      </div>

      <!-- Pagination Footer -->
      <div
        v-if="activeRows.length > 0"
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

  <!-- ── Student detail modal ──────────────────────────────────── -->
  <div
    v-if="isStudentModalOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    @click.self="isStudentModalOpen = false"
  >
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <h3 class="text-base font-bold text-gray-800">
            {{ selectedClassRow?.degree }}-{{ selectedClassRow?.symbol }} —
            {{ selectedClassRow?.date ? new Date(selectedClassRow.date).toLocaleDateString() : '' }}
          </h3>
          <p class="text-xs text-gray-400 mt-0.5">
            {{ t('students-present', 'Kelgan') }}: {{ (selectedClassRow?.studentsCount || 0) - (selectedClassRow?.absentStudentsCount || 0) }}
            &nbsp;·&nbsp;
            {{ t('students-absent', 'Kelmagan') }}: {{ selectedClassRow?.absentStudentsCount || 0 }}
          </p>
        </div>
        <button @click="isStudentModalOpen = false" class="text-gray-400 hover:text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <!-- Body -->
      <div class="flex-1 overflow-y-auto">
        <div v-if="studentLoading" class="flex items-center justify-center py-12 text-gray-400">
          <svg class="w-6 h-6 animate-spin mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          Yuklanmoqda...
        </div>
        <div v-else-if="!studentRows.length" class="flex items-center justify-center py-12 text-gray-400 text-sm">
          {{ t('no-data', "Ma'lumot yo'q") }}
        </div>
        <table v-else class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 text-xs text-gray-500 uppercase sticky top-0">
              <th class="px-4 py-2 text-left">F.I.Sh</th>
              <th class="px-4 py-2 text-left">{{ t('kelgan-vaqti', 'Kelgan vaqti') }}</th>
              <th class="px-4 py-2 text-left">{{ t('ketgan-vaqti', 'Ketgan vaqti') }}</th>
              <th class="px-4 py-2 text-left">{{ t('status', 'Status') }}</th>
              <th class="px-4 py-2 text-left">{{ t('scans', 'Skanlar') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="(s, i) in paginatedStudentRows" :key="i" class="hover:bg-gray-50">
              <td class="px-4 py-2.5">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-full overflow-hidden bg-gray-100 shrink-0">
                    <img v-if="s.mainImageName" :src="`/api/images?filename=${s.mainImageName}`"
                      class="w-full h-full object-cover"
                      @error="($event.target as HTMLImageElement).style.display='none'" />
                    <div v-else class="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">
                      {{ (s.firstName?.[0] || '?').toUpperCase() }}
                    </div>
                  </div>
                  <span class="font-medium text-gray-800">{{ s.lastName }} {{ s.firstName }}</span>
                </div>
              </td>
              <td class="px-4 py-2.5 text-gray-600 font-medium">{{ formatStudentTime(s.comingTime) }}</td>
              <td class="px-4 py-2.5 text-gray-400">{{ formatStudentTime(s.leavingTime) }}</td>
              <td class="px-4 py-2.5">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                  :class="s.attended ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'"
                >
                  {{ s.attended ? t('attended', 'Kelgan') : t('not-attended', 'Kelmagan') }}
                </span>
              </td>
              <td class="px-4 py-2.5">
                <button
                  type="button"
                  @click="openStudentScans(s)"
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 16 16" fill="none">
                    <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" stroke-width="1.3" />
                    <path d="M2 6.5h12" stroke="currentColor" stroke-width="1.3" />
                  </svg>
                  {{ t('all-scans', 'Hammasi') }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Popup pagination (only when more than one page) -->
      <div
        v-if="!studentLoading && modalTotalPages > 1"
        class="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-sm"
      >
        <span class="text-gray-400 text-xs">
          {{ studentRows.length }} {{ t('students', "o'quvchi") }}
        </span>
        <div class="flex items-center gap-2">
          <button
            type="button"
            :disabled="modalPage <= 1"
            @click="modalPage--"
            class="px-2.5 py-1 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
          >‹</button>
          <span class="text-gray-600 font-medium">{{ modalPage }} / {{ modalTotalPages }}</span>
          <button
            type="button"
            :disabled="modalPage >= modalTotalPages"
            @click="modalPage++"
            class="px-2.5 py-1 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
          >›</button>
        </div>
      </div>
    </div>
  </div>
  <div
    v-if="isScansOpen"
    class="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
    @click.self="isScansOpen = false"
  >
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
      <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <h3 class="font-semibold text-gray-800">{{ t('all-scans', 'Barcha skanlar') }}</h3>
          <p class="text-xs text-gray-400 mt-0.5">{{ scanTarget?.name }}</p>
        </div>
        <button @click="isScansOpen = false" class="text-gray-400 hover:text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>
      </div>

      <div class="overflow-y-auto p-2">
        <div v-if="scansLoading" class="flex items-center justify-center py-12 text-gray-400 text-sm">
          {{ t('loading', 'Yuklanmoqda...') }}
        </div>
        <div v-else-if="!scanRows.length" class="flex items-center justify-center py-12 text-gray-400 text-sm">
          {{ t('no-scans', 'Skanlar yo\'q') }}
        </div>
        <ol v-else class="relative">
          <li
            v-for="(scan, i) in scanRows"
            :key="scan.id"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50"
          >
            <span class="w-6 h-6 shrink-0 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold flex items-center justify-center">
              {{ i + 1 }}
            </span>
            <span class="font-semibold text-gray-800 tabular-nums">{{ formatStudentTime(scan.scannedAt) }}</span>
            <span class="ml-auto text-xs text-gray-500">{{ cameraTypeLabel(scan.cameraType) }}</span>
          </li>
        </ol>
      </div>
    </div>
  </div>
</template>
