<template>
  <div class="page">
    <Header title="وام‌های تسویه نشده">
      <template #startAction>
        <IconText title="افزودن" @click="modal = 'edit-loan'">
          <AddIcon />
        </IconText>
      </template>
    </Header>
    <div
      v-if="isLoading"
      class="flex items-center justify-center w-full h-full bg-white"
    >
      <LoadingRipple />
    </div>
    <main v-else class="bg-white text-center overflow-auto p-4">
      <ul class="flex flex-col gap-4">
        <li v-for="(loan, index) in loans" :key="loan.id">
          <ItemCard
            :price="loan.amount"
            :date="loan.date"
            :description="loan.description"
            :username="`${loan.user.firstName} ${loan.user.lastName}`"
            :expanded="index === activeIndex"
            @click="activeIndex = index"
            @delete="openDeleteModal(loan)"
            @edit="openEditModal(loan)"
          />
        </li>
      </ul>
    </main>
    <BottomNavigation />
    <BottomSheet :open="modal === 'edit-loan'" @close="modal = 'none'">
      <EditLoan @close="modal = 'none'" :loan="selectedLoan" />
    </BottomSheet>
    <BottomSheet :open="modal === 'delete-loan'" @close="modal = 'none'">
      <DeleteItem
        @close="modal = 'none'"
        @confirm="onDeleteLoan(selectedLoan?.id)"
        title="آیا از حذف این وام اطمینان دارید؟"
        okLabel="حذف وام"
        cancelLabel="پشیمان شدم"
        :loading="deleteLoading"
      />
    </BottomSheet>
    <ToastError
      :error="error || deleteError"
      :is-error="isError || deleteIsError"
    />
  </div>
</template>

<script setup lang="ts">
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';

const { data, error, isError, isLoading } = useQuery({
  queryKey: ['loans'],
  queryFn: () => $fetch('/api/loans'),
});

const loans = computed(() => data.value ?? []);

export type SelectedLoan = (typeof loans)['value'][number] | null;
type Modal = 'edit-loan' | 'delete-loan' | 'none';
const modal = ref<Modal>('none');
const selectedLoan = ref<SelectedLoan>(null);
const activeIndex = ref<number | null>(null);

function openDeleteModal(loan: SelectedLoan) {
  selectedLoan.value = loan;
  modal.value = 'delete-loan';
}

function openEditModal(loan: SelectedLoan) {
  selectedLoan.value = loan;
  modal.value = 'edit-loan';
}

function onDeleteLoan(id: number | undefined) {
  if (!id) return;
  deleteLoan(id, {
    onSuccess: () => (modal.value = 'none'),
  });
}

const queryClient = useQueryClient();

const {
  mutate: deleteLoan,
  isLoading: deleteLoading,
  error: deleteError,
  isError: deleteIsError,
} = useMutation({
  mutationFn: (id: number) =>
    $fetch(`/api/loans`, {
      method: 'DELETE',
      body: { id },
    }),
  onSuccess: () =>
    Promise.allSettled([
      queryClient.invalidateQueries(['eligible']),
      queryClient.invalidateQueries(['loans']),
    ]),
});

watchEffect(() => {
  if (modal.value === 'none') {
    selectedLoan.value = null;
  }
});
</script>

<style scoped>
.page {
  @apply h-screen grid grid-cols-1;
  grid-template-rows: auto 1fr auto;
}
</style>
