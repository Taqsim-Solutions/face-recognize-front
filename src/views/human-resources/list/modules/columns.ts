import type { ColumnDef } from '@tanstack/vue-table'
import { h, computed } from 'vue'
import { useDateFormat } from '@vueuse/core'
import i18n from '@/i18n'
import { Button } from '@/components/ui/button'
import { Trash2Icon } from 'lucide-vue-next'
import DeleteConfirmDialog from '@/views/organization-settings/modules/DeleteConfirmationDialog.vue'
// import Can from '@/components/can.vue'
import type { Router } from 'vue-router'
import { useCheckPermission } from '@/composables/useCheckPermission'

export const useColumns = (router: Router) => {
  const { hasPermission: canDelete } = useCheckPermission('employee.leaves.delete')
  const { hasPermission: canViewDetail } = useCheckPermission('employees.detail')

  return computed<ColumnDef<any>[]>(() => {
    const baseColumns: ColumnDef<any>[] = [
      {
        id: 'rowNumber',
        header: i18n.global.t('numero-symbol'),
        cell: ({ row }) => h('div', { class: 'text-center' }, row.index + 1)
      },
      {
        id: 'fullName',
        header: i18n.global.t('fio'),
        cell: ({ row }) => {
          const user = row.original.employee?.user
          const fullName = user
            ? `${user.firstName} ${user.lastName}`
            : row.original.employee?.comment
          return h(
            'div',
            {
              class: `w-[230px] break-words whitespace-normal font-medium ${canViewDetail.value ? 'cursor-pointer hover:underline' : ''}`,
              onClick: (e: MouseEvent) => {
                if (canViewDetail.value) {
                  e.stopPropagation()
                  const employeeId = row.original.employee?.id
                  if (employeeId) {
                    router.push({
                      name: 'employees-detail',
                      params: { id: employeeId }
                    })
                  }
                }
              }
            },
            fullName || i18n.global.t('no-data')
          )
        }
      },
      {
        id: 'startEndDate',
        header: i18n.global.t('start-end-date'),
        cell: ({ row }) => {
          const start = row.original.startDate
          const end = row.original.endDate

          const formatDate = (date: Date) =>
            date ? useDateFormat(date, 'DD.MM.YYYY').value : i18n.global.t('no-data')

          const display = `${formatDate(start)} – ${formatDate(end)}`

          return h('div', { class: 'tabular-nums' }, display)
        }
      },
      {
        id: 'createdAt',
        header: i18n.global.t('created-at'),
        cell: ({ row }) => {
          const date = row.original.createdAt
          return date
            ? h('div', { class: 'tabular-nums' }, useDateFormat(date, 'DD.MM.YYYY HH:mm').value)
            : h('div', { class: 'italic text-muted-foreground' }, i18n.global.t('no-data'))
        }
      },
      {
        id: 'reason',
        header: i18n.global.t('reason'),
        cell: ({ row }) => {
          const reason = row.original.reason
          return h(
            'div',
            { class: `${reason ? '' : 'text-grayx2'}` },
            reason || i18n.global.t('no-reason')
          )
        }
      },
      {
        id: 'attachments',
        header: i18n.global.t('attachments'),
        cell: ({ row }) => {
          const attachments = row.original.attachments || []
          if (attachments.length === 0) {
            return h(
              'div',
              { class: `${row.original.attachments?.length ? '' : 'text-grayx2'}` },
              i18n.global.t('no-file')
            )
          }

          return h(
            'div',
            { class: 'flex flex-col gap-1' },
            attachments.map((att: any) =>
              h(
                'button',
                {
                  type: 'button',
                  class:
                    'btn btn-sm btn-primary border border-border rounded-lg py-0.5 px-2 flex items-center gap-1 w-max',
                  onClick: () => {
                    const baseUrl = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') + '/'
                    const url = baseUrl + att.filePath
                    window.open(url, '_blank')
                  }
                },
                [
                  // SVG icon
                  h('svg', {
                    xmlns: 'http://www.w3.org/2000/svg',
                    width: '12',
                    height: '12',
                    viewBox: '0 0 14 14',
                    fill: 'none',
                    innerHTML: `
                      <path d="M9.00005 3.66632L4.66671 7.99965C4.4015 8.26487 4.2525 8.62458 4.2525 8.99965C4.2525 9.37472 4.4015 9.73443 4.66671 9.99965C4.93193 10.2649 5.29164 10.4139 5.66671 10.4139C6.04179 10.4139 6.4015 10.2649 6.66671 9.99965L11 5.66632C11.5305 5.13588 11.8285 4.41646 11.8285 3.66632C11.8285 2.91617 11.5305 2.19675 11 1.66632C10.4696 1.13588 9.75019 0.837891 9.00005 0.837891C8.2499 0.837891 7.53048 1.13588 7.00005 1.66632L2.66671 5.99965C1.87106 6.7953 1.42407 7.87443 1.42407 8.99965C1.42407 10.1249 1.87106 11.204 2.66671 11.9997C3.46236 12.7953 4.54149 13.2423 5.66671 13.2423C6.79193 13.2423 7.87106 12.7953 8.66671 11.9997L13 7.66632" stroke="#111625" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                    `
                  }),
                  'File'
                ]
              )
            )
          )
        }
      }
    ]

    if (canDelete.value) {
      baseColumns.push({
        id: 'actions',
        header: i18n.global.t('actions'),
        cell: ({ row, table }) => {
          return h(
            'div',
            { class: 'flex justify-center items-center' },
            h(
              DeleteConfirmDialog,
              {
                id: row.original.id,
                onConfirm: async (id) => {
                  const meta = table.options.meta as any
                  if (meta?.deleteLeave) {
                    await meta.deleteLeave(id)
                  }
                },
                title: i18n.global.t('confirm-delete')
              },
              {
                trigger: () =>
                  h(
                    Button,
                    {
                      type: 'button',
                      class:
                        'h-8 w-8 p-0 flex items-center justify-center rounded-lg bg-[#FEF3F2] text-[#DC2626] transition-colors duration-200 hover:bg-[#FBE1DE] focus:outline-none focus:ring-2 focus:ring-[#FECACA] focus:ring-offset-2 shadow-none',
                      title: i18n.global.t('delete'),
                      'aria-label': i18n.global.t('delete')
                    },
                    { default: () => h(Trash2Icon, { class: 'h-4 w-4' }) }
                  )
              }
            )
          )
        }
      })
    }

    return baseColumns
  })
}
