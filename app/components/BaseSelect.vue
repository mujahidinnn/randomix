<template>
  <Listbox v-slot="{ open }" :model-value="modelValue" @update:model-value="(v) => emit('update:modelValue', v)">
    <div class="relative">
      <ListboxButton
        ref="buttonRef"
        :aria-label="label ?? t('common.select.defaultLabel')"
        class="clay-inset flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-medium text-[var(--clay-text)] outline-none sm:px-5 sm:py-3.5 sm:text-base"
        @click="updatePosition"
      >
        <span class="truncate" :class="{ 'text-[var(--clay-text-muted)]': !selectedLabel }">
          {{ selectedLabel ?? placeholder ?? t("common.select.placeholder") }}
        </span>
        <ChevronUpDownIcon class="h-5 w-5 shrink-0 text-[var(--clay-text-muted)]" aria-hidden="true" />
      </ListboxButton>

      <!-- Teleport + posisi manual: hindari clipping saat trigger ada di dalam
           container yang bikin stacking context sendiri (mis. card dengan transform). -->
      <Teleport to="body">
        <Transition
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <ListboxOptions
            v-if="open"
            :style="floatingStyle"
            class="clay-raised fixed z-[70] max-h-72 overflow-auto rounded-2xl border border-slate-200 bg-[var(--clay-surface)] p-2 text-sm focus:outline-none sm:text-base"
          >
            <ListboxOption
              v-for="option in options"
              :key="option.value"
              v-slot="{ active, selected }"
              :value="option.value"
              as="template"
            >
              <li
                class="mb-1 flex cursor-pointer items-center justify-between gap-3 rounded-xl px-4 py-3 transition last:mb-0"
                :class="active ? 'bg-emerald-100 text-[var(--clay-text)]' : 'text-[var(--clay-text)]'"
              >
                <span class="truncate" :class="selected ? 'font-semibold' : 'font-normal'">
                  {{ option.label }}
                </span>
                <CheckIcon v-if="selected" class="h-5 w-5 shrink-0 text-[var(--clay-accent-dark)]" aria-hidden="true" />
              </li>
            </ListboxOption>
          </ListboxOptions>
        </Transition>
      </Teleport>
    </div>
  </Listbox>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from "@headlessui/vue";
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
  }
);

const { t } = useI18n();
const emit = defineEmits<{ "update:modelValue": [value: string | number] }>();

const selectedLabel = computed(() => props.options.find((o) => o.value === props.modelValue)?.label);

const buttonRef = ref<{ $el: HTMLElement } | null>(null);
const floatingStyle = ref<Record<string, string>>({});

function updatePosition() {
  const el = buttonRef.value?.$el;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  floatingStyle.value = {
    top: `${rect.bottom + 8}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
  };
}

onMounted(() => {
  window.addEventListener("scroll", updatePosition, true);
  window.addEventListener("resize", updatePosition);
});
onBeforeUnmount(() => {
  window.removeEventListener("scroll", updatePosition, true);
  window.removeEventListener("resize", updatePosition);
});
</script>
