<template>
  <div class="date-picker" :class="{ 'error-border': errorMessage }">
    <label :for="id" class="label">
      <span
        class="label-text label-3 text-gray-500"
        :class="{ 'text-red-500': errorMessage }"
      >
        {{ label }}
      </span>
    </label>
    <DatePicker
      :id="id"
      mode="single"
      :column="1"
      clearable
      @update:modelValue="handleChange($event, shouldValidate)"
      :modelValue="initialValue.split('T').at(0)"
      @close="handleChange(value)"
      @clear="handleChange(value)"
      inputmode="none"
      :modal="modal"
      :styles="datePickerStyles"
    />
    <div v-if="errorMessage" class="mt-2">
      <span v-if="errorMessage" class="block body-3 text-red-500 text-start">
        {{ errorMessage }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
type Props = {
  id: string;
  label: string;
  initialValue?: string;
  inputClass?: string;
  containerClass?: string;
  modal?: boolean;
};

type Emits = {
  (e: 'update:modelValue', value: string): void;
};

const props = withDefaults(defineProps<Props>(), {
  initialValue: '',
});
defineEmits<Emits>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const datePickerStyles: any = { 'primary-color': '#6972F1' };

const { value, errorMessage, handleChange } = useValidation(
  props.id,
  props.initialValue
);

const shouldValidate = computed(() => Boolean(errorMessage.value));
</script>

<style scoped>
.date-picker :deep(.pdp.pdp-modal .pdp-picker) {
  top: 50%;
  top: calc(var(--sheet-top, 0px) + var(--sheet-height, var(--viewport-height)) / 2);
  max-width: calc(100vw - 2rem - var(--safe-area-left) - var(--safe-area-right));
  max-height: calc(100vh - 2rem);
  max-height: calc(
    var(--sheet-height, var(--viewport-height)) -
      2 * max(1rem, var(--safe-area-top), var(--safe-area-bottom))
  );
  margin-top: 0;
  overflow-y: auto;
  overscroll-behavior-y: contain;
}

.error-border {
  :deep(.pdp) {
    @apply border border-red-500 rounded-md;
  }
}
</style>
