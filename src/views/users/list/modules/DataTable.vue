<script setup lang="ts" generic="TValue">
import type { FlattenedData } from '../ui/UsersLIst.vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { useI18n } from 'vue-i18n'
import { FlexRender, getCoreRowModel, useVueTable } from '@tanstack/vue-table'
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
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-vue-next'

const { t } = useI18n()

const props = defineProps<{
  columns: ColumnDef<FlattenedData, TValue>[]
  data?: FlattenedData[]
  loading: boolean
  sorting: {
    orderBy: string | null
    order: 'asc' | 'desc' | null
  }
  pagination: {
    currentPage: number
    totalCount: number
    totalPages: number
    pageSize: number
    canPrevPage: boolean
    canNextPage: boolean
  }
  rowSelection?: Record<string, boolean>
}>()

const emit = defineEmits<{
  (e: 'update:sorting', value: { orderBy: string | null; order: 'asc' | 'desc' | null }): void
  (e: 'update:pagination', value: { page?: number; size?: number }): void
  (e: 'update:rowSelection', value: Record<string, boolean>): void
  (e: 'row-click', row: FlattenedData): void
}>()

const table = useVueTable({
  get data() {
    return props.data ?? []
  },
  get columns() {
    return props.columns
  },
  getRowId: (row) => row.id,
  getCoreRowModel: getCoreRowModel(),
  state: {
    get rowSelection() {
      return props.rowSelection || {}
    },
    pagination: {
      pageIndex: props.pagination.currentPage - 1,
      pageSize: props.pagination.pageSize
    }
  },
  onRowSelectionChange: (updaterOrValue) => {
    const value =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(props.rowSelection || {})
        : updaterOrValue
    emit('update:rowSelection', value)
  },
  enableRowSelection: true,
  manualPagination: true,
  pageCount: props.pagination.totalPages,
  enableSorting: false
})

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
</script>

<template>
  <div class="relative border rounded-t-lg w-full overflow-auto lg:max-h-[calc(100vh-244px)]">
    <Table class="text-nowrap">
      <TableHeader class="sticky top-0 bg-white drop-shadow-sm z-20">
        <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
          <TableHead
            v-for="(header, index) in headerGroup.headers"
            :key="header.id"
            :style="{
              width: `${header.column.getSize()}px`,
              minWidth: `${header.column.columnDef.minSize}px`,
              maxWidth: `${header.column.columnDef.maxSize}px`
            }"
            :class="[
              'text-nowrap text-sm text-[#74757d] cursor-pointer bg-[#f2f5f4] select-none border border-t-0 p-3 pl-4 first:pl-3 relative',
              index === 0 ? 'border-l-0' : '',
              index === headerGroup.headers.length - 1 ? 'border-r-0' : ''
            ]"
          >
            <FlexRender
              v-if="!header.isPlaceholder"
              :render="header.column.columnDef.header"
              :props="header.getContext()"
              class="text-sm"
            />
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        <template v-if="loading">
          <TableRow>
            <TableCell :colspan="columns.length" class="h-24 text-center">
              {{ t('loading') }}...
            </TableCell>
          </TableRow>
        </template>

        <template v-else-if="table.getRowModel().rows.length">
          <TableRow
            v-for="(row, rowIndex) in table.getRowModel().rows"
            :key="row.id"
            :data-state="row.getIsSelected() ? 'selected' : undefined"
            class="hover:bg-gray-50 transition-colors cursor-pointer"
            @click="() => emit('row-click', row.original)"
          >
            <TableCell
              v-for="(cell, cellIndex) in row.getVisibleCells()"
              :key="cell.id"
              @click="cellIndex === 0 ? $event.stopPropagation() : undefined"
              :style="{
                width: `${cell.column.getSize()}px`,
                minWidth: `${cell.column.columnDef.minSize}px`,
                maxWidth: `${cell.column.columnDef.maxSize}px`
              }"
              :class="[
                'border p-2 font-medium pl-3 first:pl-3',
                cellIndex === 0 ? 'border-l-0' : '',
                cellIndex === row.getVisibleCells().length - 1 ? 'border-r-0' : '',
                rowIndex === 0 ? 'border-t-0' : '',
                rowIndex === table.getRowModel().rows.length - 1 ? 'border-b-0' : ''
              ]"
            >
              <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
            </TableCell>
          </TableRow>
        </template>

        <template v-else>
          <TableRow>
            <TableCell :colspan="columns.length" class="h-24 text-center">
              {{ t('no-data') }}
            </TableCell>
          </TableRow>
        </template>
      </TableBody>
    </Table>
  </div>

  <div
    class="flex items-center justify-between border border-t-0 rounded-b-lg px-4 py-3 text-sm text-gray-600"
  >
    <!-- Left side -->
    <div class="flex items-center space-x-2">
      <span class="text-[#596881]">{{ t('showing') }}</span>

      <Select
        name="pageSize"
        :model-value="`${props.pagination.pageSize}`"
        @update:model-value="(v) => handlePageSizeChange(+v)"
      >
        <SelectTrigger id="pageSize-select" class="h-8 w-[70px] border rounded-md text-sm">
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

      <span> {{ t('dan') }} {{ props.pagination.totalCount }} </span>
    </div>

    <!-- Right side (New Style) -->
    <div class="flex items-center gap-2">
      <!-- Prev Button -->
      <button
        class="w-8 h-8 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
        :disabled="!props.pagination.canPrevPage"
        @click="handlePageChange(props.pagination.currentPage - 1)"
      >
        <ArrowLeftIcon class="w-4 h-4" />
      </button>

      <!-- Numbers Container -->
      <div class="flex items-center gap-1 bg-[#f4f4f5] p-1 rounded-lg">
        <template v-for="page in getPageNumbers()" :key="page">
          <span v-if="page === '...'" class="px-2 text-gray-400 font-medium select-none text-sm">
            ...
          </span>

          <button
            v-else
            class="min-w-[28px] h-7 px-2 flex items-center justify-center text-sm font-medium rounded-lg transition-all cursor-pointer border-none"
            :class="[
              page === props.pagination.currentPage
                ? 'bg-white text-black shadow-sm font-semibold'
                : 'text-gray-600 hover:text-black font-semibold hover:bg-gray-200/50'
            ]"
            @click="handlePageChange(page as number)"
          >
            {{ page }}
          </button>
        </template>
      </div>

      <!-- Next Button -->
      <button
        class="w-8 h-8 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
        :disabled="!props.pagination.canNextPage"
        @click="handlePageChange(props.pagination.currentPage + 1)"
      >
        <ArrowRightIcon class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>
