<script setup lang="ts">
import { useModelStore } from "@/stores/model";
import CpEntryList from "./CpEntryList.vue";
import { SPECIAL_ABILITY_PRESETS } from "@/model/character";

const store = useModelStore();
</script>

<template>
  <CpEntryList
    title="Sonderfähigkeiten"
    emptyText="Noch keine Sonderfähigkeiten hinzugefügt."
    :items="store.specialAbilities"
    :presets="SPECIAL_ABILITY_PRESETS"
  />
</template>
