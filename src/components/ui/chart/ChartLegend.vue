<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { VisBulletLegend } from '@unovis/vue'
import type { BulletLegendItemInterface } from '@unovis/ts'
import { BulletLegend } from '@unovis/ts'
import { nextTick, onMounted, ref } from 'vue'
import { buttonVariants } from '@/components/ui/button'

const { t } = useI18n()

const props = withDefaults(defineProps<{ items: BulletLegendItemInterface[] }>(), {
  items: () => []
})

const emits = defineEmits<{
  legendItemClick: [d: BulletLegendItemInterface, i: number]
  'update:items': [payload: BulletLegendItemInterface[]]
}>()

const elRef = ref<HTMLElement>()

onMounted(() => {
  const selector = `.${BulletLegend.selectors.item}`
  nextTick(() => {
    const elements = elRef.value?.querySelectorAll(selector)
    const classes = buttonVariants({ variant: 'ghost', size: 'xs' }).split(' ')

    elements?.forEach((el) => {
      el.classList.add(...classes, '!inline-flex', '!mr-2')
      const spans = el.querySelectorAll('span')
      if (spans.length >= 2) {
        const secondSpan = spans[1]
        secondSpan.textContent = secondSpan.textContent
          ? t(secondSpan.textContent)
          : secondSpan.textContent
      }
    })
  })
})

function onLegendItemClick(d: BulletLegendItemInterface, i: number) {
  emits('legendItemClick', d, i)
  const isBulletActive = !props.items[i].inactive
  const isFilterApplied = props.items.some((i) => i.inactive)
  if (isFilterApplied && isBulletActive) {
    // reset filter
    emits(
      'update:items',
      props.items.map((item) => ({ ...item, inactive: false }))
    )
  } else {
    // apply selection, set other item as inactive
    emits(
      'update:items',
      props.items.map((item) =>
        item.name === d.name ? { ...d, inactive: false } : { ...item, inactive: true }
      )
    )
  }
}
</script>

<template>
  <div ref="elRef" class="w-max">
    <VisBulletLegend :items="items" :on-legend-item-click="onLegendItemClick" />
  </div>
</template>
