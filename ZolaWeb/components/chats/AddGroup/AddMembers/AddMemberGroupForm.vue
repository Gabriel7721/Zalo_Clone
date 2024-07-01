<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'
import { debounce } from 'lodash'
import { formatDistanceToNowStrict } from 'date-fns'
import AppLoading from '@/components/common/AppLoading.vue'

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
  members: {
    type: Array,
    default: () => [],
  },
  group: {
    type: Object,
    default: () => ({}),
  },
})

const { t } = useI18n()
const { $api } = useNuxtApp()
const emit = defineEmits(['update:value', 'closed'])
const toast = useToast()
const { data } = useAuth()
const auth = data.value
const friends = ref([])
const loadingFetchFriends = ref(false)
const memberInGroup = ref([])
const { $event } = useNuxtApp()
const stompClient = useNuxtApp().$stompClient

const form = computed({
  get: () => props.value,
  set: (val) => emit('update:value', val),
})

const getAllFriends = async () => {
  loadingFetchFriends.value = true
  memberInGroup.value = []
  await $api.users
    .getFriends()
    .then((res) => {
      friends.value = res.data
      friends.value.forEach((friend) => {
        if (props.members.includes(friend.id)) {
          memberInGroup.value.push(friend.id)
        }
      })
    })
    .catch((error) => {
      toast.error(error.message)
    })
    .finally(() => {
      loadingFetchFriends.value = false
    })
}

const deleteMemberInGroup = (user) => {
  if (confirm('Bạn có chắc chắn muốn xóa thành viên này khỏi nhóm?')) {
    $api.rooms
      .removeUserFromRoom(props.group.id, user.id)
      .then(() => {
        toast.success('Xóa thành viên khỏi nhóm thành công')
        $event('group:removeMemberInGroup', props.group.id)
        memberInGroup.value = memberInGroup.value.filter((id) => id !== user.id)
        form.value.members.modelValue = form.value.members.modelValue.filter((id) => id !== user.id)

        const messageContent = {
          chatId: props.group.id,
          senderId: auth?.id,
          recipientId: user.id,
          content: auth?.user?.name + ' đã xóa ' + user.name + ' khỏi nhóm',
          timestamp: new Date(),
        }

        stompClient.send('/app/group/remove-member', {}, JSON.stringify(messageContent))
      })
      .catch((error) => {
        toast.error(error.message)
      })
  }
}

onMounted(() => {
  getAllFriends()
})
</script>

<template>
  <v-row dense>
    <v-col cols="12">
      <v-text-field v-bind="form.phone" :label="t('chats.model.phone')" type="number" />
    </v-col>
  </v-row>
  <v-divider class="mt-4" />
  <perfect-scrollbar class="tw-max-h-64">
    <v-list>
      <app-loading v-if="loadingFetchFriends" />
      <v-list-item v-for="(user, index) in friends" :key="index" :value="index">
        <template #prepend>
          <v-checkbox
            v-bind="form.members"
            :disabled="memberInGroup.includes(user.id)"
            :hide-details="true"
            :value="user.id"
          />
          <v-avatar>
            <img alt="pro" :src="'https://randomuser.me/api/portraits/women/8.jpg'" width="50" />
          </v-avatar>
        </template>
        <!---Name-->
        <v-list-item-title class="text-subtitle-1 textPrimary w-100 font-weight-semibold">
          <div>
            {{ user.name }}
          </div>
          <div v-if="memberInGroup.includes(user.id)">
            <h5>Đã tham gia</h5>
          </div>
        </v-list-item-title>

        <template #append>
          <v-btn variant="text" @click="deleteMemberInGroup(user)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-list-item>
    </v-list>
  </perfect-scrollbar>
</template>

<style scoped></style>
