import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";

type BoundAttribute =
  | "ST"
  | "DX"
  | "IQ"
  | "HT"
  | "HP"
  | "Will"
  | "Per"
  | "FP"
  | "BasicMove"
  | "Magic";

type SkillHardness = 0 | 1 | 2 | 3 | 4 | 5; // easy, average, hard, very hard, extreme, impossible

interface SkillDefinition {
  name: string;
  boundAttribute: BoundAttribute | BoundAttribute[];
  hardness: SkillHardness;
  currentLevel: number;
  active: boolean;
}

interface TraitDefinition {
  name: string;
  cp: number; // positive = Vorteil cost, negative = Nachteil (refund)
}

const CP_PER_LEVEL = 15;

export const useModelStore = defineStore("model", () => {
  // Primary attributes (stored as absolute values, base = 10)
  const st = useLocalStorage("ST", 10);
  const dx = useLocalStorage("DX", 10);
  const iq = useLocalStorage("IQ", 10);
  const ht = useLocalStorage("HT", 10);

  // Secondary attributes (stored as deltas; base derived from primary attributes)
  const hpAdd = useLocalStorage("HPAdd", 0);
  const hp = computed(() => Math.round(st.value * 1.5) + hpAdd.value);

  const willAdd = useLocalStorage("WillAdd", 0);
  const will = computed(() => iq.value + willAdd.value);

  const perAdd = useLocalStorage("PerAdd", 0);
  const per = computed(() => iq.value + perAdd.value);

  const fpAdd = useLocalStorage("FPAdd", 0);
  const fp = computed(() => ht.value + fpAdd.value);

  const basicMoveAdd = useLocalStorage("BasicMoveAdd", 0);
  const basicMove = computed(
    () => Math.floor((ht.value + dx.value) / 4) + basicMoveAdd.value,
  );

  const magicAdd = useLocalStorage("MagicAdd", 0);
  const magic = computed(() => Math.floor(iq.value * 0.65) + magicAdd.value);

  const skills = useLocalStorage<SkillDefinition[]>("skills", []);
  const traits = useLocalStorage<TraitDefinition[]>("traits", []);
  const modelVersion = useLocalStorage("modelVersion", 0);

  const level = useLocalStorage("level", 1);

  const availableCp = computed(() => 200 + (level.value - 1) * CP_PER_LEVEL);

  const usedCp = computed(() => {
    let total = 0;

    // Primary attributes (15 or 25 CP per level, relative to base 10)
    total += (st.value - 10) * 15;
    total += (dx.value - 10) * 25;
    total += (iq.value - 10) * 25;
    total += (ht.value - 10) * 15;

    // Secondary attribute adjustments (cost per point of delta)
    total += hpAdd.value * 2;
    total += willAdd.value * 5;
    total += perAdd.value * 5;
    total += fpAdd.value * 3;
    total += basicMoveAdd.value * 5;
    total += magicAdd.value * 10;

    // Traits (Vor- und Nachteile)
    for (const trait of traits.value) {
      total += trait.cp;
    }

    // Skills
    for (const skill of skills.value) {
      if (skill.currentLevel === 0) {
        continue; // skip untrained skills
      }

      const cost = targetLevelCost(skill, skill.currentLevel, 8);
      if (cost !== null) {
        total += cost;
      }
    }

    return total;
  });

  function migrate() {
    if (modelVersion.value < 1) {
      modelVersion.value = 1;

      // initialize skills
      skills.value = [
        // fighting skills
        {
          name: "Nahkampf (leicht)",
          boundAttribute: "DX",
          hardness: 1,
          currentLevel: 0,
          active: false,
        },
        {
          name: "Nahkampf (schwer)",
          boundAttribute: "ST",
          hardness: 2,
          currentLevel: 0,
          active: false,
        },
        {
          name: "Unbewaffneter Kampf",
          boundAttribute: "HT",
          hardness: 2,
          currentLevel: 0,
          active: false,
        },
        {
          name: "Fernkampf",
          boundAttribute: "DX",
          hardness: 1,
          currentLevel: 0,
          active: false,
        },

        // body skills
        {
          name: "Athletik",
          boundAttribute: "ST",
          hardness: 1,
          currentLevel: 0,
          active: false,
        },
        {
          name: "Akrobatik",
          boundAttribute: ["HT", "DX"],
          hardness: 2,
          currentLevel: 0,
          active: false,
        },
        {
          name: "Heimlichkeit",
          boundAttribute: "DX",
          hardness: 1,
          currentLevel: 0,
          active: false,
        },
        {
          name: "Fingerfertigkeit",
          boundAttribute: "DX",
          hardness: 2,
          currentLevel: 0,
          active: false,
        },
        {
          name: "Überleben",
          boundAttribute: "HT",
          hardness: 1,
          currentLevel: 0,
          active: false,
        },
        {
          name: "Handwerk",
          boundAttribute: ["ST", "IQ"],
          hardness: 1,
          currentLevel: 0,
          active: false,
        },

        // mental skills

        {
          name: "Wissen und Schriften",
          boundAttribute: "IQ",
          hardness: 1,
          currentLevel: 0,
          active: false,
        },
        {
          name: "Naturkunde",
          boundAttribute: "IQ",
          hardness: 1,
          currentLevel: 0,
          active: false,
        },
        {
          name: "Heikunde",
          boundAttribute: "IQ",
          hardness: 2,
          currentLevel: 0,
          active: false,
        },
        {
          name: "Mechanik",
          boundAttribute: ["IQ", "ST"],
          hardness: 1,
          currentLevel: 0,
          active: false,
        },

        // social skills

        {
          name: "Überreden",
          boundAttribute: "HT",
          hardness: 1,
          currentLevel: 0,
          active: false,
        },
        {
          name: "Täuschung",
          boundAttribute: "IQ",
          hardness: 1,
          currentLevel: 0,
          active: false,
        },
        {
          name: "Einschüchtern",
          boundAttribute: "ST",
          hardness: 1,
          currentLevel: 0,
          active: false,
        },
        {
          name: "Kreaturenkenntnis",
          boundAttribute: "Per",
          hardness: 1,
          currentLevel: 0,
          active: false,
        },
      ];
    }
  }

  function attributeValue(attribute: BoundAttribute): number {
    switch (attribute) {
      case "ST":
        return st.value;
      case "DX":
        return dx.value;
      case "IQ":
        return iq.value;
      case "HT":
        return ht.value;
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

  function capHardness(hardness: number): SkillHardness {
    if (hardness < 0) {
      return 0;
    } else if (hardness > 5) {
      return 5;
    } else {
      return hardness as SkillHardness;
    }
  }

  function getEffectiveLevel(
    skill: SkillDefinition,
    targetLevel: number,
  ): SkillHardness {
    const attribute = Array.isArray(skill.boundAttribute)
      ? Math.max(...skill.boundAttribute.map(attributeValue))
      : attributeValue(skill.boundAttribute);

    targetLevel = targetLevel;

    if (targetLevel <= 8) {
      targetLevel = 8;
    }

    const diff = targetLevel - attribute;

    if (diff > 4) {
      return capHardness(skill.hardness + 5);
    } else if (diff === 4) {
      return capHardness(skill.hardness + 3);
    } else if (diff === 3) {
      return capHardness(skill.hardness + 2);
    } else if (diff === 2) {
      return capHardness(skill.hardness + 1);
    } else if (diff >= 0 && diff <= 1) {
      return skill.hardness;
    } else if (diff === -1) {
      return capHardness(skill.hardness - 1);
    } else {
      return capHardness(skill.hardness - 2);
    }
  }

  function levelCost(
    skill: SkillDefinition,
    targetLevel: number,
  ): number | null {
    const level = getEffectiveLevel(skill, targetLevel);
    if (targetLevel <= 8) {
      switch (level) {
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
          return null; // impossible
      }
    }

    switch (level) {
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
        return null; // impossible
    }
  }

  function targetLevelCost(
    skill: SkillDefinition,
    targetLevel: number,
    fromLevel: number = 8,
  ): number | null {
    let totalCost = 0;

    for (let level = fromLevel; level <= targetLevel; level++) {
      const cost = levelCost(skill, level);
      if (cost === null) {
        return null; // impossible
      }
      totalCost += cost;
    }

    return totalCost;
  }

  migrate();

  return {
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
