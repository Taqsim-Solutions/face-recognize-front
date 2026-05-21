import i18n from '@/i18n'
import router from '@/router'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { vueQueryPluginOptions } from '@/api/vueQuery'
import Can from '@/components/can.vue'

import './assets/index.css'

import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

app.component('Can', Can)

app.use(router).use(i18n).use(VueQueryPlugin, vueQueryPluginOptions).mount('#app')
