# ZRPS Calculator – Copilot Instructions

A browser-based GURPS-inspired character sheet calculator for a German-language tabletop RPG campaign. Vue 3 + Pinia + Tailwind CSS v4 + DaisyUI, deployed as a Docker/nginx image.

## Architecture

```
src/model/character.ts      ← Single source of truth: CharacterData interface, types, PREBUILDS, WEALTH_LEVELS, migration
src/stores/characters.ts    ← Pinia store: localStorage persistence (via VueUse), workingCopy, dirty detection
src/stores/model.ts         ← Computed reactive proxies into workingCopy, derived stats, skill cost logic
src/components/             ← All read/write character state via useModelStore() only
src/views/                  ← Pages: list, create (/character/new), edit (/character/:id), preview (/character/:id/preview)
src/lib/typstExport.ts      ← In-browser PDF generation via Typst WASM (lazy-loaded ~10 MB)
src/model/importExport.ts   ← .zrps file format (JSON) for export/import
```

**Data flow:** `CharacterData` (localStorage) → `chars.loadCharacter()` → `chars.workingCopy` → `useModelStore()` computed proxies → components via `v-model`.

## Critical Patterns

**Always use `useModelStore()` in components**, never read/write `workingCopy` directly from components. The `field()` helper in `model.ts` provides two-way writable computed refs auto-bound to `workingCopy`.

**Save via `lockAndSave()`**, not `chars.saveCharacter()` directly. `lockAndSave()` first runs `lockSkillCosts()` which stores CP costs at the current attribute values before persisting — this prevents retroactive cost changes when attributes change later.

**Skill costs use locked values**: `SkillDefinition.lockedLevelCosts` (keyed by level) stores CP cost at save-time. `levelCost()` in model.ts prefers locked values over dynamic recalculation.

## Model Versioning

When changing `CharacterData` in `character.ts`:

1. Increment `MODEL_VERSION`
2. Add a migration block to `migrateCharacter()` following the existing chained `if (data.modelVersion < N)` pattern
3. Update `defaultCharacter()` if the new field has a default

Current version: `MODEL_VERSION = 5`.

## UI Conventions

- **Language**: All UI labels, descriptions, and error messages are in German.
- **Styling**: DaisyUI classes (`card`, `card-body`, `btn`, `btn-xs`, `badge`, `divider`, etc.) on top of Tailwind v4. No custom CSS beyond `src/assets/main.css`.
- **Icons**: `@phosphor-icons/vue` (e.g., `<PhPlus />`, `<PhMinus />`).
- **Reusable counter**: `AttrCounter.vue` is the ± stepper used for all numeric attribute inputs. Accepts `v-model`, `label`, `cpPerStep`, `cpBase`, `min`, `max`, `base` (for secondary attrs).
- **Dirty state**: `DirtyOverlay.vue` shows save/discard UI when `chars.isDirty` is true. `StickyBar.vue` hosts the save button and back navigation.

## Developer Workflows

```bash
npm run dev          # Vite dev server
npm run build        # Type-check (vue-tsc) + build
npm run type-check   # vue-tsc only
```

No test suite. Type-check is the only automated validation — always run after structural changes.

## Key Files to Reference

- Adding an attribute or computed stat → `src/stores/model.ts` (`field()` / `computed()`)
- Changing `CharacterData` schema → `src/model/character.ts` + bump `MODEL_VERSION`
- New character preset/race → `PREBUILDS` array in `src/model/character.ts`
- PDF character sheet layout → `src/lib/typstExport.ts` (Typst markup generated as a string)
- Import/export validation → `src/model/importExport.ts`
