import api from '@/api'

export const fetchCameras = async () => {
  return await api.get<any[]>('/api/Cameras')
}

export const createCamera = async (payload: any) => {
  return await api.post('/api/Cameras', payload)
}

export const updateCamera = async (id: number, payload: any) => {
  return await api.put(`/api/Cameras/${id}`, payload)
}

export const deleteCamera = async (id: number) => {
  return await api.delete(`/api/Cameras/${id}`)
}

export const resyncSchool = async (id: number) => {
  return await api.post(`/api/Cameras/${id}/resync-school`)
}
