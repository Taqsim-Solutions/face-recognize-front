<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuery } from '@tanstack/vue-query'
import { fetchAttendances } from '../api'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { SearchIcon, AlertCircle, RefreshCw, Calendar } from 'lucide-vue-next'

const { t } = useI18n()

// Filters
const selectedDate = ref(new Date().toISOString().split('T')[0])
const searchQuery = ref('')

const apiDate = computed(() => {
  // Pass date as YYYY-MM-DDZ matching API specification
  return `${selectedDate.value}Z`
})

// Fetch attendances
const { data, isLoading, isError, refetch } = useQuery({
  queryKey: ['attendances-list-date', apiDate],
  queryFn: () => fetchAttendances(apiDate.value),
  staleTime: 5000
})

const attendanceRows = computed(() => {
  if (!data.value) return []
  const res = data.value.data?.result || data.value.result || data.value.data || []
  return Array.isArray(res) ? res : []
})

// Safe Parsers
const getInitials = (item: any) => {
  const name = getFullName(item)
  if (!name || name === '—') return '?'
  const parts = name.split(' ').filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

const getFullName = (item: any) => {
  if (item.studentName) return item.studentName
  if (item.student?.fullName) return item.student.fullName
  if (item.fullName) return item.fullName
  if (item.lastName || item.firstName) {
    return [item.lastName, item.firstName, item.fatherName].filter(Boolean).join(' ')
  }
  return '—'
}

const getSchoolName = (item: any) => {
  return item.schoolName || item.school?.name || item.school || '—'
}

const getClassName = (item: any) => {
  return item.className || item.class?.name || item.class || '—'
}

const getScanTime = (item: any) => {
  const timeVal = item.time || item.scanTime || item.createdAt || item.date
  if (!timeVal) return '—'
  try {
    const d = new Date(timeVal)
    if (isNaN(d.getTime())) return timeVal
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  } catch (e) {
    return timeVal
  }
}

// Local search filtering
const filteredAttendanceRows = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return attendanceRows.value
  return attendanceRows.value.filter((item: any) => {
    const name = getFullName(item).toLowerCase()
    const school = getSchoolName(item).toLowerCase()
    const sClass = getClassName(item).toLowerCase()
    return name.includes(query) || school.includes(query) || sClass.includes(query)
  })
})
</script>

<template>
  <div class="flex flex-col min-h-screen bg-gray-50/50">
    <!-- Header Title -->
    <header class="flex justify-between items-center py-4 pt-0 px-6 border-b border-gray-200 bg-white">
      <h1 class="text-[20px] font-bold text-[#1b1b1b] tracking-tight">
        {{ t('davomad', 'Davomad') }}
      </h1>
      
      <Button
        @click="() => refetch()"
        class="h-10 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm flex items-center gap-2 transition-all shadow-none cursor-pointer"
      >
        <RefreshCw class="w-4 h-4 text-gray-500" :class="{ 'animate-spin': isLoading }" />
        <span>{{ t('dashboard.retry', 'Yangilash') }}</span>
      </Button>
    </header>

    <!-- Filters Row -->
    <div class="flex flex-wrap items-center gap-3 px-6 pt-5 bg-white pb-4 border-b border-gray-100">
      <!-- Search Input -->
      <div class="flex items-center h-10 w-full sm:w-[420px] border border-gray-200 rounded-xl bg-white px-3 focus-within:ring-1 focus-within:ring-[#ff792d]/20 focus-within:border-[#ff792d]/50 transition-all">
        <SearchIcon class="w-4 h-4 text-gray-400 mr-2 shrink-0" />
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="t('search-student', 'O\'quvchi ism-familiyasi bo\'yicha qidiruv')"
          class="border-none outline-none bg-transparent text-sm text-gray-600 placeholder-gray-400 w-full font-medium"
        />
      </div>

      <!-- Date selector -->
      <div class="flex items-center h-10 border border-gray-200 rounded-xl bg-white px-3 w-full sm:w-[220px]">
        <Calendar class="w-4 h-4 text-gray-400 mr-2 shrink-0" />
        <input
          v-model="selectedDate"
          type="date"
          class="border-none outline-none bg-transparent text-sm text-gray-600 font-semibold w-full cursor-pointer"
        />
      </div>
    </div>

    <!-- Table Section -->
    <div class="mt-6 px-6 pb-6 grow">
      <div class="border border-gray-200 rounded-3xl bg-white p-6 shadow-sm overflow-auto">
        <Table class="text-nowrap">
          <!-- Table Header -->
          <TableHeader class="sticky top-0 bg-white z-20">
            <TableRow>
              <TableHead class="text-nowrap text-sm text-[#74757d] select-none border border-t-0 p-3 pl-4 first:pl-3 relative border-l-0 font-semibold bg-[#f2f5f4] rounded-tl-2xl">
                {{ t('dashboard.absents.fish', 'F.I.Sh') }}
              </TableHead>
              <TableHead class="text-nowrap text-sm text-[#74757d] select-none border border-t-0 p-3 pl-4 first:pl-3 relative font-semibold bg-[#f2f5f4]">
                {{ t('dashboard.absents.school', 'Maktab') }}
              </TableHead>
              <TableHead class="text-nowrap text-sm text-[#74757d] select-none border border-t-0 p-3 pl-4 first:pl-3 relative font-semibold bg-[#f2f5f4]">
                {{ t('dashboard.absents.class', 'Sinf') }}
              </TableHead>
              <TableHead class="text-nowrap text-sm text-[#74757d] select-none border border-t-0 p-3 pl-4 first:pl-3 relative font-semibold bg-[#f2f5f4]">
                {{ t('kelgan-vaqti', 'Kelgan vaqti') }}
              </TableHead>
              <TableHead class="text-nowrap text-sm text-[#74757d] select-none border border-t-0 p-3 pl-4 first:pl-3 relative border-r-0 font-semibold bg-[#f2f5f4] rounded-tr-2xl">
                {{ t('status', 'Status') }}
              </TableHead>
            </TableRow>
          </TableHeader>

          <!-- Table Body -->
          <TableBody>
            <!-- Loading Skeleton State -->
            <template v-if="isLoading">
              <TableRow v-for="i in 5" :key="i" class="animate-pulse">
                <TableCell class="border p-3 pl-4 border-l-0">
                  <div class="flex items-center">
                    <div class="w-8 h-8 rounded-full bg-gray-100 mr-3 shrink-0" />
                    <div class="h-4 bg-gray-100 rounded w-36" />
                  </div>
                </TableCell>
                <TableCell class="border p-3"><div class="h-4 bg-gray-100 rounded w-24"></div></TableCell>
                <TableCell class="border p-3"><div class="h-4 bg-gray-100 rounded w-16"></div></TableCell>
                <TableCell class="border p-3"><div class="h-4 bg-gray-100 rounded w-20"></div></TableCell>
                <TableCell class="border p-3 border-r-0"><div class="h-6 bg-gray-100 rounded-full w-20"></div></TableCell>
              </TableRow>
            </template>

            <!-- Error State -->
            <template v-else-if="isError">
              <TableRow>
                <TableCell colspan="5" class="h-64 text-center border-none">
                  <div class="flex flex-col items-center justify-center py-10">
                    <AlertCircle class="w-12 h-12 text-red-500 mb-2" />
                    <h3 class="text-lg font-bold text-gray-800">{{ t('error_occurred', 'Xatolik yuz berdi') }}</h3>
                    <p class="text-sm text-gray-500 mt-1 mb-4">Statistika ma'lumotlarini yuklashda xatolik yuz berdi.</p>
                    <Button @click="() => refetch()" size="sm" class="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-none">
                      {{ t('dashboard.retry', 'Qayta urinish') }}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </template>

            <!-- Empty Data State -->
            <template v-else-if="filteredAttendanceRows.length === 0">
              <TableRow>
                <TableCell colspan="5" class="h-64 text-center border-none">
                  <div class="flex flex-col items-center justify-center py-10">
                    <div class="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                      <SearchIcon class="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 class="text-base font-bold text-gray-700">{{ t('no-data', 'Ma’lumotlar topilmadi') }}</h3>
                    <p class="text-sm text-gray-400 mt-1">Ushbu sana bo‘yicha hech qanday davomad ma’lumoti mavjud emas.</p>
                  </div>
                </TableCell>
              </TableRow>
            </template>

            <!-- Table Rows List -->
            <template v-else>
              <TableRow
                v-for="(row, idx) in filteredAttendanceRows"
                :key="row.id || idx"
                class="hover:bg-gray-50/50 transition-colors"
              >
                <!-- F.I.Sh -->
                <TableCell class="border p-3 pl-4 border-l-0 text-gray-800 font-semibold text-sm">
                  <div class="flex items-center">
                    <div class="w-8 h-8 rounded-full bg-[#eff6ff] text-[#3b82f6] flex items-center justify-center font-bold shrink-0 text-[11px] mr-3 select-none">
                      {{ getInitials(row) }}
                    </div>
                    <span class="truncate max-w-[200px]" :title="getFullName(row)">
                      {{ getFullName(row) }}
                    </span>
                  </div>
                </TableCell>

                <!-- School -->
                <TableCell class="border p-3 text-gray-600 text-sm">
                  {{ getSchoolName(row) }}
                </TableCell>

                <!-- Class -->
                <TableCell class="border p-3 text-gray-600 text-sm">
                  {{ getClassName(row) }}
                </TableCell>

                <!-- Scan Time -->
                <TableCell class="border p-3 text-gray-600 text-sm font-medium">
                  {{ getScanTime(row) }}
                </TableCell>

                <!-- Status -->
                <TableCell class="border p-3 border-r-0 text-sm">
                  <span
                    class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold transition-colors select-none"
                    :class="[
                      row.isAbsent === true || row.absent === true
                        ? 'bg-red-50 text-red-600 border border-red-100'
                        : 'bg-green-50 text-green-600 border border-green-100'
                    ]"
                  >
                    {{
                      row.isAbsent === true || row.absent === true
                        ? t('not-attended', 'Kelmagan')
                        : t('attended', 'Kelgan')
                    }}
                  </span>
                </TableCell>
              </TableRow>
            </template>
          </TableBody>
        </Table>
      </div>
    </div>
  </div>
</template>
