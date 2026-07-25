// Extrait les campagnes de mode Histoire depuis docs/histoires/<key>.md
// → génère src/story-campaigns.js (const STORY_BY_CHAR = {...}). Valide au passage.
"use strict";
const fs = require("fs");
const path = require("path");

const KEYS = ["volkoi","dorf","cygne","bebe","timonier","sultan","gourou","capitaine","faucon","safran"];
const VALID = new Set([...KEYS, "narrator"]);
const HIST = path.join(__dirname, "..", "docs", "histoires");

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

const byChar = {};
let totalEnc = 0;
for (const key of KEYS) {
  const md = fs.readFileSync(path.join(HIST, key + ".md"), "utf8");
  const arr = toArray(extractJsFences(md));
  // validation
  arr.forEach((c, i) => {
    if (c.left !== key) throw new Error(`${key}[${i}] left=${c.left} ≠ ${key}`);
    if (!VALID.has(c.right)) throw new Error(`${key}[${i}] right invalide: ${c.right}`);
    if (!["volley", "bomb", "flame"].includes(c.mode)) throw new Error(`${key}[${i}] mode invalide: ${c.mode}`);
    if (typeof c.terrain !== "number") throw new Error(`${key}[${i}] terrain non numérique`);
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
  console.log(`${key}: ${arr.length} rencontres OK`);
}
console.log("TOTAL:", totalEnc);

const header = `// sommet-volley · Campagnes du Mode Histoire PAR PERSONNAGE
// GÉNÉRÉ depuis docs/histoires/<key>.md par tools/extract_campaigns.js — ne pas éditer à la main.
// Chaque clé = une campagne (le perso affronte ses 9 rivaux, 3 actes, volley/flamme/bombe/dopage).
"use strict";

const STORY_BY_CHAR = ${JSON.stringify(byChar, null, 2)};
`;
fs.writeFileSync(path.join(__dirname, "..", "src", "story-campaigns.js"), header);
console.log("→ src/story-campaigns.js écrit");
