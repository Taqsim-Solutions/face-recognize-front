export type TokenResponse = {
  accessToken: string
  expireAt: string
  refreshToken: string
  type: string
}

export type OTPModel = {
  code: string
  requestId: string
  device: DeviceModel
}

export type DeviceModel = {
  type: 'other' | 'android' | 'ios' | 'browser' | 'telegram'
  deviceId?: string
  displayName?: string
  isTrusted: boolean
  fireBaseToken?: string
}
