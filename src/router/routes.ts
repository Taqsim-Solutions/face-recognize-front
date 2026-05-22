export const routes = [
  {
    path: '/auth',
    name: 'auth',
    redirect: { name: 'login' },
    component: () => import('@/layouts/AuthLayout.vue'),
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('@/views/auth/login')
      },
      {
        path: 'registration',
        name: 'registration',
        component: () => import('@/views/auth/registration')
      },
      {
        path: 'password-recovery',
        name: 'password-recovery',
        component: () => import('@/views/auth/password-recovery')
      },
      {
        path: 'auth-otp-confirmation/:id',
        name: 'auth-otp-confirmation',
        component: () => import('@/views/auth/auth-otp-confirmation')
      }
    ]
  },
  {
    path: '',
    name: 'main',
    redirect: { name: 'home' },
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: [
      {
        path: '/',
        name: 'home',
        component: () => import('@/views/dashboard'),
        meta: { permission: '' }
      },
      {
        path: '/users',
        name: 'users-list',
        component: () => import('@/views/users/list'),
        meta: { permission: 'employees.list' }
      },
      {
        path: '/attendances',
        name: 'attendances-list',
        component: () => import('@/views/attendances/list'),
        meta: { permission: 'attendances.list' }
      },
      {
        path: '/settings',
        name: 'organization-settings',
        component: () => import('@/views/organization-settings'),
        meta: { permission: 'organizations.modifier' }
      },
      {
        path: '/account',
        name: 'account-settings',
        component: () => import('@/views/account/detail'),
        meta: { permission: 'users.detail' }
      },
    ]
  }
]
