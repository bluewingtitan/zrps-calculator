<script setup lang="ts">
import { useModelStore } from "@/stores/model";
import CpEntryList from "./CpEntryList.vue";
import { TRAITS_PRESETS } from "@/model/character";

const store = useModelStore();
</script>

<template>
  <CpEntryList
    title="Vor- &amp; Nachteile"
    emptyText="Noch keine Vor- oder Nachteile hinzugefügt."
    :items="store.traits"
    :presets="TRAITS_PRESETS"
  />
</template>
