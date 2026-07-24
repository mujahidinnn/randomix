<template>
  <div role="radiogroup" aria-label="Jenis turnamen" class="grid grid-cols-3 gap-2 sm:gap-3">
    <button
      v-for="opt in options"
      :key="opt.value"
      type="button"
      role="radio"
      :aria-checked="modelValue === opt.value"
      class="flex flex-col items-center gap-1.5 rounded-2xl p-2.5 text-center transition sm:p-3"
      :class="
        modelValue === opt.value
          ? 'clay-raised bg-emerald-50 ring-2 ring-[var(--clay-accent)]'
          : 'clay-inset hover:bg-black/[0.02]'
      "
      @click="emit('update:modelValue', opt.value)"
    >
      <svg
        viewBox="0 0 40 40"
        class="h-7 w-7 sm:h-8 sm:w-8"
        :class="modelValue === opt.value ? 'text-[var(--clay-accent-dark)]' : 'text-[var(--clay-text-muted)]'"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        aria-hidden="true"
      >
        <!-- Single Elimination: dua match menyatu ke satu final -->
        <template v-if="opt.value === 'elimination'">
          <line x1="2" y1="8" x2="16" y2="8" />
          <line x1="2" y1="32" x2="16" y2="32" />
          <line x1="16" y1="8" x2="16" y2="20" />
          <line x1="16" y1="32" x2="16" y2="20" />
          <line x1="16" y1="20" x2="30" y2="20" />
          <circle cx="34" cy="20" r="4" fill="currentColor" stroke="none" />
        </template>

        <!-- Round Robin: semua tim saling terhubung (semua lawan semua) -->
        <template v-else-if="opt.value === 'roundrobin'">
          <line x1="8" y1="8" x2="32" y2="8" />
          <line x1="8" y1="8" x2="32" y2="32" />
          <line x1="8" y1="8" x2="8" y2="32" />
          <line x1="32" y1="8" x2="8" y2="32" />
          <line x1="32" y1="8" x2="32" y2="32" />
          <line x1="8" y1="32" x2="32" y2="32" />
          <circle cx="8" cy="8" r="3" fill="currentColor" stroke="none" />
          <circle cx="32" cy="8" r="3" fill="currentColor" stroke="none" />
          <circle cx="8" cy="32" r="3" fill="currentColor" stroke="none" />
          <circle cx="32" cy="32" r="3" fill="currentColor" stroke="none" />
        </template>

        <!-- Grup Stage: dua grup, tiap grup menyalurkan ke babak knockout -->
        <template v-else>
          <rect x="3" y="4" width="15" height="13" rx="4" />
          <rect x="3" y="23" width="15" height="13" rx="4" />
          <circle cx="8" cy="10.5" r="2" fill="currentColor" stroke="none" />
          <circle cx="13" cy="10.5" r="2" fill="currentColor" stroke="none" />
          <circle cx="8" cy="29.5" r="2" fill="currentColor" stroke="none" />
          <circle cx="13" cy="29.5" r="2" fill="currentColor" stroke="none" />
          <line x1="20" y1="10.5" x2="28" y2="20" />
          <line x1="20" y1="29.5" x2="28" y2="20" />
          <circle cx="32" cy="20" r="4" fill="currentColor" stroke="none" />
        </template>
      </svg>

      <span class="text-[11px] font-bold leading-tight text-[var(--clay-text)] sm:text-xs">{{ opt.label }}</span>
      <span class="hidden text-[10px] leading-tight text-[var(--clay-text-muted)] sm:block">{{ opt.description }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: string;
  }>(),
  {}
);

const emit = defineEmits<{ "update:modelValue": [value: string] }>();

const options = [
  { value: "elimination", label: "Gugur", description: "Sistem gugur" },
  { value: "roundrobin", label: "Round Robin", description: "Semua lawan semua" },
  { value: "group", label: "Grup Stage", description: "Fase grup + knockout" },
];
</script>
