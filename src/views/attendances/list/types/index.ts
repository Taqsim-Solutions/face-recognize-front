import { EmployeeModel } from '@/views/users/types'

export type AttendanceTableData = { id: string; employeeNumber: string; fio: string;[key: string]: any }

export type Attendance = {
  id: string
  employeeId: string
  createdAt: string
  date?: string
  status: AttendancesStatus
  checkInTime?: string
  checkOutTime?: string
  tardinessReason?: string
  hoursWorked: number
  notAttended?: boolean
  allDayAttendances?: Attendance[]
  employee?: EmployeeModel
  hoursWorkedFormatted: string
}

export type AttendancesFetchParams = {
  employeeId?: string
  organizationId?: string
  fromDate?: string
  toDate?: string
  date?: string
  status?: AttendancesStatus
  note?: AttendancesNotes
  orderBy?: string
  order?: 'asc' | 'desc'
  size: number
  page: number
  isAll?: boolean
  search?: string
}

export type Leave = {
  id: string
  employeeId: string
  startDate: string
  endDate: string
  reason: string
  type: string
}

export type AttendanceFetchResponse = {
  employee: EmployeeModel
  attendances: {
    date: string
    attendance: Attendance[] | null
    leave: Leave | null
  }[]
}

export type AttendancesStatus =
  | 'none'
  | 'worked'
  | 'absent'
  | 'workFromHome'
  | 'businessTrip'
  | 'sickLeave'
  | 'vacation'

export type AttendancesNotes =
  | 'none'
  | 'onTimeArrival'
  | 'lateArrival'
  | 'earlyCome'
  | 'leftOnTime'
  | 'leftEarly'
  | 'leftLate'
