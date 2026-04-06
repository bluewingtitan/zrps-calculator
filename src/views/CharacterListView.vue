<script setup lang="ts">
import { useRouter } from "vue-router";
import { useCharactersStore } from "@/stores/characters";
import { PhPlus, PhPencilSimple, PhTrash, PhUser } from "@phosphor-icons/vue";

const router = useRouter();
const chars = useCharactersStore();

function openCharacter(id: string) {
  chars.loadCharacter(id);
  router.push({ name: "edit", params: { id } });
}

function createCharacter() {
  const char = chars.createCharacter();
  router.push({ name: "edit", params: { id: char.id } });
}

function deleteCharacter(id: string, event: MouseEvent) {
  event.stopPropagation();
  if (confirm("Charakter wirklich löschen?")) {
    chars.deleteCharacter(id);
  }
}
</script>

<template>
  <div class="min-h-screen bg-base-100">
    <div class="max-w-2xl mx-auto px-4 py-8">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">Charaktere</h1>
        <button class="btn btn-primary btn-sm gap-2" @click="createCharacter">
          <PhPlus :size="16" />
          Neu
        </button>
      </div>

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
        <div
          v-for="char in chars.characters"
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
