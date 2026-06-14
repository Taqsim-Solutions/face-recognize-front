import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { Checkbox } from '@/components/ui/checkbox'

// A reusable select column: header checkbox toggles the whole page, each row
// checkbox toggles that row. Works with TanStack's enableRowSelection state.
export function selectionColumn<T>(): ColumnDef<T> {
  return {
    id: 'select',
    size: 44,
    minSize: 44,
    maxSize: 44,
    enableSorting: false,
    header: ({ table }) =>
      h(Checkbox, {
        checked: table.getIsAllPageRowsSelected()
          ? true
          : table.getIsSomePageRowsSelected()
            ? 'indeterminate'
            : false,
        'onUpdate:checked': (value: boolean) =>
          table.toggleAllPageRowsSelected(!!value),
        'aria-label': 'Select all',
        onClick: (e: Event) => e.stopPropagation()
      }),
    cell: ({ row }) =>
      h(Checkbox, {
        checked: row.getIsSelected(),
        'onUpdate:checked': (value: boolean) => row.toggleSelected(!!value),
        'aria-label': 'Select row',
        onClick: (e: Event) => e.stopPropagation()
      })
  }
}
