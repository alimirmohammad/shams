<template>
  <div class="page">
    <Header title="گزارشات" />
    <main class="bg-white text-center overflow-auto shadow-xl p-4 pt-10 pb-24">
      <ul class="flex flex-col gap-4">
        <li v-for="(item, index) in Array(15).fill('*')">
          <ItemCard
            title="سالنامه"
            date="۱۴۰۱/۱۲/۲۹"
            description="توضیحات مربوط به فیش واریزی"
          />
        </li>
      </ul>
      <FixedBottom has-bottom-sheet>
        <Button block @click="open = true">
          ثبت گزارش
          <template #icon>
            <AddIcon white />
          </template>
        </Button>
      </FixedBottom>
    </main>
    <BottomNavigation />
    <BottomSheet :open="open" @close="open = false">
      <EditReport @close="open = false" />
    </BottomSheet>
  </div>
</template>

<script setup lang="ts">
const open = ref(false);
</script>

<style scoped>
.page {
  @apply h-screen grid grid-cols-1 relative;
  grid-template-rows: auto 1fr auto;
}
</style>
