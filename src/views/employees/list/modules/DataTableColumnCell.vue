<script setup lang="ts">
import { useI18n } from 'vue-i18n'

type DataTableColumnCellProps = {
  value?: string
  fallbackText: 'no-data' | 'not-identified'
}
defineProps<DataTableColumnCellProps>()

const { t } = useI18n()
</script>

<script lang="ts">
export default {
  inheritAttrs: false
}
</script>

<template>
  <p v-if="value">{{ value }}</p>
  <p v-else class="italic text-muted-foreground">{{ t(fallbackText) }}</p>
</template>
