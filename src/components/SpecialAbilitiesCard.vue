<script setup lang="ts">
import { computed } from "vue";
import { useModelStore } from "@/stores/model";
import { PhPlus, PhTrash } from "@phosphor-icons/vue";

const store = useModelStore();

const totalCp = computed(() =>
  store.specialAbilities.reduce((sum, sa) => sum + (sa.cp ?? 0), 0),
);

function addAbility() {
  store.specialAbilities.push({ name: "", cp: 0 });
}

function removeAbility(idx: number) {
  store.specialAbilities.splice(idx, 1);
}

function onCpInput(idx: number, event: Event) {
  const raw = (event.target as HTMLInputElement).value;
  const parsed = parseInt(raw, 10);
  const sa = store.specialAbilities[idx];
  if (!sa) return;
  sa.cp = isNaN(parsed) ? 0 : parsed;
}
</script>

<template>
  <div class="card bg-base-200 shadow">
    <div class="card-body gap-0 p-4">
      <div class="flex items-center justify-between mb-3">
        <h2 class="card-title text-base">Sonderfähigkeiten</h2>
        <span
          class="text-xs font-semibold"
          :class="
            totalCp > 0
              ? 'text-warning'
              : totalCp < 0
                ? 'text-success'
                : 'text-base-content/30'
          "
        >
          {{ totalCp > 0 ? "+" : "" }}{{ totalCp }}&thinsp;CP
        </span>
      </div>

      <div class="divide-y divide-base-300">
        <div
          v-for="(sa, idx) in store.specialAbilities"
          :key="idx"
          class="flex items-center gap-2 py-2"
        >
          <!-- Name -->
          <input
            type="text"
            class="input input-sm flex-1 min-w-0"
            placeholder="Name…"
            v-model="sa.name"
          />

          <!-- CP input -->
          <div class="relative shrink-0 w-24">
            <input
              type="number"
              class="input input-sm w-full pr-8 text-right font-mono"
              :class="
                sa.cp < 0 ? 'text-success' : sa.cp > 0 ? 'text-warning' : ''
              "
              :value="sa.cp"
              @input="onCpInput(idx, $event)"
              placeholder="0"
            />
            <span
              class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-base-content/40 pointer-events-none"
              >CP</span
            >
          </div>

          <!-- Remove -->
          <button
            class="btn btn-xs btn-ghost btn-circle text-error shrink-0"
            @click="removeAbility(idx)"
          >
            <PhTrash :size="14" />
          </button>
        </div>
      </div>

      <!-- Empty state -->
      <p
        v-if="store.specialAbilities.length === 0"
        class="text-xs text-base-content/40 text-center py-3"
      >
        Noch keine Sonderfähigkeiten hinzugefügt.
      </p>

      <!-- Add button -->
      <button
        class="btn btn-sm btn-dashed btn-neutral mt-3 gap-2"
        @click="addAbility"
      >
        <PhPlus :size="16" />
        Hinzufügen
      </button>
    </div>
  </div>
</template>
