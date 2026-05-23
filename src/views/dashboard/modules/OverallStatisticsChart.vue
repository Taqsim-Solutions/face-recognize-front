<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { AlertCircle } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { useGetOverallStatistics } from '../query/useGetOverallStatistics'

const { t } = useI18n()

const props = defineProps<{
  regionId?: number
  cityId?: number
  fromDate?: string
  toDate?: string
}>()

const queryParams = computed(() => ({
  RegionId: props.regionId,
  CityId: props.cityId,
  DateFrom: props.fromDate,
  DateTo: props.toDate
}))

const { data, isLoading, isError, refetch } = useGetOverallStatistics(queryParams)

const total = computed(() => data.value?.totalStudents || 0)
const boys = computed(() => data.value?.boysCount || 0)
const girls = computed(() => data.value?.girlsCount || 0)
const absents = computed(() => data.value?.absentsCount || 0)

// Helper to calculate percentages safely
const getPercent = (count: number) => {
  if (total.value <= 0) return 0
  return Math.round((count / total.value) * 100)
}

// Heights for columns (scaled relative to max height of 150px)
const getCylinderHeight = (count: number, isTotal = false) => {
  if (isTotal) return '135px'
  if (total.value <= 0) return '15px' // minimum visible base height
  const proportion = count / total.value
  const height = Math.max(15, proportion * 135)
  return `${height}px`
}
</script>

<template>
  <div
    class="border border-gray-200 rounded-3xl bg-white p-6 pb-5 pt-5 h-[350px] flex flex-col justify-between"
  >
    <!-- Header Title (no bottom border line, matching modern layout) -->
    <div class="flex items-center justify-between shrink-0">
      <h3 class="text-[17px] font-bold text-gray-900 tracking-tight">
        {{ t('dashboard.student-stats-title', 'O\'quvchilar statistikasi') }}
      </h3>
    </div>

    <!-- Chart Body -->
    <div class="grow relative flex flex-col justify-between mt-3">
      <!-- Loading Skeleton State -->
      <div v-if="isLoading" class="absolute inset-0 flex items-end justify-around pb-8 px-4 h-[180px]">
        <div v-for="i in 4" :key="i" class="w-[34px] bg-gray-100 rounded-b-xl animate-pulse" :style="{ height: `${[135, 90, 45, 20][i-1]}px` }" />
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

      <!-- Cylinder Charts Area -->
      <div v-else class="grow flex items-end justify-around pb-4 px-1 h-[180px] gap-1 sm:gap-2">
        <!-- 1. Total Students Cylinder (Orange) -->
        <div class="flex-1 flex flex-col items-center max-w-[130px]">
          <span class="font-extrabold text-gray-900 text-lg sm:text-[22px] leading-none">{{ total }}</span>
          <span class="text-xs sm:text-sm text-gray-400 font-semibold mt-1 mb-3">100%</span>
          <div
            class="relative w-full max-w-[110px] bg-gradient-to-t from-[#f97316] to-[#facc15] rounded-b-[24px] transition-all duration-700 ease-out shrink-0"
            :style="{ height: getCylinderHeight(total, true) }"
          >
            <!-- 3D Top Ellipse -->
            <div class="absolute top-0 left-0 w-full h-[22px] -translate-y-[11px] rounded-[50%] bg-[#fde047] z-10" />
          </div>
        </div>

        <!-- 2. Boys Cylinder (Blue) -->
        <div class="flex-1 flex flex-col items-center max-w-[130px]">
          <span class="font-extrabold text-gray-900 text-lg sm:text-[22px] leading-none">{{ boys }}</span>
          <span class="text-xs sm:text-sm text-gray-400 font-semibold mt-1 mb-3">{{ getPercent(boys) }}%</span>
          <div
            class="relative w-full max-w-[110px] bg-gradient-to-t from-[#2563eb] to-[#3b82f6] rounded-b-[24px] transition-all duration-700 ease-out shrink-0"
            :style="{ height: getCylinderHeight(boys) }"
          >
            <!-- 3D Top Ellipse -->
            <div class="absolute top-0 left-0 w-full h-[22px] -translate-y-[11px] rounded-[50%] bg-[#93c5fd] z-10" />
          </div>
        </div>

        <!-- 3. Girls Cylinder (Purple) -->
        <div class="flex-1 flex flex-col items-center max-w-[130px]">
          <span class="font-extrabold text-gray-900 text-lg sm:text-[22px] leading-none">{{ girls }}</span>
          <span class="text-xs sm:text-sm text-gray-400 font-semibold mt-1 mb-3">{{ getPercent(girls) }}%</span>
          <div
            class="relative w-full max-w-[110px] bg-gradient-to-t from-[#9333ea] to-[#c084fc] rounded-b-[24px] transition-all duration-700 ease-out shrink-0"
            :style="{ height: getCylinderHeight(girls) }"
          >
            <!-- 3D Top Ellipse -->
            <div class="absolute top-0 left-0 w-full h-[22px] -translate-y-[11px] rounded-[50%] bg-[#f5d0fe] z-10" />
          </div>
        </div>

        <!-- 4. Absents Cylinder (Red) -->
        <div class="flex-1 flex flex-col items-center max-w-[130px]">
          <span class="font-extrabold text-gray-900 text-lg sm:text-[22px] leading-none">{{ absents }}</span>
          <span class="text-xs sm:text-sm text-gray-400 font-semibold mt-1 mb-3">{{ getPercent(absents) }}%</span>
          <div
            class="relative w-full max-w-[110px] bg-gradient-to-t from-[#dc2626] to-[#f87171] rounded-b-[24px] transition-all duration-700 ease-out shrink-0"
            :style="{ height: getCylinderHeight(absents) }"
          >
            <!-- 3D Top Ellipse -->
            <div class="absolute top-0 left-0 w-full h-[22px] -translate-y-[11px] rounded-[50%] bg-[#fca5a5] z-10" />
          </div>
        </div>
      </div>

      <!-- Legend row (no top border separator, matching modern clean canvas) -->
      <div class="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 pt-3 select-none">
        <div class="flex items-center gap-2 text-xs sm:text-[13px] font-semibold text-[#596881]">
          <span class="w-3 h-3 rounded-full bg-[#f97316] shrink-0" />
          {{ t('dashboard.overall.students', 'O\'quvchilar') }}
        </div>
        <div class="flex items-center gap-2 text-xs sm:text-[13px] font-semibold text-[#596881]">
          <span class="w-3 h-3 rounded-full bg-[#2563eb] shrink-0" />
          {{ t('dashboard.overall.boys', 'O\'g\'il bolalar') }}
        </div>
        <div class="flex items-center gap-2 text-xs sm:text-[13px] font-semibold text-[#596881]">
          <span class="w-3 h-3 rounded-full bg-[#9333ea] shrink-0" />
          {{ t('dashboard.overall.girls', 'Qiz bolalar') }}
        </div>
        <div class="flex items-center gap-2 text-xs sm:text-[13px] font-semibold text-[#596881]">
          <span class="w-3 h-3 rounded-full bg-[#dc2626] shrink-0" />
          {{ t('dashboard.overall.absents', 'Kelmaganlar') }}
        </div>
      </div>
    </div>
  </div>
</template>
