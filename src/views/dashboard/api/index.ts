import type {
  PaymentRequestsStatResult,
  EmployeesStatResult,
  PaymentRequestsPerMonthStatResult,
  FetchEposTerminalsParams,
  EposTerminalModelIEnumerableResult,
  FetchEposTerminalTransactionParams,
  EposTerminalTransactionsModelIEnumerableResult,
  AttendanceStatsResponse,
  AttendanceByDateResponse,
  FetchEmployeeAttendanceParams,
  SalaryStatsResponse,
  SalariesPerMonth,
  OrgBalanceResponse
} from '../type'
import api from '@/api'
const url = '/api/stats'

import type { AxiosResponse } from 'axios'

export const fetchPaymentRequestsStat = async (): Promise<
  AxiosResponse<PaymentRequestsStatResult>
> => {
  const response = await api(`${url}/payment-requests`)
  return response
}

export const fetchEmployeesStat = async (): Promise<AxiosResponse<EmployeesStatResult>> => {
  const response = await api(`${url}/employees`)
  return response
}

export const fetchPaymentRequestsPerMonthStat = async (): Promise<
  AxiosResponse<PaymentRequestsPerMonthStatResult>
> => {
  const response = await api(`${url}/payment-requests-per-month`)
  return response
}

export const fetchEposTerminals = async (params: FetchEposTerminalsParams) => {
  return await api<EposTerminalModelIEnumerableResult>('api/epos-terminals', { params })
}

export const fetchEposTerminalTransactions = async (
  terminalId: string,
  params: FetchEposTerminalTransactionParams
) => {
  return await api<EposTerminalTransactionsModelIEnumerableResult>(
    `/api/epos-terminals/${terminalId}/transactions`,
    { params }
  )
}

export const fetchAttendanceStats = async (): Promise<AxiosResponse<AttendanceStatsResponse>> => {
  const response = await api(`${url}/attendances`)
  return response
}

export const fetchSalaryStats = async (params?: {
  fromDate?: string
  toDate?: string
}): Promise<AxiosResponse<SalaryStatsResponse>> => {
  const response = await api.get('/api/stats/employee-salary', { params })
  return response.data
}

export const fetchOrgBalance = async (params: {
  fromDate: string | null
  toDate: string | null
}): Promise<AxiosResponse<OrgBalanceResponse>> => {
  const response = await api.get('/api/stats/organization-balance', {
    params
  })
  return response
}

export const fetchPaymentSalariesStats = async (params: {
  fromDate: string | undefined
  toDate: string | undefined
}): Promise<AxiosResponse<SalariesPerMonth>> => {
  const response = await api('/api/stats/payment-salaries-per-month-wpre', {
    params
  })
  return response.data
}

export const fetchAttendanceByDate = async (
  params: FetchEmployeeAttendanceParams
): Promise<AxiosResponse<AttendanceByDateResponse>> => {
  const response = await api('/api/attendances/by-day', { params })
  return response
}
