<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ref, onMounted } from 'vue'
import * as yup from 'yup'
import { useToast } from 'vue-toastification'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { useForm } from 'vee-validate'
import { useRoute } from 'vue-router'

const route = useRoute()
const { signIn } = useAuth()
const router = useRouter()
const { t } = useI18n()
const toast = useToast()
const loading = ref(false)
const sex = ref('Nam')
const { $api } = useNuxtApp()
const passwordEye = ref(false)
const confirmPasswordEye = ref(false)
const date = ref(new Date().setDate(new Date().getDate() - 1))
const phone = ref('')

const props = defineProps({
  phone: {
    type: String,
    required: true,
  },
})

const yesterday = () => {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return yesterday
}

onMounted(async () => {
  phone.value = route.query.phone
})

const formatDate = (date: Date) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`
}

const schema = yup.object({
  name: yup.string().required(t('register.validation.name')).label(t('register.model.name')),
  password: yup
    .string()
    .required(t('login.validation.requiredPassword'))
    .label(t('chats.model.password'))
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/, t('login.validation.regexPassword')),
  retype_password: yup.string().oneOf([yup.ref('password')], t('login.validation.passwordConfirmation')),
})

const vuetifyConfig = (state: any) => ({
  props: {
    'error-messages': state.errors,
  },
})

const { defineComponentBinds, handleSubmit, setErrors } = useForm({
  validationSchema: schema,
  initialValues: {
    name: '',
    password: null,
    retype_password: '',
  },
})

const form = ref({
  name: defineComponentBinds('name', vuetifyConfig),
  password: defineComponentBinds('password', vuetifyConfig),
  retype_password: defineComponentBinds('retype_password', vuetifyConfig),
})

const register = handleSubmit(async (values) => {
  loading.value = true

  try {
    const sexValue = sex.value === 'Nam' ? 1 : 0
    await $api.auths
      .register({
        name: values.name,
        password: values.password,
        retype_password: values.retype_password,
        phone: phone.value,
        sex: sexValue,
        birthday: formatDate(date.value),
        role_id: '1',
      })
      .then(
        (response) => {
          toast.success(t('register.message.registerSuccess'))
          signIn('credentials', {
            phone: phone.value,
            password: values.password,
            redirect: false,
            callbackUrl: '/api/v1/auth/login',
          }).then(({ error, ok }) => {
            if (error) {
              toast.error(t('login.message.loginFailed'))
              loading.value = false
              setErrors(error)
            } else {
              router.push({ path: '/' })
            }
          })
        },
        (error) => {
          setErrors(error.error)
        }
      )
  } catch (error) {
    setErrors(error)
    toast.error(t('register.message.registerFailed'))
  } finally {
    loading.value = false
  }
})
</script>
<template>
  <v-form @submit="register">
    <v-label class="text-subtitle-1 font-weight-medium pb-2 mt-5">
      {{ t('register.model.name') }}
    </v-label>
    <v-text-field v-bind="form.name" type="text" />

    <v-label class="text-subtitle-1 font-weight-medium pb-2">
      {{ t('register.model.password') }}
    </v-label>
    <v-text-field
      v-bind="form.password"
      :append-icon="passwordEye ? 'mdi-eye' : 'mdi-eye-off'"
      counter
      :type="passwordEye ? 'text' : 'password'"
      @click:append="passwordEye = !passwordEye"
    />
    <v-label class="text-subtitle-1 font-weight-medium pb-2">
      {{ t('register.model.retypePassword') }}
    </v-label>
    <v-text-field
      v-bind="form.retype_password"
      :append-icon="confirmPasswordEye ? 'mdi-eye' : 'mdi-eye-off'"
      counter
      :type="confirmPasswordEye ? 'text' : 'password'"
      @click:append="confirmPasswordEye = !confirmPasswordEye"
    />
    <v-label class="text-subtitle-1 font-weight-medium pb-2">
      {{ t('register.model.sex') }}
    </v-label>
    <v-radio-group v-model="sex" inline name="sex">
      <v-radio label="Nam" value="Nam" color="primary" />
      <v-radio label="Nữ" value="Nữ" color="primary" />
    </v-radio-group>
    <v-label class="text-subtitle-1 font-weight-medium pb-2">
      {{ t('register.model.birthday') }}
    </v-label>
    <vue-date-picker v-model="date" :enable-time-picker="false" :format="formatDate" :max-date="yesterday()" />
    <div class="d-flex align-center text-center mb-6" />
    <v-btn block color="primary" flat :loading="loading" size="large" type="submit">
      {{ t('register.action.confirm') }}
    </v-btn>
  </v-form>
</template>
