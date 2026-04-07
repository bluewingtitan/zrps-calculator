<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCharactersStore } from "@/stores/characters";
import { useModelStore } from "@/stores/model";
import { WEALTH_LEVELS } from "@/model/character";
import { PhArrowLeft, PhPencilSimple, PhFilePdf } from "@phosphor-icons/vue";
import { exportCharacterPdf } from "@/lib/typstExport";
import type { CharacterPdfSnapshot } from "@/lib/typstExport";

const route = useRoute();
const router = useRouter();
const chars = useCharactersStore();
const model = useModelStore();

onMounted(() => {
  const id = route.params.id as string;
  if (chars.workingCopy?.id !== id) {
    const found = chars.loadCharacter(id);
    if (!found) router.replace({ name: "list" });
  }
});

function goBackToEdit() {
  router.push({ name: "edit", params: { id: route.params.id } });
}

const wealthLevel = computed(() =>
  WEALTH_LEVELS.find((w) => w.key === (model.wealthLevelKey ?? "0")),
);

const activeSkills = computed(() =>
  model.skills.filter((s) => s.currentLevel > 0),
);

const basicMoveRounded = computed(() => Math.round(model.basicMove));

// ── PDF export ────────────────────────────────────────────────────────────

const pdfExporting = ref(false);
const pdfError = ref<string | null>(null);

const pdfSnapshot = computed<CharacterPdfSnapshot>(() => ({
  name: chars.workingCopy?.name ?? "",
  level: model.level ?? 1,
  st: model.st ?? 10,
  dx: model.dx ?? 10,
  iq: model.iq ?? 10,
  ht: model.ht ?? 10,
  hp: model.hp,
  will: model.will,
  per: model.per,
  fp: model.fp,
  basicMove: model.basicMove,
  wealthLabel:
    wealthLevel.value && wealthLevel.value.key !== "0"
      ? wealthLevel.value.label
      : undefined,
  cpUsed: model.availableCp - model.usedCp,
  cpTotal: model.availableCp,
  skills: activeSkills.value.map((s) => ({ name: s.name, level: s.currentLevel })),
  traits: model.traits.map((t) => ({ name: t.name, cp: t.cp, description: t.description })),
  specialAbilities: model.specialAbilities.map((a) => ({
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
  <div class="min-h-screen bg-base-300 pb-16 print:bg-white">
    <template v-if="chars.workingCopy">
      <!-- Preview bar (hidden in print) -->
      <div
        class="sticky top-0 z-50 bg-base-200 border-b border-base-300 shadow-md print:hidden"
      >
        <div class="max-w-2xl mx-auto px-4 py-2 flex items-center gap-3">
          <button
            class="btn btn-xs btn-ghost btn-circle shrink-0"
            @click="goBackToEdit"
          >
            <PhArrowLeft :size="16" />
          </button>
          <span class="font-semibold text-base truncate flex-1 min-w-0">
            {{ chars.workingCopy.name || "Charakter" }}
          </span>
          <span
            class="badge badge-outline badge-sm text-base-content/50 shrink-0"
            >Vorschau</span
          >
          <button class="btn btn-xs btn-primary gap-1.5" @click="goBackToEdit">
            <PhPencilSimple :size="14" />
            Bearbeiten
          </button>
          <button
            class="btn btn-xs btn-outline gap-1.5"
            :class="{ 'btn-disabled': pdfExporting }"
            :disabled="pdfExporting"
            @click="handleExportPdf"
            title="Charakterbogen als PDF exportieren (Typst WASM)"
          >
            <span v-if="pdfExporting" class="loading loading-spinner loading-xs" />
            <PhFilePdf v-else :size="14" />
            PDF
          </button>
        </div>
      </div>
      <!-- PDF error toast (hidden in print) -->
      <div
        v-if="pdfError"
        class="max-w-2xl mx-auto px-4 pt-3 print:hidden"
      >
        <div class="alert alert-error text-sm flex items-start gap-2">
          <span class="flex-1">{{ pdfError }}</span>
          <button class="btn btn-xs btn-circle btn-ghost" @click="pdfError = null">✕</button>
        </div>
      </div>

      <!-- Sheet -->
      <main class="max-w-2xl mx-auto px-4 py-6">
        <div
          class="bg-base-100 rounded-2xl shadow-lg overflow-hidden print:shadow-none print:rounded-none"
        >

          <!-- ── Header ─────────────────────────────────────────────────── -->
          <div class="bg-base-200 px-6 pt-6 pb-4 border-b border-base-300">
            <div class="flex items-start justify-between gap-4">
              <h1 class="text-2xl font-bold tracking-tight leading-tight min-w-0 truncate">
                {{ chars.workingCopy.name || "Unbenannt" }}
              </h1>
              <div class="flex items-baseline gap-1 shrink-0">
                <span class="text-xs text-base-content/50 uppercase tracking-wide">Stufe</span>
                <span class="text-2xl font-bold">{{ model.level ?? 1 }}</span>
              </div>
            </div>
          </div>

          <div class="px-6 py-5 flex flex-col gap-6">

            <!-- ── Attributes ─────────────────────────────────────────────── -->
            <section>
              <h2 class="text-xs font-bold uppercase tracking-widest text-base-content/40 mb-2 border-b border-base-200 pb-1">Attribute</h2>
              <!-- Primärattribute -->
              <table class="w-full text-center border-collapse mb-3">
                <thead>
                  <tr>
                    <th class="attr-th">ST</th>
                    <th class="attr-th">DX</th>
                    <th class="attr-th">IQ</th>
                    <th class="attr-th">HT</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="attr-td">{{ model.st }}</td>
                    <td class="attr-td">{{ model.dx }}</td>
                    <td class="attr-td">{{ model.iq }}</td>
                    <td class="attr-td">{{ model.ht }}</td>
                  </tr>
                </tbody>
              </table>
              <!-- Sekundärattribute -->
              <table class="w-full text-center border-collapse">
                <thead>
                  <tr>
                    <th class="attr-th">HP</th>
                    <th class="attr-th">WIL</th>
                    <th class="attr-th">PER</th>
                    <th class="attr-th">FP</th>
                    <th class="attr-th">BM</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="attr-td">{{ model.hp }}</td>
                    <td class="attr-td">{{ model.will }}</td>
                    <td class="attr-td">{{ model.per }}</td>
                    <td class="attr-td">{{ model.fp }}</td>
                    <td class="attr-td">{{ basicMoveRounded }}</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <!-- ── Wealth ─────────────────────────────────────────────────── -->
            <section v-if="wealthLevel && wealthLevel.key !== '0'">
              <h2 class="text-xs font-bold uppercase tracking-widest text-base-content/40 mb-2 border-b border-base-200 pb-1">Wohlstand</h2>
              <p class="text-sm font-medium">{{ wealthLevel.label }}</p>
            </section>

            <!-- ── Skills ─────────────────────────────────────────────────── -->
            <section v-if="activeSkills.length">
              <h2 class="text-xs font-bold uppercase tracking-widest text-base-content/40 mb-2 border-b border-base-200 pb-1">Fertigkeiten</h2>
              <table class="w-full border-collapse">
                <thead>
                  <tr>
                    <th class="list-th text-left">Fertigkeit</th>
                    <th class="list-th text-right">Stufe</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="skill in activeSkills" :key="skill.name" class="border-t border-base-200">
                    <td class="list-td text-sm font-medium">{{ skill.name }}</td>
                    <td class="list-td text-sm font-bold font-mono text-right">{{ skill.currentLevel }}</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <!-- ── Traits ─────────────────────────────────────────────────── -->
            <section v-if="model.traits.length">
              <h2 class="text-xs font-bold uppercase tracking-widest text-base-content/40 mb-2 border-b border-base-200 pb-1">Vor- &amp; Nachteile</h2>
              <table class="w-full border-collapse">
                <tbody>
                  <template v-for="trait in model.traits" :key="trait.name">
                    <tr class="border-t border-base-200">
                      <td class="list-td text-sm font-medium">{{ trait.name }}</td>
                    </tr>
                    <tr v-if="trait.description" class="border-base-200">
                      <td class="list-td-desc text-xs text-base-content/60 whitespace-pre-wrap">{{ trait.description }}</td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </section>

            <!-- ── Special Abilities ──────────────────────────────────────── -->
            <section v-if="model.specialAbilities.length">
              <h2 class="text-xs font-bold uppercase tracking-widest text-base-content/40 mb-2 border-b border-base-200 pb-1">Sonderfähigkeiten</h2>
              <table class="w-full border-collapse">
                <tbody>
                  <template v-for="sa in model.specialAbilities" :key="sa.name">
                    <tr class="border-t border-base-200">
                      <td class="list-td text-sm font-medium">{{ sa.name }}</td>
                    </tr>
                    <tr v-if="sa.description" class="border-base-200">
                      <td class="list-td-desc text-xs text-base-content/60 whitespace-pre-wrap">{{ sa.description }}</td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </section>

          </div>
        </div>
      </main>
    </template>
  </div>
</template>

<style scoped>
/* Attribute tables */
.attr-th { padding: 0.25rem 0.5rem; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.5; background: var(--color-base-200); border: 1px solid var(--color-base-300); }
.attr-td { padding: 0.4rem 0.5rem; font-size: 1.25rem; font-weight: 700; text-align: center; border: 1px solid var(--color-base-300); }

/* List tables (skills / traits / abilities) */
.list-th      { padding: 0.25rem 0.5rem; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; opacity: 0.45; border-bottom: 2px solid var(--color-base-300); }
.list-td      { padding: 0.375rem 0.5rem; }
.list-td-desc { padding: 0.1rem 0.5rem 0.5rem 1rem; }
</style>



