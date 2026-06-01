<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuery } from '@tanstack/vue-query'
import { useCurrentUser } from '@/composables/useCurrentUser'
import VueApexCharts from 'vue3-apexcharts'
import {
  Users2Icon, UserIcon, SchoolIcon, CameraIcon,
  RefreshCwIcon, ClockIcon, CalendarIcon, XIcon,
  ActivityIcon, ChevronRightIcon
} from 'lucide-vue-next'
import {
  fetchSchoolsNumber, fetchWeeklyPerformance,
  fetchSchoolDetails, fetchAbsents,
  fetchLateStudents, fetchRegions, fetchSchoolsByCity
} from '../api'
import { fetchTodayStats } from '../api/todayStats'
import api from '@/api'

const { t, locale } = useI18n()
const { regionId: userRegionId, cityId: userCityId, schoolId: userSchoolId,
        hideRegionFilter, hideCityFilter, hideSchoolFilter } = useCurrentUser()

// ── Date helpers ──────────────────────────────────────────────────
const today = new Date().toISOString().split('T')[0]
const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString().split('T')[0]

// ── Filters ───────────────────────────────────────────────────────
const filterRegionId = ref<number | undefined>()
const filterCityId   = ref<number | undefined>()
const filterSchoolId = ref<number | undefined>()
const dateFrom = ref(today)
const dateTo   = ref(today)

// Late students separate range
const lateFrom = ref(daysAgo(30))
const lateTo   = ref(today)

// School chart selected school → class breakdown
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

// ── Cascade filters data ──────────────────────────────────────────
const { data: regionsRaw } = useQuery({
  queryKey: ['regions-dash'],
  queryFn: () => fetchRegions(),
  select: (r: any) => r?.data?.result || [],
  enabled: computed(() => !hideRegionFilter.value)
})

const cities = computed(() => {
  if (!filterRegionId.value || !regionsRaw.value) return []
  return regionsRaw.value.find((r: any) => r.id === filterRegionId.value)?.cities || []
})

const { data: schoolsRaw } = useQuery({
  queryKey: ['schools-dash', filterCityId],
  queryFn: () => fetchSchoolsByCity(filterCityId.value!),
  select: (r: any) => r?.data?.result?.data || [],
  enabled: computed(() => !!filterCityId.value && !hideSchoolFilter.value)
})

onUnmounted(() => clearInterval(liveInterval))

const refetchAll = () => {
  refetchToday(); refetchSN(); refetchPerf()
  refetchDetails(); refetchAbsents(); refetchLate()
  fetchLiveEvents()
}

// ── Computed stats ────────────────────────────────────────────────
const s  = computed(() => todayRaw.value || {})
const sn = computed(() => schoolsNumberRaw.value || {})
const pct = (v: number, tot: number) => tot > 0 ? Math.round(v * 100 / tot) : 0

const topCards = computed(() => [
  { key: 'students', icon: Users2Icon, value: s.value.totalStudents ?? 0, color: 'text-blue-500', bg: 'bg-blue-50', label: t('dashboard.overall.students', "O'quvchilar") },
  { key: 'teachers', icon: UserIcon, value: s.value.totalTeachers ?? 0, color: 'text-green-500', bg: 'bg-green-50', label: t('teachers', "O'qituvchilar") },
  { key: 'schools', icon: SchoolIcon, value: s.value.totalSchools ?? sn.value.allSchoolsNumber ?? 0, sub: `${sn.value.connectedSchoolsNumber ?? 0} ${t('dashboard.connected-schools', 'ulangan')}`, color: 'text-orange-500', bg: 'bg-orange-50', label: t('schools', 'Maktablar') },
  { key: 'cameras', icon: CameraIcon, value: s.value.totalCameras ?? 0, sub: `${s.value.onlineCameras ?? 0} online`, color: 'text-purple-500', bg: 'bg-purple-50', label: t('cameras', 'Kameralar') }
])

const attendanceCards = computed(() => [
  { label: t('attended', "Kelgan o'quvchilar"), value: s.value.presentStudents ?? 0, total: s.value.totalStudents || 1, color: '#22c55e', border: 'border-green-100' },
  { label: t('not-attended', "Kelmagan o'quvchilar"), value: s.value.absentStudents ?? 0, total: s.value.totalStudents || 1, color: '#ef4444', border: 'border-red-100' },
  { label: t('attended', "Kelgan o'qituvchilar"), value: s.value.presentTeachers ?? 0, total: s.value.totalTeachers || 1, color: '#3b82f6', border: 'border-blue-100' },
  { label: t('not-attended', "Kelmagan o'qituvchilar"), value: s.value.absentTeachers ?? 0, total: s.value.totalTeachers || 1, color: '#f59e0b', border: 'border-amber-100' }
])

// ── School bar chart (school-by-school, not monthly) ──────────────
const schoolBarOptions = computed(() => ({
  chart: { type: 'bar' as const, toolbar: { show: false }, fontFamily: 'inherit', events: {
    dataPointSelection: (_: any, __: any, config: any) => {
      const row = (schoolDetailsRaw.value || [])[config.dataPointIndex]
      if (row) {
        selectedSchoolId.value = row.id ?? row.schoolId
        selectedSchoolName.value = row.name ?? row.schoolName ?? ''
      }
    }
  }},
  plotOptions: { bar: { borderRadius: 6, columnWidth: '55%', distributed: false } },
  dataLabels: { enabled: false },
  colors: ['#ff792d'],
  xaxis: {
    categories: (schoolDetailsRaw.value || []).map((s: any) => {
      const name = s.name ?? s.schoolName ?? ''
      return name.length > 14 ? name.slice(0, 14) + '…' : name
    }),
    labels: { style: { fontSize: '11px', colors: '#9ca3af' }, rotate: -30 }
  },
  yaxis: { max: 100, labels: { formatter: (v: number) => v + '%', style: { fontSize: '11px', colors: '#9ca3af' } } },
  grid: { borderColor: '#f0f0f0', strokeDashArray: 4 },
  tooltip: {
    y: { formatter: (v: number) => v + '%' },
    custom: ({ dataPointIndex }: any) => {
      const row = (schoolDetailsRaw.value || [])[dataPointIndex]
      if (!row) return ''
      const name = row.name ?? row.schoolName ?? ''
      const total = row.totalStudents ?? row.allStudentsCount ?? 0
      const attended = row.attendedStudentsCount ?? 0
      const pctVal = row.percentage ?? row.attendedPercentage ?? '0'
      return `<div style="padding:8px 12px;font-size:12px"><b>${name}</b><br/>
        ${t('attended','Kelgan')}: ${attended}/${total} (${pctVal}%)
        <br/><span style="color:#999;font-size:11px">${t('click-for-classes','Sinflar uchun bosing')}</span></div>`
    }
  },
  states: { hover: { filter: { type: 'darken' as const, value: 0.85 } } }
}))

const schoolBarSeries = computed(() => [{
  name: t('attended', 'Kelgan %'),
  data: (schoolDetailsRaw.value || []).map((s: any) => {
    const pctStr = s.percentage ?? s.attendedPercentage ?? '0'
    return parseFloat(String(pctStr)) || 0
  })
}])

// ── Class breakdown chart ─────────────────────────────────────────
const classBarOptions = computed(() => ({
  chart: { type: 'bar' as const, toolbar: { show: false }, fontFamily: 'inherit' },
  plotOptions: { bar: { borderRadius: 5, columnWidth: '50%' } },
  dataLabels: { enabled: false },
  colors: ['#6366f1'],
  xaxis: {
    categories: (classAttendanceRaw.value || []).map((c: any) => c.name ?? c.className ?? c.class ?? ''),
    labels: { style: { fontSize: '11px', colors: '#9ca3af' } }
  },
  yaxis: { max: 100, labels: { formatter: (v: number) => v + '%', style: { fontSize: '11px', colors: '#9ca3af' } } },
  grid: { borderColor: '#f0f0f0', strokeDashArray: 4 },
  tooltip: { y: { formatter: (v: number) => v + '%' } }
}))

const classBarSeries = computed(() => [{
  name: t('attended', 'Kelgan %'),
  data: (classAttendanceRaw.value || []).map((c: any) => parseFloat(String(c.percentage ?? c.attendedPercentage ?? '0')) || 0)
}])

// ── Camera donut ──────────────────────────────────────────────────
const camTotal   = computed(() => s.value.totalCameras  || 0)
const camOnline  = computed(() => s.value.onlineCameras ?? camTotal.value)
const camOffline = computed(() => s.value.offlineCameras || 0)
const camError   = computed(() => s.value.errorCameras  || 0)

const cameraDonutOptions = computed(() => ({
  chart: { type: 'donut' as const, fontFamily: 'inherit' },
  labels: ['Online', 'Offline', t('error', 'Xato')],
  colors: ['#22c55e', '#ef4444', '#f59e0b'],
  plotOptions: { pie: { donut: { size: '65%', labels: { show: true, total: { show: true, label: t('all', 'Jami'), formatter: () => String(camTotal.value) } } } } },
  dataLabels: { enabled: false },
  legend: { show: false },
  stroke: { width: 0 }
}))
const cameraDonutSeries = computed(() => [camOnline.value || 0, camOffline.value || 0, camError.value || 0])

// ── Weekly line chart ─────────────────────────────────────────────
const dayNames = computed(() => {
  const m: Record<string, string[]> = {
    uz: ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'],
    ru: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
    en: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
  }
  return m[locale.value] || m.ru
})

const weeklyLineOptions = computed(() => ({
  chart: { type: 'line' as const, toolbar: { show: false }, fontFamily: 'inherit' },
  stroke: { curve: 'smooth' as const, width: 3 },
  colors: ['#ff792d', '#ef4444'],
  xaxis: { categories: dayNames.value, labels: { style: { fontSize: '11px', colors: '#9ca3af' } } },
  yaxis: { labels: { style: { fontSize: '11px', colors: '#9ca3af' } } },
  grid: { borderColor: '#f0f0f0', strokeDashArray: 4 },
  markers: { size: 5 },
  legend: { position: 'bottom' as const, fontSize: '12px' },
  tooltip: { shared: true, intersect: false }
}))
const weeklyLineSeries = computed(() => {
  const days = performanceRaw.value?.thisWeekPerformance || []
  return [
    { name: t('attended', 'Kelgan'), data: days.map((d: any) => d.attendedCount || 0) },
    { name: t('not-attended', 'Kelmagan'), data: days.map((d: any) => d.notAttendedCount || 0) }
  ]
})

// ── Date helpers ──────────────────────────────────────────────────
const isToday = computed(() => dateFrom.value === today && dateTo.value === today)
const resetDateRange = () => { dateFrom.value = today; dateTo.value = today }

const todayLabel = computed(() => {
  const now = new Date()
  const months: Record<string, string[]> = {
    uz: ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'],
    ru: ['Января','Февраля','Марта','Апреля','Мая','Июня','Июля','Августа','Сентября','Октября','Ноября','Декабря'],
    en: ['January','February','March','April','May','June','July','August','September','October','November','December']
  }
  const m = months[locale.value] || months.ru
  return `${now.getDate()} ${m[now.getMonth()]}, ${now.getFullYear()}`
})

// Live event time formatter
const formatTime = (raw: any) => {
  const d = new Date(raw)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleTimeString(locale.value === 'uz' ? 'uz-UZ' : 'ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const liveStatusColor = (type: string) => {
  if (!type) return 'bg-green-100 text-green-700'
  const low = type.toLowerCase()
  if (low.includes('exit') || low.includes('out') || low.includes('ket')) return 'bg-red-100 text-red-600'
  return 'bg-green-100 text-green-700'
}
const liveStatusLabel = (type: string) => {
  if (!type) return t('entered', 'Kirdi')
  const low = type.toLowerCase()
  if (low.includes('exit') || low.includes('out') || low.includes('ket')) return t('exited', 'Chiqdi')
  return t('entered', 'Kirdi')
}
</script>

<template>
  <div class="min-h-screen bg-[#f8fafc] pb-10">

    <!-- ── Header ──────────────────────────────────────────────── -->
    <header class="flex justify-between items-start px-6 py-4 border-b bg-white sticky top-0 z-10">
      <div>
        <h1 class="text-[20px] font-bold text-[#1b1b1b]">{{ t('dashboard.statistics', 'Статистика') }}</h1>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-sm text-gray-500 bg-gray-100 rounded-lg px-3 py-1.5 font-medium">📅 {{ todayLabel }}</span>
        <button @click="refetchAll()" class="flex items-center gap-1.5 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 cursor-pointer transition">
          <RefreshCwIcon class="w-4 h-4" />
          {{ t('refresh', 'Yangilash') }}
        </button>
      </div>
    </header>

    <div class="px-6 pt-5 space-y-5">

      <!-- ── Filter Bar ───────────────────────────────────────── -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
        <div class="flex flex-wrap items-end gap-4">

          <!-- Region -->
          <div v-if="!hideRegionFilter" class="flex flex-col gap-1">
            <label class="text-xs font-medium text-gray-500">{{ t('region', 'Область') }}</label>
            <select v-model="filterRegionId" class="h-9 px-3 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:border-[#ff792d] bg-white min-w-[150px]">
              <option :value="undefined">{{ t('all', 'Все') }}</option>
              <option v-for="r in (regionsRaw || [])" :key="r.id" :value="r.id">{{ r.name }}</option>
            </select>
          </div>

          <!-- City -->
          <div v-if="!hideCityFilter && filterRegionId" class="flex flex-col gap-1">
            <label class="text-xs font-medium text-gray-500">{{ t('district', 'Район') }}</label>
            <select v-model="filterCityId" class="h-9 px-3 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:border-[#ff792d] bg-white min-w-[150px]">
              <option :value="undefined">{{ t('all', 'Все') }}</option>
              <option v-for="c in cities" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>

          <!-- School -->
          <div v-if="!hideSchoolFilter && filterCityId" class="flex flex-col gap-1">
            <label class="text-xs font-medium text-gray-500">{{ t('school', 'Школа') }}</label>
            <select v-model="filterSchoolId" class="h-9 px-3 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:border-[#ff792d] bg-white min-w-[160px]">
              <option :value="undefined">{{ t('all', 'Все') }}</option>
              <option v-for="sc in (schoolsRaw || [])" :key="sc.id" :value="sc.id">{{ sc.name }}</option>
            </select>
          </div>

          <!-- Date Range -->
          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-gray-500 flex items-center gap-1">
              <CalendarIcon class="w-3 h-3" />
              {{ t('date_range', 'Период') }}
            </label>
            <div class="flex items-center gap-2">
              <input type="date" v-model="dateFrom" :max="dateTo"
                class="h-9 px-3 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:border-[#ff792d] bg-white" />
              <span class="text-gray-400 text-sm">—</span>
              <input type="date" v-model="dateTo" :min="dateFrom" :max="today"
                class="h-9 px-3 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:border-[#ff792d] bg-white" />
              <button v-if="!isToday" @click="resetDateRange" title="Reset" class="h-9 w-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition">
                <XIcon class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Quick date buttons -->
          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-gray-500 invisible">-</label>
            <div class="flex gap-1.5">
              <button v-for="q in [
                { label: t('today', 'Сегодня'), from: today, to: today },
                { label: '7 ' + t('days', 'дн'), from: daysAgo(6), to: today },
                { label: '30 ' + t('days', 'дн'), from: daysAgo(29), to: today },
              ]"
                :key="q.label" @click="dateFrom = q.from; dateTo = q.to"
                :class="['h-9 px-3 text-xs rounded-lg border transition', dateFrom === q.from && dateTo === q.to ? 'bg-[#ff792d] text-white border-[#ff792d] font-semibold' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50']">
                {{ q.label }}
              </button>
            </div>
          </div>

        </div>
      </div>

      <!-- ── Top 4 cards ─────────────────────────────────────── -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="card in topCards" :key="card.key" class="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 shadow-sm hover:shadow transition">
          <div :class="[card.bg, 'p-3 rounded-xl shrink-0']">
            <component :is="card.icon" :class="[card.color, 'w-6 h-6']" />
          </div>
          <div class="min-w-0">
            <p class="text-2xl font-bold text-gray-900">{{ card.value.toLocaleString() }}</p>
            <p class="text-xs text-gray-500 truncate">{{ card.label }}</p>
            <p v-if="card.sub" class="text-xs font-medium" :class="card.color">{{ card.sub }}</p>
          </div>
        </div>
      </div>

      <!-- ── Attendance cards ────────────────────────────────── -->
      <div>
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">{{ t('davomad', 'Посещаемость') }}</p>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="card in attendanceCards" :key="card.label" :class="['bg-white rounded-2xl border p-4 shadow-sm', card.border]">
            <p class="text-xs text-gray-500 font-medium mb-2 leading-tight">{{ card.label }}</p>
            <p class="text-3xl font-bold text-gray-900">{{ card.value.toLocaleString() }}</p>
            <div class="mt-3">
              <div class="flex justify-between text-xs text-gray-400 mb-1">
                <span>{{ pct(card.value, card.total) }}%</span>
                <span>/ {{ card.total.toLocaleString() }}</span>
              </div>
              <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all duration-700" :style="{ width: pct(card.value, card.total) + '%', background: card.color }" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Live Monitoring + Camera ───────────────────────── -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">

        <!-- Live monitoring -->
        <div class="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <div class="flex items-center gap-2">
              <div class="relative flex h-2.5 w-2.5">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </div>
              <h3 class="text-sm font-semibold text-gray-700">{{ t('live-monitoring', 'Live мониторинг') }}</h3>
              <span class="text-xs text-gray-400">({{ t('last-5', 'последние 5') }})</span>
            </div>
            <button @click="fetchLiveEvents" class="text-xs text-[#ff792d] hover:underline flex items-center gap-1">
              <RefreshCwIcon class="w-3 h-3" :class="{ 'animate-spin': liveLoading }" />
              {{ t('refresh', 'Yangilash') }}
            </button>
          </div>

          <div v-if="!liveEvents.length" class="flex flex-col items-center justify-center py-10 text-gray-400">
            <ActivityIcon class="w-8 h-8 mb-2 opacity-40" />
            <p class="text-sm">{{ t('no-live-events', 'Bugun hodisalar yo\'q') }}</p>
          </div>

          <div v-else class="divide-y divide-gray-50">
            <div v-for="(ev, i) in liveEvents" :key="i" class="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition">
              <!-- Photo -->
              <div class="shrink-0 w-10 h-10 rounded-full overflow-hidden bg-gray-100 ring-2 ring-white shadow">
                <img v-if="ev.photoUrl || ev.image || ev.faceImage || ev.photo"
                  :src="ev.photoUrl || ev.image || ev.faceImage || ev.photo"
                  class="w-full h-full object-cover"
                  :alt="ev.firstName || ev.fullName || 'face'"
                  @error="($event.target as HTMLImageElement).style.display='none'" />
                <div v-else class="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500 bg-gray-200">
                  {{ (ev.firstName?.[0] || ev.fullName?.[0] || '?').toUpperCase() }}
                </div>
              </div>
              <!-- Info -->
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-gray-800 truncate">
                  {{ ev.lastName }} {{ ev.firstName || ev.fullName || ev.name || t('unknown', 'Noma\'lum') }}
                </p>
                <p class="text-xs text-gray-400 truncate">
                  {{ ev.schoolName || ev.school || '' }}{{ ev.className ? ' • ' + ev.className : '' }}
                </p>
              </div>
              <!-- Time + status -->
              <div class="shrink-0 text-right">
                <p class="text-sm font-semibold text-gray-700">{{ formatTime(ev.attendanceTime || ev.comingTime || ev.date) }}</p>
                <span :class="['text-xs px-2 py-0.5 rounded-full font-medium', liveStatusColor(ev.type || ev.status)]">
                  {{ liveStatusLabel(ev.type || ev.status) }}
                </span>
              </div>
            </div>
          </div>

          <div class="px-5 py-3 border-t border-gray-50 text-xs text-gray-400 text-center">
            {{ t('auto-refresh-30s', 'Avtomatik yangilash: 30 soniya') }}
          </div>
        </div>

        <!-- Camera donut -->
        <div class="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 class="text-sm font-semibold text-gray-700 mb-4">{{ t('cameras', 'Камеры') }}</h3>
          <div v-if="camTotal === 0" class="h-48 flex items-center justify-center text-gray-400 text-sm">{{ t('no-data', 'Нет данных') }}</div>
          <div v-else>
            <VueApexCharts type="donut" height="160" :options="cameraDonutOptions" :series="cameraDonutSeries" />
            <div class="space-y-2 mt-4">
              <div class="flex justify-between text-sm">
                <span class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-green-500 inline-block"></span>Online</span>
                <span class="font-semibold">{{ camOnline }} ({{ pct(camOnline, camTotal) }}%)</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-red-500 inline-block"></span>Offline</span>
                <span class="font-semibold">{{ camOffline }} ({{ pct(camOffline, camTotal) }}%)</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>{{ t('error', 'Xato') }}</span>
                <span class="font-semibold">{{ camError }} ({{ pct(camError, camTotal) }}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── School attendance chart + Class breakdown ──────── -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">

        <!-- School bar chart -->
        <div class="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-semibold text-gray-700">{{ t('schools-attendance', 'Maktablar bo\'yicha davomad (%)') }}</h3>
            <span class="text-xs text-gray-400">{{ t('click-school', 'Maktabni bosing → sinflar') }}</span>
          </div>
          <div v-if="!schoolDetailsRaw?.length" class="h-52 flex items-center justify-center text-gray-400 text-sm">{{ t('no-data', 'Нет данных') }}</div>
          <VueApexCharts v-else type="bar" height="240" :options="schoolBarOptions" :series="schoolBarSeries" />
        </div>

        <!-- Class breakdown for selected school -->
        <div class="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-sm font-semibold text-gray-700">
                {{ t('classes-attendance', 'Sinflar bo\'yicha davomad') }}
              </h3>
              <p v-if="selectedSchoolName" class="text-xs text-[#ff792d] font-medium mt-0.5 flex items-center gap-1">
                <ChevronRightIcon class="w-3 h-3" />
                {{ selectedSchoolName }}
              </p>
            </div>
            <button v-if="selectedSchoolId" @click="selectedSchoolId = undefined; selectedSchoolName = ''" class="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
              <XIcon class="w-3 h-3" />
              {{ t('reset', 'Bekor') }}
            </button>
          </div>

          <div v-if="!selectedSchoolId" class="h-52 flex flex-col items-center justify-center text-gray-400 gap-2">
            <SchoolIcon class="w-8 h-8 opacity-30" />
            <p class="text-sm text-center">{{ t('select-school-hint', 'Chapdan maktabni bosing') }}</p>
          </div>
          <div v-else-if="!classAttendanceRaw?.length" class="h-52 flex items-center justify-center text-gray-400 text-sm">{{ t('no-data', 'Нет данных') }}</div>
          <VueApexCharts v-else type="bar" height="240" :options="classBarOptions" :series="classBarSeries" />
        </div>
      </div>

      <!-- ── Weekly performance line ────────────────────────── -->
      <div class="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 class="text-sm font-semibold text-gray-700 mb-4">{{ t('dashboard.weekly-stats', 'Статистика школ по неделям') }}</h3>
        <div v-if="!weeklyLineSeries[0]?.data?.length" class="h-40 flex items-center justify-center text-gray-400 text-sm">{{ t('no-data', 'Нет данных') }}</div>
        <VueApexCharts v-else type="line" height="200" :options="weeklyLineOptions" :series="weeklyLineSeries" />
      </div>

      <!-- ── School details table ───────────────────────────── -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-50">
          <h3 class="text-sm font-semibold text-gray-700">{{ t('dashboard.school-details.school-table-title', 'Подробная статистика по школам') }}</h3>
        </div>
        <div v-if="!schoolDetailsRaw?.length" class="h-16 flex items-center justify-center text-gray-400 text-sm">{{ t('no-data') }}</div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50">
                <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{{ t('school', 'Школа') }}</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">{{ t('dashboard.overall.students', 'Ученики') }}</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">{{ t('attended', 'Келган') }}</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">{{ t('not-attended', 'Келмаган') }}</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">%</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="row in schoolDetailsRaw" :key="row.id ?? row.schoolId"
                class="hover:bg-gray-50 transition cursor-pointer"
                @click="selectedSchoolId = row.id ?? row.schoolId; selectedSchoolName = row.name ?? row.schoolName ?? ''">
                <td class="px-5 py-3 font-medium text-gray-800 max-w-[220px] truncate">{{ row.name ?? row.schoolName }}</td>
                <td class="px-4 py-3 text-right text-gray-600">{{ row.totalStudents ?? row.allStudentsCount }}</td>
                <td class="px-4 py-3 text-right text-green-600 font-medium">{{ row.attendedStudentsCount ?? (row.totalStudents - row.absentsCount) }}</td>
                <td class="px-4 py-3 text-right text-red-500 font-medium">{{ row.notAttendedStudentsCount ?? row.absentsCount }}</td>
                <td class="px-4 py-3 text-right">
                  <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold"
                    :class="parseFloat(row.percentage ?? row.attendedPercentage ?? '0') >= 80 ? 'bg-green-100 text-green-700' : parseFloat(row.percentage ?? row.attendedPercentage ?? '0') >= 50 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'">
                    {{ row.percentage ?? row.attendedPercentage }}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ── Kech qolganlar ─────────────────────────────────── -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-50 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <ClockIcon class="w-4 h-4 text-amber-500" />
            <h3 class="text-sm font-semibold text-gray-700">{{ t('late-students', 'Опоздавшие ученики') }}</h3>
          </div>
          <div class="flex items-center gap-2">
            <input type="date" v-model="lateFrom" :max="lateTo" class="h-8 px-2 rounded-lg border border-gray-200 text-xs text-gray-600 focus:outline-none focus:border-[#ff792d]" />
            <span class="text-gray-400 text-xs">—</span>
            <input type="date" v-model="lateTo" :min="lateFrom" :max="today" class="h-8 px-2 rounded-lg border border-gray-200 text-xs text-gray-600 focus:outline-none focus:border-[#ff792d]" />
          </div>
        </div>
        <div v-if="!lateStudentsRaw?.length" class="h-16 flex items-center justify-center text-gray-400 text-sm">{{ t('no-late-students', 'Opozganlar topilmadi') }}</div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50">
                <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{{ t('student', 'Ученик') }}</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{{ t('sinf', 'Класс') }}</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{{ t('school', 'Школа') }}</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">{{ t('late-count', 'Опозданий') }}</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{{ t('late-times', 'Время') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="st in lateStudentsRaw" :key="st.studentId" class="hover:bg-gray-50 transition">
                <td class="px-5 py-3">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-600 shrink-0">
                      {{ (st.firstName?.[0] || '').toUpperCase() + (st.lastName?.[0] || '').toUpperCase() }}
                    </div>
                    <span class="font-medium text-gray-800">{{ st.lastName }} {{ st.firstName }}</span>
                  </div>
                </td>
                <td class="px-4 py-3 text-gray-600">{{ st.className }}</td>
                <td class="px-4 py-3 text-gray-500 text-xs max-w-[160px] truncate">{{ st.schoolName }}</td>
                <td class="px-4 py-3 text-right">
                  <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                    {{ st.lateCount }}x
                  </span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex flex-wrap gap-1">
                    <span v-for="entry in st.lateEntries?.slice(0, 3)" :key="entry.date"
                      class="text-xs bg-gray-100 text-gray-600 rounded px-1.5 py-0.5">
                      {{ formatTime(entry.comingTime) }}
                      <span class="text-red-400">+{{ entry.lateMinutes }}{{ t('min', 'мин') }}</span>
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ── Absent students ────────────────────────────────── -->
      <div v-if="absentsRaw?.length" class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-50">
          <h3 class="text-sm font-semibold text-gray-700">{{ t('dashboard.absents.title', 'Отсутствующие') }}</h3>
        </div>
        <div class="divide-y divide-gray-50">
          <div v-for="st in absentsRaw" :key="st.id" class="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition">
            <div class="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-xs font-bold text-red-600 shrink-0">
              {{ ((st.firstName || st.studentName || '?')[0] || '').toUpperCase() }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-800 truncate">{{ st.lastName }} {{ st.firstName || st.studentName }}</p>
              <p class="text-xs text-gray-400 truncate">{{ st.schoolName || st.school }} • {{ st.className || st.class }}</p>
            </div>
            <span class="text-xs text-red-500 font-medium bg-red-50 px-2 py-0.5 rounded-full">{{ t('not-attended', 'Отсутствовал') }}</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
