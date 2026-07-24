<template>
  <Listbox
    :model-value="modelValue"
    @update:model-value="(v) => emit('update:modelValue', v)"
  >
    <div class="relative">
      <ListboxButton
        :aria-label="label"
        class="clay-inset flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm font-medium text-[var(--clay-text)] outline-none sm:text-base"
      >
        <span
          class="truncate"
          :class="{ 'text-[var(--clay-text-muted)]': !selectedLabel }"
        >
          {{ selectedLabel ?? placeholder }}
        </span>
        <ChevronUpDownIcon
          class="h-5 w-5 shrink-0 text-[var(--clay-text-muted)]"
          aria-hidden="true"
        />
      </ListboxButton>

      <Transition
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <ListboxOptions
          class="clay-surface clay-raised absolute z-20 mt-2 max-h-56 w-full overflow-auto border border-slate-200 p-1.5 text-sm focus:outline-none sm:text-base"
        >
          <ListboxOption
            v-for="option in options"
            :key="option.value"
            v-slot="{ active, selected }"
            :value="option.value"
            as="template"
          >
            <li
              class="flex cursor-pointer items-center justify-between gap-2 rounded-sm px-3 py-2 transition"
              :class="
                active
                  ? 'bg-emerald-100 text-[var(--clay-text)]'
                  : 'text-[var(--clay-text)]'
              "
            >
              <span
                class="truncate"
                :class="selected ? 'font-semibold' : 'font-normal'"
              >
                {{ option.label }}
              </span>
              <CheckIcon
                v-if="selected"
                class="h-4 w-4 shrink-0 text-[var(--clay-accent-dark)]"
                aria-hidden="true"
              />
            </li>
          </ListboxOption>
        </ListboxOptions>
      </Transition>
    </div>
  </Listbox>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/vue";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/vue/24/solid";

type SelectOption = { value: string | number; label: string };

const props = withDefaults(
  defineProps<{
    modelValue: string | number | null;
    options: SelectOption[];
    label?: string;
    placeholder?: string;
  }>(),
  {
    modelValue: null,
    label: "Pilih opsi",
    placeholder: "Pilih...",
  },
);

const emit = defineEmits<{ "update:modelValue": [value: string | number] }>();

const selectedLabel = computed(
  () => props.options.find((o) => o.value === props.modelValue)?.label,
);
</script>
