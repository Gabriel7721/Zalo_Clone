<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ref, defineProps } from 'vue'
import * as yup from 'yup'
import { useToast } from 'vue-toastification'
import { useForm } from 'vee-validate'
import TextInput from '@/components/forms/form-validation/TextInput.vue'

const router = useRouter()
const { t } = useI18n()
const toast = useToast()
const loading = ref(false)
const { $api } = useNuxtApp()

const props = defineProps({
  phone: {
    type: String,
    required: true,
  },
})

const schema = yup.object({
  phone: yup
    .string()
    .required(t('login.validation.requiredPhone'))
    .label(t('chats.model.phone'))
    .matches(/^[0-9]+$/, t('login.validation.phone'))
    .min(10, t('login.validation.minPhone'))
    .max(20, t('login.validation.maxPhone')),
})

const vuetifyConfig = (state: any) => ({
  props: {
    'error-messages': state.errors,
  },
})

const { defineComponentBinds, handleSubmit, setErrors } = useForm({
  validationSchema: schema,
  initialValues: {
    phone: '',
  },
})

const form = ref({
  phone: defineComponentBinds('phone', vuetifyConfig),
})

const verify = handleSubmit(async (values) => {
  loading.value = true
  try {
    const formattedPhone = values.phone.startsWith('0') ? `+84${values.phone.slice(1)}` : values.phone
    await $api.auths.sendOTPRegister({ phoneNo: formattedPhone }).then(
      (response) => {
        toast.success(t('register.message.sendingOTP'))
        router.push({ path: '/auth/verifyRegister', query: { phone: values.phone } })
      },
      (error) => {
        setErrors(error.error)
      }
    )
  } catch (error) {
    toast.error(t('register.message.phoneInvalidOrExistPleaseTryAgain'))
  } finally {
    loading.value = false
  }
})
</script>
<template>
  <v-form ref="form" class="mt-5" @submit="verify">
    <v-label class="text-subtitle-1 font-weight-medium pb-2">
      {{ t('register.model.phone') }}
    </v-label>
    <text-input v-model="form.phone" name="phone" type="text" />
    <div class="d-flex align-center text-center mb-6" />
    <v-btn block color="primary" flat :loading="loading" size="large" type="submit">
      {{ t('register.action.confirm') }}
    </v-btn>
  </v-form>
</template>
