<script setup lang="ts">
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
import { ChevronRightIcon, ChevronLeftIcon } from 'lucide-vue-next'
import { useVueTable, type ColumnDef, getCoreRowModel } from '@tanstack/vue-table'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  data?: any[]
  columns: ColumnDef<any>[]
  loading?: boolean
  pagination?: {
    currentPage: number
    totalCount: number
    totalPages: number
    pageSize: number
  }
}>()

const emit = defineEmits(['update:pagination'])

const { t } = useI18n()

const table = useVueTable({
  get data() {
    return props.data || []
  },
  get columns() {
    return props.columns
  },
  getCoreRowModel: getCoreRowModel()
})

const tableRows = computed(() => table.getRowModel().rows)

const handlePageChange = (newPage: number) => {
  if (!props.pagination) return
  if (newPage < 1 || newPage > props.pagination.totalPages) return
  emit('update:pagination', { page: newPage, size: props.pagination.pageSize })
}

const handlePageSizeChange = (newSize: number) => {
  if (!props.pagination) return
  emit('update:pagination', { page: 1, size: newSize })
}

const getPageNumbers = () => {
  if (!props.pagination) return []
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
  <div class="rounded-xl border border-[#E4E7EC] bg-white shadow-sm overflow-hidden">
    <div class="overflow-x-auto no-scrollbar">
      <Table>
        <TableHeader class="border-b border-[#E4E7EC]">
          <TableRow class="hover:bg-transparent">
            <TableHead
              v-for="header in table.getFlatHeaders()"
              :key="header.id"
              class="text-sm tracking-wide text-[#475467] bg-[#F7F9FB] p-4 border-r border-[#E4E7EC] last:border-r-0 whitespace-nowrap"
            >
              {{ header.column.columnDef.header }}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="loading" class="hover:bg-transparent">
            <TableCell :colspan="columns.length" class="h-24 text-center text-[#475467]">
              Loading...
            </TableCell>
          </TableRow>
          <TableRow v-else-if="!data?.length" class="hover:bg-transparent">
            <TableCell :colspan="columns.length" class="h-24 text-center text-[#475467]">
              No results.
            </TableCell>
          </TableRow>
          <template v-else>
            <TableRow
              v-for="row in tableRows"
              :key="row.id"
              class="border-b border-[#E4E7EC] hover:bg-[#F9FAFB]"
            >
              <TableCell
                v-for="cell in row.getVisibleCells()"
                :key="cell.id"
                class="p-4 align-middle text-sm text-[#1D1F2C] border-r border-[#E4E7EC] last:border-r-0 whitespace-nowrap"
              >
                <component
                  :is="cell.column.columnDef.cell"
                  :cell="cell"
                  :row="row"
                  :column="cell.column"
                  :table="table"
                  :getValue="cell.getValue"
                  :renderValue="cell.renderValue"
                />
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>

    <div v-if="pagination" class="flex items-center justify-between border-t px-4 py-3 bg-white">
      <div class="flex items-center space-x-2 text-sm text-gray-600">
        <span class="text-[#596881]">{{ t('showing') }}</span>

        <Select
          :model-value="`${pagination.pageSize}`"
          @update:model-value="(v) => handlePageSizeChange(+v)"
          name="pageSize"
        >

          <SelectTrigger class="h-8 w-[70px]">
            <SelectValue :placeholder="`${pagination.pageSize}`" />
          </SelectTrigger>
          <SelectContent side="top">
            <SelectItem
              v-for="pageSize in ['10', '20', '30', '50']"
              :key="pageSize"
              :value="`${pageSize}`"
            >
              {{ pageSize }}
            </SelectItem>
          </SelectContent>
        </Select>

        <span> {{ t('dan') }} {{ pagination.totalCount }} </span>
      </div>

      <div class="flex items-center gap-1">
        <Button
          variant="outline"
          class="w-8 h-8 p-0"
          :disabled="pagination.currentPage <= 1"
          @click="handlePageChange(pagination.currentPage - 1)"
        >
          <ChevronLeftIcon class="w-4 h-4" />
        </Button>

        <div class="flex items-center gap-1 hidden sm:flex">
          <template v-for="page in getPageNumbers()" :key="page">
            <span v-if="page === '...'" class="px-2 text-gray-400 select-none"> ... </span>
            <Button
              v-else
              variant="outline"
              class="w-8 h-8 p-0 text-sm font-medium"
              :class="[
                page === pagination.currentPage
                  ? 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'
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
          class="w-8 h-8 p-0"
          :disabled="pagination.currentPage >= pagination.totalPages"
          @click="handlePageChange(pagination.currentPage + 1)"
        >
          <ChevronRightIcon class="w-4 h-4" />
        </Button>
      </div>
    </div>
  </div>
</template>
