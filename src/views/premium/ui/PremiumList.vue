<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import { useI18n } from 'vue-i18n'
import { fetchPremiumList, addPremium, extendPremium, removePremium, type PremiumItem } from '../api'
import PhoneInput from '@/components/PhoneInput.vue'
import { isValidPhone, toE164 } from '@/composables/usePhoneInput'

const { t } = useI18n()
const queryClient = useQueryClient()

const { data, isLoading, isError } = useQuery({
  queryKey: ['premium-list'],
  queryFn: fetchPremiumList
})

const items = computed<PremiumItem[]>(() => (data.value as any)?.result ?? (data.value as any)?.data?.result ?? [])

// ── Add form ──────────────────────────────────────────────
const formPhone = ref('')
const formMonths = ref<number>(1)
const formNote = ref('')

const invalidate = () => queryClient.invalidateQueries({ queryKey: ['premium-list'] })

const addMutation = useMutation({
  mutationFn: addPremium,
  onSuccess: () => {
    toast.success(t('premium-added', "Premium qo'shildi"))
    formPhone.value = ''
    formMonths.value = 1
    formNote.value = ''
    invalidate()
  },
  onError: () => toast.error(t('error-occurred', 'Xatolik yuz berdi'))
})

const onAdd = () => {
  if (!formPhone.value || !isValidPhone(formPhone.value)) {
    toast.error(t('validation.phone-number-should-be-valid', "Telefon raqami noto'g'ri"))
    return
  }
  if (!formMonths.value || formMonths.value < 1) {
    toast.error(t('premium-months-required', 'Oylar sonini kiriting'))
    return
  }
  addMutation.mutate({
    phoneNumber: toE164(formPhone.value),
    months: Number(formMonths.value),
    note: formNote.value?.trim() || undefined
  })
}

// ── Extend ────────────────────────────────────────────────
const extendMutation = useMutation({
  mutationFn: extendPremium,
  onSuccess: () => { toast.success(t('premium-extended', 'Muddat uzaytirildi')); invalidate() },
  onError: () => toast.error(t('error-occurred', 'Xatolik yuz berdi'))
})

const onExtend = (item: PremiumItem) => {
  const monthsStr = window.prompt(t('premium-extend-prompt', 'Necha oyga uzaytirilsin?'), '1')
  if (monthsStr == null) return
  const months = Number(monthsStr)
  if (!months || months < 1) {
    toast.error(t('premium-months-required', 'Oylar sonini kiriting'))
    return
  }
  extendMutation.mutate({ phoneNumber: item.phoneNumber, months })
}

// ── Remove ────────────────────────────────────────────────
const removeMutation = useMutation({
  mutationFn: removePremium,
  onSuccess: () => { toast.success(t('premium-removed', 'Premium olib tashlandi')); invalidate() },
  onError: () => toast.error(t('error-occurred', 'Xatolik yuz berdi'))
})

const onRemove = (item: PremiumItem) => {
  if (!window.confirm(t('premium-remove-confirm', "Premiumni olib tashlashni tasdiqlaysizmi?"))) return
  removeMutation.mutate(item.id)
}

const fmtDate = (s: string) => {
  if (!s) return '-'
  const d = new Date(s)
  return d.toLocaleDateString()
}
</script>

<template>
  <div class="p-4 md:p-6 space-y-6">
    <h1 class="text-2xl font-bold text-gray-900">{{ t('premium', 'Premium tarif') }}</h1>

    <!-- Add form -->
    <div class="rounded-xl border border-gray-200 bg-white p-4 md:p-5">
      <h2 class="text-sm font-semibold text-gray-700 mb-3">{{ t('premium-add', "Premium qo'shish") }}</h2>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        <div class="space-y-1">
          <label class="text-xs font-medium text-gray-600">{{ t('phone-number', 'Telefon raqami') }}</label>
          <PhoneInput v-model="formPhone" placeholder="+998 90 123 45 67" />
        </div>
        <div class="space-y-1">
          <label class="text-xs font-medium text-gray-600">{{ t('months', 'Oylar') }}</label>
          <input
            v-model.number="formMonths"
            type="number"
            min="1"
            class="flex h-11 w-full rounded-lg border-2 border-border bg-transparent px-3 py-1 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <div class="space-y-1">
          <label class="text-xs font-medium text-gray-600">{{ t('note', 'Izoh') }}</label>
          <input
            v-model="formNote"
            type="text"
            :placeholder="t('note-optional', 'Ixtiyoriy')"
            class="flex h-11 w-full rounded-lg border-2 border-border bg-transparent px-3 py-1 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <button
          @click="onAdd"
          :disabled="addMutation.isPending.value"
          class="h-11 rounded-lg bg-[#ff792d] px-4 font-semibold text-white hover:bg-[#e96b1f] disabled:opacity-50"
        >
          {{ t('add', "Qo'shish") }}
        </button>
      </div>
    </div>

    <!-- List -->
    <div class="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div v-if="isLoading" class="p-6 text-center text-gray-400">{{ t('loading', 'Yuklanmoqda...') }}</div>
      <div v-else-if="isError" class="p-6 text-center text-red-500">{{ t('error-occurred', 'Xatolik yuz berdi') }}</div>
      <div v-else-if="items.length === 0" class="p-6 text-center text-gray-400">{{ t('no-data', "Ma'lumot yo'q") }}</div>
      <table v-else class="w-full text-sm">
        <thead class="bg-gray-50 text-gray-500">
          <tr>
            <th class="text-left font-medium px-4 py-3">{{ t('phone-number', 'Telefon raqami') }}</th>
            <th class="text-left font-medium px-4 py-3">{{ t('starts', 'Boshlanish') }}</th>
            <th class="text-left font-medium px-4 py-3">{{ t('ends', 'Tugash') }}</th>
            <th class="text-left font-medium px-4 py-3">{{ t('status', 'Holat') }}</th>
            <th class="text-left font-medium px-4 py-3">{{ t('note', 'Izoh') }}</th>
            <th class="text-right font-medium px-4 py-3">{{ t('actions', 'Amallar') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id" class="border-t border-gray-100">
            <td class="px-4 py-3 font-medium text-gray-800">{{ item.phoneNumber }}</td>
            <td class="px-4 py-3 text-gray-600">{{ fmtDate(item.startsAt) }}</td>
            <td class="px-4 py-3 text-gray-600">{{ fmtDate(item.endsAt) }}</td>
            <td class="px-4 py-3">
              <span
                class="text-xs px-2 py-0.5 rounded-full font-semibold"
                :class="item.isCurrentlyActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'"
              >
                {{ item.isCurrentlyActive ? t('active', 'Faol') : t('expired', 'Tugagan') }}
              </span>
            </td>
            <td class="px-4 py-3 text-gray-500">{{ item.note || '-' }}</td>
            <td class="px-4 py-3 text-right space-x-2 whitespace-nowrap">
              <button @click="onExtend(item)" class="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">
                {{ t('extend', 'Uzaytirish') }}
              </button>
              <button @click="onRemove(item)" class="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50">
                {{ t('remove', 'Olib tashlash') }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
