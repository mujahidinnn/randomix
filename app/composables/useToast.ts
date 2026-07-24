export type ToastVariant = "success" | "error" | "info";

export type Toast = {
  id: number;
  message: string;
  variant: ToastVariant;
  duration: number;
};

// Module-scoped singleton state so every component sharing this composable
// reads/writes the same toast queue (no provide/inject wiring needed).
const toasts = ref<Toast[]>([]);
let seq = 0;

// Batas toast yang tampil bersamaan — tanpa ini, aksi beruntun (mis. assign beberapa
// pemain pending sekaligus) bisa menumpuk notifikasi sampai menutupi seluruh form di mobile.
const MAX_VISIBLE = 3;

function dismiss(id: number) {
  toasts.value = toasts.value.filter((t) => t.id !== id);
}

function push(message: string, variant: ToastVariant = "info", duration = 3500) {
  const id = ++seq;
  toasts.value.push({ id, message, variant, duration });

  while (toasts.value.length > MAX_VISIBLE) {
    toasts.value.shift();
  }

  if (duration > 0) {
    setTimeout(() => dismiss(id), duration);
  }

  return id;
}

export function useToast() {
  return {
    toasts: computed(() => toasts.value),
    dismiss,
    success: (message: string, duration?: number) => push(message, "success", duration),
    error: (message: string, duration?: number) => push(message, "error", duration),
    info: (message: string, duration?: number) => push(message, "info", duration),
  };
}
