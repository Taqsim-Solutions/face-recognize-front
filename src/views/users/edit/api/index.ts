import type { EmployeeUpdatePayload } from '../types'
import api from '@/api'

const url = '/api/users'

export const updateEmployee = async ({
  id,
  payload
}: {
  id: string
  payload: EmployeeUpdatePayload
}) => {
  const res = await api.put(`${url}/${id}`, payload)
  return res
}

export const updateEmployeeSalary = async ({
  id,
  payload
}: {
  id: string
  payload: { salary: number }
}) => {
  const res = await api.put(`${url}/${id}/salary`, payload)
  return res
}

export const createEmployeeCardNumber = async ({
  id,
  cardNumber
}: {
  id: string
  cardNumber: string
}) => {
  const res = await api.post(`${url}/${id}/card-numbers`, { cardNumber })
  return res
}

export const deleteEmployeeCardNumber = async ({
  id,
  cardNumberId
}: {
  id: string
  cardNumberId: string
}) => {
  const res = await api.delete(`${url}/${id}/card-numbers/${cardNumberId}`)
  return res
}

export const updateEmployeeOptions = async ({
  id,
  payload
}: {
  id: string
  payload: { workStartTime: string | null; workEndTime: string | null }
}) => {
  const res = await api.put(`${url}/${id}/options`, payload)
  return res
}
