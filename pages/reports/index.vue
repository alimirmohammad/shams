<template>
  <div class="page">
    <Header title="گزارشات" />
    <div
      v-if="isLoading"
      class="flex items-center justify-center w-full h-full bg-white"
    >
      <LoadingRipple />
    </div>
    <main
      v-else
      class="bg-white text-center overflow-auto shadow-xl p-4 pt-10 pb-24"
    >
      <ul class="flex flex-col gap-4">
        <li v-for="report in reports" :key="report.id">
          <ItemCard
            :title="report.title"
            :description="report.description"
            :to="`/reports/${report.id}`"
            @delete="openDeleteModal(report)"
            @edit="openEditModal(report)"
          />
        </li>
      </ul>
      <FixedBottom has-bottom-sheet>
        <Button block @click="modal = 'edit-report'">
          ثبت گزارش
          <template #icon>
            <AddIcon white />
          </template>
        </Button>
      </FixedBottom>
    </main>
    <BottomNavigation />
    <BottomSheet :open="modal === 'edit-report'" @close="modal = 'none'">
      <EditReport @close="modal = 'none'" :report="selectedReport" />
    </BottomSheet>
    <BottomSheet :open="modal === 'delete-report'" @close="modal = 'none'">
      <DeleteItem
        @close="modal = 'none'"
        @confirm="onDeleteReport(selectedReport?.id)"
        title="آیا از حذف این گزارش اطمینان دارید؟"
        okLabel="حذف گزارش"
        cancelLabel="پشیمان شدم"
        :loading="deleteIsLoading"
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
  queryKey: ['reports'],
  queryFn: () => $fetch('/api/reports'),
});

const reports = computed(() => data.value ?? []);

export type SelectedReport = (typeof reports)['value'][number] | null;
type Modal = 'edit-report' | 'delete-report' | 'none';
const modal = ref<Modal>('none');
const selectedReport = ref<SelectedReport>(null);

function openDeleteModal(report: SelectedReport) {
  selectedReport.value = report;
  modal.value = 'delete-report';
}

function openEditModal(report: SelectedReport) {
  selectedReport.value = report;
  modal.value = 'edit-report';
}

function onDeleteReport(id: number | undefined) {
  if (!id) return;
  deleteLoan(id, {
    onSuccess: () => (modal.value = 'none'),
  });
}

const queryClient = useQueryClient();

const {
  mutate: deleteLoan,
  error: deleteError,
  isError: deleteIsError,
  isLoading: deleteIsLoading,
} = useMutation({
  mutationFn: (id: number) =>
    $fetch('/api/reports', {
      method: 'DELETE',
      body: { id },
    }),
  onSuccess: () => queryClient.invalidateQueries(['reports']),
});

watchEffect(() => {
  if (modal.value === 'none') {
    selectedReport.value = null;
  }
});
</script>

<style scoped>
.page {
  @apply h-screen grid grid-cols-1 relative;
  grid-template-rows: auto 1fr auto;
}
</style>
