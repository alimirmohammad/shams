<template>
  <div class="page">
    <Header title="وام‌های تسویه نشده">
      <template #startAction>
        <IconText title="افزودن" @click="open = true">
          <AddIcon />
        </IconText>
      </template>
    </Header>
    <main class="bg-white text-center overflow-auto p-4">
      <ul class="flex flex-col gap-4">
        <li v-for="loan in loans" :key="loan.id">
          <ItemCard
            :price="loan.amount"
            :date="loan.date"
            :description="loan.description"
            :username="`${loan.user.firstName} ${loan.user.lastName}`"
            @delete="modal = 'delete-bill'"
            @edit="modal = 'edit-bill'"
          />
        </li>
      </ul>
    </main>
    <BottomNavigation />
    <BottomSheet :open="open" @close="open = false">
      <EditLoan @close="open = false" />
    </BottomSheet>
    <BottomSheet :open="modal === 'edit-bill'" @close="modal = 'none'">
      <EditBill @close="modal = 'none'" />
    </BottomSheet>
    <BottomSheet :open="modal === 'delete-bill'" @close="modal = 'none'">
      <DeleteBill @close="modal = 'none'" />
    </BottomSheet>
  </div>
</template>

<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query';

const query = ref('');
const open = ref(false);

const {
  data: loans,
  error,
  isSuccess,
} = useQuery({
  queryKey: ['loans'],
  queryFn: () => $fetch('/api/loans/list'),
});

type Modal = 'edit-bill' | 'delete-bill' | 'none';
const modal = ref<Modal>('none');
</script>

<style scoped>
.page {
  @apply h-screen grid grid-cols-1;
  grid-template-rows: auto 1fr auto;
}
</style>
