<template>
  <div class="grid gap-4 lg:w-[380px] w-full">
    <!-- Left Card -->
    <div class="p-4 rounded-lg bg-white border w-full">
      <div class="flex justify-between items-center border-b pb-2 mb-4">
        <span class="text-gray-500 font-bol">{{ t('Total balance') }}</span>
        <span class="text-xl font-bold">
          {{ totalBalance.toLocaleString() }}
          <span class="text-[#8C94A3] text-lg ml-auto">uzs</span>
        </span>
      </div>

      <div class="grid grid-cols-[40%_60%] gap-9 items-center">
        <!-- Left: Donut Chart (ApexChart) -->
        <div class="relative flex justify-center">
          <!-- @ts-ignore -->
          <apexchart type="donut" width="180" :options="chartOptions" :series="chartSeries" />
          <div
            class="absolute top-1/2 left-1/2 text-center"
            style="transform: translate(-50%, -60%)"
          >
            <div class="font-bold text-sm">{{ usedPercentage.toFixed(1) }}%</div>
            <div class="text-xs text-gray-500">Limit using</div>
          </div>
        </div>

        <!-- Right: Available / Used -->
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <span class="w-2.5 mr-2 h-[45px] rounded-full bg-[#12B76A]"></span>
            <div>
              <div class="text-sm text-gray-500">{{ t('Available') }}</div>
              <div class="font-semibold">{{ availableBalance?.toLocaleString() }} so'm</div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-2.5 mr-2 h-[45px] rounded-full bg-[#E54967]"></span>
            <div>
              <div class="text-sm text-gray-500">{{ t('Used') }}</div>
              <div class="font-semibold">{{ usedBalance?.toLocaleString() }} so'm</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats with progress bars -->
    <div
      class="bg-white rounded-lg shadow-xs border border-[#E1E9F0] p-4 py-5 w-full relative overflow-hidden transition-all"
    >
      <div class="grid gap-4">
        <!-- Total sum -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <p class="text-base font-medium text-[#101828]">{{ t('Total sum') }}</p>
            <span class="text-base font-semibold text-[#101828]">
              <span ref="totalRef"></span> so’m
            </span>
          </div>
          <div class="h-6 bg-[#EFF3F8] rounded-md overflow-hidden">
            <div
              class="h-6 bg-[#F1613C] rounded-md relative border border-[#DB5837]"
              :style="{ width: totalPercentage + '%' }"
            >
              <div
                class="w-2 h-2 rounded-full bg-white opacity-70 absolute right-2 top-[6.5px]"
              ></div>
            </div>
          </div>
        </div>

        <!-- Salary -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <p class="text-base font-medium text-[#101828]">{{ t('Salary') }}</p>
            <span class="text-base font-semibold text-[#101828]">
              <span ref="salaryRef"></span> so’m
            </span>
          </div>
          <div class="h-6 bg-[#EFF3F8] rounded-md overflow-hidden">
            <div
              class="h-6 bg-[#24B161] rounded-md relative border border-[#29A679]"
              :style="{ width: salaryPercentage + '%' }"
            >
              <div
                class="w-2 h-2 rounded-full bg-white opacity-70 absolute right-2 top-[6.5px]"
              ></div>
            </div>
          </div>
        </div>

        <!-- Advance -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <p class="text-base font-medium text-[#101828]">{{ t('Advance') }}</p>
            <span class="text-base font-semibold text-[#101828]">
              <span ref="advanceRef"></span> so’m
            </span>
          </div>
          <div class="h-6 bg-[#EFF3F8] rounded-md overflow-hidden">
            <div
              class="h-6 bg-[#F5B040] rounded-md relative border border-[#EDA837]"
              :style="{ width: advancePercentage + '%' }"
            >
              <div
                class="w-2 h-2 rounded-full bg-white opacity-70 absolute right-2 top-[6.5px]"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
// @ts-nocheck
import { ref, computed, watch, toRefs } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import { CountUp } from 'countup.js'
import { fetchSalaryStats, fetchOrgBalance } from '../api'
import { SalaryStatsResponse } from '../type'
import { useI18n } from 'vue-i18n'
import type { ApexOptions } from 'apexcharts'

const { t } = useI18n()
const props = defineProps<{ fromDate: string; toDate: string }>()
const { fromDate, toDate } = toRefs(props)

const totalRef = ref<HTMLElement | null>(null)
const salaryRef = ref<HTMLElement | null>(null)
const advanceRef = ref<HTMLElement | null>(null)

const totalBalance = ref(0)
const usedBalance = ref(0)
const availableBalance = ref(0)

const total = ref(0)
const totalSalary = ref(0)
const totalAdvance = ref(0)

const totalPercentage = computed(() => 100)
const salaryPercentage = computed(() => (total.value ? (totalSalary.value / total.value) * 100 : 0))
const advancePercentage = computed(() =>
  total.value ? (totalAdvance.value / total.value) * 100 : 0
)

const usedPercentage = computed(() =>
  totalBalance.value === 0 ? 0 : (usedBalance.value / totalBalance.value) * 100
)

// ApexChart Series + Options
const chartSeries = computed(() => [usedBalance.value, totalBalance.value - usedBalance.value])

const chartOptions: ApexOptions = {
  labels: ['Used', 'Remaining'],
  colors: ['#E54967', '#12B76A'],
  legend: { show: false },
  dataLabels: { enabled: false },
  stroke: { width: 0 },
  plotOptions: {
    pie: {
      donut: {
        size: '70%'
      }
    }
  }
}

// API Loader
const loadSalaryStats = async (fromDate?: string, toDate?: string) => {
  try {
    // @ts-ignore
    const salaryRes: SalaryStatsResponse = await fetchSalaryStats({ fromDate, toDate })
    if (salaryRes.isSuccess && salaryRes.data) {
      totalSalary.value = salaryRes.data.totalSalary
      totalAdvance.value = salaryRes.data.totalAdvance
      total.value = totalSalary.value + totalAdvance.value

      new CountUp(totalRef.value!, total.value, { separator: ' ', duration: 4 }).start()
      new CountUp(salaryRef.value!, totalSalary.value, { separator: ' ', duration: 4 }).start()
      new CountUp(advanceRef.value!, totalAdvance.value, { separator: ' ', duration: 4 }).start()
    }

    const balanceRes = await fetchOrgBalance({
      fromDate: fromDate ? `${fromDate}T00:00:00` : null,
      toDate: toDate ? `${toDate}T23:59:59` : null
    })
    if (balanceRes.data.isSuccess && balanceRes.data.data) {
      totalBalance.value = balanceRes.data.data.totalBalance
      usedBalance.value = balanceRes.data.data.givenSalaryRequest
      availableBalance.value = balanceRes.data.data.balance
    }
  } catch (err) {
    console.error('Error loading dashboard stats:', err)
  }
}

watch(
  [fromDate, toDate],
  ([newFrom, newTo]) => {
    if (newFrom && newTo) {
      loadSalaryStats(newFrom, newTo)
    }
  },
  { immediate: true }
)
</script>

<script lang="ts">
export default {
  components: {
    apexchart: VueApexCharts
  }
}
</script>
