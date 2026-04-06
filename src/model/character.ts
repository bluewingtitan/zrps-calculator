export type BoundAttribute =
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

export type SkillHardness = 0 | 1 | 2 | 3 | 4 | 5; // easy, average, hard, very hard, extreme, impossible

export interface SkillDefinition {
  name: string;
  boundAttribute: BoundAttribute | BoundAttribute[];
  hardness: SkillHardness;
  currentLevel: number;
  active: boolean;
}

export interface TraitDefinition {
  name: string;
  cp: number; // positive = Vorteil cost, negative = Nachteil (refund)
}

export interface CharacterData {
  id: string;
  name: string;
  modelVersion: number;

  // Primary attributes (absolute values, base = 10)
  st: number;
  dx: number;
  iq: number;
  ht: number;

  // Secondary add-deltas (base is derived from primary)
  hpAdd: number;
  willAdd: number;
  perAdd: number;
  fpAdd: number;
  basicMoveAdd: number;
  magicAdd: number;

  level: number;
  skills: SkillDefinition[];
  traits: TraitDefinition[];
}

export const MODEL_VERSION = 1;

export function defaultSkills(): SkillDefinition[] {
  return [
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

export function defaultCharacter(
  id: string,
  name = "Neuer Charakter",
): CharacterData {
  return {
    id,
    name,
    modelVersion: MODEL_VERSION,
    st: 10,
    dx: 10,
    iq: 10,
    ht: 10,
    hpAdd: 0,
    willAdd: 0,
    perAdd: 0,
    fpAdd: 0,
    basicMoveAdd: 0,
    magicAdd: 0,
    level: 1,
    skills: defaultSkills(),
    traits: [],
  };
}

export function migrateCharacter(data: CharacterData): CharacterData {
  if (data.modelVersion < 1) {
    data.modelVersion = 1;
    if (!data.skills || data.skills.length === 0) {
      data.skills = defaultSkills();
    }
  }
  return data;
}

export function cloneCharacter(data: CharacterData): CharacterData {
  return JSON.parse(JSON.stringify(data));
}
