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
import { useGetAbsents } from '../query/useGetAbsents'

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
  DateFrom: props.fromDate,
  DateTo: props.toDate,
  PageIndex: currentPage.value,
  isDescending: false
}))

const { data, isLoading, isError, refetch } = useGetAbsents(queryParams)

const absentRows = computed(() => {
  if (!data.value) return []
  return data.value.data || []
})

// Safe helper to extract initials
const getInitials = (item: any) => {
  const last = item.lastName || ''
  const first = item.firstName || item.studentName || ''
  const char1 = last.charAt(0).toUpperCase()
  const char2 = first.charAt(0).toUpperCase()
  return `${char1}${char2}` || '?'
}

// Safe helper to extract full name
const getFullName = (item: any) => {
  if (item.studentName) return item.studentName
  if (item.lastName || item.firstName) {
    return [item.lastName, item.firstName, item.fatherName].filter(Boolean).join(' ')
  }
  return '—'
}

// Safe helper to extract school name
const getSchoolName = (item: any) => {
  return item.schoolName || item.school || '—'
}

// Safe helper to extract class name
const getClassName = (item: any) => {
  return item.className || item.class || '—'
}

// Page ranges helper (matches other paginated tables exactly)
const getPageNumbers = () => {
  const total = data.value?.totalPages || 1
  const current = currentPage.value
  const range: (number | string)[] = []

  if (total <= 5) {
    for (let i = 1; i <= total; i++) range.push(i)
  } else {
    if (current <= 3) {
      range.push(1, 2, 3, '...', total)
    } else if (current >= total - 2) {
      range.push(1, '...', total - 2, total - 1, total)
    } else {
      range.push(1, '...', current, '...', total)
    }
  }
  return range
}
</script>

<template>
  <div
    class="border border-gray-200 rounded-3xl bg-white p-6 pb-5 pt-5 h-[350px] flex flex-col justify-between"
  >
    <!-- Header Title -->
    <div class="flex items-center justify-between pb-3 border-b border-gray-50 shrink-0">
      <h3 class="text-base font-bold text-gray-800 tracking-tight">
        {{ t('dashboard.absents.title', 'Kelmaganlar') }}
      </h3>
    </div>

    <!-- Table Wrapper -->
    <div class="grow relative mt-1 overflow-auto border rounded-t-xl">
      <Table class="text-nowrap">
        <!-- Table Header -->
        <TableHeader class="sticky top-0 bg-white drop-shadow-sm z-20">
          <TableRow>
            <TableHead
              class="text-nowrap text-sm text-[#74757d] select-none border border-t-0 p-3 pl-4 first:pl-3 relative border-l-0 font-semibold bg-[#f2f5f4]"
            >
              {{ t('dashboard.absents.fish', 'F.I.Sh') }}
            </TableHead>
            <TableHead
              class="text-nowrap text-sm text-[#74757d] select-none border border-t-0 p-3 pl-4 first:pl-3 relative font-semibold bg-[#f2f5f4]"
            >
              {{ t('dashboard.absents.school', 'Maktab') }}
            </TableHead>
            <TableHead
              class="text-nowrap text-sm text-[#74757d] select-none border border-t-0 p-3 pl-4 first:pl-3 relative border-r-0 font-semibold bg-[#f2f5f4]"
            >
              {{ t('dashboard.absents.class', 'Sinf') }}
            </TableHead>
          </TableRow>
        </TableHeader>

        <!-- Table Body -->
        <TableBody>
          <!-- Loading skeleton state -->
          <template v-if="isLoading">
            <TableRow v-for="i in 4" :key="i" class="animate-pulse">
              <TableCell class="border p-2 font-medium pl-3 first:pl-3 border-l-0">
                <div class="flex items-center">
                  <div class="w-8 h-8 rounded-full bg-gray-100 mr-3 shrink-0" />
                  <div class="h-4 bg-gray-100 rounded w-28" />
                </div>
              </TableCell>
              <TableCell class="border p-2 font-medium pl-3 first:pl-3"
                ><div class="h-4 bg-gray-100 rounded w-20"></div
              ></TableCell>
              <TableCell class="border p-2 font-medium pl-3 first:pl-3 border-r-0"
                ><div class="h-4 bg-gray-100 rounded w-16"></div
              ></TableCell>
            </TableRow>
          </template>

          <!-- Error state -->
          <template v-else-if="isError">
            <TableRow>
              <TableCell colspan="3" class="h-40 text-center border-l-0 border-r-0">
                <div class="flex flex-col items-center justify-center py-4">
                  <AlertCircle class="w-8 h-8 text-red-500 mb-1" />
                  <h4 class="text-xs font-semibold text-gray-800">
                    {{ t('error_occurred', 'Xatolik yuz berdi') }}
                  </h4>
                  <Button
                    @click="() => refetch()"
                    size="sm"
                    class="mt-2 h-7 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-none text-xs"
                  >
                    {{ t('dashboard.retry', 'Qayta urinish') }}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </template>

          <!-- No Data State -->
          <template v-else-if="absentRows.length === 0">
            <TableRow>
              <TableCell
                colspan="3"
                class="h-40 text-center border-l-0 border-r-0 text-gray-400 font-medium"
              >
                {{ t('no-data', "Ma'lumot yo'q") }}
              </TableCell>
            </TableRow>
          </template>

          <!-- Rows list -->
          <template v-else>
            <TableRow
              v-for="(student, rowIndex) in absentRows"
              :key="student.id || rowIndex"
              class="hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <!-- First Cell: F.I.Sh with Initial Avatar -->
              <TableCell
                :class="[
                  'border p-2 font-medium pl-3 first:pl-3 border-l-0 text-gray-800 font-semibold',
                  rowIndex === 0 ? 'border-t-0' : '',
                  rowIndex === absentRows.length - 1 ? 'border-b-0' : ''
                ]"
              >
                <div class="flex items-center">
                  <div
                    class="w-8 h-8 rounded-full bg-[#eff6ff] text-[#3b82f6] flex items-center justify-center font-bold shrink-0 text-[11px] mr-3 select-none"
                  >
                    {{ getInitials(student) }}
                  </div>
                  <span
                    class="text-xs font-semibold text-gray-800 truncate max-w-[130px]"
                    :title="getFullName(student)"
                  >
                    {{ getFullName(student) }}
                  </span>
                </div>
              </TableCell>

              <!-- Second Cell: School -->
              <TableCell
                :class="[
                  'border p-2 font-medium pl-3 first:pl-3 text-gray-600 text-xs',
                  rowIndex === 0 ? 'border-t-0' : '',
                  rowIndex === absentRows.length - 1 ? 'border-b-0' : ''
                ]"
              >
                {{ getSchoolName(student) }}
              </TableCell>

              <!-- Third Cell: Class -->
              <TableCell
                :class="[
                  'border p-2 font-medium pl-3 first:pl-3 text-gray-600 text-xs border-r-0',
                  rowIndex === 0 ? 'border-t-0' : '',
                  rowIndex === absentRows.length - 1 ? 'border-b-0' : ''
                ]"
              >
                {{ getClassName(student) }}
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>

    <!-- Pagination Footer -->
    <div
      v-if="data && data.totalPages > 0"
      class="flex items-center justify-between border border-t-0 rounded-b-lg px-4 py-2.5 text-xs text-gray-600 bg-white shrink-0"
    >
      <!-- Left side page info -->
      <span class="font-semibold text-[#596881] text-xs">
        {{
          t('dashboard.school-details.page-info', {
            current: data.currentPage,
            total: data.totalPages
          })
        }}
      </span>

      <!-- Right side page controls -->
      <div class="flex items-center gap-1.5">
        <!-- Prev Button -->
        <button
          class="w-7 h-7 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          :disabled="currentPage === 1"
          @click="currentPage > 1 && currentPage--"
        >
          <ArrowLeftIcon class="w-3.5 h-3.5" />
        </button>

        <!-- Numbers container -->
        <div class="flex items-center gap-1 bg-[#f4f4f5] p-0.5 rounded-lg">
          <template v-for="page in getPageNumbers()" :key="page">
            <span
              v-if="page === '...'"
              class="px-1.5 text-gray-400 font-medium select-none text-[11px]"
            >
              ...
            </span>

            <button
              v-else
              class="min-w-[24px] h-6 px-1 flex items-center justify-center text-[11px] font-semibold rounded-lg transition-all border-none bg-transparent cursor-pointer"
              :class="[
                currentPage === page
                  ? 'bg-white text-black shadow-sm font-bold'
                  : 'text-gray-600 hover:text-black hover:bg-gray-200/50'
              ]"
              @click="currentPage = page as number"
            >
              {{ page }}
            </button>
          </template>
        </div>

        <!-- Next Button -->
        <button
          class="w-7 h-7 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          :disabled="currentPage >= data.totalPages"
          @click="currentPage < data.totalPages && currentPage++"
        >
          <ArrowRightIcon class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </div>
</template>
