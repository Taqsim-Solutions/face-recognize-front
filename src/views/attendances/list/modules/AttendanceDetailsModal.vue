<template>
  <Dialog :open="modelValue" @update:open="(val) => emit('update:modelValue', val)">
    <DialogContent class="sm:max-w-[700px] rounded-2xl p-0 overflow-hidden">
      <DialogHeader class="border-b px-6 py-4 bg-gray-50 flex flex-row items-center justify-between shrink-0 relative">
        <DialogTitle class="text-lg font-semibold">{{ t('employee-attendance-info') }}</DialogTitle>
        <DialogDescription class="sr-only">{{ t('employee-attendance-info') }}</DialogDescription>
        <DialogClose as-child>
          <button
            class="rounded-lg hover:opacity-100 transition bg-white z-10"
            aria-label="Close"
            style="transform: translate(10px, -2px);"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
            >
              <rect x="0.5" y="0.5" width="31" height="31" rx="7.5" fill="white" />
              <rect x="0.5" y="0.5" width="31" height="31" rx="7.5" stroke="#E0E6F0" />
              <path
                d="M20 12L12 20M12 12L20 20"
                stroke="#596881"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </DialogClose>
      </DialogHeader>

      <div class="p-6 pt-2 space-y-6">
        <div class="flex flex-col md:flex-row justify-between bg-gray-50 rounded-xl border p-4">
          <div>
            <h3 class="font-semibold text-lg">
              {{ attendance?.employee?.user?.lastName }} {{ attendance?.employee?.user?.firstName }}
            </h3>
            <p class="mt-0.5 text-sm text-gray-600">
              {{ prettifyPhoneNumber(attendance?.employee?.user?.phoneNumber || '') }}
            </p>
            <p
              class="text-sm mt-3 py-1.5 px-3 rounded-md bg-white border border-border inline-block"
              v-if="attendance?.tardinessReason"
            >
              <span class="text-grayx2 mr-0.5">{{ t('reason') }}:</span>
              {{ attendance?.tardinessReason }}
            </p>
          </div>
          <div class="text-right text-sm text-gray-600">
            <p>
              <span class="text-grayx2 mr-1.5">{{ t('date') }}:</span>
              <span class="font-medium">{{ dayjs(attendance?.date).format('DD.MM.YYYY') }}</span>
            </p>
            <p
              class="mt-1.5 flex items-center"
              v-if="
                !attendanceAsDay?.leave &&
                !(
                  (attendanceAsDay?.holidayDescription || attendanceAsDay?.isWeekend) &&
                  !attendance?.checkInTime &&
                  !attendance?.checkOutTime
                )
              "
            >
              <span class="text-grayx2 mr-1.5">{{ t('hoursWorked') }}:</span>
              <component :is="workedTimeText" />
            </p>
          </div>
        </div>

        <div
          v-if="attendanceAsDay?.leave"
          class="flex flex-col bg-[#F2F4F7] rounded-xl border border-[#D0D5DD] p-4"
        >
          <h3 class="font-semibold text-lg text-[#344054] flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            {{ t('employee-leaves') }}
          </h3>
          <div class="mt-3 text-sm text-gray-600 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="text-gray-500 mb-1">{{ t('leave-type') }}</p>
              <p class="font-medium text-gray-900 bg-white px-2 py-1 rounded border inline-block">
                {{
                  attendanceAsDay.leave?.type
                    ? t(
                        `leave-types.${
                          attendanceAsDay.leave.type.charAt(0).toUpperCase() +
                          attendanceAsDay.leave.type.slice(1)
                        }`
                      )
                    : ''
                }}
              </p>
            </div>
            <div>
              <p class="text-gray-500 mb-1">{{ t('start-end-date') }}</p>
              <p class="font-medium text-gray-900">
                {{ dayjs(attendanceAsDay.leave?.startDate).format('DD.MM.YYYY') }} -
                {{ dayjs(attendanceAsDay.leave?.endDate).format('DD.MM.YYYY') }}
              </p>
            </div>
            <div v-if="attendanceAsDay.leave?.reason" class="col-span-1 md:col-span-2">
              <p class="text-gray-500 mb-1">{{ t('reason') }}</p>
              <p class="font-medium text-gray-900">{{ attendanceAsDay.leave?.reason }}</p>
            </div>
          </div>
        </div>

        <div
          v-if="attendanceAsDay?.holidayDescription"
          class="flex flex-col bg-[#EFF6FF] rounded-xl border border-[#BFDBFE] p-4"
        >
          <h3 class="font-semibold text-lg text-[#3B82F6] flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="w-[20px] h-[20px]"
            >
              <path d="M5.8 11.3 2 22l10.7-3.8" />
              <path d="M4 20l.1.1" />
              <path d="m16 2 3 5c.5 1 2 2 2 2s.5-1 0-3-3-4-3-4z" />
              <path d="M7 2c.5 0 2 1 2 2s-1 1-1.5.5-1.5-1.5-1-2z" />
              <path d="M21.5 17.9c0-.5-1-2-2-2s-1 1-.5 1.5 1.5 1.5 2 1z" />
              <path d="M22 3s-1 1.5-2.5 1.5S17 3 17 3" />
              <path d="m15 11 1 1" />
              <path d="m10 6 1 1" />
              <path d="m10 11 3 3" />
              <path d="m7 8 3 3" />
              <path d="m14 7 1 1" />
              <path d="m17 10 1 1" />
            </svg>
            {{ t('holiday') }}
          </h3>
          <div class="mt-2">
            <p class="text-sm text-gray-700 font-medium">
              {{ attendanceAsDay.holidayDescription }}
            </p>
          </div>
        </div>

        <div
          v-if="
            attendanceAsDay?.isWeekend &&
            !attendanceAsDay?.leave &&
            !attendanceAsDay?.holidayDescription
          "
          class="flex flex-col bg-[#F9FAFB] rounded-xl border p-4"
        >
          <h3 class="font-semibold text-lg flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="w-[20px] h-[20px]"
            >
              <path d="M17 8h1a4 4 0 1 1 0 8h-1"></path>
              <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"></path>
              <line x1="6" y1="2" x2="6" y2="4"></line>
              <line x1="10" y1="2" x2="10" y2="4"></line>
              <line x1="14" y1="2" x2="14" y2="4"></line>
            </svg>
            {{ t('weekend') }}
          </h3>
        </div>

        <div
          v-if="
            !attendanceAsDay?.leave &&
            !(
              (attendanceAsDay?.holidayDescription || attendanceAsDay?.isWeekend) &&
              !attendance?.checkInTime &&
              !attendance?.checkOutTime
            )
          "
          class="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div class="rounded-xl border border-[#A3E5CD] bg-[#EBF9F4] p-4 flex items-center gap-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="50"
              height="51"
              viewBox="0 0 40 41"
              fill="none"
            >
              <g filter="url(#filter0_i_196_5318)">
                <path
                  d="M0 8.5C0 4.08172 3.58172 0.5 8 0.5H32C36.4183 0.5 40 4.08172 40 8.5V32.5C40 36.9183 36.4183 40.5 32 40.5H8C3.58172 40.5 0 36.9183 0 32.5V8.5Z"
                  fill="url(#paint0_linear_196_5318)"
                />
                <path
                  d="M8 1H32C36.1421 1 39.5 4.35786 39.5 8.5V32.5C39.5 36.6421 36.1421 40 32 40H8C3.85786 40 0.5 36.6421 0.5 32.5V8.5C0.5 4.35786 3.85786 1 8 1Z"
                  stroke="#A3E5CD"
                />
                <path
                  d="M14.4746 11.2153C16.1626 10.09 18.3801 11.1214 18.709 13.0161H22C23.5188 13.0161 24.75 14.2473 24.75 15.7661C24.75 16.1803 24.4142 16.5161 24 16.5161C23.5858 16.5161 23.25 16.1803 23.25 15.7661C23.25 15.0758 22.6904 14.5161 22 14.5161H18.75V27.0161H22C22.6903 27.0161 23.25 26.4564 23.25 25.7661C23.25 25.3519 23.5858 25.0161 24 25.0161C24.4142 25.0161 24.75 25.3519 24.75 25.7661C24.75 27.2849 23.5188 28.5161 22 28.5161H18.709C18.3801 30.4109 16.1625 31.4422 14.4746 30.3169L12.4746 28.9839C11.7096 28.4739 11.25 27.6152 11.25 26.6958V14.8364C11.25 13.917 11.7096 13.0584 12.4746 12.5483L14.4746 11.2153ZM22.4697 18.2358C22.7626 17.943 23.2374 17.943 23.5303 18.2358C23.823 18.5287 23.8231 19.0035 23.5303 19.2964L22.8105 20.0161H28C28.4141 20.0162 28.75 20.3519 28.75 20.7661C28.7499 21.1802 28.4141 21.516 28 21.5161H22.8105L23.5303 22.2358C23.823 22.5287 23.8231 23.0035 23.5303 23.2964C23.2374 23.5892 22.7626 23.5892 22.4697 23.2964L21.1768 22.0034C20.4934 21.32 20.4934 20.2122 21.1768 19.5288L22.4697 18.2358Z"
                  fill="#33B586"
                />
              </g>
              <defs>
                <filter
                  id="filter0_i_196_5318"
                  x="0"
                  y="-0.5"
                  width="40"
                  height="41"
                  filterUnits="userSpaceOnUse"
                  color-interpolation-filters="sRGB"
                >
                  <feFlood flood-opacity="0" result="BackgroundImageFix" />
                  <feBlend
                    mode="normal"
                    in="SourceGraphic"
                    in2="BackgroundImageFix"
                    result="shape"
                  />
                  <feColorMatrix
                    in="SourceAlpha"
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    result="hardAlpha"
                  />
                  <feOffset dy="-1" />
                  <feGaussianBlur stdDeviation="0.5" />
                  <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                  <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
                  <feBlend mode="normal" in2="shape" result="effect1_innerShadow_196_5318" />
                </filter>
                <linearGradient
                  id="paint0_linear_196_5318"
                  x1="20"
                  y1="0.5"
                  x2="20"
                  y2="40.5"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stop-color="#F7F9FB" />
                  <stop offset="1" stop-color="white" />
                </linearGradient>
              </defs>
            </svg>
            <div>
              <p class="text-grayx1 text-sm">{{ t('check-in-time') }}</p>
              <p class="text-2xl font-semibold text-green-600 mt-0.5">
                {{ attendance?.checkInTime || '-- --' }}
              </p>
            </div>
          </div>

          <div class="rounded-xl border border-[#F097A8] bg-[#FCE8EC] p-4 flex items-center gap-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="50"
              height="51"
              viewBox="0 0 40 41"
              fill="none"
            >
              <g filter="url(#filter0_i_196_5324)">
                <path
                  d="M0 8.5C0 4.08172 3.58172 0.5 8 0.5H32C36.4183 0.5 40 4.08172 40 8.5V32.5C40 36.9183 36.4183 40.5 32 40.5H8C3.58172 40.5 0 36.9183 0 32.5V8.5Z"
                  fill="url(#paint0_linear_196_5324)"
                />
                <path
                  d="M8 1H32C36.1421 1 39.5 4.35786 39.5 8.5V32.5C39.5 36.6421 36.1421 40 32 40H8C3.85786 40 0.5 36.6421 0.5 32.5V8.5C0.5 4.35786 3.85786 1 8 1Z"
                  stroke="#F097A8"
                />
                <path
                  d="M14.4746 11.2153C16.1626 10.09 18.3801 11.1214 18.709 13.0161H22C23.5188 13.0161 24.75 14.2473 24.75 15.7661C24.75 16.1803 24.4142 16.5161 24 16.5161C23.5858 16.5161 23.25 16.1803 23.25 15.7661C23.25 15.0758 22.6904 14.5161 22 14.5161H18.75V27.0161H22C22.6903 27.0161 23.25 26.4564 23.25 25.7661C23.25 25.3519 23.5858 25.0161 24 25.0161C24.4142 25.0161 24.75 25.3519 24.75 25.7661C24.75 27.2849 23.5188 28.5161 22 28.5161H18.709C18.3801 30.4109 16.1625 31.4422 14.4746 30.3169L12.4746 28.9839C11.7096 28.4739 11.25 27.6152 11.25 26.6958V14.8364C11.25 13.917 11.7096 13.0584 12.4746 12.5483L14.4746 11.2153ZM25.4697 17.9692C25.7626 17.6764 26.2374 17.6764 26.5303 17.9692L27.8232 19.2622C28.5066 19.9456 28.5065 21.0534 27.8232 21.7368L26.5303 23.0298C26.2374 23.3227 25.7626 23.3227 25.4697 23.0298C25.1769 22.7369 25.1769 22.2621 25.4697 21.9692L26.1895 21.2495H21C20.5858 21.2495 20.25 20.9137 20.25 20.4995C20.2501 20.0854 20.5858 19.7495 21 19.7495H26.1895L25.4697 19.0298C25.1769 18.7369 25.1769 18.2621 25.4697 17.9692Z"
                  fill="#CB193B"
                />
              </g>
              <defs>
                <filter
                  id="filter0_i_196_5324"
                  x="0"
                  y="-0.5"
                  width="40"
                  height="41"
                  filterUnits="userSpaceOnUse"
                  color-interpolation-filters="sRGB"
                >
                  <feFlood flood-opacity="0" result="BackgroundImageFix" />
                  <feBlend
                    mode="normal"
                    in="SourceGraphic"
                    in2="BackgroundImageFix"
                    result="shape"
                  />
                  <feColorMatrix
                    in="SourceAlpha"
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    result="hardAlpha"
                  />
                  <feOffset dy="-1" />
                  <feGaussianBlur stdDeviation="0.5" />
                  <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                  <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
                  <feBlend mode="normal" in2="shape" result="effect1_innerShadow_196_5324" />
                </filter>
                <linearGradient
                  id="paint0_linear_196_5324"
                  x1="20"
                  y1="0.5"
                  x2="20"
                  y2="40.5"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stop-color="#F7F9FB" />
                  <stop offset="1" stop-color="white" />
                </linearGradient>
              </defs>
            </svg>
            <div>
              <p class="text-grayx1 text-sm">{{ t('check-out-time') }}</p>
              <p class="text-2xl font-semibold mt-0.5">
                {{ attendance?.checkOutTime || '-- --' }}
              </p>
            </div>
          </div>
        </div>

        <div
          v-if="hasAllDayAttendances"
          class="space-y-3"
          style="max-height: 280px; overflow-y: auto"
        >
          <h3 class="font-semibold text-gray-700">{{ t('all-day-attendances') }}</h3>
          <div
            v-for="(record, index) in attendance?.allDayAttendances"
            :key="index"
            class="flex justify-between items-center border rounded-lg px-4 py-3 bg-gray-50"
          >
            <div>
              <p class="text-sm text-grayx1">
                {{ t('time-interval') }}: <br />
                <span class="font-medium text-black inline-block mt-0.5 text-base">
                  {{ dayjs(record.checkInTime).format('HH:mm') }} -
                  {{ record.checkOutTime && dayjs(record.checkOutTime).format('HH:mm') }}
                </span>
              </p>
            </div>
            <div class="text-sm py-1 px-3 bg-white rounded-full border border-border">
              {{ Math.floor(record.hoursWorked) }}{{ t('hours') }}
              {{
                Math.round((record.hoursWorked % 1) * 60)
                  ? ' ' + Math.round((record.hoursWorked % 1) * 60) + t('minutes')
                  : ''
              }}
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, h } from 'vue'
import { useI18n } from 'vue-i18n'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import DialogClose from '@/components/ui/dialog/DialogClose.vue'
import type { Attendance } from '../types'
import { prettifyPhoneNumber } from '@/lib/utils'
import { DayAttendance } from './prepareTableData'
import dayjs from 'dayjs'

const { t } = useI18n()

interface Props {
  modelValue: boolean
  attendance?: Attendance | DayAttendance
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])

const attendanceAsDay = computed(() => props.attendance as DayAttendance)

const workedTimeText = computed(() => {
  const val = props.attendance?.hoursWorkedFormatted?.trim() || ''

  // Extract first two numbers found (hours, minutes)
  const numbers = val.match(/\d+/g) || []
  const hours = Number(numbers[0] || 0)
  const minutes = Number(numbers[1] || 0)

  let colorClass = ''
  let icon = null
  let label = ''

  if (hours >= 9) {
    // ✅ Full workday
    colorClass = 'text-[#38C793] rounded-full px-1.5 py-0.5 border border-[#38C793] bg-white'
    label = `${hours}${t('hours')} ${minutes > 0 ? `${minutes}${t('minutes')}` : ''}`
    icon = h(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 18 18',
        fill: 'none',
        class: 'w-[16px] h-[16px]'
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
  } else if (hours >= 6) {
    // ⚠️ Partial day
    colorClass = 'text-[orange] rounded-full px-1.5 py-0.5 border border-[orange] bg-white'
    label = `${hours}${t('hours')} ${minutes > 0 ? `${minutes}${t('minutes')}` : ''}`
    icon = h(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 18 18',
        fill: 'none',
        class: 'w-[16px] h-[16px]'
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
    // ❌ Very low work
    colorClass = 'text-[#DF1C41] rounded-full px-1.5 py-0.5 border border-[#DF1C41] bg-white'
    label = `${hours}${t('hours')} ${minutes > 0 ? `${minutes}${t('minutes')}` : ''}`
    icon = h(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 15 17',
        fill: 'none',
        class: 'w-[14px] h-[14px]'
      },
      [
        h('path', {
          d: 'M1.5 14.75V13.25C1.5 12.4543 1.81607 11.6913 2.37868 11.1287C2.94129 10.5661 3.70435 10.25 4.5 10.25H7.125M9.75 14.75L12.75 11.75M3 4.25C3 5.04565 3.31607 5.80871 3.87868 6.37132C4.44129 6.93393 5.20435 7.25 6 7.25C6.79565 7.25 7.55871 6.93393 8.12132 6.37132C8.68393 5.80871 9 5.04565 9 4.25C9 3.45435 8.68393 2.69129 8.12132 2.12868C7.55871 1.56607 6.79565 1.25 6 1.25C5.20435 1.25 4.44129 1.56607 3.87868 2.12868C3.31607 2.69129 3 3.45435 3 4.25ZM9 13.25C9 13.8467 9.23705 14.419 9.65901 14.841C10.081 15.2629 10.6533 15.5 11.25 15.5C11.8467 15.5 12.419 15.2629 12.841 14.841C13.2629 14.419 13.5 13.8467 13.5 13.25C13.5 12.6533 13.2629 12.081 12.841 11.659C12.419 11.2371 11.8467 11 11.25 11C10.6533 11 10.081 11.2371 9.65901 11.659C9.23705 12.081 9 12.6533 9 13.25Z',
          stroke: 'currentColor',
          'stroke-width': '1.5',
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round'
        })
      ]
    )
  }

  return h('div', { class: `flex items-center gap-1.5 ${colorClass}` }, [
    icon,
    h('span', { class: 'font-medium text-sm' }, label)
  ])
})

const hasAllDayAttendances = computed(
  () => props.attendance?.allDayAttendances && props.attendance.allDayAttendances.length > 0
)
</script>
