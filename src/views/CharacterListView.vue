<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useCharactersStore } from "@/stores/characters";
import {
  PhPlus,
  PhPencilSimple,
  PhTrash,
  PhUser,
  PhMagnifyingGlass,
  PhUpload,
  PhDownload,
} from "@phosphor-icons/vue";

const router = useRouter();
const chars = useCharactersStore();

const search = ref("");
const importError = ref<string | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);

const filteredCharacters = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return chars.characters;
  return chars.characters.filter((c) =>
    (c.name || "").toLowerCase().includes(q),
  );
});

function openCharacter(id: string) {
  chars.loadCharacter(id);
  router.push({ name: "edit", params: { id } });
}

function createCharacter() {
  router.push({ name: "create" });
}

function deleteCharacter(id: string, event: MouseEvent) {
  event.stopPropagation();
  if (confirm("Charakter wirklich löschen?")) {
    chars.deleteCharacter(id);
  }
}

function triggerImport() {
  importError.value = null;
  fileInputRef.value?.click();
}

async function onFileSelected(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!fileInputRef.value) return;
  fileInputRef.value.value = "";
  if (!file) return;
  const result = await chars.importCharacterFromFile(file);
  if (!result.ok) {
    importError.value = result.error;
  }
}

function exportCharacter(id: string, event: MouseEvent) {
  event.stopPropagation();
  const char = chars.characters.find((c) => c.id === id);
  if (char) chars.exportCharacter(char);
}
</script>

<template>
  <div class="min-h-screen bg-base-100">
    <div class="max-w-2xl mx-auto px-4 py-8">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">Charaktere</h1>
        <div class="flex gap-2">
          <button class="btn btn-ghost btn-sm gap-2" @click="triggerImport">
            <PhUpload :size="16" />
            Import
          </button>
          <button class="btn btn-primary btn-sm gap-2" @click="createCharacter">
            <PhPlus :size="16" />
            Neu
          </button>
        </div>
      </div>

      <!-- Hidden file input for .zrps import -->
      <input
        ref="fileInputRef"
        type="file"
        accept=".zrps"
        class="hidden"
        @change="onFileSelected"
      />

      <!-- Import error alert -->
      <div
        v-if="importError"
        role="alert"
        class="alert alert-error alert-sm mb-4 text-sm"
      >
        <span>Import fehlgeschlagen: {{ importError }}</span>
        <button
          class="btn btn-xs btn-ghost ml-auto"
          @click="importError = null"
        >
          ✕
        </button>
      </div>

      <!-- Search -->
      <label class="input input-sm w-full mb-4">
        <PhMagnifyingGlass :size="16" class="text-base-content/40" />
        <input
          type="search"
          v-model="search"
          placeholder="Suchen…"
          class="grow"
        />
      </label>

      <!-- Empty state -->
      <div v-if="chars.characters.length === 0" class="card bg-base-200 shadow">
        <div class="card-body items-center text-center py-12">
          <PhUser :size="48" class="text-base-content/20 mb-3" />
          <p class="text-base-content/50 mb-4">
            Noch keine Charaktere erstellt.
          </p>
          <button class="btn btn-primary gap-2" @click="createCharacter">
            <PhPlus :size="16" />
            Ersten Charakter erstellen
          </button>
        </div>
      </div>

      <!-- Character list -->
      <div v-else class="flex flex-col gap-3">
        <p
          v-if="filteredCharacters.length === 0"
          class="text-center text-sm text-base-content/40 py-6"
        >
          Kein Charakter gefunden.
        </p>
        <div
          v-for="char in filteredCharacters"
          :key="char.id"
          class="card bg-base-200 shadow cursor-pointer hover:bg-base-300 transition-colors"
          @click="openCharacter(char.id)"
        >
          <div class="card-body p-4 flex-row items-center gap-4">
            <div
              class="shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center"
            >
              <PhUser :size="20" class="text-primary" />
            </div>

            <div class="flex-1 min-w-0">
              <div class="font-semibold truncate">
                {{ char.name || "Unbenannt" }}
              </div>
              <div class="text-xs text-base-content/50">
                Level {{ char.level }} &middot; {{ char.st }}/{{ char.dx }}/{{
                  char.iq
                }}/{{ char.ht }}
              </div>
            </div>

            <div class="flex items-center gap-1 shrink-0">
              <button
                class="btn btn-xs btn-ghost btn-circle"
                @click="openCharacter(char.id)"
              >
                <PhPencilSimple :size="14" />
              </button>
              <button
                class="btn btn-xs btn-ghost btn-circle"
                @click="exportCharacter(char.id, $event)"
              >
                <PhDownload :size="14" />
              </button>
              <button
                class="btn btn-xs btn-ghost btn-circle text-error"
                @click="deleteCharacter(char.id, $event)"
              >
                <PhTrash :size="14" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
