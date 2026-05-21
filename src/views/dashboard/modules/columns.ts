import type { ColumnDef } from '@tanstack/vue-table'
import type { IEmployeeAttendance } from '../type'
import i18n from '@/i18n'
import { h, computed, type ComputedRef } from 'vue'
import { useGetOrganizationOptions } from '../../organization-settings/query/useGetOrganizationOptions'

function formatTime(timeStr: string): string {
  if (!timeStr) return '-'
  const date = new Date(timeStr)
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const useColumns = (): ComputedRef<ColumnDef<IEmployeeAttendance>[]> => {
  const { data: optionsData } = useGetOrganizationOptions()

  const requiredWorkingHours = computed(() => {
    const startTime = optionsData.value?.data?.data?.dayShiftWorkStartTime || '09:00'
    const endTime = optionsData.value?.data?.data?.dayShiftWorkEndTime || '18:00'
    const [startHH, startMM] = startTime.split(':').map(Number)
    const [endHH, endMM] = endTime.split(':').map(Number)
    
    let diff = (endHH * 60 + (endMM || 0)) - (startHH * 60 + (startMM || 0))
    if (diff < 0) diff += 24 * 60
    return diff / 60
  })

  return computed(() => [
  {
    id: 'rowNumber',
    header: i18n.global.t('numero-symbol'),
    cell: ({ row }) => h('div', {}, row.index + 1)
  },
  {
    id: 'employee',
    header: i18n.global.t('employee'),
    cell: ({ row }) => {
      const user = row.original.employee.user
      return user
        ? h('div', {}, `${user.lastName} ${user.firstName}`)
        : row.original.employee.comment
          ? h('div', {}, row.original.employee.comment)
          : h('div', { class: 'italic text-gray-400' }, i18n.global.t('no-data'))
    }
  },
  {
    id: 'status',
    header: i18n.global.t('status'),
    cell: ({ row }) => {
      const attendanceWrapper = row.original.attendance
      const attendanceList = attendanceWrapper.attendance
      const firstAttendance = attendanceList?.[0]
      let badgesData: { type: string, extraText?: string }[] = []
      let baseStatus = firstAttendance?.status || 'absent'

      if (firstAttendance?.checkInTime) {
        badgesData.push({ type: 'worked' })
        
        const startTime = optionsData.value?.data?.data?.dayShiftWorkStartTime || firstAttendance?.dayShiftWorkStartTime || '09:00'
        const [shiftHH, shiftMM] = startTime.split(':').map(Number)
        const checkInDate = new Date(firstAttendance.checkInTime)
        
        // Use local time for comparison with settings
        let lateDiff = (checkInDate.getHours() * 60 + checkInDate.getMinutes()) - (shiftHH * 60 + shiftMM)

        // If it's more than 0 minutes late, show late badge
        const isLate = lateDiff > 0
        
        if (isLate) {
          const lateHours = Math.floor(lateDiff / 60)
          const lateMins = lateDiff % 60
          const extraText = ` (${String(lateHours).padStart(2, '0')}:${String(lateMins).padStart(2, '0')})`
          badgesData.push({ type: 'late', extraText })
        }
      } else {
        badgesData.push({ type: baseStatus })
      }

      if (attendanceWrapper.leave) {
        const type = attendanceWrapper.leave.type || ''
        const normalizedType = type.charAt(0).toUpperCase() + type.slice(1)
        const label = type ? i18n.global.t(`leave-types.${normalizedType}`) : ''

        return h(
          'div',
          {
            class:
              'bg-[#F2F4F7] border border-[#D0D5DD] text-[#344054] py-1.5 text-sm px-3 rounded-full flex items-center gap-2 w-fit'
          },
          [
            h(
              'svg',
              {
                xmlns: 'http://www.w3.org/2000/svg',
                viewBox: '0 0 24 24',
                fill: 'none',
                stroke: 'currentColor',
                'stroke-width': '2',
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round',
                class: 'w-[14px] h-[14px]'
              },
              [
                h('rect', { x: '3', y: '4', width: '18', height: '18', rx: '2', ry: '2' }),
                h('line', { x1: '16', y1: '2', x2: '16', y2: '6' }),
                h('line', { x1: '8', y1: '2', x2: '8', y2: '6' }),
                h('line', { x1: '3', y1: '10', x2: '21', y2: '10' })
              ]
            ),
            h('span', { innerHTML: label })
          ]
        )
      }

      const map: Record<string, string> = {
        present:
          'bg-[#EBF9F4] border border-[#7AD9B7] text-[#38C793] py-1.5 text-sm px-3 rounded-full flex items-center gap-2 w-fit',
        worked:
          'bg-[#EBF9F4] border border-[#7AD9B7] text-[#38C793] py-1.5 text-sm px-3 rounded-full flex items-center gap-2 w-fit',
        absent:
          'bg-[#FCE8EC] border border-[#EA6780] text-[#DF1C41] py-1.5 text-sm px-3 rounded-full flex items-center gap-2 w-fit',
        late: 'bg-[#FFF9E5] border border-[#F7D25B] text-[#C9971B] py-1.5 text-sm px-3 rounded-full flex items-center gap-2 w-fit',
        workFromHome:
          'bg-[#E8F1FF] border border-[#A3C6FF] text-[#3D73F1] py-1.5 text-sm px-3 rounded-full flex items-center gap-2 w-fit',
        businessTrip:
          'bg-[#ECEAFF] border border-[#B2A6FF] text-[#6A55F2] py-1.5 text-sm px-3 rounded-full flex items-center gap-2 w-fit',
        sickLeave:
          'bg-[#FFF4E8] border border-[#FFC58F] text-[#FF8A00] py-1.5 text-sm px-3 rounded-full flex items-center gap-2 w-fit',
        vacation:
          'bg-[#F3E8FF] border border-[#D6A6FF] text-[#9B5DE5] py-1.5 text-sm px-3 rounded-full flex items-center gap-2 w-fit'
      }

      const icons: Record<string, ReturnType<typeof h>> = {
        absent: h(
          'svg',
          {
            xmlns: 'http://www.w3.org/2000/svg',
            width: '10',
            height: '10',
            viewBox: '0 0 10 10',
            fill: 'none'
          },
          [
            h('path', {
              'fill-rule': 'evenodd',
              'clip-rule': 'evenodd',
              d: 'M8.09355 8.97743C8.33763 9.2215 8.73336 9.2215 8.97743 8.97743C9.22151 8.73335 9.22151 8.33762 8.97743 8.09354L5.88386 4.99996L8.97743 1.90639C9.2215 1.66232 9.2215 1.26659 8.97743 1.02251C8.73335 0.778434 8.33762 0.778434 8.09354 1.02251L4.99997 4.11608L1.90637 1.02247C1.66229 0.778397 1.26656 0.778397 1.02248 1.02247C0.778404 1.26655 0.778404 1.66228 1.02248 1.90636L4.11609 4.99996L1.02247 8.09358C0.778397 8.33766 0.778397 8.73338 1.02247 8.97746C1.26655 9.22154 1.66228 9.22154 1.90636 8.97746L4.99997 5.88385L8.09355 8.97743Z',
              fill: '#DF1C41'
            })
          ]
        ),
        present: h(
          'svg',
          {
            xmlns: 'http://www.w3.org/2000/svg',
            width: '16',
            height: '16',
            viewBox: '0 0 16 16',
            fill: 'none'
          },
          [
            h('path', {
              d: 'M2.66632 8.83301C3.67884 8.83301 4.50031 9.65447 4.50031 10.667C4.50013 11.6794 3.67873 12.5 2.66632 12.5C1.65406 12.4998 0.833489 11.6793 0.833313 10.667C0.833313 9.65458 1.65395 8.83319 2.66632 8.83301ZM14.6663 11.5C14.9425 11.5 15.1663 11.7239 15.1663 12C15.1663 12.2761 14.9425 12.5 14.6663 12.5H6.66632C6.39033 12.4998 6.16632 12.276 6.16632 12C6.16632 11.724 6.39033 11.5002 6.66632 11.5H14.6663ZM10.6663 8.83301C10.9424 8.83301 11.1661 9.05702 11.1663 9.33301C11.1663 9.60915 10.9425 9.83301 10.6663 9.83301H6.66632C6.39033 9.83283 6.16632 9.60904 6.16632 9.33301C6.1665 9.05713 6.39044 8.83319 6.66632 8.83301H10.6663ZM2.66632 3.5C3.67873 3.5 4.50013 4.32064 4.50031 5.33301C4.50031 6.34553 3.67884 7.16699 2.66632 7.16699C1.65395 7.16681 0.833313 6.34542 0.833313 5.33301C0.833489 4.32075 1.65406 3.50018 2.66632 3.5ZM14.6663 6.16699C14.9425 6.16699 15.1663 6.39085 15.1663 6.66699C15.1661 6.94298 14.9424 7.16699 14.6663 7.16699H6.66632C6.39044 7.16681 6.1665 6.94287 6.16632 6.66699C6.16632 6.39096 6.39033 6.16717 6.66632 6.16699H14.6663ZM10.6663 3.5C10.9425 3.5 11.1663 3.72386 11.1663 4C11.1663 4.27614 10.9425 4.5 10.6663 4.5H6.66632C6.39033 4.49982 6.16632 4.27603 6.16632 4C6.16632 3.72397 6.39033 3.50018 6.66632 3.5H10.6663Z',
              fill: '#38C793'
            })
          ]
        ),
        worked: h(
          'svg',
          {
            xmlns: 'http://www.w3.org/2000/svg',
            width: '16',
            height: '16',
            viewBox: '0 0 16 16',
            fill: 'none'
          },
          [
            h('path', {
              d: 'M2.66632 8.83301C3.67884 8.83301 4.50031 9.65447 4.50031 10.667C4.50013 11.6794 3.67873 12.5 2.66632 12.5C1.65406 12.4998 0.833489 11.6793 0.833313 10.667C0.833313 9.65458 1.65395 8.83319 2.66632 8.83301ZM14.6663 11.5C14.9425 11.5 15.1663 11.7239 15.1663 12C15.1663 12.2761 14.9425 12.5 14.6663 12.5H6.66632C6.39033 12.4998 6.16632 12.276 6.16632 12C6.16632 11.724 6.39033 11.5002 6.66632 11.5H14.6663ZM10.6663 8.83301C10.9424 8.83301 11.1661 9.05702 11.1663 9.33301C11.1663 9.60915 10.9425 9.83301 10.6663 9.83301H6.66632C6.39033 9.83283 6.16632 9.60904 6.16632 9.33301C6.1665 9.05713 6.39044 8.83319 6.66632 8.83301H10.6663ZM2.66632 3.5C3.67873 3.5 4.50013 4.32064 4.50031 5.33301C4.50031 6.34553 3.67884 7.16699 2.66632 7.16699C1.65395 7.16681 0.833313 6.34542 0.833313 5.33301C0.833489 4.32075 1.65406 3.50018 2.66632 3.5ZM14.6663 6.16699C14.9425 6.16699 15.1663 6.39085 15.1663 6.66699C15.1661 6.94298 14.9424 7.16699 14.6663 7.16699H6.66632C6.39044 7.16681 6.1665 6.94287 6.16632 6.66699C6.16632 6.39096 6.39033 6.16717 6.66632 6.16699H14.6663ZM10.6663 3.5C10.9425 3.5 11.1663 3.72386 11.1663 4C11.1663 4.27614 10.9425 4.5 10.6663 4.5H6.66632C6.39033 4.49982 6.16632 4.27603 6.16632 4C6.16632 3.72397 6.39033 3.50018 6.66632 3.5H10.6663Z',
              fill: '#38C793'
            })
          ]
        )
      }

      const badges = badgesData.map(b => {
        const color = map[b.type] || 'bg-gray-100 text-gray-600 flex items-center gap-2 w-fit rounded-full px-2 py-1'
        const icon = icons[b.type] || null
        const labelStr = i18n.global.t(b.type) + (b.extraText || '')
        return h('div', { class: color }, [icon, h('span', { innerHTML: labelStr })])
      })

      return h('div', { class: 'flex flex-wrap gap-2 items-center' }, badges)
    }
  },
  {
    id: 'checkIn',
    header: i18n.global.t('check-in'),
    cell: ({ row }) => {
      const attendanceList = row.original.attendance?.attendance
      const checkInTimes = attendanceList
        ?.map(a => a.checkInTime)
        .filter((t): t is string => Boolean(t))
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

      const checkIn = checkInTimes?.[0]

      return h(
        'div',
        { class: checkIn ? '' : 'text-gray-400' },
        checkIn ? formatTime(checkIn) : '-- : --'
      )
    }
  },
  {
    id: 'checkOut',
    header: i18n.global.t('check-out'),
    cell: ({ row }) => {
      const attendanceList = row.original.attendance?.attendance
      const checkOutTimes = attendanceList
        ?.map(a => a.checkOutTime)
        .filter((t): t is string => Boolean(t))
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

      const checkOut = checkOutTimes?.[0]

      return h(
        'div',
        { class: checkOut ? '' : 'text-gray-400' },
        checkOut ? formatTime(checkOut) : '-- : --'
      )
    }
  },
  {
    id: 'hoursWorked',
    header: i18n.global.t('hoursWorked'),
    cell: ({ row }) => {
      const attendanceList = row.original.attendance?.attendance

      if (!attendanceList || !attendanceList.length) {
        return h('div', { class: 'text-gray-400' }, '-- : --')
      }

      const unclosedAttendance = attendanceList.find(a => a.checkInTime && !a.checkOutTime)
      if (unclosedAttendance) {
        return h('div', { class: 'bg-[#FFF9E5] border border-[#F7D25B] text-[#C9971B] py-1 text-[13px] font-medium px-3 rounded-full w-fit whitespace-nowrap' }, i18n.global.t('no-checkout'))
      }

      const worked = attendanceList.reduce(
        (acc, curr) => acc + (curr.hoursWorked || 0),
        0
      )

      const hours = Math.floor(worked)
      const minutes = Math.round((worked - hours) * 60)
      const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`

      if (worked >= requiredWorkingHours.value) {
        return h('div', { class: 'flex items-center gap-2' }, [
          h('span', {}, timeStr),
          h('svg', {
            xmlns: 'http://www.w3.org/2000/svg',
            width: '16',
            height: '16',
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: '#12B76A', // green color
            'stroke-width': '3',
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round'
          }, [
            h('polyline', { points: '20 6 9 17 4 12' })
          ])
        ])
      }

      return h('div', {}, timeStr)
    }
  }
])
}
