import EmojiPicker from 'vue3-emoji-picker'
// import css
import 'vue3-emoji-picker/css'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('EmojiPicker', EmojiPicker)
})
