<script setup lang="ts">
import { reactive, onMounted, ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { fetchAttendanceByDate } from '../api'
import { IEmployeeAttendance, FetchEmployeeAttendanceParams } from '../type'
import { useGetOrganizationOptions } from '../../organization-settings/query/useGetOrganizationOptions'
import DataTable from './AttendanceDataTable.vue'
import { useColumns } from './columns'
import Input from '@/components/ui/input/Input.vue'
import { DatePicker } from '@/views/attendances/list/modules'
import type { DateValue } from '@internationalized/date'
import * as XLSX from 'xlsx'

const { t } = useI18n()

const isLoading = ref(false)
const search = ref('')

const params = ref<FetchEmployeeAttendanceParams>({
  search: '',
  size: 10,
  page: 1
})

const { data: optionsData } = useGetOrganizationOptions()
const dayShiftWorkStartTime = computed(() => optionsData.value?.data?.data?.dayShiftWorkStartTime || '09:00')

const requiredWorkingHours = computed(() => {
  const startTime = optionsData.value?.data?.data?.dayShiftWorkStartTime || '09:00'
  const endTime = optionsData.value?.data?.data?.dayShiftWorkEndTime || '18:00'
  const [startHH, startMM] = startTime.split(':').map(Number)
  const [endHH, endMM] = endTime.split(':').map(Number)
  
  let diff = (endHH * 60 + (endMM || 0)) - (startHH * 60 + (startMM || 0))
  if (diff < 0) diff += 24 * 60
  return diff / 60
})

const columns = useColumns()

const state = reactive({
  onLeave: 0,
  allAttendances: [] as IEmployeeAttendance[]
})

const totalEmployees = computed(() => state.allAttendances.length)

const working = computed(() => {
  return state.allAttendances.filter(item => {
    const firstAtt = item.attendance?.attendance?.[0]
    return firstAtt && firstAtt.checkInTime
  }).length
})

const absent = computed(() => {
  return state.allAttendances.filter(item => {
    const firstAtt = item.attendance?.attendance?.[0]
    return !firstAtt || !firstAtt.checkInTime
  }).length
})

const late = computed(() => {
  return state.allAttendances.filter(item => {
    const firstAtt = item.attendance?.attendance?.[0]
    if (firstAtt && firstAtt.checkInTime) {
      const [shiftHH, shiftMM] = dayShiftWorkStartTime.value.split(':').map(Number)
      const date = new Date(firstAtt.checkInTime)
      const hh = date.getHours()
      const mm = date.getMinutes()
      
      let diff = (hh * 60 + mm) - (shiftHH * 60 + shiftMM)
      return diff > 0
    }
    return false
  }).length
})

watch(search, (val) => {
  params.value = {
    ...params.value,
    search: val,
    page: 1
  }
})

const handleDateFilter = (e: DateValue | undefined, type: string) => {
  params.value = {
    ...params.value,
    [type]: e?.toString()
  }
}

const handleFilter = (status?: any, note?: any) => {
  params.value = {
    ...params.value,
    status: status,
    note: note,
    page: 1
  }
}

const filteredAttendances = computed(() => {
  let list = state.allAttendances || []
  
  if (params.value.search) {
    const s = params.value.search.toLowerCase()
    list = list.filter(item => {
      const u = item.employee?.user
      if (!u && !item.employee?.comment) return false
      return (
        (u?.firstName && u.firstName.toLowerCase().includes(s)) || 
        (u?.lastName && u.lastName.toLowerCase().includes(s)) ||
        (item.employee?.comment && item.employee.comment.toLowerCase().includes(s))
      )
    })
  }

  if (params.value.status) {
    list = list.filter(item => {
      const attendanceWrapper = item.attendance
      const attendanceList = attendanceWrapper?.attendance
      const firstAttendance = attendanceList?.[0]
      const hasLeave = !!attendanceWrapper?.leave
      
      if (params.value.status === 'vacation') {
        return hasLeave
      } else if (params.value.status === 'absent') {
        return !hasLeave && (!firstAttendance || !firstAttendance.checkInTime)
      } else if (params.value.status === 'worked') {
        return !hasLeave && (firstAttendance && firstAttendance.checkInTime)
      }
      return true
    })
  }
  
  if (params.value.note === 'lateArrival') {
    list = list.filter(item => {
      const attendanceWrapper = item.attendance
      const attendanceList = attendanceWrapper?.attendance
      const firstAttendance = attendanceList?.[0]
      
      if (attendanceWrapper?.leave) return false
      
      if (firstAttendance && firstAttendance.checkInTime) {
        const [shiftHH, shiftMM] = dayShiftWorkStartTime.value.split(':').map(Number)
        const date = new Date(firstAttendance.checkInTime)
        const hh = date.getHours()
        const mm = date.getMinutes()
        
        let diff = (hh * 60 + mm) - (shiftHH * 60 + shiftMM)
        return diff > 0
      }
      return false
    })
  }
  
  return list
})

const exportExcel = (type: string) => {
  let list = [...state.allAttendances]
  
  // Apply current search filter for all exports
  if (search.value) {
    const s = search.value.toLowerCase()
    list = list.filter(item => {
      const u = item.employee?.user
      if (!u && !item.employee?.comment) return false
      return (
        (u?.firstName && u.firstName.toLowerCase().includes(s)) || 
        (u?.lastName && u.lastName.toLowerCase().includes(s)) ||
        (item.employee?.comment && item.employee.comment.toLowerCase().includes(s))
      )
    })
  }

  let dataToExport = [] as IEmployeeAttendance[]
  const [shiftHH, shiftMM] = dayShiftWorkStartTime.value.split(':').map(Number)

  if (type === 'employees') {
    dataToExport = list
  } else if (type === 'worked') {
    dataToExport = list.filter(i => {
      const firstAtt = i.attendance?.attendance?.[0]
      return firstAtt && firstAtt.checkInTime
    })
  } else if (type === 'late') {
    dataToExport = list.filter(item => {
      const firstAtt = item.attendance?.attendance?.[0]
      if (firstAtt && firstAtt.checkInTime) {
        const date = new Date(firstAtt.checkInTime)
        const hh = date.getHours()
        const mm = date.getMinutes()
        let diff = (hh * 60 + mm) - (shiftHH * 60 + shiftMM)
        return diff > 0
      }
      return false
    })
  } else if (type === 'absent') {
    dataToExport = list.filter(i => {
      const firstAtt = i.attendance?.attendance?.[0]
      return !firstAtt || !firstAtt.checkInTime
    })
  }

  if (!dataToExport.length) return

  const formattedData = dataToExport.map((item, index) => {
    const u = item.employee.user
    const firstAtt = item.attendance?.attendance?.[0]
    
    let ishlaganVaqti = '-- : --'
    if (item.attendance?.attendance?.length) {
      const workedAmount = item.attendance.attendance.reduce((acc, curr) => acc + (curr.hoursWorked || 0), 0)
      const hours = Math.floor(workedAmount)
      const minutes = Math.round((workedAmount - hours) * 60)
      ishlaganVaqti = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
      if (workedAmount >= requiredWorkingHours.value) {
        ishlaganVaqti += ' ✔'
      }
    }
    
    const timeFormatter = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' })
    const formatTime = (timeRange: string | undefined | null) => timeRange ? timeFormatter.format(new Date(timeRange)) : '-'
    
    // Determine status label for Excel
    let statusLabel = t('absent')
    if (firstAtt && firstAtt.checkInTime) {
      const date = new Date(firstAtt.checkInTime)
      const hh = date.getHours()
      const mm = date.getMinutes()
      let lateDiff = (hh * 60 + mm) - (shiftHH * 60 + shiftMM)
      
      if (lateDiff > 0) {
        const lh = Math.floor(lateDiff / 60)
        const lm = lateDiff % 60
        statusLabel = `${t('Late')} (${String(lh).padStart(2, '0')}:${String(lm).padStart(2, '0')})`
      } else {
        statusLabel = t('At work')
      }
    }

    return {
      '№': index + 1,
      'Xodim': u ? `${u.lastName} ${u.firstName}` : (item.employee.comment || t('no-data')),
      'Kirish vaqti': formatTime(firstAtt?.checkInTime),
      'Chiqish vaqti': formatTime(firstAtt?.checkOutTime),
      'Ishlagan vaqti': ishlaganVaqti,
      'Izoh/Status': statusLabel
    }
  })

  const ws = XLSX.utils.json_to_sheet(formattedData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Davomat')
  const fileName = `davomat_${type}_${params.value.date || new Date().toLocaleDateString('ru-RU')}.xlsx`
  XLSX.writeFile(wb, fileName)
}

const tablePagination = computed(() => {
  const total = filteredAttendances.value.length
  const pageSize = params.value.size || 10
  const currentPage = params.value.page || 1
  const totalPages = Math.ceil(total / pageSize) || 1
  
  return {
    currentPage,
    totalCount: total,
    totalPages,
    pageSize,
    canPrevPage: currentPage > 1,
    canNextPage: currentPage < totalPages
  }
})

const paginatedAttendances = computed(() => {
  const pageSize = params.value.size || 10
  const currentPage = params.value.page || 1
  const start = (currentPage - 1) * pageSize
  const end = start + pageSize
  return filteredAttendances.value.slice(start, end)
})

const handlePaginationUpdate = (val: FetchEmployeeAttendanceParams) => {
  params.value = { ...params.value, ...val }
}

const fetchAttendances = async () => {
  try {
    isLoading.value = true
    const resAttendance = await fetchAttendanceByDate({
      isAll: true,
      date: params.value.date
    })
    state.allAttendances = resAttendance.data.data
  } catch (error) {
    console.error('Error loading attendance data:', error)
  } finally {
    isLoading.value = false
  }
}

watch(() => params.value.date, () => {
  fetchAttendances()
}, { immediate: true })

onMounted(() => {
  // fetchStats removed, using computed logic
})

defineOptions({
  name: 'AttendanceStats'
})
</script>

<template>
  <div class="flex-col md:flex gap-4">
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <!-- Кол-во сотрудников -->
      <div @click="handleFilter(undefined)" class="cursor-pointer transition-all hover:shadow-sm flex items-center justify-between p-4 py-3 rounded-lg shadow-sm border bg-white" :class="{'border-blue-500': !params.status && !params.note}">
        <div class="flex items-center">
          <div class="lg:mr-5 mr-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="52"
              height="52"
              viewBox="0 0 32 32"
              fill="none"
            >
              <rect width="32" height="32" rx="4" fill="white" />
              <rect width="32" height="32" rx="4" fill="#E9F0FE" />
              <path
                d="M24.1679 22.4752L24.167 22.4898C24.1096 23.4425 23.4658 24.2565 22.5541 24.539C20.5627 25.1559 18.3421 25.5 16.0005 25.5C13.6595 25.5 11.4395 25.1556 9.448 24.5391C8.53599 24.2568 7.8922 23.4423 7.83545 22.4893L7.83314 22.4504C7.81062 22.1331 7.79712 21.8135 7.79712 21.4962C7.79712 20.7782 7.85564 20.0626 7.96366 19.3446C8.06719 18.6964 8.53307 18.127 9.15423 17.8952C9.82716 17.6364 10.5248 17.4024 11.1483 17.04L12.6494 16.2118C12.9847 16.2118 13.2706 16.4436 13.3471 16.7542L15.0096 20.4044C15.065 20.526 15.2455 20.4962 15.2588 20.3632L15.4694 18.2576C15.1858 18.1541 14.9788 17.8952 14.9788 17.5846V17.2471C14.9788 17.0648 15.0305 16.9365 15.1341 16.806C15.4176 16.8847 15.7282 16.9365 16.014 16.9365C16.2976 16.9365 16.6082 16.8847 16.894 16.806C16.9975 16.9365 17.0493 17.0918 17.0493 17.2471V17.5846C17.0493 17.8952 16.8423 18.1541 16.5564 18.2576L16.767 20.3632C16.7803 20.4962 16.9609 20.526 17.0163 20.4044L18.6787 16.7542C18.7575 16.4436 19.0411 16.2118 19.3787 16.2118L20.8798 17.04C21.501 17.4024 22.2009 17.6364 22.8738 17.8952C23.495 18.127 23.9339 18.6964 24.0374 19.3694C24.1927 20.4046 24.2445 21.4399 24.1679 22.4752Z"
                fill="#2363DA"
              />
              <path
                d="M12.4714 11.828C12.5751 11.9396 12.6439 12.0789 12.6693 12.2291C13.0453 14.4493 14.6606 15.6883 16.0135 15.6883C17.3698 15.6883 18.9898 14.443 19.3605 12.2339C19.3838 12.0951 19.442 11.9629 19.5366 11.8587C19.6598 11.7229 19.716 11.392 19.716 11.0322C19.716 10.6112 19.8122 10.0168 19.6198 9.84345C19.5477 9.79391 19.4756 9.79391 19.3554 9.81868C19.0428 7.78785 18.033 6.5 16.0135 6.5C13.9939 6.5 12.9842 7.78785 12.6716 9.81868C12.5514 9.76915 12.4552 9.79392 12.4071 9.84345C12.2148 10.0168 12.311 10.5864 12.311 11.0322C12.2929 11.3679 12.3429 11.6896 12.4714 11.828Z"
                fill="#2363DA"
              />
            </svg>
          </div>
          <div>
            <div class="text-gray-500 mb-0.5">{{ t('employees') }}</div>
            <div class="text-xl font-bold">{{ totalEmployees }}</div>
          </div>
        </div>
        <div @click.stop="exportExcel('employees')" class="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors" title="Excel yuklash">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        </div>
      </div>

      <!-- В отпуске -->
      <!--
      <div @click="handleFilter('vacation')" class="cursor-pointer transition-all hover:shadow-sm flex items-center p-4 py-3 bg-white rounded-lg shadow-sm border" :class="{'border-orange-500': params.status === 'vacation'}">
        <div class="lg:mr-5 mr-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="52"
            height="52"
            viewBox="0 0 32 32"
            fill="none"
          >
            <rect width="32" height="32" rx="4" fill="white" />
            <rect width="32" height="32" rx="4" fill="#FEEFEC" />
            <g clip-path="url(#clip0_1_1666)">
              <path
                d="M26 15.6625C26 20.2557 22.6121 24.0724 18.2039 24.7454C18.2411 24.5416 18.2515 24.3304 18.2265 24.1165C18.2265 24.1165 18.2002 23.8914 18.1657 23.5968C19.7308 23.3302 21.1438 22.612 22.2638 21.5793C22.1965 21.5233 22.1296 21.4508 22.0636 21.3546C21.7661 20.9205 22.1551 20.4899 22.1551 20.1103C22.1551 19.7381 21.4045 19.7687 21.377 19.5221C21.2822 18.6682 21.901 18.6566 22.231 18.3266C22.5609 17.9967 21.9049 17.2466 21.4811 17.295C21.0545 17.3405 19.8536 17.098 19.9633 16.1792C20.097 15.0601 18.5376 15.1588 18.3143 14.6365C17.9888 13.8752 18.5299 12.9413 19.2358 12.7292C20.2355 12.4287 21.2204 11.6131 21.1434 10.7052C21.0563 9.67691 20.5908 8.74956 19.8243 8.19868C19.0266 7.87551 18.1664 7.67567 17.2665 7.62525C16.4633 7.65701 15.7572 7.83551 15.7894 8.20322C15.8684 9.10433 18.4308 9.33838 18.0008 10.1807C17.7766 10.6199 16.0941 11.2396 16.4084 11.8932C16.6127 12.3182 17.1157 11.9539 16.9279 12.7698C16.8415 13.1452 16.5124 13.8506 16.0061 13.8962C15.4884 13.9445 15.0574 12.5731 13.6483 12.5281C12.9821 12.5068 12.0437 13.5674 12.8405 14.3199C13.3231 14.7756 14.2286 13.7722 14.4958 14.556C14.6842 15.1083 14.4705 16.2686 15.3495 16.7535C15.6699 16.9303 16.1611 17.0844 16.6469 17.3312C15.9258 17.4785 15.0398 17.7533 13.9936 18.1563L13.1121 17.9237C13.4811 17.6165 14.0807 17.4002 13.9298 16.729C13.7082 15.7428 11.9959 16.1148 10.8154 14.9343C10.4533 14.5722 9.68082 13.3698 9.68399 11.9252C9.09555 13.043 8.76065 14.3141 8.76065 15.6625C8.76065 16.0776 8.79232 16.4854 8.8532 16.8838C8.83931 16.8835 8.82559 16.8811 8.81173 16.8811C8.43997 16.8811 8.07536 16.9592 7.73745 17.1069C7.66281 16.6362 7.62297 16.154 7.62297 15.6626C7.62297 10.5961 11.745 6.47394 16.8114 6.47394C21.878 6.47387 26 10.596 26 15.6625ZM19.1075 18.3407L16.8634 19.3722L16.8982 18.8832L18.352 18.2269C18.1446 18.2121 17.9298 18.2065 17.7153 18.2065C16.912 18.2065 15.5549 18.6131 14.054 19.2088L9.24 17.9391C8.79013 17.8204 8.31117 17.8935 7.91716 18.141L7.68046 18.2897C7.44938 18.4349 7.44693 18.7708 7.67585 18.9194L10.5696 20.7968C9.87833 21.1503 9.22248 21.5094 8.64431 21.8523L7.15941 21.0661C6.91686 20.9377 6.6301 20.9225 6.37536 21.0245L6.2348 21.0809C6.02519 21.1648 5.93738 21.414 6.04817 21.6108L6.86617 23.0641L6.86653 23.064C6.55791 23.3295 6.38202 23.5497 6.38202 23.7021C6.38202 24.1582 6.94327 24.2722 7.43797 24.2722C8.32032 24.2722 19.9728 21.6042 19.9728 19.187C19.9728 18.7083 19.6454 18.4689 19.1075 18.3407ZM14.1945 23.0599L16.7586 22.1566C16.8716 22.1168 16.9923 22.1921 17.0062 22.3111L17.231 24.2332C17.2872 24.7134 17.0288 25.1756 16.5903 25.3795L16.3498 25.4913C16.1996 25.5611 16.0215 25.5236 15.912 25.3994L14.1163 23.3595C14.0289 23.2601 14.0696 23.1039 14.1945 23.0599Z"
                fill="#DB5837"
              />
            </g>
            <defs>
              <clipPath id="clip0_1_1666">
                <rect width="20" height="20" fill="white" transform="translate(6 6)" />
              </clipPath>
            </defs>
          </svg>
        </div>
        <div>
          <div class="text-gray-500 mb-0.5">{{ t('At vocation') }}</div>
          <div class="text-xl font-bold">{{ state.onLeave }}</div>
        </div>
      </div>
      -->

      <!-- На работе -->
      <div @click="handleFilter('worked')" class="cursor-pointer transition-all hover:shadow-sm flex items-center justify-between p-4 py-3 bg-white rounded-lg shadow-sm border" :class="{'border-green': params.status === 'worked'}">
        <div class="flex items-center">
          <div class="lg:mr-5 mr-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="52"
              height="52"
              viewBox="0 0 32 32"
              fill="none"
            >
              <rect width="32" height="32" rx="4" fill="white" />
              <rect width="32" height="32" rx="4" fill="#12B76A" fill-opacity="0.08" />
              <path
                d="M18.5 11.4167C18.04 11.4167 17.6667 11.0434 17.6667 10.5834V9.33335H14.3334V10.5834C14.3334 11.0434 13.96 11.4167 13.5 11.4167C13.04 11.4167 12.6667 11.0434 12.6667 10.5834V9.33335C12.6667 8.41419 13.4142 7.66669 14.3334 7.66669H17.6667C18.5859 7.66669 19.3334 8.41419 19.3334 9.33335V10.5834C19.3334 11.0434 18.96 11.4167 18.5 11.4167Z"
                fill="#12B76A"
              />
              <path
                d="M16.5917 18.8167C16.4417 18.875 16.225 18.9167 16 18.9167C15.775 18.9167 15.5583 18.875 15.3583 18.8L6 15.6833V22.0417C6 23.3083 7.025 24.3333 8.29167 24.3333H23.7083C24.975 24.3333 26 23.3083 26 22.0417V15.6833L16.5917 18.8167Z"
                fill="#12B76A"
              />
              <path
                d="M26 12.4584V14.3667L16.2 17.6334C16.1333 17.6584 16.0667 17.6667 16 17.6667C15.9333 17.6667 15.8667 17.6584 15.8 17.6334L6 14.3667V12.4584C6 11.1917 7.025 10.1667 8.29167 10.1667H23.7083C24.975 10.1667 26 11.1917 26 12.4584Z"
                fill="#12B76A"
              />
            </svg>
          </div>
          <div>
            <div class="text-gray-500 mb-0.5">{{ t('At work') }}</div>
            <div class="text-xl font-bold">{{ working }}</div>
          </div>
        </div>
        <div @click.stop="exportExcel('worked')" class="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors" title="Export Excel">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        </div>
      </div>

      <!-- Опоздали -->
      <div @click="handleFilter(undefined, 'lateArrival')" class="cursor-pointer transition-all hover:shadow-sm flex items-center justify-between p-4 py-3 bg-white rounded-lg shadow-sm border" :class="{'border-red-500': params.note === 'lateArrival'}">
        <div class="flex items-center">
          <div class="lg:mr-6 mr-3">
            <svg
            xmlns="http://www.w3.org/2000/svg"
            width="52"
            height="52"
            viewBox="0 0 32 32"
            fill="none"
          >
            <rect width="32" height="32" rx="4" fill="white" />
            <rect width="32" height="32" rx="4" fill="#FCE8EC" />
            <g clip-path="url(#clip0_1_1701)">
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M25.6873 15.9997C25.6873 18.5871 24.6796 21.0197 22.8499 22.8495C21.0198 24.6796 18.5872 25.6874 16.0001 25.6874C15.6765 25.6874 15.4142 25.4251 15.4142 25.1015C15.4142 24.7779 15.6765 24.5155 16.0001 24.5155C18.2742 24.5155 20.4125 23.6296 22.0213 22.0208C25.3413 18.7008 25.3413 13.2987 22.0213 9.97858C18.7009 6.65823 13.2982 6.65826 9.9779 9.97858C9.95243 10.004 9.92739 10.0299 9.90223 10.0557H10.642C10.9656 10.0557 11.228 10.3181 11.228 10.6417C11.228 10.9653 10.9656 11.2276 10.642 11.2276H8.48618C8.16258 11.2276 7.90024 10.9653 7.90024 10.6417V8.4858C7.90024 8.16221 8.16258 7.89987 8.48618 7.89987C8.80977 7.89987 9.07211 8.16221 9.07211 8.4858V9.22858C9.09778 9.20233 9.12329 9.17588 9.14922 9.14994C10.979 7.32026 13.4118 6.31256 15.9996 6.31256C18.5874 6.31256 21.0202 7.32022 22.8499 9.14994C24.6797 10.9797 25.6873 13.4122 25.6873 15.9997H25.6873ZM9.90774 15.9997C9.90774 12.6403 12.6408 9.90733 16.0001 9.90733C19.3595 9.90733 22.0925 12.6403 22.0925 15.9997C22.0925 19.3591 19.3595 22.0921 16.0001 22.0921C12.6407 22.0921 9.90774 19.3591 9.90774 15.9997ZM15.4142 15.9997C15.4142 16.209 15.5258 16.4024 15.7071 16.5071L17.6913 17.6531C17.7836 17.7064 17.8843 17.7317 17.9838 17.7317C18.1863 17.7317 18.3832 17.6267 18.4917 17.4388C18.6536 17.1585 18.5576 16.8002 18.2774 16.6383L16.5861 15.6615V12.9082C16.5861 12.5846 16.3237 12.3223 16.0001 12.3223C15.6765 12.3223 15.4142 12.5846 15.4142 12.9082V15.9997V15.9997ZM7.48411 15.9997C7.48411 15.6775 7.22168 15.414 6.89836 15.414C6.57504 15.414 6.31262 15.6775 6.31262 15.9997C6.31262 16.3219 6.57614 16.5855 6.89836 16.5855C7.22059 16.5855 7.48411 16.3219 7.48411 15.9997ZM13.7956 24.2245C13.4833 24.1415 13.1622 24.3264 13.0781 24.6397C12.995 24.952 13.1799 25.2731 13.4922 25.3572C13.8055 25.4403 14.1266 25.2554 14.2097 24.942C14.2938 24.6297 14.1089 24.3087 13.7956 24.2245ZM11.7427 23.3741C11.4614 23.2124 11.1038 23.3088 10.9421 23.5889C10.7804 23.8691 10.8757 24.2278 11.1558 24.3895C11.436 24.5511 11.7947 24.4548 11.9564 24.1747C12.1181 23.8945 12.0228 23.5358 11.7427 23.3741ZM9.14946 22.021C8.92137 22.2503 8.92137 22.6212 9.14946 22.8493C9.37868 23.0785 9.74961 23.0785 9.97879 22.8493C10.2069 22.6212 10.2069 22.2503 9.97879 22.021C9.74958 21.7918 9.37864 21.7918 9.14946 22.021ZM7.82516 20.0435C7.54501 20.2051 7.44868 20.5628 7.61036 20.8429C7.772 21.1231 8.13079 21.2194 8.4109 21.0577C8.69106 20.8961 8.78739 20.5373 8.62571 20.2572C8.46407 19.977 8.10528 19.8807 7.82516 20.0435ZM7.77422 18.2032C7.69118 17.8909 7.37008 17.706 7.05672 17.7891C6.74446 17.8732 6.55844 18.1944 6.64258 18.5066C6.72672 18.8199 7.04786 19.0049 7.36008 18.9218C7.67235 18.8377 7.8584 18.5165 7.77422 18.2032ZM7.05672 14.2104C7.37008 14.2934 7.69118 14.1085 7.77422 13.7963C7.85836 13.4829 7.67235 13.1618 7.36012 13.0776C7.04786 12.9946 6.72676 13.1795 6.64262 13.4929C6.55848 13.8051 6.7445 14.1262 7.05676 14.2104H7.05672Z"
                fill="#CB193B"
              />
            </g>
            <defs>
              <clipPath id="clip0_1_1701">
                <rect width="20" height="20" fill="white" transform="translate(6 6)" />
              </clipPath>
            </defs>
          </svg>
        </div>
        <div>
          <div class="text-gray-500">{{ t('Late') }}</div>
          <div class="text-xl font-bold">{{ late }}</div>
        </div>
        </div>
        <div @click.stop="exportExcel('late')" class="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors" title="Excel yuklash">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        </div>
      </div>

      <!-- Отсутствуют (Absent) -->
      <div @click="handleFilter('absent')" class="cursor-pointer transition-all hover:shadow-sm flex items-center justify-between p-4 py-3 bg-white rounded-lg shadow-sm border" :class="{'border-gray-500': params.status === 'absent'}">
        <div class="flex items-center">
          <div class="lg:mr-5 mr-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="52"
              height="52"
              viewBox="0 0 32 32"
              fill="none"
            >
              <rect width="32" height="32" rx="4" fill="white" />
              <rect width="32" height="32" rx="4" fill="#F3F4F6" />
              <path d="M21 11L11 21M11 11L21 21" stroke="#6B7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div>
            <div class="text-gray-500 mb-0.5">{{ t('Absent') }}</div>
            <div class="text-xl font-bold">{{ absent }}</div>
          </div>
        </div>
        <div @click.stop="exportExcel('absent')" class="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors" title="Excel yuklash">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        </div>
      </div>
    </div>

    <div class="w-full">
      <div
        class="p-4 pb-3 py-3 lg:mt-0 mt-5 border-t border-x rounded-t-lg flex justify-between flex-wrap items-center"
      >
        <h3 class="font-semibold text-lg">{{ t('employees') }}</h3>
        <div class="flex items-center gap-4">
          <Input v-model="search" :placeholder="t('search')" class="w-[200px]" />
          <div>
            <DatePicker @confirm:date="(e) => handleDateFilter(e, 'date')" />
          </div>
        </div>
      </div>
      <div class="lg:w-full max-w-[92vw]">
        <DataTable
          :columns="columns"
          :data="paginatedAttendances"
          :pagination="tablePagination"
          :loading="isLoading"
          @update:pagination="handlePaginationUpdate"
        />
      </div>
    </div>
  </div>
</template>
