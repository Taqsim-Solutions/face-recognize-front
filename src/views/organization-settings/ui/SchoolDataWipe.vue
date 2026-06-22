<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuery } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AlertTriangleIcon, Loader2Icon } from 'lucide-vue-next'
import { fetchRegions, fetchSchoolsByCity } from '@/views/students/list/api'
import { requestSchoolWipe, confirmSchoolWipe } from '../api'

const { t } = useI18n()

const regionId = ref('')
const cityId = ref('')
const schoolId = ref('')

const { data: regionsRaw } = useQuery({
  queryKey: ['wipe-regions'],
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
  queryKey: ['wipe-schools', cityId],
  queryFn: async () => {
    if (!cityId.value) return []
    const res = await fetchSchoolsByCity(Number(cityId.value))
    return (res as any)?.data?.result || (res as any)?.result || []
  },
  enabled: computed(() => !!cityId.value)
})
const schools = computed<any[]>(() => schoolsRaw.value || [])

const schoolName = computed(
  () => schools.value.find((s) => String(s.id) === schoolId.value)?.name || ''
)

// Targets
const allTargets = [
  { key: 'students', label: "O'quvchilar" },
  { key: 'teachers', label: "O'qituvchilar" },
  { key: 'classes', label: 'Sinflar' },
  { key: 'attendance', label: 'Davomat' },
  { key: 'unknownFaces', label: 'Tanilmagan rasmlar' }
]
const selected = ref<Record<string, boolean>>({})
const chosenTargets = computed(() => allTargets.filter((t) => selected.value[t.key]).map((t) => t.key))

// Two-step state
const step = ref<'select' | 'confirm'>('select')
const code = ref('')
const requesting = ref(false)
const confirming = ref(false)

const canRequest = computed(() => schoolId.value && chosenTargets.value.length > 0)

const request = async () => {
  if (!canRequest.value) return
  requesting.value = true
  try {
    await requestSchoolWipe(Number(schoolId.value), chosenTargets.value)
    toast.success(t('wipe-code-sent', 'Tasdiqlash kodi Telegramga yuborildi'))
    step.value = 'confirm'
    code.value = ''
  } catch {
    toast.error(t('error_occurred', 'Xatolik yuz berdi'))
  } finally {
    requesting.value = false
  }
}

const confirm = async () => {
  if (!code.value.trim()) return
  confirming.value = true
  try {
    const res: any = await confirmSchoolWipe(Number(schoolId.value), code.value.trim())
    const r = res?.data?.result || res?.result || {}
    toast.success(
      t('wipe-done', 'Tozalandi') +
        ` — ${t('students', "O'quvchilar")}: ${r.students || 0}, ` +
        `${t('teachers', "O'qituvchilar")}: ${r.teachers || 0}, ` +
        `${t('sinflar', 'Sinflar')}: ${r.classes || 0}, ` +
        `${t('davomad', 'Davomat')}: ${r.attendance || 0}, ` +
        `${t('unknown', 'Tanilmagan')}: ${r.unknownFaces || 0}`
    )
    reset()
  } catch (e: any) {
    const msg = e?.response?.data?.message || t('wipe-failed', "Kod noto'g'ri yoki muddati tugagan")
    toast.error(msg)
  } finally {
    confirming.value = false
  }
}

const reset = () => {
  step.value = 'select'
  code.value = ''
  selected.value = {}
}
</script>

<template>
  <div class="bg-white border border-red-100 rounded-2xl p-5 shadow-sm">
    <div class="flex items-center gap-2 mb-1">
      <AlertTriangleIcon class="w-5 h-5 text-red-500" />
      <h3 class="text-base font-bold text-gray-800">
        {{ t('wipe-title', "Maktab ma'lumotlarini tozalash") }}
      </h3>
    </div>
    <p class="text-xs text-red-400 mb-4">
      {{ t('wipe-hint', "Diqqat: tanlangan ma'lumotlar butunlay o'chiriladi va qaytarib bo'lmaydi. Telegram kod orqali tasdiqlanadi.") }}
    </p>

    <!-- Step 1: select school + targets -->
    <template v-if="step === 'select'">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
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

      <div v-if="schoolId" class="mb-4">
        <p class="text-sm font-medium text-gray-600 mb-2">{{ t('wipe-choose', "Nimani tozalash kerak?") }}</p>
        <div class="flex flex-wrap gap-2">
          <label
            v-for="tg in allTargets"
            :key="tg.key"
            class="inline-flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer select-none"
            :class="selected[tg.key] ? 'border-red-300 bg-red-50 text-red-600' : 'border-gray-200 text-gray-600'"
          >
            <input type="checkbox" v-model="selected[tg.key]" class="accent-red-500" />
            {{ tg.label }}
          </label>
        </div>
      </div>

      <Button
        :disabled="!canRequest || requesting"
        @click="request"
        class="h-11 px-5 bg-red-500 hover:bg-red-600 text-white rounded-lg"
      >
        <Loader2Icon v-if="requesting" class="w-4 h-4 mr-1 animate-spin" />
        {{ t('wipe-request', "Tozalash (kod so'rash)") }}
      </Button>
    </template>

    <!-- Step 2: enter code -->
    <template v-else>
      <div class="bg-red-50 border border-red-100 rounded-lg p-4 mb-4">
        <p class="text-sm text-gray-700">
          <b>{{ schoolName }}</b> — {{ chosenTargets.length }} {{ t('wipe-target-count', 'tur tanlandi') }}.
        </p>
        <p class="text-xs text-gray-500 mt-1">
          {{ t('wipe-code-instruction', "Telegramga yuborilgan 6 xonali kodni kiriting (5 daqiqa amal qiladi).") }}
        </p>
      </div>
      <div class="flex items-end gap-3 flex-wrap">
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">{{ t('code', 'Kod') }}</label>
          <Input v-model="code" inputmode="numeric" maxlength="6" placeholder="000000" class="h-11 w-40 bg-gray-50 border rounded-lg tracking-widest text-center" />
        </div>
        <Button :disabled="confirming || !code.trim()" @click="confirm" class="h-11 px-5 bg-red-500 hover:bg-red-600 text-white rounded-lg">
          <Loader2Icon v-if="confirming" class="w-4 h-4 mr-1 animate-spin" />
          {{ t('wipe-confirm', 'Tasdiqlash va tozalash') }}
        </Button>
        <Button variant="outline" @click="reset" class="h-11 px-4 border rounded-lg">{{ t('cancel', 'Bekor') }}</Button>
      </div>
    </template>
  </div>
</template>
