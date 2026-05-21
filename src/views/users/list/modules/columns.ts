import type { FlattenedData } from '../ui/EmployeesList.vue'
import type { ColumnDef } from '@tanstack/vue-table'
import i18n from '@/i18n'
import { h } from 'vue'
import DataTableColumnHeader from './DataTableColumnHeader.vue'
import RowActions from './RowActions.vue'

export const createColumns = (): ColumnDef<FlattenedData>[] => [
  {
    id: 'name',
    header: ({ column }) => {
      return h(DataTableColumnHeader, { column, title: i18n.global.t('fio', 'Name'), notSortable: true })
    },
    cell: ({ row }) => {
      const fullName = row.original.lastName || row.original.firstName
        ? `${row.original.lastName || ''} ${row.original.firstName || ''}`.trim()
        : i18n.global.t('no-data')

      return h(
        'div',
        {
          class: 'w-[230px] break-words whitespace-normal text-left uppercase font-medium truncate'
        },
        fullName
      )
    }
  },
  {
    accessorKey: 'email',
    header: ({ column }) => {
      return h(DataTableColumnHeader, { column, title: 'Email', notSortable: true })
    },
    cell: ({ row }) =>
      h(
        'div',
        {},
        row.getValue('email') || h('span', { class: 'text-gray-400' }, i18n.global.t('no-data'))
      )
  },
  {
    accessorKey: 'login',
    header: ({ column }) => {
      return h(DataTableColumnHeader, { column, title: 'Login', notSortable: true })
    },
    cell: ({ row }) =>
      h(
        'div',
        { class: 'font-medium' },
        row.getValue('login') || h('span', { class: 'text-gray-400' }, i18n.global.t('no-data'))
      )
  },
  {
    accessorKey: 'level',
    header: ({ column }) => {
      return h(DataTableColumnHeader, { column, title: i18n.global.t('level', 'Level'), notSortable: true })
    },
    cell: ({ row }) => {
      const level = row.getValue('level') as number
      const roleMap: Record<number, string> = {
        1: 'Teacher',
        2: 'Director',
        3: 'District government',
        4: 'Region government',
        5: 'Admin'
      }
      return h(
        'div',
        { class: 'text-center font-medium' },
        roleMap[level] || level || '-'
      )
    }
  },
  {
    accessorKey: 'schoolName',
    header: ({ column }) => {
      return h(DataTableColumnHeader, { column, title: 'School', notSortable: true })
    },
    cell: ({ row }) => {
      return h('span', {}, row.getValue('schoolName') || '-')
    }
  },
  {
    id: 'actions',
    size: 140,
    minSize: 140,
    header: ({ column }) =>
      h(DataTableColumnHeader, { column, title: i18n.global.t('actions', 'Actions'), notSortable: true }),
    cell: ({ row }) => {
      return h(RowActions, { employee: row.original })
    }
  }
]
