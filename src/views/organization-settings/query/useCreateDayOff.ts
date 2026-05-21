import { useMutation } from '@tanstack/vue-query'
import { createDayOff } from '../api'

export const useCreateDayOff = () => {
  return useMutation({
    mutationFn: (data: { date: string; description: string }) => createDayOff(data)
  })
}
