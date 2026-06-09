<script setup lang="ts">
import UserContextBadges from '@/components/UserContextBadges.vue'
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import { fetchCameras, createCamera, updateCamera, deleteCamera, resyncSchool, syncAllCameras, fetchSyncPreview, fetchCameraUsers, importCameraUsers, fetchClassesBySchool } from '../api'
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
  ArrowRightIcon,
  DownloadIcon,
  XIcon
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
const showPassword = ref(false)
const formType = ref(1)
// DDNS (external access for cameras without public IP)
const formUseDdns = ref(false)
const formDdnsHost = ref('')
const formExternalPort = ref<number | undefined>(9001)

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

// ── Sync ALL schools to cameras (push system → camera) ──────────
const isSyncPreviewOpen = ref(false)
const syncPreviewLoading = ref(false)
const syncPreview = ref<any | null>(null)

const syncAllMutation = useMutation({
  mutationFn: () => syncAllCameras(),
  onSuccess: () => {
    isSyncPreviewOpen.value = false
    toast.success(
      t('sync-all-started', "Sinxronizatsiya boshlandi. O'quvchi va o'qituvchilar kameralarga yuborilmoqda.")
    )
  },
  onError: (error: any) => {
    toast.error(error?.response?.data?.message || t('resync-error', 'Xatolik yuz berdi'))
  }
})

// Open preview modal and load counts first
const handleSyncAll = async () => {
  isSyncPreviewOpen.value = true
  syncPreview.value = null
  syncPreviewLoading.value = true
  try {
    const res = await fetchSyncPreview()
    syncPreview.value = (res as any)?.data?.result || (res as any)?.result || null
  } catch (e: any) {
    toast.error(e?.response?.data?.message || t('resync-error', 'Xatolik yuz berdi'))
    isSyncPreviewOpen.value = false
  } finally {
    syncPreviewLoading.value = false
  }
}

const confirmSyncAll = () => {
  syncAllMutation.mutate()
}

// ── Import FROM camera (camera → system) ────────────────────────
const isImportOpen = ref(false)
const importCameraId = ref<number | null>(null)
const importLoading = ref(false)
const importRows = ref<any[]>([])

const openImportDialog = () => {
  importCameraId.value = cameras.value.length ? cameras.value[0].id : null
  importRows.value = []
  importResult.value = null
  isImportOpen.value = true
  loadImportClasses()
}

// The camera belongs to a school; load that school's classes for student assignment.
const importSchoolId = ref<number | null>(null)
const importClasses = ref<any[]>([])

const importSchoolName = computed(() => {
  const cam = cameras.value.find((c) => c.id === importCameraId.value)
  return cam?.schoolName || cam?.school?.name || ''
})

const loadImportClasses = async () => {
  importClasses.value = []
  importSchoolId.value = null
  if (!importCameraId.value) return
  const cam = cameras.value.find((c) => c.id === importCameraId.value)
  const schoolId = cam?.schoolId || cam?.school?.id
  if (!schoolId) return
  importSchoolId.value = schoolId
  try {
    const res = await fetchClassesBySchool(schoolId)
    importClasses.value = (res as any)?.data?.result?.data || (res as any)?.data?.result || []
  } catch {
    importClasses.value = []
  }
}

const loadCameraUsers = async () => {
  if (!importCameraId.value) {
    toast.error(t('select-camera-first', 'Avval kamerani tanlang'))
    return
  }
  importLoading.value = true
  try {
    const res = await fetchCameraUsers(importCameraId.value)
    const list = (res as any)?.data?.result || (res as any)?.result || []
    // Map each camera user to an editable import row
    importRows.value = list.map((u: any) => {
      const fullName = (u.name || '').trim().split(/\s+/)
      return {
        employeeNo: u.employeeNo,
        // best-effort name split: "Familiya Ism" → lastName firstName
        lastName: fullName[0] || '',
        firstName: fullName.slice(1).join(' ') || '',
        fatherName: '',
        // auto-detected kind from S{id}/T{id}; 0 = unknown, force admin to pick
        kind: u.detectedKind || 0,
        gender: 1,
        classId: null,
        schoolId: null,
        selected: true
      }
    })
    if (!importRows.value.length) {
      toast.info(t('no-camera-users', 'Kamerada foydalanuvchilar topilmadi'))
    }
  } catch (e: any) {
    toast.error(e?.response?.data?.message || t('camera-fetch-error', "Kameradan ma'lumot olishda xatolik"))
  } finally {
    importLoading.value = false
  }
}

const importResult = ref<any | null>(null)

const importMutation = useMutation({
  mutationFn: () => {
    const users = importRows.value
      .filter((r) => r.selected && r.kind > 0)
      .map((r) => ({
        employeeNo: r.employeeNo,
        firstName: r.firstName,
        lastName: r.lastName,
        fatherName: r.fatherName,
        kind: r.kind,
        gender: r.gender,
        classId: r.kind === 1 ? r.classId : null,
        schoolId: r.kind === 2 ? r.schoolId : null
      }))
    return importCameraUsers({ cameraId: importCameraId.value!, users })
  },
  onSuccess: (res: any) => {
    const result = res?.data?.result || res?.result || {}
    importResult.value = result
    toast.success(t('import-done', "Import yakunlandi"))
    queryClient.invalidateQueries({ queryKey: ['cameras-list'] })
  },
  onError: (error: any) => {
    toast.error(error?.response?.data?.message || t('import-error', 'Import xatosi'))
  }
})

const handleImport = () => {
  const ready = importRows.value.filter((r) => r.selected && r.kind > 0)
  if (!ready.length) {
    toast.error(t('select-rows-and-kind', "Kamida bitta qator tanlang va turini belgilang"))
    return
  }
  importMutation.mutate()
}

// Form Actions
const openAddDrawer = () => {
  isEditing.value = false
  currentCameraId.value = null
  formName.value = ''
  formSerialNumber.value = ''
  formIpAddress.value = ''
  formUsername.value = ''
  formPassword.value = ''
  showPassword.value = false
  formType.value = 1
  formUseDdns.value = false
  formDdnsHost.value = ''
  formExternalPort.value = 9001
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
  formUseDdns.value = camera.useDdns || false
  formDdnsHost.value = camera.ddnsHost || ''
  formExternalPort.value = camera.externalPort ?? 9001

  // Support both nested school object and flat regionId/cityId fields
  if (camera.school) {
    const schoolObj = camera.school
    formRegionId.value = schoolObj.region?.id ? String(schoolObj.region.id) : 'all'
    formCityId.value = schoolObj.city?.id ? String(schoolObj.city.id) : 'all'
    formSchoolId.value = String(schoolObj.id)
  } else if (camera.regionId) {
    formRegionId.value = String(camera.regionId)
    formCityId.value = camera.cityId ? String(camera.cityId) : 'all'
    formSchoolId.value = camera.schoolId ? String(camera.schoolId) : 'all'
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
    schoolId: Number(formSchoolId.value),
    useDdns: formUseDdns.value,
    ddnsHost: formUseDdns.value ? formDdnsHost.value.trim() : null,
    externalPort: formUseDdns.value ? Number(formExternalPort.value) || undefined : undefined
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
      const schoolMatch = (cam.schoolName || cam.school?.name)?.toLowerCase().includes(q)
      if (!nameMatch && !snMatch && !ipMatch && !schoolMatch) return false
    }

    if (selectedRegion.value !== 'all') {
      const rId = cam.regionId || cam.school?.region?.id || cam.school?.regionId
      if (String(rId) !== selectedRegion.value) return false
    }

    if (selectedCity.value !== 'all') {
      const cId = cam.cityId || cam.school?.city?.id || cam.school?.cityId
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
  return cam.regionName || cam.school?.region?.name || ''
}

const getCityName = (cam: any) => {
  return cam.cityName || cam.school?.city?.name || ''
}

const getSchoolName = (cam: any) => {
  return cam.schoolName || cam.school?.name || ''
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
      class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 py-4 pt-0 px-4 sm:px-6 border-b border-gray-200 bg-white"
    >
      <div>
      <h1 class="text-[20px] font-bold text-[#1b1b1b] tracking-tight flex items-center gap-2">
        <span>{{ t('sozlamalar', 'Sozlamalar') }}</span>
      </h1>
        <UserContextBadges />
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <Button
          @click="handleSyncAll"
          :disabled="syncAllMutation.isPending.value"
          class="h-10 px-4 rounded-xl bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm flex items-center gap-2 border border-gray-200 transition-all cursor-pointer"
        >
          <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': syncAllMutation.isPending.value }" />
          <span>{{ t('sync-all-to-cameras', 'Hammasini kameraga yuborish') }}</span>
        </Button>
        <Button
          @click="openImportDialog"
          class="h-10 px-4 rounded-xl bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm flex items-center gap-2 border border-gray-200 transition-all cursor-pointer"
        >
          <DownloadIcon class="w-4 h-4" />
          <span>{{ t('import-from-camera', 'Kameradan import') }}</span>
        </Button>
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

            <!-- DDNS external access -->
            <div class="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
              <label class="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  v-model="formUseDdns"
                  class="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span class="text-sm font-semibold text-gray-700">
                  {{ t('use-ddns', 'Tashqaridan ulanish (DDNS)') }}
                </span>
              </label>
              <p class="text-xs text-gray-400 leading-snug">
                {{ t('ddns-hint', "Kamerada tashqi (public) IP bo'lmasa yoqing. Router port-forward orqali ulanadi.") }}
              </p>

              <template v-if="formUseDdns">
                <div class="space-y-1.5">
                  <Label class="text-xs font-medium text-gray-600">{{ t('ddns-host', 'DDNS manzili') }}</Label>
                  <Input
                    v-model="formDdnsHost"
                    placeholder="30-maktab.duckdns.org"
                    class="h-10 rounded-lg border border-gray-300 focus:border-primary bg-white"
                  />
                </div>
                <div class="space-y-1.5">
                  <Label class="text-xs font-medium text-gray-600">{{ t('external-port', 'Tashqi port') }}</Label>
                  <Input
                    v-model.number="formExternalPort"
                    type="number"
                    placeholder="9001"
                    class="h-10 rounded-lg border border-gray-300 focus:border-primary bg-white"
                  />
                </div>
              </template>
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
              <div class="relative">
                <Input
                  v-model="formPassword"
                  :type="showPassword ? 'text' : 'password'"
                  :placeholder="t('password-placeholder')"
                  class="h-11 rounded-lg border border-gray-300 focus:border-primary bg-white pr-10"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  :title="showPassword ? t('hide-password', 'Yashirish') : t('show-password', 'Korsatish')"
                >
                  <!-- Eye open -->
                  <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                  <!-- Eye closed -->
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Type -->
            <div class="space-y-1.5">
              <Label class="text-sm font-semibold text-gray-700">{{ t('camera-type', 'Kamera turi') }}</Label>
              <Select :model-value="String(formType)" @update:model-value="(v) => formType = Number(v)">
                <SelectTrigger class="h-11 rounded-lg border border-gray-300 focus:border-primary bg-white">
                  <SelectValue :placeholder="t('camera-type', 'Kamera turi')" />
                </SelectTrigger>
                <SelectContent class="bg-white">
                  <SelectItem value="1">{{ t('camera-type-entrance', 'Kirish') }}</SelectItem>
                  <SelectItem value="2">{{ t('camera-type-exit', 'Chiqish') }}</SelectItem>
                  <SelectItem value="3">{{ t('camera-type-both', 'Kirish va chiqish') }}</SelectItem>
                </SelectContent>
              </Select>
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

    <!-- ── Import from camera modal ──────────────────────────────── -->
    <div
      v-if="isImportOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      @click.self="isImportOpen = false"
    >
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[88vh] flex flex-col overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div class="flex items-center gap-2">
            <DownloadIcon class="w-5 h-5 text-[#ff792d]" />
            <h3 class="text-base font-bold text-gray-800">{{ t('import-from-camera', 'Kameradan import') }}</h3>
          </div>
          <button @click="isImportOpen = false" class="text-gray-400 hover:text-gray-600">
            <XIcon class="w-5 h-5" />
          </button>
        </div>

        <!-- Camera select + load -->
        <div class="px-5 py-3 border-b border-gray-50 flex items-end gap-3">
          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-gray-500">{{ t('cameras', 'Kamera') }}</label>
            <select
              v-model="importCameraId"
              @change="loadImportClasses"
              class="h-9 px-3 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:border-[#ff792d] bg-white min-w-[220px]"
            >
              <option v-for="cam in cameras" :key="cam.id" :value="cam.id">
                {{ cam.name }} — {{ cam.schoolName || cam.school?.name || '' }}
              </option>
            </select>
          </div>
          <Button
            @click="loadCameraUsers"
            :disabled="importLoading"
            class="h-9 px-4 rounded-lg bg-[#ff792d] hover:bg-[#e06520] text-white text-sm font-semibold flex items-center gap-2"
          >
            <Loader2Icon v-if="importLoading" class="w-4 h-4 animate-spin" />
            <RefreshCw v-else class="w-4 h-4" />
            {{ t('load-camera-users', 'Kameradan yuklash') }}
          </Button>
        </div>

        <!-- Rows -->
        <div class="flex-1 overflow-y-auto overflow-x-auto px-5 py-3">
          <div v-if="importLoading" class="flex items-center justify-center py-12 text-gray-400">
            <Loader2Icon class="w-6 h-6 animate-spin" />
          </div>
          <div v-else-if="!importRows.length" class="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
            <CameraIcon class="w-8 h-8 opacity-40" />
            <p class="text-sm">{{ t('load-camera-users-hint', "Kameradan foydalanuvchilarni yuklang") }}</p>
          </div>
          <table v-else class="w-full text-sm min-w-[480px]">
            <thead>
              <tr class="bg-gray-50 text-xs text-gray-500 uppercase">
                <th class="px-2 py-2 w-8"></th>
                <th class="px-2 py-2 text-left">{{ t('last-name', 'Familiya') }}</th>
                <th class="px-2 py-2 text-left">{{ t('first-name', 'Ism') }}</th>
                <th class="px-2 py-2 text-left">{{ t('type', 'Turi') }}</th>
                <th class="px-2 py-2 text-left">{{ t('sinf', 'Sinf') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="(row, i) in importRows" :key="i" class="hover:bg-gray-50">
                <td class="px-2 py-2">
                  <input type="checkbox" v-model="row.selected" class="w-4 h-4 rounded border-gray-300 text-[#ff792d]" />
                </td>
                <td class="px-2 py-2">
                  <input v-model="row.lastName" class="w-full h-8 px-2 rounded border border-gray-200 text-sm focus:outline-none focus:border-[#ff792d]" />
                </td>
                <td class="px-2 py-2">
                  <input v-model="row.firstName" class="w-full h-8 px-2 rounded border border-gray-200 text-sm focus:outline-none focus:border-[#ff792d]" />
                </td>
                <td class="px-2 py-2">
                  <select v-model.number="row.kind" class="h-8 px-2 rounded border border-gray-200 text-sm focus:outline-none focus:border-[#ff792d] bg-white">
                    <option :value="0">— {{ t('select', 'tanlang') }} —</option>
                    <option :value="1">{{ t('student', "O'quvchi") }}</option>
                    <option :value="2">{{ t('teacher', "O'qituvchi") }}</option>
                  </select>
                </td>
                <td class="px-2 py-2">
                  <select
                    v-if="row.kind === 1"
                    v-model.number="row.classId"
                    class="h-8 px-2 rounded border border-gray-200 text-sm focus:outline-none focus:border-[#ff792d] bg-white"
                  >
                    <option :value="null">— {{ t('select', 'tanlang') }} —</option>
                    <option v-for="c in importClasses" :key="c.id" :value="c.id">
                      {{ c.degree }}-{{ c.symbol }}
                    </option>
                  </select>
                  <span v-else-if="row.kind === 2" class="text-xs text-gray-400">{{ importSchoolName }}</span>
                  <span v-else class="text-xs text-gray-300">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Import result panel -->
        <div v-if="importResult" class="mx-5 mb-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
          <div class="flex items-center gap-4 mb-2">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"></span>
              <span class="text-sm font-semibold text-gray-700">
                {{ t('created', 'qo\'shildi') }}: {{ importResult.created || 0 }}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
              <span class="text-sm font-semibold text-gray-700">
                {{ t('skipped', "o'tkazib yuborildi") }}: {{ importResult.skipped || 0 }}
              </span>
            </div>
          </div>
          <div v-if="importResult.errors && importResult.errors.length" class="mt-2 max-h-[120px] overflow-y-auto">
            <p class="text-xs font-medium text-gray-500 mb-1">{{ t('errors', 'Xatolar') }}:</p>
            <ul class="space-y-0.5">
              <li v-for="(err, i) in importResult.errors" :key="i" class="text-xs text-red-500">• {{ err }}</li>
            </ul>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
          <span class="text-xs text-gray-400">
            {{ importRows.filter((r) => r.selected && r.kind > 0).length }} / {{ importRows.length }} {{ t('selected', 'tanlangan') }}
          </span>
          <div class="flex gap-2">
            <Button @click="isImportOpen = false" class="h-9 px-4 rounded-lg bg-white border border-gray-200 text-gray-600 text-sm hover:bg-gray-50">
              {{ importResult ? t('close', 'Yopish') : t('cancel', 'Bekor') }}
            </Button>
            <Button
              v-if="!importResult"
              @click="handleImport"
              :disabled="importMutation.isPending.value"
              class="h-9 px-4 rounded-lg bg-[#ff792d] hover:bg-[#e06520] text-white text-sm font-semibold flex items-center gap-2"
            >
              <Loader2Icon v-if="importMutation.isPending.value" class="w-4 h-4 animate-spin" />
              {{ t('import', 'Import qilish') }}
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Sync-all preview modal ────────────────────────────────── -->
    <div
      v-if="isSyncPreviewOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      @click.self="isSyncPreviewOpen = false"
    >
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div class="flex items-center gap-2">
            <RefreshCw class="w-5 h-5 text-[#ff792d]" />
            <h3 class="text-base font-bold text-gray-800">{{ t('sync-all-to-cameras', 'Hammasini kameraga yuborish') }}</h3>
          </div>
          <button @click="isSyncPreviewOpen = false" class="text-gray-400 hover:text-gray-600">
            <XIcon class="w-5 h-5" />
          </button>
        </div>

        <!-- Body -->
        <div class="px-5 py-4">
          <div v-if="syncPreviewLoading" class="flex items-center justify-center py-10 text-gray-400">
            <Loader2Icon class="w-6 h-6 animate-spin" />
          </div>

          <template v-else-if="syncPreview">
            <p class="text-sm text-gray-500 mb-4">{{ t('sync-preview-hint', 'Quyidagi maʼlumotlar kameralarga yuboriladi:') }}</p>
            <div class="space-y-2.5">
              <div class="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50">
                <span class="text-sm text-gray-600">{{ t('students', "O'quvchilar") }}</span>
                <span class="text-sm font-semibold text-gray-800">
                  {{ syncPreview.totalStudents }}
                  <span class="text-xs text-green-600 font-normal">({{ syncPreview.studentsWithPhoto }} {{ t('with-photo', 'rasmli') }})</span>
                </span>
              </div>
              <div class="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50">
                <span class="text-sm text-gray-600">{{ t('teachers', "O'qituvchilar") }}</span>
                <span class="text-sm font-semibold text-gray-800">
                  {{ syncPreview.totalTeachers }}
                  <span class="text-xs text-green-600 font-normal">({{ syncPreview.teachersWithPhoto }} {{ t('with-photo', 'rasmli') }})</span>
                </span>
              </div>
              <div class="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50">
                <span class="text-sm text-gray-600">{{ t('cameras', 'Kameralar') }}</span>
                <span class="text-sm font-semibold text-gray-800">{{ syncPreview.totalCameras }}</span>
              </div>
              <div v-if="syncPreview.schoolsWithoutCamera > 0" class="flex items-center justify-between py-2 px-3 rounded-lg bg-amber-50">
                <span class="text-sm text-amber-700">{{ t('schools-without-camera', 'Kamerasiz maktablar') }}</span>
                <span class="text-sm font-semibold text-amber-700">{{ syncPreview.schoolsWithoutCamera }}</span>
              </div>
              <div class="flex items-center justify-between py-2 px-3 rounded-lg bg-orange-50 border border-orange-100">
                <span class="text-sm font-medium text-[#e06520]">{{ t('estimated-push', 'Jami yuborish') }}</span>
                <span class="text-sm font-bold text-[#e06520]">{{ syncPreview.estimatedPushCount }}</span>
              </div>
            </div>
            <p class="text-xs text-gray-400 mt-3">{{ t('sync-bg-note', 'Yuborish fonda amalga oshiriladi va biroz vaqt olishi mumkin.') }}</p>
          </template>
        </div>

        <!-- Footer -->
        <div class="px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
          <Button @click="isSyncPreviewOpen = false" class="h-9 px-4 rounded-lg bg-white border border-gray-200 text-gray-600 text-sm hover:bg-gray-50">
            {{ t('cancel', 'Bekor') }}
          </Button>
          <Button
            @click="confirmSyncAll"
            :disabled="syncPreviewLoading || syncAllMutation.isPending.value"
            class="h-9 px-4 rounded-lg bg-[#ff792d] hover:bg-[#e06520] text-white text-sm font-semibold flex items-center gap-2"
          >
            <Loader2Icon v-if="syncAllMutation.isPending.value" class="w-4 h-4 animate-spin" />
            {{ t('start-sync', 'Yuborishni boshlash') }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.absolute.right-4.top-4),
:deep(button[class*='absolute'][class*='right-4']),
:deep(button[class*='opacity-70']) {
  display: none !important;
}
</style>
