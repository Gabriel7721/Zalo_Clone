<script setup lang="ts">
import { VueFinalModal } from 'vue-final-modal'
import { useI18n } from 'vue-i18n'
import { includes } from 'lodash'
import AppLoading from '@/components/common/AppLoading'

const { t } = useI18n()

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  submitText: {
    type: String,
    default: '',
  },
  cancelText: {
    type: String,
    default: '',
  },
  cardTextClass: {
    type: String,
    default: 'tw-overflow-y-auto',
  },
  hideSubmit: {
    type: Boolean,
    default: false,
  },
  width: {
    type: [String, Number],
    default: '70%',
  },
  loading: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <vue-final-modal
    class="tw-flex tw-justify-center tw-items-center"
    :click-to-close="false"
    content-transition="vfm-fade"
    overlay-transition="vfm-fade"
  >
    <v-card class="tw-m-auto tw-relative" max-width="90vw" :width="width">
      <v-card-title class="tw-py-2 tw-px-2 tw-bg-[#E0E0E0] tw-rounded-t tw-rounded-b-none">
        <span class="tw-text-[#000000de] tw-text-xl tw-font-medium">{{ title }}</span>
      </v-card-title>
      <app-loading v-if="loading" absolute overlay />
      <!--      <v-skeleton-loader v-if="loading" type="list-item@5" />-->
      <v-card-text class="tw-py-2 tw-px-4 tw-max-h-[80vh]" :class="cardTextClass">
        <slot />
      </v-card-text>
      <v-card-actions
        class="d-flex justify-end tw-py-1 tw-px-3 tw-border-t tw-border-b-0 tw-border-r-0 tw-border-l-0 tw-border-[#0000001f] tw-border-solid"
      >
        <v-btn
          v-if="includes(Object.keys($attrs), 'onCancel')"
          class="tw-bg-[#F5F5F5]"
          :disabled="loading"
          @click="$attrs.onCancel"
        >
          <span class="tw-text-sm tw-text-[#424242] tw-font-medium">
            {{ cancelText || t('common.action.cancel') }}
          </span>
        </v-btn>
        <v-btn
          v-if="includes(Object.keys($attrs), 'onSubmit') && !hideSubmit"
          class="tw-bg-primary"
          :disabled="loading"
          @click="$attrs.onSubmit"
        >
          <span class="tw-text-sm tw-text-white tw-font-medium">
            {{ submitText || t('common.action.save') }}
          </span>
        </v-btn>
      </v-card-actions>
    </v-card>
  </vue-final-modal>
</template>
