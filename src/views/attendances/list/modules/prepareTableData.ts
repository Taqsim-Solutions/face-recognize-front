import i18n from '@/i18n'
import type { Attendance, AttendanceFetchResponse, Leave } from '../types'
import type { EmployeeModel } from '@/views/employees/types'

import { useDateFormat } from '@vueuse/core'

export type DayAttendance = {
  date: string
  checkInTime: string
  checkOutTime: string
  status: string
  tardinessReason: string
  hoursWorked: number
  notAttended?: boolean
  allDayAttendances?: Attendance[]
  employee?: EmployeeModel
  hoursWorkedFormatted: string
  leave?: Leave | null
  holidayDescription?: string
  isWeekend?: boolean
  isDayOff?: boolean
}

export let uniqueDates: Set<string> = new Set()

const sortByDesc = (arr: string[]) => {
  return arr.sort((a, b) => (a > b ? -1 : 1))
}

const getLocalDateString = (utcString: string | undefined, fallback: string) => {
  if (!utcString) return fallback
  const d = new Date(utcString)
  if (isNaN(d.getTime())) return fallback

  // Explicitly calculate for GMT+5 (Uzbekistan time)
  const gmt5Time = d.getTime() + (5 * 60 * 60 * 1000)
  const gmt5Date = new Date(gmt5Time)

  const yyyy = gmt5Date.getUTCFullYear()
  const mm = String(gmt5Date.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(gmt5Date.getUTCDate()).padStart(2, '0')

  return `${yyyy}-${mm}-${dd}`
}

export const prepareTableData = (originalData: AttendanceFetchResponse[]) => {
  uniqueDates.clear()

  // Clone data to avoid mutating Vue Query cache
  const data: AttendanceFetchResponse[] = JSON.parse(JSON.stringify(originalData))

  // Regroup attendances by local date instead of server provided date wrapper
  data.forEach((item) => {
    let regrouped: Record<string, {
      date: string
      attendance: Attendance[]
      leave: Leave | null
    }> = {}

    item.attendances.forEach(dayWrapper => {
      if (!regrouped[dayWrapper.date]) {
        regrouped[dayWrapper.date] = { date: dayWrapper.date, attendance: [], leave: dayWrapper.leave }
      } else if (dayWrapper.leave && !regrouped[dayWrapper.date].leave) {
        regrouped[dayWrapper.date].leave = dayWrapper.leave
      }

      if (dayWrapper.attendance && dayWrapper.attendance.length > 0) {
        dayWrapper.attendance.forEach(att => {
          const checkTime = att.checkInTime || att.checkOutTime
          const localDate = getLocalDateString(checkTime, dayWrapper.date)

          if (!regrouped[localDate]) {
            regrouped[localDate] = { date: localDate, attendance: [], leave: null }
          }
          regrouped[localDate].attendance.push({ ...att, date: localDate })
        })
      }
    })

    item.attendances = Object.values(regrouped).map(wrapper => ({
      ...wrapper,
      attendance: wrapper.attendance.length > 0 ? wrapper.attendance : null
    }))
  })

  data.forEach((item) => {
    if (item.attendances.length) {
      item.attendances.forEach((el) => {
        if (el.date) {
          uniqueDates.add(el.date)
        }
      })
    }
  })

  uniqueDates = new Set(sortByDesc(Array.from(uniqueDates)))

  let result: {
    id: string
    employeeNumber: string
    fio: string
    [key: string]: any
  }[] = []

  data.forEach((item) => {
    let formattedData: {
      [key: string]: DayAttendance
    } = {}

    uniqueDates.forEach((date) => {
      const dayWrapper = item.attendances.find(
        (wrapper) => wrapper.date === date
      )
      const attendanceList = dayWrapper?.attendance
      const leave = dayWrapper?.leave

      if (attendanceList && attendanceList.length) {
        const workedHoursBasedOnAllDayAttendances = attendanceList.reduce(
          (acc, curr) => acc + (curr.hoursWorked || 0),
          0
        )

        const formatWorkedHours = (hours: number) => {
          const wholeHours = Math.floor(hours)
          const minutes = Math.round((hours - wholeHours) * 60)
          return `${wholeHours}${i18n.global.t('hoursShort')} ${minutes
            .toString()
            .padStart(2, '0')}${i18n.global.t('minutesShort')}`
        }

        const checkInTimes = attendanceList
          .map((a) => a.checkInTime)
          .filter((t): t is string => !!t)
          .sort()

        const checkOutTimes = attendanceList
          .map((a) => a.checkOutTime)
          .filter((t): t is string => !!t)
          .sort()

        const earliestCheckInRaw = checkInTimes[0]
        const latestCheckOutRaw = checkOutTimes[checkOutTimes.length - 1]

        const earliestCheckIn = earliestCheckInRaw
          ? useDateFormat(earliestCheckInRaw, 'HH:mm').value
          : ''

        const latestCheckOut = latestCheckOutRaw
          ? useDateFormat(latestCheckOutRaw, 'HH:mm').value
          : ''

        const status = attendanceList[0].status
          ? `${attendanceList[0].status}`
          : ''
        const tardinessReason = attendanceList[0].tardinessReason || ''

        formattedData[date] = {
          checkInTime: earliestCheckIn,
          checkOutTime: latestCheckOut,
          status,
          tardinessReason,
          hoursWorked: workedHoursBasedOnAllDayAttendances,
          hoursWorkedFormatted: formatWorkedHours(
            workedHoursBasedOnAllDayAttendances
          ),
          allDayAttendances: attendanceList,
          employee: item.employee,
          date,
          leave
        }
      } else {
        formattedData[date] = {
          checkInTime: '',
          checkOutTime: '',
          status: 'absent',
          tardinessReason: '',
          hoursWorked: 0,
          hoursWorkedFormatted: '0:00',
          notAttended: true,
          allDayAttendances: [],
          employee: item.employee,
          date,
          leave: leave || null
        }
      }
    })

    result.push({
      id: item.employee.id,
      employeeNumber: (item.employee as any).employeeNumber,
      fio: item.employee.user
        ? `${item.employee.user.lastName} ${item.employee.user.firstName}`
        : '',
      hasCameras: !!(item.employee as any).acsCameras?.length,
      ...formattedData
    })
  })

  return result
}
