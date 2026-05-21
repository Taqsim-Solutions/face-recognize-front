import type { GetEmployeeSalaryParams } from '../types'

import { useQuery } from '@tanstack/vue-query'
import { getEmployeeSalary } from '../api'

export const useGetEmployeeSalary = (params: GetEmployeeSalaryParams) => {
  return useQuery({
    queryKey: [`employee-salary-${params.id}`],
    queryFn: () => getEmployeeSalary(params)
  })
}
