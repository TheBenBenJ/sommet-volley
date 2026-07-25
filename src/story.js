// sommet-volley · Mode Histoire — « Les Jeux du Sommet »
// -----------------------------------------------------------------------------
// Campagne satirique : une tournée de confrontations entre dirigeants caricaturés,
// rejouant l'histoire des nations, des relations internationales, du sport et des
// Jeux olympiques — sur un terrain de volley. Petites rivalités = mode Volley ;
// tensions qui chauffent = mode Ballon enflammé ; vrais conflits = mode Bombe.
// Au fil des enjeux, certains se « dopent » (mode impitoyable) jusqu'au scandale final.
//
// Tout est DONNÉE (STORY[]) : ajouter un chapitre = ajouter une entrée. Le moteur
// (dialogue, lancement de match, dopage, progression) est générique.
//
// Le joueur pilote TOUJOURS le camp gauche (blobL) — le « protagoniste » du
// chapitre. L'adversaire (blobR) est l'IA. Rien ici ne touche à la simulation
// déterministe : les dialogues/dopage sont des états hors-jeu + overlays de rendu.
"use strict";

// ---------- Utilitaires roster ----------
function storyCharIdx(key) {
  for (let i = 0; i < CHARACTERS.length; i++) if (CHARACTERS[i].key === key) return i;
  return 0;
}
function storyCharName(key) {
  const i = storyCharIdx(key);
  return CHARACTERS[i] ? CHARACTERS[i].name : key;
}

// ---------- La campagne ----------
// Champs d'un chapitre :
//   act        : numéro d'acte (séparateurs du hub)
//   title      : titre du chapitre
//   sub        : sous-titre / thème historique
//   left,right : clés perso (left = joueur, right = adversaire IA principal)
//   ally,right2: (mode "2v2") partenaire IA (blob2L) + 2ᵉ adversaire (blob2R)
//   terrain    : index TERRAINS
//   mode       : "volley" | "flame" | "bomb" | "2v2" (double / alliance)
//   ai         : niveau IA 0..3 (Facile..Impitoyable)
//   doped      : null | "R" (adversaire dopé → impitoyable + aura rouge)
//   pre        : dialogue d'avant-match [{s:cléPerso|"narrator", t:"texte"}]
//   win / lose : dialogue d'après-match selon le résultat du joueur
//
// Campagne « curée » d'origine (Les Jeux du Sommet). Les campagnes PAR PERSONNAGE
// (le protagoniste affronte ses 9 rivaux) vivent dans STORY_BY_CHAR (généré depuis
// docs/histoires/<key>.md → src/story-campaigns.js). `STORY` pointe sur la campagne
// active choisie à l'écran de sélection.
const STORY_SOMMET = [
  // ===================== ACTE I — Petites rivalités (Volley) =====================
  {
    act: 1, title: "La poignée de main à quatre", sub: "Gallardie–Doria vs Ryonganie–Bourassie · double Alliance",
    left: "cygne", right: "bebe", ally: "dorf", right2: "volkoi",
    terrain: 3, mode: "2v2", ai: 0, doped: null,
    pre: [
      { s: "narrator", t: "Jeux du Sommet — premier tour. Sur l'Esplanade du Défilé, ce n'est plus un duel : c'est un 2v2. Le Cygne amène le Baron ; le Maréchal a recruté le Tsar." },
      { s: "cygne", t: "Cher Baron, vous bâtissez des murs, je passe en force. Ensemble, en même temps, ça devrait fonctionner." },
      { s: "dorf", t: "Un partenariat historique ! Le plus grand ! Toi tu parles, moi je construis. On va écraser ce défilé." },
      { s: "bebe", t: "Deux contre deux ! Le Maréchal a le Tsar comme partenaire, et mon radar couvre les DEUX camps ennemis !" },
      { s: "volkoi", t: "Je digue, il défile. Un partenaire bruyant reste un partenaire. Servons, petit." },
      { s: "narrator", t: "Mode double : une équipe, un filet, quatre ambitions." }
    ],
    win: [
      { s: "cygne", t: "Partenariat réussi. Fermeté et flatterie, en même temps. Merci, Baron." },
      { s: "dorf", t: "ÉNORME ! Meilleure alliance du monde ! Le Cygne, pas mauvais — pour un partenaire qui parle en même temps." },
      { s: "bebe", t: "REVANCHE ! Mon partenaire a gelé trop lentement !" },
      { s: "volkoi", t: "Un set. L'hiver, lui, ne joue jamais vraiment en double : il joue seul contre tout le monde." }
    ],
    lose: [
      { s: "bebe", t: "VICTOIRE DU BINÔME ! Le Maréchal et le Tsar ! Gravez nos deux noms dans le granit !" },
      { s: "volkoi", t: "Le gel a deux visages ce soir. Le vôtre a craqué en premier." },
      { s: "cygne", t: "Défaite de binôme. On retient la main, on retend la corde. Ensemble, toujours." },
      { s: "dorf", t: "Truqué ! Mon partenaire élégant parlait trop, pas assez de smashs !" }
    ]
  },
  {
    act: 1, title: "Le toit du monde", sub: "Bharatie–Panguo · crête disputée",
    left: "gourou", right: "timonier", terrain: 6, mode: "volley", ai: 1, doped: null,
    pre: [
      { s: "narrator", t: "Deux géants du continent, des foules immenses de chaque côté, une ligne de crête contestée en toile de fond." },
      { s: "timonier", t: "L'harmonie exige une seule chose : que la ligne passe là où je le décide." },
      { s: "gourou", t: "Namasté. Chez nous, l'endurance est une discipline millénaire. Tu vas courir, ami." },
      { s: "timonier", t: "Je contrôle le tempo. Toujours. Ta démographie ne joue pas au volley pour toi." },
      { s: "gourou", t: "Non. Mais elle regarde. Servons." }
    ],
    win: [
      { s: "gourou", t: "Le calme bat le rempart quand le rempart s'énerve. Bon match, voisin." },
      { s: "timonier", t: "Un revers. Temporaire. L'harmonie corrigera la trajectoire." }
    ],
    lose: [
      { s: "timonier", t: "Le tempo, toujours le tempo. La patience du panda vainc l'agitation." },
      { s: "gourou", t: "On médite, on respire, et on revient. La montagne ne disparaît pas." }
    ]
  },
  {
    act: 1, title: "La porte close", sub: "Bosforie–Gallardie · détroit disputé",
    left: "sultan", right: "cygne", terrain: 5, mode: "volley", ai: 1, doped: null,
    pre: [
      { s: "narrator", t: "Sur le détroit, entre deux continents, une candidature qui dure depuis… on ne compte plus." },
      { s: "sultan", t: "Trente ans que je frappe à votre porte. Ce soir, je la défonce au smash." },
      { s: "cygne", t: "Gallardie a des valeurs, des critères, des procédures. Et un excellent contre." },
      { s: "sultan", t: "Des procédures ! Pendant que vous délibérez, moi je contrôle le détroit." },
      { s: "cygne", t: "En même temps, un détroit, ça se traverse dans les deux sens. Balle au centre." }
    ],
    win: [
      { s: "sultan", t: "La porte a cédé. Un jour, c'est l'Union qui demandera à entrer chez moi." },
      { s: "cygne", t: "Reconnaissons-le : de la puissance. On reparlera des critères plus tard." }
    ],
    lose: [
      { s: "cygne", t: "Critères respectés, victoire accordée. La procédure a du bon, voyez-vous." },
      { s: "sultan", t: "Vous gagnez le match, pas le détroit. Je reste sur le pas de la porte. Debout." }
    ]
  },

  // ===================== ACTE II — Les tensions montent (Ballon enflammé) ====
  {
    act: 2, title: "Le dégel n'aura pas lieu", sub: "Guerre froide 2.0 · course aux armements",
    left: "volkoi", right: "dorf", terrain: 0, mode: "flame", ai: 1, doped: null,
    pre: [
      { s: "narrator", t: "Place Écarlate, sous la neige. Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu." },
      { s: "volkoi", t: "Le froid ne me gêne pas. Je SUIS le froid. Toi, tu transpires déjà — et bientôt tu brûleras." },
      { s: "dorf", t: "J'ai le plus gros extincteur. Le plus gros ! Enfin… j’ai un très, très gros bouton. Ça compte." },
      { s: "volkoi", t: "Les boutons, c'est pour ceux qui doutent. Moi, je patiente. La braise fait le travail." },
      { s: "narrator", t: "Ne te brûle pas les doigts : renvoie avant d’être à zéro." }
    ],
    win: [
      { s: "volkoi", t: "Le sang-froid éteint la braise. Comme toujours. Comme prévu." },
      { s: "dorf", t: "Sabotage ! Enquête ! … Bon. Prochaine fois j'apporte un plus gros ballon — ignifugé." }
    ],
    lose: [
      { s: "dorf", t: "Grillé ! De ton côté ! Le plus beau flambage jamais vu. Fantastique." },
      { s: "volkoi", t: "Profite. L'hiver est long, et j'ai de la patience pour deux." }
    ]
  },
  {
    act: 2, title: "La guerre des puces", sub: "Doria–Panguo · tarifs & silicium",
    left: "timonier", right: "dorf", terrain: 4, mode: "flame", ai: 2, doped: null,
    pre: [
      { s: "narrator", t: "Cité du Matin. Enjeu : qui fabrique le monde. Le ballon s’enflamme — comme les chaînes d'approvisionnement." },
      { s: "dorf", t: "Des taxes ! Des taxes sur tout ! Sur le ballon, sur le filet, sur l'air que tu respires !" },
      { s: "timonier", t: "Taxe ce que tu veux. Tes usines, tes téléphones, tes puces… c'est encore moi qui les assemble." },
      { s: "dorf", t: "On se découple ! On rapatrie tout ! Enfin… après ce match. J'ai besoin de tes ballons — même brûlés." },
      { s: "timonier", t: "Le tempo, l'harmonie, la patience. Tu klaxonnes ; je livre. Sers — et ne te calcine pas." }
    ],
    win: [
      { s: "timonier", t: "Découple donc. Tu reviendras. Le monde entier revient toujours à l'atelier." },
      { s: "dorf", t: "Déloyal ! Subventionné ! … Combien pour tes ballons, au fait ?" }
    ],
    lose: [
      { s: "dorf", t: "Made in chez moi ! On gagne ! On gagne tellement que c'en est fatigant !" },
      { s: "timonier", t: "Une manche. La chaîne, elle, ne s'arrête jamais. Je patiente." }
    ]
  },
  {
    act: 2, title: "Le carburant du régime", sub: "Dossier nucléaire · sommets ratés",
    left: "dorf", right: "bebe", terrain: 3, mode: "flame", ai: 3, doped: "R",
    pre: [
      { s: "narrator", t: "Esplanade du Défilé. On avait annoncé une poignée de main historique. À la place : un ballon enflammé, et un adversaire à l’aura rouge." },
      { s: "bebe", t: "Nous nous étions écrit de si belles lettres, toi et moi. Puis tu es parti de la table." },
      { s: "dorf", t: "Grand leader ! Très grand ! On s'aimait beaucoup. Puis un peu moins. Puis plus du tout." },
      { s: "narrator", t: "Regarde ses yeux. Injectés. On murmure qu'un « carburant militaire » coule dans ses veines — et que la moindre touche brûle." },
      { s: "bebe", t: "Ce n'est pas de la triche. C'est de la DISCIPLINE nationale. Concentré. Prépare-toi à griller." }
    ],
    win: [
      { s: "dorf", t: "Battu ton truc rouge ! Personne n'y croyait ! MOI si. Toujours." },
      { s: "bebe", t: "Une défaite temporaire. Le programme continue. Le défilé aussi." }
    ],
    lose: [
      { s: "bebe", t: "La discipline écrase l'improvisation. Écris-moi une lettre. Je répondrai peut-être." },
      { s: "narrator", t: "L'aura a payé. Mais quelque chose s'est cassé dans l'esprit des Jeux." }
    ]
  },

  // ===================== ACTE III — Conflits ouverts (Bombe + dopage) ==========
  {
    act: 3, title: "La forêt qui brûle", sub: "Grande Forêt · climat · alliances",
    left: "capitaine", right: "gourou", terrain: 7, mode: "bomb", ai: 2, doped: "R",
    pre: [
      { s: "narrator", t: "Grande Forêt. La chaleur monte — sur le terrain et sur la planète. Le Gourou arrive… changé." },
      { s: "capitaine", t: "Ma tronçonneuse a soif. Un smash de moi, et ta défense tombe comme un arbre." },
      { s: "gourou", t: "J'ai laissé la méditation au vestiaire. Ce soir, je carbure. Les Jeux l'exigent." },
      { s: "narrator", t: "Lui aussi. L'œil vitreux, les gestes trop vifs. La contagion rouge gagne le peloton." },
      { s: "capitaine", t: "Deux fauves, une bombe, une forêt. Que le plus brutal reste debout." }
    ],
    win: [
      { s: "capitaine", t: "La puissance brute a parlé. Coupez, ça pousse ailleurs. Enfin… peut-être." },
      { s: "gourou", t: "J'ai trahi mon souffle pour du carburant, et j'ai perdu les deux. Leçon retenue." }
    ],
    lose: [
      { s: "gourou", t: "Le carburant m'a rendu plus rapide que ma conscience. J'ai gagné. Ai-je gagné ?" },
      { s: "capitaine", t: "Volé par un yogi shooté ! Le monde à l'envers. Je reviendrai avec deux tronçonneuses." }
    ]
  },
  {
    act: 3, title: "Le scandale d'État", sub: "Aura rouge aux Jeux · bannière neutre",
    left: "cygne", right: "volkoi", terrain: 0, mode: "bomb", ai: 3, doped: "R",
    pre: [
      { s: "narrator", t: "Le laboratoire a parlé : échantillons échangés, éprouvettes truquées, tout un État sur ordonnance." },
      { s: "cygne", t: "On vous a démasqués. Vous jouez sous bannière neutre, sans hymne, sans drapeau." },
      { s: "volkoi", t: "Neutre ? Regarde mieux. Pas de drapeau, pas de règles. Juste la force. La mienne." },
      { s: "narrator", t: "Ses veines pulsent. Machine d'État à plein régime, à ciel ouvert, assumée, glaçante." },
      { s: "cygne", t: "En même temps… quelqu'un doit défendre l'esprit du sport. Ce sera moi. Ce soir." }
    ],
    win: [
      { s: "cygne", t: "Le sport propre a tenu debout face à la machine. Fragile, mais debout." },
      { s: "volkoi", t: "Une victoire morale. La plus inutile des victoires. On se retrouvera en finale." }
    ],
    lose: [
      { s: "volkoi", t: "La morale ne renvoie pas les bombes. La force, si. Rendez-vous en finale, l'idéaliste." },
      { s: "narrator", t: "L'aura rouge règne. Le public gronde. Il ne reste qu'un match pour sauver les Jeux." }
    ]
  },
  {
    act: 3, title: "La finale des Jeux du Sommet", sub: "Le sport contre la machine",
    left: "dorf", right: "volkoi", terrain: 1, mode: "bomb", ai: 3, doped: "R",
    pre: [
      { s: "narrator", t: "Finale. Stade comble. D'un côté l'ego le plus bruyant du monde ; de l'autre, la machine d'État survoltée." },
      { s: "volkoi", t: "Toi, le bavard, contre moi, le glacier chimique. Le monde entier retient son souffle." },
      { s: "dorf", t: "Le plus grand match de tous les temps. Et je vais gagner. Sans carburant. Juste avec MOI." },
      { s: "narrator", t: "Personne n'a le beau rôle. Mais si l'aura rouge soulève le trophée, l'esprit des Jeux meurt." },
      { s: "dorf", t: "Pour une fois, gamins, je joue pour tout le monde. Étrange sensation. J'aime pas. Servons." }
    ],
    win: [
      { s: "dorf", t: "CHAMPION ! À mains nues ! Le plus grand ! On a sauvé les Jeux — enfin, MOI je les ai sauvés." },
      { s: "narrator", t: "La machine rouge tombe en finale. Les Jeux du Sommet survivront. Cette fois. Générique." }
    ],
    lose: [
      { s: "volkoi", t: "La machine soulève le trophée. Sans hymne, sans drapeau, sans scrupule. Parfait." },
      { s: "narrator", t: "L'aura rouge est championne. Rideau amer sur les Jeux du Sommet. À toi de réécrire la fin." }
    ]
  }
];

// ---------- Registre des campagnes (sélection par personnage) ----------
// La campagne curée + une campagne par personnage (si story-campaigns.js chargé).
// Chaque entrée : { key, name, sub, chapters }.
const STORY_CAMPAIGNS = (function () {
  const list = [{
    key: "sommet",
    name: "Les Jeux du Sommet",
    sub: "La campagne originale · 9 chapitres croisés",
    chapters: STORY_SOMMET
  }];
  if (typeof STORY_BY_CHAR !== "undefined" && STORY_BY_CHAR) {
    // ordre du roster CHARACTERS pour la cohérence d'affichage
    const order = (typeof CHARACTERS !== "undefined")
      ? CHARACTERS.map(c => c.key)
      : Object.keys(STORY_BY_CHAR);
    for (const key of order) {
      const chapters = STORY_BY_CHAR[key];
      if (!Array.isArray(chapters) || !chapters.length) continue;
      const nm = (typeof CHARACTERS !== "undefined")
        ? (CHARACTERS.find(c => c.key === key) || {}).name || key : key;
      list.push({ key: "char:" + key, name: nm, sub: "9 rivaux · du volley amical au duel-bombe", chapters });
    }
  }
  return list;
})();

// Campagne active : `STORY` pointe sur ses chapitres. Défaut = campagne curée.
let storyCampaign = STORY_CAMPAIGNS[0];
let STORY = storyCampaign.chapters;

// ---------- Métadonnées des actes (cartes d'intro) ----------
const ACT_META = [
  null,
  { num: "I",   title: "Petites rivalités",
    tagline: "Volley classique. Le monde sourit encore — on règle ses comptes au filet.",
    color: "#3eb5ff" },
  { num: "II",  title: "Les tensions montent",
    tagline: "Ballon enflammé. Chaque contact brûle. Les sourires tombent.",
    color: "#ff8a3d" },
  { num: "III", title: "Conflits ouverts",
    tagline: "Mode Bombe. Mèche courte, auras rouges, grands duels.",
    color: "#ff5a4d" }
];

// ---------- Répliques d'ambiance (barks) pendant les points ----------
// Purement visuel (lu au rendu depuis scores[], jamais dans la simulation).
const STORY_BARKS = {
  volkoi:    ["Prévu.", "Le froid gagne.", "Patience.", "Faiblesse."],
  dorf: ["Énorme !", "Le plus grand !", "Truqué !", "On gagne !"],
  cygne:    ["En même temps…", "Décisif.", "La méthode.", "Et voilà."],
  bebe:      ["Discipline !", "Défilé !", "Concentré.", "Écris-moi."],
  timonier:     ["Harmonie.", "Le tempo.", "Patience.", "Prévu."],
  sultan:    ["Séisme !", "Le détroit !", "Debout.", "J'entre."],
  gourou:      ["Namasté.", "Souffle.", "Le calme.", "Retour."],
  capitaine:      ["Tronçonneuse !", "Ça coupe !", "Brute !", "Ça pousse."],
  faucon:    ["Raid !", "Sécurisé.", "Debout.", "Faucon."],
  safran:    ["Safran.", "Mesuré.", "La cour.", "Or."]
};

// ---------- État du mode histoire ----------
let storyActive = false;     // dans le flux histoire (hub / dialogue / match)
let storyInMatch = false;    // un match d'histoire est en cours
let storyChapter = 0;        // index du chapitre courant
let storyNavIdx = 0;         // curseur clavier/manette dans le hub
// scène de dialogue en cours
let storyScene = null;       // { lines:[{s,t}], idx, phase:"pre"|"win"|"lose", reveal, done }
let storySceneFrame = 0;     // compteur de frames (typewriter, cosmétique)

const STORY_KEY = "sommetStoryProgress";
let storyProgress = { unlocked: 0, completed: [] };
let storyAllProgress = null; // { [campaignKey]: {unlocked, completed[]} }

// Lit le blob localStorage complet (toutes campagnes) une seule fois.
function storyReadAll() {
  if (storyAllProgress) return storyAllProgress;
  storyAllProgress = {};
  try {
    const raw = localStorage.getItem(STORY_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      // Rétro-compat : ancien format = { unlocked, completed } (campagne « sommet »).
      if (p && (Array.isArray(p.completed) || typeof p.unlocked === "number") && !p.byCampaign) {
        storyAllProgress.sommet = { unlocked: p.unlocked | 0, completed: Array.isArray(p.completed) ? p.completed : [] };
      } else if (p && p.byCampaign) {
        storyAllProgress = p.byCampaign;
      }
    }
  } catch (e) { storyAllProgress = {}; }
  return storyAllProgress;
}

// Charge la progression de la campagne active (storyCampaign.key).
function storyLoadProgress() {
  const all = storyReadAll();
  const key = storyCampaign ? storyCampaign.key : "sommet";
  const p = all[key] || { unlocked: 0, completed: [] };
  storyProgress = {
    unlocked: Math.max(0, Math.min(STORY.length - 1, p.unlocked | 0)),
    completed: Array.isArray(p.completed) ? p.completed.slice(0, STORY.length) : []
  };
}
function storySaveProgress() {
  const all = storyReadAll();
  const key = storyCampaign ? storyCampaign.key : "sommet";
  all[key] = { unlocked: storyProgress.unlocked, completed: storyProgress.completed };
  try { localStorage.setItem(STORY_KEY, JSON.stringify({ byCampaign: all })); } catch (e) {}
}
// Nb de chapitres terminés d'une campagne donnée (pour l'écran de sélection).
function storyCampaignDone(campaignKey, total) {
  const all = storyReadAll();
  const p = all[campaignKey];
  if (!p || !Array.isArray(p.completed)) return 0;
  let n = 0; for (let i = 0; i < total; i++) if (p.completed[i]) n++;
  return n;
}
function storyIsUnlocked(i) { return i <= storyProgress.unlocked; }
function storyIsDone(i) { return !!storyProgress.completed[i]; }

// ---------- Entrée / navigation ----------
let storySelIdx = 0; // curseur de l'écran de sélection de campagne

// Ouvre le mode Histoire : écran de sélection de campagne (sommet + par perso).
// S'il n'y a qu'une campagne (story-campaigns.js absent), on va direct au hub.
function storyOpen() {
  storyActive = true;
  storyInMatch = false;
  storyScene = null;
  if (STORY_CAMPAIGNS.length <= 1) { storySelectCampaign(0); return; }
  storySelIdx = Math.max(0, Math.min(STORY_CAMPAIGNS.length - 1, storySelIdx));
  navIdx = storySelIdx;
  state = "storySelect";
}

// Choisit une campagne : `STORY` pointe dessus, on charge sa progression,
// puis fiche d'intro (bio + kit) avant le hub.
function storySelectCampaign(i) {
  if (i < 0 || i >= STORY_CAMPAIGNS.length) return;
  storyCampaign = STORY_CAMPAIGNS[i];
  STORY = storyCampaign.chapters;
  storyLoadProgress();
  storyActive = true;
  storyInMatch = false;
  storyScene = null;
  // curseur sur le dernier chapitre débloqué (reprise naturelle)
  storyNavIdx = Math.max(0, Math.min(STORY.length - 1, storyProgress.unlocked));
  navIdx = storyNavIdx;
  storySceneFrame = 0;
  state = "storyCharIntro";
}

/** Données fiche : nation / map / blurb (STORY_BIOS) + kit CHARACTERS. */
function storyCharFiche(key) {
  const bio = (typeof STORY_BIOS !== "undefined" && STORY_BIOS && STORY_BIOS[key]) || {};
  const ci = storyCharIdx(key);
  const a = (ci >= 0 && typeof CHARACTERS !== "undefined") ? CHARACTERS[ci] : null;
  let mapName = bio.map || "";
  if (!mapName && a && typeof TERRAINS !== "undefined") {
    const t = TERRAINS.find(x => x.character === ci);
    if (t) mapName = t.name;
  }
  return {
    key,
    name: a ? a.name : key,
    nation: bio.nation || (a && a.nation) || "",
    map: mapName,
    blurb: bio.blurb || "",
    char: a
  };
}

function storyConfirmIntro() {
  storyOpenHub();
}

function storyLeave() {
  storyActive = false;
  storyInMatch = false;
  storyScene = null;
  state = "soloMenu";
  navIdx = 0;
}

// Sélectionne un chapitre depuis le hub (si débloqué). Premier chapitre d'un
// acte → carte d'intro d'acte ; sinon dialogue d'avant-match directement.
function storySelectChapter(i) {
  if (i < 0 || i >= STORY.length || !storyIsUnlocked(i)) {
    beep(200, 0.08, "square", 0.08); // verrouillé
    return;
  }
  storyChapter = i;
  if (storyIsActStart(i)) {
    storyActActive = STORY[i].act;
    state = "storyActIntro";
    storySceneFrame = 0;
    if (typeof sfxStory === "function") sfxStory("act");
  }
  else storyBeginScene("pre");
}
function storyIsActStart(i) { return i === 0 || STORY[i].act !== STORY[i - 1].act; }
let storyActActive = 1; // acte dont la carte d'intro est affichée

// ---------- Dialogue (cutscene) ----------
function storyBeginScene(phase) {
  const ch = STORY[storyChapter];
  const lines = phase === "pre" ? ch.pre : phase === "win" ? ch.win : ch.lose;
  storyScene = { lines: lines.slice(), idx: 0, phase, reveal: 0, done: false };
  storySceneFrame = 0;
  storyActive = true;
  state = "storyScene";
  if (typeof sfxStory === "function") {
    if (phase === "win") sfxStory("win");
    else if (phase === "lose") sfxStory("lose");
  }
}

// Avance le dialogue : 1er appui = révèle toute la ligne ; 2e = ligne suivante ;
// après la dernière ligne = transition (pre→match, win/lose→suite).
function storyAdvanceScene() {
  if (!storyScene) return;
  const line = storyScene.lines[storyScene.idx];
  const full = line ? line.t.length : 0;
  if (!storyScene.done && storyScene.reveal < full) {
    storyScene.reveal = full; // révèle d'un coup
    storyScene.done = true;
    return;
  }
  // ligne suivante
  if (storyScene.idx < storyScene.lines.length - 1) {
    storyScene.idx++;
    storyScene.reveal = 0;
    storyScene.done = false;
    if (typeof sfxStory === "function") sfxStory("blip");
    else beep(420, 0.03, "sine", 0.04);
    return;
  }
  // fin de la scène
  const phase = storyScene.phase;
  storyScene = null;
  if (phase === "pre") storyStartMatch();
  else storyAfterPostScene(phase === "win");
}

// ---------- Lancement du match ----------
function storyStartMatch() {
  const ch = STORY[storyChapter];
  online = false;
  vsAI = true;
  tutorialMode = false;
  paused = false;
  if (typeof mapEventsQuiet !== "undefined") mapEventsQuiet = false;
  bombMode = ch.mode === "bomb";
  bombTime = BOMB_TIME;
  flameMode = ch.mode === "flame";
  const duo = ch.mode === "2v2";
  setMode(duo ? "2v2" : "1v1");
  terrain = ch.terrain;
  ballSkin = 0;
  // dopage → IA impitoyable ; sinon niveau du chapitre
  aiLevel = ch.doped === "R" ? 3 : ch.ai;
  blobL.charId = storyCharIdx(ch.left);
  blobR.charId = storyCharIdx(ch.right);
  blobL.doped = false;
  blobR.doped = false;
  if (duo) {
    blob2L.charId = storyCharIdx(ch.ally);
    blob2R.charId = storyCharIdx(ch.right2);
    blob2L.doped = false;
    blob2R.doped = false;
    blob2L._aiT = blobR._aiT = blob2R._aiT = 0;
  }
  newGame();                       // seed, scores — speedMul reste 1 (stats perso)
  if (ch.doped === "R") {
    blobR.doped = true;
    // Dopage Histoire = exception narrative (pas un buff de difficulté IA).
    blobR.speedMul = Math.max(blobR.speedMul, 1.5);
  } else if (ch.doped === "L") {
    blobL.doped = true;
  }
  storyInMatch = true;
}

// Après le dialogue de fin : progression + retour au hub (ou écran de fin).
function storyAfterPostScene(win) {
  const wasFinale = storyChapter === STORY.length - 1;
  if (win) {
    storyProgress.completed[storyChapter] = true;
    if (storyChapter === storyProgress.unlocked && storyChapter < STORY.length - 1) {
      storyProgress.unlocked = storyChapter + 1;
    }
    storySaveProgress();
    if (storyChapter < STORY.length - 1) storyNavIdx = storyChapter + 1;
  }
  storyInMatch = false;
  // Victoire en finale → écran de fin (le payoff), sinon retour au hub.
  if (win && wasFinale) { state = "storyEnding"; storySceneFrame = 0; storyActive = true; }
  else storyOpenHub();
}
function storyOpenHub() {
  storyActive = true;
  storyScene = null;
  navIdx = storyNavIdx;
  state = "storyMenu";
  if (typeof sfxStory === "function") sfxStory("hub");
}

// Appelé par le handler "gameover" (menus.js) quand storyActive.
function storyOnMatchEnd() {
  const win = scores[0] > scores[1]; // le joueur est TOUJOURS à gauche
  blobL.doped = false; blobR.doped = false;
  if (typeof blob2L !== "undefined") blob2L.doped = false;
  if (typeof blob2R !== "undefined") blob2R.doped = false;
  storyBeginScene(win ? "win" : "lose");
}

// ---------- Clavier / manette ----------
// Renvoie true si la touche a été consommée par le mode histoire.
function storyHandleKeys(code) {
  if (state === "storySelect") {
    const n = STORY_CAMPAIGNS.length;
    if (code === "Escape") { storyLeave(); return true; }
    if (code === "ArrowUp" || code === "KeyW") { storySelIdx = (storySelIdx - 1 + n) % n; navIdx = storySelIdx; return true; }
    if (code === "ArrowDown" || code === "KeyS") { storySelIdx = (storySelIdx + 1) % n; navIdx = storySelIdx; return true; }
    if (code === "Enter" || code === "Space" || code === "KeyF") { storySelectCampaign(storySelIdx); return true; }
    return true;
  }
  if (state === "storyMenu") {
    if (code === "Escape") { if (STORY_CAMPAIGNS.length > 1) storyOpen(); else storyLeave(); return true; }
    if (code === "ArrowUp" || code === "KeyW") { storyNavIdx = Math.max(0, storyNavIdx - 1); navIdx = storyNavIdx; return true; }
    if (code === "ArrowDown" || code === "KeyS") { storyNavIdx = Math.min(STORY.length - 1, storyNavIdx + 1); navIdx = storyNavIdx; return true; }
    if (code === "Enter" || code === "Space") { storySelectChapter(storyNavIdx); return true; }
    const slot = { Digit1:0, Digit2:1, Digit3:2, Digit4:3, Digit5:4, Digit6:5, Digit7:6, Digit8:7, Digit9:8 }[code];
    if (slot !== undefined && slot < STORY.length) { storyNavIdx = slot; navIdx = slot; storySelectChapter(slot); return true; }
    return true; // absorbe le reste sur le hub
  }
  if (state === "storyScene") {
    if (code === "Escape") { storyScene = null; storyInMatch = false; storyOpenHub(); return true; }
    if (code === "Enter" || code === "Space" || code === "KeyF") { storyAdvanceScene(); return true; }
    return true;
  }
  if (state === "storyCharIntro") {
    if (code === "Escape") { if (STORY_CAMPAIGNS.length > 1) storyOpen(); else storyLeave(); return true; }
    if (code === "Enter" || code === "Space" || code === "KeyF") { storyConfirmIntro(); return true; }
    return true;
  }
  if (state === "storyActIntro") {
    if (code === "Escape") { storyOpenHub(); return true; }
    if (code === "Enter" || code === "Space" || code === "KeyF") { storyBeginScene("pre"); return true; }
    return true;
  }
  if (state === "storyEnding") {
    if (code === "Escape" || code === "Enter" || code === "Space" || code === "KeyF") { storyOpenHub(); return true; }
    return true;
  }
  return false;
}
// clic souris (le hub enregistre des hitboxes "StoryChN")
// Ne traite QUE les codes Story* et seulement dans un état histoire.
function storyHandleClickCode(code) {
  if (typeof code !== "string" || code.indexOf("Story") !== 0) return false;
  const inStory = state === "storySelect" || state === "storyCharIntro" || state === "storyMenu" ||
    state === "storyScene" || state === "storyActIntro" || state === "storyEnding";
  if (!inStory) return false;
  if (code === "StoryBack") { if (STORY_CAMPAIGNS.length > 1) storyOpen(); else storyLeave(); return true; }
  if (code === "StorySelBack") { storyLeave(); return true; }
  const sm = /^StorySel(\d+)$/.exec(code);
  if (sm && state === "storySelect") {
    const i = sm[1] | 0; storySelIdx = i; navIdx = i; storySelectCampaign(i); return true;
  }
  const m = /^StoryCh(\d+)$/.exec(code);
  if (m && state === "storyMenu") {
    const i = m[1] | 0; storyNavIdx = i; navIdx = i; storySelectChapter(i); return true;
  }
  if (state === "storyScene" && code === "StoryNext") { storyAdvanceScene(); return true; }
  if (state === "storyCharIntro" && code === "StoryIntroNext") { storyConfirmIntro(); return true; }
  if (state === "storyActIntro" && code === "StoryActNext") { storyBeginScene("pre"); return true; }
  if (state === "storyEnding" && code === "StoryEndNext") { storyOpenHub(); return true; }
  return false;
}

// =============================================================================
//  RENDU
// =============================================================================

// Variantes « dopées » optionnelles générées à part (assets/story/<key>_doped.png).
// Chargées à la demande ; si absentes, on teinte le portrait normal en rouge.
const storyDopedImgs = {};
function storyDopedPortrait(key) {
  if (!(key in storyDopedImgs)) {
    storyDopedImgs[key] = (typeof loadSprite === "function")
      ? loadSprite("assets/story/" + key + "_doped.png") : null;
  }
  const img = storyDopedImgs[key];
  return (img && typeof spriteReady === "function" && spriteReady(img)) ? img : null;
}

// 1ʳᵉ frame prête d'une anim (idle_face → idle → walk…).
function storyPortraitFrame(key) {
  if (typeof charPack !== "function" || typeof spriteReady !== "function") return null;
  const pack = charPack(key);
  if (!pack || !pack.frames) return null;
  const order = ["idle_face", "idle", "walk", "jump"];
  for (const anim of order) {
    const frames = pack.frames[anim];
    if (!frames || !frames.length) continue;
    const img = frames[0];
    if (spriteReady(img)) return img;
  }
  return null;
}

// Portrait d'un perso dans une boîte (sprite si dispo, sinon pastille).
function storyDrawPortrait(key, cx, cy, boxW, boxH, opts) {
  opts = opts || {};
  const flip = !!opts.flip;
  const doped = !!opts.doped;
  const dim = opts.dim || 0;
  let drawn = false;
  // 1) variante dopée générée, si présente
  if (doped) {
    const dop = storyDopedPortrait(key);
    if (dop) {
      const ar = dop.naturalWidth / dop.naturalHeight;
      let h = boxH, w = h * ar;
      if (w > boxW) { w = boxW; h = w / ar; }
      ctx.save();
      ctx.translate(cx, cy);
      if (flip) ctx.scale(-1, 1);
      ctx.drawImage(dop, -w / 2, -h / 2, w, h);
      ctx.restore();
      drawn = true;
    }
  }
  try {
    if (!drawn) {
      const img = storyPortraitFrame(key);
      if (img) {
        const ar = img.naturalWidth / img.naturalHeight;
        let h = boxH, w = h * ar;
        if (w > boxW) { w = boxW; h = w / ar; }
        ctx.save();
        ctx.translate(cx, cy);
        if (flip) ctx.scale(-1, 1);
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
        // pas de variante dopée → teinte rouge « sang » par-dessus le sprite
        if (doped) {
          const t = performance.now() / 1000;
          ctx.globalCompositeOperation = "source-atop";
          ctx.globalAlpha = 0.28 + 0.10 * Math.sin(t * 5);
          ctx.fillStyle = "#c1121f";
          ctx.fillRect(-w / 2, -h / 2, w, h);
        }
        ctx.restore();
        drawn = true;
      }
    }
  } catch (e) {}
  if (!drawn) {
    // silhouette de secours : disque coloré + initiale (taille = pastille, pas 44px fixe)
    const ci = storyCharIdx(key), c = CHARACTERS[ci];
    const r = Math.min(boxW, boxH) * 0.42;
    const letterPx = Math.max(9, Math.min(28, Math.floor(r * 1.05)));
    ctx.save();
    ctx.fillStyle = (c && c.color) || "#888";
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = UI.stroke;
    ctx.lineWidth = Math.max(1.5, Math.min(3, r * 0.12));
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.font = "800 " + letterPx + "px " + UI.display;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText((c ? c.name : key).charAt(0).toUpperCase(), cx, cy + 1);
    ctx.textBaseline = "alphabetic";
    ctx.restore();
  }
  if (dim > 0) {
    ctx.save();
    ctx.fillStyle = "rgba(6,10,24," + dim + ")";
    ctx.fillRect(cx - boxW / 2, cy - boxH / 2, boxW, boxH);
    ctx.restore();
  }
  if (doped) storyDrawDopeGlow(cx, cy, Math.min(boxW, boxH) * 0.52);
}

// Halo « dopé » : pulsation rouge + petites gouttes. Cosmétique (Math.random OK).
function storyDrawDopeGlow(cx, cy, r) {
  const t = performance.now() / 1000;
  const pulse = 0.5 + 0.5 * Math.sin(t * 6);
  ctx.save();
  const g = ctx.createRadialGradient(cx, cy, r * 0.3, cx, cy, r * 1.5);
  g.addColorStop(0, "rgba(255,40,40,0)");
  g.addColorStop(0.7, "rgba(220,20,20," + (0.18 + 0.22 * pulse).toFixed(3) + ")");
  g.addColorStop(1, "rgba(120,0,0,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// Aura « dopé » dessinée SOUS/AUTOUR du perso pendant le match (dans le repère
// caméra, appelée depuis render.js juste après le dessin des blobs).
function storyDrawAuras() {
  if (!storyInMatch) return;
  for (const b of activeBlobs) {
    if (!b || !b.doped) continue;
    const t = performance.now() / 1000;
    const pulse = 0.5 + 0.5 * Math.sin(t * 7 + b.side);
    const cx = b.x, cy = b.y - 46, r = 52;
    ctx.save();
    const g = ctx.createRadialGradient(cx, cy, 8, cx, cy, r);
    g.addColorStop(0, "rgba(255,60,60," + (0.10 + 0.10 * pulse).toFixed(3) + ")");
    g.addColorStop(1, "rgba(180,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    // veines / éclats rouges qui montent
    ctx.globalAlpha = 0.5 + 0.4 * pulse;
    ctx.strokeStyle = "rgba(255,40,40,0.8)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const a = t * 3 + i * 2.1;
      const ox = Math.cos(a) * 22, oy = -20 - ((t * 40 + i * 33) % 60);
      ctx.beginPath();
      ctx.moveTo(cx + ox, cy + 20);
      ctx.lineTo(cx + ox * 0.7, cy + oy);
      ctx.stroke();
    }
    ctx.restore();
  }
}

// Bulle d'ambiance au-dessus du gagnant du point (état "point", histoire only).
function storyDrawBark() {
  if (!storyInMatch || state !== "point") return;
  const ch = STORY[storyChapter];
  const winnerSide = servingSide; // le serveur = qui vient de marquer
  const b = winnerSide === 0 ? blobL : blobR;
  const key = winnerSide === 0 ? ch.left : ch.right;
  const pool = STORY_BARKS[key];
  if (!pool || !pool.length) return;
  const txt = pool[(scores[0] + scores[1]) % pool.length];
  const x = b.x, y = b.y - 96;
  ctx.save();
  ctx.font = "800 15px " + UI.sans;
  const w = ctx.measureText(txt).width + 26;
  ctx.fillStyle = "rgba(255,246,232,0.96)";
  ctx.strokeStyle = UI.stroke; ctx.lineWidth = 2.5;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x - w / 2, y - 26, w, 30, 12); else ctx.rect(x - w / 2, y - 26, w, 30);
  ctx.fill(); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - 6, y + 3); ctx.lineTo(x + 6, y + 3); ctx.lineTo(x, y + 12); ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = UI.stroke; ctx.textAlign = "center";
  ctx.fillText(txt, x, y - 5);
  ctx.restore();
}

// Petit rappel en bas de l'écran de fin de match (histoire).
function storyDrawGameoverTag() {
  if (!storyInMatch || state !== "gameover") return;
  if (gameoverTimer > 0) return;
  const win = scores[0] > scores[1];
  ctx.save();
  ctx.textAlign = "center";
  ctx.font = "800 15px " + UI.sans;
  ctx.fillStyle = UI.gold;
  ctx.fillText(win ? "▸ Espace — la suite de l'histoire"
                   : "▸ Espace — encore un mot…", W / 2, H - 24);
  ctx.restore();
}

// ---------- Écran SÉLECTION DE CAMPAGNE ----------
function drawStorySelect() {
  menuScreenBase({
    title: "MODE HISTOIRE",
    kicker: "Choisis ta campagne",
    titleSize: 46,
    noEscHint: true
  });
  const mx = UI.mx;
  uiLabel("Une campagne par dirigeant : affronte tes 9 rivaux, du volley amical au duel-bombe.",
          mx, 172, 13, UI.muted, 0.3);

  const listX = mx, listW = W - mx * 2;
  const n = STORY_CAMPAIGNS.length;
  const top = 192, bottom = H - 46;
  const rowH = Math.max(24, Math.min(30, Math.floor((bottom - top) / n) - 2));
  const gap = 2;
  for (let i = 0; i < n; i++) {
    const camp = STORY_CAMPAIGNS[i];
    const total = camp.chapters.length;
    const done = storyCampaignDone(camp.key, total);
    const complete = done >= total;
    const sel = (navIdx === i);
    const ry = top + i * (rowH + gap), rx = listX;
    hit(rx + listW / 2, ry + rowH / 2, listW, rowH + gap, "StorySel" + i);
    const hover = isHover("StorySel" + i);
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(rx, ry, listW, rowH, 9); else ctx.rect(rx, ry, listW, rowH);
    // Lignes assez opaques pour masquer le décor derrière, sans voile plein écran
    // (un fillRect global noircissait les persos du menu).
    ctx.fillStyle = (sel || hover) ? "rgba(255,216,74,0.92)" : "rgba(12,20,42,0.78)";
    ctx.fill();
    if (sel || hover) { ctx.strokeStyle = UI.stroke; ctx.lineWidth = 2.5; ctx.stroke(); }

    const ink = (sel || hover) ? UI.stroke : UI.ink;
    const baseY = ry + rowH * 0.66;
    // pastille (portrait perso ou trophée pour la campagne curée)
    const isChar = camp.key.indexOf("char:") === 0;
    if (isChar) {
      const key = camp.key.slice(5);
      storyDrawPortrait(key, rx + rowH * 0.55, ry + rowH / 2, rowH - 4, rowH - 4, {});
    } else {
      ctx.font = (rowH * 0.6).toFixed(0) + "px " + UI.sans;
      ctx.textAlign = "center";
      ctx.fillText("🏆", rx + rowH * 0.55, baseY);
    }
    // nom
    ctx.textAlign = "left";
    ctx.fillStyle = ink;
    ctx.font = "800 14px " + UI.sans;
    const nameX = rx + rowH + 8;
    ctx.fillText(camp.name, nameX, baseY);
    const nameW = ctx.measureText(camp.name).width;
    // sous-titre
    ctx.font = "600 11px " + UI.sans;
    ctx.fillStyle = (sel || hover) ? "rgba(27,23,48,0.72)" : UI.muted;
    ctx.fillText(camp.sub, nameX + nameW + 16, baseY);
    // progression à droite
    ctx.textAlign = "right";
    ctx.font = "700 12px " + UI.mono;
    ctx.fillStyle = complete ? (sel || hover ? "#1b7d3a" : UI.gold) : (sel || hover ? "rgba(27,23,48,0.8)" : UI.muted);
    ctx.fillText((complete ? "✓ " : "") + done + "/" + total, rx + listW - 12, baseY);
    ctx.textAlign = "left";
  }

  hit(mx + 45, H - 26, 150, 24, "StorySelBack");
  uiLabel("Échap ← Menu  ·  " + (padConnected ? "🎮 ↑↓ · A choisir" : "↑↓ · Entrée choisir"),
          mx, H - 20, 12, UI.muted, 0.3);
}

// ---------- Écran HUB (roadmap des chapitres) ----------
function drawStoryHub() {
  menuScreenBase({
    title: "MODE HISTOIRE",
    kicker: storyCampaign.name + " · " + STORY.length + " chapitres",
    titleSize: 46,
    noEscHint: true
  });
  const mx = UI.mx;
  const doneN = storyProgress.completed.filter(Boolean).length;
  uiLabel("Progression : " + doneN + "/" + STORY.length + " · Volley/2v2 · Flamme · Bombe",
          mx, 172, 13, UI.muted, 0.3);

  const listX = mx, listW = W - mx * 2;
  let y = 194;
  const rowH = 22, gap = 1;
  let lastAct = 0;
  for (let i = 0; i < STORY.length; i++) {
    const ch = STORY[i];
    if (ch.act !== lastAct) {
      lastAct = ch.act;
      const am = ACT_META[ch.act];
      const label = am ? ("Acte " + am.num + " · " + am.title) : ("Acte " + ch.act);
      uiLabel(label, listX, y + 11, 11, UI.gold, 1.2);
      y += 17;
    }
    const unlocked = storyIsUnlocked(i);
    const done = storyIsDone(i);
    const sel = (navIdx === i);
    const ry = y, rx = listX;
    hit(rx + listW / 2, ry + rowH / 2, listW, rowH + gap, "StoryCh" + i);
    const hover = isHover("StoryCh" + i);
    // fond de ligne
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(rx, ry, listW, rowH, 9); else ctx.rect(rx, ry, listW, rowH);
    ctx.fillStyle = !unlocked ? "rgba(255,255,255,0.05)"
                  : (sel || hover) ? "rgba(255,216,74,0.92)" : "rgba(255,246,232,0.10)";
    ctx.fill();
    if (sel || hover) { ctx.strokeStyle = UI.stroke; ctx.lineWidth = 2.5; ctx.stroke(); }

    const inkMain = !unlocked ? "rgba(255,246,232,0.35)" : (sel || hover) ? UI.stroke : UI.ink;
    const baseY = ry + rowH * 0.68;
    // numéro
    ctx.fillStyle = inkMain;
    ctx.font = "800 12px " + UI.display;
    ctx.textAlign = "left";
    ctx.fillText((i + 1).toString().padStart(2, "0"), rx + 10, baseY);
    // icône mode
    const icon = !unlocked ? "🔒"
      : ch.mode === "bomb" ? "💣"
      : ch.mode === "flame" ? "🔥"
      : ch.mode === "2v2" ? "🤝"
      : "🏐";
    ctx.font = "13px " + UI.sans;
    ctx.fillText(icon, rx + 32, baseY);
    // dopage
    if (ch.doped) { ctx.fillText("☠️", rx + 52, baseY); }
    // titre + affrontement
    ctx.font = "800 13px " + UI.sans;
    ctx.fillStyle = inkMain;
    const title = unlocked ? ch.title : "— verrouillé —";
    ctx.fillText(title, rx + 76, baseY);
    if (unlocked) {
      ctx.font = "600 11px " + UI.sans;
      ctx.fillStyle = (sel || hover) ? "rgba(27,23,48,0.75)" : UI.muted;
      const vs = ch.mode === "2v2"
        ? storyCharName(ch.left) + "+" + storyCharName(ch.ally)
          + "  vs  " + storyCharName(ch.right) + "+" + storyCharName(ch.right2)
        : storyCharName(ch.left) + "  vs  " + storyCharName(ch.right);
      ctx.textAlign = "right";
      ctx.fillText((done ? "✓  " : "") + vs, rx + listW - 12, baseY);
    }
    ctx.textAlign = "left";
    y += rowH + gap;
  }

  // pied
  hit(mx + 45, H - 26, 150, 24, "StoryBack");
  const backLbl = STORY_CAMPAIGNS.length > 1 ? "Échap ← Campagnes" : "Échap ← Menu";
  uiLabel(backLbl + "  ·  " + (padConnected ? "🎮 Croix ↑↓ · A jouer" : "↑↓ ou 1-9 · Entrée jouer"),
          mx, H - 20, 12, UI.muted, 0.3);
}

// ---------- Écran DIALOGUE ----------
function drawStoryScene() {
  storySceneFrame++;
  const ch = STORY[storyChapter];
  const scene = storyScene;
  // fond : le terrain RÉEL du chapitre (immersion « sur place »), assombri.
  // Sûr : en storyScene, update() est inerte (ni play ni serve) et render()
  // sort après drawStoryScene → poser `terrain` ici n'affecte aucune simulation.
  if (typeof drawBackground === "function") {
    terrain = ch.terrain;
    try { drawBackground(); } catch (e) {
      if (typeof drawMenuWorld === "function") drawMenuWorld();
    }
  } else if (typeof drawMenuWorld === "function") {
    drawMenuWorld();
  }
  // voile dégradé : plus dense en bas (derrière la boîte de dialogue)
  const veil = ctx.createLinearGradient(0, 0, 0, H);
  veil.addColorStop(0, "rgba(6,10,24,0.62)");
  veil.addColorStop(0.55, "rgba(6,10,24,0.68)");
  veil.addColorStop(1, "rgba(6,10,24,0.88)");
  ctx.fillStyle = veil;
  ctx.fillRect(0, 0, W, H);

  // bandeau titre du chapitre
  const mx = UI.mx;
  uiLabel("Chapitre " + (storyChapter + 1) + " · " +
          ["", "Acte I", "Acte II", "Acte III"][ch.act], mx, 54, 12, UI.gold, 1.0);
  uiLabel(ch.title, mx, 84, 22, UI.ink, 0.4);
  uiLabel(ch.sub, mx, 108, 12, UI.muted, 0.4);
  if (ch.mode === "bomb") uiLabel("💣  Conflit — mode Bombe", W - mx, 84, 13, UI.accent, 0.4, "right");
  else if (ch.mode === "flame") uiLabel("🔥  Tension — Ballon enflammé", W - mx, 84, 13, "#ff6a20", 0.4, "right");
  else if (ch.mode === "2v2") uiLabel("🤝  Alliance — mode 2v2", W - mx, 84, 13, "#5ad4a0", 0.4, "right");
  else uiLabel("🏐  Rivalité — mode Volley", W - mx, 84, 13, UI.sky, 0.4, "right");
  if (ch.doped) uiLabel("☠️  Aura rouge — adversaire impitoyable", W - mx, 108, 12, "#ff6b6b", 0.4, "right");

  // boîte de dialogue (dimensions calculées avant les portraits pour placer les noms)
  const bx = mx, bw = W - mx * 2, bh = 108, by = H - bh - 30;

  // portraits : 1v1 = duo ; 2v2 = quatre (équipe G / équipe D)
  const duo = ch.mode === "2v2";
  const py = duo ? 210 : 224, pw = duo ? 150 : 220, ph = duo ? 140 : 188;
  const line = scene ? scene.lines[scene.idx] : null;
  const speaker = line ? line.s : null;
  const leftActive = speaker === ch.left;
  const rightActive = speaker === ch.right;
  const allyActive = duo && speaker === ch.ally;
  const right2Active = duo && speaker === ch.right2;
  const leftDoped = ch.doped === "L";
  const rightDoped = ch.doped === "R";
  if (duo) {
    const dimOf = (active) => (active || !speaker ? 0 : 0.45);
    storyDrawPortrait(ch.left, W * 0.18, py, pw, ph, { flip: false, doped: leftDoped, dim: dimOf(leftActive) });
    storyDrawPortrait(ch.ally, W * 0.38, py, pw, ph, { flip: false, doped: false, dim: dimOf(allyActive) });
    storyDrawPortrait(ch.right, W * 0.62, py, pw, ph, { flip: true, doped: rightDoped, dim: dimOf(rightActive) });
    storyDrawPortrait(ch.right2, W * 0.82, py, pw, ph, { flip: true, doped: false, dim: dimOf(right2Active) });
    ctx.textAlign = "center";
    ctx.font = "800 13px " + UI.display;
    ctx.fillStyle = leftActive ? UI.gold : UI.muted;
    ctx.fillText(storyCharName(ch.left), W * 0.18, by - 10);
    ctx.fillStyle = allyActive ? UI.gold : UI.muted;
    ctx.fillText(storyCharName(ch.ally), W * 0.38, by - 10);
    ctx.fillStyle = rightActive ? UI.gold : UI.muted;
    ctx.fillText(storyCharName(ch.right), W * 0.62, by - 10);
    ctx.fillStyle = right2Active ? UI.gold : UI.muted;
    ctx.fillText(storyCharName(ch.right2), W * 0.82, by - 10);
  } else {
    storyDrawPortrait(ch.left, W * 0.24, py, pw, ph, { flip: false, doped: leftDoped, dim: leftActive || !speaker ? 0 : 0.45 });
    storyDrawPortrait(ch.right, W * 0.76, py, pw, ph, { flip: true, doped: rightDoped, dim: rightActive || !speaker ? 0 : 0.45 });
    ctx.textAlign = "center";
    ctx.font = "800 15px " + UI.display;
    ctx.fillStyle = leftActive ? UI.gold : UI.muted;
    ctx.fillText(storyCharName(ch.left), W * 0.24, by - 10);
    ctx.fillStyle = rightActive ? UI.gold : UI.muted;
    ctx.fillText(storyCharName(ch.right), W * 0.76, by - 10);
  }
  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(255,246,232,0.97)";
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, 16); else ctx.rect(bx, by, bw, bh);
  ctx.fill();
  ctx.strokeStyle = UI.stroke; ctx.lineWidth = 3.5; ctx.stroke();
  hit(bx + bw / 2, by + bh / 2, bw, bh, "StoryNext");

  if (line) {
    // typewriter : révèle progressivement
    const full = line.t.length;
    if (!scene.done) {
      scene.reveal = Math.min(full, scene.reveal + 1.6);
      if (scene.reveal >= full) scene.done = true;
    }
    const shown = line.t.slice(0, Math.floor(scene.reveal));
    // nom du locuteur
    const spName = speaker === "narrator" ? "Narrateur" : storyCharName(speaker);
    let spColor = UI.accent;
    if (speaker === "narrator") spColor = "#7a6cff";
    else if (leftActive) spColor = CHARACTERS[storyCharIdx(ch.left)].color;
    else if (rightActive) spColor = CHARACTERS[storyCharIdx(ch.right)].color;
    else if (allyActive) spColor = CHARACTERS[storyCharIdx(ch.ally)].color;
    else if (right2Active) spColor = CHARACTERS[storyCharIdx(ch.right2)].color;
    ctx.fillStyle = spColor;
    ctx.font = "800 15px " + UI.display;
    ctx.fillText(spName, bx + 22, by + 30);
    // texte (wrap)
    ctx.fillStyle = UI.stroke;
    ctx.font = (speaker === "narrator" ? "italic 600 " : "600 ") + "16px " + UI.sans;
    const lines = typeof uiWrapLines === "function" ? uiWrapLines(shown, bw - 44) : [shown];
    for (let i = 0; i < Math.min(3, lines.length); i++) {
      ctx.fillText(lines[i], bx + 22, by + 56 + i * 22);
    }
    // indicateur « continuer »
    if (scene.done && (storySceneFrame % 40) < 26) {
      ctx.fillStyle = UI.accent;
      ctx.textAlign = "right";
      ctx.font = "800 13px " + UI.sans;
      const last = scene.idx >= scene.lines.length - 1;
      ctx.fillText(last ? (scene.phase === "pre" ? "▸ Espace — jouer le match" : "▸ Espace — continuer")
                        : "▸ Espace", bx + bw - 20, by + bh - 14);
      ctx.textAlign = "left";
    }
    // progression dans la scène
    ctx.textAlign = "right";
    ctx.fillStyle = UI.muted;
    ctx.font = "700 11px " + UI.mono;
    ctx.fillText((scene.idx + 1) + "/" + scene.lines.length, bx + bw - 20, by + 26);
    ctx.textAlign = "left";
  }
}

// ---------- Fiche d'intro campagne (bio + infos perso) ----------
const STORY_SOMMET_FICHE = {
  title: "Les Jeux du Sommet",
  nation: "Tournoi mondial",
  map: "9 terrains · 10 dirigeants",
  blurb: "Neuf chapitres croisés entre dirigeants fictifs : d'abord le volley diplomatique, puis le ballon enflammé, enfin la bombe. Chaque match raconte une rivalité, une alliance, un ego. Choisis cette campagne pour l'arc original — ou prends un dirigeant et affronte ses neuf rivaux."
};

function storyWrapLines(text, maxW, font) {
  if (!text) return [];
  ctx.font = font;
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = "";
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; }
    else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

function drawStoryCharIntro() {
  storySceneFrame++;
  const isChar = storyCampaign && storyCampaign.key.indexOf("char:") === 0;
  const key = isChar ? storyCampaign.key.slice(5) : null;
  const fiche = isChar ? storyCharFiche(key) : null;
  const a = fiche && fiche.char;

  menuScreenBase({
    title: isChar ? (fiche.name || "Campagne") : STORY_SOMMET_FICHE.title,
    kicker: isChar ? "Fiche dirigeant · Mode Histoire" : "Campagne originale · Mode Histoire",
    titleSize: 40,
    noEscHint: true
  });

  const mx = UI.mx;
  const leftX = mx + 10;
  const rightX = mx + 280;
  const contentW = W - rightX - mx;

  // Portrait
  const pBox = 210;
  const pcx = leftX + pBox / 2;
  const pcy = 250;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(leftX, pcy - pBox / 2, pBox, pBox, 14);
  else ctx.rect(leftX, pcy - pBox / 2, pBox, pBox);
  ctx.fillStyle = "rgba(255,246,232,0.08)";
  ctx.fill();
  ctx.strokeStyle = (a && a.color) ? a.color : UI.gold;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  if (isChar) {
    storyDrawPortrait(key, pcx, pcy, pBox - 16, pBox - 16, {});
  } else {
    ctx.textAlign = "center";
    ctx.font = "72px " + UI.sans;
    ctx.fillText("🏆", pcx, pcy + 18);
  }

  // Nation + map sous le portrait
  ctx.textAlign = "center";
  ctx.fillStyle = UI.gold;
  ctx.font = "800 13px " + UI.sans;
  const nation = isChar ? fiche.nation : STORY_SOMMET_FICHE.nation;
  const mapName = isChar ? fiche.map : STORY_SOMMET_FICHE.map;
  ctx.fillText(nation || "—", pcx, pcy + pBox / 2 + 28);
  ctx.fillStyle = UI.muted;
  ctx.font = "600 12px " + UI.sans;
  ctx.fillText(mapName || "", pcx, pcy + pBox / 2 + 46);

  // Colonne infos
  let y = 188;
  ctx.textAlign = "left";
  if (a) {
    uiLabel("KIT DE JEU", rightX, y, 11, UI.gold, 1.2);
    y += 18;
    if (typeof drawStatGauge === "function") {
      drawStatGauge(rightX, y + 10, "Vitesse", a.stats.vitesse); y += 22;
      drawStatGauge(rightX, y + 10, "Détente", a.stats.detente); y += 22;
      drawStatGauge(rightX, y + 10, "Puissance", a.stats.puissance); y += 22;
      drawStatGauge(rightX, y + 10, "Contrôle", a.stats.controle); y += 28;
    }
    ctx.fillStyle = UI.ink;
    ctx.font = "700 13px " + UI.sans;
    const traitLines = storyWrapLines(a.trait, contentW, ctx.font);
    traitLines.forEach((l, i) => ctx.fillText(l, rightX, y + i * 16));
    y += traitLines.length * 16 + 14;
    ctx.fillStyle = UI.gold;
    ctx.font = "800 15px " + UI.display;
    ctx.fillText("★ " + a.superName, rightX, y);
    y += 18;
    ctx.fillStyle = "rgba(255,246,232,0.85)";
    ctx.font = "600 12px " + UI.sans;
    const sd = storyWrapLines(a.superDesc, contentW, ctx.font);
    sd.forEach((l, i) => ctx.fillText(l, rightX, y + i * 15));
    y += sd.length * 15 + 18;
  } else {
    uiLabel("9 CHAPITRES CROISÉS", rightX, y, 11, UI.gold, 1.2);
    y += 22;
    ctx.fillStyle = UI.ink;
    ctx.font = "600 14px " + UI.sans;
    ["Acte I — Volley & alliances", "Acte II — Ballon enflammé", "Acte III — Mode Bombe"].forEach((l, i) => {
      ctx.fillText(l, rightX, y + i * 22);
    });
    y += 80;
  }

  // Bio
  uiLabel(isChar ? "HISTOIRE" : "LE TOURNOI", rightX, y, 11, UI.gold, 1.2);
  y += 18;
  const blurb = isChar ? fiche.blurb : STORY_SOMMET_FICHE.blurb;
  ctx.fillStyle = "rgba(255,246,232,0.88)";
  ctx.font = "600 13px " + UI.sans;
  const bioLines = storyWrapLines(blurb, contentW, ctx.font);
  const maxBio = Math.min(bioLines.length, 9);
  for (let i = 0; i < maxBio; i++) ctx.fillText(bioLines[i], rightX, y + i * 17);

  if ((storySceneFrame % 40) < 26) {
    ctx.textAlign = "center";
    ctx.fillStyle = UI.gold;
    ctx.font = "800 14px " + UI.sans;
    ctx.fillText("▸ Espace — voir les chapitres", W / 2, H - 36);
    ctx.textAlign = "left";
  }
  uiLabel("Échap ← campagnes", mx, H - 20, 12, UI.muted, 0.3);
  hit(W / 2, H / 2, W, H, "StoryIntroNext");
}

// ---------- Carte d'intro d'acte ----------
function drawStoryActIntro() {
  storySceneFrame++;
  const act = ACT_META[storyActActive] || ACT_META[1];
  // fond sombre dégradé teinté par la couleur de l'acte
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#0a0e1c");
  g.addColorStop(1, "#12060a");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // grand chiffre romain filigrane
  ctx.save();
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.font = "800 300px " + UI.display;
  ctx.fillStyle = "rgba(255,255,255,0.05)";
  ctx.fillText(act.num, W / 2, H / 2 + 10);
  ctx.restore();

  const bounce = Math.sin(storySceneFrame / 22) * 2;
  ctx.textAlign = "center";
  uiLabel("ACTE " + act.num, W / 2, H / 2 - 78, 15, act.color, 4, "center");
  // titre encré
  if (typeof uiTitleBoxed === "function") {
    uiTitleBoxed(act.title, W / 2, H / 2 - 26 + bounce, W - 160, 52,
                 { align: "center", fill: UI.ink, stroke: UI.stroke, maxLines: 1, minSize: 30 });
  } else {
    ctx.fillStyle = UI.ink; ctx.font = "800 48px " + UI.display;
    ctx.fillText(act.title, W / 2, H / 2 - 20);
  }
  // tagline
  ctx.fillStyle = UI.muted; ctx.font = "italic 600 16px " + UI.sans;
  ctx.fillText(act.tagline, W / 2, H / 2 + 30);
  // liste des chapitres de l'acte
  const chs = STORY.map((c, i) => ({ c, i })).filter(o => o.c.act === storyActActive);
  const names = chs.map(o => o.c.title).join("   ·   ");
  ctx.fillStyle = "rgba(255,246,232,0.5)"; ctx.font = "700 12px " + UI.sans;
  ctx.fillText(names, W / 2, H / 2 + 66);

  if ((storySceneFrame % 40) < 26) {
    ctx.fillStyle = act.color; ctx.font = "800 14px " + UI.sans;
    ctx.fillText("▸ Espace — commencer l'acte", W / 2, H - 48);
  }
  ctx.textAlign = "left";
  hit(W / 2, H / 2, W, H, "StoryActNext");
}

// ---------- Écran de fin de campagne ----------
function drawStoryEnding() {
  storySceneFrame++;
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#0a0e1c");
  g.addColorStop(1, "#1a1206");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  const isChar = storyCampaign && storyCampaign.key.indexOf("char:") === 0;
  const heroKey = isChar ? storyCampaign.key.slice(5) : null;
  const heroName = isChar ? storyCharName(heroKey) : null;

  ctx.textAlign = "center";
  const bounce = Math.sin(storySceneFrame / 20) * 3;
  uiLabel(isChar ? ("CAMPAGNE DE " + heroName).toUpperCase() : "LES JEUX DU SOMMET",
          W / 2, 96, 14, UI.gold, 4, "center");
  if (typeof uiTitleBoxed === "function") {
    uiTitleBoxed(isChar ? "Sommet remporté" : "Les Jeux sont sauvés", W / 2, 150 + bounce, W - 160, 52,
                 { align: "center", fill: UI.ink, stroke: UI.stroke, maxLines: 1, minSize: 26 });
  }
  // trophée stylisé
  ctx.font = "64px " + UI.sans;
  ctx.fillText("🏆", W / 2, 236);

  const epilogue = isChar ? [
    heroName + " a défait ses neuf rivaux,",
    "du match amical au duel-bombe des grands soirs.",
    "Le monde applaudit, grince des dents, ou tremble —",
    "mais le trophée du Sommet est à " + heroName + ".",
  ] : [
    "La machine rouge est tombée en finale.",
    "Le monde a retenu son souffle, puis applaudi.",
    "Le sport, fragile et imparfait, tient encore debout —",
    "jusqu'au prochain Sommet.",
  ];
  ctx.fillStyle = UI.ink; ctx.font = "600 17px " + UI.sans;
  epilogue.forEach((l, i) => ctx.fillText(l, W / 2, 288 + i * 26));

  ctx.fillStyle = UI.muted; ctx.font = "italic 600 13px " + UI.sans;
  ctx.fillText("Merci d'avoir joué. Les chapitres restent rejouables depuis le hub.",
               W / 2, 288 + epilogue.length * 26 + 18);

  if ((storySceneFrame % 40) < 26) {
    ctx.fillStyle = UI.gold; ctx.font = "800 14px " + UI.sans;
    ctx.fillText("▸ Espace — retour au sommaire", W / 2, H - 42);
  }
  ctx.textAlign = "left";
  hit(W / 2, H / 2, W, H, "StoryEndNext");
}

// chargé une fois le roster connu
if (typeof storyLoadProgress === "function") storyLoadProgress();
