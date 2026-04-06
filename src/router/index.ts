import { createRouter, createWebHistory } from "vue-router";
import CharacterListView from "@/views/CharacterListView.vue";
import CharacterEditView from "@/views/CharacterEditView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", name: "list", component: CharacterListView },
    { path: "/character/:id", name: "edit", component: CharacterEditView },
  ],
});

export default router;
