import type { Payments } from '../types'
import type { ColumnDef } from '@tanstack/vue-table'

import i18n from '@/i18n'
import { h, computed, type ComputedRef } from 'vue'
import { prettify } from '@/lib/utils'
import { useDateFormat } from '@vueuse/core'

export const columns: ComputedRef<ColumnDef<Payments>[]> = computed(() => [
  {
    id: 'paymentNumber',
    header: i18n.global.t('numero-symbol'),
    cell: ({ row }) => {
      const rowNumber = row.original.paymentNumber
      return h('div', {}, rowNumber)
    }
  },
  {
    id: 'fullName',
    header: i18n.global.t('fio'),
    cell: ({ row }) => {
      if (row.original.user) {
        const lastName = row.original.user.lastName
        const firstName = row.original.user.firstName
        return h('div', {}, `${lastName} ${firstName}`)
      } else {
        return h('div', { class: 'italic text-muted-foreground' }, i18n.global.t('no-data'))
      }
    }
  },
  // {
  //   id: 'phoneNumber',
  //   header: i18n.global.t('phone-number'),
  //   cell: ({ row }) => {
  //     if (row.original.user?.phoneNumber) {
  //       const phone = prettifyPhoneNumber(row.original.user.phoneNumber)
  //       return h('div', { class: 'tabular-nums' }, phone)
  //     } else {
  //       return h('div', { class: 'italic text-muted-foreground' }, i18n.global.t('no-data'))
  //     }
  //   }
  // },
  {
    id: 'amount',
    header: i18n.global.t('requestedAmount'),
    cell: ({ row }) => {
      return row.original.amount
        ? h('div', {}, prettify(row.original.amount))
        : h('div', { class: 'italic text-muted-foreground' }, i18n.global.t('no-data'))
    }
  },
  {
    id: 'paidAmount',
    header: i18n.global.t('paidAmount'),
    cell: ({ row }) => {
      const amount = row.original.amount
      const commission = row.original.commission

      if (typeof amount === 'number' && typeof commission === 'number') {
        const paid = amount - commission
        return h('div', {}, prettify(paid))
      } else {
        return h('div', { class: 'italic text-muted-foreground' }, i18n.global.t('no-data'))
      }
    }
  },
  {
    id: 'commission',
    header: i18n.global.t('commission'),
    cell: ({ row }) => {
      const commission = row.original.commission
      return typeof commission === 'number'
        ? h('div', {}, prettify(commission))
        : h('div', { class: 'italic text-muted-foreground' }, i18n.global.t('no-data'))
    }
  },
  {
    id: 'card',
    header: i18n.global.t('card'),
    cell: ({ row }) => {
      const card = row.original.card?.maskedNumber
      return card
        ? h('div', {}, card)
        : h('div', { class: 'italic text-muted-foreground' }, i18n.global.t('no-data'))
    }
  },
  {
    id: 'date',
    header: i18n.global.t('date'),
    cell: ({ row }) => {
      if (row.original.createdAt) {
        const date = useDateFormat(row.original.createdAt, 'DD.MM.YYYY HH:mm')
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
      if (row.original.user) {
        const provider = row.original.salaryRequest?.provider || '-'
        return h('div', {}, provider)
      } else {
        return h('div', { class: 'italic text-muted-foreground' }, i18n.global.t('no-data'))
      }
    }
  }
])
