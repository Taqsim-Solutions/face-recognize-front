import type { ColumnDef } from '@tanstack/vue-table'
import type { AttendanceTableData } from '../types'
import { h } from 'vue'
import dayjs from 'dayjs'
import i18n from '@/i18n'

export const prepareColumns = (dates: Set<string>) => {
  const result: ColumnDef<AttendanceTableData>[] = []

  dates.forEach((date) => {
    result.push({
      id: date,
      header: () => {
        const d = dayjs(date)
        const formattedDate = d.format('DD.MM.YYYY')
        const dayName = d.format('ddd')

        return h('div', { class: 'flex justify-center gap-1 items-center text-center' }, [
          h('p', { class: 'text-sm text-gray-500 capitalize' }, `${i18n.global.t(dayName)}, `),
          h('p', { class: 'font-medium' }, formattedDate)
        ])
      },
      cell: ({ row }) => {
        return h('p', { class: 'text-nowrap' }, row.original[date])
      }
    })
  })

  return result
}
