<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { AlertCircle } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { useGetWeeklyPerformance } from '../query/useGetWeeklyPerformance'

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

const { data, isLoading, isError, refetch } = useGetWeeklyPerformance(queryParams)

// Tab state: 'thisWeek' (Hozirgi hafta) vs 'lastWeek' (O'tgan hafta)
const activeTab = ref<'thisWeek' | 'lastWeek'>('thisWeek')

// Active dataset based on tab
const activeDataset = computed(() => {
  if (!data.value) return []
  return activeTab.value === 'thisWeek'
    ? data.value.thisWeekPerformance || []
    : data.value.lastWeekPerformance || []
})

// Calculate dynamic Y-axis maximum
const maxVal = computed(() => {
  if (activeDataset.value.length === 0) return 10
  const values = activeDataset.value.map((d) => d.attendedCount + d.notAttendedCount)
  const max = Math.max(...values, 0)
  return max === 0 ? 10 : Math.ceil(max * 1.1) // 10% breathing room
})

// Generate clean Y-axis ticks
const yAxisTicks = computed(() => {
  const steps = 4
  const ticks = []
  for (let i = steps; i >= 0; i--) {
    ticks.push(Math.round((maxVal.value / steps) * i))
  }
  return ticks
})

// Localized date formatting for tooltips
const formatDateString = (isoString: string) => {
  try {
    const date = new Date(isoString)
    const day = date.getDate()
    const monthIdx = date.getMonth()
    const currentLang = locale.value

    let monthName = ''
    if (currentLang === 'ru') {
      const ruMonths = [
        'Января',
        'Февраля',
        'Марта',
        'Апреля',
        'Мая',
        'Июня',
        'Июля',
        'Августа',
        'Сентября',
        'Октября',
        'Ноября',
        'Декабря'
      ]
      monthName = ruMonths[monthIdx]
    } else if (currentLang === 'uzc') {
      const uzcMonths = [
        'Январь',
        'Февраль',
        'Март',
        'Апрель',
        'Май',
        'Июнь',
        'Июль',
        'Август',
        'Сентябрь',
        'Октябрь',
        'Ноябрь',
        'Декабрь'
      ]
      monthName = uzcMonths[monthIdx]
    } else if (currentLang === 'uz') {
      const uzMonths = [
        'Yanvar',
        'Fevral',
        'Mart',
        'Aprel',
        'May',
        'Iyun',
        'Iyul',
        'Avgust',
        'Sentabr',
        'Oktabr',
        'Noyabr',
        'Dekabr'
      ]
      monthName = uzMonths[monthIdx]
    } else {
      const enMonths = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
      ]
      monthName = enMonths[monthIdx]
    }

    return `${day}-${monthName}`
  } catch {
    return isoString
  }
}

// Localized day labels
const getDayLabel = (index: number) => {
  const currentLang = locale.value
  const daysMap: Record<string, string[]> = {
    uz: ['Du', 'Se', 'Chor', 'Pa', 'Ju', 'Sh'],
    uzc: ['Ду', 'Се', 'Чор', 'Па', 'Жу', 'Ш'],
    ru: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
  }
  const days = daysMap[currentLang] || daysMap['uz']
  return days[index] || ''
}

// Hover state for tooltip rendering
const hoveredIndex = ref<number | null>(null)
</script>

<template>
  <div
    class="border border-gray-200 rounded-2xl bg-white p-5 pt-3 h-[360px] flex flex-col justify-between"
  >
    <!-- Header with tab switches -->
    <div class="flex items-center justify-between">
      <h3 class="text-base font-bold text-gray-800 tracking-tight">
        {{ t('dashboard.weekly-stats', 'Haftalar bo’yicha maktablar statistikasi') }}
      </h3>
      <div class="flex items-center gap-2">
        <button
          @click="activeTab = 'thisWeek'"
          class="px-[12px] py-[7px] text-sm font-semibold rounded-lg transition-all cursor-pointer border-none"
          :class="
            activeTab === 'thisWeek'
              ? 'bg-[#fff8f2] text-[#f18a22]'
              : 'bg-transparent text-gray-900 hover:text-[#f18a22]'
          "
        >
          {{ t('dashboard.this-week', 'Hozirgi xafta') }}
        </button>
        <button
          @click="activeTab = 'lastWeek'"
          class="px-[12px] py-[7px] text-sm font-semibold rounded-lg transition-all cursor-pointer border-none"
          :class="
            activeTab === 'lastWeek'
              ? 'bg-[#fff8f2] text-[#f18a22]'
              : 'bg-transparent text-gray-900 hover:text-[#f18a22]'
          "
        >
          {{ t('dashboard.last-week', 'O’tgan xafta') }}
        </button>
      </div>
    </div>

    <!-- Chart Body -->
    <div class="grow relative flex items-stretch mt-4">
      <!-- Loading Skeleton State -->
      <div v-if="isLoading" class="absolute inset-0 flex items-stretch gap-8 pt-6 pb-8 pl-10 pr-2">
        <div v-for="i in 6" :key="i" class="flex-1 flex flex-col justify-end items-center h-full">
          <div
            class="w-full max-w-[40px] bg-gray-100/70 rounded-t-xl animate-pulse"
            :style="{ height: `${[50, 80, 40, 70, 90, 60][i - 1]}%` }"
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
          class="w-8 flex flex-col justify-between text-right text-xs font-bold text-gray-400 pr-2 pb-8 pt-1 shrink-0 select-none"
        >
          <span v-for="(tick, idx) in yAxisTicks" :key="idx">{{ tick }}</span>
        </div>

        <!-- Grid Lines & Bars Area -->
        <div class="grow relative flex flex-col justify-between">
          <!-- Horizontal Dashed Grid Lines -->
          <div class="absolute inset-0 flex flex-col justify-between pb-8 pt-3 pointer-events-none">
            <div v-for="i in 5" :key="i" class="w-full border-t border-dashed border-gray-100" />
          </div>

          <!-- Vertical Bars Grid -->
          <div class="absolute inset-0 flex items-stretch gap-3 sm:gap-4 pl-2 pr-2 pb-8 pt-3">
            <div
              v-for="(day, index) in activeDataset"
              :key="index"
              class="flex-1 flex flex-col justify-end items-center relative group"
              @mouseenter="hoveredIndex = index"
              @mouseleave="hoveredIndex = null"
            >
              <!-- Bar Column (attends total height representation directly on the canvas) -->
              <div
                class="w-full max-w-[54px] bg-gradient-to-t from-[#f97316] to-[#fbe165] rounded-[18px] transition-all duration-700 ease-out relative shrink-0 shadow-[inset_0_4px_12px_rgba(255,255,255,0.4)]"
                :style="{
                  height: `${Math.min(100, Math.max(12, (day.attendedCount / maxVal) * 100))}%`
                }"
              >
                <!-- Inner glow overlay at the top representing mockup highlighting -->
                <div class="absolute inset-0 rounded-[18px] bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
              </div>

              <!-- Premium Floating Tooltip positioned exactly in the center of the chart canvas for high visibility -->
              <div
                v-if="hoveredIndex === index"
                class="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-white text-gray-800 text-xs p-3.5 pb-3 pt-3 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] z-50 flex flex-col gap-1 w-[165px] pointer-events-none transition-all animate-fadeIn border border-gray-100"
              >
                <span
                  class="font-bold text-[#f18a22] text-sm border-b border-gray-100 pb-1 mb-1 block"
                >
                  {{ formatDateString(day.date) }}
                </span>
                <div class="flex justify-between items-center">
                  <span class="text-[#596881] font-medium">{{ t('dashboard.attended', 'Kelganlar') }}:</span>
                  <span class="font-bold text-gray-900 text-sm">{{ day.attendedCount }}</span>
                </div>
                <div class="flex justify-between items-center mt-0.5">
                  <span class="text-[#8a92a6] font-medium">{{ t('dashboard.absent', 'Kelmaganlar') }}:</span>
                  <span class="font-bold text-[#8a92a6] text-sm">{{ day.notAttendedCount }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- X-Axis Labels Row -->
          <div
            class="w-full absolute bottom-0 h-6 flex items-center justify-between text-xs font-bold text-gray-500 pl-2 pr-2 select-none pointer-events-none"
          >
            <div v-for="(day, index) in activeDataset" :key="index" class="flex-1 text-center">
              {{ getDayLabel(index) }}
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
