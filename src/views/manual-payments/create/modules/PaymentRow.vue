<script setup lang="ts">
import type { CreateManualPayment } from '../types'

import { FlexRender, type Row } from '@tanstack/vue-table'
import { useI18n } from 'vue-i18n'

import { XIcon, CheckIcon, Loader2Icon } from 'lucide-vue-next'
import { TableRow, TableCell } from '@/components/ui/table'

import { usePostPaymentsList } from '../query/usePostPaymentsList'
const { mutate, status, error } = usePostPaymentsList()

const { t } = useI18n()

const emit = defineEmits(['on-error', 'on-success', 'on-settled'])
const props = defineProps<{
  row: Row<CreateManualPayment>
}>()

mutate(props.row.original, {
  onSuccess: () => {
    emit('on-success')
  },
  onError(variables) {
    emit('on-error', variables)
  },
  onSettled: () => {
    emit('on-settled')
  }
})
</script>

<template>
  <TableRow>
    <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
      <div class="flex items-center">
        <XIcon
          v-if="cell.id.includes('expander') && status === 'error'"
          :size="18"
          class="text-destructive"
        />
        <CheckIcon
          v-if="cell.id.includes('expander') && status === 'success'"
          :size="18"
          class="text-green-600"
        />
        <Loader2Icon
          v-if="cell.id.includes('expander') && status === 'pending'"
          :size="18"
          class="animate-spin"
        />
        <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
      </div>
    </TableCell>
  </TableRow>
  <TableRow v-if="row.getIsExpanded()">
    <TableCell :colSpan="row.getAllCells().length">
      <div class="flex items-center gap-x-4 px-5 py-2">
        <template v-if="status === 'success'">
          <CheckIcon class="text-green-600" />
          Everything is good in this one.
        </template>
        <template v-else-if="status === 'error'">
          <ul>
            <li>{{ error }}</li>
          </ul>
        </template>
        <template v-else>
          <Loader2Icon class="animate-spin" />
          {{ `${t('loading')}...` }}
        </template>
      </div>
    </TableCell>
  </TableRow>
</template>
