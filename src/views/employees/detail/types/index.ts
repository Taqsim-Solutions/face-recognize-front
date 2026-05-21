import type { EmployeeModel } from '../../types'

export type GetEmployeeByIdParams = { id: string }

export type GetEmployeeByIdResponse = {
  isSuccess: boolean
  error: {
    code?: string
    message?: string
    errors?: string[]
  }
  data: EmployeeModel
}

export type GetEmployeeSalaryParams = { id: string }

export type GetEmployeeSalaryResponse = {
  isSuccess: boolean
  error: {
    code: string
    message: string
    errors: string[]
  }
  data: EmployeeSalaryModel
}

export type SalaryPeriod = {
  dailySalary: number
  workingDays: number
  percent: number
  periodType: 'beforeAdvance' | 'afterAdvance'
}

export type SalaryPeriodsInfo = {
  salaryPeriods: SalaryPeriod[]
  isAdvance: boolean
}

export type EmployeeSalaryModel = {
  workingDaysInMonth: number
  salaryPerDay: number
  workedDaysToToday: number
  dailySalaryLimit: number
  earnedSalary: number
  enableSalary: number
  paidSalary: number
  requestedSalary: number
  salaryPeriods?: SalaryPeriodsInfo
}

export type DeleteEmployeePayload = { id: string }

export type DeleteEmployeeResponse = {
  isSuccess: boolean
  error: {
    code: string
    message: string
    errors: string[]
  }
  data: EmployeeModel
}
