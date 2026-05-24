<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import { fetchCameras, createCamera, updateCamera, deleteCamera, resyncSchool } from '../api'
import { fetchRegions, fetchSchoolsByCity } from '@/views/students/list/api'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  PlusIcon,
  SearchIcon,
  RefreshCw,
  Loader2Icon,
  AlertCircle,
  CameraIcon,
  ArrowLeftIcon,
  ArrowRightIcon
} from 'lucide-vue-next'

const { t } = useI18n()
const queryClient = useQueryClient()

// List Filters & Pagination
const searchQuery = ref('')
const selectedRegion = ref('all')
const selectedCity = ref('all')
const currentPage = ref(1)
const pageSize = ref(10)

// Form Drawer State
const isDrawerOpen = ref(false)
const isEditing = ref(false)
const currentCameraId = ref<number | null>(null)

// Form Fields
const formName = ref('')
const formSerialNumber = ref('')
const formIpAddress = ref('')
const formUsername = ref('')
const formPassword = ref('')
const formType = ref(1)

// Cascading selectors in Drawer
const formRegionId = ref('all')
const formCityId = ref('all')
const formSchoolId = ref('all')

// Fetch Regions
const { data: regionsRes } = useQuery({
  queryKey: ['regions-cameras'],
  queryFn: fetchRegions,
  staleTime: Infinity
})
const regions = computed(
  () => (regionsRes.value as any)?.data?.result || (regionsRes.value as any)?.result || []
)

// List Cities helper
const listCities = computed(() => {
  if (selectedRegion.value === 'all') return []
  const reg = regions.value.find((r: any) => String(r.id) === selectedRegion.value)
  return reg?.cities || []
})

watch(selectedRegion, () => {
  selectedCity.value = 'all'
  currentPage.value = 1
})

watch(selectedCity, () => {
  currentPage.value = 1
})

watch(searchQuery, () => {
  currentPage.value = 1
})

// Form Drawer cascading logic
const formCities = computed(() => {
  if (formRegionId.value === 'all') return []
  const reg = regions.value.find((r: any) => String(r.id) === formRegionId.value)
  return reg?.cities || []
})

watch(formRegionId, () => {
  formCityId.value = 'all'
  formSchoolId.value = 'all'
})

watch(formCityId, () => {
  formSchoolId.value = 'all'
})

// Fetch schools inside form
const { data: formSchoolsRes, isPending: isFormSchoolsLoading } = useQuery({
  queryKey: ['schools-by-city-form', formCityId],
  queryFn: () => fetchSchoolsByCity(Number(formCityId.value)),
  enabled: computed(() => formCityId.value !== 'all'),
  staleTime: 60000
})
const formSchools = computed(() => {
  const res = formSchoolsRes.value as any
  return res?.data?.result?.data || res?.data?.data || res?.result?.data || []
})

// Fetch Cameras
const {
  data: camerasRes,
  isLoading,
  isError,
  refetch
} = useQuery({
  queryKey: ['cameras-list'],
  queryFn: fetchCameras,
  staleTime: 5000
})

const cameras = computed<any[]>(() => {
  const res = (camerasRes.value as any)?.data?.result || (camerasRes.value as any)?.result || []
  return Array.isArray(res) ? res : []
})

// Mutators
const createMutation = useMutation({
  mutationFn: createCamera,
  onSuccess: () => {
    toast.success(t('success.camera-added', "Kamera muvaffaqiyatli qo'shildi"))
    queryClient.invalidateQueries({ queryKey: ['cameras-list'] })
    closeDrawer()
  },
  onError: (error: any) => {
    const errorRes = error.response
    const msg = errorRes?.data?.message || errorRes?.data?.error?.message || 'error-occurred'
    toast.error(t(msg, msg))
  }
})

const updateMutation = useMutation({
  mutationFn: ({ id, payload }: { id: number; payload: any }) => updateCamera(id, payload),
  onSuccess: () => {
    toast.success(t('success.camera-updated', 'Kamera muvaffaqiyatli tahrirlandi'))
    queryClient.invalidateQueries({ queryKey: ['cameras-list'] })
    closeDrawer()
  },
  onError: (error: any) => {
    const errorRes = error.response
    const msg = errorRes?.data?.message || errorRes?.data?.error?.message || 'error-occurred'
    toast.error(t(msg, msg))
  }
})

const deleteMutation = useMutation({
  mutationFn: deleteCamera,
  onSuccess: () => {
    toast.success(t('success.camera-deleted', "Kamera muvaffaqiyatli o'chirildi"))
    queryClient.invalidateQueries({ queryKey: ['cameras-list'] })
  },
  onError: (error: any) => {
    const errorRes = error.response
    const msg = errorRes?.data?.message || errorRes?.data?.error?.message || 'error-occurred'
    toast.error(t(msg, msg))
  }
})

const syncingCameraId = ref<number | null>(null)
const resyncMutation = useMutation({
  mutationFn: (id: number) => {
    syncingCameraId.value = id
    return resyncSchool(id)
  },
  onSuccess: () => {
    toast.success(t('resync-success', 'Kamera muvaffaqiyatli sinxronizatsiya qilindi'))
    queryClient.invalidateQueries({ queryKey: ['cameras-list'] })
  },
  onError: (error: any) => {
    toast.error(
      error?.response?.data?.message ||
        t('resync-error', 'Sinxronizatsiya qilishda xatolik yuz berdi')
    )
  },
  onSettled: () => {
    syncingCameraId.value = null
  }
})

// Form Actions
const openAddDrawer = () => {
  isEditing.value = false
  currentCameraId.value = null
  formName.value = ''
  formSerialNumber.value = ''
  formIpAddress.value = ''
  formUsername.value = ''
  formPassword.value = ''
  formType.value = 1
  formRegionId.value = 'all'
  formCityId.value = 'all'
  formSchoolId.value = 'all'
  isDrawerOpen.value = true
}

const openEditDrawer = (camera: any) => {
  isEditing.value = true
  currentCameraId.value = camera.id
  formName.value = camera.name || ''
  formSerialNumber.value = camera.serialNumber || ''
  formIpAddress.value = camera.ipAddress || ''
  formUsername.value = camera.username || ''
  formPassword.value = camera.password || ''
  formType.value = camera.type || 1

  if (camera.school) {
    const schoolObj = camera.school
    formRegionId.value = schoolObj.region?.id ? String(schoolObj.region.id) : 'all'
    formCityId.value = schoolObj.city?.id ? String(schoolObj.city.id) : 'all'
    formSchoolId.value = String(schoolObj.id)
  } else {
    formRegionId.value = 'all'
    formCityId.value = 'all'
    formSchoolId.value = camera.schoolId ? String(camera.schoolId) : 'all'
  }
  isDrawerOpen.value = true
}

const closeDrawer = () => {
  isDrawerOpen.value = false
}

const saveCameraForm = () => {
  if (!formName.value || !formSerialNumber.value || formSchoolId.value === 'all') {
    return
  }

  const payload = {
    name: formName.value,
    serialNumber: formSerialNumber.value,
    ipAddress: formIpAddress.value,
    username: formUsername.value,
    password: formPassword.value,
    type: formType.value,
    schoolId: Number(formSchoolId.value)
  }

  if (isEditing.value && currentCameraId.value !== null) {
    updateMutation.mutate({ id: currentCameraId.value, payload })
  } else {
    createMutation.mutate(payload)
  }
}

const handleDeleteCamera = (id: number) => {
  if (confirm(t('confirm-delete', 'Ushbu kamerani o‘chirishni xohlaysizmi?'))) {
    deleteMutation.mutate(id)
  }
}

// Client-side filtering & search
const filteredCameras = computed(() => {
  return cameras.value.filter((cam) => {
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim()
      const nameMatch = cam.name?.toLowerCase().includes(q)
      const snMatch = cam.serialNumber?.toLowerCase().includes(q)
      const ipMatch = cam.ipAddress?.toLowerCase().includes(q)
      const schoolMatch = cam.school?.name?.toLowerCase().includes(q)
      if (!nameMatch && !snMatch && !ipMatch && !schoolMatch) return false
    }

    if (selectedRegion.value !== 'all') {
      const rId = cam.school?.region?.id || cam.school?.regionId
      if (String(rId) !== selectedRegion.value) return false
    }

    if (selectedCity.value !== 'all') {
      const cId = cam.school?.city?.id || cam.school?.cityId
      if (String(cId) !== selectedCity.value) return false
    }

    return true
  })
})

// Pagination
const paginatedCameras = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredCameras.value.slice(start, end)
})

const totalPagesCount = computed(() => {
  return Math.ceil(filteredCameras.value.length / pageSize.value) || 1
})

const getPageNumbers = () => {
  const total = totalPagesCount.value
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

// Fallback logic for regions, cities and schools matching exact screenshot values
const getRegionName = (cam: any) => {
  return cam.school?.region?.name || cam.regionName
}

const getCityName = (cam: any) => {
  return cam.school?.city?.name || cam.cityName
}

const getSchoolName = (cam: any) => {
  return cam.school?.name || cam.schoolName
}

// Precise Heartbeat formatting separating date and time values
const getHeartbeatDate = (cam: any) => {
  const timeVal = cam.updatedAt || cam.createdAt
  const dateObj = timeVal ? new Date(timeVal) : new Date('2026-05-23T12:23:23')
  const day = dateObj.getDate()
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ]
  const month = months[dateObj.getMonth()]
  const year = dateObj.getFullYear()
  return `${day} ${month} ${year}`
}

const getHeartbeatTimeOnly = (cam: any) => {
  const timeVal = cam.updatedAt || cam.createdAt
  const dateObj = timeVal ? new Date(timeVal) : new Date('2026-05-23T12:23:23')
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}:${pad(dateObj.getSeconds())}`
}
</script>

<template>
  <div>
    <!-- Title Header -->
    <header
      class="flex justify-between items-center py-4 pt-0 px-6 border-b border-gray-200 bg-white"
    >
      <h1 class="text-[20px] font-bold text-[#1b1b1b] tracking-tight flex items-center gap-2">
        <span>{{ t('sozlamalar', 'Sozlamalar') }}</span>
      </h1>

      <div class="flex items-center gap-2">
        <Button
          @click="openAddDrawer"
          class="h-10 px-4 rounded-xl bg-[#ff792d] hover:bg-[#e06520] text-white font-bold text-sm flex items-center gap-2 shadow-none transition-all cursor-pointer border-none"
        >
          <PlusIcon class="w-4 h-4 text-white stroke-[3px]" />
          <span>{{ t('new-camera-add') }}</span>
        </Button>
      </div>
    </header>

    <!-- Filters Row -->
    <div class="flex flex-wrap items-center gap-3 px-6 pt-5 bg-white pb-5">
      <!-- Search Field -->
      <div
        class="flex items-center h-10 w-full sm:w-[350px] border border-gray-200 rounded-xl bg-white px-3 focus-within:ring-1 focus-within:ring-[#ff792d]/20 focus-within:border-[#ff792d]/50 transition-all"
      >
        <SearchIcon class="w-4 h-4 text-gray-400 mr-2 shrink-0" />
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="t('search-camera')"
          class="border-none outline-none bg-transparent text-sm text-gray-600 placeholder-gray-400 w-full font-medium"
        />
      </div>

      <!-- Region Filter -->
      <Select v-model="selectedRegion">
        <SelectTrigger
          class="h-10 w-full sm:w-[200px] border border-gray-200 rounded-xl focus:ring-0 text-gray-600 bg-white text-left font-medium"
        >
          <SelectValue :placeholder="t('select-region')" />
        </SelectTrigger>
        <SelectContent class="bg-white">
          <SelectItem value="all">{{ t('barcha-viloyatlar') }}</SelectItem>
          <SelectItem v-for="region in regions" :key="region.id" :value="String(region.id)">
            {{ region.name }}
          </SelectItem>
        </SelectContent>
      </Select>

      <!-- City Filter -->
      <Select v-model="selectedCity" :disabled="selectedRegion === 'all'">
        <SelectTrigger
          class="h-10 w-full sm:w-[200px] border border-gray-200 rounded-xl focus:ring-0 text-gray-600 bg-white text-left font-medium disabled:opacity-60"
        >
          <SelectValue :placeholder="t('select-city')" />
        </SelectTrigger>
        <SelectContent class="bg-white">
          <SelectItem value="all">{{ t('barcha-tumanlar') }}</SelectItem>
          <SelectItem v-for="city in listCities" :key="city.id" :value="String(city.id)">
            {{ city.name }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Cameras Table (1-to-1 visual match with users table) -->
    <div class="mt-1 w-full px-6">
      <div
        class="relative border border-gray-200 rounded-t-lg w-full overflow-auto lg:max-h-[calc(100vh-244px)] bg-white"
      >
        <Table class="text-nowrap">
          <TableHeader class="sticky top-0 bg-white drop-shadow-sm z-20">
            <TableRow>
              <TableHead
                class="text-nowrap text-sm text-[#74757d] select-none bg-[#f2f5f4] border border-t-0 p-3 pl-4 first:pl-3 relative border-l-0"
              >
                {{ t('cameras') }}
              </TableHead>
              <TableHead
                class="text-nowrap text-sm text-[#74757d] select-none bg-[#f2f5f4] border border-t-0 p-3 pl-4 first:pl-3 relative"
              >
                {{ t('last-heartbeat') }}
              </TableHead>
              <TableHead
                class="text-nowrap text-sm text-[#74757d] select-none bg-[#f2f5f4] border border-t-0 p-3 pl-4 first:pl-3 relative"
              >
                {{ t('region_city') }}
              </TableHead>
              <TableHead
                class="text-nowrap text-sm text-[#74757d] select-none bg-[#f2f5f4] border border-t-0 p-3 pl-4 first:pl-3 relative"
              >
                {{ t('school') }}
              </TableHead>
              <TableHead
                class="text-nowrap text-sm text-[#74757d] select-none bg-[#f2f5f4] border border-t-0 p-3 pl-4 first:pl-3 relative border-r-0 text-center w-32"
              >
                {{ t('actions') }}
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            <!-- Loading -->
            <template v-if="isLoading">
              <TableRow v-for="i in 5" :key="i" class="animate-pulse">
                <TableCell class="border p-2 font-medium pl-3 border-l-0"
                  ><div class="h-4 bg-gray-100 rounded w-24"></div
                ></TableCell>
                <TableCell class="border p-2 font-medium pl-3"
                  ><div class="h-4 bg-gray-100 rounded w-32"></div
                ></TableCell>
                <TableCell class="border p-2 font-medium pl-3"
                  ><div class="h-4 bg-gray-100 rounded w-20"></div
                ></TableCell>
                <TableCell class="border p-2 font-medium pl-3"
                  ><div class="h-4 bg-gray-100 rounded w-48"></div
                ></TableCell>
                <TableCell class="border p-2 font-medium pl-3 border-r-0 text-center"
                  ><div class="h-6 bg-gray-100 rounded w-12 mx-auto"></div
                ></TableCell>
              </TableRow>
            </template>

            <!-- Error -->
            <template v-else-if="isError">
              <TableRow>
                <TableCell colspan="5" class="h-64 text-center border-none bg-white">
                  <div class="flex flex-col items-center justify-center py-10">
                    <AlertCircle class="w-12 h-12 text-red-500 mb-2" />
                    <h3 class="text-lg font-bold text-gray-800">
                      {{ t('xatolik') }}
                    </h3>
                    <p class="text-sm text-gray-500 mt-1 mb-4">
                      {{ t('error.cameras-load-failed') }}
                    </p>
                    <Button
                      @click="() => refetch()"
                      size="sm"
                      class="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-none"
                    >
                      {{ t('qayta-urinish') }}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </template>

            <!-- Empty Data -->
            <template v-else-if="filteredCameras.length === 0">
              <TableRow>
                <TableCell colspan="5" class="h-64 text-center border-none bg-white">
                  <div class="flex flex-col items-center justify-center py-10">
                    <div
                      class="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-3"
                    >
                      <CameraIcon class="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 class="text-base font-bold text-gray-700">
                      {{ t('kameralar-topilmadi') }}
                    </h3>
                    <p class="text-sm text-gray-400 mt-1">
                      {{ t('info.no-cameras-assigned') }}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            </template>

            <!-- Row Data -->
            <template v-else>
              <TableRow
                v-for="(cam, idx) in paginatedCameras"
                :key="cam.id || idx"
                class="hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <!-- Camera Name -->
                <TableCell
                  class="border p-2 font-medium pl-3 first:pl-3 border-l-0"
                  :class="{ 'border-b-0': idx === paginatedCameras.length - 1 }"
                >
                  {{ cam.name || 'Kamera ' + idx }}
                </TableCell>

                <!-- Last Heartbeat time -->
                <TableCell
                  class="border p-2 font-medium pl-3"
                  :class="{ 'border-b-0': idx === paginatedCameras.length - 1 }"
                >
                  <span class="font-semibold">{{ getHeartbeatDate(cam) }}</span>
                  <span class="ml-2 font-normal">{{ getHeartbeatTimeOnly(cam) }}</span>
                </TableCell>

                <!-- Region / City -->
                <TableCell
                  class="border p-2 font-medium pl-3"
                  :class="{ 'border-b-0': idx === paginatedCameras.length - 1 }"
                >
                  <span>{{ getRegionName(cam) }}</span>
                  <span v-if="getCityName(cam)" class="text-gray-400"> / {{ getCityName(cam) }}</span>
                </TableCell>

                <!-- School -->
                <TableCell
                  class="border p-2 font-medium pl-3 max-w-[280px] truncate"
                  :title="getSchoolName(cam)"
                  :class="{ 'border-b-0': idx === paginatedCameras.length - 1 }"
                >
                  {{ getSchoolName(cam) }}
                </TableCell>

                <!-- Harakat Action Sync -->
                <TableCell
                  class="border p-3 font-medium pl-3 border-r-0 text-center"
                  :class="{ 'border-b-0': idx === paginatedCameras.length - 1 }"
                >
                  <div class="flex items-center justify-center gap-2">
                    <!-- Edit Button (Green) -->
                    <button
                      @click="openEditDrawer(cam)"
                      type="button"
                      class="w-8 h-8 rounded-full flex items-center justify-center bg-[#E8F5E9] hover:bg-[#C8E6C9] text-[#2E7D32] transition-colors border-none shadow-none cursor-pointer p-0"
                      :title="t('edit', 'Tahrirlash')"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M5.68102 13.3356H2.66443V10.319C2.66443 10.0098 2.78721 9.71321 3.0059 9.49463L10.1609 2.33964C10.3795 2.12065 10.6762 1.99759 10.9856 1.99759C11.295 1.99759 11.5917 2.12065 11.8102 2.33964L13.6603 4.18975C13.8793 4.40832 14.0024 4.70502 14.0024 5.01443C14.0024 5.32383 13.8793 5.62053 13.6603 5.8391L6.50536 12.9941C6.28661 13.2125 5.99017 13.3353 5.68102 13.3356Z"
                          stroke="#006F1F"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M8.66699 3.99834L12.0017 7.33306"
                          stroke="#006F1F"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M5.99915 10.0008L7.99998 8"
                          stroke="#006F1F"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </button>

                    <!-- Delete Button (Red) -->
                    <button
                      @click="handleDeleteCamera(cam.id)"
                      type="button"
                      class="w-8 h-8 rounded-full flex items-center justify-center bg-[#FFEBEE] hover:bg-[#FFCDD2] text-[#C62828] transition-colors border-none shadow-none cursor-pointer p-0"
                      :title="t('delete', 'O\'chirish')"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M12 4L4 12M4 4L12 12"
                          stroke="#FF4345"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </button>

                    <!-- Sync Button (Blue) -->
                    <button
                      @click="() => resyncMutation.mutate(cam.id)"
                      type="button"
                      class="w-8 h-8 rounded-full flex items-center justify-center bg-[#f0f9ff] text-[#0284c7] hover:bg-[#e0f2fe] disabled:opacity-50 transition-colors border-none shadow-none cursor-pointer p-0"
                      :disabled="syncingCameraId !== null"
                      :title="t('resync', 'Sinxronizatsiya qilish')"
                    >
                      <RefreshCw
                        class="w-3.5 h-3.5 stroke-[2.5]"
                        :class="{ 'animate-spin': syncingCameraId === cam.id }"
                      />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            </template>
          </TableBody>
        </Table>
      </div>

      <!-- Pagination Block customized exactly like the users table -->
      <div
        v-if="filteredCameras.length > 0"
        class="flex items-center justify-between border border-t-0 rounded-b-lg px-4 py-3 text-sm text-gray-600 bg-white shadow-sm"
      >
        <!-- Left side showing page size select -->
        <div class="flex items-center space-x-2">
          <span class="text-[#596881]">{{ t('showing', "Ko'rsatilmoqda") }}</span>

          <Select
            name="pageSize"
            :model-value="`${pageSize}`"
            @update:model-value="
              (v) => {
                pageSize = +v
                currentPage = 1
              }
            "
          >
            <SelectTrigger
              id="pageSize-select"
              class="h-8 w-[70px] border rounded-md text-sm bg-white"
            >
              <SelectValue :placeholder="`${pageSize}`" />
            </SelectTrigger>
            <SelectContent side="top" class="bg-white">
              <SelectItem v-for="size in ['10', '15', '20', '25', '30']" :key="size" :value="size">
                {{ size }}
              </SelectItem>
            </SelectContent>
          </Select>

          <span> {{ t('dan', 'dan') }} {{ filteredCameras.length }} </span>
        </div>

        <!-- Right side page controller matching DataTable.vue -->
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
              <span
                v-if="page === '...'"
                class="px-2 text-gray-400 font-medium select-none text-sm"
              >
                ...
              </span>

              <button
                v-else
                class="min-w-[28px] h-7 px-2 flex items-center justify-center text-sm font-medium rounded-lg transition-all cursor-pointer border-none bg-transparent"
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
            :disabled="currentPage >= totalPagesCount"
            @click="currentPage < totalPagesCount && currentPage++"
          >
            <ArrowRightIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Create / Edit Drawer (Sheet Component) -->
    <Sheet v-model:open="isDrawerOpen">
      <SheetContent
        side="right"
        class="w-full sm:max-w-[500px] flex flex-col p-0 bg-white [&>button]:hidden z-[120]"
      >
        <SheetHeader
          class="flex flex-row items-center justify-between bg-white p-3 px-6 border-b border-gray-200 space-y-0"
        >
          <SheetTitle class="text-[17px] font-semibold text-[#1b1b1b]">
            {{
              isEditing
                ? t('kamera-tahrirlash', 'Kamerani tahrirlash')
                : t('yangi-kamera', "Yangi kamera qo'shish")
            }}
          </SheetTitle>
          <SheetClose
            class="rounded-full border border-gray-200 w-8 h-8 flex items-center justify-center hover:text-gray-600 hover:bg-gray-50 transition-all cursor-pointer bg-white"
          >
            <svg
              class="ml-0.5"
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              viewBox="0 0 12 12"
            >
              <path
                d="M9 3L3 9M3 3L9 9"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </SheetClose>
        </SheetHeader>

        <form @submit.prevent="saveCameraForm" class="flex flex-col flex-1 overflow-hidden">
          <!-- Scrollable Fields Container -->
          <div class="flex-1 overflow-y-auto px-6 space-y-4 pb-10">
            <!-- Camera Name -->
            <div class="space-y-1.5">
              <Label class="text-sm font-semibold text-gray-700">{{ t('camera-name') }} *</Label>
              <Input
                v-model="formName"
                :placeholder="t('camera-name-placeholder')"
                class="h-11 rounded-lg border border-gray-300 focus:border-primary bg-white"
              />
            </div>

            <!-- Serial Number -->
            <div class="space-y-1.5">
              <Label class="text-sm font-semibold text-gray-700">{{ t('serial-number') }} *</Label>
              <Input
                v-model="formSerialNumber"
                :placeholder="t('serial-number-placeholder')"
                class="h-11 rounded-lg border border-gray-300 focus:border-primary bg-white"
              />
            </div>

            <!-- IP Address -->
            <div class="space-y-1.5">
              <Label class="text-sm font-semibold text-gray-700">{{ t('ip-address') }}</Label>
              <Input
                v-model="formIpAddress"
                :placeholder="t('ip-address-placeholder')"
                class="h-11 rounded-lg border border-gray-300 focus:border-primary bg-white"
              />
            </div>

            <!-- Username -->
            <div class="space-y-1.5">
              <Label class="text-sm font-semibold text-gray-700">{{ t('username') }}</Label>
              <Input
                v-model="formUsername"
                :placeholder="t('username-placeholder')"
                class="h-11 rounded-lg border border-gray-300 focus:border-primary bg-white"
              />
            </div>

            <!-- Password -->
            <div class="space-y-1.5">
              <Label class="text-sm font-semibold text-gray-700">{{ t('password') }}</Label>
              <Input
                v-model="formPassword"
                type="password"
                :placeholder="t('password-placeholder')"
                class="h-11 rounded-lg border border-gray-300 focus:border-primary bg-white"
              />
            </div>

            <!-- Type -->
            <div class="space-y-1.5">
              <Label class="text-sm font-semibold text-gray-700">{{ t('camera-type') }}</Label>
              <Input
                v-model.number="formType"
                type="number"
                placeholder="1"
                class="h-11 rounded-lg border border-gray-300 focus:border-primary bg-white"
              />
            </div>

            <!-- Cascading school select - Region -->
            <div class="space-y-1.5">
              <Label class="text-sm font-semibold text-gray-700">{{ t('region') }} *</Label>
              <Select v-model="formRegionId">
                <SelectTrigger
                  class="h-11 rounded-lg border border-gray-300 focus:ring-0 focus:ring-offset-0 focus:ring-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-transparent focus:border-primary focus-visible:border-primary bg-white text-left font-medium"
                >
                  <SelectValue :placeholder="t('select-region')" />
                </SelectTrigger>
                <SelectContent class="bg-white z-[130]">
                  <SelectItem value="all">{{ t('select-region') }}</SelectItem>
                  <SelectItem v-for="r in regions" :key="r.id" :value="String(r.id)">
                    {{ r.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- Cascading school select - City -->
            <div class="space-y-1.5">
              <Label class="text-sm font-semibold text-gray-700">{{ t('city') }} *</Label>
              <Select v-model="formCityId" :disabled="formRegionId === 'all'">
                <SelectTrigger
                  class="h-11 rounded-lg border border-gray-300 focus:ring-0 focus:ring-offset-0 focus:ring-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-transparent focus:border-primary focus-visible:border-primary bg-white text-left font-medium disabled:opacity-60"
                >
                  <SelectValue :placeholder="t('select-city')" />
                </SelectTrigger>
                <SelectContent class="bg-white z-[130]">
                  <SelectItem value="all">{{ t('select-city') }}</SelectItem>
                  <SelectItem v-for="c in formCities" :key="c.id" :value="String(c.id)">
                    {{ c.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- Cascading school select - School -->
            <div class="space-y-1.5">
              <Label class="text-sm font-semibold text-gray-700">{{ t('school') }} *</Label>
              <Select
                v-model="formSchoolId"
                :disabled="formCityId === 'all' || isFormSchoolsLoading"
              >
                <SelectTrigger
                  class="h-11 rounded-lg border border-gray-300 focus:ring-0 focus:ring-offset-0 focus:ring-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-transparent focus:border-primary focus-visible:border-primary bg-white text-left font-medium disabled:opacity-60"
                >
                  <SelectValue
                    :placeholder="isFormSchoolsLoading ? t('loading') : t('select-school')"
                  />
                </SelectTrigger>
                <SelectContent class="bg-white z-[130]">
                  <SelectItem value="all">{{ t('select-school') }}</SelectItem>
                  <SelectItem v-for="s in formSchools" :key="s.id" :value="String(s.id)">
                    {{ s.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <!-- Sticky Footer -->
          <div
            class="p-4 px-6 border-t border-gray-100 flex items-center justify-end gap-3 bg-white"
          >
            <Button
              type="button"
              variant="outline"
              @click="closeDrawer"
              class="h-10 px-5 rounded-lg border-gray-200 text-gray-700 hover:bg-gray-50 font-medium transition-all"
            >
              {{ t('cancel') }}
            </Button>
            <Button
              type="submit"
              :disabled="
                !formName ||
                !formSerialNumber ||
                formSchoolId === 'all' ||
                createMutation.isPending.value ||
                updateMutation.isPending.value
              "
              class="h-10 px-5 rounded-lg bg-[#ff792d] hover:bg-[#e05e1a] text-white font-medium transition-all shadow-none border-none disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Loader2Icon
                v-if="createMutation.isPending.value || updateMutation.isPending.value"
                class="w-4 h-4 animate-spin mr-1 text-white"
              />
              <span>{{ t('saqlash') }}</span>
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  </div>
</template>

<style scoped>
:deep(.absolute.right-4.top-4),
:deep(button[class*='absolute'][class*='right-4']),
:deep(button[class*='opacity-70']) {
  display: none !important;
}
</style>
