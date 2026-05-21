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
        path: '/manual-payments',
        name: 'manual-payments-list',
        component: () => import('@/views/manual-payments/list'),
        meta: { permission: 'salary.payments.list' }
      },
      {
        path: '/manual-payments/create',
        name: 'manual-payments-create',
        component: () => import('@/views/manual-payments/create'),
        meta: { permission: 'salary.payments.create' }
      },


      {
        path: '/',
        name: 'home',
        component: () => import('@/views/dashboard'),
        meta: { permission: '' }
      },
      {
        path: '/employees',
        name: 'employees-list',
        component: () => import('@/views/employees/list'),
        meta: { permission: 'employees.list' }
      },
      {
        path: '/employee/:id',
        name: 'employees-detail',
        component: () => import('@/views/employees/detail'),
        meta: { permission: 'employees.detail' }
      },
      {
        path: '/employee/edit/:id',
        name: 'employees-edit',
        component: () => import('@/views/employees/edit'),
        meta: { permission: 'employees.update' }
      },
      {
        path: '/departments',
        name: 'departments-list',
        component: () => import('@/views/departments'),
        meta: { permission: 'departments.list' }
      },
      {
        path: '/departments/:id',
        name: 'departments-detail',
        component: () => import('@/views/departments/ui/DepartmentDetail.vue'),
        meta: { permission: 'departments.list' }
      },
      {
        path: '/attendances',
        name: 'attendances-list',
        component: () => import('@/views/attendances/list'),
        meta: { permission: 'attendances.list' }
      },
      {
        path: '/payments',
        name: 'payments-list',
        component: () => import('@/views/payments/list'),
        meta: { permission: 'salary.payments.list' }
      },
      {
        path: '/terminal/:id/:orgId',
        name: 'terminal-view',
        component: () => import('@/views/terminal-view'),
        meta: { permission: 'payment.terminals' }
      },
      {
        path: '/requests',
        name: 'requests-list',
        component: () => import('@/views/requests/list'),
        meta: { permission: 'salary.requests.list' }
      },
      {
        path: 'hr',
        name: 'hr-list',
        component: () => import('@/views/human-resources/list'),
        meta: { permission: 'employee.leaves.list' }
      },
      {
        path: '/notification-templates',
        name: 'notification-templates-list',
        component: () => import('@/views/notifications/ui/NotificationsList.vue'),
        meta: { permission: 'notifications.list' }
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
