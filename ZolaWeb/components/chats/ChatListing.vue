<script setup>
import { ref, onMounted } from 'vue'
import { useModal } from 'vue-final-modal'
import { useI18n } from 'vue-i18n'
import { debounce } from 'lodash'
import { formatDistanceToNowStrict } from 'date-fns'
import AddFriendModal from '~/components/chats/AddFriend/AddFriendModal.vue'
import AppLoading from '@/components/common/AppLoading.vue'
import AddGroupModal from '~/components/chats/AddGroup/AddGroupModal.vue'

const props = defineProps({
  reloadChatListing: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['chatDetail', 'update:reloadChatListing', 'chatDetailGroup'])
const { $api } = useNuxtApp()
const rooms = ref([])
const searchValue = ref('')
const { t } = useI18n()
const { data } = useAuth()
const auth = data.value
const userFriends = ref([])
const menuOpen = ref(false)
const loadingSearchFriend = ref(false)
const { $event, $listen } = useNuxtApp()

const fetch = async () => {
  await $api.rooms.getRoomByUser(auth.id).then((res) => {
    rooms.value = res.data
  })
}

const fetchChatByUserId = (userRecipient) => {
  emit('chatDetail', userRecipient)
}

const fetchChatByGroupId = (groupId) => {
  emit('chatDetailGroup', groupId)
}

const addFriendModal = useModal({
  component: AddFriendModal,
  attrs: {
    title: t('chats.addFriend'),
    submitText: t('common.action.search'),
    cancelText: t('common.action.cancel'),
    width: '500px',
    zIndexFn: () => 1010,
    onClosed() {
      addFriendModal.close()
    },
  },
})

const addGroupModel = useModal({
  component: AddGroupModal,
  attrs: {
    title: t('chats.addGroup'),
    submitText: t('common.action.create'),
    cancelText: t('common.action.cancel'),
    width: '500px',
    zIndexFn: () => 1010,
    onClosed() {
      addGroupModel.close()
    },
  },
})

const formatStatusUser = (status) => {
  if (status === false) {
    return 'error'
  } else if (status === true) {
    return 'success'
  } else {
    return 'containerBg'
  }
}

const toggleMenu = (event) => {
  event.stopPropagation()
  menuOpen.value = true
}

const closeMenu = () => {
  searchValue.value = ''
  menuOpen.value = false
  userFriends.value = []
}

const searchFriend = debounce((value) => {
  if (value !== '') {
    loadingSearchFriend.value = true
    $api.users
      .getFriendByName(auth.id, value)
      .then((res) => {
        if (res.data === null) {
          userFriends.value = []
        } else {
          userFriends.value = res.data
        }
      })
      .finally(() => {
        loadingSearchFriend.value = false
      })
  } else {
    userFriends.value = []
  }
}, 1000)

watch(
  () => props.reloadChatListing,
  (value) => {
    if (value) {
      fetch()
      emit('update:reloadChatListing')
    }
  }
)

$listen('group:created', (user) => {
  fetch()
})

onMounted(async () => {
  await fetch()
  const groupIds = rooms.value.filter((room) => room.group === true).map((room) => room.id)
  $event('groups:fetch', groupIds)
})
</script>
<template>
  <v-sheet>
    <div class="px-3 pt-3 tw-flex">
      <v-menu v-model="menuOpen" class="elevation-0" :offset="[5, 12]" offset-y :persistent="true" width="279">
        <template #activator="{ props }">
          <v-text-field
            v-bind="props"
            v-model="searchValue"
            append-inner-icon="mdi-magnify"
            class="shrink tw-w-3/4"
            dense
            density="compact"
            filled
            hide-details
            placeholder="Search Contact"
            rounded
            single-line
            variant="outlined"
            @click="toggleMenu"
            @update:model-value="searchFriend"
          />
        </template>
        <v-list class="elevation-0">
          <v-list class="elevation-0">
            <template v-if="userFriends.length > 0">
              <app-loading v-if="loadingSearchFriend" />
              <v-list-item
                v-for="(user, index) in userFriends"
                :key="index"
                :value="index"
                @click="fetchChatByUserId(user)"
              >
                <template #prepend>
                  <v-avatar>
                    <img alt="pro" :src="'https://randomuser.me/api/portraits/women/8.jpg'" width="50" />
                  </v-avatar>
                </template>
                <!---Name-->
                <v-list-item-title class="text-subtitle-1 textPrimary w-100 font-weight-semibold">
                  {{ user.name }}
                </v-list-item-title>
              </v-list-item>
            </template>
            <template v-else>
              <v-list-item>
                <v-list-item-title
                  v-if="searchValue === '' && userFriends.length === 0"
                  class="text-center text-subtitle-1"
                >
                  {{ t('chats.message.findFriendByName') }}
                </v-list-item-title>
                <v-list-item-title
                  v-if="searchValue !== '' && userFriends.length === 0"
                  class="text-center text-subtitle-1"
                >
                  {{ t('chats.message.friendNotFound') }}
                </v-list-item-title>
              </v-list-item>
            </template>
          </v-list>
        </v-list>
      </v-menu>

      <div v-if="menuOpen === false" class="tw-flex">
        <v-btn class="tw-ml-1" size="40" variant="text" @click="addFriendModal.open">
          <v-icon>mdi-account-plus-outline</v-icon>
        </v-btn>

        <v-btn class="tw-ml-1" size="40" variant="text" @click="addGroupModel.open">
          <v-icon>mdi-account-multiple-plus-outline</v-icon>
        </v-btn>
      </div>
      <div v-else class="tw-ml-1">
        <v-btn size="40" variant="text" @click="closeMenu">
          <template #default>
            <span class="tw-text-sm">{{ t('common.action.close') }}</span>
          </template>
        </v-btn>
      </div>
    </div>
  </v-sheet>
  <perfect-scrollbar class="lgScroll">
    <v-list>
      <!---Single Item-->
      <v-list-item
        v-for="room in rooms"
        :key="room.id"
        class="text-no-wrap chatItem"
        color="primary"
        lines="two"
        :value="room.id"
        @click="room.userRecipient ? fetchChatByUserId(room.userRecipient) : fetchChatByGroupId(room.id)"
      >
        <!---Avatar-->
        <template #prepend>
          <v-avatar>
            <img alt="pro" :src="'https://randomuser.me/api/portraits/women/8.jpg'" width="50" />
          </v-avatar>

          <v-badge class="badg-dotDetail" :color="formatStatusUser(room.userRecipient?.onlineStatus)" dot />
        </template>
        <!---Name-->
        <v-list-item-title class="text-subtitle-1 textPrimary w-100 font-weight-semibold">
          {{ room.group ? room.groupName ?? '' : room.userRecipient?.name }}
        </v-list-item-title>
        <!---Subtitle-->
        <!--        <v-sheet v-if="chat.chatHistory.slice(-1)[0].type == 'img'">-->
        <!--          <small class="textPrimary text-subtitle-2">Sent a Photo</small>-->
        <!--        </v-sheet>-->
        <div
          v-if="room.lastMessage === null || room.lastMessage?.status === 'SENT'"
          class="text-subtitle-2 textPrimary mt-1 text-truncate w-100"
        >
          {{ room.lastMessage?.content }}
        </div>
        <div v-else class="text-subtitle-2 textPrimary mt-1 text-truncate w-100">
          {{ t('chats.messageWithdrawed') }}
        </div>
        <!---Last seen--->
        <template #append>
          <div class="d-flex flex-column text-right w-25">
            <small v-if="room.lastMessage?.timestamp" class="textPrimary text-subtitle-2">
              {{ formatDistanceToNowStrict(new Date(room.lastMessage?.timestamp)) }}
            </small>
          </div>
        </template>
      </v-list-item>
    </v-list>
  </perfect-scrollbar>
</template>
<style scoped>
.chatItem {
  padding: 16px 24px !important;
  border-bottom: 1px solid rgb(var(--v-theme-inputBorder), 0.1);
}
.lgScroll {
  height: 90%;
}
.badg-dotDetail {
  left: -9px;
  position: relative;
  bottom: -10px;
}
:deep(.v-text-field input.v-field__input) {
  padding-left: 6px !important;
  padding-top: 2px !important;
  padding-bottom: 2px !important;
}
</style>
