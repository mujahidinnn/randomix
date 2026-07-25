<template>
  <BaseSelect
    :model-value="value"
    :options="selectOptions"
    :label="label ?? t('common.teamAssignSelect.label')"
    :placeholder="t('common.teamAssignSelect.placeholder')"
    @update:model-value="handleChange"
  />
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

const { t } = useI18n();

const props = withDefaults(
  defineProps<{
    teams: { name: string; count: number }[];
    showAuto?: boolean;
    label?: string;
  }>(),
  {
    showAuto: true,
  }
);

const emit = defineEmits<{ assign: [value: "auto" | "new" | number] }>();

// null = placeholder; di-reset ke null setiap kali sebuah penempatan sudah
// di-emit, supaya select ini bisa dipakai berulang kali.
const value = ref<string | number | null>(null);

const selectOptions = computed(() => {
  const options: { value: string | number; label: string }[] = [];
  if (props.showAuto && props.teams.length) {
    options.push({ value: "auto", label: t("common.teamAssignSelect.auto") });
  }
  options.push({ value: "new", label: t("common.teamAssignSelect.new") });
  props.teams.forEach((team, idx) => {
    options.push({ value: idx, label: t("common.teamAssignSelect.existing", { name: team.name, count: team.count }) });
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
