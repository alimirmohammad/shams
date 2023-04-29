<template>
  <div class="page">
    <Header title="سهام‌داران">
      <template #startAction>
        <IconText title="افزودن">
          <AddIcon />
        </IconText>
      </template>
    </Header>
    <main class="bg-white text-center overflow-auto shadow-xl p-4">
      <div class="flex flex-row items-center justify-center gap-4 mb-10">
        <span class="body-1 text-black">ارزش کل صندق</span>
        <div
          class="flex flex-row items-center justify-center gap-2 p-2 bg-primary-50 rounded-md"
        >
          <span class="body-1 text-gray-900">{{ total }}</span>
          <span class="body-2 text-gray-500">ریال</span>
        </div>
      </div>
      <Input
        v-model="query"
        id="query"
        label="جستجو"
        type="text"
        containerClass="mb-6"
      />
      <ul class="flex flex-col gap-4">
        <li v-for="(item, index) in Array(15).fill('*')">
          <NuxtLink to="/login">
            <PersonCard
              name="علی میرمحمد"
              :numOfShares="5"
              :debt="index % 5 === 0 ? 12_000_000 : undefined"
            />
          </NuxtLink>
        </li>
      </ul>
    </main>
    <BottomNavigation />
  </div>
</template>

<script setup lang="ts">
const query = ref('');
const total = convertToPersianDigit(2_500_000_000);
</script>

<style scoped>
.page {
  @apply h-screen grid grid-cols-1;
  grid-template-rows: auto 1fr auto;
}
</style>
