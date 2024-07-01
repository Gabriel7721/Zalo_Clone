<script setup lang="ts">
import { ref, defineProps } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import profileBg from '@/images/backgrounds/profilebg.jpg'
const router = useRouter()

const { t } = useI18n()
const toast = useToast()
const { data, signOut } = useAuth()
const { $api } = useNuxtApp()
const user = ref({})
const auth = data.value

const avatarFile = ref<File | null>(null)
const coverFile = ref<File | null>(null)
const dialogAvatar = ref(false)
const dialogCover = ref(false)
const selectedAvatar = ref(null)
const selectedCover = ref(null)

const fetchProfile = async () => {
  await $api.users.getProfile(auth.id).then((res) => {
    user.value = res.data
  })
}

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  avatarFile.value = (target.files as FileList)[0] || null
  if (avatarFile.value) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0, img.width, img.height)
        canvas.toBlob(
          (blob) => {
            selectedAvatar.value = URL.createObjectURL(blob)
            dialogAvatar.value = true
          },
          'image/jpeg',
          0.8
        )
      }
      img.src = e.target.result as string
    }
    reader.readAsDataURL(avatarFile.value)
  }
}

const cancel = () => {
  selectedAvatar.value = null
  selectedCover.value = null
  dialogCover.value = false
  dialogAvatar.value = false
}

const updateAvatar = () => {
  uploadAvatar(avatarFile.value)
  dialogAvatar.value = false
}

const updateCover = () => {
  uploadCover(coverFile.value)
  dialogCover.value = false
}

const uploadAvatar = async (avatarFile: File) => {
  const formData = new FormData()
  formData.append('avatar', avatarFile)

  try {
    await $api.users.uploadAvatar(auth.id, formData)
    await fetchProfile()
    loadData()
    toast.success(t('profile.message.uploadAvatarSuccess'))
  } catch (error) {
    toast.error(t('profile.message.uploadAvatarError'))
  }
}

const handleFileCoverChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  coverFile.value = (target.files as FileList)[0] || null
  if (coverFile.value) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0, img.width, img.height)
        canvas.toBlob(
          (blob) => {
            selectedCover.value = URL.createObjectURL(blob)
            dialogCover.value = true
          },
          'image/jpeg',
          0.8
        )
      }
      img.src = e.target.result as string
    }
    reader.readAsDataURL(coverFile.value)
  }
}

const uploadCover = async (coverFile: File) => {
  const formData = new FormData()
  formData.append('image-cover', coverFile)

  try {
    await $api.users.uploadImageCover(auth.id, formData)
    await fetchProfile()
    toast.success(t('profile.message.uploadCoverSuccess'))
  } catch (error) {
    toast.error(t('profile.message.uploadCoverError'))
  }
}

const props = defineProps<{
  closeProfileDialog: () => void
  openEditProfile: () => void
  loadData: () => void
}>()
const loadData = () => {
  props.loadData()
}

const closeProfileDialog = () => {
  props.closeProfileDialog()
}

const openEditProfile = () => {
  props.closeProfileDialog()
  props.openEditProfile()
}

fetchProfile()
</script>
<template>
  <v-card class="overflow-hidden" elevation="10" style="height: 480px">
    <img v-if="user?.imageCover" alt="profile" class="w-100" :src="user?.imageCover" style="height: 123px" />
    <img v-else alt="profile" class="w-100" src="/images/backgrounds/profilebg.jpg" />
    <v-btn icon size="36px" style="left: 91%; top: -50px">
      <v-file-input
        accept="image/png, image/jpeg, image/jpg"
        class="file-input"
        prepend-icon="mdi-camera"
        style="right: -9.5px; top: 7px; position: absolute"
        @change="handleFileCoverChange"
      />
    </v-btn>

    <div>
      <v-row class="mt-1">
        <v-col class="d-flex justify-center order-sml-first">
          <div class="text-center top-spacer">
            <div class="avatar-border">
              <v-avatar class="userImage" size="100">
                <img
                  v-if="user?.avatar"
                  alt="profile"
                  class="w-100"
                  :src="user?.avatar"
                  style="
                    height: 100px;
                    width: 100px;
                    border-line: 1px;
                    border-radius: 50%;
                    border-color: lightgray;
                    border-style: solid;
                  "
                />
                <img v-else alt="Mathew" src="/images/profile/user-1.jpg" width="100" />
              </v-avatar>

              <h5 class="text-h5 mt-3">{{ user.name }}</h5>
            </div>
            <v-btn icon size="36px" style="top: -40%; left: 30%">
              <v-file-input
                accept="image/png, image/jpeg, image/jpg"
                class="file-input"
                prepend-icon="mdi-camera"
                style="right: -9.5px; top: 7px; position: absolute"
                @change="handleFileChange"
              />
            </v-btn>
          </div>
        </v-col>
      </v-row>
      <v-row class="text-h6 font-weight-medium text-center justify-center">
        <h4>{{ t('profile.informationUser') }}</h4>
      </v-row>
      <v-row>
        <v-col class="text-center" cols="6" sm="4" style="margin-left: 50px">
          <v-row class="mt-3">
            <h5 style="color: gray">{{ t('profile.model.sex') }}</h5>
          </v-row>
          <v-row class="mt-7">
            <h5 style="color: gray">{{ t('profile.model.birthday') }}</h5>
          </v-row>
          <v-row class="mt-7">
            <h5 style="color: gray">
              {{ t('profile.model.phone') }}
            </h5>
          </v-row>
        </v-col>
        <v-col>
          <v-row class="mt-3">
            <h5>{{ user.sex == true ? 'Nam' : 'Nữ' }}</h5>
          </v-row>
          <v-row class="mt-7">
            <h5>{{ user.birthday }}</h5>
          </v-row>
          <v-row class="mt-7">
            <h5>{{ user.phone }}</h5>
          </v-row>
        </v-col>
      </v-row>
    </div>
    <v-card-actions class="mt-5">
      <v-spacer />
      <v-btn color="error" flat text @click="closeProfileDialog">
        {{ t('profile.action.exit') }}
      </v-btn>
      <v-btn color="success" flat text @click="openEditProfile">
        {{ t('profile.action.edit') }}
      </v-btn>
    </v-card-actions>
  </v-card>
  <v-dialog v-model="dialogAvatar" max-width="500px" @click:outside="cancel">
    <v-card>
      <v-img v-if="selectedAvatar" class="mt-2" max-height="500px" :src="selectedAvatar" />
      <v-card-actions class="mt-4">
        <v-spacer />
        <v-btn color="primary" @click="updateAvatar">{{ t('profile.action.updateAvatar') }}</v-btn>
        <v-btn @click="cancel">{{ t('profile.action.cancel') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-dialog v-model="dialogCover" max-width="500px" @click:outside="cancel">
    <v-card>
      <v-img v-if="selectedCover" class="mt-2" max-height="500px" :src="selectedCover" />
      <v-card-actions class="mt-4">
        <v-spacer />
        <v-btn color="primary" @click="updateCover">{{ t('profile.action.updateCover') }}</v-btn>
        <v-btn @click="cancel">{{ t('profile.action.cancel') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<style scoped>
<style lang='scss' > .avatar-border {
  background-image: linear-gradient(rgb(80, 178, 252), rgb(244, 76, 102));
  border-radius: 50%;
  width: 110px;
  height: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  .userImage {
    border: 4px solid rgb(255, 255, 255);
  }
  margin-right: 0px;
}

.edit-border {
  background-image: linear-gradient(rgba(83, 83, 83, 0.738), rgba(103, 103, 103, 0.64));
  border-radius: 50%;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  .userImage {
    border: 4px solid rgb(255, 255, 255);
  }
}

.top-spacer {
  margin-top: -95px;
}

.profiletab .v-slide-group__content {
  justify-content: end;
  .v-btn--variant-text .v-btn__overlay {
    background: transparent;
  }
}

.file-input:deep().v-input__control,
.file-input:deep().v-input__details {
  display: none;
}
</style>
