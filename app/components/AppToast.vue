<template>
  <Teleport to="body">
    <div
      class="pointer-events-none fixed inset-x-0 top-[max(1rem,env(safe-area-inset-top))] z-[100] flex flex-col items-center gap-2 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] sm:top-[max(1.5rem,env(safe-area-inset-top))]"
      aria-live="polite"
      aria-atomic="true"
      role="status"
    >
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="clay-raised pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl px-4 py-3"
          :class="variantClasses[toast.variant]"
        >
          <component :is="variantIcon[toast.variant]" class="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <p class="text-sm font-medium leading-snug">{{ toast.message }}</p>
          <button
            type="button"
            class="ml-auto shrink-0 rounded-full p-1 opacity-70 transition hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
            :aria-label="t('common.toast.closeAria', { message: toast.message })"
            @click="dismiss(toast.id)"
          >
            <XMarkIcon class="h-4 w-4" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { XMarkIcon, CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon } from "@heroicons/vue/24/solid";
import { useToast } from "../composables/useToast";

const { toasts, dismiss } = useToast();
const { t } = useI18n();

const variantClasses: Record<string, string> = {
  success: "bg-emerald-50 text-emerald-800",
  error: "bg-rose-50 text-rose-800",
  info: "bg-white text-slate-800",
};

const variantIcon: Record<string, any> = {
  success: CheckCircleIcon,
  error: ExclamationCircleIcon,
  info: InformationCircleIcon,
};
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(-12px) scale(0.98);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}

@media (prefers-reduced-motion: reduce) {
  .toast-enter-active,
  .toast-leave-active {
    transition: opacity 0.15s linear;
  }
  .toast-enter-from,
  .toast-leave-to {
    transform: none;
  }
}
</style>
