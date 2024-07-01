import { createVuetify } from 'vuetify'
import '@mdi/font/css/materialdesignicons.css'
import * as components from 'vuetify/components'
import * as componentLabs from 'vuetify/labs/components'
import * as directives from 'vuetify/directives'
import PerfectScrollbar from 'vue3-perfect-scrollbar'
import VueApexCharts from 'vue3-apexcharts'
import VueTablerIcons from 'vue-tabler-icons'
import Toast from 'vue-toastification'

import Maska from 'maska'
import 'vue3-carousel/dist/carousel.css'
import '@/assets/scss/style.scss'
import 'vue-toastification/dist/index.css'

import 'vue3-easy-data-table/dist/style.css'
// i18
import { createI18n } from 'vue-i18n'
import VueScrollTo from 'vue-scrollto'
import VueDatePicker from '@vuepic/vue-datepicker'
import messages from '@/utils/locales/messages'

// ScrollTop
import { BLUE_THEME, AQUA_THEME, PURPLE_THEME, GREEN_THEME, CYAN_THEME, ORANGE_THEME } from '@/theme/LightTheme'
import {
  DARK_BLUE_THEME,
  DARK_AQUA_THEME,
  DARK_ORANGE_THEME,
  DARK_PURPLE_THEME,
  DARK_GREEN_THEME,
  DARK_CYAN_THEME,
} from '@/theme/DarkTheme'
//
import '@vuepic/vue-datepicker/dist/main.css'
import 'viewerjs/dist/viewer.css'
import VueViewer from 'v-viewer'

const i18n = createI18n({
  legacy: false,
  locale: 'vn',
  messages,
  silentTranslationWarn: true,
  silentFallbackWarn: true,
})

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    components: {
      ...componentLabs,
      ...components,
    },
    directives,
    theme: {
      defaultTheme: 'BLUE_THEME',
      themes: {
        BLUE_THEME,
        AQUA_THEME,
        PURPLE_THEME,
        GREEN_THEME,
        CYAN_THEME,
        ORANGE_THEME,
        DARK_BLUE_THEME,
        DARK_AQUA_THEME,
        DARK_ORANGE_THEME,
        DARK_PURPLE_THEME,
        DARK_GREEN_THEME,
        DARK_CYAN_THEME,
      },
    },
    defaults: {
      VCard: {
        rounded: 'md',
      },
      VTextField: {
        variant: 'outlined',
        density: 'comfortable',
        color: 'primary',
      },
      VTextarea: {
        variant: 'outlined',
        density: 'comfortable',
        color: 'primary',
      },
      VSelect: {
        variant: 'outlined',
        density: 'comfortable',
        color: 'primary',
      },
      VListItem: {
        minHeight: '45px',
      },
      VTooltip: {
        location: 'top',
      },
      VueDatePicker: {
        density: 'comfortable',
      },
    },
  })

  const i18n = createI18n({
    legacy: false,
    locale: 'vn',
    messages,
    silentTranslationWarn: true,
    silentFallbackWarn: true,
  })
  nuxtApp.vueApp.use(vuetify)
  nuxtApp.vueApp.use(PerfectScrollbar)
  nuxtApp.vueApp.use(VueApexCharts)
  nuxtApp.vueApp.use(VueTablerIcons)
  nuxtApp.vueApp.use(Maska)
  nuxtApp.vueApp.use(i18n)
  nuxtApp.vueApp.use(Toast, {})
  // ScrollTop Use
  // app.use(VueScrollTo);
  nuxtApp.vueApp.use(VueScrollTo, {
    duration: 1000,
    easing: 'ease',
  })
  nuxtApp.vueApp.component('VueDatePicker', VueDatePicker)
  nuxtApp.vueApp.use(VueViewer)
  nuxtApp.vueApp.component('VueViewer', VueViewer)
})
