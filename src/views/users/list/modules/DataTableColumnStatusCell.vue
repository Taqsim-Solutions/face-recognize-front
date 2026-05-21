<script setup lang="ts">
import { useI18n } from 'vue-i18n'

type DataTableColumnStatusCellProps = {
  status?: string
}
defineProps<DataTableColumnStatusCellProps>()

const { t } = useI18n()
</script>

<script lang="ts">
export default {
  inheritAttrs: false
}
</script>

<template>
  <p v-if="!status">
    <span class="italic text-muted-foreground">{{ t('no-data') }}</span>
  </p>
  <p v-if="status === 'active'">
    <span class="font-medium text-green-600">{{ t('active') }}</span>
  </p>
  <p v-else-if="status === 'blocked'">
    <span class="font-medium text-red-600">{{ t('blocked') }}</span>
  </p>
  <p v-else-if="status === 'leftTheCompany'">
    <span class="font-medium text-gray-600">{{ t('left-the-company') }}</span>
  </p>
  <p v-else>{{ status }}</p>
</template>
