export default function useValidation(
  id: string,
  initialValue?: any,
  transformer: (e: Event) => string = (e: Event) =>
    (e.target as HTMLInputElement).value
) {
  const { value, errorMessage, handleChange } = useField(id, undefined, {
    initialValue: initialValue,
    validateOnValueUpdate: false,
  });

  const validationListeners = computed(() =>
    createValidationListeners(handleChange, errorMessage.value, transformer)
  );

  return {
    value,
    errorMessage,
    handleChange,
    validationListeners,
  };
}
