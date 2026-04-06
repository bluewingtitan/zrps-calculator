<script setup lang="ts">
import { useCharactersStore } from "@/stores/characters";
import { PhFloppyDisk, PhArrowCounterClockwise } from "@phosphor-icons/vue";

const chars = useCharactersStore();

function save() {
  chars.saveCharacter();
}

function discard() {
  chars.discardChanges();
}
</script>

<template>
  <Transition
    enter-active-class="transition ease-out duration-200"
    enter-from-class="translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition ease-in duration-150"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-full opacity-0"
  >
    <div
      v-if="chars.isDirty"
      class="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-4 px-4 pointer-events-none"
    >
      <div
        class="pointer-events-auto flex items-center gap-3 bg-base-300 border border-base-content/10 shadow-xl rounded-2xl px-5 py-3"
      >
        <span class="text-sm text-base-content/60 mr-1"
          >Ungespeicherte Änderungen</span
        >

        <button class="btn btn-sm btn-ghost gap-2" @click="discard">
          <PhArrowCounterClockwise :size="15" />
          Verwerfen
        </button>

        <button class="btn btn-sm btn-primary gap-2" @click="save">
          <PhFloppyDisk :size="15" />
          Speichern
        </button>
      </div>
    </div>
  </Transition>
</template>
