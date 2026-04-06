<script setup lang="ts">
import { computed } from "vue";
import { PhMinus, PhPlus } from "@phosphor-icons/vue";

const props = defineProps<{
  label: string;
  shortLabel?: string;
  description?: string;
  cpPerStep?: number;
  cpBase?: number; // offset subtracted before multiplying by cpPerStep (use 10 for primary attrs)
  base?: number; // grayed base value displayed for secondary attrs (total = base + model)
  min?: number;
  max?: number;
}>();

const model = defineModel<number>({ required: true });

const cpDelta = computed(() => {
  if (props.cpPerStep === undefined) return null;
  const offset = props.cpBase ?? 0;
  return (model.value - offset) * props.cpPerStep;
});

function dec() {
  if (props.min !== undefined && model.value <= props.min) return;
  model.value--;
}
function inc() {
  if (props.max !== undefined && model.value >= props.max) return;
  model.value++;
}
</script>

<template>
  <div class="flex items-center gap-2 py-2">
    <!-- Label -->
    <div class="flex-1 min-w-0">
      <div class="font-semibold text-sm leading-tight">{{ label }}</div>
      <div
        v-if="description"
        class="text-xs text-base-content/50 leading-tight"
      >
        {{ description }}
      </div>
    </div>

    <!-- Base value (for secondary attrs) -->
    <div
      v-if="base !== undefined"
      class="text-xs text-base-content/40 w-10 text-right shrink-0"
    >
      base<br />{{ parseFloat(base.toFixed(2)) }}
    </div>

    <!-- Counter -->
    <div class="flex items-center gap-1 shrink-0">
      <button
        class="btn btn-xs btn-ghost btn-circle"
        @click="dec"
        :disabled="min !== undefined && model <= min"
      >
        <PhMinus :size="14" />
      </button>
      <span class="font-mono font-bold text-base w-8 text-center">
        {{ parseFloat((base !== undefined ? base + model : model).toFixed(2)) }}
      </span>
      <button
        class="btn btn-xs btn-ghost btn-circle"
        @click="inc"
        :disabled="max !== undefined && model >= max"
      >
        <PhPlus :size="14" />
      </button>
    </div>

    <!-- CP cost -->
    <div v-if="cpDelta !== null" class="w-16 text-right shrink-0">
      <span
        class="text-xs font-semibold"
        :class="
          cpDelta > 0
            ? 'text-warning'
            : cpDelta < 0
              ? 'text-success'
              : 'text-base-content/30'
        "
      >
        {{ cpDelta > 0 ? "+" : "" }}{{ cpDelta }}&thinsp;CP
      </span>
    </div>
  </div>
</template>
