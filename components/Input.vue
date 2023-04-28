<template>
  <div class="form-control w-full relative" :class="containerClass">
    <label :for="id" class="label">
      <span class="label-text label-3 text-gray-500">{{ label }}</span>
    </label>
    <input
      :id="id"
      v-bind="$attrs"
      class="input input-bordered input-primary w-full"
      :class="inputClass"
    />
    <div v-if="$slots.startAdornment" class="absolute top-[50px] right-3">
      <slot name="startAdornment" />
    </div>
    <div v-if="$slots.endAdornment" class="absolute top-[50px] left-3">
      <slot name="endAdornment" />
    </div>
    <div v-if="$slots.helperText" class="mt-2">
      <slot name="helperText" />
    </div>
  </div>
</template>

<script setup lang="ts">
type Props = {
  id: string;
  label: string;
  modelValue: string;
  error?: boolean;
  errorText?: string;
  inputClass?: string;
  containerClass?: string;
};

type Emits = {
  (e: 'update:modelValue', value: string): void;
};

defineProps<Props>();
defineEmits<Emits>();
</script>

<script lang="ts">
export default defineComponent({
  inheritAttrs: false,
});
</script>

<style scoped></style>
