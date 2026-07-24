<template>
  <Teleport to="body">
    <Transition name="confirm-dialog">
      <div
        v-if="open"
        class="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
        @click.self="handleCancel"
        @keydown.esc="handleCancel"
      >
        <div
          role="alertdialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          :aria-describedby="messageId"
          tabindex="-1"
          class="clay-surface clay-raised w-full max-w-sm p-5 text-[var(--clay-text)]"
        >
          <h2 :id="titleId" class="text-base font-bold sm:text-lg">{{ title }}</h2>
          <p :id="messageId" class="mt-2 text-sm text-[var(--clay-text-muted)] sm:text-base">{{ message }}</p>

          <div class="mt-5 flex justify-end gap-3">
            <BaseButton variant="secondary" size="sm" @click="handleCancel">
              {{ cancelLabel }}
            </BaseButton>
            <BaseButton
              ref="confirmButtonRef"
              size="sm"
              :class="variant === 'danger' ? dangerButtonClass : ''"
              @click="handleConfirm"
            >
              {{ confirmLabel }}
            </BaseButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { nextTick, ref, useId, watch, type ComponentPublicInstance } from "vue";

withDefaults(
  defineProps<{
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "default" | "danger";
  }>(),
  {
    confirmLabel: "Ya, lanjutkan",
    cancelLabel: "Batal",
    variant: "default",
  }
);

const emit = defineEmits<{ confirm: []; cancel: [] }>();

const titleId = useId();
const messageId = useId();
const confirmButtonRef = ref<ComponentPublicInstance | null>(null);

const dangerButtonClass = "!bg-[var(--clay-danger)] !text-rose-950";

function handleConfirm() {
  emit("confirm");
}

function handleCancel() {
  emit("cancel");
}

watch(
  () => confirmButtonRef.value,
  async (el) => {
    if (!el) return;
    await nextTick();
    (el.$el as HTMLElement)?.focus();
  }
);
</script>

<style scoped>
.confirm-dialog-enter-active,
.confirm-dialog-leave-active {
  transition: opacity 0.2s ease;
}
.confirm-dialog-enter-from,
.confirm-dialog-leave-to {
  opacity: 0;
}

.confirm-dialog-enter-active > div,
.confirm-dialog-leave-active > div {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.confirm-dialog-enter-from > div,
.confirm-dialog-leave-to > div {
  opacity: 0;
  transform: scale(0.96) translateY(8px);
}

@media (prefers-reduced-motion: reduce) {
  .confirm-dialog-enter-active,
  .confirm-dialog-leave-active,
  .confirm-dialog-enter-active > div,
  .confirm-dialog-leave-active > div {
    transition: opacity 0.15s linear;
  }
  .confirm-dialog-enter-from > div,
  .confirm-dialog-leave-to > div {
    transform: none;
  }
}
</style>
