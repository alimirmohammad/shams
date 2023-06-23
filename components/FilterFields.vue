<template>
  <Form @submit="onSubmit" :validation-schema="filtersSchema" class="font-fa">
    <PersianDatePicker
      id="from"
      label="از"
      :initialValue="from?.toISOString()"
      class="mb-6"
    />
    <PersianDatePicker
      id="to"
      label="تا"
      :initialValue="to?.toISOString()"
      class="mb-6"
    />
    <Button block type="submit"> اعمال فیلتر </Button>
  </Form>
</template>

<script setup lang="ts">
import { z } from 'zod';

const dateField = z
  .string()
  .pipe(
    z.coerce
      .date({
        invalid_type_error: 'تاریخ اشتباه است',
      })
      .max(new Date(), 'تاریخ نمی‌تواند در آینده باشد')
  )
  .or(z.literal(''));

const schema = z
  .object({
    from: dateField,
    to: dateField,
  })
  .refine(
    schema => {
      if (
        schema.from &&
        schema.to &&
        schema.from.getTime() >= schema.to.getTime()
      ) {
        return false;
      }
      return true;
    },
    { message: 'تاریخ از نباید پس از تاریخ تا باشد', path: ['from'] }
  );

const filtersSchema = toTypedSchema(schema);
export type Filters = z.infer<typeof schema>;

type Props = {
  from?: Date;
  to?: Date;
};

type Emits = {
  (e: 'close'): void;
  (e: 'submit', filters: Filters): void;
};

defineProps<Props>();
const emit = defineEmits<Emits>();

function onSubmit(values: unknown): void {
  emit('submit', values as Filters);
}
</script>
