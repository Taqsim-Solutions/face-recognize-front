import type { ColumnDef } from '@tanstack/vue-table'
import type { RequestsModel } from '../types'
import type { Router } from 'vue-router'

import i18n from '@/i18n'
import { h, computed } from 'vue'
import { useDateFormat } from '@vueuse/core'
import { prettify } from '@/lib/utils'

import type { ComputedRef } from 'vue'

export const useColumns = (router: Router, hasDetailPermission: ComputedRef<boolean>) => {
  return computed<ColumnDef<RequestsModel>[]>(() => [
    {
      id: 'rowNumber',
      header: i18n.global.t('numero-symbol'),
      cell: ({ row }) => h('div', { class: 'text-center' }, row.index + 1)
    },
    {
      id: 'name',
      header: i18n.global.t('fio'),
      cell: ({ row }) => {
        if (row.original.employee?.user !== undefined && row.original.employee.user !== null) {
          const user = row.original.employee.user
          return h(
            'div',
            {
              class: `font-medium ${hasDetailPermission.value ? 'cursor-pointer hover:underline' : ''}`,
              onClick: (e: MouseEvent) => {
                if (hasDetailPermission.value) {
                  e.stopPropagation()
                  router.push({
                    name: 'employees-detail',
                    params: { id: row.original.employee.id }
                  })
                }
              }
            },
            `${user.lastName || ''} ${user.firstName || ''}`
          )
        } else {
          return h('div', { class: 'italic text-muted-foreground' }, i18n.global.t('no-data'))
        }
      }
    },
    {
      id: 'amount',
      header: i18n.global.t('requestedAmount'),
      cell: ({ row }) => {
        if (row.original.amount !== undefined && row.original.amount !== null) {
          const amount = prettify(row.original.amount)
          return h('p', { class: 'tabular-nums' }, amount)
        } else {
          return h('p', { class: 'italic text-muted-foreground' }, i18n.global.t('no-data'))
        }
      }
    },
    {
      id: 'commissionCalculationType',
      header: i18n.global.t('commissionCalculationType'),
      cell: ({ row }) => {
        const value = row.original.commissionCalculationType
        return value
          ? h('p', {}, i18n.global.t(value))
          : h('p', { class: 'italic text-muted-foreground' }, i18n.global.t('none'))
      }
    },
    {
      id: 'provider',
      header: i18n.global.t('provider'),
      cell: ({ row }) => {
        const value = row.original.provider
        return value
          ? h('p', {}, value)
          : h('p', { class: 'italic text-muted-foreground' }, i18n.global.t('none'))
      }
    },
    {
      id: 'status',
      header: i18n.global.t('status'),
      cell: ({ row }) => {
        const value = row.original.status

        if (!value) {
          return h('span', { class: 'italic text-muted-foreground' }, i18n.global.t('no-data'))
        }

        const statusText =
          value === 'paid'
            ? i18n.global.t('has-been-paid')
            : value === 'paymentCanceled'
              ? i18n.global.t('payment-cancelled')
              : i18n.global.t(value)

        const baseClasses =
          'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize border'

        let colorClasses = ''
        if (value === 'paid') {
          colorClasses = 'bg-[#EBF9F4] border-[#7AD9B7] text-[#38C793]'
        } else if (value === 'paymentCanceled' || value === 'failed') {
          colorClasses = 'bg-[#FCE8EC] border-[#EA6780] text-[#DF1C41]'
        } else if (value === 'paymentInProgress') {
          colorClasses = 'bg-blue-50 border-blue-200 text-blue-700'
        } else {
          colorClasses = 'bg-gray-100 border-gray-300 text-gray-800'
        }

        return h('span', { class: `${baseClasses} ${colorClasses}` }, statusText)
      }
    },
    {
      id: 'createdAt',
      header: i18n.global.t('date'),
      cell: ({ row }) => {
        if (row.original.createdAt) {
          const date = useDateFormat(row.original.createdAt, 'DD.MM.YYYY HH:mm')
          return h('p', { class: 'tabular-nums' }, date.value)
        } else {
          return h('p', { class: 'italic text-muted-foreground' }, i18n.global.t('no-data'))
        }
      }
    },
    {
      id: 'comment',
      header: i18n.global.t('comment'),
      cell: ({ row }) => {
        if (row.original.comment) {
          const comment = row.original.comment
          return h('p', {}, comment)
        } else {
          return h('p', { class: 'italic text-muted-foreground' }, i18n.global.t('no-data'))
        }
      }
    }
  ])
}
