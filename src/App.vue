<script setup lang="ts">
import StickyBar from "@/components/StickyBar.vue";
import PrimaryAttributes from "@/components/PrimaryAttributes.vue";
import SecondaryAttributes from "@/components/SecondaryAttributes.vue";
import SkillsCard from "@/components/SkillsCard.vue";
import TraitsCard from "@/components/TraitsCard.vue";
</script>

<template>
  <div class="min-h-screen bg-base-100">
    <StickyBar />

    <main class="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-4">
      <PrimaryAttributes />
      <SecondaryAttributes />
      <TraitsCard />
      <SkillsCard />
    </main>
  </div>
</template>
