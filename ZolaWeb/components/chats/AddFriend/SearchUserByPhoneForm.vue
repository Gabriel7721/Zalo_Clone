<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'

const props = defineProps({
  value: {
    type: Object,
    required: true,
  },
  type: {
    type: String,
    default: '',
  },
  setFieldValue: {
    type: Function,
    default: () => {},
  },
  user: {
    type: Object,
    default: () => ({}),
  },
  friendRequests: {
    type: Array,
    default: () => [],
  },
})

const { t } = useI18n()
const { $api } = useNuxtApp()
const emit = defineEmits(['update:value', 'closed'])
const toast = useToast()
const { data } = useAuth()
const auth = data.value

const form = computed({
  get: () => props.value,
  set: (val) => emit('update:value', val),
})

const sendFriendRequest = async (id) => {
  await $api.friendRequests
    .sendFriendRequest(auth.id, id)
    .then((res) => {
      if (res.status === 200) {
        toast.success('Đã gửi yêu cầu kết bạn')
        emit('closed')
      }
    })
    .catch(() => {
      toast.error(t('common.status.error'))
    })
}
</script>

<template>
  <v-row dense>
    <v-col cols="12">
      <v-text-field v-bind="form.phone" hide-spin-buttons="true" :label="t('chats.model.phone')" type="number" />
    </v-col>
  </v-row>
  <v-list v-if="user">
    <v-list-item
      class="text-no-wrap chatItem"
      color="primary"
      lines="one"
      :prepend-avatar="'https://randomuser.me/api/portraits/women/8.jpg'"
      :title="user.name"
    >
      <template #append>
        <span v-if="friendRequests.some((friendRequest) => friendRequest.toUserId === user.id)">
          Đã gửi yêu cầu kết bạn
        </span>

        <v-btn v-else color="primary" variant="outlined" @click="sendFriendRequest(user.id)">
          {{ t('chats.makeFriend') }}
        </v-btn>
      </template>
    </v-list-item>
  </v-list>
</template>

<style scoped></style>
