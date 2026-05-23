<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { AlertCircle, ArrowLeftIcon, ArrowRightIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { useGetSchoolDetails } from '../query/useGetSchoolDetails'

const { t } = useI18n()

const props = defineProps<{
  regionId?: number
  cityId?: number
  fromDate?: string
  toDate?: string
}>()

const currentPage = ref(1)

// Reset to page 1 whenever filters change
watch(
  () => [props.regionId, props.cityId, props.fromDate, props.toDate],
  () => {
    currentPage.value = 1
  }
)

const queryParams = computed(() => ({
  RegionId: props.regionId,
  CityId: props.cityId,
  PageIndex: currentPage.value,
  DateFrom: props.fromDate,
  DateTo: props.toDate
}))

const { data, isLoading, isError, refetch } = useGetSchoolDetails(queryParams)

const schoolRows = computed(() => {
  if (!data.value) return []
  return data.value.data || []
})

// Calculate absent percentage safely
const getAbsentPercent = (total: number, absents: number) => {
  if (total <= 0) return '0%'
  const pct = Math.round((absents / total) * 100)
  return `${pct}%`
}

// Format attended percentage safely
const getAttendedPercent = (pctString: string) => {
  const pct = parseFloat(pctString) || 0
  return `${Math.round(pct)}%`
}

// Same helper as in users list DataTable to get page ranges
const getPageNumbers = () => {
  const total = data.value?.totalPages || 1
  const current = currentPage.value
  const range: (number | string)[] = []

  if (total <= 7) {
    for (let i = 1; i <= total; i++) range.push(i)
  } else {
    if (current <= 4) {
      range.push(1, 2, 3, 4, 5, '...', total)
    } else if (current >= total - 3) {
      range.push(1, '...', total - 4, total - 3, total - 2, total - 1, total)
    } else {
      range.push(1, '...', current - 1, current, current + 1, '...', total)
    }
  }
  return range
}
</script>

<template>
  <div class="border border-gray-200 rounded-3xl bg-white p-6 flex flex-col w-full">
    <!-- Header Title -->
    <div class="pb-4 shrink-0">
      <h3 class="text-base font-bold text-gray-800 tracking-tight">
        {{
          t('dashboard.school-details.school-table-title', 'Maktablar bo’yicha batafsil statistika')
        }}
      </h3>
    </div>

    <!-- Table Wrapper with matching design -->
    <div class="relative border rounded-t-xl w-full overflow-auto">
      <Table class="text-nowrap">
        <!-- Table Header -->
        <TableHeader class="sticky top-0 bg-white drop-shadow-sm z-20">
          <TableRow>
            <TableHead
              class="text-nowrap text-sm text-[#74757d] select-none border border-t-0 p-3 pl-4 first:pl-3 relative border-l-0 font-semibold bg-[#f2f5f4]"
            >
              {{ t('dashboard.school-details.school', 'Maktab') }}
            </TableHead>
            <TableHead
              class="text-nowrap text-sm text-[#74757d] select-none border border-t-0 p-3 pl-4 first:pl-3 relative font-semibold bg-[#f2f5f4]"
            >
              {{ t('dashboard.school-details.all-students', "Barcha o'quvchilar") }}
            </TableHead>
            <TableHead
              class="text-nowrap text-sm text-[#74757d] select-none border border-t-0 p-3 pl-4 first:pl-3 relative font-semibold bg-[#f2f5f4]"
            >
              {{ t('dashboard.school-details.boys', "O'g'il bolalar") }}
            </TableHead>
            <TableHead
              class="text-nowrap text-sm text-[#74757d] select-none border border-t-0 p-3 pl-4 first:pl-3 relative font-semibold bg-[#f2f5f4]"
            >
              {{ t('dashboard.school-details.girls', 'Qiz bolalar') }}
            </TableHead>
            <TableHead
              class="text-nowrap text-sm text-[#74757d] select-none border border-t-0 p-3 pl-4 first:pl-3 relative font-semibold bg-[#f2f5f4]"
            >
              {{ t('dashboard.school-details.attended', 'Kelganlar (%)') }}
            </TableHead>
            <TableHead
              class="text-nowrap text-sm text-[#74757d] select-none border border-t-0 p-3 pl-4 first:pl-3 relative border-r-0 font-semibold bg-[#f2f5f4]"
            >
              {{ t('dashboard.school-details.absent', 'Kelmaganlar (%)') }}
            </TableHead>
          </TableRow>
        </TableHeader>

        <!-- Table Body -->
        <TableBody>
          <!-- Loading skeleton state -->
          <template v-if="isLoading">
            <TableRow v-for="i in 10" :key="i" class="animate-pulse">
              <TableCell class="border p-2 font-medium pl-3 first:pl-3 border-l-0"
                ><div class="h-4 bg-gray-100 rounded w-48"></div
              ></TableCell>
              <TableCell class="border p-2 font-medium pl-3 first:pl-3"
                ><div class="h-4 bg-gray-100 rounded w-12"></div
              ></TableCell>
              <TableCell class="border p-2 font-medium pl-3 first:pl-3"
                ><div class="h-4 bg-gray-100 rounded w-12"></div
              ></TableCell>
              <TableCell class="border p-2 font-medium pl-3 first:pl-3"
                ><div class="h-4 bg-gray-100 rounded w-12"></div
              ></TableCell>
              <TableCell class="border p-2 font-medium pl-3 first:pl-3"
                ><div class="h-4 bg-gray-100 rounded w-16"></div
              ></TableCell>
              <TableCell class="border p-2 font-medium pl-3 first:pl-3 border-r-0"
                ><div class="h-4 bg-gray-100 rounded w-16"></div
              ></TableCell>
            </TableRow>
          </template>

          <!-- Error state -->
          <template v-else-if="isError">
            <TableRow>
              <TableCell colspan="6" class="h-24 text-center border-l-0 border-r-0">
                <div class="flex flex-col items-center justify-center py-6">
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
              </TableCell>
            </TableRow>
          </template>

          <!-- No Data State -->
          <template v-else-if="schoolRows.length === 0">
            <TableRow>
              <TableCell
                colspan="6"
                class="h-24 text-center border-l-0 border-r-0 text-gray-400 font-medium"
              >
                {{ t('no-data', "Ma'lumot yo'q") }}
              </TableCell>
            </TableRow>
          </template>

          <!-- Rows list -->
          <template v-else>
            <TableRow
              v-for="(school, rowIndex) in schoolRows"
              :key="school.id"
              class="hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <!-- First Cell: Maktab -->
              <TableCell
                :class="[
                  'border p-2 font-medium pl-3 first:pl-3 border-l-0 text-gray-800 font-semibold',
                  rowIndex === 0 ? 'border-t-0' : '',
                  rowIndex === schoolRows.length - 1 ? 'border-b-0' : ''
                ]"
              >
                {{ school.name }}
              </TableCell>

              <!-- Second Cell: Total Students -->
              <TableCell
                :class="[
                  'border p-2 font-medium pl-3 first:pl-3 text-gray-600',
                  rowIndex === 0 ? 'border-t-0' : '',
                  rowIndex === schoolRows.length - 1 ? 'border-b-0' : ''
                ]"
              >
                {{ school.totalStudents }}
              </TableCell>

              <!-- Third Cell: Boys Count -->
              <TableCell
                :class="[
                  'border p-2 font-medium pl-3 first:pl-3 text-gray-600',
                  rowIndex === 0 ? 'border-t-0' : '',
                  rowIndex === schoolRows.length - 1 ? 'border-b-0' : ''
                ]"
              >
                {{ school.boysCount }}
              </TableCell>

              <!-- Fourth Cell: Girls Count -->
              <TableCell
                :class="[
                  'border p-2 font-medium pl-3 first:pl-3 text-gray-600',
                  rowIndex === 0 ? 'border-t-0' : '',
                  rowIndex === schoolRows.length - 1 ? 'border-b-0' : ''
                ]"
              >
                {{ school.girlsCount }}
              </TableCell>

              <!-- Fifth Cell: Attended Percent -->
              <TableCell
                :class="[
                  'border p-2 font-medium pl-3 first:pl-3 text-gray-800 font-bold',
                  rowIndex === 0 ? 'border-t-0' : '',
                  rowIndex === schoolRows.length - 1 ? 'border-b-0' : ''
                ]"
              >
                {{ getAttendedPercent(school.percentage) }}
              </TableCell>

              <!-- Sixth Cell: Absent Percent -->
              <TableCell
                :class="[
                  'border p-2 font-medium pl-3 first:pl-3 text-gray-800 font-bold border-r-0',
                  rowIndex === 0 ? 'border-t-0' : '',
                  rowIndex === schoolRows.length - 1 ? 'border-b-0' : ''
                ]"
              >
                {{ getAbsentPercent(school.totalStudents, school.absentsCount) }}
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>

    <!-- Pagination Footer identical to standard DataTable footer -->
    <div
      v-if="data && data.totalPages > 0"
      class="flex items-center justify-between border border-t-0 rounded-b-lg px-4 py-3 text-sm text-gray-600 bg-white"
    >
      <!-- Left side page info text -->
      <span class="text-sm font-semibold text-[#596881]">
        {{
          t('dashboard.school-details.page-info', {
            current: data.currentPage,
            total: data.totalPages
          })
        }}
      </span>

      <!-- Right side pagination buttons (Standard New Style matching users table) -->
      <div class="flex items-center gap-2">
        <!-- Prev Button -->
        <button
          class="w-8 h-8 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          :disabled="currentPage === 1"
          @click="currentPage > 1 && currentPage--"
        >
          <ArrowLeftIcon class="w-4 h-4" />
        </button>

        <!-- Numbers Container -->
        <div class="flex items-center gap-1 bg-[#f4f4f5] p-1 rounded-lg">
          <template v-for="page in getPageNumbers()" :key="page">
            <span v-if="page === '...'" class="px-2 text-gray-400 font-medium select-none text-sm">
              ...
            </span>

            <button
              v-else
              class="min-w-[28px] h-7 px-2 flex items-center justify-center text-sm font-medium rounded-lg transition-all cursor-pointer border-none"
              :class="[
                page === currentPage
                  ? 'bg-white text-black shadow-sm font-semibold'
                  : 'text-gray-600 hover:text-black font-semibold hover:bg-gray-200/50'
              ]"
              @click="currentPage = page as number"
            >
              {{ page }}
            </button>
          </template>
        </div>

        <!-- Next Button -->
        <button
          class="w-8 h-8 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          :disabled="currentPage >= data.totalPages"
          @click="currentPage < data.totalPages && currentPage++"
        >
          <ArrowRightIcon class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>
