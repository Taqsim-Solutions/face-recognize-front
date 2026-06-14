<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  fetchRegions,
  fetchSchoolsByCity,
  fetchClassesBySchool,
  transferStudent,
  fetchStudentTransfers
} from '../api'
import type { StudentModel } from '../types'

const props = defineProps<{
  open: boolean
  student: StudentModel
}>()
const emit = defineEmits<{ (e: 'update:open', v: boolean): void }>()

const { t } = useI18n()
const queryClient = useQueryClient()

const regionId = ref<string>('')
const cityId = ref<string>('')
const schoolId = ref<string>('')
const classId = ref<string>('')
const note = ref<string>('')

// Regions (with nested cities)
const { data: regionsRes } = useQuery({
  queryKey: ['transfer-regions'],
  queryFn: fetchRegions
})
const regions = computed<any[]>(() => {
  const res = regionsRes.value as any
  return res?.data?.result ?? res?.result ?? []
})
const cities = computed<any[]>(() => {
  const r = regions.value.find((x) => String(x.id) === regionId.value)
  return r?.cities ?? []
})

// Schools by city
const { data: schoolsRes } = useQuery({
  queryKey: ['transfer-schools', cityId],
  queryFn: () => fetchSchoolsByCity(Number(cityId.value)),
  enabled: computed(() => !!cityId.value)
})
const schools = computed<any[]>(() => {
  const res = schoolsRes.value as any
  return res?.data?.result?.data ?? res?.data?.result ?? res?.result ?? []
})

// Classes by school
const { data: classesRes } = useQuery({
  queryKey: ['transfer-classes', schoolId],
  queryFn: () => fetchClassesBySchool(Number(schoolId.value)),
  enabled: computed(() => !!schoolId.value)
})
const classes = computed<any[]>(() => {
  const res = classesRes.value as any
  const list = res?.data?.result?.data ?? res?.data?.result ?? res?.result ?? []
  return Array.isArray(list) ? list : []
})

const classLabel = (c: any) =>
  c?.name && c.name.trim() ? c.name : `${c?.degree ?? ''}-${c?.symbol ?? ''}`

// Reset child selects when a parent changes
watch(regionId, () => {
  cityId.value = ''
  schoolId.value = ''
  classId.value = ''
})
watch(cityId, () => {
  schoolId.value = ''
  classId.value = ''
})
watch(schoolId, () => {
  classId.value = ''
})

// Transfer history
const { data: historyRes, refetch: refetchHistory } = useQuery({
  queryKey: ['student-transfers', computed(() => props.student?.id)],
  queryFn: () => fetchStudentTransfers(props.student.id),
  enabled: computed(() => !!props.open && !!props.student?.id)
})
const history = computed<any[]>(() => {
  const res = historyRes.value as any
  return res?.data?.result ?? res?.result ?? []
})

const formatDate = (d: string) => {
  if (!d) return '-'
  try {
    return new Date(d).toLocaleString()
  } catch {
    return d
  }
}

const { isPending, mutate: doTransfer } = useMutation({
  mutationFn: () =>
    transferStudent(props.student.id, {
      toSchoolId: Number(schoolId.value),
      toClassId: classId.value ? Number(classId.value) : undefined,
      note: note.value || undefined
    }),
  onSuccess: () => {
    toast.success(t('transfer-success', "O'quvchi ko'chirildi"))
    queryClient.invalidateQueries({ queryKey: ['students'] })
    refetchHistory()
    schoolId.value = ''
    classId.value = ''
    note.value = ''
  },
  onError: (error: any) => {
    const msg = error?.response?.data?.message || t('error_occurred')
    toast.error(msg)
  }
})

const canSubmit = computed(() => !!schoolId.value && !!classId.value && !isPending.value)

const handleSubmit = () => {
  if (!canSubmit.value) return
  doTransfer()
}
</script>

<template>
  <Sheet :open="open" @update:open="(v) => emit('update:open', v)">
    <SheetContent class="bg-white w-full sm:max-w-[480px] overflow-y-auto">
      <SheetHeader>
        <SheetTitle class="text-lg font-semibold">
          {{ t('transfer-student', "O'quvchini ko'chirish") }}
        </SheetTitle>
      </SheetHeader>

      <div class="mt-4 space-y-4 px-1">
        <p class="text-sm text-gray-600">
          {{ student.lastName }} {{ student.firstName }}
        </p>

        <!-- Region -->
        <div>
          <label class="block text-sm font-medium mb-1">{{ t('region', 'Viloyat') }}</label>
          <Select v-model="regionId">
            <SelectTrigger class="h-11 bg-white border border-gray-300 rounded-lg w-full">
              <SelectValue :placeholder="t('select-region', 'Viloyatni tanlang')" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="r in regions" :key="r.id" :value="String(r.id)">
                {{ r.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- City -->
        <div>
          <label class="block text-sm font-medium mb-1">{{ t('city', 'Tuman/shahar') }}</label>
          <Select v-model="cityId" :disabled="!regionId">
            <SelectTrigger class="h-11 bg-white border border-gray-300 rounded-lg w-full">
              <SelectValue :placeholder="t('select-city', 'Tumanni tanlang')" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="c in cities" :key="c.id" :value="String(c.id)">
                {{ c.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- School -->
        <div>
          <label class="block text-sm font-medium mb-1">{{ t('school', 'Maktab') }}</label>
          <Select v-model="schoolId" :disabled="!cityId">
            <SelectTrigger class="h-11 bg-white border border-gray-300 rounded-lg w-full">
              <SelectValue :placeholder="t('select-school', 'Maktabni tanlang')" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="s in schools" :key="s.id" :value="String(s.id)">
                {{ s.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Class -->
        <div>
          <label class="block text-sm font-medium mb-1">{{ t('sinf', 'Sinf') }}</label>
          <Select v-model="classId" :disabled="!schoolId">
            <SelectTrigger class="h-11 bg-white border border-gray-300 rounded-lg w-full">
              <SelectValue :placeholder="t('select-class', 'Sinfni tanlang')" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="c in classes" :key="c.id" :value="String(c.id)">
                {{ classLabel(c) }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Note -->
        <div>
          <label class="block text-sm font-medium mb-1">{{ t('note', 'Izoh') }}</label>
          <textarea
            v-model="note"
            rows="2"
            class="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:border-primary"
            :placeholder="t('note-optional', 'Ixtiyoriy')"
          />
        </div>

        <Button
          type="button"
          :disabled="!canSubmit"
          :loading="isPending"
          @click="handleSubmit"
          class="h-11 w-full bg-[#f27a3a] hover:bg-[#e06c27] text-white rounded-lg font-semibold"
        >
          {{ t('transfer', "Ko'chirish") }}
        </Button>

        <!-- History -->
        <div class="pt-4 border-t border-gray-200">
          <h4 class="text-sm font-semibold mb-3">
            {{ t('transfer-history', "Ko'chirishlar tarixi") }}
          </h4>
          <p v-if="history.length === 0" class="text-sm text-gray-400">
            {{ t('no-transfers', "Ko'chirishlar yo'q") }}
          </p>
          <ul v-else class="space-y-3">
            <li
              v-for="item in history"
              :key="item.id"
              class="text-sm border border-gray-200 rounded-lg p-3"
            >
              <div class="font-medium text-slate-800">
                {{ item.fromSchoolName }} ({{ item.fromClassName || '-' }})
                →
                {{ item.toSchoolName }} ({{ item.toClassName || '-' }})
              </div>
              <div class="text-gray-500 mt-1">
                {{ formatDate(item.transferredAt) }}
                <span v-if="item.transferredByFullName"> · {{ item.transferredByFullName }}</span>
              </div>
              <div v-if="item.note" class="text-gray-600 mt-1 italic">{{ item.note }}</div>
            </li>
          </ul>
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>
