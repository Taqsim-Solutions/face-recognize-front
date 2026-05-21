export type RequestsResponse = {
  data: RequestsModel[]
  isSuccess: boolean
}

export type RequestsModel = {
  amount?: number
  card: string
  comment?: string
  createdAt: string
  employee: {
    id: string
    organization: {
      id: string
      name: string
    }
    user: {
      firstName?: string
      id: number
      lastName?: string
      phoneNumber?: string
    }
  }
  employeeSalaryPaymentId?: string
  id: string
  status: RequestsStatus
  commissionCalculationType?: string
  provider?: string
  salarySourceType?: string
}

export type RequestsStatus = 'paid' | 'paymentInProgress' | 'paymentCanceled' | 'failed'

export type RequestsFetchParams = {
  employeeId?: string
  fromCreatedAt?: string
  toCreatedAt?: string
  size: number
  page: number
  isAll?: boolean
  orderBy?: string
  order?: 'asc' | 'desc'
}
