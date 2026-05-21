import type { DeviceModel } from '@/views/auth/types'

import fingerprintjs from '@fingerprintjs/fingerprintjs'

export const getDeviceInfo = async (): Promise<DeviceModel> => {
  const fp = await fingerprintjs.load()
  const result = await fp.get()

  return {
    type: 'browser',
    isTrusted: true,
    deviceId: result.visitorId,
    displayName: navigator.userAgent
  }
}
