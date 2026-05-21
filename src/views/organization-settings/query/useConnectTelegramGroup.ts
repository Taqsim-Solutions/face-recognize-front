import { useQuery } from '@tanstack/vue-query'
import { connectTelegramGroup } from '../api'

export const useConnectTelegramGroup = () => {
  return useQuery({
    queryKey: ['telegram-connect-group'],
    queryFn: () => connectTelegramGroup().then((res) => res.data),
    enabled: false
  })
}
