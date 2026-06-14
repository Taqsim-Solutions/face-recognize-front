<script setup lang="ts">
import { computed } from 'vue'
import { STATUS_LABEL, STATUS_BADGE_CLASS } from '@/constants/entityStatus'

const props = defineProps<{
  status: number | null | undefined
}>()

// Default to Active (1) when not provided.
const code = computed(() => props.status ?? 1)
const label = computed(() => STATUS_LABEL[code.value] ?? STATUS_LABEL[1])
const cls = computed(() => STATUS_BADGE_CLASS[code.value] ?? STATUS_BADGE_CLASS[1])
</script>

<template>
  <span
    class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap"
    :class="cls"
  >
    {{ label }}
  </span>
</template>
