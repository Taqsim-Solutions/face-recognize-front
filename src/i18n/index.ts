import { createI18n } from 'vue-i18n'
import i18nData from './i18nData'

const locale = localStorage.getItem('language')

const i18n = createI18n({
  legacy: false,
  locale: locale ? locale : 'uz',
  fallbackLocale: 'uzc',
  messages: i18nData
})

export default i18n
