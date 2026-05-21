<script setup lang="ts">
import type { AttendancesFetchParams, AttendanceTableData } from '../types'
import type { ColumnDef } from '@tanstack/vue-table'
import type { DateValue } from '@internationalized/date'
import { computed, ref, h, watch } from 'vue'
import { refDebounced } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { useGetAttendances } from '../query/useGetAttendances'
import { fetchAttendances } from '../api'
import {
  AttendancesCustomTable,
  DatePicker,
  prepareTableData,
  prepareColumns,
  uniqueDates,
  AttendanceDetailsModal,
  CameraEmployeeModal
} from '../modules'
import { useCheckPermission } from '@/composables/useCheckPermission'
import Input from '@/components/ui/input/Input.vue'
import Button from '@/components/ui/button/Button.vue'
import { DayAttendance } from '../modules/prepareTableData'
import * as XLSX from 'xlsx'
import { DownloadIcon } from 'lucide-vue-next'

import { useGetOrganizationOptions } from '@/views/organization-settings/query/useGetOrganizationOptions'
import { useGetDaysOff } from '@/views/organization-settings/query/useGetDaysOff'

const { t } = useI18n()
const search = ref('')
const debouncedSearch = refDebounced(search, 800)

const { data: organizationOptions } = useGetOrganizationOptions()

const weekends = computed(() => {
  return organizationOptions.value?.data?.data?.weekends || []
})

const currentYear = new Date().getFullYear()
const daysOffParams = ref({
  page: 1,
  size: 1000,
  fromDate: `${currentYear}-01-01T00:00:00Z`,
  toDate: `${currentYear}-12-31T23:59:59Z`
})
const { data: daysOffResponse } = useGetDaysOff(daysOffParams)
const daysOffList = computed(() => daysOffResponse.value?.data?.data || [])

const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const getDayName = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return daysOfWeek[date.getDay()]
}

function toDateString(date: Date) {
  return date.toISOString().split('T')[0]
}

const today = new Date()
const oneMonthAgo = new Date()
oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

const params = ref<AttendancesFetchParams>({
  page: 1,
  size: 30,
  search: '',
  fromDate: toDateString(oneMonthAgo),
  toDate: toDateString(today),
})

const showModal = ref(false)
const forShowModal = ref<DayAttendance>()

const handleRowClick = (attendance: any) => {
  if (!attendance) return
  forShowModal.value = attendance
  showModal.value = true
}

const { data, isLoading } = useGetAttendances(params)

const handlePaginationUpdate = (val: AttendancesFetchParams) => {
  params.value = {
    ...params.value,
    page: val.page,
    size: val.size ?? params.value.size
  }
}

const handleDateFilter = (e: DateValue | undefined, type: 'from' | 'to') => {
  params.value = {
    ...params.value,
    page: 1,
    [type === 'from' ? 'fromDate' : 'toDate']: e?.toString()
  }
}

watch([debouncedSearch], () => {
  params.value.search = debouncedSearch.value
  params.value.page = 1
})

const { hasPermission: hasEmployeesUpdatePermission } = useCheckPermission('employees.update')

const showCameraModal = ref(false)
const selectedEmployeeId = ref('')
const selectedEmployeeName = ref('')
const selectedEmployeeNo = ref('')

const handleFioClick = (row: AttendanceTableData) => {
  if (hasEmployeesUpdatePermission.value) {
    selectedEmployeeId.value = row.id
    selectedEmployeeName.value = row.fio
    selectedEmployeeNo.value = row.employeeNumber
    showCameraModal.value = true
  }
}

const isLoadingExport = ref(false)

const exportToExcel = async () => {
  if (!tablePagination.value.totalCount) return
  
  try {
    isLoadingExport.value = true
    
    // Fetch all data
    const response = await fetchAttendances({
      ...params.value,
      page: 1,
      size: tablePagination.value.totalCount
    })
    
    if (!response.data) return

    // Process data using the same helper, this will update uniqueDates to include all dates from all pages
    const rawData = prepareTableData(response.data)
    
    // Get unique dates for headers (now contains dates from all pages)
    const dates = Array.from(uniqueDates)
    
    // Prepare worksheet data
    const wsData: any[][] = []
    
    // Add header row
    const headers = [t('fio'), ...dates]
    wsData.push(headers)
    
    // Add data rows
    rawData.forEach((item) => {
      const row: any[] = [item.fio || '']
      
      dates.forEach((date: string) => {
        const dayData = item[date] as DayAttendance | undefined
        
        if (!dayData) {
          row.push('')
        } else if (!dayData.checkInTime && !dayData.checkOutTime) {
          const dayOff = daysOffList.value.find((day: any) => day.date.startsWith(date))
          if (dayOff) {
            row.push(t('days-off'))
          } else if ((weekends.value as string[]).includes(getDayName(date))) {
            row.push(t('weekend'))
          } else {
            row.push(t('not-attended'))
          }
        } else {
          row.push(dayData.hoursWorkedFormatted || '')
        }
      })
      
      wsData.push(row)
    })
    
    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData)
    
    // Create workbook
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, t('attendances'))
    
    // Generate file name with date range
    const fileName = `${t('attendances')}_${params.value.fromDate}_${params.value.toDate}.xlsx`
    
    // Save file
    XLSX.writeFile(wb, fileName)
    
    // Restore uniqueDates for the current view (optional but good practice)
    // We can trigger a re-computation of the current view data to reset uniqueDates
    // or just leave it as it will be reset on next view update.
    // However, to be safe, let's re-run prepareTableData on the current view data if it exists
    if (data.value && data.value.data) {
       prepareTableData(data.value.data)
    }
  } catch (e) {
    console.error('Export failed:', e)
  } finally {
    isLoadingExport.value = false
  }
}


const columns = ref<ColumnDef<AttendanceTableData>[]>([])

const tableData = computed<AttendanceTableData[]>(() => {
  if (!data.value) return []

  const rawData = prepareTableData(data.value.data)

  const transformedData = rawData.map((item) => {
    const row: AttendanceTableData = { 
      id: item.id, 
      employeeNumber: item.employeeNumber, 
      fio: item.fio || '',
      hasCameras: item.hasCameras
    }

    Object.entries(item).forEach(([key, value]) => {
      if (key === 'fio' || key === 'id' || key === 'employeeNumber') return

      if (value && typeof value === 'object' && 'status' in value) {
        const attendance = value as DayAttendance
        const isAbsent = !attendance.checkInTime && !attendance.checkOutTime
        const isLeave = !!attendance.leave
        const hoursWorked = attendance.hoursWorked || 0

        const isWeekend = (weekends.value as string[]).includes(getDayName(key))
        const dayOff = daysOffList.value.find((day: any) => day.date.startsWith(key))
        const isDayOff = !!dayOff

        if (isDayOff) {
          attendance.holidayDescription = dayOff.description
        }

        const isUnderworked = hoursWorked >= 0 && hoursWorked < 9

        let bgClass = ''
        let textClass = ''
        let borderClass = ''
        let label = ''
        let icon = null

        // @ts-ignore
        attendance.isWeekend = isWeekend
        // @ts-ignore
        attendance.isDayOff = isDayOff

        if (isAbsent && isDayOff) {
          bgClass = 'bg-[#EFF6FF]' // Blue-50
          textClass = 'text-[#3B82F6]' // Blue-500
          borderClass = 'border border-[#BFDBFE]' // Blue-200
          label = t('holiday')
          icon = h(
            'svg',
            {
              xmlns: 'http://www.w3.org/2000/svg',
              viewBox: '0 0 24 24',
              fill: 'none',
              stroke: 'currentColor',
              'stroke-width': '2',
              'stroke-linecap': 'round',
              'stroke-linejoin': 'round',
              class: 'w-[16px] h-[16px]'
            },
            [
              h('path', { d: 'M5.8 11.3 2 22l10.7-3.8' }),
              h('path', { d: 'M4 20l.1.1' }),
              h('path', { d: 'm16 2 3 5c.5 1 2 2 2 2s.5-1 0-3-3-4-3-4z' }),
              h('path', { d: 'M7 2c.5 0 2 1 2 2s-1 1-1.5.5-1.5-1.5-1-2z' }),
              h('path', { d: 'M21.5 17.9c0-.5-1-2-2-2s-1 1-.5 1.5 1.5 1.5 2 1z' }),
              h('path', { d: 'M22 3s-1 1.5-2.5 1.5S17 3 17 3' }),
              h('path', { d: 'm15 11 1 1' }),
              h('path', { d: 'm10 6 1 1' }),
              h('path', { d: 'm10 11 3 3' }),
              h('path', { d: 'm7 8 3 3' }),
              h('path', { d: 'm14 7 1 1' }),
              h('path', { d: 'm17 10 1 1' })
            ]
          )
        } else if (isAbsent && isWeekend) {
          bgClass = 'bg-[#F9FAFB]' // Gray-50
          textClass = 'text-[#98A2B3]' // Gray-400
          borderClass = 'border border-[#EAECF0]'
          label = t('weekend')
          icon = h(
            'svg',
            {
              xmlns: 'http://www.w3.org/2000/svg',
              viewBox: '0 0 24 24',
              fill: 'none',
              stroke: 'currentColor',
              'stroke-width': '2',
              'stroke-linecap': 'round',
              'stroke-linejoin': 'round',
              class: 'w-[16px] h-[16px]'
            },
            [
              h('path', { d: 'M17 8h1a4 4 0 1 1 0 8h-1' }),
              h('path', { d: 'M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z' }),
              h('line', { x1: '6', y1: '2', x2: '6', y2: '4' }),
              h('line', { x1: '10', y1: '2', x2: '10', y2: '4' }),
              h('line', { x1: '14', y1: '2', x2: '14', y2: '4' })
            ]
          )
        } else if (isLeave) {
          bgClass = 'bg-[#F2F4F7]'
          textClass = 'text-[#344054]'
          borderClass = 'border border-[#D0D5DD]'
          
          const type = attendance.leave?.type || ''
          const normalizedType = type.charAt(0).toUpperCase() + type.slice(1)
          label = type ? t(`leave-types.${normalizedType}`) : ''
          
          icon = h(
            'svg',
            {
              xmlns: 'http://www.w3.org/2000/svg',
              viewBox: '0 0 24 24',
              fill: 'none',
              stroke: 'currentColor',
              'stroke-width': '2',
              'stroke-linecap': 'round',
              'stroke-linejoin': 'round',
              class: 'w-[16px] h-[16px]'
            },
            [
              h('rect', { x: '3', y: '4', width: '18', height: '18', rx: '2', ry: '2' }),
              h('line', { x1: '16', y1: '2', x2: '16', y2: '6' }),
              h('line', { x1: '8', y1: '2', x2: '8', y2: '6' }),
              h('line', { x1: '3', y1: '10', x2: '21', y2: '10' })
            ]
          )
        } else if (isAbsent) {
          bgClass = 'bg-red-50'
          textClass = 'text-red-500'
          borderClass = 'border border-[#EA6780]'
          label = t('not-attended')
          icon = h(
            'svg',
            {
              xmlns: 'http://www.w3.org/2000/svg',
              viewBox: '0 0 15 17',
              fill: 'none',
              class: 'w-[15px] h-[17px]'
            },
            [
              h('path', {
                d: 'M1.5 14.75V13.25C1.5 12.4543 1.81607 11.6913 2.37868 11.1287C2.94129 10.5661 3.70435 10.25 4.5 10.25H7.125M9.75 14.75L12.75 11.75M3 4.25C3 5.04565 3.31607 5.80871 3.87868 6.37132C4.44129 6.93393 5.20435 7.25 6 7.25C6.79565 7.25 7.55871 6.93393 8.12132 6.37132C8.68393 5.80871 9 5.04565 9 4.25C9 3.45435 8.68393 2.69129 8.12132 2.12868C7.55871 1.56607 6.79565 1.25 6 1.25C5.20435 1.25 4.44129 1.56607 3.87868 2.12868C3.31607 2.69129 3 3.45435 3 4.25ZM9 13.25C9 13.8467 9.23705 14.419 9.65901 14.841C10.081 15.2629 10.6533 15.5 11.25 15.5C11.8467 15.5 12.419 15.2629 12.841 14.841C13.2629 14.419 13.5 13.8467 13.5 13.25C13.5 12.6533 13.2629 12.081 12.841 11.659C12.419 11.2371 11.8467 11 11.25 11C10.6533 11 10.081 11.2371 9.65901 11.659C9.23705 12.081 9 12.6533 9 13.25Z',
                stroke: '#DF1C41',
                'stroke-width': '1.5',
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round'
              })
            ]
          )
        } else if (attendance.checkInTime && !attendance.checkOutTime) {
          bgClass = 'bg-[#FFF7ED]'
          textClass = 'text-[#F59E0B]'
          borderClass = 'border border-[#F59E0B]'
          label = t('no-checkout')
          icon = h(
            'svg',
            {
              xmlns: 'http://www.w3.org/2000/svg',
              viewBox: '0 0 24 24',
              fill: 'none',
              stroke: 'currentColor',
              'stroke-width': '2',
              'stroke-linecap': 'round',
              'stroke-linejoin': 'round',
              class: 'w-[16px] h-[16px]'
            },
            [
              h('circle', { cx: '12', cy: '12', r: '10' }),
              h('line', { x1: '12', y1: '8', x2: '12', y2: '12' }),
              h('line', { x1: '12', y1: '16', x2: '12.01', y2: '16' })
            ]
          )
        } else if (isUnderworked) {
          bgClass = 'bg-yellow-50'
          textClass = 'text-[orange]'
          borderClass = 'border border-[orange]'
          label = attendance.hoursWorkedFormatted
          icon = h(
            'svg',
            {
              xmlns: 'http://www.w3.org/2000/svg',
              viewBox: '0 0 18 18',
              fill: 'none',
              class: 'w-[18px] h-[18px]'
            },
            [
              h('path', {
                d: 'M9 6.75H9.0075M8.25 9H9V12H9.75M2.25 9C2.25 9.88642 2.42459 10.7642 2.76381 11.5831C3.10303 12.4021 3.60023 13.1462 4.22703 13.773C4.85382 14.3998 5.59794 14.897 6.41689 15.2362C7.23583 15.5754 8.11358 15.75 9 15.75C9.88642 15.75 10.7642 15.5754 11.5831 15.2362C12.4021 14.897 13.1462 14.3998 13.773 13.773C14.3998 13.1462 14.897 12.4021 15.2362 11.5831C15.5754 10.7642 15.75 9.88642 15.75 9C15.75 7.20979 15.0388 5.4929 13.773 4.22703C12.5071 2.96116 10.7902 2.25 9 2.25C7.20979 2.25 5.4929 2.96116 4.22703 4.22703C2.96116 5.4929 2.25 7.20979 2.25 9Z',
                stroke: 'currentColor',
                'stroke-width': '1.5',
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round'
              })
            ]
          )
        } else {
          bgClass = 'bg-[#EBF9F4]'
          textClass = 'text-[#38C793]'
          borderClass = 'border border-[#38C793]'
          label = attendance.hoursWorkedFormatted
          icon = h(
            'svg',
            {
              xmlns: 'http://www.w3.org/2000/svg',
              viewBox: '0 0 18 18',
              fill: 'none',
              class: 'w-[18px] h-[18px]'
            },
            [
              h('path', {
                d: 'M6.75 8.25L9 10.5L15 4.5M15 9V13.5C15 13.8978 14.842 14.2794 14.5607 14.5607C14.2794 14.842 13.8978 15 13.5 15H4.5C4.10218 15 3.72064 14.842 3.43934 14.5607C3.15804 14.2794 3 13.8978 3 13.5V4.5C3 4.10218 3.15804 3.72064 3.43934 3.43934C3.72064 3.15804 4.10218 3 4.5 3H11.25',
                stroke: 'currentColor',
                'stroke-width': '1.5',
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round'
              })
            ]
          )
        }

        // @ts-ignore
        row[key] = h(
          'div',
          {
            class: `flex items-center justify-center gap-2 px-3 py-1.5 rounded-md cursor-pointer ${bgClass} ${textClass} ${borderClass}`,
            onClick: () => handleRowClick(attendance)
          },
          [icon, h('span', { class: 'font-medium text-sm' }, label)]
        )
      }
    })

    return row
  })

  columns.value = [
    {
      id: 'fio',
      header: () => h('p', {}, t('fio')),
      cell: ({ row }) =>
        h(
          'div',
          {
            class: [
              'flex items-center -ml-1 -my-2 px-3 py-1.5 rounded-lg transition-all truncate font-semibold h-9 min-h-[36px]',
              row.original.hasCameras 
                ? 'bg-primary/5 border border-primary/10 select-none' 
                : 'bg-red-50/50 border border-red-200/70 text-red-900/80',
              row.original.fio ? (hasEmployeesUpdatePermission.value ? 'cursor-pointer hover:text-primary transition-colors' : '') : 'italic text-muted-foreground'
            ],
            onClick: () => handleFioClick(row.original)
          },
          row.original.fio || t('not-identified')
        )
    },
    ...prepareColumns(uniqueDates)
  ]

  return transformedData
})

const tablePagination = computed(() => {
  if (data.value) {
    const xPag = JSON.parse(data.value.headers['x-pagination'])

    return {
      currentPage: xPag.currentPage,
      totalCount: xPag.totalCount,
      totalPages: xPag.totalPages,
      pageSize: xPag.pageSize,
      canPrevPage: xPag.hasPrevious,
      canNextPage: xPag.hasNext
    }
  }
  return {
    currentPage: 0,
    totalCount: 0,
    totalPages: 0,
    pageSize: 0,
    canPrevPage: 0,
    canNextPage: 0
  }
})
</script>

<template>
  <header
    class="flex flex-col md:flex-row justify-between items-center gap-3 border-b lg:pb-3 pb-5 px-6"
  >
    <div class="flex flex-col mt-1">
      <h2 class="scroll-m-20 lg:text-xl text-2xl font-semibold tracking-tight transition-colors">
        {{ t('attendances') }}
      </h2>
    </div>

    <div class="flex lg:flex-nowrap flex-wrap items-center gap-3">
      <Input id="search-input" name="search" v-model="search" :placeholder="t('search')" class="w-[300px] h-9">
        <template #left>
          <svg
            class="h-4 w-4"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </template>
      </Input>
      <div class="flex gap-2 items-center ml-3">
        <label for="from-date-picker">{{ t('from') }}:</label>
        <DatePicker id="from-date-picker" :initial="params.fromDate" @confirm:date="(e) => handleDateFilter(e, 'from')" />
      </div>
      -
      <div class="flex gap-2 items-center">
        <label for="to-date-picker">{{ t('to') }}:</label>
        <DatePicker id="to-date-picker" :initial="params.toDate" @confirm:date="(e) => handleDateFilter(e, 'to')" />
      </div>
      <Button
        :loading="isLoadingExport"
        @click="exportToExcel"
        class="bg-primary flex border-none text-white rounded-lg h-[35px] hover:bg-primary hover:text-white hover:opacity-85 transition-all"
      >
        <DownloadIcon :size="16" class="mr-2" /> {{ t('download') }}
      </Button>
    </div>
  </header>

  <div class="px-6 mt-6">
    <AttendancesCustomTable
      :data="tableData"
      :columns="columns"
      :loading="isLoading"
      :pagination="tablePagination"
      @update:pagination="handlePaginationUpdate"
    />
  </div>

  <AttendanceDetailsModal v-model="showModal" :attendance="forShowModal" />
  <CameraEmployeeModal 
    v-model="showCameraModal" 
    :employee-id="selectedEmployeeId" 
    :employee-name="selectedEmployeeName"
    :default-employee-no="selectedEmployeeNo"
  />
</template>
