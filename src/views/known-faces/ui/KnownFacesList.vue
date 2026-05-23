<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useI18n } from 'vue-i18n'
import { fetchKnownFaces } from '../api'
import type { KnownFace } from '../types'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RangeCalendar } from '@/components/ui/range-calendar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
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

const todayDate = new Date()
const currentYear = todayDate.getFullYear()
const pad = (n: number) => String(n).padStart(2, '0')

const defaultStartStr = `${currentYear}-01-01`
const defaultEndStr = `${currentYear}-${pad(todayDate.getMonth() + 1)}-${pad(todayDate.getDate())}`

// Filters and Pagination
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
  const currentLang = locale.value

  let monthName = ''
  if (currentLang === 'ru') {
    const ruMonths = [
      'Январь',
      'Февраль',
      'Март',
      'Апрель',
      'Май',
      'Июнь',
      'Июль',
      'Август',
      'Сентябрь',
      'Октябрь',
      'Ноябрь',
      'Декабрь'
    ]
    monthName = ruMonths[monthIdx]
  } else if (currentLang === 'uzc') {
    const uzcMonths = [
      'Январь',
      'Февраль',
      'Март',
      'Апрель',
      'Май',
      'Июнь',
      'Июль',
      'Август',
      'Сентябрь',
      'Октябрь',
      'Ноябрь',
      'Декабрь'
    ]
    monthName = uzcMonths[monthIdx]
  } else if (currentLang === 'uz') {
    const uzMonths = [
      'Yanvar',
      'Fevral',
      'Mart',
      'Aprel',
      'May',
      'Iyun',
      'Iyul',
      'Avgust',
      'Sentabr',
      'Oktabr',
      'Noyabr',
      'Dekabr'
    ]
    monthName = uzMonths[monthIdx]
  } else {
    const enMonths = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ]
    monthName = enMonths[monthIdx]
  }

  return `${day} ${monthName}, ${year}`
}

const dateRangeLabel = computed(() => {
  if (
    !selectedDateRange.value ||
    (!selectedDateRange.value.start && !selectedDateRange.value.end)
  ) {
    return t('pick-date')
  }
  const start = selectedDateRange.value.start
  const end = selectedDateRange.value.end

  if (start && end) {
    return `${formatDateValue(start)} - ${formatDateValue(end)}`
  } else if (start) {
    return `${formatDateValue(start)} - ...`
  }
  return t('pick-date')
})

const calendarLocale = computed(() => {
  const currentLang = locale.value
  if (currentLang === 'ru') return 'ru-RU'
  if (currentLang === 'uzc') return 'uz-Cyrl-UZ'
  return 'uz-UZ'
})

// Query Params
const params = computed(() => {
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
  queryKey: ['known-faces', params],
  queryFn: () => fetchKnownFaces(params.value)
})

// Fallback Mock Data as specified by user results
const mockData = ref({
  currentPage: 1,
  totalPages: 1,
  pageSize: 10,
  totalCount: 5,
  hasPrevious: false,
  hasNext: false,
  data: [
    {
      id: 289,
      time: '2026-05-22T18:26:18.880052',
      imageName: '289V6uJjyRfzr49',
      student: null,
      teacher: {
        id: 99,
        createdAt: '2026-05-22T13:22:10.501576Z',
        updatedAt: null,
        firstName: 'Dekos',
        lastName: 'Murrey',
        login: 'dekosmurrey',
        email: 'dekos@gmail.com',
        level: 1,
        mainImageName: '289V6uJjyRfzr49',
        imageNames: ['289V6uJjyRfzr49'],
        school: {
          id: 23,
          name: '17-maktab',
          city: null,
          region: null
        },
        region: {
          id: 4,
          name: 'Buxoro viloyati'
        },
        city: {
          id: 38,
          name: 'Gʻijduvon tumani',
          regionId: 4
        },
        class: {
          id: 3748,
          degree: 10,
          symbol: 'А',
          studyDays: null
        }
      }
    },
    {
      id: 288,
      time: '2026-05-17T14:03:26.447045',
      imageName: '288JK6wcXGAuYvD',
      student: null,
      teacher: {
        id: 93,
        createdAt: '2026-05-17T09:03:17.4488Z',
        updatedAt: null,
        firstName: 'test',
        lastName: 'test',
        login: 'testets',
        email: 'testest@.com',
        level: 1,
        mainImageName: '288JK6wcXGAuYvD',
        imageNames: ['288JK6wcXGAuYvD'],
        school: {
          id: 27,
          name: '3-maktab',
          city: null,
          region: null
        },
        region: {
          id: 14,
          name: 'Toshkent shahri'
        },
        city: {
          id: 172,
          name: 'Shayxontohur tumani',
          regionId: 14
        },
        class: {
          id: 6339,
          degree: 11,
          symbol: 'H',
          studyDays: null
        }
      }
    },
    {
      id: 287,
      time: '2026-05-17T14:00:55.194757',
      imageName: '287NY4Y5DD67VUh',
      student: {
        firstName: 'Sardor',
        lastName: 'Tuxtaev',
        fatherName: 'xxxx',
        dateOfBirth: '2001-01-29T12:45:33.613Z',
        phoneNumber: '+998910082052',
        passport: null,
        gender: 0,
        mainImageName: '287NY4Y5DD67VUh',
        imageIds: ['287NY4Y5DD67VUh'],
        classId: 5752,
        className: '1-A',
        schoolId: 27,
        schoolName: '3-maktab',
        parents: [
          {
            firstName: 'xxxx',
            lastName: 'xxx',
            fatherName: 'xxxx',
            dateOfBirth: '2001-01-29T12:45:33.613Z',
            phoneNumber: '+998910082052',
            passport: '',
            gender: 1,
            workplace: null,
            childId: 65,
            id: 38,
            createdAt: '2026-05-17T09:00:24.0046Z',
            updatedAt: '2026-05-17T09:00:24.184181Z',
            isDeleted: false
          }
        ],
        id: 65,
        createdAt: '2026-05-17T09:00:24.004623Z',
        updatedAt: '2026-05-17T09:00:24.310573Z',
        isDeleted: false
      },
      teacher: null
    },
    {
      id: 286,
      time: '2026-05-17T13:58:48.647018',
      imageName: '286qCXCxXVeqaWP',
      student: {
        firstName: 'Red',
        lastName: 'Red',
        fatherName: 'Red',
        dateOfBirth: '2008-01-01T12:45:33.613Z',
        phoneNumber: '+9987000000',
        passport: '',
        gender: 0,
        mainImageName: '286qCXCxXVeqaWP',
        imageIds: ['286qCXCxXVeqaWP'],
        classId: 3776,
        className: '10-B',
        schoolId: 23,
        schoolName: '17-maktab',
        parents: [],
        id: 62,
        createdAt: '2024-04-25T11:10:12.721195Z',
        updatedAt: '2024-05-06T12:51:45.092899Z',
        isDeleted: false
      },
      teacher: null
    },
    {
      id: 285,
      time: '2026-05-17T13:29:51.509955',
      imageName: '285Cmh8VaQMTFAR',
      student: {
        firstName: 'Sardor',
        lastName: 'Tuxtaev',
        fatherName: 'xxxx',
        dateOfBirth: '2001-01-29T12:45:33.613Z',
        phoneNumber: '+998909561101',
        passport: '',
        gender: 0,
        mainImageName: '285Cmh8VaQMTFAR',
        imageIds: ['285Cmh8VaQMTFAR'],
        classId: 5752,
        className: '1-A',
        schoolId: 27,
        schoolName: '3-maktab',
        parents: [],
        id: 64,
        createdAt: '2026-05-17T08:28:54.666812Z',
        updatedAt: '2026-05-17T08:29:42.609987Z',
        isDeleted: false
      },
      teacher: null
    }
  ]
})

const faces = computed<KnownFace[]>(() => {
  return responseData.value?.result?.data || mockData.value.data
})

const pagination = computed(() => {
  return responseData.value?.result || mockData.value
})

// Full Screen Image Mode
const isFullScreenOpen = ref(false)
const selectedFace = ref<KnownFace | null>(null)

const openFullScreen = (face: KnownFace) => {
  selectedFace.value = face
  isFullScreenOpen.value = true
}

// Format Date for Card
const formatCardDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const currentLang = locale.value

  let monthName = ''
  if (currentLang === 'ru') {
    const ruMonths = [
      'Январь',
      'Февраль',
      'Март',
      'Апрель',
      'Май',
      'Июнь',
      'Июль',
      'Август',
      'Сентябрь',
      'Октябрь',
      'Ноябрь',
      'Декабрь'
    ]
    monthName = ruMonths[date.getMonth()]
  } else if (currentLang === 'uzc') {
    const uzcMonths = [
      'Январь',
      'Февраль',
      'Март',
      'Апрель',
      'Май',
      'Июнь',
      'Июль',
      'Август',
      'Сентябрь',
      'Октябрь',
      'Ноябрь',
      'Декабрь'
    ]
    monthName = uzcMonths[date.getMonth()]
  } else if (currentLang === 'uz') {
    const uzMonths = [
      'Yanvar',
      'Fevral',
      'Mart',
      'Aprel',
      'May',
      'Iyun',
      'Iyul',
      'Avgust',
      'Sentabr',
      'Oktabr',
      'Noyabr',
      'Dekabr'
    ]
    monthName = uzMonths[date.getMonth()]
  } else {
    const enMonths = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ]
    monthName = enMonths[date.getMonth()]
  }

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
    ? 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="300" height="400"><rect width="100%" height="100%" fill="%23090D1A"/><rect x="20" y="20" width="260" height="360" rx="16" fill="none" stroke="%234B6BFB" stroke-width="2" stroke-dasharray="8 8" stroke-opacity="0.8"/><circle cx="150" cy="160" r="55" fill="%234B6BFB" fill-opacity="0.08" stroke="%234B6BFB" stroke-width="3" stroke-opacity="0.7"/><path d="M70,310 C70,250 100,240 150,240 C200,240 230,250 230,310" fill="%234B6BFB" fill-opacity="0.08" stroke="%234B6BFB" stroke-width="3" stroke-opacity="0.7"/></svg>'
    : 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="300" height="400"><rect width="100%" height="100%" fill="%23F8FAFC"/><rect x="20" y="20" width="260" height="360" rx="16" fill="none" stroke="%234B6BFB" stroke-width="2" stroke-dasharray="8 8" stroke-opacity="0.8"/><circle cx="150" cy="160" r="55" fill="%234B6BFB" fill-opacity="0.08" stroke="%234B6BFB" stroke-width="3" stroke-opacity="0.7"/><path d="M70,310 C70,250 100,240 150,240 C200,240 230,250 230,310" fill="%234B6BFB" fill-opacity="0.08" stroke="%234B6BFB" stroke-width="3" stroke-opacity="0.7"/></svg>'
}

const handleImgError = (e: Event) => {
  const target = e.target as HTMLImageElement
  if (target.classList.contains('blur-xl')) {
    target.style.display = 'none'
  } else {
    target.src = getPlaceholderImage()
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

const getImageUrl = (imageName: string) => {
  return `/api/images?filename=${imageName}`
}
</script>

<template>
  <div class="flex flex-col justify-between px-6 pb-6 max-w-[1400px] w-full">
    <div>
      <!-- Header -->
      <header class="flex justify-between items-center border-b pb-3 pt-1">
        <h2 class="scroll-m-20 lg:text-xl text-2xl font-semibold tracking-tight text-[#111625]">
          {{ t('known-faces') }}
        </h2>
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

        <!-- Grid of Known Faces -->
        <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          <div
            v-for="face in faces"
            :key="face.id"
            class="relative rounded-[20px] overflow-hidden aspect-[3/4] group border border-[#E0E6F0] bg-[#F8FAFC] dark:bg-[#090D1A] shadow-sm flex items-center justify-center"
          >
            <!-- Blurred Background Image of itself -->
            <img
              :src="getImageUrl(face.imageName)"
              :alt="face.imageName"
              class="absolute inset-0 w-full h-full object-cover blur-xl opacity-50 scale-110 pointer-events-none"
              @error="handleImgError"
            />

            <!-- Foreground full image uncropped (contain) -->
            <img
              :src="getImageUrl(face.imageName)"
              :alt="face.imageName"
              class="relative z-10 w-full h-full object-contain transition-transform duration-300"
              @error="handleImgError"
            />

            <!-- Top Overlay: Role badge -->
            <div
              class="absolute top-3 left-3 z-20 shadow-sm rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white select-none transition-transform duration-300"
              :class="face.student ? 'bg-[#FF792D]' : 'bg-[#4B6BFB]'"
            >
              {{ face.student ? t('student') : t('teacher') }}
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
              class="absolute inset-0 z-20 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none"
            />

            <!-- Bottom Left Overlay: Name and Details -->
            <div class="absolute bottom-3 left-3 right-3 z-20 flex flex-col text-white select-none">
              <span class="text-[13px] font-bold text-white leading-tight drop-shadow-md truncate">
                {{
                  face.student
                    ? `${face.student.lastName} ${face.student.firstName}`
                    : `${face.teacher?.lastName} ${face.teacher?.firstName}`
                }}
              </span>
              <span class="text-[11px] font-medium text-white/85 truncate -mb-0.5">
                {{
                  face.student ? `${face.student.className}` : `${face.teacher?.school?.name || ''}`
                }}
              </span>
              <div class="flex items-center gap-1.5 text-[10px] text-white/60 font-medium">
                <span>{{ formatCardDate(face.time) }}</span>
                <span>•</span>
                <span>{{ formatCardTime(face.time) }}</span>
              </div>
            </div>
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
            locale === 'ru'
              ? `Страница ${pagination.currentPage} из ${pagination.totalPages}`
              : locale === 'uzc'
                ? `Саҳифа ${pagination.currentPage} of ${pagination.totalPages}`
                : `Sahifa ${pagination.currentPage} of ${pagination.totalPages}`
          }}
        </span>
      </div>

      <!-- Right side (Pagination controls) -->
      <div class="flex items-center gap-2">
        <!-- Previous Page Button -->
        <button
          class="w-8 h-8 rounded-lg border border-[#E0E6F0] bg-white flex items-center justify-center hover:bg-gray-50 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer"
          :disabled="!pagination.hasPrevious"
          @click="handlePageChange(page - 1)"
        >
          <ArrowLeftIcon class="w-4 h-4 text-[#8796AF]" />
        </button>

        <!-- Page Numbers -->
        <div class="flex items-center gap-1">
          <template v-for="(pageNum, idx) in getPageNumbers()" :key="idx">
            <span
              v-if="pageNum === '...'"
              class="w-8 h-8 flex items-center justify-center text-gray-400 select-none"
            >
              ...
            </span>
            <button
              v-else
              class="w-8 h-8 rounded-lg text-sm font-medium flex items-center justify-center transition-all cursor-pointer"
              :class="
                pageNum === page
                  ? 'bg-primary text-white font-semibold'
                  : 'border border-[#E0E6F0] bg-white text-gray-700 hover:bg-gray-50 active:scale-95'
              "
              @click="handlePageChange(pageNum as number)"
            >
              {{ pageNum }}
            </button>
          </template>
        </div>

        <!-- Next Page Button -->
        <button
          class="w-8 h-8 rounded-lg border border-[#E0E6F0] bg-white flex items-center justify-center hover:bg-gray-50 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer"
          :disabled="!pagination.hasNext"
          @click="handlePageChange(page + 1)"
        >
          <ArrowRightIcon class="w-4 h-4 text-[#8796AF]" />
        </button>
      </div>
    </div>

    <!-- Fullscreen Modal Preview -->
    <Dialog v-model:open="isFullScreenOpen">
      <DialogContent
        v-if="selectedFace"
        class="max-w-[90vw] md:max-w-[70vw] lg:max-w-[50vw] max-h-[90vh] bg-black/95 border-none p-0 overflow-hidden rounded-[24px]"
      >
        <div class="relative w-full max-h-[90vh] aspect-[3/4] flex items-center justify-center">
          <!-- Top Right: Close button -->
          <button
            class="absolute top-4 right-4 z-50 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/70 active:scale-95 transition-all cursor-pointer"
            @click="isFullScreenOpen = false"
          >
            <XIcon class="w-4 h-4 text-white" />
          </button>

          <!-- Main Image -->
          <img
            :src="getImageUrl(selectedFace.imageName)"
            class="w-full h-full max-h-[90vh] object-contain relative z-10"
            @error="handleImgError"
          />

          <!-- Fullscreen Bottom Info -->
          <div
            class="absolute bottom-0 inset-x-0 z-30 bg-gradient-to-t from-black via-black/80 to-transparent p-6 text-white select-none"
          >
            <div class="flex items-center gap-3 mb-2">
              <span
                class="px-2.5 py-0.5 rounded-full text-xs font-bold text-white shadow-sm"
                :class="selectedFace.student ? 'bg-[#FF792D]' : 'bg-[#4B6BFB]'"
              >
                {{ selectedFace.student ? t('student') : t('teacher') }}
              </span>
            </div>
            <h3 class="text-xl font-bold text-white leading-tight">
              {{
                selectedFace.student
                  ? `${selectedFace.student.lastName} ${selectedFace.student.firstName}`
                  : `${selectedFace.teacher?.lastName} ${selectedFace.teacher?.firstName}`
              }}
            </h3>
            <p class="text-sm text-white/80 mt-1">
              {{
                selectedFace.student
                  ? `${selectedFace.student.schoolName} • Class ${selectedFace.student.className}`
                  : `${selectedFace.teacher?.school?.name || ''} • ${selectedFace.teacher?.city?.name || ''}`
              }}
            </p>
            <div class="flex items-center gap-2 mt-2 text-xs text-white/40">
              <span>{{ formatCardDate(selectedFace.time) }}</span>
              <span>•</span>
              <span>{{ formatCardTime(selectedFace.time) }}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
