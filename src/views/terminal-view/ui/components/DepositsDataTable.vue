<script setup lang="ts" generic="TData, TValue">
import type { ColumnDef } from '@tanstack/vue-table'
import { FlexRender, getCoreRowModel, useVueTable } from '@tanstack/vue-table'
import { useI18n } from 'vue-i18n'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ChevronRightIcon, ChevronLeftIcon } from '@radix-icons/vue'
import { onMounted, onBeforeUnmount } from 'vue'
import { useDeleteDeposit } from '../../query/useDeleteDeposit'
import { toast } from 'vue-sonner'

const props = defineProps<{
  columns: ColumnDef<TData, TValue>[]
  data?: TData[]
  loading?: boolean
  eposTerminalId?: number
  pagination: {
    currentPage: number
    totalCount: number
    totalPages: number
    pageSize: number
    canPrevPage: boolean
    canNextPage: boolean
  }
}>()

const emit = defineEmits<{
  (e: 'update:pagination', value: { page?: number; size?: number }): void
}>()


const { t } = useI18n()

// Pagination handlers
const handlePageChange = (newPage: number) => {
  if (newPage < 1 || newPage > props.pagination.totalPages) return
  emit('update:pagination', { page: newPage })
}

const handlePageSizeChange = (newSize: number) => {
  emit('update:pagination', { size: newSize })
}

const getPageNumbers = () => {
  const total = props.pagination.totalPages
  const current = props.pagination.currentPage
  const range: (number | string)[] = []

  if (total <= 7) {
    for (let i = 1; i <= total; i++) range.push(i)
  } else {
    if (current <= 4) {
      range.push(1, 2, 3, 4, 5, '...', total)
    } else if (current >= total - 3) {
      range.push(1, '...', total - 4, total - 3, total - 2, total - 1, total)
    } else {
      range.push(1, '...', current - 1, current, current + 1, '...', total)
    }
  }
  return range
}

// Table
const table = useVueTable({
  get data() {
    return props.data ?? []
  },
  get columns() {
    return props.columns
  },
  getCoreRowModel: getCoreRowModel()
})

// Delete mutation
const deleteDepositMutation = useDeleteDeposit()

onMounted(() => {
  // Download receipt handler
  const downloadHandler = (event: Event) => {
    const { deposit, fileId } = (event as CustomEvent).detail
    const token = localStorage.getItem('token')
    const baseUrl = import.meta.env.VITE_API_URL || ''
    const cleanBaseUrl = baseUrl.replace(/\/api\/?$/, '')

    const url = `${cleanBaseUrl}/api/epos-terminals/${deposit.eposTerminalId}/deposits/${deposit.id}/receipt-files/${fileId}?token=${token}`
    
    window.open(url, '_blank')
  }

  // Delete deposit handler
  const deleteHandler = async (event: Event) => {
    const { depositId, eposTerminalId } = (event as CustomEvent).detail

    if (!confirm(t('confirm-delete-deposit'))) return

    try {
      await deleteDepositMutation.mutateAsync({ eposTerminalId, depositId })
      toast.success(t('deposit-deleted'))
    } catch (error: any) {
      const message = error.response?.data?.error?.message || t('error-occurred')
      toast.error(message)
    }
  }

  window.addEventListener('download-deposit-receipt', downloadHandler)
  window.addEventListener('delete-deposit', deleteHandler)

  onBeforeUnmount(() => {
    window.removeEventListener('download-deposit-receipt', downloadHandler)
    window.removeEventListener('delete-deposit', deleteHandler)
  })
})
</script>

<template>
  <div class="relative border rounded-b-lg w-full overflow-auto">
    <Table class="w-full text-nowrap">
      <!-- Header -->
      <TableHeader class="sticky top-0 bg-white drop-shadow-sm">
        <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
          <TableHead
            v-for="(header, index) in headerGroup.headers"
            :key="header.id"
            :class="[
              'text-nowrap border border-t-0 p-5 pl-4 relative text-base',
              index === 0 ? 'border-l-0' : '',
              index === headerGroup.headers.length - 1 ? 'border-r-0' : ''
            ]"
          >
            <FlexRender
              v-if="!header.isPlaceholder"
              :render="header.column.columnDef.header"
              :props="header.getContext()"
            />
          </TableHead>
        </TableRow>
      </TableHeader>

      <!-- Body -->
      <TableBody>
        <!-- Loading -->
        <TableRow v-if="loading">
          <TableCell :colspan="columns.length" class="text-center py-4">
            {{ t('loading') }}...
          </TableCell>
        </TableRow>

        <!-- No data -->
        <TableRow v-else-if="!table.getRowModel().rows.length">
          <TableCell :colspan="columns.length" class="h-24 text-center">
            {{ t('no-data') }}
          </TableCell>
        </TableRow>

        <!-- Rows -->
        <TableRow v-else v-for="row in table.getRowModel().rows" :key="row.id">
          <TableCell
            v-for="(cell, cellIndex) in row.getVisibleCells()"
            :key="cell.id"
            :class="[
              'border p-5 font-medium pl-5',
              cellIndex === 0 ? 'border-l-0' : '',
              cellIndex === row.getVisibleCells().length - 1 ? 'border-r-0' : ''
            ]"
          >
            <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>

  <!-- Pagination Controls -->
  <div
    class="flex items-center justify-between border border-t-0 rounded-b-lg px-4 py-3 text-sm text-gray-600"
  >
    <!-- Left side -->
    <div class="flex items-center space-x-2">
      <span class="text-[#596881]">{{ t('showing') }}</span>

      <Select
        :model-value="`${props.pagination.pageSize}`"
        @update:model-value="(v) => handlePageSizeChange(+v)"
        name="page-size"
        id="page-size"
      >
        <SelectTrigger class="h-8 w-[70px] border rounded-md text-sm">
          <SelectValue :placeholder="`${props.pagination.pageSize}`" />
        </SelectTrigger>
        <SelectContent side="top">
          <SelectItem
            v-for="pageSize in ['10', '15', '20', '25', '30']"
            :key="pageSize"
            :value="pageSize"
          >
            {{ pageSize }}
          </SelectItem>
        </SelectContent>
      </Select>

      <span>{{ t('dan') }} {{ props.pagination.totalCount }}</span>
    </div>

    <!-- Right side -->
    <div class="flex items-center gap-1">
      <Button
        variant="outline"
        class="w-7 h-7 p-0 mr-1"
        :disabled="!props.pagination.canPrevPage"
        @click="handlePageChange(props.pagination.currentPage - 1)"
      >
        <ChevronLeftIcon class="w-4 h-4" />
      </Button>

      <div class="flex items-center gap-1">
        <template v-for="page in getPageNumbers()" :key="page">
          <span v-if="page === '...'" class="px-2 text-gray-400 select-none">...</span>

          <Button
            v-else
            variant="outline"
            class="w-7 h-7 p-0 text-sm font-medium border-none"
            :class="[
              page === props.pagination.currentPage
                ? 'bg-blue-100 text-blue-600 hover:text-blue-600 hover:bg-blue-150'
                : 'hover:bg-gray-50'
            ]"
            @click="handlePageChange(page as number)"
          >
            {{ page }}
          </Button>
        </template>
      </div>

      <Button
        variant="outline"
        class="w-7 h-7 p-0 ml-1"
        :disabled="!props.pagination.canNextPage"
        @click="handlePageChange(props.pagination.currentPage + 1)"
      >
        <ChevronRightIcon class="w-4 h-4" />
      </Button>
    </div>
  </div>
</template>
