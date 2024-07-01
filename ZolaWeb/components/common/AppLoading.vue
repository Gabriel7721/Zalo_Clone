<script setup lang="ts">
const props = defineProps({
  absolute: {
    type: Boolean,
    default: false,
  },
  border: {
    type: Boolean,
    default: false,
  },
  overlay: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <div
    class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-gap-1 tw-w-full tw-h-full tw-z-[9999]"
    :class="[
      { 'tw-absolute tw-top-1/2 tw-left-1/2 tw-translate-y-[-50%] tw-translate-x-[-50%]': absolute },
      { 'tw-border tw-border-solid tw-border-gray-200': border },
      { 'tw-bg-[#7f7f7f80]': overlay },
    ]"
  >
    <img alt="" src="/images/loading.gif" :width="200" />
  </div>
</template>
