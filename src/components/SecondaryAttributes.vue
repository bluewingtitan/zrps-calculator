<script setup lang="ts">
import { computed } from "vue";
import { useModelStore } from "@/stores/model";
import AttrCounter from "./AttrCounter.vue";

const store = useModelStore();

// Computed base values (before Add delta)
const hpBase = computed(() => Math.round(store.st * 1.5));
const fpBase = computed(() => store.ht);
const bmBase = computed(() => (store.ht + store.dx) / 4);
const magicBase = computed(() => Math.floor(store.iq * 0.65));
// WL and PER base = IQ (no extra computation needed)

const totalCp = computed(
  () =>
    (store.hpAdd ?? 0) * 2 +
    (store.willAdd ?? 0) * 5 +
    (store.perAdd ?? 0) * 5 +
    (store.fpAdd ?? 0) * 3 +
    (store.basicMoveAdd ?? 0) * 5
);
</script>

<template>
  <div class="card bg-base-200 shadow">
    <div class="card-body gap-0 p-4">
      <div class="flex items-center justify-between mb-2">
        <h2 class="card-title text-base">Zusatzattribute</h2>
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
          label="Hit Points (HP)"
          description="2 CP / HP · Basis = ST×1.5"
          v-model="store.hpAdd"
          :cpPerStep="2"
          :base="hpBase"
        />
        <AttrCounter
          label="Willenskraft (WL)"
          description="5 CP / Level · Basis = IQ"
          v-model="store.willAdd"
          :cpPerStep="5"
          :base="store.iq"
        />
        <AttrCounter
          label="Perception (PER)"
          description="5 CP / PER · Basis = IQ"
          v-model="store.perAdd"
          :cpPerStep="5"
          :base="store.iq"
        />
        <AttrCounter
          label="Fatigue Points (FP)"
          description="3 CP / FP · Basis = HT"
          v-model="store.fpAdd"
          :cpPerStep="3"
          :base="fpBase"
        />
        <AttrCounter
          label="Basic Move (BM)"
          description="5 CP / m/s · Basis = (HT+DX)/4"
          v-model="store.basicMoveAdd"
          :cpPerStep="5"
          :base="bmBase"
        />
      </div>
    </div>
  </div>
</template>
