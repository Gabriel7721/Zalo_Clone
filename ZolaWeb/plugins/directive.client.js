import { defineNuxtPlugin } from '#app'
import clickOutside from '@/directives/click-outside'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('click-outside', clickOutside)
})
