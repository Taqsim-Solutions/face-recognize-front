<script setup lang="ts">
import AttendanceStats from '../modules/AttendanceStats.vue'
import TotalSum from '../modules/TotalSum.vue'
import PaymentStatsChart from '../modules/PaymentStatsChart.vue'
import { useI18n } from 'vue-i18n'
import { onMounted, ref } from 'vue'
import dayjs from 'dayjs'
import { DatePicker } from '@/views/attendances/list/modules'
import { type DateValue, getLocalTimeZone } from '@internationalized/date'
import Can from '@/components/can.vue'

const { t } = useI18n()

const formatDate = (date: Date) => dayjs(date).format('YYYY-MM-DD')

const today = new Date()
const twelveMonthsAgo = new Date()
twelveMonthsAgo.setMonth(today.getMonth() - 12)

const fromDate = ref<string>('')
const toDate = ref<string>('')

onMounted(() => {
  const today = new Date()
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(today.getMonth() - 6)

  fromDate.value = formatDate(sixMonthsAgo)
  toDate.value = formatDate(today)
})

const handleDateFilter = (date: DateValue | undefined, type: 'from' | 'to') => {
  if (!date) return

  const jsDate = date.toDate(getLocalTimeZone())
  const formatted = formatDate(jsDate)

  if (type === 'from') {
    fromDate.value = formatted
  } else if (type === 'to') {
    toDate.value = formatted
  }
}
</script>

<template>
  <div class="grid gap-2">
    <header
      class="flex flex-col md:flex-row justify-between items-center md:items-center gap-3 border-b lg:pb-3 pb-5 px-5"
    >
      <div class="flex flex-col mt-1">
        <h2 class="scroll-m-20 lg:text-xl text-2xl font-semibold tracking-tight transition-colors">
          {{ t('dashboard') }}
        </h2>
      </div>

      <div class="flex gap-4">
        <div class="flex gap-2 items-center">
          <label for="fromCreatedAt" class="font-medium text-sm">{{ t('from') }}:</label>
          <DatePicker @confirm:date="(e) => handleDateFilter(e, 'from')" />
        </div>
        <div class="flex gap-2 items-center">
          <label for="toCreatedAt" class="font-medium text-sm">{{ t('to') }}:</label>
          <DatePicker @confirm:date="(e) => handleDateFilter(e, 'to')" />
        </div>
      </div>
    </header>

    <div class="px-5 mt-2">
      <Can i="stats.payment.requests">
        <div class="flex flex-row gap-4 mb-4">
          <TotalSum :fromDate="fromDate" :toDate="toDate" />
          <PaymentStatsChart :fromDate="fromDate" :toDate="toDate" />
        </div>
      </Can>
      <Can i="stats.employees">
        <AttendanceStats />
      </Can>
    </div>
  </div>
</template>
