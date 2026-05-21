import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { pushNotification } from '../api'

export const usePushNotification = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: ({ id, push }: { id: string, push: string }) => pushNotification(id, push),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notification-dashboard'] })
        }
    })
}
