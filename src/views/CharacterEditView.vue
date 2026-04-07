<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter, onBeforeRouteLeave } from "vue-router";
import { useCharactersStore } from "@/stores/characters";
import { useModelStore } from "@/stores/model";
import StickyBar from "@/components/StickyBar.vue";
import ProfileCard from "@/components/ProfileCard.vue";
import PrimaryAttributes from "@/components/PrimaryAttributes.vue";
import SecondaryAttributes from "@/components/SecondaryAttributes.vue";
import TraitsCard from "@/components/TraitsCard.vue";
import SkillsCard from "@/components/SkillsCard.vue";
import WealthCard from "@/components/WealthCard.vue";
import DirtyOverlay from "@/components/DirtyOverlay.vue";
import SpecialAbilitiesCard from "@/components/SpecialAbilitiesCard.vue";

const route = useRoute();
const router = useRouter();
const chars = useCharactersStore();
const modelStore = useModelStore();

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
    modelStore.lockAndSave();
  } else {
    chars.discardChanges();
  }
  next();
});
</script>

<template>
  <div class="min-h-screen bg-base-100 pb-28">
    <template v-if="chars.workingCopy">
      <StickyBar />

      <main class="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-4">
        <ProfileCard />
        <PrimaryAttributes />
        <SecondaryAttributes />
        <WealthCard />
        <TraitsCard />
        <SpecialAbilitiesCard />
        <SkillsCard />
      </main>

      <DirtyOverlay />
    </template>
  </div>
</template>
