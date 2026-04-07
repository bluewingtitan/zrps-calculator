<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useModelStore } from "@/stores/model";
import { useCharactersStore,  } from "@/stores/characters";
import {
  PhMinus,
  PhPlus,
  PhArrowLeft,
  PhFloppyDisk,
  PhTrash,
  PhEye,
  PhFilePdf,
} from "@phosphor-icons/vue";
import { exportCharacterPdf } from "@/lib/typstExport";
import type { CharacterPdfSnapshot } from "@/lib/typstExport";
import { WEALTH_LEVELS } from "@/model/character";

const modelStore = useModelStore();
const chars = useCharactersStore();
const router = useRouter();
const route = useRoute();

const remaining = computed(() => modelStore.availableCp - modelStore.usedCp);
const showConfirm = ref(false);
// Where to navigate after the confirm dialog resolves
type Destination = "list" | "preview";
const pendingDestination = ref<Destination>("list");

function decLevel() {
  if ((modelStore.level ?? 1) > 1) modelStore.level = (modelStore.level ?? 1) - 1;
}
function incLevel() {
  modelStore.level = (modelStore.level ?? 1) + 1;
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
  modelStore.lockAndSave();
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



const pdfExporting = ref(false);
const pdfError = ref<string | null>(null);

const wealthLevel = computed(() =>
  WEALTH_LEVELS.find((w) => w.key === (modelStore.wealthLevelKey ?? "0")),
);

const activeSkills = computed(() =>
  modelStore.skills.filter((s) => s.currentLevel > 0),
);


const pdfSnapshot = computed<CharacterPdfSnapshot>(() => ({
  name: chars.workingCopy?.name ?? "",
  level: modelStore.level ?? 1,
  st: modelStore.st ?? 10,
  dx: modelStore.dx ?? 10,
  iq: modelStore.iq ?? 10,
  ht: modelStore.ht ?? 10,
  hp: modelStore.hp,
  will: modelStore.will,
  per: modelStore.per,
  fp: modelStore.fp,
  basicMove: modelStore.basicMove,
  wealthLabel:
    wealthLevel.value && wealthLevel.value.key !== "0"
      ? wealthLevel.value.label
      : undefined,
  cpUsed: modelStore.availableCp - modelStore.usedCp,
  cpTotal: modelStore.availableCp,
  skills: activeSkills.value.map((s) => ({ name: s.name, level: s.currentLevel })),
  traits: modelStore.traits.map((t) => ({ name: t.name, cp: t.cp, description: t.description })),
  specialAbilities: modelStore.specialAbilities.map((a) => ({
    name: a.name,
    description: a.description,
  })),
}));

async function handleExportPdf() {
  if (pdfExporting.value) return;
  pdfExporting.value = true;
  pdfError.value = null;
  try {
    await exportCharacterPdf(pdfSnapshot.value);
  } catch (e) {
    pdfError.value = e instanceof Error ? e.message : "Fehler beim PDF-Export.";
  } finally {
    pdfExporting.value = false;
  }
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
        :value="modelStore.name ?? ''"
        @input="modelStore.name = ($event.target as HTMLInputElement).value"
        placeholder="Name…"
      />

      <div class="divider divider-horizontal mx-0"></div>

      <!-- Level -->
      <div class="flex items-center gap-1 shrink-0">
        <span class="text-xs font-semibold text-base-content/60">LVL</span>
        <button
          class="btn btn-xs btn-ghost btn-circle"
          @click="decLevel"
          :disabled="(modelStore.level ?? 1) <= 1"
        >
          <PhMinus :size="14" />
        </button>
        <span class="text-base font-bold w-6 text-center">{{
          modelStore.level ?? 1
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
            {{ modelStore.usedCp }}&thinsp;/&thinsp;{{ modelStore.availableCp }}
            <span class="font-normal text-xs ml-1">
              ({{ remaining >= 0 ? "Verbleibend: " : "Zu viel:"
              }}{{ Math.abs(remaining) }} CP)
            </span>
          </span>
        </div>
        <progress
          class="progress w-full h-2"
          :class="remaining >= 0 ? 'progress-success' : 'progress-error'"
          :value="modelStore.usedCp"
          :max="modelStore.availableCp"
        ></progress>
      </div>

      <!-- Preview button -->
          <button
            class="btn btn-xs btn-outline gap-1.5"
            :class="{ 'btn-disabled': pdfExporting }"
            :disabled="pdfExporting"
            @click="handleExportPdf"
            title="Charakterbogen als PDF exportieren"
          >
            <span v-if="pdfExporting" class="loading loading-spinner loading-xs" />
            <PhFilePdf v-else :size="14" />
            PDF
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
        <strong>{{ modelStore.name || "diesem Charakter" }}</strong> speichern, bevor
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
