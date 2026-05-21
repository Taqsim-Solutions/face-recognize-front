import { useRouter } from 'vue-router'

export function useAuthRedirect() {
  const router = useRouter()

  const saveTokenAndRedirect = async (accessToken: string, refreshToken?: string, expireAt?: string) => {
    localStorage.setItem('token', accessToken)
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken)
    else localStorage.removeItem('refreshToken')
    if (expireAt) localStorage.setItem('tokenExpire', expireAt)
    else localStorage.removeItem('tokenExpire')

    // Finalize the redirect
    router.push({ name: 'home' })
  }

  return { saveTokenAndRedirect }
}
