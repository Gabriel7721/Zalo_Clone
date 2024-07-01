import { useI18n } from 'vue-i18n';
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
      <v-col class="d-lg-flex align-center justify-center authentication position-relative" cols="12" lg="6" xl="1">
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
            {{ t('forgotPassword.model.forgotPassword') }}
          </h2>

          <AuthForgotPasswordForm />
          <v-btn
            class="pl-0 text-primary text-body-1 opacity-1 pl-2 font-weight-medium"
            height="auto"
            to="/auth/login"
            variant="plain"
            style="top: 20px"
          >
            {{ t('forgotPassword.action.backToLogin') }}
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </div>
</template>
