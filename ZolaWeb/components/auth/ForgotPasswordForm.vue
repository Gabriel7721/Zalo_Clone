<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'vue-toastification'
import * as yup from 'yup'
import { useI18n } from 'vue-i18n'
import TextInput from '@/components/forms/form-validation/TextInput.vue'

const router = useRouter()
const { t } = useI18n()
const toast = useToast()
const loading = ref(false)
const { $api } = useNuxtApp()

const schema = yup.object({
  phone: yup
    .string()
    .required(t('login.validation.requiredPhone'))
    .label(t('chats.model.phone'))
    .matches(/^[0-9]+$/, t('login.validation.phone'))
    .min(10, t('login.validation.minPhone'))
    .max(20, t('login.validation.maxPhone')),
})

const { defineComponentBinds, handleSubmit, setErrors } = useForm({
  validationSchema: schema,
  initialValues: {
    phone: '',
  },
})

const vuetifyConfig = (state: any) => ({
  props: {
    'error-messages': state.errors,
  },
})

const form = ref({
  phone: defineComponentBinds('phone', vuetifyConfig),
})

const sendOTP = handleSubmit(async (values) => {
  loading.value = true
  try {
    const formattedPhone = values.phone.startsWith('0') ? `+84${values.phone.slice(1)}` : values.phone
    await $api.auths.sendOTPForgetPassword({ phoneNo: formattedPhone })
    toast.success(t('forgotPassword.message.sendOTPSuccess'))
    router.push({ path: '/auth/verifyForgotPassword', query: { phone: values.phone } })
  } catch (error) {
    setErrors(error.message)
    toast.error(t('forgotPassword.message.sendOTPFailed'))
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="d-flex align-center text-center mb-6" />
  <v-form class="mt-5" @submit="sendOTP">
    <v-label class="text-subtitle-1 font-weight-medium pb-2 text-lightText">
      {{ t('forgotPassword.model.phone') }}
    </v-label>
    <text-input v-model="form.phone" name="phone" type="text" />
    <div class="d-flex align-center text-center mb-6" />
    <v-btn block color="primary" flat :loading="loading" size="large" type="submit">
      {{ t('forgotPassword.action.continue') }}
    </v-btn>
  </v-form>
</template>
