<script setup lang="ts">
import { computed } from "vue";
import { useModelStore } from "@/stores/model";
import { PhMinus, PhPlus } from "@phosphor-icons/vue";

const store = useModelStore();

const remaining = computed(() => store.availableCp - store.usedCp);

function decLevel() {
  if (store.level > 1) store.level--;
}
function incLevel() {
  store.level++;
}
</script>

<template>
  <div class="sticky top-0 z-50 bg-base-200 border-b border-base-300 shadow-md">
    <div class="max-w-2xl mx-auto px-4 py-2 flex items-center gap-4">
      <!-- Level -->
      <div class="flex items-center gap-1 shrink-0">
        <span class="text-sm font-semibold text-base-content/60 mr-1">LVL</span>
        <button
          class="btn btn-xs btn-ghost btn-circle"
          @click="decLevel"
          :disabled="store.level <= 1"
        >
          <PhMinus :size="14" />
        </button>
        <span class="text-lg font-bold w-6 text-center">{{ store.level }}</span>
        <button class="btn btn-xs btn-ghost btn-circle" @click="incLevel">
          <PhPlus :size="14" />
        </button>
      </div>

      <div class="divider divider-horizontal mx-0"></div>

      <!-- CP bar -->
      <div class="flex-1 min-w-0">
        <div class="flex justify-between items-baseline mb-1">
          <span class="text-xs text-base-content/60">Charakter&shy;punkte</span>
          <span
            class="text-sm font-bold"
            :class="remaining >= 0 ? 'text-success' : 'text-error'"
          >
            {{ store.usedCp }}&thinsp;/&thinsp;{{ store.availableCp }} CP
            <span class="font-normal text-xs ml-1">
              ({{ remaining >= 0 ? "+" : "" }}{{ remaining }})
            </span>
          </span>
        </div>
        <progress
          class="progress w-full h-2"
          :class="remaining >= 0 ? 'progress-success' : 'progress-error'"
          :value="store.usedCp"
          :max="store.availableCp"
        ></progress>
      </div>
    </div>
  </div>
</template>
