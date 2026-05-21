<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { cn } from '@/lib/utils'
import { CalendarHeading, type CalendarHeadingProps, useForwardProps } from 'radix-vue'
import { computed, type HTMLAttributes } from 'vue'

const { t } = useI18n()
const props = defineProps<CalendarHeadingProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <CalendarHeading
    v-slot="{ headingValue }"
    :class="cn('text-sm font-medium', props.class)"
    v-bind="forwardedProps"
  >
    <slot :heading-value>
      {{ `${t(headingValue.split(' ')[0].toLowerCase())} ${headingValue.split(' ')[1]}` }}
    </slot>
  </CalendarHeading>
</template>
