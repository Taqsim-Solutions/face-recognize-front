import { useMutation } from '@tanstack/vue-query'
import { seedDaysOffFromGoogleCalendar } from '../api'

export const useSeedDaysOffFromGoogleCalendar = () => {
  return useMutation({
    mutationFn: (params: { calendarId: string }) => seedDaysOffFromGoogleCalendar(params)
  })
}
