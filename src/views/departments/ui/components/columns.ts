import type { ColumnDef } from '@tanstack/vue-table'
import type { Department } from '../../types'
import i18n from '@/i18n'
import { h, computed, type ComputedRef } from 'vue'
import { RouterLink } from 'vue-router'
import RowActions from './RowActions.vue'

export const columns: ComputedRef<ColumnDef<Department>[]> = computed(() => [
  {
    id: 'name',
    header: i18n.global.t('department-name'),
    accessorKey: 'name',
    cell: ({ row }) => {
      const { name, id } = row.original
      return h(
        'div',
        { class: 'font-medium text-left px-5' },
        h(
          RouterLink,
          {
            to: `/departments/${id}`,
            class: 'hover:underline cursor-pointer',
          },
          () => name
        )
      )
    }
  },
  {
    id: 'actions',
    header: i18n.global.t('actions'),
    meta: {
      className: 'w-[10%] whitespace-nowrap'
    },
    cell: ({ row }) => h(RowActions, { department: row.original })
  }
])
