export { default as Sidebar } from './ui/Sidebar.vue'

import type { Component } from 'vue'
export interface LinkProp {
  name: string
  location: string
  icon: Component
}
export interface NavProps {
  isCollapsed: boolean
}
