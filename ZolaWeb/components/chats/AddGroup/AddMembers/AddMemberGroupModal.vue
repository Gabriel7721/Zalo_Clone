<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'
import * as yup from 'yup'
import AppModal from '@/components/common/AppModal.vue'
import AddGroupForm from '@/components/chats/AddGroup/AddGroupForm.vue'
import AddMemberGroupForm from '~/components/chats/AddGroup/AddMembers/AddMemberGroupForm.vue'
import { useRoom } from '@/stores/apps/room'

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
const stompClient = useNuxtApp().$stompClient
const { $event, $listen } = useNuxtApp()
const useRoomStore = useRoom()
const { data } = useAuth()
const auth = data.value

const schema = yup.object({
  phone: yup.string().nullable().label(t('chats.model.phone')),
  members: yup.array().of(yup.string()).min(1).label(t('chats.model.members')),
})

const { defineComponentBinds, handleSubmit, setErrors, setFieldValue } = useForm({
  validationSchema: schema,
  initialValues: {
    groupName: null,
    phone: null,
    members: useRoomStore.getRoom.members || [],
  },
})

const vuetifyConfig = (state: any) => ({
  props: {
    'error-messages': state.errors,
  },
})

const form = ref({
  phone: defineComponentBinds('phone', vuetifyConfig),
  members: defineComponentBinds('members', vuetifyConfig),
})

const submit = handleSubmit(async (values) => {
  isSubmitting.value = true
  console.log('values.members', values.members)
  console.log('useRoomStore.getRooms.members', useRoomStore.getRoom.members)
  const members = values.members.filter((member) => !useRoomStore.getRoom.members.includes(member))
  await $api.rooms
    .addRoomMembers(useRoomStore.getRoom.id, members)
    .then((res) => {
      toast.success('Thêm thành viên vào nhóm thành công')
      $event('group:addMemberInGroup', useRoomStore.getRoom.id)

      members.forEach((member) => {
        const messageContent = {
          chatId: useRoomStore.getRoom.id,
          senderId: auth?.id,
          recipientId: null,
          content: member, // BE handle
          timestamp: new Date(),
        }

        stompClient.send('/app/group/add-member', {}, JSON.stringify(messageContent))
      })
      emit('closed')
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

$listen('group:removeMemberInGroup', (roomId: string) => {
  console.log(useRoomStore.getRoom.members)
})
</script>

<template>
  <app-modal :loading="isSubmitting" :title="title" width="800px" @cancel="emit('closed')" @submit="submit">
    <add-member-group-form
      :group="useRoomStore.getRoom"
      :members="useRoomStore.getRoom.members"
      :set-field-value="setFieldValue"
      :value="form"
      @closed="closed"
    />
  </app-modal>
</template>

<style scoped></style>
