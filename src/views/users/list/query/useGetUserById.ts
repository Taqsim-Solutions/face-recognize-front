import { useQuery } from '@tanstack/vue-query'
import { getUserById } from '../api'

export const useGetUserById = ({ id }: { id: string }) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => getUserById(id),
    enabled: !!id
  })
}
