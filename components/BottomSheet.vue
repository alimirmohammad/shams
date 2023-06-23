<template>
  <Teleport to="body">
    <div
      class="modal modal-bottom max-w-md m-auto"
      :class="{ 'modal-open': open }"
      @click.self="$emit('close')"
    >
      <div
        class="modal-box shadow py-10 px-4 rounded-t-3xl"
        :class="{ 'overflow-visible': overflow }"
      >
        <slot :key="open" />
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
type Props = {
  open: boolean;
  overflow?: boolean;
};

type Emits = {
  (e: 'close'): void;
};

defineProps<Props>();
defineEmits<Emits>();
</script>
