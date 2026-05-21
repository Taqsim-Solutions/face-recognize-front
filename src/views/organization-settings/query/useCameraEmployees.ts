import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { getCameraEmployees, createCameraEmployee, updateCameraEmployee, deleteCameraEmployee } from '../api'
import { unref } from 'vue'

export const useGetCameraEmployees = (params: any) => {
  return useQuery({
    queryKey: ['camera-employees', params],
    queryFn: () => getCameraEmployees(unref(params))
  })
}

export const useCreateCameraEmployee = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      acsCameraId: number
      employeeId: string
      employeeNo: string
    }) => createCameraEmployee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['camera-employees'] })
    }
  })
}

export const useUpdateCameraEmployee = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: {
      acsCameraId: number
      employeeId: string
      employeeNo: string
    } }) => updateCameraEmployee(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['camera-employees'] })
    }
  })
}

export const useDeleteCameraEmployee = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteCameraEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['camera-employees'] })
    }
  })
}
