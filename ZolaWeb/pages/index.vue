<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'
import { getToken } from 'firebase/messaging'
import AppBaseCard from '@/components/common/atom/AppBaseCard.vue'
import ChatListing from '@/components/chats/ChatListing.vue'
import ChatDetail from '@/components/chats/ChatDetail.vue'
import FriendMenu from '@/components/Friends/FriendMenu.vue'
import ListFriends from '@/components/Friends/ListFriends.vue'
import Welcome from '@/pages/auth/Welcome.vue'
import { useRoom } from '~/stores/apps/room'
import { useUsers } from '@/stores/apps/users'

const { t } = useI18n()
const { $api } = useNuxtApp()
const nuxtApp = useNuxtApp()
const { data, signOut } = useAuth()
const stompClient = nuxtApp.$stompClient
const userRecipient = ref({})
const chatGroupId = ref('')
const messageReceived = ref('')
const selectedItem = ref('message')
const showSettingsMenu = ref(false)
const menu = ref(false)
const profileDialog = ref(false)
const isEditing = ref(false)
const values = ref({})
const user = ref({})
const isChangePassword = ref(false)
const avatar = ref(user.value.avatar)
const nameUser = ref(user.value.name)
const reloadChatListing = ref(false)
const reloadChatDetail = ref(false)
const { $listen } = useNuxtApp()
const groupIdsToSubscribe = ref([])
const connectedWs = ref(false)
const subscribeGroup = ref(false)
const useRoomStore = useRoom()
const useUserStore = useUsers()
const toast = useToast()
const messagingToken = ref(' ')

const selectedMenuFriend = ref({
  title: 'Danh sách bạn bè',
  icon: 'mdi-account-details-outline',
  code: 'list-friends',
})

const fetchProfileById = async (values) => {
  await $api.users.getProfile(values).then((res) => {
    user.value = res.data
    avatar.value = user.value.avatar
    nameUser.value = user.value.name
  })
}

const auth = data.value

const connect = async () => {
  await stompClient.connect({}, onConnected, onError)
}

const onConnected = () => {
  connectedWs.value = true
  stompClient.subscribe(`/user/${auth?.id}/queue/messages`, onMessageReceived)
  if (!subscribeGroup.value) {
    groupIdsToSubscribe.value.forEach((groupId) => {
      stompClient.subscribe(`/user/${groupId}/queue/messages`, onMessageReceived)
    })
  }
}

const onError = () => {
  console.log('error')
}

const handleConfirmation = (message) => {
  console.log(message.content, nameUser.value)

  if (message.content === nameUser.value) return
  const confirmed = window.confirm(`${message.content} đang gọi`)
  if (confirmed) {
    window.open(`/chat/videoCall?username=${nameUser.value}&roomId=${message.chatId}`, '_blank')
  }
}

const onMessageReceived = (payload) => {
  const message = JSON.parse(payload.body)
  if (message.type === 'RECALL') {
    reloadChatListing.value = true
    reloadChatDetail.value = true
  } else if (message.type === 'CREATE_GROUP') {
    stompClient.subscribe(`/user/${message.content}/queue/messages`, onMessageReceived)
    reloadChatListing.value = true
  } else if (message.type === 'ADD_MEMBER') {
    reloadChatListing.value = true
    reloadChatDetail.value = true
  } else if (message.type === 'LEAVE_GROUP') {
    reloadChatListing.value = true
    reloadChatDetail.value = true
  } else if (message.type === 'REMOVE_MEMBER') {
    reloadChatListing.value = true
    reloadChatDetail.value = true
    if (message.recipientId === auth.id) {
      chatGroupId.value = ''
      useRoomStore.setRoom(null)
    }
  } else if (message.type === 'CALL_VIDEO') {
    reloadChatListing.value = true
    reloadChatDetail.value = true
    handleConfirmation(message)
  } else if (message.type === 'REMOVE_SUB_ADMIN') {
    reloadChatDetail.value = true
  } else if (message.type === 'CHANGE_ADMIN') {
    reloadChatDetail.value = true
    reloadChatListing.value = true
  } else if (message.type === 'DELETE_GROUP') {
    reloadChatListing.value = true
    if (useRoomStore.getRoom?.id === message.chatId) {
      chatGroupId.value = ''
      useRoomStore.setRoom(null)
      reloadChatDetail.value = true
    }
    toast.success('Nhóm ' + message.content + ' đã bị giải tán')
  } else {
    messageReceived.value = message
    reloadChatListing.value = true
  }
}

const fetchChatByUserId = (user) => {
  userRecipient.value = user
  chatGroupId.value = ''
}

const fetchChatByGroupId = (groupId) => {
  chatGroupId.value = groupId
  userRecipient.value = {}
}

const logOut = async () => {
  await signOut({ callbackUrl: '/auth/login' })
}

const closeDialog = () => {
  isEditing.value = false
  isChangePassword.value = false
}

const closeProfileDialog = () => {
  profileDialog.value = false
}

const openEditProfile = () => {
  isEditing.value = true
}

const openProfileDialog = () => {
  profileDialog.value = true
}

const changeMenuFriend = (menu) => {
  selectedMenuFriend.value = menu
}

const loadData = async () => {
  await fetchProfileById({})
}

$listen('group:created', () => {
  reloadChatListing.value = true
})

$listen('groups:fetch', (groupIds) => {
  groupIdsToSubscribe.value = groupIds
  if (stompClient.connected) {
    groupIds.forEach((groupId) => {
      stompClient.subscribe(`/user/${groupId}/queue/messages`, onMessageReceived)
    })
    subscribeGroup.value = true
  }
})
const setNullUserRecipient = () => {
  userRecipient.value = {}
  chatGroupId.value = ''
}

const leaveGroup = () => {
  chatGroupId.value = ''
  reloadChatListing.value = true
}

const addUsersInStore = async () => {
  const users = await $api.users.getUsers()
  useUserStore.setUsers(users.data)
}

const setToken = async () => {
  const { $messaging } = useNuxtApp()

  await getToken($messaging, {
    vapidKey: 'BKbMAOeCSK-A0v4gO7QkVLX6c3pcRQspYKpUmoDKcLzD3ZOEJDyoav3WHXEtqMVQGzyWYxXfWiX7oehTmG7pRos',
  })
    .then((token) => {
      if (token) {
        messagingToken.value = token
        $api.users.saveTokenNotification(token)
      } else {
        console.log('Token:', 'No registration token available. Request permission to generate one.')
      }
    })
    .catch((err) => {
      console.log('An error occurred while retrieving token. ', err)
    })
}

const permissionNotification = () => {
  if (!window.Notification) return

  if (window.Notification.permission === 'granted') {
    setToken()
  } else {
    window.Notification.requestPermission((value) => {
      if (value === 'granted') {
        setToken()
      }
    })
  }
}

onMounted(() => {
  connect()
  loadData()
  addUsersInStore()
  permissionNotification()
})
</script>

<template>
  <v-navigation-drawer class="tw-bg-primary" permanent width="70">
    <v-menu location="end" offset="15">
      <template #activator="{ props }">
        <v-btn v-bind="props" class="d-block text-center mt-4 mx-2" icon @click="menu = !menu">
          <v-avatar color="grey-darken-1" size="large">
            <img alt="pro" :src="avatar ? avatar : '/images/profile/user-1.jpg'" width="54" />
          </v-avatar>
        </v-btn>
      </template>
      <v-card min-width="200">
        <v-list>
          <v-list-item>
            <h5 class="text-h6 font-weight-medium">{{ nameUser }}</h5>
          </v-list-item>
        </v-list>
        <v-divider />
        <v-list>
          <v-list-item @click="openProfileDialog">
            <label>{{ t('chats.yourProfile') }}</label>
          </v-list-item>
          <v-list-item @click="isChangePassword = true">
            <label>{{ t('changePassword.title') }}</label>
          </v-list-item>
          <v-list-item>
            <label>{{ t('chats.setting') }}</label>
          </v-list-item>
        </v-list>
      </v-card>
    </v-menu>

    <v-divider class="mx-3 mt-5 my-2" />

    <v-list class="tw-bg-primary" density="compact">
      <v-list-item :class="{ 'selected-item': selectedItem === 'message' }" @click="selectedItem = 'message'">
        <template #prepend>
          <v-icon class="tw-ml-[6px]" color="white">mdi-message-text</v-icon>
        </template>
      </v-list-item>

      <v-list-item :class="{ 'selected-item': selectedItem === 'friends' }" @click="selectedItem = 'friends'">
        <template #prepend>
          <v-icon class="tw-ml-[6px]" color="white">mdi-account-box-outline</v-icon>
        </template>
      </v-list-item>

      <v-list-item class="settings-button" :class="{ 'selected-item': selectedItem === 'setting' }">
        <template #prepend>
          <v-menu>
            <template #activator="{ props }">
              <v-icon v-bind="props" class="tw-ml-[6px]" color="white" @click="showSettingsMenu = !showSettingsMenu">
                mdi-cog
              </v-icon>
            </template>
            <v-list>
              <v-list-item @click="logOut()">{{ t('chats.action.logout') }}</v-list-item>
            </v-list>
          </v-menu>
        </template>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>

  <v-card class="overflow-hidden tw-pl-[70px]" elevation="10">
    <app-base-card v-if="selectedItem === 'message'">
      <template #leftpart>
        <chat-listing
          :reload-chat-listing="reloadChatListing"
          @chat-detail="fetchChatByUserId"
          @chatDetailGroup="fetchChatByGroupId"
          @update:reload-chat-listing="reloadChatListing = false"
        />
      </template>
      <template #rightpart>
        <div v-if="Object.keys(userRecipient).length === 0 && chatGroupId === ''">
          <welcome />
        </div>
        <chat-detail
          v-else
          :group-id="chatGroupId"
          :message-received="messageReceived"
          :reload-chat-detail="reloadChatDetail"
          :user="user"
          :user-recipient="userRecipient"
          @chat-send-msg="reloadChatListing = true"
          @chat-send-msg-group="reloadChatListing = true"
          @chat-withdraw-group="reloadChatListing = true"
          @chat-withdraw-msg="reloadChatListing = true"
          @leave-group="leaveGroup"
          @reload-chat-detail="reloadChatDetail = false"
          @reload-chat-listing="reloadChatListing = true"
          @set-null-user-recipient="setNullUserRecipient"
        />
      </template>
    </app-base-card>
    <app-base-card v-if="selectedItem === 'friends'">
      <template #leftpart>
        <friend-menu @change-menu="changeMenuFriend" />
      </template>
      <template #rightpart>
        <list-friends :selected-menu-friend="selectedMenuFriend" />
      </template>
    </app-base-card>
  </v-card>
  <v-dialog v-model="profileDialog" max-width="460">
    <v-card class="overflow-auto" style="height: 610px">
      <v-container>
        <v-card-title class="pa-5">
          <span class="text-h5">
            {{ t('chats.informationAccount') }}
          </span>
        </v-card-title>
        <UserProfileForm
          :close-profile-dialog="closeProfileDialog"
          :load-data="loadData"
          :open-edit-profile="openEditProfile"
        />
      </v-container>
    </v-card>
  </v-dialog>

  <v-dialog v-model="isEditing" max-width="460">
    <v-card class="overflow-auto" style="height: 610px">
      <v-container>
        <v-card-title class="pa-5">
          <span class="text-h5">
            {{ t('profile.editInformationAccount') }}
          </span>
        </v-card-title>
        <UserEditForm
          :close-dialog="closeDialog"
          :close-profile-dialog="closeProfileDialog"
          :load-data="loadData"
          :open-profile-dialog="openProfileDialog"
        />
      </v-container>
    </v-card>
  </v-dialog>

  <v-dialog v-model="isChangePassword" max-width="460">
    <v-card class="overflow-auto tw-max-h-[540px]">
      <v-container>
        <v-card-title class="pa-5">
          <span class="text-h5">
            {{ t('changePassword.title') }}
          </span>
        </v-card-title>
        <AuthChangePasswordForm :user="user" @close-dialog="isChangePassword = false" />
      </v-container>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.selected-item {
  background-color: rgba(0, 0, 0, 0.1) !important;
}

:deep(.v-navigation-drawer__content) {
  border-right: none !important;
}

:deep(.v-list-item__prepend) {
  .v-icon {
    opacity: 1 !important;
  }
}
</style>
