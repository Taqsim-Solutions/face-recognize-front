import type { ColumnDef } from '@tanstack/vue-table'
import i18n from '@/i18n'
import { h } from 'vue'
import DataTableColumnHeader from '@/views/users/list/modules/DataTableColumnHeader.vue'
import RowActions from './RowActions.vue'
import EntityStatusBadge from '@/components/EntityStatusBadge.vue'
import { selectionColumn } from '@/components/table/selectionColumn'

export const createColumns = (directors: any[] = []): ColumnDef<any>[] => [
  selectionColumn<any>(),
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return h(DataTableColumnHeader, {
        column,
        title: i18n.global.t('school-name'),
        notSortable: true
      })
    },
    cell: ({ row }) =>
      h(
        'div',
        { class: 'font-medium break-words whitespace-normal' },
        row.getValue('name') || h('span', { class: 'text-gray-400' }, i18n.global.t('no-data'))
      )
  },
  {
    id: 'director',
    header: ({ column }) => {
      return h(DataTableColumnHeader, {
        column,
        title: i18n.global.t('school-director'),
        notSortable: true
      })
    },
    cell: ({ row }) => {
      const schoolId = row.original.id
      // Try directorFullName from API first, then cross-reference directors list by schoolId
      const directorFullName =
        row.original.directorFullName ||
        (() => {
          const match = directors.find((d: any) => d.schoolId === schoolId)
          if (!match) return null
          return [match.lastName, match.firstName].filter(Boolean).join(' ') || match.login
        })()

      if (!directorFullName) {
        return h('span', { class: 'text-gray-400 font-medium' }, i18n.global.t('no-data'))
      }
      return h('span', { class: 'font-medium text-slate-900' }, directorFullName)
    }
  },
  {
    id: 'region_city',
    header: ({ column }) => {
      return h(DataTableColumnHeader, {
        column,
        title: i18n.global.t('region_city', 'Viloyat/Tuman'),
        notSortable: true
      })
    },
    cell: ({ row }) => {
      const region = row.original.region
      const city = row.original.city

      if (!region || !region.name) {
        return h('span', { class: 'text-gray-400 font-medium' }, i18n.global.t('no-data'))
      }

      const children: any[] = []
      if (region.name) {
        children.push(h('span', region.name + (city && city.name ? ',' : '')))
      }
      if (region.name && city && city.name) {
        children.push(h('br'))
      }
      if (city && city.name) {
        children.push(h('span', city.name))
      }

      return h('div', { class: 'font-medium text-slate-800 text-left leading-normal' }, children)
    }
  },
  {
    accessorKey: 'status',
    header: ({ column }) =>
      h(DataTableColumnHeader, {
        column: column as any,
        title: i18n.global.t('status', 'Holat'),
        notSortable: true
      }),
    cell: ({ row }) => {
      return h(EntityStatusBadge, { status: (row.original as any).status })
    }
  },
  {
    id: 'actions',
    size: 100,
    minSize: 100,
    header: ({ column }) =>
      h(DataTableColumnHeader, {
        column,
        title: i18n.global.t('actions'),
        notSortable: true
      }),
    cell: ({ row }) => {
      return h(RowActions, { school: row.original })
    }
  }
]
