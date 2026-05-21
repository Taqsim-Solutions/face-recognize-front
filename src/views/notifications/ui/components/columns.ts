import type { ColumnDef } from '@tanstack/vue-table'
import type { NotificationTemplate } from '../../types'
import i18n from '@/i18n'
import { h, computed, type ComputedRef } from 'vue'
import RowActions from './RowActions.vue'
import dayjs from 'dayjs'

export const columns: ComputedRef<ColumnDef<NotificationTemplate>[]> = computed(() => [
  {
    accessorKey: 'title',
    header: i18n.global.t('title'),
    cell: ({ row }) => {
      const currentLocale = i18n.global.locale.value as string
      const localeData = row.original.locales.find((l) => l.localeKey === currentLocale) || row.original.locales[0]
      return h('div', { class: 'font-medium text-left pl-5' }, localeData?.title || '-')
    }
  },

  {
    accessorKey: 'locales',
    header: i18n.global.t('locales'),
    cell: ({ row }) => {
      const locales = row.original.locales.map(l => l.localeKey.toUpperCase()).join(', ')
      return h('div', {}, locales)
    }
  },
  {
    accessorKey: 'state',
    header: i18n.global.t('status'),
    cell: ({ row }) => {
      const state = row.original.state
      const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border capitalize whitespace-nowrap shadow-sm transition-all duration-200'

      let colorClasses = 'bg-gray-50 border-gray-200 text-gray-500'

      if (state === 'active') {
        colorClasses = 'bg-[#EBF9F4] border-[#7AD9B7] text-[#38C793]'
      } else if (state === 'disabled') {
        colorClasses = 'bg-[#FCE8EC] border-[#EA6780] text-[#DF1C41]'
      } else if (state === 'created') {
        colorClasses = 'bg-[#F0F4FF] border-[#ADC4FF] text-[#2F54EB]'
      }

      return h(
        'span',
        { class: `${baseClasses} ${colorClasses}` },
        i18n.global.t(`state-${state}`)
      )
    }
  },
  {
    accessorKey: 'createdAt',
    header: i18n.global.t('created-at'),
    cell: ({ row }) => {
      try {
        return h('div', {}, dayjs(row.original.createdAt).format('DD.MM.YYYY HH:mm'))
      } catch (e) {
        return h('div', {}, row.original.createdAt)
      }
    }
  },
  {
    id: 'actions',
    header: i18n.global.t('actions'),
    cell: ({ row }) => h(RowActions, { template: row.original })
  }
])
