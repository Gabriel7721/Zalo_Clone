<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'
import { ref } from 'vue'
import { useAuth } from '@/composables/auth'
import { el } from 'date-fns/locale'

const props = defineProps({
  groupId: {
    type: String,
    default: () => '',
  },
  members: {
    type: Array,
    default: () => [],
  },
  admin: {
    type: Object,
    default: () => ({}),
  },
})

const { t } = useI18n()
const { $api } = useNuxtApp()
const toast = useToast()
const friends = ref([])
const friendsIsNotSubAdmin = ref([])
const memberList = ref([])
const list = ref([])
const member = ref(props.members)

const room = ref({})
const emit = defineEmits([
  'get-sub-admin',
  'close-dialog-add-sub-admin',
  'get-all-friends-is-not-sub-admin',
  'get-admin',
])

const getRoomById = async () => {
  try {
    await $api.rooms.room(props.groupId).then((res) => {
      room.value = res.data
    })
  } catch (error) {
    toast.error(error.message)
  }
}

const getAllFriendsIsNotSubAdmin = async () => {
  getRoomById()
  try {
    memberList.value = []
    friendsIsNotSubAdmin.value = []
    await $api.users.getUsers().then((response) => {
      list.value = response.data
    })
    member.value.forEach((id) => {
      const user = list.value.find((user) => user.id === id && user.id !== props.admin.id)
      if (user) {
        memberList.value.push(user)
      }
      member.value = member.value.filter((mem) => mem !== id)
    })
    friendsIsNotSubAdmin.value = memberList.value.filter((mem) => !room.value.subAdmins.includes(mem.id))
  } catch (error) {
    toast.error(error.message)
  }
}
getAllFriendsIsNotSubAdmin()

const addSubAdmin = async (userId) => {
  getAllFriendsIsNotSubAdmin()
  try {
    await $api.rooms.addSubAdmin(props.groupId, userId)
    toast.success('Thêm phó nhóm thành công')
    emit('get-sub-admin')
  } catch (error) {
    toast.error(error.message)
  }
  emit('close-dialog-add-sub-admin')
}

onMounted(() => {
  getAllFriendsIsNotSubAdmin()
})
</script>

<template>
  <perfect-scrollbar class="tw-max-h-64">
    <v-list>
      <v-list-item v-for="(user, index) in friendsIsNotSubAdmin" :key="index">
        <v-row class="mt-3 mb-3 align-center">
          <v-avatar :value="user.id" class="ml-5 mr-3">
            <img alt="pro" :src="user.avatar ? user.avatar : '/images/profile/user-1.jpg'" width="50" />
          </v-avatar>
          <div>{{ user.name }}</div>
          <v-spacer />
          <v-btn color="primary" class="mr-8" size="40" @click="addSubAdmin(user.id)">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </v-row>
      </v-list-item>
    </v-list>
  </perfect-scrollbar>
</template>
