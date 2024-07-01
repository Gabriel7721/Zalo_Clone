<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { format, formatDistanceToNowStrict } from 'date-fns'
import { useDisplay } from 'vuetify'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'
import { UserAPI } from 'api/users'
import ChatSendMsg from './ChatSendMsg.vue'
import ChatInfo from './ChatInfo.vue'
import { useChatStore } from '@/stores/apps/chat'
import messages from '@/utils/locales/messages'
import { useRoom } from '@/stores/apps/room'
import { useUsers } from '~/stores/apps/users'

const toast = useToast()
const props = defineProps({
  userRecipient: {
    type: Object,
    default: () => ({}),
  },
  groupId: {
    type: String,
    default: '',
  },
  messageReceived: {
    type: [Object, String],
    default: '',
  },
  reloadChatDetail: {
    type: Boolean,
    default: false,
  },
  user: {
    type: Object,
    default: () => ({}),
  },
})

const { t } = useI18n()
const menu = ref('')
const myOptionsMsg = ref()
const optionsMsg = ref()
const dialogForward = ref(false)
const chatForward = ref({})
const reply = ref({})
const userReply = ref({})
const nameReply = ref([])
const userRep = ref([])
const emit = defineEmits([
  'chat-send-msg',
  'reload-chat-listing',
  'chat-withdraw-msg',
  'fetch-chat-detail',
  'reload-chat-detail',
  'chat-send-msg-group',
  'chat-withdraw-group',
  'set-null-user-recipient',
  'leave-group',
])
const nuxtApp = useNuxtApp()
const stompClient = nuxtApp.$stompClient
const { $api, $listen, $event } = useNuxtApp()
const { data } = useAuth()
const useRoomStore = useRoom()

const auth = data.value
const messageReceived = toRef(props, 'messageReceived')
const userRecipient = toRef(props, 'userRecipient')
const groupId = toRef(props, 'groupId')

const { lgAndUp } = useDisplay()
const listMedia = ref([])
const listImages = ref([])
const listVideos = ref([])
const listFiles = ref([])
const isGroup = ref(false)
const roomGroup = ref({})
const useUserStore = useUsers()

//
// const store = useChatStore()
// onMounted(() => {
// store.fetchChats()
// })
//
// const chatDetail: any = computed(() => {
//   return store.chats[store.chatContent - 1]
// })
//

const getImagesAndVideos = async () => {
  await $api.chats.getImagesAndVideos(auth.id, props.userRecipient.id).then((res) => {
    listMedia.value = res.data
    listImages.value = listMedia.value.filter((item) => item.type === 'IMAGE')
    listVideos.value = listMedia.value.filter((item) => item.type === 'VIDEO')
  })
}

const getImagesAndVideosGroup = async () => {
  await $api.chats.getImagesAndVideosGroup(auth.id, props.groupId).then((res) => {
    listMedia.value = res.data
    listImages.value = listMedia.value.filter((item) => item.type === 'IMAGE')
    listVideos.value = listMedia.value.filter((item) => item.type === 'VIDEO')
  })
}

const getFiles = async () => {
  await $api.chats.getFiles(auth.id, props.userRecipient.id).then((res) => {
    listFiles.value = res.data
  })
}

const getFilesGroup = async () => {
  await $api.chats.getFiles(auth.id, props.chatId).then((res) => {
    listFiles.value = res.data
  })
}

const Rpart = ref(!!lgAndUp)

function toggleRpart() {
  Rpart.value = !Rpart.value
}

const chatDetail = ref([])
const chatContainer = ref(null)

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      const element = chatContainer.value.$el || chatContainer.value
      element.scrollTop = element.scrollHeight
    }
  })
}

const fetchChatDetail = async () => {
  await $api.chats.chat(auth?.id, props.userRecipient.id).then((res) => {
    chatDetail.value = []
    chatDetail.value = res.data
    myOptionsMsg.value = Array(chatDetail.value.length).fill(false)
    optionsMsg.value = Array(chatDetail.value.length).fill(false)
    emit('fetch-chat-detail')
  })
  closeReply()
  scrollToBottom()
  setTimeout(() => {
    scrollToBottom()
  }, 1500)
}

const fetchChatByGroup = async () => {
  await $api.chats.chatGroup(auth?.id, groupId.value).then((res) => {
    chatDetail.value = []
    chatDetail.value = res.data
    myOptionsMsg.value = Array(chatDetail.value.length).fill(false)
    optionsMsg.value = Array(chatDetail.value.length).fill(false)
    emit('fetch-chat-detail')
  })

  await $api.rooms.room(groupId.value).then((res) => {
    roomGroup.value = res.data
    useRoomStore.setRoom(res.data)
  })
  closeReply()
  scrollToBottom()
  setTimeout(() => {
    scrollToBottom()
  }, 1500)
}

const addChatSendMsg = (msg) => {
  if (userRecipient.value.id) {
    emit('chat-send-msg', msg)
    fetchChatDetail()
    scrollToBottom()
    getImagesAndVideos()
    getFiles()
    console.log('chatDetail', chatDetail.value)
  }
}

const addChatSendMsgGroup = (msg) => {
  if (groupId.value) {
    chatDetail.value.push(msg)
    emit('chat-send-msg-group', msg)
    fetchChatByGroup()
    scrollToBottom()
    getImagesAndVideosGroup()
    getFilesGroup()
  }
}

watch(
  () => userRecipient,
  () => {
    if (userRecipient.value.id) {
      fetchChatDetail()
      getImagesAndVideos()
      getFiles()
    }
  },
  { deep: true, immediate: true }
)

watch(
  () => messageReceived.value,
  () => {
    chatDetail.value.push(messageReceived.value)
    scrollToBottom()
  }
)

watch(
  () => props.reloadChatDetail,
  () => {
    if (props.reloadChatDetail) {
      if (groupId.value === '') fetchChatDetail()
      else {
        fetchChatByGroup()
      }
      emit('reload-chat-detail')
    }
  }
)

watch(
  () => groupId,
  () => {
    if (groupId.value !== '') {
      fetchChatByGroup()
      getImagesAndVideosGroup()
      getFilesGroup()
      isGroup.value = true
    } else {
      isGroup.value = false
    }
  },
  { deep: true, immediate: true }
)

const formatStatusUser = (status) => {
  if (status === false) {
    return 'error'
  } else if (status === true) {
    return 'success'
  } else {
    return 'containerBg'
  }
}

const showMenu = (id) => {
  menu.value = id
}

const closeMenu = (id) => {
  menu.value = ''
}

const isMenuVisible = (id) => {
  return menu.value === id
}

const openOptionsMsg = (chatId) => {
  optionsMsg.value[chatId] = true
}

const openMyOptionsMsg = (chatId) => {
  myOptionsMsg.value[chatId] = true
}

const copyMsg = (content) => {
  // copy noi dung tin nhan
  navigator.clipboard.writeText(content)
}
const deleteMsg = async (id) => {
  try {
    await $api.chats.deleteMessage(id).then(() => {
      toast.success(t('chats.message.deleteSuccess'))
      if (groupId.value === '') fetchChatDetail()
      else fetchChatByGroup()
      emit('reload-chat-listing')
    })
  } catch (error) {
    toast.error(t('chats.message.deleteError'))
  }
}
const forwardMsg = (chat) => {
  dialogForward.value = true
  chatForward.value = chat
}

const closeDialogForward = async () => {
  if (groupId.value === '') fetchChatDetail()
  else fetchChatByGroup()
  dialogForward.value = false
}

const checkTypeFile = (url) => {
  const type = url.split('.').pop()
  if (type === 'pdf') {
    return 'pdf'
  } else if (type === 'docx') {
    return 'docx'
  } else if (type === 'xlsx') {
    return 'xlsx'
  } else if (type === 'mp4') {
    return 'mp4'
  }

  return 'txt'
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

const withdrawMsg = async (id) => {
  if (stompClient) {
    if (groupId.value !== '') {
      await stompClient.send('/app/delete/group', {}, JSON.stringify(id))
      emit('chat-withdraw-group', id)
      fetchChatByGroup()
    } else {
      await stompClient.send('/app/delete', {}, JSON.stringify(id))
      emit('chat-withdraw-msg', id)
      fetchChatDetail()
    }
    reloadChatListing()
    toast.success(t('chats.message.withdrawSuccess'))
  }
}

const replyMsg = async (chat, id) => {
  reply.value = chat
  const user = useUserStore.getUsers.find((user) => user.id === id)
  userReply.value = user

  scrollToBottom()
}

const closeReply = () => {
  reply.value = null
}

const reloadChatListing = () => {
  emit('reload-chat-listing')
}

$listen('group:removeMemberInGroup', (roomId: string) => {
  if (roomId === groupId.value) {
    fetchChatByGroup()
  }
})

$listen('group:addMemberInGroup', (roomId: string) => {
  if (roomId === groupId.value) {
    fetchChatByGroup()
  }
})

const getUser = async (index, id) => {
  const user = useUserStore.getUsers.find((user) => user.id === id)
  nameReply.value[index] = user?.name
}

const getUserRep = async (index, id) => {
  const user = useUserStore.getUsers.find((user) => user.id === id)
  userRep.value[index] = user.name
}

const callVideo = async (roomId: string) => {
  let userName
  await $api.users.getProfile(auth.id).then((res) => {
    userName = res.data.name
  })
  await $api.rooms.callVideo(roomId).then((res) => {
    console.log(res.data);
  })
  window.open(`/chat/videoCall?username=${userName}&roomId=${roomId}`, '_blank')
}

const findUserBySenderId = (senderId) => {
  const user = useUserStore.getUsers.find((user) => user.id === senderId)
  return user?.avatar
}
</script>
<template>
  <v-col v-if="chatDetail" class="h-100">
    <v-col :style="{ height: reply === null ? 90 + '%' : 81 + '%' }">
      <div
        v-if="Object.keys(userRecipient).length > 0 || groupId !== ''"
        class="d-flex align-center gap-3 pa-2"
        style="height: 10%"
      >
        <!---Topbar Row-->
        <div class="d-flex gap-2 align-center">
          <!---User Avatar-->
          <v-avatar>
            <img
              alt="pro"
              :src="userRecipient.avatar ? userRecipient.avatar : '/images/profile/user-1.jpg'"
              width="50"
            />
          </v-avatar>

          <v-badge
            v-if="groupId === ''"
            class="badg-dotDetail"
            :color="formatStatusUser(userRecipient.onlineStatus)"
            dot
          />
          <!---Name & Last seen-->
          <div>
            <h5 class="text-h5 mb-n1">{{ groupId !== '' ? roomGroup.groupName ?? '' : userRecipient.name }}</h5>
            <h6 v-if="groupId !== ''" class="mt-2">
              <v-icon>mdi-account-multiple-outline</v-icon>
              {{ roomGroup.members ? roomGroup.members.length : '' }} thành viên
            </h6>
            <small class="textPrimary">{{ userRecipient.status }}</small>
          </div>
        </div>
        <!---Topbar Icons-->
        <div class="ml-auto d-flex">
          <v-btn class="text-medium-emphasis" icon variant="text">
            <PhoneIcon size="24" />
          </v-btn>
          <v-btn class="text-medium-emphasis" icon variant="text" @click="callVideo(groupId)">
            <VideoPlusIcon size="24" />
          </v-btn>
          <v-btn class="text-medium-emphasis" icon variant="text" @click="toggleRpart">
            <DotsVerticalIcon size="24" />
          </v-btn>
        </div>
        <!---Topbar Icons-->
      </div>
      <v-divider />
      <!---Chat History-->
      <div class="d-flex" :style="{ height: reply === null ? 91 + '%' : 82 + '%' }">
        <div class="w-100">
          <perfect-scrollbar ref="chatContainer" style="height: 100%">
            <div v-for="(chat, index) in chatDetail" :key="chat.id" class="pa-5">
              <div
                v-if="
                  chat.type === 'REMOVE_MEMBER' ||
                  chat.type === 'ADD_MEMBER' ||
                  chat.type === 'LEAVE_GROUP' ||
                  chat.type === 'ADD_SUB_ADMIN' ||
                  chat.type === 'REMOVE_SUB_ADMIN' ||
                  chat.type === 'CHANGE_ADMIN'
                "
              >
                <v-sheet class="bg-grey100 rounded-md px-3 py-2 mb-1 tw-text-center">
                  <p class="text-body-1" style="color: gray">
                    {{ chat.content }} ({{ format(new Date(chat.timestamp), 'MM/dd/yyyy') }})
                  </p>
                </v-sheet>
              </div>
              <div v-else class="messages-container" @mouseenter="showMenu(chat.id)" @mouseleave="closeMenu(chat.id)">
                <div
                  v-if="auth?.id === chat.senderId && (chat.status === null || chat.status === 'SENT')"
                  class="justify-end d-flex text-end mb-1"
                >
                  <div>
                    <small v-if="chat.createdAt" class="text-medium-emphasis text-subtitle-2">
                      {{
                        formatDistanceToNowStrict(new Date(chat.timestamp), {
                          addSuffix: false,
                        })
                      }}
                      ago
                    </small>
                    <v-row>
                      <div v-show="isMenuVisible(chat.id)">
                        <v-menu v-model="myOptionsMsg[chat.id]" attach location="start">
                          <template #activator="{ props }">
                            <v-btn
                              v-bind="props"
                              class="text-medium-emphasis message-menu"
                              icon
                              size="42"
                              style="margin-right: 10px"
                              variant="text"
                              @click="openMyOptionsMsg(chat.id)"
                              @click.stop
                            >
                              <DotsVerticalIcon size="24" />
                            </v-btn>
                          </template>
                          <v-sheet style="text-align: left">
                            <v-list>
                              <v-list-item @click="copyMsg(chat.content)">
                                <v-icon>mdi-content-copy</v-icon>
                                {{ t('chats.action.copy') }}
                                <v-divider class="mt-2" />
                              </v-list-item>
                              <v-list-item @click="replyMsg(chat, auth.id)">
                                <v-icon>mdi-reply</v-icon>
                                {{ t('chats.action.reply') }}
                                <v-divider class="mt-2" />
                              </v-list-item>
                              <v-list-item @click="forwardMsg(chat)">
                                <v-icon>mdi-forward</v-icon>
                                {{ t('chats.action.forward') }}
                                <v-divider class="mt-2" />
                              </v-list-item>
                              <v-list-item @click="withdrawMsg(chat.id)">
                                <v-icon>mdi-restore</v-icon>
                                {{ t('chats.action.withdraw') }}
                                <v-divider class="mt-2" />
                              </v-list-item>
                              <v-list-item @click="deleteMsg(chat.id)">
                                <v-icon>mdi-delete</v-icon>
                                {{ t('chats.action.delete') }}
                              </v-list-item>
                            </v-list>
                          </v-sheet>
                        </v-menu>
                      </div>
                      <v-sheet v-if="chat.type === 'IMAGE'" class="mb-1">
                        <img v-viewer :alt="chat.content" class="tw-max-w-[500px]" :src="chat.content" />
                      </v-sheet>
                      <v-sheet v-else-if="chat.type === 'FILE'" class="mb-1">
                        <template v-if="checkTypeFile(chat.content) === 'pdf'">
                          <div class="bg-grey100 rounded-md px-3 py-2 mb-1">
                            <div class="d-flex align-center gap-2">
                              <img alt="pdf" class="tw-w-[100px] tw-h-[100px]" src="/images/chat/pdf.png" />
                              <div>
                                <p class="text-body-1">{{ chat.fileName }}</p>
                                <a download :href="chat.content">
                                  <v-icon color="primary">mdi-download</v-icon>
                                </a>
                              </div>
                            </div>
                          </div>
                        </template>
                        <template v-else-if="checkTypeFile(chat.content) === 'docx'">
                          <div class="bg-grey100 rounded-md px-3 py-2 mb-1">
                            <div class="d-flex align-center gap-2">
                              <img alt="pdf" class="tw-w-[100px] tw-h-[100px]" src="/images/chat/docx.png" />
                              <div>
                                <p class="text-body-1">{{ chat.fileName }}</p>
                                <a download :href="chat.content">
                                  <v-icon color="primary">mdi-download</v-icon>
                                </a>
                              </div>
                            </div>
                          </div>
                        </template>
                        <template v-else-if="checkTypeFile(chat.content) === 'xlsx'">
                          <div class="bg-grey100 rounded-md px-3 py-2 mb-1">
                            <div class="d-flex align-center gap-2">
                              <img alt="pdf" class="tw-w-[100px] tw-h-[100px]" src="/images/chat/xlsx.png" />
                              <div>
                                <p class="text-body-1">{{ chat.fileName }}</p>
                                <a download :href="chat.content">
                                  <v-icon color="primary">mdi-download</v-icon>
                                </a>
                              </div>
                            </div>
                          </div>
                        </template>
                        <template v-else>
                          <div class="bg-grey100 rounded-md px-3 py-2 mb-1">
                            <div class="d-flex align-center gap-2">
                              <div>
                                <p class="text-body-1">{{ chat.fileName }}</p>
                                <a download :href="chat.content">
                                  <v-icon color="primary">mdi-download</v-icon>
                                </a>
                              </div>
                            </div>
                          </div>
                        </template>
                      </v-sheet>
                      <v-sheet v-else-if="chat.type === 'VIDEO'" class="mb-1">
                        <video class="tw-max-w-[500px]" controls :src="chat.content" />
                      </v-sheet>
                      <v-sheet v-else class="bg-grey100 rounded-md px-3 py-2 mb-1 tw-max-w-[590px]">
                        <v-row v-if="chat.replyTo !== null" class="flex items-center justify-between reply-container">
                          <div
                            v-if="(chatDetail.find((chatSend) => chatSend.id === chat.replyTo) || {}).type === 'IMAGE'"
                          >
                            <img
                              alt="reply"
                              class="mt-2 ml-3 tw-max-w-[50px] tw-max-h-[50px]"
                              :src="(chatDetail.find((chatSend) => chatSend.id === chat.replyTo) || {}).content"
                            />
                          </div>
                          <div
                            v-if="(chatDetail.find((chatSend) => chatSend.id === chat.replyTo) || {}).type === 'VIDEO'"
                          >
                            <div hidden>
                              {{
                                capture(
                                  (chatDetail.find((chatSend) => chatSend.id === chat.replyTo) || {}).content,
                                  'video-canvas'
                                )
                              }}
                            </div>
                            <canvas id="video-canvas" class="mt-2 ml-3 tw-max-w-[50px] tw-max-h-[50px]" />
                          </div>
                          <div
                            v-if="(chatDetail.find((chatSend) => chatSend.id === chat.replyTo) || {}).type === 'FILE'"
                          >
                            <div
                              v-if="
                                checkTypeFile(
                                  (chatDetail.find((chatSend) => chatSend.id === chat.replyTo) || {}).content
                                ) === 'pdf'
                              "
                            >
                              <img
                                alt="pdf"
                                class="mt-2 ml-3 tw-max-w-[50px] tw-max-h-[50px]"
                                src="/images/chat/pdf.png"
                              />
                            </div>
                            <div
                              v-else-if="
                                checkTypeFile(
                                  (chatDetail.find((chatSend) => chatSend.id === chat.replyTo) || {}).content
                                ) === 'docx'
                              "
                            >
                              <img
                                alt="pdf"
                                class="mt-2 ml-3 tw-max-w-[50px] tw-max-h-[50px]"
                                src="/images/chat/docx.png"
                              />
                            </div>
                            <div
                              v-else-if="
                                checkTypeFile(
                                  (chatDetail.find((chatSend) => chatSend.id === chat.replyTo) || {}).content
                                ) === 'xlsx'
                              "
                            >
                              <img
                                alt="pdf"
                                class="mt-2 ml-3 tw-max-w-[50px] tw-max-h-[50px]"
                                src="/images/chat/xlsx.png"
                              />
                            </div>
                          </div>
                          <v-icon size="12">mdi-format-quote-close</v-icon>

                          <div>
                            <div>
                              <div hidden>
                                {{
                                  getUser(
                                    index,
                                    (chatDetail.find((chatSend) => chatSend.id === chat.replyTo) || {}).senderId
                                  )
                                }}
                              </div>
                              <p>
                                {{ nameReply[index] }}
                              </p>
                            </div>
                            <div class="flex items -center">
                              <div
                                v-if="
                                  (chatDetail.find((chatSend) => chatSend.id === chat.replyTo) || {}).type === 'IMAGE'
                                "
                              >
                                [{{ t('chats.image') }}]
                              </div>
                              <div
                                v-else-if="
                                  (chatDetail.find((chatSend) => chatSend.id === chat.replyTo) || {}).type === 'VIDEO'
                                "
                              >
                                [{{ t('chats.video') }}]
                              </div>
                              <div
                                v-else-if="
                                  (chatDetail.find((chatSend) => chatSend.id === chat.replyTo) || {}).type === 'FILE'
                                "
                              >
                                [{{ t('chats.file') }}]
                                {{ ' ' + (chatDetail.find((chatSend) => chatSend.id === chat.replyTo) || {}).fileName }}
                              </div>
                              <div
                                v-else
                                class="text-primary-600 text-ml ml-2"
                                style="max-width: 500px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap"
                              >
                                {{ (chatDetail.find((chatSend) => chatSend.id === chat.replyTo) || {}).content }}
                              </div>
                            </div>
                          </div>
                        </v-row>
                        <p class="text-body-1">{{ chat.content }}</p>
                      </v-sheet>
                    </v-row>
                  </div>
                </div>
                <div
                  v-else-if="auth?.id !== chat.senderId && (chat.status === null || chat.status === 'SENT')"
                  class="d-flex align-items-start gap-3 mb-1 tw-max-w-[700px]"
                >
                  <!---User Avatar-->
                  <div>
                    <small v-if="chat.createdAt" class="text-medium-emphasis text-subtitle-2">
                      {{
                        formatDistanceToNowStrict(new Date(chat.timestamp), {
                          addSuffix: false,
                        })
                      }}
                      ago
                    </small>
                    <v-row>
                      <v-avatar v-if="index === 0 || chat.senderId !== chatDetail[index - 1].senderId">
                        <img
                          alt="pro"
                          :src="groupId !== '' ? findUserBySenderId(chat.senderId) : userRecipient.avatar || '/images/profile/user-1.jpg'"
                          width="40"
                        />
                      </v-avatar>
                      <div v-else class="ml-10" />
                      <div class="flex-col">
                        <div hidden>{{ getUserRep(index, chat.senderId) }}</div>
                        <p
                          v-if="
                            index > 0 &&
                            (index === 0 ||
                              (chat.senderId !== chatDetail[index - 1].senderId &&
                                isGroup &&
                                (chat.type === 'IMAGE' || chat.type === 'FILE' || chat.type === 'VIDEO')))
                          "
                          class="ml-5 mb-1"
                        >
                          {{ userRep[index] }}
                        </p>
                        <v-sheet v-if="chat.type === 'IMAGE'" class="mb-1 ml-5">
                          <img v-viewer :alt="chat.content" class="tw-max-w-[500px]" :src="chat.content" />
                        </v-sheet>

                        <v-sheet v-else-if="chat.type === 'FILE'" class="mb-1 tw-max-w-[630px] ml-5">
                          <template v-if="checkTypeFile(chat.content) === 'pdf'">
                            <div class="bg-grey100 rounded-md px-3 py-2 mb-1">
                              <div class="d-flex align-center gap-2">
                                <img alt="pdf" class="tw-w-[100px] tw-h-[100px]" src="/images/chat/pdf.png" />
                                <div>
                                  <p class="text-body-1">{{ chat.fileName }}</p>
                                  <a download :href="chat.content">
                                    <v-icon color="primary">mdi-download</v-icon>
                                  </a>
                                </div>
                              </div>
                            </div>
                          </template>
                          <template v-else-if="checkTypeFile(chat.content) === 'docx'">
                            <div class="bg-grey100 rounded-md px-3 py-2 mb-1">
                              <div class="d-flex align-center gap-2">
                                <img alt="pdf" class="tw-w-[100px] tw-h-[100px]" src="/images/chat/docx.png" />
                                <div>
                                  <p class="text-body-1">{{ chat.fileName }}</p>
                                  <a download :href="chat.content">
                                    <v-icon color="primary">mdi-download</v-icon>
                                  </a>
                                </div>
                              </div>
                            </div>
                          </template>
                          <template v-else-if="checkTypeFile(chat.content) === 'xlsx'">
                            <div class="bg-grey100 rounded-md px-3 py-2 mb-1">
                              <div class="d-flex align-center gap-2">
                                <img alt="pdf" class="tw-w-[100px] tw-h-[100px]" src="/images/chat/xlsx.png" />
                                <div>
                                  <p class="text-body-1">{{ chat.fileName }}</p>
                                  <a download :href="chat.content">
                                    <v-icon color="primary">mdi-download</v-icon>
                                  </a>
                                </div>
                              </div>
                            </div>
                          </template>
                          <template v-else>
                            <div class="bg-grey100 rounded-md px-3 py-2 mb-1">
                              <div class="d-flex align-center gap-2">
                                <div>
                                  <p class="text-body-1">{{ chat.fileName }}</p>
                                  <a download :href="chat.content">
                                    <v-icon color="primary">mdi-download</v-icon>
                                  </a>
                                </div>
                              </div>
                            </div>
                          </template>
                        </v-sheet>
                        <v-sheet v-else-if="chat.type === 'VIDEO'" class="mb-1 ml-5">
                          <video class="tw-max-w-[500px]" controls :src="chat.content" />
                        </v-sheet>
                        <v-sheet v-else class="bg-grey100 rounded-md px-3 py-2 mb-1 ml-5 tw-max-w-[640px]">
                          <div hidden>{{ getUserRep(index, chat.senderId) }}</div>
                          <p
                            v-if="index === 0 || (chat.senderId !== chatDetail[index - 1].senderId && isGroup)"
                            class="mb-1"
                          >
                            {{ userRep[index] }}
                          </p>
                          <v-row v-if="chat.replyTo !== null" class="flex items-center justify-between reply-container">
                            <v-row
                              v-if="chat.replyTo !== null"
                              class="flex items-center justify-between reply-container"
                            >
                              <div
                                v-if="
                                  (chatDetail.find((chatSend) => chatSend.id === chat.replyTo) || {}).type === 'IMAGE'
                                "
                              >
                                <img
                                  alt="reply"
                                  class="mt-2 ml-3 tw-max-w-[50px] tw-max-h-[50px]"
                                  :src="(chatDetail.find((chatSend) => chatSend.id === chat.replyTo) || {}).content"
                                />
                              </div>
                              <div
                                v-if="
                                  (chatDetail.find((chatSend) => chatSend.id === chat.replyTo) || {}).type === 'VIDEO'
                                "
                              >
                                <div hidden>
                                  {{
                                    capture(
                                      (chatDetail.find((chatSend) => chatSend.id === chat.replyTo) || {}).content,
                                      'video-canvas'
                                    )
                                  }}
                                </div>
                                <canvas id="video-canvas" class="mt-2 ml-3 tw-max-w-[50px] tw-max-h-[50px]" />
                              </div>
                              <div
                                v-if="
                                  (chatDetail.find((chatSend) => chatSend.id === chat.replyTo) || {}).type === 'FILE'
                                "
                              >
                                <div
                                  v-if="
                                    checkTypeFile(
                                      (chatDetail.find((chatSend) => chatSend.id === chat.replyTo) || {}).content
                                    ) === 'pdf'
                                  "
                                >
                                  <img
                                    alt="pdf"
                                    class="mt-2 ml-3 tw-max-w-[50px] tw-max-h-[50px]"
                                    src="/images/chat/pdf.png"
                                  />
                                </div>
                                <div
                                  v-else-if="
                                    checkTypeFile(
                                      (chatDetail.find((chatSend) => chatSend.id === chat.replyTo) || {}).content
                                    ) === 'docx'
                                  "
                                >
                                  <img
                                    alt="pdf"
                                    class="mt-2 ml-3 tw-max-w-[50px] tw-max-h-[50px]"
                                    src="/images/chat/docx.png"
                                  />
                                </div>
                                <div
                                  v-else-if="
                                    checkTypeFile(
                                      (chatDetail.find((chatSend) => chatSend.id === chat.replyTo) || {}).content
                                    ) === 'xlsx'
                                  "
                                >
                                  <img
                                    alt="pdf"
                                    class="mt-2 ml-3 tw-max-w-[50px] tw-max-h-[50px]"
                                    src="/images/chat/xlsx.png"
                                  />
                                </div>
                              </div>
                              <v-icon size="12">mdi-format-quote-close</v-icon>

                              <div>
                                <div>
                                  <div hidden>
                                    {{
                                      getUser(
                                        index,
                                        (chatDetail.find((chatSend) => chatSend.id === chat.replyTo) || {}).senderId
                                      )
                                    }}
                                  </div>
                                  <p>
                                    {{ nameReply[index] }}
                                  </p>
                                </div>
                                <div class="flex items -center">
                                  <div
                                    v-if="
                                      (chatDetail.find((chatSend) => chatSend.id === chat.replyTo) || {}).type ===
                                      'IMAGE'
                                    "
                                  >
                                    [{{ t('chats.image') }}]
                                  </div>
                                  <div
                                    v-else-if="
                                      (chatDetail.find((chatSend) => chatSend.id === chat.replyTo) || {}).type ===
                                      'VIDEO'
                                    "
                                  >
                                    [{{ t('chats.video') }}]
                                  </div>
                                  <div
                                    v-else-if="
                                      (chatDetail.find((chatSend) => chatSend.id === chat.replyTo) || {}).type ===
                                      'FILE'
                                    "
                                  >
                                    [{{ t('chats.file') }}]
                                    {{
                                      ' ' + (chatDetail.find((chatSend) => chatSend.id === chat.replyTo) || {}).fileName
                                    }}
                                  </div>
                                  <div
                                    v-else
                                    class="text-primary-600 text-ml ml-2"
                                    style="
                                      max-width: 500px;
                                      overflow: hidden;
                                      text-overflow: ellipsis;
                                      white-space: nowrap;
                                    "
                                  >
                                    {{ (chatDetail.find((chatSend) => chatSend.id === chat.replyTo) || {}).content }}
                                  </div>
                                </div>
                              </div>
                            </v-row>
                          </v-row>
                          <p class="text-body-1">{{ chat.content }}</p>
                        </v-sheet>
                      </div>
                      <div v-show="isMenuVisible(chat.id)" class="message-menu">
                        <v-menu v-model="optionsMsg[chat.id]" attach location="end">
                          <template #activator="{ props }">
                            <v-btn
                              v-bind="props"
                              class="text-medium-emphasis"
                              icon
                              size="42"
                              style="margin-left: 10px"
                              variant="text"
                              @click="openOptionsMsg(chat.id)"
                            >
                              <DotsVerticalIcon size="24" />
                            </v-btn>
                          </template>
                          <v-sheet>
                            <v-list>
                              <v-list-item @click="copyMsg(chat.content)">
                                <v-icon>mdi-content-copy</v-icon>
                                {{ t('chats.action.copy') }}
                                <v-divider class="mt-2" />
                              </v-list-item>
                              <v-list-item @click="replyMsg(chat, chat.senderId)">
                                <v-icon>mdi-reply</v-icon>
                                {{ t('chats.action.reply') }}
                                <v-divider class="mt-2" />
                              </v-list-item>
                              <v-list-item @click="forwardMsg(chat)">
                                <v-icon>mdi-forward</v-icon>
                                {{ t('chats.action.forward') }}
                                <v-divider class="mt-2" />
                              </v-list-item>
                              <v-list-item @click="deleteMsg(chat.id)">
                                <v-icon>mdi-delete</v-icon>
                                {{ t('chats.action.delete') }}
                              </v-list-item>
                            </v-list>
                          </v-sheet>
                        </v-menu>
                      </div>
                    </v-row>
                  </div>
                </div>
                <div
                  v-else-if="auth?.id !== chat.senderId && chat.status === 'DELETED'"
                  class="d-flex align-items-start gap-3 mb-1 tw-max-w-[700px]"
                >
                  <div>
                    <small v-if="chat.createdAt" class="text-medium-emphasis text-subtitle-2">
                      {{
                        formatDistanceToNowStrict(new Date(chat.timestamp), {
                          addSuffix: false,
                        })
                      }}
                      ago
                    </small>
                    <v-row>
                      <v-avatar v-if="index === 0 || chat.senderId !== chatDetail[index - 1].senderId">
                        <img
                          alt="pro"
                          :src="userRecipient.avatar ? userRecipient.avatar : '/images/profile/user-1.jpg'"
                          width="40"
                        />
                      </v-avatar>
                      <div v-if="index === 0 || chat.senderId !== chatDetail[index - 1].senderId">
                        <v-sheet class="bg-grey100 rounded-md px-3 py-2 mb-1 ml-5 tw-max-w-[640px]">
                          <p class="text-body-1" style="color: gray">{{ t('chats.messageWithdrawed') }}</p>
                        </v-sheet>
                      </div>
                      <div v-else class="ml-10">
                        <v-sheet class="bg-grey100 rounded-md px-3 py-2 mb-1 ml-5 tw-max-w-[640px]">
                          <p class="text-body-1" style="color: gray">{{ t('chats.messageWithdrawed') }}</p>
                        </v-sheet>
                      </div>
                      <div v-show="isMenuVisible(chat.id)">
                        <v-menu v-model="myOptionsMsg[chat.id]" attach location="end">
                          <template #activator="{ props }">
                            <v-btn
                              v-bind="props"
                              class="text-medium-emphasis message-menu"
                              icon
                              size="42"
                              style="margin-right: 10px"
                              variant="text"
                              @click="openMyOptionsMsg(chat.id)"
                            >
                              <DotsVerticalIcon size="24" />
                            </v-btn>
                          </template>
                          <v-sheet style="text-align: left">
                            <v-list>
                              <v-list-item @click="deleteMsg(chat.id)">
                                <v-icon>mdi-delete</v-icon>
                                {{ t('chats.action.delete') }}
                              </v-list-item>
                            </v-list>
                          </v-sheet>
                        </v-menu>
                      </div>
                    </v-row>
                  </div>
                </div>
                <div v-else class="justify-end d-flex text-end mb-1">
                  <div>
                    <small v-if="chat.createdAt" class="text-medium-emphasis text-subtitle-2">
                      {{
                        formatDistanceToNowStrict(new Date(chat.timestamp), {
                          addSuffix: false,
                        })
                      }}
                      ago
                    </small>
                    <v-row>
                      <div v-show="isMenuVisible(chat.id)">
                        <v-menu v-model="myOptionsMsg[chat.id]" attach location="start">
                          <template #activator="{ props }">
                            <v-btn
                              v-bind="props"
                              class="text-medium-emphasis message-menu"
                              icon
                              size="42"
                              style="margin-right: 10px"
                              variant="text"
                              @click="openMyOptionsMsg(chat.id)"
                            >
                              <DotsVerticalIcon size="24" />
                            </v-btn>
                          </template>
                          <v-sheet style="text-align: left">
                            <v-list>
                              <v-list-item @click="deleteMsg(chat.id)">
                                <v-icon>mdi-delete</v-icon>
                                {{ t('chats.action.delete') }}
                              </v-list-item>
                            </v-list>
                          </v-sheet>
                        </v-menu>
                      </div>

                      <!--                      <v-sheet class="bg-grey100 rounded-md px-3 py-2 mb-1 tw-max-w-[800px]">-->
                      <!--                        <p class="text-body-1" style="color: gray">{{ t('chats.messageWithdrawed') }}</p>-->
                      <!--                      </v-sheet>-->
                    </v-row>
                  </div>
                </div>
              </div>
            </div>
          </perfect-scrollbar>
        </div>
        <div v-if="Rpart" class="right-sidebar">
          <perfect-scrollbar style="height: 100%">
            <v-sheet>
              <chat-info
                :chat-detail="chatDetail"
                :group-id="groupId"
                :is-group="isGroup"
                :list-files="listFiles"
                :list-images="listImages"
                :list-videos="listVideos"
                :room-group="roomGroup"
                :user-recipient="userRecipient"
                @fetch-chat-by-group="fetchChatByGroup"
                @leave-group="emit('leave-group')"
                @reload-chat-listing="reloadChatListing = true"
                @set-null-user-recipient="emit('set-null-user-recipient')"
              />
            </v-sheet>
          </perfect-scrollbar>
        </div>
      </div>
    </v-col>
    <v-divider />
    <!---Chat send-->
    <chat-send-msg
      :group-id="groupId"
      :is-group="isGroup"
      :recipient-id="userRecipient.id"
      :reply="reply"
      :user-reply="userReply"
      @chat-send-msg="addChatSendMsg"
      @chat-send-msg-group="addChatSendMsgGroup"
      @close-reply="closeReply"
    />
  </v-col>
  <v-dialog v-model="dialogForward" max-width="700px">
    <v-card>
      <v-card-title>{{ t('chats.forwardMessage') }}</v-card-title>
      <ChatsForwardDialog
        :chat-forward="chatForward"
        :close-dialog-forward="closeDialogForward"
        @reload-chat-listing="reloadChatListing"
      />
      <v-card-actions>
        <v-spacer />
        <v-btn color="error" @click="closeDialogForward">
          {{ t('chats.action.exit') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<style lang="scss">
.badg-dotDetail {
  left: -9px;
  position: relative;
  bottom: -10px;
}

.toggleLeft {
  position: absolute;
  right: 15px;
  top: 15px;
}
.right-sidebar {
  width: 320px;
  border-left: 1px solid rgb(var(--v-theme-borderColor));
  transition: 0.1s ease-in;
  flex-shrink: 0;
}

.HideLeftPart {
  display: none;
}

@media (max-width: 960px) {
  .right-sidebar {
    position: absolute;
    right: -320px;
    &.showLeftPart {
      right: 0;
      z-index: 2;
      box-shadow: 2px 1px 20px rgba(0, 0, 0, 0.1);
    }
  }
  .boxoverlay {
    position: absolute;
    height: 100%;
    width: 100%;
    z-index: 1;
    background: rgba(0, 0, 0, 0.2);
  }
}
.reply-container {
  background-color: #ffffff;
  margin-right: 2px;
  margin-left: 2px;
  margin-top: 1px;
  margin-bottom: 1px;
  padding: 5px;
}
</style>
