<template>
  <div class="fixed-bottom">
    <slot />
  </div>
</template>

<style scoped>
.fixed-bottom {
  @apply absolute bottom-6;
  width: calc(100% - 2rem);
}
</style>
