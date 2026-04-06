<script setup lang="ts">
import { computed } from "vue";
import { useModelStore } from "@/stores/model";
import { WEALTH_LEVELS } from "@/model/character";

const store = useModelStore();

const PIZZA_PRICE = 10;
const BATTLE_AXE_PRICE = 250;

const currentLevel = computed(
  () =>
    WEALTH_LEVELS.find((w) => w.key === (store.wealthLevelKey ?? "0")) ??
    WEALTH_LEVELS[3]!,
);

function formatPyras(n: number): string {
  return "ᑶ" + Math.round(n).toLocaleString("en-US");
}

function formatRange(lo: number, hi: number): string {
  if (lo === hi) return lo.toLocaleString("en-US");
  return `${lo.toLocaleString("en-US")}–${hi.toLocaleString("en-US")}`;
}

function selectLevel(key: string) {
  store.wealthLevelKey = key;
}

const pizzaRange = computed(() => ({
  min: Math.floor(currentLevel.value.minPyras / PIZZA_PRICE),
  max: Math.floor(currentLevel.value.maxPyras / PIZZA_PRICE),
}));

const axesRange = computed(() => ({
  min: Math.floor(currentLevel.value.minPyras / BATTLE_AXE_PRICE),
  max: Math.floor(currentLevel.value.maxPyras / BATTLE_AXE_PRICE),
}));

const cpClass = computed(() => {
  const cp = currentLevel.value.cp;
  if (cp < 0) return "text-success";
  if (cp > 0) return "text-warning";
  return "text-base-content/30";
});
</script>

<template>
  <div class="card bg-base-200 shadow">
    <div class="card-body gap-0 p-4">
      <div class="flex items-center justify-between mb-3">
        <h2 class="card-title text-base">Startreichtum</h2>
        <span class="text-xs font-semibold" :class="cpClass">
          {{ currentLevel.cp > 0 ? "+" : "" }}{{ currentLevel.cp }}&thinsp;CP
        </span>
      </div>

      <!-- Level selector -->
      <div class="mb-3">
        <label class="text-xs text-base-content/50 mb-1 block">Stufe</label>
        <select
          class="select select-sm w-full"
          :value="store.wealthLevelKey ?? '0'"
          @change="selectLevel(($event.target as HTMLSelectElement).value)"
        >
          <option v-for="lvl in WEALTH_LEVELS" :key="lvl.key" :value="lvl.key">
            {{ lvl.label }} ({{ formatPyras(lvl.minPyras) }}–{{
              formatPyras(lvl.maxPyras)
            }}, {{ lvl.cp > 0 ? "+" : "" }}{{ lvl.cp }} CP)
          </option>
        </select>
      </div>

      <!-- Range examples -->
      <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-base-content/50">
        <span
          >🍕 {{ formatRange(pizzaRange.min, pizzaRange.max) }} Pizza(s) (ᑶ{{
            PIZZA_PRICE
          }}/Stk.)</span
        >
        <span
          >⚔️ {{ formatRange(axesRange.min, axesRange.max) }} Streitaxt/äxte
          (ᑶ{{ BATTLE_AXE_PRICE }}/Stk.)</span
        >
      </div>
    </div>
  </div>
</template>
