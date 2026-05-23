<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { AlertCircle } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

import { useGetDashboardStats } from '../query/useGetDashboardStats'
import type { SchoolsNumberParams } from '../type'

const { t } = useI18n()

const props = defineProps<{
  regionId?: number
  cityId?: number
  fromDate?: string
  toDate?: string
}>()

// Reactively build params passed down from props
const params = computed<SchoolsNumberParams>(() => ({
  regionId: props.regionId,
  cityId: props.cityId,
  fromDate: props.fromDate,
  toDate: props.toDate
}))

// Fetch dashboard stats reacting to params
const { data, isLoading, isError, refetch } = useGetDashboardStats(params)

// Utility to format numbers with thin space grouping
const formatNumber = (num: number | undefined) => {
  if (num === undefined || num === null) return '0'
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}
</script>

<template>
  <div class="mt-1">
    <!-- Loading State Skeleton -->
    <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="i in 4"
        :key="i"
        class="flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm animate-pulse"
      >
        <div class="w-14 h-14 rounded-2xl bg-gray-100 shrink-0" />
        <div class="space-y-2 w-full">
          <div class="h-3 bg-gray-100 rounded w-2/3" />
          <div class="h-6 bg-gray-100 rounded w-1/2" />
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="isError"
      class="flex flex-col items-center justify-center py-16 px-4 border border-red-100 bg-red-50/30 rounded-2xl text-center"
    >
      <AlertCircle class="w-12 h-12 text-red-500 mb-3" />
      <h3 class="text-base font-bold text-red-800">
        {{ t('error_occurred', 'Xatolik yuz berdi') }}
      </h3>
      <p class="text-sm text-red-600/80 mt-1 max-w-md">
        {{
          t(
            'dashboard.failed-to-load',
            "Statistika ma'lumotlarini yuklashda xatolik yuz berdi. Iltimos qayta urinib ko'ring."
          )
        }}
      </p>
      <Button
        @click="() => refetch()"
        class="mt-4 px-5 py-2 h-9 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-all cursor-pointer shadow-none"
      >
        {{ t('dashboard.retry', 'Qayta urinish') }}
      </Button>
    </div>

    <!-- Statistics Cards -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeIn">
      <!-- Card 1: Barcha Maktablar -->
      <div class="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-2xl">
        <div
          class="flex items-center justify-center w-14 h-14 rounded-2xl bg-[#6366f1] text-white shrink-0 shadow-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            viewBox="0 0 30 30"
            fill="none"
          >
            <path
              d="M2.49475 26.2542H27.5052"
              stroke="white"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M10.6232 21.1956H19.3768"
              stroke="white"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M15 21.1953V26.2537"
              stroke="white"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M3.74536 26.2542V17.5005C3.74536 16.8099 4.30524 16.25 4.99588 16.25H7.49692"
              stroke="white"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M22.5032 16.25H25.0042C25.6949 16.25 26.2547 16.8099 26.2547 17.5005V26.2542"
              stroke="white"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M7.49683 26.2532V12.9439C7.49595 12.4963 7.73441 12.0823 8.12209 11.8585L14.3747 8.28576C14.7591 8.06621 15.2309 8.06621 15.6152 8.28576L21.8678 11.8585C22.2555 12.0823 22.494 12.4963 22.4931 12.9439V26.2532"
              stroke="white"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M15 11.883C14.9834 11.883 14.9675 11.8896 14.9558 11.9014C14.9441 11.9131 14.9375 11.929 14.9375 11.9456C14.9375 11.9801 14.9655 12.0081 15 12.0081C15.0345 12.0081 15.0625 11.9801 15.0625 11.9456C15.0625 11.929 15.056 11.9131 15.0442 11.9014C15.0325 11.8896 15.0166 11.883 15 11.883"
              stroke="white"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M18.7516 21.1953V26.2537"
              stroke="white"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M11.2484 26.2537V21.1953"
              stroke="white"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M15 8.12148V3.1194C15 2.77408 15.2799 2.49414 15.6253 2.49414H19.3768C19.7221 2.49414 20.0021 2.77408 20.0021 3.1194V4.89264C20.0021 5.23796 19.7221 5.5179 19.3768 5.5179H15"
              stroke="white"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M18.7515 16.2503H11.2484"
              stroke="white"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <div class="min-w-0">
          <span
            class="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-0.5 truncate"
          >
            {{ t('dashboard.all-schools', 'Barcha maktablar') }}
          </span>
          <span class="text-[26px] font-extrabold text-gray-900 leading-tight">
            {{ formatNumber(data?.allSchoolsNumber) }}
          </span>
        </div>
      </div>

      <!-- Card 2: Ulangan Maktablar -->
      <div class="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-2xl">
        <div
          class="flex items-center justify-center w-14 h-14 rounded-2xl bg-[#3b82f6] text-white shrink-0 shadow-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="26"
            height="26"
            viewBox="0 0 26 26"
            fill="none"
          >
            <path
              d="M13 3.25C8.84569 3.25 5.37631 5.8175 3.96094 9.44531L5.45919 10.0547C6.643 7.02081 9.51438 4.875 13 4.875C15.6341 4.875 17.9831 6.16687 19.4496 8.125H16.25V9.75H21.9375V4.0625H20.3125V6.57638C19.4019 5.53183 18.2781 4.69448 17.0167 4.1207C15.7554 3.54692 14.3857 3.25003 13 3.25ZM20.5408 15.9453C19.357 18.9792 16.4856 21.125 13 21.125C10.3374 21.125 7.99825 19.8144 6.52519 17.875H9.75V16.25H4.0625V21.9375H5.6875V19.4236C7.46525 21.4386 10.0709 22.75 13 22.75C17.1543 22.75 20.6237 20.1825 22.0391 16.5547L20.5408 15.9453Z"
              fill="white"
            />
          </svg>
        </div>
        <div class="min-w-0">
          <span
            class="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-0.5 truncate"
          >
            {{ t('dashboard.connected-schools', 'Ulangan maktablar') }}
          </span>
          <span class="text-[26px] font-extrabold text-gray-900 leading-tight">
            {{ formatNumber(data?.connectedSchoolsNumber) }}
          </span>
        </div>
      </div>

      <!-- Card 3: O'quvchilar soni (represented by teachersCount in api) -->
      <div class="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-2xl">
        <div
          class="flex items-center justify-center w-14 h-14 rounded-2xl bg-[#2dd4bf] text-white shrink-0 shadow-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="26"
            height="26"
            viewBox="0 0 26 26"
            fill="none"
          >
            <path
              d="M19.5 12.9995V17.3328C19.5 19.1277 18.0449 20.5828 16.25 20.5828H9.74996C7.95503 20.5828 6.49996 19.1277 6.49996 17.3328V12.9995M12.031 5.90062L2.16663 10.8328L12.031 15.765C12.641 16.07 13.3589 16.07 13.9689 15.765L23.8333 10.8328L13.9689 5.90062C13.3589 5.59563 12.641 5.59563 12.031 5.90062Z"
              stroke="white"
              stroke-width="1.95"
              stroke-linejoin="round"
            />
            <path
              d="M23.8334 10.834V17.334"
              stroke="white"
              stroke-width="1.95"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <div class="min-w-0">
          <span
            class="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-0.5 truncate"
          >
            {{ t('dashboard.teachers-count', 'O’quvchilar soni') }}
          </span>
          <span class="text-[26px] font-extrabold text-gray-900 leading-tight">
            {{ formatNumber(data?.teachersCount) }}
          </span>
        </div>
      </div>

      <!-- Card 4: Kelmagan o'quvchilar (represented by absentTeachersCount in api) -->
      <div class="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-2xl">
        <div
          class="flex items-center justify-center w-14 h-14 rounded-2xl bg-[#3b82f6] text-white shrink-0 shadow-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="26"
            height="26"
            viewBox="0 0 26 26"
            fill="none"
          >
            <path
              d="M13 3.25C8.84569 3.25 5.37631 5.8175 3.96094 9.44531L5.45919 10.0547C6.643 7.02081 9.51438 4.875 13 4.875C15.6341 4.875 17.9831 6.16687 19.4496 8.125H16.25V9.75H21.9375V4.0625H20.3125V6.57638C19.4019 5.53183 18.2781 4.69448 17.0167 4.1207C15.7554 3.54692 14.3857 3.25003 13 3.25ZM20.5408 15.9453C19.357 18.9792 16.4856 21.125 13 21.125C10.3374 21.125 7.99825 19.8144 6.52519 17.875H9.75V16.25H4.0625V21.9375H5.6875V19.4236C7.46525 21.4386 10.0709 22.75 13 22.75C17.1543 22.75 20.6237 20.1825 22.0391 16.5547L20.5408 15.9453Z"
              fill="white"
            />
          </svg>
        </div>
        <div class="min-w-0">
          <span
            class="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-0.5 truncate"
          >
            {{ t('dashboard.absent-teachers-count', 'Kelmagan o’quvchilar') }}
          </span>
          <span class="text-[26px] font-extrabold text-gray-900 leading-tight">
            {{ formatNumber(data?.absentTeachersCount) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
