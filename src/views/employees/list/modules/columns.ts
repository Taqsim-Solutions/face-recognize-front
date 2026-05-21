import type { FlattenedData } from '../ui/EmployeesList.vue'
import type { ColumnDef } from '@tanstack/vue-table'
import i18n from '@/i18n'
import { h } from 'vue'
import { prettifyPhoneNumber, prettify } from '@/lib/utils'
import DataTableColumnHeader from './DataTableColumnHeader.vue'
import DataTableColumnCell from './DataTableColumnCell.vue'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
export const createColumns = (): ColumnDef<FlattenedData>[] => [
  {
    id: 'select',
    header: ({ table }) =>
      h(Checkbox, {
        checked: table.getIsAllPageRowsSelected(),
        'onUpdate:checked': (value: boolean) => table.toggleAllPageRowsSelected(!!value),
        ariaLabel: 'Select all',
        class: 'translate-y-[2px]'
      }),
    cell: ({ row }) =>
      h(
        'div',
        { onClick: (e: MouseEvent) => e.stopPropagation() },
        h(Checkbox, {
          checked: row.getIsSelected(),
          'onUpdate:checked': (value: boolean) => row.toggleSelected(!!value),
          ariaLabel: 'Select row',
          class: 'translate-y-[2px]'
        })
      ),
    enableSorting: false,
    enableHiding: false,
    size: 50,
    minSize: 50,
    maxSize: 50
  },
  {
    id: 'id',
    size: 30,
    minSize: 30,
    header: ({ column }) =>
      h(DataTableColumnHeader, { column, title: i18n.global.t('numero-symbol'), notSortable: true }),
    cell: ({ row }) => {
      return h(
        'div',
        { class: 'text-center font-medium' },
        row.original.employeeNumber
      )
    }
  },
  {
    id: 'user_lastName',
    header: ({ column }) => {
      return h(DataTableColumnHeader, { column, title: 'fio', notSortable: true })
    },
    cell: ({ row }) => {
      const fullName = row.original.user_lastName
        ? `${row.original.user_lastName} ${row.original.user_firstName}`
        : row.original.comment

      return h(
        'div',
        {
          class: 'w-[230px] break-words whitespace-normal uppercase font-medium truncate'
        },
        fullName || row.original.comment || i18n.global.t('no-data')
      )
    }
  },
  {
    accessorKey: 'phoneNumber',
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: 'ghost',
          class: 'p-0',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
        },
        () => [i18n.global.t('phone-number')]
      )
    },
    cell: ({ row }) =>
      h(
        'div',
        {},
        row.getValue('phoneNumber')
          ? prettifyPhoneNumber(row.getValue('phoneNumber'))
          : h('span', { class: 'text-gray-400' }, i18n.global.t('no-data'))
      )
  },
  {
    accessorKey: 'salary',
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: 'ghost',
          class: 'p-0',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
        },
        () => [i18n.global.t('salary')]
      )
    },
    cell: ({ row }) => {
      const salary = Number(row.getValue('salary'))

      return h(
        'div',
        { class: 'font-medium' },
        salary
          ? prettify(salary)?.toString()
          : h('span', { class: 'text-gray-400' }, i18n.global.t('no-data'))
      )
    }
  },
  {
    accessorKey: 'percentAllowed',
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: 'ghost',
          class: 'p-0',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
        },
        () => [i18n.global.t('allowed-percent')]
      )
    },
    cell: ({ row }) => {
      return h(DataTableColumnCell, {
        value: row.original.percentAllowed ? `${row.original.percentAllowed}%` : undefined,
        fallbackText: 'no-data'
      })
    }
  },
  {
    accessorKey: 'status',
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: 'ghost',
          class: 'p-0',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
        },
        () => [i18n.global.t('status')]
      )
    },
    cell: ({ row }) => {
      const status = row.original.status

      const baseClasses =
        'inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium capitalize border'

      const activeClasses = 'bg-[#EBF9F4] border-[#7AD9B7] text-[#38C793]'
      const inactiveClasses = 'bg-[#FCE8EC] border-[#EA6780] text-[#DF1C41]'

      const classes =
        status === 'active'
          ? `${baseClasses} ${activeClasses}`
          : `${baseClasses} ${inactiveClasses}`

      return h('span', { class: classes }, i18n.global.t(status))
    }
  }
]
