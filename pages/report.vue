<template>
  <div class="page">
    <Header title="گزارشات">
      <template #startAction>
        <IconButton>
          <ArrowRightIcon />
        </IconButton>
      </template>
    </Header>
    <main class="bg-white overflow-auto shadow-xl p-4 pt-8">
      <h1 class="heading-3 text-gray-900 mb-8">{{ title }}</h1>
      <p class="body-1 text-gray-900">{{ description }}</p>
    </main>
  </div>
</template>

<script setup lang="ts">
const title = ref('سالنامه ۱۴۰۱');
const description = ref(`صندوق شمس در سال ۱۴۰۱ میزان ۵۰ درصد صود
کرده است. صندوق شمس در سال ۱۴۰۱ میزان ۵۰ درصد صود کرده است. 
صندوق شمس در سال ۱۴۰۱ میزان ۵۰ درصد صود
کرده است. صندوق شمس در سال ۱۴۰۱ میزان ۵۰ درصد صود کرده است. 
صندوق شمس در سال ۱۴۰۱ میزان ۵۰ درصد صود
کرده است. صندوق شمس در سال ۱۴۰۱ میزان ۵۰ درصد صود کرده است. صندوق شمس در سال ۱۴۰۱ میزان ۵۰ درصد صود کرده است. صندوق شمس در سال ۱۴۰۱ میزان ۵۰ درصد صود کرده است. 
صندوق شمس در سال ۱۴۰۱ میزان ۵۰ درصد صود
کرده است. صندوق شمس در سال ۱۴۰۱ میزان ۵۰ درصد صود کرده است.`);
</script>

<style scoped>
.page {
  @apply h-screen grid grid-cols-1 relative;
  grid-template-rows: auto 1fr;
}
</style>
