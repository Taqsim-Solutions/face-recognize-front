import api from '@/api'
import type {
  NotificationTemplateListResponse,
  NotificationTemplateResponse,
  GetNotificationTemplatesParams,
  CreateNotificationTemplateRequest,
  UpdateNotificationTemplateRequest,
  NotificationTemplateState,
  NotificationDashboardResponse,
  GetNotificationDashboardParams,
  InitializeNotificationRequest,
  InitializeNotificationEmployeesRequest,
  NotificationDetailsResponse,
  GetNotificationReceiversParams,
  NotificationReceiversResponse
} from '../types'

const url = '/api/notifications/templates'

export const getNotificationTemplates = async (params?: GetNotificationTemplatesParams) => {
  return await api.get<NotificationTemplateListResponse>(url, { params })
}

export const createNotificationTemplate = async (data: CreateNotificationTemplateRequest) => {
  return await api.post<NotificationTemplateResponse>(url, data)
}

export const updateNotificationTemplate = async (id: number, data: UpdateNotificationTemplateRequest) => {
  return await api.put<NotificationTemplateResponse>(`${url}/${id}`, data)
}

export const updateNotificationTemplateState = async (id: number, state: NotificationTemplateState) => {
  return await api.put<NotificationTemplateResponse>(`${url}/${id}/state`, null, {
    params: { state }
  })
}

export const getNotificationDashboard = async (params?: GetNotificationDashboardParams) => {
  return await api.get<NotificationDashboardResponse>('/api/notifications/dashboard', { params })
}

export const initializeNotification = async (data: InitializeNotificationRequest) => {
  return await api.post('/api/notifications/initialize', data)
}

export const initializeNotificationEmployees = async (data: InitializeNotificationEmployeesRequest) => {
  return await api.post('/api/notifications/initialize/employees', data)
}

export const pushNotification = async (id: string, push: string) => {
  if (push === 'sms') {
    return await api.post(`/api/notifications/initialize/${id}/push/sms`)
  }
  return await api.post(`/api/notifications/initialize/${id}/push`, { push }, {
    params: { push }
  })
}

export const getNotificationDetails = async (id: string) => {
  return await api.get<NotificationDetailsResponse>(`/api/notifications/dashboard/${id}`)
}

export const getNotificationReceivers = async (id: string, params?: GetNotificationReceiversParams) => {
  return await api.get<NotificationReceiversResponse>(`/api/notifications/dashboard/${id}/receivers`, { params })
}
