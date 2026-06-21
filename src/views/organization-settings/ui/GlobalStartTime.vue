<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Clock, Loader2Icon } from 'lucide-vue-next'
import { fetchGlobalStartTime, setGlobalStartTime } from '../api'

const { t } = useI18n()
const queryClient = useQueryClient()

// Backend returns "HH:mm:ss" (or null); the <input type="time"> wants "HH:mm".
const toInput = (v: string | null | undefined) => (v ? v.slice(0, 5) : '')

const time = ref('')

const { data, isLoading } = useQuery({
  queryKey: ['global-start-time'],
  queryFn: async () => {
    const res = await fetchGlobalStartTime()
    return (res as any)?.data?.result ?? (res as any)?.result ?? null
  }
})

watch(data, (v) => { time.value = toInput(v as any) }, { immediate: true })

const { mutate: save, isPending } = useMutation({
  mutationFn: async (value: string | null) => setGlobalStartTime(value),
  onSuccess: () => {
    toast.success(t('saved', 'Saqlandi'))
    queryClient.invalidateQueries({ queryKey: ['global-start-time'] })
  },
  onError: () => toast.error(t('error_occurred', 'Xatolik yuz berdi'))
})

const onSave = () => save(time.value ? time.value : null)
const onClear = () => { time.value = ''; save(null) }
</script>

<template>
  <div class="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
    <div class="flex items-center gap-2 mb-1">
      <Clock class="w-5 h-5 text-[#f27a3a]" />
      <h3 class="text-base font-bold text-gray-800">
        {{ t('start-time-global-title', 'Darslar boshlanish vaqti (umumiy)') }}
      </h3>
    </div>
    <p class="text-xs text-gray-400 mb-4">
      {{ t('start-time-global-hint', 'Bu — butun tizim uchun standart vaqt. Maktab yoki sinf o\'z vaqtini belgilasa, o\'sha ustun turadi.') }}
    </p>

    <div v-if="isLoading" class="flex items-center gap-2 text-gray-400 text-sm">
      <Loader2Icon class="w-4 h-4 animate-spin" /> {{ t('loading', 'Yuklanmoqda...') }}
    </div>

    <div v-else class="flex items-end gap-3 flex-wrap">
      <div>
        <label class="block text-xs font-medium text-gray-500 mb-1">
          {{ t('start-time', 'Boshlanish vaqti') }}
        </label>
        <Input v-model="time" type="time" class="h-11 w-40 bg-gray-50 border rounded-lg" />
      </div>
      <Button
        :disabled="isPending"
        @click="onSave"
        class="h-11 px-5 bg-[#f27a3a] hover:bg-[#e06c27] text-white rounded-lg"
      >
        <Loader2Icon v-if="isPending" class="w-4 h-4 mr-1 animate-spin" />
        {{ t('save', 'Saqlash') }}
      </Button>
      <Button
        variant="outline"
        :disabled="isPending || !time"
        @click="onClear"
        class="h-11 px-5 border rounded-lg"
      >
        {{ t('clear', 'Tozalash') }}
      </Button>
    </div>
  </div>
</template>
