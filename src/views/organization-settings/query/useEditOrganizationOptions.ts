import { useMutation } from '@tanstack/vue-query'
import { updateOrganizationOptions, updateOrganizationSalaryOptions } from '../api'
import { OrganizationSalaryModel } from '../types'

export const useUpdateOrganizationOptions = () => {
  return useMutation({
    mutationFn: (payload: OrganizationSalaryModel) => updateOrganizationOptions(payload)
  })
}

export const useUpdateOrganizationSalaryOptions = () => {
  return useMutation({
    mutationFn: (payload: OrganizationSalaryModel) => updateOrganizationSalaryOptions(payload)
  })
}
