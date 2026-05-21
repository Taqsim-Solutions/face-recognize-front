import { useMutation } from '@tanstack/vue-query'
import { deleteDayOff } from '../api'

export const useDeleteDayOff = () => {
  return useMutation({
    mutationFn: (id: number) => deleteDayOff(id)
  })
}
