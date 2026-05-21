export type CreateManualPayment = {
  account?: string
  fullName?: string
  amount: number
  cardNumber?: string
  cardHolder?: string
  mfo?: string
}

export type ManualPaymentCreateResponse = {
  isSuccess: boolean
  data?: any
  error?: ManualPaymentCreateErrorResponse
}

export type ManualPaymentCreateErrorResponse = {
  code: string | null
  errors: string[] | null
  message: string | null
}
