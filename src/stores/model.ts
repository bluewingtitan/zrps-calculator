import { computed } from "vue";
import { defineStore } from "pinia";
import { useCharactersStore } from "./characters";
import type { BoundAttribute, SkillDefinition } from "@/model/character";

export type { BoundAttribute, SkillDefinition };

export const useModelStore = defineStore("model", () => {
  const chars = useCharactersStore();
  const w = computed(() => chars.workingCopy);

  // ── Writable computed proxies into working copy ──────────────────────────
  function field<K extends keyof NonNullable<typeof w.value>>(key: K) {
    return computed({
      get: () => w.value?.[key] as NonNullable<typeof w.value>[K],
      set: (v) => {
        if (w.value) (w.value[key] as NonNullable<typeof w.value>[K]) = v;
      },
    });
  }

  const st = field("st");
  const dx = field("dx");
  const iq = field("iq");
  const ht = field("ht");
  const hpAdd = field("hpAdd");
  const willAdd = field("willAdd");
  const perAdd = field("perAdd");
  const fpAdd = field("fpAdd");
  const basicMoveAdd = field("basicMoveAdd");
  const magicAdd = field("magicAdd");
  const level = field("level");
  const name = field("name");

  const hp = computed(
    () => Math.round((st.value ?? 10) * 1.5) + (hpAdd.value ?? 0),
  );
  const will = computed(() => (iq.value ?? 10) + (willAdd.value ?? 0));
  const per = computed(() => (iq.value ?? 10) + (perAdd.value ?? 0));
  const fp = computed(() => (ht.value ?? 10) + (fpAdd.value ?? 0));
  const basicMove = computed(
    () =>
      Math.floor(((ht.value ?? 10) + (dx.value ?? 10)) / 4) +
      (basicMoveAdd.value ?? 0),
  );
  const magic = computed(
    () => Math.floor((iq.value ?? 10) * 0.65) + (magicAdd.value ?? 0),
  );

  // Collection refs — in-place mutations (push/splice/assignment) are reactive
  const skills = computed(() => w.value?.skills ?? []);
  const traits = computed(() => w.value?.traits ?? []);

  const availableCp = computed(() => 200 + ((level.value ?? 1) - 1) * 15);

  const usedCp = computed(() => {
    if (!w.value) return 0;
    let total = 0;
    total += ((st.value ?? 10) - 10) * 15;
    total += ((dx.value ?? 10) - 10) * 25;
    total += ((iq.value ?? 10) - 10) * 25;
    total += ((ht.value ?? 10) - 10) * 15;
    total += (hpAdd.value ?? 0) * 2;
    total += (willAdd.value ?? 0) * 5;
    total += (perAdd.value ?? 0) * 5;
    total += (fpAdd.value ?? 0) * 3;
    total += (basicMoveAdd.value ?? 0) * 5;
    total += (magicAdd.value ?? 0) * 10;
    for (const trait of traits.value) total += trait.cp ?? 0;
    for (const skill of skills.value) {
      if (skill.currentLevel === 0) continue;
      const cost = targetLevelCost(skill, skill.currentLevel, 8);
      if (cost !== null) total += cost;
    }
    return total;
  });

  // ── Skill cost helpers ────────────────────────────────────────────────────

  function attributeValue(attribute: BoundAttribute): number {
    switch (attribute) {
      case "ST":
        return st.value ?? 10;
      case "DX":
        return dx.value ?? 10;
      case "IQ":
        return iq.value ?? 10;
      case "HT":
        return ht.value ?? 10;
      case "HP":
        return hp.value;
      case "Will":
        return will.value;
      case "Per":
        return per.value;
      case "FP":
        return fp.value;
      case "BasicMove":
        return basicMove.value;
      case "Magic":
        return magic.value;
      default:
        throw new Error(`Unknown attribute: ${attribute}`);
    }
  }

  function capHardness(hardness: number): 0 | 1 | 2 | 3 | 4 | 5 {
    return Math.max(0, Math.min(5, hardness)) as 0 | 1 | 2 | 3 | 4 | 5;
  }

  function getEffectiveLevel(
    skill: SkillDefinition,
    targetLevel: number,
  ): 0 | 1 | 2 | 3 | 4 | 5 {
    const attribute = Array.isArray(skill.boundAttribute)
      ? Math.max(...skill.boundAttribute.map(attributeValue))
      : attributeValue(skill.boundAttribute);
    if (targetLevel <= 8) targetLevel = 8;
    const diff = targetLevel - attribute;
    if (diff > 4) return capHardness(skill.hardness + 5);
    if (diff === 4) return capHardness(skill.hardness + 3);
    if (diff === 3) return capHardness(skill.hardness + 2);
    if (diff === 2) return capHardness(skill.hardness + 1);
    if (diff >= 0 && diff <= 1) return skill.hardness;
    if (diff === -1) return capHardness(skill.hardness - 1);
    return capHardness(skill.hardness - 2);
  }

  function levelCost(
    skill: SkillDefinition,
    targetLevel: number,
  ): number | null {
    const lvl = getEffectiveLevel(skill, targetLevel);
    if (targetLevel <= 8) {
      switch (lvl) {
        case 0:
          return 4;
        case 1:
          return 6;
        case 2:
          return 8;
        case 3:
          return 10;
        case 4:
          return 12;
        case 5:
          return null;
      }
    }
    switch (lvl) {
      case 0:
        return 2;
      case 1:
        return 4;
      case 2:
        return 6;
      case 3:
        return 8;
      case 4:
        return 12;
      case 5:
        return null;
    }
  }

  function targetLevelCost(
    skill: SkillDefinition,
    targetLevel: number,
    fromLevel = 8,
  ): number | null {
    let total = 0;
    for (let l = fromLevel; l <= targetLevel; l++) {
      const cost = levelCost(skill, l);
      if (cost === null) return null;
      total += cost;
    }
    return total;
  }

  return {
    name,
    st,
    dx,
    iq,
    ht,
    hpAdd,
    hp,
    willAdd,
    will,
    perAdd,
    per,
    fpAdd,
    fp,
    basicMoveAdd,
    basicMove,
    magicAdd,
    magic,
    level,
    skills,
    traits,
    availableCp,
    usedCp,
    levelCost,
    targetLevelCost,
  };
});
