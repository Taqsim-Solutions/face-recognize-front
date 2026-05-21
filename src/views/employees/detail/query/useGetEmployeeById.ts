import type { GetEmployeeByIdParams } from '../types'

import { useQuery } from '@tanstack/vue-query'
import { getEmployeeById } from '../api'

export const useGetEmployeeById = (params: GetEmployeeByIdParams) => {
  return useQuery({
    queryKey: [`employee-${params.id}`],
    queryFn: () => getEmployeeById(params)
  })
}
