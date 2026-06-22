import type { LinkProp } from '..'
import { h } from 'vue'

const DashboardIcon = (props: any) =>
  h(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '22',
      height: '22',
      viewBox: '0 0 20 20',
      fill: 'none',
      ...props
    },
    [
      h('path', {
        'fill-rule': 'evenodd',
        'clip-rule': 'evenodd',
        d: 'M16.535 6.91604L11.535 3.02687C10.6325 2.32438 9.36833 2.32438 8.465 3.02687L3.465 6.91604C2.85583 7.38938 2.5 8.11771 2.5 8.88937V15.0002C2.5 16.381 3.61917 17.5002 5 17.5002H15C16.3808 17.5002 17.5 16.381 17.5 15.0002V8.88937C17.5 8.11771 17.1442 7.38938 16.535 6.91604Z',
        stroke: 'currentColor',
        'stroke-width': '1.5'
      }),
      h('path', {
        d: 'M7.5 14.1667H12.5',
        stroke: 'currentColor',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      })
    ]
  )

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
      class: 'w-[22px] h-[22px]',
      xmlns: 'http://www.w3.org/2000/svg',
      width: '24',
      height: '24',
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

const StudentsIcon = (props: any) =>
  h(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '23',
      height: '17',
      viewBox: '0 0 19 13',
      fill: 'none',
      ...props
    },
    [
      h('path', {
        d: 'M14.0833 6.38661V9.71994C14.0833 11.1007 12.964 12.2199 11.5833 12.2199H6.58333C5.20262 12.2199 4.08333 11.1007 4.08333 9.71994V6.38661M8.33798 0.925955L0.75 4.71994L8.33798 8.51393C8.80719 8.74854 9.35948 8.74854 9.82869 8.51393L17.4167 4.71994L9.82869 0.925955C9.35948 0.691348 8.80719 0.691348 8.33798 0.925955Z',
        stroke: 'currentColor',
        'stroke-width': '1.5',
        'stroke-linejoin': 'round'
      })
    ]
  )

const TeachersIcon = (props: any) =>
  h(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '21',
      height: '21',
      viewBox: '0 0 19 19',
      fill: 'none',
      ...props
    },
    [
      h('path', {
        d: 'M5.75 12.8333H5C5 13.0958 5.13724 13.3392 5.36184 13.4751C5.58645 13.6109 5.86574 13.6195 6.09822 13.4976L5.75 12.8333ZM0 17.4167C0 17.8309 0.335786 18.1667 0.75 18.1667C1.16421 18.1667 1.5 17.8309 1.5 17.4167H0.75H0ZM8.45234 11.4167L8.80056 12.081L8.82844 12.0663L8.855 12.0494L8.45234 11.4167ZM9.74278 13.4628L10.095 14.125L10.1181 14.1127L10.1403 14.0988L9.74278 13.4628ZM6.38689 15.2478L6.03469 14.5856L6.01158 14.5979L5.98939 14.6118L6.38689 15.2478ZM4.05648 14.6613L4.70767 14.2892V14.2892L4.05648 14.6613ZM3.90118 12.8779C3.69567 12.5183 3.23753 12.3933 2.8779 12.5988C2.51826 12.8043 2.39331 13.2625 2.59882 13.6221L3.25 13.25L3.90118 12.8779ZM10.1389 11.8148L10.782 11.429V11.429L10.1389 11.8148ZM6.5 15.75C6.5 15.3358 6.16421 15 5.75 15C5.33579 15 5 15.3358 5 15.75H5.75H6.5ZM5 17.4167C5 17.8309 5.33579 18.1667 5.75 18.1667C6.16421 18.1667 6.5 17.8309 6.5 17.4167H5.75H5ZM9.70059 10.764L9.29793 11.3968L10.5634 12.2021L10.9661 11.5693L10.3333 11.1667L9.70059 10.764ZM13.8827 6.98599C14.1051 6.63653 14.0021 6.17297 13.6527 5.95059C13.3032 5.72821 12.8396 5.83122 12.6173 6.18068L13.25 6.58333L13.8827 6.98599ZM3.33333 2.83333C3.33333 3.24755 3.66912 3.58333 4.08333 3.58333C4.49755 3.58333 4.83333 3.24755 4.83333 2.83333H4.08333H3.33333ZM14.9167 8.33333C14.5025 8.33333 14.1667 8.66912 14.1667 9.08333C14.1667 9.49755 14.5025 9.83333 14.9167 9.83333V9.08333V8.33333ZM7.41667 3.33333C7.00245 3.33333 6.66667 3.66912 6.66667 4.08333C6.66667 4.49755 7.00245 4.83333 7.41667 4.83333V4.08333V3.33333ZM14.0833 4.83333C14.4975 4.83333 14.8333 4.49755 14.8333 4.08333C14.8333 3.66912 14.4975 3.33333 14.0833 3.33333V4.08333V4.83333ZM7.41667 5.83333C7.00245 5.83333 6.66667 6.16912 6.66667 6.58333C6.66667 6.99755 7.00245 7.33333 7.41667 7.33333V6.58333V5.83333ZM10.75 7.33333C11.1642 7.33333 11.5 6.99755 11.5 6.58333C11.5 6.16912 11.1642 5.83333 10.75 5.83333V6.58333V7.33333ZM4.91667 6.58333H4.16667C4.16667 7.08959 3.75626 7.5 3.25 7.5V8.25V9C4.58469 9 5.66667 7.91802 5.66667 6.58333H4.91667ZM3.25 8.25V7.5C2.74374 7.5 2.33333 7.08959 2.33333 6.58333H1.58333H0.833333C0.833333 7.91802 1.91531 9 3.25 9V8.25ZM1.58333 6.58333H2.33333C2.33333 6.07707 2.74374 5.66667 3.25 5.66667V4.91667V4.16667C1.91531 4.16667 0.833333 5.24864 0.833333 6.58333H1.58333ZM3.25 4.91667V5.66667C3.75626 5.66667 4.16667 6.07707 4.16667 6.58333H4.91667H5.66667C5.66667 5.24864 4.58469 4.16667 3.25 4.16667V4.91667ZM5.75 12.8333H6.5V12.4167H5.75H5V12.8333H5.75ZM0.75 12.4167H0V17.4167H0.75H1.5V12.4167H0.75ZM5.75 12.8333L6.09822 13.4976L8.80056 12.081L8.45234 11.4167L8.10412 10.7524L5.40178 12.1691L5.75 12.8333ZM9.74278 13.4628L9.39059 12.8007L6.03469 14.5856L6.38689 15.2478L6.73908 15.9099L10.095 14.125L9.74278 13.4628ZM4.05648 14.6613L4.70767 14.2892L3.90118 12.8779L3.25 13.25L2.59882 13.6221L3.4053 15.0335L4.05648 14.6613ZM8.45234 11.4167L8.855 12.0494C9.07311 11.9106 9.36277 11.979 9.49578 12.2007L10.1389 11.8148L10.782 11.429C10.2148 10.4836 8.97975 10.1921 8.04968 10.7839L8.45234 11.4167ZM6.38689 15.2478L5.98939 14.6118C5.54805 14.8876 4.96588 14.7411 4.70767 14.2892L4.05648 14.6613L3.4053 15.0334C4.08604 16.2247 5.62087 16.611 6.78439 15.8838L6.38689 15.2478ZM0.75 12.4167H1.5C1.5 11.4502 2.2835 10.6667 3.25 10.6667V9.91667V9.16667C1.45507 9.16667 0 10.6217 0 12.4167H0.75ZM10.1389 11.8148L9.49578 12.2007C9.62469 12.4156 9.55774 12.6941 9.34528 12.8268L9.74278 13.4628L10.1403 14.0988C11.0462 13.5326 11.3317 12.3451 10.782 11.429L10.1389 11.8148ZM5.75 12.4167H6.5C6.5 10.6217 5.04493 9.16667 3.25 9.16667V9.91667V10.6667C4.2165 10.6667 5 11.4502 5 12.4167H5.75ZM5.75 15.75H5V17.4167H5.75H6.5V15.75H5.75ZM10.3333 11.1667L10.9661 11.5693L13.8827 6.98599L13.25 6.58333L12.6173 6.18068L9.70059 10.764L10.3333 11.1667ZM4.08333 2.83333H4.83333V2.41667H4.08333H3.33333V2.83333H4.08333ZM5.75 0.75V1.5H15.75V0.75V0H5.75V0.75ZM17.4167 2.41667H16.6667V7.41667H17.4167H18.1667V2.41667H17.4167ZM15.75 9.08333V8.33333H14.9167V9.08333V9.83333H15.75V9.08333ZM17.4167 7.41667H16.6667C16.6667 7.92293 16.2563 8.33333 15.75 8.33333V9.08333V9.83333C17.0847 9.83333 18.1667 8.75135 18.1667 7.41667H17.4167ZM15.75 0.75V1.5C16.2563 1.5 16.6667 1.91041 16.6667 2.41667H17.4167H18.1667C18.1667 1.08198 17.0847 0 15.75 0V0.75ZM4.08333 2.41667H4.83333C4.83333 1.91041 5.24374 1.5 5.75 1.5V0.75V0C4.41531 0 3.33333 1.08198 3.33333 2.41667H4.08333ZM7.41667 4.08333V4.83333H14.0833V4.08333V3.33333H7.41667V4.08333ZM7.41667 6.58333V7.33333H10.75V6.58333V5.83333H7.41667V6.58333Z',
        fill: 'currentColor'
      })
    ]
  )

const UnknownFacesIcon = (props: any) =>
  h(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '20',
      height: '20',
      viewBox: '0 0 20 20',
      fill: 'none',
      ...props
    },
    [
      h('path', {
        d: 'M14.1667 2.91699C15.2526 3.56853 16.1778 3.81837 17.0215 3.8001C17.275 3.79462 17.5 3.9876 17.5 4.24117V10.0003C17.5 10.1895 17.4799 10.5192 17.4337 10.7027C16.9526 12.6147 15.5529 16.3505 10 18.3337C4.44707 16.3505 3.04743 12.6147 2.56628 10.7027C2.52011 10.5192 2.5 10.1895 2.5 10.0003V4.24117C2.5 3.9876 2.72498 3.79462 2.97848 3.8001C3.82225 3.81837 4.74744 3.56853 5.83333 2.91699C7.91667 1.66699 9.58333 1.66699 10 1.66699C10.4167 1.66699 12.0833 1.66699 14.1667 2.91699Z',
        stroke: 'currentColor',
        'stroke-width': '1.5',
        'stroke-linejoin': 'round'
      }),
      h('path', {
        d: 'M13.3333 9.58333C13.3333 11.4243 11.841 12.9167 10 12.9167C8.15906 12.9167 6.66667 11.4243 6.66667 9.58333C6.66667 7.74238 8.15906 6.25 10 6.25C11.841 6.25 13.3333 7.74238 13.3333 9.58333Z',
        stroke: 'currentColor',
        'stroke-width': '1.5'
      }),
      h('path', {
        d: 'M12.13 7.26562L7.68555 11.7101',
        stroke: 'currentColor',
        'stroke-width': '1.5',
        'stroke-linecap': 'round'
      })
    ]
  )

const DavomadIcon = (props: any) =>
  h(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '20',
      height: '20',
      viewBox: '0 0 20 20',
      fill: 'none',
      ...props
    },
    [
      h('path', {
        d: 'M13.3333 1.66602V4.99935',
        stroke: 'currentColor',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      }),
      h('path', {
        d: 'M6.66667 1.66602V4.99935',
        stroke: 'currentColor',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      }),
      h('path', {
        d: 'M2.5 7.50065H17.5',
        stroke: 'currentColor',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      }),
      h('path', {
        'fill-rule': 'evenodd',
        'clip-rule': 'evenodd',
        d: 'M15.8333 3.33398H4.16667C3.24583 3.33398 2.5 4.07982 2.5 5.00065V15.834C2.5 16.7548 3.24583 17.5007 4.16667 17.5007H15.8333C16.7542 17.5007 17.5 16.7548 17.5 15.834V5.00065C17.5 4.07982 16.7542 3.33398 15.8333 3.33398Z',
        stroke: 'currentColor',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      }),
      h('path', {
        d: 'M5.84418 10.6068C5.72918 10.6068 5.63585 10.7001 5.63668 10.8151C5.63668 10.9301 5.73001 11.0234 5.84501 11.0234C5.96001 11.0234 6.05335 10.9301 6.05335 10.8151C6.05335 10.7001 5.96001 10.6068 5.84418 10.6068',
        stroke: 'currentColor',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      }),
      h('path', {
        d: 'M10.0108 10.6068C9.89581 10.6068 9.80247 10.7001 9.80331 10.8151C9.80331 10.9301 9.89664 11.0234 10.0116 11.0234C10.1266 11.0234 10.22 10.9301 10.22 10.8151C10.22 10.7001 10.1266 10.6068 10.0108 10.6068',
        stroke: 'currentColor',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      }),
      h('path', {
        d: 'M14.1776 10.6068C14.0626 10.6068 13.9692 10.7001 13.9701 10.8151C13.9701 10.9301 14.0634 11.0234 14.1784 11.0234C14.2934 11.0234 14.3867 10.9301 14.3867 10.8151C14.3867 10.7001 14.2934 10.6068 14.1776 10.6068',
        stroke: 'currentColor',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      }),
      h('path', {
        d: 'M5.84418 13.9408C5.72918 13.9408 5.63585 14.0341 5.63668 14.1491C5.63668 14.2641 5.73001 14.3574 5.84501 14.3574C5.96001 14.3574 6.05335 14.2641 6.05335 14.1491C6.05335 14.0341 5.96001 13.9408 5.84418 13.9408',
        stroke: 'currentColor',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      }),
      h('path', {
        d: 'M10.0108 13.9408C9.89581 13.9408 9.80247 14.0341 9.80331 14.1491C9.80331 14.2641 9.89664 14.3574 10.0116 14.3574C10.1266 14.3574 10.22 14.2641 10.22 14.1491C10.22 14.0341 10.1266 13.9408 10.0108 13.9408',
        stroke: 'currentColor',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      })
    ]
  )

const SettingsIcon = (props: any) =>
  h(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '22',
      height: '22',
      viewBox: '0 0 20 20',
      fill: 'none',
      ...props
    },
    [
      h('path', {
        'fill-rule': 'evenodd',
        'clip-rule': 'evenodd',
        d: 'M16.5152 11.4978L16.556 11.4876C17.1126 11.3484 17.5031 10.8482 17.5031 10.2744V9.72569C17.5031 9.15188 17.1126 8.65169 16.5559 8.5125L16.5151 8.50228C16.0907 8.39594 15.7417 8.09483 15.5744 7.69057C15.4071 7.28631 15.4412 6.82668 15.6663 6.45152L15.6835 6.42291C15.9825 5.93004 15.9065 5.29675 15.4994 4.88858L15.1114 4.50057C14.7057 4.09482 14.0758 4.01727 13.5838 4.31248L13.5477 4.33416C13.1726 4.55923 12.713 4.59323 12.3088 4.42582C11.9046 4.25841 11.6037 3.90939 11.4976 3.48498L11.4874 3.44424C11.3482 2.88757 10.848 2.49707 10.2742 2.49707H9.72547C9.15166 2.49707 8.65147 2.88758 8.51229 3.44426L8.50206 3.48511C8.39573 3.90951 8.09463 4.25845 7.69036 4.42577C7.2861 4.59309 6.82647 4.55901 6.4513 4.33389L6.42267 4.31673C5.92981 4.01773 5.29652 4.0937 4.88836 4.50079L4.50036 4.88879C4.09459 5.29447 4.01701 5.92426 4.31219 6.41629L4.33355 6.45188C4.55867 6.82705 4.59276 7.28668 4.42544 7.69095C4.25813 8.09522 3.90919 8.39632 3.48478 8.50266L3.44407 8.51285C2.88741 8.65203 2.49687 9.15219 2.49687 9.72598V10.2748C2.49687 10.8485 2.88719 11.3486 3.44376 11.4878L3.48421 11.4979C3.90867 11.604 4.25779 11.9049 4.42534 12.3091C4.59289 12.7132 4.55907 13.1729 4.33416 13.5482L4.31254 13.5842C4.01734 14.0762 4.09487 14.706 4.50059 15.1118L4.88863 15.4998C5.29423 15.9056 5.92393 15.9832 6.41589 15.688L6.45164 15.6666C6.82681 15.4414 7.28644 15.4073 7.69071 15.5747C8.09499 15.742 8.3961 16.0909 8.50244 16.5153L8.51264 16.5561C8.6518 17.1128 9.15196 17.5033 9.72577 17.5033H10.2746C10.8483 17.5033 11.3484 17.113 11.4876 16.5564L11.4977 16.5159C11.6038 16.0915 11.9047 15.7424 12.3088 15.5748C12.713 15.4073 13.1727 15.4411 13.5479 15.666L13.584 15.6876C14.076 15.9828 14.7058 15.9053 15.1116 15.4996L15.4996 15.1115C15.9054 14.7059 15.983 14.0762 15.6878 13.5843L15.6664 13.5485C15.4413 13.1734 15.4072 12.7137 15.5745 12.3095C15.7418 11.9052 16.0908 11.6041 16.5152 11.4978Z',
        stroke: 'currentColor',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      }),
      h('circle', {
        cx: '9.99989',
        cy: '10',
        r: '1.73149',
        stroke: 'currentColor',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      })
    ]
  )

const HelpIcon = (props: any) =>
  h(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '20',
      height: '20',
      viewBox: '0 0 24 24',
      fill: 'none',
      ...props
    },
    [
      h('circle', {
        cx: '12', cy: '12', r: '10',
        stroke: 'currentColor',
        'stroke-width': '1.5'
      }),
      h('path', {
        d: 'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3',
        stroke: 'currentColor',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      }),
      h('path', {
        d: 'M12 17h.01',
        stroke: 'currentColor',
        'stroke-width': '2',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      })
    ]
  )

const PremiumIcon = (props: any) =>
  h(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '20',
      height: '20',
      viewBox: '0 0 20 20',
      fill: 'none',
      ...props
    },
    [
      h('path', {
        d: 'M10 1.66699L12.5751 6.88491L18.3333 7.72533L14.1667 11.7861L15.1503 17.5212L10 14.8137L4.84975 17.5212L5.83333 11.7861L1.66667 7.72533L7.42492 6.88491L10 1.66699Z',
        stroke: 'currentColor',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      })
    ]
  )

const AbsenceIcon = (props: any) =>
  h(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '20',
      height: '20',
      viewBox: '0 0 20 20',
      fill: 'none',
      ...props
    },
    [
      h('path', {
        d: 'M11.6667 1.66699H5.00004C4.55801 1.66699 4.13409 1.84259 3.82153 2.15515C3.50897 2.46771 3.33337 2.89163 3.33337 3.33366V16.667C3.33337 17.109 3.50897 17.5329 3.82153 17.8455C4.13409 18.1581 4.55801 18.3337 5.00004 18.3337H15C15.4421 18.3337 15.866 18.1581 16.1786 17.8455C16.4911 17.5329 16.6667 17.109 16.6667 16.667V6.66699L11.6667 1.66699Z',
        stroke: 'currentColor',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      }),
      h('path', {
        d: 'M11.6666 1.66699V6.66699H16.6666M7.5 11.667L9.16667 13.3337L12.5 10.0003',
        stroke: 'currentColor',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      })
    ]
  )

const ReportIcon = (props: any) =>
  h(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '20',
      height: '20',
      viewBox: '0 0 20 20',
      fill: 'none',
      ...props
    },
    [
      h('path', {
        d: 'M5 12.5V15M10 8.33V15M15 5V15M3.33 17.5H16.67',
        stroke: 'currentColor',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      })
    ]
  )

export const links: LinkProp[] = [
  {
    name: 'dashboard.statistics',
    location: 'home',
    icon: DashboardIcon
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
    name: 'premium',
    location: 'premium',
    icon: PremiumIcon
  },
  {
    name: 'absences',
    location: 'absences',
    icon: AbsenceIcon
  },
  {
    name: 'reports',
    location: 'reports',
    icon: ReportIcon
  },
  {
    name: 'schools',
    location: 'schools-list',
    icon: SchoolIcon
  },
  {
    name: 'teachers',
    location: 'teachers-list',
    icon: TeachersIcon
  },
  {
    name: 'students',
    location: 'students-list',
    icon: StudentsIcon
  },
  {
    name: 'davomad',
    location: 'attendances-list',
    icon: DavomadIcon
  },
  {
    name: 'unknown-faces',
    location: 'unknown-faces',
    icon: UnknownFacesIcon
  },
  {
    name: 'help',
    location: 'help',
    icon: HelpIcon
  },
  {
    name: 'sozlamalar',
    location: 'organization-settings',
    icon: SettingsIcon
  }
]
