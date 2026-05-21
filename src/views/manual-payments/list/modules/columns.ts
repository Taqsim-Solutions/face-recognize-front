import type { ManualPaymentModel } from '../types'
import type { ColumnDef } from '@tanstack/vue-table'

import i18n from '@/i18n'
import { h, computed, type ComputedRef } from 'vue'
import { useDateFormat } from '@vueuse/core'

export const columns: ComputedRef<ColumnDef<ManualPaymentModel>[]> = computed(() => [
  {
    id: 'rowNumber',
    header: i18n.global.t('numero-symbol'),
    cell: ({ row }) => {
      const rowNumber = row.index + 1
      return h('div', {}, rowNumber)
    }
  },
  {
    id: 'fullName',
    header: i18n.global.t('fio'),
    cell: ({ row }) => {
      if (row.original.fullName) {
        const name = row.original.fullName
        return h('div', {}, name)
      } else {
        return h('div', { class: 'italic text-muted-foreground' }, i18n.global.t('no-data'))
      }
    }
  },
  {
    id: 'date',
    header: i18n.global.t('date'),
    cell: ({ row }) => {
      if (row.original.createdAt) {
        const date = useDateFormat(row.original.createdAt, 'YYYY/MM/DD HH:mm')

        return h('div', { class: 'tabular-nums' }, `${date.value}`)
      } else {
        return h('div', { class: 'italic text-muted-foreground' }, i18n.global.t('no-data'))
      }
    }
  },
  {
    id: 'provider',
    header: i18n.global.t('provider'),
    cell: ({ row }) => {
      if (row.original.provider) {
        const provider = row.original.provider
        return h('div', {}, provider)
      } else {
        return h('div', { class: 'italic text-muted-foreground' }, i18n.global.t('no-data'))
      }
    }
  },
  {
    id: 'card',
    header: i18n.global.t('card'),
    cell: ({ row }) => {
      if (row.original.cardNumber) {
        const card = row.original.cardNumber
        return h('div', {}, card)
      } else {
        return h('div', { class: 'italic text-muted-foreground' }, i18n.global.t('no-data'))
      }
    }
  },
  {
    id: 'status',
    header: i18n.global.t('status'),
    cell: ({ row }) => {
      if (row.original.status) {
        const status = row.original.status
        return h('div', {}, status)
      } else {
        return h('div', { class: 'italic text-muted-foreground' }, i18n.global.t('no-data'))
      }
    }
  },
  {
    id: 'comment',
    header: i18n.global.t('comment'),
    cell: ({ row }) => {
      if (row.original.comment) {
        const comment = row.original.comment
        return h('div', {}, comment)
      } else {
        return h('div', { class: 'italic text-muted-foreground' }, i18n.global.t('no-data'))
      }
    }
  }
])
