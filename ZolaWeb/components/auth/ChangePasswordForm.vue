<script setup lang="ts">
import * as yup from 'yup'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'

const props = defineProps({
  user: Object,
})

const { t } = useI18n()
const emit = defineEmits(['closeDialog'])

const passwordEye = ref(false)
const newPasswordEye = ref(false)
const confirmationPasswordEye = ref(false)
const loading = ref(false)
const $api = useNuxtApp().$api
const toast = useToast()

const schema = yup.object({
  old_password: yup
    .string()
    .required(t('login.validation.requiredPassword'))
    .label(t('chats.model.password'))
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/, t('login.validation.regexPassword')),
  new_password: yup
    .string()
    .required(t('login.validation.requiredPassword'))
    .label(t('chats.model.password'))
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/, t('login.validation.regexPassword')),
  confirm_password: yup.string().oneOf([yup.ref('new_password')], t('login.validation.passwordConfirmation')),
})

const { defineComponentBinds, handleSubmit, setErrors, setFieldValue } = useForm({
  validationSchema: schema,
  initialValues: {
    old_password: null,
    new_password: null,
    confirm_password: '',
  },
})

const vuetifyConfig = (state: any) => ({
  props: {
    'error-messages': state.errors,
  },
})

const form = ref({
  old_password: defineComponentBinds('old_password', vuetifyConfig),
  new_password: defineComponentBinds('new_password', vuetifyConfig),
  confirm_password: defineComponentBinds('confirm_password', vuetifyConfig),
})

const closeDialog = () => {
  emit('closeDialog')
}

const submit = handleSubmit(async (values) => {
  loading.value = true
  await $api.users
    .changePassword(props.user?.id, values)
    .then((res) => {
      if (res.status === 200) {
        closeDialog()
        toast.success(t('changePassword.message.changePasswordSuccess'))
      } else {
        setErrors(res.data)
      }
    })
    .finally(() => {
      loading.value = false
    })
})
</script>

<template>
  <v-form @submit="submit">
    <v-row>
      <v-col cols="12">
        <v-text-field
          v-bind="form.old_password"
          :append-icon="passwordEye ? 'mdi-eye' : 'mdi-eye-off'"
          counter
          :label="t('changePassword.model.oldPassword')"
          :type="passwordEye ? 'text' : 'password'"
          @click:append="passwordEye = !passwordEye"
        />
      </v-col>
      <v-col cols="12">
        <v-text-field
          v-bind="form.new_password"
          :append-icon="newPasswordEye ? 'mdi-eye' : 'mdi-eye-off'"
          counter
          :label="t('changePassword.model.newPassword')"
          :type="newPasswordEye ? 'text' : 'password'"
          @click:append="newPasswordEye = !newPasswordEye"
        />
      </v-col>
      <v-col cols="12">
        <v-text-field
          v-bind="form.confirm_password"
          :append-icon="confirmationPasswordEye ? 'mdi-eye' : 'mdi-eye-off'"
          counter
          :label="t('changePassword.model.confirmPassword')"
          :type="confirmationPasswordEye ? 'text' : 'password'"
          @click:append="confirmationPasswordEye = !confirmationPasswordEye"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col class="text-right" cols="12">
        <v-btn class="white--text tw-mr-2" color="error" @click="closeDialog">
          {{ t('changePassword.action.cancel') }}
        </v-btn>
        <v-btn class="white--text" color="primary" type="submit">
          {{ t('changePassword.action.save') }}
        </v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>
