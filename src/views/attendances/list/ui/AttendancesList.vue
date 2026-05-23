<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuery } from '@tanstack/vue-query'
import { fetchAttendancesByDate } from '../api'

const { t } = useI18n()

const selectedDate = ref('2024-03-25')

const { data, isLoading, isError } = useQuery({
  queryKey: ['attendances', selectedDate],
  queryFn: () => fetchAttendancesByDate(selectedDate.value),
  staleTime: 60000
})

const tableData = computed(() => {
  const res = data.value as any
  return (
    res?.data?.result?.data ||
    res?.data?.result ||
    res?.data?.data ||
    res?.data ||
    []
  )
})

const isArray = computed(() => Array.isArray(tableData.value))

// Derive columns dynamically from first row keys
const columns = computed(() => {
  if (!isArray.value || tableData.value.length === 0) return []
  return Object.keys(tableData.value[0])
})

const formatValue = (val: any): string => {
  if (val === null || val === undefined) return '—'
  if (typeof val === 'boolean') return val ? 'Ha' : 'Yo\'q'
  if (typeof val === 'object') return JSON.stringify(val)
  return String(val)
}
</script>

<template>
  <div>
    <!-- Header -->
    <header class="flex justify-between items-center py-4 pt-0 px-6 border-b border-gray-200 bg-white">
      <h1 class="text-[20px] font-bold text-[#1b1b1b] tracking-tight">
        {{ t('davomad', 'Davomad') }}
      </h1>

      <!-- Date Picker -->
      <div class="flex items-center gap-3">
        <label class="text-sm font-medium text-gray-500">{{ t('pick-date', 'Sana') }}:</label>
        <input
          v-model="selectedDate"
          type="date"
          class="h-10 px-3 border border-gray-200 rounded-xl text-sm text-gray-700 font-medium bg-white focus:outline-none focus:border-[#ff792d] focus:ring-1 focus:ring-[#ff792d]/20 transition-all cursor-pointer"
        />
      </div>
    </header>

    <!-- Content -->
    <div class="px-6 mt-5">
      <!-- Loading -->
      <template v-if="isLoading">
        <div class="flex items-center justify-center py-24">
          <div class="flex flex-col items-center gap-3">
            <div class="w-8 h-8 border-2 border-[#ff792d] border-t-transparent rounded-full animate-spin"></div>
            <span class="text-sm text-gray-400 font-medium">{{ t('loading', 'Yuklanmoqda...') }}</span>
          </div>
        </div>
      </template>

      <!-- Error -->
      <template v-else-if="isError">
        <div class="flex items-center justify-center py-24">
          <div class="flex flex-col items-center gap-2 text-center">
            <div class="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <p class="text-sm font-semibold text-gray-700">{{ t('error_occurred', 'Xatolik yuz berdi') }}</p>
          </div>
        </div>
      </template>

      <!-- Table -->
      <template v-else-if="isArray && tableData.length > 0">
        <div class="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b border-gray-100">
              <tr>
                <th
                  v-for="col in columns"
                  :key="col"
                  class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                >
                  {{ col }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr
                v-for="(row, idx) in tableData"
                :key="idx"
                class="bg-white hover:bg-gray-50/60 transition-colors"
              >
                <td
                  v-for="col in columns"
                  :key="col"
                  class="px-4 py-3 text-gray-700 font-medium whitespace-nowrap"
                >
                  {{ formatValue(row[col]) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-xs text-gray-400 mt-3 font-medium">
          {{ t('total', 'Jami') }}: {{ tableData.length }}
        </p>
      </template>

      <!-- Non-array JSON response -->
      <template v-else-if="!isArray && tableData && Object.keys(tableData).length > 0">
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <pre class="text-xs text-gray-600 font-mono whitespace-pre-wrap break-all">{{ JSON.stringify(tableData, null, 2) }}</pre>
        </div>
      </template>

      <!-- No Data -->
      <template v-else>
        <div class="flex items-center justify-center py-24">
          <div class="flex flex-col items-center gap-2">
            <div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <p class="text-sm font-semibold text-gray-500">{{ t('no-data', "Ma'lumot yo'q") }}</p>
            <p class="text-xs text-gray-400">{{ selectedDate }} {{ t('for-date', 'sanasi uchun') }}</p>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
