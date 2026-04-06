<script setup lang="ts">
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useCharactersStore } from "@/stores/characters";
import { PREBUILDS } from "@/model/character";
import { PhArrowLeft, PhStar, PhUser, PhCaretDown } from "@phosphor-icons/vue";

const router = useRouter();
const chars = useCharactersStore();

const prebuildOpen = ref(false);

const DEFAULT_BASE_CP = 150;
const DEFAULT_CP_PER_LEVEL = 15;

const name = ref("Neuer Charakter");
const selectedPrebuildId = ref(PREBUILDS[0]!.id);
const baseCp = ref(PREBUILDS[0]!.overrides.baseCp ?? DEFAULT_BASE_CP);
const cpPerLevel = ref(
  PREBUILDS[0]!.overrides.cpPerLevel ?? DEFAULT_CP_PER_LEVEL,
);

// When a prebuild is selected, seed the CP fields from it
watch(selectedPrebuildId, (id) => {
  const pb = PREBUILDS.find((p) => p.id === id);
  if (!pb) return;
  baseCp.value = pb.overrides.baseCp ?? DEFAULT_BASE_CP;
  cpPerLevel.value = pb.overrides.cpPerLevel ?? DEFAULT_CP_PER_LEVEL;
});

function selectPrebuild(id: string) {
  selectedPrebuildId.value = id;
}

function create() {
  const prebuild = PREBUILDS.find((p) => p.id === selectedPrebuildId.value);
  const char = chars.createCharacter({
    name: name.value.trim() || "Neuer Charakter",
    prebuild,
    baseCp: baseCp.value,
    cpPerLevel: cpPerLevel.value,
  });
  router.replace({ name: "edit", params: { id: char.id } });
}
</script>

<template>
  <div class="min-h-screen bg-base-100">
    <div class="max-w-2xl mx-auto px-4 py-8">
      <!-- Header -->
      <div class="flex items-center gap-3 mb-8">
        <button
          class="btn btn-ghost btn-sm btn-circle"
          @click="router.push({ name: 'list' })"
        >
          <PhArrowLeft :size="18" />
        </button>
        <h1 class="text-2xl font-bold">Neuen Charakter erstellen</h1>
      </div>

      <!-- Name -->
      <div class="card bg-base-200 shadow mb-4">
        <div class="card-body p-4">
          <h2 class="card-title text-base mb-3">
            <PhUser :size="18" class="text-primary" />
            Name
          </h2>
          <input
            type="text"
            class="input w-full"
            placeholder="Charaktername…"
            v-model="name"
            @keyup.enter="create"
          />
        </div>
      </div>

      <!-- Prebuild picker -->
      <div class="card bg-base-200 shadow mb-4">
        <div class="card-body p-4">
          <button
            class="flex items-center justify-between w-full text-left"
            @click="prebuildOpen = !prebuildOpen"
          >
            <h2 class="card-title text-base">
              <PhStar :size="18" class="text-primary" />
              Vorlage
              <span class="text-sm font-normal text-base-content/50 ml-1">
                &mdash;
                {{ PREBUILDS.find((p) => p.id === selectedPrebuildId)?.label }}
              </span>
            </h2>
            <PhCaretDown
              :size="16"
              class="text-base-content/40 transition-transform duration-200 shrink-0"
              :class="prebuildOpen ? 'rotate-180' : ''"
            />
          </button>
          <div v-if="prebuildOpen" class="flex flex-col gap-2 mt-3">
            <button
              v-for="pb in PREBUILDS"
              :key="pb.id"
              class="btn btn-sm justify-start text-left h-auto py-3 px-4 flex flex-col items-start gap-0.5"
              :class="
                selectedPrebuildId === pb.id
                  ? 'btn-primary'
                  : 'btn-ghost bg-base-300'
              "
              @click="selectPrebuild(pb.id)"
            >
              <span class="font-semibold">{{ pb.label }}</span>
              <span
                class="text-xs font-normal opacity-70 whitespace-normal text-left"
              >
                {{ pb.description }}
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- CP settings -->
      <div class="card bg-base-200 shadow mb-6">
        <div class="card-body p-4">
          <h2 class="card-title text-base mb-3">Kampagnen-CP</h2>
          <div class="flex gap-4">
            <label class="flex-1">
              <span class="text-xs text-base-content/50 mb-1 block"
                >Basis-CP</span
              >
              <input
                type="number"
                class="input input-sm w-full font-mono"
                :min="0"
                :max="9999"
                v-model.number="baseCp"
              />
            </label>
            <label class="flex-1">
              <span class="text-xs text-base-content/50 mb-1 block"
                >CP pro Level</span
              >
              <input
                type="number"
                class="input input-sm w-full font-mono"
                :min="0"
                :max="999"
                v-model.number="cpPerLevel"
              />
            </label>
          </div>
          <p class="text-xs text-base-content/40 mt-2">
            Gesamt bei Level&nbsp;1:
            <span class="font-semibold text-base-content/60"
              >{{ baseCp }}&thinsp;CP</span
            >
            &nbsp;·&nbsp; bei Level&nbsp;10:
            <span class="font-semibold text-base-content/60"
              >{{ baseCp + cpPerLevel * 9 }}&thinsp;CP</span
            >
          </p>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-3 justify-end">
        <button class="btn btn-ghost" @click="router.push({ name: 'list' })">
          Abbrechen
        </button>
        <button class="btn btn-primary" @click="create">
          Charakter erstellen
        </button>
      </div>
    </div>
  </div>
</template>
