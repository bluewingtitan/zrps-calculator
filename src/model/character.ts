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
  description?: string;
}

export type SpecialAbilityDefinition = TraitDefinition;

// -- CP Entry Presets (shared by Sonderfähigkeiten & Vor-/Nachteile) ---------

export interface CpEntryPreset {
  id: string;
  name: string;
  description: string;
  cp: number;
  tags: string[];
}

/** @deprecated Use CpEntryPreset */
export type SpecialAbilityPreset = CpEntryPreset;

export const SPECIAL_ABILITY_PRESETS: CpEntryPreset[] = [
  // -- Nahkampf --------------------------------------------------------------
  {
    id: "kontrollierter-schlag",
    name: "Kontrollierter Schlag",
    description:
      "Typ: Nahkampfangriff (Aktion)\n\nDie Attacke gilt ab einem Erfolgsgrad von 6 als kritischer Treffer. Bei Fehlschlag erhalten Gegner bis zu deinem nächsten Zug +2 auf Angriffswürfe gegen dich.\n\nVoraussetzung: Nahkampf (leicht/schwer) 10+",
    cp: 5,
    tags: ["Angriffe", "Nahkampf (Leicht)", "Nahkampf (Schwer)", "Aktion"],
  },
  {
    id: "schneller-angriff",
    name: "Schneller Angriff",
    description:
      "Typ: Nahkampfangriff (Aktion)\n\nAngriff mit leichter Waffe. Gegner erhält +1 auf seinen Verteidigungswurf für diesen Angriff.\n\nVoraussetzung: ST 11+ oder DX 11+",
    cp: 5,
    tags: ["Angriffe", "Nahkampf (Leicht)", "Bonusaktion"],
  },
  {
    id: "ausweichen",
    name: "Ausweichen",
    description:
      "Typ: Vorbereitung\n\n Bis zu deinem nächsten Zug geht der erste Angriff gegen dich ins Leere.\n\nVoraussetzung: Nahkampf (leicht/schwer) 10+ oder Akrobatik 10+",
    cp: 8,
    tags: ["Buffs", "Nahkampf (Leicht)", "Nahkampf (Schwer)", "Bonusaktion"],
  },
  {
    id: "niederwerfen",
    name: "Niederwerfen",
    description:
      "Typ: Kombo-Starter\n\n Statt Schaden zu verursachen stößt du das Ziel zu Boden. Ziel macht Test auf DX-4 oder Athletik-3. Bei Fehlschlag liegt das Ziel am Boden.\n\nVoraussetzung: DX 11+ oder Athletik 10+",
    cp: 8,
    tags: [
      "Debuffs",
      "Nahkampf (Leicht)",
      "Nahkampf (Schwer)",
      "Kombo-Starter",
    ],
  },
  {
    id: "entwaffnen",
    name: "Entwaffnen",
    description:
      "Typ: Kombo-Starter\n\n Du versuchst die Waffe oder einen Gegenstand aus der Hand zu schlagen. Ziel macht Test auf ST-3 oder Nahkampf-2 (um 1 erleichtert bei beidhändigem Halten). Bei Fehlschlag fliegt der Gegenstand 1D6 Meter weit weg.\n\nVoraussetzung: DX 11+ und Nahkampf (leicht/schwer) 10+",
    cp: 8,
    tags: [
      "Debuffs",
      "Nahkampf (Leicht)",
      "Nahkampf (Schwer)",
      "Kombo-Starter",
    ],
  },
  {
    id: "abfangen",
    name: "Abfangen",
    description:
      "Typ: Vorbereitung\n\n Du kannst bis zu deinem nächsten Zug einen laufenden Gegner in Nahkampfdistanz abfangen. Der Gegner wird gestoppt, du führst einen normalen Nahkampfangriff gegen ihn aus.\n\nVoraussetzung: Nahkampf (leicht/schwer) 8+",
    cp: 5,
    tags: ["Angriffe", "Nahkampf (Leicht)", "Nahkampf (Schwer)", "Bonusaktion"],
  },
  {
    id: "springrolle",
    name: "Springrolle",
    description:
      "Typ: Reaktion auf Fernangriff\n\n Mache einen Test auf DX. Bei Erfolg nimmst du keinen Schaden. Erhalte bis zu deinem nächsten Zug -2 auf alle Verteidigungswürfe (entfällt bei kritischem Erfolg).\n\nVoraussetzung: DX 10+ oder Akrobatik 10+",
    cp: 5,
    tags: ["Buffs", "Nahkampf (Leicht)", "Nahkampf (Schwer)", "Reaktion"],
  },
  {
    id: "gegenhalten",
    name: "Gegenhalten",
    description:
      "Typ: Reaktion\n\n Statt normal zu verteidigen führst du einen gleichzeitigen Gegenschlag aus. Wettbewerb auf ST/Athletik. Gewinnst du, wird der Angriff gebrochen und dein Schlag trifft. Verlierst du, landet dein Gegner einen kritischen Treffer.\n\nVoraussetzung: ST 12+ oder Athletik 10+",
    cp: 10,
    tags: ["Angriffe", "Nahkampf (Leicht)", "Nahkampf (Schwer)", "Reaktion"],
  },
  {
    id: "nachsetzen",
    name: "Nachsetzen",
    description:
      "Typ: Kombo (Kettenfähigkeit)\n\n Führe sofort einen Nahkampfangriff gegen das Ziel aus. Bei Erfolg erhält das Ziel -1 auf Verteidigungswürfe bis zu seinem nächsten Zug. Verbraucht 1 FP (ignoriert bei kritischem Erfolg).\n\nVoraussetzung: DX 12+ und Nahkampf (leicht/schwer) 10+",
    cp: 12,
    tags: [
      "Angriffe",
      "Debuffs",
      "Nahkampf (Leicht)",
      "Nahkampf (Schwer)",
      "Kombo-Kette",
    ],
  },
  {
    id: "haken-schlagen",
    name: "Haken schlagen",
    description:
      "Typ: Kombo-Starter\n\n Nur mit leichter Waffe. Bringe das Ziel mit einem schnellen Schlag aus dem Rhythmus. Ziel macht Test auf DX-2 oder Nahkampf-2. Bei Fehlschlag erhält das Ziel bis zum Ende deines Zuges -2 auf Verteidigungswürfe gegen deine Kettenfähigkeiten.\n\nVoraussetzung: DX 10+ und Nahkampf (leicht) 10+",
    cp: 8,
    tags: ["Debuffs", "Nahkampf (Leicht)", "Kombo-Starter"],
  },
  {
    id: "aufreissen",
    name: "Aufreißen",
    description:
      "Typ: Kombo-Starter\n\n Nur mit schwerer Waffe. Statt Schaden zu verursachen zwingst du das Ziel in eine offene Haltung. Ziel macht Test auf ST-2 oder Athletik-2. Bei Fehlschlag verursachen Treffer bis zum Ende deines Zugs +2 Schaden.\n\nVoraussetzung: ST 11+ und Nahkampf (schwer) 10+",
    cp: 8,
    tags: ["Debuffs", "Nahkampf (Schwer)", "Kombo-Starter"],
  },
  {
    id: "treiben",
    name: "Treiben",
    description:
      "Typ: Kombo-Starter\n\n Statt Schaden zu verursachen drängst du das Ziel vor dir her. Ziel macht Test auf DX-2. Bei Fehlschlag bewegst du es bis zu 5 Meter in eine Richtung deiner Wahl.\n\nVoraussetzung: Athletik 10+",
    cp: 8,
    tags: [
      "Debuffs",
      "Nahkampf (Leicht)",
      "Nahkampf (Schwer)",
      "Kombo-Starter",
    ],
  },
  {
    id: "dranbleiben",
    name: "Dranbleiben",
    description:
      "Typ: Kombo (Kettenfähigkeit)\n\n Bewege dich sofort bis zu 2 Meter um das Ziel herum, dann führe einen normalen Nahkampfangriff aus. Kostet 1 FP.\n\nVoraussetzung: DX 11+ oder Akrobatik 11+",
    cp: 8,
    tags: ["Angriffe", "Nahkampf (Leicht)", "Nahkampf (Schwer)", "Kombo-Kette"],
  },
  {
    id: "aufschlitzen",
    name: "Aufschlitzen",
    description:
      "Typ: Kombo (Kettenfähigkeit)\n\n Nur mit leichten Waffen. Du setzt einen präzisen Schnitt. Führe einen Nahkampfangriff aus. Trifft der Angriff, bringt er das Ziel zum Bluten für bis zu drei Runden (statt Schaden).\n\nVoraussetzung: DX 12+ und Nahkampf (leicht) 10+",
    cp: 12,
    tags: ["Debuffs", "Nahkampf (Leicht)", "Kombo-Kette"],
  },
  {
    id: "herunterdruecken",
    name: "Herunterdrücken",
    description:
      "Typ: Kombo (Kettenfähigkeit)\n\n Nur mit schweren Waffen. Nur gegen Ziele am Boden, an einem Hindernis oder in enger Position. Ziel macht Test auf ST-2 oder Athletik-2. Bei Fehlschlag kann es bis zum Ende seines nächsten Zuges keine Bonusaktion oder Reaktionen einsetzen.\n\nVoraussetzung: ST 12+ und Nahkampf (schwer) 10+",
    cp: 8,
    tags: ["Debuffs", "Nahkampf (Schwer)", "Kombo-Kette"],
  },
  {
    id: "niederschmettern",
    name: "Niederschmettern",
    description:
      "Typ: Kombo (Kettenfähigkeit)\n\n Nur mit schweren Waffen. Führe einen Nahkampfangriff aus. Liegt das Ziel am Boden, ist sein Verteidigungswurf um 1 erschwert. Bei Treffer liegt das Ziel danach am Boden (Liegend). Beendet die aktive Kombo.\n\nVoraussetzung: ST 12+ und Nahkampf (schwer) 10+",
    cp: 15,
    tags: ["Angriffe", "Debuffs", "Nahkampf (Schwer)", "Kombo-Kette"],
  },
  {
    id: "abschneiden",
    name: "Abschneiden",
    description:
      "Typ: Kombo (Kettenfähigkeit)\n\n Du zwingst das Ziel in eine schlechte Bewegungsroute. Bis zum Ende deines nächsten Zuges kann sich das Ziel nicht an dir vorbei bewegen ohne einen Test auf DX-2. Bei Fehlschlag endet die Bewegung sofort.\n\nVoraussetzung: DX 12+ und Wahrnehmung 12+",
    cp: 8,
    tags: ["Debuffs", "Nahkampf (Leicht)", "Nahkampf (Schwer)", "Kombo-Kette"],
  },
  {
    id: "ueberladen",
    name: "Überladen",
    description:
      "Typ: Kombo (Kettenfähigkeit)\n\n Beende die aktive Kombo. Zahle 1 FP. Bestehe einen Test auf HT: Erhalte für diesen Zug eine zusätzliche Aktion.\n\nVoraussetzung: HT 12+",
    cp: 8,
    tags: ["Buffs", "Nahkampf (Leicht)", "Nahkampf (Schwer)", "Kombo-Kette"],
  },

  // -- Fernkampf -------------------------------------------------------------
  {
    id: "gezielter-schuss",
    name: "Gezielter Schuss",
    description:
      "Typ: Fernkampfangriff (Aktion)\n\n Du zielst auf eine konkrete Schwachstelle (Hand, Bein, Seil, Mechanismus, ...). Bei Treffer tritt statt Schaden ein kleiner bis mittlerer Effekt ein (z.B. verlangsamte Bewegung, Licht geht aus). Keine kritischen Verletzungen.\n\nVoraussetzung: Fernkampf 8+ und Wahrnehmung 8+",
    cp: 8,
    tags: ["Angriffe", "Fernkampf", "Aktion"],
  },
  {
    id: "ruhige-hand",
    name: "Ruhige Hand",
    description:
      "Typ: Vorbereitung\n\n Du stabilisierst Atmung, Haltung und Linie. Dein nächster Fernkampfangriff in diesem Zug erhält +2 auf den Angriffswurf.\n\nVoraussetzung: Fernkampf 8+",
    cp: 4,
    tags: ["Buffs", "Fernkampf", "Bonusaktion"],
  },
  {
    id: "deckung",
    name: "Deckung",
    description:
      "Typ: Vorbereitung\n\n Nenne eine Kreatur. Du deckst sie bis zu deinem nächsten Zug. Wird sie im Nahkampf angegriffen, führst du gegen den Angreifer einen Fernkampfangriff aus. Triffst du, schlägt der ursprüngliche Angriff fehl.\n\nVoraussetzung: Fernkampf 10+",
    cp: 6,
    tags: ["Support", "Fernkampf", "Bonusaktion"],
  },
  {
    id: "festnageln",
    name: "Festnageln",
    description:
      "Typ: Fernkampfangriff (Aktion)\n\n Bei erfolgreichem Angriff kann das Ziel in seinem nächsten Zug keine Bonusaktion für Bewegung verwenden und erhält -1 auf alle Angriffswürfe in diesem Zug.\n\nVoraussetzung: Fernkampf 10+",
    cp: 8,
    tags: ["Debuffs", "Fernkampf", "Aktion"],
  },
  {
    id: "drohfeuer",
    name: "Drohfeuer",
    description:
      "Typ: Vorbereitung\n\n Wähle einen Korridor, Ausgang oder Fensterbereich in Reichweite. Bis zu deinem nächsten Zug kannst du gegen die ersten zwei Ziele, die sich in den Bereich bewegen, einen Fernkampfangriff ausführen. Angriffswurf um 1 erleichtert.\n\nVoraussetzung: Fernkampf 9+",
    cp: 10,
    tags: ["Angriffe", "Fernkampf", "Bonusaktion"],
  },
  {
    id: "rueckwaertsschritt",
    name: "Rückwärtsschritt",
    description:
      "Typ: Reaktion auf Nahkampfangriff\n\n Du weichst leicht zurück. Der Angriffswurf ist um 2 erschwert.\n\nVoraussetzung: DX 10+ und Fernkampf 8+",
    cp: 5,
    tags: ["Buffs", "Fernkampf", "Reaktion"],
  },
  {
    id: "schneller-schuss",
    name: "Schneller Schuss",
    description:
      "Typ: Fernkampfangriff (Bonusaktion)\n\n Schneller, unsauberer Schuss aus der Bewegung. Erhält -2 auf den Angriffswurf und kann keinen Gezielten Schuss oder andere Spezialschüsse auslösen.\n\nVoraussetzung: DX 11+ und Fernkampf 10+",
    cp: 8,
    tags: ["Angriffe", "Fernkampf", "Bonusaktion"],
  },
  {
    id: "wechselschritt",
    name: "Wechselschritt",
    description:
      "Typ: Vorbereitung\n\n Bewege dich bis zu 10 Meter und suche eine bessere Schussbahn. Erhalte für diese Runde +1 auf deinen nächsten Angriffswurf.\n\nVoraussetzung: DX 10+ und Fernkampf 8+",
    cp: 5,
    tags: ["Buffs", "Fernkampf", "Bonusaktion"],
  },
  {
    id: "markieren",
    name: "Markieren",
    description:
      "Typ: Vorbereitung\n\n Test auf Wahrnehmung. Bei Erfolg erhältst du +2 auf Angriffswürfe gegen das markierte Ziel, bis du ein neues Ziel wählst oder angegriffen wirst.\n\nVoraussetzung: Wahrnehmung 10+ und Fernkampf 10+",
    cp: 8,
    tags: ["Buffs", "Fernkampf", "Bonusaktion"],
  },

  // -- Talente ---------------------------------------------------------------
  {
    id: "tierfluesterer",
    name: "Tierflüsterer",
    description:
      "Typ: Aktion\n\nDu kannst mit Tieren in einfachen Bildern, Impulsen und Gefühlen kommunizieren - Hunger, Gefahr, Richtung, Personen-Eindruck, Revier. Test auf Naturkunde.\n\nVoraussetzung: Naturkunde 9+",
    cp: 6,
    tags: ["Talente", "Aktion"],
  },
  {
    id: "totenlauscher",
    name: "Totenlauscher",
    description:
      "Typ: Aktion\n\nDu kannst die letzten emotional aufgeladenen Nachklänge eines Toten wahrnehmen: Echo, Erinnerungssplitter, letzte Eindrücke. Test auf Wahrnehmung oder Kreaturenkenntnis.\n\nVoraussetzung: Kreaturenkenntnis 9+ oder Wahrnehmung 10+",
    cp: 6,
    tags: ["Talente", "Aktion"],
  },
  {
    id: "gedankenstoss",
    name: "Gedankenstoß",
    description:
      "Typ: Aktion\n\nDu sendest einem sichtbaren Ziel in Reichweite einen kurzen Gedanken, ein Wort, ein Bild oder ein Gefühl. Als Bonusaktion: Wort oder Gefühl. Als Aktion: Satz oder Bild. Test auf Willenskraft.\n\nVoraussetzung: Willenskraft 10+",
    cp: 8,
    tags: ["Talente", "Aktion", "Bonusaktion"],
  },
  {
    id: "gedankenhorcher",
    name: "Gedankenhorcher",
    description:
      "Typ: Aktion\n\nDu erfasst kurz die Oberflächengedanken eines Ziels: unmittelbare Absicht, akute Sorge, aktuelle Lüge, nächster Impuls. Test auf Wahrnehmung.\n\nVoraussetzung: Wahrnehmung 8+",
    cp: 8,
    tags: ["Talente", "Aktion"],
  },
  {
    id: "vielzuengler",
    name: "Vielzüngler",
    description:
      "Typ: Aktion\n\nDu kannst unbekannte Sprachen und Zeichensysteme schnell einordnen. Mit Konzentration kannst du einfache Aussagen verstehen (Test IQ) oder dich grob verständlich machen (Test IQ-2).\n\nVoraussetzung: IQ 12+",
    cp: 4,
    tags: ["Talente", "Aktion"],
  },
  {
    id: "stimmenraeuber",
    name: "Stimmenräuber",
    description:
      "Typ: Aktion\n\nNach kurzem Zuhören kannst du Stimme, Sprechmelodie und Betonung einer Person verblüffend gut imitieren. Test auf Täuschung.\n\nVoraussetzung: Täuschung 8+",
    cp: 4,
    tags: ["Talente", "Aktion"],
  },
  {
    id: "geruchsgedaechtnis",
    name: "Geruchsgedächtnis",
    description:
      "Typ: Aktion\n\nDu kannst Personen, Orte, Gifte, Monster und Stoffe über Gerüche extrem präzise wiedererkennen. Du speicherst Geruchsidentitäten und kannst sie später zuordnen. Test auf Wahrnehmung. Erschwert durch Wind, Regen, Umgebungsgeruch.\n\nVoraussetzung: Wahrnehmung 8+",
    cp: 4,
    tags: ["Talente", "Aktion"],
  },
  {
    id: "traumgaenger",
    name: "Traumgänger",
    description:
      "Typ: Vorbereitung (vor Schlaf)\n\n Während des Schlafs kannst du bei einem bekannten Ziel oder aufgeladenem Ort in einen gemeinsamen Traumkontakt geraten. Dort kannst du Bilder austauschen, Warnungen senden oder Hinweise erhalten.\n\nVoraussetzung: Willenskraft 10+",
    cp: 6,
    tags: ["Talente", "Aktion"],
  },
  {
    id: "schwarmfreund",
    name: "Schwarmfreund",
    description:
      "Typ: Aktion\n\nDu kannst kleine Schwärme oder Gruppen einfacher Kreaturen beruhigen oder kurz beeinflussen: Vögel, Ratten, Insekten, Fledermäuse. Lenken, positionieren, aufscheuchen oder fernhalten. Test auf Naturkunde.\n\nVoraussetzung: Naturkunde 10+",
    cp: 6,
    tags: ["Talente", "Aktion"],
  },
  {
    id: "namenkenner",
    name: "Namenkenner",
    description:
      "Typ: Aktion\n\nSobald du den Namen einer Kreatur kennst, sind Aktionen dieser Kreatur gegen dich, die keine Angriffe sind, um 2 erschwert. Namen sind Macht.\n\nVoraussetzung: Willenskraft",
    cp: 8,
    tags: ["Talente", "Aktion"],
  },

  // -- Zamonische Magie ------------------------------------------------------
  {
    id: "feuerball",
    name: "Feuerball",
    description:
      "Typ: Magischer Angriff (Aktion)\n\nErschaffe einen Feuerball auf einem Ziel in maximal 20m Entfernung. 1D6 Schaden, kritische Treffer verursachen zusätzlich für zwei Runden Brennen. (1 Zamomin)\n\nVoraussetzung: Magie 10+",
    cp: 5,
    tags: ["Magie", "Angriffe", "Fernkampf", "Aktion"],
  },
  {
    id: "illusion",
    name: "Illusion",
    description:
      "Typ: Aktion\n\nErschaffe vor dem inneren Auge ausgewählter Personen in einem Radius von 10m eine optische Illusion (max. 1m³). Sie verschwindet nach 10 Zügen. (1 Zamomin)\n\nVoraussetzung: Magie 10+",
    cp: 5,
    tags: ["Magie", "Talente", "Aktion"],
  },
  {
    id: "klingenfunke",
    name: "Klingenfunke",
    description:
      "Typ: Vorbereitung\n\n Du lädst deine Waffe mit instabilem Zamomin auf. Dein nächster Nahkampfangriff verursacht bei Treffer zusätzlich 2 magischen Schaden oder einen kleinen Zusatzeffekt: Funkenflug (keine Reaktion), Glimmen (-1 Verteidigung) oder Stoß (1m verschoben). (1 Zamomin)\n\nVoraussetzung: Magie 10+ und Nahkampf (leicht/schwer) 8+",
    cp: 5,
    tags: [
      "Magie",
      "Buffs",
      "Nahkampf (Leicht)",
      "Nahkampf (Schwer)",
      "Bonusaktion",
    ],
  },
  {
    id: "spindelstoss",
    name: "Spindelstoß",
    description:
      "Typ: Kombo-Starter\n\n Sende einen magischen Impuls in den Körper des Ziels. Ziel macht Test auf Athletik-2. Bei Fehlschlag ist das Ziel bis zum Ende deines nächsten Zuges magisch gestört: magischer Schaden verdoppelt und -1 auf Verteidigungswürfe gegen deine Kettenfähigkeiten. (2 Zamomin)\n\nVoraussetzung: Magie 10+ und ST 11+",
    cp: 8,
    tags: [
      "Magie",
      "Debuffs",
      "Nahkampf (Leicht)",
      "Nahkampf (Schwer)",
      "Kombo-Starter",
    ],
  },
  {
    id: "rueckschlagswelle",
    name: "Rückschlagswelle",
    description:
      "Typ: Kombo (Kettenfähigkeit)\n\n Entlade eine elementare Welle auf das Kombo-Ziel. Das Ziel wird 2 Meter zurück gestoßen und erhält 1D4-1 magischen Schaden. (2 Zamomin)\n\nVoraussetzung: Magie 10+ und Nahkampf (leicht/schwer) 10+",
    cp: 8,
    tags: [
      "Magie",
      "Angriffe",
      "Nahkampf (Leicht)",
      "Nahkampf (Schwer)",
      "Kombo-Kette",
    ],
  },
  {
    id: "zamominwolke",
    name: "Zamominwolke",
    description:
      "Typ: Reaktion auf Nahkampfangriff\n\nMache Test auf Magie. Bei Erfolg erhält der Angreifer -2 auf den Angriffswurf und 2 magischen Schaden bei Fehlschlag. (1 Zamomin)\n\nVoraussetzung: Magie 12+",
    cp: 10,
    tags: [
      "Magie",
      "Debuffs",
      "Nahkampf (Leicht)",
      "Nahkampf (Schwer)",
      "Reaktion",
    ],
  },
  {
    id: "magischer-schuss",
    name: "Magischer Schuss",
    description:
      "Typ: Vorbereitung\n\n Du lädst ein Projektil oder eine Wurfwaffe mit Zamomin auf. Dein nächster Fernkampfangriff in diesem Zug verursacht zusätzlich 2 magischen Schaden. (1 Zamomin)\n\nVoraussetzung: Magie 10+ und Fernkampf 8+",
    cp: 5,
    tags: ["Magie", "Buffs", "Fernkampf", "Bonusaktion"],
  },
  {
    id: "flammenkapsel",
    name: "Flammenkapsel",
    description:
      "Typ: Fernmagie (Aktion)\n\nDu verschießt eine kleine Zamomin-Kapsel, die beim Aufprall aufflammt. Alle Figuren im Wirkbereich: Test auf DX-2. Bei Fehlschlag 2 Schaden, bei Erfolg 1 Schaden. (2 Zamomin)\n\nVoraussetzung: Magie 11+",
    cp: 8,
    tags: ["Magie", "Angriffe", "Fernkampf", "Aktion"],
  },
  {
    id: "splitterfeld",
    name: "Splitterfeld",
    description:
      "Typ: Fernmagie (Aktion)\n\nErzeuge an einem Punkt in Sichtweite ein Feld aus schwebenden Zamomin-Splittern bis zu deinem nächsten Zug. Kreaturen die es betreten oder darin beginnen: Test auf HT. Nicht bestanden: 1 FP Verlust, kann bis zum nächsten Zug nicht laufen. (4 Zamomin)\n\nVoraussetzung: Magie 11+",
    cp: 8,
    tags: ["Magie", "Debuffs", "Fernkampf", "Aktion"],
  },
  {
    id: "suchender-pfeil",
    name: "Suchender Pfeil",
    description:
      "Typ: Fernkampfangriff (Aktion)\n\n Du biegst die Flugbahn eines Projektils durch Zamomin. Erhält +2 auf den Angriffswurf (+3, falls das Ziel sich seit deinem letzten Zug nicht mehr als 2m bewegt hat). (2 Zamomin)\n\nVoraussetzung: Magie 12+ und Fernkampf 10+",
    cp: 6,
    tags: ["Magie", "Angriffe", "Fernkampf", "Aktion"],
  },
  {
    id: "zamominstuetze",
    name: "Zamominstütze",
    description:
      "Typ: Supportmagie (Bonusaktion)\n\nEin Ziel in Berührungsdistanz oder kurzer Reichweite erhält: 1W4 LP zurück, oder 2 FP zurück, oder wird von einem anhaltenden Zustand befreit, oder erhält eine Stabilisierung in der Bewusstlosigkeit. (2 Zamomin)\n\nVoraussetzung: Magie 10+",
    cp: 8,
    tags: ["Magie", "Support", "Buffs", "Bonusaktion"],
  },
  {
    id: "anfachen",
    name: "Anfachen",
    description:
      "Typ: Supportmagie (Bonusaktion)\n\nEin Ziel in kurzer Reichweite erhält bis zum Ende seines nächsten Zuges: +1 auf alle Angriffswürfe, oder +2 auf den nächsten Verteidigungswurf, oder +2 auf den nächsten Kraft-/Bewegungstest. Ein Ziel kann immer nur von einem Anfachen profitieren. (2 Zamomin)\n\nVoraussetzung: Magie 10+",
    cp: 5,
    tags: ["Magie", "Support", "Buffs", "Bonusaktion"],
  },
  {
    id: "daempfungsfeld",
    name: "Dämpfungsfeld",
    description:
      "Typ: Supportmagie (Aktion)\n\nKreiere ein waberndes Feld (Radius 5m) für zwei Runden. Wähle: Kreaturen im Feld erhalten -3 auf Angriffswürfe, oder: Kreaturen im Feld erhalten +3 auf Verteidigungswürfe. (5 Zamomin)\n\nVoraussetzung: Magie 11+",
    cp: 10,
    tags: ["Magie", "Support", "Buffs", "Debuffs", "Aktion"],
  },
  {
    id: "schweben",
    name: "Schweben",
    description:
      "Typ: Supportmagie (Aktion)\n\nDu hebst dich selbst oder ein freiwilliges Ziel leicht vom Boden. Für 1-2 Minuten kann das Ziel in bis zu 2m Höhe in halber Laufgeschwindigkeit schweben, ignoriert Fallschaden und kleinere Abgründe. (2 Zamomin)\n\nVoraussetzung: Magie 10+",
    cp: 8,
    tags: ["Magie", "Buffs", "Aktion"],
  },
  {
    id: "feiner-griff",
    name: "Feiner Griff",
    description:
      "Typ: Magie (Aktion)\n\nDu bewegst einen sichtbaren Gegenstand (handgroß) telekinetisch mit 1m/s. Für 5 Runden unter deiner Kontrolle. Nur ein Gegenstand gleichzeitig. (1 Zamomin)\n\nVoraussetzung: Magie 10+",
    cp: 5,
    tags: ["Magie", "Talente", "Aktion"],
  },
  {
    id: "lichtspiel",
    name: "Lichtspiel",
    description:
      "Typ: Magie (Aktion)\n\nErschaffe eine nicht materielle Lichtkugel. Hält eine Stunde. Kontrolle über Helligkeit (bis helle Tageslichtlampe), Farbe und Größe (bis 10cm Radius). (1 Zamomin)\n\nVoraussetzung: Magie 8+",
    cp: 3,
    tags: ["Magie", "Talente", "Aktion"],
  },
  {
    id: "flimmerpforte",
    name: "Flimmerpforte",
    description:
      "Typ: Magie (Aktion)\n\nErschaffe ein instabiles Portal zwischen zwei Punkten in deinem Sichtfeld. Zu Beginn jedes Zuges: Test auf Magie - bei Fehlschlag fällt das Portal zusammen. Ein kritischer Erfolg überspringt den nächsten Test. (6 Zamomin)\n\nVoraussetzung: Magie 13+",
    cp: 12,
    tags: ["Magie", "Talente", "Aktion"],
  },
];

export const TRAITS_PRESETS: CpEntryPreset[] = [
  // ── Vorteile ──────────────────────────────────────────────────────────────
  {
    id: "zamominspindel",
    name: "Zamominspindel",
    description:
      "Du erhältst eine Starterspindel (Kapazität 16, Luft- oder Blutspindel). Siehe Regeln zu Zamonischer Magie.",
    cp: 10,
    tags: ["Vorteil", "Meta"],
  },
  {
    id: "ruestung",
    name: "Rüstung",
    description:
      "Dein Character trägt eine normale Rüstung. +1 auf alle Verteidigungswürfe. Kann nicht gemeinsam mit Schwere Rüstung gewählt werden.",
    cp: 10,
    tags: ["Vorteil", "Körperlich"],
  },
  {
    id: "schwere-ruestung",
    name: "Schwere Rüstung",
    description:
      "Dein Character trägt eine schwere Rüstung. -1 auf alle Tests auf DX und DX-basierte Skills, dafür +2 auf alle Verteidigungswürfe. Kann nicht gemeinsam mit Rüstung gewählt werden.",
    cp: 10,
    tags: ["Vorteil", "Körperlich"],
  },
  {
    id: "beidhaendigkeit",
    name: "Beidhändigkeit",
    description:
      "Der Character hat keine starke und schwache Hand, damit auch keine Debuffs einer schwachen Hand. Kann außerdem zweiwaffig kämpfen.",
    cp: 10,
    tags: ["Vorteil", "Körperlich"],
  },
  {
    id: "katze",
    name: "Katze",
    description:
      "Der Character landet immer auf den Füßen. Bei einem Sturz: DX-Check - kein Fallschaden bei Erfolg, halber Fallschaden bei Fehlschlag. Kritischer Fehlschlag: voller Schaden.",
    cp: 10,
    tags: ["Vorteil", "Körperlich"],
  },
  {
    id: "kampfreflexe",
    name: "Kampf Reflexe",
    description:
      "+1 auf alle aktiven Verteidigungen. +2 auf Fright Checks. +6 auf Checks um aus Starre oder Überraschung (mental stun) aufzuwachen.",
    cp: 15,
    tags: ["Vorteil", "Körperlich"],
  },
  {
    id: "daredevil",
    name: "Daredevil",
    description:
      "Immer wenn du (aus Sicht des GMs) ein komplett unnötiges Risiko eingehst, erhältst du +1 auf alle Skill Rolls. Außerdem darfst du alle Checks bei kritischen Fehlschlägen innerhalb dieser Aktion wiederholen.",
    cp: 15,
    tags: ["Vorteil", "Meta"],
  },
  {
    id: "empathie",
    name: "Empathie",
    description:
      "Du kannst bei Charakteren einen IQ-Check machen, um deren Einstellungen einzuschätzen (Loyalität, Pläne, Gefühle gegenüber anderen Charakteren, ...).",
    cp: 15,
    tags: ["Vorteil", "Geistlich"],
  },
  {
    id: "balance",
    name: "Balance",
    description:
      "+6 auf alle Rolls um die Balance zu halten (Seil laufen, rutschiger Untergrund). Im Kampf: +4 auf Checks um auf den Füßen zu bleiben.",
    cp: 15,
    tags: ["Vorteil", "Körperlich"],
  },
  {
    id: "nachtsicht",
    name: "Nachtsicht",
    description:
      "Bessere Sicht in dunklen Umgebungen. (Details noch in Arbeit.) Kosten: 1 CP/Level.",
    cp: 1,
    tags: ["Vorteil", "Körperlich"],
  },
  {
    id: "flexibilitaet",
    name: "Flexibilität",
    description:
      "+3 auf Checks für Klettern und Befreiung aus eigenen Fesseln. Bis zu -3 negative Modifier bei Kämpfen und Aktionen in engen Räumen ignorieren.",
    cp: 5,
    tags: ["Vorteil", "Körperlich"],
  },
  {
    id: "built-different",
    name: "Built different",
    description:
      "Du ignorierst Schmerzen als wären sie nicht da. Immun gegen Schock durch Verletzungen. +3 auf Knockdown- und Stun-Rolls. +3 auf Rolls bei jeder Art von physischem Schmerz (von Tätowierungen bis Folter).",
    cp: 15,
    tags: ["Vorteil", "Körperlich"],
  },
  {
    id: "absolute-direction",
    name: "Absolute Direction",
    description:
      "Du weißt immer, wo Norden ist, und kannst dich an jeden Weg erinnern, den du in den letzten 2 Wochen gegangen bist. Keine Details, aber zuverlässig genug, um den Weg wieder zu finden.",
    cp: 5,
    tags: ["Vorteil", "Geistlich"],
  },
  {
    id: "absolute-timing",
    name: "Absolute Timing",
    description:
      "Du weißt immer, wie viel Uhr es ist - mit höchstens 5 Minuten Abweichung.",
    cp: 2,
    tags: ["Vorteil", "Geistlich"],
  },
  {
    id: "perfect-hearing",
    name: "Perfect Hearing",
    description:
      "+1/Level auf Perception-Checks zum Hören. Kosten: 2 CP/Level.",
    cp: 2,
    tags: ["Vorteil", "Körperlich"],
  },
  {
    id: "perfect-taste-smell",
    name: "Perfect Taste and Smell",
    description:
      "+1/Level auf Perception-Checks zum Schmecken oder Riechen. Kosten: 2 CP/Level.",
    cp: 2,
    tags: ["Vorteil", "Körperlich"],
  },
  {
    id: "perfect-touch",
    name: "Perfect Touch",
    description:
      "+1/Level auf Perception-Checks zum Ertasten (z.B. versteckter Schalter, Abtasten nach Waffen). Kosten: 2 CP/Level.",
    cp: 2,
    tags: ["Vorteil", "Körperlich"],
  },
  {
    id: "perfect-vision",
    name: "Perfect Vision",
    description:
      "+1/Level auf Perception-Checks zum Sehen. Kosten: 2 CP/Level.",
    cp: 2,
    tags: ["Vorteil", "Körperlich"],
  },
  {
    id: "alternate-identity",
    name: "Alternate Identity",
    description:
      "Du hast mehrere legal anerkannte Identitäten inklusive aller Dokumente (Pass, Geburtsurkunde, ...). Eine zusätzliche Identität pro Level. Kosten: 10 CP/Level.",
    cp: 10,
    tags: ["Vorteil", "Meta"],
  },
  {
    id: "charisma",
    name: "Charisma",
    description:
      "Die natürliche Fähigkeit, andere zu beeindrucken und zu leiten. +1 auf Influence Rolls und Public Speaking pro Level. Kosten: 5 CP/Level.",
    cp: 5,
    tags: ["Vorteil", "Geistlich"],
  },
  {
    id: "immerwach",
    name: "Immerwach",
    description:
      "Du musst nie schlafen. Keine negativen Folgen von verpasstem Schlaf.",
    cp: 20,
    tags: ["Vorteil", "Körperlich"],
  },
  {
    id: "eidet",
    name: "Eidet",
    description:
      "Photographisches Gedächtnis. Nur wählbar, wenn der Charakter ein Eidet ist.",
    cp: 10,
    tags: ["Vorteil", "Geistlich"],
  },
];

// -- Character Prebuilds ---------------------------------------------------

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

  level: number;
  daseinsform: string; // race / character type (free text)
  portrait: string | null; // base64 data URL or null
  baseCp: number; // base CP at character creation (campaign-specific)
  cpPerLevel: number; // CP gained per level (campaign-specific)
  skills: SkillDefinition[];
  traits: TraitDefinition[];
  specialAbilities: SpecialAbilityDefinition[];
  wealthLevelKey: string; // key into WEALTH_LEVELS
}

export const MODEL_VERSION = 6;

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
    {
      name: "Magie",
      boundAttribute: "IQ",
      hardness: 2,
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
    level: 1,
    daseinsform: "",
    portrait: null,
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
  if (data.modelVersion < 5) {
    data.modelVersion = 5;
    data.skills.push({
      name: "Magie",
      boundAttribute: "IQ",
      hardness: 2,
      currentLevel: 0,
      active: false,
    });
  }
  if (data.modelVersion < 6) {
    data.modelVersion = 6;
    if (!data.daseinsform) data.daseinsform = "";
    if (data.portrait === undefined) data.portrait = null;
  }
  return data;
}

export function cloneCharacter(data: CharacterData): CharacterData {
  return JSON.parse(JSON.stringify(data));
}
