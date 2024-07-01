<script setup lang="ts">
import { ref, defineProps } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'
import * as yup from 'yup'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { useForm } from 'vee-validate'

const toast = useToast()
const { t } = useI18n()
const { data, signOut } = useAuth()
const { $api } = useNuxtApp()
const user = ref({})
const auth = data.value
const loading = ref(false)
const sex = ref()
const date = ref()
const nameUser = ref(user.name)
const phone = ref()

const props = defineProps<{
  closeDialog: () => void
  closeProfileDialog: () => void
  openProfileDialog: () => void
  loadData: () => void
}>()

const loadData = () => {
  props.loadData()
}

const closeDialog = () => {
  props.openProfileDialog()
  props.closeDialog()
}
const closeProfileDialog = () => {
  props.closeProfileDialog()
}

const openProfileDialog = () => {
  props.openProfileDialog()
}
const fetchProfileById = async (values) => {
  await $api.users.getProfile(values).then((res) => {
    user.value = res.data
    nameUser.value = user.value.name
    phone.value = user.value.phone
    sex.value = user.value.sex === true ? 'Nam' : 'Nữ'
    date.value = user.value.birthday ? parseDate(user.value.birthday) : new Date()
  })
}

const formatDate = (date) => {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  return `${year}-${month}-${day}`
}

const yesterday = () => {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return yesterday
}

const parseDate = (dateString) => {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day)
}

const schema = yup.object({
  name: yup.string().required(t('register.validation.name')).label(t('register.model.name')),
})

const vuetifyConfig = (state: any) => ({
  props: {
    'error-messages': state.errors,
  },
})
await fetchProfileById({})
const { defineComponentBinds, handleSubmit, setErrors } = useForm({
  validationSchema: schema,
  initialValues: {
    name: nameUser.value,
  },
})

const form = ref({
  name: defineComponentBinds('name', vuetifyConfig),
})

const saveEdit = handleSubmit(async (values) => {
  loading.value = true
  try {
    const sexValue = sex.value === 'Nam' ? 1 : 0
    await $api.users
      .updateProfile(phone.value, {
        name: values.name,
        sex: sexValue,
        birthday: formatDate(date.value),
      })
      .then(() => {
        toast.success(t('profile.message.editProfileSuccess'))
        loadData()
        openProfileDialog()
        closeDialog()
      })
  } catch (error) {
    toast.error(t('profile.message.editProfileFailed'))
    loading.value = false
  }
})
</script>
<template>
  <v-card class="overflow-hidden" elevation="10" style="height: 480px">
    <v-form>
      <v-label class="text-center" style="font-size: 16px; font-weight: 500; margin-top: 20px; margin-left: 20px">
        {{ t('profile.model.name') }}
      </v-label>
      <v-text-field v-bind="form.name" class="mx-4 mt-7" dense outlined />

      <v-label class="text-title-1 pb-2 mt-7" style="font-size: 16px; font-weight: 550; margin-left: 20px">
        {{ t('profile.informationUser') }}
      </v-label>
      <br />
      <v-label class="text-center mt-5" style="font-size: 16px; font-weight: 500; margin-top: 20px; margin-left: 20px">
        {{ t('profile.model.sex') }}
      </v-label>
      <v-radio-group v-model="sex" class="mt-3" inline name="sex" style="margin-left: 10px">
        <v-radio color="primary" label="Nam" value="Nam" />
        <v-radio color="primary" label="Nữ" style="margin-left: 40px" value="Nữ" />
      </v-radio-group>
      <v-label class="text-center mt-5" style="font-size: 16px; font-weight: 500; margin-top: 20px; margin-left: 20px">
        {{ t('register.model.birthday') }}
      </v-label>
      <vue-date-picker
        v-model="date"
        class="mt-5 custom-date-picker"
        :enable-time-picker="false"
        :format="formatDate"
        :max-date="yesterday()"
        style="height: 110%; margin-left: 15px; width: 93%"
      />
      <v-card-actions class="mt-3">
        <v-spacer />
        <v-btn color="error" flat text @click="closeDialog">
          {{ t('profile.action.cancel') }}
        </v-btn>
        <v-btn color="success" flat :loading="loading" @click="saveEdit">
          {{ t('profile.action.save') }}
        </v-btn>
      </v-card-actions>
    </v-form>
  </v-card>
</template>
<style scoped>
.avatar-border {
  background-image: linear-gradient(rgb(80, 178, 252), rgb(244, 76, 102));
  border-radius: 50%;
  width: 110px;
  height: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  .userImage {
    border: 4px solid rgb(255, 255, 255);
  }
  margin-right: 0px;
}

.edit-border {
  background-image: linear-gradient(rgba(83, 83, 83, 0.738), rgba(103, 103, 103, 0.64));
  border-radius: 50%;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  .userImage {
    border: 4px solid rgb(255, 255, 255);
  }
}

.top-spacer {
  margin-top: -95px;
}

.profiletab .v-slide-group__content {
  justify-content: end;
  .v-btn--variant-text .v-btn__overlay {
    background: transparent;
  }
}

.custom-date-picker {
  z-index: 9999;
}
</style>
