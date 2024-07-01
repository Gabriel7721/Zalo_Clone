<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'vue-toastification'
import { useI18n } from 'vue-i18n'
import * as yup from 'yup'
import TextInput from '@/components/forms/form-validation/TextInput.vue'

const router = useRouter()
const { signIn, data } = useAuth()
const toast = useToast()
const { t } = useI18n()
const loading = ref(false)
const passwordEye = ref(false)

const schema = yup.object({
  phone: yup
    .string()
    .required(t('login.validation.requiredPhone'))
    .label(t('chats.model.phone'))
    .matches(/^[0-9]+$/, t('login.validation.phone'))
    .min(10, t('login.validation.minPhone'))
    .max(20, t('login.validation.maxPhone')),
  password: yup
    .string()
    .required(t('login.validation.requiredPassword'))
    .label(t('chats.model.password'))
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/, t('login.validation.regexPassword')),
})

const { defineComponentBinds, handleSubmit, setErrors } = useForm({
  validationSchema: schema,
  initialValues: {
    phone: '',
    password: '',
  },
})

const vuetifyConfig = (state: any) => ({
  props: {
    'error-messages': state.errors,
  },
})

const form = ref({
  phone: defineComponentBinds('phone', vuetifyConfig),
  password: defineComponentBinds('password', vuetifyConfig),
})

const login = handleSubmit(async (values) => {
  loading.value = true
  await signIn('credentials', {
    phone: values.phone,
    password: values.password,
    redirect: false,
  })
    .then(({ error, ok }) => {
      if (error) {
        toast.error(t('login.message.loginFailed'))
        loading.value = false
      } else {
        router.push({ path: '/' })
      }
    })
    .finally(() => {
      loading.value = false
    })
})
</script>

<template>
  <div class="d-flex align-center text-center mb-6" />
  <v-form class="mt-5" @submit="login">
    <v-label class="text-subtitle-1 font-weight-medium pb-2 text-lightText">{{ t('login.model.phone') }}</v-label>
    <text-input v-model="form.phone" name="phone" type="text" />
    <v-label class="text-subtitle-1 font-weight-medium pb-2 text-lightText">{{ t('login.model.password') }}</v-label>
    <v-text-field
      v-bind="form.password"
      :append-icon="passwordEye ? 'mdi-eye' : 'mdi-eye-off'"
      :type="passwordEye ? 'text' : 'password'"
      @click:append="passwordEye = !passwordEye"
    />
    <div class="d-flex flex-wrap align-center my-3 ml-n2">
      <div class="ml-sm-auto">
        <NuxtLink
          class="text-primary text-decoration-none text-body-1 opacity-1 font-weight-medium"
          to="/auth/forgotPassword"
        >
          {{ t('login.action.forgotPassword') }}
        </NuxtLink>
      </div>
    </div>
    <v-btn block color="primary" flat :loading="loading" size="large" type="submit">
      {{ t('login.action.login') }}
    </v-btn>
  </v-form>
</template>
