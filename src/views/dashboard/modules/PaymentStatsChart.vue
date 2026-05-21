<template>
  <div class="rounded-xl border p-5 lg:block md:block hidden lg:w-[calc(100vw-708px)] w-full">
    <h2 class="font-bold text-lg mb-6">{{ t('payments_statistics') }}</h2>
    <div>
      <Line :data="chartData" :options="chartOptions" class="h-[400px] w-full" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, toRefs, onMounted, onUnmounted } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler,
  ChartOptions,
  TooltipModel
} from 'chart.js'
import { fetchPaymentSalariesStats } from '../api'
import type { SalariesPerMonth } from '../type'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler
)

const props = defineProps<{
  fromDate: string
  toDate: string
}>()

const { fromDate, toDate } = toRefs(props)

const buildLabels = () => [
  t('Jan'),
  t('Feb'),
  t('March'),
  t('April'),
  t('May'),
  t('June'),
  t('July'),
  t('August'),
  t('Sept'),
  t('Oct'),
  t('Nov'),
  t('Dec')
]

const buildDatasets = (currentData: number[], previousData: number[]) => [
  {
    label: t('Amount for the current year'),
    data: currentData,
    borderColor: '#12B76A',
    borderWidth: 2,
    fill: true,
    tension: 0.4,
    pointRadius: 2,
    pointBackgroundColor: '#12B76A',
    backgroundColor: (context: any) => {
      const { ctx, chartArea } = context.chart
      if (!chartArea) return null
      const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
      gradient.addColorStop(0, 'rgba(18,183,106,0.25)')
      gradient.addColorStop(1, 'rgba(18,183,106,0.02)')
      return gradient
    }
  },
  {
    label: t('Amount for last year'),
    data: previousData,
    borderColor: '#F04438',
    borderWidth: 2,
    fill: true,
    tension: 0.4,
    pointRadius: 2,
    pointBackgroundColor: '#F04438',
    backgroundColor: (context: any) => {
      const { ctx, chartArea } = context.chart
      if (!chartArea) return null
      const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
      gradient.addColorStop(0, 'rgba(240,68,56,0.25)')
      gradient.addColorStop(1, 'rgba(240,68,56,0.02)')
      return gradient
    }
  }
]

const chartData = ref({
  labels: buildLabels(),
  datasets: buildDatasets(Array(12).fill(0), Array(12).fill(0))
})

const chartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false
  },
  plugins: {
    legend: {
      position: 'top',
      labels: {
        font: { size: 12 }
      }
    },
    tooltip: {
      enabled: false, // disable built-in tooltip
      external: (context) => {
        // ✅ TypeScript-safe tooltip logic
        const tooltipModel = (context as any).tooltip as TooltipModel<'line'>
        let tooltipEl = document.getElementById('chartjs-tooltip')

        // Create tooltip div if not exists
        if (!tooltipEl) {
          tooltipEl = document.createElement('div')
          tooltipEl.id = 'chartjs-tooltip'
          tooltipEl.style.background = '#fff'
          tooltipEl.style.border = '1px solid #E5E7EB'
          tooltipEl.style.borderRadius = '12px'
          tooltipEl.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'
          tooltipEl.style.pointerEvents = 'none'
          tooltipEl.style.position = 'absolute'
          tooltipEl.style.transform = 'translate(-50%, -100%)'
          tooltipEl.style.transition = 'all .15s ease'
          tooltipEl.style.padding = '10px 14px'
          tooltipEl.style.fontFamily = 'Inter, sans-serif'
          tooltipEl.style.fontSize = '13px'
          document.body.appendChild(tooltipEl)
        }

        // Hide tooltip if not visible
        if (tooltipModel.opacity === 0) {
          tooltipEl.style.opacity = '0'
          return
        }

        const title = tooltipModel.title?.[0] ?? ''
        const bodyLines = tooltipModel.body?.map((b) => b.lines) ?? []
        const colors = tooltipModel.labelColors ?? []

        // Build inner HTML
        let innerHtml = `
          <div style="font-weight:600;margin-bottom:6px;font-size:13px;color:#111827;">
            ${title} 2025
          </div>
        `
        bodyLines.forEach((body, i) => {
          const color = colors[i]?.borderColor || '#000'
          const [label, valueRaw] = body[0].split(': ')
          const numeric = Number(valueRaw?.replace(/\D/g, '') || 0)
          innerHtml += `
            <div style="display:flex;align-items:center;gap:6px;margin-top:3px;">
              <span style="width:8px;height:8px;border-radius:50%;background:${color};"></span>
              <span style="color:#374151;">${label}:</span>
              <span style="font-weight:600;color:#111827;">${numeric.toLocaleString(
                'uz-UZ'
              )} so’m</span>
            </div>
          `
        })

        tooltipEl.innerHTML = innerHtml

        // Positioning
        const { left, top } = (context as any).chart.canvas.getBoundingClientRect()
        tooltipEl.style.opacity = '1'
        tooltipEl.style.left = left + window.pageXOffset + tooltipModel.caretX + 'px'
        tooltipEl.style.top = top + window.pageYOffset + tooltipModel.caretY - 20 + 'px'
      }
    }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 12 } }
    },
    y: {
      beginAtZero: true,
      ticks: {
        callback: (v: any) => (v >= 1000000 ? `${v / 1000000}${t('mln')}` : v),
        font: { size: 12 }
      },
      grid: {
        color: '#E5E7EB'
      }
    }
  }
}

const loadChart = async (fromDate?: string, toDate?: string) => {
  try {
    // @ts-ignore
    const res: SalariesPerMonth = await fetchPaymentSalariesStats({ fromDate, toDate })
    if (!res.isSuccess) return

    const currentYear = new Date().getFullYear()
    const currentYearData = Array(12).fill(0)
    const previousYearData = Array(12).fill(0)

    for (const item of res.data.months) {
      const date = new Date(item.month)
      const year = date.getFullYear()
      const monthIndex = date.getMonth()
      if (year === currentYear) {
        currentYearData[monthIndex] = item.currentYearAmount
        previousYearData[monthIndex] = item.previousYearAmount
      }
    }

    chartData.value = {
      labels: buildLabels(),
      datasets: buildDatasets(currentYearData, previousYearData)
    }
  } catch (err) {
    console.error('Failed to fetch salary stats:', err)
  }
}

const refreshChart = () => {
  const c = chartData.value.datasets[0].data
  const p = chartData.value.datasets[1].data
  chartData.value = {
    labels: buildLabels(),
    datasets: buildDatasets(c as number[], p as number[])
  }
}

watch(
  [fromDate, toDate],
  ([newFrom, newTo]) => {
    if (newFrom && newTo) loadChart(newFrom, newTo)
  },
  { immediate: true }
)
watch(locale, () => refreshChart())

onMounted(() => window.addEventListener('resize', refreshChart))
onUnmounted(() => window.removeEventListener('resize', refreshChart))
</script>
