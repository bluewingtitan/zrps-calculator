import { createRouter, createWebHistory } from "vue-router";
import CharacterListView from "@/views/CharacterListView.vue";
import CharacterEditView from "@/views/CharacterEditView.vue";
import CharacterCreationView from "@/views/CharacterCreationView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", name: "list", component: CharacterListView },
    // /character/new must come before /:id so it isn't swallowed as an id
    {
      path: "/character/new",
      name: "create",
      component: CharacterCreationView,
    },
    { path: "/character/:id", name: "edit", component: CharacterEditView },
  ],
});

export default router;
