<script setup lang="ts">
import { onMounted } from "vue";
import { useRoute, useRouter, onBeforeRouteLeave } from "vue-router";
import { useCharactersStore } from "@/stores/characters";
import StickyBar from "@/components/StickyBar.vue";
import PrimaryAttributes from "@/components/PrimaryAttributes.vue";
import SecondaryAttributes from "@/components/SecondaryAttributes.vue";
import TraitsCard from "@/components/TraitsCard.vue";
import SkillsCard from "@/components/SkillsCard.vue";
import DirtyOverlay from "@/components/DirtyOverlay.vue";

const route = useRoute();
const router = useRouter();
const chars = useCharactersStore();

onMounted(() => {
  const id = route.params.id as string;
  // If workingCopy is already loaded for this character (e.g., just created), skip reload
  if (chars.workingCopy?.id !== id) {
    const found = chars.loadCharacter(id);
    if (!found) {
      router.replace({ name: "list" });
    }
  }
});

onBeforeRouteLeave((_to, _from, next) => {
  if (!chars.isDirty) {
    next();
    return;
  }
  // Let the StickyBar back button handle the confirm dialog.
  // If we arrive here via browser back / router.push, show a native confirm.
  const answer = confirm(
    "Es gibt ungespeicherte Änderungen.\n\nSpeichern vor dem Verlassen?",
  );
  if (answer) {
    chars.saveCharacter();
  } else {
    chars.discardChanges();
  }
  next();
});
</script>

<template>
  <div class="min-h-screen bg-base-100 pb-28">
    <StickyBar />

    <main class="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-4">
      <PrimaryAttributes />
      <SecondaryAttributes />
      <TraitsCard />
      <SkillsCard />
    </main>

    <DirtyOverlay />
  </div>
</template>
