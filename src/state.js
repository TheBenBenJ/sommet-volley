// sommet-volley · état & données — terrains, personnages, Blob, combos/supers
"use strict";

// ---------- Terrains et personnages ----------
// chaque terrain appartient à un perso (voir CHARACTERS) : son public des
// tribunes est composé de ce perso, et le nom du terrain lui rend hommage.
const TERRAINS = [
  { key: "place-ecarlate",    name: "Place Écarlate",          character: 0 }, // Volkoï / Bourassie
  { key: "country-club-dore",    name: "Country Club Doré",       character: 1 }, // Baron Dorf / Doria
  { key: "palais-gallard",  name: "Palais Gallard",           character: 2 }, // Le Cygne / Gallardie
  { key: "esplanade-du-defile",   name: "Esplanade du Défilé",     character: 3 }, // Maréchal Bébé / Ryonganie
  { key: "cite-du-matin",    name: "Cité du Matin",           character: 4 }, // Grand Timonier / Panguo
  { key: "pont-des-deux-mondes", name: "Pont des Deux Mondes",    character: 5 }, // Le Sultan / Bosforie
  { key: "stade-ashram",   name: "Stade Ashram",            character: 6 }, // Le Gourou / Bharatie
  { key: "grande-foret",   name: "Grande Forêt",            character: 7 }, // Le Capitaine / Tropicalia
  { key: "citadelle-du-levant",  name: "Citadelle du Levant",     character: 8 }, // Le Faucon / Levantie
  { key: "jardin-des-roses", name: "Jardin des Roses",         character: 9 }  // Le Safran / Ramenie
];
let terrain = 0;

// Ballon unique : cartoon PNG (volley violet / crème).
const BALL_SKINS = [
  { key: "purple", name: "Cartoon", sprite: "ballPurple" },
];
let ballSkin = 0;

const CHARACTERS = [
  // Casting satirique Sommet Volley — fiches docs/chars/*.yaml
  // stats /5 + multiplicateurs moteur (speed, jump, power, control)
  {
    key: "volkoi", name: "Tsar Volkoï", nation: "Bourassie",
    color: "#b43a2e", darkColor: "#7a281e",
    stats: { vitesse: 3, detente: 3, puissance: 4, controle: 4 },
    speed: 1.06, jump: 1.06, power: 1.18, control: 0.91,
    coldProof: true,
    trait: "Sang froid : insensible au gel / ralentissement.",
    superName: "Hiver Général",
    superDesc: "Gèle le camp adverse ~5 s : ils glissent sur la glace. Visuel : voile bleu glacial + flocons sur leur moitié."
  },
  {
    key: "dorf", name: "Baron Dorf", nation: "Doria",
    color: "#f0a060", darkColor: "#c97838",
    stats: { vitesse: 3, detente: 2, puissance: 4, controle: 3 },
    speed: 1.06, jump: 0.94, power: 1.18, control: 0.82,
    egoCharge: true, slip: true,
    trait: "Ego en béton : la jauge SUPER monte aussi quand il perd un point.",
    superName: "Le Mur",
    superDesc: "Mur doré dans le camp adverse ~5,3 s : bloque les courses au sol (il faut sauter pour passer). Visuel : colonne d’or + halo au pied."
  },
  {
    key: "cygne", name: "Le Cygne", nation: "Gallardie",
    color: "#3d5afe", darkColor: "#1a237e",
    stats: { vitesse: 4, detente: 3, puissance: 3, controle: 4 },
    speed: 1.18, jump: 1.06, power: 1.06, control: 0.91,
    swapStats: true,
    trait: "Double jeu : après chaque point, échange vitesse ↔ puissance.",
    superName: "Passage en Force",
    superDesc: "~5 s : tes frappes ne peuvent plus être smashées, et partent plus franchement vers l’adversaire. Visuel : aura bleue."
  },
  {
    key: "bebe", name: "Maréchal Bébé", nation: "Ryonganie",
    color: "#2d3a2e", darkColor: "#1a241c",
    stats: { vitesse: 3, detente: 2, puissance: 4, controle: 3 },
    speed: 1.06, jump: 0.94, power: 1.18, control: 0.82,
    trait: "Discipline : puissance solide, jeu au sol privilégié.",
    superName: "Batterie AA",
    superDesc: "Interdit de sauter au camp adverse ~3,7 s — collés au sol. Visuel : bande rouge + pulses d’alerte."
  },
  {
    key: "timonier", name: "Le Grand Timonier", nation: "Panguo",
    color: "#c62828", darkColor: "#8e0000",
    stats: { vitesse: 3, detente: 3, puissance: 3, controle: 5 },
    speed: 1.06, jump: 1.06, power: 1.06, control: 1.0,
    trait: "Mur invisible : contrôle max, placements précis.",
    superName: "Le Rempart",
    superDesc: "Mur dans le camp adverse ~6 s : coupe le terrain (durée longue). Visuel : rempart doré lumineux."
  },
  {
    key: "sultan", name: "Le Sultan", nation: "Bosforie",
    color: "#6a1b9a", darkColor: "#4a148c",
    stats: { vitesse: 3, detente: 4, puissance: 3, controle: 3 },
    speed: 1.06, jump: 1.18, power: 1.06, control: 0.82,
    trait: "Séisme : détente élevée, bons smashs aériens.",
    superName: "Séisme",
    superDesc: "Interdit de sauter au camp adverse ~3,7 s. Visuel : tremblement d’écran + bande rouge au sol."
  },
  {
    key: "gourou", name: "Le Gourou", nation: "Bharatie",
    color: "#ef6c00", darkColor: "#e65100",
    stats: { vitesse: 4, detente: 3, puissance: 3, controle: 4 },
    speed: 1.18, jump: 1.06, power: 1.06, control: 0.91,
    trait: "Ashram : rapide et technique, smashs dans la moyenne.",
    superName: "Méditation",
    superDesc: "Gèle le camp adverse ~4,7 s (glisse). Visuel : voile clair + particules, façon Hiver zen."
  },
  {
    key: "capitaine", name: "Le Capitaine", nation: "Tropicalia",
    color: "#2e7d32", darkColor: "#1b5e20",
    stats: { vitesse: 3, detente: 2, puissance: 5, controle: 2 },
    speed: 1.06, jump: 0.94, power: 1.28, control: 0.75,
    egoCharge: true,
    trait: "Tronçonneuse : puissance max, SUPER aussi en perdant un point.",
    superName: "Déforestation",
    superDesc: "Mur de troncs au camp adverse ~5,3 s : bloque les courses. Visuel : mur forêt + lueur verte."
  },
  {
    key: "faucon", name: "Le Faucon", nation: "Levantie",
    color: "#556270", darkColor: "#333b45",
    stats: { vitesse: 3, detente: 3, puissance: 4, controle: 3 },
    speed: 1.06, jump: 1.06, power: 1.18, control: 0.82,
    trait: "Raid : puissance correcte, pression aérienne.",
    superName: "Raid Éclair",
    superDesc: "Interdit de sauter au camp adverse ~3,7 s — collés au sol. Visuel : bande d’alerte au sol."
  },
  {
    key: "safran", name: "Le Safran", nation: "Ramenie",
    color: "#c45c26", darkColor: "#8a3d14",
    stats: { vitesse: 3, detente: 3, puissance: 3, controle: 4 },
    speed: 1.06, jump: 1.06, power: 1.06, control: 0.91,
    trait: "Safran : contrôle élevé, jeu posé.",
    superName: "Voile d’Or",
    superDesc: "Ralentit fortement le camp adverse ~4,7 s (courses au ralenti, pas de glisse). Visuel : voile doré."
  },
];
function charOf(b) { return CHARACTERS[b.charId]; }

// Charge les manifests sprites (char-sprites.js) une fois le roster connu
if (typeof initCharSprites === "function") initCharSprites();

function characterIndices() {
  return CHARACTERS.map((_, i) => i);
}
function terrainIndices() {
  return TERRAINS.map((_, i) => i);
}
/** Persos déjà pris (sélection locale P2, ou liste reçue de l'hôte en ligne). */
let peerTakenCharacters = [];
function takenCharacterSet() {
  const taken = new Set();
  if (typeof state !== "undefined" && state === "selectCharacter") {
    // Multi local : le joueur 2 ne peut pas reprendre le choix du joueur 1
    if (selPlayer === 1 && !(typeof pendingMode !== "undefined" && pendingMode && pendingMode.online)) {
      taken.add(blobL.charId);
    }
    // En ligne (invité) : exclus les persos déjà réservés par l'hôte / autres
    if (typeof pendingMode !== "undefined" && pendingMode && pendingMode.online &&
        typeof netRole !== "undefined" && netRole === "guest") {
      for (const a of peerTakenCharacters) taken.add(a | 0);
    }
  }
  return taken;
}
function randomCharacterIdx(exclude) {
  // choix de menu, hors simulation : Math.random() (pas le rng seedé du jeu)
  const ex = new Set(exclude || []);
  const idx = characterIndices().filter(i => !ex.has(i));
  if (!idx.length) return characterIndices()[0] | 0;
  return idx[Math.floor(Math.random() * idx.length)];
}
// valide un indice de perso reçu du réseau
function clampCharacterIdx(v) {
  return Math.max(0, Math.min(CHARACTERS.length - 1, v | 0));
}

// ---------- Identité des camps ----------
function sideName(side) { return side === 0 ? "Gauche" : "Droite"; }
// nom affiché PENDANT le jeu : le nom du perso en 1v1, ou l'équipe en 2v2.
function sideLabel(side) {
  if (mode === "2v2") return side === 0 ? "Équipe 1" : "Équipe 2";
  const b = side === 0 ? blobL : blobR;
  return CHARACTERS[b.charId].name;
}
function sideColor(side) {
  const b = side === 0 ? blobL : blobR;
  const a = CHARACTERS[b.charId];
  return (a && a.color) || (side === 0 ? "#e8913b" : "#4db3ff");
}

// ---------- État du jeu ----------
// state: "menu" | "aiDifficulty" | "gameModeSelect" | "rules" | "credits" | "tutorialHelp"
//        | "selectCharacter" | "selectTerrain" | "serve" | "play" | "point" | "gameover"
//        | états du mode en ligne : "onlineMenu" | "joinEntry" | "hostWait"
//          | "connecting" | "netWait" | "netError"
// Flux du menu : menu → soloMenu (Histoire | Amical | Tournoi)
//                     | multiMenu (Local | En ligne → onlineMenu)
//              Amical : aiDifficulty → gameModeSelect → teamFormat → …
//              Local  : gameModeSelect (1v1) → …
//              → selectCharacter → selectTerrain → partie
//                     | Tutoriel (partie guidée) / Aide commandes / Règles / Crédits
let state = "menu";
let vsAI = true;
let pointTimer = 0;
let serveCountdown = 0;   // décompte avant service (ticks)
let pointMsg = "";
let paused = false;
let celebT = 0;           // ticks depuis le début de la célébration (point / fin)
let gameoverTimer = 0;    // ticks restants avant skip fin de match
let shake = 0;                 // intensité du tremblement d'écran
let muted = false;
let noFx = false;             // coupe sons/particules (re-simulations réseau)
const scorePop = [0, 0];       // animation du score qui grossit
const particles = [];          // plumes et sable
// --- éléments purement visuels (hors simulation, non synchronisés) ---
let crowdHype = 0;             // ferveur du public (pic sur point/smash), décroît
let prevCrowdHype = 0;         // détection du front montant → ola sonore
const emotes = [null, null];   // bulle d'émotion au-dessus de chaque joueur

// --- Tutoriel jouable ---
let tutorialMode = false;      // partie guidée en cours
let tutorialStep = 0;          // étape coach (0..)
let tutorialInviteOpen = false; // modal 1ʳᵉ visite sur le menu
let tutorialInviteSessionDismissed = false; // « Plus tard » cette session
let tutorialDone = false;      // persisté — ne plus inviter auto
const TUTORIAL_DONE_KEY = "sommetTutorialDone";

function loadTutorialDone() {
  try {
    tutorialDone = localStorage.getItem(TUTORIAL_DONE_KEY) === "1";
  } catch (e) { tutorialDone = false; }
}
function markTutorialDone() {
  tutorialDone = true;
  try { localStorage.setItem(TUTORIAL_DONE_KEY, "1"); } catch (e) {}
}
function shouldShowTutorialInvite() {
  return state === "menu" && !tutorialDone && !tutorialInviteSessionDismissed;
}
function matchWinScore() {
  if (tutorialMode) return TUTORIAL_WIN_SCORE;
  if (typeof tournamentActive !== "undefined" && tournamentActive) return TOURNAMENT_WIN_SCORE;
  return WIN_SCORE;
}

let pendingMode = null;        // mode choisi au menu, en attente des sélections
let selPlayer = 0;             // quel joueur choisit son perso

const AI_LEVELS = [
  // PAS de speedMul / powerMul : l'IA joue avec les stats du perso (comme un humain).
  // La difficulté = décisions (erreur, réaction, rush, aim…), pas des buffs physiques.
  // rush : propension à foncer au filet pour provoquer un Smash Battle
  // attack : décalage derrière la balle pour viser franchement le camp adverse
  // react : anticipation (0=lent, 1=parfait) · dbl : utilise le double saut
  // aim : 1 = place ses frappes LOIN de l'adversaire (drive profond / amorti court)
  // Grille volontairement molle : Facile rate beaucoup ; Impitoyable ≈ ancienne Normale+.
  { name: "Facile",      err: 105, rush: 0.01, attack: 1,  react: 0.08, dbl: false, aim: 0 },
  { name: "Normale",     err: 80,  rush: 0.02, attack: 2,  react: 0.16, dbl: false, aim: 0 },
  { name: "Difficile",   err: 55,  rush: 0.05, attack: 3,  react: 0.28, dbl: false, aim: 0 },
  { name: "Impitoyable", err: 34,  rush: 0.14, attack: 7,  react: 0.45, dbl: true,  aim: 0 }
];
let aiLevel = 1;
let aiErr = 0, aiErrTimer = 0;  // erreur de placement volontaire de l'IA
let aiRush = false;             // envie du moment : provoquer un duel au filet

// Mode triche X : seul endroit où on accélère volontairement un blob.
const X_LEVEL = { name: "X", speedMul: 1.2, err: 0, rush: 1, attack: 30, react: 1, dbl: true, aim: 1 };
const xOn = [false, false, false, false];

const scores = [0, 0]; // [gauche, droite]
let servingSide = 0;   // 0 = gauche, 1 = droite
let tick = 0;          // compteur de ticks de simulation (jamais l'horloge murale !)

// ---------- Smash Battle ----------
// Quand les deux joueurs sautent au filet en même temps avec la balle proche,
// le temps se fige : duel de martelage (touche SAUT). Le plus rapide déclenche
// un smash destructeur. Entièrement simulé dans stepGame à partir des entrées :
// déterministe, donc synchronisé tel quel en ligne.
const battle = {
  active: false, t: 0, count: [0, 0],
  prevJump: [false, false], cooldown: 0
};

// ---------- Combos & techniques signature ----------
// Chaque camp charge un SUPER en gagnant SUPER_NEED points d'affilée.
//   Volkoï → Hiver Général · Dorf → Le Mur · Cygne → Passage en Force · Bébé → Batterie AA
//   Timonier → Le Rempart · Sultan → Séisme · Gourou → Méditation · Capitaine → Déforestation
const SUPER_NEED = 3;
const SUPER_FLASH_T = 240;      // ~4 s pour lire nom + description
const SUPER_READY_FLASH_T = 180; // ~3 s quand la jauge est prête
const streak = [0, 0];        // points d'affilée par camp
const superCharge = [0, 0];   // 0 = vide, 1 = super prête
// Super Smash (tous persos) : jauge 0..POWER_GAUGE_MAX, indépendante du SUPER perso
const powerGauge = [0, 0];
/** Freeze + dosage : { side, t, charge, ang } — null si inactif */
let powerWindup = null;
const SUPER_DUR = {
  volkoi: 300,     // Hiver Général ~5 s
  dorf: 320,       // Le Mur ~5,3 s (+ egoCharge)
  cygne: 300,      // Passage en Force ~5 s
  bebe: 220,       // Batterie AA ~3,7 s (noground court)
  timonier: 360,   // Le Rempart ~6 s (compense pas d’egoCharge)
  sultan: 220,     // Séisme ~3,7 s
  gourou: 280,     // Méditation ~4,7 s
  capitaine: 320,  // Déforestation ~5,3 s (+ egoCharge)
  faucon: 220,     // Raid Éclair ~3,7 s
  safran: 280      // Voile d’Or ~4,7 s (slow)
};
/** Multiplicateur de course sous Voile d’Or (kind "slow"). */
const SUPER_SLOW_MUL = 0.55;

// Effets de zone SUPER (Phase 4 — stubs jouables pour le pilote)
// { kind, side, t, data } — side = camp qui subit / où est l'effet
let superEffects = [];
let superFlash = "";          // titre SUPER (nom)
let superFlashSub = "";       // explication courte
let superFlashT = 0;
// Bannière événements de map (canon / cortège…)
let mapEventFlash = "";
let mapEventFlashSub = "";
let mapEventFlashT = 0;

class Blob {
  constructor(side, color, darkColor) {
    this.side = side;               // 0 gauche, 1 droite
    this.color = color;
    this.darkColor = darkColor;
    this.homeX = side === 0 ? W * 0.25 : W * 0.75;
    this.speedMul = 1;
    this.charId = 0;
    this.reset();
  }
  reset() {
    this.x = this.homeX;
    this.y = GROUND_Y;
    this.vx = 0;
    this.vy = 0;
    this.dispVx = 0;      // vitesse lissée (inertie / dérapage Trompette)
    this.onGround = true;
    this.squash = 0; // animation d'écrasement
    this.walkPhase = 0;
    this.scramble = 0;       // patinage (Trompette)
    this.jumpsUsed = 0;      // 0 sol, 1 après saut, 2 après double saut
    this.prevJump = false;   // front montant (double saut)
    this.superT = 0;         // ticks restants de technique
    this.superKind = "";
    this.superSmash = false;
    this.prevSuper = false;
    this.prevSmashBtn = false;
    this._jumpEdge = false;
    this._serveAwaitRelease = false;
    this.lastActiveHitTick = -999;
    this._input = null;
    this.poseAnim = "";      // smash | panic (override sprite)
    this.poseT = 0;
    this.poseDur = 0;
    this._faceRight = this.side === 0; // orientation visuelle (suit le déplacement)
    this._celebHop = 0;      // petit saut de joie après un point
    this.battleStunT = 0;    // stun post Smash Battle (perdant)
    this.flameHp = (typeof FLAME_HP_MAX !== "undefined") ? FLAME_HP_MAX : 9;
    this.flameIgniteT = 0;   // ticks restants d'embrasement (mode flamme, PV à 0)
    this.charredT = 0;       // ticks restants noirci (explosion mode Bombe)
  }
  // deux cercles de collision : corps + tête (alignés sur le dessin)
  get bodyCircle() { return { x: this.x, y: this.y - 30, r: 28 }; }
  get headCircle() { return { x: this.x, y: this.y - 64, r: 22 }; }

  update(input) {
    const a = charOf(this);
    if (this.poseT > 0) {
      this.poseT--;
      if (this.poseT <= 0) { this.poseAnim = ""; this.poseDur = 0; }
    }
    if (this.flameIgniteT > 0) this.flameIgniteT--;
    if (this.charredT > 0) this.charredT--;
    // Stun post-duel : pas de contrôle, juste l'inertie du knockback
    if (this.battleStunT > 0) {
      this.battleStunT--;
      input = { left: false, right: false, jump: false, smash: false, super: false, ax: 0, ay: 0 };
      this._input = input;
      this._smashEdge = false;
      this.prevSmashBtn = false;
      this._jumpEdge = false;
      this.prevJump = false;
      this.vx *= 0.88;
      this.dispVx = this.vx;
      if (!this.onGround) this.vy += GRAV_BLOB;
      this.x += this.vx;
      this.y += this.vy;
      const half = 34;
      let minX = this.side === 0 ? half : NET_X + NET_W / 2 + half - 6;
      let maxX = this.side === 0 ? NET_X - NET_W / 2 - half + 6 : W - half;
      this.x = Math.max(minX, Math.min(maxX, this.x));
      if (this.y >= GROUND_Y) {
        this.y = GROUND_Y;
        this.vy = 0;
        this.onGround = true;
        this.jumpsUsed = 0;
        this.vx *= 0.5;
        this.dispVx = this.vx;
      }
      if (this.squash > 0) this.squash -= 0.5;
      return;
    }
    this._input = input || null;
    const smashDown = !!(input && input.smash);
    this._smashEdge = smashDown && !this.prevSmashBtn;
    this.prevSmashBtn = smashDown;
    // Service : dès que X/F est relâché après le lancer, on peut frapper
    if (this._serveAwaitRelease && !smashDown) this._serveAwaitRelease = false;

    const grip = groundGrip(this); // 1 sec, <1 pluie / Hiver Général

    this.vx = 0;
    const kitSp = this.kitSpeed != null ? this.kitSpeed : a.speed;
    let sp = BLOB_SPEED * this.speedMul * kitSp * grip;
    // Voile d’Or : ralentit les courses (sauf Sang froid)
    if (typeof hasSuperEffect === "function" && hasSuperEffect("slow", this.side) &&
        !(a && a.coldProof)) {
      sp *= (typeof SUPER_SLOW_MUL === "number" ? SUPER_SLOW_MUL : 0.55);
    }
    if (input.left)  this.vx = -sp;
    if (input.right) this.vx =  sp;

    // dérapage (Trompette) : la vitesse affichée rattrape la consigne avec inertie
    if (a.slip) {
      this.dispVx += (this.vx - this.dispVx) * 0.07;
      if (Math.abs(this.dispVx) < 0.05) this.dispVx = 0;
    } else {
      this.dispVx = this.vx;
    }
    const moveVx = a.slip ? this.dispVx : this.vx;

    // Marche : avancer le cycle dès qu'on veut bouger (slip) ou qu'on glisse.
    // Sinon Trompette reste bloqué / alterne idle↔walk sur 1–2 frames.
    const wantWalk = this.onGround && (
      Math.abs(this.vx) > 0.01 || Math.abs(moveVx) > 0.12
    );
    if (wantWalk) {
      const scrambling = a.slip;
      this.scramble = scrambling ? 1 : 0;
      // Cycle 4 frames (appui → passage → appui → passage) : 1 frame / 6 ticks
      // (plus lisible que /8, surtout sur packs à 4 frames)
      this._walkTick = (this._walkTick || 0) + 1;
      if (this._walkTick % 6 === 0) this.walkPhase += 1;
      if (Math.random() < (scrambling ? 0.35 : 0.1)) {
        spawnSand(this.x - Math.sign(this.vx || moveVx) * 12, GROUND_Y, 1);
      }
    } else {
      this.scramble = 0;
      this._walkTick = 0;
    }
    // Service : pas de saut avec la balle en mains, ni pendant la grâce post-lancer
    // (anti X/F + saut la même frame). Ensuite saut normal — y compris en montée
    // pour un service aérien à la manette.
    const serveHands = typeof GAMEPLAY_V2 !== "undefined" && GAMEPLAY_V2 &&
      typeof ball !== "undefined" && this.side === servingSide &&
      ball.inHands && ball.frozen;
    const serveTossLock = typeof GAMEPLAY_V2 !== "undefined" && GAMEPLAY_V2 &&
      typeof ball !== "undefined" && this.side === servingSide &&
      !ball.inHands && ball.serveAimLock && (ball.tossGrace | 0) > 0;
    const serveNoJump = serveHands || serveTossLock;
    const holdingJump = !!(input && input.jump);
    // Front de saut CLAVIER (touche réelle, non bloqué par serveNoJump ni par le
    // drift d'une manette au repos) : sert au service clavier (keyboardJumpServe).
    const kbdJumpNow = !!(input && input.kbdJump);
    this._kbdJumpEdge = kbdJumpNow && !this._kbdPrevJump;
    this._kbdPrevJump = kbdJumpNow;
    const jumpIn = holdingJump && !serveNoJump;
    const jumpPressed = jumpIn && !this.prevJump; // front montant
    this._jumpEdge = jumpPressed;
    this.prevJump = jumpIn || (serveNoJump && holdingJump);
    // Batterie AA (Bébé) : camp ciblé ne peut plus sauter
    const noJump = typeof hasSuperEffect === "function" && hasSuperEffect("noground", this.side);
    if (!noJump && !serveNoJump && this.onGround && jumpIn) {
      this.vy = BLOB_JUMP * a.jump * (0.85 + grip * 0.15);
      this.onGround = false;
      this.jumpsUsed = 1;
      beep(220, 0.05, "sine", 0.06);
    } else if (!noJump && jumpPressed && !this.onGround && this.jumpsUsed < 2) {
      this.vy = BLOB_JUMP * a.jump * DOUBLE_JUMP_MUL;
      this.jumpsUsed = 2;
      spawnAirPuff(this.x, this.y - 6);
      beep(330, 0.07, "sine", 0.09, 0, 520);
    }
    if (!this.onGround) this.vy += GRAV_BLOB;

    this.x += moveVx;
    this.y += this.vy;

    // limites : chaque joueur reste de son côté du filet
    const half = 34;
    let minX = this.side === 0 ? half : NET_X + NET_W / 2 + half - 6;
    let maxX = this.side === 0 ? NET_X - NET_W / 2 - half + 6 : W - half;
    // Le Mur (Trompette / Panda / Jair) : barrière one-way au sol.
    // On se base sur la position AVANT le pas : si on était derrière, on ne
    // traverse pas en marchant ; si on a déjà sauté de l’autre côté, on ne
    // reclame pas (pas de téléport à l’atterrissage).
    if (this.onGround && typeof hasSuperEffect === "function") {
      const wall = hasSuperEffect("wall", this.side);
      if (wall) {
        // Plus près du filet + épaisseur : sauter pour passer = vrai engagement
        const wallX = this.side === 0 ? NET_X * 0.58 : NET_X + (W - NET_X) * 0.42;
        const thick = 10;
        const prevX = this.x - moveVx;
        if (this.side === 0) {
          if (prevX <= wallX + thick) maxX = Math.min(maxX, wallX);
        } else if (prevX >= wallX - thick) {
          minX = Math.max(minX, wallX);
        }
      }
    }
    if (this.x <= minX || this.x >= maxX) this.dispVx = 0;
    this.x = Math.max(minX, Math.min(maxX, this.x));

    if (this.y >= GROUND_Y) {
      if (!this.onGround) {
        this.squash = 6;
        spawnSand(this.x, GROUND_Y, 6);
      }
      this.y = GROUND_Y;
      this.vy = 0;
      this.onGround = true;
      this.jumpsUsed = 0; // le double saut se recharge au sol
    }
    if (this.squash > 0) this.squash -= 0.5;
  }

  draw() { drawCharacter(this); }
}

const blobL = new Blob(0, "#e84545", "#b32e2e");
const blobR = new Blob(1, "#4caf50", "#357a38");
// coéquipiers du mode 2v2 (deuxième joueur de chaque camp)
const blob2L = new Blob(0, "#ff8a3d", "#d1651e"); // équipe gauche, orange
const blob2R = new Blob(1, "#3d8bff", "#245fd1"); // équipe droite, bleu

// ---------- Mode de jeu (1v1 / 2v2) ----------
// activeBlobs = la liste des joueurs réellement en piste. En 1v1 c'est
// [blobL, blobR] → tout le code existant (online/solo) reste identique.
// En 2v2 on ajoute les deux coéquipiers ; ils partagent leur demi-terrain et
// se TRAVERSENT (aucune collision entre coéquipiers, demandé par le joueur).
let mode = "1v1";                 // "1v1" | "2v2"
let activeBlobs = [blobL, blobR];

// ---------- Mode Bombe (variante 1v1) ----------
// La balle devient une bombe : elle explose au bout de BOMB_TIME ticks OU si
// elle touche le sol. Dans les deux cas, le camp où se trouve la bombe perd le
// point. bombTimer est décompté en TICKS (déterministe → compatible en ligne).
let bombMode = false;             // règle « patate chaude » activée ?
let bombTimer = 0;                // ticks restants avant explosion
let bombFlash = 0;                // éclair d'explosion plein écran (visuel, 1→0)
let bombTime = BOMB_TIME;         // durée de mèche choisie (ticks) : 5/7/10 s
// options du menu « Durée de la bombe » (300/420/600 ticks à 60 Hz)
const BOMB_DURATIONS = [
  { secs: 5,  ticks: 300 },
  { secs: 7,  ticks: 420 },
  { secs: 10, ticks: 600 }
];

// ---------- Mode Ballon enflammé ----------
// La balle est toujours en feu. Chaque touche retire 1 PV au joueur qui frappe.
// PV à 0 → embrasement + perte du point. Score / sol sinon inchangés.
let flameMode = false;

// Soft ownership 1v1 : l'invité différé awardPoint → l'hôte valide (anti-divergence).
let netDeferScore = false;
let pendingNetPoint = null;       // { side, reason, seq } | null
let ballScoreLock = false;        // invité : point armé → physique balle figée
let netPtSeq = 0;                 // séquence monotone des points différés

function setMode(m) {
  mode = m;
  if (m === "2v2") {
    activeBlobs = [blobL, blob2L, blobR, blob2R]; // 0,1 = équipe gauche ; 2,3 = droite
    blobL.homeX  = W * 0.14; blob2L.homeX = W * 0.37; // avant / arrière à gauche
    blobR.homeX  = W * 0.86; blob2R.homeX = W * 0.63; // avant / arrière à droite
  } else {
    activeBlobs = [blobL, blobR];
    blobL.homeX = W * 0.25; blobR.homeX = W * 0.75;
  }
}

