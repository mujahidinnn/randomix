<template>
  <div
    class="clay-raised fixed right-3 top-3 z-40 flex items-center gap-1 rounded-full bg-[var(--clay-surface)] p-1 sm:right-4 sm:top-4"
    role="radiogroup"
    :aria-label="t('locale.switcherLabel')"
  >
    <button
      v-for="loc in availableLocales"
      :key="loc.code"
      type="button"
      role="radio"
      :aria-checked="locale === loc.code"
      class="rounded-full px-2.5 py-1 text-xs font-bold transition"
      :class="locale === loc.code ? 'bg-[var(--clay-accent)] text-white' : 'text-[var(--clay-text-muted)] hover:bg-black/5'"
      @click="setLocale(loc.code)"
    >
      {{ loc.code.toUpperCase() }}
    </button>
  </div>
</template>

<script setup>
const { locale, locales, setLocale, t } = useI18n();
const availableLocales = computed(() => locales.value);
</script>
