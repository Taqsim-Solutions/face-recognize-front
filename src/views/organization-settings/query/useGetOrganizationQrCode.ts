import { useQuery } from '@tanstack/vue-query'
import { getOrganizationQrcode } from '../api'

export const useGetOrganizationQrCode = () => {
  return useQuery({
    queryKey: ['organization-qrcode'],
    queryFn: () => getOrganizationQrcode()
  })
}
