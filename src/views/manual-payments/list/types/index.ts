export type ManualPaymentModel = {
  id: string
  createdAt: string | undefined
  updatedAt: string | undefined
  fullName: string | undefined
  provider: string | undefined
  cardNumber: string | undefined
  status: Status
  comment: string | undefined
}

export type FetchManualPaymentsParams = {
  size: number
  page: number
  fromCreatedAt?: string
  toCreatedAt?: string
  status?: Status
}

type Status =
  | 'requested'
  | 'rejected'
  | 'approved'
  | 'paymentInProgress'
  | 'paymentCanceled'
  | 'paid'
  | 'reversed'
