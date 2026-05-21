import { useQuery } from '@tanstack/vue-query'
import { fetchEmployeesStat } from '../api'

export const useGetEmployeesStat = () => {
  return useQuery({
    queryKey: ['employees-stat'],
    queryFn: () => fetchEmployeesStat()
  })
}
