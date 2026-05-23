import type { ColumnDef } from '@tanstack/vue-table'
import i18n from '@/i18n'
import { h } from 'vue'
import DataTableColumnHeader from '@/views/users/list/modules/DataTableColumnHeader.vue'
import RowActions from './RowActions.vue'
import type { TeacherModel } from '../types'

export const createColumns = (): ColumnDef<TeacherModel>[] => [
  {
    accessorKey: 'lastName',
    header: ({ column }) => {
      return h(DataTableColumnHeader, {
        column: column as any,
        title: i18n.global.t('full_name'),
        notSortable: true
      })
    },
    cell: ({ row }) => {
      const teacher = row.original
      const lastName = teacher.lastName || ''
      const firstName = teacher.firstName || ''
      const fullName = `${lastName} ${firstName}`.trim()

      const initials = ((lastName[0] || '') + (firstName[0] || '')).toUpperCase() || 'T'

      // Profile image or initials avatar using mainImageName from API
      const avatarUrl = teacher.mainImageName
        ? `/api/images?filename=${teacher.mainImageName}`
        : null

      const avatarChild = avatarUrl
        ? h('img', {
            src: avatarUrl,
            class: 'w-8 h-8 rounded-full object-cover',
            onError: (e: Event) => {
              // On error, fallback to initials
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

      return h('div', { class: 'flex items-center gap-3' }, [
        h('div', { class: 'relative w-8 h-8 shrink-0' }, [avatarChild, initialsAvatar]),
        h('span', { class: 'font-semibold text-[#1b1b1b] truncate max-w-[200px]' }, fullName)
      ])
    }
  },
  {
    accessorKey: 'schoolName',
    header: ({ column }) => {
      return h(DataTableColumnHeader, {
        column: column as any,
        title: i18n.global.t('school'),
        notSortable: true
      })
    },
    cell: ({ row }) => {
      const name = row.original.schoolName
      if (!name) {
        return h(
          'span',
          {
            class:
              'text-red-500 font-semibold text-sm whitespace-normal block max-w-[110px] leading-tight'
          },
          i18n.global.t('unassigned-school')
        )
      }
      return h('span', { class: 'font-medium text-slate-800' }, name)
    }
  },
  {
    id: 'class',
    size: 180,
    minSize: 180,
    header: ({ column }) => {
      return h(DataTableColumnHeader, {
        column: column as any,
        title: i18n.global.t('sinf', 'Sinf'),
        notSortable: true
      })
    },
    cell: ({ row }) => {
      const cls = row.original.class
      if (!cls || !cls.degree) {
        return h(
          'span',
          {
            class:
              'text-red-500 font-semibold text-sm whitespace-normal block max-w-[110px] leading-tight'
          },
          i18n.global.t('unassigned-school')
        )
      }
      const label = `${cls.degree}-${cls.symbol}`
      return h('span', { class: 'font-medium text-slate-800' }, label)
    }
  },
  {
    accessorKey: 'email',
    header: ({ column }) => {
      return h(DataTableColumnHeader, {
        column: column as any,
        title: i18n.global.t('email'),
        notSortable: true
      })
    },
    cell: ({ row }) =>
      h(
        'span',
        { class: 'font-medium text-slate-700' },
        row.getValue('email') || h('span', { class: 'text-gray-400' }, '-')
      )
  },
  {
    accessorKey: 'login',
    header: ({ column }) => {
      return h(DataTableColumnHeader, {
        column: column as any,
        title: i18n.global.t('login'),
        notSortable: true
      })
    },
    cell: ({ row }) =>
      h(
        'span',
        { class: 'font-medium text-slate-700' },
        row.getValue('login') || h('span', { class: 'text-gray-400' }, '-')
      )
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
      const teacher = row.original
      const regionName = teacher.region?.name
      const cityName = teacher.city?.name
      if (!regionName && !cityName) {
        return h(
          'span',
          {
            class:
              'text-red-500 font-semibold text-xs whitespace-normal block max-w-[110px] leading-tight'
          },
          i18n.global.t('unassigned-school')
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
      return h(RowActions, { teacher: row.original })
    }
  }
]
