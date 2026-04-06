import type { CharacterData } from "./character";

export type ImportResult =
  | { ok: true; data: CharacterData }
  | { ok: false; error: string };

/** Download a character as a .zrps file. */
export function exportCharacterFile(char: CharacterData): void {
  const json = JSON.stringify(char, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  // Sanitize filename: keep letters, digits, dashes, underscores, spaces → replace rest
  const safeName =
    (char.name || "charakter").replace(/[^\w\s-]/g, "").trim() || "charakter";
  a.href = url;
  a.download = `${safeName}.zrps`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Parse and sanity-check a raw value from a .zrps file. Does NOT migrate. */
export function parseCharacterImport(raw: unknown): ImportResult {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return { ok: false, error: "Datei enthält kein Objekt." };
  }
  const d = raw as Record<string, unknown>;

  // Required string fields
  if (typeof d.name !== "string" || d.name.trim() === "") {
    return { ok: false, error: "Feld »name« fehlt oder ist leer." };
  }

  // Required number fields
  for (const key of ["st", "dx", "iq", "ht", "level"] as const) {
    if (typeof d[key] !== "number" || !isFinite(d[key] as number)) {
      return { ok: false, error: `Feld »${key}« fehlt oder ist ungültig.` };
    }
  }

  // Plausibility checks for primary attributes
  for (const key of ["st", "dx", "iq", "ht"] as const) {
    const v = d[key] as number;
    if (v < 1 || v > 30) {
      return {
        ok: false,
        error: `Attribut »${key}« ist außerhalb des gültigen Bereichs (1–30).`,
      };
    }
  }

  // Skills must be an array
  if (!Array.isArray(d.skills)) {
    return { ok: false, error: "Feld »skills« muss ein Array sein." };
  }

  return { ok: true, data: raw as CharacterData };
}

/** Read a File object and resolve with an ImportResult. */
export function readCharacterFile(file: File): Promise<ImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target!.result as string);
        resolve(parseCharacterImport(parsed));
      } catch {
        resolve({ ok: false, error: "Datei ist kein gültiges JSON." });
      }
    };
    reader.onerror = () =>
      resolve({ ok: false, error: "Datei konnte nicht gelesen werden." });
    reader.readAsText(file);
  });
}
