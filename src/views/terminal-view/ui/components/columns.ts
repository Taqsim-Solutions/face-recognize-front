import type { ColumnDef } from '@tanstack/vue-table'
import type { Deposit } from '../../types'
import i18n from '@/i18n'
import { h, computed } from 'vue'
import { Download } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { useDateFormat } from '@vueuse/core'
import { useCheckPermission } from '@/composables/useCheckPermission'

export const useColumns = () => {
  const { hasPermission: canModify } = useCheckPermission('payment.terminal.deposits.modifier')

  return computed<ColumnDef<Deposit>[]>(() => {
    const cols: ColumnDef<Deposit>[] = [
      {
        id: 'amount',
        header: i18n.global.t('amount'),
        cell: ({ row }) =>
          h('div', {}, `${row.original.amount.toLocaleString()} ${i18n.global.t('currency')}`)
      },
      {
        id: 'comment',
        header: i18n.global.t('comment'),
        cell: ({ row }) =>
          h(
            'div',
            { class: 'max-w-xs truncate', title: row.original.comment },
            row.original.comment || '-'
          )
      },
      {
        id: 'createdAt',
        header: i18n.global.t('created-at'),
        cell: ({ row }) => {
          const date = useDateFormat(row.original.createdAt, 'DD.MM.YYYY HH:mm')
          return h('div', { class: 'text-sm text-gray-600' }, [date.value])
        }
      },
      {
        id: 'status',
        header: i18n.global.t('status'),
        cell: ({ row }) => {
          const status = row.original.status?.toLowerCase()
          
          let colorClasses = 'bg-[#FFF9F2] text-[#FFB039]' // Default (Created)
          
          if (status === 'confirmed') {
            colorClasses = 'bg-[#EBF9F4] text-[#33B586]'
          } else if (status === 'rejected') {
            colorClasses = 'bg-[#FCE8EC] text-[#DF1C41]'
          }

          return h(
            'div',
            {
              class: `inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${colorClasses}`
            },
            i18n.global.t(row.original.status)
          )
        }
      },
      {
        id: 'receiptFiles',
        header: i18n.global.t('receipt-files'),
        cell: ({ row }) =>
          h(
            'div',
            { class: 'flex flex-wrap gap-1' },
            row.original.receiptFiles?.map((file) =>
              h(
                'span',
                {
                  key: file.id,
                  class:
                    'inline-flex items-center px-2 py-1 rounded-md text-xs border cursor-pointer hover:bg-blue-50',
                  onClick: () =>
                    window.dispatchEvent(
                      new CustomEvent('download-deposit-receipt', {
                        detail: { deposit: row.original, fileId: file.id }
                      })
                    )
                },
                [h(Download, { class: 'h-3 w-3 mr-1' }), file.name]
              )
            )
          )
      }
    ]

    if (canModify.value) {
      cols.push({
        id: 'actions',
        header: i18n.global.t('actions'),
        cell: ({ row }) =>
          h('div', { class: 'flex gap-2' }, [
            h(
              Button,
              {
                variant: 'ghost',
                size: 'sm',
                onClick: () =>
                  window.dispatchEvent(
                    new CustomEvent('delete-deposit', {
                      detail: {
                        depositId: row.original.id,
                        eposTerminalId: row.original.eposTerminalId
                      }
                    })
                  )
              },
              () => [
                h(
                  'svg',
                  {
                    xmlns: 'http://www.w3.org/2000/svg',
                    width: '36',
                    height: '36',
                    viewBox: '0 0 34 34',
                    fill: 'none',
                    class: 'rounded-lg'
                  },
                  [
                    h('rect', {
                      width: '34',
                      height: '34',
                      rx: '1',
                      fill: '#FCE8EC'
                    }),
                    h('path', {
                      d: 'M11 13.25H23M15.5 16.25V20.75M18.5 16.25V20.75M11.75 13.25L12.5 22.25C12.5 22.6478 12.658 23.0294 12.9393 23.3107C13.2206 23.592 13.6022 23.75 14 23.75H20C20.3978 23.75 20.7794 23.592 21.0607 23.3107C21.342 23.0294 21.5 22.6478 21.5 22.25L22.25 13.25M14.75 13.25V11C14.75 10.8011 14.829 10.6103 14.9697 10.4697C15.1103 10.329 15.3011 10.25 15.5 10.25H18.5C18.6989 10.25 18.8897 10.329 19.0303 10.4697C19.171 10.6103 19.25 10.8011 19.25 11V13.25',
                      stroke: '#DF1C41',
                      'stroke-width': '1.5',
                      'stroke-linecap': 'round',
                      'stroke-linejoin': 'round'
                    })
                  ]
                )
              ]
            )
          ])
      })
    }

    return cols
  })
}
