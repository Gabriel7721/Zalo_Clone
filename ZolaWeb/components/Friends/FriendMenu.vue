<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const emit = defineEmits(['change-menu'])

const { $api } = useNuxtApp()
const { t } = useI18n()
const { data } = useAuth()
const auth = data.value
const selectedMenu = ref('list-friends')

const friendMenu = ref([
  {
    title: 'Danh sách bạn bè',
    icon: 'mdi-account-details-outline',
    code: 'list-friends',
  },
  {
    title: 'Danh sách nhóm',
    icon: 'mdi-account-supervisor-outline',
    code: 'list-group',
  },
  {
    title: 'Lời mời kết bạn',
    icon: 'mdi-email-open-outline',
    code: 'invitation',
  },
])

const changeMenu = (item) => {
  selectedMenu.value = item.code
  emit('change-menu', item)
}
</script>
<template>
  <v-list density="compact">
    <v-list-item
      v-for="(item, i) in friendMenu"
      :key="i"
      :active="item.code === selectedMenu"
      color="primary"
      :value="item"
      @click="changeMenu(item)"
    >
      <template #prepend>
        <v-icon :icon="item.icon" />
      </template>

      <v-list-item-title v-text="item.title" />
    </v-list-item>
  </v-list>
</template>
