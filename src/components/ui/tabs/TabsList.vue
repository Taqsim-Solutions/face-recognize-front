<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue'
import { TabsList, type TabsListProps } from 'radix-vue'
import { cn } from '@/lib/utils'

const props = defineProps<TabsListProps & { class?: HTMLAttributes['class'] }>()
const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props
  return delegated
})
</script>

<template>
  <TabsList
    v-bind="delegatedProps"
    :class="
      cn(
        'flex flex-wrap border-b border-border bg-transparent text-muted-foreground gap-9 py-2',
        props.class
      )
    "
  >
    <slot />
  </TabsList>
</template>
