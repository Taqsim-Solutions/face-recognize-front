import api from '@/api'

const url = '/api/premium'

export interface PremiumItem {
  id: number
  phoneNumber: string
  startsAt: string
  endsAt: string
  isActive: boolean
  isCurrentlyActive: boolean
  note?: string
  createdAt: string
}

export const fetchPremiumList = async () => {
  return await api<{ result: PremiumItem[] }>(url)
}

export const addPremium = async (payload: { phoneNumber: string; months: number; note?: string }) => {
  return await api.post(url, payload)
}

export const extendPremium = async (payload: { phoneNumber: string; months: number }) => {
  return await api.post(`${url}/extend`, payload)
}

export const removePremium = async (id: number) => {
  return await api.delete(`${url}/${id}`)
}
