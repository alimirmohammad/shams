<template>
  <Teleport to="body">
    <div
      class="modal modal-bottom sheet-viewport max-w-md m-auto"
      :class="{ 'modal-open': open }"
      :style="viewportStyle"
      @click.self="$emit('close')"
    >
      <div
        class="modal-box sheet-content shadow py-10 px-4 rounded-t-3xl"
      >
        <slot :key="open" />
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
type Props = {
  open: boolean;
};

type Emits = {
  (e: 'close'): void;
};

const props = defineProps<Props>();
defineEmits<Emits>();

const viewportStyle = ref<Record<string, string>>({});

// Keyboards can resize only the visual viewport, leaving dvh unchanged.
// Observe only while open, and keep this adjustment local to the sheet.
onMounted(() => {
  watch(
    () => props.open,
    (open, _previous, onCleanup) => {
      const viewport = window.visualViewport;
      if (!open || !viewport) {
        viewportStyle.value = {};
        return;
      }

      const updateViewport = () => {
        viewportStyle.value = {
          '--sheet-height': `${viewport.height}px`,
          '--sheet-top': `${viewport.offsetTop}px`,
        };
      };

      updateViewport();
      viewport.addEventListener('resize', updateViewport);
      viewport.addEventListener('scroll', updateViewport);
      onCleanup(() => {
        viewport.removeEventListener('resize', updateViewport);
        viewport.removeEventListener('scroll', updateViewport);
      });
    },
    { immediate: true }
  );
});
</script>

<style scoped>
.sheet-viewport {
  top: var(--sheet-top, 0px);
  bottom: auto;
  height: 100vh;
  height: 100dvh;
  height: var(--sheet-height, var(--viewport-height));
  padding-top: max(1rem, var(--safe-area-top));
  overflow-y: auto;
  overscroll-behavior-y: contain;
}

.sheet-content {
  max-height: 100%;
  /* Fixed calendar overlays must use the viewport as their containing block. */
  transform: none;
  padding-right: calc(1rem + var(--safe-area-right));
  padding-bottom: calc(2.5rem + var(--safe-area-bottom));
  padding-left: calc(1rem + var(--safe-area-left));
  overscroll-behavior-y: contain;
}
</style>
