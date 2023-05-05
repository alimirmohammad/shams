<template>
  <div class="page">
    <Header :title="title">
      <template #startAction>
        <IconButton>
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
        <PriceSummary title="مانده وام" :price="14_000_000" />
      </div>
      <ul class="flex flex-col gap-4">
        <li v-for="(item, index) in Array(15).fill('*')">
          <ItemCard
            :price="2_000_000"
            date="۱۴۰۱/۵/۱"
            description="توضیحات مربوط به فیش واریزی"
          />
        </li>
      </ul>
      <FixedBottom>
        <Button block>
          افزودن فیش
          <template #icon>
            <AddIcon white />
          </template>
        </Button>
      </FixedBottom>
    </main>
  </div>
</template>

<script setup lang="ts">
const name = ref('آرش کوشش');
const numOfSharesPersian = computed(() => convertToPersianDigit(5));
const total = computed(() => convertToPersianDigit(24_000_000));
const title = computed(() => `${name.value} (${numOfSharesPersian.value})`);
const tabs = [
  { label: 'سهام', to: '/share' },
  { label: 'وام', to: '/debt' },
];
</script>

<style scoped>
.page {
  @apply h-screen grid grid-cols-1 relative;
  grid-template-rows: auto 1fr;
}
</style>
