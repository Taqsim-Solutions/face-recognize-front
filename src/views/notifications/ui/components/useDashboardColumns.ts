import type { ColumnDef } from '@tanstack/vue-table'
import type { NotificationDashboardItem } from '../../types'
import { useI18n } from 'vue-i18n'
import { h, computed, type Ref } from 'vue'
import dayjs from 'dayjs'
import { Button } from '@/components/ui/button'

export const useDashboardColumns = (
    page: Ref<number>, 
    pageSize: Ref<number>,
    onView: (id: string) => void
) => {
    const { t, locale } = useI18n()
    
    return computed<ColumnDef<NotificationDashboardItem>[]>(() => [
        {
            id: 'index',
            header: '#',
            cell: ({ row }) => {
                return h('div', { class: 'pl-5 font-medium text-muted-foreground' }, 
                    (page.value - 1) * pageSize.value + row.index + 1
                )
            },
            enableSorting: false,
            size: 50
        },
        {
            accessorKey: 'template.title',
            header: t('title'),
            cell: ({ row }) => {
            const currentLocale = locale.value as string
            const locales = row.original.template?.locales || []
            const localeData = locales.find((l) => l.localeKey === currentLocale) || locales[0]
            return h('div', { class: 'font-medium pl-5 text-left' }, localeData?.title || '-')
            }
        },
        {
            accessorKey: 'receiversCount',
            header: t('receivers'),
            cell: ({ row }) => h('div', {}, row.original.receiversCount)
        },
        {
            accessorKey: 'createdAt',
            header: t('date'),
            cell: ({ row }) => {
            try {
                return h('div', {}, dayjs(row.original.createdAt).format('DD.MM.YYYY - HH:mm'))
            } catch (e) {
                return h('div', {}, row.original.createdAt)
            }
            }
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => {
                return h(Button, {
                    variant: 'outline',
                    class: 'bg-[#E9F0FE] hover:bg-[#E9F0FE] hover:opacity-80 transition-all border-none px-1.5 h-7',
                    onClick: (e: Event) => {
                        e.stopPropagation()
                        onView(row.original.id)
                    }
                }, () => h('svg', {
                    xmlns: "http://www.w3.org/2000/svg",
                    width: "20",
                    height: "20",
                    viewBox: "0 0 18 18",
                    fill: "none"
                }, [
                    h('path', {
                        d: "M7.5 9C7.5 9.39782 7.65804 9.77936 7.93934 10.0607C8.22064 10.342 8.60218 10.5 9 10.5C9.39782 10.5 9.77936 10.342 10.0607 10.0607C10.342 9.77936 10.5 9.39782 10.5 9C10.5 8.60218 10.342 8.22064 10.0607 7.93934C9.77936 7.65804 9.39782 7.5 9 7.5C8.60218 7.5 8.22064 7.65804 7.93934 7.93934C7.65804 8.22064 7.5 8.60218 7.5 9Z",
                        stroke: "#266DF0",
                        "stroke-width": "1.5",
                        "stroke-linecap": "round",
                        "stroke-linejoin": "round"
                    }),
                     h('path', {
                        d: "M15.75 9C13.95 12 11.7 13.5 9 13.5C6.3 13.5 4.05 12 2.25 9C4.05 6 6.3 4.5 9 4.5C11.7 4.5 13.95 6 15.75 9Z",
                        stroke: "#266DF0",
                        "stroke-width": "1.5",
                        "stroke-linecap": "round",
                        "stroke-linejoin": "round"
                    })
                ]))
            },
            enableSorting: false,
            size: 50
        }
    ])
}
