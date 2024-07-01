import VuetifyMoney from 'vuetify-money'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VuetifyMoney)
})
