<template>
  <BaseSelect
    :model-value="value"
    :options="selectOptions"
    :label="label"
    placeholder="Pilih penempatan…"
    @update:model-value="handleChange"
  />
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

const props = withDefaults(
  defineProps<{
    teams: { name: string; count: number }[];
    showAuto?: boolean;
    label?: string;
  }>(),
  {
    showAuto: true,
    label: "Pilih penempatan tim",
  }
);

const emit = defineEmits<{ assign: [value: "auto" | "new" | number] }>();

// null = placeholder ("Pilih penempatan…"); di-reset ke null setiap kali sebuah
// penempatan sudah di-emit, supaya select ini bisa dipakai berulang kali.
const value = ref<string | number | null>(null);

const selectOptions = computed(() => {
  const options: { value: string | number; label: string }[] = [];
  if (props.showAuto && props.teams.length) {
    options.push({ value: "auto", label: "⚡ Otomatis (seimbang)" });
  }
  options.push({ value: "new", label: "➕ Buat Tim Baru" });
  props.teams.forEach((team, idx) => {
    options.push({ value: idx, label: `${team.name} (${team.count} pemain)` });
  });
  return options;
});

function handleChange(selected: string | number) {
  value.value = null;

  if (selected === "auto") emit("assign", "auto");
  else if (selected === "new") emit("assign", "new");
  else emit("assign", Number(selected));
}
</script>
