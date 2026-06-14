import type { FlattenedData } from '../ui/UsersLIst.vue'
import type { ColumnDef } from '@tanstack/vue-table'
import i18n from '@/i18n'
import { h } from 'vue'
import DataTableColumnHeader from './DataTableColumnHeader.vue'
import RowActions from './RowActions.vue'
import EntityStatusBadge from '@/components/EntityStatusBadge.vue'

export const createColumns = (): ColumnDef<FlattenedData>[] => [
  {
    id: 'full_name',
    header: ({ column }) => {
      return h(DataTableColumnHeader, {
        column,
        title: i18n.global.t('full_name'),
        notSortable: true
      })
    },
    cell: ({ row }) => {
      const fullName =
        row.original.lastName || row.original.firstName
          ? `${row.original.lastName || ''} ${row.original.firstName || ''}`.trim()
          : i18n.global.t('no-data')

      return h(
        'div',
        {
          class: 'w-[230px] break-words whitespace-normal text-left font-medium truncate'
        },
        fullName
      )
    }
  },
  {
    accessorKey: 'email',
    header: ({ column }) => {
      return h(DataTableColumnHeader, { column, title: i18n.global.t('email'), notSortable: true })
    },
    cell: ({ row }) =>
      h(
        'div',
        {},
        row.getValue('email') || h('span', { class: 'text-gray-400' }, i18n.global.t('no-data'))
      )
  },
  {
    accessorKey: 'level',
    header: ({ column }) => {
      return h(DataTableColumnHeader, {
        column,
        title: i18n.global.t('level'),
        notSortable: true
      })
    },
    cell: ({ row }) => {
      const level = row.getValue('level') as number
      const roleMap: Record<number, string> = {
        1: i18n.global.t('roles.teacher', 'Teacher'),
        2: i18n.global.t('roles.director', 'Director'),
        3: i18n.global.t('roles.district', 'District government'),
        4: i18n.global.t('roles.region', 'Region government'),
        5: i18n.global.t('roles.admin', 'Admin')
      }
      const roleName = roleMap[level] || level || '-'
      if (roleName === '-') return h('span', { class: 'text-gray-400 font-medium' }, '-')
      return h(
        'span',
        {
          class:
            'inline-flex items-center px-1.5 py-1 rounded-md text-sm font-medium bg-[#e2f5ec] text-[#166534]'
        },
        roleName
      )
    }
  },
  {
    accessorKey: 'login',
    header: ({ column }) => {
      return h(DataTableColumnHeader, { column, title: i18n.global.t('login'), notSortable: true })
    },
    cell: ({ row }) =>
      h(
        'div',
        { class: 'font-medium' },
        row.getValue('login') || h('span', { class: 'text-gray-400' }, i18n.global.t('no-data'))
      )
  },
  {
    accessorKey: 'status',
    header: ({ column }) =>
      h(DataTableColumnHeader, {
        column,
        title: i18n.global.t('status', 'Holat'),
        notSortable: true
      }),
    cell: ({ row }) => {
      return h(EntityStatusBadge, { status: (row.original as any).status })
    }
  },
  {
    id: 'actions',
    size: 140,
    minSize: 140,
    header: ({ column }) =>
      h(DataTableColumnHeader, {
        column,
        title: i18n.global.t('actions'),
        notSortable: true
      }),
    cell: ({ row }) => {
      return h(RowActions, { employee: row.original })
    }
  }
]
