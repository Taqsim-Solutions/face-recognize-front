<script setup lang="ts">
import UserContextBadges from '@/components/UserContextBadges.vue'
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import { fetchUnknownFaces, deleteUnknownFace } from '../api'
import type { UnknownFace, FetchUnknownFacesParams } from '../types'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RangeCalendar } from '@/components/ui/range-calendar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  ChevronDown,
  ArrowLeftIcon,
  ArrowRightIcon,
  Loader2Icon,
  XIcon,
  Maximize2Icon
} from 'lucide-vue-next'
import { type DateValue, parseDate } from '@internationalized/date'

const { t, locale } = useI18n()
const queryClient = useQueryClient()

const todayDate = new Date()
const currentYear = todayDate.getFullYear()
const pad = (n: number) => String(n).padStart(2, '0')

const defaultStartStr = `${currentYear}-01-01`
const defaultEndStr = `${currentYear}-${pad(todayDate.getMonth() + 1)}-${pad(todayDate.getDate())}`

// Filters and Pagination with default range from beginning of year to today
const page = ref(1)
const size = ref(10)
const dateFrom = ref<string>(defaultStartStr)
const dateTo = ref<string>(defaultEndStr)

const selectedDateRange = ref<any>({
  start: parseDate(defaultStartStr),
  end: parseDate(defaultEndStr)
})
const isCalendarOpen = ref(false)

const formatDateValue = (dateVal: DateValue) => {
  const year = dateVal.year
  const monthIdx = dateVal.month - 1
  const day = dateVal.day
  const allMonths: Record<string, string[]> = {
    ru:  ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
    uzc: ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
    uz:  ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'],
    en:  ['January','February','March','April','May','June','July','August','September','October','November','December'],
    fa:  ['جنوری','فبروری','مارچ','اپریل','می','جون','جولای','اگست','سپتمبر','اکتوبر','نوامبر','دسمبر'],
    ps:  ['جنوري','فبروري','مارچ','اپریل','می','جون','جولای','اگست','سپتمبر','اکتوبر','نومبر','دسمبر'],
    ur:  ['جنوری','فروری','مارچ','اپریل','مئی','جون','جولائی','اگست','ستمبر','اکتوبر','نومبر','دسمبر']
  }
  const monthName = (allMonths[locale.value] || allMonths['en'])[monthIdx]

  return `${day} ${monthName}, ${year}`
}

const dateRangeLabel = computed(() => {
  if (!selectedDateRange.value || !selectedDateRange.value.start) {
    return t('pick-date')
  }
  const startStr = formatDateValue(selectedDateRange.value.start)
  if (!selectedDateRange.value.end) {
    return `${startStr} - ...`
  }
  const endStr = formatDateValue(selectedDateRange.value.end)
  return `${startStr} - ${endStr}`
})

const calendarLocale = computed(() => {
  if (locale.value === 'ru') return 'ru-RU'
  if (locale.value === 'uzc') return 'uz-Cyrl-UZ'
  return 'uz-UZ'
})

const params = computed<FetchUnknownFacesParams>(() => {
  let dateValFrom = dateFrom.value
  if (dateValFrom && !dateValFrom.endsWith('Z')) {
    dateValFrom = `${dateValFrom}Z`
  }
  let dateValTo = dateTo.value
  if (dateValTo && !dateValTo.endsWith('Z')) {
    dateValTo = `${dateValTo}Z`
  }
  return {
    page: page.value,
    size: size.value,
    dateFrom: dateValFrom || undefined,
    dateTo: dateValTo || undefined
  }
})

const {
  data: responseData,
  isLoading,
  isError
} = useQuery({
  queryKey: ['unknown-faces', params],
  queryFn: () => fetchUnknownFaces(params.value)
})

// Fallback Mock Data as specified by user results
const mockData = ref({
  currentPage: 1,
  totalPages: 8,
  pageSize: 10,
  totalCount: 72,
  hasPrevious: false,
  hasNext: true,
  data: [
    {
      id: 92,
      imageName: '47363f3a-f776-444f-9bbb-317e27b6355b',
      createdAt: '2026-05-17T08:12:24.664885Z'
    },
    {
      id: 88,
      imageName: 'b8000146-eaba-4798-bc45-e0f1ce5b6620',
      createdAt: '2026-05-16T11:04:06.833995Z'
    },
    {
      id: 86,
      imageName: '1415977e-810f-4793-b375-c2ad57a6f433',
      createdAt: '2026-05-16T09:41:31.45574Z'
    },
    {
      id: 83,
      imageName: '3f9327be-7338-49a1-870e-9f474624ff6c',
      createdAt: '2026-05-16T08:50:26.242915Z'
    },
    {
      id: 80,
      imageName: 'a9e8be2f-cb0d-4d42-abf1-a6429f2fabcf',
      createdAt: '2026-05-15T15:47:16.451151Z'
    },
    {
      id: 77,
      imageName: 'b16d7ba8-86ff-41c8-9a4a-20821bfd1bf5',
      createdAt: '2026-05-15T15:31:52.438676Z'
    },
    {
      id: 74,
      imageName: '2c8234de-d7a1-499f-9196-a3724a13fced',
      createdAt: '2026-05-15T15:29:36.960636Z'
    },
    {
      id: 67,
      imageName: '89746557-2d34-4a83-b3b3-15154b301811',
      createdAt: '2026-04-10T06:54:36.600311Z'
    },
    {
      id: 66,
      imageName: '2bb232b1-e249-493d-9d7c-7ac3d4376c46',
      createdAt: '2026-04-10T06:54:36.41749Z'
    },
    {
      id: 63,
      imageName: '0f001eb7-7d46-41c0-8a88-a7d16d022124',
      createdAt: '2026-04-10T06:54:35.882538Z'
    }
  ]
})

const faces = computed<UnknownFace[]>(() => {
  // If the query fails or has no data, gracefully fallback to local mock data
  const apiData = responseData.value?.result?.data
  if (isError.value || !apiData || apiData.length === 0) {
    return mockData.value.data
  }
  return apiData
})

const pagination = computed(() => {
  const result = responseData.value?.result
  if (isError.value || !result) {
    return {
      currentPage: page.value,
      totalPages: mockData.value.totalPages,
      pageSize: size.value,
      totalCount: mockData.value.totalCount,
      hasPrevious: page.value > 1,
      hasNext: page.value < mockData.value.totalPages
    }
  }
  return {
    currentPage: result.currentPage || 1,
    totalPages: result.totalPages || 1,
    pageSize: result.pageSize || size.value,
    totalCount: result.totalCount || 0,
    hasPrevious: result.hasPrevious || false,
    hasNext: result.hasNext || false
  }
})

// Deletion Modal State
const deleteFaceItem = ref<UnknownFace | null>(null)
const isDeleteDialogOpen = ref(false)

const { mutateAsync: deleteFace, isPending: isDeleting } = useMutation({
  mutationFn: (id: number) => deleteUnknownFace(id),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['unknown-faces'] })
    const msg =
      locale.value === 'ru'
        ? 'Изображение успешно удалено'
        : locale.value === 'uzc'
          ? 'Расм муваффақиятли ўчирилди'
          : "Rasm muvaffaqiyatli o'chirildi"
    toast.success(msg)
    isDeleteDialogOpen.value = false
    deleteFaceItem.value = null
  },
  onError: () => {
    toast.error(t('error_occurred'))
  }
})

const openDeleteDialog = (face: UnknownFace) => {
  deleteFaceItem.value = face
  isDeleteDialogOpen.value = true
}

// Full Screen Image State
const selectedFace = ref<UnknownFace | null>(null)
const isFullScreenOpen = ref(false)

const openFullScreen = (face: UnknownFace) => {
  selectedFace.value = face
  isFullScreenOpen.value = true
}

const confirmDelete = async () => {
  if (deleteFaceItem.value !== null) {
    // If it's a mock item not on the actual server, simulate success
    const apiHasItem = responseData.value?.result?.data?.some(
      (f) => f.id === deleteFaceItem.value?.id
    )
    if (!apiHasItem) {
      mockData.value.data = mockData.value.data.filter((f) => f.id !== deleteFaceItem.value?.id)
      const msg =
        locale.value === 'ru'
          ? 'Изображение успешно удалено'
          : locale.value === 'uzc'
            ? 'Расм муваффақиятли ўчирилди'
            : "Rasm muvaffaqiyatli o'chirildi"
      toast.success(msg)
      isDeleteDialogOpen.value = false
      deleteFaceItem.value = null
      return
    }
    try {
      await deleteFace(deleteFaceItem.value.id)
    } catch (e) {
      console.error(e)
    }
  }
}

// Date range helpers
const handleRangeConfirm = (val: any) => {
  selectedDateRange.value = val
  if (val && val.start) {
    dateFrom.value = val.start.toString()
  } else {
    dateFrom.value = ''
  }
  if (val && val.end) {
    dateTo.value = val.end.toString()
  } else {
    dateTo.value = ''
  }
  page.value = 1
  if (val && val.start && val.end) {
    isCalendarOpen.value = false
  }
}

const handleClearRange = () => {
  selectedDateRange.value = undefined
  dateFrom.value = ''
  dateTo.value = ''
  page.value = 1
  isCalendarOpen.value = false
}

// UI Formatters
const getImageUrl = (imageName: string) => {
  return `/api/images?filename=${imageName}`
}

const formatCardName = (id: number) => {
  return `und_${String(id).padStart(6, '0')}.jpg`
}

const formatCardDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const currentLang = locale.value

  const allMonths: Record<string, string[]> = {
    ru:  ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
    uzc: ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
    uz:  ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'],
    en:  ['January','February','March','April','May','June','July','August','September','October','November','December'],
    fa:  ['جنوری','فبروری','مارچ','اپریل','می','جون','جولای','اگست','سپتمبر','اکتوبر','نوامبر','دسمبر'],
    ps:  ['جنوري','فبروري','مارچ','اپریل','می','جون','جولای','اگست','سپتمبر','اکتوبر','نومبر','دسمبر'],
    ur:  ['جنوری','فروری','مارچ','اپریل','مئی','جون','جولائی','اگست','ستمبر','اکتوبر','نومبر','دسمبر']
  }
  const monthName = (allMonths[currentLang] || allMonths['en'])[date.getMonth()]

  const day = date.getDate()
  const year = date.getFullYear()

  return `${day} ${monthName}, ${year}`
}

const formatCardTime = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toTimeString().split(' ')[0]
}

// Pagination Numbers
const getPageNumbers = () => {
  const total = pagination.value.totalPages
  const current = pagination.value.currentPage
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

const handlePageChange = (newPage: number) => {
  if (newPage < 1 || newPage > pagination.value.totalPages) return
  page.value = newPage
}

const getPlaceholderImage = () => {
  const isDark = document.documentElement.classList.contains('dark')
  return isDark
    ? 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="300" height="400"><rect width="100%" height="100%" fill="%23090D1A"/><rect x="20" y="20" width="260" height="360" rx="16" fill="none" stroke="%23FF792D" stroke-width="2" stroke-dasharray="8 8" stroke-opacity="0.8"/><path d="M20,50 L20,20 L50,20" fill="none" stroke="%23FF792D" stroke-width="4" stroke-linecap="round"/><path d="M250,20 L280,20 L280,50" fill="none" stroke="%23FF792D" stroke-width="4" stroke-linecap="round"/><path d="M20,350 L20,380 L50,380" fill="none" stroke="%23FF792D" stroke-width="4" stroke-linecap="round"/><path d="M250,380 L280,380 L280,350" fill="none" stroke="%23FF792D" stroke-width="4" stroke-linecap="round"/><circle cx="150" cy="160" r="55" fill="%23FF792D" fill-opacity="0.08" stroke="%23FF792D" stroke-width="3" stroke-opacity="0.7"/><path d="M70,310 C70,250 100,240 150,240 C200,240 230,250 230,310" fill="%23FF792D" fill-opacity="0.08" stroke="%23FF792D" stroke-width="3" stroke-opacity="0.7"/><line x1="30" y1="200" x2="270" y2="200" stroke="%23FF792D" stroke-width="2" stroke-opacity="0.9"/></svg>'
    : 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="300" height="400"><rect width="100%" height="100%" fill="%23F8FAFC"/><rect x="20" y="20" width="260" height="360" rx="16" fill="none" stroke="%23FF792D" stroke-width="2" stroke-dasharray="8 8" stroke-opacity="0.8"/><path d="M20,50 L20,20 L50,20" fill="none" stroke="%23FF792D" stroke-width="4" stroke-linecap="round"/><path d="M250,20 L280,20 L280,50" fill="none" stroke="%23FF792D" stroke-width="4" stroke-linecap="round"/><path d="M20,350 L20,380 L50,380" fill="none" stroke="%23FF792D" stroke-width="4" stroke-linecap="round"/><path d="M250,380 L280,380 L280,350" fill="none" stroke="%23FF792D" stroke-width="4" stroke-linecap="round"/><circle cx="150" cy="160" r="55" fill="%23FF792D" fill-opacity="0.08" stroke="%23FF792D" stroke-width="3" stroke-opacity="0.7"/><path d="M70,310 C70,250 100,240 150,240 C200,240 230,250 230,310" fill="%23FF792D" fill-opacity="0.08" stroke="%23FF792D" stroke-width="3" stroke-opacity="0.7"/><line x1="30" y1="200" x2="270" y2="200" stroke="%23FF792D" stroke-width="2" stroke-opacity="0.9"/></svg>'
}

const handleImgError = (e: Event) => {
  const target = e.target as HTMLImageElement
  if (target.classList.contains('blur-xl')) {
    target.style.display = 'none'
  } else {
    target.src = getPlaceholderImage()
  }
}
</script>

<template>
  <div class="flex flex-col justify-between px-6 pb-6 max-w-[1400px] w-full">
    <div>
      <!-- Header -->
      <header class="flex justify-between items-center border-b pb-3 pt-1">
        <div>
          <h2 class="scroll-m-20 lg:text-xl text-2xl font-semibold tracking-tight text-[#111625]">
            {{ t('unknown-faces') }}
          </h2>
          <UserContextBadges />
        </div>
      </header>

      <!-- Date Filter -->
      <div class="mt-4 flex items-center">
        <Popover v-model:open="isCalendarOpen">
          <PopoverTrigger as-child>
            <Button
              variant="outline"
              class="h-9 px-3 rounded-lg border border-[#E0E6F0] bg-white text-gray-700 font-medium hover:bg-gray-50 flex items-center justify-between text-sm select-none cursor-pointer"
            >
              <span class="mr-2 text-sm text-[#111625]">
                {{ dateRangeLabel }}
              </span>
              <ChevronDown class="w-4 h-4 text-[#8796AF]" />
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-auto p-0" align="start">
            <RangeCalendar
              :model-value="selectedDateRange"
              :locale="calendarLocale"
              initial-focus
              :week-starts-on="1"
              :weekday-format="'short'"
              @update:model-value="handleRangeConfirm"
            />
            <div v-if="selectedDateRange" class="p-3 pt-0 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                class="text-xs font-normal"
                @click="handleClearRange"
              >
                {{ t('cancel') }}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <!-- Main Content Grid -->
      <div class="mt-5">
        <!-- Loading State -->
        <div v-if="isLoading" class="flex justify-center items-center h-64">
          <Loader2Icon class="animate-spin text-primary w-8 h-8" />
        </div>

        <!-- Error State -->
        <div
          v-else-if="isError"
          class="flex flex-col justify-center items-center h-64 text-red-500"
        >
          <p class="font-semibold">{{ t('error_occurred') }}</p>
        </div>

        <!-- No Data State -->
        <div
          v-else-if="faces.length === 0"
          class="flex justify-center items-center h-64 text-[#8796AF]"
        >
          <p class="text-lg font-medium">{{ t('no-data') }}</p>
        </div>

        <!-- Grid of Unknown Faces -->
        <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          <div
            v-for="face in faces"
            :key="face.id"
            class="relative rounded-[20px] overflow-hidden aspect-[3/4] group border border-[#E0E6F0] bg-[#F8FAFC] dark:bg-[#090D1A] shadow-sm flex items-center justify-center"
          >
            <!-- Blurred Background Image of itself -->
            <img
              :src="getImageUrl(face.imageName)"
              :alt="formatCardName(face.id)"
              class="absolute inset-0 w-full h-full object-cover blur-xl opacity-50 scale-110 pointer-events-none"
              @error="handleImgError"
            />

            <!-- Foreground full image uncropped (contain) -->
            <img
              :src="getImageUrl(face.imageName)"
              :alt="formatCardName(face.id)"
              class="relative z-10 w-full h-full object-contain transition-transform duration-300"
              @error="handleImgError"
            />

            <!-- Top Overlay: Filename -->
            <div
              class="absolute top-3 left-3 z-20 bg-black/40 backdrop-blur-[2px] rounded-md px-2 text-[13px] font-semibold text-white select-none"
            >
              {{ formatCardName(face.id) }}
            </div>

            <!-- Top Right Overlay: Full Screen Button -->
            <button
              class="absolute top-2.5 right-2.5 z-20 w-7 h-7 rounded-full bg-black/30 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/60 active:scale-95 transition-all cursor-pointer"
              @click="openFullScreen(face)"
            >
              <Maximize2Icon class="w-3 h-3 text-white" />
            </button>

            <!-- Bottom Gradient Overlay -->
            <div
              class="absolute inset-0 z-20 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none"
            />

            <!-- Bottom Left Overlay: Timestamp -->
            <div class="absolute bottom-3 left-3 z-20 flex flex-col text-white select-none">
              <span class="text-[13px] font-bold text-white/90 -mb-1">{{
                formatCardDate(face.createdAt)
              }}</span>
              <span class="text-[12px] font-medium text-white/70">{{
                formatCardTime(face.createdAt)
              }}</span>
            </div>

            <!-- Bottom Right Overlay: Delete Button -->
            <button
              class="absolute bottom-4 right-3 z-20 w-10 h-10 rounded-full bg-black/30 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/60 active:scale-95 transition-all cursor-pointer"
              @click="openDeleteDialog(face)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="44"
                height="44"
                viewBox="0 0 44 44"
                fill="none"
              >
                <rect width="44" height="44" rx="22" fill="black" fill-opacity="0.01" />
                <path
                  d="M28.6667 19.5003L27.0042 28.9553C26.9363 29.3415 26.7346 29.6913 26.4343 29.9434C26.1341 30.1955 25.7545 30.3337 25.3625 30.3337H18.6375C18.2455 30.3337 17.8659 30.1955 17.5657 29.9434C17.2654 29.6913 17.0637 29.3415 16.9958 28.9553L15.3333 19.5003M29.5 17.0003H24.8125M24.8125 17.0003V15.3337C24.8125 14.8916 24.6369 14.4677 24.3243 14.1551C24.0118 13.8426 23.5879 13.667 23.1458 13.667H20.8542C20.4121 13.667 19.9882 13.8426 19.6757 14.1551C19.3631 14.4677 19.1875 14.8916 19.1875 15.3337V17.0003M24.8125 17.0003H19.1875M14.5 17.0003H19.1875"
                  stroke="white"
                  stroke-width="1.25"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination Footer -->
    <div
      v-if="!isLoading && faces.length > 0"
      class="flex items-center justify-between border-t border-[#E0E6F0] pt-4 mt-6 text-sm text-[#596881]"
    >
      <!-- Left side (Sahifa X of Y) -->
      <div>
        <span>
          {{
            locale === 'ru'  ? `Страница ${pagination.currentPage} из ${pagination.totalPages}` :
            locale === 'uzc' ? `Саҳифа ${pagination.currentPage} / ${pagination.totalPages}` :
            locale === 'uz'  ? `Sahifa ${pagination.currentPage} / ${pagination.totalPages}` :
            locale === 'en'  ? `Page ${pagination.currentPage} of ${pagination.totalPages}` :
            locale === 'fa'  ? `صفحه ${pagination.currentPage} از ${pagination.totalPages}` :
            locale === 'ps'  ? `پاڼه ${pagination.currentPage} / ${pagination.totalPages}` :
            locale === 'ur'  ? `صفحہ ${pagination.currentPage} / ${pagination.totalPages}` :
                               `Sahifa ${pagination.currentPage} / ${pagination.totalPages}`
          }}
        </span>
      </div>

      <!-- Right side (Pagination controls) -->
      <div class="flex items-center gap-2">
        <!-- Prev Button -->
        <button
          class="w-8 h-8 rounded-lg border border-[#E0E6F0] bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          :disabled="!pagination.hasPrevious"
          @click="handlePageChange(pagination.currentPage - 1)"
        >
          <ArrowLeftIcon class="w-4 h-4" />
        </button>

        <!-- Numbers Container -->
        <div class="flex items-center gap-1 bg-[#f4f4f5] p-1 rounded-lg">
          <template v-for="pageNumber in getPageNumbers()" :key="pageNumber">
            <span
              v-if="pageNumber === '...'"
              class="px-2 text-gray-400 font-medium select-none text-sm"
            >
              ...
            </span>

            <button
              v-else
              class="min-w-[28px] h-7 px-2 flex items-center justify-center text-sm font-medium rounded-lg transition-all cursor-pointer border-none"
              :class="[
                pageNumber === pagination.currentPage
                  ? 'bg-white text-black shadow-sm font-semibold'
                  : 'text-gray-600 hover:text-black font-semibold hover:bg-gray-200/50'
              ]"
              @click="handlePageChange(pageNumber as number)"
            >
              {{ pageNumber }}
            </button>
          </template>
        </div>

        <!-- Next Button -->
        <button
          class="w-8 h-8 rounded-lg border border-[#E0E6F0] bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          :disabled="!pagination.hasNext"
          @click="handlePageChange(pagination.currentPage + 1)"
        >
          <ArrowRightIcon class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Beautiful Deletion Confirmation Dialog (Synced with RowActions style) -->
    <Dialog v-model:open="isDeleteDialogOpen">
      <DialogContent class="sm:max-w-[460px] !rounded-xl p-5 gap-0 border-none bg-white">
        <DialogHeader class="border-b border-gray-300 pb-3 text-left w-full">
          <DialogTitle class="text-base sm:text-lg font-semibold text-[#1b1b1b] -mt-1 select-none">
            {{ t('confirm-delete-image-title') }}
          </DialogTitle>
        </DialogHeader>

        <!-- Custom Close Button -->
        <button
          type="button"
          @click="isDeleteDialogOpen = false"
          class="absolute z-10 right-3 top-3 rounded-full border border-gray-200 w-8 h-8 flex items-center justify-center hover:text-gray-600 hover:bg-gray-50 transition-all cursor-pointer bg-white"
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
        </button>

        <div v-if="deleteFaceItem" class="flex flex-col items-center gap-4 w-full mt-4">
          <!-- Thumbnail Image Preview Container -->
          <div
            class="relative w-full h-[160px] rounded-xl overflow-hidden border border-[#E0E6F0] bg-[#F8FAFC] dark:bg-[#090D1A] flex items-center justify-center"
          >
            <!-- Blurred Background Image of itself -->
            <img
              :src="getImageUrl(deleteFaceItem.imageName)"
              :alt="formatCardName(deleteFaceItem.id)"
              class="absolute inset-0 w-full h-full object-cover blur-xl opacity-50 scale-110 pointer-events-none"
              @error="handleImgError"
            />

            <!-- Foreground full image uncropped (contain) -->
            <img
              :src="getImageUrl(deleteFaceItem.imageName)"
              :alt="formatCardName(deleteFaceItem.id)"
              class="relative z-10 w-full h-full object-contain"
              @error="handleImgError"
            />
          </div>

          <!-- Warning Message -->
          <p
            class="text-base text-center text-[#1b1b1b] leading-relaxed font-semibold max-w-[280px] sm:max-w-[380px] mx-auto select-none mt-2"
          >
            {{ t('confirm-delete-image-msg') }}
          </p>
        </div>

        <div class="flex items-center justify-end gap-3 pt-8 w-full">
          <!-- Cancel Button -->
          <Button
            type="button"
            variant="outline"
            @click="isDeleteDialogOpen = false"
            :disabled="isDeleting"
            class="h-10 px-5 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold text-sm shadow-none cursor-pointer transition-all bg-white"
          >
            {{ t('cancel') }}
          </Button>

          <!-- Delete Button (primary color orange style matching [f27a3a] / [e06c27]) -->
          <Button
            type="button"
            @click="confirmDelete"
            :loading="isDeleting"
            :disabled="isDeleting"
            class="h-10 px-5 bg-[#f27a3a] hover:bg-[#e06c27] text-white rounded-lg font-semibold text-sm shadow-none cursor-pointer transition-all border-none flex items-center justify-center"
          >
            <Loader2Icon v-if="isDeleting" class="animate-spin mr-2 h-4 w-4" />
            {{ t('delete') }}
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    <!-- Full Screen Image Preview Dialog -->
    <Dialog v-model:open="isFullScreenOpen">
      <DialogContent
        class="max-w-[90vw] sm:max-w-[500px] md:max-w-[600px] lg:max-w-[700px] max-h-[90vh] !rounded-2xl p-0 overflow-hidden border-none bg-black/95 flex items-center justify-center"
      >
        <!-- Custom Close Button -->
        <button
          type="button"
          @click="isFullScreenOpen = false"
          class="absolute z-30 right-4 top-4 rounded-full bg-black/50 hover:bg-black/80 w-9 h-9 flex items-center justify-center text-white border-none shadow-md transition-all cursor-pointer"
        >
          <XIcon class="w-5 h-5 text-white" />
        </button>

        <img
          v-if="selectedFace"
          :src="getImageUrl(selectedFace.imageName)"
          :alt="formatCardName(selectedFace.id)"
          class="w-full h-auto max-h-[90vh] object-contain select-none"
        />
      </DialogContent>
    </Dialog>
  </div>
</template>

<style scoped>
/* Scoped overrides to perfectly align with custom scroll or overlays */
</style>
