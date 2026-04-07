<script setup lang="ts">
import { useModelStore } from "@/stores/model";
import CpEntryList from "./CpEntryList.vue";

const store = useModelStore();
</script>

<template>
  <CpEntryList
    title="Sonderfähigkeiten"
    emptyText="Noch keine Sonderfähigkeiten hinzugefügt."
    :items="store.specialAbilities"
  />
</template>
