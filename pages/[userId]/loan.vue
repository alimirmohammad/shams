<template>
  <Person>
    <template #header>
      <IconText title="فیلتر">
        <FilterIcon />
      </IconText>
      <PriceSummary title="مانده وام" :price="debt" />
    </template>
    <ul class="flex flex-col gap-4">
      <li v-for="bill in bills" :key="bill.id">
        <ItemCard
          :price="bill.amount"
          :date="bill.date"
          :description="bill.description"
          @edit="openEditModal(bill)"
          @delete="openDeleteModal(bill)"
        />
      </li>
    </ul>
    <FixedBottom>
      <Button block @click="modal = 'edit-bill'">
        افزودن فیش
        <template #icon>
          <AddIcon white />
        </template>
      </Button>
    </FixedBottom>
    <template #bottom-sheet>
      <BottomSheet :open="modal === 'edit-bill'" @close="modal = 'none'">
        <EditBill
          @submit="editBill"
          @close="modal = 'none'"
          :bill="selectedBill"
        />
      </BottomSheet>
      <BottomSheet :open="modal === 'delete-bill'" @close="modal = 'none'">
        <DeleteBill
          @close="modal = 'none'"
          @confirm="onDeleteBill(selectedBill?.id)"
        />
      </BottomSheet>
    </template>
  </Person>
</template>

<script setup lang="ts">
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { Bill } from '~/components/EditBill.vue';

type Modal = 'edit-bill' | 'delete-bill' | 'none';
export type BillWithId = (typeof bills)['value'][number];

const route = useRoute();
const modal = ref<Modal>('none');
const selectedBill = ref<BillWithId | null>(null);
const userId = computed(() => route.params.userId);

const { data } = useQuery({
  queryKey: ['loan', userId],
  queryFn: () => $fetch(`/api/people/${userId.value}/loan-bills`),
});

const bills = computed(() => data.value?.bills ?? []);
const debt = computed(() => data.value?.debt ?? 0);

function openDeleteModal(bill: BillWithId) {
  selectedBill.value = bill;
  modal.value = 'delete-bill';
}

function openEditModal(bill: BillWithId) {
  selectedBill.value = bill;
  modal.value = 'edit-bill';
}

function onDeleteBill(id: number | undefined) {
  if (!id) return;
  deleteBill(id, {
    onSuccess: () => (modal.value = 'none'),
  });
}

const queryClient = useQueryClient();

const { mutate } = useMutation({
  mutationFn: (bill: Bill & { id?: number }) =>
    $fetch(`/api/people/${userId.value}/loan-bills`, {
      method: 'POST',
      body: bill,
    }),
  onSuccess: () =>
    queryClient.invalidateQueries({ queryKey: ['loan', userId] }),
});

const { mutate: deleteBill } = useMutation({
  mutationFn: (id: number) =>
    $fetch(`/api/people/${userId.value}/loan-bills`, {
      method: 'DELETE',
      body: { id },
    }),
  onSuccess: () =>
    queryClient.invalidateQueries({ queryKey: ['loan', userId] }),
});

function editBill(values: Bill, id?: number) {
  mutate(
    { ...values, id },
    {
      onSuccess: () => (modal.value = 'none'),
    }
  );
}

watchEffect(() => {
  if (modal.value === 'none') {
    selectedBill.value = null;
  }
});
</script>
