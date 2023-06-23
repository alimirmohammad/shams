<template>
  <Form @submit="onSubmit" :validationSchema="editReportSchema" class="font-fa">
    <Input
      id="title"
      label="عنوان"
      type="text"
      containerClass="mb-10"
      :initialValue="report?.title"
    />
    <Input
      id="description"
      label="توضیحات"
      multiline
      rows="5"
      containerClass="mb-10"
      :initialValue="report?.description"
    />
    <Button block type="submit" :loading="isLoading">
      ثبت گزارش
      <template #icon>
        <TickSquareIcon white />
      </template>
    </Button>
    <ToastError :error="error" :is-error="isError" />
  </Form>
</template>

<script setup lang="ts">
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { z } from 'zod';

const schema = z.object({
  title: z.string().nonempty('وارد کردن عنوان الزامی است'),
  description: z.string().nonempty('وارد کردن توضیحات الزامی است'),
});

const editReportSchema = toTypedSchema(schema);

type Props = {
  report?: ReportWithId | null;
};
type Emits = {
  (e: 'close'): void;
};

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

type Report = z.infer<typeof schema>;
type ReportWithId = Report & { id: number };

const queryClient = useQueryClient();

const { mutate, error, isError, isLoading } = useMutation({
  mutationFn: (values: Report) =>
    $fetch('/api/reports', {
      method: 'POST',
      body: { ...values, id: props.report?.id },
    }),
  onSuccess: () => queryClient.invalidateQueries(['reports']),
});

function onSubmit(values: unknown): void {
  mutate(values as Report, {
    onSuccess: () => emit('close'),
  });
}
</script>
