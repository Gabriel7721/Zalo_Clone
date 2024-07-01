<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

definePageMeta({
  layout: 'blank',
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/',
  },
})
</script>
<template>
  <div class="pa-3">
    <v-row class="h-100vh mh-100 auth">
      <v-col class="d-lg-flex align-center justify-center authentication position-relative" cols="12" lg="6">
        <div class="">
          <img
            alt="login-background"
            class="position-relative d-none d-lg-flex"
            height="450"
            src="/images/backgrounds/login-bg.svg"
          />
        </div>
      </v-col>
      <v-col class="d-flex align-center justify-center bg-surface" cols="12" lg="6" xl="4">
        <div class="mt-xl-0 mt-5 mw-100" style="width: 50%">
          <h2 class="text-h3 font-weight-bold mb-2" style="text-align: center">
            {{ t('login.model.welcomeToZola') }}
          </h2>
          <div class="text-subtitle-1 mb-6" style="text-align: center; margin-left: 30px; margin-right: 30px">
            {{ t('login.model.loginToZaloAccountToConnectToZolaWebApplication') }}
          </div>
          <AuthLoginForm />
          <h6 class="text-h6 d-flex mt-6 font-weight-medium justify-center align-center">
            {{ t('login.model.newToZola') }}
            <v-btn
              class="pl-0 text-primary text-body-1 opacity-1 pl-2 font-weight-medium"
              height="auto"
              to="/auth/verifyPhone"
              variant="plain"
            >
              {{ t('login.action.register') }}
            </v-btn>
          </h6>
        </div>
      </v-col>
    </v-row>
  </div>
</template>
