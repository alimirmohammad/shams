export default function useToast(timeout = 3000) {
  const isToastVisible = ref(false);
  let timer: number;

  function showToast() {
    isToastVisible.value = true;
  }

  function hideToast() {
    isToastVisible.value = false;
  }

  watch(isToastVisible, value => {
    if (value) {
      timer = window.setTimeout(hideToast, timeout);
    }
  });

  onBeforeUnmount(() => {
    clearTimeout(timer);
  });

  return { isToastVisible, showToast, hideToast };
}
