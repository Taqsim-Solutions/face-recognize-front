import { useMutation } from '@tanstack/vue-query'
import { updateDayOff } from '../api'

export const useUpdateDayOff = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { date: string; description: string } }) =>
      updateDayOff(id, data)
  })
}
