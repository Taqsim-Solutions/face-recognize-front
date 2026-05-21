import type { Identifier } from '../../types'

export const identifiersList: { label: string; fieldName: Identifier['type'] }[] = [
  {
    fieldName: 'phoneNumber',
    label: 'phone-number'
  },
  {
    fieldName: 'passportSerialNumber',
    label: 'passport-serial-num'
  },
  {
    fieldName: 'inn',
    label: 'tin'
  },
  // {
  //   fieldName: 'accountCredit',
  //   label: 'account-credit'
  // },
  {
    fieldName: 'mfo',
    label: 'mfo'
  },
  {
    fieldName: 'pinfl',
    label: 'pinfl'
  }
]
