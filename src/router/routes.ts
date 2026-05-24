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
        path: 'password-recovery',
        name: 'password-recovery',
        component: () => import('@/views/auth/password-recovery')
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
        path: '/governments',
        name: 'governments-list',
        component: () => import('@/views/governments/list'),
        meta: { permission: 'employees.list' }
      },
      {
        path: '/schools',
        name: 'schools-list',
        component: () => import('@/views/schools/list'),
        meta: { permission: 'employees.list' }
      },
      {
        path: '/teachers',
        name: 'teachers-list',
        component: () => import('@/views/teachers/list'),
        meta: { permission: 'employees.list' }
      },
      {
        path: '/students',
        name: 'students-list',
        component: () => import('@/views/students/list'),
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
      {
        path: '/unknown-faces',
        name: 'unknown-faces',
        component: () => import('@/views/unknown-faces'),
        meta: { permission: '' }
      },
      {
        path: '/known-faces',
        name: 'known-faces',
        component: () => import('@/views/known-faces'),
        meta: { permission: '' }
      }
    ]
  }
]
