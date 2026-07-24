<template>
  <div
    class="animate-pulse rounded-lg bg-slate-300/50"
    :style="{ width, height }"
    role="presentation"
    aria-hidden="true"
  />
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    width?: string;
    height?: string;
  }>(),
  {
    width: "100%",
    height: "1rem",
  }
);
</script>
