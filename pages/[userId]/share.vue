<template>
  <Person>
    <template #header>
      <IconText title="فیلتر" @click="modal = 'edit-filters'">
        <FilterIcon />
      </IconText>
      <PriceSummary title="ارزش سهام" :price="balance" />
    </template>
    <div
      v-if="isLoading"
      class="flex items-center justify-center w-full h-full bg-white"
    >
      <LoadingRipple />
    </div>
    <ul v-else class="flex flex-col gap-4">
      <li v-for="(bill, index) in bills" :key="bill.id">
        <ItemCard
          :price="bill.amount"
          :date="bill.date"
          :description="bill.description"
          :expanded="index === activeIndex"
          @click="activeIndex = index"
          @edit="openEditModal(bill)"
          @delete="openDeleteModal(bill)"
        />
      </li>
    </ul>
    <FixedBottom v-if="isAdmin">
      <Button block @click="modal = 'edit-bill'">
        افزودن فیش
        <template #icon>
          <AddIcon white />
        </template>
      </Button>
    </FixedBottom>
    <template #bottom-sheet>
      <BottomSheet
        v-if="isAdmin"
        :open="modal === 'edit-bill'"
        @close="modal = 'none'"
      >
        <EditBill
          @submit="editBill"
          @close="modal = 'none'"
          :bill="selectedBill"
          :loading="upsertIsLoading"
        />
      </BottomSheet>
      <BottomSheet
        v-if="isAdmin"
        :open="modal === 'delete-bill'"
        @close="modal = 'none'"
      >
        <DeleteItem
          @close="modal = 'none'"
          @confirm="onDeleteBill(selectedBill?.id)"
          title="آیا از حذف این فیش اطمینان دارید؟"
          okLabel="حذف فیش"
          cancelLabel="پشیمان شدم"
          :loading="deleteIsLoading"
        />
      </BottomSheet>
      <BottomNavigationRestricted v-else />
      <BottomSheet
        :open="modal === 'edit-filters'"
        overflow
        @close="modal = 'none'"
      >
        <FilterFields
          @submit="updateFilters"
          @close="modal = 'none'"
          :from="filters.from"
          :to="filters.to"
          :loading="isLoading"
        />
      </BottomSheet>
    </template>
    <ToastError
      :error="error || deleteError || upsertError"
      :is-error="isError || deleteIsError || upsertIsError"
    />
  </Person>
</template>

<script setup lang="ts">
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { Bill } from '~/components/EditBill.vue';
import { BillWithId } from './loan.vue';
import { Filters } from '~/components/FilterFields.vue';

type Modal = 'edit-bill' | 'delete-bill' | 'edit-filters' | 'none';

const route = useRoute();
const modal = ref<Modal>('none');
const activeIndex = ref<number | null>(null);
const selectedBill = ref<BillWithId | null>(null);
const userId = computed(() => route.params.userId);
const filters = reactive<{
  from?: Date;
  to?: Date;
}>({
  from: undefined,
  to: undefined,
});

const { data: me } = useMe();
const isAdmin = computed(() => me.value?.role === 'ADMIN');

const searchParams = computed(() => {
  const result = new URLSearchParams();
  result.append('from', filters.from?.toISOString() ?? '');
  result.append('to', filters.to?.toISOString() ?? '');
  return result;
});

const { data, error, isError, isLoading } = useQuery({
  queryKey: ['share', userId, filters],
  queryFn: () =>
    $fetch(`/api/people/${userId.value}/share-bills?${searchParams.value}`),
});

const bills = computed(() => data.value?.bills ?? []);
const balance = computed(() => data.value?.balance ?? 0);

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

const {
  mutate,
  error: upsertError,
  isError: upsertIsError,
  isLoading: upsertIsLoading,
} = useMutation({
  mutationFn: (bill: Bill & { id?: number }) =>
    $fetch(`/api/people/${userId.value}/share-bills`, {
      method: 'POST',
      body: bill,
    }),
  onSuccess: () => queryClient.invalidateQueries(['share', userId]),
});

const {
  mutate: deleteBill,
  error: deleteError,
  isError: deleteIsError,
  isLoading: deleteIsLoading,
} = useMutation({
  mutationFn: (id: number) =>
    $fetch(`/api/people/${userId.value}/share-bills`, {
      method: 'DELETE',
      body: { id },
    }),
  onSuccess: () =>
    queryClient.invalidateQueries({ queryKey: ['share', userId] }),
});

function editBill(values: Bill, id?: number) {
  mutate(
    { ...values, id },
    {
      onSuccess: () => (modal.value = 'none'),
    }
  );
}

function updateFilters(value: Filters) {
  if (value.from) {
    filters.from = value.from;
  } else {
    filters.from = undefined;
  }
  if (value.to) {
    filters.to = value.to;
  } else {
    filters.to = undefined;
  }
  modal.value = 'none';
}

watchEffect(() => {
  if (modal.value === 'none') {
    selectedBill.value = null;
  }
});
</script>
