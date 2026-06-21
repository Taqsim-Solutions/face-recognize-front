<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Building2, GraduationCap, Loader2Icon } from 'lucide-vue-next'
import { fetchRegions, fetchSchoolsByCity } from '@/views/students/list/api'
import {
  fetchClassesBySchool,
  fetchSchoolStartTime, setSchoolStartTime,
  fetchClassStartTime, setClassStartTime
} from '../api'

const { t } = useI18n()
const queryClient = useQueryClient()

const toInput = (v: string | null | undefined) => (v ? v.slice(0, 5) : '')
const fmt = (v: string | null | undefined) => (v ? v.slice(0, 5) : '—')

const regionId = ref('')
const cityId = ref('')
const schoolId = ref('')
const classId = ref('')

const { data: regionsRaw } = useQuery({
  queryKey: ['st-regions'],
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
  queryKey: ['st-schools', cityId],
  queryFn: async () => {
    if (!cityId.value) return []
    const res = await fetchSchoolsByCity(Number(cityId.value))
    return (res as any)?.data?.result || (res as any)?.result || []
  },
  enabled: computed(() => !!cityId.value)
})
const schools = computed<any[]>(() => schoolsRaw.value || [])

const { data: classesRaw } = useQuery({
  queryKey: ['st-classes', schoolId],
  queryFn: async () => {
    if (!schoolId.value) return []
    const res = await fetchClassesBySchool(Number(schoolId.value))
    return (res as any)?.data?.result || (res as any)?.result || []
  },
  enabled: computed(() => !!schoolId.value)
})
const classes = computed<any[]>(() => classesRaw.value || [])

watch(regionId, () => { cityId.value = ''; schoolId.value = ''; classId.value = '' })
watch(cityId, () => { schoolId.value = ''; classId.value = '' })
watch(schoolId, () => { classId.value = '' })

// School shift times
const schoolTime = ref('')
const schoolTime2 = ref('')
const { data: schoolInfo, isFetching: schoolLoading } = useQuery({
  queryKey: ['school-start-time', schoolId],
  queryFn: async () => {
    if (!schoolId.value) return null
    const res = await fetchSchoolStartTime(Number(schoolId.value))
    return (res as any)?.data?.result ?? (res as any)?.result ?? null
  },
  enabled: computed(() => !!schoolId.value)
})
watch(schoolInfo, (v: any) => {
  schoolTime.value = toInput(v?.school)
  schoolTime2.value = toInput(v?.school2)
})

const savingSchool = ref(false)
const saveSchool = async () => {
  if (!schoolId.value) return
  savingSchool.value = true
  try {
    await setSchoolStartTime(Number(schoolId.value), schoolTime.value || null, schoolTime2.value || null)
    toast.success(t('saved', 'Saqlandi'))
    queryClient.invalidateQueries({ queryKey: ['school-start-time'] })
    queryClient.invalidateQueries({ queryKey: ['class-start-time'] })
  } catch {
    toast.error(t('error_occurred', 'Xatolik yuz berdi'))
  } finally {
    savingSchool.value = false
  }
}

// Class shift + optional explicit time
const classTime = ref('')
const classShift = ref('1')
const { data: classInfo, isFetching: classLoading } = useQuery({
  queryKey: ['class-start-time', classId],
  queryFn: async () => {
    if (!classId.value) return null
    const res = await fetchClassStartTime(Number(classId.value))
    return (res as any)?.data?.result ?? (res as any)?.result ?? null
  },
  enabled: computed(() => !!classId.value)
})
watch(classInfo, (v: any) => {
  classTime.value = toInput(v?.class)
  classShift.value = String(v?.shift || 1)
})

const savingClass = ref(false)
const saveClass = async () => {
  if (!classId.value) return
  savingClass.value = true
  try {
    await setClassStartTime(Number(classId.value), classTime.value || null, Number(classShift.value) || 1)
    toast.success(t('saved', 'Saqlandi'))
    queryClient.invalidateQueries({ queryKey: ['class-start-time'] })
  } catch {
    toast.error(t('error_occurred', 'Xatolik yuz berdi'))
  } finally {
    savingClass.value = false
  }
}
const clearClassTime = () => { classTime.value = ''; saveClass() }

const classLabel = (c: any) => c.name || `${c.degree}-${c.symbol}`
</script>

<template>
  <div class="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
    <div class="flex items-center gap-2 mb-1">
      <Building2 class="w-5 h-5 text-[#f27a3a]" />
      <h3 class="text-base font-bold text-gray-800">
        {{ t('start-time-school-class-title', 'Maktab va sinf boshlanish vaqti') }}
      </h3>
    </div>
    <p class="text-xs text-gray-400 mb-4">
      {{ t('start-time-cascade-hint', "Sinf aniq vaqti maktab smenasidan, u esa umumiydan ustun turadi. Sinf smenasiga qarab maktabning 1- yoki 2-smena vaqti olinadi.") }}
    </p>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
      <Select v-model="regionId">
        <SelectTrigger class="h-11 bg-gray-50 border rounded-lg"><SelectValue :placeholder="t('region', 'Viloyat')" /></SelectTrigger>
        <SelectContent>
          <SelectItem v-for="r in regions" :key="r.id" :value="String(r.id)">{{ r.name }}</SelectItem>
        </SelectContent>
      </Select>
      <Select v-model="cityId" :disabled="!regionId">
        <SelectTrigger class="h-11 bg-gray-50 border rounded-lg"><SelectValue :placeholder="t('city', 'Tuman')" /></SelectTrigger>
        <SelectContent>
          <SelectItem v-for="c in cities" :key="c.id" :value="String(c.id)">{{ c.name }}</SelectItem>
        </SelectContent>
      </Select>
      <Select v-model="schoolId" :disabled="!cityId">
        <SelectTrigger class="h-11 bg-gray-50 border rounded-lg"><SelectValue :placeholder="t('school', 'Maktab')" /></SelectTrigger>
        <SelectContent>
          <SelectItem v-for="s in schools" :key="s.id" :value="String(s.id)">{{ s.name }}</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div v-if="schoolId" class="border-t border-gray-100 pt-4 mb-4">
      <div class="flex items-center gap-2 mb-3">
        <Building2 class="w-4 h-4 text-gray-500" />
        <span class="text-sm font-semibold text-gray-700">{{ t('school', 'Maktab') }}</span>
        <span v-if="schoolInfo" class="text-xs text-gray-400">({{ t('global', 'Umumiy') }}: {{ fmt((schoolInfo as any)?.global) }})</span>
        <Loader2Icon v-if="schoolLoading" class="w-3.5 h-3.5 animate-spin text-gray-300" />
      </div>
      <div class="flex items-end gap-4 flex-wrap">
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">{{ t('shift-1', '1-smena') }}</label>
          <Input v-model="schoolTime" type="time" class="h-11 w-36 bg-gray-50 border rounded-lg" />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">{{ t('shift-2', '2-smena') }}</label>
          <Input v-model="schoolTime2" type="time" class="h-11 w-36 bg-gray-50 border rounded-lg" />
        </div>
        <Button :disabled="savingSchool" @click="saveSchool" class="h-11 px-5 bg-[#f27a3a] hover:bg-[#e06c27] text-white rounded-lg">
          <Loader2Icon v-if="savingSchool" class="w-4 h-4 mr-1 animate-spin" />{{ t('save', 'Saqlash') }}
        </Button>
      </div>
      <p class="text-xs text-gray-400 mt-2">{{ t('shift-clear-hint', "Bo'sh qoldirilsa, o'sha smena vaqti tozalanadi.") }}</p>
    </div>

    <div v-if="schoolId" class="border-t border-gray-100 pt-4">
      <div class="flex items-center gap-2 mb-2">
        <GraduationCap class="w-4 h-4 text-gray-500" />
        <span class="text-sm font-semibold text-gray-700">{{ t('sinf', 'Sinf') }}</span>
      </div>
      <Select v-model="classId" class="mb-3">
        <SelectTrigger class="h-11 w-full sm:w-72 bg-gray-50 border rounded-lg"><SelectValue :placeholder="t('select-class', 'Sinfni tanlang')" /></SelectTrigger>
        <SelectContent>
          <SelectItem v-for="c in classes" :key="c.id" :value="String(c.id)">{{ classLabel(c) }}</SelectItem>
        </SelectContent>
      </Select>

      <div v-if="classId" class="mt-2">
        <div class="flex items-center gap-2 mb-3">
          <span v-if="classInfo" class="text-xs text-gray-400">
            {{ t('effective', 'Amaldagi') }}: <b>{{ fmt((classInfo as any)?.effective) }}</b>
            &nbsp;|&nbsp; {{ t('shift-1', '1-smena') }}: {{ fmt((classInfo as any)?.school) }}
            &nbsp;|&nbsp; {{ t('shift-2', '2-smena') }}: {{ fmt((classInfo as any)?.school2) }}
          </span>
          <Loader2Icon v-if="classLoading" class="w-3.5 h-3.5 animate-spin text-gray-300" />
        </div>
        <div class="flex items-end gap-4 flex-wrap">
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">{{ t('shift', 'Smena') }}</label>
            <Select v-model="classShift">
              <SelectTrigger class="h-11 w-36 bg-gray-50 border rounded-lg"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">{{ t('shift-1', '1-smena') }}</SelectItem>
                <SelectItem value="2">{{ t('shift-2', '2-smena') }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">{{ t('class-explicit-time', 'Aniq vaqt (ixtiyoriy)') }}</label>
            <Input v-model="classTime" type="time" class="h-11 w-36 bg-gray-50 border rounded-lg" />
          </div>
          <Button :disabled="savingClass" @click="saveClass" class="h-11 px-5 bg-[#f27a3a] hover:bg-[#e06c27] text-white rounded-lg">
            <Loader2Icon v-if="savingClass" class="w-4 h-4 mr-1 animate-spin" />{{ t('save', 'Saqlash') }}
          </Button>
          <Button variant="outline" :disabled="savingClass || !classTime" @click="clearClassTime" class="h-11 px-4 border rounded-lg">
            {{ t('clear-time', 'Vaqtni tozalash') }}
          </Button>
        </div>
        <p class="text-xs text-gray-400 mt-2">{{ t('class-time-hint', "Aniq vaqt qo'yilsa, smena e'tiborga olinmaydi. Tozalansa, smena vaqti qo'llanadi.") }}</p>
      </div>
    </div>
  </div>
</template>
