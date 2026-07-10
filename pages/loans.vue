<template>
  <div class="page">
    <Header title="وام‌ها">
      <template #startAction>
        <IconText title="افزودن" @click="modal = 'edit-loan'">
          <AddIcon />
        </IconText>
      </template>
    </Header>
    <main class="bg-white text-center overflow-auto p-4">
      <div class="tabs tabs-boxed bg-primary-50 w-max mx-auto mb-4">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          class="tab text-gray-700 px-11 headline-3"
          :class="{
            'bg-white border-2 border-primary-500 text-gray-900':
              activeTab === tab.value,
          }"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>
      <div
        v-if="activeTab === 'unsettled'"
        class="flex flex-row items-center justify-end mb-4"
      >
        <PriceSummary title="جمع بدهی اعضا" :price="totalDebt" />
      </div>
      <div
        v-if="isLoading"
        class="flex items-center justify-center w-full py-10"
      >
        <LoadingRipple />
      </div>
      <template v-else>
        <ul v-if="loans.length > 0" class="flex flex-col gap-4">
          <li v-for="(loan, index) in loans" :key="loan.id">
            <ItemCard
              :price="loan.amount"
              :date="loan.date"
              :description="loan.description"
              :username="`${loan.user.firstName} ${loan.user.lastName}`"
              :expanded="index === activeIndex"
              :link="{
                text: 'مشاهده اقساط',
                url: `/${loan.user.id}/loan?loanId=${loan.id}`,
              }"
              @click="activeIndex = index"
              @delete="openDeleteModal(loan)"
              @edit="openEditModal(loan)"
            />
          </li>
        </ul>
        <EmptyState v-else />
        <div ref="sentinel" />
        <div
          v-if="isFetchingNextPage"
          class="flex items-center justify-center w-full py-4"
        >
          <LoadingRipple />
        </div>
      </template>
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
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/vue-query';

type Tab = 'unsettled' | 'settled';
const tabs: { label: string; value: Tab }[] = [
  { label: 'تسویه نشده', value: 'unsettled' },
  { label: 'تسویه شده', value: 'settled' },
];

const route = useRoute();
const router = useRouter();

function isTab(value: unknown): value is Tab {
  return value === 'unsettled' || value === 'settled';
}

const activeTab = computed<Tab>({
  get: () => (isTab(route.query.tab) ? route.query.tab : 'unsettled'),
  set: tab => {
    router.replace({ query: { ...route.query, tab } });
  },
});

const {
  data,
  error,
  isError,
  isLoading,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useInfiniteQuery({
  queryKey: ['loans', activeTab],
  queryFn: ({ pageParam = 1 }) =>
    $fetch('/api/loans', {
      query: { status: activeTab.value, page: pageParam },
    }),
  getNextPageParam: lastPage => lastPage.nextPage ?? undefined,
});

const loans = computed(
  () => data.value?.pages.flatMap(page => page.loans) ?? []
);
const totalDebt = computed(() => data.value?.pages[0]?.totalDebt ?? 0);

const canLoadMore = computed(
  () => !!hasNextPage?.value && !isFetchingNextPage.value
);
const { sentinel } = useInfiniteScroll(() => fetchNextPage(), canLoadMore);

export type SelectedLoan = (typeof loans)['value'][number] | null;
type Modal = 'edit-loan' | 'delete-loan' | 'none';
const modal = ref<Modal>('none');
const selectedLoan = ref<SelectedLoan>(null);
const activeIndex = ref<number | null>(null);

watch(activeTab, () => {
  activeIndex.value = null;
});

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
      queryClient.invalidateQueries(['people']),
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
