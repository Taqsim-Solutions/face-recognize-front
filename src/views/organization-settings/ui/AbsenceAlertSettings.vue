<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { BellRing, Loader2Icon } from 'lucide-vue-next'
import { fetchRegions, fetchSchoolsByCity } from '@/views/students/list/api'
import {
  fetchAbsenceAlert, setAbsenceAlert, type AbsenceAlertSettings,
  fetchSchoolAbsenceAlert, setSchoolAbsenceAlert
} from '../api'

const { t } = useI18n()
const queryClient = useQueryClient()

const enabled = ref(false)
const delayMinutes = ref(10)
const repeatCount = ref(3)
const repeatIntervalMinutes = ref(5)

const { data, isLoading } = useQuery({
  queryKey: ['absence-alert'],
  queryFn: async () => {
    const res = await fetchAbsenceAlert()
    return (res as any)?.data?.result ?? (res as any)?.result ?? null
  }
})

watch(data, (v: any) => {
  if (!v) return
  enabled.value = !!v.enabled
  delayMinutes.value = v.delayMinutes ?? 10
  repeatCount.value = v.repeatCount ?? 3
  repeatIntervalMinutes.value = v.repeatIntervalMinutes ?? 5
}, { immediate: true })

const { mutate: save, isPending } = useMutation({
  mutationFn: async () => {
    const payload: AbsenceAlertSettings = {
      enabled: enabled.value,
      delayMinutes: Math.max(0, Number(delayMinutes.value) || 0),
      repeatCount: Math.max(1, Number(repeatCount.value) || 1),
      repeatIntervalMinutes: Math.max(1, Number(repeatIntervalMinutes.value) || 1)
    }
    return setAbsenceAlert(payload)
  },
  onSuccess: () => {
    toast.success(t('saved', 'Saqlandi'))
    queryClient.invalidateQueries({ queryKey: ['absence-alert'] })
  },
  onError: () => toast.error(t('error_occurred', 'Xatolik yuz berdi'))
})

// ── Per-school override ───────────────────────────────────────────
const regionId = ref('')
const cityId = ref('')
const schoolId = ref('')

const { data: regionsRaw } = useQuery({
  queryKey: ['aa-regions'],
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
  queryKey: ['aa-schools', cityId],
  queryFn: async () => {
    if (!cityId.value) return []
    const res = await fetchSchoolsByCity(Number(cityId.value))
    return (res as any)?.data?.result?.data || (res as any)?.result?.data
      || (res as any)?.data?.result || (res as any)?.result || []
  },
  enabled: computed(() => !!cityId.value)
})
const schools = computed<any[]>(() => schoolsRaw.value || [])

watch(regionId, () => { cityId.value = ''; schoolId.value = '' })
watch(cityId, () => { schoolId.value = '' })

const sDelay = ref<string>('')
const sCount = ref<string>('')
const sInterval = ref<string>('')
const sGlobal = ref<{ d: number; c: number; i: number }>({ d: 10, c: 3, i: 5 })

const { data: schoolAlert, isFetching: schoolLoading } = useQuery({
  queryKey: ['school-absence-alert', schoolId],
  queryFn: async () => {
    if (!schoolId.value) return null
    const res = await fetchSchoolAbsenceAlert(Number(schoolId.value))
    return (res as any)?.data?.result ?? (res as any)?.result ?? null
  },
  enabled: computed(() => !!schoolId.value)
})
watch(schoolAlert, (v: any) => {
  if (!v) return
  sDelay.value = v.delayMinutes != null ? String(v.delayMinutes) : ''
  sCount.value = v.repeatCount != null ? String(v.repeatCount) : ''
  sInterval.value = v.repeatIntervalMinutes != null ? String(v.repeatIntervalMinutes) : ''
  sGlobal.value = { d: v.globalDelayMinutes, c: v.globalRepeatCount, i: v.globalRepeatIntervalMinutes }
})

const savingSchool = ref(false)
const saveSchool = async () => {
  if (!schoolId.value) return
  savingSchool.value = true
  try {
    await setSchoolAbsenceAlert(Number(schoolId.value), {
      delayMinutes: sDelay.value === '' ? null : Math.max(0, Number(sDelay.value)),
      repeatCount: sCount.value === '' ? null : Math.max(1, Number(sCount.value)),
      repeatIntervalMinutes: sInterval.value === '' ? null : Math.max(1, Number(sInterval.value))
    })
    toast.success(t('saved', 'Saqlandi'))
    queryClient.invalidateQueries({ queryKey: ['school-absence-alert'] })
  } catch {
    toast.error(t('error_occurred', 'Xatolik yuz berdi'))
  } finally {
    savingSchool.value = false
  }
}
</script>

<template>
  <div class="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
    <div class="flex items-center gap-2 mb-1">
      <BellRing class="w-5 h-5 text-[#f27a3a]" />
      <h3 class="text-base font-bold text-gray-800">
        {{ t('absence-alert-title', 'Kelmaslik ogohlantirishi') }}
      </h3>
    </div>
    <p class="text-xs text-gray-400 mb-4">
      {{ t('absence-alert-hint', "Bola belgilangan vaqtdan keyin ham kelmasa, ota-onasiga Telegram orqali xabar yuboriladi.") }}
    </p>

    <div v-if="isLoading" class="flex items-center gap-2 text-gray-400 text-sm">
      <Loader2Icon class="w-4 h-4 animate-spin" /> {{ t('loading', 'Yuklanmoqda...') }}
    </div>

    <div v-else class="space-y-4">
      <label class="inline-flex items-center gap-2 cursor-pointer select-none">
        <input type="checkbox" v-model="enabled" class="accent-[#f27a3a] w-4 h-4" />
        <span class="text-sm font-medium text-gray-700">{{ t('absence-alert-enabled', 'Ogohlantirish yoqilgan') }}</span>
      </label>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3" :class="enabled ? '' : 'opacity-50 pointer-events-none'">
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">
            {{ t('absence-alert-delay', 'Necha daqiqadan keyin') }}
          </label>
          <Input v-model="delayMinutes" type="number" min="0" class="h-11 bg-gray-50 border rounded-lg" />
          <p class="text-[11px] text-gray-400 mt-1">{{ t('absence-alert-delay-hint', "Boshlanish vaqtidan keyin") }}</p>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">
            {{ t('absence-alert-count', 'Necha marta') }}
          </label>
          <Input v-model="repeatCount" type="number" min="1" class="h-11 bg-gray-50 border rounded-lg" />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">
            {{ t('absence-alert-interval', 'Qaysi oraliqda (daqiqa)') }}
          </label>
          <Input v-model="repeatIntervalMinutes" type="number" min="1" class="h-11 bg-gray-50 border rounded-lg" />
        </div>
      </div>

      <Button
        :disabled="isPending"
        @click="save"
        class="h-11 px-5 bg-[#f27a3a] hover:bg-[#e06c27] text-white rounded-lg"
      >
        <Loader2Icon v-if="isPending" class="w-4 h-4 mr-1 animate-spin" />
        {{ t('save', 'Saqlash') }}
      </Button>

      <!-- Per-school override -->
      <div class="border-t border-gray-100 pt-4 mt-2">
        <p class="text-sm font-semibold text-gray-700 mb-1">{{ t('absence-alert-school', "Maktab uchun alohida") }}</p>
        <p class="text-xs text-gray-400 mb-3">{{ t('absence-alert-school-hint', "Bo'sh qoldirilsa, umumiy qiymat ishlatiladi.") }}</p>
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
        </div>

        <div v-if="schoolId">
          <div class="flex items-center gap-2 mb-2 text-xs text-gray-400">
            <span>{{ t('absence-alert-global-now', "Umumiy") }}: {{ sGlobal.d }} / {{ sGlobal.c }} / {{ sGlobal.i }} ({{ t('minutes', 'daqiqa') }})</span>
            <Loader2Icon v-if="schoolLoading" class="w-3.5 h-3.5 animate-spin text-gray-300" />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">{{ t('absence-alert-delay', 'Necha daqiqadan keyin') }}</label>
              <Input v-model="sDelay" type="number" min="0" :placeholder="String(sGlobal.d)" class="h-11 bg-gray-50 border rounded-lg" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">{{ t('absence-alert-count', 'Necha marta') }}</label>
              <Input v-model="sCount" type="number" min="1" :placeholder="String(sGlobal.c)" class="h-11 bg-gray-50 border rounded-lg" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">{{ t('absence-alert-interval', 'Qaysi oraliqda (daqiqa)') }}</label>
              <Input v-model="sInterval" type="number" min="1" :placeholder="String(sGlobal.i)" class="h-11 bg-gray-50 border rounded-lg" />
            </div>
          </div>
          <Button :disabled="savingSchool" @click="saveSchool" class="h-10 px-5 bg-[#f27a3a] hover:bg-[#e06c27] text-white rounded-lg">
            <Loader2Icon v-if="savingSchool" class="w-4 h-4 mr-1 animate-spin" />{{ t('save', 'Saqlash') }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
