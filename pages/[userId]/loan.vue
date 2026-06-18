<template>
  <Person>
    <template #header>
      <IconText title="فیلتر" @click="modal = 'edit-filters'">
        <FilterIcon />
      </IconText>
      <select
        v-if="loans.length > 0"
        class="select select-primary select-sm text-left loan-select"
        :value="selectedLoanId ?? activeLoanId"
        @change="selectedLoanId = +($event.target as HTMLSelectElement).value"
      >
        <option v-for="loan in loans" :key="loan.id" :value="loan.id">
          {{ convertToJalaliString(loan.date) }}
        </option>
      </select>
      <PriceSummary title="مانده وام" :price="debt" />
    </template>
    <div
      v-if="isLoading"
      class="flex items-center justify-center w-full h-full bg-white"
    >
      <LoadingRipple />
    </div>
    <template v-else>
      <div v-if="currentLoan" class="flex justify-between items-center px-1 pb-2">
        <span class="body-3 text-gray-500">تاریخ وام: {{ convertToJalaliString(currentLoan.date) }}</span>
        <PriceSummary title="مبلغ وام" :price="currentLoan.amount" />
      </div>
      <ul v-if="bills.length > 0" class="flex flex-col gap-4">
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
      <EmptyState v-else />
    </template>
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
        overflow
        :open="modal === 'edit-filters'"
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
import type { Bill } from '~/components/EditBill.vue';
import type { Filters } from '~/components/FilterFields.vue';

type Modal = 'edit-bill' | 'delete-bill' | 'edit-filters' | 'none';
export type BillWithId = (typeof bills)['value'][number];

const route = useRoute();
const modal = ref<Modal>('none');
const selectedBill = ref<BillWithId | null>(null);
const activeIndex = ref<number | null>(null);
const selectedLoanId = ref<number | null>(null);
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
  if (selectedLoanId.value !== null) {
    result.append('loanId', String(selectedLoanId.value));
  }
  return result;
});

const { data, error, isError, isLoading } = useQuery({
  queryKey: ['loan', userId, filters, selectedLoanId],
  queryFn: () =>
    $fetch(`/api/people/${userId.value}/loan-bills?${searchParams.value}`),
});

const bills = computed(() => data.value?.bills ?? []);
const debt = computed(() => data.value?.debt ?? 0);
const loans = computed(() => data.value?.loans ?? []);
const activeLoanId = computed(() => data.value?.activeLoanId);
const currentLoan = computed(() =>
  loans.value.find(l => l.id === (selectedLoanId.value ?? activeLoanId.value)),
);

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
  mutationFn: (bill: Bill & { id?: number; loanId?: number }) =>
    $fetch(`/api/people/${userId.value}/loan-bills`, {
      method: 'POST',
      body: bill,
    }),
  onSuccess: () =>
    queryClient.invalidateQueries({ queryKey: ['loan', userId] }),
});

const {
  mutate: deleteBill,
  error: deleteError,
  isError: deleteIsError,
  isLoading: deleteIsLoading,
} = useMutation({
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
    { ...values, id, loanId: selectedLoanId.value ?? activeLoanId.value },
    {
      onSuccess: () => (modal.value = 'none'),
    },
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

watch(selectedLoanId, () => {
  activeIndex.value = null;
});
</script>

<style scoped>
.loan-select {
  background-position:
    calc(100% - 12px) 50%,
    calc(100% - 16px) 50%;
  padding-left: 0.75rem;
  padding-right: 2.5rem;
}
</style>
