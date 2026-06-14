import type { ColumnDef } from '@tanstack/vue-table'
import i18n from '@/i18n'
import { h } from 'vue'
import DataTableColumnHeader from '@/views/users/list/modules/DataTableColumnHeader.vue'
import RowActions from './RowActions.vue'
import EntityStatusBadge from '@/components/EntityStatusBadge.vue'
import type { StudentModel } from '../types'

export const createColumns = (callbacks: {
  onUploadPhoto: (student: StudentModel) => void
  onDeletePhoto: (student: StudentModel) => void
}): ColumnDef<StudentModel>[] => [
  {
    accessorKey: 'lastName',
    header: ({ column }) => {
      return h(DataTableColumnHeader, {
        column: column as any,
        title: i18n.global.t('fish', 'F.I.Sh'),
        notSortable: true
      })
    },
    cell: ({ row }) => {
      const student = row.original
      const lastName = student.lastName || ''
      const firstName = student.firstName || ''

      const initials = ((lastName[0] || '') + (firstName[0] || '')).toUpperCase() || 'S'

      const lastImage =
        student.mainImageName ||
        (student.imageIds && student.imageIds.length > 0
          ? student.imageIds[student.imageIds.length - 1]
          : null)

      const avatarUrl = lastImage ? `/api/images?filename=${lastImage}` : null

      const avatarChild = avatarUrl
        ? h('img', {
            src: avatarUrl,
            class: 'w-8 h-8 rounded-full object-cover',
            onError: (e: Event) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              const parent = target.parentElement
              if (parent) {
                const initialsDiv = parent.querySelector('.avatar-initials') as HTMLElement
                if (initialsDiv) initialsDiv.style.display = 'flex'
              }
            }
          })
        : null

      const initialsAvatar = h(
        'div',
        {
          class:
            'avatar-initials w-8 h-8 rounded-full bg-[#fbe9e7] text-[#f27a3a] flex items-center justify-center font-bold text-xs uppercase',
          style: avatarUrl ? { display: 'none' } : {}
        },
        initials
      )

      const nameBlock = h('div', { class: 'flex flex-col leading-tight min-w-0' }, [
        h('span', { class: 'font-semibold text-[#1b1b1b] text-sm -mb-0.5' }, firstName),
        h('span', { class: 'text-sm' }, `${lastName}`)
      ])

      return h('div', { class: 'flex items-center gap-3' }, [
        h('div', { class: 'relative w-8 h-8 shrink-0' }, [avatarChild, initialsAvatar]),
        nameBlock
      ])
    }
  },
  {
    id: 'photo_action',
    size: 70,
    minSize: 70,
    header: ({ column }) => {
      return h(DataTableColumnHeader, {
        column: column as any,
        title: i18n.global.t('photo_label', 'Rasm'),
        notSortable: true
      })
    },
    cell: ({ row }) => {
      const student = row.original
      const hasPhoto = !!(
        student.mainImageName ||
        (student.imageIds && student.imageIds.length > 0)
      )

      if (hasPhoto) {
        // Delete icon — plain, no circle
        return h(
          'button',
          {
            type: 'button',
            onClick: (e: Event) => {
              e.stopPropagation()
              callbacks.onDeletePhoto(student)
            },
            class:
              'flex items-center justify-center cursor-pointer border-none bg-transparent p-0 mx-auto'
          },
          [
            h(
              'svg',
              {
                xmlns: 'http://www.w3.org/2000/svg',
                width: '20',
                height: '20',
                viewBox: '0 0 20 20',
                fill: 'none'
              },
              [
                h('path', {
                  d: 'M16.6667 7.50033L15.0042 16.9553C14.9363 17.3415 14.7346 17.6913 14.4343 17.9434C14.1341 18.1955 13.7545 18.3337 13.3625 18.3337H6.6375C6.24545 18.3337 5.86594 18.1955 5.56569 17.9434C5.26543 17.6913 5.06366 17.3415 4.99583 16.9553L3.33333 7.50033M17.5 5.00033H12.8125M12.8125 5.00033V3.33366C12.8125 2.89163 12.6369 2.46771 12.3243 2.15515C12.0118 1.84259 11.5879 1.66699 11.1458 1.66699H8.85417C8.41214 1.66699 7.98822 1.84259 7.67566 2.15515C7.36309 2.46771 7.1875 2.89163 7.1875 3.33366V5.00033M12.8125 5.00033H7.1875M2.5 5.00033H7.1875',
                  stroke: '#FF383C',
                  'stroke-width': '1.25',
                  'stroke-linecap': 'round',
                  'stroke-linejoin': 'round'
                })
              ]
            )
          ]
        )
      } else {
        // Upload icon — plain, no circle
        return h(
          'button',
          {
            type: 'button',
            onClick: (e: Event) => {
              e.stopPropagation()
              callbacks.onUploadPhoto(student)
            },
            class:
              'flex items-center justify-center cursor-pointer border-none bg-transparent p-0 mx-auto'
          },
          [
            h(
              'svg',
              {
                xmlns: 'http://www.w3.org/2000/svg',
                width: '24',
                height: '24',
                viewBox: '0 0 24 24',
                fill: 'none'
              },
              [
                h('path', {
                  d: 'M12 12.5274L15.8187 16.3452L14.5452 17.6187L12.9 15.9735V21H11.1V15.9717L9.45479 17.6187L8.18129 16.3452L12 12.5274ZM12 3C13.5453 3.00007 15.0366 3.568 16.1906 4.59581C17.3445 5.62361 18.0805 7.03962 18.2586 8.5746C19.3784 8.87998 20.3553 9.56919 21.0186 10.5218C21.6818 11.4744 21.9892 12.6297 21.887 13.786C21.7849 14.9422 21.2796 16.0257 20.4596 16.8472C19.6396 17.6687 18.5569 18.1759 17.4009 18.2802V16.4676C17.815 16.4085 18.2133 16.2674 18.5723 16.0527C18.9314 15.8379 19.244 15.5539 19.4921 15.217C19.7402 14.8801 19.9186 14.4972 20.0171 14.0906C20.1155 13.6839 20.132 13.2618 20.0655 12.8488C19.9991 12.4357 19.851 12.0401 19.6299 11.6849C19.4089 11.3297 19.1193 11.0221 18.7781 10.78C18.4369 10.538 18.0508 10.3663 17.6425 10.2751C17.2343 10.1838 16.8119 10.1748 16.4001 10.2486C16.541 9.5924 16.5334 8.91297 16.3778 8.2601C16.2222 7.60722 15.9224 6.99743 15.5006 6.47538C15.0788 5.95333 14.5455 5.53225 13.9399 5.24298C13.3343 4.9537 12.6716 4.80357 12.0004 4.80357C11.3293 4.80357 10.6666 4.9537 10.061 5.24298C9.45533 5.53225 8.92207 5.95333 8.50025 6.47538C8.07843 6.99743 7.77873 7.60722 7.62309 8.2601C7.46746 8.91297 7.45984 9.5924 7.60079 10.2486C6.77968 10.0944 5.93095 10.2727 5.2413 10.7443C4.55165 11.2159 4.07759 11.9421 3.92339 12.7632C3.76919 13.5843 3.9475 14.433 4.41908 15.1227C4.89065 15.8123 5.61688 16.2864 6.43799 16.4406L6.59999 16.4676V18.2802C5.4439 18.1761 4.36116 17.669 3.54101 16.8476C2.72087 16.0261 2.21548 14.9426 2.1132 13.7863C2.01091 12.6301 2.31822 11.4747 2.98142 10.522C3.64462 9.56934 4.62153 8.88005 5.74139 8.5746C5.91933 7.03954 6.65525 5.62342 7.80921 4.59558C8.96317 3.56774 10.4546 2.99988 12 3Z',
                  fill: '#A4A4A4'
                })
              ]
            )
          ]
        )
      }
    }
  },
  {
    accessorKey: 'schoolName',
    header: ({ column }) => {
      return h(DataTableColumnHeader, {
        column: column as any,
        title: i18n.global.t('school', 'Maktab'),
        notSortable: true
      })
    },
    cell: ({ row }) => {
      const name = row.original.schoolName
      if (!name) {
        return h(
          'span',
          {
            class: 'text-red-500 font-semibold text-sm whitespace-normal block'
          },
          '-'
        )
      }
      return h('span', { class: 'font-medium text-slate-800' }, name)
    }
  },
  {
    accessorKey: 'className',
    header: ({ column }) => {
      return h(DataTableColumnHeader, {
        column: column as any,
        title: i18n.global.t('sinf', 'Sinf'),
        notSortable: true
      })
    },
    cell: ({ row }) => {
      const name = row.original.className
      if (!name) {
        return h('span', { class: 'text-gray-400 text-sm' }, '-')
      }
      return h('span', { class: 'font-medium text-slate-800' }, name)
    }
  },
  {
    accessorKey: 'phoneNumber',
    header: ({ column }) => {
      return h(DataTableColumnHeader, {
        column: column as any,
        title: i18n.global.t('phoneNumber', 'Telefon raqam'),
        notSortable: true
      })
    },
    cell: ({ row }) => {
      const num = row.original.phoneNumber
      return h('span', { class: 'font-medium text-slate-700' }, num || '-')
    }
  },
  {
    id: 'parent_name',
    header: ({ column }) => {
      return h(DataTableColumnHeader, {
        column: column as any,
        title: i18n.global.t('parent_label', 'Ota yoki Ona'),
        notSortable: true
      })
    },
    cell: ({ row }) => {
      const parents = row.original.parents || []
      const parent = parents[0]
      if (!parent) return h('span', { class: 'text-red-500 font-semibold' }, '-')
      const parentFullName = `${parent.lastName || ''} ${parent.firstName || ''}`.trim()
      return h('span', { class: 'font-medium text-slate-800' }, parentFullName)
    }
  },
  {
    id: 'region_city',
    header: ({ column }) => {
      return h(DataTableColumnHeader, {
        column: column as any,
        title: i18n.global.t('region_city', 'Viloyat/Tuman'),
        notSortable: true
      })
    },
    cell: ({ row }) => {
      const student = row.original
      const regionName = student.region?.name
      const cityName = student.city?.name
      if (!regionName && !cityName) {
        return h(
          'span',
          {
            class: 'text-red-500 font-semibold text-xs whitespace-normal block'
          },
          '-'
        )
      }

      const children: any[] = []
      if (regionName) {
        children.push(h('span', regionName + (cityName ? ',' : '')))
      }
      if (regionName && cityName) {
        children.push(h('br'))
      }
      if (cityName) {
        children.push(h('span', cityName))
      }

      return h('div', { class: 'font-medium text-slate-800 text-left leading-normal' }, children)
    }
  },
  {
    accessorKey: 'status',
    header: ({ column }) =>
      h(DataTableColumnHeader, {
        column: column as any,
        title: i18n.global.t('status', 'Holat'),
        notSortable: true
      }),
    cell: ({ row }) => {
      return h(EntityStatusBadge, { status: row.original.status })
    }
  },
  {
    id: 'actions',
    size: 120,
    minSize: 120,
    header: ({ column }) =>
      h(DataTableColumnHeader, {
        column: column as any,
        title: i18n.global.t('actions'),
        notSortable: true
      }),
    cell: ({ row }) => {
      return h(RowActions, { student: row.original })
    }
  }
]
