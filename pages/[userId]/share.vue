<template>
  <Person>
    <template #header>
      <IconText title="فیلتر">
        <FilterIcon />
      </IconText>
      <PriceSummary title="ارزش سهام" :price="balance" />
    </template>
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
    <template #bottom-sheet>
      <BottomSheet :open="modal === 'edit-bill'" @close="modal = 'none'">
        <EditBill @submit="editBill" @close="modal = 'none'" />
      </BottomSheet>
      <BottomSheet :open="modal === 'delete-bill'" @close="modal = 'none'">
        <DeleteBill @close="modal = 'none'" />
      </BottomSheet>
    </template>
  </Person>
</template>

<script setup lang="ts">
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { Bill } from '~/components/EditBill.vue';

type Modal = 'edit-bill' | 'delete-bill' | 'none';

const route = useRoute();
const modal = ref<Modal>('none');
const userId = computed(() => route.params.userId);

const { data } = useQuery({
  queryKey: ['share', userId],
  queryFn: () => $fetch(`/api/people/${userId.value}/share-bills`),
});

const bills = computed(() => data.value?.bills ?? []);
const balance = computed(() => data.value?.balance ?? 0);

const queryClient = useQueryClient();

const { mutate } = useMutation({
  mutationFn: (bill: Bill) =>
    $fetch(`/api/people/${userId.value}/share-bills`, {
      method: 'POST',
      body: bill,
    }),
  onSuccess: () => queryClient.invalidateQueries(['share', userId]),
});

function editBill(values: Bill) {
  mutate(values, {
    onSuccess: () => (modal.value = 'none'),
  });
}
</script>
