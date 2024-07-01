<script setup lang="ts">
import { useToast } from 'vue-toastification'
import * as yup from 'yup'
import { useI18n } from 'vue-i18n'
import TextInput from '@/components/forms/form-validation/TextInput.vue'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const toast = useToast()
const loading = ref(false)
const { $api } = useNuxtApp()
const phone = ref('')

const props = defineProps({
  phone: {
    type: String,
    required: true,
  },
})

onMounted(() => {
  phone.value = route.query.phone
})

const schema = yup.object({
  otp: yup
    .string()
    .required(t('forgotPassword.model.requiredOTP'))
    .label(t('forgotPassword.model.verifyCode'))
    .matches(/^\d{6}$/, t('forgotPassword.validation.otpLength')),
})

const { defineComponentBinds, handleSubmit, setErrors } = useForm({
  validationSchema: schema,
  initialValues: {
    otp: '',
  },
})

const vuetifyConfig = (state: any) => ({
  props: {
    'error-messages': state.errors,
  },
})

const form = ref({
  otp: defineComponentBinds('otp', vuetifyConfig),
})

const sendVerify = handleSubmit(async (values) => {
  loading.value = true
  try {
    const formattedPhone = phone.value.startsWith('0') ? `+84${phone.value.slice(1)}` : phone.value
    await $api.auths.verifyOTPRegister({ otp: values.otp, phoneNo: formattedPhone }).then(
      (response) => {
        toast.success(t('register.message.verifyAccountSuccess'))
        router.push({ path: '/auth/register', query: { phone: phone.value } })
      },
      (error) => {
        setErrors(error.message)
      }
    )
  } catch (error) {
    toast.error(t('register.message.verifyAccountFailed'))
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="d-flex align-center text-center mb-6" />
  <h6 class="text-h6 font-weight-medium mb-2 text-center">
    {{ t('register.model.verifyAccount') }}
  </h6>
  <v-form class="mt-5" @submit="sendVerify">
    <v-label class="text-subtitle-1 font-weight-medium pb-2 text-lightText">
      {{ t('forgotPassword.model.verifyCode') }}
    </v-label>
    <text-input v-model="form.otp" name="otp" type="text" />

    <v-btn block color="primary" flat :loading="loading" size="large" type="submit" style="top: 20px">
      {{ t('forgotPassword.action.confirm') }}
    </v-btn>
  </v-form>
</template>
