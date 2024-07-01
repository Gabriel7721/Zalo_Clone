<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'
import { ref } from 'vue'
import { useAuth } from '@/composables/auth'

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
  reloadInfo: {
    type: Boolean,
    default: () => false,
  },
})

const { t } = useI18n()
const { $api } = useNuxtApp()
const toast = useToast()
const friends = ref([])
const room = ref({})
const emit = defineEmits(['close-dialog-change-admin', 'update:reload-info', 'change-admin'])
const memberList = ref([])

const getMemberList = async () => {
  await Promise.all(
    props.members.map(async (memberId) => {
      const response = await $api.users.getUsers()
      const user = response.data.find((user) => user.id === memberId)
      if (user.id !== props.admin.id) memberList.value.push(user)
    })
  )
}

const changeAdmin = async (userId) => {
  if (confirm('Bạn chắc chắn muốn chuyển quyền trưởng nhóm cho thành viên này?')) {
    try {
      await $api.rooms.changeAdmin(props.groupId, userId)
      toast.success('Chuyển quyền trưởng nhóm thành công')
      emit('change-admin')
      emit('update:reload-info')
      emit('close-dialog-change-admin')
    } catch (error) {
      toast.error(error.message)
    }
  }
}
getMemberList()
</script>

<template>
  <perfect-scrollbar class="tw-max-h-64">
    <v-list>
      <v-list-item v-for="{ name, id, avatar } in memberList" :key="id">
        <v-row class="mt-3 mb-3 align-center">
          <v-avatar class="ml-5 mr-3">
            <img alt="pro" :src="avatar ? avatar : '/images/profile/user-1.jpg'" width="50" />
          </v-avatar>
          <div>{{ name ? name : 'null' }}</div>
          <v-spacer />
          <v-btn color="primary" class="mr-8" size="40" @click="changeAdmin(id)">
            <v-icon>mdi-key</v-icon>
          </v-btn>
        </v-row>
      </v-list-item>
    </v-list>
  </perfect-scrollbar>
</template>
