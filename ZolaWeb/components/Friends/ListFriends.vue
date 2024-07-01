<script setup lang="ts">
import ListContact from '@/components/Friends/atom/ListContact.vue'

const props = defineProps({
  selectedMenuFriend: {
    type: Object,
    required: true,
    default: () => ({}),
  },
})

const { $api } = useNuxtApp()
const { data } = useAuth()
</script>
<template>
  <div>
    <div>
      <div class="d-flex align-center gap-3 pa-4">
        <!---Topbar Row-->
        <div class="d-flex gap-2 align-center">
          <!---User Avatar-->
          <div>
            <v-icon icon="mdi-account-details-outline" />
          </div>

          <!---Name & Last seen-->
          <div>
            <h5 class="text-h5 mb-n1">{{ selectedMenuFriend.title }}</h5>
          </div>
        </div>
      </div>
      <v-divider />
      <list-contact :selected-menu-friend="selectedMenuFriend" />
    </div>
  </div>
</template>
