<script setup lang="ts">
import type { CreateManualPayment } from '../types'

import { ref, h } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { utils, writeFile } from 'xlsx'
import {
  FlexRender,
  createColumnHelper,
  getCoreRowModel,
  getExpandedRowModel,
  useVueTable,
  ExpandedState,
  type Row
} from '@tanstack/vue-table'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-vue-next'

import PaymentRow from './PaymentRow.vue'

const { t } = useI18n()
const router = useRouter()
const props = defineProps<{
  payments: CreateManualPayment[]
}>()

const renderExpanded = (row: Row<CreateManualPayment>) => {
  if (!row.getCanExpand()) {
    return h(Button, { disabled: true })
  }
  return h(
    Button,
    {
      size: 'icon',
      variant: 'link',
      onClick: row.getToggleExpandedHandler()
    },
    {
      default: () => (row.getIsExpanded() ? [h(ChevronUpIcon)] : [h(ChevronDownIcon)])
    }
  )
}

const data = ref(props.payments)
const columnHelper = createColumnHelper<CreateManualPayment>()
const columns = [
  columnHelper.accessor((row) => row.account, {
    id: 'account',
    cell: (account) => account.getValue()
  }),
  columnHelper.accessor((row) => row.fullName, {
    id: 'fullName',
    cell: (name) => name.getValue()
  }),
  columnHelper.accessor((row) => row.amount, {
    id: 'amount',
    cell: (amount) => amount.getValue()
  }),
  columnHelper.accessor((row) => row.cardHolder, {
    id: 'cardHolder',
    cell: (cardHolder) => cardHolder.getValue()
  }),
  columnHelper.accessor((row) => row.cardNumber, {
    id: 'cardNumber',
    cell: (card) => card.getValue()
  }),
  columnHelper.accessor((row) => row.mfo, {
    id: 'mfo',
    cell: (mfo) => mfo.getValue()
  }),
  columnHelper.display({
    id: 'expander',
    header: 'status',
    cell: ({ row }) => renderExpanded(row)
  })
]

const expanded = ref<ExpandedState>({})
const table = useVueTable({
  get data() {
    return data.value
  },
  state: {
    get expanded() {
      return expanded.value
    }
  },
  columns,
  getRowCanExpand: () => true,
  getCoreRowModel: getCoreRowModel(),
  getExpandedRowModel: getExpandedRowModel(),
  onExpandedChange: (updaterOrValue) => {
    expanded.value =
      typeof updaterOrValue === 'function' ? updaterOrValue(expanded.value) : updaterOrValue
  }
})

const loading = ref(false)
const processedRows = ref(0)
const successfulRows = ref(0)
const rowsWithErrors = ref<any>([])
const handleErrorRow = (err: any) => {
  rowsWithErrors.value.push(err)
}
const downloadErroredRows = async () => {
  loading.value = true

  const worksheet = utils.json_to_sheet(rowsWithErrors.value)
  const workbook = utils.book_new()
  utils.book_append_sheet(workbook, worksheet, 'Payments')
  writeFile(workbook, `${t('payments')}.xlsx`, { compression: true })

  loading.value = false
}
</script>

<template>
  <div v-if="payments.length" class="mt-6 border rounded-lg w-full overflow-auto text-nowrap">
    <Table class="w-full">
      <TableHeader>
        <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
          <TableHead v-for="header in headerGroup.headers" :key="header.id">
            <FlexRender
              v-if="!header.isPlaceholder"
              :render="header.column.columnDef.header"
              :props="header.getContext()"
            />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <template v-for="row in table.getRowModel().rows" :key="row.id">
          <PaymentRow
            :row="row"
            @on-error="handleErrorRow"
            @on-success="successfulRows++"
            @on-settled="processedRows++"
          />
        </template>
      </TableBody>
    </Table>
  </div>

  <div class="flex justify-end mt-4">
    <Button
      v-if="processedRows === data.length && data.length > successfulRows"
      variant="outline"
      :loading="loading"
      @click="downloadErroredRows"
    >
      {{ t('download-errored-rows') }}
    </Button>
    <Button
      v-else-if="processedRows === data.length && data.length === successfulRows"
      @click="router.push({ name: 'manual-payments-list' })"
    >
      {{ t('mass-transfers') }}
    </Button>
  </div>
</template>
