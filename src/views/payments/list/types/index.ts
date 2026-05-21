export type Payments = {
  employeeId: string
  amount: number
  createdAt: string
  paymentType: string
  user: User
  pinfl: string
  commission: number
  paymentNumber: number
  salaryRequest: {
    provider: string
  }
  card: {
    maskedNumber: string
    id: number
  }
}

type User = {
  id: number
  firstName: string
  lastName: string
  phoneNumber: string
  organization: SalaryPaymentOrganization
}

type SalaryPaymentOrganization = {
  id: string
  name: string
}

export type FetchPaymentsParams = {
  employeeId?: string
  fromAmount?: number
  toAmount?: number
  fromCreatedAt?: string
  toCreatedAt?: string
  paymentType?: 'byEmployeeRequest' | 'monthlySalary'
  page: number
  size?: number
  isAll?: boolean
  orderBy?: string
  order?: 'asc' | 'desc'
  search?: string
}

export type PayloadPayments = {
  employeeId: string
  amount: number
}

export type ApiError = {
  code?: string
  message?: string
  errors?: string[]
}

export type PaymentsModelIEnumerableResult = {
  isSuccess: boolean
  error: ApiError
  data?: Payments[]
}
