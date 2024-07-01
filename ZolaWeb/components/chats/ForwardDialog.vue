<script setup lang="ts">
import { ref, defineProps } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { debounce } from 'lodash'
import { useToast } from 'vue-toastification'
import profileBg from '@/images/backgrounds/profilebg.jpg'
import Toast from 'vue-toastification'
const router = useRouter()

const emit = defineEmits(['reloadChatListing'])

const { t } = useI18n()
const toast = useToast()
const { data } = useAuth()
const { $api } = useNuxtApp()
const user = ref({})
const auth = data.value
const loadingSearchFriend = ref(false)
const search = ref('')
const rooms = ref([])
const selectedRooms = ref([])
const widthDialog = ref(700)
const message = ref(props.chatForward.content)

const props = defineProps({
  chatForward: {
    type: Object,
    default: () => ({}),
  },
  closeDialogForward: {
    type: Function,
    default: () => {},
  },
  scrollToBottom: {
    type: Function,
    default: () => {},
  },
})

const fetchProfile = async () => {
  await $api.users.getProfile(auth.id).then((res) => {
    user.value = res.data
  })
}

const fetch = async () => {
  await $api.rooms.getRoomByUser(auth.id).then((res) => {
    rooms.value = res.data
  })
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

const sendMsgTo = async () => {
  try {
    const friends = selectedRooms.value.filter((room) => room.group === false).map((room) => room.userRecipient.id)
    console.log('id friend:', friends)
    // list room la nhung phan tu co isGroup = true thi lấy room id vào list
    const groups = selectedRooms.value.filter((room) => room.group === true).map((room) => room.id)
    console.log('id group:', groups)
    await $api.chats.forwardMessage(props.chatForward.id, friends)
    await $api.chats.forwardMessageGroup(props.chatForward.id, groups)
  } catch (error) {
    toast.error(t('chats.message.forwardFailed'))
  } finally {
    loadingSearchFriend.value = false
  }
  selectedRooms.value = []
  props.closeDialogForward()
}

const removeSelectedFriend = (index) => {
  selectedRooms.value.splice(index, 1)
}

watch(selectedRooms, (newValue) => {
  widthDialog.value = newValue.length !== null ? 700 : 350
})

onMounted(() => {
  fetchProfile()
  fetch()
})
const getFriendById = async (id): Promise<Object> => {
  try {
    const res = await $api.users.user(id)
    return res.data
  } catch (error) {
    console.log(error)
  }
  return {}
}
</script>
<template>
  <v-card class="overflow-hidden" elevation="10" :style="{ height: '500px', width: widthDialog + 'px' }">
    <v-row>
      <!-- Danh sách bạn bè -->
      <v-col :cols="selectedRooms.length === 0 || !selectedRooms ? 12 : 6" class="overflow-auto">
        <v-text-field
          v-model="search"
          class="mt-4 ml-6 mr-6"
          :label="t('chats.model.findPeopleAndGroup')"
          type="text"
          prepend-inner-icon="mdi-magnify"
          @update:modelValue="searchFriend"
        />

        <perfect-scrollbar :style="{ width: '99%', height: '300px' }">
          <v-list class="ml-3">
            <v-list-item
              v-for="room in rooms"
              :key="room.id"
              class="text-no-wrap chatItem"
              color="primary"
              lines="two"
              :value="room.id"
            >
              <template #prepend>
                <v-avatar>
                  <img
                    alt="pro"
                    :src="room.userRecipient ? room.userRecipient.avatar : '/images/profile/user-1.jpg'"
                    width="50"
                  />
                </v-avatar>
              </template>

              <v-list-item-title class="text-subtitle-1 textPrimary w-100 font-weight-semibold">
                {{ room.group ? room.groupName ?? '' : room.userRecipient?.name }}
              </v-list-item-title>

              <template #append>
                <v-checkbox v-model="selectedRooms" :value="room" />
              </template>
            </v-list-item>
          </v-list>
        </perfect-scrollbar>
      </v-col>
      <v-col v-if="selectedRooms.length > 0" class="overflow-auto" cols="6">
        <v-card class="mt-4 mr-3" style="width: 320px">
          <v-card-title>{{ t('chats.friendsSelected') }}</v-card-title>
          <perfect-scrollbar style="height: 320px">
            <v-list>
              <v-list-item v-for="(room, index) in selectedRooms" :key="room.id">
                <v-row align="center" justify="space-between" style="width: 100%">
                  <v-col>{{ room.group ? room.groupName ?? '' : room.userRecipient?.name }}</v-col>
                  <v-col cols="auto">
                    <v-btn icon size="24" @click="removeSelectedFriend(index)">
                      <v-icon size="24">mdi-close</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-list-item>
            </v-list>
          </perfect-scrollbar>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="9">
        <v-textarea
          v-model="message"
          class="ml-7"
          color="primary"
          disabled
          :label="t('chats.model.message')"
          prepend-inner-icon="mdi-message"
          rows="3"
          type="text"
        />
      </v-col>
      <v-col cols="3">
        <v-btn
          class="mr-2"
          color="primary"
          :disabled="selectedRooms.length === 0"
          style="width: 130px; height: 80px"
          @click="sendMsgTo(selectedRooms)"
        >
          {{ t('chats.action.forward') }}
        </v-btn>
      </v-col>
    </v-row>
  </v-card>
</template>
<style></style>
