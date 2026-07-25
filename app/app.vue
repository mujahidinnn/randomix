<template>
  <NuxtLoadingIndicator color="#ffffff" />
  <NuxtPage />
  <AppToast />
  <LocaleSwitcher />
</template>

<script setup>
const i18nHead = useLocaleHead();
useHead({
  htmlAttrs: computed(() => i18nHead.value.htmlAttrs),
});
</script>
