/**
 * PDF export via Typst compiled in-browser with typst.ts WASM.
 *
 * The compiler WASM (~10 MB) is loaded lazily on first export and cached for
 * subsequent calls.
 */

import { $typst } from "@myriaddreamin/typst.ts/dist/esm/contrib/snippet.mjs";
// Vite resolves `?url` to the hashed public URL of the WASM asset at build time.
import compilerWasmUrl from "@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm?url";

// ── Types ─────────────────────────────────────────────────────────────────

export interface PdfSkill {
  name: string;
  level: number;
}
export interface PdfTrait {
  name: string;
  cp: number;
  description?: string;
}
export interface PdfAbility {
  name: string;
  description?: string;
}
export interface CharacterPdfSnapshot {
  name: string;
  level: number;
  daseinsform?: string; // race / character type
  portrait?: string | null; // base64 data URL
  // Primary attributes
  st: number;
  dx: number;
  iq: number;
  ht: number;
  // Derived attributes
  hp: number;
  will: number;
  per: number;
  fp: number;
  basicMove: number;
  // Optional
  wealthLabel?: string;
  cpUsed: number;
  cpTotal: number;
  skills: PdfSkill[];
  traits: PdfTrait[];
  specialAbilities: PdfAbility[];
}

// ── Init (lazy, cached) ───────────────────────────────────────────────────

let initDone = false;

function ensureInit(): void {
  if (initDone) return;
  initDone = true;
  $typst.setCompilerInitOptions({
    getModule: () => compilerWasmUrl,
  });
}

// ── Typst string escaping ─────────────────────────────────────────────────

/**
 * Escape a value for use inside a Typst double-quoted string literal `"..."`.
 * Only backslash and double-quote need to be escaped inside Typst string
 * literals; newlines are replaced with a space to keep the string on one line.
 */
function ts(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\r?\n/g, " ");
}

/**
 * Escape a value for use inside Typst markup content `[...]`.
 * We escape all characters that start Typst markup constructs.
 */
function tc(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/#/g, "\\#")
    .replace(/\$/g, "\\$")
    .replace(/\*/g, "\\*")
    .replace(/_/g, "\\_")
    .replace(/@/g, "\\@")
    .replace(/`/g, "\\`")
    .replace(/~/g, "\\~")
    .replace(/\r?\n\r?\n+/g, " ") // collapse blank lines (would create ¶ breaks)
    .replace(/\r?\n/g, " "); // remaining newlines → space
}

// ── Typst source builder ──────────────────────────────────────────────────

function buildTypstSource(
  s: CharacterPdfSnapshot,
  portraitPath: string | null,
): string {
  const bew = Math.round(s.basicMove);

  /* ── Typst helpers ─────────────────────────────────────────────────── */

  // Section divider used for skills / traits / abilities (unchanged below)
  const sectionTitle = `#let section-title(t) = {
  set text(8pt, weight: "bold", fill: luma(100))
  upper(t)
  v(-0.25em)
  line(length: 100%, stroke: 0.4pt + luma(200))
  v(0.3em)
}`;

  // Stat bubble: large value, dark label banner pinned to the bottom.
  // v(1fr) spacers inside a fixed-height rect distribute space equally
  // above and below the value, giving true vertical centering.
  // set block(spacing: 0pt) suppresses default inter-block gap between
  // the value area and the label banner.
  const statBubble = `#let stat-bubble(lbl, val) = {
  rect(
    width: 100%, inset: 0pt,
    stroke: 0.65pt + luma(80), radius: 5pt,
  )[
    #set block(spacing: 0pt)
    #rect(width: 100%, height: 3.4em, inset: 0pt, stroke: none)[
      #v(1fr)
      #align(center)[#text(21pt, weight: "bold")[#val]]
      #v(1fr)
    ]
    #rect(
      width: 100%, fill: luma(55), inset: (y: 0.3em),
      radius: (bottom-left: 4pt, bottom-right: 4pt,
               top-left: 0pt, top-right: 0pt),
    )[
      #align(center)[
        #text(7pt, fill: white, weight: "bold")[#upper(lbl)]
      ]
    ]
  ]
}`;

  // Resource block: same outer shape as stat-bubble, split vertically down
  // the middle. Left half shows the max value; right half is blank write-in
  // space. A dark label banner at the bottom ties it to the stat-bubble style.
  const resourceBlock = `#let res-block(lbl, val) = {
  rect(
    width: 100%, inset: 0pt,
    stroke: 0.65pt + luma(80), radius: 5pt,
  )[
    #set block(spacing: 0pt)
    #rect(width: 100%, height: 2.8em, inset: 0pt, stroke: none)[
      #place(left + top, dx: 50%,
        line(angle: 90deg, length: 2.8em, stroke: 0.5pt + luma(180)))
      #v(1fr)
      #pad(left: 50%)[#align(center)[#text(15pt, weight: "bold")[#val]]]
      #v(1fr)
    ]
    #rect(
      width: 100%, fill: luma(55), inset: (y: 0.3em),
      radius: (bottom-left: 4pt, bottom-right: 4pt,
               top-left: 0pt, top-right: 0pt),
    )[
      #align(center)[
        #text(7pt, fill: white, weight: "bold")[#upper(lbl)]
      ]
    ]
  ]
}`;

  // Section box: rounded card with dark header banner at the TOP (mirrors the
  // stat-bubble style but inverted — header on top instead of bottom).
  // Items inside are separated by full-width horizontal rules.
  const sectionBox = `#let section-box(title, body) = {
  rect(
    width: 100%, inset: 0pt,
    stroke: 0.65pt + luma(80), radius: 5pt,
  )[
    #set block(spacing: 0pt)
    #rect(
      width: 100%, fill: luma(55), inset: (y: 0.3em),
      radius: (top-left: 4pt, top-right: 4pt,
               bottom-left: 0pt, bottom-right: 0pt),
    )[
      #align(center)[
        #text(7pt, fill: white, weight: "bold")[#upper(title)]
      ]
    ]
    #body
  ]
}`;

  /* ── Top section ───────────────────────────────────────────────────── */
  // Portrait element: image if available, otherwise placeholder rect.
  const portraitElement = portraitPath
    ? `block(
    width: 5cm, height: 6cm, clip: true,
    image("${portraitPath}", width: 5cm, height: 6cm, fit: "cover"),
  )`
    : `rect(width: 5cm, height: 6cm, stroke: 0.6pt + luma(160))[]`;

  // Daseinsform inline after name: text if set, nothing otherwise.
  const daseinsformInline = s.daseinsform
    ? `\n        h(0.5em)\n        text(10pt, fill: luma(80))[${tc(s.daseinsform)}]`
    : "";

  // Portrait: 5∶7 ratio. At 4 cm wide → 5.6 cm tall.
  // Info column is wrapped in a fixed-height block so #align(horizon) centers
  // the whole group relative to the portrait regardless of content height.
  // All standalone calls inside markup [..] must be prefixed with #.
  const topSection = `// ── Top section ──────────────────────────────────────────────────
#grid(
  columns: (5cm, 1fr),
  gutter: 1em,
  // ── Portrait ──────────────────────────────────────────────────
  ${portraitElement},
  // ── Character info — vertically centered in portrait height ───
  block(height: 5.6cm)[
    #align(horizon)[
      #v(0.5cm)
      // Name, Lvl, and Daseinsform
      #{
        text(11pt, weight: "semibold")[${tc(s.name || "Unbenannt")}, Lvl. ${s.level}]${daseinsformInline}
      }
      #v(0.55em)
      // Movement speed — plain inline label + value, no box
      #{
        text(7pt, weight: "bold", fill: luma(80))[#upper[Bewegung]]
        h(0.5em)
        text(11pt, weight: "bold")[${bew} m/s]
      }
      #v(0.45em)
      // CP counter
      #{
        text(7pt, weight: "bold", fill: luma(80))[#upper[CP]]
        h(0.5em)
        text(11pt, weight: "bold")[${s.cpUsed}]
        text(9pt, fill: luma(140))[\\/${s.cpTotal}]
      }
      #v(1.7cm)
      // Consumable resources — Zamomin is only shown if Magie skill is present
      #grid(
        columns: (${s.skills.some((sk) => sk.name === "Magie") ? "1fr, 1fr, 1fr, 1fr" : "1fr, 1fr, 1fr"}),
        column-gutter: 0.5em,
        res-block("HP", ${s.hp}),
        res-block("FP", ${s.fp}),
        res-block("Glück", 2),${
          s.skills.some((sk) => sk.name === "Magie")
            ? `
        res-block("Zamomin", 16),`
            : ""
        }
      )
    ]
  ],
)`;

  /* ── Attributes module ─────────────────────────────────────────────── */
  // ST, DX, IQ, HT, WIL, PER — large bubbles with dark label banner.
  const attrsModule = `// ── Attributes ───────────────────────────────────────────────────
#v(0.9em)
#grid(
  columns: (1fr, 1fr, 1fr, 1fr, 1fr, 1fr),
  column-gutter: 0.55em,
  stat-bubble("ST",  ${s.st}),
  stat-bubble("DX",  ${s.dx}),
  stat-bubble("IQ",  ${s.iq}),
  stat-bubble("HT",  ${s.ht}),
  stat-bubble("WIL", ${s.will}),
  stat-bubble("WAH", ${s.per}),
)`;

  /* ---------- skills box items --------------------------------------- */
  const skillsItems = s.skills
    .map(
      (sk) =>
        `      #pad(x: 0.5em, y: 0.4em)[#text(weight: "bold")[${tc(sk.name)}]#h(1fr)#text(weight: "bold")[${sk.level}]]`,
    )
    .join("\n      #line(length: 100%, stroke: 0.4pt + luma(210))\n");

  /* ---------- abilities box items ------------------------------------ */
  const abilitiesItems = s.specialAbilities
    .map((a) => {
      const desc = a.description
        ? `#linebreak()#text(8pt, fill: luma(120))[${tc(a.description)}]`
        : "";
      return `      #pad(x: 0.5em, y: 0.4em)[#text(weight: "bold")[${tc(a.name)}]${desc}]`;
    })
    .join("\n      #line(length: 100%, stroke: 0.4pt + luma(210))\n");

  /* ---------- traits box items --------------------------------------- */
  const traitsItems = s.traits
    .map((t) => {
      const desc = t.description
        ? `#linebreak()#text(8pt, fill: luma(120))[${tc(t.description)}]`
        : "";
      return `      #pad(x: 0.5em, y: 0.4em)[#text(weight: "bold")[${tc(t.name)}]${desc}]`;
    })
    .join("\n      #line(length: 100%, stroke: 0.4pt + luma(210))\n");

  /* ---------- bottom two-column layout ------------------------------ */
  // Left: empty Inventory card filling the height of the right column.
  // Right: Skills → Sonderfähigkeiten → Vor- & Nachteile stacked vertically.
  const bottomLayout = `// ── Bottom layout ─────────────────────────────────────────────────
#v(0.9em)
#grid(
  columns: (1fr, 1fr),
  gutter: 0.7em,
  // ── Inventory (fills height of right column) ──────────────────
  rect(
    width: 100%, inset: 0pt,
    stroke: 0.65pt + luma(80), radius: 5pt,
  )[
    #set block(spacing: 0pt)
    #rect(
      width: 100%, fill: luma(55), inset: (y: 0.3em),
      radius: (top-left: 4pt, top-right: 4pt,
               bottom-left: 0pt, bottom-right: 0pt),
    )[
      #align(center)[#text(7pt, fill: white, weight: "bold")[INVENTAR]]
    ]
    #v(9cm)
  ],
  // ── Skills + Special Abilities + Traits ───────────────────────
  [
    ${
      s.skills.length > 0
        ? `#section-box("Fertigkeiten")[
      #set block(spacing: 0pt)
${skillsItems}
    ]`
        : ""
    }
    ${s.skills.length > 0 && s.specialAbilities.length > 0 ? "#v(0.7em)" : ""}
    ${
      s.specialAbilities.length > 0
        ? `#section-box("Sonderfähigkeiten")[
      #set block(spacing: 0pt)
${abilitiesItems}
    ]`
        : ""
    }
    ${(s.skills.length > 0 || s.specialAbilities.length > 0) && s.traits.length > 0 ? "#v(0.7em)" : ""}
    ${
      s.traits.length > 0
        ? `#section-box("Vor- & Nachteile")[
      #set block(spacing: 0pt)
${traitsItems}
    ]`
        : ""
    }
  ],
)`;

  /* ---------- assemble ---------------------------------------------- */
  return `#set page(
  paper: "a4",
  margin: (x: 2cm, y: 2.5cm),
  footer: context [
    #set text(8pt, fill: luma(160))
    #align(center)[ZRPS Charakterbogen #sym.dot.c "${ts(s.name || "Unbekannt")}" #sym.dot.c Lvl. ${s.level}]
  ],
)
#set text(size: 10pt, lang: "de")
#set par(leading: 0.5em)

${sectionTitle}
${statBubble}
${resourceBlock}
${sectionBox}

${topSection}

${attrsModule}
${bottomLayout}
`;
}

// ── Public API ────────────────────────────────────────────────────────────

/**
 * Compile the given character snapshot to a PDF using Typst WASM and trigger
 * a browser download.
 *
 * The first call will download the ~10 MB compiler WASM; subsequent calls
 * reuse the cached module.
 *
 * @throws if the Typst compilation fails or `$typst.pdf()` returns nothing.
 */
export async function exportCharacterPdf(
  snap: CharacterPdfSnapshot,
): Promise<void> {
  ensureInit();

  // Mount portrait as a virtual file if present
  let portraitPath: string | null = null;
  if (snap.portrait) {
    const match = snap.portrait.match(/^data:image\/(\w+);base64,(.+)$/);
    if (match) {
      const ext = match[1] === "jpeg" ? "jpg" : (match[1] ?? "png");
      portraitPath = `/portrait.${ext}`;
      const binary = atob(match[2]!);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)!;
      }
      await $typst.mapShadow(portraitPath, bytes);
    }
  }

  const source = buildTypstSource(snap, portraitPath);

  // $typst.pdf() returns Promise<Uint8Array | undefined>
  const pdfData: Uint8Array | undefined = await $typst.pdf({
    mainContent: source,
  });

  // Clean up shadow file
  if (portraitPath) {
    await $typst.unmapShadow(portraitPath);
  }

  if (!pdfData || pdfData.byteLength === 0) {
    throw new Error(
      "Typst-Kompilierung fehlgeschlagen. Möglicherweise fehlen Schriftarten oder das WASM-Modul konnte nicht geladen werden.",
    );
  }

  // Cast satisfies strict ArrayBuffer check; at runtime pdfData is a plain Uint8Array.
  const blob = new Blob([pdfData as Uint8Array<ArrayBuffer>], {
    type: "application/pdf",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const safeName =
    (snap.name || "charakter").replace(/[^\w\s-]/g, "").trim() || "charakter";
  a.href = url;
  a.download = `${safeName}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
