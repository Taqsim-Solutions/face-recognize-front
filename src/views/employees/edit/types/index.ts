import type { EmployeeStatus } from '../../types/index'

export type EmployeeUpdatePayload = {
  status: EmployeeStatus
  comment?: string
  grossSalary?: number
  percentAllowed?: number
  cardNumbers?: string[]
  phoneNumber: string
  fte?: number
  contractType: 'staff' | 'gph'
}
