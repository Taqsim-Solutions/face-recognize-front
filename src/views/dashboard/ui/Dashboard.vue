<script setup lang="ts">
import UserContextBadges from '@/components/UserContextBadges.vue'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuery } from '@tanstack/vue-query'
import { useCurrentUser } from '@/composables/useCurrentUser'
import VueApexCharts from 'vue3-apexcharts'
import { Users2Icon, UserIcon, SchoolIcon, CameraIcon, RefreshCwIcon, ClockIcon } from 'lucide-vue-next'
import {
  fetchSchoolsNumber, fetchWeeklyPerformance,
  fetchMonthlyOverview, fetchSchoolDetails, fetchAbsents,
  fetchLateStudents
} from '../api'
import { fetchTodayStats } from '../api/todayStats'

const { t, locale } = useI18n()
const { } = useCurrentUser()

// Late students date range
const lateFrom = ref(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
const lateTo = ref(new Date().toISOString().split('T')[0])
const latePageSize = ref(10)

// ── Queries ──────────────────────────────────────────────────────
const { data: todayRaw, refetch: refetchToday } = useQuery({
  queryKey: ['today-stats'],
  queryFn: () => fetchTodayStats({}),
  select: (r: any) => r?.data?.result
})
const { data: schoolsNumberRaw, refetch: refetchSN } = useQuery({
  queryKey: ['schools-number-dash'],
  queryFn: () => fetchSchoolsNumber({ fromDate: new Date().toISOString(), toDate: new Date().toISOString() }),
  select: (r: any) => r?.data?.result
})
const { data: performanceRaw, refetch: refetchPerf } = useQuery({
  queryKey: ['weekly-perf-dash'],
  queryFn: () => fetchWeeklyPerformance({}),
  select: (r: any) => r?.data?.result
})
const { data: overviewRaw, refetch: refetchOverview } = useQuery({
  queryKey: ['monthly-overview-dash'],
  queryFn: () => fetchMonthlyOverview({}),
  select: (r: any) => r?.data?.result
})
const { data: schoolDetailsRaw, refetch: refetchDetails } = useQuery({
  queryKey: ['school-details-dash'],
  queryFn: () => fetchSchoolDetails({ PageIndex: 1 }),
  select: (r: any) => r?.data?.result?.data || []
})
const { data: absentsRaw, refetch: refetchAbsents } = useQuery({
  queryKey: ['absents-today-dash'],
  queryFn: () => fetchAbsents({ DateFrom: new Date().toISOString(), DateTo: new Date().toISOString() }),
  select: (r: any) => r?.data?.result?.data || []
})

const { data: lateStudentsRaw, refetch: refetchLate } = useQuery({
  queryKey: ['late-students-dash', lateFrom, lateTo],
  queryFn: () => fetchLateStudents({ dateFrom: lateFrom.value, dateTo: lateTo.value, pageSize: latePageSize.value }),
  select: (r: any) => r?.data?.result?.data || []
})

const refetchAll = () => {
  refetchToday(); refetchSN(); refetchPerf();
  refetchOverview(); refetchDetails(); refetchAbsents(); refetchLate()
}

// ── Computed ─────────────────────────────────────────────────────
const s = computed(() => todayRaw.value || {})
const sn = computed(() => schoolsNumberRaw.value || {})

const topCards = computed(() => [
  { label: t('students', "O'quvchilar"), icon: Users2Icon, value: s.value.totalStudents ?? 0, color: 'text-blue-500', bg: 'bg-blue-50' },
  { label: t('teachers', "O'qituvchilar"), icon: UserIcon, value: s.value.totalTeachers ?? 0, color: 'text-green-500', bg: 'bg-green-50' },
  { label: t('schools', 'Maktablar'), icon: SchoolIcon, value: s.value.totalSchools ?? sn.value.allSchoolsNumber ?? 0, sub: `${sn.value.connectedSchoolsNumber ?? 0} ulangan`, color: 'text-orange-500', bg: 'bg-orange-50' },
  { label: t('cameras', 'Kameralar'), icon: CameraIcon, value: s.value.totalCameras ?? 0, sub: `${s.value.onlineCameras ?? 0} online`, color: 'text-purple-500', bg: 'bg-purple-50' }
])

const attendanceCards = computed(() => [
  { label: "Kelgan o'quvchilar", value: s.value.presentStudents ?? 0, total: s.value.totalStudents || 1, color: '#22c55e', bg: 'bg-green-50 border-green-100' },
  { label: "Kelmagan o'quvchilar", value: s.value.absentStudents ?? 0, total: s.value.totalStudents || 1, color: '#ef4444', bg: 'bg-red-50 border-red-100' },
  { label: "Kelgan o'qituvchilar", value: s.value.presentTeachers ?? 0, total: s.value.totalTeachers || 1, color: '#3b82f6', bg: 'bg-blue-50 border-blue-100' },
  { label: "Kelmagan o'qituvchilar", value: s.value.absentTeachers ?? 0, total: s.value.totalTeachers || 1, color: '#f59e0b', bg: 'bg-orange-50 border-orange-100' }
])

const pct = (v: number, t: number) => t > 0 ? Math.round(v * 100 / t) : 0

// Bar chart — schools
const schoolBarOptions = computed(() => ({
  chart: { type: 'bar' as const, toolbar: { show: false }, fontFamily: 'inherit' },
  plotOptions: { bar: { borderRadius: 6, columnWidth: '55%' } },
  dataLabels: { enabled: false },
  colors: ['#ff792d'],
  xaxis: { categories: (overviewRaw.value?.overview || []).map((s: any) => s.name?.length > 12 ? s.name.slice(0, 12) + '…' : s.name), labels: { style: { fontSize: '11px', colors: '#9ca3af' } } },
  yaxis: { max: 100, labels: { formatter: (v: number) => v + '%', style: { fontSize: '11px', colors: '#9ca3af' } } },
  grid: { borderColor: '#f0f0f0', strokeDashArray: 4 },
  tooltip: { y: { formatter: (v: number) => v + '%' } }
}))
const schoolBarSeries = computed(() => [{
  name: t('attended', 'Kelgan'),
  data: (overviewRaw.value?.overview || []).map((s: any) => parseFloat(s.percentage) || 0)
}])

// Camera donut
const camTotal = computed(() => s.value.totalCameras || 0)
const camOnline = computed(() => s.value.onlineCameras ?? camTotal.value)
const camOffline = computed(() => s.value.offlineCameras || 0)
const camError = computed(() => s.value.errorCameras || 0)

const cameraDonutOptions = computed(() => ({
  chart: { type: 'donut' as const, fontFamily: 'inherit' },
  labels: ['Online', 'Offline', 'Xato'],
  colors: ['#22c55e', '#ef4444', '#f59e0b'],
  plotOptions: { pie: { donut: { size: '65%', labels: { show: true, total: { show: true, label: "Jami", formatter: () => String(camTotal.value) } } } } },
  dataLabels: { enabled: false },
  legend: { show: false },
  stroke: { width: 0 }
}))
const cameraDonutSeries = computed(() => [camOnline.value || 0, camOffline.value || 0, camError.value || 0])

// Line chart — weekly
const dayNames = computed(() => {
  const m: Record<string, string[]> = {
    uz: ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'],
    ru: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
    en: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
  }
  return m[locale.value] || m.uz
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

// Today label
const todayLabel = computed(() => {
  const now = new Date()
  const months: Record<string, string[]> = {
    uz: ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'],
    ru: ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
    en: ['January','February','March','April','May','June','July','August','September','October','November','December']
  }
  const m = months[locale.value] || months.uz
  return `${now.getDate()} ${m[now.getMonth()]}, ${now.getFullYear()}`
})
</script>

<template>
  <div class="min-h-screen bg-[#f8fafc] pb-8">
    <!-- Header -->
    <header class="flex justify-between items-start px-6 py-4 border-b bg-white">
      <div>
        <h1 class="text-[20px] font-bold text-[#1b1b1b]">{{ t('dashboard.statistics', 'Statistika') }}</h1>
        <UserContextBadges />
      </div>
      <div class="flex items-center gap-3">
        <span class="text-sm text-gray-500 bg-gray-100 rounded-lg px-3 py-1.5 font-medium">📅 {{ todayLabel }}</span>
        <button @click="refetchAll()" class="flex items-center gap-1.5 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 cursor-pointer transition">
          <RefreshCwIcon class="w-4 h-4" />
          Yangilash
        </button>
      </div>
    </header>

    <div class="px-6 pt-5 space-y-5">

      <!-- Top 4 cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="card in topCards" :key="card.label" class="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 shadow-sm hover:shadow transition">
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

      <!-- Today attendance 4 cards -->
      <div>
        <h2 class="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">{{ t('davomad', 'Bugungi davomad') }}</h2>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="card in attendanceCards" :key="card.label" :class="['bg-white rounded-2xl border p-4 shadow-sm', card.bg]">
            <p class="text-xs text-gray-500 font-medium mb-2 leading-tight">{{ card.label }}</p>
            <p class="text-3xl font-bold text-gray-900">{{ card.value.toLocaleString() }}</p>
            <div class="mt-3">
              <div class="flex justify-between text-xs text-gray-400 mb-1">
                <span>{{ pct(card.value, card.total) }}%</span>
                <span>/ {{ card.total.toLocaleString() }}</span>
              </div>
              <div class="h-1.5 bg-white/60 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all duration-500" :style="{ width: pct(card.value, card.total) + '%', background: card.color }" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <!-- School bar -->
        <div class="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 class="text-sm font-semibold text-gray-700 mb-4">Maktablar bo'yicha davomad (%)</h3>
          <div v-if="!overviewRaw?.overview?.length" class="h-48 flex items-center justify-center text-gray-400 text-sm">{{ t('no-data') }}</div>
          <VueApexCharts v-else type="bar" height="220" :options="schoolBarOptions" :series="schoolBarSeries" />
        </div>
        <!-- Camera donut -->
        <div class="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 class="text-sm font-semibold text-gray-700 mb-4">{{ t('cameras', 'Kamera holati') }}</h3>
          <div v-if="camTotal === 0" class="h-48 flex items-center justify-center text-gray-400 text-sm">{{ t('no-data') }}</div>
          <div v-else>
            <VueApexCharts type="donut" height="160" :options="cameraDonutOptions" :series="cameraDonutSeries" />
            <div class="space-y-2 mt-3">
              <div class="flex justify-between text-sm">
                <span class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-green-500 inline-block"></span>Online</span>
                <span class="font-semibold">{{ camOnline }} ({{ pct(camOnline, camTotal) }}%)</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-red-500 inline-block"></span>Offline</span>
                <span class="font-semibold">{{ camOffline }} ({{ pct(camOffline, camTotal) }}%)</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>Xato</span>
                <span class="font-semibold">{{ camError }} ({{ pct(camError, camTotal) }}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Weekly line chart -->
      <div class="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 class="text-sm font-semibold text-gray-700 mb-4">{{ t('dashboard.weekly-stats', 'Haftalik davomad') }}</h3>
        <div v-if="!weeklyLineSeries[0]?.data?.length" class="h-48 flex items-center justify-center text-gray-400 text-sm">{{ t('no-data') }}</div>
        <VueApexCharts v-else type="line" height="200" :options="weeklyLineOptions" :series="weeklyLineSeries" />
      </div>

      <!-- School details table -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-50">
          <h3 class="text-sm font-semibold text-gray-700">{{ t('dashboard.school-details.school-table-title', 'Maktablar batafsil') }}</h3>
        </div>
        <div v-if="!schoolDetailsRaw?.length" class="h-16 flex items-center justify-center text-gray-400 text-sm">{{ t('no-data') }}</div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50">
                <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{{ t('school') }}</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">{{ t('dashboard.overall.students') }}</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">{{ t('attended', 'Kelgan') }}</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">{{ t('not-attended', 'Kelmagan') }}</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">%</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="row in schoolDetailsRaw" :key="row.schoolId" class="hover:bg-gray-50 transition">
                <td class="px-5 py-3 font-medium text-gray-800 max-w-[200px] truncate">{{ row.schoolName }}</td>
                <td class="px-4 py-3 text-right text-gray-600">{{ row.allStudentsCount }}</td>
                <td class="px-4 py-3 text-right text-green-600 font-medium">{{ row.attendedStudentsCount }}</td>
                <td class="px-4 py-3 text-right text-red-500 font-medium">{{ row.notAttendedStudentsCount }}</td>
                <td class="px-4 py-3 text-right">
                  <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold"
                    :class="parseFloat(row.attendedPercentage) >= 80 ? 'bg-green-100 text-green-700' : parseFloat(row.attendedPercentage) >= 50 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'">
                    {{ row.attendedPercentage }}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Kech qolgan o'quvchilar -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-50 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <ClockIcon class="w-4 h-4 text-amber-500" />
            <h3 class="text-sm font-semibold text-gray-700">Kech qolgan o'quvchilar</h3>
          </div>
          <!-- Date range filter -->
          <div class="flex items-center gap-2 text-sm">
            <input
              type="date"
              v-model="lateFrom"
              class="h-8 px-2 rounded-lg border border-gray-200 text-gray-600 text-xs focus:outline-none focus:border-[#ff792d]"
            />
            <span class="text-gray-400">—</span>
            <input
              type="date"
              v-model="lateTo"
              class="h-8 px-2 rounded-lg border border-gray-200 text-gray-600 text-xs focus:outline-none focus:border-[#ff792d]"
            />
          </div>
        </div>

        <div v-if="!lateStudentsRaw?.length" class="h-20 flex items-center justify-center text-gray-400 text-sm">
          {{ t('no-data', 'Kech qolganlar topilmadi') }}
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50">
                <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">O'quvchi</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Sinf</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Maktab</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Kech qolish soni</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">So'nggi kelish vaqtlari</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="st in lateStudentsRaw" :key="st.studentId" class="hover:bg-gray-50 transition">
                <td class="px-5 py-3">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-600 shrink-0">
                      {{ (st.firstName?.[0] || '') + (st.lastName?.[0] || '') }}
                    </div>
                    <span class="font-medium text-gray-800">{{ st.lastName }} {{ st.firstName }}</span>
                  </div>
                </td>
                <td class="px-4 py-3 text-gray-600">{{ st.className }}</td>
                <td class="px-4 py-3 text-gray-500 text-xs max-w-[160px] truncate">{{ st.schoolName }}</td>
                <td class="px-4 py-3 text-right">
                  <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                    {{ st.lateCount }} marta
                  </span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="entry in st.lateEntries?.slice(0, 3)"
                      :key="entry.date"
                      class="text-xs bg-gray-100 text-gray-600 rounded px-1.5 py-0.5"
                    >
                      {{ new Date(entry.comingTime).toLocaleTimeString('uz', { hour: '2-digit', minute: '2-digit' }) }}
                      <span class="text-red-400">+{{ entry.lateMinutes }}min</span>
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Absent students today -->
      <div v-if="absentsRaw?.length > 0" class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-50">
          <h3 class="text-sm font-semibold text-gray-700">Bugun kelmagan o'quvchilar</h3>
        </div>
        <div class="divide-y divide-gray-50">
          <div v-for="st in absentsRaw" :key="st.id" class="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition">
            <div class="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-600 shrink-0">
              {{ (st.firstName?.[0] || '') + (st.lastName?.[0] || '') }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-800 truncate">{{ st.lastName }} {{ st.firstName }}</p>
              <p class="text-xs text-gray-400 truncate">{{ st.schoolName }} • {{ st.className }}</p>
            </div>
            <span class="text-xs text-red-500 font-medium">Kelmagan</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
