<template>
  <div class="form-control w-full" :class="containerClass">
    <label :for="id" class="label">
      <span
        class="label-text label-3 text-gray-500"
        :class="{ 'text-red-500': errorMessage }"
      >
        {{ label }}
      </span>
    </label>
    <select
      :id="id"
      :value="value"
      v-on="validationListeners"
      :disabled="disabled"
      class="select select-primary px-8"
      :class="[inputClass, { 'select-error': errorMessage }]"
    >
      <option disabled value="">لطفا یک گزینه را انتخاب کنید</option>
      <option v-for="item in items" :key="item.value" :value="item.value">
        {{ item.text }}
      </option>
    </select>
    <span v-if="errorMessage" class="mt-2 block body-3 text-red-500 text-start">
      {{ errorMessage }}
    </span>
  </div>
</template>

<script setup lang="ts">
type Props = {
  id: string;
  label: string;
  items: { text: string; value: string }[];
  initialValue?: string;
  inputClass?: string;
  containerClass?: string;
  multiline?: boolean;
  disabled?: boolean;
};

type Emits = {
  (e: 'update:modelValue', value: string): void;
};

const props = withDefaults(defineProps<Props>(), {
  initialValue: '',
});

defineEmits<Emits>();

const { value, errorMessage, validationListeners } = useValidation(
  props.id,
  props.initialValue
);
</script>

<style scoped></style>
