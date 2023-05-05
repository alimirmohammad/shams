<template>
  <div class="page">
    <Header title="سهام‌داران">
      <template #startAction>
        <IconText title="افزودن">
          <AddIcon />
        </IconText>
      </template>
    </Header>
    <main class="bg-white text-center overflow-auto p-4">
      <PriceSummary
        title="ارزش کل صندق"
        :price="2_500_000_000"
        lg
        class="mb-10"
      />
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
</script>

<style scoped>
.page {
  @apply h-screen grid grid-cols-1;
  grid-template-rows: auto 1fr auto;
}
</style>
