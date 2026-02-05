import { reactive } from "vue";

const state = reactive({
  open: false,
  title: "Konfirmasi",
  message: "",
  variant: "neutral",
  confirmText: "Ya, lanjutkan",
  cancelText: "Batal",
  loading: false,
  loadingText: "Memproses...",
  // callback
  _resolve: null,
  _reject: null,
});

export function useConfirm() {
  function confirm(options = {}) {
    state.title = options.title ?? "Konfirmasi";
    state.message = options.message ?? "";
    state.variant = options.variant ?? "neutral";
    state.confirmText = options.confirmText ?? "Ya, lanjutkan";
    state.cancelText = options.cancelText ?? "Batal";
    state.loadingText = options.loadingText ?? "Memproses...";
    state.loading = false;

    state.open = true;

    return new Promise((resolve, reject) => {
      state._resolve = resolve;
      state._reject = reject;
    });
  }

  function close() {
    state.open = false;
    state.loading = false;
  }

  function onCancel() {
    if (state._reject) state._reject(new Error("cancelled"));
    close();
  }

  async function onConfirm(runAsync) {
    try {
      state.loading = true;
      if (typeof runAsync === "function") {
        await runAsync();
      }
      if (state._resolve) state._resolve(true);
      close();
    } catch (e) {
      state.loading = false;
      // biarkan modal tetap terbuka kalau error
      throw e;
    }
  }

  return { state, confirm, onCancel, onConfirm, close };
}
