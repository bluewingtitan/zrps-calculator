<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useModelStore } from "@/stores/model";
import { useCharactersStore } from "@/stores/characters";
import {
  PhMinus,
  PhPlus,
  PhArrowLeft,
  PhFloppyDisk,
  PhTrash,
  PhEye,
} from "@phosphor-icons/vue";

const store = useModelStore();
const chars = useCharactersStore();
const router = useRouter();
const route = useRoute();

const remaining = computed(() => store.availableCp - store.usedCp);
const showConfirm = ref(false);
// Where to navigate after the confirm dialog resolves
type Destination = "list" | "preview";
const pendingDestination = ref<Destination>("list");

function decLevel() {
  if ((store.level ?? 1) > 1) store.level = (store.level ?? 1) - 1;
}
function incLevel() {
  store.level = (store.level ?? 1) + 1;
}

function navigateTo(dest: Destination) {
  if (dest === "preview") {
    router.push({ name: "preview", params: { id: route.params.id } });
  } else {
    chars.unload();
    router.push({ name: "list" });
  }
}

function handleBack() {
  if (chars.isDirty) {
    pendingDestination.value = "list";
    showConfirm.value = true;
  } else {
    navigateTo("list");
  }
}
function handlePreview() {
  if (chars.isDirty) {
    pendingDestination.value = "preview";
    showConfirm.value = true;
  } else {
    navigateTo("preview");
  }
}
function confirmSave() {
  store.lockAndSave();
  showConfirm.value = false;
  navigateTo(pendingDestination.value);
}
function confirmDiscard() {
  chars.discardChanges();
  showConfirm.value = false;
  navigateTo(pendingDestination.value);
}
function cancelConfirm() {
  showConfirm.value = false;
}
</script>

<template>
  <div class="sticky top-0 z-50 bg-base-200 border-b border-base-300 shadow-md">
    <div class="max-w-2xl mx-auto px-4 py-2 flex items-center gap-3">
      <!-- Back button -->
      <button
        class="btn btn-xs btn-ghost btn-circle shrink-0"
        @click="handleBack"
      >
        <PhArrowLeft :size="16" />
      </button>

      <!-- Character name (inline editable) -->
      <input
        class="input input-xs bg-transparent border-none shadow-none focus:outline-none font-semibold text-base w-32 shrink min-w-0 px-1"
        :value="store.name ?? ''"
        @input="store.name = ($event.target as HTMLInputElement).value"
        placeholder="Name…"
      />

      <div class="divider divider-horizontal mx-0"></div>

      <!-- Level -->
      <div class="flex items-center gap-1 shrink-0">
        <span class="text-xs font-semibold text-base-content/60">LVL</span>
        <button
          class="btn btn-xs btn-ghost btn-circle"
          @click="decLevel"
          :disabled="(store.level ?? 1) <= 1"
        >
          <PhMinus :size="14" />
        </button>
        <span class="text-base font-bold w-6 text-center">{{
          store.level ?? 1
        }}</span>
        <button class="btn btn-xs btn-ghost btn-circle" @click="incLevel">
          <PhPlus :size="14" />
        </button>
      </div>

      <div class="divider divider-horizontal mx-0"></div>

      <!-- CP bar -->
      <div class="flex-1 min-w-0">
        <div class="flex justify-between items-baseline mb-1">
          <span class="text-xs text-base-content/60 hidden sm:block">CP</span>
          <span
            class="text-sm font-bold"
            :class="remaining >= 0 ? 'text-success' : 'text-error'"
          >
            {{ store.usedCp }}&thinsp;/&thinsp;{{ store.availableCp }}
            <span class="font-normal text-xs ml-1">
              ({{ remaining >= 0 ? "Verbleibend: " : "Zu viel:"
              }}{{ Math.abs(remaining) }} CP)
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

      <!-- Preview button -->
      <button
        class="btn btn-xs btn-ghost gap-1.5 shrink-0"
        @click="handlePreview"
      >
        <PhEye :size="14" />
        <span class="hidden sm:inline">Vorschau</span>
      </button>
    </div>
  </div>

  <!-- Confirm dialog (leave with dirty changes) -->
  <dialog
    :open="showConfirm"
    class="modal modal-bottom sm:modal-middle"
    @click.self="cancelConfirm"
  >
    <div class="modal-box">
      <h3 class="font-bold text-lg mb-2">Ungespeicherte Änderungen</h3>
      <p class="text-sm text-base-content/70">
        Möchtest du die Änderungen an
        <strong>{{ store.name || "diesem Charakter" }}</strong> speichern, bevor
        du die Seite verlässt?
      </p>
      <div class="modal-action">
        <button class="btn btn-ghost btn-sm" @click="cancelConfirm">
          Abbrechen
        </button>
        <button class="btn btn-error btn-sm gap-2" @click="confirmDiscard">
          <PhTrash :size="14" />
          Verwerfen
        </button>
        <button class="btn btn-primary btn-sm gap-2" @click="confirmSave">
          <PhFloppyDisk :size="14" />
          Speichern
        </button>
      </div>
    </div>
  </dialog>
</template>
