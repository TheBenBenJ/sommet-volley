// sommet-volley · cœur — constantes, canvas Hi-DPI, RNG déterministe
"use strict";

// ---------- Constantes ----------
const W = 900, H = 500;
// Bande score en bas ; plan de jeu juste au-dessus.
// Les décors s'arrêtent à GROUND_Y → la ligne de fond du terrain PNG
// coïncide avec les pieds / le pied du poteau (pas sous le HUD).
const SCORE_BAND = 82;
const GROUND_Y = H - SCORE_BAND;
const BG_DRAW_H = GROUND_Y;
const NET_X = W / 2;
const NET_W = 10;
const NET_TOP = GROUND_Y - 185;

// ---------- Échelles décor (réf. = perso debout) ----------
// Les sprites perso utilisent manifest.baseH ≈ 110. Tout prop/event doit se
// calibrer ICI — ne plus hardcoder des hauteurs disparates dans drawBg*.
const CHAR_BASE_H = 110;
const PROP_H = {
  flag: 80,          // bannières de touche (~¾ perso)
  cow: 92,           // vache event (~⅔ perso)
  cowIdle: 54,       // vache broute en bord de court
  peacock: 72,       // paon au sol (queue déployée, < perso)
  falcon: 52,        // faucon en vol
  carpet: 64,        // tapis volant
  marchers: 118,     // cortège : un cran > perso (lisibilité)
  cannon: 72,        // canon d'apparat
  snowman: 76,       // bonhomme de neige
  cart: 62,          // voiturette country club
  radar: 68,         // antenne radar
  flower: 40,        // fleurs décor Esplanade
  pigeon: 28,        // pigeons prairie
  macawShot: 40,     // ara en vol (projectile)
  lanternShot: 42,   // lanterne tombante
  warnIcon: 42       // triangle d'annonce event
};

const GRAV_BALL = 0.25;
const GRAV_BLOB = 0.65;
const BLOB_SPEED = 5.2;
const BLOB_JUMP = -16;
const DOUBLE_JUMP_MUL = 0.72; // 2e saut : encore utile pour finir un smash
const BALL_R = 11;
const HIT_SPEED = 9.2;
const MAX_BALL_SPEED = 14;     // tête de smash ; les cloches restent ~HOLD_LOB_SPD
const WIN_SCORE = 15;
const TUTORIAL_WIN_SCORE = 3; // premier à 3 en tutoriel (sans écart obligatoire)
const MAX_TOUCHES = 3;
const STEP = 1000 / 60; // tick fixe 60 Hz (indispensable pour le futur mode en ligne)
const TOUCH_COOLDOWN = 12;   // ticks mini entre deux touches comptées (anti double-comptage)

// --- Gameplay V2 (réception / tir dirigé / smash) — voir docs/GAMEPLAY-V2.md ---
// Toggle runtime : touche ` (Backquote) hors saisie de code.
let GAMEPLAY_V2 = true;
const RECEIVE_R = 56;          // smash/X + cloche : assez large, sans « aimant » trop fort
const AUTO_LOB_DX = 28;        // auto-cloche : balle quasi au-dessus du joueur
const AUTO_LOB_R = 42;         // auto-cloche : rayon path tête (balle qui tombe dessus)
const HOLD_MAX = 45;           // ~0,75 s de contrôle
const HOLD_SPEED_MUL = 0.6;    // vitesse du porteur pendant le contrôle
const AIM_CONE = (150 * Math.PI) / 180;
const SHOT_SPEED_SHORT = 9.5;
const SHOT_SPEED_LONG = 12.5;
const CHARGE_MAX = 24;         // ≤ 0,4 s de charge
const CHARGE_SHOW_OPP = 12;    // au-delà, l'arc est visible pour l'adversaire
const SMASH_MUL = 1.48;        // smash net, sans missile
const PASSIVE_SOFT_SPD = 7;
const HOLD_LOB_SPD = 12.7;     // réception un cran plus franche (smashs restent au-dessus)
const SERVE_TOSS_SPD = 9.5;
const SERVE_TOSS_GRACE = 10;   // ticks sans re-touche serveur juste après le lancer
const ACTIVE_HIT_COOLDOWN = 16; // anti multi-frappe si on maintient le bouton

// --- Écran "Point pour ..." / fin de match ---
// Rythme volontairement posé : laisser lire le message + voir victory/defeat.
// POINT_MIN_WAIT : impossible de skipper trop tôt (saut encore enfoncé).
// POINT_MAX_WAIT : filet de sécurité (IA / AFK).
const POINT_MIN_WAIT = 100;     // ~1,7 s avant skip
const POINT_MAX_WAIT = 480;     // ~8 s max entre deux échanges
const GAMEOVER_MIN_WAIT = 180;  // ~3 s avant de quitter / revanche
// Décompte service : 3 · 2 · 1 (~0,85 s chacun) + GO (~0,5 s)
const SERVE_BEAT = 51;
const SERVE_GO = 30;
const SERVE_COUNTDOWN_START = SERVE_BEAT * 3 + SERVE_GO;

// --- Smash Battle (duel au filet) ---
const BATTLE_TICKS = 78;     // durée du duel (~1,3 s)
const BATTLE_COOLDOWN = 240; // délai mini entre deux duels (4 s)
const BATTLE_NET_DIST = 95;  // distance max des joueurs au filet pour déclencher
const BATTLE_BALL_DIST = 90; // distance max de la balle au filet
const BATTLE_STUN_T = 52;    // perdant du duel : stun ~0,85 s (ne digue pas)
// Smash destructeur post-duel : rapide et plongeant vers le fond de cour
const SMASH_VX = 14.5, SMASH_VY = 9.5;

// --- Mode Bombe ---
const BOMB_TIME = 600;      // 10 s à 60 Hz : durée de la mèche avant explosion

// --- Mode Ballon enflammé ---
// Chaque contact avec la balle retire 1 PV. À 0 → le perso s'enflamme et perd le point.
// Les PV se rechargent à chaque rallye (startRally → Blob.reset).
const FLAME_HP_MAX = 3;

// --- Soft ownership balle (1v1 en ligne, camp invité) ---
// L'invité ne simule la balle que si elle est CLAIREMENT dans son camp
// (hors zone filet). Pas de handoff bilatéral → pas de deadlock poteau.
const GUEST_BALL_MARGIN = 48; // px à droite de NET_X (hors poteau, handoff plus tardif)

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// ---------- Haute résolution (Hi-DPI + adaptation à la fenêtre) ----------
// Le jeu raisonne toujours en 900×500 unités "logiques" ; le canvas est rendu
// à la taille d'affichage × devicePixelRatio → tracé net sur écran Retina/4K,
// et le jeu remplit la fenêtre en gardant son ratio.
let viewScale = 1;
function resizeCanvas() {
  if (typeof window.innerWidth !== "number") return; // environnement de test
  const dpr = window.devicePixelRatio || 1;
  const fit = Math.min(window.innerWidth / W, window.innerHeight / H);
  const cssW = Math.max(320, Math.floor(W * fit)), cssH = Math.floor(cssW * H / W);
  canvas.style.width = cssW + "px";
  canvas.style.height = cssH + "px";
  canvas.width = Math.round(cssW * dpr);
  canvas.height = Math.round(cssH * dpr);
  viewScale = canvas.width / W;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// ---------- RNG seedé (mulberry32) ----------
// La logique de JEU utilise rng() : avec la même graine, deux machines
// calculent exactement la même partie (base du mode en ligne).
// Les effets purement visuels/sonores gardent Math.random().
let rngSeed = 1;
function setSeed(s) { rngSeed = s | 0; }
function rng() {
  rngSeed = (rngSeed + 0x6D2B79F5) | 0;
  let t = rngSeed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

