<template>
  <div class="flex flex-col items-center justify-center gap-3 py-10 text-center text-white/80">
    <component :is="icon" class="h-10 w-10 opacity-70" aria-hidden="true" />
    <p class="italic">{{ message }}</p>
    <slot name="action" />
  </div>
</template>

<script setup lang="ts">
import { InboxIcon } from "@heroicons/vue/24/solid";
import type { Component } from "vue";

withDefaults(
  defineProps<{
    message: string;
    icon?: Component;
  }>(),
  {
    icon: () => InboxIcon,
  }
);
</script>
