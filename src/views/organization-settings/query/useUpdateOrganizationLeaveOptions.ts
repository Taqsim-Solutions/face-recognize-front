import { useMutation } from '@tanstack/vue-query'
import { updateOrganizationLeaveOptions } from '../api'
import { OrganizationLeaveOptionsModel } from '../types'

export const useUpdateOrganizationLeaveOptions = () => {
  return useMutation({
    mutationFn: (payload: OrganizationLeaveOptionsModel) => updateOrganizationLeaveOptions(payload)
  })
}
