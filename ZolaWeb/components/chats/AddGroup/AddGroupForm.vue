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
})

const { t } = useI18n()
const { $api } = useNuxtApp()
const emit = defineEmits(['update:value', 'closed'])
const toast = useToast()
const { data } = useAuth()
const auth = data.value
const friends = ref([])
const loadingFetchFriends = ref(false)

const form = computed({
  get: () => props.value,
  set: (val) => emit('update:value', val),
})

const getAllFriends = async () => {
  loadingFetchFriends.value = true
  await $api.users
    .getFriends()
    .then((res) => {
      friends.value = res.data
    })
    .catch((error) => {
      toast.error(error.message)
    })
    .finally(() => {
      loadingFetchFriends.value = false
    })
}

onMounted(() => {
  getAllFriends()
})
</script>

<template>
  <v-row dense>
    <v-col cols="12">
      <v-text-field v-bind="form.groupName" hide-spin-buttons="true" :label="t('chats.model.nameGroup')" type="text" />
    </v-col>
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
          <v-checkbox v-bind="form.members" :value="user.id" :hide-details="true" />
          <v-avatar>
            <img alt="pro" :src="'https://randomuser.me/api/portraits/women/8.jpg'" width="50" />
          </v-avatar>
        </template>
        <!---Name-->
        <v-list-item-title class="text-subtitle-1 textPrimary w-100 font-weight-semibold">
          {{ user.name }}
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </perfect-scrollbar>
</template>

<style scoped></style>
