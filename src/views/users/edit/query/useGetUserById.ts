import { useQuery } from '@tanstack/vue-query'
import api from '@/api'

const fetchUserById = async (id: string) => {
  const res = await api.get(`/api/users/${id}`)
  return res.data
}

export const useGetUserById = ({ id }: { id: string }) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => fetchUserById(id),
    enabled: !!id
  })
}
