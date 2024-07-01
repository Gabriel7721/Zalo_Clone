<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'
import * as yup from 'yup'
import AppModal from '@/components/common/AppModal.vue'
import SearchUserByPhoneForm from '@/components/chats/AddFriend/SearchUserByPhoneForm.vue'

const props = defineProps({
  item: {
    type: Object,
    default: () => ({
      phone: null,
    }),
  },
  title: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['closed', 'submit', 'update:modelValue'])
const { $api } = useNuxtApp()
const isSubmitting = ref(false)
const { t } = useI18n()
const toast = useToast()
const user = ref(null)
const friendRequests = ref([])
const { data } = useAuth()
const auth = data.value

const schema = yup.object({
  phone: yup.string().nullable().required().label(t('chats.model.phone')),
})

const { defineComponentBinds, handleSubmit, setErrors, setFieldValue } = useForm({
  validationSchema: schema,
  initialValues: {
    phone: null,
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

const submit = handleSubmit(async (values) => {
  isSubmitting.value = true
  try {
    await $api.users.getUserByPhoneSkipMe(values.phone, auth.id).then(
      (response) => {
        user.value = response.data
      },
      (error) => {
        setErrors(error.error)
      }
    )

    await $api.friendRequests.getFriendRequestByFromUser(auth.id).then((res) => {
      if (res.status === 200) {
        friendRequests.value = res.data
      }
    })
  } catch (error) {
    setErrors(error.error)
  } finally {
    isSubmitting.value = false
  }
})

const closed = () => {
  emit('closed')
}
</script>

<template>
  <app-modal
    :loading="isSubmitting"
    :submit-text="$t('chats.action.search')"
    :title="title"
    width="800px"
    @cancel="emit('closed')"
    @submit="submit"
  >
    <search-user-by-phone-form
      :friend-requests="friendRequests"
      :set-field-value="setFieldValue"
      :user="user"
      :value="form"
      @closed="closed"
    />
  </app-modal>
</template>
