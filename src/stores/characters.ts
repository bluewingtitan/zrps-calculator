import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import {
  type CharacterData,
  cloneCharacter,
  defaultCharacter,
  migrateCharacter,
} from "@/model/character";

export const useCharactersStore = defineStore("characters", () => {
  // Persisted list of all saved characters
  const characters = useLocalStorage<CharacterData[]>("characters", []);

  // Mutable working copy of the currently edited character (NOT auto-saved)
  const workingCopy = ref<CharacterData | null>(null);

  // JSON snapshot of the last saved state, used for dirty detection
  const savedSnapshot = ref<string>("");

  const isDirty = computed(() => {
    if (!workingCopy.value) return false;
    return JSON.stringify(workingCopy.value) !== savedSnapshot.value;
  });

  function loadCharacter(id: string): boolean {
    const found = characters.value.find((c) => c.id === id);
    if (!found) return false;
    const migrated = migrateCharacter(cloneCharacter(found));
    workingCopy.value = migrated;
    savedSnapshot.value = JSON.stringify(migrated);
    return true;
  }

  function saveCharacter() {
    if (!workingCopy.value) return;
    const toSave = cloneCharacter(workingCopy.value);
    const idx = characters.value.findIndex((c) => c.id === toSave.id);
    if (idx >= 0) {
      characters.value[idx] = toSave;
    } else {
      characters.value.push(toSave);
    }
    savedSnapshot.value = JSON.stringify(toSave);
  }

  function discardChanges() {
    if (!savedSnapshot.value) return;
    workingCopy.value = JSON.parse(savedSnapshot.value);
  }

  function createCharacter(): CharacterData {
    const id = crypto.randomUUID();
    const char = defaultCharacter(id);
    const toSave = cloneCharacter(char);
    characters.value.push(toSave);
    workingCopy.value = cloneCharacter(toSave);
    savedSnapshot.value = JSON.stringify(toSave);
    return toSave;
  }

  function deleteCharacter(id: string) {
    const idx = characters.value.findIndex((c) => c.id === id);
    if (idx >= 0) characters.value.splice(idx, 1);
    if (workingCopy.value?.id === id) {
      workingCopy.value = null;
      savedSnapshot.value = "";
    }
  }

  function unload() {
    workingCopy.value = null;
    savedSnapshot.value = "";
  }

  return {
    characters,
    workingCopy,
    isDirty,
    loadCharacter,
    saveCharacter,
    discardChanges,
    createCharacter,
    deleteCharacter,
    unload,
  };
});
