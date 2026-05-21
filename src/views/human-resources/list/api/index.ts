import type { FetchEmployeeLeavesParams } from '../types'

import api from '@/api'
const url = '/api/employee-leaves'

export const fetchEmployeeLeaves = async (params: FetchEmployeeLeavesParams) => {
  return await api(url, { params })
}

import type { CreateLeaveModel, LeaveModelResult } from '../types'
import axios, { AxiosResponse } from 'axios'

export const createEmployeeLeave = (
  payload: CreateLeaveModel
): Promise<AxiosResponse<LeaveModelResult>> => {
  return api.post(url, payload)
}

export const uploadEmployeeLeaveAttachment = (
  leaveId: string,
  file: File,
  name: string
): Promise<AxiosResponse<any>> => {
  const formData = new FormData()
  formData.append('attachment', file)
  formData.append('name', name)
  const token = localStorage.getItem('token')
  return axios.post(`/api/employee-leaves/${leaveId}/attachments`, formData, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
}
export const deleteEmployeeLeave = (id: string): Promise<AxiosResponse<any>> => {
  return api.delete(`${url}/${id}`)
}
