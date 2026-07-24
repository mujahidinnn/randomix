<template>
  <component
    :is="resolvedTag"
    :type="tag === 'button' ? type : undefined"
    :disabled="tag === 'button' ? disabled || loading : undefined"
    :aria-disabled="disabled || loading"
    :aria-busy="loading"
    class="clay-raised inline-flex items-center justify-center gap-2 rounded-2xl font-bold outline-none [font-family:var(--font-display)] disabled:cursor-not-allowed disabled:opacity-60"
    :class="[sizeClasses, variantClasses]"
  >
    <svg
      v-if="loading"
      class="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
    <slot v-else name="icon" />
    <span><slot /></span>
  </component>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { NuxtLink } from "#components";

const props = withDefaults(
  defineProps<{
    tag?: "button" | "NuxtLink" | "a";
    type?: "button" | "submit" | "reset";
    variant?: "primary" | "secondary" | "ghost" | "accent";
    size?: "sm" | "md" | "lg";
    disabled?: boolean;
    loading?: boolean;
  }>(),
  {
    tag: "button",
    type: "button",
    variant: "primary",
    size: "md",
    disabled: false,
    loading: false,
  }
);

const resolvedTag = computed(() => (props.tag === "NuxtLink" ? NuxtLink : props.tag));

const sizeClasses = computed(
  () =>
    ({
      sm: "px-3 py-1.5 text-xs sm:text-sm",
      md: "px-4 py-2.5 text-sm sm:text-base",
      lg: "px-6 py-3 text-base sm:text-lg",
    }[props.size])
);

const variantClasses = computed(
  () =>
    ({
      primary: "bg-[var(--clay-accent)] text-emerald-950",
      secondary: "bg-[var(--clay-surface-alt)] text-[var(--clay-text)]",
      ghost: "!shadow-none bg-transparent text-[var(--clay-text)] hover:bg-black/5",
      accent: "bg-[var(--clay-amber)] text-amber-950",
    }[props.variant])
);
</script>
