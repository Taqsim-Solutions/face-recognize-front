export type OrganizationModelResponse = {
  isSuccess: boolean
  error: Error
  data: OrganizationModel
}

export type IntegratorApiKeysResponse = {
  isSuccess: boolean
  error: Error
  data: {
    id: string
    createdAt: string
    organizationId: string
    name: string
    isActive: boolean
  }[]
}

export type ICamera = {
  data: {
    id: number
    updatedAt: string
    createdAt: string
    updatedBy: number
    organizationId: string
    name: string
    url: string
    username: string
    direction: string
    isActive: boolean
  }[]
  isSuccess: boolean
  error: Error
}

export type OrganizationModel = {
  id: string
  upperId?: string
  name?: string
  registeredAt?: Date
  phone?: string
  status: OrganizationStatus
  tin?: string
  thsht?: number
  dbibt?: string
  ifut?: number
  locales?: Locale[]
  bankAccounts?: BankAccount[]
}
export interface OrganizationQrCodeResponse {
  data: {
    qrCodeGenerateMode: 'forever' | 'temporary'
    qrCodeBase64: string
    updatedAt: string
  }
  isSuccess: boolean
}

export type OrganizationStatus = 'undefined' | 'active' | 'ended'

export type BankAccount = {
  id: string
  organizationId: string
  account?: string
  bankId: number
  bankFilialId: number
  isActive: boolean
  isMain: boolean
  createdAt: Date
  updatedAt: Date
  accountBalance: BankAccountBalanceModel
}

export type BankAccountBalanceModel = {
  uzcardBalance: number
  humoBalance: number
  updatedAt?: Date
}

export type Locale = {
  orgId: string
  localeKey?: string
  title?: string
  logoSrc?: string
  executive?: string
  accountant?: string
  address?: string
  description?: string
  content?: string
}

export type Error = {
  code?: string
  message?: string
  errors?: string[]
}

export type OrganizationSalaryResponse = {
  isSuccess: boolean
  error: Error
  data: OrganizationSalaryModel
}

export type OrganizationSalaryModel = {
  weekends?: WeekendsModel[]
  balanceLimit?: number
  advancePercent: number
  personalIncomeTax: string
  latitude?: number
  longitude?: number
  locationRadius?: number
  dayShiftWorkStartTime?: string
  dayShiftWorkEndTime?: string
  eveningShiftWorkStartTime?: string
  eveningShiftWorkEndTime?: string
  qrCodeGenerateMode: QRCodeGenerateMode
  salaryDay: SalaryDayModel
  advanceDay: SalaryDayModel
  dailySalaryRequestLimit: number
}

export enum PersonalIncomeTaxEnum {
  none = 'none', // 0.00%
  twelvePercent = 'twelvePercent', // 12.00%
  sevenPointFivePercent = 'sevenPointFivePercent' // 7.50%
}

export type WeekendsModel =
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'

export type QRCodeGenerateMode = 'forever' | 'daily' | 'hourly' | 'minutely' | 'afterOneUse'

export type SalaryDayModel =
  | 'lastDay'
  | 'day1'
  | 'day2'
  | 'day3'
  | 'day4'
  | 'day5'
  | 'day6'
  | 'day7'
  | 'day8'
  | 'day9'
  | 'day10'
  | 'day11'
  | 'day12'
  | 'day13'
  | 'day14'
  | 'day15'
  | 'day16'
  | 'day17'
  | 'day18'
  | 'day19'
  | 'day20'
  | 'day21'
  | 'day22'
  | 'day23'
  | 'day24'
  | 'day25'
  | 'day26'
  | 'day27'
  | 'day28'

export type OrganizationLeaveOptionsResponse = {
  isSuccess: boolean
  error: Error
  data: OrganizationLeaveOptionsModel
}

export type OrganizationLeaveOptionsModel = {
  annualLeave: number
  sickLeave: number
  maternityLeave: number
  businessTrip: number
  unpaidLeave: number
}

export interface DayOff {
  id: number
  organizationId: string
  date: string
  description: string
}

export interface DaysOffResponse {
  isSuccess: boolean
  error: Error
  data: DayOff[]
}

export interface DayOffResponse {
  isSuccess: boolean
  error: Error
  data: DayOff
}

export type CameraEmployee = {
  id: number
  updatedAt: string
  createdAt: string
  acsCameraId: number
  acsCamera: {
    id: number
    organizationId: string
    name: string
    url: string
    username: string
    shortSerialNumber: string
  }
  employeeId: string
  employeeNo: string
}

export type CameraEmployeesResponse = {
  isSuccess: boolean
  error: Error
  data: CameraEmployee[]
}

export type TelegramConnectGroupResponse = {
  isSuccess: boolean
  error: Error
  data: {
    code: string
    botLink: string
    command: string
    expiresAtUtc: string
  }
}

export type PendingChangeStatus = 'pending' | 'approved' | 'rejected'
export type PendingChangeEntityType = 'employee' | 'employeeBonus' | 'employeeLeave'
export type PendingChangeActionType = 'create' | 'update'

export interface PendingChange {
  id: string
  organizationId: string
  entityType: PendingChangeEntityType
  actionType: PendingChangeActionType
  entityId: string | null
  payload: string
  status: PendingChangeStatus
  createdAt: string
  reviewedAt: string | null
  reviewNote: string | null
}

export interface PendingChangesResponse {
  isSuccess: boolean
  error: Error
  data: PendingChange[]
}

export interface PendingChangeResponse {
  isSuccess: boolean
  error: Error
  data: PendingChange
}
