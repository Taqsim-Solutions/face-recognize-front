<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import {
  fetchRestPeriods, createRestPeriod, updateRestPeriod, deleteRestPeriod
} from '../api'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  CalendarOffIcon, PlusIcon, PencilIcon, Trash2Icon, XIcon, CalendarIcon
} from 'lucide-vue-next'

const { t } = useI18n()
const queryClient = useQueryClient()

// ── List ────────────────────────────────────────────────────────────
const { data: raw, isLoading, isError } = useQuery({
  queryKey: ['rest-periods'],
  queryFn: fetchRestPeriods,
  select: (r: any) => r?.data?.result?.data || r?.data?.result || []
})
const periods = computed<any[]>(() => (raw.value as any) || [])

const fmt = (d: string) => {
  if (!d) return '—'
  const dt = new Date(d)
  if (isNaN(dt.getTime())) return '—'
  return dt.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// ── Drawer (create / edit) ──────────────────────────────────────────
const isOpen = ref(false)
const editingId = ref<number | null>(null)
const form = ref({ name: '', dateFrom: '', dateTo: '', comment: '' })

const openCreate = () => {
  editingId.value = null
  form.value = { name: '', dateFrom: '', dateTo: '', comment: '' }
  isOpen.value = true
}

const openEdit = (p: any) => {
  editingId.value = p.id
  form.value = {
    name: p.name || '',
    dateFrom: p.dateFrom ? p.dateFrom.split('T')[0] : '',
    dateTo: p.dateTo ? p.dateTo.split('T')[0] : '',
    comment: p.comment || ''
  }
  isOpen.value = true
}

const invalidate = () => queryClient.invalidateQueries({ queryKey: ['rest-periods'] })

const saveMutation = useMutation({
  mutationFn: () => {
    const payload = {
      name: form.value.name.trim(),
      dateFrom: new Date(form.value.dateFrom).toISOString(),
      dateTo: new Date(form.value.dateTo).toISOString(),
      comment: form.value.comment?.trim() || ''
    }
    return editingId.value
      ? updateRestPeriod(editingId.value, payload)
      : createRestPeriod(payload)
  },
  onSuccess: () => {
    toast.success(
      editingId.value
        ? t('rest-saved', 'Dam olish davri saqlandi')
        : t('rest-added', "Dam olish davri qo'shildi")
    )
    isOpen.value = false
    invalidate()
  },
  onError: (e: any) => {
    toast.error(e?.response?.data?.message || t('rest-save-error', 'Saqlashda xatolik yuz berdi'))
  }
})

const deleteMutation = useMutation({
  mutationFn: (id: number) => deleteRestPeriod(id),
  onSuccess: () => {
    toast.success(t('rest-deleted', "Dam olish davri o'chirildi"))
    invalidate()
  },
  onError: (e: any) => {
    toast.error(e?.response?.data?.message || t('rest-delete-error', "O'chirishda xatolik yuz berdi"))
  }
})

const confirmingId = ref<number | null>(null)

const canSave = computed(() => {
  const f = form.value
  if (!f.name.trim() || !f.dateFrom || !f.dateTo) return false
  return new Date(f.dateFrom) <= new Date(f.dateTo)
})

const submit = () => {
  if (!canSave.value) {
    toast.error(t('rest-validation', "Nom, boshlanish va tugash sanasini to'g'ri kiriting"))
    return
  }
  saveMutation.mutate()
}
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200">
      <div class="flex items-center gap-2.5">
        <div class="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
          <CalendarOffIcon class="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <h3 class="font-bold text-gray-800">
            {{ t('rest-periods-title', "Dam olish kunlari va ta'tillar") }}
          </h3>
          <p class="text-xs text-gray-500">
            {{ t('rest-periods-hint', "Bu kunlarda davomat hisobga olinmaydi (yozgi ta'til, bayramlar)") }}
          </p>
        </div>
      </div>
      <Button size="sm" class="gap-1.5" @click="openCreate">
        <PlusIcon class="w-4 h-4" />
        <span class="hidden sm:inline">{{ t('rest-add', "Qo'shish") }}</span>
      </Button>
    </div>

    <!-- Body -->
    <div class="p-4 sm:p-6">
      <div v-if="isLoading" class="py-8 text-center text-gray-400 text-sm">
        {{ t('loading', 'Yuklanmoqda...') }}
      </div>

      <div v-else-if="isError" class="py-8 text-center text-red-500 text-sm">
        {{ t('rest-load-error', "Ma'lumotni yuklashda xatolik") }}
      </div>

      <div v-else-if="!periods.length" class="py-10 text-center">
        <CalendarOffIcon class="w-10 h-10 text-gray-300 mx-auto mb-2" />
        <p class="text-sm text-gray-500">
          {{ t('rest-empty', "Hali dam olish davri qo'shilmagan") }}
        </p>
      </div>

      <ul v-else class="space-y-2">
        <li
          v-for="p in periods"
          :key="p.id"
          class="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-4 py-3 hover:bg-gray-50 transition-colors"
        >
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <span class="font-medium text-gray-800 truncate">{{ p.name || '—' }}</span>
            </div>
            <div class="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
              <CalendarIcon class="w-3.5 h-3.5" />
              <span>{{ fmt(p.dateFrom) }} — {{ fmt(p.dateTo) }}</span>
            </div>
            <p v-if="p.comment" class="text-xs text-gray-400 mt-0.5 truncate">{{ p.comment }}</p>
          </div>

          <div class="flex items-center gap-1.5 shrink-0">
            <template v-if="confirmingId === p.id">
              <button
                class="text-xs font-medium text-red-600 hover:text-red-700 px-2 py-1"
                @click="deleteMutation.mutate(p.id); confirmingId = null"
              >
                {{ t('confirm-delete', "Tasdiqlash") }}
              </button>
              <button
                class="text-xs text-gray-400 hover:text-gray-600 px-1 py-1"
                @click="confirmingId = null"
              >
                {{ t('cancel-action', 'Bekor') }}
              </button>
            </template>
            <template v-else>
              <button
                class="w-8 h-8 rounded-lg flex items-center justify-center text-green-600 hover:bg-green-50 transition-colors"
                :title="t('edit', 'Tahrirlash')"
                @click="openEdit(p)"
              >
                <PencilIcon class="w-4 h-4" />
              </button>
              <button
                class="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                :title="t('delete', 'Ochirish')"
                @click="confirmingId = p.id"
              >
                <Trash2Icon class="w-4 h-4" />
              </button>
            </template>
          </div>
        </li>
      </ul>
    </div>

    <!-- Create / Edit Drawer -->
    <Sheet v-model:open="isOpen">
      <SheetContent class="sm:max-w-md p-0 flex flex-col">
        <SheetHeader class="flex flex-row items-center justify-between bg-white p-3 px-6 border-b border-gray-200 space-y-0">
          <SheetTitle>
            {{ editingId ? t('rest-edit-title', 'Dam olish davrini tahrirlash') : t('rest-add-title', "Dam olish davri qo'shish") }}
          </SheetTitle>
          <SheetClose class="rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-100">
            <XIcon class="w-4 h-4" />
          </SheetClose>
        </SheetHeader>

        <div class="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <div class="space-y-1.5">
            <Label>{{ t('rest-name', 'Nomi') }} <span class="text-red-500">*</span></Label>
            <Input
              v-model="form.name"
              :placeholder="t('rest-name-ph', 'Masalan: Yozgi tatil')"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <Label>{{ t('rest-from', 'Boshlanishi') }} <span class="text-red-500">*</span></Label>
              <Input v-model="form.dateFrom" type="date" />
            </div>
            <div class="space-y-1.5">
              <Label>{{ t('rest-to', 'Tugashi') }} <span class="text-red-500">*</span></Label>
              <Input v-model="form.dateTo" type="date" />
            </div>
          </div>

          <div class="space-y-1.5">
            <Label>{{ t('rest-comment', 'Izoh') }}</Label>
            <Input
              v-model="form.comment"
              :placeholder="t('rest-comment-ph', 'Ixtiyoriy izoh')"
            />
          </div>
        </div>

        <div class="border-t border-gray-200 p-4 flex justify-end gap-2">
          <SheetClose as-child>
            <Button variant="outline">{{ t('cancel-action', 'Bekor') }}</Button>
          </SheetClose>
          <Button :disabled="!canSave || saveMutation.isPending.value" @click="submit">
            {{ saveMutation.isPending.value ? t('saving', 'Saqlanmoqda...') : t('save', 'Saqlash') }}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  </div>
</template>
