<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { PhX, PhMagnifyingGlass } from "@phosphor-icons/vue";
import type { CpEntryPreset } from "@/model/character";

const props = defineProps<{
  open: boolean;
  presets: CpEntryPreset[];
}>();

const emit = defineEmits<{
  close: [];
  select: [preset: CpEntryPreset];
}>();

const searchQuery = ref("");
const activeTags = ref<Set<string>>(new Set());

const allTags = computed(() => {
  const tags = new Set<string>();
  for (const p of props.presets) {
    for (const t of p.tags) tags.add(t);
  }
  return [...tags].sort();
});

function toggleTag(tag: string) {
  // Re-assign to a new Set so Vue tracks the change
  const next = new Set(activeTags.value);
  if (next.has(tag)) {
    next.delete(tag);
  } else {
    next.add(tag);
  }
  activeTags.value = next;
}

const filteredPresets = computed(() => {
  const q = searchQuery.value.toLowerCase().trim();
  return props.presets.filter((p) => {
    if (activeTags.value.size > 0) {
      for (const tag of activeTags.value) {
        if (!p.tags.includes(tag)) return false;
      }
    }
    if (q) {
      return (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }
    return true;
  });
});

function selectPreset(preset: CpEntryPreset) {
  emit("select", preset);
  emit("close");
}

watch(
  () => props.open,
  (val) => {
    if (val) {
      searchQuery.value = "";
      activeTags.value = new Set();
    }
  },
);
</script>

<template>
  <!-- Backdrop -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        @click.self="$emit('close')"
      >
        <!-- Modal panel -->
        <div
          class="bg-base-100 rounded-2xl shadow-2xl flex flex-col w-full max-w-4xl"
          style="height: min(92vh, 780px)"
          @click.stop
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between px-5 pt-5 pb-3 shrink-0"
          >
            <h2 class="text-lg font-bold">Sonderfähigkeit aus Vorlage laden</h2>
            <button
              class="btn btn-sm btn-ghost btn-circle"
              @click="$emit('close')"
            >
              <PhX :size="16" />
            </button>
          </div>

          <!-- Search + tag filters -->
          <div class="px-5 pb-3 shrink-0 space-y-2">
            <!-- Search input -->
            <label class="input input-sm flex items-center gap-2 w-full">
              <PhMagnifyingGlass
                :size="14"
                class="text-base-content/40 shrink-0"
              />
              <input
                v-model="searchQuery"
                type="text"
                class="grow min-w-0"
                placeholder="Name oder Beschreibung suchen…"
              />
            </label>

            <!-- Tag filters -->
            <div v-if="allTags.length > 0" class="flex flex-wrap gap-1.5">
              <button
                v-for="tag in allTags"
                :key="tag"
                class="badge cursor-pointer select-none transition-colors"
                :class="
                  activeTags.has(tag)
                    ? 'badge-primary'
                    : 'badge-ghost hover:badge-outline'
                "
                @click="toggleTag(tag)"
              >
                {{ tag }}
              </button>
            </div>
          </div>

          <div class="divider my-0 px-5" />

          <!-- Preset list -->
          <div class="flex-1 overflow-y-auto px-5 py-3">
            <p
              v-if="filteredPresets.length === 0"
              class="text-sm text-base-content/40 text-center py-10"
            >
              Keine Vorlagen gefunden.
            </p>

            <div
              v-else
              class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
            >
              <button
                v-for="preset in filteredPresets"
                :key="preset.id"
                class="card bg-base-200 hover:bg-base-300 active:scale-[0.98] transition-all text-left shadow-sm cursor-pointer w-full"
                @click="selectPreset(preset)"
              >
                <div class="card-body p-4 gap-1.5">
                  <div class="flex items-start justify-between gap-2">
                    <span class="font-semibold text-sm leading-snug">{{
                      preset.name
                    }}</span>
                    <span
                      class="badge badge-sm shrink-0 font-mono"
                      :class="
                        preset.cp < 0
                          ? 'badge-success'
                          : preset.cp > 0
                            ? 'badge-warning'
                            : 'badge-ghost'
                      "
                    >
                      {{ preset.cp > 0 ? "+" : "" }}{{ preset.cp }} CP
                    </span>
                  </div>
                  <p class="text-xs text-base-content/60 leading-snug">
                    {{ preset.description }}
                  </p>
                  <div
                    v-if="preset.tags.length > 0"
                    class="flex flex-wrap gap-1 mt-0.5"
                  >
                    <span
                      v-for="tag in preset.tags"
                      :key="tag"
                      class="badge badge-xs badge-ghost"
                    >
                      {{ tag }}
                    </span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
