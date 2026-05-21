import axios, { AxiosError, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import router from '@/router'
import { getDeviceInfo } from '../lib/device'

// Pagination type
export interface PaginationData {
  currentPage: number
  totalCount: number
  totalPages: number
  pageSize: number
  hasPrevious: boolean
  hasNext: boolean
}

export const clearToken = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('tokenExpire')
  localStorage.removeItem('refreshToken')
}

export const saveToken = ({
  accessToken,
  expireAt,
  refreshToken
}: {
  accessToken: string
  expireAt: string
  refreshToken: string
}) => {
  localStorage.setItem('token', accessToken)
  localStorage.setItem('tokenExpire', expireAt)
  localStorage.setItem('refreshToken', refreshToken)
}

// Constants for storage keys
const TOKEN_KEY = 'token'
const REFRESH_TOKEN_KEY = 'refreshToken'
const EMPLOYEE_ID_KEY = 'employeeId'
const DEVICE_ID_KEY = 'deviceId'
const ORGANIZATION_ID_KEY = 'organizationId'

// Create Axios instance
const api = axios.create({
  headers: {
    'Content-Type': 'application/json'
  }
})

const url = '/api/auth'

export const refresh = async (model: {
  refreshToken: string
  accessToken: string
}): Promise<
  AxiosResponse<{
    accessToken: string
    expireAt: string
    refreshToken: string
  }>
> => {
  return await api.post(`${url}/refresh-token`, model)
}

let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

// Subscribe a callback to token refresh
const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb)
}

// Notify all subscribers with the new token
const onRefreshed = (newToken: string) => {
  refreshSubscribers.forEach((cb) => cb(newToken))
  refreshSubscribers = []
}

// Helper to get a stored item
const getStoredItem = (key: string): string | null => localStorage.getItem(key)

// Refresh access token logic
async function refreshAccessToken() {
  const refreshToken = getStoredItem(REFRESH_TOKEN_KEY)
  const accessToken = getStoredItem(TOKEN_KEY)

  if (!refreshToken || !accessToken) {
    clearToken()
    router.push({ name: 'login' })
    return Promise.reject(new Error('Authentication tokens are missing.'))
  }

  try {
    const deviceData = await getDeviceInfo()
    const response = await refresh({
      refreshToken,
      accessToken, // @ts-ignore
      device: deviceData
    })

    saveToken(response.data)

    return response.data.accessToken
  } catch (error) {
    clearToken()
    router.push({ name: 'login' })
    return Promise.reject(new Error('Failed to refresh access token.'))
  }
}

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = getStoredItem(TOKEN_KEY)
    const employeeId = getStoredItem(EMPLOYEE_ID_KEY)
    const deviceId = getStoredItem(DEVICE_ID_KEY)
    const organizationId = getStoredItem(ORGANIZATION_ID_KEY)
    const language = getStoredItem('language') || 'uz'

    const langMap: Record<string, string> = {
      uz: 'uz-UZ',
      uzc: 'uz-UZ',
      ru: 'ru-RU',
      en: 'en-US'
    }

    if (token) config.headers.Authorization = `Bearer ${token}`
    if (employeeId) config.headers['EmployeeId'] = employeeId
    if (deviceId) config.headers['Device-Id'] = deviceId
    if (organizationId) config.headers['OrganizationId'] = organizationId
    config.headers['Accept-Language'] = langMap[language] || 'uz-UZ'

    return config
  },
  (error) => Promise.reject(new Error(error.message))
)

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Parse and transform pagination header if it exists
    const paginationHeader = response.headers['x-pagination']
    if (paginationHeader) {
      try {
        const paginationData = JSON.parse(paginationHeader)
        // Transform to camelCase and boolean values
        response.headers['x-pagination'] = JSON.stringify({
          currentPage: paginationData.CurrentPage,
          totalCount: paginationData.TotalCount,
          totalPages: paginationData.TotalPages,
          pageSize: paginationData.PageSize,
          hasPrevious: paginationData.HasPrevious,
          hasNext: paginationData.HasNext
        } as PaginationData)
      } catch (error) {
        console.error('Failed to parse pagination header:', error)
      }
    }
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean
    }

    if (axios.isAxiosError(error) && error.response?.status === 401 && !originalRequest._retry) {
      if (!isRefreshing) {
        isRefreshing = true

        try {
          const newToken = await refreshAccessToken()
          isRefreshing = false
          onRefreshed(newToken!)

          // Retry original request with the new token
          return new Promise((resolve) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`
            }
            originalRequest._retry = true
            resolve(api(originalRequest))
          })
        } catch (refreshError) {
          isRefreshing = false
          return Promise.reject(refreshError)
        }
      }

      // Wait for the token refresh and retry the request
      return new Promise((resolve) => {
        subscribeTokenRefresh((newToken) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
          }
          originalRequest._retry = true
          resolve(api(originalRequest))
        })
      })
    }

    // Handle other errors
    return Promise.reject(error)
  }
)

export default api
