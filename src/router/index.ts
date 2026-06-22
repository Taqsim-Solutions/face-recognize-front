import { createRouter, createWebHistory, type RouteRecordNameGeneric } from 'vue-router'
import { routes } from './routes'
import api from '@/api'
import { isPageAllowed, refreshPagePermissions } from '@/shared/permissions'

const alwaysAllowedRoutes = new Set<RouteRecordNameGeneric>([
  'registration',
  'auth-otp-confirmation',
  'password-recovery',
  'login',
  'auth'
])

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach(async (to) => {
  const isLoggedIn = !!localStorage.getItem('token')

  if (isLoggedIn && to.name === 'login') {
    return { name: 'home' }
  }

  if (alwaysAllowedRoutes.has(to.name)) {
    return true
  }

  if (!isLoggedIn && to.name !== 'login') {
    return { name: 'login' }
  }

  if (isLoggedIn) {
    let storedLevel = localStorage.getItem('user_level')

    if (storedLevel === null) {
      try {
        const res = await api.get('/api/users/get-me')
        const userLevel = res?.data?.result?.level
        if (userLevel !== undefined) {
          localStorage.setItem('user_level', String(userLevel))
          storedLevel = String(userLevel)
        }
        // Pull the admin-configured page matrix once we know we're logged in.
        await refreshPagePermissions()
      } catch (e) {
        console.error('Failed to fetch user level:', e)
      }
    }

    const userLevel = storedLevel ? Number(storedLevel) : 1

    if (!isPageAllowed(to.name as string, userLevel)) {
      if (to.name !== 'home') {
        return { name: 'home' }
      }
    }
  }

  return true
})

export default router
