import type { Error } from '@/global-types'

export type NotificationType = 
  | 'other'
  | 'warningNewDevice'
  | 'enterCheckInTime'
  | 'enterCheckOutTime'
  | 'enterTardnessReason'
  | 'infoCurrentDayWork'
  | 'organizationMinBalance'
  | 'salaryRequestPaid'
  | 'salaryRequestFail'
  | 'checkedIn'
  | 'checkedOut'
  | 'depositConfirmation'
  | 'employeeStatusChange'
  | 'employeeSalaryChange'

export type NotificationTemplateState = 'created' | 'active' | 'disabled'

export interface NotificationTemplateLocale {
  localeKey: string
  title: string
  message: string
}

export interface NotificationTemplate {
  id: number
  type: NotificationType
  locales: NotificationTemplateLocale[]
  requiredArguments: Record<string, string>
  urls: string[]
  updatedAt: string
  createdAt: string
  state: NotificationTemplateState
}

export interface GetNotificationTemplatesParams {
  type?: NotificationType
  size?: number
  page?: number
  isAll?: boolean
  orderBy?: string
  order?: 'asc' | 'desc'
}

export interface CreateNotificationTemplateRequest {
  type: NotificationType
  locales: NotificationTemplateLocale[]
  requiredArguments: Record<string, string>
}

export interface UpdateNotificationTemplateRequest {
  locales: NotificationTemplateLocale[]
  requiredArguments: Record<string, string>
}

export interface NotificationTemplateListResponse {
  isSuccess: boolean
  error: Error
  data: NotificationTemplate[]
}

export interface NotificationTemplateResponse {
  isSuccess: boolean
  error: Error
  data: NotificationTemplate
}

export interface PushStat {
  push: string
  count: number
}

export interface NotificationDashboardItem {
  id: string
  createdAt: string
  template: NotificationTemplate
  arguments: Record<string, string>
  receiversCount: number
  pushStat: PushStat[]
}

export interface GetNotificationDashboardParams {
  templateId?: number
  fromCreatedAt?: string
  toCreatedAt?: string
  type?: NotificationType
  size?: number
  page?: number
  isAll?: boolean
  orderBy?: string
  order?: 'asc' | 'desc'
}

export interface InitializeNotificationRequest {
  templateId: number
  arguments: Record<string, string>
  receiverIds: string[]
}

export interface InitializeNotificationEmployeesRequest {
  templateId: number
  arguments: Record<string, string>
  departmentId?: string
}

export interface NotificationDashboardResponse {
  isSuccess: boolean
  error: Error
  data: NotificationDashboardItem[]
}

export interface NotificationReceiverUser {
  id: number
  phoneNumber: string
  firstName: string
  lastName: string
}

export interface NotificationReceiver {
  id: string
  user: NotificationReceiverUser
  notificationId: string
  isRead: boolean
  readDate: string | null
  push: string
}

export interface GetNotificationReceiversParams {
  userId?: number
  notificationId?: string
  push?: string
  isRead?: boolean
  size?: number
  page?: number
  isAll?: boolean
  orderBy?: string
  order?: 'asc' | 'desc'
}

export interface NotificationReceiversResponse {
  isSuccess: boolean
  error: Error
  data: NotificationReceiver[]
}

export interface NotificationDetailsResponse {
  isSuccess: boolean
  error: Error
  data: NotificationDashboardItem
}

