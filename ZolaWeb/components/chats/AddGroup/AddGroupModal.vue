<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'
import * as yup from 'yup'
import AppModal from '@/components/common/AppModal.vue'
import AddGroupForm from '@/components/chats/AddGroup/AddGroupForm.vue'

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

const emit = defineEmits(['closed', 'submit', 'update:modelValue', 'createGroup'])
const { $api } = useNuxtApp()
const isSubmitting = ref(false)
const { t } = useI18n()
const toast = useToast()
const user = ref(null)
const stompClient = useNuxtApp().$stompClient
const { $event } = useNuxtApp()

const schema = yup.object({
  groupName: yup.string().nullable().required().label(t('chats.model.nameGroup')),
  phone: yup.string().nullable().label(t('chats.model.phone')),
  members: yup.array().of(yup.string()).min(1).label(t('chats.model.members')),
})

const { defineComponentBinds, handleSubmit, setErrors, setFieldValue } = useForm({
  validationSchema: schema,
  initialValues: {
    groupName: null,
    phone: null,
    members: [],
  },
})

const vuetifyConfig = (state: any) => ({
  props: {
    'error-messages': state.errors,
  },
})

const form = ref({
  groupName: defineComponentBinds('groupName', vuetifyConfig),
  phone: defineComponentBinds('phone', vuetifyConfig),
  members: defineComponentBinds('members', vuetifyConfig),
})

const submit = handleSubmit(async (values) => {
  isSubmitting.value = true
  await $api.rooms
    .createRoomGroup(values)
    .then((res) => {
      toast.success(t('chats.action.successCreateGroup'))
      emit('closed')
      $event('group:created', res.data)
    })
    .catch((error) => {
      toast.error(error.message)
      setErrors(error.errors)
    })
    .finally(() => {
      isSubmitting.value = false
    })
})

const closed = () => {
  emit('closed')
}
</script>

<template>
  <app-modal :loading="isSubmitting" :title="title" width="800px" @cancel="emit('closed')" @submit="submit">
    <add-group-form :set-field-value="setFieldValue" :value="form" @closed="closed" />
  </app-modal>
</template>

<style scoped></style>
