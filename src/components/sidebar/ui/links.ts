import {
  LayoutDashboardIcon,
  UserCheck2Icon,
  SettingsIcon
} from 'lucide-vue-next'

import type { LinkProp } from '..'
import { h } from 'vue'

const UsersIcon = (props: any) =>
  h(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '21',
      height: '18',
      viewBox: '0 0 17 14',
      fill: 'none',
      ...props
    },
    [
      h('path', {
        d: 'M0.75 12.4167C0.75 10.5758 2.2425 9.08334 4.08333 9.08334H7.41667C9.2575 9.08334 10.75 10.5758 10.75 12.4167',
        stroke: 'currentColor',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      }),
      h('path', {
        d: 'M11.5833 1.29251C12.7342 1.29251 13.6667 2.22501 13.6667 3.37584C13.6667 4.52668 12.7342 5.45918 11.5833 5.45918',
        stroke: 'currentColor',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      }),
      h('path', {
        d: 'M7.75408 1.58011C8.86089 2.68691 8.86089 4.48141 7.75408 5.58822C6.64727 6.69503 4.85277 6.69503 3.74597 5.58822C2.63916 4.48141 2.63916 2.68691 3.74597 1.58011C4.85277 0.473298 6.64727 0.473298 7.75408 1.58011',
        stroke: 'currentColor',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      }),
      h('path', {
        d: 'M12.4167 8.25C14.2575 8.25 15.75 9.7425 15.75 11.5833',
        stroke: 'currentColor',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      })
    ]
  )

export const links: LinkProp[] = [
  {
    name: 'dashboard',
    location: 'home',
    icon: LayoutDashboardIcon
  },
  {
    name: 'users',
    location: 'users-list',
    icon: UsersIcon
  },
  {
    name: 'attendances',
    location: 'attendances-list',
    icon: UserCheck2Icon
  },
  {
    name: 'settings',
    location: 'organization-settings',
    icon: SettingsIcon
  }
]
