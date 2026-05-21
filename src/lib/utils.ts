import type { Updater } from '@tanstack/vue-table'
import type { Ref } from 'vue'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

import dayjs from 'dayjs'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDate = (date: string | number | Date | undefined) => {
  if (!date) return ''
  return dayjs(date).format('DD.MM.YYYY')
}

export const formatDateTime = (date: string | number | Date | undefined) => {
  if (!date) return ''
  return dayjs(date).format('DD.MM.YYYY HH:mm')
}

export const clearLoginToken = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('tokenExpire')
}

export const cleanPhoneNumber = (maskedPhone: string) => {
  // +998 (90) 123-4578 -> 998901234578
  return maskedPhone.replace(/[^\d]/g, '')
}

export const prettifyPhoneNumber = (phone: string): string => {
  const digits = phone?.replace(/\D/g, '')
  if (digits?.length !== 12) {
    return phone
  }

  const countryCode = digits.slice(0, 3)
  const operatorCode = digits.slice(3, 5)
  const part1 = digits.slice(5, 8)
  const part2 = digits.slice(8, 10)
  const part3 = digits.slice(10, 12)

  return `+${countryCode} (${operatorCode}) ${part1} ${part2}${part3}`
}

export const prettify = (value: number | string | undefined) => {
  if (value === undefined || value === null || value === '') return value

  const num = Number(value)
  if (isNaN(num)) return value

  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true
  })
    .format(num)
    .replace(',', '.')
    .replace(/\u00A0/g, ' ') // Replace non-breaking space with regular space if preferred, or keep it. Steps below use regular space for consistency with previous regex.
}

export const valueUpdater = <T extends Updater<any>>(updaterOrValue: T, ref: Ref) => {
  ref.value = typeof updaterOrValue === 'function' ? updaterOrValue(ref.value) : updaterOrValue
}
