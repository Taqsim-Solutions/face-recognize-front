<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuery } from '@tanstack/vue-query'
import { useCurrentUser } from '@/composables/useCurrentUser'
import VueApexCharts from 'vue3-apexcharts'
import {
  Users2Icon, UserIcon, SchoolIcon, CameraIcon,
  RefreshCwIcon, ClockIcon, CalendarIcon, XIcon,
  ActivityIcon, ChevronRightIcon, FlaskConicalIcon,
  BellIcon, CheckCircleIcon, XCircleIcon
} from 'lucide-vue-next'
import {
  fetchSchoolsNumber, fetchWeeklyPerformance,
  fetchSchoolDetails, fetchAbsents,
  fetchLateStudents, fetchRegions, fetchSchoolsByCity
} from '../api'
import { fetchTodayStats } from '../api/todayStats'
import api from '@/api'
import {
  mockTodayStats, mockSchoolsNumber, mockWeeklyPerformance,
  mockSchoolDetails, mockClassAttendance, mockAbsents,
  mockLateStudents, mockLiveEvents
} from '../mockData'

const { t, locale } = useI18n()
const { regionId: userRegionId, cityId: userCityId, schoolId: userSchoolId,
        hideRegionFilter, hideCityFilter, hideSchoolFilter } = useCurrentUser()

// ── Demo mode ─────────────────────────────────────────────────────
const isDemoMode = ref(false)

// ── Date helpers ──────────────────────────────────────────────────
const today   = new Date().toISOString().split('T')[0]
const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString().split('T')[0]

// ── Filters ───────────────────────────────────────────────────────
const filterRegionId  = ref<number | undefined>()
const filterCityId    = ref<number | undefined>()
const filterSchoolId  = ref<number | undefined>()
const dateFrom = ref(today)
const dateTo   = ref(today)
const lateFrom = ref(daysAgo(30))
const lateTo   = ref(today)

// Selected school (bar chart click → class breakdown + filter weekly/absents)
const selectedSchoolId   = ref<number | undefined>()
const selectedSchoolName = ref('')

watch(filterRegionId, () => { filterCityId.value = undefined; filterSchoolId.value = undefined; selectedSchoolId.value = undefined })
watch(filterCityId,   () => { filterSchoolId.value = undefined; selectedSchoolId.value = undefined })

const activeRegionId = computed(() => userRegionId.value ?? filterRegionId.value)
const activeCityId   = computed(() => userCityId.value   ?? filterCityId.value)
const activeSchoolId = computed(() => userSchoolId.value  ?? filterSchoolId.value)

const activeDateFrom = computed(() =>
  dateFrom.value ? new Date(dateFrom.value + 'T00:00:00').toISOString() : undefined)
const activeDateTo = computed(() =>
  dateTo.value ? new Date(dateTo.value + 'T23:59:59').toISOString() : undefined)

// ── Cascade filters ───────────────────────────────────────────────
const { data: regionsRaw } = useQuery({
  queryKey: ['regions-dash'],
  queryFn: () => fetchRegions(),
  select: (r: any) => r?.data?.result || [],
  enabled: computed(() => !hideRegionFilter.value && !isDemoMode.value)
})
const cities = computed(() => {
  if (!filterRegionId.value || !regionsRaw.value) return []
  return regionsRaw.value.find((r: any) => r.id === filterRegionId.value)?.cities || []
})
const { data: schoolsRaw } = useQuery({
  queryKey: ['schools-dash', filterCityId],
  queryFn: () => fetchSchoolsByCity(filterCityId.value!),
  select: (r: any) => r?.data?.result?.data || [],
  enabled: computed(() => !!filterCityId.value && !hideSchoolFilter.value && !isDemoMode.value)
})

// ── Main queries ──────────────────────────────────────────────────
const commonKey = computed(() => [
  activeRegionId.value, activeCityId.value, activeSchoolId.value,
  activeDateFrom.value, activeDateTo.value
])

const { data: todayRaw,         refetch: refetchToday   } = useQuery({ queryKey: computed(() => ['today-stats', ...commonKey.value]), queryFn: () => fetchTodayStats({ regionId: activeRegionId.value, cityId: activeCityId.value, schoolId: activeSchoolId.value }), select: (r: any) => r?.data?.result, enabled: computed(() => !isDemoMode.value) })
const { data: schoolsNumberRaw, refetch: refetchSN      } = useQuery({ queryKey: computed(() => ['sn-dash', ...commonKey.value]), queryFn: () => fetchSchoolsNumber({ regionId: activeRegionId.value, cityId: activeCityId.value, schoolId: activeSchoolId.value, fromDate: activeDateFrom.value, toDate: activeDateTo.value }), select: (r: any) => r?.data?.result, enabled: computed(() => !isDemoMode.value) })
const { data: performanceRaw,   refetch: refetchPerf    } = useQuery({ queryKey: computed(() => ['perf-dash', selectedSchoolId.value, activeRegionId.value, activeCityId.value]), queryFn: () => fetchWeeklyPerformance({ RegionId: activeRegionId.value, CityId: activeCityId.value }), select: (r: any) => r?.data?.result, enabled: computed(() => !isDemoMode.value) })
const { data: schoolDetailsRaw, refetch: refetchDetails } = useQuery({ queryKey: computed(() => ['school-details-dash', ...commonKey.value]), queryFn: () => fetchSchoolDetails({ RegionId: activeRegionId.value, CityId: activeCityId.value, DateFrom: activeDateFrom.value, DateTo: activeDateTo.value, PageIndex: 1 }), select: (r: any) => r?.data?.result?.data || [], enabled: computed(() => !isDemoMode.value) })
const { data: absentsRaw,       refetch: refetchAbsents } = useQuery({ queryKey: computed(() => ['absents-dash', selectedSchoolId.value, ...commonKey.value]), queryFn: () => fetchAbsents({ RegionId: activeRegionId.value, CityId: activeCityId.value, SchoolId: selectedSchoolId.value ?? activeSchoolId.value, DateFrom: activeDateFrom.value, DateTo: activeDateTo.value }), select: (r: any) => r?.data?.result?.data || [], enabled: computed(() => !isDemoMode.value) })
const { data: lateStudentsRaw,  refetch: refetchLate    } = useQuery({ queryKey: computed(() => ['late-dash', selectedSchoolId.value, lateFrom.value, lateTo.value, activeRegionId.value, activeCityId.value, activeSchoolId.value]), queryFn: () => fetchLateStudents({ dateFrom: lateFrom.value, dateTo: lateTo.value, regionId: activeRegionId.value, cityId: activeCityId.value, schoolId: selectedSchoolId.value ?? activeSchoolId.value, pageSize: 20 }), select: (r: any) => r?.data?.result?.data || [], enabled: computed(() => !isDemoMode.value) })
const { data: classAttendanceRaw } = useQuery({ queryKey: computed(() => ['class-att', selectedSchoolId.value, activeDateFrom.value, activeDateTo.value]), queryFn: () => fetchSchoolDetails({ RegionId: activeRegionId.value, CityId: activeCityId.value, DateFrom: activeDateFrom.value, DateTo: activeDateTo.value, PageIndex: 1 }), select: (r: any) => r?.data?.result?.data || [], enabled: computed(() => !!selectedSchoolId.value && !isDemoMode.value) })

// ── Active data (real or mock) ────────────────────────────────────
const activeToday          = computed(() => isDemoMode.value ? mockTodayStats        : ((todayRaw.value         as any) || {}))
const activeSchoolsNumber  = computed(() => isDemoMode.value ? mockSchoolsNumber     : ((schoolsNumberRaw.value  as any) || {}))
const activePerformance    = computed(() => isDemoMode.value ? mockWeeklyPerformance  : ((performanceRaw.value   as any) || {}))
const activeSchoolDetails  = computed(() => isDemoMode.value ? mockSchoolDetails     : ((schoolDetailsRaw.value  as any[]) || []))
const activeAbsents        = computed(() => {
  if (isDemoMode.value) {
    if (!selectedSchoolId.value) return mockAbsents
    return mockAbsents.filter((a: any) => {
      const sel = mockSchoolDetails.find((s: any) => s.id === selectedSchoolId.value)
      return sel ? a.schoolName === sel.name : true
    })
  }
  return (absentsRaw.value as any[]) || []
})
const activeLateStudents   = computed(() => {
  if (isDemoMode.value) {
    if (!selectedSchoolId.value) return mockLateStudents
    return mockLateStudents.filter((st: any) => {
      const sel = mockSchoolDetails.find((s: any) => s.id === selectedSchoolId.value)
      return sel ? st.schoolName === sel.name : true
    })
  }
  return (lateStudentsRaw.value as any[]) || []
})
const activeClassAttendance = computed(() => {
  if (isDemoMode.value) return selectedSchoolId.value ? mockClassAttendance : []
  return (classAttendanceRaw.value as any[]) || []
})

// ── Selected school weekly performance (mock: filter by school) ──
const activeWeeklyPerf = computed(() => {
  if (!isDemoMode.value) return activePerformance.value
  if (!selectedSchoolId.value) return mockWeeklyPerformance
  // Scale down to per-school approximate numbers
  const factor = 0.08
  return {
    thisWeekPerformance: mockWeeklyPerformance.thisWeekPerformance.map((d: any) => ({
      ...d,
      attendedCount: Math.round(d.attendedCount * factor),
      notAttendedCount: Math.round(d.notAttendedCount * factor)
    }))
  }
})

// ── Live monitoring ───────────────────────────────────────────────
const liveEvents  = ref<any[]>([])
const liveLoading = ref(false)
let liveInterval: ReturnType<typeof setInterval>

const fetchLiveEvents = async () => {
  if (isDemoMode.value) { liveEvents.value = mockLiveEvents; return }
  try {
    liveLoading.value = true
    const res = await api.get('/api/Attendances/live?limit=15')
    const data: any[] = (res as any)?.data?.result || []
    liveEvents.value = data
  } catch { } finally { liveLoading.value = false }
}
watch(isDemoMode, () => fetchLiveEvents())
onMounted(() => { fetchLiveEvents(); liveInterval = setInterval(fetchLiveEvents, 30000) })
onUnmounted(() => clearInterval(liveInterval))

const refetchAll = () => {
  if (isDemoMode.value) return
  refetchToday(); refetchSN(); refetchPerf(); refetchDetails(); refetchAbsents(); refetchLate(); fetchLiveEvents()
}

// ── Stats ─────────────────────────────────────────────────────────
const s  = activeToday
const sn = activeSchoolsNumber
const pct = (v: number, tot: number) => tot > 0 ? Math.round(v * 100 / tot) : 0

const topCards = computed(() => [
  { key: 'students', icon: Users2Icon, value: s.value.totalStudents ?? 0, delta: '+12', color: 'text-blue-500',   bg: 'bg-blue-50',   label: t('dashboard.overall.students', "Jami o'quvchilar") },
  { key: 'teachers', icon: UserIcon,   value: s.value.totalTeachers ?? 0, delta: '+5',  color: 'text-green-500',  bg: 'bg-green-50',  label: t('teachers', "Jami o'qituvchilar") },
  { key: 'schools',  icon: SchoolIcon, value: s.value.totalSchools ?? sn.value.allSchoolsNumber ?? 0, delta: `${sn.value.connectedSchoolsNumber ?? 0} ulangan`, color: 'text-orange-500', bg: 'bg-orange-50', label: t('schools', 'Jami maktablar') },
  { key: 'cameras',  icon: CameraIcon, value: s.value.totalCameras ?? 0, delta: `${s.value.onlineCameras ?? 0} online`, color: 'text-purple-500', bg: 'bg-purple-50', label: t('cameras', 'Jami kameralar'), showCamStats: true }
])

// Today attendance cards (6 cards like EduVision)
const todayCards = computed(() => [
  { label: t('students-present', "Kelgan o'quvchilar"),   value: s.value.presentStudents ?? 0, total: s.value.totalStudents || 1, color: '#22c55e', icon: CheckCircleIcon, iconColor: 'text-green-500', bg: 'bg-green-50' },
  { label: t('students-absent',  "Kelmagan o'quvchilar"), value: s.value.absentStudents  ?? 0, total: s.value.totalStudents || 1, color: '#ef4444', icon: XCircleIcon,     iconColor: 'text-red-500',   bg: 'bg-red-50'   },
  { label: t('late-students',    "Kech qolganlar"),        value: activeLateStudents.value.length || (s.value.lateStudents ?? 0), total: s.value.totalStudents || 1, color: '#f59e0b', icon: ClockIcon, iconColor: 'text-amber-500', bg: 'bg-amber-50' },
  { label: t('teachers-present', "Kelgan o'qituvchilar"), value: s.value.presentTeachers ?? 0, total: s.value.totalTeachers || 1, color: '#3b82f6', icon: CheckCircleIcon, iconColor: 'text-blue-500',  bg: 'bg-blue-50'  },
  { label: t('teachers-absent',  "Kelmagan o'qituvchilar"), value: s.value.absentTeachers ?? 0, total: s.value.totalTeachers || 1, color: '#ef4444', icon: XCircleIcon,    iconColor: 'text-red-500',   bg: 'bg-red-50'   },
])

// ── School bar chart ──────────────────────────────────────────────
const schoolBarOptions = computed(() => ({
  chart: {
    type: 'bar' as const, toolbar: { show: false }, fontFamily: 'inherit',
    events: {
      dataPointSelection: (_: any, __: any, config: any) => {
        const row = activeSchoolDetails.value[config.dataPointIndex]
        if (row) {
          if (selectedSchoolId.value === (row.id ?? row.schoolId)) {
            // deselect
            selectedSchoolId.value = undefined
            selectedSchoolName.value = ''
          } else {
            selectedSchoolId.value   = row.id ?? row.schoolId
            selectedSchoolName.value = row.name ?? row.schoolName ?? ''
          }
        }
      }
    }
  },
  plotOptions: { bar: { borderRadius: 5, columnWidth: '60%' } },
  dataLabels: { enabled: false },
  colors: activeSchoolDetails.value.map((_: any, i: number) =>
    selectedSchoolId.value
      ? activeSchoolDetails.value[i].id === selectedSchoolId.value ||
        activeSchoolDetails.value[i].schoolId === selectedSchoolId.value
        ? '#ff792d'
        : '#fed7aa'
      : '#ff792d'
  ),
  xaxis: {
    categories: activeSchoolDetails.value.map((s: any) => {
      const n = s.name ?? s.schoolName ?? ''
      return n.length > 10 ? n.slice(0, 10) + '…' : n
    }),
    labels: { style: { fontSize: '10px', colors: '#9ca3af' }, rotate: -30 }
  },
  yaxis: { max: 100, labels: { formatter: (v: number) => v + '%', style: { fontSize: '10px', colors: '#9ca3af' } } },
  grid: { borderColor: '#f0f0f0', strokeDashArray: 4 },
  tooltip: {
    custom: ({ dataPointIndex }: any) => {
      const row = activeSchoolDetails.value[dataPointIndex]
      if (!row) return ''
      const name = row.name ?? row.schoolName ?? ''
      const total = row.totalStudents ?? 0
      const att = row.attendedStudentsCount ?? 0
      const p = row.percentage ?? row.attendedPercentage ?? '0'
      return `<div style="padding:8px 12px;font-size:12px;line-height:1.6"><b>${name}</b><br/>Kelgan: <b>${att}</b> / ${total}<br/>Ko'rsatkich: <b style="color:#ff792d">${p}%</b><br/><span style="color:#999;font-size:10px">Sinflarni ko'rish uchun bosing</span></div>`
    }
  },
  states: { hover: { filter: { type: 'darken' as const, value: 0.9 } } }
}))

const schoolBarSeries = computed(() => [{
  name: 'Kelgan %',
  data: activeSchoolDetails.value.map((s: any) => parseFloat(String(s.percentage ?? s.attendedPercentage ?? '0')) || 0)
}])

// ── Class breakdown chart ─────────────────────────────────────────
const classBarOptions = computed(() => ({
  chart: { type: 'bar' as const, toolbar: { show: false }, fontFamily: 'inherit' },
  plotOptions: { bar: { borderRadius: 4, columnWidth: '55%' } },
  dataLabels: { enabled: false },
  colors: ['#6366f1'],
  xaxis: {
    categories: activeClassAttendance.value.map((c: any) => c.name ?? c.className ?? ''),
    labels: { style: { fontSize: '10px', colors: '#9ca3af' }, rotate: -30 }
  },
  yaxis: { max: 100, labels: { formatter: (v: number) => v + '%', style: { fontSize: '10px', colors: '#9ca3af' } } },
  grid: { borderColor: '#f0f0f0', strokeDashArray: 4 },
  tooltip: { y: { formatter: (v: number) => v + '%' } }
}))
const classBarSeries = computed(() => [{
  name: 'Kelgan %',
  data: activeClassAttendance.value.map((c: any) => parseFloat(String(c.percentage ?? c.attendedPercentage ?? '0')) || 0)
}])


// ── Camera stats ──────────────────────────────────────────────────
const camTotal   = computed(() => s.value.totalCameras  || 0)
const camOnline  = computed(() => s.value.onlineCameras  ?? camTotal.value)
const camOffline = computed(() => s.value.offlineCameras || 0)
const camError   = computed(() => s.value.errorCameras   || 0)

// ── Weekly line chart ─────────────────────────────────────────────
const dayNames = computed(() => {
  const m: Record<string, string[]> = {
    uz: ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'],
    ru: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
  }
  return m[locale.value] || m.ru
})

const weeklyLineOptions = computed(() => ({
  chart: { type: 'line' as const, toolbar: { show: false }, fontFamily: 'inherit' },
  stroke: { curve: 'smooth' as const, width: 2.5 },
  colors: ['#22c55e', '#ef4444'],
  xaxis: { categories: dayNames.value, labels: { style: { fontSize: '10px', colors: '#9ca3af' } } },
  yaxis: { labels: { style: { fontSize: '10px', colors: '#9ca3af' } } },
  grid: { borderColor: '#f0f0f0', strokeDashArray: 4 },
  markers: { size: 4 },
  legend: { position: 'bottom' as const, fontSize: '11px' },
  tooltip: { shared: true, intersect: false }
}))
const weeklyLineSeries = computed(() => {
  const days = activeWeeklyPerf.value?.thisWeekPerformance || []
  return [
    { name: 'Kelgan',   data: days.map((d: any) => d.attendedCount    || 0) },
    { name: 'Kelmagan', data: days.map((d: any) => d.notAttendedCount || 0) }
  ]
})

// ── Helpers ───────────────────────────────────────────────────────
const isToday = computed(() => dateFrom.value === today && dateTo.value === today)
const resetDateRange = () => { dateFrom.value = today; dateTo.value = today }

const todayLabel = computed(() => {
  const now = new Date()
  const m: Record<string, string[]> = {
    uz: ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'],
    ru: ['Января','Февраля','Марта','Апреля','Мая','Июня','Июля','Августа','Сентября','Октября','Ноября','Декабря'],
  }
  const months = m[locale.value] || m.ru
  return `${now.getDate()} ${months[now.getMonth()]}, ${now.getFullYear()}`
})

const formatTime = (raw: any) => {
  const d = new Date(raw)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

// Mock notifications for demo
const mockNotifications = [
  { icon: '🔴', color: 'bg-red-100', title: '12-kamera tarmoqda yo\'q', sub: '3-maktab • Kirish • Kamera 12', time: '5 дақ олд' },
  { icon: '🟡', color: 'bg-amber-100', title: "O'quvchilar ommaviy kelmagan", sub: '2-maktab • 9-B sinf', time: '15 дақ олд' },
  { icon: '⚠️', color: 'bg-orange-100', title: "O'qituvchi kech qoldi", sub: 'Ibragimov S. • Tarix • 1-dars', time: '20 дақ олд' },
  { icon: '✅', color: 'bg-green-100', title: 'Tizim normal ishlayapti', sub: 'Barcha kameralar aktiv', time: '30 дақ олд' },
]
const activeNotifications = computed(() => {
  if (isDemoMode.value) return mockNotifications

  const notes: any[] = []

  // Build a "Region • City • School" location string, skipping empty parts.
  const locationOf = (ev: any) =>
    [ev.regionName, ev.cityName, ev.schoolName].filter(Boolean).join(' • ')

  // Unknown faces from the live feed → notifications
  for (const ev of liveEvents.value) {
    if (ev.kind === 'unknown') {
      const parts = [locationOf(ev)]
      if (ev.cameraName) parts.push(`📷 ${ev.cameraName}`)
      notes.push({
        icon: '⚠️',
        color: 'bg-red-100',
        title: t('unknown-face-detected', "Noma'lum yuz aniqlandi"),
        sub: parts.filter(Boolean).join('  •  '),
        time: formatTime(ev.time)
      })
    }
  }

  // Late students → notifications
  for (const ls of activeLateStudents.value) {
    const loc = [ls.regionName, ls.cityName, ls.schoolName, ls.className].filter(Boolean).join(' • ')
    notes.push({
      icon: '🟡',
      color: 'bg-amber-100',
      title: t('late-arrival', 'Kech qoldi') + ': ' + ((ls.lastName || '') + ' ' + (ls.firstName || '')).trim(),
      sub: loc,
      time: ''
    })
  }

  return notes
})

// ── Pagination for the four feed panels (client-side, 5 per page) ──
const PAGE_SIZE = 5
const livePage   = ref(1)
const notifPage  = ref(1)
const latePage   = ref(1)
const absentPage = ref(1)

const paginate = (arr: any[], page: number) =>
  arr.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
const pageCount = (arr: any[]) => Math.max(1, Math.ceil(arr.length / PAGE_SIZE))

const pagedLiveEvents     = computed(() => paginate(liveEvents.value, livePage.value))
const pagedNotifications  = computed(() => paginate(activeNotifications.value, notifPage.value))
const pagedLateStudents   = computed(() => paginate(activeLateStudents.value, latePage.value))
const pagedAbsents        = computed(() => paginate(activeAbsents.value, absentPage.value))

// Reset to first page whenever the underlying list changes size meaningfully.
watch(() => liveEvents.value.length,        () => { livePage.value = 1 })
watch(() => activeNotifications.value.length, () => { notifPage.value = 1 })
watch(() => activeLateStudents.value.length,  () => { latePage.value = 1 })
watch(() => activeAbsents.value.length,       () => { absentPage.value = 1 })
</script>

<template>
  <div class="min-h-screen bg-[#f4f5f7] pb-10">

    <!-- ── Header ──────────────────────────────────────────────── -->
    <header class="flex justify-between items-center gap-2 px-4 sm:px-6 py-3.5 border-b bg-white sticky top-0 z-20 shadow-sm">
      <div>
        <h1 class="text-[18px] font-bold text-gray-900">{{ t('dashboard.statistics', 'Bosh panel') }}</h1>
        <p class="text-xs text-gray-400">{{ todayLabel }}</p>
      </div>
      <div class="flex items-center gap-2.5">
        <!-- Demo switch -->
        <button @click="isDemoMode = !isDemoMode"
          :class="['flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-medium transition-all',
            isDemoMode ? 'bg-violet-50 border-violet-200 text-violet-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50']">
          <FlaskConicalIcon class="w-4 h-4" />
          <span>Demo</span>
          <div :class="['relative w-8 h-4 rounded-full transition-colors', isDemoMode ? 'bg-violet-500' : 'bg-gray-200']">
            <div :class="['absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform', isDemoMode ? 'translate-x-4' : 'translate-x-0.5']" />
          </div>
        </button>
        <button @click="refetchAll()" :disabled="isDemoMode"
          :class="['flex items-center gap-1.5 text-sm border rounded-lg px-3 py-1.5 transition',
            isDemoMode ? 'text-gray-300 border-gray-100 cursor-not-allowed' : 'text-gray-600 bg-white border-gray-200 hover:bg-gray-50 cursor-pointer']">
          <RefreshCwIcon class="w-3.5 h-3.5" />
          Yangilash
        </button>
      </div>
    </header>

    <!-- Demo banner -->
    <div v-if="isDemoMode" class="mx-6 mt-4 flex items-center gap-3 bg-violet-50 border border-violet-200 rounded-xl px-4 py-2.5">
      <FlaskConicalIcon class="w-4 h-4 text-violet-500 shrink-0" />
      <p class="text-sm text-violet-700">Demo rejim — <strong>statik (mock)</strong> ma'lumotlar ko'rsatilmoqda.</p>
      <button @click="isDemoMode = false" class="ml-auto text-xs text-violet-500 hover:text-violet-700 underline shrink-0">O'chirish</button>
    </div>

    <div class="px-4 sm:px-6 pt-4 space-y-4">

      <!-- ── Filter Bar ───────────────────────────────────────── -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3" :class="{ 'opacity-50 pointer-events-none': isDemoMode }">
        <div class="flex flex-wrap items-end gap-3">
          <div v-if="!hideRegionFilter" class="flex flex-col gap-1">
            <label class="text-xs font-medium text-gray-500">{{ t('region', 'Viloyat') }}</label>
            <select v-model="filterRegionId" class="h-8 px-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:border-[#ff792d] bg-white min-w-[140px]">
              <option :value="undefined">Barchasi</option>
              <option v-for="r in (regionsRaw || [])" :key="(r as any).id" :value="(r as any).id">{{ (r as any).name }}</option>
            </select>
          </div>
          <div v-if="!hideCityFilter && filterRegionId" class="flex flex-col gap-1">
            <label class="text-xs font-medium text-gray-500">{{ t('district', 'Tuman') }}</label>
            <select v-model="filterCityId" class="h-8 px-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:border-[#ff792d] bg-white min-w-[140px]">
              <option :value="undefined">Barchasi</option>
              <option v-for="c in cities" :key="(c as any).id" :value="(c as any).id">{{ (c as any).name }}</option>
            </select>
          </div>
          <div v-if="!hideSchoolFilter && filterCityId" class="flex flex-col gap-1">
            <label class="text-xs font-medium text-gray-500">{{ t('school', 'Maktab') }}</label>
            <select v-model="filterSchoolId" class="h-8 px-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:border-[#ff792d] bg-white min-w-[150px]">
              <option :value="undefined">Barchasi</option>
              <option v-for="sc in (schoolsRaw || [])" :key="(sc as any).id" :value="(sc as any).id">{{ (sc as any).name }}</option>
            </select>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-gray-500 flex items-center gap-1"><CalendarIcon class="w-3 h-3" />Sana</label>
            <div class="flex items-center gap-1.5">
              <input type="date" v-model="dateFrom" :max="dateTo" class="h-8 px-2 rounded-lg border border-gray-200 text-xs text-gray-700 focus:outline-none focus:border-[#ff792d] bg-white" />
              <span class="text-gray-300">—</span>
              <input type="date" v-model="dateTo" :min="dateFrom" :max="today" class="h-8 px-2 rounded-lg border border-gray-200 text-xs text-gray-700 focus:outline-none focus:border-[#ff792d] bg-white" />
              <button v-if="!isToday" @click="resetDateRange" class="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition"><XIcon class="w-3.5 h-3.5" /></button>
            </div>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs invisible">-</label>
            <div class="flex gap-1">
              <button v-for="q in [{ l: t('today', 'Bugun'), f: today, t: today }, { l: t('7-days', '7 kun'), f: daysAgo(6), t: today }, { l: t('30-days', '30 kun'), f: daysAgo(29), t: today }]"
                :key="q.l" @click="dateFrom = q.f; dateTo = q.t"
                :class="['h-8 px-2.5 text-xs rounded-lg border transition', dateFrom === q.f && dateTo === q.t ? 'bg-[#ff792d] text-white border-[#ff792d] font-semibold' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50']">
                {{ q.l }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Top 4 stat cards ─────────────────────────────────── -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <template v-for="card in topCards" :key="card.key">

          <!-- Camera card with donut -->
          <div v-if="card.showCamStats" class="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 shadow-sm hover:shadow transition">
            <!-- Left: icon + count + label -->
            <div :class="[card.bg, 'p-2.5 rounded-xl shrink-0']">
              <component :is="card.icon" :class="[card.color, 'w-5 h-5']" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-xl font-bold text-gray-900">{{ card.value.toLocaleString() }}</p>
              <p class="text-xs text-gray-500 truncate">{{ card.label }}</p>
            </div>
            <!-- Right: donut + legend (only if data exists) -->
            <div v-if="camTotal > 0" class="flex items-center gap-2 shrink-0">
              <!-- SVG donut (small, same height as card) -->
              <div class="relative" style="width:44px;height:44px">
                <svg viewBox="0 0 44 44" class="w-full h-full -rotate-90">
                  <circle cx="22" cy="22" r="17" fill="none" stroke="#f3f4f6" stroke-width="6"/>
                  <circle cx="22" cy="22" r="17" fill="none" stroke="#22c55e" stroke-width="6"
                    :stroke-dasharray="`${(camOnline / camTotal) * 106.8} 106.8`"
                    stroke-dashoffset="0"/>
                  <circle cx="22" cy="22" r="17" fill="none" stroke="#ef4444" stroke-width="6"
                    :stroke-dasharray="`${(camOffline / camTotal) * 106.8} 106.8`"
                    :stroke-dashoffset="`${-((camOnline / camTotal) * 106.8)}`"/>
                  <circle cx="22" cy="22" r="17" fill="none" stroke="#f59e0b" stroke-width="6"
                    :stroke-dasharray="`${(camError / camTotal) * 106.8} 106.8`"
                    :stroke-dashoffset="`${-(((camOnline + camOffline) / camTotal) * 106.8)}`"/>
                </svg>
                <div class="absolute inset-0 flex items-center justify-center">
                  <span style="font-size:9px" class="font-bold text-gray-700">{{ pct(camOnline, camTotal) }}%</span>
                </div>
              </div>
              <!-- Compact legend -->
              <div class="flex flex-col gap-0.5 text-xs">
                <span class="flex items-center gap-1 text-gray-600 whitespace-nowrap">
                  <span class="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></span>
                  <span class="font-medium text-gray-800">{{ camOnline }}</span>
                </span>
                <span class="flex items-center gap-1 text-gray-600 whitespace-nowrap">
                  <span class="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                  <span class="font-medium text-gray-800">{{ camOffline }}</span>
                </span>
                <span class="flex items-center gap-1 text-gray-600 whitespace-nowrap">
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                  <span class="font-medium text-gray-800">{{ camError }}</span>
                </span>
              </div>
            </div>
          </div>

          <!-- Regular stat card -->
          <div v-else class="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 shadow-sm hover:shadow transition">
            <div :class="[card.bg, 'p-2.5 rounded-xl shrink-0']">
              <component :is="card.icon" :class="[card.color, 'w-5 h-5']" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-xl font-bold text-gray-900">{{ card.value.toLocaleString() }}</p>
              <p class="text-xs text-gray-500 truncate">{{ card.label }}</p>
              <p class="text-xs font-medium" :class="card.color">{{ card.delta }}</p>
            </div>
          </div>

        </template>
      </div>

      <!-- ── Today 5 attendance cards ─────────────────────────── -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div v-for="card in todayCards" :key="card.label" :class="['bg-white rounded-xl border border-gray-200 p-3.5 shadow-sm']">
          <div class="flex items-center justify-between mb-2">
            <p class="text-xs text-gray-500 font-medium leading-tight">{{ card.label }}</p>
            <component :is="card.icon" :class="[card.iconColor, 'w-4 h-4 shrink-0']" />
          </div>
          <p class="text-2xl font-bold text-gray-900">{{ card.value.toLocaleString() }}</p>
          <div class="mt-2">
            <div class="flex justify-between text-xs text-gray-400 mb-1">
              <span class="font-medium" :style="{ color: card.color }">{{ pct(card.value, card.total) }}%</span>
              <span>/ {{ card.total.toLocaleString() }}</span>
            </div>
            <div class="h-1 bg-gray-100 rounded-full overflow-hidden">
              <div class="h-full rounded-full" :style="{ width: pct(card.value, card.total) + '%', background: card.color }" />
            </div>
          </div>
        </div>
      </div>

      <!-- ── Main content: LEFT (charts) + RIGHT (live + notif) ── -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">

        <!-- LEFT: 2/3 width -->
        <div class="lg:col-span-2 space-y-4">

          <!-- School + Class charts -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">

            <!-- School bar -->
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-semibold text-gray-700">{{ t('schools-attendance', 'Maktablar bo\'yicha davomad (%)') }}</h3>
                <button v-if="selectedSchoolId" @click="selectedSchoolId = undefined; selectedSchoolName = ''"
                  class="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
                  <XIcon class="w-3 h-3" />Bekor
                </button>
              </div>
              <div v-if="!activeSchoolDetails.length" class="h-44 flex items-center justify-center text-gray-400 text-sm">{{ t('no-data', 'Ma\'lumot yo\'q') }}</div>
              <VueApexCharts v-else type="bar" height="200" :options="schoolBarOptions" :series="schoolBarSeries" />
            </div>

            <!-- Class breakdown -->
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div class="flex items-start justify-between mb-3">
                <div>
                  <h3 class="text-sm font-semibold text-gray-700">{{ t('classes-attendance', 'Sinflar bo\'yicha davomad') }}</h3>
                  <p v-if="selectedSchoolName" class="text-xs text-[#ff792d] font-medium mt-0.5 flex items-center gap-1">
                    <ChevronRightIcon class="w-3 h-3" />{{ selectedSchoolName }}
                  </p>
                </div>
              </div>
              <div v-if="!selectedSchoolId" class="h-44 flex flex-col items-center justify-center text-gray-300 gap-2">
                <SchoolIcon class="w-7 h-7" />
                <p class="text-xs text-center">{{ t('select-school-hint', 'Maktabni bosing') }}</p>
              </div>
              <div v-else-if="!activeClassAttendance.length" class="h-44 flex items-center justify-center text-gray-400 text-sm">Ma'lumot yo'q</div>
              <VueApexCharts v-else type="bar" height="200" :options="classBarOptions" :series="classBarSeries" />
            </div>
          </div>

          <!-- Weekly chart + School table -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">

            <!-- Weekly line -->
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-semibold text-gray-700">{{ t('dashboard.weekly-stats', 'Haftalik davomad') }}</h3>
                <span v-if="selectedSchoolName" class="text-xs text-[#ff792d] bg-orange-50 px-2 py-0.5 rounded-full">{{ selectedSchoolName }}</span>
              </div>
              <div v-if="!weeklyLineSeries[0]?.data?.length" class="h-44 flex items-center justify-center text-gray-400 text-sm">Ma'lumot yo'q</div>
              <VueApexCharts v-else type="line" height="200" :options="weeklyLineOptions" :series="weeklyLineSeries" />
            </div>

            <!-- School table compact -->
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              <div class="px-4 py-3 border-b border-gray-50">
                <h3 class="text-sm font-semibold text-gray-700">{{ t('dashboard.school-details.school-table-title', 'Maktablar statistikasi') }}</h3>
              </div>
              <div v-if="!activeSchoolDetails.length" class="flex-1 flex items-center justify-center py-8 text-gray-400 text-sm">Ma'lumot yo'q</div>
              <div v-else class="overflow-y-auto max-h-[230px]">
                <table class="w-full text-xs">
                  <thead class="sticky top-0 bg-gray-50">
                    <tr>
                      <th class="px-3 py-2 text-left font-semibold text-gray-500 uppercase">{{ t('school', 'Maktab') }}</th>
                      <th class="px-2 py-2 text-right font-semibold text-gray-500">Jami</th>
                      <th class="px-2 py-2 text-right font-semibold text-gray-500">✓</th>
                      <th class="px-2 py-2 text-right font-semibold text-gray-500">✗</th>
                      <th class="px-2 py-2 text-right font-semibold text-gray-500">%</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-50">
                    <tr v-for="row in activeSchoolDetails" :key="row.id ?? row.schoolId"
                      class="hover:bg-gray-50 transition cursor-pointer"
                      :class="{ 'bg-orange-50': selectedSchoolId === (row.id ?? row.schoolId) }"
                      @click="selectedSchoolId = row.id ?? row.schoolId; selectedSchoolName = row.name ?? row.schoolName ?? ''">
                      <td class="px-3 py-2 font-medium text-gray-800 max-w-[100px] truncate">{{ row.name ?? row.schoolName }}</td>
                      <td class="px-2 py-2 text-right text-gray-500">{{ row.totalStudents ?? row.allStudentsCount }}</td>
                      <td class="px-2 py-2 text-right text-green-600 font-semibold">{{ row.attendedStudentsCount ?? (row.totalStudents - row.absentsCount) }}</td>
                      <td class="px-2 py-2 text-right text-red-500 font-semibold">{{ row.notAttendedStudentsCount ?? row.absentsCount }}</td>
                      <td class="px-2 py-2 text-right">
                        <span :class="['inline-flex px-1.5 py-0.5 rounded text-xs font-bold', parseFloat(row.percentage ?? '0') >= 80 ? 'bg-green-100 text-green-700' : parseFloat(row.percentage ?? '0') >= 50 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700']">
                          {{ row.percentage ?? row.attendedPercentage }}%
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Late + Absent -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">

            <!-- Late students -->
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              <div class="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <ClockIcon class="w-4 h-4 text-amber-500" />
                  <h3 class="text-sm font-semibold text-gray-700">{{ t('late-students', 'Kech qolganlar') }}</h3>
                  <span v-if="selectedSchoolName" class="text-xs text-[#ff792d] bg-orange-50 px-1.5 py-0.5 rounded-full">{{ selectedSchoolName }}</span>
                </div>
                <div v-if="!isDemoMode" class="flex items-center gap-1">
                  <input type="date" v-model="lateFrom" :max="lateTo" class="h-6 px-1.5 rounded border border-gray-200 text-xs text-gray-600 focus:outline-none" />
                  <span class="text-gray-300">—</span>
                  <input type="date" v-model="lateTo" :min="lateFrom" :max="today" class="h-6 px-1.5 rounded border border-gray-200 text-xs text-gray-600 focus:outline-none" />
                </div>
              </div>
              <div v-if="!activeLateStudents.length" class="flex-1 flex items-center justify-center py-6 text-gray-400 text-sm">{{ t('no-late-students', 'Kech qolganlar yo\'q') }}</div>
              <div v-else class="flex flex-col">
                <div class="overflow-y-auto max-h-[260px] divide-y divide-gray-50">
                  <div v-for="st in pagedLateStudents" :key="st.studentId" class="flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-50 transition">
                    <div class="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-600 shrink-0">
                      {{ (st.firstName?.[0] || '').toUpperCase() + (st.lastName?.[0] || '').toUpperCase() }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-xs font-semibold text-gray-800 truncate">{{ st.lastName }} {{ st.firstName }}</p>
                      <p class="text-xs text-gray-400 truncate">{{ st.schoolName }} • {{ st.className }}</p>
                    </div>
                    <span class="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full shrink-0">{{ st.lateCount }}x</span>
                    <div class="flex flex-col gap-0.5">
                      <span v-for="entry in st.lateEntries?.slice(0, 2)" :key="entry.date" class="text-xs text-gray-500 whitespace-nowrap">
                        {{ formatTime(entry.comingTime) }}
                      </span>
                    </div>
                  </div>
                </div>
                <div v-if="pageCount(activeLateStudents) > 1" class="flex items-center justify-between px-3 py-2 border-t border-gray-50 text-xs">
                  <button :disabled="latePage <= 1" @click="latePage--" class="px-2 py-1 rounded border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50">‹</button>
                  <span class="text-gray-400">{{ latePage }} / {{ pageCount(activeLateStudents) }}</span>
                  <button :disabled="latePage >= pageCount(activeLateStudents)" @click="latePage++" class="px-2 py-1 rounded border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50">›</button>
                </div>
              </div>
            </div>

            <!-- Absent students -->
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              <div class="px-4 py-3 border-b border-gray-50 flex items-center gap-2">
                <XCircleIcon class="w-4 h-4 text-red-400" />
                <h3 class="text-sm font-semibold text-gray-700">{{ t('dashboard.absents.title', 'Kelmagan o\'quvchilar') }}</h3>
                <span v-if="selectedSchoolName" class="text-xs text-[#ff792d] bg-orange-50 px-1.5 py-0.5 rounded-full">{{ selectedSchoolName }}</span>
              </div>
              <div v-if="!activeAbsents.length" class="flex-1 flex items-center justify-center py-6 text-gray-400 text-sm">{{ t('no-data', 'Ma\'lumot yo\'q') }}</div>
              <div v-else class="flex flex-col">
                <div class="overflow-y-auto max-h-[260px] divide-y divide-gray-50">
                  <div v-for="st in pagedAbsents" :key="st.id" class="flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-50 transition">
                    <div class="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-xs font-bold text-red-600 shrink-0">
                      {{ ((st.firstName || st.studentName || '?')[0] || '').toUpperCase() }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-xs font-semibold text-gray-800 truncate">{{ st.lastName }} {{ st.firstName || st.studentName }}</p>
                      <p class="text-xs text-gray-400 truncate">{{ st.schoolName || st.school }} • {{ st.className || st.class }}</p>
                    </div>
                    <span class="text-xs text-red-500 font-semibold bg-red-50 px-2 py-0.5 rounded-full shrink-0">{{ t('not-attended', 'Kelmagan') }}</span>
                  </div>
                </div>
                <div v-if="pageCount(activeAbsents) > 1" class="flex items-center justify-between px-3 py-2 border-t border-gray-50 text-xs">
                  <button :disabled="absentPage <= 1" @click="absentPage--" class="px-2 py-1 rounded border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50">‹</button>
                  <span class="text-gray-400">{{ absentPage }} / {{ pageCount(activeAbsents) }}</span>
                  <button :disabled="absentPage >= pageCount(activeAbsents)" @click="absentPage++" class="px-2 py-1 rounded border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50">›</button>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- RIGHT: 1/3 width — Live + Camera + Notifications -->
        <div class="space-y-4">

          <!-- Live monitoring -->
          <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div class="flex items-center justify-between px-4 py-3 border-b border-gray-50">
              <div class="flex items-center gap-2">
                <div class="relative flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </div>
                <h3 class="text-sm font-semibold text-gray-700">{{ t('live-monitoring', 'Live мониторинг') }}</h3>
                <span v-if="isDemoMode" class="text-xs bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded-full">Demo</span>
              </div>
              <button @click="fetchLiveEvents()" class="text-xs text-[#ff792d] flex items-center gap-1">
                <RefreshCwIcon class="w-3 h-3" :class="{ 'animate-spin': liveLoading }" />
              </button>
            </div>
            <div v-if="!liveEvents.length" class="flex flex-col items-center justify-center py-8 text-gray-300 gap-1">
              <ActivityIcon class="w-6 h-6" />
              <p class="text-xs">{{ t('no-live-events', 'Bugun hodisalar yo\'q') }}</p>
            </div>
            <div v-else class="divide-y divide-gray-50">
              <div v-for="(ev, i) in pagedLiveEvents" :key="i" class="flex items-center gap-3 px-3 py-3 hover:bg-gray-50 transition">
                <!-- Photo (big) -->
                <div
                  class="shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shadow ring-2"
                  :class="ev.kind === 'unknown' ? 'ring-red-100' : 'ring-white'"
                >
                  <img v-if="ev.imageName"
                    :src="`/api/images?filename=${ev.imageName}`"
                    class="w-full h-full object-cover"
                    @error="($event.target as HTMLImageElement).style.display='none'" />
                  <div v-else class="w-full h-full flex items-center justify-center text-sm font-bold text-gray-400 bg-gray-200">
                    {{ ev.kind === 'unknown' ? '?' : (ev.fullName?.[0] || '?').toUpperCase() }}
                  </div>
                </div>
                <!-- Info -->
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-gray-800 truncate">
                    {{ ev.kind === 'unknown' ? t('unknown-face', "Noma'lum yuz") : ev.fullName }}
                  </p>
                  <p class="text-xs text-gray-400 truncate">
                    {{ ev.schoolName || '' }}{{ ev.className ? ' • ' + ev.className : '' }}
                  </p>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="text-xs text-gray-500 font-medium">{{ formatTime(ev.time) }}</span>
                    <span
                      v-if="ev.kind === 'unknown'"
                      class="text-xs px-2 py-0.5 rounded-full font-semibold bg-red-50 text-red-600"
                    >
                      {{ t('unknown-face', "Noma'lum") }}
                    </span>
                    <span
                      v-else
                      class="text-xs px-2 py-0.5 rounded-full font-semibold"
                      :class="ev.direction === 'departure' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'"
                    >
                      {{ ev.direction === 'departure' ? t('left', 'Ketdi') : t('arrived', 'Keldi') }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="liveEvents.length && pageCount(liveEvents) > 1" class="flex items-center justify-between px-3 py-2 border-t border-gray-50 text-xs">
              <button :disabled="livePage <= 1" @click="livePage--" class="px-2 py-1 rounded border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50">‹</button>
              <span class="text-gray-400">{{ livePage }} / {{ pageCount(liveEvents) }}</span>
              <button :disabled="livePage >= pageCount(liveEvents)" @click="livePage++" class="px-2 py-1 rounded border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50">›</button>
            </div>
            <div class="px-4 py-2 text-xs text-gray-300 text-center border-t border-gray-50">
              {{ isDemoMode ? "Demo — statik ma'lumotlar" : 'Avtomatik yangilash: 30 soniya' }}
            </div>
          </div>

          <!-- Notifications (demo only) -->
          <div v-if="activeNotifications.length" class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div class="flex items-center justify-between px-4 py-3 border-b border-gray-50">
              <div class="flex items-center gap-2">
                <BellIcon class="w-4 h-4 text-gray-500" />
                <h3 class="text-sm font-semibold text-gray-700">{{ t('notifications', 'Bildirishnomalar') }}</h3>
              </div>
              <span class="text-xs text-gray-400">{{ t('view-all', 'Ko\'rish →') }}</span>
            </div>
            <div class="divide-y divide-gray-50">
              <div v-for="(n, i) in pagedNotifications" :key="i" class="flex items-start gap-3 px-3 py-2.5 hover:bg-gray-50 transition">
                <div :class="[n.color, 'w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0']">{{ n.icon }}</div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-semibold text-gray-800 break-words">{{ n.title }}</p>
                  <p class="text-xs text-gray-400 break-words leading-snug">{{ n.sub }}</p>
                </div>
                <span class="text-xs text-gray-400 whitespace-nowrap shrink-0">{{ n.time }}</span>
              </div>
            </div>
            <div v-if="pageCount(activeNotifications) > 1" class="flex items-center justify-between px-3 py-2 border-t border-gray-50 text-xs">
              <button :disabled="notifPage <= 1" @click="notifPage--" class="px-2 py-1 rounded border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50">‹</button>
              <span class="text-gray-400">{{ notifPage }} / {{ pageCount(activeNotifications) }}</span>
              <button :disabled="notifPage >= pageCount(activeNotifications)" @click="notifPage++" class="px-2 py-1 rounded border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50">›</button>
            </div>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>
