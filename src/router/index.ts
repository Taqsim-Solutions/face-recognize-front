import { createRouter, createWebHistory, type RouteRecordNameGeneric } from 'vue-router'
import { routes } from './routes'

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

  return true
})

export default router
