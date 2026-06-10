<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import { createColumns, DataTable, CreateStudentDrawer } from '../modules'
import Can from '@/components/can.vue'
import ServerError from '@/components/error/ServerError.vue'
import type { FetchStudentsParams, StudentModel } from '../types'
import {
  fetchStudents,
  fetchRegions,
  fetchSchoolsByCity,
  fetchClassesBySchool,
  downloadExcelExample,
  uploadExcelFile,
  exportStudentsExcel,
  deleteStudentPhoto,
  postStudentPhoto
} from '../api'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu'
import { SearchIcon, Plus, ChevronDown, Download, Upload } from 'lucide-vue-next'
import { useCurrentUser } from '@/composables/useCurrentUser'
import UserContextBadges from '@/components/UserContextBadges.vue'

const { t, te } = useI18n()
const queryClient = useQueryClient()
const { hideRegionFilter, hideCityFilter, hideSchoolFilter } = useCurrentUser()

const regionFilter = ref<string>('all')
const cityFilter = ref<string>('all')
const schoolFilter = ref<string>('all')
const classFilter = ref<string>('all')
const searchQuery = ref<string>('')
const isCreateDrawerOpen = ref(false)

const sorting = ref<{
  orderBy: string | null
  order: 'asc' | 'desc' | null
}>({
  orderBy: null,
  order: null
})

const rowSelection = ref<Record<string, boolean>>({})

// Query Params
const params = ref<FetchStudentsParams>({
  page: 1,
  size: 20,
  orderBy: 'createdAt',
  order: 'desc'
})

watch(sorting, () => {
  if (sorting.value.orderBy && sorting.value.order) {
    params.value.orderBy = sorting.value.orderBy
    params.value.order = sorting.value.order
  } else {
    params.value.orderBy = undefined
  }
})

watch([regionFilter], () => {
  params.value = {
    ...params.value,
    regionId: regionFilter.value === 'all' ? undefined : Number(regionFilter.value),
    cityId: undefined,
    schoolId: undefined,
    classId: undefined,
    page: 1
  }
  cityFilter.value = 'all'
  schoolFilter.value = 'all'
  classFilter.value = 'all'
})

watch([cityFilter], () => {
  params.value = {
    ...params.value,
    cityId: cityFilter.value === 'all' ? undefined : Number(cityFilter.value),
    schoolId: undefined,
    classId: undefined,
    page: 1
  }
  schoolFilter.value = 'all'
  classFilter.value = 'all'
})

watch([schoolFilter], () => {
  params.value = {
    ...params.value,
    schoolId: schoolFilter.value === 'all' ? undefined : Number(schoolFilter.value),
    classId: undefined,
    page: 1
  }
  classFilter.value = 'all'
})

watch([classFilter], () => {
  params.value = {
    ...params.value,
    classId: classFilter.value === 'all' ? undefined : Number(classFilter.value),
    page: 1
  }
})

let searchTimeout: ReturnType<typeof setTimeout> | null = null
watch(searchQuery, (val) => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    params.value = {
      ...params.value,
      search: val || undefined,
      page: 1
    }
  }, 400)
})

// Fetch students list
const { data, isLoading, isError } = useQuery({
  queryKey: ['students', params],
  queryFn: () => fetchStudents(params.value),
  staleTime: 60000,
  gcTime: Infinity
})

// Fetch regions list
const { data: regionsRes } = useQuery({
  queryKey: ['regions'],
  queryFn: fetchRegions,
  staleTime: Infinity
})
const regions = computed(
  () => (regionsRes.value as any)?.data?.result || (regionsRes.value as any)?.result || []
)

// Cities for selected region
const citiesForFilter = computed(() => {
  if (regionFilter.value === 'all') return []
  const selectedRegion = regions.value.find((r: any) => String(r.id) === regionFilter.value)
  return selectedRegion?.cities || []
})

// Fetch schools list when city is selected
const { data: schoolsRes, isPending: isSchoolsLoading } = useQuery({
  queryKey: ['schools-by-city-filter', cityFilter],
  queryFn: () => fetchSchoolsByCity(Number(cityFilter.value)),
  enabled: computed(() => cityFilter.value !== 'all'),
  staleTime: 60000
})
const schools = computed(() => {
  const res = schoolsRes.value as any
  return res?.data?.result?.data || res?.data?.data || res?.result?.data || []
})

// Fetch classes list when school is selected
const { data: classesRes, isPending: isClassesLoading } = useQuery({
  queryKey: ['classes-by-school-filter', schoolFilter],
  queryFn: () => fetchClassesBySchool(Number(schoolFilter.value)),
  enabled: computed(() => schoolFilter.value !== 'all'),
  staleTime: 60000
})
const classes = computed(() => {
  const res = classesRes.value as any
  return (
    res?.data?.result?.data ||
    res?.data?.result ||
    res?.data?.data ||
    res?.result?.data ||
    res?.result ||
    []
  )
})

const tablePagination = computed(() => {
  const result = (data.value as any)?.data?.result || (data.value as any)?.result
  if (result && typeof result.currentPage === 'number') {
    return {
      currentPage: result.currentPage,
      totalCount: result.totalCount || 0,
      totalPages: result.totalPages || 1,
      pageSize: result.pageSize || params.value.size,
      canPrevPage: result.hasPrevious || false,
      canNextPage: result.hasNext || false
    }
  }
  return {
    currentPage: 1,
    totalCount: 0,
    totalPages: 1,
    pageSize: params.value.size,
    canPrevPage: false,
    canNextPage: false
  }
})

// Photo upload from table row
const photoFileInputRef = ref<HTMLInputElement | null>(null)
const pendingPhotoStudent = ref<StudentModel | null>(null)

const handleUploadPhoto = (student: StudentModel) => {
  pendingPhotoStudent.value = student
  photoFileInputRef.value?.click()
}

const handlePhotoFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  target.value = ''
  if (!file || !pendingPhotoStudent.value) return

  try {
    toast.loading(t('loading', 'Yuklanmoqda...'), { id: 'photo-upload' })
    await postStudentPhoto(pendingPhotoStudent.value.id, file)
    toast.success(t('photo_uploaded', 'Rasm muvaffaqiyatli yuklandi'), { id: 'photo-upload' })
    queryClient.invalidateQueries({ queryKey: ['students'] })
  } catch (error: any) {
    console.error('Photo upload error:', error)
    toast.error(t('error_occurred'), { id: 'photo-upload' })
  }

  pendingPhotoStudent.value = null
}

const handleDeletePhoto = async (student: StudentModel) => {
  const imageName = student.mainImageName || (student.imageIds && student.imageIds.length > 0
    ? student.imageIds[student.imageIds.length - 1]
    : null)

  if (!imageName) return

  try {
    await deleteStudentPhoto(imageName)
    toast.success(t('photo_deleted', 'Rasm muvaffaqiyatli o\'chirildi'))
    queryClient.invalidateQueries({ queryKey: ['students'] })
  } catch (error: any) {
    console.error('Delete photo error:', error)
    toast.error(t('error_occurred'))
  }
}

const columns = computed(() =>
  createColumns({
    onUploadPhoto: handleUploadPhoto,
    onDeletePhoto: handleDeletePhoto
  })
)

const handlePaginationUpdate = (val: { size?: number; page?: number }) => {
  if (val.page !== undefined) {
    params.value.page = val.page
  }
  if (val.size !== undefined) {
    params.value.size = val.size
    params.value.page = 1
  }
}

const tableData = computed(() => {
  const resultData =
    (data.value as any)?.data?.result?.data ||
    (data.value as any)?.data?.data ||
    (data.value as any)?.result?.data ||
    (data.value as any)?.data
  if (resultData && Array.isArray(resultData)) {
    return resultData
  }
  return []
})

const handleRowClick = () => {
  // Row click disabled; actions handled via row actions
}

const excelFileInputRef = ref<HTMLInputElement | null>(null)

const handleDownloadExample = async () => {
  try {
    const fileData = await downloadExcelExample()

    if (fileData instanceof Blob && fileData.type.includes('application/json')) {
      const text = await fileData.text()
      try {
        const json = JSON.parse(text)
        if (json && (json.code === 500 || json.message)) {
          toast.error(json.message || t('error.failed-to-download-example', 'Namuna yuklab olishda xatolik yuz berdi'))
          return
        }
      } catch (e) {
        // Ignore JSON parse error, proceed
      }
    }

    if (fileData && typeof fileData === 'object' && !(fileData instanceof Blob)) {
      if ((fileData as any).code === 500 || (fileData as any).message) {
        toast.error((fileData as any).message || t('error.failed-to-download-example', 'Namuna yuklab olishda xatolik yuz berdi'))
        return
      }
    }

    const blob = new Blob([fileData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'students_example.xlsx')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    toast.success(t('success.example-downloaded', 'Namuna muvaffaqiyatli yuklab olindi'))
  } catch (error: any) {
    console.error('Download excel example error:', error)
    let msg = t('error.failed-to-download-example', 'Namuna yuklab olishda xatolik yuz berdi')

    if (error.response && error.response.data instanceof Blob) {
      try {
        const text = await error.response.data.text()
        const json = JSON.parse(text)
        if (json.message) {
          msg = json.message
        }
      } catch (e) {
        // Ignore
      }
    } else if (error.response?.data?.message) {
      msg = error.response.data.message
    } else if (error.message) {
      msg = error.message
    }

    toast.error(msg)
  }
}

const triggerExcelUpload = () => {
  excelFileInputRef.value?.click()
}

const handleExportExcel = async () => {
  try {
    toast.loading(t('loading', 'Yuklanmoqda...'), { id: 'excel-export' })
    const exportParams = {
      search: params.value.search,
      regionId: params.value.regionId,
      cityId: params.value.cityId,
      schoolId: params.value.schoolId,
      classId: params.value.classId
    }
    const fileData = await exportStudentsExcel(exportParams)
    const blob = new Blob([fileData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', "o'quvchilar.xlsx")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    toast.success(t('success.excel-uploaded', "Ro'yxat muvaffaqiyatli yuklab olindi"), { id: 'excel-export' })
  } catch (error: any) {
    toast.error(t('error_occurred'), { id: 'excel-export' })
  }
}

const handleExcelFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  target.value = ''

  try {
    toast.loading(t('loading.uploading-excel', 'Excel yuklanmoqda...'), { id: 'excel-upload' })
    await uploadExcelFile(file)
    toast.success(t('success.excel-uploaded', 'Excel muvaffaqiyatli yuklandi'), { id: 'excel-upload' })
    queryClient.invalidateQueries({ queryKey: ['students'] })
  } catch (error: any) {
    console.error('Upload excel error:', error)
    const errorRes = error.response ?? {}
    const errorData = errorRes.data
    let firstMsg = ''

    if (Array.isArray(errorData) && errorData.length > 0) {
      firstMsg = errorData[0]?.errorMessage || errorData[0]?.message || ''
    } else {
      firstMsg =
        errorRes?.data?.error?.errors?.[0] ||
        errorRes?.data?.error?.message ||
        errorRes?.data?.message ||
        errorRes?.data?.title ||
        ''
    }

    if (!firstMsg) {
      firstMsg = 'error.failed-to-upload-excel'
    }

    const displayMsg = te(firstMsg) ? t(firstMsg) : firstMsg
    // Excel errors can list several rows; show them for longer and preserve line breaks.
    const isMultiline = typeof displayMsg === 'string' && displayMsg.includes('\n')
    toast.error(displayMsg, {
      id: 'excel-upload',
      duration: isMultiline ? 15000 : 5000,
      style: isMultiline ? { whiteSpace: 'pre-line', maxWidth: '520px', textAlign: 'left' } : undefined
    })
  }
}
</script>

<template>
  <div>
    <!-- Header Title & Add Button -->
    <header
      class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 py-4 pt-0 px-4 sm:px-6 border-b border-gray-200 bg-white"
    >
      <div>
        <h1 class="text-[20px] font-bold text-[#1b1b1b] tracking-tight">
          {{ t('students', "O'quvchilar") }}
        </h1>
        <UserContextBadges />
      </div>

      <div class="flex items-center gap-2.5">
        <!-- Excel Dropdown Menu -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button
              class="h-10 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm flex items-center gap-2 transition-all shadow-none cursor-pointer"
            >
              <!-- Excel Logo SVG -->
              <svg class="w-[18px] h-[18px] shrink-0 text-[#1b1b1b]" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <g clip-path="url(#clip0_students_excel)">
                  <path d="M19.375 3.12584H11.25V1.25084C11.25 1.06459 11.1675 0.888342 11.0238 0.769592C10.8813 0.650842 10.69 0.599592 10.51 0.637092L0.51 2.51209C0.21375 2.56709 0 2.82459 0 3.12584V16.8758C0 17.1758 0.21375 17.4346 0.51 17.4896L10.51 19.3646C10.5475 19.3721 10.5863 19.3758 10.625 19.3758C10.77 19.3758 10.9113 19.3258 11.0238 19.2321C11.1675 19.1133 11.25 18.9358 11.25 18.7508V16.8758H19.375C19.72 16.8758 20 16.5958 20 16.2508V3.75084C20 3.40584 19.72 3.12584 19.375 3.12584ZM8.595 12.0896C8.8225 12.3483 8.79625 12.7433 8.53625 12.9708C8.4175 13.0746 8.27125 13.1258 8.125 13.1258C7.95125 13.1258 7.77875 13.0533 7.655 12.9121L5.8375 10.8358L4.24375 12.8858C4.12 13.0433 3.935 13.1258 3.75 13.1258C3.61625 13.1258 3.48125 13.0833 3.36625 12.9946C3.09375 12.7821 3.045 12.3896 3.25 12.1171L4.99875 9.87709L3.28 7.91209C3.0525 7.65334 3.07875 7.25834 3.33875 7.03084C3.5975 6.80334 3.99125 6.82834 4.22125 7.08959L5.78125 8.87209L7.6325 6.49209C7.845 6.22084 8.2375 6.17084 8.51 6.38334C8.7825 6.59459 8.83125 6.98709 8.61875 7.26084L6.61875 9.83084L8.595 12.0896ZM18.75 15.6258H11.25V14.3758H13.125C13.47 14.3758 13.75 14.0958 13.75 13.7508C13.75 13.4058 13.47 13.1258 13.125 13.1258H11.25V11.8758H13.125C13.47 11.8758 13.75 11.5958 13.75 11.2508C13.75 10.9058 13.47 10.6258 13.125 10.6258H11.25V9.37584H13.125C13.47 9.37584 13.75 9.09584 13.75 8.75084C13.75 8.40584 13.47 8.12584 13.125 8.12584H11.25V6.87584H13.125C13.47 6.87584 13.75 6.59584 13.75 6.25084C13.75 5.90584 13.47 5.62584 13.125 5.62584H11.25V4.37584H18.75V15.6258Z" fill="currentColor"/>
                  <path d="M16.875 5.625H15.625C15.28 5.625 15 5.905 15 6.25C15 6.595 15.28 6.875 15.625 6.875H16.875C17.22 6.875 17.5 6.595 17.5 6.25C17.5 5.905 17.22 5.625 16.875 5.625Z" fill="currentColor"/>
                  <path d="M16.875 8.125H15.625C15.28 8.125 15 8.405 15 8.75C15 9.095 15.28 9.375 15.625 9.375H16.875C17.22 9.375 17.5 9.095 17.5 8.75C17.5 8.405 17.22 8.125 16.875 8.125Z" fill="currentColor"/>
                  <path d="M16.875 10.625H15.625C15.28 10.625 15 10.905 15 11.25C15 11.595 15.28 11.875 15.625 11.875H16.875C17.22 11.875 17.5 11.595 17.5 11.25C17.5 10.905 17.22 10.625 16.875 10.625Z" fill="currentColor"/>
                  <path d="M16.875 13.125H15.625C15.28 13.125 15 13.405 15 13.75C15 14.095 15.28 14.375 15.625 14.375H16.875C17.22 14.375 17.5 14.095 17.5 13.75C17.5 13.405 17.22 13.125 16.875 13.125Z" fill="currentColor"/>
                </g>
                <defs>
                  <clipPath id="clip0_students_excel">
                    <rect width="20" height="20" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
              <span>Excel</span>
              <ChevronDown class="w-4 h-4 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-56 bg-white rounded-xl shadow-lg border border-gray-100 p-1.5 z-[100]">
            <DropdownMenuItem
              @click="handleExportExcel"
              class="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <Download class="w-4 h-4 text-green-600" />
              <span>{{ t('export-excel', "Ro'yxatni yuklab olish") }}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              @click="handleDownloadExample"
              class="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <Download class="w-4 h-4 text-gray-500" />
              <span>{{ t('download-excel-example', 'Namuna yuklab olish') }}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              @click="triggerExcelUpload"
              class="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <Upload class="w-4 h-4 text-gray-500" />
              <span>{{ t('upload-excel-file', 'Excel fayl yuklash') }}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <!-- Hidden input for excel file selection -->
        <input
          ref="excelFileInputRef"
          type="file"
          accept=".xlsx, .xls"
          class="hidden"
          @change="handleExcelFileSelect"
        />

        <!-- Hidden input for photo upload from table -->
        <input
          ref="photoFileInputRef"
          type="file"
          accept="image/png, image/jpeg, image/jpg"
          class="hidden"
          @change="handlePhotoFileSelect"
        />

        <Can i="employees.add">
          <Button
            @click="isCreateDrawerOpen = true"
            class="h-10 px-5 rounded-xl bg-[#ff792d] hover:bg-[#e05e1a] text-white font-bold text-sm flex items-center gap-1.5 transition-all shadow-none border-none cursor-pointer"
          >
            <Plus class="w-4 h-4 stroke-[2.5]" />
            {{ t('new-student-add', "O'quvchi qo'shish") }}
          </Button>
        </Can>
      </div>
    </header>

    <!-- Filters Row -->
    <div class="flex flex-wrap items-center gap-3 px-4 sm:px-6 pt-5 bg-white">
      <!-- Search Input -->
      <div
        class="flex items-center h-10 w-full sm:w-[420px] border border-gray-200 rounded-xl bg-white px-3 focus-within:ring-1 focus-within:ring-[#ff792d]/20 focus-within:border-[#ff792d]/50 transition-all"
      >
        <SearchIcon class="w-4 h-4 text-gray-400 mr-2 shrink-0" />
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="t('search-student', 'O\'quvchi ism-familiyasi bo\'yicha qidiruv')"
          class="border-none outline-none bg-transparent text-sm text-gray-600 placeholder-gray-400 w-full font-medium"
        />
      </div>

      <!-- Region Filter Select -->
      <Select v-if="!hideRegionFilter" v-model="regionFilter" name="regionId">
        <SelectTrigger
          class="h-10 w-full sm:w-[200px] border border-gray-200 rounded-xl focus:ring-0 text-gray-600 bg-white text-left font-medium"
        >
          <SelectValue :placeholder="t('select-region', 'Viloyatni tanlang')" />
        </SelectTrigger>
        <SelectContent class="bg-white">
          <SelectItem value="all">{{ t('all-regions', 'Viloyatni tanlang') }}</SelectItem>
          <SelectItem v-for="region in regions" :key="region.id" :value="String(region.id)">
            {{ region.name }}
          </SelectItem>
        </SelectContent>
      </Select>

      <!-- City Filter Select -->
      <Select v-if="!hideCityFilter" v-model="cityFilter" name="cityId" :disabled="regionFilter === 'all' && !hideRegionFilter">
        <SelectTrigger
          class="h-10 w-full sm:w-[200px] border border-gray-200 rounded-xl focus:ring-0 text-gray-600 bg-white text-left font-medium disabled:opacity-60"
        >
          <SelectValue :placeholder="t('select-city', 'Tumanni tanlang')" />
        </SelectTrigger>
        <SelectContent class="bg-white">
          <SelectItem value="all">{{ t('all-cities', 'Tumanni tanlang') }}</SelectItem>
          <SelectItem v-for="city in citiesForFilter" :key="city.id" :value="String(city.id)">
            {{ city.name }}
          </SelectItem>
        </SelectContent>
      </Select>

      <!-- School Filter Select -->
      <Select
        v-if="!hideSchoolFilter"
        v-model="schoolFilter"
        name="schoolId"
        :disabled="cityFilter === 'all' && !hideCityFilter || isSchoolsLoading"
      >
        <SelectTrigger
          class="h-10 w-full sm:w-[200px] border border-gray-200 rounded-xl focus:ring-0 text-gray-600 bg-white text-left font-medium disabled:opacity-60"
        >
          <SelectValue
            :placeholder="isSchoolsLoading ? t('loading') + '...' : t('school', 'Maktab')"
          />
        </SelectTrigger>
        <SelectContent class="bg-white">
          <SelectItem value="all">{{ t('school') }}</SelectItem>
          <SelectItem v-for="sch in schools" :key="sch.id" :value="String(sch.id)">
            {{ sch.name }}
          </SelectItem>
        </SelectContent>
      </Select>

      <!-- Class Filter Select -->
      <Select
        v-model="classFilter"
        name="classId"
        :disabled="schoolFilter === 'all' || isClassesLoading"
      >
        <SelectTrigger
          class="h-10 w-full sm:w-[200px] border border-gray-200 rounded-xl focus:ring-0 text-gray-600 bg-white text-left font-medium disabled:opacity-60"
        >
          <SelectValue :placeholder="isClassesLoading ? t('loading') + '...' : t('sinf', 'Sinf')" />
        </SelectTrigger>
        <SelectContent class="bg-white">
          <SelectItem value="all">{{ t('sinf', 'Sinf') }}</SelectItem>
          <SelectItem v-for="cls in classes" :key="cls.id" :value="String(cls.id)">
            {{ cls.degree }}-{{ cls.symbol }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Table Section -->
    <Can i="employees.list">
      <template v-if="isError">
        <ServerError />
      </template>
      <template v-else>
        <div class="mt-5 w-full px-4 sm:px-6">
          <DataTable
            :data="tableData"
            :columns="columns"
            :pagination="tablePagination"
            :loading="isLoading"
            @update:pagination="handlePaginationUpdate"
            :sorting="sorting"
            @update:sorting="(val) => (sorting = val as any)"
            v-model:row-selection="rowSelection"
            @row-click="handleRowClick"
            :is-teacher="true"
          />
        </div>
      </template>
    </Can>

    <!-- Create Student Drawer -->
    <CreateStudentDrawer v-model:open="isCreateDrawerOpen" />
  </div>
</template>
