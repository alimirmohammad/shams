export function createValidationListeners(
  handleChange: (e: unknown, shouldValidate?: boolean) => void,
  errorMessage: string | undefined,
  transformer: (e: Event) => string
): {
  blur: (e: Event) => void;
  change: (e: Event) => void;
  input: (e: Event) => void;
} {
  // If the field is valid or have not been validated yet
  // lazy
  if (!errorMessage) {
    return {
      blur: (e: Event) => {
        const value = transformer(e);
        handleChange(value);
      },
      change: (e: Event) => {
        const value = transformer(e);
        handleChange(value);
      },
      // disable `shouldValidate` to avoid validating on input
      input: (e: Event) => {
        const value = transformer(e);
        handleChange(value, false);
      },
    };
  }
  // Aggressive
  return {
    blur: (e: Event) => {
      const value = transformer(e);
      handleChange(value);
    },
    change: (e: Event) => {
      const value = transformer(e);
      handleChange(value);
    },
    input: (e: Event) => {
      const value = transformer(e);
      handleChange(value);
    }, // only switched this
  };
}
