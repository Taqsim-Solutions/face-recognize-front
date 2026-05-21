export interface TerminalDetail {
  id: number
  paymentMethodId: number
  createdAt: string
  updatedAt: string
  createdBy: number
  updatedBy: number
  status: 'none' | 'active' | 'inactive'
  name: string
  terminalId: string
  merchantId: string
  balance: number
  credit: number
  debit: number
  comment: string
  paymentMethod: {
    id: number
    provider: string
  }
}

export interface TerminalDetailResponse {
  isSuccess: boolean
  error: {
    code: string
    message: string
    errors: string[]
  }
  data: TerminalDetail
}

// Deposit related types
export interface ReceiptFile {
  id: string
  contentType: string
  name: string
}

export interface Deposit {
  id: string
  eposTerminalId: number
  createdAt: string
  createdBy: number
  amount: number
  comment: string
  receiptFiles: ReceiptFile[]
  status: string
  confirmedAt?: string
  confirmedBy?: number
}

export interface DepositsListResponse {
  isSuccess: boolean
  error: {
    code: string
    message: string
    errors: string[]
  }
  data: Deposit[]
}

export interface DepositResponse {
  isSuccess: boolean
  error: {
    code: string
    message: string
    errors: string[]
  }
  data: Deposit
}

export interface CreateDepositRequest {
  amount: number
  comment?: string
  receiptFile: File
}

export interface DepositsListParams {
  fromCreatedAt?: string
  toCreatedAt?: string
  createdBy?: number
  size?: number
  page?: number
  isAll?: boolean
  orderBy?: string
  order?: 'asc' | 'desc'
}

export interface BaseResponse {
  isSuccess: boolean
  error: {
    code: string
    message: string
    errors: string[]
  }
}

// Balance allocation types
export interface AllocateBalanceRequest {
  amount: number
}

export interface ReleaseBalanceRequest {
  amount: number
}

export interface BalanceOperationResponse {
  isSuccess: boolean
  error: {
    code: string
    message: string
    errors: string[]
  }
  data: {
    id: number
    eposTerminalId: number
    eposTerminal: {
      id: number
      paymentMethodId: number
      paymentMethod: {
        id: number
        paymentProviderId: number
        provider: string
        status: string
        paymentBank: {
          id: number
          name: string
        }
      }
      status: string
      name: string
      terminalId: string
      merchantId: string
    }
    organizationId: string
    organization: {
      id: string
      name: string
    }
    isOwner: boolean
    createdAt: string
    updatedAt: string
    createdBy: number
    updatedBy: number
    balance: number
    credit: number
    debit: number
    comment: string
    status: string
  }
}
