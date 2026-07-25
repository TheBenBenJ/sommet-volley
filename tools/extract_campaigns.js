// Extrait les campagnes de mode Histoire depuis docs/histoires/<key>.md
// → génère src/story-campaigns.js (const STORY_BY_CHAR = {...})
// → génère src/story-bios.js (const STORY_BIOS = {...} nation + blurb)
// Valide au passage.
"use strict";
const fs = require("fs");
const path = require("path");

const KEYS = ["volkoi","dorf","cygne","bebe","timonier","sultan","gourou","capitaine","faucon","safran"];
const VALID = new Set([...KEYS, "narrator"]);
const HIST = path.join(__dirname, "..", "docs", "histoires");
const MAP_BY_KEY = {
  volkoi: "Place Écarlate",
  dorf: "Country Club Doré",
  cygne: "Palais Gallard",
  bebe: "Esplanade du Défilé",
  timonier: "Cité du Matin",
  sultan: "Pont des Deux Mondes",
  gourou: "Stade Ashram",
  capitaine: "Grande Forêt",
  faucon: "Citadelle du Levant",
  safran: "Jardin des Roses"
};
const NATION_FALLBACK = {
  volkoi: "Bourassie", dorf: "Doria", cygne: "Gallardie", bebe: "Ryonganie",
  timonier: "Panguo", sultan: "Bosforie", gourou: "Bharatie", capitaine: "Tropicalia",
  faucon: "Levantie", safran: "Ramenie"
};

function extractJsFences(md) {
  const out = [];
  const re = /```js\s*([\s\S]*?)```/g;
  let m;
  while ((m = re.exec(md))) out.push(m[1]);
  return out.join("\n");
}

function toArray(jsText) {
  // vire les lignes de prose markdown éventuelles (>) et le préfixe const STORY_X =
  let t = jsText.replace(/^\s*>.*$/gm, "");
  t = t.replace(/(?:const|let|var)\s+STORY\w*\s*=\s*/g, "");
  t = t.trim();
  // enlève un ; final
  t = t.replace(/;\s*$/, "");
  // s'assure d'un tableau : on regarde le 1er caractère réel (hors commentaires/espaces)
  const firstReal = t.replace(/^(?:\s*\/\/[^\n]*\n)*\s*/, "").charAt(0);
  if (firstReal !== "[") t = "[\n" + t + "\n]";
  // eval sûr (données pures)
  // eslint-disable-next-line no-new-func
  const arr = Function('"use strict";return (' + t + ")")();
  if (!Array.isArray(arr)) throw new Error("pas un tableau");
  return arr;
}

function stripMd(s) {
  return String(s || "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[_~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractNation(md, key) {
  const n1 = md.match(/Nation\s*:\s*\*\*([^*]+)\*\*/i);
  if (n1) return stripMd(n1[1]);
  const title = md.match(/^#\s+(.+)$/m);
  if (title) {
    // "# Le Cygne — cygne · Gallardie"
    let m = title[1].match(/—\s*[a-z0-9_-]+\s*·\s*(.+)$/i);
    if (m) return stripMd(m[1]);
    // "# Le Gourou — gourou (Bharatie)"
    m = title[1].match(/\(([A-ZÀ-Ü][^)]+)\)\s*$/);
    if (m) return stripMd(m[1]);
    // "# Tsar Volkoï — Bourassie"
    m = title[1].match(/—\s*([A-ZÀ-Ü].+)$/);
    if (m && !KEYS.includes(m[1].trim().toLowerCase())) return stripMd(m[1]);
  }
  return NATION_FALLBACK[key] || "";
}

function extractBlurb(md) {
  const parts = md.split(/##\s*Biographie\s*/i);
  if (parts.length < 2) return "";
  const body = parts[1].split(/^##\s+/m)[0];
  const paras = body.split(/\n\s*\n+/).map(p => {
    // ignore blockquotes / meta
    if (/^\s*>/.test(p)) return "";
    return stripMd(p.replace(/^\s*>.*$/gm, ""));
  }).filter(p => p.length > 50);
  let blurb = paras.slice(0, 2).join(" ");
  if (blurb.length > 520) {
    blurb = blurb.slice(0, 517).replace(/\s+\S*$/, "") + "…";
  }
  return blurb;
}

const byChar = {};
const bios = {};
let totalEnc = 0;
for (const key of KEYS) {
  const md = fs.readFileSync(path.join(HIST, key + ".md"), "utf8");
  const arr = toArray(extractJsFences(md));
  // validation
  arr.forEach((c, i) => {
    if (c.left !== key) throw new Error(`${key}[${i}] left=${c.left} ≠ ${key}`);
    if (!VALID.has(c.right)) throw new Error(`${key}[${i}] right invalide: ${c.right}`);
    if (!["volley", "bomb", "flame", "2v2"].includes(c.mode)) throw new Error(`${key}[${i}] mode invalide: ${c.mode}`);
    if (typeof c.terrain !== "number") throw new Error(`${key}[${i}] terrain non numérique`);
    if (c.mode === "2v2") {
      if (!VALID.has(c.ally) || c.ally === key || c.ally === c.right)
        throw new Error(`${key}[${i}] ally invalide: ${c.ally}`);
      if (!VALID.has(c.right2) || c.right2 === key || c.right2 === c.right || c.right2 === c.ally)
        throw new Error(`${key}[${i}] right2 invalide: ${c.right2}`);
    }
    for (const ph of ["pre", "win", "lose"]) {
      if (!Array.isArray(c[ph])) throw new Error(`${key}[${i}] ${ph} absent`);
      c[ph].forEach(l => { if (!VALID.has(l.s)) throw new Error(`${key}[${i}] ${ph} speaker invalide: ${l.s}`); });
    }
  });
  // rivaux uniques et complets (les 9 autres)
  const rivals = arr.map(c => c.right).sort();
  const expected = KEYS.filter(k => k !== key).sort();
  if (JSON.stringify(rivals) !== JSON.stringify(expected))
    throw new Error(`${key}: rivaux ${rivals.join(",")} ≠ attendus ${expected.join(",")}`);
  byChar[key] = arr;
  totalEnc += arr.length;

  const nation = extractNation(md, key);
  const blurb = extractBlurb(md);
  if (!blurb) throw new Error(`${key}: biographie vide`);
  bios[key] = {
    nation,
    map: MAP_BY_KEY[key] || "",
    blurb
  };
  console.log(`${key}: ${arr.length} rencontres OK · ${nation} · blurb ${blurb.length}c`);
}
console.log("TOTAL:", totalEnc);

const campHeader = `// sommet-volley · Campagnes du Mode Histoire PAR PERSONNAGE
// GÉNÉRÉ depuis docs/histoires/<key>.md par tools/extract_campaigns.js — ne pas éditer à la main.
// Chaque clé = une campagne (le perso affronte ses 9 rivaux, 3 actes, volley/2v2/flamme/bombe/dopage).
"use strict";

const STORY_BY_CHAR = ${JSON.stringify(byChar, null, 2)};
`;
fs.writeFileSync(path.join(__dirname, "..", "src", "story-campaigns.js"), campHeader);
console.log("→ src/story-campaigns.js écrit");

const biosHeader = `// sommet-volley · Bios Mode Histoire (extraits)
// GÉNÉRÉ depuis docs/histoires/<key>.md par tools/extract_campaigns.js — ne pas éditer à la main.
"use strict";

const STORY_BIOS = ${JSON.stringify(bios, null, 2)};
`;
fs.writeFileSync(path.join(__dirname, "..", "src", "story-bios.js"), biosHeader);
console.log("→ src/story-bios.js écrit");
