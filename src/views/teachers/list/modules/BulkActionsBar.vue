<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { EntityStatus, STATUS_LABEL } from '@/constants/entityStatus'
import {
  fetchRegions,
  fetchSchoolsByCity,
  fetchClassesBySchool,
  bulkChangeTeacherStatus,
  bulkChangeTeacherClass
} from '../api'

const props = defineProps<{
  selectedIds: (number | string)[]
}>()
const emit = defineEmits<{ (e: 'done'): void }>()

const { t } = useI18n()
const queryClient = useQueryClient()
const count = computed(() => props.selectedIds.length)

const dialog = ref<'status' | 'class' | null>(null)
const close = () => (dialog.value = null)
const invalidate = () => {
  queryClient.invalidateQueries({ queryKey: ['teachers'] })
  emit('done')
  close()
}

// status
const statusValue = ref<string>(String(EntityStatus.Inactive))
const { isPending: statusPending, mutate: applyStatus } = useMutation({
  mutationFn: () => bulkChangeTeacherStatus(props.selectedIds, Number(statusValue.value)),
  onSuccess: (res: any) => {
    toast.success(t('bulk-status-done', 'Holat yangilandi') + ` (${res?.data?.result ?? ''})`)
    invalidate()
  },
  onError: () => toast.error(t('error_occurred'))
})

// class (within a chosen school)
const regionId = ref('')
const cityId = ref('')
const schoolId = ref('')
const classId = ref('')

const { data: regionsRes } = useQuery({ queryKey: ['t-bulk-regions'], queryFn: fetchRegions })
const regions = computed<any[]>(() => {
  const r = regionsRes.value as any
  return r?.data?.result ?? r?.result ?? []
})
const cities = computed<any[]>(() => regions.value.find((x) => String(x.id) === regionId.value)?.cities ?? [])

const { data: schoolsRes } = useQuery({
  queryKey: ['t-bulk-schools', cityId],
  queryFn: () => fetchSchoolsByCity(Number(cityId.value)),
  enabled: computed(() => !!cityId.value)
})
const schools = computed<any[]>(() => {
  const r = schoolsRes.value as any
  return r?.data?.result?.data ?? r?.data?.result ?? r?.result ?? []
})

const { data: classesRes } = useQuery({
  queryKey: ['t-bulk-classes', schoolId],
  queryFn: () => fetchClassesBySchool(Number(schoolId.value)),
  enabled: computed(() => !!schoolId.value)
})
const classes = computed<any[]>(() => {
  const r = classesRes.value as any
  const list = r?.data?.result?.data ?? r?.data?.result ?? r?.result ?? []
  return Array.isArray(list) ? list : []
})
const classLabel = (c: any) => (c?.name && c.name.trim() ? c.name : `${c?.degree ?? ''}-${c?.symbol ?? ''}`)

const { isPending: classPending, mutate: applyClass } = useMutation({
  mutationFn: () => bulkChangeTeacherClass(props.selectedIds, Number(classId.value)),
  onSuccess: (res: any) => {
    toast.success(t('bulk-class-done', 'Sinf yangilandi') + ` (${res?.data?.result ?? ''})`)
    invalidate()
  },
  onError: () => toast.error(t('error_occurred'))
})

const openClass = () => {
  regionId.value = ''
  cityId.value = ''
  schoolId.value = ''
  classId.value = ''
  dialog.value = 'class'
}
</script>

<template>
  <div
    v-if="count > 0"
    class="flex items-center gap-3 px-4 py-3 mb-3 bg-[#FFF4E5] border border-[#FFE0B2] rounded-lg"
  >
    <span class="text-sm font-semibold text-[#B26A00]">
      {{ count }} {{ t('selected', 'tanlandi') }}
    </span>
    <div class="flex items-center gap-2 ml-auto">
      <Button type="button" @click="dialog = 'status'"
        class="h-9 px-3 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium">
        {{ t('change-status', "Holatni o'zgartirish") }}
      </Button>
      <Button type="button" @click="openClass"
        class="h-9 px-3 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium">
        {{ t('change-class', "Sinfni o'zgartirish") }}
      </Button>
    </div>

    <!-- Status dialog -->
    <Dialog :open="dialog === 'status'" @update:open="(v) => !v && close()">
      <DialogContent class="sm:max-w-[420px] bg-white rounded-xl">
        <DialogHeader>
          <DialogTitle>{{ t('change-status', "Holatni o'zgartirish") }}</DialogTitle>
        </DialogHeader>
        <div class="py-3">
          <Select v-model="statusValue">
            <SelectTrigger class="h-11 bg-white border border-gray-300 rounded-lg w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem :value="String(EntityStatus.Active)">{{ STATUS_LABEL[1] }}</SelectItem>
              <SelectItem :value="String(EntityStatus.Inactive)">{{ STATUS_LABEL[2] }}</SelectItem>
              <SelectItem :value="String(EntityStatus.Deleted)">{{ STATUS_LABEL[3] }}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="flex justify-end gap-2">
          <Button variant="outline" @click="close" class="h-10 px-4 bg-white border rounded-lg">{{ t('cancel') }}</Button>
          <Button :loading="statusPending" @click="applyStatus" class="h-10 px-4 bg-[#f27a3a] text-white rounded-lg">{{ t('apply', 'Qollash') }}</Button>
        </div>
      </DialogContent>
    </Dialog>

    <!-- Class dialog -->
    <Dialog :open="dialog === 'class'" @update:open="(v) => !v && close()">
      <DialogContent class="sm:max-w-[440px] bg-white rounded-xl">
        <DialogHeader>
          <DialogTitle>{{ t('change-class', "Sinfni o'zgartirish") }}</DialogTitle>
        </DialogHeader>
        <div class="py-2 space-y-3">
          <Select v-model="regionId">
            <SelectTrigger class="h-11 bg-white border rounded-lg w-full"><SelectValue :placeholder="t('region', 'Viloyat')" /></SelectTrigger>
            <SelectContent>
              <SelectItem v-for="r in regions" :key="r.id" :value="String(r.id)">{{ r.name }}</SelectItem>
            </SelectContent>
          </Select>
          <Select v-model="cityId" :disabled="!regionId">
            <SelectTrigger class="h-11 bg-white border rounded-lg w-full"><SelectValue :placeholder="t('city', 'Tuman')" /></SelectTrigger>
            <SelectContent>
              <SelectItem v-for="c in cities" :key="c.id" :value="String(c.id)">{{ c.name }}</SelectItem>
            </SelectContent>
          </Select>
          <Select v-model="schoolId" :disabled="!cityId">
            <SelectTrigger class="h-11 bg-white border rounded-lg w-full"><SelectValue :placeholder="t('school', 'Maktab')" /></SelectTrigger>
            <SelectContent>
              <SelectItem v-for="s in schools" :key="s.id" :value="String(s.id)">{{ s.name }}</SelectItem>
            </SelectContent>
          </Select>
          <Select v-model="classId" :disabled="!schoolId">
            <SelectTrigger class="h-11 bg-white border rounded-lg w-full"><SelectValue :placeholder="t('sinf', 'Sinf')" /></SelectTrigger>
            <SelectContent>
              <SelectItem v-for="c in classes" :key="c.id" :value="String(c.id)">{{ classLabel(c) }}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="flex justify-end gap-2">
          <Button variant="outline" @click="close" class="h-10 px-4 bg-white border rounded-lg">{{ t('cancel') }}</Button>
          <Button :disabled="!classId" :loading="classPending" @click="applyClass" class="h-10 px-4 bg-[#f27a3a] text-white rounded-lg">{{ t('apply', 'Qollash') }}</Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
