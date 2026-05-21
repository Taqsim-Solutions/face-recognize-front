import { ApiError } from '@/views/users/types'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

export type FetchEmployeeLeavesParams = {
  employeeId?: string
  fromCreatedAt?: string
  toCreatedAt?: string
  fromStartDate?: string
  toStartDate?: string
  fromEndDate?: string
  toEndDate?: string
  size: number
  page: number
  isAll?: boolean
  orderBy?: string
  order?: string
  type?: string
  search: string
}

export type EmployeeLeaveModel = {
  id: string
  employeeId: string
  employee: {
    id: string
    organizationId: string
    userId: number
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
    status: 'active' | 'inactive' | string
  }
  startDate: string
  endDate: string
  reason: string
  type: 'sick' | 'vacation' | 'other' | string
  createdAt?: string
  updatedAt?: string
  attachments: {
    id: string
    leaveId: string
    name: string
    filePath: string
    contentType: string
    fileSize: number
    createdAt: string
  }[]
}

export const leaveTypes = [
  { value: '0', label: t('leave-types.Other') },
  { value: '1', label: t('leave-types.AnnualLeave') },
  { value: '2', label: t('leave-types.SickLeave') },
  { value: '3', label: t('leave-types.MaternityLeave') },
  { value: '4', label: t('leave-types.PaternityLeave') },
  { value: '5', label: t('leave-types.PaidLeave') },
  { value: '6', label: t('leave-types.UnpaidLeave') },
  { value: '7', label: t('leave-types.BusinessTrip') }
]

export type CreateLeaveModel = {
  employeeId: string
  startDate: string
  endDate: string
  reason: string
  type: string
}

export type LeaveModelResult = {
  isSuccess: boolean
  error: ApiError
  data: {
    id: string
  }
}
