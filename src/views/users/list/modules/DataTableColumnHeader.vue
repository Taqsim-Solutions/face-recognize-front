<script setup lang="ts">
import type { Column } from '@tanstack/vue-table'
import type { FlattenedData } from '../ui/UsersLIst.vue'

import { useI18n } from 'vue-i18n'

const { t } = useI18n()

type DataTableColumnHeaderProps = {
  column: Column<FlattenedData, any>
  title: string
  notSortable?: boolean
}
defineProps<DataTableColumnHeaderProps>()
</script>

<script lang="ts">
export default {
  inheritAttrs: false
}
</script>

<template>
  <span>{{ t(title) }}</span>
</template>
