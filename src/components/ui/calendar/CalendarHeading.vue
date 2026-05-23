<script lang="ts" setup>
import { type HTMLAttributes, computed } from 'vue'
import { CalendarHeading, type CalendarHeadingProps, useForwardProps } from 'radix-vue'
import { cn } from '@/lib/utils'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const props = defineProps<CalendarHeadingProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})

const forwardedProps = useForwardProps(delegatedProps)

const formatHeading = (heading: string) => {
  let year = ''
  let monthIndex = -1 // 0-11

  // Try to match "YYYY MXX" or "YYYY-MM" or "YYYY Mxx" or "Mxx YYYY"
  const m09Match = heading.match(/(\d{4})\s*[M-]?\s*(\d{2})/)
  const m09MatchRev = heading.match(/(\d{2})\s*[M-]?\s*(\d{4})/)

  if (m09Match) {
    year = m09Match[1]
    monthIndex = parseInt(m09Match[2], 10) - 1
  } else if (m09MatchRev) {
    year = m09MatchRev[2]
    monthIndex = parseInt(m09MatchRev[1], 10) - 1
  } else {
    const yearMatch = heading.match(/\d{4}/)
    if (yearMatch) {
      year = yearMatch[0]
      const monthsEn = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
      const monthsRu = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь']
      const monthsUz = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr']
      const monthsUzc = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь']

      const lowerHeading = heading.toLowerCase()
      const lists = [monthsEn, monthsRu, monthsUz, monthsUzc]
      for (const list of lists) {
        const idx = list.findIndex(m => lowerHeading.includes(m))
        if (idx !== -1) {
          monthIndex = idx
          break
        }
      }
    }
  }

  if (monthIndex >= 0 && monthIndex < 12 && year) {
    const currentLang = locale.value
    let monthName = ''
    if (currentLang === 'ru') {
      const ruMonths = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
      monthName = ruMonths[monthIndex]
    } else if (currentLang === 'uzc') {
      const uzcMonths = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
      monthName = uzcMonths[monthIndex]
    } else {
      const uzMonths = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr']
      monthName = uzMonths[monthIndex]
    }
    return `${monthName} ${year}`
  }

  return heading
}
</script>

<template>
  <CalendarHeading
    v-slot="{ headingValue }"
    :class="cn('text-sm font-medium', props.class)"
    v-bind="forwardedProps"
  >
    <slot :heading-value>
      {{ formatHeading(headingValue) }}
    </slot>
  </CalendarHeading>
</template>
