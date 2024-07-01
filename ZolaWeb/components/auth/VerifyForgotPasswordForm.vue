<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import * as yup from 'yup'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const toast = useToast()
const loading = ref(false)
const { $api } = useNuxtApp()
const phone = ref('')
const newPasswordEye = ref(false)
const confirmationPasswordEye = ref(false)

onMounted(async () => {
  phone.value = route.query.phone
})

const schema = yup.object({
  otp: yup
    .string()
    .required(t('forgotPassword.model.requiredOTP'))
    .label(t('forgotPassword.model.verifyCode'))
    .matches(/^\d{6}$/, t('forgotPassword.validation.otpLength')),
  password: yup
    .string()
    .required(t('login.validation.requiredPassword'))
    .label(t('chats.model.password'))
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/, t('login.validation.regexPassword')),
  confirm_password: yup.string().oneOf([yup.ref('password')], t('login.validation.passwordConfirmation')),
})

const { defineComponentBinds, handleSubmit, setErrors } = useForm({
  validationSchema: schema,
  initialValues: {
    otp: null,
    password: null,
    confirm_password: '',
  },
})

const vuetifyConfig = (state: any) => ({
  props: {
    'error-messages': state.errors,
  },
})

const form = ref({
  otp: defineComponentBinds('otp', vuetifyConfig),
  password: defineComponentBinds('password', vuetifyConfig),
  confirm_password: defineComponentBinds('confirm_password', vuetifyConfig),
})

const changePassword = handleSubmit(async (values) => {
  loading.value = true

  try {
    await $api.auths
      .verifyOTPForgetPassword(phone.value, {
        otp: values.otp,
        password: values.password,
        confirm_password: values.confirm_password,
      })
      .then(() => {
        toast.success(t('forgotPassword.message.forgotPasswordSuccess'))
        router.push('/auth/login')
      })
  } catch (error) {
    toast.error(t('forgotPassword.message.forgotPasswordFailed'))
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="d-flex align-center text-center mb-6" />
  <v-form class="mt-5" @submit="changePassword">
    <v-label class="text-subtitle-1 font-weight-medium pb-2 text-lightText">
      {{ t('forgotPassword.model.verifyCode') }}
    </v-label>
    <v-text-field v-bind="form.otp" type="text" />
    <v-label class="text-subtitle-1 font-weight-medium pb-2 text-lightText">
      {{ t('forgotPassword.model.newPassword') }}
    </v-label>
    <v-text-field
      v-bind="form.password"
      :append-icon="newPasswordEye ? 'mdi-eye' : 'mdi-eye-off'"
      counter
      :type="newPasswordEye ? 'text' : 'password'"
      @click:append="newPasswordEye = !newPasswordEye"
    />
    <v-label class="text-subtitle-1 font-weight-medium pb-2 text-lightText">
      {{ t('forgotPassword.model.confirmPassword') }}
    </v-label>
    <v-text-field
      v-bind="form.confirm_password"
      :append-icon="confirmationPasswordEye ? 'mdi-eye' : 'mdi-eye-off'"
      counter
      :type="confirmationPasswordEye ? 'text' : 'password'"
      @click:append="confirmationPasswordEye = !confirmationPasswordEye"
    />

    <div class="d-flex align-center text-center mb-6" />
    <v-btn block color="primary" flat :loading="loading" size="large" type="submit">
      {{ t('forgotPassword.action.confirm') }}
    </v-btn>
  </v-form>
</template>
