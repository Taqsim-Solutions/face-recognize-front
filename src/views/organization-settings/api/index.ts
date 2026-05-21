import type { AxiosResponse } from 'axios'
import type {
  OrganizationModelResponse,
  OrganizationSalaryResponse,
  OrganizationSalaryModel,
  OrganizationQrCodeResponse,
  IntegratorApiKeysResponse,
  OrganizationLeaveOptionsResponse,
  OrganizationLeaveOptionsModel,
  DaysOffResponse,
  DayOffResponse,
  TelegramConnectGroupResponse,
  PendingChangesResponse,
  PendingChangeResponse
} from '../types'

import api from '@/api'
const url = '/api/organizations'

export const getOrganization = async (): Promise<AxiosResponse<OrganizationModelResponse>> => {
  return await api(url)
}

export const getOrganizationOptions = async (): Promise<
  AxiosResponse<OrganizationSalaryResponse>
> => {
  return await api(`${url}/options`)
}

export const updateOrganizationOptions = async (payload: OrganizationSalaryModel) => {
  return await api.put(`${url}/options`, payload)
}

export const updateOrganizationSalaryOptions = async (payload: OrganizationSalaryModel) => {
  return await api.put(`${url}/options-salary`, payload)
}

export const getOrganizationLeaveOptions = async (): Promise<
  AxiosResponse<OrganizationLeaveOptionsResponse>
> => {
  return await api.get(`${url}/leave-options`)
}

export const updateOrganizationLeaveOptions = async (payload: OrganizationLeaveOptionsModel) => {
  return await api.put(`${url}/leave-options`, payload)
}

export const getOrganizationImg = async (id: string) => {
  return await api(`${url}/images/${id}`, { responseType: 'blob' })
}

export const getOrganizationQrcode = async (): Promise<
  AxiosResponse<OrganizationQrCodeResponse>
> => {
  return await api.get('/api/attendances-token')
}

export const getIntegratorApiKeys = async (): Promise<AxiosResponse<IntegratorApiKeysResponse>> => {
  return await api('/api/integrator-api-keys')
}

export const createIntegratorApiKey = async (data: {
  name: string
  isActive: true
}): Promise<AxiosResponse<any>> => {
  return await api('/api/integrator-api-keys', { data, method: 'POST' })
}

export const deleteIntegratorApiKey = async (id: string): Promise<AxiosResponse<void>> => {
  return await api(`/api/integrator-api-keys/${id}`, { method: 'DELETE' })
}

export const activateIntegratorApiKey = async (
  id: string,
  params: { isActive: boolean }
): Promise<AxiosResponse<void>> => {
  return await api(`/api/integrator-api-keys/${id}/active`, { method: 'PATCH', params })
}

export const getCameras = async (params: { page: number; size: number }) => {
  return await api('/api/acs-cameras', { params })
}

export const createCamera = async (data: {
  name: string
  url: string
  username: string
  password: string
  direction: 'both'
  isActive: boolean
  shortSerialNumber: string
}) => {
  return await api('/api/acs-cameras', { data, method: 'POST' })
}

export const updateCamera = async (
  id: string,
  data: {
    name: string
    url: string
    username: string
    password?: string
    direction?: 'both'
    isActive?: boolean
    shortSerialNumber: string
  }
) => {
  return await api(`/api/acs-cameras/${id}`, { data, method: 'PUT' })
}

export const deleteCamera = async (id: string) => {
  return await api(`/api/acs-cameras/${id}`, { method: 'DELETE' })
}

export const getCameraEmployees = async (params: { employeeId: string }) => {
  return await api('/api/acs-cameras/employees', { params })
}

export const createCameraEmployee = async (data: {
  acsCameraId: number
  employeeId: string
  employeeNo: string
}) => {
  return await api('/api/acs-cameras/employees', { data, method: 'POST' })
}

export const updateCameraEmployee = async (
  id: number,
  data: {
    acsCameraId: number
    employeeId: string
    employeeNo: string
  }
) => {
  return await api(`/api/acs-cameras/employees/${id}`, { data, method: 'PUT' })
}

export const deleteCameraEmployee = async (id: number) => {
  return await api(`/api/acs-cameras/employees/${id}`, { method: 'DELETE' })
}

export const syncCameraEvents = async (params: { fromDate: string; toDate: string }) => {
  return await api('/api/acs-cameras/sync-events', {
    method: 'POST',
    params
  })
}

export const syncCameraEmployees = async (cameraId: number, data: string[]) => {
  return await api(`/api/acs-cameras/employees/sync/${cameraId}`, { data, method: 'POST' })
}

export const syncCameraEmployeesOrganization = async (cameraId: number) => {
  return await api(`/api/acs-cameras/employees/sync/${cameraId}/organization`, { method: 'POST' })
}

export const downloadCameraEmployeesFaces = async (cameraId: number, data: string[]) => {
  return await api(`/api/acs-cameras/employees/download-faces/${cameraId}`, { data, method: 'POST' })
}

export const downloadCameraEmployeesFacesOrganization = async (cameraId: number) => {
  return await api(`/api/acs-cameras/employees/download-faces/${cameraId}/organization`, { method: 'POST' })
}

export const getDaysOff = async (params?: any): Promise<AxiosResponse<DaysOffResponse>> => {
  return await api.get(`${url}/options/daysoff`, { params })
}

export const createDayOff = async (data: {
  date: string
  description: string
}): Promise<AxiosResponse<DayOffResponse>> => {
  return await api.post(`${url}/options/daysoff`, data)
}

export const getDayOff = async (id: number): Promise<AxiosResponse<DayOffResponse>> => {
  return await api.get(`${url}/options/daysoff/${id}`)
}

export const updateDayOff = async (
  id: number,
  data: { date: string; description: string }
): Promise<AxiosResponse<DayOffResponse>> => {
  return await api.put(`${url}/options/daysoff/${id}`, data)
}

export const deleteDayOff = async (id: number): Promise<AxiosResponse<void>> => {
  return await api.delete(`${url}/options/daysoff/${id}`)
}

export const seedDaysOffFromGoogleCalendar = async (params: {
  calendarId: string
}): Promise<AxiosResponse<DayOffResponse>> => {
  return await api.post(`${url}/options/daysoff/seed/google-calendar`, null, { params })
}

export const connectTelegramGroup = async (): Promise<AxiosResponse<TelegramConnectGroupResponse>> => {
  return await api.get('/api/telegram-bot/connect-group')
}

export const getPendingChanges = async (params: any): Promise<AxiosResponse<PendingChangesResponse>> => {
  return await api.get('/api/integrator/pending-changes', { params })
}

export const getPendingChange = async (id: string): Promise<AxiosResponse<PendingChangeResponse>> => {
  return await api.get(`/api/integrator/pending-changes/${id}`)
}

export const approvePendingChange = async (id: string): Promise<AxiosResponse<void>> => {
  return await api.post(`/api/integrator/pending-changes/${id}/approve`)
}

export const rejectPendingChange = async (id: string, data: { reason: string }): Promise<AxiosResponse<void>> => {
  return await api.post(`/api/integrator/pending-changes/${id}/reject`, data)
}
