<script setup lang="ts">
import { useModelStore } from "@/stores/model";
import { PhMinus, PhPlus } from "@phosphor-icons/vue";

const store = useModelStore();

const HARDNESS_LABEL = [
  "Einfach",
  "Durchschn.",
  "Schwer",
  "Sehr Schwer",
  "Extrem",
  "—",
];

const ATTR_COLOR: Record<string, string> = {
  ST: "badge-error",
  DX: "badge-warning",
  IQ: "badge-info",
  HT: "badge-success",
  Per: "badge-secondary",
  Will: "badge-accent",
  FP: "badge-neutral",
  HP: "badge-primary",
  BasicMove: "badge-ghost",
  Magic: "badge-accent",
};

function boundAttrs(skill: (typeof store.skills)[number]): string[] {
  return Array.isArray(skill.boundAttribute)
    ? skill.boundAttribute
    : [skill.boundAttribute];
}

function toggleSkill(idx: number) {
  const skill = store.skills[idx];
  if (!skill) return;
  if (skill.currentLevel === 0) {
    skill.currentLevel = 8;
    skill.active = true;
  } else {
    skill.currentLevel = 0;
    skill.active = false;
  }
}

function decLevel(idx: number) {
  const skill = store.skills[idx];
  if (!skill) return;
  if (skill.currentLevel > 8) skill.currentLevel--;
}

function incLevel(idx: number) {
  const skill = store.skills[idx];
  if (!skill) return;
  skill.currentLevel++;
}

function skillCost(idx: number): number | null {
  const skill = store.skills[idx];
  if (!skill || skill.currentLevel === 0) return null;
  return store.targetLevelCost(skill, skill.currentLevel, 8);
}
</script>

<template>
  <div class="card bg-base-200 shadow">
    <div class="card-body gap-0 p-4">
      <h2 class="card-title text-base mb-3">Skills</h2>

      <div class="divide-y divide-base-300">
        <div
          v-for="(skill, idx) in store.skills"
          :key="skill.name"
          class="py-2 flex items-center gap-2"
        >
          <!-- Toggle learned/unlearned -->
          <input
            type="checkbox"
            class="toggle toggle-sm toggle-primary shrink-0"
            :checked="skill.currentLevel > 0"
            @change="toggleSkill(idx)"
          />

          <!-- Name + meta -->
          <div class="flex-1 min-w-0">
            <div class="font-semibold text-sm leading-tight">
              {{ skill.name }}
            </div>
            <div class="flex flex-wrap gap-1 mt-0.5">
              <span
                v-for="attr in boundAttrs(skill)"
                :key="attr"
                class="badge badge-xs"
                :class="ATTR_COLOR[attr] ?? 'badge-ghost'"
                >{{ attr }}</span
              >
              <span class="badge badge-xs badge-ghost">{{
                HARDNESS_LABEL[skill.hardness]
              }}</span>
            </div>
          </div>

          <!-- Level controls (only when learned) -->
          <template v-if="skill.currentLevel > 0">
            <div class="flex items-center gap-1 shrink-0">
              <button
                class="btn btn-xs btn-ghost btn-circle"
                @click="decLevel(idx)"
                :disabled="skill.currentLevel <= 8"
              >
                <PhMinus :size="14" />
              </button>
              <span class="font-mono font-bold text-sm w-6 text-center">{{
                skill.currentLevel
              }}</span>
              <button
                class="btn btn-xs btn-ghost btn-circle"
                @click="incLevel(idx)"
              >
                <PhPlus :size="14" />
              </button>
            </div>
          </template>
          <template v-else>
            <div class="w-20 shrink-0"></div>
          </template>

          <!-- CP cost -->
          <div class="w-14 text-right shrink-0">
            <template v-if="skill.currentLevel > 0">
              <span
                v-if="skillCost(idx) !== null"
                class="text-xs font-semibold text-warning"
              >
                +{{ skillCost(idx) }}&thinsp;CP
              </span>
              <span v-else class="text-xs text-error">∞</span>
            </template>
            <span v-else class="text-xs text-base-content/20">—</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
