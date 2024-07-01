<script setup lang="ts">
import { useToast } from 'vue-toastification'

const props = defineProps({
  selectedMenuFriend: {
    type: Object,
    required: true,
    default: () => ({}),
  },
})

const { $api } = useNuxtApp()
const toast = useToast()
const loading = ref(false)

const friends = ref([])
const search = ref('')
const friendRequestFromUsers = ref([])
const { data } = useAuth()
const auth = data.value
const dialogDecline = ref(false)
const declineUser = ref(null)
const friendRequestToUsers = ref([])

const fetchFriends = async () => {
  loading.value = true
  await $api.users
    .getFriends()
    .then((res) => {
      friends.value = res.data
    })
    .catch((error) => {
      toast.error(error.message)
    })
    .finally(() => {
      loading.value = false
    })
}

const fetchFriendRequestByFromUserId = async () => {
  await $api.friendRequests
    .getFriendRequestByToUser(auth.id)
    .then((res) => {
      friendRequestToUsers.value = res.data
    })
    .catch((error) => {
      toast.error(error.message)
    })
}

const fetchFriendRequestByToUserId = async () => {
  await $api.friendRequests
    .getFriendRequestByFromUser(auth.id)
    .then((res) => {
      friendRequestFromUsers.value = res.data
    })
    .catch((error) => {
      toast.error(error.message)
    })
}

const searchName = (value) => {
  if (value) {
    friends.value = friends.value.filter((friend) => friend.name.toLowerCase().includes(value.toLowerCase()))
  }
}

watch(
  props.selectedMenuFriend.value,
  () => {
    if (props.selectedMenuFriend.code === 'invitation') {
      fetchFriends()
    }
  },
  { immediate: true }
)

const openDialogDecline = (toUser) => {
  declineUser.value = toUser
  dialogDecline.value = true
}

const declineFriendRequest = async () => {
  await $api.friendRequests
    .declineFriendRequest(auth.id, declineUser.value.id)
    .then((res) => {
      toast.success('Thu hồi lời mời thành công')
      fetchFriendRequestByToUserId()
      dialogDecline.value = false
    })
    .catch((error) => {
      toast.error(error.message)
    })
}

const acceptFriendRequest = async (friendRequest) => {
  await $api.friendRequests
    .acceptFriendRequest(friendRequest.fromUserId, friendRequest.toUserId)
    .then((res) => {
      toast.success('Đồng ý lời mời thành công')
      fetchFriendRequestByFromUserId()
      fetchFriends()
    })
    .catch((error) => {
      toast.error(error.message)
    })
}

onMounted(() => {
  fetchFriends()
  fetchFriendRequestByFromUserId()
  fetchFriendRequestByToUserId()
})
</script>

<template>
  <div v-if="selectedMenuFriend.code !== 'invitation'" class="tw-p-3">
    <span>Bạn bè({{ friends.length }})</span>
    <div>
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        class="tw-mt-3"
        hide-details="auto"
        label="Search"
        @update:modelValue="searchName"
      />
    </div>
    <perfect-scrollbar>
      <v-list>
        <v-list-item
          v-for="user in friends"
          :key="user.id"
          class="text-no-wrap chatItem"
          color="primary"
          lines="two"
          :value="user.id"
        >
          <template #prepend>
            <v-avatar>
              <img alt="pro" :src="user.avatar ?? '/images/profile/user-1.jpg'" width="50" />
            </v-avatar>
          </template>

          <v-list-item-title class="text-subtitle-1 textPrimary w-100 font-weight-semibold">
            {{ user.name }}
          </v-list-item-title>

          <template #append>
            <v-btn variant="text">
              <v-icon>mdi-cog-outline</v-icon>
            </v-btn>
          </template>
        </v-list-item>
      </v-list>
    </perfect-scrollbar>
  </div>
  <template v-if="selectedMenuFriend.code === 'invitation'">
    <div class="pa-4">
      <h3>Lời mời kết bạn</h3>
      <div class="mt-2">
        <v-row>
          <v-col
            v-for="friendRequestToUser in friendRequestToUsers"
            :key="friendRequestToUser.id"
            cols="12"
            lg="3"
            sm="6"
          >
            <v-card>
              <v-card-title>
                <v-avatar>
                  <img
                    alt="pro"
                    :src="friendRequestToUser.fromUser?.avatar ?? '/images/profile/user-1.jpg'"
                    width="50"
                  />
                </v-avatar>
                <span class="tw-ml-1">{{ friendRequestToUser.fromUser?.name }}</span>
              </v-card-title>
              <v-card-actions>
                <v-spacer />
                <v-btn color="error">Từ chối</v-btn>
                <v-btn color="primary" @click="acceptFriendRequest(friendRequestToUser)">Đồng ý</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </div>

      <h3 class="mt-4">Lời mời đã gửi</h3>
      <div class="mt-2">
        <v-row>
          <v-col
            v-for="friendRequestFromUser in friendRequestFromUsers"
            :key="friendRequestFromUser.id"
            cols="12"
            lg="3"
            sm="6"
          >
            <v-card>
              <v-card-title>
                <v-avatar>
                  <img
                    alt="pro"
                    :src="friendRequestFromUser.toUser?.avatar ?? '/images/profile/user-1.jpg'"
                    width="50"
                  />
                </v-avatar>
                <span class="tw-ml-1">{{ friendRequestFromUser.toUser?.name }}</span>
              </v-card-title>
              <v-card-actions>
                <v-spacer />
                <v-btn color="error" @click="openDialogDecline(friendRequestFromUser.toUser)">Thu hồi lời mời</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </div>
  </template>
  <v-dialog v-model="dialogDecline" max-width="400">
    <v-card text="Bạn có chắc chắn muốn thu hồi lời mời kết bạn không?" title="Thu hồi lời mời kết bạn">
      <template #actions>
        <v-spacer />

        <v-btn @click="dialogDecline = false">Hủy</v-btn>

        <v-btn color="error" @click="declineFriendRequest">Đồng ý</v-btn>
      </template>
    </v-card>
  </v-dialog>
</template>
