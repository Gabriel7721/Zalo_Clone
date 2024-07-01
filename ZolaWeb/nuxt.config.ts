// https://nuxt.com/docs/api/configuration/nuxt-config
// @ts-ignore

export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: true },
  typescript: {
    shim: false,
  },
  runtimeConfig: {
    // The private keys which are only available within server-side
    apiSecret: '123',
    // Keys within public, will be also exposed to the client-side
    public: {
      apiBase: process.env.BASE_API_URL,
      wsUrl: process.env.WS_URL,
      nextAuthUrl: process.env.NEXTAUTH_URL,
    },
  },
  css: ['vue-final-modal/style.css'],
  build: {
    //   extractCSS: false,
    transpile: ['vuetify'],
  },
  modules: ['@pinia/nuxt', '@nuxt/devtools', '@nuxtjs/tailwindcss', '@sidebase/nuxt-auth', '@vee-validate/nuxt'],
  plugins: [
    '@/plugins/axios',
    '@/plugins/api',
    '@/plugins/vue-query',
    '@/plugins/vue-money',
    '@/plugins/vue-final-modal',
    '@/plugins/sockjs-client',
    '@/plugins/directive.client',
    '@/plugins/vue3-emoji-picker.client',
    '@/plugins/event-bus',
    '@/plugins/firebase.client',
  ],
  auth: {
    origin: process.env.ORIGIN,
    enableGlobalAppMiddleware: true,
    enableSessionRefreshPeriodically: false,
    enableSessionRefreshOnWindowFocus: false,
  },
  app: {
    head: {
      title: 'Zola',
      link: [
        {
          rel: 'manifest',
          href: '/manifest.webmanifest',
        },
      ],
    },
  },
  nitro: {
    serveStatic: true,
  },
  devServerHandlers: [],
  // @ts-ignore
  vuetify: {
    /* vuetify options */
    vuetifyOptions: {
      // @TODO: list all vuetify options
    },

    moduleOptions: {
      styles: {
        configFile: '~/assets/scss/_variables.scss',
      },
    },
  },
  veeValidate: {
    // disable or enable auto imports
    autoImports: true,
    // Use different names for components
    componentNames: {
      Form: 'VeeForm',
      Field: 'VeeField',
      FieldArray: 'VeeFieldArray',
      ErrorMessage: 'VeeErrorMessage',
    },
  },
})
