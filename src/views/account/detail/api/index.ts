import api from '@/api'

const url = '/api/account'

export const getAccountOrgs = async () => {
  try {
    return await api(`${url}/organizations`)
  } catch (error: any) {
    if (error?.response?.status === 403) {
      const storedOrgId = localStorage.getItem('organizationId')
      if (storedOrgId) {
        localStorage.removeItem('organizationId')
        // Retry once without the organizationId header
        return await api(`${url}/organizations`)
      }
    }
    throw error
  }
}

export const getAccountInfo = async () => {
  return await api('/api/users/get-me')
}

export const getAccountImg = async (id: string) => {
  return await api(`${url}/images/${id}`, { responseType: 'blob' })
}
