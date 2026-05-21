<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue'
import { TabsTrigger, type TabsTriggerProps, useForwardProps } from 'radix-vue'
import { cn } from '@/lib/utils'

const props = defineProps<TabsTriggerProps & { class?: HTMLAttributes['class'] }>()
const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props
  return delegated
})
const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <TabsTrigger
    v-bind="forwardedProps"
    :class="
      cn(
        'relative pb-1.5 text-sm font-medium transition-colors duration-150',
        'data-[state=active]:text-[#12B76A]',
        'after:absolute after:left-0 after:-bottom-[9px] after:h-[2.5px] font-semibold after:w-full after:scale-x-0 after:bg-[#12B76A] after:transition-transform after:duration-200',
        'data-[state=active]:after:scale-x-100',
        props.class
      )
    "
  >
    <slot />
  </TabsTrigger>
</template>
