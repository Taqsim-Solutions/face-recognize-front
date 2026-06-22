<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuery } from '@tanstack/vue-query'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import SearchSelect from '@/components/ui/SearchSelect.vue'
import { Button } from '@/components/ui/button'
import { Loader2Icon, ChevronDownIcon, ChevronRightIcon } from 'lucide-vue-next'
import { fetchClassesBySchool, fetchRegions, fetchSchoolsByCity } from '@/views/students/list/api'
import { fetchClassMonthlyReport, type MonthlyReport } from '../api'

const { t } = useI18n()

const now = new Date()
const regionId = ref('')
const cityId = ref('')
const schoolId = ref('')
const classId = ref('')
const year = ref(String(now.getFullYear()))
const month = ref(String(now.getMonth() + 1))

const months = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
]
const years = computed(() => {
  const y = now.getFullYear()
  return [y, y - 1, y - 2]
})

const { data: regionsRaw } = useQuery({
  queryKey: ['rep-regions'],
  queryFn: async () => {
    const res = await fetchRegions()
    return (res as any)?.data?.result || (res as any)?.result || []
  }
})
const regions = computed<any[]>(() => regionsRaw.value || [])
const cities = computed<any[]>(() => {
  const r = regions.value.find((x) => String(x.id) === regionId.value)
  return r?.cities || r?.districts || []
})
const { data: schoolsRaw } = useQuery({
  queryKey: ['rep-schools', cityId],
  queryFn: async () => {
    if (!cityId.value) return []
    const res = await fetchSchoolsByCity(Number(cityId.value))
    return (res as any)?.data?.result?.data || (res as any)?.result?.data
      || (res as any)?.data?.result || (res as any)?.result || []
  },
  enabled: computed(() => !!cityId.value)
})
const schools = computed<any[]>(() => schoolsRaw.value || [])
const { data: classesRaw } = useQuery({
  queryKey: ['rep-classes', schoolId],
  queryFn: async () => {
    if (!schoolId.value) return []
    const res = await fetchClassesBySchool(Number(schoolId.value))
    return (res as any)?.data?.result?.data || (res as any)?.data?.result
      || (res as any)?.result?.data || (res as any)?.result || []
  },
  enabled: computed(() => !!schoolId.value)
})
const classes = computed<any[]>(() => classesRaw.value || [])

function onRegion() { cityId.value = ''; schoolId.value = ''; classId.value = '' }
function onCity() { schoolId.value = ''; classId.value = '' }
function onSchool() { classId.value = '' }

const classLabel = (c: any) => c.name || `${c.degree}-${c.symbol}`

// Report query (manual trigger via enabled on classId+year+month)
const { data: reportRaw, isFetching, refetch } = useQuery({
  queryKey: ['monthly-report', classId, year, month],
  queryFn: async () => {
    if (!classId.value) return []
    const res = await fetchClassMonthlyReport(Number(classId.value), Number(year.value), Number(month.value))
    return (res as any)?.data?.result || (res as any)?.result || []
  },
  enabled: computed(() => !!classId.value)
})
const allReports = computed<MonthlyReport[]>(() => reportRaw.value || [])
const studentSearch = ref('')
const reports = computed<MonthlyReport[]>(() => {
  const q = studentSearch.value.trim().toLowerCase()
  if (!q) return allReports.value
  return allReports.value.filter((r) => (r.studentName || '').toLowerCase().includes(q))
})

const expanded = ref<Record<number, boolean>>({})
const toggle = (id: number) => { expanded.value[id] = !expanded.value[id] }

const statusLabel = (s: string) =>
  s === 'present' ? t('present', 'Keldi')
  : s === 'late' ? t('late', 'Kech')
  : s === 'excused' ? t('excused', 'Sababli')
  : s === 'restday' ? t('restday', 'Dam')
  : t('absent', 'Kelmadi')

const statusDot = (s: string) =>
  s === 'present' ? 'bg-green-500'
  : s === 'late' ? 'bg-amber-500'
  : s === 'excused' ? 'bg-blue-500'
  : s === 'restday' ? 'bg-gray-300'
  : 'bg-red-500'

const percentColor = (p: number) =>
  p >= 90 ? 'text-green-600' : p >= 75 ? 'text-amber-600' : 'text-red-500'

const fmtDay = (d: string) => String(d).slice(8, 10) + '.' + String(d).slice(5, 7)
</script>

<template>
  <div class="w-full px-4 sm:px-6 py-5">
    <div class="mb-5">
      <h1 class="text-xl font-bold text-gray-800">{{ t('monthly-report', 'Oylik hisobot') }}</h1>
      <p class="text-xs text-gray-400 mt-0.5">{{ t('monthly-report-hint', 'Sinf bo\'yicha oylik davomat statistikasi') }}</p>
    </div>

    <!-- Filters -->
    <div class="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm mb-5">
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-3">
        <Select v-model="regionId" @update:modelValue="onRegion">
          <SelectTrigger class="h-11 bg-gray-50 border rounded-lg"><SelectValue :placeholder="t('region', 'Viloyat')" /></SelectTrigger>
          <SelectContent><SelectItem v-for="r in regions" :key="r.id" :value="String(r.id)">{{ r.name }}</SelectItem></SelectContent>
        </Select>
        <Select v-model="cityId" :disabled="!regionId" @update:modelValue="onCity">
          <SelectTrigger class="h-11 bg-gray-50 border rounded-lg"><SelectValue :placeholder="t('city', 'Tuman')" /></SelectTrigger>
          <SelectContent><SelectItem v-for="c in cities" :key="c.id" :value="String(c.id)">{{ c.name }}</SelectItem></SelectContent>
        </Select>
        <Select v-model="schoolId" :disabled="!cityId" @update:modelValue="onSchool">
          <SelectTrigger class="h-11 bg-gray-50 border rounded-lg"><SelectValue :placeholder="t('school', 'Maktab')" /></SelectTrigger>
          <SelectContent><SelectItem v-for="s in schools" :key="s.id" :value="String(s.id)">{{ s.name }}</SelectItem></SelectContent>
        </Select>
        <SearchSelect
          v-model="classId"
          :options="classes.map((c) => ({ value: String(c.id), label: classLabel(c) }))"
          :disabled="!schoolId"
          :placeholder="t('sinf', 'Sinf')"
          :search-placeholder="t('search-class', 'Sinf qidirish...')"
          :empty-text="t('no-data', 'Topilmadi')"
        />
      </div>
      <div class="flex items-end gap-3 flex-wrap">
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">{{ t('year', 'Yil') }}</label>
          <Select v-model="year">
            <SelectTrigger class="h-11 w-28 bg-gray-50 border rounded-lg"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem v-for="y in years" :key="y" :value="String(y)">{{ y }}</SelectItem></SelectContent>
          </Select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">{{ t('month', 'Oy') }}</label>
          <Select v-model="month">
            <SelectTrigger class="h-11 w-36 bg-gray-50 border rounded-lg"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem v-for="(m, i) in months" :key="i" :value="String(i + 1)">{{ m }}</SelectItem></SelectContent>
          </Select>
        </div>
        <Button :disabled="!classId || isFetching" @click="refetch()" class="h-11 px-5 bg-[#f27a3a] hover:bg-[#e06c27] text-white rounded-lg">
          <Loader2Icon v-if="isFetching" class="w-4 h-4 mr-1 animate-spin" />{{ t('show', 'Ko\'rsatish') }}
        </Button>
      </div>
    </div>

    <!-- Report table -->
    <div v-if="classId" class="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      <div v-if="allReports.length" class="p-3 border-b border-gray-50">
        <input
          v-model="studentSearch"
          type="text"
          :placeholder="t('search-student', 'O\'quvchi qidirish...')"
          class="w-full sm:w-72 h-10 px-3 bg-gray-50 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#f27a3a]"
        />
      </div>
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-gray-50 text-xs text-gray-500 uppercase">
            <th class="px-4 py-2.5 text-left">{{ t('student', 'O\'quvchi') }}</th>
            <th class="px-3 py-2.5 text-center">✅</th>
            <th class="px-3 py-2.5 text-center">🟡</th>
            <th class="px-3 py-2.5 text-center">🔵</th>
            <th class="px-3 py-2.5 text-center">❌</th>
            <th class="px-4 py-2.5 text-center">{{ t('percent', 'Foiz') }}</th>
            <th class="px-4 py-2.5"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-if="!reports.length && !isFetching">
            <td colspan="7" class="px-4 py-10 text-center text-gray-400">{{ t('no-data', 'Ma\'lumot yo\'q') }}</td>
          </tr>
          <template v-for="r in reports" :key="r.studentId">
            <tr class="hover:bg-gray-50 cursor-pointer" @click="toggle(r.studentId)">
              <td class="px-4 py-2.5 font-medium text-gray-800 flex items-center gap-1">
                <ChevronDownIcon v-if="expanded[r.studentId]" class="w-4 h-4 text-gray-400" />
                <ChevronRightIcon v-else class="w-4 h-4 text-gray-400" />
                {{ r.studentName }}
              </td>
              <td class="px-3 py-2.5 text-center text-green-600 font-medium">{{ r.present }}</td>
              <td class="px-3 py-2.5 text-center text-amber-600 font-medium">{{ r.late }}</td>
              <td class="px-3 py-2.5 text-center text-blue-600 font-medium">{{ r.excused }}</td>
              <td class="px-3 py-2.5 text-center text-red-500 font-medium">{{ r.absent }}</td>
              <td class="px-4 py-2.5 text-center font-bold" :class="percentColor(r.attendancePercent)">{{ r.attendancePercent }}%</td>
              <td class="px-4 py-2.5"></td>
            </tr>
            <tr v-if="expanded[r.studentId]" class="bg-gray-50/50">
              <td colspan="7" class="px-4 py-3">
                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-for="d in r.days.filter((x) => x.status !== 'restday')"
                    :key="d.date"
                    class="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white border text-xs"
                    :title="statusLabel(d.status) + (d.comingTime ? ' · ' + d.comingTime : '')"
                  >
                    <span class="w-1.5 h-1.5 rounded-full" :class="statusDot(d.status)" />
                    {{ fmtDay(d.date) }}
                  </span>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>
