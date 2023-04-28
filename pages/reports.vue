<template>
  <div class="page">
    <Header title="گزارشات" />
    <main class="bg-white text-center overflow-auto">
      <ul>
        <li v-for="(item, index) in Array(100).fill('*')">
          {{ index }}
        </li>
      </ul>
    </main>
    <BottomNavigation />
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.page {
  @apply h-screen grid grid-cols-1;
  grid-template-rows: auto 1fr auto;
}
</style>
