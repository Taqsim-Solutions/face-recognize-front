import api from '@/api'
import type {
  CreateDepositRequest,
  DepositsListParams,
  AllocateBalanceRequest,
  ReleaseBalanceRequest,
  BalanceOperationResponse
} from '../types'

export const fetchTerminalById = async (eposTerminalId: number) => {
  return api.get(`/api/epos-terminals/${eposTerminalId}`)
}

// Deposits API functions
export const fetchDeposits = async (eposTerminalId: number, params?: DepositsListParams) => {
  return api.get(`/api/epos-terminals/${eposTerminalId}/deposits`, { params })
}

export const syncBalance = async (eposTerminalId: number) => {
  return api.post(`/api/epos-terminals/${eposTerminalId}/deposits/sync-balance`)
}

export const createDeposit = async (eposTerminalId: number, data: CreateDepositRequest) => {
  const formData = new FormData()
  formData.append('amount', data.amount.toString())
  if (data.comment) {
    formData.append('comment', data.comment)
  }
  formData.append('receiptFile', data.receiptFile)

  return api.post(`/api/epos-terminals/${eposTerminalId}/deposits`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export const fetchDepositById = async (eposTerminalId: number, depositId: string) => {
  return api.get(`/api/epos-terminals/${eposTerminalId}/deposits/${depositId}`)
}

export async function deleteDeposit(eposTerminalId: number, depositId: string) {
  return api.delete(`/api/epos-terminals/${eposTerminalId}/deposits/${depositId}`, {
    method: 'DELETE'
  })
}

export const downloadReceiptFile = async (
  eposTerminalId: number,
  depositId: string,
  receiptId: string
) => {
  return api.get(
    `/api/epos-terminals/${eposTerminalId}/deposits/${depositId}/receipt-files/${receiptId}`,
    {
      responseType: 'blob'
    }
  )
}

export const uploadAdditionalReceiptFile = async (
  eposTerminalId: number,
  depositId: string,
  receiptFile: File
) => {
  const formData = new FormData()
  formData.append('receiptFile', receiptFile)

  return api.post(
    `/api/epos-terminals/${eposTerminalId}/deposits/${depositId}/receipt-files`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  )
}

// Balance management API functions
export const allocateBalance = async (
  eposTerminalId: number,
  organizationId: string,
  data: AllocateBalanceRequest
): Promise<BalanceOperationResponse> => {
  const response = await api.post(
    `/api/epos-terminals/${eposTerminalId}/organizations/${organizationId}/allocate-balance`,
    data
  )
  return response.data
}

export const releaseBalance = async (
  eposTerminalId: number,
  organizationId: string,
  data: ReleaseBalanceRequest
): Promise<BalanceOperationResponse> => {
  const response = await api.post(
    `/api/epos-terminals/${eposTerminalId}/organizations/${organizationId}/release-balance`,
    data
  )
  return response.data
}

export const getTerminalBalance = async (
  eposTerminalId: number
): Promise<{
  data: {
    data: {
      balance: number
      credit: number
      debit: number
      allocated: number
      available: number
    }
  }
}> => {
  return api.get(`/api/epos-terminals/${eposTerminalId}/balance`)
}
