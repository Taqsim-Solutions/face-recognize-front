import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import type { NotificationReceiver } from '../../types'
import i18n from '@/i18n'

export const receiversColumns: ColumnDef<NotificationReceiver>[] = [
  {
    accessorKey: 'user',
    header: () => i18n.global.t('employee'),
    cell: ({ row }) => {
      const user = row.original.user
      return h('div', { class: 'flex flex-col' }, [
        h('span', { class: 'font-medium' }, `${user.firstName} ${user.lastName}`),
        h('span', { class: 'text-xs text-gray-500' }, user.phoneNumber)
      ])
    }
  },
  {
    accessorKey: 'push',
    header: () => i18n.global.t('type'),
    cell: ({ row }) => {
       return h('span', { class: 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80' }, row.original.push)
    }
  },
  {
    accessorKey: 'isRead',
    header: () => i18n.global.t('status'),
    cell: ({ row }) => {
      const isRead = row.original.isRead
      return h(
        'span', 
        { class: `inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${isRead ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'}` }, 
        isRead ? i18n.global.t('read') : i18n.global.t('unread')
      )
    }
  },
  {
    accessorKey: 'readDate',
    header: () => i18n.global.t('readDate'),
    cell: ({ row }) => {
      const date = row.original.readDate
      if (!date) return '-'
      return new Date(date).toLocaleString()
    }
  }
]


