<script setup lang="ts">
import { useModelStore } from "@/stores/model";
import AttrCounter from "./AttrCounter.vue";

const store = useModelStore();
</script>

<template>
  <div class="card bg-base-200 shadow">
    <div class="card-body gap-0 p-4">
      <h2 class="card-title text-base mb-2">Basisattribute</h2>

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
