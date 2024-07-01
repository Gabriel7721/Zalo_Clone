<script setup lang="ts"></script>

<template>
  <!---/Left chat list -->
  <div class="d-flex">
    <div class="left-part">
      <!-- <perfect-scrollbar style="height: calc(100vh - 290px)"> -->
      <slot name="leftpart" />
      <!-- </perfect-scrollbar> -->
    </div>

    <!---right chat conversation -->
    <div class="right-part">
      <slot name="rightpart" />
    </div>
  </div>
</template>

<style lang="scss">
.left-part {
  width: 280px;
  border-right: 1px solid rgb(var(--v-theme-borderColor));
  min-height: 500px;
  transition: 0.1s ease-in;
  flex-shrink: 0;
  height: 100vh;
}
.v-theme--light {
  .left-part {
    background: white;
  }
}
.v-theme--dark {
  .left-part {
    background: #2b2b2b;
  }
}
.right-part {
  width: 100%;
  min-height: 500px;
  position: relative;
  max-height: 100vh;
}
</style>
