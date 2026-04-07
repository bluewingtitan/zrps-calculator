<script setup lang="ts">
import { ref, computed } from "vue";
import { PhPlus, PhTrash, PhDotsSixVertical } from "@phosphor-icons/vue";

const props = defineProps<{
  title: string;
  emptyText: string;
  items: Array<{ name: string; cp: number; description?: string }>;
}>();

const totalCp = computed(() =>
  props.items.reduce((sum, item) => sum + (item.cp ?? 0), 0),
);

function addItem() {
  props.items.push({ name: "", cp: 0, description: "" });
}

function removeItem(idx: number) {
  props.items.splice(idx, 1);
}

function onCpInput(idx: number, event: Event) {
  const raw = (event.target as HTMLInputElement).value;
  const parsed = parseInt(raw, 10);
  const item = props.items[idx];
  if (!item) return;
  item.cp = isNaN(parsed) ? 0 : parsed;
}

// ── Drag & Drop ────────────────────────────────────────────────────────────
const listEl = ref<HTMLElement | null>(null);
const dragSrcIdx = ref<number | null>(null);
// insertionIdx: 0 = before first row, items.length = after last row
const insertionIdx = ref<number | null>(null);

function onDragStart(idx: number, event: DragEvent) {
  dragSrcIdx.value = idx;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(idx));
  }
}

/** Compute which gap (0…items.length) the cursor is closest to. */
function calcInsertionIdx(mouseY: number): number {
  const rows = listEl.value?.querySelectorAll<HTMLElement>("[data-drag-row]");
  if (!rows?.length) return 0;
  for (let i = 0; i < rows.length; i++) {
    const rect = rows[i]?.getBoundingClientRect();
    if (rect && mouseY < rect.top + rect.height / 2) return i;
  }
  return rows.length;
}

function onContainerDragOver(event: DragEvent) {
  event.preventDefault();
  if (dragSrcIdx.value === null) return;
  if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
  insertionIdx.value = calcInsertionIdx(event.clientY);
}

function onContainerDragLeave(event: DragEvent) {
  const rel = event.relatedTarget as Element | null;
  if (!rel || !listEl.value?.contains(rel)) {
    insertionIdx.value = null;
  }
}

function onContainerDrop(event: DragEvent) {
  event.preventDefault();
  const src = dragSrcIdx.value;
  const ins = insertionIdx.value;
  dragSrcIdx.value = null;
  insertionIdx.value = null;
  if (src === null || ins === null) return;
  // After splicing out src, all indices above src shift down by 1
  const target = ins > src ? ins - 1 : ins;
  if (target === src) return;
  const removed = props.items.splice(src, 1)[0];
  if (!removed) return;
  props.items.splice(target, 0, removed);
}

function onDragEnd() {
  dragSrcIdx.value = null;
  insertionIdx.value = null;
}
</script>

<template>
  <div class="card bg-base-200 shadow">
    <div class="card-body gap-0 p-4">
      <div class="flex items-center justify-between mb-3">
        <h2 class="card-title text-base">{{ title }}</h2>
        <span
          class="text-xs font-semibold"
          :class="
            totalCp > 0
              ? 'text-warning'
              : totalCp < 0
                ? 'text-success'
                : 'text-base-content/30'
          "
        >
          {{ totalCp > 0 ? "+" : "" }}{{ totalCp }}&thinsp;CP
        </span>
      </div>

      <div
        ref="listEl"
        class="divide-y divide-base-300"
        @dragover="onContainerDragOver"
        @dragleave="onContainerDragLeave"
        @drop="onContainerDrop"
      >
        <template v-for="(item, idx) in items" :key="idx">
          <!-- Insertion line above row idx -->
          <div
            class="h-0.5 -my-px rounded-full transition-colors duration-100"
            :class="
              insertionIdx === idx && dragSrcIdx !== null
                ? 'bg-success'
                : 'bg-transparent'
            "
          />
          <div
            data-drag-row
            class="transition-opacity py-2"
            :class="{ 'opacity-30': dragSrcIdx === idx }"
            draggable="true"
            @dragstart="onDragStart(idx, $event)"
            @dragend="onDragEnd"
          >
            <!-- Main row: handle + name + cp + delete -->
            <div class="flex items-center gap-2 select-none">
              <!-- Drag handle -->
              <span
                class="cursor-grab active:cursor-grabbing text-base-content/30 hover:text-base-content/60 shrink-0 transition-colors"
              >
                <PhDotsSixVertical :size="16" />
              </span>

              <!-- Name -->
              <input
                type="text"
                class="input input-sm flex-1 min-w-0"
                placeholder="Name…"
                v-model="item.name"
                draggable="false"
              />

              <!-- CP input -->
              <div class="relative shrink-0 w-24">
                <input
                  type="number"
                  class="input input-sm w-full pr-8 text-right font-mono"
                  :class="
                    item.cp < 0
                      ? 'text-success'
                      : item.cp > 0
                        ? 'text-warning'
                        : ''
                  "
                  :value="item.cp"
                  @input="onCpInput(idx, $event)"
                  placeholder="0"
                  draggable="false"
                />
                <span
                  class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-base-content/40 pointer-events-none"
                  >CP</span
                >
              </div>

              <!-- Remove -->
              <button
                class="btn btn-xs btn-ghost btn-circle text-error shrink-0"
                @click="removeItem(idx)"
              >
                <PhTrash :size="14" />
              </button>
            </div>

            <!-- Description -->
            <textarea
              class="textarea textarea-sm w-full mt-1.5 ml-6 text-xs resize-none leading-snug"
              style="width: calc(100% - 1.5rem)"
              rows="2"
              placeholder="Beschreibung…"
              v-model="item.description"
              draggable="false"
              @dragstart.stop
            />
          </div>
        </template>

        <!-- Insertion line after last row -->
        <div
          class="h-0.5 -my-px rounded-full transition-colors duration-100"
          :class="
            insertionIdx === items.length && dragSrcIdx !== null
              ? 'bg-success'
              : 'bg-transparent'
          "
        />
      </div>

      <!-- Empty state -->
      <p
        v-if="items.length === 0"
        class="text-xs text-base-content/40 text-center py-3"
      >
        {{ emptyText }}
      </p>

      <!-- Add button -->
      <button
        class="btn btn-sm btn-dashed btn-neutral mt-3 gap-2"
        @click="addItem"
      >
        <PhPlus :size="16" />
        Hinzufügen
      </button>
    </div>
  </div>
</template>
