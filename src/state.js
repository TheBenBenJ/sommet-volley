// sommet-volley · état & données — terrains, personnages, Blob, combos/supers
"use strict";

// ---------- Terrains et personnages ----------
// chaque terrain appartient à un perso (voir CHARACTERS) : son public des
// tribunes est composé de ce perso, et le nom du terrain lui rend hommage.
const TERRAINS = [
  { key: "neige",    name: "Place Grand-Rouge",       character: 0 }, // Vladou
  { key: "plage",    name: "Pelouse Oval",            character: 1 }, // Trompette
  { key: "prairie",  name: "Palais de l'Hexagone",    character: 2 }, // Micron
  { key: "parade",   name: "Esplanade du Défilé",     character: 3 }, // Houn
  { key: "matin",    name: "Place du Matin",          character: 4 }, // Panda
  { key: "bosphore", name: "Palais du Bosphore",      character: 5 }, // Sultan
  { key: "ashram",   name: "Stade Ashram",            character: 6 }, // Yogi
  { key: "amazon",   name: "Amazonie Dorée",          character: 7 }  // Jair
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
    key: "vladou", name: "Tsar Vladou",
    color: "#b43a2e", darkColor: "#7a281e",
    stats: { vitesse: 3, detente: 3, puissance: 4, controle: 4 },
    speed: 1.06, jump: 1.06, power: 1.18, control: 0.91,
    coldProof: true,
    trait: "Sang froid : insensible au gel / ralentissement.",
    superName: "Hiver Général",
    superDesc: "Gèle le camp adverse ~6 s : ils glissent comme sur de la glace. Visuel : voile bleu glacial + flocons qui tombent sur leur moitié."
  },
  {
    key: "trompette", name: "Ronald Trompette",
    color: "#f0a060", darkColor: "#c97838",
    stats: { vitesse: 3, detente: 2, puissance: 4, controle: 3 },
    speed: 1.06, jump: 0.94, power: 1.18, control: 0.82,
    egoCharge: true, slip: true,
    trait: "Ego en béton : la jauge SUPER monte aussi quand il perd un point.",
    superName: "Le Mur",
    superDesc: "Mur doré au milieu du camp adverse ~5 s : bloque les courses au sol (sauter par-dessus pour passer). Visuel : colonne d’or lumineuse + halo au pied du mur."
  },
  {
    key: "micron", name: "Manu Micron",
    color: "#3d5afe", darkColor: "#1a237e",
    stats: { vitesse: 4, detente: 3, puissance: 3, controle: 4 },
    speed: 1.18, jump: 1.06, power: 1.06, control: 0.91,
    swapStats: true,
    trait: "En même temps : après chaque point, échange vitesse ↔ puissance.",
    superName: "49.3",
    superDesc: "~4 s : tes frappes ne peuvent plus être smashées en retour. Visuel : aura bleue autour de toi pendant l’effet."
  },
  {
    key: "houn", name: "Kim Jong Houn",
    color: "#2d3a2e", darkColor: "#1a241c",
    stats: { vitesse: 3, detente: 2, puissance: 4, controle: 3 },
    speed: 1.06, jump: 0.94, power: 1.18, control: 0.82,
    clapDouble: true,
    trait: "Applaudissements : SUPER chargé en 2 points d'affilée.",
    superName: "Batterie AA",
    superDesc: "Interdit de sauter au camp adverse ~5 s — collés au sol. Visuel : bande rouge au sol + pulses d’alerte sur leur camp."
  },
  {
    key: "panda", name: "Président Panda",
    color: "#c62828", darkColor: "#8e0000",
    stats: { vitesse: 3, detente: 3, puissance: 3, controle: 5 },
    speed: 1.06, jump: 1.06, power: 1.06, control: 1.0,
    trait: "Mur invisible : contrôle max, placements précis.",
    superName: "Grande Muraille",
    superDesc: "Mur au milieu du camp adverse ~5 s : coupe le terrain en deux. Visuel : même muraille dorée lumineuse que Le Mur."
  },
  {
    key: "sultan", name: "Recep Sultan",
    color: "#6a1b9a", darkColor: "#4a148c",
    stats: { vitesse: 3, detente: 4, puissance: 3, controle: 3 },
    speed: 1.06, jump: 1.18, power: 1.06, control: 0.82,
    trait: "Séisme : détente élevée, bons smashs aériens.",
    superName: "Séisme",
    superDesc: "Interdit de sauter au camp adverse ~5 s. Visuel : tremblement d’écran + bande rouge d’alerte au sol (comme Batterie AA)."
  },
  {
    key: "yogi", name: "Narendra Yogi",
    color: "#ef6c00", darkColor: "#e65100",
    stats: { vitesse: 4, detente: 3, puissance: 2, controle: 4 },
    speed: 1.18, jump: 1.06, power: 0.94, control: 0.91,
    trait: "Ashram : rapide et technique, peu de puissance brute.",
    superName: "Méditation",
    superDesc: "Gèle le camp adverse ~5 s (glisse extrême). Visuel : voile clair + particules, façon Hiver Général zen."
  },
  {
    key: "jair", name: "Jair Tronço",
    color: "#2e7d32", darkColor: "#1b5e20",
    stats: { vitesse: 3, detente: 2, puissance: 5, controle: 2 },
    speed: 1.06, jump: 0.94, power: 1.28, control: 0.75,
    egoCharge: true,
    trait: "Tronçonneuse : puissance max, SUPER aussi en perdant un point.",
    superName: "Déforestation",
    superDesc: "Mur de troncs au camp adverse ~5 s : bloque les courses. Visuel : mur épais façon forêt + lueur verte."
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
// Flux du menu : menu → (Solo IA : aiDifficulty → gameModeSelect) | (Local : gameModeSelect direct)
//                     → selectCharacter → selectTerrain → partie
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
  return tutorialMode ? TUTORIAL_WIN_SCORE : WIN_SCORE;
}

let pendingMode = null;        // mode choisi au menu, en attente des sélections
let selPlayer = 0;             // quel joueur choisit son perso

const AI_LEVELS = [
  // rush : propension à foncer au filet pour provoquer un Smash Battle
  // attack : décalage derrière la balle pour viser franchement le camp adverse
  // react : anticipation (0=lent, 1=parfait) · dbl : utilise le double saut
  // aim : 1 = place ses frappes LOIN de l'adversaire (drive profond / amorti court)
  // tous les réglages progressent de façon monotone d'un niveau à l'autre
  // (chacun au moins aussi élevé que le précédent) — un niveau plus dur qui
  // recule sur un critère se lit comme un oubli, pas comme un choix.
  { name: "Facile",      speedMul: 0.82, err: 40, jumpDist: 100, rush: 0.25, attack: 8,  react: 0.55, dbl: false, aim: 0 },
  { name: "Normale",     speedMul: 1.0,  err: 15, jumpDist: 118, rush: 0.5,  attack: 15, react: 0.8,  dbl: true,  aim: 0 },
  { name: "Difficile",   speedMul: 1.22, err: 3,  jumpDist: 138, rush: 0.85, attack: 24, react: 1.0,  dbl: true,  aim: 1 },
  { name: "Impitoyable", speedMul: 1.5,  err: 0,  jumpDist: 160, rush: 0.9,  attack: 28, react: 1.0,  dbl: true,  aim: 1 }
];
let aiLevel = 1;
let aiErr = 0, aiErrTimer = 0;  // erreur de placement volontaire de l'IA
let aiRush = false;             // envie du moment : provoquer un duel au filet

const X_LEVEL = { name: "X", speedMul: 1.2, err: 0, jumpDist: 999, rush: 1, attack: 30, react: 1, dbl: true, aim: 1 };
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
//   Vladou → Hiver Général · Trompette → Le Mur · Micron → 49.3 · Houn → Batterie AA
//   Panda → Grande Muraille · Sultan → Séisme · Yogi → Méditation · Jair → Déforestation
const SUPER_NEED = 3;
const SUPER_FLASH_T = 240;      // ~4 s pour lire nom + description
const SUPER_READY_FLASH_T = 180; // ~3 s quand la jauge est prête
const streak = [0, 0];        // points d'affilée par camp
const superCharge = [0, 0];   // 0 = vide, 1 = super prête
const SUPER_DUR = {
  vladou: 360,      // Hiver Général ~6 s
  trompette: 300,   // Le Mur ~5 s
  micron: 240,      // 49.3 ~4 s
  houn: 300,        // Batterie AA ~5 s
  panda: 300,       // Grande Muraille ~5 s
  sultan: 300,      // Séisme ~5 s
  yogi: 300,        // Méditation ~5 s
  jair: 300         // Déforestation ~5 s
};

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
    this.lastActiveHitTick = -999;
    this._input = null;
    this.poseAnim = "";      // smash | panic (override sprite)
    this.poseT = 0;
    this.poseDur = 0;
    this._faceRight = this.side === 0; // orientation visuelle (suit le déplacement)
    this._celebHop = 0;      // petit saut de joie après un point
    this.battleStunT = 0;    // stun post Smash Battle (perdant)
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

    const grip = groundGrip(this); // 1 sec, <1 pluie / Hiver Général

    this.vx = 0;
    const kitSp = this.kitSpeed != null ? this.kitSpeed : a.speed;
    const sp = BLOB_SPEED * this.speedMul * kitSp * grip;
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
    // Service : pas de saut avec la balle en mains, ni pendant la montée du
    // lancer (anti F+saut immédiat). Saut autorisé seulement une fois la
    // balle en descente — et il faut un nouvel appui (pas tenir Espace).
    const servePostToss = typeof GAMEPLAY_V2 !== "undefined" && GAMEPLAY_V2 &&
      typeof ball !== "undefined" && this.side === servingSide &&
      ball.serveAimLock && !ball.inHands;
    const serveNoJump = typeof GAMEPLAY_V2 !== "undefined" && GAMEPLAY_V2 &&
      typeof ball !== "undefined" && this.side === servingSide &&
      ((ball.inHands && ball.frozen) || (servePostToss && ball.vy < 0));
    const holdingJump = !!(input && input.jump);
    const jumpIn = holdingJump && !serveNoJump;
    const jumpPressed = jumpIn && !this.prevJump; // front montant
    this._jumpEdge = jumpPressed;
    this.prevJump = jumpIn || (serveNoJump && holdingJump);
    // Batterie AA (Houn) : camp ciblé ne peut plus sauter
    const noJump = typeof hasSuperEffect === "function" && hasSuperEffect("noground", this.side);
    if (!noJump && !serveNoJump && this.onGround &&
        (servePostToss ? jumpPressed : jumpIn)) {
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
        const wallX = this.side === 0 ? NET_X * 0.48 : NET_X + (W - NET_X) * 0.52;
        const prevX = this.x - moveVx;
        if (this.side === 0) {
          if (prevX <= wallX) maxX = Math.min(maxX, wallX);
        } else if (prevX >= wallX) {
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

