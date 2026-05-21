import {
  LayoutDashboardIcon,
  Users2Icon,
  CoinsIcon,
  UserCheck2Icon,
  UserRoundCogIcon,
  FileQuestionIcon,
  Building2Icon,
  BellIcon,
  SettingsIcon
} from 'lucide-vue-next'

import type { LinkProp } from '..'

export const links: LinkProp[] = [
  {
    name: 'dashboard',
    location: 'home',
    icon: LayoutDashboardIcon
  },
  {
    name: 'employees',
    location: 'employees-list',
    icon: Users2Icon
  },
  {
    name: 'departments',
    location: 'departments-list',
    icon: Building2Icon
  },
  {
    name: 'attendances',
    location: 'attendances-list',
    icon: UserCheck2Icon
  },
  {
    name: 'payments',
    location: 'payments-list',
    icon: CoinsIcon
  },
  {
    name: 'requests',
    location: 'requests-list',
    icon: FileQuestionIcon
  },
  {
    name: 'human-resources',
    location: 'hr-list',
    icon: UserRoundCogIcon
  },
  {
    name: 'notifications',
    location: 'notification-templates-list',
    icon: BellIcon
  },
  {
    name: 'settings',
    location: 'organization-settings',
    icon: SettingsIcon
  }
]
