// Minimal useToast stub - no-op for standalone mode
export function useToast() {
  return {
    toast: (opts: { title?: string; description?: string; variant?: string }) => {
      console.log("[toast]", opts.title, opts.description);
    },
    dismiss: () => {},
    toasts: [],
  };
}
