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
  return s
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\r?\n/g, " ");
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

function buildTypstSource(s: CharacterPdfSnapshot): string {
  /* ---------- helpers defined inside the document ------------------- */
  const sectionTitle = `#let section-title(t) = {
  set text(8pt, weight: "bold", fill: luma(100))
  upper(t)
  v(-0.25em)
  line(length: 100%, stroke: 0.4pt + luma(200))
  v(0.3em)
}`;

  const attrBox = `#let attr-box(lbl, val) = rect(
  width: 100%, inset: (x: 0.4em, y: 0.35em),
  stroke: 0.5pt + luma(200), radius: 3pt,
)[
  #align(center)[
    #text(7pt, fill: luma(130), weight: "bold")[#upper(lbl)]
    #v(0.1em)
    #text(16pt, weight: "bold")[#val]
  ]
]`;

  /* ---------- header ------------------------------------------------ */
  const header = `#block(
  fill: luma(238), width: 100%,
  inset: (x: 1em, y: 0.65em), radius: 5pt,
)[
  #grid(
    columns: (1fr, auto),
    align: (left + horizon, right + horizon),
    gutter: 1em,
    [#text(20pt, weight: "bold")[${tc(s.name || "Unbenannt")}]],
    stack(dir: ltr, spacing: 0.4em,
      text(9pt, fill: luma(120))[Stufe],
      text(22pt, weight: "bold")[${s.level}],
    ),
  )
]`;

  /* ---------- attributes -------------------------------------------- */
  const attrs = `#section-title("Attribute")
#grid(
  columns: (1fr, 1fr, 1fr, 1fr),
  column-gutter: 0.4em,
  attr-box("ST", ${s.st}),
  attr-box("DX", ${s.dx}),
  attr-box("IQ", ${s.iq}),
  attr-box("HT", ${s.ht}),
)
#v(0.35em)
#grid(
  columns: (1fr, 1fr, 1fr, 1fr, 1fr),
  column-gutter: 0.4em,
  attr-box("LP", ${s.hp}),
  attr-box("WIL", ${s.will}),
  attr-box("WAH", ${s.per}),
  attr-box("AU", ${s.fp}),
  attr-box("BEW", ${Math.round(s.basicMove)}),
)`;

  /* ---------- wealth ------------------------------------------------- */
  const wealthSection =
    s.wealthLabel
      ? `#v(0.7em)
#section-title("Wohlstand")
#text(11pt, weight: "bold")[${tc(s.wealthLabel)}]`
      : "";

  /* ---------- skills ------------------------------------------------- */
  let skillsSection = "";
  if (s.skills.length > 0) {
    const rows = s.skills
      .map((sk) => `  [${tc(sk.name)}], [#align(right, text(weight: "bold")[${sk.level}])],`)
      .join("\n");
    skillsSection = `#v(0.7em)
#section-title("Fertigkeiten")
#table(
  columns: (1fr, auto),
  stroke: none,
  inset: (x: 0.4em, y: 0.35em),
  ..range(${s.skills.length}).map(i =>
    (table.hline(stroke: 0.4pt + luma(210), position: top),)
  ).flatten(),
${rows}
)`;
  }

  /* ---------- traits ------------------------------------------------- */
  let traitsSection = "";
  if (s.traits.length > 0) {
    const rows = s.traits
      .map((t) => {
        const cpStr = t.cp >= 0 ? `+${t.cp}` : `${t.cp}`;
        const descLine = t.description
          ? `\\ #text(8pt, fill: luma(120))[${tc(t.description)}]`
          : "";
        return `  [${tc(t.name)}${descLine}], [#align(right, text(weight: "bold")[${cpStr}])],`;
      })
      .join("\n");
    traitsSection = `#v(0.7em)
#section-title("Vor- & Nachteile")
#table(
  columns: (1fr, auto),
  stroke: none,
  inset: (x: 0.4em, y: 0.35em),
  ..range(${s.traits.length}).map(i =>
    (table.hline(stroke: 0.4pt + luma(210), position: top),)
  ).flatten(),
${rows}
)`;
  }

  /* ---------- special abilities -------------------------------------- */
  let abilitiesSection = "";
  if (s.specialAbilities.length > 0) {
    const rows = s.specialAbilities
      .map((a) => {
        const descLine = a.description
          ? `\\ #text(8pt, fill: luma(120))[${tc(a.description)}]`
          : "";
        return `  [${tc(a.name)}${descLine}],`;
      })
      .join("\n");
    abilitiesSection = `#v(0.7em)
#section-title("Sonderfähigkeiten")
#table(
  columns: (1fr,),
  stroke: none,
  inset: (x: 0.4em, y: 0.35em),
  ..range(${s.specialAbilities.length}).map(i =>
    (table.hline(stroke: 0.4pt + luma(210), position: top),)
  ).flatten(),
${rows}
)`;
  }

  /* ---------- assemble ---------------------------------------------- */
  return `#set page(
  paper: "a4",
  margin: (x: 2cm, y: 2.5cm),
  footer: context [
    #set text(8pt, fill: luma(160))
    #align(center)[ZRPS Charakterbogen #sym.dot.c "${ts(s.name || "Unbekannt")}" #sym.dot.c Stufe ${s.level}]
  ],
)
#set text(size: 10pt, lang: "de")
#set par(leading: 0.5em)

${sectionTitle}
${attrBox}

${header}

#v(0.7em)
${attrs}
${wealthSection}
${skillsSection}
${traitsSection}
${abilitiesSection}
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
export async function exportCharacterPdf(snap: CharacterPdfSnapshot): Promise<void> {
  ensureInit();

  const source = buildTypstSource(snap);

  // $typst.pdf() returns Promise<Uint8Array | undefined>
  const pdfData: Uint8Array | undefined = await $typst.pdf({ mainContent: source });
  if (!pdfData || pdfData.byteLength === 0) {
    throw new Error(
      "Typst-Kompilierung fehlgeschlagen. Möglicherweise fehlen Schriftarten oder das WASM-Modul konnte nicht geladen werden.",
    );
  }

  // Cast satisfies strict ArrayBuffer check; at runtime pdfData is a plain Uint8Array.
  const blob = new Blob([pdfData as Uint8Array<ArrayBuffer>], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const safeName = (snap.name || "charakter").replace(/[^\w\s-]/g, "").trim() || "charakter";
  a.href = url;
  a.download = `${safeName}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
