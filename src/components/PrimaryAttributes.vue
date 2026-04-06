<script setup lang="ts">
import { computed } from "vue";
import { useModelStore } from "@/stores/model";
import AttrCounter from "./AttrCounter.vue";

const store = useModelStore();

const totalCp = computed(
  () =>
    (store.st - 10) * 15 +
    (store.dx - 10) * 25 +
    (store.iq - 10) * 25 +
    (store.ht - 10) * 15,
);
</script>

<template>
  <div class="card bg-base-200 shadow">
    <div class="card-body gap-0 p-4">
      <div class="flex items-center justify-between mb-2">
        <h2 class="card-title text-base">Basisattribute</h2>
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
        <AttrCounter
          label="Stärke (ST)"
          description="15 CP / Level"
          v-model="store.st"
          :cpPerStep="15"
          :cpBase="10"
          :min="1"
          :max="20"
        />
        <AttrCounter
          label="Gewandtheit (DX)"
          description="25 CP / Level"
          v-model="store.dx"
          :cpPerStep="25"
          :cpBase="10"
          :min="1"
          :max="20"
        />
        <AttrCounter
          label="Intelligenz (IQ)"
          description="25 CP / Level"
          v-model="store.iq"
          :cpPerStep="25"
          :cpBase="10"
          :min="1"
          :max="20"
        />
        <AttrCounter
          label="Lebenskraft (HT)"
          description="15 CP / Level"
          v-model="store.ht"
          :cpPerStep="15"
          :cpBase="10"
          :min="1"
          :max="20"
        />
      </div>
    </div>
  </div>
</template>
