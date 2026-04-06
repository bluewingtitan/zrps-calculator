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
  /** CP cost locked in at save-time, keyed by level number (8 = initial learn). */
  lockedLevelCosts?: Record<number, number>;
}

export interface TraitDefinition {
  name: string;
  cp: number; // positive = Vorteil cost, negative = Nachteil (refund)
}

export type SpecialAbilityDefinition = TraitDefinition;

// ── Character Prebuilds ───────────────────────────────────────────────────

export interface CharacterPrebuild {
  id: string;
  label: string;
  description: string;
  /**
   * Partial character data applied on top of defaultCharacter() at creation time.
   * May override any field except id, name, and modelVersion.
   * Examples: preset attributes (st, dx, …), skills, traits, wealthLevelKey, baseCp, cpPerLevel, …
   */
  overrides: Partial<Omit<CharacterData, "id" | "name" | "modelVersion">>;
}

export const PREBUILDS: CharacterPrebuild[] = [
  {
    id: "default",
    label: "Mensch",
    description: "Leere Vorlage.",
    overrides: {},
  },
  {
    id: "lindwurm",
    label: "Lindwurm",
    description: "Gelehrter Schreiberling mit Hang zum Übergewicht.",
    overrides: {
      st: 9,
      dx: 9,
      iq: 13,
      ht: 11,
      hpAdd: 4,
      perAdd: 1,
    },
  },
  {
    id: "buntbaer",
    label: "Buntbär",
    description: "Gutmütiger Allrounder.",
    overrides: {
      st: 11,
      dx: 11,
      iq: 10,
      ht: 11,
      hpAdd: 3,
      willAdd: 2,
    },
  },
  {
    id: "eydeet",
    label: "Eydeet",
    description: "Genialer Erfinder mit schwachem Körper.",
    overrides: {
      st: 8,
      dx: 11,
      iq: 14,
      ht: 8,
      hpAdd: 4,
      perAdd: 2,
    },
  },
  {
    id: "wolpertinger",
    label: "Wolpertinger",
    description: "Starker Kämpfer.",
    overrides: {
      st: 13,
      ht: 11,
      hpAdd: 5,
    },
  },
  {
    id: "schreckse",
    label: "Schreckse",
    description: "Zäh. Scharfsinning. Unheimlich.",
    overrides: {
      ht: 11,
      iq: 12,
      willAdd: 2,
      hpAdd: 5,
    },
  },
  {
    id: "fhern",
    label: "Fhernhache",
    description: "Freindlich, verlässlich, bäuerlich.",
    overrides: {
      st: 12,
      dx: 12,
      iq: 9,
      ht: 10,
      fpAdd: 3,
    },
  },
  {
    id: "blutschink",
    label: "Blutschink",
    description: "Haudrauf.",
    overrides: {
      st: 14,
      ht: 11,
      hpAdd: 9,
    },
  },
  {
    id: "berghutze",
    label: "Berghutze",
    description: "Unintelligent, selten, aber stark.",
    overrides: {
      st: 13,
      dx: 11,
      iq: 9,
      ht: 12,
      hpAdd: 6,
      perAdd: 1,
    },
  },
  {
    id: "buchling",
    label: "Buchling",
    description: "Bücherwurm. Auf mehr als eine Art.",
    overrides: {
      st: 8,
      dx: 10,
      iq: 14,
      ht: 11,
      hpAdd: -2,
      willAdd: 2,
      perAdd: 2,
    },
  },
];

export interface WealthLevel {
  key: string;
  label: string;
  cp: number;
  minPyras: number;
  maxPyras: number;
  step: number; // sensible +/- increment for the pyras input
}

export const WEALTH_LEVELS: WealthLevel[] = [
  {
    key: "-3",
    label: "Hoffnungslos verarmt",
    cp: -25,
    minPyras: 0,
    maxPyras: 5,
    step: 1,
  },
  { key: "-2", label: "Verarmt", cp: -15, minPyras: 5, maxPyras: 100, step: 5 },
  {
    key: "-1",
    label: "Schwierig",
    cp: -10,
    minPyras: 100,
    maxPyras: 500,
    step: 50,
  },
  {
    key: "0",
    label: "Durchschnittlich",
    cp: 0,
    minPyras: 500,
    maxPyras: 1_000,
    step: 50,
  },
  {
    key: "1",
    label: "Komfortabel",
    cp: 10,
    minPyras: 1_000,
    maxPyras: 2_000,
    step: 100,
  },
  {
    key: "2",
    label: "Wohlhabend",
    cp: 20,
    minPyras: 2_000,
    maxPyras: 5_000,
    step: 500,
  },
  {
    key: "3",
    label: "Reich",
    cp: 45,
    minPyras: 5_000,
    maxPyras: 20_000,
    step: 1_000,
  },
  {
    key: "4",
    label: "Ekelig reich",
    cp: 70,
    minPyras: 20_000,
    maxPyras: 100_000,
    step: 5_000,
  },
  {
    key: "5.1",
    label: "Abseits jeglicher Moral I",
    cp: 100,
    minPyras: 100_000,
    maxPyras: 1_000_000,
    step: 50_000,
  },
  {
    key: "5.2",
    label: "Abseits jeglicher Moral II",
    cp: 125,
    minPyras: 1_000_000,
    maxPyras: 10_000_000,
    step: 500_000,
  },
  {
    key: "5.3",
    label: "Abseits jeglicher Moral III",
    cp: 150,
    minPyras: 10_000_000,
    maxPyras: 100_000_000,
    step: 5_000_000,
  },
  {
    key: "5.4",
    label: "Abseits jeglicher Moral IV",
    cp: 175,
    minPyras: 100_000_000,
    maxPyras: 1_000_000_000,
    step: 50_000_000,
  },
];

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
  baseCp: number; // base CP at character creation (campaign-specific)
  cpPerLevel: number; // CP gained per level (campaign-specific)
  skills: SkillDefinition[];
  traits: TraitDefinition[];
  specialAbilities: SpecialAbilityDefinition[];
  wealthLevelKey: string; // key into WEALTH_LEVELS
}

export const MODEL_VERSION = 4;

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
    baseCp: 150,
    cpPerLevel: 15,
    skills: defaultSkills(),
    traits: [],
    specialAbilities: [],
    wealthLevelKey: "0",
  };
}

export function migrateCharacter(data: CharacterData): CharacterData {
  if (data.modelVersion < 1) {
    data.modelVersion = 1;
    if (!data.skills || data.skills.length === 0) {
      data.skills = defaultSkills();
    }
  }
  if (data.modelVersion < 2) {
    data.modelVersion = 2;
    if (!data.wealthLevelKey) data.wealthLevelKey = "0";
  }
  if (data.modelVersion < 3) {
    data.modelVersion = 3;
    if (!data.specialAbilities) (data as CharacterData).specialAbilities = [];
  }
  if (data.modelVersion < 4) {
    data.modelVersion = 4;
    if (!(data as CharacterData).baseCp) (data as CharacterData).baseCp = 150;
    if (!(data as CharacterData).cpPerLevel)
      (data as CharacterData).cpPerLevel = 15;
  }
  return data;
}

export function cloneCharacter(data: CharacterData): CharacterData {
  return JSON.parse(JSON.stringify(data));
}
