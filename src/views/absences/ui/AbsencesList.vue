<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2Icon, CheckIcon, XIcon, Trash2Icon, PlusIcon } from 'lucide-vue-next'
import { fetchClassesBySchool, fetchStudents } from '@/views/students/list/api'
import { fetchRegions, fetchSchoolsByCity } from '@/views/students/list/api'
import {
  fetchExcusedAbsences, createExcusedAbsence,
  approveExcusedAbsence, rejectExcusedAbsence, deleteExcusedAbsence,
  type ExcusedAbsence
} from '../api'

const { t } = useI18n()
const queryClient = useQueryClient()

const fmtDate = (v: string) => (v ? String(v).slice(0, 10) : '')

// ── Filters: pending toggle + class scope ─────────────────────────
const pendingOnly = ref(false)
const filterClassId = ref('')

const { data: listRaw, isFetching } = useQuery({
  queryKey: ['excused-absences', filterClassId, pendingOnly],
  queryFn: async () => {
    const res = await fetchExcusedAbsences(
      filterClassId.value ? Number(filterClassId.value) : undefined,
      pendingOnly.value
    )
    return (res as any)?.data?.result || (res as any)?.result || []
  }
})
const items = computed<ExcusedAbsence[]>(() => listRaw.value || [])

// ── Add form (region/city/school/class/student) ───────────────────
const showForm = ref(false)
const regionId = ref('')
const cityId = ref('')
const schoolId = ref('')
const classId = ref('')
const studentId = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const reason = ref('1')
const comment = ref('')

const { data: regionsRaw } = useQuery({
  queryKey: ['abs-regions'],
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
  queryKey: ['abs-schools', cityId],
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
  queryKey: ['abs-classes', schoolId],
  queryFn: async () => {
    if (!schoolId.value) return []
    const res = await fetchClassesBySchool(Number(schoolId.value))
    return (res as any)?.data?.result || (res as any)?.result || []
  },
  enabled: computed(() => !!schoolId.value)
})
const classes = computed<any[]>(() => classesRaw.value || [])
const { data: studentsRaw } = useQuery({
  queryKey: ['abs-students', classId],
  queryFn: async () => {
    if (!classId.value) return []
    const res = await fetchStudents({ classId: Number(classId.value), size: 200 } as any)
    return (res as any)?.data?.result?.data || (res as any)?.result?.data
      || (res as any)?.data?.result || (res as any)?.result || []
  },
  enabled: computed(() => !!classId.value)
})
const students = computed<any[]>(() => studentsRaw.value || [])

const classLabel = (c: any) => c.name || `${c.degree}-${c.symbol}`
const studentLabel = (s: any) => `${s.lastName || ''} ${s.firstName || ''}`.trim()

const { mutate: create, isPending: creating } = useMutation({
  mutationFn: async () =>
    createExcusedAbsence({
      studentId: Number(studentId.value),
      dateFrom: dateFrom.value,
      dateTo: dateTo.value || dateFrom.value,
      reason: Number(reason.value),
      comment: comment.value || undefined
    }),
  onSuccess: () => {
    toast.success(t('saved', 'Saqlandi'))
    queryClient.invalidateQueries({ queryKey: ['excused-absences'] })
    showForm.value = false
    studentId.value = ''; dateFrom.value = ''; dateTo.value = ''; comment.value = ''
  },
  onError: () => toast.error(t('error_occurred', 'Xatolik yuz berdi'))
})

const canSubmit = computed(() => studentId.value && dateFrom.value)

const act = async (fn: () => Promise<any>, okMsg: string) => {
  try {
    await fn()
    toast.success(okMsg)
    queryClient.invalidateQueries({ queryKey: ['excused-absences'] })
  } catch {
    toast.error(t('error_occurred', 'Xatolik yuz berdi'))
  }
}

const reasonName = (r: number) => (r === 1 ? t('sick', 'Kasal') : r === 2 ? t('permission', 'Ruxsat') : t('other', 'Boshqa'))
const statusClass = (s: number) =>
  s === 2 ? 'bg-green-50 text-green-600' : s === 3 ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-600'
</script>

<template>
  <div class="w-full px-4 sm:px-6 py-5">
    <div class="flex items-center justify-between mb-5 flex-wrap gap-3">
      <div>
        <h1 class="text-xl font-bold text-gray-800">{{ t('excused-absences', 'Sababli yo\'qliklar') }}</h1>
        <p class="text-xs text-gray-400 mt-0.5">{{ t('excused-absences-hint', 'Kasal yoki ruxsat sababli yo\'qliklar') }}</p>
      </div>
      <Button @click="showForm = !showForm" class="h-10 px-4 bg-[#f27a3a] hover:bg-[#e06c27] text-white rounded-lg">
        <PlusIcon class="w-4 h-4 mr-1" /> {{ t('add', 'Qo\'shish') }}
      </Button>
    </div>

    <!-- Add form -->
    <div v-if="showForm" class="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm mb-5">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
        <Select v-model="regionId">
          <SelectTrigger class="h-11 bg-gray-50 border rounded-lg"><SelectValue :placeholder="t('region', 'Viloyat')" /></SelectTrigger>
          <SelectContent><SelectItem v-for="r in regions" :key="r.id" :value="String(r.id)">{{ r.name }}</SelectItem></SelectContent>
        </Select>
        <Select v-model="cityId" :disabled="!regionId">
          <SelectTrigger class="h-11 bg-gray-50 border rounded-lg"><SelectValue :placeholder="t('city', 'Tuman')" /></SelectTrigger>
          <SelectContent><SelectItem v-for="c in cities" :key="c.id" :value="String(c.id)">{{ c.name }}</SelectItem></SelectContent>
        </Select>
        <Select v-model="schoolId" :disabled="!cityId">
          <SelectTrigger class="h-11 bg-gray-50 border rounded-lg"><SelectValue :placeholder="t('school', 'Maktab')" /></SelectTrigger>
          <SelectContent><SelectItem v-for="s in schools" :key="s.id" :value="String(s.id)">{{ s.name }}</SelectItem></SelectContent>
        </Select>
        <Select v-model="classId" :disabled="!schoolId">
          <SelectTrigger class="h-11 bg-gray-50 border rounded-lg"><SelectValue :placeholder="t('sinf', 'Sinf')" /></SelectTrigger>
          <SelectContent><SelectItem v-for="c in classes" :key="c.id" :value="String(c.id)">{{ classLabel(c) }}</SelectItem></SelectContent>
        </Select>
        <Select v-model="studentId" :disabled="!classId">
          <SelectTrigger class="h-11 bg-gray-50 border rounded-lg"><SelectValue :placeholder="t('student', 'O\'quvchi')" /></SelectTrigger>
          <SelectContent><SelectItem v-for="s in students" :key="s.id" :value="String(s.id)">{{ studentLabel(s) }}</SelectItem></SelectContent>
        </Select>
        <Select v-model="reason">
          <SelectTrigger class="h-11 bg-gray-50 border rounded-lg"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="1">{{ t('sick', 'Kasal') }}</SelectItem>
            <SelectItem value="2">{{ t('permission', 'Ruxsat') }}</SelectItem>
            <SelectItem value="3">{{ t('other', 'Boshqa') }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">{{ t('date-from', 'Dan') }}</label>
          <Input v-model="dateFrom" type="date" class="h-11 bg-gray-50 border rounded-lg" />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">{{ t('date-to', 'Gacha (ixtiyoriy)') }}</label>
          <Input v-model="dateTo" type="date" class="h-11 bg-gray-50 border rounded-lg" />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">{{ t('comment', 'Izoh') }}</label>
          <Input v-model="comment" class="h-11 bg-gray-50 border rounded-lg" :placeholder="t('optional', 'Ixtiyoriy')" />
        </div>
      </div>
      <div class="flex gap-2">
        <Button :disabled="!canSubmit || creating" @click="create" class="h-10 px-5 bg-[#f27a3a] hover:bg-[#e06c27] text-white rounded-lg">
          <Loader2Icon v-if="creating" class="w-4 h-4 mr-1 animate-spin" />{{ t('save', 'Saqlash') }}
        </Button>
        <Button variant="outline" @click="showForm = false" class="h-10 px-5 border rounded-lg">{{ t('cancel', 'Bekor') }}</Button>
      </div>
    </div>

    <!-- Pending toggle -->
    <div class="flex items-center gap-3 mb-3">
      <Button :variant="pendingOnly ? 'default' : 'outline'" @click="pendingOnly = !pendingOnly"
        class="h-9 px-4 rounded-lg text-sm" :class="pendingOnly ? 'bg-[#f27a3a] text-white' : 'border'">
        {{ t('pending-only', 'Faqat kutilayotgan') }}
      </Button>
      <Loader2Icon v-if="isFetching" class="w-4 h-4 animate-spin text-gray-300" />
    </div>

    <!-- List -->
    <div class="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-gray-50 text-xs text-gray-500 uppercase">
            <th class="px-4 py-2.5 text-left">{{ t('student', 'O\'quvchi') }}</th>
            <th class="px-4 py-2.5 text-left">{{ t('sinf', 'Sinf') }}</th>
            <th class="px-4 py-2.5 text-left">{{ t('dates', 'Sanalar') }}</th>
            <th class="px-4 py-2.5 text-left">{{ t('reason', 'Sabab') }}</th>
            <th class="px-4 py-2.5 text-left">{{ t('status', 'Holat') }}</th>
            <th class="px-4 py-2.5 text-left">{{ t('source', 'Manba') }}</th>
            <th class="px-4 py-2.5 text-right">{{ t('actions', 'Amal') }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-if="!items.length">
            <td colspan="7" class="px-4 py-10 text-center text-gray-400">{{ t('no-data', 'Ma\'lumot yo\'q') }}</td>
          </tr>
          <tr v-for="a in items" :key="a.id" class="hover:bg-gray-50">
            <td class="px-4 py-2.5 font-medium text-gray-800">{{ a.studentName }}</td>
            <td class="px-4 py-2.5 text-gray-600">{{ a.className || '—' }}</td>
            <td class="px-4 py-2.5 text-gray-600">
              {{ fmtDate(a.dateFrom) }}<template v-if="fmtDate(a.dateTo) !== fmtDate(a.dateFrom)"> — {{ fmtDate(a.dateTo) }}</template>
            </td>
            <td class="px-4 py-2.5 text-gray-600">
              {{ a.reasonName || reasonName(a.reason) }}
              <span v-if="a.comment" class="text-xs text-gray-400">· {{ a.comment }}</span>
            </td>
            <td class="px-4 py-2.5">
              <span class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold" :class="statusClass(a.approvalStatus)">
                {{ a.approvalStatusName }}
              </span>
            </td>
            <td class="px-4 py-2.5 text-xs text-gray-400">
              {{ a.fromParent ? t('from-parent', 'Ota-ona') : t('from-teacher', 'O\'qituvchi') }}
            </td>
            <td class="px-4 py-2.5">
              <div class="flex items-center justify-end gap-1">
                <button v-if="a.approvalStatus === 1" @click="act(() => approveExcusedAbsence(a.id), t('approved', 'Tasdiqlandi'))"
                  class="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100" :title="t('approve', 'Tasdiqlash')">
                  <CheckIcon class="w-4 h-4" />
                </button>
                <button v-if="a.approvalStatus === 1" @click="act(() => rejectExcusedAbsence(a.id), t('rejected', 'Rad etildi'))"
                  class="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100" :title="t('reject', 'Rad etish')">
                  <XIcon class="w-4 h-4" />
                </button>
                <button @click="act(() => deleteExcusedAbsence(a.id), t('deleted', 'O\'chirildi'))"
                  class="p-1.5 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100" :title="t('delete', 'O\'chirish')">
                  <Trash2Icon class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
