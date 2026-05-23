<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { AlertCircle } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { useGetMonthlyOverview } from '../query/useGetMonthlyOverview'

const { t, locale } = useI18n()

const props = defineProps<{
  regionId?: number
  cityId?: number
}>()

// Fetch stats reactively based on region & city filters
const queryParams = computed(() => ({
  RegionId: props.regionId,
  CityId: props.cityId
}))

const { data, isLoading, isError, refetch } = useGetMonthlyOverview(queryParams)

// Tab state: 'thisMonth' (Xozirgi oy) vs 'lastMonth' (O'tgan oy)
const activeTab = ref<'thisMonth' | 'lastMonth'>('thisMonth')

// Raw overview dataset from API response
const rawDataset = computed(() => {
  if (!data.value) return []
  return data.value.overview || []
})

// Calculate dynamic Y-axis maximum (highest percentage value)
const maxPct = computed(() => {
  if (rawDataset.value.length === 0) return 2.0
  const percentages = rawDataset.value.map((m) => parseFloat(m.percentage) || 0)
  const max = Math.max(...percentages, 0)
  return max === 0 ? 2.0 : parseFloat((max * 1.15).toFixed(1)) // 15% breathing room
})

// Generate clean Y-axis ticks formatted as percentages (e.g. 0%, 0.5%, 1%, etc.)
const yAxisTicks = computed(() => {
  const steps = 5
  const ticks = []
  for (let i = steps; i >= 0; i--) {
    const val = (maxPct.value / steps) * i
    ticks.push(`${val.toFixed(1)}%`)
  }
  return ticks
})

// Localized month translations map
const getMonthLabel = (englishMonthName: string) => {
  const currentLang = locale.value
  const monthLower = englishMonthName.toLowerCase()

  const translations: Record<string, Record<string, string>> = {
    september: { uz: 'Sentabr', uzc: 'Сентябрь', ru: 'Сентябрь', en: 'Sept' },
    october: { uz: 'Oktabr', uzc: 'Октябрь', ru: 'Октябрь', en: 'Oct' },
    november: { uz: 'Noyabr', uzc: 'Ноябрь', ru: 'Ноябрь', en: 'Nov' },
    december: { uz: 'Dekabr', uzc: 'Декабрь', ru: 'Декабрь', en: 'Dec' },
    january: { uz: 'Yanvar', uzc: 'Январь', ru: 'Январь', en: 'Jan' },
    february: { uz: 'Fevral', uzc: 'Февраль', ru: 'Февраль', en: 'Feb' },
    march: { uz: 'Mart', uzc: 'Март', ru: 'Март', en: 'Mar' },
    april: { uz: 'Aprel', uzc: 'Апрель', ru: 'Апрель', en: 'Apr' },
    may: { uz: 'May', uzc: 'Май', ru: 'Май', en: 'May' },
    june: { uz: 'Iyun', uzc: 'Июнь', ru: 'Июнь', en: 'June' },
    july: { uz: 'Iyul', uzc: 'Июль', ru: 'Июль', en: 'July' },
    august: { uz: 'Avgust', uzc: 'Август', ru: 'Август', en: 'Aug' }
  }

  const trans = translations[monthLower]
  if (!trans) return englishMonthName
  return trans[currentLang] || trans['uz']
}

// Hover state for tooltip rendering
const hoveredIndex = ref<number | null>(null)
</script>

<template>
  <div
    class="border border-gray-200 rounded-2xl bg-white p-5 pt-3 h-[360px] flex flex-col justify-between"
  >
    <!-- Header with tab switches -->
    <div class="flex items-center justify-between pb-3 border-b border-gray-50 shrink-0">
      <h3 class="text-base font-bold text-gray-800 tracking-tight">
        {{ t('dashboard.monthly-stats', 'Oylar bo’yicha maktablar statistikasi') }}
      </h3>
      <div class="flex items-center gap-2">
        <button
          @click="activeTab = 'thisMonth'"
          class="px-[12px] py-[7px] text-sm font-semibold rounded-lg transition-all cursor-pointer border-none"
          :class="
            activeTab === 'thisMonth'
              ? 'bg-[#fff8f2] text-[#f18a22]'
              : 'bg-transparent text-gray-900 hover:text-[#f18a22]'
          "
        >
          {{ t('dashboard.this-month', 'Xozirgi oy') }}
        </button>
        <button
          @click="activeTab = 'lastMonth'"
          class="px-[12px] py-[7px] text-sm font-semibold rounded-lg transition-all cursor-pointer border-none"
          :class="
            activeTab === 'lastMonth'
              ? 'bg-[#fff8f2] text-[#f18a22]'
              : 'bg-transparent text-gray-900 hover:text-[#f18a22]'
          "
        >
          {{ t('dashboard.last-month', 'O’tgan oy') }}
        </button>
      </div>
    </div>

    <!-- Chart Body -->
    <div class="grow relative flex items-stretch mt-4">
      <!-- Loading Skeleton State -->
      <div v-if="isLoading" class="absolute inset-0 flex items-stretch gap-6 pt-6 pb-8 pl-12 pr-2">
        <div v-for="i in 9" :key="i" class="flex-1 flex flex-col justify-end items-center h-full">
          <div
            class="w-full max-w-[28px] bg-gray-100/70 rounded-t-xl animate-pulse"
            :style="{ height: `${[40, 60, 30, 50, 70, 45, 80, 55, 65][i - 1]}%` }"
          />
        </div>
      </div>

      <!-- Error State -->
      <div
        v-else-if="isError"
        class="absolute inset-0 flex flex-col items-center justify-center text-center p-4"
      >
        <AlertCircle class="w-10 h-10 text-red-500 mb-2" />
        <h4 class="text-sm font-semibold text-gray-800">
          {{ t('error_occurred', 'Xatolik yuz berdi') }}
        </h4>
        <Button
          @click="() => refetch()"
          size="sm"
          class="mt-2 h-8 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-none"
        >
          {{ t('dashboard.retry', 'Qayta urinish') }}
        </Button>
      </div>

      <!-- Live Chart Canvas -->
      <div v-else class="w-full flex">
        <!-- Y-Axis Labels -->
        <div
          class="w-10 flex flex-col justify-between text-right text-xs font-bold text-gray-400 pr-2 pb-8 pt-1 shrink-0 select-none"
        >
          <span v-for="(tick, idx) in yAxisTicks" :key="idx">{{ tick }}</span>
        </div>

        <!-- Grid Lines & Bars Area -->
        <div class="grow relative flex flex-col justify-between">
          <!-- Horizontal Dashed Grid Lines -->
          <div class="absolute inset-0 flex flex-col justify-between pb-8 pt-3 pointer-events-none">
            <div v-for="i in 6" :key="i" class="w-full border-t border-dashed border-gray-100" />
          </div>

          <!-- Vertical Bars Grid -->
          <div class="absolute inset-0 flex items-stretch gap-4 pl-2 pr-2 pb-8 pt-3">
            <div
              v-for="(month, index) in rawDataset"
              :key="index"
              class="flex-1 flex flex-col justify-end items-center relative group"
              @mouseenter="hoveredIndex = index"
              @mouseleave="hoveredIndex = null"
            >
              <!-- Bar Column (attends total height representation directly on the canvas) -->
              <div
                class="w-full max-w-[32px] bg-gradient-to-t from-[#3b82f6] to-[#93c5fd] rounded-[12px] transition-all duration-700 ease-out relative shrink-0 shadow-[inset_0_4px_12px_rgba(255,255,255,0.4)]"
                :style="{
                  height: `${Math.min(100, Math.max(12, (parseFloat(month.percentage) / maxPct) * 100))}%`
                }"
              >
                <!-- Inner glow overlay at the top representing highlighting -->
                <div class="absolute inset-0 rounded-[12px] bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
              </div>

              <!-- Premium Floating Tooltip positioned exactly in the center of the chart canvas for high visibility -->
              <div
                v-if="hoveredIndex === index"
                class="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-white text-gray-800 text-xs p-3.5 pb-3 pt-3 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] z-50 flex flex-col gap-1 w-[165px] pointer-events-none transition-all animate-fadeIn border border-gray-100"
              >
                <span class="font-bold text-[#f18a22] text-sm border-b border-gray-100 pb-1 mb-1 block">
                  {{ getMonthLabel(month.name) }}
                </span>
                <div class="flex justify-between items-center">
                  <span class="text-[#596881] font-medium">{{ t('dashboard.percentage', 'Ko’rsatkich') }}:</span>
                  <span class="font-bold text-gray-900 text-sm"
                    >{{ parseFloat(month.percentage).toFixed(2) }}%</span
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- X-Axis Labels Row -->
          <div
            class="w-full absolute bottom-0 h-6 flex items-center justify-between text-[11px] font-bold text-gray-500 pl-2 pr-2 select-none pointer-events-none"
          >
            <div
              v-for="(month, index) in rawDataset"
              :key="index"
              class="flex-1 text-center truncate px-0.5"
            >
              {{ getMonthLabel(month.name) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fadeIn {
  animation: tooltipFade 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes tooltipFade {
  from {
    opacity: 0;
    transform: translateY(4px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
