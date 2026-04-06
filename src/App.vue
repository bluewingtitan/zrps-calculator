<script setup lang="ts">
import { RouterView } from "vue-router";

const isDev = ["localhost", "127.0.0.1"].includes(window.location.hostname);
</script>

<template>
  <RouterView />
  <div
    v-if="isDev"
    class="fixed bottom-0 p-4 px-12 rounded-tr-lg z-50 bg-error text-error-content text-center text-xs font-bold py-1 pointer-events-none select-none"
  >
    ⚠ ENTWICKLUNGSINSTANZ — Nicht die öffentliche Version
  </div>
</template>
