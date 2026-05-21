<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatDate } from '@vueuse/core'
import { useGetPaymentRequestPerMonth } from '../query/useGetPaymentRequestPerMonth'
import { BarChart } from '@/components/ui/chart-bar'
import CustomToolTip from './CustomToolTip.vue'

const { t } = useI18n()
const { data } = useGetPaymentRequestPerMonth()

const formattedData = computed(() => {
  return data.value
    ? data.value.data.data.months.map((el) => {
        return {
          date: `${t(formatDate(new Date(el.month), 'MMMM').toLowerCase())} ${formatDate(
            new Date(el.month),
            'YYYY'
          )}`,
          'paid-requests-total-amount': el.totalPaidRequestsAmount
        }
      })
    : []
})
</script>

<template>
  <BarChart
    v-if="formattedData"
    :data="formattedData"
    :categories="['paid-requests-total-amount']"
    :index="'date'"
    :rounded-corners="4"
    :custom-tooltip="CustomToolTip"
  />
</template>
