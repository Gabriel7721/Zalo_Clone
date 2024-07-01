<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useModal } from 'vue-final-modal'
import { useToast } from 'vue-toastification'
import { useRoom } from '~/stores/apps/room'
import AddMemberGroupModal from '@/components/chats/AddGroup/AddMembers/AddMemberGroupModal.vue'
import { useUsers } from '~/stores/apps/users'

const { t } = useI18n()
const { $api, $listen } = useNuxtApp()
const { data } = useAuth()
const isOpenVideo = ref(false)
const haveCanvas = ref()
const isSettingGroup = ref(false)
const isDialogDisbandGroup = ref(false)
const dialogChangeAdmin = ref(false)
const subAdmin = ref([])
const emit = defineEmits([
  'reload-chat-listing',
  'set-null-user-recipient',
  'leave-group',
  'get-all-friends-is-not-sub-admin',
  'fetch-chat-by-group',
])
const useRoomStore = useRoom()
const toast = useToast()
const removeSubAdmin = ref(false)
const removeId = ref('')
const addSubAdminModal = ref(false)
const friendsIsNotSubAdmin = ref([])
const useUserStore = useUsers()
const reloadChatListing = () => {
  emit('reload-chat-listing')
  getSubAdmin()
}
const props = defineProps({
  chatDetail: Object,
  userRecipient: Object,
  listImages: Array,
  listVideos: Array,
  listFiles: Array,
  groupId: String,
  isGroup: {
    type: Boolean,
    default: false,
  },
  roomGroup: {
    type: Object,
    default: () => ({}),
  },
})
const auth = data.value
const admin = ref(
  computed(() => {
    return useUserStore.getUsers.find((user) => user.id === props.roomGroup.adminId)
  })
)

const fileExtensionImages: Record<string, string> = {
  docx: '/images/chat/docx.png',
  xlsx: '/images/chat/xlsx.png',
  pdf: '/images/chat/pdf.png',
}

const getFileTypeImage = (extension: string) => {
  const type = extension.split('.').pop()
  return fileExtensionImages[type.toLowerCase()] || '/images/chat/docx.png'
}

const createGroup = () => {
  console.log('createGroup')
}
const settingGroup = () => {
  isSettingGroup.value = true
}
const closeSettingGroup = () => {
  isSettingGroup.value = false
}

const openDialogDisbandGroup = () => {
  isDialogDisbandGroup.value = true
}
const closeDialogDisbandGroup = () => {
  isDialogDisbandGroup.value = false
}
const disbandGroup = async () => {
  await $api.rooms.deleteRoom(props.groupId)
  // console.log('disbandGroup')
  emit('set-null-user-recipient')
  // emit('fetch-chat-by-group')
  // reloadChatListing()
  // closeDialogDisbandGroup()
  useRoomStore.setRoom(null)
}

const deleteChatHistory = () => {
  console.log('deleteChatHistory')
}

const capture = async (videoLink: string, canvasId: string): Promise<void> => {
  const video = document.createElement('video')
  video.src = videoLink
  video.currentTime = 1

  await new Promise<void>((resolve, reject) => {
    video.onloadeddata = () => resolve()
    video.onerror = (error) => reject(error)
  })

  const canvas = (await document.getElementById(canvasId)) as HTMLCanvasElement

  if (canvas) {
    canvas.width = 57
    canvas.height = 57
    canvas.getContext('2d').drawImage(video, 0, 0, 57, 57)
  }
  video.remove()
}

const openVideo = (videoLink: string) => {
  const video = document.createElement('video')
  video.src = videoLink
  video.controls = true
  video.autoplay = true
  video.style.marginLeft = 'auto'
  video.style.width = '100%'
  video.style.height = '100%'
  video.style.position = 'fixed'
  video.style.top = '0'
  video.style.left = '0'
  video.style.zIndex = '9999'
  video.style.backgroundColor = 'black'
  video.style.transition = 'all 0.5s'
  video.style.padding = '20px'
  video.style.boxSizing = 'border-box'
  video.style.cursor = 'pointer'
  video.style.borderRadius = '10px'
  video.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)'
  video.style.overflow = 'hidden'
  video.style.display = 'flex'
  video.style.alignItems = 'center'
  video.style.justifyContent = 'center'

  video.onclick = () => {
    video.remove()
    isOpenVideo.value = false
  }

  document.body.appendChild(video)
}
const captureAll = () => {
  props.listVideos.forEach((video) => {
    capture(video.content, video.id)
  })
}

captureAll()

const addMemberGroupModel = useModal({
  component: AddMemberGroupModal,
  attrs: {
    title: 'Thêm thành viên',
    submitText: 'Thêm',
    cancelText: t('common.action.cancel'),
    width: '500px',
    cc: 'addMemberGroup',
    zIndexFn: () => 1010,
    onClosed() {
      addMemberGroupModel.close()
    },
  },
})

const openDialogAddSubAdmin = () => {
  emit('get-all-friends-is-not-sub-admin')
  addSubAdminModal.value = true
}

const closeDialogAddSubAdmin = () => {
  addSubAdminModal.value = false
}

const openDialogMember = () => {
  addMemberGroupModel.open()
}
// const getAdmin = async (id) => {
//   console.log('111')
//   const users = await $api.users.getUsers()
//   const user = users.data.find((user) => user.id === id)
//   admin.value = user
// }

const getSubAdmin = async () => {
  await $api.rooms.getSubAdmins(props.groupId).then((res) => {
    subAdmin.value = res.data
  })
}

const openDialogRemoveAdmin = () => {
  console.log('openDialogRemoveAdmin')
}

const leaveGroup = () => {
  if (confirm('Bạn có chắc chắn muốn rời khỏi nhóm?')) {
    if (auth.id === props.roomGroup?.adminId) {
      toast.error('Không thể rời khỏi nhóm vì bạn là trưởng nhóm')
    } else {
      $api.rooms
        .leaveRoom(props.groupId)
        .then(() => {
          useRoomStore.setRoom(null)
          emit('leave-group')
          reloadChatListing()
          toast.success('Rời khỏi nhóm thành công')
          isSettingGroup.value = false
        })
        .catch((error) => {
          console.log(error)
        })
    }
  }
}

const getAllFriendsIsNotSubAdmin = async () => {
  try {
    const friendsData = await $api.users.getFriends()
    friendsIsNotSubAdmin.value = friendsData.data.filter((friend) => !props.group.subAdmins.includes(friend.id))
  } catch (error) {
    toast.error(error.message)
  }
}

const openDialogRemoveSubAdmin = (id) => {
  removeSubAdmin.value = true
  removeId.value = id
}

const openDialogChangeAdmin = () => {
  dialogChangeAdmin.value = true
}

const closeDialogChangeAdmin = () => {
  dialogChangeAdmin.value = false
}

const closeDialogRemoveSubAdmin = () => {
  removeSubAdmin.value = false
}
const reloadInfo = () => {
  emit('fetch-chat-by-group')
  isSettingGroup.value = false
  admin.value = {}
  getSubAdmin()
}

const deleteSubAdmin = async () => {
  await $api.rooms.removeSubAdmin(props.groupId, removeId.value)
  getSubAdmin()
  removeSubAdmin.value = false
  removeId.value = ''
}

onMounted(() => {
  closeSettingGroup()
  captureAll()
  if (props.isGroup) {
    getSubAdmin()
  }
})
</script>
<template>
  <div v-if="(chatDetail && !isSettingGroup) || (chatDetail && !isGroup)" class="container">
    <div class="container-info">
      <v-avatar color="grey-darken-1 mt-5" size="70">
        <img
          alt="pro"
          :src="userRecipient.avatar ? userRecipient.avatar : '/images/profile/user-1.jpg'"
          style="height: 70px; width: 70px; border-radius: 50%; border-color: lightgray; border-style: solid"
          width="70"
        />
      </v-avatar>
      <h5 class="text-h6 font-weight-medium mt-5 mb-5">{{ userRecipient.name }}</h5>
    </div>
    <div class="container-media mt-1">
      <v-list>
        <v-list-item v-if="!isGroup" class="list-item" @click="createGroup">
          <v-icon class="mr-3">mdi-account-multiple-plus</v-icon>
          {{ t('chats.action.createGroup') }}
        </v-list-item>
        <v-list-item v-if="isGroup && auth.id === admin?.id" class="list-item" @click="settingGroup">
          <v-icon class="mr-3">mdi-cog</v-icon>
          {{ t('chats.action.manageGroup') }}
        </v-list-item>
        <v-list-item class="list-item" @click="deleteChatHistory">
          <v-icon class="mr-3">mdi-delete</v-icon>
          {{ t('chats.action.deleteChatHistory') }}
        </v-list-item>
        <v-list-item class="list-item" @click="deleteChatHistory">
          <v-icon class="mr-3">mdi-magnify</v-icon>
          {{ t('chats.action.search') }}
        </v-list-item>
        <v-list-item class="list-item" @click="leaveGroup">
          <v-icon class="mr-3">mdi-account-remove</v-icon>
          {{ t('chats.action.leaveGroup') }}
        </v-list-item>
      </v-list>
    </div>
    <div class="container-media mt-1">
      <v-expansion-panels>
        <v-expansion-panel v-if="isGroup">
          <v-expansion-panel-title class="text-h6">
            {{ t('chats.member') }}
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-list-item @click="openDialogMember">
              <template #prepend>
                <v-icon class="tw-mr-1">mdi-account-multiple-outline</v-icon>
              </template>

              <v-list-item-title>{{ roomGroup.members.length }} {{ ' ' + t('chats.members') }}</v-list-item-title>
            </v-list-item>
          </v-expansion-panel-text>
          <v-divider />
        </v-expansion-panel>
        <v-expansion-panel>
          <v-expansion-panel-title class="text-h6">
            {{ t('chats.image') }} ({{ listImages.length }})
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div v-if="listImages && listImages.length > 0" v-viewer>
              <div class="image-grid">
                <v-avatar
                  v-for="{ content } in listImages"
                  :key="content"
                  class="image-item"
                  :data-source="content"
                  rounded="sm"
                  size="57"
                  style="border: 1px solid #cecece"
                >
                  <img :src="content" width="90" />
                </v-avatar>
              </div>
            </div>
            <h6 v-else style="color: gray">{{ t('chats.haveNotImageSended') }}</h6>
          </v-expansion-panel-text>
          <v-divider />
        </v-expansion-panel>
        <v-expansion-panel>
          <v-expansion-panel-title class="text-h6">
            {{ t('chats.video') }} ({{ listVideos.length }})
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div v-if="listVideos && listVideos.length > 0" class="file-list">
              <div>{{ captureAll() }}</div>
              <div class="image-grid">
                <v-avatar
                  v-for="{ id, content } in listVideos"
                  :key="id"
                  class="image-item"
                  rounded="sm"
                  size="57"
                  style="border: 1px solid #cecece"
                >
                  <div @click="openVideo(content)">
                    <canvas :id="id" height="57" width="57" />
                  </div>
                </v-avatar>
              </div>
            </div>
            <h6 v-else style="color: gray">{{ t('chats.haveNotVideoSended') }}</h6>
          </v-expansion-panel-text>
        </v-expansion-panel>
        <v-expansion-panel>
          <v-expansion-panel-title class="text-h6">
            {{ t('chats.file') }} ({{ listFiles.length }})
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div v-if="listFiles && listFiles.length > 0" class="file-list">
              <div v-for="{ content, fileName, id } in listFiles" :key="id" class="file-item">
                <v-row class="file-thumbnail mt-4 mb-4" style="align-items: center">
                  <img alt="File type" height="30" :src="getFileTypeImage(content)" width="30" />
                  <div class="file-name ml-2" style="max-width: 205px">{{ fileName }}</div>
                  <v-spacer />
                  <a download :href="content">
                    <v-icon color="primary" size="20">mdi-download</v-icon>
                  </a>
                </v-row>
                <v-divider />
              </div>
            </div>
            <h6 v-else style="color: gray">{{ t('chats.haveNotFileSended') }}</h6>
          </v-expansion-panel-text>
          <v-divider />
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
  </div>
  <div v-if="isSettingGroup && isGroup && auth.id === admin.id" class="container">
    <v-row class="container-title">
      <v-btn class="ml-2" icon @click="closeSettingGroup">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <h4 class="text-h4 font-weight-bold ml-8">{{ t('chats.action.manageGroup') }}</h4>
    </v-row>
    <div class="container-media mt-4">
      <v-expansion-panels>
        <v-expansion-panel>
          <v-expansion-panel-title class="text-h6">
            <v-icon class="mr-3">mdi-key</v-icon>
            {{ t('chats.action.leaderAndDeputy') }}
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="file-item">
              <v-row class="align-center">
                <v-icon class="ml-5 mr-3">
                  <!--                  <div hidden>{{ getAdmin(roomGroup.adminId) }}</div>-->
                  <v-avatar>
                    <img
                      alt="pro"
                      :src="admin.avatar ? admin.avatar : '/images/profile/user-1.jpg'"
                      style="border-radius: 50%; border-color: lightgray; border-style: solid"
                      width="40"
                    />
                  </v-avatar>
                </v-icon>
                <v-col>
                  <h5 class="text-h6 font-weight-medium">{{ admin.name }}</h5>
                  <h6 class="text-h6 font-weight-light">{{ t('chats.leader') }}</h6>
                </v-col>
                <v-icon style="color: #cbe837">mdi-key</v-icon>
              </v-row>
            </div>
            <v-divider class="mt-2 mb-2" />
            <div v-if="subAdmin.length > 0 && subAdmin" class="file-list">
              <div v-for="{ id, name, avatar } in subAdmin" :key="id" class="file-item">
                <v-row class="align-center">
                  <v-avatar class="ml-4">
                    <img
                      alt="pro"
                      :src="avatar ? avatar : '/images/profile/user-1.jpg'"
                      style="
                        height: 40px;
                        width: 40px;
                        border-radius: 50%;
                        border-color: lightgray;
                        border-style: solid;
                      "
                    />
                  </v-avatar>
                  <v-col>
                    <h5 class="text-h6 font-weight-medium">{{ name }}</h5>
                    <h6 class="text-h6 font-weight-light">{{ t('chats.subLeader') }}</h6>
                  </v-col>
                  <v-btn color="error" size="30" @click="openDialogRemoveAdmin">
                    <v-icon @click="openDialogRemoveSubAdmin(id)">
                      <v-icon size="26">mdi-delete</v-icon>
                    </v-icon>
                  </v-btn>
                </v-row>
                <v-divider class="mt-2 mb-2" />
              </div>
            </div>
            <v-list>
              <v-list-item class="file-item" @click="openDialogAddSubAdmin">
                <v-icon class="mr-2">mdi-account-star</v-icon>
                {{ t('chats.action.addSubAdmin') }}
              </v-list-item>
              <v-list-item class="file-item flex-row" @click="openDialogChangeAdmin">
                <v-icon class="mr-2">mdi-account-star-outline</v-icon>
                {{ t('chats.action.changeAdmin') }}
              </v-list-item>
            </v-list>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
      <v-list>
        <v-list-item class="list-item" style="color: red" @click="openDialogDisbandGroup">
          <v-icon class="mr-3">mdi-account-multiple-remove</v-icon>
          {{ t('chats.action.disbandGroup') }}
        </v-list-item>
      </v-list>
    </div>
  </div>
  <v-dialog v-model="isDialogDisbandGroup" max-width="450">
    <v-card>
      <v-card-title class="headline">{{ t('chats.action.disbandGroup') }}</v-card-title>
      <v-divider />
      <v-card-text>{{ t('chats.disbandGroupConfirm') }}</v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="blue darken-1" text @click="closeDialogDisbandGroup">{{ t('common.action.cancel') }}</v-btn>
        <v-btn color="error" text @click="disbandGroup">{{ t('chats.action.disbandGroup') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-dialog v-model="removeSubAdmin" max-width="450">
    <v-card>
      <v-card-title class="headline">{{ t('chats.action.removeSubAdmin') }}</v-card-title>
      <v-divider />
      <v-card-text>{{ t('chats.deleteSubAdminConfirm') }}</v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="blue darken-1" text @click="closeDialogRemoveSubAdmin">{{ t('common.action.cancel') }}</v-btn>
        <v-btn color="error" text @click="deleteSubAdmin">{{ t('chats.action.removeSubAdmin') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-dialog v-model="addSubAdminModal" max-width="450">
    <v-card>
      <v-card-title class="headline">{{ t('chats.action.addSubAdmin') }}</v-card-title>
      <v-divider />
      <ChatsAddSubAdminDialog
        :admin="admin"
        :friends-is-not-sub-admin="friendsIsNotSubAdmin"
        :group="roomGroup"
        :group-id="groupId"
        :members="roomGroup.members"
        @close-dialog-add-sub-admin="closeDialogAddSubAdmin"
        @getSubAdmin="getSubAdmin"
      />
      <v-card-actions>
        <v-spacer />
        <v-btn color="blue darken-1" text @click="addSubAdminModal = false">{{ t('common.action.cancel') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-dialog v-model="dialogChangeAdmin" max-width="450">
    <v-card>
      <v-card-title class="headline">{{ t('chats.action.changeAdmin') }}</v-card-title>
      <v-divider />
      <ChatsChangeAdminDialog
        :admin="admin"
        :group="roomGroup"
        :group-id="groupId"
        :members="roomGroup.members"
        @closeDialogChangeAdmin="closeDialogChangeAdmin"
        @update:reload-info="reloadInfo"
      />
      <v-card-actions>
        <v-spacer />
        <v-btn color="blue darken-1" text @click="closeDialogChangeAdmin">{{ t('common.action.cancel') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<style lang="scss">
.container {
  display: flex;
  background-color: #f5f5f5;
  overflow-y: auto;
  overflow-x: none;
  flex-direction: column;
  justify-content: top;
  align-items: center;
  max-width: 100%;
  padding: 1px;
  height: 100%;
}
.container-info {
  background-color: #ffffff;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: top;
  align-items: center;
}

.list-item {
  width: 100%;
  align-items: left;
  padding: 5px;
}
.container-media {
  background-color: #ffffff;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: top;
}
.container-title {
  background-color: #ffffff;
  width: 100%;
  justify-content: top;
  align-items: center;
  height: 100px;
}
.image-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 7px;
}

.image-item {
  display: flex;
  align-items: center;
}
</style>
