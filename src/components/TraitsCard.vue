<script setup lang="ts">
import { useModelStore } from "@/stores/model";
import CpEntryList from "./CpEntryList.vue";

const store = useModelStore();
</script>

<template>
  <CpEntryList
    title="Vor- &amp; Nachteile"
    emptyText="Noch keine Vor- oder Nachteile hinzugefügt."
    :items="store.traits"
  />
</template>
