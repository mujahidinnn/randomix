<template>
  <Switch
    :model-value="modelValue"
    :class="modelValue ? 'bg-[var(--clay-accent)]' : 'bg-slate-300'"
    class="relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border border-slate-400/30 transition-colors"
    @update:model-value="(v) => emit('update:modelValue', v)"
  >
    <span class="sr-only">{{ label }}</span>
    <span
      class="clay-raised inline-block h-5 w-5 transform rounded-full bg-white transition-transform"
      :class="modelValue ? 'translate-x-6' : 'translate-x-1'"
    />
  </Switch>
</template>

<script setup lang="ts">
import { Switch } from "@headlessui/vue";

defineProps<{
  modelValue: boolean;
  label: string;
}>();

const emit = defineEmits<{ "update:modelValue": [value: boolean] }>();
</script>
