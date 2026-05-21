import { Error } from '@/global-types'
import { ApiError } from '@/views/employees/types'

export type EposTermimalModal = {
  id: number
  eposTerminalId: number
  eposTerminal: {
    id: number
    paymentMethodId: number
    paymentMethod: {
      id: number
      paymentProviderId: number
      provider: string
      status: string
      paymentBank: {
        id: number
        name: string
      }
    }
    status: string
    name: string
    terminalId: string
    merchantId: string
  }
  organizationId: string
  organization: {
    id: string
    name: string
  }
  createdAt: string
  updatedAt: string
  createdBy: number
  updatedBy: number
  balance: number
  credit: number
  debit: number
  comment: string
  status: string
  isOwner: boolean
}

export type EposTerminalTransactionModel = {
  id: string
  eposTerminalId: number
  createdAt: string
  terminalId: string
  merchantId: string
  amount: number
  transactionId: string
  refNum: string
  ext: string
}

export type PaymentRequestStat = {
  totalCount: number
  paidTotalCount: number
  inProccessTotalCount: number
  canceledTotalCount: number
  totalAmount: number
  paidRequestsTotalAmount: number
  inProccessTotalAmount: number
  canceledTotalAmount: number
}

export type EmployeeStat = {
  totalCount: number
  activeEmployeesCount: number
}

export type PaymentRequestsPerMonthStat = {
  months: PaymentRequestsPerMonthStatItem[]
}

export type PaymentRequestsPerMonthStatResult = {
  isSuccess: boolean
  error: Error
  data: PaymentRequestsPerMonthStat
}

export type PaymentRequestsPerMonthStatItem = {
  month: string
  totalPaidRequestsAmount: number
}

export type PaymentRequestsStatResult = {
  isSuccess: boolean
  error: Error
  data: PaymentRequestStat
}

export interface IEmployeeAttendance {
  employee: {
    id: string
    organizationId: string
    userId: number
    comment: string
    user: {
      id: number
      firstName: string
      lastName: string
      phoneNumber: string
      organization: {
        id: string
        name: string
      }
    }
    status: string
  }
  attendance: {
    date: string
    attendance: {
      id: string
      employeeId: string
      createdAt: string
      date: string
      status: string
      checkInTime: string
      checkOutTime: string
      tardinessReason: string
      hoursWorked: number
      isLate?: boolean
      dayShiftWorkStartTime?: string
      states: {
        createdAt: string
        status: string
        comment: string
      }
    }[] | null
    leave: {
      type: string
      startDate: string
      endDate: string
      reason?: string
    } | null
  }
}

export type AttendanceByDateResponse = {
  error: Error
  data: IEmployeeAttendance[]
}

export interface FetchEmployeeAttendanceParams {
  employeeId?: string
  organizationId?: string
  date?: string
  isUserRegistered?: boolean | null
  status?: 'none' | 'worked' | 'absent' | 'workFromHome' | 'businessTrip' | 'sickLeave' | 'vacation'
  note?:
  | 'none'
  | 'onTimeArrival'
  | 'lateArrival'
  | 'earlyCome'
  | 'leftOnTime'
  | 'leftEarly'
  | 'leftLate'
  search?: string
  size?: number
  page?: number
  isAll?: boolean
  orderBy?: string
  order?: 'asc' | 'desc'
}

export type AttendanceStatsResponse = {
  isSuccess: boolean
  error: Error
  data: {
    activeEmployeesCount: number
    workedCount: number
    atWorkCount: number
    absentCount: number
    lateCount: number
    employeeLeaveStats: [
      {
        leaveType: string
        count: number
      }
    ]
  }
}

export type EmployeesStatResult = {
  isSuccess: boolean
  error: Error
  data: EmployeeStat
}

export type SalaryStatsResponse = {
  isSuccess: boolean
  error: Error
  data: {
    totalSalary: number
    totalAdvance: number
  }
}

export type OrgBalanceResponse = {
  isSuccess: boolean
  error: Error
  data: {
    balance: number
    givenSalaryRequest: number
    totalIncome: number
    totalBalance: number
  }
}

export type SalariesPerMonth = {
  isSuccess: boolean
  error: Error
  data: {
    months: {
      month: '2025-06-24'
      currentYearAmount: number
      previousYearAmount: number
    }[]
  }
}

export type FetchEmployeesParams = {
  organizationId?: string
  fromCreatedAt?: string
  toCreatedAt?: string
  userId?: number
  size: number
  page: number
  isAll?: boolean
  orderBy?: string
  order?: 'asc' | 'desc'
}

export type FetchEposTerminalsParams = {
  terminalId?: string
  merchantId?: string
  transactionId?: string
  size: number
  page: number
  isAll?: boolean
  orderBy?: string
  order?: 'asc' | 'desc'
}

export type FetchEposTerminalTransactionParams = {
  organizationId?: string
  size: number
  page: number
  isAll?: boolean
  orderBy?: string
  order?: 'asc' | 'desc'
}

export type EposTerminalModelIEnumerableResult = {
  isSuccess: boolean
  error: ApiError
  data?: EposTermimalModal[]
}

export type EposTerminalTransactionsModelIEnumerableResult = {
  isSuccess: boolean
  error: ApiError
  data?: EposTerminalTransactionModel[]
}
