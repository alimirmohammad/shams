<template>
  <div class="page">
    <Header class="font-fa" :title="title">
      <template #startAction>
        <IconButton @click="$router.back">
          <ArrowRightIcon />
        </IconButton>
      </template>
      <template #endAction>
        <IconText title="ویرایش">
          <EditIcon />
        </IconText>
      </template>
    </Header>
    <main class="bg-white text-center overflow-auto shadow-xl p-4 pb-24">
      <Tabs :tabs="tabs" :active-tab="$route.path" class="mx-auto mb-4" />
      <div class="flex flex-row items-center justify-between mb-4">
        <IconText title="فیلتر">
          <FilterIcon />
        </IconText>
        <PriceSummary title="ارزش سهام" :price="balance" />
      </div>
      <ul class="flex flex-col gap-4">
        <li v-for="bill in bills" :key="bill.id">
          <ItemCard
            :price="bill.amount"
            :date="bill.date"
            :description="bill.description"
          />
        </li>
      </ul>
      <FixedBottom>
        <Button block @click="open = true">
          افزودن فیش
          <template #icon>
            <AddIcon white />
          </template>
        </Button>
      </FixedBottom>
    </main>
    <BottomSheet :open="open" @close="open = false">
      <EditBill @close="open = false" />
    </BottomSheet>
  </div>
</template>

<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query';

const open = ref(false);
const route = useRoute();
const userId = computed(() => route.params.userId);
const tabs = computed(() => [
  { label: 'سهام', to: `/${userId.value}/share` },
  { label: 'وام', to: `/${userId.value}/loan` },
]);

const { data } = useQuery({
  queryKey: ['share', userId],
  queryFn: () => $fetch(`/api/people/${userId.value}/share`),
});

const name = computed(() => `${data.value?.firstName} ${data.value?.lastName}`);
const numOfSharesPersian = computed(() => data.value?.numOfShares);
const title = computed(() =>
  data.value ? `${name.value} (${numOfSharesPersian.value})` : ''
);
const bills = computed(() => data.value?.bills ?? []);
const balance = computed(() => data.value?.balance ?? 0);
</script>

<style scoped>
.page {
  @apply h-screen grid grid-cols-1 relative;
  grid-template-rows: auto 1fr;
}
</style>
