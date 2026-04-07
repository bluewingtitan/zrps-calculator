import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import vueDevTools from "vite-plugin-vue-devtools";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), vue(), vueJsx(), vueDevTools()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  // Prevent Vite from pre-bundling the typst.ts WASM packages — they must
  // be loaded as native ES modules (they reference .wasm files internally).
  optimizeDeps: {
    exclude: [
      "@myriaddreamin/typst.ts",
      "@myriaddreamin/typst-ts-web-compiler",
    ],
  },
  // Build targets must support top-level await used inside typst.ts.
  build: {
    target: "esnext",
  },
});
