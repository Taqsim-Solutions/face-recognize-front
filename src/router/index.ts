import { createRouter, createWebHistory, type RouteRecordNameGeneric } from 'vue-router'
import { routes } from './routes'
import api from '@/api'

const alwaysAllowedRoutes = new Set<RouteRecordNameGeneric>([
  'registration',
  'auth-otp-confirmation',
  'password-recovery',
  'login',
  'auth'
])

const routeLevelPermissions: Record<string, number[]> = {
  'home': [1, 2, 3, 4, 5],
  'students-list': [1, 2, 3, 4, 5],
  'attendances-list': [1, 2, 3, 4, 5],
  'help': [1, 2, 3, 4, 5],
  'unknown-faces': [1, 2, 3, 4, 5],
  'teachers-list': [2, 3, 4, 5],
  'schools-list': [3, 4, 5],
  'governments-list': [4, 5],
  'users-list': [5],
  'organization-settings': [5]
}

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
      } catch (e) {
        console.error('Failed to fetch user level:', e)
      }
    }

    const userLevel = storedLevel ? Number(storedLevel) : 1
    const allowedLevels = routeLevelPermissions[to.name as string]

    if (allowedLevels !== undefined && !allowedLevels.includes(userLevel)) {
      if (to.name !== 'home') {
        return { name: 'home' }
      }
    }
  }

  return true
})

export default router
