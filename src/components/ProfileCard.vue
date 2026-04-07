<script setup lang="ts">
import { ref } from "vue";
import { useModelStore } from "@/stores/model";
import { PhPlus, PhMinus, PhCamera, PhX } from "@phosphor-icons/vue";

const store = useModelStore();

const fileInput = ref<HTMLInputElement | null>(null);

function openFilePicker() {
  fileInput.value?.click();
}

function onFileSelected(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    const result = ev.target?.result;
    if (typeof result === "string") {
      store.portrait = result;
    }
  };
  reader.readAsDataURL(file);
  // Reset so the same file can be selected again
  (e.target as HTMLInputElement).value = "";
}

function removePortrait() {
  store.portrait = null;
}

function decLevel() {
  if ((store.level ?? 1) > 1) store.level = (store.level ?? 1) - 1;
}
function incLevel() {
  store.level = (store.level ?? 1) + 1;
}
</script>

<template>
  <div class="card bg-base-200 shadow">
    <div class="card-body gap-0 p-4">
      <h2 class="card-title text-base mb-3">Profil</h2>

      <div class="flex gap-3">
        <!-- Portrait area -->
        <div class="shrink-0">
          <!-- Hidden file input -->
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="onFileSelected"
          />

          <!-- Portrait placeholder / image -->
          <div class="relative" style="width: 90px; height: 108px">
            <!-- No portrait: clickable placeholder -->
            <button
              v-if="!store.portrait"
              type="button"
              class="w-full h-full flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-base-content/20 text-base-content/40 hover:border-primary hover:text-primary transition-colors bg-base-100"
              @click="openFilePicker"
            >
              <PhCamera :size="24" />
              <span class="text-xs leading-tight text-center px-1"
                >Bild hochladen</span
              >
            </button>

            <!-- Portrait image with remove button -->
            <template v-else>
              <img
                :src="store.portrait"
                alt="Charakterbild"
                class="w-full h-full object-cover rounded-lg"
              />
              <button
                type="button"
                class="btn btn-xs btn-circle btn-error absolute top-1 right-1 opacity-80 hover:opacity-100"
                title="Bild entfernen"
                @click="removePortrait"
              >
                <PhX :size="12" />
              </button>
            </template>
          </div>
        </div>

        <!-- Fields: name, level, daseinsform -->
        <div class="flex-1 flex flex-col gap-2">
          <!-- Name -->
          <div>
            <label class="text-xs text-base-content/50 mb-0.5 block"
              >Name</label
            >
            <input
              type="text"
              class="input input-sm w-full"
              v-model="store.name"
              placeholder="Charaktername"
            />
          </div>

          <!-- Level -->
          <div>
            <label class="text-xs text-base-content/50 mb-0.5 block"
              >Level</label
            >
            <div class="flex items-center gap-2">
              <button
                class="btn btn-xs btn-circle btn-ghost border border-base-content/20"
                :disabled="(store.level ?? 1) <= 1"
                @click="decLevel"
              >
                <PhMinus :size="12" />
              </button>
              <span class="font-bold text-sm min-w-[1.5rem] text-center">
                {{ store.level ?? 1 }}
              </span>
              <button
                class="btn btn-xs btn-circle btn-ghost border border-base-content/20"
                @click="incLevel"
              >
                <PhPlus :size="12" />
              </button>
            </div>
          </div>

          <!-- Daseinsform -->
          <div>
            <label class="text-xs text-base-content/50 mb-0.5 block"
              >Daseinsform</label
            >
            <input
              type="text"
              class="input input-sm w-full"
              v-model="store.daseinsform"
              placeholder="z. B. Mensch, Elf, …"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
