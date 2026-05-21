import type { Identifier, EmployeeStatus, ApiError, EmployeeModel } from '../../types'

export type CreateEmployeeModel = {
  cardNumbers?: string[] | null
  identifiers?: Identifier[] | null
  status: EmployeeStatus
  comment?: string | null
  salary: number
  percentAllowed: number
  fte: number
  contractType: 'staff' | 'gph'
}

export type EmployeeModelResult = {
  isSuccess: boolean
  error: ApiError
  data: EmployeeModel
}
