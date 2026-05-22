import {
  LayoutDashboardIcon,
  UserCheck2Icon,
  SettingsIcon,
  GraduationCap
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

const GovernmentIcon = (props: any) =>
  h(
    'svg',
    {
      class: 'w-5 h-5',
      style: {
        transform: 'translate(0.5px, -0.5px)'
      },
      xmlns: 'http://www.w3.org/2000/svg',
      width: '20',
      height: '24',
      viewBox: '0 0 20 20',
      fill: 'none',
      ...props
    },
    [
      h('path', {
        d: 'M10 6.01583C9.97244 6.01583 9.94602 6.02684 9.92661 6.0464C9.90719 6.06597 9.8964 6.09248 9.89662 6.12004C9.89662 6.1776 9.94328 6.22425 10.0008 6.22425C10.0584 6.22425 10.105 6.1776 10.105 6.12004C10.1041 6.06254 10.0575 6.01628 10 6.01583',
        stroke: 'currentColor',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      }),
      h('path', {
        'fill-rule': 'evenodd',
        'clip-rule': 'evenodd',
        d: 'M17.4798 8.61025H2.52022C2.40355 8.61047 2.29159 8.56428 2.20901 8.48186C2.12644 8.39944 2.08004 8.28756 2.08004 8.1709V6.52354C2.08031 6.16486 2.30997 5.84656 2.65027 5.73322L9.72155 3.37557C9.90233 3.31555 10.0977 3.31555 10.2785 3.37557L17.3497 5.73322C17.69 5.84656 17.9197 6.16486 17.92 6.52354V8.1709C17.92 8.28756 17.8736 8.39944 17.791 8.48186C17.7084 8.56428 17.5965 8.61047 17.4798 8.61025Z',
        stroke: 'currentColor',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      }),
      h('path', {
        d: 'M3.33056 15.0021V8.61024',
        stroke: 'currentColor',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      }),
      h('path', {
        d: 'M16.6694 8.61024V15.0021',
        stroke: 'currentColor',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      }),
      h('path', {
        d: 'M6.66528 8.61024V15.0021',
        stroke: 'currentColor',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      }),
      h('path', {
        d: 'M10 8.61024V15.0021',
        stroke: 'currentColor',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      }),
      h('path', {
        d: 'M13.3347 8.61024V15.0021',
        stroke: 'currentColor',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      }),
      h('path', {
        'fill-rule': 'evenodd',
        'clip-rule': 'evenodd',
        d: 'M16.9879 15.0021H3.01209C2.6964 15.0022 2.40789 15.1807 2.26678 15.4631L1.75156 16.4935C1.69338 16.6091 1.66319 16.7368 1.66319 16.8662V17.5031H18.3368V16.8662C18.3368 16.7368 18.3066 16.6091 18.2484 16.4935L17.7332 15.4631C17.5921 15.1807 17.3036 15.0022 16.9879 15.0021Z',
        stroke: 'currentColor',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      }),
      h('path', {
        d: 'M19.1705 17.5031H0.829515',
        stroke: 'currentColor',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      })
    ]
  )

const SchoolIcon = (props: any) =>
  h(
    'svg',
    {
      class: 'w-5 h-5',
      xmlns: 'http://www.w3.org/2000/svg',
      width: '20',
      height: '20',
      viewBox: '0 0 20 20',
      fill: 'none',
      ...props
    },
    [
      h('path', {
        d: 'M1.66319 17.5031H18.3368',
        stroke: 'currentColor',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      }),
      h('path', {
        d: 'M7.08212 14.131H12.9179',
        stroke: 'currentColor',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      }),
      h('path', {
        d: 'M10 14.1309V17.5031',
        stroke: 'currentColor',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      }),
      h('path', {
        d: 'M2.49688 17.5032V11.6674C2.49688 11.207 2.87013 10.8337 3.33056 10.8337H4.99792',
        stroke: 'currentColor',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      }),
      h('path', {
        d: 'M15.0021 10.8337H16.6694C17.1299 10.8337 17.5031 11.207 17.5031 11.6674V17.5032',
        stroke: 'currentColor',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      }),
      h('path', {
        d: 'M4.99791 17.5031V8.63028C4.99733 8.33184 5.15631 8.05586 5.41476 7.90664L9.58316 5.52482C9.8394 5.37845 10.1539 5.37845 10.4102 5.52482L14.5786 7.90664C14.837 8.05586 14.996 8.33184 14.9954 8.63028V17.5031',
        stroke: 'currentColor',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      }),
      h('path', {
        d: 'M10 7.92252C9.98895 7.92252 9.97834 7.92691 9.97053 7.93473C9.96271 7.94255 9.95832 7.95315 9.95832 7.9642C9.95832 7.98722 9.97698 8.00589 10 8.00589C10.023 8.00589 10.0417 7.98722 10.0417 7.9642C10.0417 7.95315 10.0373 7.94255 10.0295 7.93473C10.0217 7.92691 10.0111 7.92252 10 7.92252',
        stroke: 'currentColor',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      }),
      h('path', {
        d: 'M12.501 14.1309V17.5031',
        stroke: 'currentColor',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      }),
      h('path', {
        d: 'M7.49896 17.5031V14.1309',
        stroke: 'currentColor',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      }),
      h('path', {
        d: 'M10 5.41477V2.08005C10 1.84983 10.1866 1.66321 10.4168 1.66321H12.9179C13.1481 1.66321 13.3347 1.84983 13.3347 2.08005V3.26221C13.3347 3.49242 13.1481 3.67905 12.9179 3.67905H10',
        stroke: 'currentColor',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      }),
      h('path', {
        d: 'M12.501 10.8337H7.49896',
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
    name: 'governments',
    location: 'governments-list',
    icon: GovernmentIcon
  },
  {
    name: 'schools',
    location: 'schools-list',
    icon: SchoolIcon
  },
  {
    name: 'teachers',
    location: 'teachers-list',
    icon: GraduationCap
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

