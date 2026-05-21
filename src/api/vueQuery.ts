import { QueryClient, type VueQueryPluginOptions } from '@tanstack/vue-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      enabled: true
    },
    mutations: {
      retry: false
    }
  }
})

export const vueQueryPluginOptions: VueQueryPluginOptions = {
  queryClient
}

