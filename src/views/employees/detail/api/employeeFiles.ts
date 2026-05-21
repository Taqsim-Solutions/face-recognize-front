import api from '@/api'

const url = '/api/employee-files'

export interface EmployeeFile {
  id: string
  employeeId: string
  type: 'faceImage'
  name: string
  contentType: string
  fileSize: number
  createdAt: string
}

export const getEmployeeFiles = async (params: {
  employeeId: string
  type?: string
  page?: number
  size?: number
  isAll?: boolean
}) => {
  const res = await api.get(url, { params })
  return res
}

export const uploadEmployeeFile = async (payload: {
  employeeId: string
  file: File
  type: string
}) => {
  const form = new FormData()
  form.append('employeeId', payload.employeeId)
  form.append('file', payload.file)
  form.append('type', payload.type)
  const res = await api.post(url, form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res
}

export const deleteEmployeeFile = async (id: string) => {
  const res = await api.delete(`${url}/${id}`)
  return res
}
